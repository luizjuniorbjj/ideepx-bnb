# Implementacao MT5 Carrossel - Documentacao Tecnica Completa

**Projeto:** iDeepX
**Data:** 2025-11-26
**Status:** FUNCIONANDO EM PRODUCAO

---

## 1. VISAO GERAL DO SISTEMA

### 1.1 Problema
O MetaTrader 5 Terminal permite apenas **UMA sessao ativa por vez**. Se temos 100 clientes com contas MT5, nao conseguimos coletar dados de todos simultaneamente.

### 1.2 Solucao: Carrossel (Round-Robin)
Implementamos um sistema de rotacao sequencial que:
1. Busca TODAS as contas MT5 cadastradas no backend
2. Para CADA conta:
   - Faz login no MT5
   - Coleta dados (balance, equity, trades, P/L)
   - Envia para o backend via API
   - Aguarda 60 segundos
   - Passa para proxima conta
3. Ao terminar todas, aguarda 60 segundos e reinicia o ciclo

### 1.3 Arquitetura

```
+------------------+     +------------------+     +------------------+
|   MT5 Terminal   | --> |  Python Collector | --> |    Backend API   |
|  (terminal64.exe)|     |  (MetaTrader5 lib)|     |  (Express:5001)  |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +------------------+     +------------------+
|    Frontend      | <-- |   API Route      | <-- |   Database       |
|  (Next.js:3000)  |     |   /api/mt5/*     |     |   (SQLite/Prisma)|
+------------------+     +------------------+     +------------------+
```

---

## 2. PRE-REQUISITOS

### 2.1 MetaTrader 5 Terminal
- **Versao:** MetaTrader 5 (64-bit)
- **Caminho de Instalacao:** `C:\mt5_terminal1\terminal64.exe`
- **Status:** Deve estar ABERTO e rodando em segundo plano

### 2.2 Configuracoes Obrigatorias do MT5
No MetaTrader 5 Terminal:
1. Menu **Tools** > **Options**
2. Aba **Expert Advisors**
3. Marcar: **Allow automated trading**
4. Marcar: **Allow DLL imports**
5. Clicar **OK**

### 2.3 Dependencias Python
```bash
pip install MetaTrader5
pip install requests
```

### 2.4 Dependencias Node.js (Backend)
```bash
npm install @prisma/client
npm install crypto-js  # Para criptografia AES-256
```

---

## 3. BANCO DE DADOS

### 3.1 Schema Prisma (Tabelas Relevantes)

```prisma
// Conta de Trading MT5
model TradingAccount {
  id              String    @id @default(uuid())
  walletAddress   String    // Carteira do cliente (vinculo)

  // Dados da conta
  accountAlias    String    // Nome amigavel ex: "Conta Principal"
  brokerName      String    // Ex: "Doo Prime", "GMI Markets"
  login           String    // Login numerico da conta MT5
  server          String    // Ex: "DooTechnology-Live"
  platform        String    @default("MT5")

  // Status
  status          String    @default("PENDING") // PENDING, CONNECTED, DISCONNECTED, ERROR
  connected       Boolean   @default(false)
  lastError       String?
  lastHeartbeat   DateTime?

  // Dados financeiros (atualizados pelo carrossel)
  balance         Decimal   @default(0)
  equity          Decimal   @default(0)
  margin          Decimal   @default(0)
  freeMargin      Decimal   @default(0)
  marginLevel     Decimal   @default(0)
  openTrades      Int       @default(0)
  openPL          Decimal   @default(0)
  dayPL           Decimal   @default(0)
  weekPL          Decimal   @default(0)
  monthPL         Decimal   @default(0)
  totalPL         Decimal   @default(0)

  // Controle de remocao
  removalStatus   String    @default("ACTIVE") // ACTIVE, PENDING_REMOVAL, APPROVED_FOR_REMOVAL

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastSnapshotAt  DateTime?

  // Relacoes
  credential      TradingAccountCredential?
}

// Credenciais criptografadas (tabela separada por seguranca)
model TradingAccountCredential {
  id                String         @id @default(uuid())
  tradingAccountId  String         @unique
  tradingAccount    TradingAccount @relation(fields: [tradingAccountId], references: [id], onDelete: Cascade)
  encryptedPassword String         // Senha criptografada com AES-256
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

// Brokers disponiveis
model Broker {
  id           String         @id @default(uuid())
  name         String         @unique // "Doo Prime"
  displayName  String         // "Doo Prime"
  logoUrl      String?
  website      String?
  supportsMT5  Boolean        @default(true)
  supportsMT4  Boolean        @default(false)
  active       Boolean        @default(true)
  servers      BrokerServer[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

// Servidores de cada broker
model BrokerServer {
  id            String   @id @default(uuid())
  brokerId      String
  broker        Broker   @relation(fields: [brokerId], references: [id], onDelete: Cascade)
  serverName    String   // "DooTechnology-Live"
  serverAddress String   // "mt5.dooprime.com:443"
  isDemo        Boolean  @default(false)
  isLive        Boolean  @default(true)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([brokerId, serverName])
}
```

