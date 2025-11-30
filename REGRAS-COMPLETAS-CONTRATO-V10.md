# 📜 TODAS AS REGRAS DO CONTRATO V10

**CADA VALIDAÇÃO, CADA REQUIRE, CADA CONDIÇÃO**

**100% COMPLETO - SEM OMISSÕES**

---

## 🔐 REGRAS DE CONSTRUTOR

### **constructor() - Linhas 204-236**

**VALIDAÇÕES:**
```solidity
if (_usdtAddress == address(0)) revert InvalidAddress();
if (_liquidityPool == address(0)) revert InvalidAddress();
if (_infrastructureWallet == address(0)) revert InvalidAddress();
if (_companyWallet == address(0)) revert InvalidAddress();
```

**REGRAS:**
1. ✅ Nenhum endereço pode ser zero address
2. ✅ Owner (msg.sender) é automaticamente registrado
3. ✅ Owner tem assinatura ativa por 100 anos
4. ✅ Owner é o primeiro usuário (totalUsers = 1)
5. ✅ Owner nunca expira (expiration = now + 365 days * 100)
6. ✅ Owner não tem sponsor (sponsor = address(0))

---

## 👤 REGRAS: selfRegister()

### **selfRegister(sponsorWallet) - Linhas 244-265**

**VALIDAÇÕES:**
```solidity
if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();
if (!users[sponsorWallet].isRegistered) revert SponsorNotRegistered();
```

**REGRAS:**
1. ❌ Usuário NÃO pode estar já registrado
2. ❌ Sponsor DEVE estar registrado
3. ❌ Contrato NÃO pode estar pausado (whenNotPaused)
4. ✅ Sponsor pode ser address(0)? NÃO (reverte)
5. ✅ Sponsor pode estar inativo? SIM (não verifica)
6. ✅ Sponsor pode estar expirado? SIM (não verifica)

**AÇÕES:**
1. ✅ Cria User struct com subscriptionActive = false
2. ✅ Incrementa users[sponsorWallet].directReferrals++
3. ✅ Incrementa totalUsers++
4. ✅ Emite UserRegistered(msg.sender, sponsorWallet)

**CUSTOS:**
- Gas apenas (sem pagamento USDT)

---

## 💳 REGRAS: selfSubscribe()

### **selfSubscribe() - Linhas 271-287**

**VALIDAÇÕES:**
```solidity
if (!users[msg.sender].isRegistered) revert UserNotRegistered();
if (users[msg.sender].subscriptionActive) revert SubscriptionAlreadyActive();
```

**REGRAS:**
1. ❌ Usuário DEVE estar registrado
2. ❌ Usuário NÃO pode ter assinatura ativa
3. ❌ Contrato NÃO pode estar pausado
4. ❌ Requer nonReentrant
5. ✅ Usuário DEVE ter aprovado USDT antes
6. ✅ Usuário DEVE ter $29 USDT

**AÇÕES:**
1. ✅ Transfere $29 USDT: msg.sender → companyWallet
2. ✅ Define subscriptionActive = true
3. ✅ Define subscriptionTimestamp = block.timestamp
4. ✅ Define subscriptionExpiration = now + 30 days
5. ✅ Incrementa totalActiveSubscriptions++
6. ✅ Emite SubscriptionActivated(user, $29, expiration)

**PAGAMENTO:**
- $29 USDT → companyWallet

**NÃO PAGA:**
- ❌ Sponsor não recebe bônus direto (apenas em registerAndSubscribe)

---

## 🎯 REGRAS: registerAndSubscribe()

### **registerAndSubscribe(sponsorWallet) - Linhas 294-333**

**VALIDAÇÕES:**
```solidity
if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();
if (!users[sponsorWallet].isRegistered) revert SponsorNotRegistered();
```

