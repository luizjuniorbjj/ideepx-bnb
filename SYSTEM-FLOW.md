# 🔄 FLUXO COMPLETO DO SISTEMA iDeepX

## 📋 VISÃO GERAL

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   FRONTEND  │ ←──→ │   BACKEND   │ ←──→ │  BLOCKCHAIN │ ←──→ │    IPFS     │
│  (Next.js)  │      │  (Node.js)  │      │  (BSC/USDT) │      │  (Pinata)   │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                              ↕
                     ┌─────────────┐
                     │  DATABASE   │
                     │ (PostgreSQL)│
                     └─────────────┘
```

---

## 🏗️ ARQUITETURA DETALHADA

### COMPONENTES:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA 1: BLOCKCHAIN                         │
├─────────────────────────────────────────────────────────────────────┤
│  📄 iDeepXRulebookImmutable.sol                                     │
│  ├─ Armazena: IPFS CID do plano, Content Hash                      │
│  ├─ Função: Garantir imutabilidade do plano MLM                    │
│  └─ Deploy: UMA VEZ (nunca muda)                                   │
│                                                                       │
│  🔐 iDeepXProofFinal.sol                                            │
│  ├─ Armazena: Proofs semanais (IPFS hash dos snapshots)            │
│  ├─ Função: Registro transparente de comissões                     │
│  └─ Update: SEMANAL (domingo 23:00)                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA 2: IPFS/PINATA                        │
├─────────────────────────────────────────────────────────────────────┤
│  📦 commission-plan-v1.json                                         │
│  ├─ Upload: UMA VEZ no deploy inicial                              │
│  ├─ Conteúdo: Plano MLM completo (10 níveis, percentuais, regras)  │
│  └─ Acesso: Público via gateway                                    │
│                                                                       │
│  📊 weekly-snapshot-{week}.json                                     │
│  ├─ Upload: SEMANAL (domingo 23:00)                                │
│  ├─ Conteúdo: Todos os usuários, lucros, comissões calculadas      │
│  └─ Acesso: Hash registrado on-chain                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CAMADA 3: BACKEND                           │
├─────────────────────────────────────────────────────────────────────┤
│  🖥️ Node.js/Express API                                             │
│  ├─ Integração GMI Edge API (buscar lucros)                        │
│  ├─ Cálculo de comissões MLM                                       │
│  ├─ Upload snapshots para IPFS                                     │
│  ├─ Submit proofs on-chain                                         │
│  ├─ Batch payments USDT                                            │
│  └─ Gestão de usuários e rede MLM                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA 4: DATABASE                           │
├─────────────────────────────────────────────────────────────────────┤
│  🗄️ PostgreSQL                                                      │
│  ├─ Tabela: users (dados cadastrais, carteiras)                    │
│  ├─ Tabela: network (árvore MLM, sponsors)                         │
│  ├─ Tabela: trading_accounts (contas GMI Edge)                     │
│  ├─ Tabela: commissions (histórico de comissões)                   │
│  ├─ Tabela: payments (histórico de pagamentos)                     │
│  └─ Tabela: weekly_snapshots (cache dos snapshots)                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA 5: FRONTEND                           │
├─────────────────────────────────────────────────────────────────────┤
│  🌐 Next.js + RainbowKit                                            │
│  ├─ Dashboard: Visualizar comissões, rede, lucros                  │
│  ├─ Connect Wallet: Metamask, WalletConnect                        │
│  ├─ Registro: Conectar carteira + vincular GMI Edge                │
│  ├─ Network: Ver árvore MLM, indicados                             │
│  └─ Transparência: Ver proofs on-chain e snapshots IPFS            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO 1: CADASTRO DE NOVO USUÁRIO

```
1️⃣ USUÁRIO ACESSA FRONTEND
   │
   ├─→ Clica em "Conectar Carteira"
   │   └─→ RainbowKit conecta Metamask (ex: 0x789...)
   │
   ├─→ Preenche formulário:
   │   ├─ Nome completo
   │   ├─ Email
   │   ├─ ID da conta GMI Edge
   │   └─ Endereço carteira do sponsor (ex: 0xabc...)
   │
   └─→ Clica "Cadastrar"