---

## 4. CONTAS DE TESTE (FUNCIONANDO)

### 4.1 Conta Doo Prime
| Campo | Valor |
|-------|-------|
| **Corretora** | Doo Prime |
| **Servidor** | DooTechnology-Live |
| **Login** | 9942058 |
| **Senha** | 5cc41!eE |
| **Titular** | Luiz Carlos Da Silva Junior |
| **Balance** | ~$10,311.56 |
| **Carteira Vinculada** | 0x75d1...1669 |

### 4.2 Conta GMI Markets
| Campo | Valor |
|-------|-------|
| **Corretora** | GMI Markets |
| **Servidor** | GMI3-Real |
| **Login** | 32650016 |
| **Senha** | HappyGo88 |
| **Titular** | Paola Frassinetti |
| **Balance** | ~$115,716.62 |
| **Carteira Vinculada** | 0xf172...e762 |

---

## 5. COLETOR PYTHON (CARROSSEL)

### 5.1 Arquivo: `mt5-collector/mt5_carrossel.py`

```python
"""
iDeepX MT5 Carrossel Collector
==============================
Coleta dados de MULTIPLAS contas MT5 em rotacao.

Como funciona:
1. Busca todas as contas MT5 cadastradas no backend
2. Para cada conta:
   - Faz login no MT5
   - Coleta dados (balance, equity, trades, P/L)
   - Envia para o backend
   - Desconecta
3. Aguarda intervalo e repete o ciclo

Limitacao MT5: Apenas UMA sessao por vez
Solucao: Rotacao sequencial (carrossel)
"""

import MetaTrader5 as mt5
import requests
import time
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# ==========================================
# CONFIGURACOES
# ==========================================

BACKEND_URL = "http://localhost:5001"
MT5_PATH = r"C:\mt5_terminal1\terminal64.exe"

# Intervalo entre coletas completas (todas as contas)
CYCLE_INTERVAL = 60  # segundos entre ciclos completos

# Intervalo entre cada conta (para nao sobrecarregar)
ACCOUNT_DELAY = 60  # segundos entre contas

# Retry settings
MAX_RETRIES = 3
RETRY_DELAY = 3

# ==========================================
# FUNCOES DE COLETA
# ==========================================

def init_mt5() -> bool:
    """Inicializa o MT5 Terminal"""
    print("Inicializando MT5...")

    # Garante que nao existe sessao anterior travada
    try:
        mt5.shutdown()
    except:
        pass

    # Pequeno delay para garantir limpeza
    time.sleep(1)

    if not mt5.initialize(path=MT5_PATH):
        error = mt5.last_error()
        print(f"Erro ao inicializar MT5: {error}")
        print(f"   Dica: Verifique se MT5 Terminal esta aberto em {MT5_PATH}")
        return False

    print("MT5 inicializado!")
    return True

def shutdown_mt5():
    """Desliga conexao MT5"""
    mt5.shutdown()

def login_account(login: int, password: str, server: str) -> bool:
    """Faz login em uma conta especifica"""
    print(f"Fazendo login: {login}@{server}...")

    # Tenta fazer login
    authorized = mt5.login(
        login=login,
        password=password,
        server=server
    )

    if not authorized:
        error = mt5.last_error()
        print(f"Erro no login {login}: {error}")
        return False

    # Verifica se realmente logou na conta certa
    account_info = mt5.account_info()
    if account_info is None:
        print(f"Nao foi possivel obter info da conta {login}")
        return False

    if account_info.login != login:
        print(f"Login incorreto! Esperado: {login}, Obtido: {account_info.login}")
        return False

    print(f"Logado com sucesso: {account_info.name}")
    return True

def collect_account_data(account_id: str, login: int) -> Optional[Dict]:
    """Coleta dados de uma conta ja logada"""
    try:
        # Informacoes da conta
        account_info = mt5.account_info()
        if account_info is None:
            print(f"[{login}] Erro ao obter informacoes da conta")
            return None

        # Posicoes abertas
        positions = mt5.positions_get()
        open_trades = len(positions) if positions else 0

        # Calcula P/L das posicoes abertas
        open_pl = 0.0
        if positions:
            open_pl = sum([pos.profit for pos in positions])

        # Dados da conta
        balance = account_info.balance
        equity = account_info.equity
        margin = account_info.margin
        free_margin = account_info.margin_free
        margin_level = account_info.margin_level if account_info.margin > 0 else 0

        # Calcula P/L por periodo
        day_pl = calculate_period_pl(login, hours=24)
        week_pl = calculate_period_pl(login, days=7)
        month_pl = calculate_period_pl(login, days=30)
        total_pl = equity - balance

        return {
            'accountId': account_id,
            'balance': float(balance),
            'equity': float(equity),
            'margin': float(margin),
            'freeMargin': float(free_margin),
            'marginLevel': float(margin_level),
            'openTrades': open_trades,
            'openPL': float(open_pl),
            'dayPL': float(day_pl),
            'weekPL': float(week_pl),
            'monthPL': float(month_pl),
            'totalPL': float(total_pl)
        }

    except Exception as e:
        print(f"[{login}] Erro ao coletar dados: {e}")
        return None

def calculate_period_pl(login: int, hours: int = 0, days: int = 0) -> float:
    """Calcula P/L de um periodo especifico (apenas trades)"""
    try:
        now = datetime.now()
        start_date = now - timedelta(hours=hours, days=days)

        deals = mt5.history_deals_get(start_date, now)

        if deals is None or len(deals) == 0:
            return 0.0

        total_profit = 0.0
        for deal in deals:
            # Apenas BUY/SELL com saida (ignora depositos/transferencias)
            if deal.type in [0, 1]:  # DEAL_TYPE_BUY ou DEAL_TYPE_SELL
                if deal.entry in [1, 2]:  # OUT ou INOUT
                    total_profit += deal.profit
                if hasattr(deal, 'commission'):
                    total_profit += deal.commission
                if hasattr(deal, 'swap'):
                    total_profit += deal.swap

        return float(total_profit)

    except Exception as e:
        print(f"[{login}] Erro ao calcular P/L: {e}")
        return 0.0

def send_to_backend(data: Dict) -> bool:
    """Envia dados para o backend"""
    try:
        url = f"{BACKEND_URL}/api/mt5/sync"

        print(f"Enviando dados para backend...")
        print(f"   Balance: ${data['balance']:.2f}")
        print(f"   Equity: ${data['equity']:.2f}")
        print(f"   Open Trades: {data['openTrades']}")

        response = requests.post(url, json=data, timeout=10)

        if response.status_code == 200:
            print(f"Dados enviados com sucesso!")
            return True
        else:
            print(f"Erro ao enviar: {response.status_code}")
            return False

    except Exception as e:
        print(f"Excecao ao enviar: {e}")
        return False

# ==========================================
# FUNCOES DO BACKEND
# ==========================================

def fetch_all_accounts() -> List[Dict]:
    """Busca todas as contas MT5 do backend"""
    try:
        url = f"{BACKEND_URL}/api/mt5/accounts/all"

        print("Buscando contas MT5 do backend...")

        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            accounts = response.json()
            print(f"{len(accounts)} conta(s) encontrada(s)")
            return accounts
        else:
            print(f"Erro ao buscar contas: {response.status_code}")
            return []

    except Exception as e:
        print(f"Excecao ao buscar contas: {e}")
        return []

# ==========================================
# CARROSSEL PRINCIPAL
# ==========================================

def process_single_account(account: Dict) -> bool:
    """Processa uma unica conta (login, coleta, envio)"""
    account_id = account['id']
    login = int(account['login'])
    password = account['password']
    server = account['server']

    print(f"\n{'='*50}")
    print(f"Processando conta: {login}@{server}")
    print(f"{'='*50}")

    # 1. Faz login
    if not login_account(login, password, server):
        return False

    # 2. Coleta dados
    data = collect_account_data(account_id, login)
    if data is None:
        return False

    # 3. Envia para backend
    success = send_to_backend(data)

    return success

def run_carrossel_cycle() -> int:
    """Executa um ciclo completo do carrossel"""
    print("\n" + "="*60)
    print("INICIANDO CICLO DO CARROSSEL")
    print("="*60)

    # Busca todas as contas
    accounts = fetch_all_accounts()

    if not accounts:
        print("Nenhuma conta MT5 cadastrada!")
        return 0

    # Inicializa MT5
    if not init_mt5():
        print("Falha ao inicializar MT5!")
        return 0

    success_count = 0
    total_count = len(accounts)

    # Processa cada conta em sequencia
    for i, account in enumerate(accounts, 1):
        print(f"\nConta {i}/{total_count}")

        try:
            if process_single_account(account):
                success_count += 1
            else:
                print(f"Falha ao processar conta {account.get('login', 'unknown')}")
        except Exception as e:
            print(f"Erro ao processar conta: {e}")

        # Delay entre contas (exceto na ultima)
        if i < total_count:
            print(f"Aguardando {ACCOUNT_DELAY}s antes da proxima conta...")
            time.sleep(ACCOUNT_DELAY)

    # Desliga MT5
    shutdown_mt5()

    print("\n" + "="*60)
    print(f"CICLO COMPLETO: {success_count}/{total_count} contas processadas")
    print("="*60)

    return success_count

def run_carrossel_loop():
    """Loop principal do carrossel"""
    print("\n" + "="*60)
    print("iDeepX MT5 CARROSSEL COLLECTOR")
    print("="*60)
    print(f"Intervalo entre ciclos: {CYCLE_INTERVAL}s")
    print(f"Delay entre contas: {ACCOUNT_DELAY}s")
    print(f"Backend: {BACKEND_URL}")
    print(f"MT5 Path: {MT5_PATH}")
    print("="*60)

    cycle_count = 0

    while True:
        try:
            cycle_count += 1
            print(f"\nCiclo #{cycle_count} - {datetime.now().strftime('%H:%M:%S')}")

            # Executa ciclo
            processed = run_carrossel_cycle()

            # Aguarda proximo ciclo
            print(f"\nProximo ciclo em {CYCLE_INTERVAL}s...")
            time.sleep(CYCLE_INTERVAL)

        except KeyboardInterrupt:
            print("\nCarrossel interrompido pelo usuario")
            shutdown_mt5()
            break
        except Exception as e:
            print(f"Erro no loop: {e}")
            time.sleep(RETRY_DELAY)

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    # Modo de execucao
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        # Executa apenas um ciclo
        print("Modo: Ciclo unico")
        run_carrossel_cycle()
    else:
        # Loop continuo
        print("Modo: Loop continuo")
        run_carrossel_loop()
```