**REGRAS:**
1. ❌ Usuário NÃO pode estar já registrado
2. ❌ Sponsor DEVE estar registrado
3. ❌ Contrato NÃO pode estar pausado
4. ❌ Requer nonReentrant
5. ✅ Usuário DEVE ter aprovado $34 USDT ($29 + $5)
6. ✅ Usuário DEVE ter $34 USDT
7. ✅ Combo: registra E ativa em uma transação

**AÇÕES:**
1. ✅ Cria User struct com subscriptionActive = true
2. ✅ Incrementa users[sponsorWallet].directReferrals++
3. ✅ Incrementa totalUsers++
4. ✅ Incrementa totalActiveSubscriptions++
5. ✅ Emite UserRegistered(msg.sender, sponsorWallet)
6. ✅ Transfere $29 USDT: msg.sender → companyWallet
7. ✅ Transfere $5 USDT: msg.sender → sponsorWallet
8. ✅ Incrementa users[sponsorWallet].totalEarned += $5
9. ✅ Registra earning (bônus direto)
10. ✅ Emite SubscriptionActivated(user, $29, expiration)
11. ✅ Emite DirectBonusPaid(sponsor, user, $5)

**PAGAMENTO TOTAL:**
- $29 USDT → companyWallet (assinatura)
- $5 USDT → sponsorWallet (bônus direto)
- **TOTAL:** $34 USDT

**VANTAGENS:**
- ✅ 1 transação em vez de 2
- ✅ Sponsor recebe $5 imediato
- ✅ Economia de gas

---

## 🔄 REGRAS: renewSubscription()

### **renewSubscription() - Linhas 339-369**

**VALIDAÇÕES:**
```solidity
if (!users[msg.sender].isRegistered) revert UserNotRegistered();
if (!users[msg.sender].subscriptionActive) revert SubscriptionNotActive();

// Permitir renovação se expirou ou está próximo de expirar (7 dias antes)
if (block.timestamp < currentExpiration - 7 days) {
    revert SubscriptionAlreadyActive();
}
```

**REGRAS:**
1. ❌ Usuário DEVE estar registrado
2. ❌ subscriptionActive DEVE ser true
3. ❌ Pode renovar SE:
   - Já expirou (timestamp > expiration) OU
   - Faltam 7 dias ou menos (timestamp ≥ expiration - 7 days)
4. ❌ NÃO pode renovar se faltam mais de 7 dias
5. ❌ Contrato NÃO pode estar pausado
6. ❌ Requer nonReentrant
7. ✅ Usuário DEVE ter aprovado $29 USDT
8. ✅ Usuário DEVE ter $29 USDT

**LÓGICA DE EXPIRAÇÃO:**
```solidity
SE block.timestamp > currentExpiration:
    // Já expirou - começar do zero
    newExpiration = block.timestamp + 30 days
    subscriptionActive = true
    totalActiveSubscriptions++
SENÃO:
    // Ainda válida - adicionar 30 dias
    newExpiration = currentExpiration + 30 days
```

**AÇÕES:**
1. ✅ Transfere $29 USDT: msg.sender → companyWallet
2. ✅ Atualiza subscriptionTimestamp = block.timestamp
3. ✅ Atualiza subscriptionExpiration (lógica acima)
4. ✅ Se expirou: ativa novamente e incrementa contador
5. ✅ Se ainda ativo: adiciona 30 dias à expiração atual
6. ✅ Emite SubscriptionRenewed(user, $29, newExpiration)

**PAGAMENTO:**
- $29 USDT → companyWallet

**NÃO PAGA:**
- ❌ Sponsor não recebe nada na renovação

---

## 🏭 REGRAS: batchProcessPerformanceFees()

### **batchProcessPerformanceFees(clients[], amounts[]) - Linhas 379-390**

**VALIDAÇÕES:**
```solidity
if (clients.length != amounts.length) revert ArrayLengthMismatch();
if (clients.length == 0) revert InvalidAmount();
if (clients.length > MAX_BATCH_SIZE) revert BatchSizeExceeded();
```

