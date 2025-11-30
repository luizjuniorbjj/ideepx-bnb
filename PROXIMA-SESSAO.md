# 🚀 PRÓXIMA SESSÃO - DIAS 2-3: BACKEND ESSENCIAL

**Objetivo:** Desenvolver módulos backend para interagir com contratos PROOF + Rulebook

---

## 📋 CHECKLIST DE RETOMADA

Quando iniciar a próxima sessão, execute:

### 1. Ler Contexto Completo
```
✅ Ler: C:\ideepx-bnb\PROJECT_CONTEXT.md
✅ Ler: C:\ideepx-bnb\CONTEXT_PROOF_SYSTEM.md
✅ Ler: C:\ideepx-bnb\SESSAO-10-RESUMO.md (este resumo)
```

### 2. Verificar Sistema
```bash
# Confirmar que tudo ainda está funcionando
node scripts/query-proof-direct.js
```

### 3. Verificar Contratos
```
Rulebook: 0x7A09383b65c07dc525bA0aF1b63DBe14a375aa2B
ProofFinal: 0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa
Proof Week 1: QmcqWceCcqSpAWgvT3FWvzCs9d2noBxMenyGu7SfmYdgtk
```

---

## 🎯 TAREFAS - DIAS 2-3

### Backend Modules

#### 1. `backend/src/blockchain/proof.js`
```javascript
// Interação com iDeepXProofFinal
// Funções:
//   - submitWeeklyProof(week, ipfsHash, users, commissions, profits)
//   - finalizeWeek(week)
//   - getWeeklyProof(week)
//   - getAllProofs()
//   - hasProof(week)
```

#### 2. `backend/src/blockchain/rulebook.js`
```javascript
// Interação com iDeepXRulebookImmutable
// Funções:
//   - getIPFSCid()
//   - getContentHash()
//   - getPlanInfo()
//   - verifyContentHash(hash)
```

#### 3. `backend/src/services/ipfs.js`
```javascript
// Integração Pinata
// Funções:
//   - uploadSnapshot(data)
//   - getSnapshot(ipfsHash)
//   - pinFile(file)
//   - listPinnedFiles()
```

#### 4. `backend/src/services/gmi-edge.js`
```javascript
// API GMI Edge (mock para testes)
// Funções:
//   - getProfits(startDate, endDate)
//   - getAccountProfit(accountId, week)
//   - getAllAccountsProfits(week)
```

#### 5. `backend/src/services/mlm-calculator.js`
```javascript
// Cálculo de comissões MLM
// Funções:
//   - calculateWeekCommissions(users, profits)
//   - calculateUserCommissions(user, downline)
//   - applyQualifications(user)
//   - calculateLAI(users)
```

### REST API Endpoints

#### 6. `backend/src/routes/proofs.js`
```javascript
// GET  /api/proofs - Lista todos os proofs
// GET  /api/proofs/:week - Proof específico
// POST /api/proofs - Submit novo proof (admin)
// PUT  /api/proofs/:week/finalize - Finalizar proof (admin)
```

#### 7. `backend/src/routes/rulebook.js`
```javascript
// GET /api/rulebook - Info do plano
// GET /api/rulebook/verify - Verificar hash
```

#### 8. `backend/src/routes/snapshots.js`
```javascript
// GET /api/snapshots/:week - Buscar snapshot do IPFS
// GET /api/snapshots/:week/download - Download JSON
```

---

## 🗂️ ESTRUTURA BACKEND SUGERIDA

```
backend/
├── src/
│   ├── blockchain/
│   │   ├── proof.js          ← ProofFinal contract
│   │   ├── rulebook.js       ← Rulebook contract
│   │   └── config.js         ← Endereços, ABIs
│   │
│   ├── services/
│   │   ├── ipfs.js           ← Pinata integration
│   │   ├── gmi-edge.js       ← GMI Edge API (mock)
│   │   └── mlm-calculator.js ← Cálculos MLM
│   │
│   ├── routes/
│   │   ├── proofs.js         ← /api/proofs
│   │   ├── rulebook.js       ← /api/rulebook
│   │   └── snapshots.js      ← /api/snapshots
│   │
│   ├── middleware/
│   │   ├── auth.js           ← Admin authentication
│   │   └── error.js          ← Error handling
│   │
│   ├── utils/
│   │   ├── logger.js         ← Logging
│   │   └── validators.js     ← Input validation
│   │
│   ├── app.js                ← Express app
│   └── server.js             ← Server entry point
│
├── tests/
│   ├── proof.test.js
│   ├── ipfs.test.js
│   └── mlm-calculator.test.js
│
├── package.json
└── .env                      ← Já configurado
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS

```bash
# Express
npm install express cors dotenv

