# 🚀 ROADMAP LANÇAMENTO DEZEMBRO - MODO URGENTE

## ⏰ PRAZO: 21 DIAS (3 SEMANAS) + 7 DIAS BUFFER

**Data início:** Hoje
**Data lançamento:** ~15 Dezembro 2024
**Status:** 🔴 URGENTE - MÁXIMA PRIORIDADE

---

## 🎯 ESTRATÉGIA: PARALELO + MVP + ESSENCIAL ONLY

```
PRINCÍPIOS:
✅ Trabalhar em PARALELO sempre que possível
✅ MVP first - features extras depois
✅ Testar cedo e frequentemente
✅ Eliminar tudo que não é CRÍTICO
```

---

## 📅 SEMANA 1 (7 DIAS) - FUNDAÇÃO

### 🔴 DIA 1 (HOJE - AGORA!) - DEPLOY TESTNET

**TAREFA ÚNICA: Deploy completo no testnet para começar a testar**

```bash
# PASSO 1: Upload plano para IPFS (30 min)
1. Acesse: https://app.pinata.cloud
2. Login/Criar conta (free tier)
3. Upload: commission-plan-v1.json
4. Copiar CID: QmXxxx...

# PASSO 2: Configurar .env (15 min)
PLAN_IPFS_CID=QmXxxx...  # Colar CID do passo 1
PLAN_CONTENT_HASH=0x949b2ae2debf7cdb74e38997ac9fbee2ea26a637ae8d639db86fc8845bf31f3b

# PASSO 3: Pegar tBNB (15 min)
https://testnet.bnbchain.org/faucet-smart
Cole: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

# PASSO 4: Deploy Rulebook (5 min)
npm run deploy:rulebook:bscTestnet
# Copiar endereço → .env: RULEBOOK_ADDRESS=0x...

# PASSO 5: Deploy Proof (5 min)
npm run deploy:proof:bscTestnet
# Copiar endereço → .env: PROOF_CONTRACT_ADDRESS=0x...

# PASSO 6: Auditar (10 min)
npm run audit:proof-system:testnet
```

**RESULTADO DIA 1:** ✅ Contratos LIVE no testnet

---

### 🟡 DIA 2-3 (2 DIAS) - BACKEND ESSENCIAL

**FOCO: Apenas o MÍNIMO para funcionar**

#### **DIA 2 - Integração Contratos (8h)**

```javascript
// 1. Criar backend/src/blockchain/proof.js
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const proofContract = new ethers.Contract(
  process.env.PROOF_CONTRACT_ADDRESS,
  require('../../abis/iDeepXProofFinal.json'),
  wallet
);

export const rulebookContract = new ethers.Contract(
  process.env.RULEBOOK_ADDRESS,
  require('../../abis/iDeepXRulebookImmutable.json'),
  provider // Read-only
);

// 2. Testar conexão
console.log('Rulebook CID:', await rulebookContract.ipfsCid());
console.log('Proof address:', proofContract.address);
```

#### **DIA 3 - Endpoints API Básicos (8h)**

```javascript
// backend/src/routes/proof.js (NOVO)

// GET /api/proofs - Lista todas as semanas
router.get('/proofs', async (req, res) => {
  const weeks = await proofContract.getAllWeeks();
  res.json(weeks);
});

// GET /api/proofs/:week - Detalhes de uma semana
router.get('/proofs/:week', async (req, res) => {
  const proof = await proofContract.getWeeklyProof(req.params.week);
  res.json(proof);
});

// GET /api/rulebook - Info do plano
router.get('/rulebook', async (req, res) => {
  const info = await rulebookContract.getPlanInfo();
  res.json(info);
});
```

**RESULTADO DIA 2-3:** ✅ Backend lê blockchain

---

### 🟢 DIA 4-5 (2 DIAS) - FRONTEND ESSENCIAL

**FOCO: Dashboard + Transparency (só visualização)**

