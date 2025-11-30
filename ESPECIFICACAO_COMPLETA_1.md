# iDeepX Account Monitor - Especificação Completa para Implementação

## 📋 Sumário Executivo

Sistema de monitoramento **somente leitura** de contas MT5, estilo "MyFxBook interno", onde usuários conectam suas contas de trading e visualizam métricas em tempo real através de um dashboard web.

**Tecnologias:** Python 3.11+, FastAPI, PostgreSQL, React/Next.js, MetaTrader5 API

**Arquitetura:** Worker Pool (5-10 processos MT5 compartilhados para centenas de contas)

---

## 🎯 Objetivo do Projeto

Criar sistema que:
1. Permite usuário conectar conta MT5 (qualquer corretora)
2. Coleta dados automaticamente a cada 5 segundos
3. Exibe dashboard com métricas em tempo real
4. Usa senha MASTER (não investor password)
5. Suporta múltiplas corretoras simultaneamente

---

## 📊 Campos do Dashboard

Tabela com as seguintes colunas para cada conta:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Status | Badge | Connected/Disconnected/Error/Pending |
| Account | String | Apelido da conta (ex: "GMI Edge") |
| Balance | Currency | Saldo da conta |
| Equity | Currency | Patrimônio líquido |
| Open Trades | Integer | Número de posições abertas |
| Open (P/L) | Currency | Lucro/Prejuízo das posições abertas |
| Day (P/L) | Currency | P/L do dia atual |
| Week (P/L) | Currency | P/L da semana |
| Monthly (P/L) | Currency | P/L do mês |
| Total (P/L) | Currency | P/L total histórico |
| Actions | Buttons | Settings / Disconnect |

**Atualização:** Auto-refresh a cada 5 segundos (sem reload de página)

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│  ┌──────────────┐          ┌──────────────────────────┐    │
│  │ /connect     │          │ /dashboard               │    │
│  │ Conectar MT5 │──────────▶│ Tabela de contas        │    │
│  └──────────────┘          │ Auto-refresh 5s          │    │
│                            └──────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Endpoints:                                            │  │
│  │ - POST /api/accounts/connect                         │  │
│  │ - GET  /api/accounts                                 │  │
│  │ - GET  /api/accounts/{id}/status                     │  │
│  │ - POST /api/accounts/{id}/disconnect                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables:                                               │  │
│  │ - users                                              │  │
│  │ - trading_accounts                                   │  │
│  │ - trading_account_credentials (encrypted)           │  │
│  │ - account_snapshots                                  │  │
│  │                                                       │  │
│  │ Views:                                               │  │
│  │ - dashboard_accounts (com status calculado)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ Read/Write
┌────────────────────────┴────────────────────────────────────┐
│           MT5 COLLECTOR SERVICE (Python)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Worker Pool Architecture:                            │  │
│  │                                                       │  │
│  │  Queue: [Conta1, Conta2, ..., ContaN]               │  │
│  │            │       │            │                     │  │
│  │         ┌──▼───┐ ┌▼────┐ ┌────▼──┐                  │  │
│  │         │Worker│ │Worker│ │Worker │                  │  │
│  │         │  1   │ │  2   │ │  5   │                  │  │
│  │         └──┬───┘ └┬────┘ └────┬──┘                  │  │
│  │            │      │           │                      │  │
│  │         ┌──▼──────▼───────────▼──┐                  │  │
│  │         │ MT5 Terminal (5x)      │                  │  │
│  │         │ Login → Collect → Next │                  │  │
│  │         └────────────────────────┘                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ MT5 Protocol
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CORRETORAS MT5 (múltiplas)                     │
│  GMI Markets, Doo Prime, XM, IC Markets, etc.              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Diretórios

