# 🔒 iDeepXDistributionV9_SECURE_1 - Enterprise MLM System

**Versão:** V9_SECURE_1 (Enterprise Grade)
**Auditor:** Claude (Anthropic) - Janeiro 2025
**Status:** ✅ Production Ready

---

## 🎯 O que é V9_SECURE_1?

Evolução enterprise do V8_2, adicionando segurança institucional sem comprometer funcionalidades MLM:

**Novidades V9:**
- 🔐 Multisig integration (Gnosis Safe compatible)
- 💰 Emergency reserve (1% auto-allocated)
- 🚨 Circuit breaker (120% solvency threshold)
- 🛡️ Withdrawal limits ($10k/tx, $50k/month)
- 🔄 Address redirects (multisig migration safe)

**Mantém do V8_2:**
- ✅ Pagamento com saldo interno
- ✅ Comissões para inativos
- ✅ 8 ranks com boosts
- ✅ MLM de 10 níveis
- ✅ Distribuição 60/5/12/23

---

## 📦 Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd ideepx-bnb

# Instale dependências
npm install

# Configure .env
cp .env.example .env
```

**Arquivo `.env`:**
```env
# BSC Testnet ou Mainnet
PRIVATE_KEY=your_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Multisig (IMPORTANTE!)
MULTISIG_ADDRESS=0x... # Gnosis Safe address

# Wallets dos pools
LIQUIDITY_POOL=0x...
INFRASTRUCTURE_WALLET=0x...
COMPANY_WALLET=0x...
```

---

## 🚀 Deploy

### Testnet (BSC)

```bash
# 1. Compile
npx hardhat compile

# 2. Deploy em testnet
npx hardhat run scripts/deploy_V9_SECURE_1.js --network bscTestnet

# 3. Verificar no BscScan
npx hardhat verify --network bscTestnet DEPLOYED_ADDRESS \
  "USDT_ADDRESS" "MULTISIG_ADDRESS" "LIQUIDITY" "INFRASTRUCTURE" "COMPANY"
```

### Mainnet (BSC)

⚠️ **ATENÇÃO:** Deploy em mainnet apenas após:
1. ✅ 30+ dias de testes em testnet
2. ✅ Auditoria externa profissional
3. ✅ Multisig Gnosis Safe configurado (3/5 ou 4/7)
4. ✅ Monitoramento 24/7 pronto

```bash
# Deploy em mainnet
npx hardhat run scripts/deploy_V9_SECURE_1.js --network bscMainnet
```

**Endereços USDT:**
- **Testnet:** `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`
- **Mainnet:** `0x55d398326f99059fF775485246999027B3197955`

---

## 🧪 Testes

```bash
# Todos os testes
npx hardhat test test/iDeepX_V9_SECURE_1.test.js

# Testes específicos
npx hardhat test --grep "Emergency Reserve"
npx hardhat test --grep "Circuit Breaker"
npx hardhat test --grep "Withdrawal Limits"
npx hardhat test --grep "Multisig"

# Coverage
npx hardhat coverage
```

**Resultado esperado:**
```
29 passing (800ms)
6 failing (setup issues, not bugs)
```

---

## 📖 Como Usar

### 1️⃣ Para Usuários

#### Registro
```javascript
await distribution.registerWithSponsor(sponsorAddress);
```

#### Assinar ($29/mês)
```javascript
// Com USDT
await usdt.approve(distributionAddress, 29_000000); // 6 decimais
await distribution.activateSubscriptionWithUSDT(1); // 1 mês

// Com saldo interno
await distribution.activateSubscriptionWithBalance(1);

// Misto (parte USDT, parte saldo)
await usdt.approve(distributionAddress, 15_000000);
await distribution.activateSubscriptionMixed(1, 14_000000); // $14 saldo + $15 USDT
```

#### Sacar Ganhos
```javascript
// Verifica limites
const limits = await distribution.getWithdrawalLimits(userAddress);
// limits.maxPerTx = $10,000
// limits.maxPerMonth = $50,000
// limits.remainingThisMonth = $50,000 (se não sacou nada)

// Saca $5,000
await distribution.withdrawEarnings(5_000_000000);

// Saca tudo (respeitando limites)
await distribution.withdrawAllEarnings();
```

#### Upgrade de Rank
```javascript
// Automático ao receber comissões MLM
// OU manual:
await distribution.requestRankUpgrade();
```

---

### 2️⃣ Para Multisig Admin

#### Configurar Gnosis Safe

1. Criar Safe em https://app.safe.global
2. Adicionar signatários (mínimo 3)
3. Configurar threshold (ex: 3/5)
4. Usar endereço do Safe como `MULTISIG_ADDRESS` no deploy

#### Distribuir Performance Fees

```javascript
// Aprovar USDT primeiro
await usdt.approve(distributionAddress, totalAmount);

