# 💰 DETALHAMENTO COMPLETO DOS VALORES

**ANÁLISE MINUCIOSA: $29, $5 e $34**

---

## 1️⃣ VALOR: $29 USDT (SUBSCRIPTION_FEE)

### **DEFINIÇÃO NO CONTRATO:**
```solidity
// Linha 22 - iDeepXDistributionV2.sol
uint256 public constant SUBSCRIPTION_FEE = 29 * 10**6; // $29 USDT
```

### **CARACTERÍSTICAS:**
- **Tipo:** `constant` (IMUTÁVEL - não pode ser alterado)
- **Visibilidade:** `public` (qualquer um pode ler)
- **Valor em decimais:** `29000000` (29 × 10^6)
- **Motivo dos 10^6:** USDT na BSC tem 6 casas decimais
- **Valor real:** $29.00 USDT

### **ONDE É USADO:**

#### **USO 1: selfSubscribe() - Linha 276**
```solidity
function selfSubscribe() external nonReentrant whenNotPaused {
    if (!users[msg.sender].isRegistered) revert UserNotRegistered();
    if (users[msg.sender].subscriptionActive) revert SubscriptionAlreadyActive();

    // AQUI: Transfere $29 USDT
    bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
    if (!success) revert TransferFailed();

    // ... resto da função
}
```

**FLUXO:**
```
Usuário chama: selfSubscribe()

ORIGEM: Carteira do usuário (msg.sender)
DESTINO: companyWallet
VALOR: $29 USDT (SUBSCRIPTION_FEE)

REQUISITO PRÉVIO:
└─ Usuário deve aprovar $29 USDT para o contrato:
   USDT.approve(contratoAddress, 29 * 10**6)
```

**RESULTADO:**
- ✅ Assinatura ativada por 30 dias
- ✅ subscriptionActive = true
- ✅ subscriptionExpiration = agora + 30 dias
- ✅ totalActiveSubscriptions++
- ❌ Sponsor NÃO recebe nada

---

#### **USO 2: registerAndSubscribe() - Linha 320**
```solidity
function registerAndSubscribe(address sponsorWallet) external nonReentrant whenNotPaused {
    // ... registro do usuário ...

    // AQUI: Transfere $29 USDT para empresa
    bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
    if (!success) revert TransferFailed();

    // Depois transfere $5 para sponsor
    success = USDT.transferFrom(msg.sender, sponsorWallet, DIRECT_BONUS);
    if (!success) revert TransferFailed();
}
```

**FLUXO:**
```
Usuário chama: registerAndSubscribe(sponsor)

PRIMEIRA TRANSFERÊNCIA:
ORIGEM: Carteira do usuário (msg.sender)
DESTINO: companyWallet
VALOR: $29 USDT (SUBSCRIPTION_FEE)

SEGUNDA TRANSFERÊNCIA:
ORIGEM: Carteira do usuário (msg.sender)
DESTINO: sponsorWallet
VALOR: $5 USDT (DIRECT_BONUS)

TOTAL COBRADO: $34 USDT ($29 + $5)

REQUISITO PRÉVIO:
└─ Usuário deve aprovar $34 USDT para o contrato:
   USDT.approve(contratoAddress, 34 * 10**6)
```

**RESULTADO:**
- ✅ Usuário registrado E ativo
- ✅ subscriptionActive = true
- ✅ subscriptionExpiration = agora + 30 dias
- ✅ Sponsor recebe $5 direto na carteira
- ✅ Sponsor.totalEarned += $5

---

#### **USO 3: renewSubscription() - Linha 350**
```solidity
function renewSubscription() external nonReentrant whenNotPaused {
    if (!users[msg.sender].isRegistered) revert UserNotRegistered();
    if (!users[msg.sender].subscriptionActive) revert SubscriptionNotActive();

    // Verifica se pode renovar (≤ 7 dias antes ou já expirou)
    uint256 currentExpiration = users[msg.sender].subscriptionExpiration;
    if (block.timestamp < currentExpiration - 7 days) {
        revert SubscriptionAlreadyActive();
    }

    // AQUI: Transfere $29 USDT
    bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
    if (!success) revert TransferFailed();

    // ... lógica de expiração ...
}
```