**REGRAS:**
1. ❌ Apenas owner pode chamar (onlyOwner)
2. ❌ Arrays DEVEM ter mesmo tamanho
3. ❌ Arrays NÃO podem estar vazios
4. ❌ Arrays NÃO podem ter mais de 50 elementos
5. ❌ Contrato NÃO pode estar pausado
6. ❌ Requer nonReentrant
7. ✅ Admin (msg.sender) DEVE ter USDT aprovado para o contrato
8. ✅ Admin DEVE ter saldo suficiente

**LOOP:**
```solidity
for (uint256 i = 0; i < clients.length; i++) {
    _processPerformanceFee(clients[i], amounts[i]);
}
```

**ATENÇÃO:**
- Se QUALQUER processamento falhar, REVERTE TUDO
- Transação atômica (tudo ou nada)

---

## 💰 REGRAS: _processPerformanceFee()

### **_processPerformanceFee(client, amount) - Linhas 397-432**

**VALIDAÇÕES:**
```solidity
if (amount == 0) revert InvalidAmount();
if (!users[client].isRegistered) revert UserNotRegistered();
```

**REGRAS:**
1. ❌ Amount NÃO pode ser zero
2. ❌ Cliente DEVE estar registrado
3. ✅ Cliente NÃO precisa estar ativo (não verifica)
4. ✅ Cliente NÃO precisa ter assinatura (não verifica)

**CÁLCULOS:**
```solidity
mlmAmount = (amount * 6000) / 10000;      // 60%
liquidityAmount = (amount * 500) / 10000; // 5%
infraAmount = (amount * 1200) / 10000;    // 12%
companyAmount = (amount * 2300) / 10000;  // 23%
```

**TRANSFERÊNCIAS (msg.sender = admin):**
```solidity
USDT.transferFrom(msg.sender, liquidityPool, liquidityAmount);
USDT.transferFrom(msg.sender, infrastructureWallet, infraAmount);
USDT.transferFrom(msg.sender, companyWallet, companyAmount);
// MLM é transferido dentro de _distributeMLM
```

**AÇÕES:**
1. ✅ Atualiza clientPerformances[client] (totalFeesGenerated, count, etc)
2. ✅ Transfere para liquidityPool
3. ✅ Transfere para infrastructureWallet
4. ✅ Transfere para companyWallet
5. ✅ Chama _distributeMLM(client, mlmAmount)
6. ✅ Emite PoolDistribution (3x - um por pool)
7. ✅ Emite PerformanceFeeDistributed(client, amount, mlmAmount)

**SE QUALQUER TRANSFERÊNCIA FALHAR:**
- ❌ REVERTE TUDO (revert TransferFailed())
- ❌ Nenhuma distribuição acontece
- ❌ Estado não muda

---

## 🌳 REGRAS: _distributeMLM()

### **_distributeMLM(client, mlmAmount) - Linhas 440-470**

**LÓGICA:**
```solidity
address currentSponsor = users[client].sponsor;
uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

for (uint256 level = 0; level < 10; level++) {
    // Se não tem mais sponsor, parar
    if (currentSponsor == address(0)) break;

    // Calcular comissão
    uint256 commission = (mlmAmount * percentages[level]) / 10000;

    // Transferir para contrato
    bool success = USDT.transferFrom(msg.sender, address(this), commission);
    if (!success) {
        emit MLMCommissionFailed(currentSponsor, client, level + 1, commission);
        revert TransferFailed();
    }

    // Atualizar contadores
    users[currentSponsor].totalEarned += commission;
    totalMLMDistributed += commission;

    // Registrar no histórico
    _recordEarning(currentSponsor, commission, client, level + 1, MLM_COMMISSION);

    // Emitir evento
    emit MLMCommissionPaid(currentSponsor, client, level + 1, commission);

    // Subir para próximo nível
    currentSponsor = users[currentSponsor].sponsor;
}
```

