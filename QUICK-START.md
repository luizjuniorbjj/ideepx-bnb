# ⚡ QUICK START - Usando Suas Chaves Existentes

## 📋 RESUMO

Você vai usar as **MESMAS CHAVES** que já tem:

```
✅ ADMIN (Owner + Backend): 0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
   Private Key: 0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03

✅ PIONEER (Referência): 0x75d1a8ac59003088c60a20bde8953cbecfe41669
```

---

## 🚀 DEPLOY EM 5 PASSOS (TESTNET)

### PASSO 1: Copiar Configuração (1 minuto)

```bash
# Copiar .env configurado
copy .env.proof-system .env

# OU renomear o atual e usar o novo
move .env .env.old
move .env.proof-system .env
```

Pronto! Suas chaves já estão configuradas no .env

### PASSO 2: Upload do Plano para IPFS (5 minutos)

1. Acesse: https://app.pinata.cloud/pinmanager
2. Faça login ou crie conta (FREE tier é suficiente)
3. Clique em "Upload" → "File"
4. Selecione: `commission-plan-v1.json`
5. Clique em "Upload"
6. **COPIE o CID** (exemplo: QmXxxx...)

Edite o `.env` e cole o CID:
```env
PLAN_IPFS_CID=QmXxxx...  # Cole aqui o CID que você copiou
```

### PASSO 3: Pegar BNB Testnet (5 minutos)

Sua carteira admin precisa de BNB testnet:

```bash
# Acesse o faucet
https://testnet.bnbchain.org/faucet-smart

# Cole seu endereço
0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

# Complete verificação (Twitter ou GitHub)
# Receba 0.1-0.5 tBNB
```

### PASSO 4: Deploy Rulebook (2 minutos)

```bash
npm run deploy:rulebook:bscTestnet
```

Você verá:
```
✅ Rulebook deployed to: 0x1234...

Set in .env: RULEBOOK_ADDRESS=0x1234...
```

**Copie o endereço** e adicione no `.env`:
```env
RULEBOOK_ADDRESS=0x1234...  # Cole aqui o endereço do Rulebook
```

### PASSO 5: Deploy Proof (2 minutos)

```bash
npm run deploy:proof:bscTestnet
```

Você verá:
```
✅ Proof contract deployed to: 0x5678...
```

**PRONTO! ✅** Seus contratos estão no ar!

---

## 📊 VERIFICAR DEPLOYMENT

```bash
# Ver no BSCScan Testnet
https://testnet.bscscan.com/address/0x1234...  # Rulebook
https://testnet.bscscan.com/address/0x5678...  # Proof
```

---

## 🔑 SUAS CHAVES E PERMISSÕES

### O que cada carteira faz:

```
┌────────────────────────────────────────────────┐
│  ADMIN (0x29061...Fec5F)                      │
│  ├─ Owner dos contratos ✅                     │
│  ├─ Backend automático ✅                      │
│  ├─ Deploy dos contratos ✅                    │
│  ├─ Submit weekly proofs ✅                    │
│  └─ Finalize weeks ✅                          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  PIONEER (0x75d1a...1669)                     │
│  └─ Primeiro usuário da rede (referência)     │
└────────────────────────────────────────────────┘
```

**Tudo funciona com a MESMA carteira admin!** 🎯

---

## 🔄 SE QUISER SEPARAR BACKEND DEPOIS

Edite o `.env`:

```env
# Opção 1: Criar nova carteira para backend
BACKEND_ADDRESS=0x_nova_carteira

# Opção 2: Usar Pioneer como backend
BACKEND_ADDRESS=0x75d1a8ac59003088c60a20bde8953cbecfe41669
# (precisa ter a private key do Pioneer)
```

Depois atualize no contrato:

```bash
# Via Hardhat console
npx hardhat console --network bscTestnet

const proof = await ethers.getContractAt("iDeepXProofFinal", "0x5678...")
await proof.setBackend("0x_novo_endereco")
```

---

## 📝 RESUMO DO .ENV

Seu `.env` ficou assim:

```env
# Suas chaves (IGUAIS ao sistema anterior)
PRIVATE_KEY=8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03
ADMIN_ADDRESS=0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F
BACKEND_ADDRESS=0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F

# Configuração do plano
PLAN_IPFS_CID=QmXxxx...  # Você preencheu no Passo 2
PLAN_CONTENT_HASH=0x949b2ae2debf7cdb74e38997ac9fbee2ea26a637ae8d639db86fc8845bf31f3b

# Endereços dos contratos
RULEBOOK_ADDRESS=0x1234...  # Você preencheu no Passo 4
PROOF_CONTRACT_ADDRESS=0x5678...  # Obtido no Passo 5

# Outros (opcionais)
BSCSCAN_API_KEY=  # Para verificação automática
PINATA_API_KEY=   # Para backend automatizar uploads
```

---

## 🎯 PRÓXIMOS PASSOS (BACKEND)

Agora que os contratos estão no ar, você precisa:

### 1. Integrar GMI Edge API

