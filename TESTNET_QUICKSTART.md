# 🚀 Testnet Quickstart - V9_SECURE_2

## ✅ Configuração Completa!

Seu `.env` já está configurado para testnet. Siga os passos abaixo:

---

## 📋 Passo 1: Conseguir BNB Testnet (Grátis)

### Opção A: Faucet Web (Mais Fácil)

```
1. Acesse: https://testnet.bnbchain.org/faucet-smart
2. Cole o endereço: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
3. Clique em "Give me BNB"
4. Aguarde 1-2 minutos
```

**Verificar saldo:**
```
https://testnet.bscscan.com/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Opção B: Importar no MetaMask

```
1. Abra MetaMask
2. Clique no ícone da conta → "Import Account"
3. Cole a chave privada:
   ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
4. Mude para "BNB Smart Chain Testnet"
5. Use o faucet: https://testnet.bnbchain.org/faucet-smart
```

**Você precisa de:** ~0.05 BNB (≈ $15 em testnet, mas é grátis!)

---

## 📋 Passo 2: Deploy no Testnet

Agora que tem BNB testnet, faça o deploy:

```bash
cd C:\ideepx-bnb
npx hardhat run scripts/deploy_V9_SECURE_2.js --network bscTestnet
```

**O que vai acontecer:**
1. ✅ Deploy da library TimelockGovernance
2. ✅ Deploy do contrato V9_SECURE_2
3. ✅ Verificação automática no BscScan (se tiver API key)
4. ✅ Arquivo JSON salvo com informações

**Tempo estimado:** 2-3 minutos

---

## 📋 Passo 3: Copiar Endereço do Contrato

Após deploy, você verá:

```
✅ Deploy concluído!
📍 Contrato: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Copie esse endereço e adicione no .env:**

```bash
# Abra .env e adicione na última linha:
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Ou execute:
```bash
echo "CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" >> .env
```

---

## 📋 Passo 4: Monitorar o Contrato

Com o CONTRACT_ADDRESS configurado, inicie o monitor:

```bash
node monitoring/monitor.js
```

**O monitor mostra:**
- 💰 Solvency ratio (110%/130%)
- 🚨 Circuit breaker status
- 💵 Deposit cap usage ($100k)
- 🛡️ Emergency reserve
- 👥 User limits (100 beta)
- 📊 System statistics

**Atualiza a cada:** 30 segundos

---

## 📋 Passo 5: Testar Funcionalidades

Agora você pode testar o contrato!

### 5.1. Verificar no BscScan Testnet

```
https://testnet.bscscan.com/address/SEU_CONTRACT_ADDRESS
```

### 5.2. Interagir via Hardhat Console

```bash
npx hardhat console --network bscTestnet
```

Depois:
```javascript
// Conectar ao contrato
const addr = "SEU_CONTRACT_ADDRESS";
const contract = await ethers.getContractAt("iDeepXDistributionV9_SECURE_2", addr);

// Ver informações
await contract.betaMode(); // true
await contract.maxTotalDeposits(); // 100000000000 (100k USDT)
await contract.MAX_BETA_USERS(); // 100n

// Ver security status
const security = await contract.getSecurityStatus();
console.log(security);

// Sair
.exit
```

### 5.3. Registrar Usuário de Teste

**Precisa de USDT testnet primeiro!**

Deploy USDT mock:
```bash
npx hardhat run scripts/deploy_mock_usdt.js --network bscTestnet
```

Depois registre:
```javascript
// Via console
const contract = await ethers.getContractAt("iDeepXDistributionV9_SECURE_2", "SEU_CONTRACT");
const multisig = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Registrar com multisig como sponsor
await contract.registerWithSponsor(multisig);
```

---

## 🧪 Cenários de Teste Recomendados

### Semana 1: Funcionalidades Básicas
- [x] Deploy bem-sucedido
- [ ] Registrar 5-10 usuários
- [ ] Ativar assinaturas ($19)
- [ ] Testar direct bonus ($5)
- [ ] Testar fast start bonus ($5)
- [ ] Verificar MLM distribution (60%)

### Semana 2: Limites e Proteções
- [ ] Testar deposit cap ($100k)
- [ ] Testar user limit (100 users)
- [ ] Tentar exceder withdrawal limits
- [ ] Verificar emergency reserve acumulando

### Semana 3: Circuit Breaker
- [ ] Simular solvency < 110%
- [ ] Verificar circuit breaker ativa
- [ ] Tentar operações durante circuit breaker
- [ ] Verificar recuperação em 130%

### Semana 4: Governança
- [ ] Propor uso de emergency reserve
- [ ] Aguardar timelock 24h
- [ ] Executar proposta
- [ ] Testar cancelamento de proposta

---

## 📊 Dashboard de Monitoramento

### Status Esperado Inicial:

```
💰 SOLVENCY: ✅ OK
   Ratio: 100.00%
   Required: 0 USDT
   Current: 0 USDT

