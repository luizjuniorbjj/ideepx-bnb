# 🚀 iDeepX Backend V10 - Documentação Completa

Backend completo para **iDeepX V10** com arquitetura híbrida (on-chain + off-chain).

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Database Setup](#database-setup)
- [Execução](#execução)
- [Endpoints API](#endpoints-api)
- [MLM System](#mlm-system)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### Arquitetura Híbrida

**On-chain (Smart Contract iDeepXCoreV10):**
- Estados públicos (saldos, subscrições)
- Saques com circuit breaker
- Limites e solvência
- Crédito de performance

**Off-chain (Este Backend):**
- Autenticação SIWE (Sign-In With Ethereum)
- Cálculo MLM (25% em 10 níveis)
- Integração GMI (dados seguros)
- Webhook PnL mensal
- Unlock de níveis (5 diretos + $5k)

---

## ✅ Requisitos

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **NPM** ou **Yarn**
- **BSC Testnet** tBNB (para roles)

---

## 📦 Instalação

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Criar Banco PostgreSQL

```bash
# Via Docker (recomendado)
docker run --name ideepx-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=ideepx \
  -p 5432:5432 \
  -d postgres:14

# Ou instalar PostgreSQL localmente
```

---

## ⚙️ Configuração

### 1. Copiar .env.example

```bash
cp .env.example .env
```

### 2. Preencher .env

```env
# ========== SERVER ==========
NODE_ENV=development
PORT=3001
HOST=localhost

# ========== DATABASE ==========
DATABASE_URL="postgresql://postgres:password@localhost:5432/ideepx?schema=public"

# ========== BLOCKCHAIN ==========
CHAIN_ID=97
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
CONTRACT_V10_ADDRESS=0x0f26974B54adA5114d802dDDc14aD59C3998f8d3
USDT_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd

# ========== PRIVATE KEYS (⚠️ TESTNET APENAS!) ==========
# Gerar 3 wallets separadas para roles:
UPDATER_PRIVATE_KEY=0xYOUR_KEY_HERE
DISTRIBUTOR_PRIVATE_KEY=0xYOUR_KEY_HERE
TREASURY_PRIVATE_KEY=0xYOUR_KEY_HERE

# ========== AUTHENTICATION ==========
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=7d
SIWE_DOMAIN=ideepx.ai
SIWE_STATEMENT=Sign in to iDeepX

# ========== ENCRYPTION (Gerar com script) ==========
# node -e "const c=require('crypto'); console.log('KEY:', c.randomBytes(32).toString('hex')); console.log('IV:', c.randomBytes(16).toString('hex'));"
ENCRYPTION_KEY=YOUR_32_BYTE_HEX_KEY
ENCRYPTION_IV=YOUR_16_BYTE_HEX_IV

# ========== GMI (Mock por enquanto) ==========
GMI_API_URL=https://api.gmi.com/v1
GMI_WEBHOOK_SECRET=your-secret
GMI_API_KEY=your-key

# ========== SECURITY ==========
HMAC_SECRET=$(openssl rand -hex 32)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000

# ========== MLM CONFIG ==========
MLM_PERCENTAGES=8,3,2,1,1,2,2,2,2,2
MLM_UNLOCK_REQUIREMENT_DIRECTS=5
MLM_UNLOCK_REQUIREMENT_VOLUME=5000
PERFORMANCE_SPLIT_CLIENT=65
PERFORMANCE_SPLIT_COMPANY=35

# ========== ADMIN ==========
ADMIN_WALLETS=0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
```

---

## 🗄️ Database Setup

### 1. Gerar Prisma Client

```bash
npm run db:generate
```

### 2. Criar Tabelas (Push Schema)

```bash
npm run db:push
```

### 3. (Opcional) Abrir Prisma Studio

```bash
npm run db:studio
```

Acesse: http://localhost:5555

---

## 🚀 Execução

### Modo Desenvolvimento

```bash
npm run dev
```

### Modo Produção

```bash
npm start
```

### Verificar Status

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T...",
  "version": "1.0.0"
}
```

---

## 🔐 Conceder Roles (OBRIGATÓRIO)

Antes de usar o backend, precisa conceder roles no smart contract:

```javascript
// No Hardhat console ou script:
const core = await ethers.getContractAt("iDeepXCoreV10", "0x0f26974B54adA5114d802dDDc14aD59C3998f8d3");

// Conceder UPDATER_ROLE
await core.grantRole(await core.UPDATER_ROLE(), "0xYOUR_UPDATER_ADDRESS");

// Conceder DISTRIBUTOR_ROLE
await core.grantRole(await core.DISTRIBUTOR_ROLE(), "0xYOUR_DISTRIBUTOR_ADDRESS");

// Conceder TREASURY_ROLE
await core.grantRole(await core.TREASURY_ROLE(), "0xYOUR_TREASURY_ADDRESS");

// Verificar
await core.hasRole(await core.UPDATER_ROLE(), "0xYOUR_UPDATER_ADDRESS");
```

---

## 📡 Endpoints API

### Autenticação (SIWE)

#### 1. Iniciar Autenticação

```http
POST /api/auth/siwe/start
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

Resposta:
```json
{
  "message": "ideepx.ai wants you to sign in...",
  "nonce": "abc123..."
}
```

#### 2. Verificar Assinatura

```http
POST /api/auth/siwe/verify
Content-Type: application/json

{
  "message": "ideepx.ai wants you to sign in...",
  "signature": "0x..."
}
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "walletAddress": "0x...",
    "active": false,
    "maxLevel": 5,
    "hasGmiAccount": false
  }
}
```

---

### Usuário (Protegido)

**Header:** `Authorization: Bearer <token>`

#### Obter Perfil

```http
GET /api/user/me
```

#### Obter Estatísticas MLM

```http
GET /api/user/mlm/stats
```

#### Verificar Elegibilidade (Níveis 6-10)

```http
GET /api/user/eligibility
```

Resposta:
```json
{
  "qualifies": true,
  "currentMaxLevel": 5,
  "recommendedMaxLevel": 10,
  "requirements": {
    "directs": {
      "required": 5,
      "current": 7,
      "met": true
    },
    "volume": {
      "required": 5000,
      "current": 6500.50,
      "met": true
    }
  }
}
```

#### Link Conta GMI

```http
POST /api/link
Content-Type: application/json

{
  "accountNumber": "123456",
  "server": "GMI-MT5-1"
}
```

---

### Admin (Protegido + Admin Role)

#### Sistema

```http
GET /api/admin/system
```

#### Sincronizar Elegibilidade (Todos)

```http
POST /api/admin/sync/eligibility
```

---

### Webhook GMI (Mock)

```http
POST /api/webhook/gmi/pnl
Content-Type: application/json

{
  "performances": [
    {
      "walletAddress": "0x...",
      "profitUsd": 1000.50
    }
  ]
}
```

---

## 🎯 MLM System

### Como Funciona

1. **Performance Fee (GMI → Backend)**
   - Webhook GMI envia lucros mensais
   - Backend calcula split: 65% cliente / 35% empresa

2. **Cálculo MLM (Backend)**
   - 25% do lucro total = MLM Pool
   - Distribuição em 10 níveis: [8, 3, 2, 1, 1, 2, 2, 2, 2, 2]
   - Níveis 1-5: Sempre desbloqueados
   - Níveis 6-10: Requer 5 diretos + $5k volume

3. **Crédito On-chain (Backend → Contrato)**
   - Backend chama `creditPerformance(users[], amounts[])`
   - Contrato credita saldo interno
   - Usuário pode sacar via `withdraw()`

### Exemplo de Cálculo

**Cenário:**
- Usuário A tem lucro de $10,000
- Empresa recebe 35% = $3,500
- MLM Pool = 25% de $10,000 = $2,500

**Distribuição:**
```
L1 (sponsor direto): 8% de $2,500 = $200
L2: 3% de $2,500 = $75
L3: 2% de $2,500 = $50
L4: 1% de $2,500 = $25
L5: 1% de $2,500 = $25
L6: 2% de $2,500 = $50 (se desbloqueado)
L7: 2% de $2,500 = $50 (se desbloqueado)
L8: 2% de $2,500 = $50 (se desbloqueado)
L9: 2% de $2,500 = $50 (se desbloqueado)
L10: 2% de $2,500 = $50 (se desbloqueado)
---
Total: $625 (se todos desbloqueados)
```

---

## 🐛 Troubleshooting

### Erro: "Insufficient allowance"

**Problema:** Backend não consegue chamar `creditPerformance()`

**Solução:**
```javascript
// Aprovar USDT para o contrato
const usdt = await ethers.getContractAt("IERC20", USDT_ADDRESS);
await usdt.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
```

### Erro: "UPDATER_ROLE"

**Problema:** Wallet não tem role necessária

**Solução:** Conceder role (ver seção "Conceder Roles")

### Database Connection Error

**Problema:** PostgreSQL não está rodando

**Solução:**
```bash
# Docker
docker start ideepx-postgres

# Ou verificar serviço local
sudo systemctl start postgresql
```

### Erro: "breaker active"

**Problema:** Circuit breaker ativado (solvência < 110%)

**Solução:** Adicionar USDT ao contrato para aumentar solvência

---

## 📊 Monitoramento

### Logs

Logs são salvos em:
- `logs/app.log` - Todos os logs
- `logs/error.log` - Apenas erros
- `logs/exceptions.log` - Exceções não tratadas

### Database

Use Prisma Studio para visualizar dados:
```bash
npm run db:studio
```

### Blockchain

- **Testnet:** https://testnet.bscscan.com
- **Mainnet:** https://bscscan.com

---

## 🔄 Próximos Passos

1. ✅ **Testar fluxo completo:**
   - Autenticação SIWE
   - Link conta GMI
   - Simular performance
   - Verificar créditos on-chain

2. ✅ **Desenvolver Jobs/Cron:**
   - Sync diário de métricas
   - Processamento de performance
   - Limpeza de logs

3. ✅ **Integração GMI Real:**
   - API GMI para dados de trading
   - Webhook seguro (HMAC + mTLS)
   - Validação de dados

4. ✅ **Deploy Produção:**
   - Servidor (VPS/Cloud)
   - Database (managed PostgreSQL)
   - SSL/TLS (Let's Encrypt)
   - Monitoring (Prometheus + Grafana)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique logs: `logs/app.log`
2. Consulte documentação do contrato: `../docs/`
3. Entre em contato: support@ideepx.ai

---

## ⚠️ Avisos Importantes

1. **NUNCA** compartilhe `.env` ou private keys
2. **SEMPRE** use HTTPS em produção
3. **TESTE** tudo no testnet antes de mainnet
4. **BACKUP** database regularmente
5. **MONITORE** solvência do contrato 24/7

---

✅ **Backend V10 Pronto para Uso!** 🚀
