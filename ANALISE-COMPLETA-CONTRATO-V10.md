# 🔍 ANÁLISE COMPLETA DO CONTRATO iDeepXDistributionV2

**Análise minuciosa realizada para criar sistema com "vida própria"**

---

## 📋 ÍNDICE DA ANÁLISE

1. [Funções do Contrato](#funções-do-contrato)
2. [Fluxos de Negócio](#fluxos-de-negócio)
3. [Dados Disponíveis](#dados-disponíveis)
4. [Eventos Emitidos](#eventos-emitidos)
5. [Estados do Sistema](#estados-do-sistema)
6. [O Que Precisa Ser Construído](#o-que-precisa-ser-construído)

---

## 🎯 FUNÇÕES DO CONTRATO

### **👤 FUNÇÕES DO USUÁRIO (Cliente)**

#### **1. selfRegister(address sponsorWallet)**
- **O que faz:** Cliente se registra no sistema com um sponsor
- **Requisitos:** Sponsor deve estar registrado
- **Resultado:** Usuário registrado, sponsor ganha +1 referral direto
- **Event:** `UserRegistered`
- **Estado:** isRegistered = true, subscriptionActive = false

#### **2. selfSubscribe()**
- **O que faz:** Cliente paga $19 USDT para ativar assinatura (30 dias)
- **Requisitos:** Estar registrado, aprovar USDT, não estar ativo
- **Pagamento:** $19 USDT → companyWallet
- **Resultado:** Assinatura ativa por 30 dias
- **Event:** `SubscriptionActivated`
- **Estado:** subscriptionActive = true

#### **3. registerAndSubscribe(address sponsorWallet)**
- **O que faz:** Registra + ativa assinatura + paga bônus direto em 1 transação
- **Pagamentos:**
  - $19 USDT → companyWallet (assinatura)
  - $5 USDT → sponsor (bônus direto)
- **Events:** `UserRegistered`, `SubscriptionActivated`, `DirectBonusPaid`
- **Vantagem:** Economia de gas (1 tx em vez de 2)

#### **4. renewSubscription()**
- **O que faz:** Renova assinatura (até 7 dias antes)
- **Pagamento:** $19 USDT
- **Event:** `SubscriptionRenewed`

#### **5. withdrawEarnings()**
- **O que faz:** Saca TODAS as comissões acumuladas
- **Requisitos:** Mínimo $5 USDT disponível
- **Resultado:** Transfere totalEarned - totalWithdrawn
- **Event:** `EarningsWithdrawn`

#### **6. withdrawPartial(uint256 amount)**
- **O que faz:** Saca valor parcial
- **Requisitos:** Mínimo $5 USDT, ter saldo
- **Event:** `EarningsWithdrawn`

---

### **👔 FUNÇÕES DO ADMINISTRADOR**

#### **1. batchProcessPerformanceFees(address[] clients, uint256[] amounts)**
- **O que faz:** Processa performance fees de múltiplos clientes em lote
- **Fonte dos fundos:** Admin (msg.sender) - precisa ter USDT e aprovar
- **Distribuição automática:**
  - 60% → MLM (10 níveis)
  - 5% → liquidityPool
  - 12% → infrastructureWallet
  - 23% → companyWallet
- **Máximo:** 50 clientes por batch (evita out of gas)
- **Events:** `PerformanceFeeDistributed`, `MLMCommissionPaid`, `PoolDistribution`

#### **2. toggleBetaMode()**
- **O que faz:** Alterna entre modo Beta e Permanente
- **Beta:** L1=6%, L2=3%, L3=2.5%, L4=2%, L5-L10=1%
- **Permanente:** L1=4%, L2=2%, L3=1.5%, L4=1%, L5-L10=1%
- **Event:** `BetaModeToggled`

#### **3. updateWallets(address liquidity, address infra, address company)**
- **O que faz:** Atualiza endereços dos pools
- **Event:** `WalletsUpdated`

#### **4. pause() / unpause()**
- **O que faz:** Pausa/despausa contrato em emergência
- **Funções bloqueadas:** selfRegister, selfSubscribe, registerAndSubscribe, renewSubscription, withdrawEarnings, batchProcessPerformanceFees

#### **5. deactivateSubscription(address user)**
- **O que faz:** Admin desativa assinatura de um usuário manualmente

#### **6. expireSubscriptions(address[] userAddresses)**
- **O que faz:** Expira assinaturas vencidas (qualquer um pode chamar)
- **Event:** `SubscriptionExpired`

#### **7. pauseUser(address user) / unpauseUser(address user)**
- **O que faz:** Pausa/despausa usuário individualmente
- **Events:** `UserPaused`, `UserUnpaused`

---

### **📊 FUNÇÕES DE VISUALIZAÇÃO (view)**

#### **1. getUserInfo(address userAddress)**
- **Retorna:** wallet, sponsor, isRegistered, subscriptionActive, subscriptionTimestamp, subscriptionExpiration, totalEarned, totalWithdrawn, directReferrals

#### **2. getEarningHistory(address user, uint256 count)**
- **Retorna:** Últimos N ganhos do usuário (máx 100)
- **Dados:** timestamp, amount, fromClient, level, earningType

#### **3. getQuickStats(address user)**
- **Retorna:** totalEarned, totalWithdrawn, availableBalance, directReferrals, subscriptionActive, daysUntilExpiry

#### **4. getNetworkStats(address user)**
- **Retorna:** totalDirects, totalEarned, totalWithdrawn, availableBalance

#### **5. getUpline(address userAddress)**
- **Retorna:** Array com 10 sponsors acima (toda a upline)

#### **6. calculateMLMDistribution(uint256 performanceFee)**
- **Retorna:** Cálculo de quanto cada nível receberá de uma performance fee
- **Dados:** levelCommissions[10], totalMLM, liquidity, infrastructure, company

#### **7. getActiveMLMPercentages()**
- **Retorna:** Percentuais MLM ativos (Beta ou Permanente)

#### **8. getSystemStats()**
- **Retorna:** totalUsers, totalActiveSubscriptions, totalMLMDistributed, betaMode

#### **9. isSubscriptionActive(address user)**
- **Retorna:** true se assinatura ativa E não expirada

---

## 🔄 FLUXOS DE NEGÓCIO

### **FLUXO 1: Novo Usuário**
```
1. Cliente ouve falar do iDeepX (indicado por sponsor)
2. Cliente conecta carteira no frontend
3. Cliente escolhe: selfRegister() OU registerAndSubscribe()

   OPÇÃO A (2 transações):
   - selfRegister(sponsor) → Registrado
   - Aprovar USDT
   - selfSubscribe() → Ativo

   OPÇÃO B (1 transação - RECOMENDADO):
   - Aprovar USDT ($24 = $19 + $5)
   - registerAndSubscribe(sponsor) → Registrado + Ativo
   - Sponsor recebe $5 imediato!

4. Cliente está ATIVO por 30 dias
5. Cliente conecta conta GMI Edge (frontend)
6. Cliente começa a tradear
```

---

### **FLUXO 2: Geração de Performance Fee**
```
1. Cliente tradea na conta GMI Edge
2. Mês fecha (30 dias)
3. GMI Edge API retorna lucro do cliente
4. Admin calcula performance fee (ex: 30% do lucro)
5. Admin chama batchProcessPerformanceFees([cliente], [feeAmount])
6. Contrato distribui automaticamente:
   - 60% MLM (10 níveis acima do cliente)
   - 5% liquidityPool
   - 12% infrastructureWallet
   - 23% companyWallet
7. Cada sponsor na upline recebe sua comissão
8. Event emitido para cada comissão
```

---

### **FLUXO 3: Distribuição MLM (10 Níveis)**
```
Cliente que gerou fee: C
↑ Nível 1 (L1): Sponsor direto → 6% (Beta) ou 4% (Permanente)
↑ Nível 2 (L2): Sponsor do L1 → 3% (Beta) ou 2% (Permanente)
↑ Nível 3 (L3): Sponsor do L2 → 2.5% (Beta) ou 1.5% (Permanente)
↑ Nível 4 (L4): Sponsor do L3 → 2% (Beta) ou 1% (Permanente)
↑ Níveis 5-10: → 1% cada

IMPORTANTE:
- Comissões são pagas ao CONTRATO primeiro
- Ficam acumuladas em totalEarned
- Usuário pode sacar quando quiser (mín $5)
- Se sponsor não existe, comissão não é paga (não distribui)
```

---

### **FLUXO 4: Saque de Comissões**
```
1. Usuário acumula comissões (totalEarned)
2. Usuário vê saldo disponível (totalEarned - totalWithdrawn)
3. Quando > $5, pode sacar:
   - withdrawEarnings() → Saca tudo
   - withdrawPartial(amount) → Saca parcial
4. USDT transferido do CONTRATO → usuário
5. totalWithdrawn atualizado
```

---

### **FLUXO 5: Renovação de Assinatura**
```
1. Assinatura expira após 30 dias
2. Sistema marca subscriptionActive = false
3. Usuário vê no dashboard "Assinatura expirada"
4. Usuário chama renewSubscription()
5. Paga $19 USDT
6. Assinatura ativa por mais 30 dias
7. Usuário volta a receber comissões

IMPORTANTE:
- Pode renovar 7 dias ANTES de expirar
- Se já expirou, conta do zero
- Se ainda ativo, adiciona 30 dias à data atual
```

---

## 📊 DADOS DISPONÍVEIS

### **Dados do Usuário (struct User)**
```solidity
- wallet: address
- sponsor: address
- isRegistered: bool
- subscriptionActive: bool
- subscriptionTimestamp: uint256
- subscriptionExpiration: uint256
- totalEarned: uint256
- totalWithdrawn: uint256
- directReferrals: uint256
```

### **Histórico de Ganhos (struct Earning)**
```solidity
- timestamp: uint256
- amount: uint256
- fromClient: address (quem gerou a comissão)
- level: uint8 (nível MLM)
- earningType: enum (MLM_COMMISSION, DIRECT_BONUS, RANK_BONUS)
```

### **Performance do Cliente (struct ClientPerformance)**
```solidity
- totalFeesGenerated: uint256
- totalFeesDistributed: uint256
- lastFeeTimestamp: uint256
- feeCount: uint256
```

### **Estatísticas Globais**
```solidity
- totalUsers: uint256
- totalActiveSubscriptions: uint256
- totalMLMDistributed: uint256
- totalWithdrawn: uint256
- betaMode: bool
```

---

## 🎪 EVENTOS EMITIDOS

### **Eventos de Usuário**
- `UserRegistered(user, sponsor)`
- `SubscriptionActivated(user, amount, expirationTimestamp)`
- `SubscriptionRenewed(user, amount, newExpirationTimestamp)`
- `SubscriptionExpired(user, expiredAt)`

### **Eventos de Comissões**
- `MLMCommissionPaid(recipient, from, level, amount)`
- `MLMCommissionFailed(recipient, from, level, amount)`
- `DirectBonusPaid(sponsor, newUser, amount)`

### **Eventos de Performance**
- `PerformanceFeeDistributed(user, amount, mlmAmount)`

### **Eventos de Saque**
- `EarningsWithdrawn(user, amount)`

### **Eventos de Pools**
- `PoolDistribution(pool, amount, poolType)`

### **Eventos Administrativos**
- `BetaModeToggled(betaMode)`
- `WalletsUpdated(liquidity, infrastructure, company)`
- `UserPaused(user)`
- `UserUnpaused(user)`

---

## 🔢 ESTADOS DO SISTEMA

### **Estado do Usuário**
```
1. NÃO REGISTRADO → isRegistered = false
2. REGISTRADO → isRegistered = true, subscriptionActive = false
3. ATIVO → isRegistered = true, subscriptionActive = true, não expirado
4. EXPIRADO → isRegistered = true, subscriptionActive = false
5. PAUSADO → userPaused[user] = true
```

### **Estado do Contrato**
```
1. NORMAL → paused = false
2. PAUSADO → paused = true
3. BETA MODE → betaMode = true (percentuais maiores)
4. PERMANENTE → betaMode = false (percentuais menores)
```

---

## 🎯 O QUE PRECISA SER CONSTRUÍDO

Para criar sistema com "vida própria" precisamos:

### **1. BOTS DE SIMULAÇÃO** 🤖

#### **Bot 1: Criador de Usuários**
- Cria usuários continuamente
- Registra com sponsors variados
- Ativa assinaturas (80-90%)
- Conecta contas GMI Edge (simulado)

#### **Bot 2: Gerador de Performance Fees**
- Simula trades na GMI Edge
- Gera performance fees mensais
- Admin processa em lotes
- Distribui MLM automaticamente

#### **Bot 3: Renovador de Assinaturas**
- Monitora assinaturas próximas de expirar
- Renova automaticamente (70-80%)
- Alguns deixam expirar (realismo)

#### **Bot 4: Sacador de Comissões**
- Monitora saldos disponíveis
- Saca quando > $10 (aleatório)
- Alguns sacam tudo, outros parcial

#### **Bot 5: Administrador**
- Processa performance fees diariamente
- Expira assinaturas vencidas
- Monitora pools
- Ajusta configurações

---

### **2. BACKEND COMPLETO** 🖥️

#### **Serviços Necessários:**
- ✅ `contractV10.js` - Interface com contrato
- ✅ `gmiEdgeService.js` - API GMI Edge
- 🔴 `performanceFeeProcessor.js` - **CRIAR**
- 🔴 `subscriptionMonitor.js` - **CRIAR**
- 🔴 `mlmCalculator.js` - **ATUALIZAR**
- 🔴 `analyticsService.js` - **CRIAR**

#### **Rotas API Necessárias:**
- ✅ `/api/dev/user/:address` - Dados do usuário
- ✅ `/api/dev/gmi/account/:address` - GMI Edge
- 🔴 `/api/admin/process-fees` - **CRIAR**
- 🔴 `/api/admin/dashboard` - **CRIAR**
- 🔴 `/api/admin/pools` - **CRIAR**
- 🔴 `/api/admin/users` - **CRIAR**
- 🔴 `/api/admin/statistics` - **CRIAR**

---

### **3. FRONTEND COMPLETO** 🎨

#### **Dashboard do Cliente (já existe, melhorar):**
- ✅ Overview (saldo, comissões, rede)
- ✅ GMI Edge (conectar conta)
- ✅ Network (upline tree)
- 🔴 Earnings History - **MELHORAR**
- 🔴 Withdraw - **MELHORAR**
- 🔴 Performance Chart - **CRIAR**
- 🔴 Notification Center - **CRIAR**

#### **Painel Admin (NÃO EXISTE - CRIAR TUDO):**
- 🔴 **Dashboard Principal**
  - Total de usuários
  - Usuários ativos
  - Total distribuído
  - Pools (liquidez, infra, empresa)
  - Performance fees processados
  - Gráficos em tempo real

- 🔴 **Gestão de Usuários**
  - Lista de todos os usuários
  - Filtros (ativos, inativos, pausados)
  - Busca por endereço
  - Ações (pausar, despausar, desativar)

- 🔴 **Processamento de Fees**
  - Interface para processar lotes
  - Upload de CSV
  - Preview de distribuição
  - Executar batch
  - Histórico de processamentos

- 🔴 **Gestão de Pools**
  - Saldo de cada pool
  - Histórico de distribuições
  - Gráficos

- 🔴 **Estatísticas Avançadas**
  - Crescimento de usuários
  - Volume de assinaturas
  - MLM distribuído por nível
  - Taxa de renovação
  - Top earners

- 🔴 **Configurações**
  - Toggle Beta Mode
  - Atualizar wallets
  - Pausar/despausar contrato
  - Logs de ações admin

---

### **4. BANCO DE DADOS COMPLETO** 💾

#### **Tabelas Existentes:**
- ✅ `User` - Usuários
- ✅ `GmiAccount` - Contas GMI Edge

#### **Tabelas Necessárias (CRIAR):**
- 🔴 `PerformanceFee` - Histórico de fees processados
- 🔴 `MLMCommission` - Histórico de comissões
- 🔴 `Withdrawal` - Histórico de saques
- 🔴 `Subscription` - Histórico de assinaturas
- 🔴 `AdminAction` - Logs de ações admin
- 🔴 `SystemMetrics` - Métricas diárias
- 🔴 `Pool` - Histórico de pools

---

### **5. VISUALIZAÇÕES NECESSÁRIAS** 📊

#### **Cliente precisa ver:**
- ✅ Saldo disponível para saque
- ✅ Total ganho (histórico)
- ✅ Rede MLM (upline + diretos)
- 🔴 Gráfico de ganhos mensal
- 🔴 Performance da conta GMI Edge
- 🔴 Notificações (assinatura expirando, comissão recebida)
- 🔴 Histórico de saques
- 🔴 Simulador de comissões

#### **Admin precisa ver:**
- 🔴 Dashboard com KPIs principais
- 🔴 Lista de usuários (paginada, filtros)
- 🔴 Saldo de pools em tempo real
- 🔴 Fees pendentes de processar
- 🔴 Assinaturas expirando (próximos 7 dias)
- 🔴 Usuários inativos (não renovaram)
- 🔴 Volume de MLM distribuído (por nível, por mês)
- 🔴 Performance do sistema (gráficos)
- 🔴 Logs de ações (auditoria)

---

## ✅ RESUMO DA ANÁLISE

### **Contrato está COMPLETO para:**
- ✅ Registro de usuários
- ✅ Assinaturas
- ✅ Distribuição MLM (10 níveis)
- ✅ Performance fees
- ✅ Saques
- ✅ Gestão admin
- ✅ Visualizações

### **Falta construir:**
- 🔴 Painel Admin (frontend)
- 🔴 Bots de simulação (5 bots)
- 🔴 Serviços backend (processamento automático)
- 🔴 Melhorias no dashboard cliente
- 🔴 Banco de dados expandido
- 🔴 Sistema de notificações
- 🔴 Analytics e relatórios

---

## 🎯 PRÓXIMO PASSO

Com esta análise, vou criar o **PLANO MESTRE DE IMPLEMENTAÇÃO** dividido em etapas executáveis!

**Objetivo:** Sistema VIVO funcionando automaticamente, impressionante para demonstração!