**REGRAS:**
1. ✅ Começa pelo sponsor direto do cliente
2. ✅ Sobe 10 níveis (ou até acabar sponsors)
3. ✅ Se currentSponsor == address(0): para o loop
4. ✅ Calcula comissão baseado em percentages[level]
5. ✅ Transfere de msg.sender (admin) → address(this) (contrato)
6. ✅ Se transferência falhar: REVERTE TUDO
7. ✅ Atualiza totalEarned do sponsor
8. ✅ Atualiza totalMLMDistributed (global)
9. ✅ Registra no histórico (_recordEarning)
10. ✅ Emite MLMCommissionPaid
11. ✅ Sobe para próximo sponsor

**NÃO VERIFICA:**
- ❌ Se sponsor está ativo (subscriptionActive)
- ❌ Se sponsor está expirado
- ❌ Se sponsor está pausado (userPaused)
- ❌ Se sponsor tem GMI Edge conectado

**CONCLUSÃO:**
**SPONSOR INATIVO RECEBE NORMALMENTE!**

---

## 📝 REGRAS: _recordEarning()

### **_recordEarning(recipient, amount, fromClient, level, type) - Linhas 480-503**

**LÓGICA:**
```solidity
// Se já tem 100 registros, remove o mais antigo (FIFO)
if (earningHistory[recipient].length >= 100) {
    for (uint i = 0; i < earningHistory[recipient].length - 1; i++) {
        earningHistory[recipient][i] = earningHistory[recipient][i + 1];
    }
    earningHistory[recipient].pop();
}

// Adicionar novo registro
earningHistory[recipient].push(Earning({
    timestamp: block.timestamp,
    amount: amount,
    fromClient: fromClient,
    level: level,
    earningType: earningType
}));
```

**REGRAS:**
1. ✅ Máximo 100 registros por usuário
2. ✅ Sistema FIFO (First In, First Out)
3. ✅ Quando chega a 100: remove o mais antigo
4. ✅ Sempre mantém os 100 mais recentes
5. ✅ Registra timestamp, amount, fromClient, level, earningType

**TIPOS:**
```solidity
enum EarningType {
    MLM_COMMISSION,  // 0 - Comissão MLM
    DIRECT_BONUS,    // 1 - Bônus direto ($5)
    RANK_BONUS       // 2 - Futuro (não implementado)
}
```

---

## 💸 REGRAS: withdrawEarnings()

### **withdrawEarnings() - Linhas 511-524**

**CÁLCULO:**
```solidity
uint256 available = users[msg.sender].totalEarned - users[msg.sender].totalWithdrawn;
```

**VALIDAÇÕES:**
```solidity
if (available == 0) revert NoEarningsToWithdraw();
if (available < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();
```

**REGRAS:**
1. ❌ Saldo disponível NÃO pode ser zero
2. ❌ Saldo disponível DEVE ser ≥ $5 USDT
3. ❌ Contrato NÃO pode estar pausado
4. ❌ Usuário NÃO pode estar pausado (whenUserNotPaused)
5. ❌ Requer nonReentrant
6. ✅ Saca TUDO (não é parcial)

**AÇÕES:**
1. ✅ Incrementa users[msg.sender].totalWithdrawn += available
2. ✅ Incrementa totalWithdrawn += available (global)
3. ✅ Transfere USDT: contrato → msg.sender
4. ✅ Emite EarningsWithdrawn(user, available)

**ORIGEM DOS FUNDOS:**
- Contrato (address(this))
- Fundos foram transferidos em _distributeMLM

**SE TRANSFERÊNCIA FALHAR:**
- ❌ REVERTE (revert TransferFailed())

---

## 💸 REGRAS: withdrawPartial()

### **withdrawPartial(amount) - Linhas 530-545**

**CÁLCULO:**
```solidity
uint256 available = users[msg.sender].totalEarned - users[msg.sender].totalWithdrawn;
```