---

## 6. BACKEND API (Express/Node.js)

### 6.1 Arquivo: `backend/src/routes/mt5.js`

#### 6.1.1 Funcao de Criptografia AES-256

```javascript
import CryptoJS from 'crypto-js';

// Chave de criptografia (deve vir do .env)
const ENCRYPTION_KEY = process.env.MT5_ENCRYPTION_KEY || 'ideepx-mt5-secret-key-2024';

// Criptografar senha
function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
}

// Descriptografar senha
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### 6.1.2 Endpoint: Listar Contas do Usuario

```javascript
// GET /api/mt5/accounts?walletAddress=0x...
// Retorna contas MT5 vinculadas a uma carteira especifica

router.get('/accounts', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' });
    }

    const accounts = await prisma.tradingAccount.findMany({
      where: { walletAddress: walletAddress.toLowerCase() },
      select: {
        id: true,
        accountAlias: true,
        brokerName: true,
        login: true,
        server: true,
        platform: true,
        status: true,
        removalStatus: true,
        connected: true,
        lastError: true,
        lastHeartbeat: true,
        balance: true,
        equity: true,
        margin: true,
        freeMargin: true,
        marginLevel: true,
        openTrades: true,
        openPL: true,
        dayPL: true,
        weekPL: true,
        monthPL: true,
        totalPL: true,
        createdAt: true,
        updatedAt: true,
        lastSnapshotAt: true
      }
    });

    // Desabilita cache para dados em tempo real
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({ accounts });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts', details: error.message });
  }
});
```

#### 6.1.3 Endpoint: Listar TODAS as Contas (Para Carrossel)

```javascript
// GET /api/mt5/accounts/all
// Retorna TODAS as contas MT5 com credenciais para o carrossel collector

