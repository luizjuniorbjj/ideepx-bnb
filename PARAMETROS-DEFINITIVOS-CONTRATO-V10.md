# 📊 PARÂMETROS DEFINITIVOS - CONTRATO V10

**100% IGUAL AO CONTRATO DEPLOYADO**

**Contrato:** `iDeepXDistributionV2.sol`
**Data da análise:** 2025-11-05
**Status:** DEFINITIVO - USAR ESTES VALORES

---

## 💰 VALORES FIXOS (CONSTANTS)

### **1. ASSINATURA MENSAL**
```solidity
// Linha 22
uint256 public constant SUBSCRIPTION_FEE = 29 * 10**6; // $29 USDT
```
**VALOR:** $29.00 USDT (6 decimais)

---

### **2. BÔNUS DIRETO**
```solidity
// Linha 34
uint256 public constant DIRECT_BONUS = 5 * 10**6; // $5 USDT
```
**VALOR:** $5.00 USDT (6 decimais)
**QUANDO:** Pago ao sponsor apenas em `registerAndSubscribe()`

---

### **3. DURAÇÃO DA ASSINATURA**
```solidity
// Linha 25
uint256 public constant SUBSCRIPTION_DURATION = 30 days;
```
**VALOR:** 30 dias (2,592,000 segundos)

---

### **4. SAQUE MÍNIMO**
```solidity
// Linha 31
uint256 public constant MIN_WITHDRAWAL = 5 * 10**6; // $5 USDT
```
**VALOR:** $5.00 USDT mínimo para sacar

---

### **5. BATCH MÁXIMO**
```solidity
// Linha 28
uint256 public constant MAX_BATCH_SIZE = 50;
```
**VALOR:** Máximo 50 clientes por batch (evita out of gas)

---

### **6. HISTÓRICO MÁXIMO**
```solidity
// Linha 37
uint256 public constant MAX_HISTORY_PER_USER = 100;
```
**VALOR:** 100 últimos ganhos salvos por usuário (FIFO)

---

### **7. NÍVEIS MLM**
```solidity
// Linha 40
uint256 public constant MLM_LEVELS = 10;
```
**VALOR:** 10 níveis de profundidade

---

## 📊 PERCENTUAIS DE DISTRIBUIÇÃO

### **PERFORMANCE FEE - DIVISÃO PRINCIPAL**

```solidity
// Linhas 53-56
uint256 public constant MLM_POOL_PERCENTAGE = 6000;      // 60%
uint256 public constant LIQUIDITY_PERCENTAGE = 500;      // 5%
uint256 public constant INFRASTRUCTURE_PERCENTAGE = 1200; // 12%
uint256 public constant COMPANY_PERCENTAGE = 2300;       // 23%
```

**IMPORTANTE:** Basis points (100 = 1%)

**DISTRIBUIÇÃO TOTAL:**
- 60% → Pool MLM (distribuído nos 10 níveis)
- 5% → Pool de Liquidez
- 12% → Carteira de Infraestrutura
- 23% → Carteira da Empresa
- **TOTAL:** 100%

---

## 🎯 PERCENTUAIS MLM - MODO BETA

### **PERCENTUAIS BETA (Atual - betaMode = true)**

```solidity
// Linhas 59-70
uint256[10] public mlmPercentagesBeta = [
    600,  // L1: 6%
    300,  // L2: 3%
    250,  // L3: 2.5%
    200,  // L4: 2%
    100,  // L5: 1%
    100,  // L6: 1%
    100,  // L7: 1%
    100,  // L8: 1%
    100,  // L9: 1%
    100   // L10: 1%
];
```

**PERCENTUAIS EM RELAÇÃO AO POOL MLM (60%):**
- Nível 1: 6% do total da performance fee
- Nível 2: 3% do total da performance fee
- Nível 3: 2.5% do total da performance fee
- Nível 4: 2% do total da performance fee
- Níveis 5-10: 1% cada do total da performance fee

