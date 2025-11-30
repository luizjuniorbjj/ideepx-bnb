# 📋 RESUMO DA SESSÃO - SISTEMA MT5 COLLECTOR

## ✅ O QUE FOI CONFIGURADO

### 1. **Database Schema**
- ✅ Criado modelo `Broker` e `BrokerServer`
- ✅ Aplicado schema ao banco SQLite
- ✅ Populado com dados iniciais:
  - **GMI Markets** (2 servidores)
  - **Doo Prime** (2 servidores)

### 2. **Frontend MT5**
- ✅ Atualizado `/mt5` para buscar brokers e servidores do banco
- ✅ Removido validação de wallet (MT5 independente de Web3)
- ✅ Menu atualizado: "GMI Edge" → "MT5"
- ✅ Seleção dinâmica de corretoras e servidores

### 3. **Backend API**
- ✅ Endpoint `/api/mt5/connect` modificado para:
  - Auto-criar usuário se não existir
  - **ATUALIZAR** conta existente em vez de bloquear
  - Criptografar senha com Fernet (AES-256)

### 4. **Python MT5 Collector**
- ✅ Criado `collect_all_accounts.py` - Coletor multi-conta
- ✅ Criado `test_mt5_disponibilidade.py` - Verificador
- ✅ Criado `test_connection_doo_prime.py` - Teste com credenciais
- ✅ Configurado `.env` com ENCRYPTION_KEY
- ✅ Instaladas dependências Python:
  - `MetaTrader5`
  - `cryptography`
  - `python-dotenv`
  - `psutil`

### 5. **Configuração MT5**
- ✅ **MT5 instalado:** `C:\mt5_terminal1\terminal64.exe`
- ✅ **MT5 aberto e rodando**
- ✅ **"Allow algorithmic trading"** - HABILITADO
- ✅ **"Allow DLL imports"** - HABILITADO
- ✅ **Opções "Disable..." todas desmarcadas**
- ✅ **Log do MT5 mostra:** "automated trading is enabled"

### 6. **Conta Conectada**
- ✅ **Corretora:** Doo Prime
- ✅ **Login:** 9941739
- ✅ **Servidor:** DooTechnology-Live
- ✅ **Status:** Conectada no banco de dados

---

## ❌ PROBLEMA IDENTIFICADO

### **Erro:** IPC Timeout (-10005)

Apesar de todas as configurações estarem corretas:
- MT5 aberto e rodando
- "Allow automated trading" habilitado
- Caminho correto do MT5

A biblioteca Python `MetaTrader5` não consegue se conectar via IPC (Inter-Process Communication).

### **Possíveis Causas:**

1. **Antivírus/Firewall** bloqueando comunicação IPC
2. **Permissões do Windows** impedindo conexão entre processos
3. **Versão incompatível** da biblioteca MetaTrader5
4. **MT5 executando como Administrador** (e Python não)
5. **Problema conhecido** em algumas versões do MT5

---

## 🔧 SOLUÇÕES A TENTAR

### ⚡ **SOLUÇÃO AUTOMÁTICA (RECOMENDADA)**

**Execute o script de resolução automática:**

```cmd
RESOLVER-IPC-TIMEOUT.bat
```

Este script irá:
1. ✅ Desinstalar versão atual do MetaTrader5
2. ✅ Limpar cache do pip
3. ✅ Instalar versão estável (5.0.45)
4. ✅ Testar conexão automaticamente

**OU execute o diagnóstico completo:**

```cmd
cd C:\ideepx-bnb\mt5-collector
python diagnostico_completo_mt5.py
```

---

### 🔧 **SOLUÇÕES MANUAIS**

### **Solução 1: Trocar Versão da Biblioteca (MAIS EFETIVA)**

```powershell
cd C:\ideepx-bnb\mt5-collector
pip uninstall MetaTrader5 -y
pip cache purge
pip install MetaTrader5==5.0.45
python test_mt5_disponibilidade.py
```

### **Solução 2: Executar Python como Administrador**

1. Abrir PowerShell **COMO ADMINISTRADOR**
2. Executar:
```powershell
cd C:\ideepx-bnb\mt5-collector
python test_mt5_disponibilidade.py
```

### **Solução 3: Desabilitar Antivírus Temporariamente**

Alguns antivírus bloqueiam comunicação IPC. Testar com antivírus desabilitado.

### **Solução 4: Verificar se MT5 está como Administrador**

1. Fechar MT5
2. Clicar com botão direito em `C:\mt5_terminal1\terminal64.exe`
3. **Desmarcar:** "Executar como administrador"
4. Abrir MT5 normalmente

### **Solução 5: Tentar Caminho do Terminal**

Algumas instalações MT5 requerem o caminho do `terminal.exe` (32-bit) em vez de `terminal64.exe`.

Editar scripts e trocar:
```python
MT5_PATH = r"C:\mt5_terminal1\terminal.exe"  # Tentar versão 32-bit
```

---

## 📚 ARQUIVOS CRIADOS

### **Collector Scripts:**
- `C:\ideepx-bnb\mt5-collector\collect_all_accounts.py` - Coletor multi-conta
- `C:\ideepx-bnb\mt5-collector\test_mt5_disponibilidade.py` - Teste de disponibilidade
- `C:\ideepx-bnb\mt5-collector\test_connection_doo_prime.py` - Teste com credenciais
- `C:\ideepx-bnb\mt5-collector\diagnostico_completo_mt5.py` - ⭐ NOVO! Diagnóstico automático
- `C:\ideepx-bnb\mt5-collector\find_mt5.py` - Localizador de MT5
- `C:\ideepx-bnb\mt5-collector\.env` - Configurações

