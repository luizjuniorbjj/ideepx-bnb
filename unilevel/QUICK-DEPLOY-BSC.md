# ⚡ QUICK START - BSC + USDT BEP-20

## 🚀 Deploy em 3 Passos

### 1️⃣ PREPARAÇÃO (5 minutos)

```bash
# Instalar
npm install

# Configurar .env
cp .env.example .env
nano .env
```

Configure:
```env
PRIVATE_KEY=sua_chave_sem_0x
BACKEND_ADDRESS=0x_endereco_backend
BSCSCAN_API_KEY=sua_api_key
```

### 2️⃣ TESTNET (10 minutos)

```bash
# Pegar BNB grátis
https://testnet.bnbchain.org/faucet-smart

# Verificar saldo
npm run check:balance:bscTestnet

# Deploy Rulebook
npm run deploy:rulebook:bscTestnet

# ANOTAR endereço do Rulebook e adicionar no .env:
# RULEBOOK_ADDRESS=0x...

# Deploy Proof
npm run deploy:proof:bscTestnet
```

### 3️⃣ MAINNET (quando pronto)

```bash
# Verificar saldo (precisa ~$5 de BNB)
npm run check:balance:bsc

# Deploy Rulebook
npm run deploy:rulebook:bsc

# Atualizar .env com RULEBOOK_ADDRESS

# Deploy Proof
npm run deploy:proof:bsc
```

---

## 📊 CUSTOS BSC MAINNET

```
Deploy:
├─ Rulebook: ~$0.60
├─ Proof: ~$1.35
└─ Total: ~$2.00 (uma vez)

Operação:
├─ Submit proof: ~$0.36/semana
├─ Finalize week: ~$0.09/semana
└─ Total: ~$23/ano

USDT Transfers (batch 100 users):
└─ ~$1.50 por batch
```

---

## 🔗 LINKS ÚTEIS

**Testnet:**
- Faucet: https://testnet.bnbchain.org/faucet-smart
- Explorer: https://testnet.bscscan.com
- Add Network: https://chainlist.org/chain/97

**Mainnet:**
- Explorer: https://bscscan.com
- Add Network: https://chainlist.org/chain/56
- USDT: `0x55d398326f99059fF775485246999027B3197955`

---

## 📋 COMANDOS RÁPIDOS

```bash
# Compilar
npm run compile

# Testar
npm test

# Verificar saldo
npm run check:balance:bscTestnet
npm run check:balance:bsc

# Deploy completo testnet
npm run deploy:rulebook:bscTestnet
# (anotar endereço e colocar no .env)
npm run deploy:proof:bscTestnet

# Deploy completo mainnet
npm run deploy:rulebook:bsc
# (anotar endereço e colocar no .env)
npm run deploy:proof:bsc

# Verificar contrato
npx hardhat verify --network bsc ENDERECO_CONTRATO ARGS...
```

---

## ✅ CHECKLIST

### Antes de Testnet:
- [ ] npm install feito
- [ ] .env configurado
- [ ] MetaMask com BSC Testnet
- [ ] BNB testnet recebido

### Antes de Mainnet:
- [ ] Testado 100% no testnet
- [ ] Wallet com BNB suficiente (~$10)
- [ ] BSCSCAN_API_KEY configurada
- [ ] Plano JSON no IPFS
- [ ] Content hash calculado
- [ ] Backup de chaves feito

---

## 🆘 PROBLEMAS COMUNS

**"insufficient funds"**
→ Adicione mais BNB na wallet

**"RULEBOOK_ADDRESS not set"**
→ Deploy Rulebook primeiro e adicione endereço no .env

**"nonce too high"**
→ `npm run clean` e tente novamente

**Faucet não funciona**
→ Tente Discord: https://discord.gg/bnbchain

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Deploy testnet
2. ✅ Testar submit proof
3. ✅ Integrar backend
4. ✅ Deploy mainnet
5. ✅ Começar operação!

**Boa sorte! 🚀**