#### **DIA 4 - Hooks + Dashboard (8h)**

```typescript
// frontend/lib/hooks/useProofContract.ts (NOVO)
import { useContractRead } from 'wagmi';

export const useWeeklyProofs = () => {
  return useContractRead({
    address: process.env.NEXT_PUBLIC_PROOF_ADDRESS,
    abi: ProofABI,
    functionName: 'getAllWeeks'
  });
};

export const useWeeklyProof = (week: number) => {
  return useContractRead({
    address: process.env.NEXT_PUBLIC_PROOF_ADDRESS,
    abi: ProofABI,
    functionName: 'getWeeklyProof',
    args: [week]
  });
};

// Adaptar dashboard para usar novos hooks
```

#### **DIA 5 - Página Transparency (8h)**

```typescript
// frontend/app/transparency/page.tsx (NOVA)
'use client'

export default function TransparencyPage() {
  const { data: weeks } = useWeeklyProofs();
  const { data: rulebook } = useRulebookInfo();

  return (
    <div className="container">
      <h1>🔍 Transparência Total</h1>

      {/* Rulebook Card */}
      <div className="card">
        <h2>📄 Plano de Comissões</h2>
        <p>CID: {rulebook?.ipfsCid}</p>
        <a href={`https://ipfs.io/ipfs/${rulebook?.ipfsCid}`}>
          Ver Plano Completo →
        </a>
      </div>

      {/* Weekly Proofs List */}
      <div>
        {weeks?.map(w => <WeekProofCard key={w} week={w} />)}
      </div>
    </div>
  );
}
```

**RESULTADO DIA 4-5:** ✅ Frontend mostra dados blockchain

---

### 🔵 DIA 6-7 (2 DIAS) - TESTES INTEGRADOS

#### **DIA 6 - Teste Manual Completo (8h)**

```
1. Registrar 3 usuários testnet
2. Ativar assinaturas
3. Verificar dashboard
4. Verificar página transparency
5. Testar todos os links
6. Mobile responsive
7. Documentar bugs encontrados
```

#### **DIA 7 - Correção de Bugs (8h)**

```
1. Corrigir todos os bugs críticos
2. Ajustes de UX
3. Loading states
4. Error handling
5. Toast notifications
6. Polish geral
```

**RESULTADO SEMANA 1:**
✅ Contratos testnet LIVE
✅ Backend lendo blockchain
✅ Frontend mostrando dados
✅ Sistema funcionando end-to-end (READ-ONLY)

---

## 📅 SEMANA 2 (7 DIAS) - AUTOMAÇÃO

### 🔴 DIA 8-10 (3 DIAS) - JOBS AUTOMATIZADOS

**CRÍTICO: Sistema precisa rodar sozinho**

#### **DIA 8 - IPFS Service (8h)**

```javascript
// backend/src/services/ipfs.js
import axios from 'axios';