**TOTAL DISTRIBUÍDO:** 16.5% do total da performance fee

⚠️ **ATENÇÃO:** Do pool MLM de 60%, apenas 16.5% é distribuído!
**SOBRA:** 43.5% não é distribuído (fica retido)

---

## 🎯 PERCENTUAIS MLM - MODO PERMANENTE

### **PERCENTUAIS PERMANENTE (Futuro - betaMode = false)**

```solidity
// Linhas 73-84
uint256[10] public mlmPercentagesPermanent = [
    400,  // L1: 4%
    200,  // L2: 2%
    150,  // L3: 1.5%
    100,  // L4: 1%
    100,  // L5: 1%
    100,  // L6: 1%
    100,  // L7: 1%
    100,  // L8: 1%
    100,  // L9: 1%
    100   // L10: 1%
];
```

**PERCENTUAIS EM RELAÇÃO AO TOTAL:**
- Nível 1: 4% do total da performance fee
- Nível 2: 2% do total da performance fee
- Nível 3: 1.5% do total da performance fee
- Nível 4: 1% do total da performance fee
- Níveis 5-10: 1% cada do total da performance fee

**TOTAL DISTRIBUÍDO:** 11% do total da performance fee

⚠️ **ATENÇÃO:** Do pool MLM de 60%, apenas 11% é distribuído!
**SOBRA:** 49% não é distribuído (fica retido)

---

## 💵 EXEMPLO COMPLETO: PERFORMANCE FEE DE $100

### **MODO BETA (Atual)**

**DISTRIBUIÇÃO PRINCIPAL ($100):**
```
Total Performance Fee: $100.00

├─ 60% → Pool MLM:           $60.00
├─ 5% → Pool Liquidez:       $5.00
├─ 12% → Infraestrutura:     $12.00
└─ 23% → Empresa:            $23.00
```

**DISTRIBUIÇÃO MLM ($60 disponível):**
```
Pool MLM: $60.00

MLM distribuído aos sponsors:
├─ Nível 1 (6%):   $6.00  → Sponsor direto
├─ Nível 2 (3%):   $3.00  → Sponsor do L1
├─ Nível 3 (2.5%): $2.50  → Sponsor do L2
├─ Nível 4 (2%):   $2.00  → Sponsor do L3
├─ Nível 5 (1%):   $1.00  → Sponsor do L4
├─ Nível 6 (1%):   $1.00  → Sponsor do L5
├─ Nível 7 (1%):   $1.00  → Sponsor do L6
├─ Nível 8 (1%):   $1.00  → Sponsor do L7
├─ Nível 9 (1%):   $1.00  → Sponsor do L8
└─ Nível 10 (1%):  $1.00  → Sponsor do L9

TOTAL DISTRIBUÍDO: $16.50

⚠️ RETIDO: $60.00 - $16.50 = $43.50
(Não é distribuído - fica no pool)
```

**RESUMO FINAL:**
```
Performance Fee de $100.00:

├─ $16.50 → Comissões MLM (10 sponsors)
├─ $5.00  → Pool Liquidez
├─ $12.00 → Infraestrutura
├─ $23.00 → Empresa
└─ $43.50 → RETIDO (pool MLM não distribuído)

TOTAL: $100.00
```

---

### **MODO PERMANENTE (Futuro)**

**DISTRIBUIÇÃO MLM ($60 disponível):**
```
Pool MLM: $60.00

MLM distribuído aos sponsors:
├─ Nível 1 (4%):   $4.00  → Sponsor direto
├─ Nível 2 (2%):   $2.00  → Sponsor do L1
├─ Nível 3 (1.5%): $1.50  → Sponsor do L2
├─ Nível 4 (1%):   $1.00  → Sponsor do L3
├─ Nível 5 (1%):   $1.00  → Sponsor do L4
├─ Nível 6 (1%):   $1.00  → Sponsor do L5
├─ Nível 7 (1%):   $1.00  → Sponsor do L6
├─ Nível 8 (1%):   $1.00  → Sponsor do L7
├─ Nível 9 (1%):   $1.00  → Sponsor do L8
└─ Nível 10 (1%):  $1.00  → Sponsor do L9

TOTAL DISTRIBUÍDO: $11.00

⚠️ RETIDO: $60.00 - $11.00 = $49.00
```

