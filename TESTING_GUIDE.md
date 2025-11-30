# 🧪 Guia Completo de Testes - V9_SECURE_2

Este guia explica como testar todas as funcionalidades do contrato iDeepXDistributionV9_SECURE_2.

---

## 📋 Índice

1. [Setup Inicial](#setup-inicial)
2. [Testes Básicos](#testes-básicos)
3. [Testes de Registro e Assinatura](#testes-de-registro-e-assinatura)
4. [Testes de Distribuição MLM](#testes-de-distribuição-mlm)
5. [Testes de Segurança](#testes-de-segurança)
6. [Testes de Limites](#testes-de-limites)
7. [Testes de Governança](#testes-de-governança)
8. [Monitoramento Contínuo](#monitoramento-contínuo)

---

## 🚀 Setup Inicial

### 1. Verificar Deployment

```bash
npx hardhat run explore_contract.js --network bscTestnet
```

**Esperado:**
- ✅ Subscription Fee: $19 USDT
- ✅ Beta Mode: Ativo (100 usuários max)
- ✅ Deposit Cap: $100,000 USDT
- ✅ Circuit Breaker: 110%/130%

### 2. Deploy Mock USDT (Opcional)

Se você quiser testar com USDT mock em vez do USDT oficial da testnet:

```bash
npx hardhat run scripts/deploy_mock_usdt.js --network bscTestnet
```

Isso vai:
- Deployar um token ERC20 mock com 6 decimais
- Mintar 1,000,000 USDT para você
- Exibir o endereço do contrato

Depois atualize `.env`:
```env
USDT_TESTNET=0x[novo_endereco_mock]
```

### 3. Obter USDT Testnet (Oficial)

Ou use o USDT oficial da BSC Testnet:
- Endereço: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`
- Faucet: Procure por "BSC Testnet USDT Faucet"

---

## ✅ Testes Básicos

### Teste 1: Estado Inicial

```bash
npx hardhat run test_basic_flow.js --network bscTestnet
```

**Verificar:**
- ✅ Total Users: 1 (deployer auto-registrado)
- ✅ Beta Mode: true
- ✅ Circuit Breaker: Inativo
- ✅ Solvency Ratio: 100%

### Teste 2: Iniciar Monitor

```bash
node monitoring/monitor.js
```

**Verificar:**
- ✅ Monitor conecta ao contrato
- ✅ Exibe todas as métricas
- ✅ Atualiza a cada 30 segundos

---

## 👥 Testes de Registro e Assinatura

### Preparação: Console Interativo

```bash
npx hardhat console --network bscTestnet
```

### Script Completo no Console

```javascript
// Conectar ao contrato
const contract = await ethers.getContractAt(
  "iDeepXDistributionV9_SECURE_2",
  "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea"
);

// Conectar ao USDT
const usdt = await ethers.getContractAt(
  "IERC20",
  "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
);

// Pegar signers
const [deployer] = await ethers.getSigners();

// ========== TESTE: Registrar Novo Usuário ==========

// Endereço do novo usuário (exemplo - use um endereço real)
const newUserAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1";

// 1. Aprovar USDT
const subscriptionFee = await contract.SUBSCRIPTION_FEE(); // $19
await usdt.approve(contract.target, subscriptionFee);

// 2. Registrar usuário
const tx = await contract.registerUser(newUserAddress, deployer.address);
await tx.wait();

console.log("✅ Usuário registrado!");

// 3. Verificar registro
const userInfo = await contract.getUserInfo(newUserAddress);
console.log("Registrado:", userInfo.isRegistered);
console.log("Subscription ativa:", userInfo.subscriptionActive);

// ========== TESTE: Pagar Assinatura ==========

// Aprovar $19 USDT
await usdt.approve(contract.target, subscriptionFee);

// Pagar subscription
const tx2 = await contract.paySubscription();
await tx2.wait();

console.log("✅ Assinatura paga!");

// ========== TESTE: Verificar Distribuição ==========

// Ver quanto foi distribuído
const mlmReserve = await contract.mlmReserveBalance();
console.log("MLM Reserve:", ethers.formatUnits(mlmReserve, 6), "USDT");

// Ver balance disponível
const userInfo2 = await contract.getUserInfo(deployer.address);
console.log("Balance disponível:", ethers.formatUnits(userInfo2.availableBalance, 6), "USDT");
```

**O que testa:**
- ✅ Registro de usuário com sponsor
- ✅ Cobrança de $19 USDT
- ✅ Ativação de subscription
- ✅ Direct bonus ($5)
- ✅ Fast start bonus ($5 se < 7 dias)
- ✅ Distribuição MLM

---

## 💰 Testes de Distribuição MLM

### Criar Árvore de Usuários

```javascript
// No console Hardhat...

// Criar 5 usuários em sequência
const users = [
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678",
  "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7",
  "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C",
  "0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC"
];

// Registrar User1 com Deployer como sponsor
await usdt.approve(contract.target, await contract.SUBSCRIPTION_FEE());
await contract.registerUser(users[0], deployer.address);

// Registrar User2 com User1 como sponsor
await usdt.approve(contract.target, await contract.SUBSCRIPTION_FEE());
await contract.registerUser(users[1], users[0]);

// E assim por diante...

// Verificar árvore
const user1Data = await contract.getUserInfo(users[0]);
console.log("User1 directs:", user1Data.directReferrals);
console.log("User1 volume:", ethers.formatUnits(user1Data.totalVolume, 6));
```

**O que testa:**
- ✅ Criação de árvore MLM
- ✅ Contagem de directs
- ✅ Cálculo de volume
- ✅ Distribuição de bônus por níveis
- ✅ Upgrade de ranks

---

## 🔒 Testes de Segurança

### Teste 1: Solvency Ratio

```javascript
// Simular baixa solvency retirando USDT do contrato
// (apenas para teste - não faça isso em produção!)

// Ver solvency atual
const ratio = await contract.getSolvencyRatio();
console.log("Solvency:", Number(ratio) / 100, "%");

// Verificar thresholds
const threshold = await contract.SOLVENCY_THRESHOLD_BPS();
const recovery = await contract.SOLVENCY_RECOVERY_BPS();
console.log("Threshold:", Number(threshold) / 100, "%"); // 110%
console.log("Recovery:", Number(recovery) / 100, "%");   // 130%
```

### Teste 2: Circuit Breaker

```javascript
// Verificar estado do circuit breaker
const security = await contract.getSecurityStatus();
console.log("CB Active:", security._circuitBreakerActive);

// Se solvency cair abaixo de 110%, circuit breaker ativa automaticamente
// Testar reativação quando subir acima de 130%
```

### Teste 3: Emergency Reserve

```javascript
// Verificar emergency reserve
const security = await contract.getSecurityStatus();
const reserve = security._emergencyReserve;
console.log("Emergency Reserve:", ethers.formatUnits(reserve, 6), "USDT");

// Propor uso de emergency reserve (apenas multisig)
const proposalId = await contract.proposeEmergencyReserve(
  ethers.parseUnits("1000", 6),  // $1000
  "Teste de emergency reserve",
  0,  // LIQUIDITY
  ethers.ZeroAddress
);

// Aguardar 24 horas (TIMELOCK_DURATION)
// Depois executar:
// await contract.executeEmergencyReserve(proposalId);
```

---

## 📊 Testes de Limites

### Teste 1: User Limit (Beta)

```javascript
// Verificar limite de usuários
const totalUsers = await contract.totalUsers();
const maxUsers = await contract.MAX_BETA_USERS();
console.log(`Users: ${totalUsers} / ${maxUsers}`); // X / 100

// Tentar registrar além do limite
// Deve reverter se >= 100 usuários
```

### Teste 2: Deposit Cap

```javascript
// Verificar cap
const capEnabled = await contract.capEnabled();
const maxDeposits = await contract.maxTotalDeposits();
console.log("Cap enabled:", capEnabled);
console.log("Max deposits:", ethers.formatUnits(maxDeposits, 6), "USDT"); // $100k

// Verificar total depositado
const subRevenue = await contract.totalSubscriptionRevenue();
const perfRevenue = await contract.totalPerformanceRevenue();
const total = subRevenue + perfRevenue;
console.log("Total deposited:", ethers.formatUnits(total, 6), "USDT");
console.log("Remaining:", ethers.formatUnits(maxDeposits - total, 6), "USDT");
```

### Teste 3: Withdrawal Limits

```javascript
// Limites para usuários
const MAX_WITHDRAWAL_PER_TX = ethers.parseUnits("10000", 6);  // $10k
const MAX_WITHDRAWAL_PER_MONTH = ethers.parseUnits("50000", 6); // $50k

// Tentar sacar
const withdrawAmount = ethers.parseUnits("100", 6); // $100
const tx = await contract.withdrawBalance(withdrawAmount);
await tx.wait();

console.log("✅ Withdrawal realizado!");

// Verificar balance
const userInfo = await contract.getUserInfo(deployer.address);
console.log("Balance restante:", ethers.formatUnits(userInfo.availableBalance, 6), "USDT");
```

---

## 🏛️ Testes de Governança

### Teste 1: Timelock Proposal

```javascript
// Apenas multisig pode fazer proposals
const multisig = await contract.multisig();
console.log("Multisig:", multisig);

// Propor uso de emergency reserve
const amount = ethers.parseUnits("5000", 6); // $5000
const destination = 0; // LIQUIDITY

const proposalId = await contract.proposeEmergencyReserve(
  amount,
  "Injeção de liquidez para testes",
  destination,
  ethers.ZeroAddress
);

console.log("Proposal ID:", proposalId);

// Verificar proposal
const proposal = await contract.timelockProposals(proposalId);
console.log("Amount:", ethers.formatUnits(proposal.amount, 6), "USDT");
console.log("Proposed at:", new Date(Number(proposal.proposedAt) * 1000));
console.log("Execute after:", new Date(Number(proposal.executeAfter) * 1000));
console.log("Executed:", proposal.executed);
```

### Teste 2: Execute Proposal (após 24h)

```javascript
// Após 24 horas, executar
const proposalId = 1; // ID da proposal

try {
  const tx = await contract.executeEmergencyReserve(proposalId);
  await tx.wait();
  console.log("✅ Proposal executada!");
} catch (error) {
  console.log("❌ Erro:", error.message);
  // Se ainda não passaram 24h: "Timelock not yet expired"
}
```

### Teste 3: Cancel Proposal

```javascript
// Cancelar proposal (apenas multisig)
const proposalId = 1;

const tx = await contract.cancelEmergencyReserve(proposalId);
await tx.wait();

console.log("✅ Proposal cancelada!");
```

---

## 📡 Monitoramento Contínuo

### Monitor em Background

```bash
# Linux/Mac
nohup node monitoring/monitor.js > monitor.log 2>&1 &

# Windows
start /B node monitoring/monitor.js > monitor.log 2>&1
```

### Ver Logs do Monitor

```bash
tail -f monitor.log  # Linux/Mac
type monitor.log     # Windows
```

### Alertas Importantes

O monitor vai alertar sobre:
- 🔴 **Solvency < 110%** - CRITICAL
- ⚠️ **Solvency < 130%** - WARNING
- ⚠️ **Emergency Reserve < $1k** - LOW
- ⚠️ **Deposit Cap > 90%** - NEAR LIMIT
- ⚠️ **User Limit > 90%** - NEAR LIMIT
- 🚨 **Circuit Breaker ATIVO**

---

## 🎯 Checklist de Testes Completo

### Semana 1: Básico
- [ ] Verificar deployment
- [ ] Iniciar monitor
- [ ] Obter USDT testnet
- [ ] Registrar 3-5 usuários
- [ ] Pagar assinaturas
- [ ] Verificar distribuição MLM
- [ ] Testar withdrawals

### Semana 2: Limites
- [ ] Testar deposit cap ($100k)
- [ ] Testar user limit (100)
- [ ] Testar withdrawal limits ($10k/tx, $50k/mês)
- [ ] Verificar emergency reserve

### Semana 3: Segurança
- [ ] Simular baixa solvency
- [ ] Testar circuit breaker ativação
- [ ] Testar circuit breaker recuperação
- [ ] Testar pause/unpause

### Semana 4: Governança
- [ ] Criar proposal emergency reserve
- [ ] Aguardar timelock (24h)
- [ ] Executar proposal
- [ ] Cancelar proposal

### Semana 5+: Stress Testing
- [ ] Registrar muitos usuários
- [ ] Criar árvore MLM profunda
- [ ] Testar ranks e upgrades
- [ ] Testar performance bonuses
- [ ] Verificar gas costs
- [ ] Testar cenários extremos

---

## 🔧 Scripts Úteis

### Ver Estado Completo

```bash
npx hardhat run explore_contract.js --network bscTestnet
```

### Testes Básicos

```bash
npx hardhat run test_basic_flow.js --network bscTestnet
```

### Monitor

```bash
node monitoring/monitor.js
```

### Console Interativo

```bash
npx hardhat console --network bscTestnet
```

---

## ⚠️ Avisos Importantes

1. **Testnet Only**: Todos estes testes são para TESTNET apenas
2. **Gas**: Mantenha BNB suficiente para gas (~0.1 BNB)
3. **USDT**: Use USDT testnet ou mock
4. **Multisig**: Em testnet, multisig = deployer. Em mainnet, deve ser Gnosis Safe
5. **Timelock**: 24 horas é muito tempo. Para testes, considere reduzir
6. **Circuit Breaker**: Simular ativação requer manipular balances (avançado)

---

## 📚 Recursos Adicionais

- **Contrato**: https://testnet.bscscan.com/address/0xe678A271c096EF9CFE296243e022deaFBE05f4Ea
- **USDT Testnet**: https://testnet.bscscan.com/address/0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
- **BNB Faucet**: https://testnet.bnbchain.org/faucet-smart
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org

---

**🎉 Bons testes!**