2️⃣ FRONTEND → BACKEND
   │
   POST /api/users/register
   {
     "wallet": "0x789...",
     "name": "João Silva",
     "email": "joao@email.com",
     "gmiAccountId": "12345",
     "sponsorWallet": "0xabc..."
   }

3️⃣ BACKEND PROCESSA
   │
   ├─→ Valida sponsor existe no banco
   ├─→ Consulta GMI Edge API para validar conta
   ├─→ Insere no PostgreSQL:
   │   │
   │   ├─ Tabela: users
   │   │   INSERT INTO users (wallet, name, email, gmi_account_id, created_at)
   │   │   VALUES ('0x789...', 'João Silva', 'joao@email.com', '12345', NOW())
   │   │
   │   └─ Tabela: network
   │       INSERT INTO network (user_wallet, sponsor_wallet, level, position)
   │       VALUES ('0x789...', '0xabc...', 1, 'direct')
   │
   └─→ Retorna sucesso para frontend

4️⃣ FRONTEND EXIBE
   │
   └─→ "✅ Cadastro concluído! Você está na rede de [Sponsor Name]"
       └─→ Redireciona para Dashboard
```

---

## 🔄 FLUXO 2: CÁLCULO SEMANAL DE COMISSÕES

### DOMINGO 23:00 (CRON JOB)

```
1️⃣ BACKEND INICIA PROCESSO
   │
   └─→ Cron job: weekly-commission-calculator.js

2️⃣ BUSCAR LUCROS DA SEMANA
   │
   ├─→ Para cada usuário no banco:
   │   │
   │   └─→ GET https://api.gmiedge.com/accounts/{gmiAccountId}/weekly-profit
   │       Headers: { Authorization: Bearer ${GMI_API_KEY} }
   │
   └─→ Exemplo resposta GMI Edge:
       {
         "accountId": "12345",
         "weeklyProfit": 1000.00,  // USD
         "weekStart": "2025-11-01",
         "weekEnd": "2025-11-07"
       }

3️⃣ CALCULAR COMISSÕES MLM
   │
   └─→ Para cada usuário com lucro > 0:
       │
       ├─→ Cliente recebe: $1000 × 65% = $650
       │   └─→ Registra no banco: payments pendentes
       │
       ├─→ MLM recebe: $650 × 25% = $162.50
       │   │
       │   └─→ Buscar upline (até 10 níveis):
       │       │
       │       ├─ L1 (sponsor direto): 8% de $650 = $52.00
       │       ├─ L2 (sponsor do sponsor): 3% de $650 = $19.50
       │       ├─ L3: 2% de $650 = $13.00
       │       ├─ L4: 1% de $650 = $6.50
       │       ├─ L5: 1% de $650 = $6.50
       │       ├─ L6-L10: 2% cada (se qualificado) = $13.00 cada
       │       │
       │       └─→ Validações:
       │           ├─ Verificar se upline tem LAI ativa ($19/mês)
       │           ├─ Verificar qualificação L6-L10 (5 diretos + $5k volume)
       │           └─ Se não qualificado: valor vai para pool de liquidez
       │
       └─→ Registra no banco:
           INSERT INTO commissions (user_wallet, week, level, amount, status)
           VALUES ('0xabc...', 202445, 1, 52.00, 'pending')

4️⃣ CRIAR SNAPSHOT COMPLETO
   │
   └─→ Gera JSON com TODOS os dados da semana:
       {
         "week": 202445,
         "timestamp": "2025-11-07T23:00:00Z",
         "totalUsers": 1247,
         "totalProfits": 543210.50,
         "totalCommissions": 88078.66,
         "users": [
           {
             "wallet": "0x789...",
             "gmiAccountId": "12345",
             "profit": 1000.00,
             "clientShare": 650.00,
             "upline": [
               { "level": 1, "wallet": "0xabc...", "commission": 52.00 },
               { "level": 2, "wallet": "0xdef...", "commission": 19.50 }
               // ... até L10
             ]
           }
           // ... todos os 1247 usuários
         ],
         "distributionBreakdown": {
           "clients": 353084.83,
           "mlm": 88078.66,
           "company": 190047.68,
           "liquidityPool": 27196.33
         }
       }