**RESUMO FINAL (Permanente):**
```
Performance Fee de $100.00:

├─ $11.00 → Comissões MLM (10 sponsors)
├─ $5.00  → Pool Liquidez
├─ $12.00 → Infraestrutura
├─ $23.00 → Empresa
└─ $49.00 → RETIDO (pool MLM não distribuído)

TOTAL: $100.00
```

---

## 🔄 FLUXOS DE DINHEIRO COMPLETOS

### **FLUXO 1: REGISTRO SIMPLES (selfRegister)**

```
Usuário chama: selfRegister(sponsorAddress)

PAGAMENTO: $0 (grátis)

RESULTADO:
├─ Usuário registrado ✅
├─ Sponsor ganha +1 referral direto ✅
└─ subscriptionActive = false ❌
```

**NÃO HÁ PAGAMENTO!**

---

### **FLUXO 2: ATIVAÇÃO SIMPLES (selfSubscribe)**

```
Usuário chama: selfSubscribe()

PAGAMENTO: $29 USDT

ORIGEM: Carteira do usuário
DESTINO: companyWallet

RESULTADO:
├─ Assinatura ativa por 30 dias ✅
├─ subscriptionActive = true ✅
└─ Sponsor NÃO recebe bônus direto ❌
```

**TOTAL PAGO:** $29.00 USDT

---

### **FLUXO 3: COMBO (registerAndSubscribe) ⭐ RECOMENDADO**

```
Usuário chama: registerAndSubscribe(sponsorAddress)

PAGAMENTO TOTAL: $34 USDT ($29 + $5)

DISTRIBUIÇÃO:
├─ $29 USDT → companyWallet (assinatura)
└─ $5 USDT → sponsorAddress (bônus direto)

ORIGEM: Carteira do usuário (precisa aprovar $34)
DESTINOS:
  1. companyWallet recebe $29
  2. sponsor recebe $5

RESULTADO:
├─ Usuário registrado ✅
├─ Assinatura ativa por 30 dias ✅
├─ Sponsor ganha +1 referral direto ✅
├─ Sponsor recebe $5 imediato! ✅
└─ Sponsor.totalEarned += $5 ✅

EVENTOS:
├─ UserRegistered(user, sponsor)
├─ SubscriptionActivated(user, $29, expiration)
└─ DirectBonusPaid(sponsor, user, $5)
```

**TOTAL PAGO:** $34.00 USDT

**VANTAGENS DO COMBO:**
- ✅ 1 transação em vez de 2 (economia de gas)
- ✅ Sponsor recebe $5 bônus direto
- ✅ Mais rápido e eficiente

---

### **FLUXO 4: RENOVAÇÃO (renewSubscription)**

```
Usuário chama: renewSubscription()

REQUISITOS:
├─ Estar registrado ✅
├─ subscriptionActive = true ✅
└─ Próximo de expirar (≤ 7 dias) OU já expirou ✅

PAGAMENTO: $29 USDT

ORIGEM: Carteira do usuário
DESTINO: companyWallet

LÓGICA:
SE já expirou:
  └─ Nova expiração = agora + 30 dias
SE ainda ativo (7 dias antes):
  └─ Nova expiração = expiração atual + 30 dias

RESULTADO:
├─ Assinatura renovada por mais 30 dias ✅
└─ Sponsor NÃO recebe nada ❌

EVENTO:
└─ SubscriptionRenewed(user, $29, newExpiration)
```

**TOTAL PAGO:** $29.00 USDT

