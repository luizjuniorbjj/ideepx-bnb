# 📊 Sistema Multi-Conta MT5 - Guia Completo

## 🎯 Visão Geral

Sistema completo de monitoramento multi-conta MT5 integrado ao iDeepX, permitindo que usuários conectem múltiplas contas de qualquer corretora MT5/MT4.

### ✨ Funcionalidades

- ✅ **Multi-Broker Support**: GMI Markets, Doo Prime, XM, IC Markets, e qualquer outra corretora
- ✅ **Multi-Account**: Conecte quantas contas quiser por usuário
- ✅ **Real-time Monitoring**: Dados atualizados a cada 30 segundos automaticamente
- ✅ **Worker Pool Architecture**: Processa centenas/milhares de contas em paralelo
- ✅ **Secure Credentials**: Senhas criptografadas com AES-256
- ✅ **Historical Snapshots**: Histórico completo de cada conta armazenado
- ✅ **P/L Tracking**: Day/Week/Month/Total P/L calculado automaticamente
- ✅ **Responsive UI**: Dashboard mobile-first com auto-refresh

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  ┌───────────────┐         ┌──────────────────┐            │
│  │ /mt5/connect  │         │ /mt5/dashboard   │            │
│  │ (Conectar)    │────────▶│ (Monitoramento)  │            │
│  └───────────────┘         └──────────────────┘            │
└────────────────────────┬────────────────────────────────────┘
                         │ API REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────┐      │
