# 📊 ANÁLISE DE DADOS GMI EDGE - iDeepX

**Data:** 2025-11-07
**Status:** Análise Completa

---

## 🎯 OBJETIVO

Identificar quais dados são necessários do **GMI Edge** para gerar os **snapshots semanais** que alimentam o sistema de **comissões MLM** transparente via blockchain + IPFS.

---

## 📋 ESTRUTURA DO SNAPSHOT SEMANAL

### Dados gerais (summary):
- `totalUsers` - Total de usuários
- `activeUsers` - Usuários ativos
- `totalProfits` - Soma dos lucros de todos usuários
- `totalCommissions` - Soma de todas comissões MLM pagas

### Dados por usuário:
```json
{
  "wallet": "0x...",
  "gmiAccount": "TEST001",
  "profit": 2500.00,          // ← VINDO DO GMI EDGE
  "clientShare": 1625.00,     // profit × 0.65
  "companyFee": 875.00,       // profit × 0.35
  "mlmTotal": 406.25,         // clientShare × 0.25
  "commissions": {            // ← CALCULADO PELO BACKEND
    "L1": {...},
    "L2": {...}
  },
  "lai": {...},               // ← BANCO DE DADOS
  "qualified": {...},         // ← CALCULADO PELO BACKEND
  "netReceived": 2012.25      // clientShare + mlmTotal - laiCost
}
```

---

## ✅ DADOS QUE O GMI EDGE SERVICE JÁ FORNECE

### 1. **accountState** (Estado financeiro atual)
Endpoint: `GET /accountstate`
Dados retornados:
```json
{
  "AccountState": {
    "Balance": 10000.00,
    "Equity": 10500.00,
    "Margin": 2000.00,
    "FreeMargin": 8500.00,
    "MarginLevel": 525.00,
    "FloatingProfit": 500.00
  },
  "OrderStates": [...]  // Posições abertas
}
```

### 2. **tradeHistory** (Histórico de trades)
Endpoint: `POST /tradehistory`
Dados retornados:
```json
{
  "TradeHistory": [
    {
      "OrderId": 12345,
      "Symbol": "EURUSD",
      "Volume": 1.0,
      "NetProfit": 150.00,
      "TransactionType": "ORDER_CLOSED",
      "CloseTime": 1731888000000000,  // nanosegundos
      "TransactionTimestamp": 1731888000000000
    }
  ]
}
```

### 3. **calculateMetrics()** (Métricas calculadas)
Método atual:
```javascript
{
  monthlyVolume: 25000.00,
  monthlyProfit: 1500.00,    // ← PROBLEMA: É MENSAL, não SEMANAL
  monthlyLoss: 300.00,
  totalTrades: 45,
  winRate: 65.5,
  profitFactor: 5.0,
  hasHistory: true,
  openPositions: 3
}
```

---

## ❌ DADOS QUE FALTAM PARA O SNAPSHOT

### 1. **Lucro SEMANAL** (não mensal)
**O que temos:** `monthlyProfit` via `calculateMetrics()`
**O que precisamos:** `weeklyProfit`

**Solução:**
Criar método `calculateWeeklyProfit(tradeHistory)` que filtra trades dos últimos 7 dias.

```javascript
// Exemplo de implementação necessária:
async getWeeklyProfit(accountNumber) {
  const history = await this.getTradeHistory(accountNumber, 7); // 7 dias
  return this.calculateWeeklyMetrics(history);
}
```

### 2. **Wallet vinculada** (endereço blockchain)
**O que temos:** Apenas `accountNumber` (GMI Edge)
**O que precisamos:** `wallet` (0x...)

**Solução:**
Armazenar no banco de dados a relação:
```javascript
// Tabela: user_gmi_links
{
  wallet: "0x...",
  gmiAccount: "TEST001",
  linkedAt: "2024-11-01",
  active: true
}
```

### 3. **Sponsor/Upline** (rede MLM)
**O que temos:** Nada (GMI Edge não tem isso)
**O que precisamos:** `sponsor` (endereço do upline)

**Solução:**
Armazenar na tabela `users`:
```javascript
{
  wallet: "0x...",
  sponsor: "0x...",  // wallet do patrocinador
  registeredAt: "2024-11-01"
}
```

### 4. **Qualificações de rede**
**O que temos:** Nada
**O que precisamos:**
```javascript
{
  "qualified": {
    "basic": true,       // Tem >= 1 direto ativo
    "advanced": true,    // Tem >= 3 diretos ativos
    "directs": 6,        // Número de diretos
    "volume": 8500.00,   // Volume da rede
    "reason": "Qualified for L6-L10"
  }
}
```

**Solução:**
Calcular dinamicamente no backend:
- Buscar todos diretos do usuário
- Verificar quais estão ativos (LAI válido + lucro > 0)
- Somar volume da rede (10 níveis)

### 5. **Comissões MLM por nível**
**O que temos:** Nada
**O que precisamos:**
```javascript
{
  "commissions": {
    "L1": {
      "amount": 195.00,
      "from": ["0x...", "0x..."],  // wallets dos downlines
      "percentage": 0.08
    },
    "L2": {...}
  }
}
```

