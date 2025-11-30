# 🚀 QUICK START - Hardhat Local (BNB Infinito!)

**Tempo total:** 5 minutos
**Resultado:** Testes ilimitados com BNB infinito!

---

## 📋 PASSO A PASSO (Windows)

### 1️⃣ Terminal 1: Iniciar Hardhat Node

```bash
# Clique duas vezes ou execute:
start_hardhat.bat

# Ou manualmente:
npx hardhat node
```

**Aguarde ver:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Account #0: 0xf39Fd... (10000 ETH)
Account #1: 0x70997... (10000 ETH)
...
```

✅ **100 contas com 10,000 BNB cada!**

---

### 2️⃣ Terminal 2: Deploy Contratos

```bash
# Clique duas vezes ou execute:
deploy_local.bat

# Ou manualmente:
npx hardhat run scripts/deploy_local.js --network hardhat
```

**Aguarde ver:**
```
✅ Mock USDT deployed to: 0x5FbDB...
✅ Contract deployed to: 0xe7f1725E...
✅ Minted 500000 USDT to master
```

📝 **Endereços salvos em `.env.local`**

---

### 3️⃣ Terminal 3: Rodar Bot

```bash
# Clique duas vezes ou execute:
start_bot_local.bat

# Ou manualmente:
python intelligent_test_bot_fixed.py --local
```

**Aguarde ver:**
```
🚀 Using HARDHAT LOCAL (BNB infinito!)
🤖 Bot inicializado!
✅ 10 usuários criados
✅ 100% taxa de sucesso!
```

---

## ⚡ ONE-LINER (Tudo de uma vez)

### Windows PowerShell:
```powershell
# Terminal 1
Start-Process cmd -ArgumentList "/k start_hardhat.bat"

# Aguarde 3 segundos

# Terminal 2
Start-Process cmd -ArgumentList "/k deploy_local.bat"

# Aguarde ver "DEPLOYMENT COMPLETE"

# Terminal 3
Start-Process cmd -ArgumentList "/k start_bot_local.bat"
```

---

## 🔄 WORKFLOW DIÁRIO

```
1. START (uma vez ao dia)
   ├─ Terminal 1: start_hardhat.bat
   └─ Terminal 2: deploy_local.bat (aguarde)

2. TEST (quantas vezes quiser)
   └─ Terminal 3: start_bot_local.bat

3. ITERATE (loop infinito)
   ├─ Modificar código
   ├─ Ctrl+C no bot
   ├─ start_bot_local.bat novamente
   └─ Repeat!

4. RESET (quando precisar limpar tudo)
   ├─ Ctrl+C no Terminal 1
   ├─ start_hardhat.bat novamente
   └─ deploy_local.bat novamente
```

---

## 📊 COMPARAÇÃO

### ❌ ANTES (Testnet com Faucets)

```
1. Ir no faucet → 2 min
2. Resolver CAPTCHA → 1 min
3. Aguardar confirmação → 2 min
4. Testar → 10 min
5. Ficou sem BNB → PARADO
= 15+ minutos + LIMITADO
```

### ✅ AGORA (Hardhat Local)

```
1. start_hardhat.bat → 5s
2. deploy_local.bat → 2s
3. start_bot_local.bat → 5s
4. Testar → 2 min (6x mais rápido)
5. Testar novamente → 2 min
6. Testar de novo → 2 min
= ILIMITADO!
```

**Economia:** 90% do tempo + BNB infinito!

---

## 🐛 TROUBLESHOOTING

### "Cannot find module hardhat"
```bash
npm install
```

### "Connection refused 127.0.0.1:8545"
```bash
# Certifique-se que Hardhat está rodando
# Terminal 1 deve mostrar: "Started HTTP and WebSocket JSON-RPC server"
```

### "LOCAL_CONTRACT_ADDRESS not set"
```bash
# Execute o deploy primeiro:
deploy_local.bat
```

### "Port 8545 already in use"
```bash
# Matar processo na porta 8545:
netstat -ano | findstr :8545
taskkill /PID <PID> /F

# Ou reiniciar PC
```

---

## 📚 COMANDOS ÚTEIS

### Ver saldo de uma conta:
```bash
npx hardhat console --network hardhat

# No console:
> const [acc] = await ethers.getSigners()
> await ethers.provider.getBalance(acc.address)
# 10000000000000000000000 (10k BNB!)
```

### Mint USDT para qualquer conta:
```bash
# No hardhat console:
> const usdt = await ethers.getContractAt("MockERC20", "USDT_ADDRESS")
> await usdt.mint("ACCOUNT_ADDRESS", ethers.parseUnits("100000", 6))
# 100k USDT mintado!
```

### Avançar tempo (time travel):
```javascript
// No teste ou script:
await network.provider.send("evm_increaseTime", [86400]); // +1 dia
await network.provider.send("evm_mine"); // Mine next block
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Testar localmente** (hoje)
   - Rodar todos os testes
   - 100% cobertura
   - Debugging completo

2. ✅ **Validar em testnet** (1x/semana)
   - Smoke tests
   - Validação final

3. ✅ **Deploy em mainnet** (quando pronto)
   - Após testes completos
   - Após auditoria

---

## 💡 DICAS PRO

### 1. Snapshot/Restore (salvar estado)
```javascript
// Salvar estado atual
const snapshotId = await network.provider.send("evm_snapshot");

// ... fazer testes ...

// Restaurar estado
await network.provider.send("evm_revert", [snapshotId]);
```

### 2. Impersonate Account (agir como qualquer conta)
```javascript
await hre.network.provider.request({
  method: "hardhat_impersonateAccount",
  params: ["0xADDRESS"],
});
```

### 3. Console.log no Solidity
```solidity
import "hardhat/console.sol";

function myFunction() public {
    console.log("Debug value:", someVariable);
}
```

### 4. Fork Mainnet (testar com dados reais)
```javascript
// No hardhat.config.js:
forking: {
  url: "https://bsc-dataseed.binance.org/",
  enabled: true
}
```

---

## 🎉 PRONTO!

Agora você tem:
- ✅ BNB infinito
- ✅ Testes instantâneos
- ✅ Debugging completo
- ✅ Zero custos
- ✅ Desenvolvimento profissional

**Nunca mais dependa de faucets!** 🚀

---

**Criado por:** Claude Code
**Data:** 2025-11-01
**Status:** ✅ Pronto para uso