5️⃣ UPLOAD PARA IPFS
   │
   ├─→ POST https://api.pinata.cloud/pinning/pinJSONToIPFS
   │   Headers: { Authorization: Bearer ${PINATA_API_KEY} }
   │   Body: { snapshot JSON acima }
   │
   └─→ Resposta:
       {
         "IpfsHash": "QmWeek202445Snapshot...",
         "PinSize": 524288
       }

6️⃣ REGISTRAR PROOF ON-CHAIN
   │
   └─→ Backend chama contrato:
       │
       const proof = new ethers.Contract(PROOF_ADDRESS, ProofABI, signer);

       const tx = await proof.submitWeeklyProof(
         202445,                              // week
         "QmWeek202445Snapshot...",          // ipfsHash
         1247,                                // totalUsers
         ethers.parseUnits("88078.66", 18), // totalCommissions (USDT)
         ethers.parseUnits("543210.50", 18) // totalProfits (USDT)
       );

       await tx.wait();

       └─→ Gas usado: ~0.001 BNB (~$0.30)

7️⃣ SALVAR NO BANCO
   │
   └─→ INSERT INTO weekly_snapshots (week, ipfs_hash, tx_hash, created_at)
       VALUES (202445, 'QmWeek...', '0xtx...', NOW())

8️⃣ NOTIFICAR USUÁRIOS (OPCIONAL)
   │
   └─→ Enviar emails/push notifications:
       "✅ Suas comissões da semana foram calculadas!
        💰 Você recebeu: $52.00
        📊 Ver detalhes: [link para dashboard]"
```

---

## 🔄 FLUXO 3: PAGAMENTO DE COMISSÕES

### SEGUNDA-FEIRA 00:00 (CRON JOB)

```
1️⃣ BACKEND INICIA PAGAMENTOS
   │
   └─→ Cron job: weekly-usdt-payments.js

2️⃣ BUSCAR COMISSÕES PENDENTES
   │
   SELECT user_wallet, SUM(amount) as total
   FROM commissions
   WHERE week = 202445 AND status = 'pending'
   GROUP BY user_wallet
   HAVING SUM(amount) >= 10.00  -- Mínimo $10 para pagar
   ORDER BY user_wallet

3️⃣ PREPARAR BATCH PAYMENT
   │
   └─→ Agrupar em lotes de 100 usuários:

       const batch1 = [
         { wallet: "0x789...", amount: ethers.parseUnits("52.00", 18) },
         { wallet: "0xabc...", amount: ethers.parseUnits("125.50", 18) },
         // ... até 100 usuários
       ];

4️⃣ EXECUTAR BATCH USDT TRANSFER
   │
   └─→ Aprovar USDT para o contrato (se necessário):
       │
       const usdt = new ethers.Contract(USDT_ADDRESS, UsdtABI, signer);
       const totalAmount = ethers.parseUnits("12500.00", 18); // Soma do batch

       await usdt.approve(PAYMENT_PROCESSOR_ADDRESS, totalAmount);

   └─→ Batch transfer:
       │
       // Opção A: Loop manual (mais simples)
       for (const payment of batch1) {
         const tx = await usdt.transfer(payment.wallet, payment.amount);
         await tx.wait();

         // Registrar no banco
         UPDATE commissions
         SET status = 'paid', paid_at = NOW(), tx_hash = '0x...'
         WHERE user_wallet = payment.wallet AND week = 202445
       }

       // Opção B: Smart contract batch processor (mais eficiente)
       const batchProcessor = new ethers.Contract(BATCH_ADDRESS, BatchABI, signer);

       await batchProcessor.batchTransferUSDT(
         batch1.map(p => p.wallet),
         batch1.map(p => p.amount)
       );

       └─→ Gas economizado: 97% vs transfers individuais

5️⃣ FINALIZAR SEMANA ON-CHAIN
   │
   └─→ const proof = new ethers.Contract(PROOF_ADDRESS, ProofABI, signer);
       await proof.finalizeWeek(202445);

       └─→ Proof fica IMUTÁVEL (não pode mais ser alterada)