```
ideepx-account-monitor/
├── backend/
│   ├── main.py                    # FastAPI app
│   ├── database.py                # Conexão PostgreSQL
│   ├── auth.py                    # Autenticação JWT
│   ├── routes/
│   │   └── accounts.py            # Endpoints de contas
│   ├── models/
│   │   └── account.py             # Modelos Pydantic
│   ├── services/
│   │   ├── credential_manager.py  # Criptografia senhas
│   │   └── mt5_collector_pool.py  # Collector com Worker Pool
│   └── requirements.txt
│
├── frontend/
│   ├── pages/
│   │   ├── connect/
│   │   │   └── index.tsx          # Página conectar conta
│   │   └── dashboard/
│   │       └── index.tsx          # Dashboard principal
│   ├── components/
│   │   └── ui/                    # Componentes reutilizáveis
│   ├── types/
│   │   └── account.ts             # TypeScript types
│   └── package.json
│
├── database/
│   ├── schema.sql                 # Schema PostgreSQL
│   └── migrations/
│
├── scripts/
│   └── setup_workers.py           # Setup automático Worker Pool
│
├── .env.example
├── docker-compose.yml             # Opcional: Docker setup
└── README.md
```

---

## 🗄️ Schema do Banco de Dados

### Tabela: `users`
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    wallet_address  VARCHAR(42),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Tabela: `trading_accounts`
```sql
CREATE TABLE trading_accounts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identificação
    account_alias       VARCHAR(100) NOT NULL,  -- "GMI Edge", "Cent-100usd"
    broker_name         VARCHAR(100) NOT NULL,  -- "GMI Markets", "Doo Prime"
    
    -- Credenciais MT5
    login               VARCHAR(50)  NOT NULL,
    server              VARCHAR(200) NOT NULL,
    platform            VARCHAR(20)  NOT NULL DEFAULT 'MT5',
    
    -- Status e controle
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    -- PENDING | CONNECTED | DISCONNECTED | ERROR | SUSPENDED
    
    last_error          TEXT,
    last_snapshot_at    TIMESTAMP,
    last_heartbeat      TIMESTAMP,  -- Atualizado a cada coleta
    
    -- Metadados
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_account_per_user UNIQUE(user_id, login, server)
);

CREATE INDEX idx_accounts_user ON trading_accounts(user_id);
CREATE INDEX idx_accounts_status ON trading_accounts(status);
CREATE INDEX idx_accounts_heartbeat ON trading_accounts(last_heartbeat);
```