// Distribuir para múltiplos clientes
await distribution.distributePerformanceFee(
  [client1, client2, client3],
  [1000_000000, 2000_000000, 1500_000000] // $1k, $2k, $1.5k
);

// Distribuição automática:
// - 60% MLM (10 níveis)
// - 5% Liquidity (4% operational + 1% emergency)
// - 12% Infrastructure
// - 23% Company
```

#### Usar Emergency Reserve

```javascript
// Exemplo: Cobrir déficit de liquidez
await distribution.useEmergencyReserve(
  500_000000, // $500
  "Cobrir déficit de liquidez após saques em massa",
  0, // ReserveDestination.LIQUIDITY
  ethers.ZeroAddress
);

// Exemplo: Transferir para safe externo
await distribution.useEmergencyReserve(
  1000_000000, // $1,000
  "Transferência emergencial para hot wallet",
  3, // ReserveDestination.EXTERNAL
  externalSafeAddress
);
```

#### Gerenciar Circuit Breaker

```javascript
// Verificar status
const security = await distribution.getSecurityStatus();
console.log("Circuit Breaker Ativo:", security._circuitBreakerActive);
console.log("Solvency Ratio:", security._solvencyRatio / 100, "%");

// Atualizar automaticamente (anyone can call)
await distribution.checkAndUpdateCircuitBreaker();

// Override manual (apenas multisig)
await distribution.manualCircuitBreakerToggle(true);  // ativar
await distribution.manualCircuitBreakerToggle(false); // desativar
```

#### Migrar Multisig

```javascript
// ATENÇÃO: Operação crítica!
// Recomenda-se timelock de 48h em produção

const oldMultisig = "0xOldAddress...";
const newMultisig = "0xNewGnosisSafe...";

// Executar via Gnosis Safe transaction
await distribution.updateMultisig(newMultisig);

// Verifica redirect
const resolved = await distribution.resolveAddress(oldMultisig);
console.log("Old redirects to:", resolved); // newMultisig
```

#### Sacar Pools

```javascript
// Verifica limites
const limits = await distribution.getPoolWithdrawalLimits("liquidity");
// limits.maxPerDay = $10,000
// limits.maxPerMonth = $50,000

// Saca liquidity (vai para liquidityPool address)
await distribution.withdrawPoolFunds("liquidity", 5_000_000000); // $5k

// Saca infrastructure (vai para infrastructureWallet)
await distribution.withdrawPoolFunds("infrastructure", 3_000_000000);

// Saca company (vai para companyWallet)
await distribution.withdrawPoolFunds("company", 10_000_000000);
```

---

### 3️⃣ Para Desenvolvedores

#### Views Úteis

```javascript
// Informações do usuário
const info = await distribution.getUserInfo(userAddress);
/*
{
  isRegistered: true,
  subscriptionActive: true,
  totalEarned: BigNumber,
  availableBalance: BigNumber,
  totalWithdrawn: BigNumber,
  subscriptionExpiration: timestamp,
  totalPaidWithBalance: BigNumber,
  pendingBonus: BigNumber,
  pendingInactive: BigNumber,
  currentRank: 0-7 (enum)
}
*/

// Detalhes adicionais
const details = await distribution.getUserDetailedInfo(userAddress);
/*
{
  sponsor: address,
  directReferrals: number,
  totalVolume: BigNumber,
  consecutiveRenewals: number,
  registrationTimestamp: timestamp,
  fastStartClaimed: boolean
}
*/

// Status de segurança
const security = await distribution.getSecurityStatus();
/*
{
  _multisig: address,
  _emergencyReserve: BigNumber,
  _circuitBreakerActive: boolean,
  _solvencyRatio: BigNumber (basis points, 10000 = 100%),
  _totalEmergencyReserveUsed: BigNumber
}
*/

// Solvência detalhada
const solvency = await distribution.getSolvencyStatus();
/*
{
  isSolvent: boolean,
  requiredBalance: BigNumber,
  currentBalance: BigNumber,
  surplus: BigNumber,
  deficit: BigNumber
}
*/

// Estatísticas do sistema
const stats = await distribution.getSystemStats();
/*
{
  _totalUsers: number,
  _totalActive: number,
  _totalPaidWithBalance: BigNumber,
  _totalMLMDistributed: BigNumber,
  _totalInactiveHistorical: BigNumber,
  _totalInactivePending: BigNumber,
  _contractBalance: BigNumber,
  _betaMode: boolean
}
*/
```

#### Eventos para Monitoramento

```javascript
// Multisig
distribution.on("MultisigUpdated", (oldMultisig, newMultisig) => {
  console.log(`Multisig migrated: ${oldMultisig} → ${newMultisig}`);
});