**VALIDAÇÕES:**
```solidity
if (amount == 0) revert InvalidAmount();
if (available == 0) revert NoEarningsToWithdraw();
if (amount > available) revert InvalidAmount();
if (amount < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();
```

**REGRAS:**
1. ❌ Amount NÃO pode ser zero
2. ❌ Saldo disponível NÃO pode ser zero
3. ❌ Amount NÃO pode ser maior que disponível
4. ❌ Amount DEVE ser ≥ $5 USDT
5. ❌ Contrato NÃO pode estar pausado
6. ❌ Usuário NÃO pode estar pausado
7. ❌ Requer nonReentrant
8. ✅ Saca PARCIAL (valor escolhido)

**AÇÕES:**
1. ✅ Incrementa users[msg.sender].totalWithdrawn += amount
2. ✅ Incrementa totalWithdrawn += amount (global)
3. ✅ Transfere USDT: contrato → msg.sender (apenas amount)
4. ✅ Emite EarningsWithdrawn(user, amount)

**RESTO:**
- Fica disponível para sacar depois

---

## 🔧 REGRAS: toggleBetaMode()

### **toggleBetaMode() - Linhas 552-555**

**REGRAS:**
1. ❌ Apenas owner pode chamar (onlyOwner)
2. ✅ Alterna betaMode = !betaMode
3. ✅ Emite BetaModeToggled(betaMode)

**EFEITO:**
- Muda percentuais MLM de Beta para Permanente (ou vice-versa)
- Afeta PRÓXIMAS distribuições (não retroativo)

**ESTADOS:**
- betaMode = true → usa mlmPercentagesBeta
- betaMode = false → usa mlmPercentagesPermanent

---

## 🏦 REGRAS: updateWallets()

### **updateWallets(liquidity, infra, company) - Linhas 560-576**

**VALIDAÇÕES:**
```solidity
if (_liquidityPool == address(0)) revert InvalidAddress();
if (_infrastructureWallet == address(0)) revert InvalidAddress();
if (_companyWallet == address(0)) revert InvalidAddress();
```

**REGRAS:**
1. ❌ Apenas owner pode chamar (onlyOwner)
2. ❌ Nenhum endereço pode ser zero address
3. ✅ Atualiza os 3 endereços de uma vez
4. ✅ Emite WalletsUpdated(liquidity, infra, company)

**EFEITO:**
- Altera destino de futuras distribuições
- NÃO afeta distribuições já feitas

---

## ⏸️ REGRAS: pause() / unpause()

### **pause() - Linha 581-583**
### **unpause() - Linha 588-590**

**REGRAS:**
1. ❌ Apenas owner pode chamar (onlyOwner)
2. ✅ pause() ativa pausa global
3. ✅ unpause() desativa pausa global

**QUANDO PAUSADO (global):**
Bloqueia:
- ❌ selfRegister()
- ❌ selfSubscribe()
- ❌ registerAndSubscribe()
- ❌ renewSubscription()
- ❌ withdrawEarnings()
- ❌ withdrawPartial()
- ❌ batchProcessPerformanceFees()

**NÃO bloqueia:**
- ✅ Funções view (getUserInfo, etc)
- ✅ expireSubscriptions() (pode ser chamada por qualquer um)
- ✅ Funções admin (pause, unpause, updateWallets, etc)

---

## 🚫 REGRAS: deactivateSubscription()

### **deactivateSubscription(user) - Linhas 595-600**

**REGRAS:**
1. ❌ Apenas owner pode chamar (onlyOwner)
2. ✅ Se subscriptionActive = true:
   - Define subscriptionActive = false
   - Decrementa totalActiveSubscriptions--
3. ✅ Se já false: não faz nada

**EFEITO:**
- Desativa assinatura de um usuário manualmente
- Admin pode usar para punir/bloquear

---

## ⏰ REGRAS: expireSubscriptions()