6️⃣ ATUALIZAR BANCO
   │
   └─→ UPDATE commissions
       SET status = 'paid'
       WHERE week = 202445 AND status = 'pending'

7️⃣ NOTIFICAR USUÁRIOS
   │
   └─→ "💰 Pagamento recebido!
        Valor: $52.00 USDT
        TX: 0x... [link BSCScan]"
```

---

## 🔄 FLUXO 4: VISUALIZAR COMISSÕES (FRONTEND)

```
1️⃣ USUÁRIO ACESSA DASHBOARD
   │
   └─→ Frontend: /dashboard

2️⃣ FRONTEND → BACKEND
   │
   GET /api/users/0x789.../commissions?weeks=last_4

3️⃣ BACKEND → DATABASE
   │
   SELECT
     c.week,
     c.level,
     c.amount,
     c.status,
     c.paid_at,
     u.name as referred_user
   FROM commissions c
   LEFT JOIN users u ON c.from_user_wallet = u.wallet
   WHERE c.user_wallet = '0x789...'
   ORDER BY c.week DESC, c.level ASC
   LIMIT 40

4️⃣ BACKEND → BLOCKCHAIN (VERIFICAÇÃO)
   │
   └─→ Para cada semana retornada:
       │
       const proof = new ethers.Contract(PROOF_ADDRESS, ProofABI, provider);
       const weeklyProof = await proof.getWeeklyProof(202445);

       └─→ Retorna:
           {
             ipfsHash: "QmWeek202445...",
             totalUsers: 1247,
             totalCommissions: "88078660000000000000000",
             finalized: true,
             timestamp: 1730934000
           }

5️⃣ BACKEND → IPFS (DETALHES)
   │
   └─→ Buscar snapshot completo (opcional, para auditoria):
       │
       GET https://gateway.pinata.cloud/ipfs/QmWeek202445...

       └─→ Retorna JSON completo com todos os usuários e cálculos

6️⃣ BACKEND RETORNA PARA FRONTEND
   │
   {
     "weeks": [
       {
         "week": 202445,
         "commissions": [
           {
             "level": 1,
             "amount": 52.00,
             "from": "João Silva",
             "status": "paid",
             "paidAt": "2025-11-08T00:30:00Z"
           },
           {
             "level": 2,
             "amount": 19.50,
             "from": "Maria Santos",
             "status": "paid",
             "paidAt": "2025-11-08T00:30:00Z"
           }
         ],
         "total": 71.50,
         "onChainProof": {
           "verified": true,
           "finalized": true,
           "txHash": "0x...",
           "ipfsHash": "QmWeek..."
         }
       }
       // ... últimas 4 semanas
     ],
     "summary": {
       "totalEarned": 1250.75,
       "thisWeek": 71.50,
       "networkSize": 47,
       "directReferrals": 5
     }
   }

7️⃣ FRONTEND RENDERIZA
   │
   └─→ Dashboard exibe:
       ├─ Card: "💰 Esta semana: $71.50"
       ├─ Card: "📊 Total ganho: $1,250.75"
       ├─ Card: "👥 Rede: 47 pessoas"
       ├─ Tabela: Comissões detalhadas por semana/nível
       └─ Botão: "🔍 Ver proof on-chain" → Link para BSCScan
```

---

## 🔄 FLUXO 5: AUDITORIA/TRANSPARÊNCIA

```
1️⃣ USUÁRIO QUER AUDITAR COMISSÕES
   │
   └─→ Acessa: /transparency

2️⃣ FRONTEND BUSCA PROOFS ON-CHAIN
   │
   └─→ const proof = new ethers.Contract(PROOF_ADDRESS, ProofABI, provider);
       const allWeeks = await proof.getAllWeeks();

       └─→ Retorna array: [202401, 202402, ..., 202445]