**FLUXO:**
```
Usuário chama: renewSubscription()

ORIGEM: Carteira do usuário (msg.sender)
DESTINO: companyWallet
VALOR: $29 USDT (SUBSCRIPTION_FEE)

QUANDO PODE RENOVAR:
├─ Faltam 7 dias ou menos para expirar OU
└─ Já expirou

SE JÁ EXPIROU:
└─ Nova expiração = agora + 30 dias

SE AINDA ATIVO (≤ 7 dias):
└─ Nova expiração = expiração atual + 30 dias

REQUISITO PRÉVIO:
└─ Usuário deve aprovar $29 USDT para o contrato
```

**RESULTADO:**
- ✅ Assinatura renovada por mais 30 dias
- ❌ Sponsor NÃO recebe nada na renovação

---

### **RESUMO DO $29:**

**COBRADO EM:**
1. ✅ selfSubscribe() - Ativação simples
2. ✅ registerAndSubscribe() - Combo (+ $5)
3. ✅ renewSubscription() - Renovação

**SEMPRE VAI PARA:**
- 🏢 companyWallet (100% dos $29)

**DURAÇÃO:**
- ⏰ 30 dias (SUBSCRIPTION_DURATION = 30 days)

**FREQUÊNCIA:**
- 🔄 Mensal (precisa renovar a cada 30 dias)

**OBRIGATÓRIO PARA:**
- ✅ Usar plataforma GMI Edge (copy trading)
- ✅ Gerar performance fees (tradear)
- ✅ Aparecer como "ativo" no sistema

**NÃO É OBRIGATÓRIO PARA:**
- ❌ Receber comissões MLM (recebe mesmo inativo!)
- ❌ Sacar comissões acumuladas
- ❌ Indicar novos usuários

---

## 2️⃣ VALOR: $5 USDT (DIRECT_BONUS)

### **DEFINIÇÃO NO CONTRATO:**
```solidity
// Linha 34 - iDeepXDistributionV2.sol
uint256 public constant DIRECT_BONUS = 5 * 10**6; // $5 USDT
```

### **CARACTERÍSTICAS:**
- **Tipo:** `constant` (IMUTÁVEL)
- **Visibilidade:** `public`
- **Valor em decimais:** `5000000` (5 × 10^6)
- **Valor real:** $5.00 USDT

### **ONDE É USADO:**

#### **USO ÚNICO: registerAndSubscribe() - Linha 324**
```solidity
function registerAndSubscribe(address sponsorWallet) external nonReentrant whenNotPaused {
    // ... registro e assinatura ($29) ...

    // AQUI: Transfere $5 USDT para sponsor
    success = USDT.transferFrom(msg.sender, sponsorWallet, DIRECT_BONUS);
    if (!success) revert TransferFailed();

    // Registrar bônus no totalEarned do sponsor
    users[sponsorWallet].totalEarned += DIRECT_BONUS;
    _recordEarning(sponsorWallet, DIRECT_BONUS, msg.sender, 0, EarningType.DIRECT_BONUS);

    emit DirectBonusPaid(sponsorWallet, msg.sender, DIRECT_BONUS);
}
```

**FLUXO COMPLETO:**
```
Novo usuário chama: registerAndSubscribe(sponsor)

COBRADO DO NOVO USUÁRIO:
└─ $34 USDT total ($29 + $5)

DISTRIBUIÇÃO:
├─ $29 USDT → companyWallet (assinatura)
└─ $5 USDT → sponsorWallet (bônus direto)

ORIGEM: Carteira do novo usuário (msg.sender)
DESTINO: Carteira do sponsor (sponsorWallet)

AÇÕES NO SPONSOR:
├─ Recebe $5 USDT direto na carteira ✅
├─ users[sponsor].totalEarned += $5 ✅
├─ Registrado no histórico (earningHistory) ✅
└─ Event DirectBonusPaid emitido ✅
```

### **IMPORTANTE:**

**PAGO APENAS EM:**
- ✅ registerAndSubscribe() (combo)

**NÃO É PAGO EM:**
- ❌ selfRegister() (registro simples)
- ❌ selfSubscribe() (ativação simples)
- ❌ renewSubscription() (renovação)

