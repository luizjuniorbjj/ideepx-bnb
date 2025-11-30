# 🔗 INTEGRAÇÃO RÁPIDA - Como Tudo Funciona Junto

## 🎯 FLUXO SIMPLIFICADO

```
┌────────────────────────────────────────────────────────────────┐
│                     CICLO SEMANAL COMPLETO                     │
└────────────────────────────────────────────────────────────────┘

📅 DOMINGO 23:00
├─ 1. Backend busca lucros da semana (GMI Edge API)
├─ 2. Calcula comissões MLM (10 níveis)
├─ 3. Cria snapshot JSON completo
├─ 4. Upload snapshot → IPFS (Pinata)
├─ 5. Registra proof → Blockchain (BSC)
└─ 6. Salva tudo → Database (PostgreSQL)

💰 SEGUNDA 00:00
├─ 1. Backend busca comissões pendentes (Database)
├─ 2. Agrupa em batches de 100 usuários
├─ 3. Executa batch USDT transfers → Blockchain
├─ 4. Finaliza semana → Blockchain (imutável)
└─ 5. Notifica usuários → Email/Push

📊 QUALQUER MOMENTO
├─ Usuário acessa Dashboard → Frontend
├─ Frontend busca dados → Backend API
├─ Backend consulta → Database + Blockchain
└─ Frontend renderiza → Comissões + Proofs
```

---

## 🔄 RESPONSABILIDADES DE CADA COMPONENTE

### 1️⃣ BLOCKCHAIN (BSC)

**O QUE FAZ:**
- ✅ Armazena PROOFS semanais (hashes IPFS)
- ✅ Garante imutabilidade do plano MLM
- ✅ Executa pagamentos USDT
- ✅ Registra timestamps e finalização

**O QUE NÃO FAZ:**
- ❌ Não calcula comissões (muito caro)
- ❌ Não armazena dados de usuários
- ❌ Não processa lógica de negócio

**CUSTOS:**
- Deploy: $2 (uma vez)
- Proof semanal: $0.30
- Batch payment (100 users): $1.50

---

### 2️⃣ IPFS (PINATA)

**O QUE FAZ:**
- ✅ Armazena plano MLM (commission-plan-v1.json)
- ✅ Armazena snapshots semanais (todos os cálculos)
- ✅ Fornece transparência (qualquer um pode verificar)

**O QUE NÃO FAZ:**
- ❌ Não executa código
- ❌ Não valida dados
- ❌ Não processa transações

**CUSTOS:**
- Free tier: 1GB (suficiente para anos)
- Pinning: Permanente

---

### 3️⃣ BACKEND (NODE.JS)

**O QUE FAZ:**
- ✅ Integra GMI Edge API (busca lucros)
- ✅ Calcula comissões MLM (10 níveis)
- ✅ Valida qualificações (LAI, L6-L10)
- ✅ Gerencia usuários e rede MLM
- ✅ Upload snapshots → IPFS
- ✅ Submete proofs → Blockchain
- ✅ Executa batch payments
- ✅ Cron jobs automatizados

**O QUE NÃO FAZ:**
- ❌ Não armazena chaves privadas dos usuários
- ❌ Não manipula fundos diretamente
- ❌ Não altera dados on-chain (apenas registra)

**TECNOLOGIAS:**
- Node.js + Express
- ethers.js (blockchain)
- Pinata SDK (IPFS)
- node-cron (agendamento)

---

### 4️⃣ DATABASE (POSTGRESQL)

**O QUE FAZ:**
- ✅ Armazena dados de usuários (cadastro, email, GMI ID)
- ✅ Árvore MLM (quem indicou quem)
- ✅ Histórico de comissões
- ✅ Histórico de pagamentos
- ✅ Cache de snapshots (performance)
- ✅ LAI status (licença mensal)

**O QUE NÃO FAZ:**
- ❌ Não é "source of truth" para comissões (blockchain é)
- ❌ Não valida regras de negócio sozinho
- ❌ Não processa pagamentos

**BACKUP:**
- Diário automatizado
- Retenção: 30 dias
- Restore: < 5 minutos

---

### 5️⃣ FRONTEND (NEXT.JS)

**O QUE FAZ:**
- ✅ Dashboard de usuário (comissões, rede)
- ✅ Conectar carteira (RainbowKit/Metamask)
- ✅ Visualizar proofs on-chain
- ✅ Ver snapshots IPFS
- ✅ Transparência total
- ✅ Gestão de rede MLM