### Tabela: `trading_account_credentials`
```sql
CREATE TABLE trading_account_credentials (
    trading_account_id  UUID PRIMARY KEY REFERENCES trading_accounts(id) ON DELETE CASCADE,
    encrypted_password  BYTEA NOT NULL,  -- Senha criptografada AES-256
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Tabela: `account_snapshots`
```sql
CREATE TABLE account_snapshots (
    id                  BIGSERIAL PRIMARY KEY,
    trading_account_id  UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    captured_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Dados da conta
    balance             NUMERIC(18, 2) NOT NULL,
    equity              NUMERIC(18, 2) NOT NULL,
    margin              NUMERIC(18, 2) NOT NULL DEFAULT 0,
    free_margin         NUMERIC(18, 2) NOT NULL DEFAULT 0,
    margin_level        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    -- Posições abertas
    open_trades         INT NOT NULL DEFAULT 0,
    open_pl             NUMERIC(18, 2) NOT NULL DEFAULT 0,
    
    -- P/L por período
    day_pl              NUMERIC(18, 2) NOT NULL DEFAULT 0,
    week_pl             NUMERIC(18, 2) NOT NULL DEFAULT 0,
    month_pl            NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_pl            NUMERIC(18, 2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_snapshots_account ON account_snapshots(trading_account_id);
CREATE INDEX idx_snapshots_captured ON account_snapshots(captured_at DESC);
CREATE INDEX idx_snapshots_account_time ON account_snapshots(trading_account_id, captured_at DESC);
```

### View: `dashboard_accounts`
```sql
-- View consolidada que junta contas + último snapshot + status calculado
CREATE VIEW dashboard_accounts AS
SELECT 
    ta.id,
    ta.user_id,
    ta.account_alias,
    ta.broker_name,
    ta.login,
    ta.server,
    ta.platform,
    ta.status,
    ta.last_error,
    ta.last_snapshot_at,
    ta.last_heartbeat,
    ta.created_at,
    ta.updated_at,
    
    -- Status calculado (Connected se heartbeat < 2min e status=CONNECTED)
    CASE 
        WHEN ta.last_heartbeat IS NULL THEN 'Pending'
        WHEN ta.status = 'ERROR' THEN 'Error'
        WHEN ta.status = 'CONNECTED' AND NOW() - ta.last_heartbeat < INTERVAL '2 minutes' THEN 'Connected'
        ELSE 'Disconnected'
    END as display_status,
    
    -- Último snapshot
    ls.balance,
    ls.equity,
    ls.margin,
    ls.free_margin,
    ls.margin_level,
    ls.open_trades,
    ls.open_pl,
    ls.day_pl,
    ls.week_pl,
    ls.month_pl,
    ls.total_pl,
    ls.captured_at as snapshot_captured_at

FROM trading_accounts ta
LEFT JOIN LATERAL (
    SELECT * FROM account_snapshots
    WHERE trading_account_id = ta.id
    ORDER BY captured_at DESC
    LIMIT 1
) ls ON true;
```

---

## 🔐 Segurança de Credenciais

### Criptografia
- **Algoritmo:** Fernet (AES-256 em modo CBC)
- **Biblioteca:** `cryptography` (Python)
- **Chave:** Armazenada em variável de ambiente `ENCRYPTION_KEY`

### Implementação (`credential_manager.py`):
```python
from cryptography.fernet import Fernet
import os

class CredentialManager:
    def __init__(self):
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("ENCRYPTION_KEY não definida")
        self.cipher = Fernet(key.encode())
    
    def encrypt_password(self, password: str) -> bytes:
        return self.cipher.encrypt(password.encode())
    
    def decrypt_password(self, encrypted: bytes) -> str:
        return self.cipher.decrypt(encrypted).decode()
```

### Gerar chave (executar uma vez):
```python
from cryptography.fernet import Fernet
key = Fernet.generate_key()
print(key.decode())  # Salvar no .env
```

---

## 🔌 API Endpoints

### Base URL: `/api`

### 1. POST `/api/accounts/connect`
**Descrição:** Conecta nova conta MT5

**Request Body:**
```json
{
  "accountAlias": "GMI Edge",
  "brokerName": "GMI Markets",
  "login": "3237386",
  "password": "senha_master",
  "server": "GMI Trading Platform Demo",
  "platform": "MT5"
}
```

**Response 201:**
```json
{
  "success": true,
  "accountId": "uuid-da-conta",
  "status": "PENDING",
  "message": "Conta conectada com sucesso"
}
```

**Processo interno:**
1. Validar se conta já existe
2. Criptografar senha com Fernet
3. Criar registro em `trading_accounts` (status=PENDING)
4. Criar registro em `trading_account_credentials`
5. Retornar ID da conta

---

### 2. GET `/api/accounts`
**Descrição:** Lista todas as contas do usuário autenticado

**Response 200:**
```json
{
  "accounts": [
    {
      "id": "uuid-1",
      "userId": "uuid-user",
      "accountAlias": "GMI Edge",
      "brokerName": "GMI Markets",
      "login": "3237386",
      "server": "GMI Trading Platform Demo",
      "platform": "MT5",
      "status": "CONNECTED",
      "lastError": null,
      "lastSnapshotAt": "2025-11-17T12:00:00Z",
      "lastHeartbeat": "2025-11-17T12:00:05Z",
      "displayStatus": "Connected",
      "createdAt": "2025-11-17T10:00:00Z",
      "snapshot": {
        "balance": 197266.52,
        "equity": 197266.52,
        "margin": 0.00,
        "freeMargin": 197266.52,
        "marginLevel": 0.00,
        "openTrades": 0,
        "openPL": 0.00,
        "dayPL": 2512.52,
        "weekPL": 2512.52,
        "monthPL": 2512.52,
        "totalPL": 2512.52,
        "capturedAt": "2025-11-17T12:00:00Z"
      }
    }
  ],
  "total": 1
}
```

**SQL Query usado:**
```sql
SELECT * FROM dashboard_accounts
WHERE user_id = %s
ORDER BY created_at DESC
```

---

### 3. GET `/api/accounts/{accountId}/status`
**Descrição:** Retorna status detalhado de uma conta específica

**Response 200:**
```json
{
  "Status": "Connected",
  "Account": "GMI Edge",
  "Balance": 197266.52,
  "Equity": 197266.52,
  "OpenTrades": 0,
  "OpenPL": 0.00,
  "DayPL": 2512.52,
  "WeekPL": 2512.52,
  "MonthlyPL": 2512.52,
  "TotalPL": 2512.52,
  "LastUpdated": "2025-11-17T12:00:00Z"
}
```

---

### 4. POST `/api/accounts/{accountId}/disconnect`
**Descrição:** Desconecta (suspende) uma conta

**Response 200:**
```json
{
  "success": true,
  "message": "Conta desconectada"
}
```

**Processo interno:**
1. Verificar se conta pertence ao usuário
2. Atualizar `status = 'SUSPENDED'`
3. Collector vai ignorar essa conta

---

### 5. DELETE `/api/accounts/{accountId}`
**Descrição:** Remove conta permanentemente

**Response 200:**
```json
{
  "success": true,
  "message": "Conta removida"
}
```

**Processo interno:**
1. Verificar propriedade
2. Deletar registro (cascade remove credenciais e snapshots)

---

## 🤖 MT5 Collector Service - Worker Pool

### Arquitetura
- **5 Workers** (processos MT5 compartilhados)
- Cada worker processa múltiplas contas **sequencialmente**
- Fila compartilhada (`Queue`) distribui contas entre workers
- Coleta a cada **5 segundos**

### Estrutura de Pastas MT5
```
C:\MT5\
├── base_mt5\              # Instalação modelo (copiar daqui)
│   └── terminal64.exe
└── workers\
    ├── worker_0\          # Worker 1
    │   └── terminal64.exe
    ├── worker_1\          # Worker 2
    ├── worker_2\          # Worker 3
    ├── worker_3\          # Worker 4
    └── worker_4\          # Worker 5
```

### Fluxo do Worker
```python
# Pseudocódigo
def worker_process_queue(queue, worker_id):
    # 1. Inicializar MT5 uma vez
    mt5.initialize(f"C:\\MT5\\workers\\worker_{worker_id}\\terminal64.exe")
    
    # 2. Loop enquanto há contas na fila
    while not queue.empty():
        account = queue.get()
        
        # 3. Login na conta
        mt5.login(account.login, account.password, account.server)
        
        # 4. Coletar dados
        data = collect_account_data()
        
        # 5. Salvar snapshot no banco
        save_snapshot(data)
        
        # 6. Atualizar heartbeat
        update_heartbeat(account.id)
        
        # 7. Logout (libera recursos)
        # MT5 permite múltiplos logins sequenciais
        
    # 8. Shutdown MT5 quando fila acabar
    mt5.shutdown()
```

### Cálculo de P/L - IMPORTANTE

**⚠️ CORREÇÃO CRÍTICA:** Filtrar apenas deals de trading

```python
def calculate_period_pl(start: datetime, end: datetime) -> float:
    """
    Calcula P/L de um período baseado em deals fechados
    """
    deals = mt5.history_deals_get(start, end)
    
    if deals is None or len(deals) == 0:
        return 0.0
    
    total_pl = 0.0
    
    for deal in deals:
        # ✅ CORRETO: Filtrar apenas deals de trading
        # Type 0 = DEAL_TYPE_BUY
        # Type 1 = DEAL_TYPE_SELL
        if deal.type in [0, 1]:
            total_pl += deal.profit + deal.swap + deal.commission
    
    return total_pl
```

**❌ ERRADO:** `if deal.position_id > 0:` (inclui outros tipos de deals)

### Períodos Calculados
```python
now = datetime.now()

day_start   = datetime(now.year, now.month, now.day)              # 00:00 de hoje
week_start  = day_start - timedelta(days=day_start.weekday())    # Segunda-feira
month_start = datetime(now.year, now.month, 1)                    # Dia 1 do mês
total_start = datetime(2000, 1, 1)                                # Histórico completo
```

### Heartbeat
- Atualizado **a cada coleta** (mesmo se falhar)
- Campo `last_heartbeat` em `trading_accounts`
- Status "Connected" só se `NOW() - last_heartbeat < 2 minutos`
- Permite detectar se collector travou

---

## 🎨 Frontend - Páginas

### 1. Página `/connect` (Conectar Conta)

**Componentes:**
- Formulário com campos:
  - Nome da Conta (apelido)
  - Corretora (dropdown com populares + "Outra")
  - Servidor (dropdown ou input manual)
  - Número da Conta (login)
  - Senha (password)
  - Plataforma (radio: MT5/MT4)

**Corretoras Pré-definidas:**
```typescript
const POPULAR_BROKERS = [
  {
    name: 'GMI Markets',
    servers: ['GMI Trading Platform Demo', 'GMI Trading Platform Live']
  },
  {
    name: 'Doo Prime',
    servers: ['DooTechnology-Live (MT5 Live 2)', 'DooTechnology-Demo']
  },
  {
    name: 'XM Global',
    servers: ['XMGlobal-Real', 'XMGlobal-Demo']
  },
  {
    name: 'IC Markets',
    servers: ['ICMarketsSC-Demo', 'ICMarketsSC-Live']
  },
  {
    name: 'Outra Corretora',
    servers: []  // Input manual
  }
];
```

**Validações:**
- Todos os campos obrigatórios
- Login numérico
- Senha mínimo 6 caracteres
- Alert de segurança: "Suas credenciais são criptografadas"

**Fluxo:**
1. Usuário preenche formulário
2. Click em "Conectar Conta MT5"
3. POST `/api/accounts/connect`
4. Redirect para `/dashboard`

---

### 2. Página `/dashboard` (Dashboard Principal)

**Layout:**
- Header fixo com:
  - Logo iDeepX
  - Botão "Nova Conta" (vai para `/connect`)
  - Botão refresh manual
  - Wallet address (ex: 0x75d1...1669)
  
- Tabela responsiva com colunas:
  - Status (badge colorido)
  - Account (nome + broker/login em subtexto)
  - Balance (formatado USD)
  - Equity (formatado USD)
  - Open Trades (badge com número)
  - Open P/L (verde/vermelho)
  - Day P/L (verde/vermelho)
  - Week P/L (verde/vermelho)
  - Month P/L (verde/vermelho)
  - Total P/L (verde/vermelho com ícone trend)
  - Actions (Settings/Disconnect icons)

**Auto-refresh:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchAccounts(true); // Silent refresh
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

**Formatação de Valores:**
```typescript
// Currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// P/L com sinal
const formatPL = (value: number) => {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};

// Cor dinâmica
const getPLColor = (value: number) => {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
};
```

**Status Badges:**
```typescript
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Connected':
      return <Badge color="green" icon={<Link2 />}>Conectado</Badge>;
    case 'Disconnected':
      return <Badge color="yellow" icon={<LinkOff />}>Desconectado</Badge>;
    case 'Error':
      return <Badge color="red" icon={<AlertCircle />}>Erro</Badge>;
    default:
      return <Badge color="gray" icon={<Activity />}>Pendente</Badge>;
  }
};
```

**Empty State:**
- Quando `accounts.length === 0`
- Ícone grande de "Link Off"
- Texto: "Nenhuma conta conectada"
- Botão CTA: "Conectar Conta"

---

## ⚙️ Configuração e Deploy

### Variáveis de Ambiente (`.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ideepx
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