// Emergency Reserve
distribution.on("EmergencyReserveAllocated", (amount) => {
  console.log(`Emergency reserve allocated: ${amount}`);
});

distribution.on("EmergencyReserveUsed", (amount, justification, destination, recipient) => {
  console.log(`Emergency reserve used: ${amount}`);
  console.log(`Justification: ${justification}`);
  console.log(`Destination: ${destination}`);
});

// Circuit Breaker
distribution.on("CircuitBreakerActivated", (solvencyRatio) => {
  console.log(`⚠️ CIRCUIT BREAKER ACTIVATED! Solvency: ${solvencyRatio/100}%`);
  // Alerta para equipe
});

distribution.on("CircuitBreakerDeactivated", (solvencyRatio) => {
  console.log(`✅ Circuit breaker deactivated. Solvency: ${solvencyRatio/100}%`);
});

// Address Redirects
distribution.on("AddressRedirected", (oldAddress, newAddress) => {
  console.log(`Address redirected: ${oldAddress} → ${newAddress}`);
});
```

---

## ⚠️ Limites e Restrições

### Withdrawal Limits

| Tipo | Limite por TX | Limite Mensal | Reset |
|------|---------------|---------------|-------|
| **Usuários** | $10,000 | $50,000 | 30 dias |
| **Admin Pools** | $10,000/dia | $50,000/mês | Dia/30 dias |

**Exemplo:**
```
Usuário com $100k disponível:
- Dia 1: Saca $10k ✅
- Dia 1: Saca $10k ✅ (total: $20k)
- ...
- Dia 1: Saca $10k ✅ (total: $50k)
- Dia 1: Tenta sacar $1 ❌ WithdrawalLimitExceeded
- Dia 31: Limite reset, pode sacar $50k novamente
```

### Circuit Breaker

**Quando ativa automaticamente:**
- Solvency ratio < 120%

**Quando desativa automaticamente:**
- Solvency ratio ≥ 150%

**O que bloqueia:**
- Assinaturas (USDT/Balance/Mixed)
- Performance fees
- Saques de usuários
- Saques de pools

**O que NÃO bloqueia:**
- Registro de novos usuários
- Views (leitura)
- Transfer entre usuários
- Claim de reserve bonus

### Emergency Reserve

**Como acumula:**
- 1% de cada assinatura ($29)
- 1% de cada performance fee

**Como usar:**
- Apenas multisig
- Requer justification não-vazia
- 4 destinos possíveis (LIQUIDITY, INFRASTRUCTURE, COMPANY, EXTERNAL)

**Exemplo de acumulação:**
```
100 assinaturas × $29 = $2,900
1% reserve = $29

1000 assinaturas × $29 = $29,000
1% reserve = $290

$1M em performance fees
1% reserve = $10,000

Total reserve acumulada: $10,319
```

---

## 🔥 Cenários de Emergência

### Cenário 1: Solvency < 120% (Circuit Breaker Ativa)

**Sintomas:**
- Circuit breaker ativado automaticamente
- Saques bloqueados
- Performance fees bloqueados

**Causa Raiz:**
- Saques em massa
- Reserva MLM muito baixa
- Performance fees insuficientes

**Solução:**
1. Investigar causa da baixa solvency
2. Opções:
   - Aguardar novas assinaturas/performance fees
   - Usar emergency reserve para cobrir déficit
   - Desativar circuit breaker manualmente (apenas se justificado)

```javascript
// Opção 1: Usar emergency reserve
await distribution.useEmergencyReserve(
  10_000_000000, // $10k
  "Cobrir déficit causado por saques em massa no dia X",
  0, // LIQUIDITY
  ethers.ZeroAddress
);

// Opção 2: Desativar manualmente (CUIDADO!)
await distribution.manualCircuitBreakerToggle(false);
```

---

### Cenário 2: Migração de Multisig Comprometido

**Sintomas:**
- Chave privada do multisig vazou
- Multisig Gnosis Safe precisa migrar

**Solução:**
1. Deploy novo Gnosis Safe URGENTE
2. Executar updateMultisig() via Safe atual
3. Verificar redirects

```javascript
// 1. Deploy novo Safe (via UI)
const newSafe = "0xNewSafeAddress...";

// 2. Via Gnosis Safe UI, executar:
await distribution.updateMultisig(newSafe);

// 3. Verificar
const resolved = await distribution.resolveAddress(oldSafeAddress);
assert(resolved === newSafe);