**Solução:**
Algoritmo recursivo no backend:
1. Para cada nível (L1 a L10)
2. Buscar todos downlines desse nível
3. Somar: `downlineProfit × clientShare × levelPercentage`

### 6. **Status LAI** (Linha Ativa Inferior)
**O que temos:** Nada
**O que precisamos:**
```javascript
{
  "lai": {
    "active": true,
    "cost": 19.00,
    "expiresAt": 1734566400,
    "paidOn": "2024-11-08"
  }
}
```

**Solução:**
Armazenar no banco:
```javascript
// Tabela: lai_payments
{
  wallet: "0x...",
  amount: 19.00,
  paidAt: "2024-11-08",
  expiresAt: "2024-12-18",  // 40 dias depois
  txHash: "0x..."
}
```

---

## 🔄 FLUXO COMPLETO DE GERAÇÃO DE SNAPSHOT

### **ETAPA 1: Coletar dados GMI Edge**
Para cada usuário ativo:
```javascript
const weeklyProfit = await gmiEdgeService.getWeeklyProfit(gmiAccount);
const accountState = await gmiEdgeService.getAccountState(gmiAccount);
```

### **ETAPA 2: Buscar dados do banco**
```javascript
const user = await User.findOne({ wallet });
const laiStatus = await LAI.findOne({ wallet });
const sponsor = user.sponsor;
```

### **ETAPA 3: Calcular comissões MLM**
```javascript
const commissions = await mlmService.calculateCommissions(wallet, weeklyProfit);
const qualified = await mlmService.checkQualifications(wallet);
```

### **ETAPA 4: Montar objeto do usuário**
```javascript
{
  wallet: user.wallet,
  gmiAccount: user.gmiAccount,
  profit: weeklyProfit,
  clientShare: weeklyProfit × 0.65,
  companyFee: weeklyProfit × 0.35,
  mlmTotal: (weeklyProfit × 0.65) × 0.25,
  commissions: commissions,
  lai: laiStatus,
  qualified: qualified,
  netReceived: clientShare + mlmTotal - laiCost
}
```

### **ETAPA 5: Gerar snapshot.json**
```javascript
{
  "week": 1731888000,
  "summary": {...},
  "users": [usuario1, usuario2, ...]
}
```

### **ETAPA 6: Upload IPFS + On-chain**
```bash
node scripts/upload-snapshot-to-ipfs.js snapshot.json
node scripts/submit-proof.js upload-info.json
node scripts/finalize-proof.js submit-info.json
```

---

## 📊 MAPEAMENTO DE DADOS

| Campo Snapshot      | Origem                     | Status    |
|---------------------|----------------------------|-----------|
| `wallet`            | Banco de dados             | ❌ Falta  |
| `gmiAccount`        | Banco de dados             | ❌ Falta  |
| `profit`            | GMI Edge (semanal)         | ❌ Falta  |
| `clientShare`       | Calculado (profit × 0.65)  | ✅ Sim    |
| `companyFee`        | Calculado (profit × 0.35)  | ✅ Sim    |
| `mlmTotal`          | Calculado                  | ✅ Sim    |
| `commissions`       | Algoritmo MLM              | ❌ Falta  |
| `lai`               | Banco de dados             | ❌ Falta  |
| `qualified`         | Algoritmo de rede          | ❌ Falta  |
| `netReceived`       | Calculado                  | ✅ Sim    |

---

## 🚀 PRÓXIMOS PASSOS

### **DIA 8 - Backend GMI Integration**
1. ✅ Criar `getWeeklyProfit()` no gmiEdgeService.js
2. ✅ Criar modelos de banco (User, LAI, Network)
3. ✅ Criar serviço de cálculo MLM (mlmService.js)
4. ✅ Criar endpoint `/api/snapshot/generate`

### **DIA 9 - Frontend Data Display**
1. ✅ Atualizar dashboard para mostrar weeklyProfit
2. ✅ Exibir comissões MLM em tempo real
3. ✅ Mostrar status LAI e qualificações

### **DIA 10 - Automação**
1. ✅ Cron job semanal (toda segunda 00:00 UTC)
2. ✅ Gerar snapshot automaticamente
3. ✅ Upload IPFS + Submit + Finalize
4. ✅ Notificações (e-mail/webhook)

---

## 💡 CONCLUSÃO

**Dados GMI Edge disponíveis:** 60%
**Dados ainda necessários:** 40%

**Principais gaps:**
1. ❌ Lucro SEMANAL (só tem mensal)
2. ❌ Estrutura de rede MLM (banco de dados)
3. ❌ Sistema de cálculo de comissões
4. ❌ Tracking de LAI

**Estimativa de implementação:**
📅 **3 dias** (Dias 8-10)

---

**Versão:** 1.0.0
**Data:** 2025-11-07
**Autor:** Claude Code (Sonnet 3.7)