⚠️ **IMPORTANTE:** Pode renovar até 7 dias ANTES de expirar!

---

### **FLUXO 5: PROCESSAMENTO DE PERFORMANCE FEE**

```
Admin chama: batchProcessPerformanceFees([cliente], [amount])

ORIGEM: Carteira do ADMIN (msg.sender)
REQUISITO: Admin deve ter USDT e ter aprovado o total

EXEMPLO: 1 cliente, performance fee de $100

PASSO 1 - Admin transfere para pools:
├─ $5 → liquidityPool
├─ $12 → infrastructureWallet
└─ $23 → companyWallet

PASSO 2 - Admin transfere MLM para CONTRATO:
└─ $16.50 → address(this) [contrato]

PASSO 3 - Contrato distribui internamente:
├─ users[L1].totalEarned += $6.00
├─ users[L2].totalEarned += $3.00
├─ users[L3].totalEarned += $2.50
├─ users[L4].totalEarned += $2.00
├─ users[L5].totalEarned += $1.00
├─ users[L6].totalEarned += $1.00
├─ users[L7].totalEarned += $1.00
├─ users[L8].totalEarned += $1.00
├─ users[L9].totalEarned += $1.00
└─ users[L10].totalEarned += $1.00

ORIGEM DOS FUNDOS:
└─ Carteira do ADMIN (msg.sender)
   └─ Admin coletou performance fees dos clientes (off-chain)

TOTAL QUE ADMIN PRECISA TER:
└─ $56.50 USDT aprovados para o contrato
   ├─ $5.00 → liquidityPool
   ├─ $12.00 → infrastructureWallet
   ├─ $23.00 → companyWallet
   └─ $16.50 → contrato (MLM)

EVENTOS EMITIDOS (por cliente de $100):
├─ PoolDistribution(liquidityPool, $5, "Liquidity")
├─ PoolDistribution(infrastructureWallet, $12, "Infrastructure")
├─ PoolDistribution(companyWallet, $23, "Company")
├─ MLMCommissionPaid(L1, cliente, 1, $6.00)
├─ MLMCommissionPaid(L2, cliente, 2, $3.00)
├─ MLMCommissionPaid(L3, cliente, 3, $2.50)
├─ MLMCommissionPaid(L4, cliente, 4, $2.00)
├─ MLMCommissionPaid(L5, cliente, 5, $1.00)
├─ MLMCommissionPaid(L6, cliente, 6, $1.00)
├─ MLMCommissionPaid(L7, cliente, 7, $1.00)
├─ MLMCommissionPaid(L8, cliente, 8, $1.00)
├─ MLMCommissionPaid(L9, cliente, 9, $1.00)
├─ MLMCommissionPaid(L10, cliente, 10, $1.00)
└─ PerformanceFeeDistributed(cliente, $100, $60)

TOTAL DE EVENTOS: 14 eventos
```

**⚠️ CRÍTICO:**
- Admin paga de seu próprio bolso
- Admin deve coletar performance fees dos clientes ANTES (off-chain)
- Se qualquer transferência falhar, REVERTE TUDO
- Transação atômica (tudo ou nada)

---

### **FLUXO 6: SAQUE (withdrawEarnings)**

```
Usuário chama: withdrawEarnings()

REQUISITO:
├─ totalEarned - totalWithdrawn ≥ $5 ✅
└─ Usuário não pausado ✅

CÁLCULO:
available = totalEarned - totalWithdrawn

AÇÃO:
├─ users[msg.sender].totalWithdrawn += available
├─ totalWithdrawn += available (global)
└─ USDT.transfer(msg.sender, available)

ORIGEM: CONTRATO (address(this))
DESTINO: Carteira do usuário

RESULTADO:
└─ Usuário recebe TODO o saldo disponível

EVENTO:
└─ EarningsWithdrawn(user, available)
```

**SALDO DISPONÍVEL:**
```
Disponível = totalEarned - totalWithdrawn
```

