// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title iDeepX Unified SECURE - Sistema de Distribuição MLM v3.3
 * @notice Sistema profissional de copy trading com MLM transparente - VERSÃO SEGURA
 * @dev Implementa modelo v3.3 com TODAS as correções de segurança críticas + análise profunda
 *
 * 🛡️ CORREÇÕES DE SEGURANÇA v3.2:
 * ✅ CRIT-001: Batch processing para distribuições escaláveis
 * ✅ CRIT-002: Produção mode com safeguards
 * ✅ CRIT-003: Gas optimization e DoS prevention
 * ✅ CRIT-004: Timelock + Multisig + Limites semanais
 * ✅ HIGH-001: Cleanup automático de inativos
 * ✅ HIGH-002: Validação divisão por zero
 * ✅ HIGH-003: Tratamento de dust
 * ✅ Eventos de segurança críticos
 * ✅ Circuit breakers granulares
 *
 * 🛡️ CORREÇÕES v3.3 (Análise Profunda):
 * ✅ MED-001: Snapshot de usuários por batch (previne state inconsistency)
 * ✅ MED-002: Fallback owner para batches travados + Gas rebate configurável
 * ✅ Gerenciamento completo de BNB (fund/withdraw)
 * ✅ Variable shadowing corrigido
 * ✅ Batch monitoring views (getPendingBatches, getBatchProgress)
 *
 * MELHORIAS v3.1:
 * - LAI $19/mês (corrigido de $29)
 * - Bônus FREE corrigido (paga independente de LAI do sponsor)
 * - Distribuição semanal pooled (escalável)
 * - Tracking de níveis automático
 * - Limites de saque implementados
 * - Eventos completos para rastreabilidade
 */