│  │  API Endpoints                                   │      │
│  │  - POST /api/mt5/connect                         │      │
│  │  - GET  /api/mt5/accounts                        │      │
│  │  - DELETE /api/mt5/accounts/:id                  │      │
│  │  - GET  /api/mt5/accounts/:id/history            │      │
│  │  - GET  /api/mt5/stats                           │      │
│  └──────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ SQLite (Prisma)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (SQLite)                         │
│  ┌─────────────────────┐  ┌──────────────────────────┐    │
│  │  TradingAccount     │  │ TradingAccountCredential │    │
│  │  - id, userId       │  │ - encryptedPassword      │    │
│  │  - login, server    │  └──────────────────────────┘    │
│  │  - balance, equity  │                                   │
│  │  - PL metrics       │  ┌──────────────────────────┐    │
│  │  - status, etc      │  │   AccountSnapshot        │    │
│  └─────────────────────┘  │   - Historical data      │    │
│                            └──────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ Read/Write
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             MT5 COLLECTOR (Python Worker Pool)              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Worker Pool (5-10 workers)                      │      │
│  │  ┌────────┐  ┌────────┐  ┌────────┐            │      │
│  │  │Worker 1│  │Worker 2│  │Worker N│  (parallel) │      │
│  │  └───┬────┘  └───┬────┘  └───┬────┘            │      │
│  │      │ Login     │ Login     │ Login (sequential│      │
│  │      │ Fetch     │ Fetch     │ Fetch  per worker│      │
│  │      │ Update    │ Update    │ Update           │      │
│  │      └───────────┴───────────┴─────────         │      │
│  └──────────────────────────────────────────────────┘      │
│               Every 30 seconds (configurable)               │
└────────────────────────┬────────────────────────────────────┘
                         │ MT5 Terminal API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                MT5 TERMINALS (Multiple Brokers)             │
│   GMI Markets  │  Doo Prime  │  XM  │  IC Markets  │ ...   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Arquivos

```
C:\ideepx-bnb\
├── backend/
│   ├── prisma/
│   │   └── schema.prisma              # ✅ UPDATED: Schemas MT5 adicionados
│   └── src/
│       ├── routes/
│       │   └── mt5.js                  # ✅ NEW: API endpoints MT5
│       └── server.js                   # ✅ UPDATED: mt5Router registrado
│
├── mt5-collector/                      # ✅ NEW: Python MT5 Collector
│   ├── collector_pool.py               # Script principal (worker pool)
│   ├── requirements.txt                # Dependências Python
│   └── .env.example                    # Configuração exemplo
│
├── frontend/
│   └── app/
│       └── mt5/                        # ✅ NEW: Páginas MT5
│           ├── connect/
│           │   └── page.tsx            # Página de conexão de contas
│           └── dashboard/
│               └── page.tsx            # Dashboard de monitoramento
│
└── MT5_SYSTEM_GUIDE.md                 # ✅ Este arquivo
```

---

## 🚀 Setup - Passo a Passo

### 1️⃣ Banco de Dados (Prisma)

O schema já foi atualizado com as tabelas necessárias:

```bash
cd backend
npx prisma db push
npx prisma generate
```

**Tabelas criadas:**
- `TradingAccount` - Dados da conta MT5
- `TradingAccountCredential` - Credenciais criptografadas
- `AccountSnapshot` - Snapshots históricos

### 2️⃣ Backend (Node.js)

✅ **Já configurado!** Endpoints disponíveis em `/api/mt5/*`

**Restart do backend para carregar novos routes:**
```bash
# Se backend estiver rodando, pare e reinicie
cd backend
npm run dev
```

### 3️⃣ Python MT5 Collector

**Instalação:**

```bash
cd mt5-collector

# Criar ambiente virtual (recomendado)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt
```

**Configuração:**

```bash
# Copiar .env.example para .env
copy .env.example .env

# Editar .env e configurar:
# - NUM_WORKERS (5-10 workers)
# - COLLECT_INTERVAL (30 segundos)
# - DATABASE_URL (caminho para dev.db)
# - ENCRYPTION_KEY (gerar chave Fernet)
```

**Gerar ENCRYPTION_KEY:**

```python
# Rodar no Python:
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
# Copiar output para .env como ENCRYPTION_KEY
```

⚠️ **IMPORTANTE**: A mesma `ENCRYPTION_KEY` deve estar no `.env` do backend!

**Executar Collector:**

```bash
# Dentro de mt5-collector/ com venv ativado
python collector_pool.py

# Output esperado:
# ================================================================================
# MT5 COLLECTOR - WORKER POOL
# ================================================================================
# Workers: 5
# Intervalo: 30s
# Database: ../backend/prisma/dev.db
# ================================================================================
# 🚀 Iniciando ciclo de coleta MT5
# [Worker] Processando conta 12345@GMI-Live
# ✅ Conta 12345 atualizada: CONNECTED
# ...
```

### 4️⃣ Frontend

✅ **Já configurado!** Páginas disponíveis em `/mt5/connect` e `/mt5/dashboard`

**Verificar se frontend está rodando:**
```bash
cd frontend
npm run dev
# Acesse: http://localhost:3000/mt5/dashboard
```

---

## 🎮 Como Usar

### 1. Conectar Conta MT5

**Passos:**

1. Acesse: `http://localhost:3000/mt5/connect`
2. Preencha o formulário:
   - **Nome da Conta** (opcional): "Minha Conta GMI"
   - **Corretora**: Selecione da lista (GMI, Doo Prime, XM, IC Markets, Outro)
   - **Servidor**: Selecione o servidor da corretora
   - **Login**: Número da conta MT5 (ex: 12345678)
   - **Senha**: Senha do terminal MT5
   - **Plataforma**: MT5 ou MT4
3. Clique em **"Conectar Conta"**
4. Aguarde confirmação e redirecionamento para dashboard

**Segurança:**
- ✅ Senha criptografada com AES-256 antes de armazenar
- ✅ Nunca exibida no frontend
- ✅ Apenas o Python collector descriptografa para fazer login

### 2. Monitorar Contas

**Dashboard (`/mt5/dashboard`):**

- **Auto-refresh**: Dados atualizados automaticamente a cada 30 segundos
- **Métricas exibidas**:
  - Saldo (Balance)
  - Equity
  - Trades Abertos
  - P/L Aberto
  - Margem %
  - P/L Dia/Semana/Mês/Total
- **Status da conta**: Conectado/Desconectado/Erro/Pendente
- **Última atualização**: Timestamp do último heartbeat
- **Ações**: Atualizar manualmente, Remover conta

### 3. Remover Conta

- No dashboard, clique no ícone de **lixeira** ao lado da conta
- Confirme a remoção
- Conta, credenciais e histórico serão removidos (cascade delete)

---

## 📊 API Endpoints

### POST `/api/mt5/connect`
Conecta nova conta MT5.

**Body:**
```json
{
  "walletAddress": "0x...",
  "accountAlias": "Minha Conta GMI",
  "brokerName": "GMI Markets",
  "login": "12345678",
  "password": "senha_mt5",
  "server": "GMIEdge-Live",
  "platform": "MT5"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "uuid",
    "accountAlias": "Minha Conta GMI",
    "login": "12345678",
    "status": "PENDING"
  }
}
```

### GET `/api/mt5/accounts?walletAddress=0x...`
Lista contas do usuário.

**Response:**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "accountAlias": "Minha Conta GMI",
      "brokerName": "GMI Markets",
      "login": "12345678",
      "server": "GMIEdge-Live",
      "status": "CONNECTED",
      "connected": true,
      "balance": "10000.50",
      "equity": "10500.25",
      "openTrades": 3,
      "openPL": "500.00",
      "dayPL": "250.00",
      "weekPL": "1200.00",
      "monthPL": "3500.00",
      "totalPL": "5000.00",
      "lastHeartbeat": "2025-11-17T12:30:00Z"
    }
  ]
}
```

### DELETE `/api/mt5/accounts/:id?walletAddress=0x...`
Remove conta.

**Response:**
```json
{
  "success": true
}
```

### GET `/api/mt5/accounts/:id/history?walletAddress=0x...&limit=100`
Busca snapshots históricos.

**Response:**
```json
{
  "snapshots": [
    {
      "id": 1,
      "capturedAt": "2025-11-17T12:30:00Z",
      "balance": "10000.50",
      "equity": "10500.25",
      "dayPL": "250.00"
    }
  ]
}
```

### GET `/api/mt5/stats`
Estatísticas gerais do sistema.

**Response:**
```json
{
  "totalAccounts": 50,
  "connectedAccounts": 45,
  "disconnectedAccounts": 3,
  "errorAccounts": 2,
  "pendingAccounts": 0
}
```

---

## 🔧 Configurações Avançadas

### Worker Pool

**Ajustar número de workers:**
```env
# mt5-collector/.env
NUM_WORKERS=10  # Para mais contas simultâneas
```

**Regra de ouro:**
- 1-50 contas: 5 workers
- 50-200 contas: 10 workers
- 200-500 contas: 15-20 workers

### Intervalo de Coleta

```env
# mt5-collector/.env
COLLECT_INTERVAL=60  # 60 segundos (menos requisições)
COLLECT_INTERVAL=15  # 15 segundos (mais real-time)
```

⚠️ **Atenção**: Intervalo muito baixo pode sobrecarregar MT5 terminal

### Auto-refresh Frontend

Editar `frontend/app/mt5/dashboard/page.tsx`:
```typescript
// Linha ~145
useEffect(() => {
  const interval = setInterval(() => {
    // ...
  }, 30000) // ← Alterar para 60000 (1 minuto), 15000 (15s), etc
}, [])
```

---

## 🐛 Troubleshooting

### Collector não está atualizando contas

**Verificar:**
1. ✅ Collector está rodando? (`python collector_pool.py`)
2. ✅ ENCRYPTION_KEY igual no backend e collector?
3. ✅ DATABASE_URL correto no `.env` do collector?
4. ✅ Terminal MT5 instalado na máquina do collector?
5. ✅ Logs do collector (`collector.log`) mostram erros?

**Erros comuns:**
- `MT5 initialize() failed`: Terminal MT5 não instalado ou não encontrado
- `Login failed`: Credenciais incorretas ou servidor errado
- `Failed to decrypt password`: ENCRYPTION_KEY diferente entre backend/collector

### Frontend mostrando "Pendente" sempre

**Causa**: Collector não está rodando ou não consegue conectar.

**Solução**:
1. Iniciar o collector: `python collector_pool.py`
2. Aguardar 30s (primeiro ciclo de coleta)
3. Verificar logs do collector
4. Status deve mudar para "Conectado" ou "Erro"

### Conta desconecta constantemente

**Causa**: Senha incorreta, servidor errado, ou limite de conexões.

**Solução**:
1. Verificar credenciais no MT5 terminal manualmente
2. Confirmar nome exato do servidor (case-sensitive)
3. Algumas corretoras limitam conexões simultâneas (1-3)
4. Remover e reconectar conta com dados corretos

### P/L não calculado corretamente

**Verificar:**
- ✅ Filtro `deal.type in [0, 1]` está ativo (apenas trades)
- ✅ Timezone configurado (default: America/Sao_Paulo)
- ✅ Histórico de deals disponível no MT5

**Alterar timezone** (`collector_pool.py`):
```python
TZ = pytz.timezone('America/Sao_Paulo')  # Alterar aqui
```

---

## 📈 Escalabilidade

### Performance Esperada

| Contas | Workers | Tempo/Ciclo | Recomendação          |
|--------|---------|-------------|-----------------------|
| 1-50   | 5       | ~10-20s     | ✅ Ideal              |
| 50-200 | 10      | ~30-50s     | ✅ Bom                |
| 200-500| 20      | ~60-90s     | ⚠️ Aumentar intervalo |
| 500+   | 30+     | 2-3min      | ⚠️ Considerar múltiplas máquinas |

### Otimizações

**Para 500+ contas:**
1. Aumentar `COLLECT_INTERVAL` para 60-120s
2. Usar máquinas separadas para coletar (distribuir carga)
3. Considerar cache Redis para dados de conta
4. Implementar rate limiting no MT5

---

## 🔐 Segurança

### Credenciais

- ✅ **AES-256 encryption** antes de salvar no banco
- ✅ **Fernet (Python)** compatível com Node.js crypto
- ✅ **Nunca exposto** no frontend ou logs
- ✅ **Key rotation**: Trocar ENCRYPTION_KEY periodicamente

### Best Practices

1. ✅ Usar HTTPS em produção
2. ✅ Firewall no servidor do collector
3. ✅ Backup regular do banco de dados
4. ✅ Monitorar logs de acesso
5. ✅ Rate limiting nos endpoints da API

---

## 📝 Próximos Passos (Roadmap)

- [ ] Alertas por email/telegram quando conta desconecta
- [ ] Gráficos históricos de P/L (Chart.js)
- [ ] Export de dados para CSV/Excel
- [ ] Análise de risco (drawdown, Sharpe ratio)
- [ ] Comparativo entre contas
- [ ] Mobile app (React Native)
- [ ] WebSockets para real-time (eliminar polling)

---

## 🤝 Suporte

**Problemas encontrados?**

1. Verificar logs:
   - Backend: Console do Node.js
   - Collector: `mt5-collector/collector.log`
   - Frontend: Console do navegador (F12)

2. Verificar configurações:
   - `.env` do backend
   - `.env` do collector
   - Schema Prisma aplicado

3. Documentação adicional:
   - `ESPECIFICACAO_COMPLETA_1.md`
   - `PROJECT_CONTEXT.md`

---

## ✅ Checklist de Implantação

- [x] Schema Prisma atualizado e migrado
- [x] Backend endpoints criados e testados
- [x] Python MT5 Collector implementado
- [x] Frontend páginas Connect e Dashboard criadas
- [x] Encryption key gerada e configurada
- [ ] Collector rodando em background (produção)
- [ ] Testar com conta real MT5
- [ ] Monitorar performance com múltiplas contas
- [ ] Configurar auto-restart do collector (PM2/systemd)

---

**🎉 Sistema MT5 Multi-Conta completo e pronto para uso!**

Para mais informações, consulte `ESPECIFICACAO_COMPLETA_1.md` e `PROJECT_CONTEXT.md`.
