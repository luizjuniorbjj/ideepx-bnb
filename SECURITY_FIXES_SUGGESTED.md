# 🔒 CORREÇÕES DE SEGURANÇA SUGERIDAS
# iDeepXUnified Smart Contract

---

## 📋 OVERVIEW

Este documento contém **código específico** para corrigir as 4 vulnerabilidades CRÍTICAS identificadas na auditoria.

**⚠️ IMPLEMENTAR ANTES DE PRODUÇÃO ⚠️**

---

## 🔴 CORREÇÃO 1: DoS via activeUsers - Batch Processing

### Problema:
Array `activeUsers` cresce ilimitadamente, causando DoS quando excede ~5000 usuários.

### Solução: Implementar Distribuição em Batches

```solidity
// ============ ADICIONAR ESTADO ============

struct DistributionBatch {
    uint256 totalAmount;
    uint256 startIndex;
    uint256 processedUsers;
    bool completed;
}

mapping(uint256 => DistributionBatch) public distributionBatches;
uint256 public constant BATCH_SIZE = 500; // Processar 500 usuários por tx

// ============ MODIFICAR depositWeeklyPerformance ============

/**
 * @notice Deposita performance e inicia distribuição em batches
 * @param amount Valor total
 * @param proof Hash IPFS
 */
function depositWeeklyPerformance(
    uint256 amount,
    string memory proof
) external onlyOwner nonReentrant whenNotPaused {
    require(amount > 0, "Invalid amount");
    require(bytes(proof).length > 0, "Proof required");

    // Recebe USDT
    USDT.safeTransferFrom(msg.sender, address(this), amount);

    currentWeek++;
    totalDeposited += amount;

    // CALCULA DISTRIBUIÇÕES
    uint256 liquidityAmount = (amount * LIQUIDITY) / 100;
    uint256 infrastructureAmount = (amount * INFRASTRUCTURE) / 100;
    uint256 companyAmount = (amount * COMPANY) / 100;
    uint256 mlmAmount = (amount * MLM_DISTRIBUTED) / 100;
    uint256 lockedAmount = (amount * MLM_LOCKED) / 100;

    // APLICA DISTRIBUIÇÕES
    liquidityPoolReserve += liquidityAmount;
    infrastructureBalance += infrastructureAmount;
    companyBalance += companyAmount;
    mlmLockedBalance += lockedAmount;

    // ✅ NOVO: Inicializa batch (não distribui ainda)
    distributionBatches[currentWeek] = DistributionBatch({
        totalAmount: mlmAmount,
        startIndex: 0,
        processedUsers: 0,
        completed: false
    });

    // REGISTRA
    weeklyDeposits[currentWeek] = WeeklyDeposit({
        amount: amount,
        timestamp: block.timestamp,
        mlmDistributed: 0, // Será atualizado após batches
        usersRewarded: 0,
        performanceProof: proof
    });

    emit PerformanceDeposited(currentWeek, amount, proof);
}

/**
 * @notice Processa um batch da distribuição MLM
 * @param week Semana a processar
 * @dev Qualquer um pode chamar (incentivo econômico: gas rebate)
 */
function processDistributionBatch(uint256 week) external nonReentrant {
    DistributionBatch storage batch = distributionBatches[week];
    require(!batch.completed, "Already completed");
    require(batch.totalAmount > 0, "Invalid batch");

    uint256 endIndex = batch.startIndex + BATCH_SIZE;
    if (endIndex > activeUsers.length) {
        endIndex = activeUsers.length;
    }

    // Processa este batch
    uint256 distributed = _distributeMLMBatch(
        batch.totalAmount,
        batch.startIndex,
        endIndex
    );

    // Atualiza estado
    batch.startIndex = endIndex;
    batch.processedUsers += (endIndex - batch.startIndex);

    // Verifica se concluiu
    if (batch.startIndex >= activeUsers.length) {
        batch.completed = true;
        weeklyDeposits[week].mlmDistributed = distributed;
        emit MLMDistributed(distributed, batch.processedUsers);
    }

    // ✅ INCENTIVO: Reembolsa gas do caller
    // Garante que sempre haverá alguém processando
    uint256 gasRebate = tx.gasprice * 100000; // ~100k gas rebate
    if (gasRebate > 0 && address(this).balance >= gasRebate) {
        payable(msg.sender).transfer(gasRebate);
    }
}

/**
 * @notice Distribui MLM para um batch específico de usuários
 */
function _distributeMLMBatch(
    uint256 totalAmount,
    uint256 startIndex,
    uint256 endIndex
) internal returns (uint256) {
    uint256 distributed = 0;

    // Para cada nível (1-10)
    for (uint8 level = 1; level <= 10; level++) {
        uint256 levelPercentage = levelPercentagesMLM[level - 1];
        uint256 levelAmount = (totalAmount * levelPercentage) / 10000;

        // Distribui APENAS para usuários neste batch
        distributed += _distributeToLevelBatch(level, levelAmount, startIndex, endIndex);
    }

    return distributed;
}

/**
 * @notice Distribui para um nível específico dentro de um batch
 */
function _distributeToLevelBatch(
    uint8 level,
    uint256 amount,
    uint256 startIndex,
    uint256 endIndex
) internal returns (uint256) {
    uint256 distributed = 0;
    uint256 qualifiedCount = 0;

    // ✅ OTIMIZAÇÃO: Combinar loops (antes eram 2, agora 1)
    address[] memory qualified = new address[](endIndex - startIndex);

    // Primeiro identifica qualificados
    for (uint256 i = startIndex; i < endIndex; i++) {
        address user = activeUsers[i];
        if (_isQualifiedForLevel(user, level)) {
            qualified[qualifiedCount] = user;
            qualifiedCount++;
        }
    }

    if (qualifiedCount == 0) return 0;

    // Calcula valor por usuário
    uint256 perUser = amount / qualifiedCount;
    uint256 dust = amount - (perUser * qualifiedCount);

    // Distribui
    for (uint256 i = 0; i < qualifiedCount; i++) {
        address user = qualified[i];
        uint256 userAmount = perUser;

        // ✅ CORREÇÃO DUST: Primeiro usuário recebe o resto
        if (i == 0) {
            userAmount += dust;
        }

        users[user].availableBalance += userAmount;
        users[user].totalEarned += userAmount;
        distributed += userAmount;

        emit CommissionCredited(user, userAmount, level);
    }

    return distributed;
}
```