3️⃣ PARA CADA SEMANA
   │
   ├─→ const weekData = await proof.getWeeklyProof(week);
   │
   ├─→ Buscar IPFS:
   │   GET https://gateway.pinata.cloud/ipfs/{weekData.ipfsHash}
   │
   └─→ Exibir:
       ├─ Total de usuários
       ├─ Total de lucros
       ├─ Total de comissões
       ├─ Link para BSCScan (verificar TX)
       ├─ Link para IPFS (ver snapshot completo)
       └─ Status: Finalizada ou Pendente

4️⃣ VERIFICAÇÃO DE INTEGRIDADE
   │
   └─→ const rulebook = await proof.rulebook();
       const rulebookData = await rulebook.getPlanInfo();

       └─→ Compara percentuais no IPFS snapshot com Rulebook:
           ✅ L1: 8% (match)
           ✅ L2: 3% (match)
           ✅ Content Hash válido
           ✅ Plano não alterado
```

---

## 📊 SCHEMA DO BANCO DE DADOS

```sql
-- ==========================================
-- TABELA: users
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  gmi_account_id VARCHAR(50) UNIQUE NOT NULL,
  lai_status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending
  lai_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet);
CREATE INDEX idx_users_gmi ON users(gmi_account_id);

-- ==========================================
-- TABELA: network (árvore MLM)
-- ==========================================
CREATE TABLE network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(42) NOT NULL REFERENCES users(wallet),
  sponsor_wallet VARCHAR(42) REFERENCES users(wallet),
  level INTEGER NOT NULL, -- 1 a 10
  path LTREE, -- Caminho na árvore (ex: '0xabc.0xdef.0x789')
  direct_referrals INTEGER DEFAULT 0,
  total_network_size INTEGER DEFAULT 0,
  total_volume DECIMAL(20, 2) DEFAULT 0,
  qualified_l6_l10 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_network_user ON network(user_wallet);
CREATE INDEX idx_network_sponsor ON network(sponsor_wallet);
CREATE INDEX idx_network_path ON network USING GIST(path);

-- ==========================================
-- TABELA: trading_accounts
-- ==========================================
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(42) NOT NULL REFERENCES users(wallet),
  gmi_account_id VARCHAR(50) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'real', -- real, demo
  balance DECIMAL(20, 2) DEFAULT 0,
  last_sync TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- TABELA: commissions