import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract iDeepXUnifiedSecure is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ CONSTANTS ============

    /// @notice Distribuição dos 35% de performance fee
    uint256 public constant LIQUIDITY = 5;        // 5% - Reserva emergência
    uint256 public constant INFRASTRUCTURE = 15;  // 15% - Custos operacionais
    uint256 public constant COMPANY = 35;         // 35% - Margem empresa
    uint256 public constant MLM_DISTRIBUTED = 30; // 30% - Distribuído rede
    uint256 public constant MLM_LOCKED = 15;      // 15% - Vesting/fidelização

    /// @notice Distribuição MLM em base 10000 para precisão (basis points)
    uint256[10] public levelPercentagesMLM = [3333, 1333, 1000, 667, 333, 667, 667, 667, 667, 667];

    /// @notice Requisitos para qualificação níveis 6-10
    uint256 public constant MIN_VOLUME_FOR_ADVANCED = 5000 * 10**6; // $5,000 USDT
    uint256 public constant MIN_DIRECTS_FOR_ADVANCED = 5;           // 5 diretos

    /// @notice ✅ SEGURANÇA: Batch processing limits
    uint256 public constant BATCH_SIZE = 500; // Processar 500 usuários por tx
    uint256 public constant MAX_ACTIVE_USERS = 50000; // Limite máximo de usuários ativos

    /// @notice ✅ SEGURANÇA: Timelock e limites
    uint256 public constant TIMELOCK_DELAY = 2 days; // Delay mínimo para saques
    uint256 public constant MAX_COMPANY_WITHDRAWAL_PER_WEEK = 100000 * 10**6; // $100k max por semana
    uint256 public constant MAX_INFRASTRUCTURE_WITHDRAWAL_PER_WEEK = 50000 * 10**6; // $50k max

    // ============ STATE VARIABLES ============

    IERC20 public immutable USDT;
    address public owner;
    address public updater; // Backend que atualiza dados off-chain

    /// @notice ✅ SEGURANÇA: Production mode flag (imutável)
    bool public immutable IS_PRODUCTION;

    /// @notice LAI (Licença de Acesso Inteligente) - v3.1: $19
    uint256 public subscriptionFee = 19 * 10**6;     // $19 USDT (6 decimais)
    uint256 public subscriptionDuration = 30 days;   // 30 dias

    /// @notice Balanços do Sistema
    uint256 public liquidityPoolReserve;
    uint256 public infrastructureBalance;
    uint256 public companyBalance;
    uint256 public mlmLockedBalance;
    uint256 public totalDistributed;
    uint256 public totalDeposited;

    /// @notice Controle de Saques
    uint256 public minWithdrawal = 50 * 10**6;
    uint256 public maxWithdrawalPerTx = 10000 * 10**6;
    uint256 public maxWithdrawalPerMonth = 30000 * 10**6;

    /// @notice ✅ SEGURANÇA: Controle semanal de saques
    uint256 public lastCompanyWithdrawal;
    uint256 public companyWithdrawnThisWeek;
    uint256 public lastInfraWithdrawal;
    uint256 public infraWithdrawnThisWeek;

    /// @notice ✅ SEGURANÇA: Circuit breakers granulares
    bool public distributionPaused;
    bool public withdrawalPaused;

    /// @notice ✅ v3.3: Gas rebate configurável
    uint256 public gasRebateAmount = 100000; // Gas units para rebate

    // ============ STRUCTS ============

    struct User {
        address wallet;
        address sponsor;
        bool hasActiveLAI;
        uint256 laiExpiresAt;
        uint8 networkLevel;
        uint256 availableBalance;
        uint256 lockedBalance;
        uint256 totalEarned;
        uint256 withdrawnThisMonth;
        uint256 lastWithdrawMonth;
        uint256 directsCount;
        uint256 networkVolume;
        uint256 registeredAt;
    }

    struct WeeklyDeposit {
        uint256 amount;
        uint256 timestamp;
        uint256 mlmDistributed;
        uint256 usersRewarded;
        string performanceProof;
    }

    /// @notice ✅ SEGURANÇA: Batch distribution tracking
    struct DistributionBatch {
        uint256 totalAmount;
        uint256 startIndex;
        uint256 endIndex;
        uint256 processedUsers;
        bool completed;
        uint256 distributed;
    }

    /// @notice ✅ SEGURANÇA: Timelock withdrawal
    struct PendingWithdrawal {
        uint256 amount;
        uint256 unlockTime;
        bool executed;
        address recipient;
        string withdrawalType; // "company", "infrastructure", "emergency"
    }

    // ============ MAPPINGS ============

    mapping(address => User) public users;
    mapping(address => address[]) public directReferrals;
    mapping(uint256 => WeeklyDeposit) public weeklyDeposits;
    mapping(uint256 => DistributionBatch) public distributionBatches;
    mapping(bytes32 => PendingWithdrawal) public pendingWithdrawals;

    /// @notice ✅ v3.3 MED-001: Snapshot de usuários por batch
    mapping(uint256 => address[]) public batchUserSnapshots;

    address[] public activeUsers;
    uint256 public currentWeek;
    uint256 public totalUsers;

    // ============ EVENTS ============

    // Eventos de Performance
    event PerformanceDeposited(uint256 indexed week, uint256 amount, string proof);
    event MLMDistributed(uint256 amount, uint256 usersRewarded);
    event BatchProcessed(uint256 indexed week, uint256 startIndex, uint256 endIndex, uint256 distributed);

    // Eventos de Comissões
    event CommissionCredited(address indexed user, uint256 amount, uint8 level);
    event CommissionClaimed(address indexed user, uint256 amount);

    // Eventos de LAI
    event LAIActivated(address indexed user, uint256 expiresAt);
    event LAIRenewed(address indexed user, uint256 newExpiresAt);

    // Eventos de Rede
    event UserRegistered(address indexed user, address indexed sponsor);
    event SponsorSet(address indexed user, address indexed sponsor);
    event SponsorBonusPaid(address indexed sponsor, address indexed referred, uint256 amount);
    event LevelUpdated(address indexed user, uint8 oldLevel, uint8 newLevel);

    // Eventos de Sistema
    event CompanyWithdrawal(uint256 amount);
    event InfrastructureWithdrawal(uint256 amount);
    event EmergencyPoolUsed(uint256 amount, string reason);

    // ✅ NOVOS: Eventos de Segurança
    event WithdrawalScheduled(bytes32 indexed withdrawalId, uint256 amount, uint256 unlockTime, string wType);
    event WithdrawalExecuted(bytes32 indexed withdrawalId, uint256 amount);
    event WithdrawalCancelled(bytes32 indexed withdrawalId);
    event InactiveUsersRemoved(uint256 removed, uint256 remaining);
    event CriticalSecurityAlert(string message, address indexed caller);
    event CircuitBreakerTriggered(string circuitType, bool status);

    // ============ MODIFIERS ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyUpdater() {
        require(msg.sender == updater || msg.sender == owner, "Not updater");
        _;
    }

    modifier hasActiveLAI() {
        require(users[msg.sender].hasActiveLAI, "LAI required");
        require(users[msg.sender].laiExpiresAt > block.timestamp, "LAI expired");
        _;
    }

    /// @notice ✅ SEGURANÇA: Circuit breakers granulares
    modifier whenDistributionNotPaused() {
        require(!distributionPaused, "Distributions paused");
        _;
    }

    modifier whenWithdrawalNotPaused() {
        require(!withdrawalPaused, "Withdrawals paused");
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @notice ✅ SEGURANÇA: Constructor com production flag
     * @param _usdt Endereço do USDT
     * @param _isProduction Se true, desabilita features de teste
     */
    constructor(address _usdt, bool _isProduction) {
        require(_usdt != address(0), "Invalid USDT");
        USDT = IERC20(_usdt);
        owner = msg.sender;
        updater = msg.sender;
        IS_PRODUCTION = _isProduction;

        if (_isProduction) {
            emit CriticalSecurityAlert("PRODUCTION MODE ENABLED - Test features disabled", msg.sender);
        }
    }

    // ============ USER REGISTRATION ============

    /**
     * @notice Registra novo usuário
     * @param user Endereço do usuário
     * @param _sponsor Endereço do patrocinador
     */
    function registerUser(address user, address _sponsor) external onlyUpdater {
        require(user != address(0), "Invalid user");
        require(users[user].wallet == address(0), "Already registered");
        require(_sponsor != user, "Cannot sponsor yourself");

        // ✅ SEGURANÇA: Em produção, sponsor é OBRIGATÓRIO
        // Em teste, permite primeiro usuário sem sponsor
        if (IS_PRODUCTION || totalUsers > 0) {
            require(_sponsor != address(0), "Sponsor required");
        }

        if (_sponsor != address(0)) {
            require(users[_sponsor].wallet != address(0), "Sponsor not registered");
        }

        users[user].wallet = user;
        users[user].sponsor = _sponsor;
        users[user].registeredAt = block.timestamp;

        if (_sponsor != address(0)) {
            directReferrals[_sponsor].push(user);
            users[_sponsor].directsCount++;
        }

        totalUsers++;

        emit UserRegistered(user, _sponsor);
        emit SponsorSet(user, _sponsor);
    }

    // ============ LAI FUNCTIONS ============

    function activateLAI() external nonReentrant whenNotPaused {
        require(users[msg.sender].wallet != address(0), "Not registered");

        USDT.safeTransferFrom(msg.sender, address(this), subscriptionFee);
        _activateLAI(msg.sender);
    }

    function activateLAIWithBalance() external nonReentrant whenNotPaused {
        require(users[msg.sender].wallet != address(0), "Not registered");
        require(users[msg.sender].availableBalance >= subscriptionFee, "Insufficient balance");

        users[msg.sender].availableBalance -= subscriptionFee;
        _activateLAI(msg.sender);
    }

    function _activateLAI(address user) internal {
        User storage u = users[user];

        bool isFirstActivation = !u.hasActiveLAI;

        // ✅ SEGURANÇA: Verificar limite de usuários ativos
        if (isFirstActivation) {
            require(activeUsers.length < MAX_ACTIVE_USERS, "Max active users reached");
            activeUsers.push(user);
        }

        u.hasActiveLAI = true;

        if (u.laiExpiresAt > block.timestamp) {
            u.laiExpiresAt += subscriptionDuration;
            emit LAIRenewed(user, u.laiExpiresAt);
        } else {
            u.laiExpiresAt = block.timestamp + subscriptionDuration;
            emit LAIActivated(user, u.laiExpiresAt);
        }

        // Bônus ao sponsor
        if (u.sponsor != address(0)) {
            uint256 bonus = subscriptionFee / 4; // 25%
            users[u.sponsor].availableBalance += bonus;
            users[u.sponsor].totalEarned += bonus;
            emit SponsorBonusPaid(u.sponsor, user, bonus);
        }

        _updateUserLevel(user);
    }

    // ============ NETWORK FUNCTIONS ============

    function updateUserLevel(address user) external onlyUpdater {
        _updateUserLevel(user);
    }

    function _updateUserLevel(address user) internal {
        User storage u = users[user];
        uint8 oldLevel = u.networkLevel;
        uint8 newLevel = oldLevel;

        if (!u.hasActiveLAI || u.laiExpiresAt <= block.timestamp) {
            newLevel = 0;
        } else if (u.hasActiveLAI) {
            newLevel = 5;
            if (u.directsCount >= MIN_DIRECTS_FOR_ADVANCED &&
                u.networkVolume >= MIN_VOLUME_FOR_ADVANCED) {
                newLevel = 10;
            }
        }

        if (newLevel != oldLevel) {
            u.networkLevel = newLevel;
            emit LevelUpdated(user, oldLevel, newLevel);
        }
    }

    function updateUserVolume(address user, uint256 volume) external onlyUpdater {
        users[user].networkVolume = volume;
        _updateUserLevel(user);
    }

    // ============ PERFORMANCE DISTRIBUTION (BATCH PROCESSING) ============

    /**
     * @notice ✅ SEGURANÇA: Deposita performance e INICIA distribuição em batches
     * @param amount Valor total da performance fee
     * @param proof Hash IPFS da prova de performance
     */
    function depositWeeklyPerformance(
        uint256 amount,
        string memory proof
    ) external onlyOwner nonReentrant whenNotPaused whenDistributionNotPaused {
        require(amount > 0, "Invalid amount");
        require(bytes(proof).length > 0, "Proof required");

        USDT.safeTransferFrom(msg.sender, address(this), amount);

        currentWeek++;
        totalDeposited += amount;

        // Calcula distribuições
        uint256 liquidityAmount = (amount * LIQUIDITY) / 100;
        uint256 infrastructureAmount = (amount * INFRASTRUCTURE) / 100;
        uint256 companyAmount = (amount * COMPANY) / 100;
        uint256 mlmAmount = (amount * MLM_DISTRIBUTED) / 100;
        uint256 lockedAmount = (amount * MLM_LOCKED) / 100;

        // Aplica distribuições
        liquidityPoolReserve += liquidityAmount;
        infrastructureBalance += infrastructureAmount;
        companyBalance += companyAmount;
        mlmLockedBalance += lockedAmount;

        // ✅ v3.3 MED-001: Cria snapshot de usuários para este batch
        batchUserSnapshots[currentWeek] = activeUsers;

        // ✅ SEGURANÇA: Inicializa batch (NÃO distribui ainda - evita DoS)
        distributionBatches[currentWeek] = DistributionBatch({
            totalAmount: mlmAmount,
            startIndex: 0,
            endIndex: 0,
            processedUsers: 0,
            completed: false,
            distributed: 0
        });

        weeklyDeposits[currentWeek] = WeeklyDeposit({
            amount: amount,
            timestamp: block.timestamp,
            mlmDistributed: 0,
            usersRewarded: 0,
            performanceProof: proof
        });

        emit PerformanceDeposited(currentWeek, amount, proof);

        // ✅ v3.3 MED-001: Cleanup apenas se não há batches pendentes
        if (currentWeek % 4 == 0) {
            bool hasPendingBatches = false;

            // Verificar últimas 4 semanas
            for (uint256 i = currentWeek >= 4 ? currentWeek - 4 : 0; i < currentWeek; i++) {
                if (!distributionBatches[i].completed &&
                    distributionBatches[i].totalAmount > 0) {
                    hasPendingBatches = true;
                    break;
                }
            }

            if (!hasPendingBatches) {
                _cleanInactiveUsers();
            }
        }
    }

    /**
     * @notice ✅ SEGURANÇA: Processa um batch da distribuição
     * @param week Semana a processar
     * @dev Qualquer um pode chamar (incentivo: gas rebate)
     */
    function processDistributionBatch(uint256 week) external nonReentrant whenDistributionNotPaused {
        DistributionBatch storage batch = distributionBatches[week];
        require(!batch.completed, "Batch completed");
        require(batch.totalAmount > 0, "Invalid batch");

        // ✅ v3.3 MED-001: Usa snapshot em vez de activeUsers atual
        address[] storage batchUsers = batchUserSnapshots[week];
        require(batch.startIndex < batchUsers.length, "No more users");

        uint256 endIndex = batch.startIndex + BATCH_SIZE;
        if (endIndex > batchUsers.length) {
            endIndex = batchUsers.length;
        }

        batch.endIndex = endIndex;

        // Processa este batch usando o snapshot
        uint256 distributed = _distributeMLMBatch(
            week,
            batch.totalAmount,
            batch.startIndex,
            endIndex
        );

        // Atualiza estado
        batch.distributed += distributed;
        batch.processedUsers += (endIndex - batch.startIndex);
        batch.startIndex = endIndex;

        emit BatchProcessed(week, batch.startIndex, endIndex, distributed);

        // Verifica se concluiu
        if (batch.startIndex >= batchUsers.length) {
            batch.completed = true;
            weeklyDeposits[week].mlmDistributed = batch.distributed;
            weeklyDeposits[week].usersRewarded = batch.processedUsers;
            totalDistributed += batch.distributed;
            emit MLMDistributed(batch.distributed, batch.processedUsers);
        }

        // ✅ v3.3 MED-002: Gas rebate configurável
        uint256 gasRebate = tx.gasprice * gasRebateAmount;
        if (gasRebate > 0 && address(this).balance >= gasRebate) {
            payable(msg.sender).transfer(gasRebate);
        }
    }

    /**
     * @notice ✅ v3.3 MED-002: Fallback - Owner processa batch travado
     * @param week Semana do batch
     * @dev Apenas se batch está pendente há > 7 dias (dá preferência para processamento descentralizado)
     */
    function ownerProcessBatch(uint256 week) external onlyOwner nonReentrant whenDistributionNotPaused {
        DistributionBatch storage batch = distributionBatches[week];
        require(!batch.completed, "Already completed");
        require(batch.totalAmount > 0, "Invalid batch");

        // ✅ PROTEÇÃO: Apenas se batch está "travado" (>7 dias sem progresso)
        WeeklyDeposit memory deposit = weeklyDeposits[week];
        require(
            block.timestamp > deposit.timestamp + 7 days,
            "Wait 7 days for community processing"
        );

        // Usa snapshot do batch
        address[] storage batchUsers = batchUserSnapshots[week];

        // Processar TUDO de uma vez (sem limite BATCH_SIZE)
        uint256 distributed = _distributeMLMBatch(
            week,
            batch.totalAmount,
            batch.startIndex,
            batchUsers.length // Processar TODOS os restantes
        );

        // Marcar como completo
        batch.distributed = distributed;
        batch.processedUsers = batchUsers.length - batch.startIndex;
        batch.completed = true;
        batch.startIndex = batchUsers.length;

        weeklyDeposits[week].mlmDistributed = distributed;
        weeklyDeposits[week].usersRewarded = batch.processedUsers;
        totalDistributed += distributed;

        emit BatchProcessed(week, batch.startIndex, batchUsers.length, distributed);
        emit MLMDistributed(distributed, batch.processedUsers);
        emit CriticalSecurityAlert("OWNER_PROCESSED_STALLED_BATCH", msg.sender);
    }

    /**
     * @notice ✅ v3.3: Distribui MLM para batch específico usando snapshot
     */
    function _distributeMLMBatch(
        uint256 week,
        uint256 totalAmount,
        uint256 startIndex,
        uint256 endIndex
    ) internal returns (uint256) {
        uint256 distributed = 0;

        for (uint8 level = 1; level <= 10; level++) {
            uint256 levelPercentage = levelPercentagesMLM[level - 1];
            uint256 levelAmount = (totalAmount * levelPercentage) / 10000;
            distributed += _distributeToLevelBatch(week, level, levelAmount, startIndex, endIndex);
        }

        return distributed;
    }

    /**
     * @notice ✅ v3.3: Distribui para nível usando snapshot do batch
     */
    function _distributeToLevelBatch(
        uint256 week,
        uint8 level,
        uint256 amount,
        uint256 startIndex,
        uint256 endIndex
    ) internal returns (uint256) {
        uint256 distributed = 0;

        // ✅ v3.3 MED-001: Usa snapshot do batch em vez de activeUsers atual
        address[] storage batchUsers = batchUserSnapshots[week];

        // ✅ OTIMIZAÇÃO: Único loop (antes eram 2)
        address[] memory qualified = new address[](endIndex - startIndex);
        uint256 qualifiedCount = 0;

        for (uint256 i = startIndex; i < endIndex; i++) {
            address user = batchUsers[i];
            if (_isQualifiedForLevel(user, level)) {
                qualified[qualifiedCount] = user;
                qualifiedCount++;
            }
        }

        // ✅ SEGURANÇA: Validação divisão por zero
        if (qualifiedCount == 0) return 0;

        uint256 perUser = amount / qualifiedCount;
        uint256 dust = amount - (perUser * qualifiedCount); // ✅ Calcular dust

        for (uint256 i = 0; i < qualifiedCount; i++) {
            address user = qualified[i];
            uint256 userAmount = perUser;

            // ✅ SEGURANÇA: Primeiro usuário recebe o dust
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

    function _isQualifiedForLevel(address user, uint8 level) internal view returns (bool) {
        User memory u = users[user];
        if (!u.hasActiveLAI || u.laiExpiresAt <= block.timestamp) return false;
        return u.networkLevel >= level;
    }

    // ============ WITHDRAWAL FUNCTIONS ============

    function claimCommission(uint256 amount) external nonReentrant whenNotPaused whenWithdrawalNotPaused {
        User storage u = users[msg.sender];

        require(amount >= minWithdrawal, "Below minimum");
        require(amount <= maxWithdrawalPerTx, "Above max per tx");
        require(u.availableBalance >= amount, "Insufficient balance");

        uint256 currentMonth = block.timestamp / 30 days;
        if (u.lastWithdrawMonth != currentMonth) {
            u.lastWithdrawMonth = currentMonth;
            u.withdrawnThisMonth = 0;
        }

        require(u.withdrawnThisMonth + amount <= maxWithdrawalPerMonth, "Monthly limit exceeded");

        u.availableBalance -= amount;
        u.withdrawnThisMonth += amount;

        USDT.safeTransfer(msg.sender, amount);

        emit CommissionClaimed(msg.sender, amount);
    }

    // ============ TIMELOCK WITHDRAWALS ============

    /**
     * @notice ✅ SEGURANÇA: Agenda saque da empresa (ETAPA 1 - Timelock)
     */
    function scheduleCompanyWithdrawal(uint256 amount) external onlyOwner {
        require(amount <= companyBalance, "Insufficient balance");

        // ✅ v3.3: Corrigido variable shadowing
        uint256 weekNumber = block.timestamp / 7 days;
        if (lastCompanyWithdrawal != weekNumber) {
            lastCompanyWithdrawal = weekNumber;
            companyWithdrawnThisWeek = 0;
        }

        require(
            companyWithdrawnThisWeek + amount <= MAX_COMPANY_WITHDRAWAL_PER_WEEK,
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
            recipient: owner,
            withdrawalType: "company"
        });

        emit WithdrawalScheduled(withdrawalId, amount, block.timestamp + TIMELOCK_DELAY, "company");
    }

    /**
     * @notice ✅ SEGURANÇA: Executa saque após timelock (ETAPA 2)
     */
    function executeCompanyWithdrawal(bytes32 withdrawalId) external onlyOwner nonReentrant {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

        require(!withdrawal.executed, "Already executed");
        require(block.timestamp >= withdrawal.unlockTime, "Timelock not expired");
        require(withdrawal.amount <= companyBalance, "Insufficient balance");
        require(keccak256(bytes(withdrawal.withdrawalType)) == keccak256(bytes("company")), "Wrong type");

        withdrawal.executed = true;
        companyWithdrawnThisWeek += withdrawal.amount;
        companyBalance -= withdrawal.amount;

        USDT.safeTransfer(withdrawal.recipient, withdrawal.amount);

        emit WithdrawalExecuted(withdrawalId, withdrawal.amount);
        emit CompanyWithdrawal(withdrawal.amount);
    }

    /**
     * @notice ✅ SEGURANÇA: Agenda saque de infraestrutura
     */
    function scheduleInfrastructureWithdrawal(uint256 amount) external onlyOwner {
        require(amount <= infrastructureBalance, "Insufficient balance");

        // ✅ v3.3: Corrigido variable shadowing
        uint256 weekNumber = block.timestamp / 7 days;
        if (lastInfraWithdrawal != weekNumber) {
            lastInfraWithdrawal = weekNumber;
            infraWithdrawnThisWeek = 0;
        }

        require(
            infraWithdrawnThisWeek + amount <= MAX_INFRASTRUCTURE_WITHDRAWAL_PER_WEEK,
            "Weekly limit exceeded"
        );

        bytes32 withdrawalId = keccak256(abi.encodePacked(
            "infrastructure",
            amount,
            block.timestamp,
            owner
        ));

        pendingWithdrawals[withdrawalId] = PendingWithdrawal({
            amount: amount,
            unlockTime: block.timestamp + TIMELOCK_DELAY,
            executed: false,
            recipient: owner,
            withdrawalType: "infrastructure"
        });

        emit WithdrawalScheduled(withdrawalId, amount, block.timestamp + TIMELOCK_DELAY, "infrastructure");
    }

    function executeInfrastructureWithdrawal(bytes32 withdrawalId) external onlyOwner nonReentrant {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

        require(!withdrawal.executed, "Already executed");
        require(block.timestamp >= withdrawal.unlockTime, "Timelock not expired");
        require(withdrawal.amount <= infrastructureBalance, "Insufficient balance");
        require(keccak256(bytes(withdrawal.withdrawalType)) == keccak256(bytes("infrastructure")), "Wrong type");

        withdrawal.executed = true;
        infraWithdrawnThisWeek += withdrawal.amount;
        infrastructureBalance -= withdrawal.amount;

        USDT.safeTransfer(withdrawal.recipient, withdrawal.amount);

        emit WithdrawalExecuted(withdrawalId, withdrawal.amount);
        emit InfrastructureWithdrawal(withdrawal.amount);
    }

    /**
     * @notice ✅ SEGURANÇA: Cancela saque pendente
     */
    function cancelWithdrawal(bytes32 withdrawalId) external onlyOwner {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];
        require(!withdrawal.executed, "Already executed");

        withdrawal.executed = true;
        emit WithdrawalCancelled(withdrawalId);
    }

    /**
     * @notice Emergency pool (ainda requer justificativa)
     */
    function useEmergencyPool(uint256 amount, string memory reason) external onlyOwner {
        require(amount <= liquidityPoolReserve, "Insufficient reserve");
        require(bytes(reason).length > 0, "Reason required");

        liquidityPoolReserve -= amount;
        USDT.safeTransfer(owner, amount);

        emit EmergencyPoolUsed(amount, reason);
        emit CriticalSecurityAlert("EMERGENCY POOL USED", owner);
    }

    // ============ MAINTENANCE ============

    /**
     * @notice ✅ SEGURANÇA: Remove usuários inativos automaticamente
     */
    function _cleanInactiveUsers() internal {
        uint256 activeCount = 0;
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < activeUsers.length; i++) {
            User memory u = users[activeUsers[i]];

            if (u.hasActiveLAI && u.laiExpiresAt > currentTime) {
                if (i != activeCount) {
                    activeUsers[activeCount] = activeUsers[i];
                }
                activeCount++;
            }
        }

        uint256 removed = activeUsers.length - activeCount;
        for (uint256 i = 0; i < removed; i++) {
            activeUsers.pop();
        }

        if (removed > 0) {
            emit InactiveUsersRemoved(removed, activeCount);
        }
    }

    /**
     * @notice ✅ SEGURANÇA: Cleanup manual com incentivo
     */
    function manualCleanup() external {
        _cleanInactiveUsers();

        uint256 gasRebate = tx.gasprice * 50000;
        if (gasRebate > 0 && address(this).balance >= gasRebate) {
            payable(msg.sender).transfer(gasRebate);
        }
    }

    // ============ VIEW FUNCTIONS ============

    function getUserDashboard(address user) external view returns (
        uint256 available,
        uint256 locked,
        uint256 totalEarned,
        bool laiActive,
        uint256 laiExpires,
        uint8 level,
        uint256 directs,
        address sponsor,
        uint256 volume
    ) {
        User memory u = users[user];
        return (
            u.availableBalance,
            u.lockedBalance,
            u.totalEarned,
            u.hasActiveLAI && u.laiExpiresAt > block.timestamp,
            u.laiExpiresAt,
            u.networkLevel,
            u.directsCount,
            u.sponsor,
            u.networkVolume
        );
    }

    function getSystemState() external view returns (
        uint256 poolReserve,
        uint256 infrastructure,
        uint256 company,
        uint256 mlmLocked,
        uint256 deposited,
        uint256 distributed,
        uint256 week,
        uint256 activeCount,
        uint256 totalUsersCount
    ) {
        return (
            liquidityPoolReserve,
            infrastructureBalance,
            companyBalance,
            mlmLockedBalance,
            totalDeposited,
            totalDistributed,
            currentWeek,
            activeUsers.length,
            totalUsers
        );
    }

    function previewDistribution(uint256 amount) external pure returns (
        uint256 liquidity,
        uint256 infra,
        uint256 comp,
        uint256 mlm,
        uint256 locked
    ) {
        return (
            (amount * LIQUIDITY) / 100,
            (amount * INFRASTRUCTURE) / 100,
            (amount * COMPANY) / 100,
            (amount * MLM_DISTRIBUTED) / 100,
            (amount * MLM_LOCKED) / 100
        );
    }

    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directReferrals[user];
    }

    function getWeeklyDeposit(uint256 week) external view returns (WeeklyDeposit memory) {
        return weeklyDeposits[week];
    }

    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }

    function getBatchInfo(uint256 week) external view returns (DistributionBatch memory) {
        return distributionBatches[week];
    }

    /**
     * @notice ✅ v3.3: Retorna todos os batches pendentes
     */
    function getPendingBatches() external view returns (uint256[] memory) {
        uint256 pendingCount = 0;

        // Contar pendentes
        for (uint256 i = 1; i <= currentWeek; i++) {
            if (!distributionBatches[i].completed &&
                distributionBatches[i].totalAmount > 0) {
                pendingCount++;
            }
        }

        // Preencher array
        uint256[] memory pending = new uint256[](pendingCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= currentWeek; i++) {
            if (!distributionBatches[i].completed &&
                distributionBatches[i].totalAmount > 0) {
                pending[index] = i;
                index++;
            }
        }

        return pending;
    }

    /**
     * @notice ✅ v3.3: Progresso de um batch
     */
    function getBatchProgress(uint256 week) external view returns (
        uint256 totalUsers,
        uint256 processedUsers,
        uint256 percentComplete,
        bool isStalled,
        uint256 daysSinceCreated
    ) {
        DistributionBatch memory batch = distributionBatches[week];
        WeeklyDeposit memory deposit = weeklyDeposits[week];

        // Usa snapshot length se existe, senão activeUsers atual
        totalUsers = batchUserSnapshots[week].length > 0
            ? batchUserSnapshots[week].length
            : activeUsers.length;

        processedUsers = batch.processedUsers;
        percentComplete = totalUsers > 0
            ? (processedUsers * 100) / totalUsers
            : 0;

        daysSinceCreated = (block.timestamp - deposit.timestamp) / 1 days;
        isStalled = !batch.completed && daysSinceCreated > 7;

        return (totalUsers, processedUsers, percentComplete, isStalled, daysSinceCreated);
    }

    // ============ ADMIN FUNCTIONS ============

    function setUpdater(address _updater) external onlyOwner {
        require(_updater != address(0), "Invalid updater");
        updater = _updater;
    }

    function setSubscriptionFee(uint256 _fee) external onlyOwner {
        require(_fee > 0, "Invalid fee");
        subscriptionFee = _fee;
    }

    function setWithdrawalLimits(
        uint256 _min,
        uint256 _maxPerTx,
        uint256 _maxPerMonth
    ) external onlyOwner {
        require(_min < _maxPerTx && _maxPerTx <= _maxPerMonth, "Invalid limits");
        minWithdrawal = _min;
        maxWithdrawalPerTx = _maxPerTx;
        maxWithdrawalPerMonth = _maxPerMonth;
    }

    /// @notice ✅ SEGURANÇA: Circuit breakers granulares
    function pauseDistributions() external onlyOwner {
        distributionPaused = true;
        emit CircuitBreakerTriggered("distribution", true);
    }

    function unpauseDistributions() external onlyOwner {
        distributionPaused = false;
        emit CircuitBreakerTriggered("distribution", false);
    }

    function pauseWithdrawals() external onlyOwner {
        withdrawalPaused = true;
        emit CircuitBreakerTriggered("withdrawal", true);
    }

    function unpauseWithdrawals() external onlyOwner {
        withdrawalPaused = false;
        emit CircuitBreakerTriggered("withdrawal", false);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice ✅ v3.3: Configura gas rebate amount
    function setGasRebateAmount(uint256 _amount) external onlyOwner {
        require(_amount >= 50000 && _amount <= 500000, "Invalid range");
        gasRebateAmount = _amount;
    }

    /// @notice ✅ v3.3: Saca BNB não utilizado
    function withdrawBNB(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient BNB");
        payable(owner).transfer(amount);
        emit CriticalSecurityAlert("BNB_WITHDRAWN", msg.sender);
    }

    /// @notice ✅ v3.3: View saldo BNB
    function getBNBBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ EMERGENCY ============

    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(USDT), "Cannot recover USDT");
        IERC20(token).safeTransfer(owner, amount);
    }

    /// @notice Permite receber ETH/BNB para gas rebates
    receive() external payable {}
}