**MÍNIMO:** $5.00 USDT

---

### **FLUXO 7: SAQUE PARCIAL (withdrawPartial)**

```
Usuário chama: withdrawPartial(amount)

REQUISITOS:
├─ amount ≥ $5 ✅
├─ amount ≤ disponível ✅
└─ Usuário não pausado ✅

MESMO FLUXO do withdrawEarnings, mas valor parcial

RESULTADO:
└─ Usuário recebe valor escolhido
└─ Resto fica disponível para sacar depois
```

---

## 🎯 REGRAS CRÍTICAS DO CONTRATO

### **REGRA 1: QUEM RECEBE COMISSÕES MLM?**

```solidity
// Função _distributeMLM (linhas 440-470)
// NÃO verifica se sponsor está ativo!

for (uint256 level = 0; level < MLM_LEVELS; level++) {
    if (currentSponsor == address(0)) break;

    // Calcula e paga - NÃO verifica subscriptionActive!
    users[currentSponsor].totalEarned += commission;

    currentSponsor = users[currentSponsor].sponsor;
}
```

**✅ SPONSOR RECEBE SE:**
- Está registrado no sistema (isRegistered = true)
- Está na upline do cliente que gerou fee

**❌ SPONSOR NÃO PRECISA:**
- Estar ativo (subscriptionActive pode ser false)
- Ter assinatura válida (pode estar expirada)
- Estar tradando na GMI Edge

**🎯 CONCLUSÃO:**
**SPONSOR INATIVO RECEBE COMISSÕES NORMALMENTE!**

---

### **REGRA 2: O QUE SIGNIFICA "ATIVO"?**

**ATIVO = subscriptionActive = true E não expirou**

```solidity
// Função isSubscriptionActive (linha 622)
function isSubscriptionActive(address user) public view returns (bool) {
    return users[user].subscriptionActive &&
           block.timestamp <= users[user].subscriptionExpiration;
}
```

**PARA ESTAR ATIVO:**
1. ✅ subscriptionActive = true
2. ✅ block.timestamp ≤ subscriptionExpiration

**SE EXPIROU:**
- subscriptionActive ainda pode ser true
- Mas isSubscriptionActive() retorna false
- Precisa chamar expireSubscriptions() para mudar flag

---

### **REGRA 3: PARA QUE SERVE ASSINATURA ATIVA?**

**BENEFÍCIOS DE ESTAR ATIVO:**
1. ✅ Acesso à plataforma GMI Edge (copy trading)
2. ✅ Pode gerar performance fees (trader ativo)
3. ✅ Dashboard completo

**NÃO É NECESSÁRIO PARA:**
1. ❌ Receber comissões MLM (recebe mesmo inativo!)
2. ❌ Sacar comissões (pode sacar a qualquer hora)
3. ❌ Indicar novos usuários (link funciona sempre)

**🎯 CONCLUSÃO:**
Assinatura serve para USAR a plataforma de copy trading.
MLM funciona independente!

---

### **REGRA 4: BATCH PROCESSING**

```solidity
// Linha 379
function batchProcessPerformanceFees(
    address[] calldata clients,
    uint256[] calldata amounts
)
```

**LIMITAÇÕES:**
- ✅ Máximo 50 clientes por batch (MAX_BATCH_SIZE)
- ✅ Arrays devem ter mesmo tamanho
- ✅ Apenas owner pode chamar
- ✅ Precisa estar não pausado

**REVERSÃO:**
Se QUALQUER transferência falhar:
- ❌ REVERTE TUDO
- ❌ Nada é processado
- ❌ Transação atômica (tudo ou nada)

---

### **REGRA 5: HISTÓRICO DE GANHOS**

```solidity
// Linha 37
uint256 public constant MAX_HISTORY_PER_USER = 100;
```

**SISTEMA FIFO (First In, First Out):**
- Salva últimos 100 ganhos
- Quando chega ao 100, remove o mais antigo
- Sempre mantém os 100 mais recentes