```javascript
// backend/services/gmi-api.js
const fetchWeeklyProfits = async () => {
  const response = await fetch('https://api.gmiedge.com/profits', {
    headers: {
      'Authorization': `Bearer ${process.env.GMI_API_KEY}`
    }
  });

  return response.json();
};
```

### 2. Calcular Comissões MLM

```javascript
// backend/services/mlm-calculator.js
const calculateCommissions = (clientProfit, userLevel) => {
  const CLIENT_SHARE = 0.65; // Cliente recebe 65%
  const clientAmount = clientProfit * CLIENT_SHARE;

  const PERCENTAGES = {
    1: 0.08,  // 8%
    2: 0.03,  // 3%
    3: 0.02,  // 2%
    // ... resto dos níveis
  };

  return clientAmount * PERCENTAGES[userLevel];
};
```

### 3. Upload Snapshots para IPFS

```javascript
// backend/services/ipfs-service.js
const uploadSnapshot = async (data) => {
  const pinata = new PinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_SECRET_KEY
  );

  const result = await pinata.pinJSONToIPFS(data);
  return result.IpfsHash; // QmXxxx...
};
```

### 4. Submit Proof On-Chain

```javascript
// backend/services/blockchain-service.js
const submitProof = async (week, ipfsHash, totals) => {
  const proof = new ethers.Contract(
    process.env.PROOF_CONTRACT_ADDRESS,
    ProofABI,
    signer
  );

  const tx = await proof.submitWeeklyProof(
    week,
    ipfsHash,
    totals.totalUsers,
    totals.totalCommissions,
    totals.totalProfits
  );

  await tx.wait();
};
```

### 5. Automação (Cron Jobs)

```javascript
// Domingo 23:00 - Calcular comissões
cron.schedule('0 23 * * 0', async () => {
  const profits = await fetchWeeklyProfits();
  const commissions = await calculateCommissions(profits);
  const ipfsHash = await uploadSnapshot(commissions);
  await submitProof(week, ipfsHash, totals);
});

// Segunda 00:00 - Pagar comissões
cron.schedule('0 0 * * 1', async () => {
  await batchPayUSDT(commissions);
  await finalizeWeek(week);
});
```

---

## 💰 CUSTOS

```
DEPLOY (uma vez):
├─ Rulebook: GRÁTIS (testnet)
├─ Proof: GRÁTIS (testnet)
└─ Total: $0 ✅

OPERAÇÃO (testnet):
└─ Tudo GRÁTIS com tBNB do faucet ✅

QUANDO FOR MAINNET:
├─ Deploy: ~$2 (uma vez)
├─ Operação: ~$23/ano
├─ Pagamentos: ~$94/ano (200 users)
└─ Total: ~$119/ano ($0.60/user) ✅
```

---

## ⚠️ IMPORTANTE

### Segurança:

- ✅ NUNCA commite .env no git
- ✅ .env já está no .gitignore
- ✅ Faça backup da private key em local seguro
- ✅ Use wallet diferente para mainnet (recomendado)

### Compatibilidade:

- ✅ Pode rodar novo e antigo sistema em paralelo
- ✅ Mesma carteira admin funciona nos dois
- ✅ Backend pode servir ambos os sistemas
- ✅ Migração gradual possível

### Deploy Mainnet:

- ✅ Teste TUDO no testnet primeiro
- ✅ Compre ~$10 de BNB real
- ✅ Use scripts: `npm run deploy:rulebook:bsc` e `npm run deploy:proof:bsc`
- ✅ Verifique contratos no BSCScan

---

## 🆘 TROUBLESHOOTING

### "PLAN_IPFS_CID not set"
```
SOLUÇÃO: Faça upload do JSON no Pinata e copie o CID
```

### "RULEBOOK_ADDRESS not set"
```
SOLUÇÃO: Deploy Rulebook primeiro, copie endereço, cole no .env
```

### "Insufficient funds"
```
SOLUÇÃO: Pegue mais tBNB no faucet
```

### "Private key invalid"
```
SOLUÇÃO: Verifique se copiou sem o "0x" no início
No .env deve ser: PRIVATE_KEY=8577a7ed... (SEM 0x)
```

---

## ✅ CHECKLIST

Antes de começar:
- [ ] Arquivo .env copiado
- [ ] Chaves admin configuradas
- [ ] JSON uploaded no Pinata
- [ ] CID copiado para .env
- [ ] tBNB recebido do faucet

Deploy:
- [ ] Rulebook deployed
- [ ] Endereço Rulebook no .env
- [ ] Proof deployed
- [ ] Verificar no BSCScan Testnet

Próximos:
- [ ] Integrar GMI Edge API
- [ ] Implementar cálculo MLM
- [ ] Upload IPFS automático
- [ ] Submit proofs automático
- [ ] Batch USDT payments
- [ ] Cron jobs configurados

---

**🚀 VOCÊ ESTÁ PRONTO!**

Suas mesmas chaves, novo sistema, 8x mais barato, muito mais escalável!

Precisa de ajuda? Consulte:
- `DEPLOYMENT-GUIDE.md` - Guia completo
- `IMPLEMENTATION-SUMMARY.md` - Resumo técnico
- `commission-plan-v1.json` - Plano de negócios