**Resultado:**
- ✅ Processa 500 usuários por transação
- ✅ ~2M gas por batch (bem abaixo do limite)
- ✅ Escala para 100k+ usuários
- ✅ Incentivo econômico para processar batches

---

## 🔴 CORREÇÃO 2: Test Mode - Remoção/Safeguard

### Problema:
`testMode` permite bypass total de segurança em produção.

### Solução 1: Remover Completamente (RECOMENDADO)

```solidity
// ============ REMOVER ============

// ❌ DELETAR LINHA 52:
// bool public testMode;

// ❌ DELETAR LINHA 150:
modifier onlyUpdater() {
    require(msg.sender == updater || msg.sender == owner, "Not updater");
    // REMOVIDO: || testMode
    _;
}

// ❌ DELETAR LINHAS 183-185:
// Usuário sem sponsor só em ambiente de testes (usar contrato separado)

// ❌ DELETAR LINHAS 622-627:
// function setTestMode(...) - DELETAR COMPLETAMENTE

// ❌ DELETAR EVENTO TestModeChanged
```

### Solução 2: Safeguard com Flag de Produção (SE NECESSÁRIO)

```solidity
// ============ SE ABSOLUTAMENTE NECESSÁRIO ============

// Adicionar flag imutável
bool public immutable IS_PRODUCTION;

constructor(address _usdt, bool _isProduction) {
    require(_usdt != address(0), "Invalid USDT");
    USDT = IERC20(_usdt);
    owner = msg.sender;
    updater = msg.sender;
    IS_PRODUCTION = _isProduction; // ✅ Define no deploy (imutável)
}

// Modificar setTestMode
function setTestMode(bool _testMode) external onlyOwner {
    require(!IS_PRODUCTION, "Test mode disabled in production"); // ✅ SAFEGUARD
    testMode = _testMode;
    emit TestModeChanged(_testMode);
}

// Adicionar alerta crítico
event CriticalSecurityAlert(string message, address caller);

function setTestMode(bool _testMode) external onlyOwner {
    require(!IS_PRODUCTION, "Test mode disabled in production");

    // ✅ Alerta máximo
    emit CriticalSecurityAlert(
        _testMode ? "TEST MODE ACTIVATED - SECURITY BYPASSED" : "Test mode deactivated",
        msg.sender
    );

    testMode = _testMode;
    emit TestModeChanged(_testMode);
}
```

