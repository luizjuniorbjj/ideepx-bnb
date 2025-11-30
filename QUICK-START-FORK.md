# ⚡ QUICK START - FORK DA BSC MAINNET

**Testando localmente em 3 minutos! 🚀**

---

## 🎯 O QUE VOCÊ VAI FAZER

Testar seu contrato REAL (0xA64bD...) localmente, SEM GASTAR NADA!

---

## ⚡ 3 PASSOS RÁPIDOS

### **1️⃣ Configurar Frontend (1 minuto)**

```bash
cd frontend
cp .env.local.fork .env.local
cd ..
```

### **2️⃣ Subir Fork da Mainnet (30 segundos)**

**Terminal 1:**
```bash
npx hardhat node
```

**✅ Deixe rodando!** (você vai ver "Started HTTP and WebSocket JSON-RPC server")

### **3️⃣ Testar Tudo (2 minutos)**

**Terminal 2:**
```bash
npx hardhat run scripts/test-fork-mainnet.js --network localhost
```

**Vai testar:**
- ✅ Conexão com contrato real
- ✅ Distribuir USDT para 10 usuários
- ✅ Registros em cadeia (10 níveis MLM)
- ✅ Assinaturas
- ✅ Distribuição MLM ($1000)
- ✅ Saques
- ✅ Funções admin

---

## 🌐 TESTAR COM FRONTEND

**Terminal 3:**
```bash
cd frontend
npm run dev -- -p 3005
```

**Acesse:** http://localhost:3005

---

## 🦊 CONFIGURAR METAMASK (2 minutos)

### **1. Adicionar Rede:**
```
Nome: Hardhat Fork (BSC Mainnet)
RPC: http://127.0.0.1:8545
Chain ID: 31337
Símbolo: BNB
```

### **2. Importar Conta de Teste:**

**Account #0:**
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Endereço: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Saldo: 10,000 BNB
```

**Account #1:**
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Endereço: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Saldo: 10,000 BNB
```

---

## 📋 RESUMO DOS TERMINAIS

```
Terminal 1: npx hardhat node                                      (fork rodando)
Terminal 2: npx hardhat run scripts/test-fork-mainnet.js --network localhost
Terminal 3: cd frontend && npm run dev -- -p 3005                 (frontend)
```

---

## 🔄 COMANDOS ÚTEIS

### **Teste Rápido (30 segundos):**
```bash
npx hardhat run scripts/smoke-test.js --network localhost
```

### **Resetar Fork:**
```bash
# Terminal 1: Ctrl + C
npx hardhat node
```

### **Voltar para Mainnet:**
```bash
cd frontend
cp .env.local.production .env.local
npm run dev -- -p 3005
```

---

## ✅ CHECKLIST

- [ ] Fork rodando (Terminal 1)
- [ ] Teste completo executado (Terminal 2)
- [ ] Frontend rodando (Terminal 3)
- [ ] MetaMask configurado (rede + conta)
- [ ] Conectado em localhost:3005

---

## 📚 DOCUMENTAÇÃO COMPLETA

Veja: **FORK-TESTING-GUIDE.md** (guia detalhado)

---

## 🎉 PRONTO!

Agora você pode testar TUDO localmente sem gastar NADA! 🚀

**Dúvida?** Leia o guia completo: `FORK-TESTING-GUIDE.md`