**O QUE NÃO FAZ:**
- ❌ Não processa pagamentos sozinho
- ❌ Não calcula comissões (backend faz)
- ❌ Não altera blockchain diretamente

**TECNOLOGIAS:**
- Next.js 14
- RainbowKit (wallets)
- ethers.js (leitura blockchain)
- TailwindCSS

---

## 📊 EXEMPLO PRÁTICO: USUÁRIO RECEBE COMISSÃO

### JOÃO TEM 1 INDICADO (MARIA)
### MARIA LUCROU $1000 NA SEMANA

```
1️⃣ DOMINGO 23:00 - BACKEND CALCULA:

   Maria lucrou: $1000
   │
   ├─ Maria recebe: $1000 × 65% = $650 (cliente)
   │  └─ Salva: payments (maria, 650, pending)
   │
   └─ MLM recebe: $650 × 25% = $162.50
      │
      └─ João (L1 de Maria): 8% de $650 = $52
         └─ Salva: commissions (joão, 52, pending, from_maria)

   Cria JSON:
   {
     "users": [
       {
         "wallet": "0xMaria",
         "profit": 1000,
         "clientShare": 650,
         "upline": [
           { "level": 1, "wallet": "0xJoao", "commission": 52 }
         ]
       }
     ]
   }

   Upload IPFS: QmSnapshot123
   Submit Blockchain:
   proof.submitWeeklyProof(202445, "QmSnapshot123", 2, 52, 1000)

2️⃣ SEGUNDA 00:00 - BACKEND PAGA:

   Batch USDT transfers:
   ├─ usdt.transfer(0xMaria, 650)  // Cliente
   └─ usdt.transfer(0xJoao, 52)    // Comissão L1

   Finaliza:
   proof.finalizeWeek(202445)  // Imutável agora

   Atualiza banco:
   UPDATE commissions SET status='paid' WHERE week=202445

3️⃣ SEGUNDA 01:00 - JOÃO ACESSA DASHBOARD:

   Frontend → Backend:
   GET /api/users/0xJoao/commissions

   Backend → Database:
   SELECT * FROM commissions WHERE user_wallet='0xJoao'

   Backend → Blockchain:
   proof.getWeeklyProof(202445)
   └─ Retorna: { ipfsHash: "QmSnapshot123", finalized: true }

   Frontend exibe:
   ┌──────────────────────────────────────┐
   │ 💰 COMISSÕES DA SEMANA               │
   ├──────────────────────────────────────┤
   │ De: Maria Santos                     │
   │ Nível: 1 (Indicação Direta)         │
   │ Valor: $52.00 USDT                  │
   │ Status: ✅ Pago                      │
   │ TX: 0xabc... [Ver BSCScan]          │
   │ Proof: QmSnapshot... [Ver IPFS]    │
   └──────────────────────────────────────┘
```

---

## 🔐 ONDE FICAM OS DADOS?

```
┌─────────────────────────────────────────────────────────────┐
│ TIPO DE DADO              │ ONDE FICA        │ BACKUP      │
├─────────────────────────────────────────────────────────────┤
│ Plano MLM (regras)        │ IPFS + Blockchain│ Imutável    │
│ Proofs semanais           │ Blockchain       │ Imutável    │
│ Snapshots (detalhes)      │ IPFS             │ Pinned      │
│ Usuários (cadastro)       │ Database         │ Diário      │
│ Rede MLM (uplines)        │ Database         │ Diário      │
│ Comissões (histórico)     │ Database         │ Diário      │
│ Pagamentos USDT           │ Blockchain       │ Imutável    │
│ LAI status                │ Database         │ Diário      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ PERFORMANCE

```
LEITURA (Dashboard):
├─ Database query: ~10ms
├─ Blockchain read: ~50ms
├─ Total response: < 100ms
└─ Cache: Redis (futuro) → < 10ms

ESCRITA (Proof semanal):
├─ Cálculo comissões: ~2s (1000 users)
├─ Upload IPFS: ~1s
├─ Submit blockchain: ~5s
└─ Total: ~8s