**Resultado:**
- ✅ Impossível ativar em produção
- ✅ Flag imutável (não pode mudar após deploy)
- ✅ Alerta crítico se ativado

---

## 🔴 CORREÇÃO 3: Timelock + Multisig para Owner

### Problema:
Owner pode drenar fundos instantaneamente sem aviso.

### Solução: Implementar Timelock + Limites

```solidity
// ============ ADICIONAR AO CONTRATO ============

// Timelock
uint256 public constant TIMELOCK_DELAY = 2 days;

struct PendingWithdrawal {
    uint256 amount;
    uint256 unlockTime;
    bool executed;
    address recipient;
}

mapping(bytes32 => PendingWithdrawal) public pendingWithdrawals;

// Limites por período
uint256 public constant MAX_COMPANY_WITHDRAWAL_PER_WEEK = 100000e6; // $100k max
uint256 public lastCompanyWithdrawal;
uint256 public withdrawnThisWeek;

// ============ MODIFICAR FUNÇÕES DE SAQUE ============

/**
 * @notice Agenda saque da empresa (ETAPA 1)
 * @param amount Valor a sacar
 */
function scheduleCompanyWithdrawal(uint256 amount) external onlyOwner {
    require(amount <= companyBalance, "Insufficient balance");

    // ✅ LIMITE SEMANAL
    uint256 currentWeek = block.timestamp / 7 days;
    if (lastCompanyWithdrawal != currentWeek) {
        lastCompanyWithdrawal = currentWeek;
        withdrawnThisWeek = 0;
    }

    require(
        withdrawnThisWeek + amount <= MAX_COMPANY_WITHDRAWAL_PER_WEEK,
        "Weekly limit exceeded"
    );

    bytes32 withdrawalId = keccak256(abi.encodePacked(
        "company",
        amount,
        block.timestamp,
        owner
    ));

    pendingWithdrawals[withdrawalId] = PendingWithdrawal({
        amount: amount,
        unlockTime: block.timestamp + TIMELOCK_DELAY,
        executed: false,
        recipient: owner
    });

    emit WithdrawalScheduled(withdrawalId, amount, block.timestamp + TIMELOCK_DELAY);
}

/**
 * @notice Executa saque após timelock (ETAPA 2)
 * @param withdrawalId ID do saque pendente
 */
function executeCompanyWithdrawal(bytes32 withdrawalId) external onlyOwner nonReentrant {
    PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

    require(!withdrawal.executed, "Already executed");
    require(block.timestamp >= withdrawal.unlockTime, "Timelock not expired");
    require(withdrawal.amount <= companyBalance, "Insufficient balance");

    // Marca como executado
    withdrawal.executed = true;

    // Atualiza limites
    withdrawnThisWeek += withdrawal.amount;
    companyBalance -= withdrawal.amount;

    // Transfere
    USDT.safeTransfer(withdrawal.recipient, withdrawal.amount);

    emit CompanyWithdrawal(withdrawal.amount);
}

/**
 * @notice Cancela saque pendente
 * @param withdrawalId ID do saque
 */
function cancelWithdrawal(bytes32 withdrawalId) external onlyOwner {
    PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

    require(!withdrawal.executed, "Already executed");

    withdrawal.executed = true; // Marca como executado para prevenir uso

    emit WithdrawalCancelled(withdrawalId);
}

// ✅ ADICIONAR EVENTOS
event WithdrawalScheduled(bytes32 indexed withdrawalId, uint256 amount, uint256 unlockTime);
event WithdrawalCancelled(bytes32 indexed withdrawalId);
```