### **expireSubscriptions(userAddresses[]) - Linhas 606-615**

**LÓGICA:**
```solidity
for (uint256 i = 0; i < userAddresses.length; i++) {
    address user = userAddresses[i];
    if (users[user].subscriptionActive &&
        block.timestamp > users[user].subscriptionExpiration) {

        users[user].subscriptionActive = false;
        totalActiveSubscriptions--;
        emit SubscriptionExpired(user, users[user].subscriptionExpiration);
    }
}
```

**REGRAS:**
1. ✅ QUALQUER UM pode chamar (não é onlyOwner)
2. ✅ Aceita array de endereços
3. ✅ Para cada usuário:
   - Verifica se subscriptionActive = true
   - Verifica se timestamp > subscriptionExpiration
   - Se ambos true: desativa e decrementa contador
4. ✅ Emite SubscriptionExpired para cada expiração

**IMPORTANTE:**
- Assinaturas NÃO expiram automaticamente
- Precisa alguém chamar esta função
- Bots devem chamar periodicamente

---

## 🔍 REGRAS: isSubscriptionActive()

### **isSubscriptionActive(user) - Linhas 622-624**

**LÓGICA:**
```solidity
return users[user].subscriptionActive &&
       block.timestamp <= users[user].subscriptionExpiration;
```

**REGRAS:**
1. ✅ Retorna true SE:
   - subscriptionActive = true E
   - timestamp ≤ subscriptionExpiration
2. ✅ Retorna false se qualquer condição falhar

**DIFERENÇA:**
- users[user].subscriptionActive pode ser true mesmo expirado
- isSubscriptionActive() verifica AMBOS: flag E timestamp

---

## 🚫 REGRAS: pauseUser() / unpauseUser()

### **pauseUser(user) - Linhas 630-633**
### **unpauseUser(user) - Linhas 639-642**

**REGRAS:**
1. ❌ Apenas owner pode chamar (onlyOwner)
2. ✅ pauseUser: userPaused[user] = true
3. ✅ unpauseUser: userPaused[user] = false
4. ✅ Emite UserPaused ou UserUnpaused

**EFEITO (quando userPaused = true):**
Bloqueia:
- ❌ withdrawEarnings() (modifier whenUserNotPaused)
- ❌ withdrawPartial() (modifier whenUserNotPaused)

**NÃO bloqueia:**
- ✅ Receber comissões MLM (continua recebendo!)
- ✅ Funções view
- ✅ Todas as outras funções

**CONCLUSÃO:**
Pausa individual impede apenas SACAR, mas continua GANHANDO!

---

## 📊 REGRAS: getUserInfo()

### **getUserInfo(userAddress) - Linhas 649-672**

**RETORNA:**
```solidity
return (
    user.wallet,
    user.sponsor,
    user.isRegistered,
    user.subscriptionActive,
    user.subscriptionTimestamp,
    user.subscriptionExpiration,
    user.totalEarned,
    user.totalWithdrawn,
    user.directReferrals
);
```

**REGRAS:**
1. ✅ Função view (não muda estado)
2. ✅ Qualquer um pode chamar
3. ✅ Retorna TODOS os dados públicos do usuário

---

## 📜 REGRAS: getEarningHistory()

### **getEarningHistory(user, count) - Linhas 679-692**

**LÓGICA:**
```solidity
uint256 len = earningHistory[user].length;
uint256 returnCount = count > len ? len : count;

// Retorna os ÚLTIMOS returnCount registros
for (uint i = 0; i < returnCount; i++) {
    result[i] = earningHistory[user][len - returnCount + i];
}
```

**REGRAS:**
1. ✅ Função view
2. ✅ count é máximo solicitado (se tem menos, retorna todos)
3. ✅ Retorna os ÚLTIMOS N registros (mais recentes)
4. ✅ Máximo absoluto: 100 (MAX_HISTORY_PER_USER)

---

## 📈 REGRAS: getQuickStats()