-- ==========================================
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(42) NOT NULL REFERENCES users(wallet),
  from_user_wallet VARCHAR(42) NOT NULL REFERENCES users(wallet),
  week INTEGER NOT NULL, -- Semana (ex: 202445)
  level INTEGER NOT NULL, -- 1 a 10
  amount DECIMAL(20, 2) NOT NULL,
  client_profit DECIMAL(20, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP,
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commissions_user ON commissions(user_wallet);
CREATE INDEX idx_commissions_week ON commissions(week);
CREATE INDEX idx_commissions_status ON commissions(status);

-- ==========================================
-- TABELA: payments
-- ==========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(42) NOT NULL REFERENCES users(wallet),
  payment_type VARCHAR(20) NOT NULL, -- commission, profit_share
  amount DECIMAL(20, 2) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  block_number INTEGER,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- TABELA: weekly_snapshots
-- ==========================================
CREATE TABLE weekly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week INTEGER UNIQUE NOT NULL,
  ipfs_hash VARCHAR(100) NOT NULL,
  total_users INTEGER NOT NULL,
  total_profits DECIMAL(20, 2) NOT NULL,
  total_commissions DECIMAL(20, 2) NOT NULL,
  tx_hash VARCHAR(66),
  finalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_snapshots_week ON weekly_snapshots(week);

-- ==========================================
-- TABELA: lai_payments (Licença mensal)
-- ==========================================
CREATE TABLE lai_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet VARCHAR(42) NOT NULL REFERENCES users(wallet),
  amount DECIMAL(10, 2) DEFAULT 19.00,
  month VARCHAR(7) NOT NULL, -- '2025-11'
  tx_hash VARCHAR(66),
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lai_user ON lai_payments(user_wallet);
CREATE INDEX idx_lai_month ON lai_payments(month);
```

---

## 🎯 RESUMO DOS CUSTOS

```
┌─────────────────────────────────────────────────────────────┐
│  CUSTOS OPERACIONAIS (BSC Mainnet)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  DEPLOY (UMA VEZ):                                           │
│  ├─ Rulebook deploy: ~$1.00                                 │
│  ├─ Proof deploy: ~$1.00                                    │
│  └─ Total: $2.00                                            │
│                                                               │
│  OPERAÇÃO SEMANAL:                                           │
│  ├─ Submit proof: ~$0.30                                    │
│  ├─ Finalize week: ~$0.15                                   │
│  └─ Total/semana: $0.45                                     │
│                                                               │
│  PAGAMENTOS (200 usuários):                                  │
│  ├─ Individual: $0.10 × 200 = $20.00                        │
│  ├─ Batch (100/tx): $1.50 × 2 = $3.00 ✅                    │
│  └─ Economia: 85% (batch vs individual)                     │
│                                                               │
│  TOTAL ANUAL (200 usuários):                                 │
│  ├─ Deploy: $2.00 (one-time)                                │
│  ├─ Proofs: $0.45 × 52 = $23.40                            │
│  ├─ Payments: $3.00 × 52 = $156.00                         │
│  └─ TOTAL: ~$181.40/ano (~$0.90/user/ano)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA E BACKUPS

```
BANCO DE DADOS:
├─ Backup diário automatizado
├─ Retenção: 30 dias
└─ Restore point: < 5 minutos

BLOCKCHAIN:
├─ Dados imutáveis (não precisa backup)
├─ Replicado em todos os nodes da BSC
└─ Histórico completo sempre disponível

IPFS:
├─ Pinned em Pinata (permanente)
├─ Backup adicional em gateway local
└─ Verificação de integridade via content hash

CHAVES PRIVADAS:
├─ Armazenadas em AWS Secrets Manager
├─ Backup offline em hardware wallet
└─ Acesso restrito (MFA obrigatório)
```

---

## 🚀 ESCALABILIDADE

```
ATUAL (até 1,000 usuários):
├─ Servidor: 2 vCPUs, 4GB RAM
├─ Database: PostgreSQL (standalone)
├─ Response time: < 200ms
└─ Custo mensal: ~$50

CRESCIMENTO (1,000 - 10,000 usuários):
├─ Servidor: 4 vCPUs, 8GB RAM
├─ Database: PostgreSQL (replica read)
├─ Cache: Redis
├─ Response time: < 300ms
└─ Custo mensal: ~$200

GRANDE ESCALA (10,000+ usuários):
├─ Servidores: Load balancer + 3 instances
├─ Database: PostgreSQL (master + 2 replicas)
├─ Cache: Redis Cluster
├─ CDN: CloudFlare para frontend
├─ Response time: < 400ms
└─ Custo mensal: ~$500-1000
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

```
FASE 1: SMART CONTRACTS ✅
[✅] Criar iDeepXRulebookImmutable.sol
[✅] Criar iDeepXProofFinal.sol
[✅] Testes de segurança
[✅] Deploy testnet
[⏳] Deploy mainnet (após testes E2E)

FASE 2: BACKEND
[⏳] Setup Node.js + Express
[⏳] Integração GMI Edge API
[⏳] Cálculo de comissões MLM
[⏳] Upload IPFS (Pinata SDK)
[⏳] Submit proofs on-chain
[⏳] Batch USDT payments
[⏳] Cron jobs (domingo/segunda)

FASE 3: DATABASE
[⏳] Setup PostgreSQL
[⏳] Criar schema completo
[⏳] Migrations e seeds
[⏳] Backup automático

FASE 4: FRONTEND
[⏳] Adaptar dashboard existente
[⏳] Integração RainbowKit
[⏳] Páginas de transparência
[⏳] Visualização de proofs

FASE 5: TESTES E2E
[⏳] Teste completo em testnet
[⏳] Teste com 10+ usuários reais
[⏳] Validar cálculos MLM
[⏳] Teste de pagamentos

FASE 6: PRODUÇÃO
[⏳] Deploy mainnet
[⏳] Monitoramento
[⏳] Documentação para usuários
[⏳] Suporte
```

---

Próximo passo: Implementar o backend! 🚀
