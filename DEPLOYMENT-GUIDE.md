# 🚀 GUIA DE DEPLOY - iDeepX Proof + Rulebook

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Deploy Testnet](#deploy-testnet)
6. [Deploy Mainnet](#deploy-mainnet)
7. [Verificação](#verificação)
8. [Próximos Passos](#próximos-passos)

---

## 🎯 VISÃO GERAL

### Arquitetura Híbrida

```
┌──────────────────────────────────────────────────────┐
│  BLOCKCHAIN (BSC)                                     │
│  ├─ iDeepXRulebookImmutable.sol                      │
│  │  └─ Armazena plano de comissões (imutável)       │
│  └─ iDeepXProofFinal.sol                             │
│     └─ Registra provas semanais                      │
└──────────────────────────────────────────────────────┘
                        ↕
┌──────────────────────────────────────────────────────┐
│  IPFS (Pinata)                                        │
│  ├─ commission-plan-v1.json (plano completo)         │
│  └─ weekly-snapshot-YYYY-MM-DD.json (provas)         │
└──────────────────────────────────────────────────────┘
                        ↕
┌──────────────────────────────────────────────────────┐
│  BACKEND (Off-chain)                                  │
│  ├─ Integração GMI Edge API                          │
│  ├─ Cálculo de comissões                             │
│  ├─ Gestão de LAI ($19/mês)                          │
│  ├─ Upload para IPFS                                 │
│  ├─ Submit proofs on-chain                           │
│  └─ Batch USDT payments                              │
└──────────────────────────────────────────────────────┘
```

### Modelo de Negócios

```
Cliente gera $100 de lucro líquido:
├─ Cliente recebe: $65.00 (65%)
├─ Empresa recebe: $35.00 (35% performance fee)
└─ MLM total: $16.25 (25% dos $65 do cliente)

Distribuição MLM (10 níveis):
├─ L1: $5.20 (8%)   ← Sponsor direto
├─ L2: $1.95 (3%)
├─ L3: $1.30 (2%)
├─ L4: $0.65 (1%)
├─ L5: $0.65 (1%)
├─ L6-L10: $1.30 cada (2% cada) ← Requer qualificação

Cliente líquido final: $48.75 ($65 - $16.25)
```

---

## 📦 PRÉ-REQUISITOS

### Software Necessário

```bash
✅ Node.js v18+ instalado
✅ Git instalado
✅ Wallet com BNB (testnet ou mainnet)
✅ Conta Pinata (https://pinata.cloud) - Free tier OK
```

### Conhecimento Recomendado

- Básico de Solidity
- Hardhat framework
- BSC (Binance Smart Chain)
- IPFS/Pinata
- Git/GitHub

---

## 🛠️ INSTALAÇÃO

### 1. Clone e Instale Dependências

```bash
cd C:\ideepx-bnb
npm install
```

### 2. Compile os Contratos

```bash
npm run compile
```

Saída esperada:
```
✅ Compiled 3 Solidity files successfully
```

---

## ⚙️ CONFIGURAÇÃO

### 1. Calcular Content Hash do Plano

```bash
npm run calculate:hash
```

Saída:
```
🔐 CONTENT HASH:
   0x949b2ae2debf7cdb74e38997ac9fbee2ea26a637ae8d639db86fc8845bf31f3b
```

**IMPORTANTE:** Anote este hash!

### 2. Upload do Plano para IPFS

#### Via Pinata Web (Recomendado):

1. Acesse: https://app.pinata.cloud/pinmanager
2. Clique em "Upload"
3. Selecione o arquivo: `commission-plan-v1.json`
4. Clique em "Upload"
5. Copie o CID (ex: `QmXxxx...`)

#### Via API Pinata:

```bash
curl -X POST "https://api.pinata.cloud/pinning/pinJSONToIPFS" \
  -H "pinata_api_key: YOUR_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d @commission-plan-v1.json
```

### 3. Configurar .env

Crie arquivo `.env` na raiz do projeto:

```env
# ============================================
# CARTEIRA E REDE
# ============================================

# Private key da wallet deployer (SEM 0x no início)
PRIVATE_KEY=sua_private_key_aqui

# Endereço do backend (pode ser igual ao deployer inicialmente)
BACKEND_ADDRESS=0x_seu_endereco_backend

# ============================================
# RULEBOOK CONFIGURATION
# ============================================

# IPFS CID do plano (obtido no passo 2)
PLAN_IPFS_CID=QmXxxx...

# Content hash (obtido no passo 1)
PLAN_CONTENT_HASH=0x949b2ae2debf7cdb74e38997ac9fbee2ea26a637ae8d639db86fc8845bf31f3b

# Endereço do Rulebook (será preenchido após primeiro deploy)
RULEBOOK_ADDRESS=0x0000000000000000000000000000000000000000

# ============================================
# BSC SCAN API (para verificação)
# ============================================

# Obter em: https://bscscan.com/myapikey
BSCSCAN_API_KEY=sua_api_key_aqui

# ============================================
# RPC URLs (opcional, já tem defaults)
# ============================================

BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

### 4. Adicionar BSC no MetaMask

#### BSC Testnet:
```
Network Name: BNB Smart Chain Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Currency Symbol: tBNB
Block Explorer: https://testnet.bscscan.com
```

#### BSC Mainnet:
```
Network Name: BNB Smart Chain
RPC URL: https://bsc-dataseed1.binance.org
Chain ID: 56
Currency Symbol: BNB
Block Explorer: https://bscscan.com
```

**Ou use ChainList:**
- Testnet: https://chainlist.org/chain/97
- Mainnet: https://chainlist.org/chain/56

---

## 🧪 DEPLOY TESTNET

### 1. Conseguir BNB Testnet

#### Faucet Oficial (Recomendado):
```
🔗 https://testnet.bnbchain.org/faucet-smart

1. Conecte wallet ou cole endereço
2. Verifique via Twitter ou GitHub
3. Complete CAPTCHA
4. Receba 0.1-0.5 tBNB
5. Limite: 1x por 24h
```

#### Discord BNB Chain:
```
1. Entre: https://discord.gg/bnbchain
2. Canal: #testnet-faucet
3. Digite: /faucet seu_endereco
4. Aguarde ~10-30 min
5. Receba ~0.5 tBNB
```

### 2. Deploy Rulebook (Testnet)

```bash
npm run deploy:rulebook:bscTestnet
```

Saída esperada:
```
🚀 Starting deployment of iDeepXRulebookImmutable...

📡 Network: bscTestnet (chainId: 97)
👤 Deployer: 0x...
💰 Balance: 0.5 BNB

📄 Plan Configuration:
   IPFS CID: QmXxxx...
   Content Hash: 0x949b2...

📝 Deploying iDeepXRulebookImmutable...
✅ Rulebook deployed to: 0x1234...

⏳ Waiting for confirmations...
✅ Contract confirmed!

🔍 Verifying contract state:
   IPFS CID: QmXxxx...
   Content Hash: 0x949b2...
   Deployed At: 2025-01-11T...
   IPFS URL: https://gateway.pinata.cloud/ipfs/QmXxxx...

💾 Deployment info saved to: deployments/rulebook-bscTestnet-xxx.json

================================================================================
✅ RULEBOOK DEPLOYMENT SUCCESSFUL!
================================================================================
Contract Address: 0x1234...
IPFS CID: QmXxxx...
Network: bscTestnet
Explorer: https://testnet.bscscan.com/address/0x1234...
================================================================================

⚠️  IMPORTANT: Save this Rulebook address!
   You'll need it to deploy the Proof contract.

   Set in .env: RULEBOOK_ADDRESS=0x1234...
```

### 3. Atualizar .env com Rulebook Address

Edite `.env` e adicione:
```env
RULEBOOK_ADDRESS=0x1234... # endereço obtido no passo 2
```

### 4. Deploy Proof Contract (Testnet)

```bash
npm run deploy:proof:bscTestnet
```

Saída esperada:
```
🚀 Starting deployment of iDeepXProofFinal...

📡 Network: bscTestnet (chainId: 97)
👤 Deployer: 0x...
💰 Balance: 0.45 BNB

🔧 Configuration:
   Backend Address: 0x...
   Rulebook Address: 0x1234...

🔍 Verifying Rulebook contract...
✅ Rulebook contract verified

📝 Deploying iDeepXProofFinal...
✅ Proof contract deployed to: 0x5678...

⏳ Waiting for confirmations...
✅ Contract confirmed!

🔍 Verifying contract state:
   Owner: 0x...
   Backend: 0x...
   Rulebook: 0x1234...
   Paused: false
   Total Proofs: 0

📄 Rulebook Information:
   Plan IPFS CID: QmXxxx...
   Plan Hash: 0x949b2...

💾 Deployment info saved to: deployments/proof-bscTestnet-xxx.json

================================================================================
✅ PROOF CONTRACT DEPLOYMENT SUCCESSFUL!
================================================================================
Proof Contract: 0x5678...
Rulebook Contract: 0x1234...
Owner: 0x...
Backend: 0x...
Network: bscTestnet
Explorer: https://testnet.bscscan.com/address/0x5678...
================================================================================

📋 NEXT STEPS:
1. Save these addresses in your backend
2. Update frontend with contract addresses
3. Test submitWeeklyProof() function
4. Configure IPFS integration
5. Start weekly automation
```

### 5. Verificar no BSCScan Testnet

```
https://testnet.bscscan.com/address/0x1234... (Rulebook)
https://testnet.bscscan.com/address/0x5678... (Proof)
```

---

## 🚀 DEPLOY MAINNET

### ⚠️ CHECKLIST PRÉ-MAINNET

```
[ ] Testado 100% no testnet
[ ] Wallet tem BNB suficiente (~$10)
[ ] .env configurado corretamente
[ ] Backend address correto
[ ] Plano JSON no IPFS com contentHash verificado
[ ] Backup da private key em lugar seguro
[ ] BSCScan API key configurada
[ ] Time avisado sobre deploy
```

### 1. Deploy Rulebook (Mainnet)

```bash
npm run deploy:rulebook:bsc
```

**Custo estimado:** ~$0.60 (deploy único)

### 2. Atualizar .env

```env
RULEBOOK_ADDRESS=0x_novo_endereco_mainnet
```

### 3. Deploy Proof (Mainnet)

```bash
npm run deploy:proof:bsc
```

**Custo estimado:** ~$1.35 (deploy único)

### 4. Salvar Endereços

**CRÍTICO:** Salve estes endereços em local seguro:
- Rulebook Contract: `0x...`
- Proof Contract: `0x...`
- Plan IPFS CID: `QmXxxx...`
- Content Hash: `0x949b2...`

---

## 🔍 VERIFICAÇÃO

### Verificar Contratos no BSCScan

#### Automático (durante deploy):
Os scripts tentam verificar automaticamente.

#### Manual (se automático falhar):

```bash
# Rulebook
npx hardhat verify --network bsc 0x_RULEBOOK_ADDRESS "QmXxxx..." "0x949b2..."

# Proof
npx hardhat verify --network bsc 0x_PROOF_ADDRESS 0x_BACKEND_ADDRESS 0x_RULEBOOK_ADDRESS
```

### Testar Funções Básicas

```javascript
// scripts/test-proof.cjs
const { ethers } = require("hardhat");

async function main() {
    const proof = await ethers.getContractAt(
        "iDeepXProofFinal",
        "0x_PROOF_ADDRESS"
    );

    // Verificar info do Rulebook
    const info = await proof.getRulebookInfo();
    console.log("Rulebook Address:", info.rulebookAddress);
    console.log("Plan CID:", info.ipfsCid);
    console.log("Content Hash:", info.contentHash);

    // Verificar estatísticas
    const stats = await proof.getStatistics();
    console.log("Total Proofs:", stats.totalProofs.toString());
}

main();
```

---

## 📊 CUSTOS OPERACIONAIS

### Deploy (Uma Vez):

```
BSC MAINNET:
├─ Rulebook: ~$0.60
├─ Proof: ~$1.35
└─ TOTAL DEPLOY: ~$2.00 ✅

BSC TESTNET:
└─ GRÁTIS (tBNB do faucet)
```

### Operação Semanal:

```
submitWeeklyProof():
├─ ~200k gas × 3 gwei = 0.0006 BNB
└─ ~$0.36/semana

finalizeWeek():
├─ ~50k gas × 3 gwei = 0.00015 BNB
└─ ~$0.09/semana

TOTAL SEMANAL: ~$0.45
TOTAL ANUAL: 52 × $0.45 = ~$23.40 ✅
```

### Pagamentos USDT (Batch):

```
BATCH (100 usuários por TX):
├─ 500k gas × 3 gwei = 0.0015 BNB
├─ 2 batches para 200 users = 0.003 BNB
└─ ~$1.80/semana = $93.60/ano ✅

TOTAL ANO 1 (200 users):
├─ Deploy: $2.00
├─ Operação: $23.40
├─ Pagamentos USDT: $93.60
└─ TOTAL: $119.00 (~$0.60/user/ano) 🎯
```

### IPFS (Pinata):

```
FREE TIER:
├─ 1 GB storage
├─ Unlimited pinning
└─ $0/ano ✅

PRO TIER ($20/mês = $240/ano):
├─ 100 GB storage
├─ Dedicatemd gateway
└─ Análises avançadas
```

**Custo total estimado (200 usuários):**
- Com IPFS Free: **$119/ano** ($0.60/user/ano)
- Com IPFS Pro: **$359/ano** ($1.80/user/ano)

**Com escala (1.000 usuários):**
- **$491/ano** ($0.49/user/ano)

---

## 📋 PRÓXIMOS PASSOS

### 1. Backend Integration (Semanas 2-4)

#### Cálculo de Comissões:

```javascript
// backend/services/mlm-calculator.js

class MLMCalculator {
  calculateCommissions(clientProfit, userLevel, hasAdvancedQualification) {
    const CLIENT_SHARE = 0.65; // Cliente recebe 65%
    const clientAmount = clientProfit * CLIENT_SHARE;

    const PERCENTAGES = {
      1: 0.08,  // 8%
      2: 0.03,  // 3%
      3: 0.02,  // 2%
      4: 0.01,  // 1%
      5: 0.01,  // 1%
      6: 0.02,  // 2% (requer qualificação)
      7: 0.02,
      8: 0.02,
      9: 0.02,
      10: 0.02
    };

    // L6-L10 requerem qualificação avançada
    if (userLevel >= 6 && !hasAdvancedQualification) {
      return 0;
    }

    const commission = clientAmount * PERCENTAGES[userLevel];
    return commission;
  }
}
```

#### GMI Edge API Integration:

```javascript
// backend/services/gmi-api.js

class GMIEdgeAPI {
  async fetchWeeklyProfits() {
    // Buscar lucros da semana via API
    const profits = await this.api.get('/weekly-profits');

    // Processar dados
    const processedData = profits.map(profit => ({
      userId: profit.user_id,
      grossProfit: profit.gross_profit,
      netProfit: profit.net_profit,
      fees: profit.fees,
      timestamp: profit.timestamp
    }));

    return processedData;
  }
}
```

#### Upload para IPFS:

```javascript
// backend/services/ipfs-service.js

const pinataSDK = require('@pinata/sdk');

class IPFSService {
  constructor() {
    this.pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_SECRET_KEY
    );
  }

  async uploadWeeklySnapshot(data) {
    const snapshot = {
      week: data.week,
      users: data.users,
      totalCommissions: data.totalCommissions,
      totalProfits: data.totalProfits,
      timestamp: Date.now()
    };

    const result = await this.pinata.pinJSONToIPFS(snapshot, {
      pinataMetadata: {
        name: `iDeepX-Weekly-${data.week}`,
      },
    });

    return result.IpfsHash; // QmXxxx...
  }
}
```

#### Submit Proof On-Chain:

```javascript
// backend/services/blockchain-service.js

const { ethers } = require('ethers');

class BlockchainService {
  async submitWeeklyProof(weekTimestamp, ipfsHash, totals) {
    const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
    const signer = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);

    const proof = new ethers.Contract(
      process.env.PROOF_CONTRACT_ADDRESS,
      ProofABI,
      signer
    );

    const tx = await proof.submitWeeklyProof(
      weekTimestamp,
      ipfsHash,
      totals.totalUsers,
      totals.totalCommissions,
      totals.totalProfits
    );

    await tx.wait();
    console.log('✅ Proof submitted on-chain:', tx.hash);
  }
}
```

#### Batch USDT Payments:

```javascript
// backend/services/usdt-payment.js

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet

class USDTPaymentService {
  async batchPayCommissions(payments) {
    const BATCH_SIZE = 100;
    const batches = this.chunkArray(payments, BATCH_SIZE);

    for (const batch of batches) {
      await this.processBatch(batch);
    }
  }

  async processBatch(batch) {
    const usdt = new ethers.Contract(USDT_ADDRESS, USDTABI, signer);

    for (const payment of batch) {
      const amount = ethers.parseUnits(payment.amount.toString(), 18);
      const tx = await usdt.transfer(payment.address, amount);
      await tx.wait();

      console.log(`✅ Paid ${payment.amount} USDT to ${payment.address}`);
    }
  }
}
```

#### Cron Jobs (Automação):

```javascript
// backend/cron/weekly-automation.js

const cron = require('node-cron');

// Todo domingo às 23:00 UTC - Calcular comissões
cron.schedule('0 23 * * 0', async () => {
  console.log('🔄 Starting weekly commission calculation...');

  // 1. Buscar lucros da GMI Edge
  const profits = await gmiAPI.fetchWeeklyProfits();

  // 2. Calcular comissões MLM
  const commissions = await mlmCalculator.calculateAll(profits);

  // 3. Upload snapshot para IPFS
  const ipfsHash = await ipfs.uploadWeeklySnapshot({
    week: getCurrentWeekTimestamp(),
    users: commissions.users,
    totalCommissions: commissions.total,
    totalProfits: profits.total
  });

  // 4. Submit proof on-chain
  await blockchain.submitWeeklyProof(
    getCurrentWeekTimestamp(),
    ipfsHash,
    commissions.totals
  );

  console.log('✅ Weekly calculation complete!');
});

// Toda segunda às 00:00 UTC - Pagar comissões
cron.schedule('0 0 * * 1', async () => {
  console.log('💰 Starting weekly payments...');

  // 1. Buscar comissões da semana anterior
  const commissions = await db.getUnpaidCommissions();

  // 2. Batch payment via USDT
  await usdt.batchPayCommissions(commissions);

  // 3. Finalizar semana on-chain
  await blockchain.finalizeWeek(getLastWeekTimestamp());

  console.log('✅ Weekly payments complete!');
});
```

### 2. Frontend Adaptations (Semana 5)

#### Dashboard de Comissões:

```typescript
// frontend/components/MLMDashboard.tsx

export function MLMDashboard() {
  const { address } = useAccount();
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    async function loadEarnings() {
      const response = await fetch(`/api/mlm/earnings/${address}`);
      const data = await response.json();
      setEarnings(data);
    }

    loadEarnings();
  }, [address]);

  return (
    <div className="dashboard">
      <h2>Meus Ganhos MLM</h2>

      <div className="stats">
        <Stat label="Total Ganho" value={earnings?.total} />
        <Stat label="Esta Semana" value={earnings?.thisWeek} />
        <Stat label="Diretos Ativos" value={earnings?.directsCount} />
      </div>

      <LevelsBreakdown levels={earnings?.byLevel} />

      <NetworkTree userId={address} />
    </div>
  );
}
```

#### Visualização de Provas IPFS:

```typescript
// frontend/components/ProofViewer.tsx