router.get('/accounts/all', async (req, res) => {
  try {
    // Busca todas as contas
    const accounts = await prisma.tradingAccount.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Para cada conta, busca credenciais e descriptografa
    const accountsWithCredentials = [];

    for (const account of accounts) {
      try {
        const credential = await prisma.tradingAccountCredential.findUnique({
          where: { tradingAccountId: account.id }
        });

        if (credential) {
          const password = decryptPassword(credential.encryptedPassword);

          accountsWithCredentials.push({
            id: account.id,
            login: account.login,
            password: password,
            server: account.server,
            platform: account.platform,
            brokerName: account.brokerName,
            accountAlias: account.accountAlias
          });
        }
      } catch (e) {
        console.log(`Erro ao processar conta ${account.id}: ${e.message}`);
      }
    }

    res.json(accountsWithCredentials);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all accounts', details: error.message });
  }
});
```

#### 6.1.4 Endpoint: Sincronizar Dados (Recebe do Carrossel)

```javascript
// POST /api/mt5/sync
// Recebe dados do coletor Python e atualiza no banco

router.post('/sync', async (req, res) => {
  try {
    const {
      accountId,
      balance,
      equity,
      margin,
      freeMargin,
      marginLevel,
      openTrades,
      openPL,
      dayPL,
      weekPL,
      monthPL,
      totalPL
    } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    // Atualiza dados da conta
    const updated = await prisma.tradingAccount.update({
      where: { id: accountId },
      data: {
        balance: balance || 0,
        equity: equity || 0,
        margin: margin || 0,
        freeMargin: freeMargin || 0,
        marginLevel: marginLevel || 0,
        openTrades: openTrades || 0,
        openPL: openPL || 0,
        dayPL: dayPL || 0,
        weekPL: weekPL || 0,
        monthPL: monthPL || 0,
        totalPL: totalPL || 0,
        status: 'CONNECTED',
        connected: true,
        lastHeartbeat: new Date(),
        lastSnapshotAt: new Date(),
        lastError: null
      }
    });

    res.json({
      success: true,
      message: 'Account synced successfully',
      account: {
        id: updated.id,
        login: updated.login,
        balance: updated.balance,
        equity: updated.equity
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to sync account', details: error.message });
  }
});
```

#### 6.1.5 Endpoint: Conectar Nova Conta

```javascript
// POST /api/mt5/connect
// Conecta uma nova conta MT5

router.post('/connect', async (req, res) => {
  try {
    const {
      walletAddress,
      brokerName,
      server,
      login,
      password,
      accountAlias
    } = req.body;

    // Validacoes
    if (!walletAddress || !brokerName || !server || !login || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verifica se usuario ja tem conta conectada
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingAccount) {
      return res.status(400).json({
        error: 'ACCOUNT_LIMIT_REACHED',
        message: 'User already has a connected MT5 account'
      });
    }

    // Cria a conta
    const account = await prisma.tradingAccount.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        brokerName,
        server,
        login: String(login),
        accountAlias: accountAlias || `Conta ${login}`,
        platform: 'MT5',
        status: 'PENDING',
        connected: false
      }
    });

    // Salva credenciais criptografadas
    const encryptedPassword = encryptPassword(password);

    await prisma.tradingAccountCredential.create({
      data: {
        tradingAccountId: account.id,
        encryptedPassword
      }
    });

    res.json({
      success: true,
      message: 'Account connected successfully',
      account: {
        id: account.id,
        login: account.login,
        server: account.server,
        status: account.status
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to connect account', details: error.message });
  }
});
```

---

## 7. FRONTEND (Next.js)

### 7.1 Dashboard MT5: `frontend/app/mt5/dashboard/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface MT5Account {
  id: string
  accountAlias: string
  brokerName: string
  login: string
  server: string
  platform: string
  status: string
  connected: boolean
  balance: string
  equity: string
  margin: string
  freeMargin: string
  marginLevel: string
  openTrades: number
  openPL: string
  dayPL: string
  weekPL: string
  monthPL: string
  totalPL: string
  lastHeartbeat: string | null
}

export default function MT5DashboardPage() {
  const { address, isConnected } = useAccount()
  const [accounts, setAccounts] = useState<MT5Account[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch accounts
  const fetchAccounts = async () => {
    if (!address) return

    try {
      // Adiciona timestamp para evitar cache do browser
      const timestamp = Date.now()
      const response = await fetch(`/api/mt5/accounts?walletAddress=${address}&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar contas')
      }

      // Forca novo array para React detectar mudanca
      const newAccounts = [...(data.accounts || [])]
      setAccounts(newAccounts)
    } catch (error: any) {
      console.error('Erro ao carregar contas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, [address])

  // Auto-refresh every 5s for real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAccounts()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [loading, address])

  // ... resto do componente (renderizacao)
}
```

### 7.2 API Route Proxy: `frontend/app/api/mt5/accounts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/mt5/accounts?walletAddress=${walletAddress}`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    )

    const data = await response.json()

    // Propaga headers de no-cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch accounts', details: error.message },
      { status: 500 }
    )
  }
}
```

---

## 8. COMO EXECUTAR

### 8.1 Ordem de Inicializacao

1. **Abrir MT5 Terminal**
   ```
   C:\mt5_terminal1\terminal64.exe
   ```
   (Deixar aberto em segundo plano)

2. **Iniciar Backend**
   ```powershell
   cd C:\ideepx-bnb\backend
   npm run dev
   ```
   Porta: 5001

3. **Iniciar Frontend**
   ```powershell
   cd C:\ideepx-bnb\frontend
   npm run dev
   ```
   Porta: 3000

4. **Iniciar Carrossel**
   ```powershell
   cd C:\ideepx-bnb\mt5-collector
   python mt5_carrossel.py
   ```

5. **Acessar Dashboard**
   ```
   http://localhost:3000/mt5/dashboard
   ```

### 8.2 Comandos Uteis

**Modo teste (ciclo unico):**
```powershell
python mt5_carrossel.py --once
```

**Modo producao (loop continuo):**
```powershell
python mt5_carrossel.py
```

---

## 9. FLUXO COMPLETO

```
1. Usuario conecta carteira Web3 no frontend
                    |
                    v
2. Usuario vai em /mt5/dashboard
                    |
                    v
3. Frontend faz GET /api/mt5/accounts?walletAddress=0x...
                    |
                    v
4. Backend retorna contas vinculadas a essa carteira
                    |
                    v
5. [Paralelo] Carrossel Python roda em loop:
   5.1 GET /api/mt5/accounts/all (busca todas contas)
   5.2 Para cada conta:
       - mt5.login(login, password, server)
       - Coleta balance, equity, trades, P/L
       - POST /api/mt5/sync (envia dados)
       - Aguarda 60s
   5.3 Aguarda 60s e volta para 5.1
                    |
                    v
6. Frontend faz refresh a cada 5s (fetchAccounts)
                    |
                    v
7. Dashboard atualiza automaticamente com dados novos
```

---

## 10. SEGURANCA

### 10.1 Senhas Criptografadas
- Senhas MT5 sao criptografadas com AES-256 antes de salvar
- Chave de criptografia deve estar no .env
- Descriptografia apenas no momento de uso (carrossel)

### 10.2 Isolamento por Carteira
- Cada cliente ve APENAS suas proprias contas
- Query sempre filtra por walletAddress
- Nao ha vazamento de dados entre clientes

### 10.3 Endpoint /accounts/all
- Este endpoint retorna credenciais descriptografadas
- Deve ser protegido em producao (API key, IP whitelist, etc)
- Usado apenas pelo carrossel interno

---

## 11. TROUBLESHOOTING

### 11.1 Erro: IPC Timeout (-10005)
**Causa:** MT5 nao esta aberto ou sem permissao

**Solucao:**
1. Abrir MT5 Terminal
2. Habilitar "Allow automated trading"
3. Deixar MT5 aberto

### 11.2 Dashboard nao atualiza
**Causa:** Cache do browser

**Solucao:**
- Adicionar `cache: 'no-store'` no fetch
- Adicionar timestamp na URL
- Criar novo array com spread `[...data]`

### 11.3 Erro de login
**Causa:** Credenciais incorretas ou servidor errado

**Solucao:**
1. Verificar login/senha no MT5 Terminal manualmente
2. Verificar nome exato do servidor
3. Verificar se conta esta ativa na corretora

---

## 12. ESCALABILIDADE

### 12.1 Limitacao Atual
- 1 MT5 Terminal = 1 sessao por vez
- Com 60s por conta, 100 contas = ~100 min/ciclo

### 12.2 Solucoes para Escala

**Opcao A: Multiplos Terminais**
- Instalar varios MT5 em pastas diferentes
- Rodar varios carrosseis em paralelo
- Dividir contas entre terminais

**Opcao B: MetaApi Cloud (Recomendado)**
- API cloud que conecta direto nas corretoras
- Sem necessidade de MT5 Terminal local
- Suporta conexoes ilimitadas simultaneas
- Custo por uso (1x/dia = baixo custo)

---

## 13. ARQUIVOS DO PROJETO

```
C:\ideepx-bnb\
├── mt5-collector/
│   ├── mt5_carrossel.py          # Coletor principal (carrossel)
│   ├── test_mt5_disponibilidade.py
│   ├── test_conta_nova.py
│   └── test_conta_gmi.py
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── mt5.js            # Rotas da API MT5
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma         # Schema do banco
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── mt5/
│   │   │   └── dashboard/
│   │   │       └── page.tsx      # Dashboard MT5
│   │   └── api/
│   │       └── mt5/
│   │           └── accounts/
│   │               └── route.ts  # API route proxy
│   └── package.json
└── DOCS/
    └── MT5_CARROSSEL_IMPLEMENTACAO.md  # Este documento
```

---

## 14. CONTATO

Duvidas sobre a implementacao, entre em contato com a equipe de desenvolvimento.

---

**Documento gerado em:** 2025-11-26
**Versao:** 1.0
**Status:** PRODUCAO