### **Scripts Batch:**
- `C:\ideepx-bnb\RESOLVER-IPC-TIMEOUT.bat` - ⭐ NOVO! Resolução automática
- `C:\ideepx-bnb\INICIAR-COLETOR-MT5.bat` - Iniciar coletor

### **Backend:**
- `C:\ideepx-bnb\backend\prisma\schema.prisma` (atualizado com Broker/BrokerServer)
- `C:\ideepx-bnb\backend\prisma\seed.js` (seed de brokers)
- `C:\ideepx-bnb\backend\src\routes\mt5.js` (endpoint atualizado)
- `C:\ideepx-bnb\backend\limpar-contas-mt5.cjs` (utilitário)

### **Frontend:**
- `C:\ideepx-bnb\frontend\app\mt5\page.tsx` (atualizado para banco)
- `C:\ideepx-bnb\frontend\components\BottomNav.tsx` (menu atualizado)

### **Guias:**
- `C:\ideepx-bnb\MT5_SETUP_COMPLETO.md`
- `C:\ideepx-bnb\INICIAR_COLETOR_MT5.md`
- `C:\ideepx-bnb\INICIAR-COLETOR-MT5.bat`

---

## 🎯 PRÓXIMOS PASSOS

### **Quando o IPC Timeout for resolvido:**

1. **Testar disponibilidade:**
   ```powershell
   cd C:\ideepx-bnb\mt5-collector
   python test_mt5_disponibilidade.py
   ```
   **Esperado:** "✅ MT5 ESTÁ RODANDO E RESPONDENDO!"

2. **Testar conexão com conta:**
   ```powershell
   python test_connection_doo_prime.py
   ```
   **Esperado:** Mostrar saldo, equity, trades da conta Doo Prime

3. **Iniciar coletor:**
   ```powershell
   python collect_all_accounts.py
   ```
   **OU** duplo clique em: `C:\ideepx-bnb\INICIAR-COLETOR-MT5.bat`

4. **Verificar Dashboard:**
   - Abrir: http://localhost:3000/mt5
   - Aguardar 30 segundos (primeiro ciclo de coleta)
   - Atualizar página
   - Verificar se dados aparecem!

---

## 🔍 INVESTIGAÇÃO ADICIONAL

### **Verificar se Python consegue ver o MT5:**

```python
import MetaTrader5 as mt5
print(mt5.version())
```

Se retornar `None`, é problema de conexão IPC.

### **Verificar logs do MT5:**

1. No MT5, ir em aba **"Journal"** (rodapé)
2. Verificar se aparecem mensagens quando Python tenta conectar
3. Procurar por erros relacionados a "API" ou "external"

---

## 📊 ARQUITETURA IMPLEMENTADA

```
┌──────────────────────────────────────┐
│  DATABASE (backend/prisma/dev.db)    │
│  ├─ Broker                           │
│  ├─ BrokerServer                     │
│  ├─ TradingAccount                   │
│  └─ TradingAccountCredential         │
└──────────────────────────────────────┘
            ↑
            │
┌──────────────────────────────────────┐
│  BACKEND API (port 5001)             │
│  ├─ GET /api/mt5/brokers             │
│  ├─ GET /api/mt5/brokers/:id/servers │
│  ├─ POST /api/mt5/connect            │
│  └─ GET /api/mt5/accounts            │
└──────────────────────────────────────┘
            ↑
            │
┌──────────────────────────────────────┐
│  FRONTEND (port 3000)                │
│  └─ /mt5 - Conexão de contas        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  MT5 COLLECTOR (Python)              │
│  ├─ Lê contas do banco               │
│  ├─ Conecta via mt5.initialize()     │  ← ❌ BLOQUEADO POR IPC TIMEOUT
│  ├─ Coleta dados                     │
│  └─ Atualiza banco a cada 30s        │
└──────────────────────────────────────┘
            ↑
            │ (IPC Communication)
            │
┌──────────────────────────────────────┐
│  MT5 TERMINAL                        │
│  C:\mt5_terminal1\terminal64.exe     │
│  ✅ RODANDO                          │
│  ✅ Allow algorithmic trading ON     │
└──────────────────────────────────────┘
```

---

## ✅ SISTEMA FUNCIONAL (Exceto Collector)

- ✅ **Frontend:** Pode conectar contas MT5
- ✅ **Backend:** Salva credenciais criptografadas
- ✅ **Database:** Armazena tudo corretamente
- ❌ **Collector:** Não consegue conectar no MT5 (IPC timeout)

---

## 💡 ALTERNATIVA TEMPORÁRIA

Enquanto o IPC não funcionar, você pode:

1. **Conectar contas via frontend** (isso já funciona!)
2. **Dados ficam salvos no banco**
3. **Quando IPC funcionar**, o collector pegará automaticamente

---

## 📞 SUPORTE

Se nenhuma solução funcionar, pode ser:
- **Incompatibilidade** da biblioteca com essa instalação específica do MT5
- **Restrição do Windows** em comunicação entre processos
- **Versão do MT5** não suportada pela biblioteca Python

**Recomendação:** Abrir issue no repositório oficial:
https://github.com/MetaQuotes/MetaTrader5-Terminal-Python/issues

---

**✅ Todo o resto do sistema está funcionando perfeitamente!**
**❌ Apenas a coleta automática de dados está bloqueada pelo IPC timeout**