export function ProofViewer({ weekTimestamp }: { weekTimestamp: number }) {
  const { data: proof } = useContractRead({
    address: PROOF_CONTRACT_ADDRESS,
    abi: ProofABI,
    functionName: 'getWeeklyProof',
    args: [weekTimestamp]
  });

  return (
    <div className="proof">
      <h3>Prova da Semana {formatWeek(weekTimestamp)}</h3>

      <div className="details">
        <p>Total Usuários: {proof?.totalUsers}</p>
        <p>Total Comissões: ${formatUSD(proof?.totalCommissions)}</p>
        <p>Finalizada: {proof?.finalized ? '✅' : '⏳'}</p>
      </div>

      <a
        href={`https://gateway.pinata.cloud/ipfs/${proof?.ipfsHash}`}
        target="_blank"
        className="view-ipfs"
      >
        📄 Ver Dados Completos no IPFS
      </a>
    </div>
  );
}
```

### 3. Database Schema

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  sponsor_address VARCHAR(42),
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  lai_expires_at TIMESTAMP,
  lai_active BOOLEAN DEFAULT false
);

-- commissions table
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  week_timestamp BIGINT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  from_user_id INTEGER REFERENCES users(id),
  level INTEGER NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  profit_source DECIMAL(20, 8) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW()
);

-- weekly_snapshots table
CREATE TABLE weekly_snapshots (
  id SERIAL PRIMARY KEY,
  week_timestamp BIGINT UNIQUE NOT NULL,
  ipfs_hash VARCHAR(100) NOT NULL,
  total_users INTEGER NOT NULL,
  total_commissions DECIMAL(20, 8) NOT NULL,
  total_profits DECIMAL(20, 8) NOT NULL,
  blockchain_tx_hash VARCHAR(66),
  finalized BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- lai_payments table
CREATE TABLE lai_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) DEFAULT 19.00,
  payment_date TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  tx_hash VARCHAR(66)
);
```