**COMPARAÇÃO:**
```
OPÇÃO A - Registro separado (2 transações):
├─ Tx1: selfRegister(sponsor) → $0
├─ Tx2: selfSubscribe() → $29
└─ TOTAL: $29
    └─ Sponsor: $0 (não recebe bônus)

OPÇÃO B - Combo (1 transação):
├─ Tx1: registerAndSubscribe(sponsor) → $34
└─ TOTAL: $34
    └─ Sponsor: $5 (recebe bônus direto!)

DIFERENÇA: $5 a mais, mas sponsor ganha $5
```

---

### **CARACTERÍSTICAS DO BÔNUS DIRETO:**

**TIPO DE GANHO:**
```solidity
enum EarningType {
    MLM_COMMISSION,  // 0
    DIRECT_BONUS,    // 1 ← Este!
    RANK_BONUS       // 2
}
```

**REGISTRADO NO HISTÓRICO:**
```solidity
_recordEarning(
    sponsorWallet,        // Quem recebe
    DIRECT_BONUS,         // $5
    msg.sender,           // Novo usuário (de quem veio)
    0,                    // Nível 0 (não é MLM)
    EarningType.DIRECT_BONUS  // Tipo
);
```

**PODE SACAR:**
- ✅ Imediatamente (assim que receber)
- ✅ Junto com outras comissões
- ✅ Quando totalEarned - totalWithdrawn ≥ $5

**FICA ONDE:**
- 💰 Na carteira do sponsor (transferência direta)
- 📊 Contabilizado em users[sponsor].totalEarned
- 📜 Registrado no earningHistory

---

### **REQUISITOS PARA RECEBER:**

**SPONSOR DEVE:**
1. ✅ Estar registrado (isRegistered = true)
2. ✅ Novo usuário usa registerAndSubscribe()
3. ✅ Novo usuário aprova $34 USDT

**SPONSOR NÃO PRECISA:**
1. ❌ Estar ativo (subscriptionActive pode ser false)
2. ❌ Ter assinatura válida
3. ❌ Estar tradando
4. ❌ Ter GMI Edge conectado

**CONCLUSÃO:**
- 🎯 Sponsor INATIVO pode receber bônus direto!
- 🎯 Bônus é para INCENTIVAR indicações

---

### **RESUMO DO $5:**

**VALOR:** $5.00 USDT (DIRECT_BONUS)

**PAGO APENAS EM:**
- ✅ registerAndSubscribe() (combo)

**ORIGEM:**
- Novo usuário (paga $34 total)

**DESTINO:**
- Sponsor direto (recebe direto na carteira)

**FINALIDADE:**
- Incentivo para indicar novos usuários
- Recompensa imediata ao sponsor

**COMPARADO AO MLM:**
- Bônus direto: $5 imediato na carteira
- MLM L1: $6.00 (mas vem de performance fee, não de assinatura)

---

## 3️⃣ VALOR: $34 USDT (TOTAL DO COMBO)

### **CÁLCULO:**
```solidity
TOTAL = SUBSCRIPTION_FEE + DIRECT_BONUS
TOTAL = $29 + $5
TOTAL = $34 USDT
```

### **ORIGEM:**
```
Valor NÃO está hardcoded no contrato
É a SOMA de duas constantes:
├─ SUBSCRIPTION_FEE (linha 22) = $29
└─ DIRECT_BONUS (linha 34) = $5
```

### **ONDE APARECE:**

#### **registerAndSubscribe() - Linhas 319-325**
```solidity
// Transferir assinatura ($29) para empresa
bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
if (!success) revert TransferFailed();

// Transferir bônus direto ($5) para sponsor
success = USDT.transferFrom(msg.sender, sponsorWallet, DIRECT_BONUS);
if (!success) revert TransferFailed();
```

**FLUXO DETALHADO:**
```
USUÁRIO PRECISA:
1. Ter $34 USDT na carteira
2. Aprovar $34 USDT para o contrato:
   USDT.approve(contratoAddress, 34 * 10**6)

CONTRATO EXECUTA:
1. Verifica aprovação ✅
2. Transferência 1: $29 USDT → companyWallet
   ├─ Se falhar: REVERTE tudo
   └─ Se sucesso: continua
3. Transferência 2: $5 USDT → sponsorWallet
   ├─ Se falhar: REVERTE tudo (incluindo $29)
   └─ Se sucesso: completa
4. Atualiza estados
5. Emite eventos

RESULTADO SE SUCESSO:
├─ companyWallet: +$29
├─ sponsorWallet: +$5
├─ Usuário registrado e ativo ✅
└─ Sponsor.totalEarned += $5 ✅

RESULTADO SE FALHA:
└─ REVERTE TUDO (transação atômica)
```