### **getQuickStats(user) - Linhas 698-723**

**CÁLCULO DIAS RESTANTES:**
```solidity
uint256 daysLeft = 0;

if (u.subscriptionActive) {
    if (block.timestamp < u.subscriptionExpiration) {
        daysLeft = (u.subscriptionExpiration - block.timestamp) / 1 days;
    }
}
```

**RETORNA:**
```solidity
return (
    u.totalEarned,
    u.totalWithdrawn,
    u.totalEarned - u.totalWithdrawn,  // availableBalance
    u.directReferrals,
    u.subscriptionActive && block.timestamp <= u.subscriptionExpiration,
    daysLeft
);
```

**REGRAS:**
1. ✅ Função view
2. ✅ Calcula disponível: totalEarned - totalWithdrawn
3. ✅ Verifica se realmente ativo (flag E timestamp)
4. ✅ Calcula dias restantes até expirar

---

## 🌐 REGRAS: getNetworkStats()

### **getNetworkStats(user) - Linhas 729-738**

**RETORNA:**
```solidity
return NetworkStats({
    totalDirects: u.directReferrals,
    totalEarned: u.totalEarned,
    totalWithdrawn: u.totalWithdrawn,
    availableBalance: u.totalEarned - u.totalWithdrawn
});
```

**REGRAS:**
1. ✅ Função view
2. ✅ Retorna struct NetworkStats

---

## 🔝 REGRAS: getUpline()

### **getUpline(userAddress) - Linhas 743-754**

**LÓGICA:**
```solidity
address[10] memory upline;
address currentSponsor = users[userAddress].sponsor;

for (uint256 i = 0; i < 10; i++) {
    if (currentSponsor == address(0)) break;
    upline[i] = currentSponsor;
    currentSponsor = users[currentSponsor].sponsor;
}

return upline;
```

**REGRAS:**
1. ✅ Função view
2. ✅ Retorna array fixo de 10 posições
3. ✅ upline[0] = sponsor direto (L1)
4. ✅ upline[1] = sponsor do L1 (L2)
5. ✅ ... até L10
6. ✅ Se não tem 10 níveis, posições vazias = address(0)

---

## 🧮 REGRAS: calculateMLMDistribution()

### **calculateMLMDistribution(performanceFee) - Linhas 759-778**

**CÁLCULOS:**
```solidity
totalMLM = (performanceFee * 6000) / 10000;       // 60%
liquidity = (performanceFee * 500) / 10000;       // 5%
infrastructure = (performanceFee * 1200) / 10000; // 12%
company = (performanceFee * 2300) / 10000;        // 23%

uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

for (uint256 i = 0; i < 10; i++) {
    levelCommissions[i] = (totalMLM * percentages[i]) / 10000;
}
```

**RETORNA:**
```solidity
return (
    levelCommissions,  // Array [10] com comissão de cada nível
    totalMLM,         // 60% total
    liquidity,        // 5%
    infrastructure,   // 12%
    company          // 23%
);
```

**REGRAS:**
1. ✅ Função view (simulação)
2. ✅ Usa percentuais atuais (Beta ou Permanente)
3. ✅ Calcula quanto SERIA distribuído
4. ✅ NÃO executa distribuição (apenas cálculo)

**USO:**
- Frontend pode chamar para preview antes de processar

---

## 📊 REGRAS: getActiveMLMPercentages()

### **getActiveMLMPercentages() - Linhas 783-785**

**RETORNA:**
```solidity
return betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;
```

**REGRAS:**
1. ✅ Função view
2. ✅ Retorna array [10] com percentuais ativos
3. ✅ Depende de betaMode (true = Beta, false = Permanente)

---

## 📈 REGRAS: getSystemStats()

### **getSystemStats() - Linhas 790-797**

**RETORNA:**
```solidity
return (
    totalUsers,
    totalActiveSubscriptions,
    totalMLMDistributed,
    betaMode
);
```