**TIPOS DE GANHO:**
```solidity
enum EarningType {
    MLM_COMMISSION,  // Comissão MLM
    DIRECT_BONUS,    // Bônus direto ($5)
    RANK_BONUS       // Futuro (não implementado)
}
```

---

### **REGRA 6: PAUSAS**

**PAUSA GLOBAL (contrato inteiro):**
```solidity
// Linha 581-590
function pause() external onlyOwner
function unpause() external onlyOwner
```

**PAUSA INDIVIDUAL (por usuário):**
```solidity
// Linha 630-642
function pauseUser(address user) external onlyOwner
function unpauseUser(address user) external onlyOwner
```

**QUANDO PAUSADO (global):**
Bloqueia:
- ❌ selfRegister
- ❌ selfSubscribe
- ❌ registerAndSubscribe
- ❌ renewSubscription
- ❌ withdrawEarnings
- ❌ batchProcessPerformanceFees

**QUANDO PAUSADO (individual):**
Bloqueia apenas:
- ❌ withdrawEarnings
- ❌ withdrawPartial

---

### **REGRA 7: EXPIRAÇÃO DE ASSINATURA**

```solidity
// Linha 606
function expireSubscriptions(address[] calldata userAddresses)
```

**QUALQUER UM PODE CHAMAR!**
- Não é onlyOwner
- Verifica se expirou: block.timestamp > subscriptionExpiration
- Se expirou: subscriptionActive = false
- Decrementa totalActiveSubscriptions

**⚠️ IMPORTANTE:**
- Assinatura não expira automaticamente
- Precisa alguém chamar expireSubscriptions()
- Bots devem chamar periodicamente

---

## 📈 ESTATÍSTICAS GLOBAIS

### **VARIÁVEIS DO SISTEMA:**

```solidity
// Linha 143-152
uint256 public totalUsers;                 // Total de usuários registrados
uint256 public totalActiveSubscriptions;   // Total de assinaturas ativas
uint256 public totalMLMDistributed;        // Total distribuído em MLM (acumulado)
uint256 public totalWithdrawn;             // Total sacado por todos (acumulado)
```

**FUNÇÃO DE CONSULTA:**
```solidity
// Linha 790
function getSystemStats() external view returns (
    uint256 _totalUsers,
    uint256 _totalActiveSubscriptions,
    uint256 _totalMLMDistributed,
    bool _betaMode
)
```

---

## 🏗️ ESTRUTURAS DE DADOS

### **STRUCT USER:**
```solidity
struct User {
    address wallet;                // Endereço da carteira
    address sponsor;               // Endereço do sponsor (upline)
    bool isRegistered;            // Está registrado?
    bool subscriptionActive;      // Assinatura ativa?
    uint256 subscriptionTimestamp; // Quando ativou
    uint256 subscriptionExpiration; // Quando expira
    uint256 totalEarned;          // Total ganho (acumulado)
    uint256 totalWithdrawn;       // Total sacado (acumulado)
    uint256 directReferrals;      // Quantos filhos diretos
}
```

**SALDO DISPONÍVEL:**
```
available = totalEarned - totalWithdrawn
```

---

### **STRUCT EARNING:**
```solidity
struct Earning {
    uint256 timestamp;      // Quando ganhou
    uint256 amount;         // Quanto ganhou
    address fromClient;     // De quem veio
    uint8 level;           // Qual nível (1-10, 0 = direct bonus)
    EarningType earningType; // Tipo de ganho
}
```

---

### **STRUCT CLIENTPERFORMANCE:**
```solidity
struct ClientPerformance {
    uint256 totalFeesGenerated;   // Total de fees que gerou
    uint256 totalFeesDistributed; // Total que foi distribuído
    uint256 lastFeeTimestamp;     // Última vez que gerou fee
    uint256 feeCount;             // Quantas fees gerou
}
```

---

## 🎪 EVENTOS

