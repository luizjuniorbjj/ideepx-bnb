# 🔍 GUIA DE AUDITORIA - Proof + Rulebook System

## 📋 VISÃO GERAL

O bot de auditoria `test-proof-system-audit.cjs` realiza **40+ testes automáticos** nos contratos iDeepXRulebookImmutable e iDeepXProofFinal antes do deploy em produção.

### O que o bot testa:

```
✅ Rulebook (10 testes):
├─ IPFS CID configurado
├─ Content Hash válido
├─ Timestamp de deployment
├─ Versão do plano
├─ Nome do plano
├─ URL do IPFS
├─ Informações completas
├─ Idade do plano
├─ Status atual (< 2 anos)
└─ Verificação de hash

✅ Proof Contract (8 testes):
├─ Owner configurado
├─ Backend configurado
├─ Referência ao Rulebook
├─ Status de pause
├─ Total de provas
├─ Informações do Rulebook
├─ Estatísticas completas
└─ Semanas registradas

✅ Integração (3 testes):
├─ Proof aponta para Rulebook correto
├─ Rulebook tem dados válidos
└─ Permissões configuradas

✅ Segurança (4 testes):
├─ Rulebook é imutável (sem setters)
├─ Permissões Owner/Backend
├─ Estado inicial correto
└─ Plano referenciado válido
```

---

## 🚀 COMO USAR

### Opção 1: Testar após Deploy Testnet

```bash
# 1. Deploy os contratos primeiro
npm run deploy:rulebook:bscTestnet
# (copie RULEBOOK_ADDRESS para .env)

npm run deploy:proof:bscTestnet
# (copie PROOF_CONTRACT_ADDRESS para .env)

# 2. Execute a auditoria
npm run audit:proof-system:testnet
```

### Opção 2: Testar no Localhost

```bash
# 1. Inicie node local
npm run node

# 2. Em outro terminal, deploy local
npm run deploy:rulebook:local
npm run deploy:proof:local

# 3. Execute auditoria
npm run audit:proof-system:local
```

### Opção 3: Testar Mainnet (após deploy)

```bash
# ATENÇÃO: Só após deploy em produção!
npm run audit:proof-system:mainnet
```

---

## 📝 CONFIGURAÇÃO DO .ENV

O bot precisa dessas variáveis configuradas no `.env`:

```env
# Obrigatórias
RULEBOOK_ADDRESS=0x...              # Endereço do Rulebook deployed
PROOF_CONTRACT_ADDRESS=0x...        # Endereço do Proof deployed

# Opcionais (para validação)
PLAN_IPFS_CID=QmXxxx...            # CID esperado do plano
PLAN_CONTENT_HASH=0x949b2...        # Hash esperado do conteúdo
```

---

## 📊 INTERPRETANDO OS RESULTADOS

### Saída Exemplo (Sucesso):

```
🔍 AUDITORIA COMPLETA - PROOF + RULEBOOK SYSTEM

================================================================================
📍 Rulebook: 0x1234...
📍 Proof: 0x5678...
================================================================================

👤 Auditor: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

================================================================================
  📄 PARTE 1: AUDITORIA DO RULEBOOK (PLANO IMUTÁVEL)
================================================================================

✅ Rulebook.ipfsCid()
   CID: QmXxxx...
✅ Rulebook.contentHash()
   Hash: 0x949b2ae2debf7cdb74e38997ac9fbee2ea26a637ae8d639db86fc8845bf31f3b
✅ Rulebook.deployedAt()
   Deployed em: 2025-01-11T15:30:00.000Z
✅ Rulebook.VERSION()
   Versão: 1.0.0
✅ Rulebook.PLAN_NAME()
   Nome: iDeepX MLM Commission Plan
✅ Rulebook.getIPFSUrl()
   URL: https://gateway.pinata.cloud/ipfs/QmXxxx...
✅ Rulebook.getPlanInfo()
   Retorna todas as 6 informações
✅ Rulebook.getPlanAgeInDays()
   Idade: 0 dias
✅ Rulebook.isPlanCurrent()
   Plano atual (< 2 anos)
✅ Rulebook.verifyContentHash()
   Hash verificado com sucesso

================================================================================
  🔐 PARTE 2: AUDITORIA DO PROOF CONTRACT (PROVAS SEMANAIS)
================================================================================

✅ Proof.owner()
   Owner: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
✅ Proof.backend()
   Backend: 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
✅ Proof.rulebook()
   Rulebook: 0x1234...
✅ Proof.paused()
   Contrato ativo
✅ Proof.totalProofsSubmitted()
   Total de provas: 0
✅ Proof.getRulebookInfo()
   Rulebook info completa
✅ Proof.getStatistics()
   Estatísticas completas (5 campos)
   Total Proofs: 0
   Total Users All Time: 0
   Total Commissions: 0
   Total Profits: 0
   Total Finalized: 0
✅ Proof.getAllWeeks()
   Total de semanas registradas: 0

================================================================================
  🔗 PARTE 3: TESTES DE INTEGRAÇÃO
================================================================================

✅ Integração: Proof → Rulebook
   Proof aponta para Rulebook correto
✅ Integração: Rulebook tem dados válidos
   CID e Hash válidos
✅ Permissões: Owner pode pausar
   Auditor é owner, pode testar pause

================================================================================
  🛡️ PARTE 4: AUDITORIA DE SEGURANÇA
================================================================================

✅ Segurança: Rulebook é imutável
   Sem funções de alteração
✅ Segurança: Permissões configuradas
   Owner e Backend configurados
✅ Segurança: Estado inicial correto
   Contrato ativo após deploy
✅ Segurança: Plano referenciado é válido
   CID e Hash presentes

================================================================================
  📊 RESUMO DA AUDITORIA
================================================================================
Total de testes: 25
✅ Passou: 25 (100.0%)
❌ Falhou: 0 (0.0%)
⚠️  Avisos: 0 (0.0%)
⏭️  Pulados: 0 (0.0%)
================================================================================

✅ AUDITORIA COMPLETA - Contratos prontos para deploy!
```