**REGRAS:**
1. ✅ Função view
2. ✅ Retorna estatísticas globais do sistema

---

## 🔒 MODIFICADORES

### **whenNotPaused**
```solidity
// OpenZeppelin Pausable
require(!paused(), "Pausable: paused");
```

### **whenUserNotPaused**
```solidity
// Linhas 190-193
if (userPaused[msg.sender]) revert UserIsPaused();
```

### **onlyOwner**
```solidity
// OpenZeppelin Ownable
require(msg.sender == owner(), "Ownable: caller is not the owner");
```

### **nonReentrant**
```solidity
// OpenZeppelin ReentrancyGuard
// Previne reentrância (ataque)
```

---

## 🚨 ERROS CUSTOMIZADOS

```solidity
error InvalidAddress();           // Endereço zero ou inválido
error UserAlreadyRegistered();    // Usuário já registrado
error UserNotRegistered();        // Usuário não registrado
error SponsorNotRegistered();     // Sponsor não registrado
error InvalidAmount();            // Valor zero ou inválido
error TransferFailed();           // Transferência USDT falhou
error SubscriptionAlreadyActive(); // Assinatura já ativa
error SubscriptionNotActive();    // Assinatura não ativa
error ArrayLengthMismatch();      // Arrays com tamanhos diferentes
error BatchSizeExceeded();        // Batch > 50
error NoEarningsToWithdraw();     // Saldo zero
error BelowMinimumWithdrawal();   // Saque < $5
error UserIsPaused();             // Usuário pausado
```

---

## 📋 RESUMO DE TODAS AS REGRAS

### **REGISTRO:**
1. ✅ Sponsor deve estar registrado
2. ❌ Não pode estar já registrado
3. ❌ Contrato não pode estar pausado

### **ASSINATURA:**
1. ✅ Deve estar registrado
2. ✅ Deve ter $29 ou $34 USDT (combo)
3. ✅ Deve aprovar USDT antes
4. ❌ Não pode ter assinatura ativa (exceto renovação)
5. ❌ Contrato não pode estar pausado

### **RENOVAÇÃO:**
1. ✅ Deve estar registrado
2. ✅ subscriptionActive deve ser true
3. ✅ Pode renovar ≤ 7 dias antes OU já expirou
4. ❌ Não pode renovar > 7 dias antes
5. ✅ Deve ter $29 USDT e aprovar

### **PERFORMANCE FEE:**
1. ✅ Apenas owner pode processar
2. ✅ Cliente deve estar registrado
3. ✅ Admin deve ter USDT e aprovar
4. ✅ Batch máximo: 50 clientes
5. ✅ Arrays devem ter mesmo tamanho
6. ❌ Amount não pode ser zero

### **MLM:**
1. ✅ Distribui até 10 níveis
2. ✅ Para se não tem mais sponsor
3. ✅ Sponsor inativo RECEBE normalmente
4. ✅ Usa percentuais Beta ou Permanente
5. ✅ Se qualquer transferência falhar: REVERTE TUDO

### **SAQUE:**
1. ✅ Mínimo $5 USDT
2. ✅ Deve ter saldo disponível
3. ❌ Não pode estar pausado (global)
4. ❌ Usuário não pode estar pausado (individual)
5. ✅ Pode sacar todo ou parcial

### **PAUSAS:**
1. ✅ Owner pode pausar contrato (global)
2. ✅ Owner pode pausar usuário (individual)
3. ✅ Pausa global bloqueia quase tudo
4. ✅ Pausa individual bloqueia apenas saques

### **ADMIN:**
1. ✅ Apenas owner para funções críticas
2. ✅ Qualquer um pode expirar assinaturas
3. ✅ Owner pode mudar wallets
4. ✅ Owner pode alternar Beta/Permanente

---

**✅ DOCUMENTO COMPLETO!**

**TODAS AS REGRAS SEM EXCEÇÃO! 📜**