### **EVENTOS DE USUÁRIO:**
```solidity
event UserRegistered(address indexed user, address indexed sponsor);
event SubscriptionActivated(address indexed user, uint256 amount, uint256 expirationTimestamp);
event SubscriptionRenewed(address indexed user, uint256 amount, uint256 newExpirationTimestamp);
event SubscriptionExpired(address indexed user, uint256 expiredAt);
```

### **EVENTOS DE COMISSÕES:**
```solidity
event MLMCommissionPaid(address indexed recipient, address indexed from, uint256 level, uint256 amount);
event MLMCommissionFailed(address indexed recipient, address indexed from, uint256 level, uint256 amount);
event DirectBonusPaid(address indexed sponsor, address indexed newUser, uint256 amount);
```

### **EVENTOS DE PERFORMANCE:**
```solidity
event PerformanceFeeDistributed(address indexed user, uint256 amount, uint256 mlmAmount);
```

### **EVENTOS DE SAQUE:**
```solidity
event EarningsWithdrawn(address indexed user, uint256 amount);
```

### **EVENTOS DE POOLS:**
```solidity
event PoolDistribution(address indexed pool, uint256 amount, string poolType);
```

### **EVENTOS ADMINISTRATIVOS:**
```solidity
event BetaModeToggled(bool betaMode);
event WalletsUpdated(address liquidity, address infrastructure, address company);
event UserPaused(address indexed user);
event UserUnpaused(address indexed user);
```

---

## 📊 FUNÇÕES DE VISUALIZAÇÃO

### **1. getUserInfo()**
Retorna TODOS os dados do usuário

### **2. getEarningHistory(user, count)**
Retorna últimos N ganhos (máx 100)

### **3. getQuickStats(user)**
Retorna estatísticas rápidas (saldo, diretos, dias restantes)

### **4. getNetworkStats(user)**
Retorna estatísticas de rede (diretos, ganho, saldo)

### **5. getUpline(user)**
Retorna array com 10 sponsors acima

### **6. calculateMLMDistribution(performanceFee)**
Calcula quanto cada nível receberá

### **7. getActiveMLMPercentages()**
Retorna percentuais ativos (Beta ou Permanente)

### **8. getSystemStats()**
Retorna estatísticas globais

### **9. isSubscriptionActive(user)**
Verifica se assinatura está realmente ativa

---

## 🎯 RESUMO EXECUTIVO

### **VALORES:**
- Assinatura: $29 USDT
- Bônus direto: $5 USDT
- Combo: $34 USDT ($29 + $5)
- Saque mínimo: $5 USDT
- Duração: 30 dias

### **PERCENTUAIS (BETA - Atual):**
- MLM L1: 6%
- MLM L2: 3%
- MLM L3: 2.5%
- MLM L4: 2%
- MLM L5-L10: 1% cada
- Liquidez: 5%
- Infraestrutura: 12%
- Empresa: 23%

### **REGRAS PRINCIPAIS:**
1. ✅ Sponsor inativo recebe comissões
2. ✅ Assinatura serve para copy trading
3. ✅ MLM funciona independente de ativo
4. ✅ 10 níveis de profundidade
5. ✅ Batch máximo: 50 clientes
6. ✅ Histórico: 100 últimos ganhos
7. ✅ Combo economiza gas e paga bônus

### **FLUXO DE DINHEIRO:**
```
Cliente paga $34 (combo):
├─ $29 → companyWallet
└─ $5 → sponsor

Cliente gera $100 fee:
Admin paga $56.50:
├─ $16.50 → Contrato (MLM 10 níveis)
├─ $5.00 → liquidityPool
├─ $12.00 → infrastructureWallet
└─ $23.00 → companyWallet

($43.50 retidos no pool MLM)
```

---

**✅ ESTE É O DOCUMENTO DEFINITIVO!**

**USE ESTES VALORES EM TODA A IMPLEMENTAÇÃO! 🎯**