---

## 🆘 TROUBLESHOOTING

### Erro: "insufficient funds"
```
SOLUÇÃO:
1. Verificar saldo BNB
2. Testnet: pegar mais no faucet
3. Mainnet: comprar BNB
```

### Erro: "RULEBOOK_ADDRESS not set"
```
SOLUÇÃO:
1. Deploy Rulebook primeiro
2. Copiar endereço
3. Adicionar no .env:
   RULEBOOK_ADDRESS=0x...
```

### Erro: "nonce too high"
```
SOLUÇÃO:
npm run clean
npx hardhat compile
```

### Faucet não funciona
```
SOLUÇÕES:
1. Tentar em horário diferente
2. Usar Discord oficial: https://discord.gg/bnbchain
3. Canal #testnet-faucet
4. Comando: /faucet seu_endereco
```

---

## 📞 SUPORTE E LINKS ÚTEIS

### Documentação:
- BSC Docs: https://docs.bnbchain.org
- Hardhat: https://hardhat.org
- OpenZeppelin: https://docs.openzeppelin.com
- Pinata: https://docs.pinata.cloud

### Explorers:
- Testnet: https://testnet.bscscan.com
- Mainnet: https://bscscan.com

### Faucets:
- Oficial: https://testnet.bnbchain.org/faucet-smart
- Discord: https://discord.gg/bnbchain