🚨 CIRCUIT BREAKER: ✅ INACTIVE
   Activation: 110%
   Recovery: 130%

💵 DEPOSIT CAP: ✅ OK
   Current: 0 USDT (0.0%)
   Max: 100000 USDT
   Remaining: 100000 USDT

🛡️ EMERGENCY RESERVE: ✅ OK
   Available: 0 USDT

👥 USER LIMITS: ✅ OK
   Beta Mode: Active
   Total Users: 1 / 100 (1.0%)
```

### Após Primeiras Assinaturas:

```
💵 DEPOSIT CAP: ✅ OK
   Current: 57 USDT (0.1%)  // 3 users x $19
   Max: 100000 USDT
   Remaining: 99943 USDT

🛡️ EMERGENCY RESERVE: ✅ OK
   Available: 0.57 USDT  // 3 x $0.19

👥 USER LIMITS: ✅ OK
   Total Users: 4 / 100 (4.0%)  // 1 multisig + 3 users
```

---

## ⚠️ Problemas Comuns

### "Insufficient funds for gas"
**Solução:** Conseguir mais BNB testnet no faucet

### "CONTRACT_ADDRESS not set"
**Solução:** Adicionar no .env após deploy

### "Cannot connect to network"
**Solução:**
- Verificar internet
- Tentar RPC alternativo:
  ```env
  RPC_URL=https://bsc-testnet.public.blastapi.io
  ```

### "User already registered"
**Solução:** Normal, use outra conta para testes

---

## 🎯 Métricas de Sucesso (7 dias)

Após 7 dias de testes, você deve ter:

- [ ] **10+ usuários registrados**
- [ ] **20+ assinaturas processadas**
- [ ] **$380+ em receita testnet** (20 x $19)
- [ ] **$0 em problemas críticos**
- [ ] **Circuit breaker testado** (simulação)
- [ ] **Timelock testado** (proposta + execução)
- [ ] **Todos os limites validados**
- [ ] **Monitor funcionando 24/7**

---

## 📈 Próximos Passos

### Após Sucesso em Testnet:

1. **Documentar resultados**
   - Capturas de tela do monitor
   - Logs de transações
   - Problemas encontrados e resolvidos

2. **Auditoria externa**
   - Contratar auditoria profissional
   - Corrigir issues encontrados
   - Deploy nova versão se necessário

3. **Preparar Mainnet**
   - Criar Gnosis Safe real
   - Configurar carteiras separadas
   - Configurar monitoramento 24/7
   - Treinar equipe de resposta

4. **Deploy Mainnet**
   - Seguir SETUP_ENV_GUIDE.md para mainnet
   - Deploy com configurações reais
   - Monitoramento ativo desde minuto 1

---

## 🚀 Comandos Rápidos

```bash
# Deploy testnet
npx hardhat run scripts/deploy_V9_SECURE_2.js --network bscTestnet

# Monitor
node monitoring/monitor.js

# Console interativo
npx hardhat console --network bscTestnet

# Compilar
npx hardhat compile

# Testes
npx hardhat test

# Limpar cache
npx hardhat clean
```

---

## 📞 Suporte

- **Hardhat:** https://hardhat.org/docs
- **BscScan Testnet:** https://testnet.bscscan.com
- **Faucet:** https://testnet.bnbchain.org/faucet-smart

---

**🎉 Bons testes! Lembre-se: testnet é para APRENDER e EXPERIMENTAR!**

Teste tudo o que você imaginar que pode dar errado. É melhor descobrir problemas agora do que em mainnet.