export const pinataUpload = async (jsonData) => {
  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    jsonData,
    {
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.IpfsHash;
};

// Testar upload
const testData = { week: 202449, test: true };
const hash = await pinataUpload(testData);
console.log('Uploaded:', hash);
```

#### **DIA 9 - Job de Cálculo (8h)**

```javascript
// backend/src/jobs/weeklyCalculation.js
import cron from 'node-cron';
import { calculateCommissions } from '../mlm/calculator.js';
import { pinataUpload } from '../services/ipfs.js';
import { proofContract } from '../blockchain/proof.js';

// Domingo 23:00
cron.schedule('0 23 * * 0', async () => {
  console.log('🔄 Calculando comissões semanais...');

  // 1. Buscar lucros GMI Edge (mock por enquanto)
  const profits = await fetchProfits(); // Usar mock ou GMI real

  // 2. Calcular comissões
  const commissions = await calculateCommissions(profits);

  // 3. Criar snapshot
  const snapshot = {
    week: getCurrentWeek(),
    timestamp: Date.now(),
    totalUsers: commissions.length,
    users: commissions
  };

  // 4. Upload IPFS
  const ipfsHash = await pinataUpload(snapshot);
  console.log(`✅ Snapshot: ${ipfsHash}`);

  // 5. Submit proof
  const tx = await proofContract.submitWeeklyProof(
    snapshot.week,
    ipfsHash,
    snapshot.totalUsers,
    ethers.parseUnits(String(snapshot.totalCommissions), 18),
    ethers.parseUnits(String(snapshot.totalProfits), 18)
  );

  await tx.wait();
  console.log(`✅ Proof on-chain: ${tx.hash}`);
});
```

#### **DIA 10 - Job de Pagamento (8h)**

```javascript
// backend/src/jobs/weeklyPayment.js
import cron from 'node-cron';
import { proofContract } from '../blockchain/proof.js';
import { batchPayUSDT } from '../services/payments.js';

// Segunda 00:00
cron.schedule('0 0 * * 1', async () => {
  console.log('💰 Pagando comissões...');

  // 1. Buscar pendentes no DB
  const pending = await prisma.commission.findMany({
    where: { status: 'pending', week: getCurrentWeek() }
  });

  // 2. Batch payments (100 por vez)
  for (let i = 0; i < pending.length; i += 100) {
    const batch = pending.slice(i, i + 100);
    await batchPayUSDT(batch);
  }

  // 3. Finalizar semana
  await proofContract.finalizeWeek(getCurrentWeek());
  console.log(`✅ Semana finalizada`);
});
```

**RESULTADO DIA 8-10:** ✅ Sistema roda automaticamente

---

### 🟡 DIA 11-12 (2 DIAS) - INTEGRAÇÃO GMI EDGE

**CRÍTICO: Buscar lucros reais**

```javascript
// backend/src/services/gmiEdge.js
import axios from 'axios';

export const fetchWeeklyProfits = async () => {
  // Se GMI Edge API não estiver pronta, usar mock
  if (!process.env.GMI_API_KEY) {
    console.warn('⚠️ Usando mock data - GMI Edge não configurado');
    return mockProfits();
  }

  const response = await axios.get(
    `${process.env.GMI_API_URL}/accounts/profits`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.GMI_API_KEY}`
      },
      params: {
        startDate: getWeekStart(),
        endDate: getWeekEnd()
      }
    }
  );

  return response.data;
};

// Mock para desenvolvimento
const mockProfits = () => {
  return [
    { accountId: '12345', profit: 1000 },
    { accountId: '67890', profit: 2500 }
  ];
};
```

**RESULTADO DIA 11-12:** ✅ Busca lucros GMI Edge (ou mock)

---

### 🟢 DIA 13-14 (2 DIAS) - TESTES AUTOMATIZADOS

#### **DIA 13 - Simular Ciclo Completo (8h)**

```bash
# 1. Rodar job de cálculo MANUALMENTE
node backend/src/jobs/weeklyCalculation.js

# 2. Verificar:
- Snapshot no IPFS? ✅
- Proof on-chain? ✅
- Database updated? ✅

# 3. Rodar job de pagamento MANUALMENTE
node backend/src/jobs/weeklyPayment.js

# 4. Verificar:
- Pagamentos executados? ✅
- Semana finalizada? ✅
- Frontend mostra novos dados? ✅
```

#### **DIA 14 - Testes de Stress (8h)**

```
1. Registrar 50 usuários testnet
2. Simular lucros para todos
3. Rodar cálculo
4. Verificar performance
5. Rodar pagamento
6. Medir custos gas
7. Documentar resultados
```

**RESULTADO SEMANA 2:**
✅ Sistema 100% automatizado
✅ GMI Edge integrado (ou mock funcionando)
✅ Testado com 50+ usuários
✅ Pronto para produção

---

## 📅 SEMANA 3 (7 DIAS) - PRODUÇÃO

### 🔴 DIA 15-16 (2 DIAS) - DEPLOY MAINNET

#### **DIA 15 - Preparação (8h)**

```bash
# 1. Comprar BNB real (~$10)
# Enviar para: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

# 2. Verificar .env produção
BSC_RPC_URL=https://bsc-dataseed1.binance.org
CHAIN_ID=56
PRIVATE_KEY=0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03

# 3. Backup de tudo
- Database dump
- Chaves privadas (offline)
- Código fonte (git tag v1.0.0)

# 4. Documentação final
- README atualizado
- DEPLOYMENT-GUIDE completo
- Runbook operacional
```

#### **DIA 16 - Deploy Mainnet (8h)**

```bash
# 1. Upload plano IPFS (mainnet)
# Usar MESMA conta Pinata
# Pin permanente

# 2. Deploy Rulebook Mainnet
npm run deploy:rulebook:bsc

# 3. Deploy Proof Mainnet
npm run deploy:proof:bsc

# 4. Auditar Mainnet
npm run audit:proof-system:mainnet

# 5. Verificar BSCScan
https://bscscan.com/address/0x...

# 6. Configurar backend/frontend para mainnet
NEXT_PUBLIC_PROOF_ADDRESS=0x...
NEXT_PUBLIC_RULEBOOK_ADDRESS=0x...
```

**RESULTADO DIA 15-16:** ✅ MAINNET LIVE

---

### 🟡 DIA 17-18 (2 DIAS) - VALIDAÇÃO PRODUÇÃO

#### **DIA 17 - Testes Produção (8h)**

```
1. Você registra como primeiro usuário (Pioneer)
2. Registrar 5 usuários reais de confiança
3. Todos ativam assinatura ($19 real)
4. Vincular contas GMI Edge reais
5. Aguardar primeira semana de trading
6. Verificar dashboard
7. Verificar transparency
8. Coletar feedback
```

#### **DIA 18 - Ajustes Finais (8h)**

```
1. Corrigir bugs críticos encontrados
2. Ajustes de UX baseado em feedback
3. Otimizar performance
4. Melhorar mensagens de erro
5. Adicionar tooltips explicativos
6. Polish UI final
```

**RESULTADO DIA 17-18:** ✅ Sistema validado em produção

---

### 🟢 DIA 19-21 (3 DIAS) - ONBOARDING + LANÇAMENTO

#### **DIA 19 - Documentação Usuário (8h)**

```
Criar guias simples:
1. Como se registrar
2. Como ativar assinatura
3. Como vincular GMI Edge
4. Como convidar pessoas
5. Como visualizar comissões
6. Como sacar
7. FAQ completo
8. Vídeo tutorial (5 min)
```

#### **DIA 20 - Soft Launch (8h)**

```
1. Anunciar para primeiros 20 usuários
2. Grupo Telegram/WhatsApp para suporte
3. Onboarding individual
4. Coletar feedback
5. Resolver dúvidas
6. Ajustes rápidos
```

#### **DIA 21 - GO LIVE PÚBLICO (8h)**

```
1. Anúncio oficial
2. Landing page atualizada
3. Materiais de marketing prontos
4. Suporte 24/7 ativo
5. Monitoramento intensivo
6. Celebração! 🎉
```

**RESULTADO SEMANA 3:** 🚀 LANÇAMENTO COMPLETO

---

## 📅 SEMANA 4 (7 DIAS) - BUFFER + STABILIZAÇÃO

### **BUFFER para imprevistos**

```
DIA 22-28: Reserva para:
- Bugs críticos não previstos
- Ajustes de última hora
- Problemas de integração
- Feedback usuários
- Otimizações urgentes
```

---

## 🎯 PRIORIDADES ABSOLUTAS (NÃO NEGOCIÁVEIS)

```
1. ✅ Contratos no testnet (DIA 1)
2. ✅ Backend lendo blockchain (DIA 2-3)
3. ✅ Frontend mostrando dados (DIA 4-5)
4. ✅ Jobs automatizados (DIA 8-10)
5. ✅ Deploy mainnet (DIA 15-16)
6. ✅ Go live (DIA 21)
```

---

## 🚫 O QUE DEIXAR PARA DEPOIS (PÓS-LANÇAMENTO)

```
❌ Features avançadas dashboard
❌ Gráficos complexos
❌ Relatórios PDF
❌ Multi-idiomas
❌ App mobile nativo
❌ Integrações extras
❌ Admin panel completo
❌ Analytics avançado

Tudo isso pode vir em v1.1, v1.2, etc
```

---

## 📊 CHECKLIST DIÁRIO

### **TODO MANHÃ (9h):**
```
[ ] Revisar pendências do dia anterior
[ ] Definir 3 tarefas principais do dia
[ ] Comunicar com time (se houver)
[ ] Verificar se contratos testnet estão UP
```

### **TODO FIM DO DIA (18h):**
```
[ ] Commit código do dia
[ ] Atualizar status no tracking
[ ] Documentar decisões importantes
[ ] Preparar tasks para amanhã
[ ] Backup se mudou coisas críticas
```

---

## 🚨 RISCOS E MITIGAÇÕES

### **RISCO ALTO:**

**1. GMI Edge API não responde**
- Mitigação: Mock data funcionando
- Fallback: Input manual de lucros

**2. Bug crítico em produção**
- Mitigação: Pause() no contrato
- Fallback: Rollback e hotfix

**3. Gas price muito alto**
- Mitigação: Wait até < 5 gwei
- Fallback: Adiar proof 1-2 horas

**4. Frontend crash**
- Mitigação: Error boundaries
- Fallback: Página de manutenção

---

## 📞 COMUNICAÇÃO

### **Diária com stakeholders:**
```
Formato: "Status Update - DIA X"

✅ Concluído hoje:
- [tarefa 1]
- [tarefa 2]

🔄 Em progresso:
- [tarefa 3]

⏭️ Próximas 24h:
- [tarefa 4]
- [tarefa 5]

🚨 Bloqueios:
- [nenhum / listar]
```

---

## 🎯 MÉTRICAS DE SUCESSO

### **SEMANA 1:**
```
✅ Contratos testnet deployed e auditados
✅ Backend conectado ao blockchain
✅ Frontend mostrando dados corretamente
✅ 0 bugs críticos
```

### **SEMANA 2:**
```
✅ Jobs automatizados rodando
✅ Ciclo completo testado (domingo→segunda)
✅ 50+ usuários testnet registrados
✅ Custos gas < $1/semana (testnet)
```

### **SEMANA 3:**
```
✅ Mainnet deployed
✅ 20+ usuários reais onboarded
✅ Primeiro ciclo de pagamento executado
✅ 0 bugs críticos em produção
```

---

## 🎉 MARCO: DEZEMBRO 2024

```
📅 ~15 Dezembro: Sistema LIVE em produção
🎯 100+ usuários primeiros 15 dias
💰 Primeira distribuição de comissões
📈 Crescimento orgânico iniciado
🚀 V1.1 em planejamento
```

---

## 🏁 COMEÇAR AGORA!

**PRÓXIMA AÇÃO IMEDIATA (HOJE):**

```bash
# TAREFA 1: Upload JSON para IPFS (30 min)
https://app.pinata.cloud
Upload: commission-plan-v1.json
Copiar CID

# TAREFA 2: Pegar tBNB (15 min)
https://testnet.bnbchain.org/faucet-smart

# TAREFA 3: Deploy Testnet (15 min)
npm run deploy:rulebook:bscTestnet
npm run deploy:proof:bscTestnet
npm run audit:proof-system:testnet

HOJE VOCÊ SAI COM CONTRATOS LIVE! 🚀
```

---

**TEMPO É CURTO! VAMOS COMEÇAR! 💪**