### Networks:
- ChainList Testnet: https://chainlist.org/chain/97
- ChainList Mainnet: https://chainlist.org/chain/56

---

## ✅ RESUMO FINAL

```
✅ CONTRATOS CRIADOS:
├─ iDeepXRulebookImmutable.sol (plano imutável)
├─ iDeepXProofFinal.sol (provas semanais)
└─ commission-plan-v1.json (plano completo)

✅ SCRIPTS CRIADOS:
├─ calculate-plan-hash.cjs (calcula hash do plano)
├─ deploy-rulebook.cjs (deploy do Rulebook)
└─ deploy-proof.cjs (deploy do Proof)

✅ NPM SCRIPTS ADICIONADOS:
├─ npm run calculate:hash
├─ npm run deploy:rulebook:bscTestnet
├─ npm run deploy:rulebook:bsc
├─ npm run deploy:proof:bscTestnet
└─ npm run deploy:proof:bsc

✅ CUSTOS OPERACIONAIS:
├─ Deploy: ~$2 (uma vez)
├─ Operação: ~$23/ano
├─ Pagamentos: ~$94/ano (200 users)
└─ Total: ~$119/ano (~$0.60/user)

✅ PRÓXIMOS PASSOS:
├─ Backend: 2-4 semanas
├─ Frontend: 1 semana
└─ Testes completos: 1 semana

TOTAL ESTIMADO: 4-6 semanas
```

---

**Boa sorte com o deploy! 🚀**

Se precisar de ajuda, consulte:
- Este guia completo
- Documentação oficial do BSC
- Issues no GitHub do projeto