# Blockchain
npm install ethers

# IPFS (já instalado)
# form-data node-fetch

# Logging
npm install winston

# Testing
npm install --save-dev jest supertest
```

---

## 🔐 CREDENCIAIS DISPONÍVEIS

**Já Configuradas no .env:**
```env
# Admin/Owner
PRIVATE_KEY=8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03
ADMIN_ADDRESS=0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

# Contratos
RULEBOOK_ADDRESS=0x7A09383b65c07dc525bA0aF1b63DBe14a375aa2B
PROOF_CONTRACT_ADDRESS=0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa

# IPFS
PINATA_API_KEY=a842e53ffa531af008f2
PINATA_SECRET_KEY=3d70df06dcc8636cc38e5edb619c7f365bc0c35ec3ccfa3d0b3eda4558c30fa8

# RPC
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

---

## 🧪 TESTES A IMPLEMENTAR

### Testes Unitários:
```javascript
// test/proof.test.js
- submitWeeklyProof()
- finalizeWeek()
- getWeeklyProof()

// test/ipfs.test.js
- uploadSnapshot()
- getSnapshot()

// test/mlm-calculator.test.js
- calculateWeekCommissions()
- applyQualifications()
```

### Testes de Integração:
```javascript
// test/integration/workflow.test.js
1. Calcular comissões
2. Gerar snapshot
3. Upload IPFS
4. Submit proof
5. Finalizar proof
6. Buscar do IPFS
```

---

## 📊 EXEMPLO DE ENDPOINT

```javascript
// GET /api/proofs/:week
router.get('/:week', async (req, res) => {
  try {
    const { week } = req.params;

    // 1. Buscar proof on-chain
    const proof = await proofService.getWeeklyProof(week);

    // 2. Buscar snapshot do IPFS
    const snapshot = await ipfsService.getSnapshot(proof.ipfsHash);

    // 3. Retornar dados completos
    res.json({
      proof,
      snapshot,
      links: {
        ipfs: `https://gateway.pinata.cloud/ipfs/${proof.ipfsHash}`,
        bscscan: `https://testnet.bscscan.com/address/${PROOF_ADDRESS}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## ✅ CRITÉRIOS DE SUCESSO

Ao final dos Dias 2-3, você deve ter:

- ✅ Backend Express rodando em `http://localhost:5000`
- ✅ Todos os endpoints funcionais
- ✅ Integração com ProofFinal funcionando
- ✅ Integração com Pinata funcionando
- ✅ Testes unitários passando
- ✅ Documentação básica de API
- ✅ Poder fazer ciclo completo via API:
  ```bash
  # 1. Gerar snapshot (mock)
  POST /api/admin/generate-snapshot

  # 2. Submit proof
  POST /api/proofs

  # 3. Finalizar
  PUT /api/proofs/:week/finalize

  # 4. Buscar
  GET /api/proofs/:week
  ```

---

## 📝 REFERÊNCIAS IMPORTANTES

**Scripts Existentes (usar como base):**
```
scripts/upload-snapshot-to-ipfs.js  ← Exemplo de upload Pinata
scripts/submit-proof.js             ← Exemplo de interação contrato
scripts/query-proof-direct.js       ← Exemplo de consulta contrato
```

**Documentação:**
```
PROJECT_CONTEXT.md          ← Contexto completo do projeto
CONTEXT_PROOF_SYSTEM.md     ← Referência do sistema PROOF
test-snapshot-week-1.json   ← Estrutura do snapshot
```

**Links Úteis:**
```
Ethers.js: https://docs.ethers.org/v6/
Express: https://expressjs.com/
Pinata: https://docs.pinata.cloud/
```

---

**🚀 PRONTO PARA COMEÇAR OS DIAS 2-3!**

_Todo o sistema está validado, scripts estão prontos, credenciais configuradas._
_Agora é hora de criar o backend que vai automatizar tudo isso!_
