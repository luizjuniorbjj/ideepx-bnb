// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title iDeepX Unified - Sistema de Distribuição MLM v3.1
 * @notice Sistema profissional de copy trading com MLM transparente
 * @dev Implementa modelo v3.1 com distribuição 30% MLM sustentável
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

contract iDeepXUnified is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ CONSTANTS ============

    /// @notice Distribuição dos 35% de performance fee
    uint256 public constant LIQUIDITY = 5;        // 5% - Reserva emergência
    uint256 public constant INFRASTRUCTURE = 15;  // 15% - Custos operacionais
    uint256 public constant COMPANY = 35;         // 35% - Margem empresa (v3.1: aumentado de 25%)
    uint256 public constant MLM_DISTRIBUTED = 30; // 30% - Distribuído rede (v3.1: reduzido de 60%)
    uint256 public constant MLM_LOCKED = 15;      // 15% - Vesting/fidelização

    /// @notice Distribuição MLM em base 10000 para precisão (basis points)
    /// @dev L1=33.33%, L2=13.33%, L3=10%, L4=6.67%, L5=3.33%, L6-10=6.67% cada
    /// Total L1-5: 66.66% (20% dos 35% = 7% do total)
    /// Total L6-10: 33.34% (10% dos 35% = 3.5% do total)
    uint256[10] public levelPercentagesMLM = [3333, 1333, 1000, 667, 333, 667, 667, 667, 667, 667];

    /// @notice Requisitos para qualificação níveis 6-10
    uint256 public constant MIN_VOLUME_FOR_ADVANCED = 5000 * 10**6; // $5,000 USDT
    uint256 public constant MIN_DIRECTS_FOR_ADVANCED = 5;           // 5 diretos

    // ============ STATE VARIABLES ============

    IERC20 public immutable USDT;
    address public owner;
    address public updater; // Backend que atualiza dados off-chain

    /// @notice Modo de teste (permite registros públicos) - APENAS PARA TESTES
    bool public testMode;

    /// @notice LAI (Licença de Acesso Inteligente) - v3.1: $19 (corrigido)
    uint256 public subscriptionFee = 19 * 10**6;     // $19 USDT (6 decimais)
    uint256 public subscriptionDuration = 30 days;   // 30 dias

    /// @notice Balanços do Sistema
    uint256 public liquidityPoolReserve;    // 5% reserva emergência
    uint256 public infrastructureBalance;   // 15% custos operacionais
    uint256 public companyBalance;          // 35% margem empresa
    uint256 public mlmLockedBalance;        // 15% vesting/fidelização
    uint256 public totalDistributed;        // Total já distribuído histórico
    uint256 public totalDeposited;          // Total depositado histórico

    /// @notice Controle de Saques
    uint256 public minWithdrawal = 50 * 10**6;         // $50 mínimo
    uint256 public maxWithdrawalPerTx = 10000 * 10**6; // $10k por transação
    uint256 public maxWithdrawalPerMonth = 30000 * 10**6; // $30k por mês

    // ============ STRUCTS ============

    struct User {
        // Identificação
        address wallet;
        address sponsor;

        // Status LAI
        bool hasActiveLAI;
        uint256 laiExpiresAt;
        uint8 networkLevel;        // 0-10 (0=sem LAI, 1-5=automático, 6-10=qualificado)

        // Balanços
        uint256 availableBalance;  // Disponível para saque
        uint256 lockedBalance;     // Em vesting
        uint256 totalEarned;       // Total ganho histórico
        uint256 withdrawnThisMonth;// Sacado este mês
        uint256 lastWithdrawMonth; // Último mês de saque (para reset)

        // Rede
        uint256 directsCount;      // Quantidade de diretos
        uint256 networkVolume;     // Volume acumulado (backend atualiza mensalmente)

        // Timestamp de registro
        uint256 registeredAt;
    }

    struct WeeklyDeposit {
        uint256 amount;            // Valor total depositado
        uint256 timestamp;         // Quando foi depositado
        uint256 mlmDistributed;    // Quanto foi distribuído no MLM
        uint256 usersRewarded;     // Quantos usuários receberam
        string performanceProof;   // IPFS hash da prova de performance
    }

    // ============ MAPPINGS ============

    mapping(address => User) public users;
    mapping(address => address[]) public directReferrals;
    mapping(uint256 => WeeklyDeposit) public weeklyDeposits;

    address[] public activeUsers;
    uint256 public currentWeek;
    uint256 public totalUsers;

    // ============ EVENTS ============

    // Eventos de Performance
    event PerformanceDeposited(uint256 indexed week, uint256 amount, string proof);
    event MLMDistributed(uint256 amount, uint256 usersRewarded);

    // Eventos de Comissões
    event CommissionCredited(address indexed user, uint256 amount, uint8 level);
    event CommissionClaimed(address indexed user, uint256 amount);

    // Eventos de LAI
    event LAIActivated(address indexed user, uint256 expiresAt);
    event LAIRenewed(address indexed user, uint256 newExpiresAt);

    // Eventos de Rede
    event UserRegistered(address indexed user, address indexed sponsor);
    event SponsorSet(address indexed user, address indexed sponsor);
    event SponsorBonusPaid(address indexed sponsor, address indexed referred, uint256 amount); // ✅ NOVO
    event LevelUpdated(address indexed user, uint8 oldLevel, uint8 newLevel); // ✅ NOVO

    // Eventos de Sistema
    event CompanyWithdrawal(uint256 amount);
    event InfrastructureWithdrawal(uint256 amount);
    event EmergencyPoolUsed(uint256 amount, string reason);
    event TestModeChanged(bool enabled); // ✅ NOVO - Para testes locais

    // ============ MODIFIERS ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyUpdater() {
        require(msg.sender == updater || msg.sender == owner || testMode, "Not updater");
        _;
    }

    modifier hasActiveLAI() {
        require(users[msg.sender].hasActiveLAI, "LAI required");
        require(users[msg.sender].laiExpiresAt > block.timestamp, "LAI expired");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(address _usdt) {
        require(_usdt != address(0), "Invalid USDT");
        USDT = IERC20(_usdt);
        owner = msg.sender;
        updater = msg.sender; // Pode ser alterado depois
    }

    // ============ USER REGISTRATION ============

    /**
     * @notice Registra novo usuário (apenas backend pode chamar)
     * @param user Endereço do usuário
     * @param _sponsor Endereço do patrocinador
     * @dev Usuário DEVE se cadastrar via link de indicação
     */
    function registerUser(address user, address _sponsor) external onlyUpdater {
        require(user != address(0), "Invalid user");
        require(users[user].wallet == address(0), "Already registered");
        require(_sponsor != user, "Cannot sponsor yourself");

        // Em test mode, permite primeiro usuário sem sponsor
        if (!testMode || totalUsers > 0) {
            require(_sponsor != address(0), "Sponsor required"); // ✅ Obrigatório
        }

        if (_sponsor != address(0)) {
            require(users[_sponsor].wallet != address(0), "Sponsor not registered");
        }

        users[user].wallet = user;
        users[user].sponsor = _sponsor;
        users[user].registeredAt = block.timestamp;

        // Incrementar contador de diretos do sponsor (se houver)
        if (_sponsor != address(0)) {
            directReferrals[_sponsor].push(user);
            users[_sponsor].directsCount++;
        }

        totalUsers++;

        emit UserRegistered(user, _sponsor);
        emit SponsorSet(user, _sponsor);
    }

    // ============ LAI FUNCTIONS ============

    /**
     * @notice Ativa LAI pagando com USDT
     * @dev v3.1: Corrigido bônus FREE - paga sponsor independente de ele ter LAI
     */
    function activateLAI() external nonReentrant whenNotPaused {
        require(users[msg.sender].wallet != address(0), "Not registered");

        USDT.safeTransferFrom(msg.sender, address(this), subscriptionFee);
        _activateLAI(msg.sender);
    }

    /**
     * @notice Ativa LAI usando saldo interno
     */
    function activateLAIWithBalance() external nonReentrant whenNotPaused {
        require(users[msg.sender].wallet != address(0), "Not registered");
        require(users[msg.sender].availableBalance >= subscriptionFee, "Insufficient balance");

        users[msg.sender].availableBalance -= subscriptionFee;
        _activateLAI(msg.sender);
    }

    /**
     * @notice Lógica interna de ativação LAI
     * @param user Endereço do usuário
     */
    function _activateLAI(address user) internal {
        User storage u = users[user];

        bool isFirstActivation = !u.hasActiveLAI;

        // Se primeira ativação, adiciona aos ativos
        if (isFirstActivation) {
            activeUsers.push(user);
        }

        u.hasActiveLAI = true;

        // Extende ou define nova expiração
        if (u.laiExpiresAt > block.timestamp) {
            u.laiExpiresAt += subscriptionDuration;
            emit LAIRenewed(user, u.laiExpiresAt);
        } else {
            u.laiExpiresAt = block.timestamp + subscriptionDuration;
            emit LAIActivated(user, u.laiExpiresAt);
        }

        // ✅ v3.1 CORREÇÃO: Paga bônus ao patrocinador SEMPRE (mesmo se FREE)
        // Usuário FREE pode indicar e recebe 25% quando indicado paga LAI
        if (u.sponsor != address(0)) {
            // ✅ REMOVIDO: && users[u.sponsor].hasActiveLAI
            // Agora paga independente de sponsor ter LAI!
            uint256 bonus = subscriptionFee / 4; // 25% = $4.75
            users[u.sponsor].availableBalance += bonus;
            users[u.sponsor].totalEarned += bonus;

            emit SponsorBonusPaid(u.sponsor, user, bonus);
        }

        // Atualizar nível automaticamente (L1-5 com LAI)
        _updateUserLevel(user);
    }

    // ============ NETWORK FUNCTIONS ============

    /**
     * @notice Atualiza nível do usuário baseado em qualificações
     * @param user Endereço do usuário
     * @dev Backend chama periodicamente para verificar qualificação
     */
    function updateUserLevel(address user) external onlyUpdater {
        _updateUserLevel(user);
    }

    /**
     * @notice Lógica interna de atualização de nível
     * @param user Endereço do usuário
     */
    function _updateUserLevel(address user) internal {
        User storage u = users[user];
        uint8 oldLevel = u.networkLevel;
        uint8 newLevel = oldLevel;

        // Sem LAI ativa → nível 0
        if (!u.hasActiveLAI || u.laiExpiresAt <= block.timestamp) {
            newLevel = 0;
        }
        // Com LAI ativa → mínimo nível 5 (L1-5 automático)
        else if (u.hasActiveLAI) {
            newLevel = 5;

            // Se qualificado → nível 10 (L1-10 completo)
            if (u.directsCount >= MIN_DIRECTS_FOR_ADVANCED &&
                u.networkVolume >= MIN_VOLUME_FOR_ADVANCED) {
                newLevel = 10;
            }
        }

        // Atualizar se mudou
        if (newLevel != oldLevel) {
            u.networkLevel = newLevel;
            emit LevelUpdated(user, oldLevel, newLevel);
        }
    }

    /**
     * @notice Backend atualiza volume do usuário (via API GMI)
     * @param user Endereço do usuário
     * @param volume Volume mensal atualizado
     */
    function updateUserVolume(address user, uint256 volume) external onlyUpdater {
        users[user].networkVolume = volume;
        _updateUserLevel(user); // Revalidar qualificação
    }

    // ============ PERFORMANCE DISTRIBUTION ============

    /**
     * @notice Deposita performance semanal e distribui automaticamente
     * @param amount Valor total da performance fee (35% do lucro)
     * @param proof Hash IPFS da prova de performance
     * @dev v3.1: Distribuição semanal pooled (não mensal!)
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

        // DISTRIBUI MLM (pooled entre qualificados)
        uint256 distributed = _distributeMLM(mlmAmount);

        // REGISTRA
        weeklyDeposits[currentWeek] = WeeklyDeposit({
            amount: amount,
            timestamp: block.timestamp,
            mlmDistributed: distributed,
            usersRewarded: _countRewardedUsers(),
            performanceProof: proof
        });

        emit PerformanceDeposited(currentWeek, amount, proof);
    }

    /**
     * @notice Distribui MLM pelos 10 níveis (pooled)
     * @param totalAmount Valor total do MLM a distribuir
     * @return distributed Valor efetivamente distribuído
     */
    function _distributeMLM(uint256 totalAmount) internal returns (uint256) {
        uint256 distributed = 0;

        // Para cada nível (1-10)
        for (uint8 level = 1; level <= 10; level++) {
            uint256 levelPercentage = levelPercentagesMLM[level - 1];
            uint256 levelAmount = (totalAmount * levelPercentage) / 10000;

            // Distribui para usuários qualificados neste nível
            distributed += _distributeToLevel(level, levelAmount);
        }

        totalDistributed += distributed;
        emit MLMDistributed(distributed, _countRewardedUsers());

        return distributed;
    }

    /**
     * @notice Distribui valor de um nível específico entre qualificados
     * @param level Nível (1-10)
     * @param amount Valor a distribuir neste nível
     * @return distributed Valor distribuído
     */
    function _distributeToLevel(uint8 level, uint256 amount) internal returns (uint256) {
        uint256 distributed = 0;
        uint256 qualifiedCount = 0;

        // Conta quantos estão qualificados neste nível
        for (uint256 i = 0; i < activeUsers.length; i++) {
            address user = activeUsers[i];
            if (_isQualifiedForLevel(user, level)) {
                qualifiedCount++;
            }
        }

        if (qualifiedCount == 0) return 0;

        // Divide igualmente entre qualificados
        uint256 perUser = amount / qualifiedCount;

        // Distribui
        for (uint256 i = 0; i < activeUsers.length; i++) {
            address user = activeUsers[i];
            if (_isQualifiedForLevel(user, level)) {
                users[user].availableBalance += perUser;
                users[user].totalEarned += perUser;
                distributed += perUser;
                emit CommissionCredited(user, perUser, level);
            }
        }

        return distributed;
    }

    /**
     * @notice Verifica se usuário está qualificado para receber em determinado nível
     * @param user Endereço do usuário
     * @param level Nível a verificar (1-10)
     * @return qualified True se qualificado
     */
    function _isQualifiedForLevel(address user, uint8 level) internal view returns (bool) {
        User memory u = users[user];

        // Precisa LAI ativa
        if (!u.hasActiveLAI || u.laiExpiresAt <= block.timestamp) return false;

        // Verifica se networkLevel >= level necessário
        return u.networkLevel >= level;
    }

    // ============ WITHDRAWAL FUNCTIONS ============

    /**
     * @notice Usuário saca suas comissões
     * @param amount Valor a sacar
     */
    function claimCommission(uint256 amount) external nonReentrant whenNotPaused {
        User storage u = users[msg.sender];

        require(amount >= minWithdrawal, "Below minimum");
        require(amount <= maxWithdrawalPerTx, "Above max per tx");
        require(u.availableBalance >= amount, "Insufficient balance");

        // Controle mensal
        uint256 currentMonth = block.timestamp / 30 days;
        if (u.lastWithdrawMonth != currentMonth) {
            u.lastWithdrawMonth = currentMonth;
            u.withdrawnThisMonth = 0;
        }

        require(u.withdrawnThisMonth + amount <= maxWithdrawalPerMonth, "Monthly limit exceeded");

        // Atualiza estado
        u.availableBalance -= amount;
        u.withdrawnThisMonth += amount;

        // Transfere
        USDT.safeTransfer(msg.sender, amount);

        emit CommissionClaimed(msg.sender, amount);
    }

    /**
     * @notice Empresa saca sua margem (35%)
     * @param amount Valor a sacar
     */
    function withdrawCompany(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= companyBalance, "Insufficient balance");

        companyBalance -= amount;
        USDT.safeTransfer(owner, amount);

        emit CompanyWithdrawal(amount);
    }

    /**
     * @notice Saca para custos de infraestrutura (15%)
     * @param amount Valor a sacar
     */
    function withdrawInfrastructure(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= infrastructureBalance, "Insufficient balance");

        infrastructureBalance -= amount;
        USDT.safeTransfer(owner, amount);

        emit InfrastructureWithdrawal(amount);
    }

    /**
     * @notice Usa pool de emergência (5%)
     * @param amount Valor a usar
     * @param reason Justificativa
     */
    function useEmergencyPool(uint256 amount, string memory reason) external onlyOwner {
        require(amount <= liquidityPoolReserve, "Insufficient reserve");
        require(bytes(reason).length > 0, "Reason required");

        liquidityPoolReserve -= amount;
        USDT.safeTransfer(owner, amount);

        emit EmergencyPoolUsed(amount, reason);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Dashboard completo do usuário
     * @param user Endereço do usuário
     */
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

    /**
     * @notice Estado do sistema
     */
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

    /**
     * @notice Preview de distribuição
     * @param amount Valor a simular
     */
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

    /**
     * @notice Obter diretos de um usuário
     * @param user Endereço do usuário
     */
    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directReferrals[user];
    }

    /**
     * @notice Obter depósito de uma semana específica
     * @param week Número da semana
     */
    function getWeeklyDeposit(uint256 week) external view returns (WeeklyDeposit memory) {
        return weeklyDeposits[week];
    }

    // ============ ADMIN FUNCTIONS ============

    function setUpdater(address _updater) external onlyOwner {
        updater = _updater;
    }

    /// @notice Ativa/desativa modo de teste (APENAS PARA AMBIENTE LOCAL)
    /// @dev Em testMode, qualquer um pode chamar registerUser()
    function setTestMode(bool _testMode) external onlyOwner {
        testMode = _testMode;
        emit TestModeChanged(_testMode);
    }

    /// @notice Função auxiliar para testes - retorna info completa do usuário
    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }

    function setSubscriptionFee(uint256 _fee) external onlyOwner {
        subscriptionFee = _fee;
    }

    function setWithdrawalLimits(
        uint256 _min,
        uint256 _maxPerTx,
        uint256 _maxPerMonth
    ) external onlyOwner {
        minWithdrawal = _min;
        maxWithdrawalPerTx = _maxPerTx;
        maxWithdrawalPerMonth = _maxPerMonth;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ INTERNAL HELPERS ============

    /**
     * @notice Conta quantos usuários receberam nesta distribuição
     */
    function _countRewardedUsers() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < activeUsers.length; i++) {
            User memory u = users[activeUsers[i]];
            if (u.hasActiveLAI && u.laiExpiresAt > block.timestamp) {
                count++;
            }
        }
        return count;
    }

    /**
     * @notice Remove usuários inativos da lista (manutenção)
     * @dev Deve ser chamado periodicamente pelo backend
     */
    function cleanInactiveUsers() external onlyOwner {
        uint256 activeCount = 0;

        // Reorganiza array removendo inativos
        for (uint256 i = 0; i < activeUsers.length; i++) {
            User memory u = users[activeUsers[i]];
            if (u.hasActiveLAI && u.laiExpiresAt > block.timestamp) {
                if (i != activeCount) {
                    activeUsers[activeCount] = activeUsers[i];
                }
                activeCount++;
            }
        }

        // Reduz tamanho do array
        while (activeUsers.length > activeCount) {
            activeUsers.pop();
        }
    }

    // ============ EMERGENCY ============

    /**
     * @notice Recupera tokens enviados por engano
     * @param token Endereço do token
     * @param amount Valor a recuperar
     */
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(USDT), "Cannot recover USDT");
        IERC20(token).safeTransfer(owner, amount);
    }
}