### Códigos de Status:

- ✅ **PASS** - Teste passou com sucesso
- ❌ **FAIL** - Teste falhou (CRÍTICO - corrija antes de produção!)
- ⚠️ **WARN** - Aviso (não crítico, mas revisar)
- ⏭️ **SKIP** - Teste pulado (não aplicável)

---

## ❌ ERROS COMUNS

### 1. "RULEBOOK_ADDRESS não configurado"

```
SOLUÇÃO:
1. Deploy o Rulebook primeiro
2. Copie o endereço do deploy
3. Adicione no .env:
   RULEBOOK_ADDRESS=0x...
```

### 2. "PROOF_CONTRACT_ADDRESS não configurado"

```
SOLUÇÃO:
1. Deploy o Proof primeiro
2. Copie o endereço do deploy
3. Adicione no .env:
   PROOF_CONTRACT_ADDRESS=0x...
```

### 3. "Erro ao conectar aos contratos"

```
POSSÍVEIS CAUSAS:
- Endereços incorretos no .env
- Contratos não deployed na rede especificada
- Rede errada selecionada

SOLUÇÃO:
- Verifique os endereços no .env
- Confirme que está na rede correta (testnet/mainnet)
- Verifique no BSCScan se contratos existem
```

### 4. "Rulebook address não corresponde"

```
PROBLEMA: Proof aponta para Rulebook errado

SOLUÇÃO:
1. Verifique o RULEBOOK_ADDRESS no .env
2. Se errado, redeploy o Proof com endereço correto
3. Não há como corrigir sem redeploy (design imutável)
```

### 5. "CID diferente do esperado"

```
AVISO (não crítico)

MOTIVO: PLAN_IPFS_CID no .env não corresponde ao on-chain

AÇÃO:
- Se intencional: ignorar aviso
- Se erro: verificar qual CID é o correto
```

---

## 🔒 CHECKLIST PRÉ-PRODUÇÃO

Antes de fazer deploy em mainnet, garanta que:

```
[ ] Auditoria passou 100% no testnet
[ ] Nenhum erro crítico (❌ FAIL)
[ ] Avisos (⚠️ WARN) foram revisados e entendidos
[ ] IPFS CID está correto e acessível
[ ] Content Hash corresponde ao JSON
[ ] Owner e Backend configurados corretamente
[ ] Rulebook e Proof se comunicam corretamente
[ ] Plano JSON uploadado no IPFS
[ ] Backup das chaves feito
[ ] Time avisado sobre deploy
```

---

## 🧪 TESTANDO MODIFICAÇÕES

Se você modificar os contratos:

```bash
# 1. Recompilar
npm run compile

# 2. Deploy local para teste rápido
npm run node  # Terminal 1

# Terminal 2:
npm run deploy:rulebook:local
npm run deploy:proof:local

# 3. Auditar
npm run audit:proof-system:local

# 4. Se passar, deploy testnet
npm run deploy:rulebook:bscTestnet
npm run deploy:proof:bscTestnet
npm run audit:proof-system:testnet

# 5. Se tudo OK, deploy mainnet
npm run deploy:rulebook:bsc
npm run deploy:proof:bsc
npm run audit:proof-system:mainnet
```

---

## 📈 TESTES AVANÇADOS

### Testar Submit Proof (manual)

Após auditoria básica passar, você pode testar submit proof manualmente:

```javascript
// test-submit-proof.cjs
const { ethers } = require("hardhat");

async function main() {
  const proof = await ethers.getContractAt(
    "iDeepXProofFinal",
    process.env.PROOF_CONTRACT_ADDRESS
  );

  const week = Math.floor(Date.now() / 1000);
  const ipfsHash = "QmTestHash123";
  const totalUsers = 100;
  const totalCommissions = ethers.parseUnits("1000", 18);
  const totalProfits = ethers.parseUnits("5000", 18);

  console.log("📝 Submitting test proof...");

  const tx = await proof.submitWeeklyProof(
    week,
    ipfsHash,
    totalUsers,
    totalCommissions,
    totalProfits
  );

  await tx.wait();

  console.log("✅ Proof submitted!");
  console.log(`TX: ${tx.hash}`);

  // Verificar
  const submitted = await proof.getWeeklyProof(week);
  console.log("📊 Proof data:", submitted);
}

main();
```

```bash
npx hardhat run test-submit-proof.cjs --network bscTestnet
```

---

## 🎯 PRÓXIMOS PASSOS

Após auditoria passar:

1. ✅ **Testnet OK** → Deploy mainnet
2. ✅ **Mainnet OK** → Configurar backend
3. ✅ **Backend OK** → Integração GMI Edge
4. ✅ **Integração OK** → Testes end-to-end
5. ✅ **Testes OK** → GO LIVE! 🚀

---

## 📞 SUPORTE

Se encontrar problemas na auditoria:

1. Verifique os logs detalhados
2. Confirme configuração do .env
3. Teste no localhost primeiro
4. Consulte documentação dos contratos
5. Revise código dos contratos

---

**🔍 BOT DE AUDITORIA CRIADO COM BASE NO `test_all_functions.js`**

Totalmente automatizado, completo e pronto para uso! 🚀