---

### **DETALHAMENTO DA DISTRIBUIÇÃO:**

**DOS $34 PAGOS:**
```
┌─────────────────────────────────────┐
│  NOVO USUÁRIO PAGA: $34 USDT        │
└─────────────────────────────────────┘
              │
              ├─────────────────┬─────────────────┐
              ▼                 ▼                 ▼
         $29 USDT          $5 USDT          $0 USDT
              │                 │                 │
              ▼                 ▼                 ▼
      companyWallet      sponsorWallet      (nada retido)
   (carteira empresa)  (carteira sponsor)
```

**PERCENTUAIS:**
```
$34 total:
├─ 85.29% ($29) → Empresa
└─ 14.71% ($5)  → Sponsor
```

**COMPARAÇÃO COM OUTROS FLUXOS:**
```
selfSubscribe():
└─ Paga $29 → 100% empresa

registerAndSubscribe():
├─ Paga $34
├─ 85.29% → empresa
└─ 14.71% → sponsor

renewSubscription():
└─ Paga $29 → 100% empresa
```

---

### **VANTAGENS DO COMBO ($34):**

**PARA O NOVO USUÁRIO:**
1. ✅ 1 transação em vez de 2 (economia de gas)
2. ✅ Mais rápido
3. ✅ Sponsor fica feliz (recebeu $5)
4. ✅ Registrado E ativo imediatamente

**PARA O SPONSOR:**
1. ✅ Recebe $5 imediato
2. ✅ Incentivo para indicar
3. ✅ Vai na carteira (pode usar como quiser)
4. ✅ Contabilizado em totalEarned (pode sacar depois)

**PARA A EMPRESA:**
1. ✅ Recebe $29 igual (sem diferença)
2. ✅ Usuário já ativo (pode começar a tradear)
3. ✅ Sistema mais simples (1 tx em vez de 2)

**GAS ECONOMY:**
```
Opção A (2 transações):
├─ selfRegister() ~100k gas
├─ selfSubscribe() ~120k gas
└─ TOTAL: ~220k gas

Opção B (1 transação):
└─ registerAndSubscribe() ~180k gas

ECONOMIA: ~40k gas (~18% menos)
```

---

### **REQUISITOS PARA PAGAR $34:**

**NOVO USUÁRIO PRECISA:**
1. ✅ Ter $34 USDT na carteira
2. ✅ Aprovar $34 USDT para o contrato:
   ```javascript
   await USDT.approve(contratoAddress, ethers.parseUnits("34", 6));
   ```
3. ✅ Sponsor estar registrado
4. ✅ Contrato não pausado

**FRONTEND DEVE:**
1. ✅ Verificar saldo do usuário ≥ $34
2. ✅ Solicitar aprovação de $34
3. ✅ Chamar registerAndSubscribe(sponsor)
4. ✅ Mostrar que são 2 pagamentos: $29 + $5

**EXEMPLO DE CÓDIGO:**
```javascript
// 1. Verificar saldo
const balance = await USDT.balanceOf(userAddress);
const required = ethers.parseUnits("34", 6);
if (balance < required) {
  alert("Saldo insuficiente. Você precisa de $34 USDT");
  return;
}

// 2. Aprovar
const approveTx = await USDT.approve(contratoAddress, required);
await approveTx.wait();

// 3. Registrar e assinar
const registerTx = await contrato.registerAndSubscribe(sponsorAddress);
await registerTx.wait();

// Resultado:
// - Você: registrado e ativo ✅
// - Empresa: +$29 ✅
// - Sponsor: +$5 ✅
```

---

## 📊 COMPARATIVO COMPLETO

### **TABELA COMPARATIVA:**