PAGAMENTO (Batch 100 users):
├─ Prepare batch: ~0.5s
├─ Blockchain TX: ~10s
├─ Confirmações: ~15s
└─ Total: ~25s
```

---

## 🚨 PONTOS CRÍTICOS

### ❌ O QUE PODE DAR ERRADO:

**1. GMI Edge API offline**
- Impacto: Backend não consegue buscar lucros
- Solução: Retry automático (3x com backoff)
- Fallback: Manual input temporário

**2. IPFS/Pinata indisponível**
- Impacto: Não consegue subir snapshot
- Solução: Retry + gateway alternativo
- Fallback: Snapshot salvo no database temporariamente

**3. Gas price muito alto**
- Impacto: TX muito cara
- Solução: Wait até gas < 5 gwei
- Fallback: Adiar proof 1-2 horas

**4. Blockchain congestionada**
- Impacto: TX pendente por horas
- Solução: Increase gas price automaticamente
- Fallback: Resubmit TX

**5. Database crash**
- Impacto: Sistema offline
- Solução: Auto-restart + restore do backup
- Fallback: Readonly mode (só consultas blockchain)

---

## 🎯 NEXT STEPS - ORDEM DE IMPLEMENTAÇÃO

```
SEMANA 1: BACKEND BÁSICO
├─ Setup Express API
├─ Conexão Database
├─ CRUD de usuários
└─ Estrutura de rede MLM

SEMANA 2: INTEGRAÇÃO GMI EDGE
├─ Conectar API GMI Edge
├─ Buscar lucros semanais
├─ Validar contas
└─ Testes

SEMANA 3: CÁLCULO MLM
├─ Algoritmo de upline (10 níveis)
├─ Qualificação L6-L10
├─ LAI validation
└─ Testes com dados reais

SEMANA 4: BLOCKCHAIN INTEGRATION
├─ Upload IPFS (Pinata SDK)
├─ Submit proof on-chain
├─ Batch USDT payments
└─ Testes em testnet

SEMANA 5: AUTOMAÇÃO
├─ Cron job domingo (cálculo)
├─ Cron job segunda (pagamento)
├─ Error handling
└─ Notificações

SEMANA 6: FRONTEND
├─ Adaptar dashboard existente
├─ Páginas de transparência
├─ Visualização proofs
└─ Testes UI/UX

SEMANA 7: TESTES E2E
├─ Deploy testnet completo
├─ 10+ usuários reais
├─ Ciclo completo (domingo→segunda)
└─ Bug fixes

SEMANA 8: PRODUÇÃO
├─ Deploy mainnet
├─ Monitoramento
├─ Documentação
└─ Go live! 🚀
```

---

## 💡 DICAS DE IMPLEMENTAÇÃO

### BACKEND:

```javascript
// Estrutura sugerida
backend/
├── src/
│   ├── config/
│   │   ├── database.js       // PostgreSQL config
│   │   ├── blockchain.js     // ethers.js setup
│   │   └── ipfs.js           // Pinata SDK
│   │
│   ├── services/
│   │   ├── gmiEdge.js        // GMI Edge API integration
│   │   ├── mlmCalculator.js  // Cálculo comissões
│   │   ├── ipfsUploader.js   // Upload snapshots
│   │   ├── proofSubmitter.js // Submit on-chain
│   │   └── usdtPayer.js      // Batch payments
│   │
│   ├── routes/
│   │   ├── users.js          // GET/POST users
│   │   ├── commissions.js    // GET commissions
│   │   └── network.js        // GET network tree
│   │
│   ├── jobs/
│   │   ├── weeklyCalculation.js  // Cron: domingo 23:00
│   │   └── weeklyPayments.js     // Cron: segunda 00:00
│   │
│   └── server.js             // Express app
│
└── package.json
```

### FRONTEND:

```javascript
// Estrutura sugerida
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          // Dashboard principal
│   │
│   ├── network/
│   │   └── page.tsx          // Árvore MLM
│   │
│   ├── transparency/
│   │   └── page.tsx          // Proofs on-chain
│   │
│   └── layout.tsx            // Layout global + RainbowKit
│
├── components/
│   ├── ConnectButton.tsx     // Wallet connect
│   ├── CommissionTable.tsx   // Tabela de comissões
│   └── NetworkTree.tsx       // Visualização da rede
│
└── lib/
    ├── blockchain.ts         // ethers.js helpers
    └── api.ts                // Backend API calls
```

---

## 📞 SUPORTE E CONTATO

Qualquer dúvida sobre a integração:
1. Consulte SYSTEM-FLOW.md (este arquivo)
2. Consulte DEPLOYMENT-GUIDE.md (contratos)
3. Consulte AUDIT-GUIDE.md (segurança)

---

**✅ SISTEMA PRONTO PARA IMPLEMENTAÇÃO!**

Contratos validados, arquitetura definida, fluxos documentados.
Próximo passo: Implementar backend! 🚀