# Security
ENCRYPTION_KEY=gerar_com_fernet.generate_key()
JWT_SECRET=sua_chave_jwt_secreta

# Collector
MT5_WORKERS=5
COLLECTION_INTERVAL=5

# API
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Dependências Python (`requirements.txt`)

```txt
# Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0

# Database
psycopg2-binary==2.9.9
SQLAlchemy==2.0.23

# MT5
MetaTrader5==5.0.45

# Security
cryptography==41.0.7
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Utils
python-multipart==0.0.6
```

### Setup Inicial

```bash
# 1. Criar banco de dados
createdb ideepx

# 2. Executar schema
psql -U postgres -d ideepx -f database/schema.sql

# 3. Gerar chave de criptografia
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Copiar output para .env como ENCRYPTION_KEY

# 4. Instalar MT5 base
# Baixar de https://www.metatrader5.com/
# Instalar em: C:\MT5\base_mt5\

# 5. Criar workers
python scripts/setup_workers.py --workers 5

# 6. Instalar dependências Python
pip install -r backend/requirements.txt

# 7. Rodar collector
python backend/services/mt5_collector_pool.py

# 8. Rodar API (terminal separado)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 9. Rodar frontend (terminal separado)
cd frontend
npm install
npm run dev
```

---

## 🧪 Testes e Validação