| Item | selfSubscribe | registerAndSubscribe | renewSubscription |
|------|---------------|---------------------|------------------|
| **Cobrado do usuário** | $29 | $34 | $29 |
| **Para empresa** | $29 | $29 | $29 |
| **Para sponsor** | $0 | $5 | $0 |
| **Transações** | 1 | 1 | 1 |
| **Precisa estar registrado?** | Sim | Não | Sim |
| **Ativa assinatura?** | Sim | Sim | Sim |
| **Sponsor ganha?** | Não | Sim ($5) | Não |
| **Quando usar?** | Já registrado | Novo usuário | Renovar |

---

### **FLUXO COMPLETO DE DINHEIRO:**

```
NOVO USUÁRIO ENTRANDO (Combo):

Usuário paga: $34 USDT
├─ $29 → companyWallet (assinatura mensal)
└─ $5 → sponsorWallet (bônus direto)

Sponsor acumula:
├─ totalEarned += $5
└─ Pode sacar quando ≥ $5

────────────────────────────────

RENOVAÇÃO (Mensal):

Usuário paga: $29 USDT
└─ $29 → companyWallet (renovação)

Sponsor: $0 (não recebe na renovação)

────────────────────────────────

PERFORMANCE FEE (Quando tiver lucro):

Cliente gera lucro de $1000 tradando
Performance fee: $300 (30% do lucro)

Admin processa:
Admin paga $300:
├─ $180 → Pool MLM (60%)
│   ├─ $18 → L1 (sponsor direto)
│   ├─ $9 → L2
│   ├─ $7.50 → L3
│   ├─ $6 → L4
│   ├─ $3 → L5-L10 ($3 cada)
│   └─ $130.50 retido (não distribuído)
│
├─ $15 → liquidityPool (5%)
├─ $36 → infrastructureWallet (12%)
└─ $69 → companyWallet (23%)
```

---

## 💡 RESUMO EXECUTIVO

### **$29 USDT (SUBSCRIPTION_FEE):**
- ✅ Assinatura mensal
- ✅ Cobrado em: selfSubscribe, combo, renovação
- ✅ 100% vai para companyWallet
- ✅ Dura 30 dias
- ✅ Imutável (constant)

### **$5 USDT (DIRECT_BONUS):**
- ✅ Bônus direto ao sponsor
- ✅ Cobrado APENAS em: registerAndSubscribe (combo)
- ✅ Vai direto para carteira do sponsor
- ✅ Incentivo para indicações
- ✅ Imutável (constant)

### **$34 USDT (COMBO):**
- ✅ Soma de $29 + $5
- ✅ Apenas em registerAndSubscribe
- ✅ $29 → empresa, $5 → sponsor
- ✅ Vantagem: 1 tx, sponsor ganha, menos gas
- ✅ Calculado em runtime (não é constant)

---

## ❓ PERGUNTAS E RESPOSTAS

### **P: Posso mudar o valor de $29?**
R: ❌ NÃO! É `constant` (imutável). Para mudar, precisa:
- Criar contrato V11 com novo valor
- Fazer redeploy
- Migrar usuários

### **P: Posso mudar o valor de $5?**
R: ❌ NÃO! Mesma razão acima.

### **P: Posso desabilitar o bônus direto?**
R: ❌ NÃO! Está hardcoded no registerAndSubscribe().
- Para desabilitar, precisa V11
- Ou orientar usuários a usar selfRegister + selfSubscribe

### **P: Por que $5 vai para sponsor e não para empresa?**
R: ✅ Design do sistema:
- Incentiva indicações
- Sponsor ganha algo imediato
- Diferente das comissões MLM (que vêm de performance fees)

### **P: Sponsor pode receber $5 mesmo inativo?**
R: ✅ SIM! Não verifica subscriptionActive.
- Sponsor só precisa estar registrado
- Mesmo inativo, recebe o bônus direto

### **P: O que acontece se novo usuário não tiver $34?**
R: ❌ Transação reverte:
- Erro: "Insufficient balance" ou "Transfer failed"
- Nada é cobrado
- Usuário não é registrado

### **P: O que acontece se transferência de $29 sucede mas $5 falha?**
R: ❌ REVERTE TUDO:
- Contrato usa transações atômicas
- Se segunda transferência ($5) falhar, primeira ($29) também reverte
- Sistema all-or-nothing (tudo ou nada)

---

**✅ DETALHAMENTO COMPLETO DOS VALORES! 💰**

**Alguma dúvida específica sobre estes valores?**