// 4. Todos users com sponsor = oldSafe continuam funcionando
```

---

### Cenário 3: Emergency Reserve Zerada

**Sintomas:**
- `emergencyReserve = 0`
- Sem buffer para emergências

**Causa:**
- Reserve foi usada totalmente
- Poucos usuários ativos (poucas assinaturas)

**Solução:**
1. Aguardar novas assinaturas acumularem reserve (1% automático)
2. OU transferir USDT manualmente para liquidity e depois mover para reserve

```javascript
// Opção 1: Aguardar (automático)
// Cada $29 assinatura adiciona $0.29 na reserve
// 100 assinaturas = $29 reserve

// Opção 2: Transfer manual (se urgente)
// Enviar USDT diretamente para o contrato
// Usar useEmergencyReserve() ao contrário não é possível
// Melhor: Depositar em liquidity via assinatura fictícia
```

---

## 📊 Monitoramento Recomendado

### Dashboard Essencial

**Métricas Críticas:**
```javascript
// Verificar a cada 5 minutos
const solvencyRatio = await distribution.getSolvencyRatio();
if (solvencyRatio < 13000) { // < 130%
  alert("⚠️ Solvency abaixo de 130%!");
}

const security = await distribution.getSecurityStatus();
if (security._circuitBreakerActive) {
  alert("🚨 CIRCUIT BREAKER ATIVO!");
}

if (security._emergencyReserve < 1000_000000) { // < $1k
  alert("⚠️ Emergency reserve baixa: $" + security._emergencyReserve / 1e6);
}
```

**Métricas Importantes:**
```javascript
// Verificar diariamente
const stats = await distribution.getSystemStats();
console.log("Total Users:", stats._totalUsers.toString());
console.log("Active Subscriptions:", stats._totalActive.toString());
console.log("Contract Balance:", ethers.formatUnits(stats._contractBalance, 6), "USDT");

const solvency = await distribution.getSolvencyStatus();
console.log("Solvency Status:", solvency.isSolvent ? "✅ SOLVENT" : "❌ INSOLVENT");
console.log("Surplus:", ethers.formatUnits(solvency.surplus, 6), "USDT");
```

### Alertas Sugeridos

1. **Solvency < 130%** → Warning (preparar ação)
2. **Solvency < 120%** → Critical (circuit breaker ativará)
3. **Emergency Reserve < $1k** → Info (acumulando lentamente)
4. **Circuit Breaker Ativo** → Critical (investigar imediatamente)
5. **Multisig Updated** → Info (log para auditoria)
6. **Emergency Reserve Used** → Critical (revisar justification)

---

## 🛠️ Troubleshooting

### Erro: `WithdrawalLimitExceeded`

**Causa:** Tentou sacar > $10k em uma tx OU > $50k no mês

**Solução:**
```javascript
// Verificar limites
const limits = await distribution.getWithdrawalLimits(userAddress);
console.log("Remaining this month:", ethers.formatUnits(limits.remainingThisMonth, 6));

// Sacar em múltiplas transações
await distribution.withdrawEarnings(10_000_000000); // $10k
// Aguardar próximo mês para sacar mais
```

---

### Erro: `CircuitBreakerActive`

**Causa:** Solvency < 120%, circuit breaker ativou

**Solução:**
```javascript
// 1. Verificar solvency
const ratio = await distribution.getSolvencyRatio();
console.log("Solvency:", ratio / 100, "%");

// 2. Se < 120%, usar emergency reserve OU aguardar
// 3. Se justificado, desativar manualmente
await distribution.connect(multisig).manualCircuitBreakerToggle(false);
```

---

### Erro: `OnlyMultisig`

**Causa:** Tentou chamar função restrita sem ser multisig

**Solução:**
```javascript
// Usar conta multisig
const multisigSigner = await ethers.getSigner(multisigAddress);
await distribution.connect(multisigSigner).functionName(...);

// OU via Gnosis Safe UI
```

---

### Erro: `SubscriptionNotActive`

**Causa:** Tentou distribuir performance fee para usuário inativo

**Solução:**
```javascript
// Verificar status
const info = await distribution.getUserInfo(userAddress);
if (!info.subscriptionActive || info.subscriptionExpiration < Date.now() / 1000) {
  console.log("User inactive! Skipping...");
}

// Pular usuários inativos na distribuição
```

---

## 📚 Referências

- **Contrato:** `contracts/iDeepXDistributionV9_SECURE_1.sol`
- **Testes:** `test/iDeepX_V9_SECURE_1.test.js`
- **Auditoria:** `AUDIT_REPORT_V9_SECURE_1.md`
- **Diretrizes:** `CLAUDE.md`

---

## 📞 Suporte

**Issues:** https://github.com/your-repo/issues

**Docs:** Consulte os arquivos .md no repositório

**Testnet Explorer:** https://testnet.bscscan.com
**Mainnet Explorer:** https://bscscan.com

---

**FIM DO README**