### Checklist de Validação

**Backend:**
- [ ] Schema SQL cria todas as tabelas sem erros
- [ ] API responde em `http://localhost:8000/docs` (Swagger)
- [ ] Endpoint `/api/accounts/connect` aceita dados válidos
- [ ] Senha é criptografada corretamente no banco
- [ ] View `dashboard_accounts` retorna dados esperados

**Collector:**
- [ ] Workers são criados em `C:\MT5\workers\`
- [ ] Collector inicia sem erros
- [ ] Login MT5 funciona com credenciais reais
- [ ] Snapshots são salvos no banco a cada 5s
- [ ] Campo `last_heartbeat` é atualizado
- [ ] Cálculo de P/L está correto (verificar com MT5)
- [ ] Múltiplas contas são processadas em paralelo

**Frontend:**
- [ ] Página `/connect` renderiza corretamente
- [ ] Formulário valida campos obrigatórios
- [ ] Dropdown de corretoras funciona
- [ ] Submit envia dados para API
- [ ] Redirect para dashboard após sucesso
- [ ] Dashboard lista contas conectadas
- [ ] Auto-refresh funciona (5s)
- [ ] Formatação de moeda correta (USD)
- [ ] Cores de P/L dinâmicas (verde/vermelho)
- [ ] Status badges corretos
- [ ] Botão disconnect funciona

---

## 🚀 Otimizações e Melhorias Futuras

### Fase 2 (não fazer agora, mas deixar preparado):
1. **Múltiplos servidores collector** (sharding por contas)
2. **Cache Redis** para snapshots (reduzir queries)
3. **WebSockets** para updates em tempo real (ao invés de polling)
4. **Histórico de snapshots** (gráficos de equity/balance)
5. **Alertas** (email/telegram quando equity < threshold)
6. **API de comissões** (calcular comissões MLM sobre Total P/L)

### Monitoramento:
- Logs estruturados (JSON)
- Métricas Prometheus (collectors ativos, tempo de coleta, erros)
- Alertas se heartbeat > 5 minutos

---

## 📝 Notas Importantes

### ⚠️ Pontos Críticos de Atenção

1. **Cálculo de P/L:**
   - SEMPRE filtrar `deal.type in [0, 1]`
   - NÃO usar `deal.position_id > 0` (inclui depósitos/saques)

2. **Thread Safety:**
   - MT5 não é thread-safe
   - Worker usa `Lock()` para operações MT5
   - Cada worker tem sua própria conexão DB

3. **Heartbeat:**
   - Atualizar SEMPRE (mesmo em erro)
   - Status "Connected" depende de heartbeat recente
   - Permite detectar collector travado

4. **Credenciais:**
   - NUNCA logar senhas em texto puro
   - Usar Fernet para criptografia simétrica
   - Chave em variável de ambiente

5. **Performance:**
   - 5 workers suportam ~500 contas
   - Ajustar `MT5_WORKERS` conforme carga
   - Monitorar RAM (~300 MB por worker)

---

## ✅ Critérios de Sucesso

O sistema está pronto quando:

1. ✅ Usuário consegue conectar conta MT5 via formulário
2. ✅ Collector coleta dados a cada 5s
3. ✅ Dashboard exibe todas as colunas solicitadas
4. ✅ Auto-refresh funciona sem reload
5. ✅ P/L calculado bate com MT5
6. ✅ Status "Connected" reflete realidade
7. ✅ Múltiplas contas funcionam simultaneamente
8. ✅ Sistema suporta qualquer corretora MT5

---

## 🎯 Próximo Passo

**Implementar este sistema completo usando:**
- Backend: FastAPI (Python)
- Frontend: Next.js (React/TypeScript)
- Database: PostgreSQL
- Collector: Worker Pool (5 workers)

**Estrutura de pastas e todos os arquivos especificados acima.**

Boa sorte! 🚀