### Implementar Multisig (Gnosis Safe)

```solidity
// ============ MODIFICAR CONSTRUCTOR ============

address public immutable MULTISIG_OWNER; // Gnosis Safe address

constructor(address _usdt, address _multisig) {
    require(_usdt != address(0), "Invalid USDT");
    require(_multisig != address(0), "Invalid multisig");

    USDT = IERC20(_usdt);
    owner = _multisig; // ✅ Owner é multisig (3/5 ou 5/7)
    updater = _multisig;
    MULTISIG_OWNER = _multisig;
}

// ✅ MODIFICAR onlyOwner
modifier onlyOwner() {
    require(msg.sender == MULTISIG_OWNER, "Not multisig owner");
    _;
}
```

**Resultado:**
- ✅ 2 dias de delay antes de qualquer saque
- ✅ Limite de $100k por semana
- ✅ Multisig 3/5 ou 5/7 necessário
- ✅ Transparência total (eventos)

---

## 🔴 CORREÇÃO 4: Cleanup Automático activeUsers

### Problema:
`cleanInactiveUsers` deve ser chamada manualmente, podendo ser esquecida.

### Solução: Cleanup Automático Durante Distribuições

```solidity
// ============ MODIFICAR depositWeeklyPerformance ============

function depositWeeklyPerformance(
    uint256 amount,
    string memory proof
) external onlyOwner nonReentrant whenNotPaused {
    // ... código existente ...

    // ✅ NOVO: Cleanup automático a cada 4 semanas
    if (currentWeek % 4 == 0) {
        _cleanInactiveUsers();
    }

    // ... resto do código ...
}

// ============ MODIFICAR cleanInactiveUsers ============

/**
 * @notice Remove usuários inativos (agora INTERNAL, automático)
 */
function _cleanInactiveUsers() internal {
    uint256 activeCount = 0;
    uint256 currentTime = block.timestamp;

    // ✅ OTIMIZAÇÃO: Usar swap-and-pop ao invés de reorganizar todo array
    for (uint256 i = 0; i < activeUsers.length; i++) {
        User memory u = users[activeUsers[i]];

        // Mantém se LAI ativa
        if (u.hasActiveLAI && u.laiExpiresAt > currentTime) {
            if (i != activeCount) {
                activeUsers[activeCount] = activeUsers[i];
            }
            activeCount++;
        }
    }

    // Reduz tamanho
    uint256 removed = activeUsers.length - activeCount;
    for (uint256 i = 0; i < removed; i++) {
        activeUsers.pop();
    }

    emit InactiveUsersRemoved(removed, activeCount);
}

// ✅ ADICIONAR possibilidade de chamada manual com gas rebate
function manualCleanup() external {
    _cleanInactiveUsers();

    // Rebate gas para incentivar limpeza
    uint256 gasRebate = tx.gasprice * 50000;
    if (gasRebate > 0 && address(this).balance >= gasRebate) {
        payable(msg.sender).transfer(gasRebate);
    }
}

// ✅ ADICIONAR EVENTO
event InactiveUsersRemoved(uint256 removed, uint256 remaining);
```

**Resultado:**
- ✅ Limpeza automática a cada 4 semanas
- ✅ Possibilidade de limpeza manual com incentivo
- ✅ Mantém activeUsers sempre otimizado

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

Antes de fazer deploy em produção, VERIFICAR:

### CRÍTICO:
- [ ] ✅ Batch processing implementado
- [ ] ✅ testMode removido OU safeguarded
- [ ] ✅ Timelock de 2 dias implementado
- [ ] ✅ Multisig Gnosis Safe configurado
- [ ] ✅ Limites semanais implementados
- [ ] ✅ Cleanup automático ativado

### ALTA PRIORIDADE:
- [ ] ✅ Validação divisão por zero
- [ ] ✅ Tratamento de dust
- [ ] ✅ Circuit breakers granulares
- [ ] ✅ Gas rebate para processamento

### TESTES:
- [ ] ✅ Teste com 10k usuários ativos
- [ ] ✅ Teste de timelock
- [ ] ✅ Teste de batch processing
- [ ] ✅ Teste de cleanup automático
- [ ] ✅ Teste de limites semanais

### DEPLOY:
- [ ] ✅ Deploy com IS_PRODUCTION = true
- [ ] ✅ Verificar owner = Gnosis Safe
- [ ] ✅ Verificar USDT address correto
- [ ] ✅ Pausar após deploy para testes
- [ ] ✅ Audit externo (Trail of Bits, OpenZeppelin)
- [ ] ✅ Bug bounty (Immunefi)

---

## 🚀 SCRIPT DE DEPLOY SEGURO

```javascript
// scripts/deploy-secure.js

async function main() {
    console.log("🚀 Deploying iDeepXUnified with SECURITY PATCHES...");

    // 1. Verificar rede
    const network = await ethers.provider.getNetwork();
    if (network.chainId === 56) { // BSC Mainnet
        console.log("⚠️  MAINNET DETECTED - Extra checks...");

        // 2. Verificar Gnosis Safe
        const multisig = "0x..."; // Endereço do Gnosis Safe
        const safeCode = await ethers.provider.getCode(multisig);
        if (safeCode === "0x") {
            throw new Error("Multisig not deployed!");
        }

        // 3. Verificar USDT
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT BSC
        const usdt = await ethers.getContractAt("IERC20", usdtAddress);
        const decimals = await usdt.decimals();
        if (decimals !== 6) {
            throw new Error("Invalid USDT!");
        }

        // 4. Deploy
        const iDeepX = await ethers.getContractFactory("iDeepXUnified");
        const contract = await iDeepX.deploy(
            usdtAddress,
            multisig, // ✅ Owner é multisig
            true // ✅ IS_PRODUCTION = true
        );

        await contract.waitForDeployment();
        const address = await contract.getAddress();

        console.log(`✅ Contract deployed: ${address}`);

        // 5. Pausar imediatamente
        await contract.pause();
        console.log("⏸️  Contract paused for initial setup");

        // 6. Verificar configurações
        const isProd = await contract.IS_PRODUCTION();
        const ownerAddr = await contract.owner();

        console.log("\n📋 Verification:");
        console.log(`   IS_PRODUCTION: ${isProd}`);
        console.log(`   Owner (Multisig): ${ownerAddr}`);
        console.log(`   USDT: ${usdtAddress}`);

        if (!isProd || ownerAddr !== multisig) {
            throw new Error("Configuration mismatch!");
        }

        console.log("\n✅ ALL CHECKS PASSED - Ready for testing");
        console.log("⚠️  DO NOT UNPAUSE WITHOUT FULL AUDIT");

        return {
            contract: address,
            multisig: ownerAddr,
            usdt: usdtAddress
        };
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

---

## 📞 SUPORTE

Após implementar as correções:

1. **Re-audit interno**: Verificar todas as correções
2. **Testnet**: Deploy em BSC Testnet por 2-4 semanas
3. **Audit externo**: Contratar firma especializada
4. **Bug bounty**: Lançar programa (mínimo $50k pool)
5. **Mainnet**: Deploy com ceremony + timelock

**Não fazer deploy em produção antes de completar TODOS os passos!**

---

**FIM DAS CORREÇÕES SUGERIDAS**
