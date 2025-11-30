// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title iDeepX Distribution V2 - Copy Trading + MLM Blockchain
 * @dev Sistema de distribuição MLM de 10 níveis na BNB Smart Chain
 * @notice Contrato para gerenciar assinaturas e distribuição de performance fees
 */
contract iDeepXDistributionV2 is Ownable, ReentrancyGuard, Pausable {

    // ========== CONSTANTES ==========

    /// @notice Endereço do token USDT na BNB Chain
    IERC20 public immutable USDT;

    /// @notice Taxa de assinatura mensal em USDT (com 6 decimais - BSC Testnet)
    uint256 public constant SUBSCRIPTION_FEE = 29 * 10**6; // $29 USDT

    /// @notice Duração da assinatura (30 dias em segundos)
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;

    /// @notice Limite máximo de clientes por batch (evita out of gas)
    uint256 public constant MAX_BATCH_SIZE = 50;

    /// @notice Saque mínimo permitido (evita micro-saques)
    uint256 public constant MIN_WITHDRAWAL = 5 * 10**6; // $5 USDT

    /// @notice Bônus direto para indicação (pago na assinatura)
    uint256 public constant DIRECT_BONUS = 5 * 10**6; // $5 USDT

    /// @notice Máximo de registros no histórico por usuário
    uint256 public constant MAX_HISTORY_PER_USER = 100;

    /// @notice Número de níveis MLM
    uint256 public constant MLM_LEVELS = 10;

    // ========== VARIÁVEIS DE ESTADO ==========

    /// @notice Modo Beta ativo (true) ou Permanente (false)
    bool public betaMode = true;

    /// @notice Carteiras para distribuição
    address public liquidityPool;
    address public infrastructureWallet;
    address public companyWallet;

    /// @notice Percentuais de distribuição (em basis points: 100 = 1%)
    uint256 public constant MLM_POOL_PERCENTAGE = 6000;      // 60%
    uint256 public constant LIQUIDITY_PERCENTAGE = 500;      // 5%
    uint256 public constant INFRASTRUCTURE_PERCENTAGE = 1200; // 12%
    uint256 public constant COMPANY_PERCENTAGE = 2300;       // 23%

    /// @notice Percentuais MLM Beta (em basis points)
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

    /// @notice Percentuais MLM Permanente (em basis points)
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

    // ========== ENUMS ==========

    enum EarningType {
        MLM_COMMISSION,     // Comissão MLM normal
        DIRECT_BONUS,       // Bônus direto por indicação
        RANK_BONUS          // Bônus futuro por rank
    }

    // ========== ESTRUTURAS ==========

    struct User {
        address wallet;
        address sponsor;
        bool isRegistered;
        bool subscriptionActive;
        uint256 subscriptionTimestamp;
        uint256 subscriptionExpiration;
        uint256 totalEarned;
        uint256 totalWithdrawn;
        uint256 directReferrals;
    }

    struct Earning {
        uint256 timestamp;
        uint256 amount;
        address fromClient;
        uint8 level;
        EarningType earningType;
    }

    struct ClientPerformance {
        uint256 totalFeesGenerated;
        uint256 totalFeesDistributed;
        uint256 lastFeeTimestamp;
        uint256 feeCount;
    }

    struct NetworkStats {
        uint256 totalDirects;
        uint256 totalEarned;
        uint256 totalWithdrawn;
        uint256 availableBalance;
    }

    /// @notice Mapping de usuários registrados
    mapping(address => User) public users;

    /// @notice Histórico de ganhos por usuário (limitado a 100 últimos)
    mapping(address => Earning[]) private earningHistory;

    /// @notice Performance de cada cliente que gera fees
    mapping(address => ClientPerformance) public clientPerformances;

    /// @notice Pausar usuário individualmente (segurança)
    mapping(address => bool) public userPaused;

    /// @notice Total de usuários registrados
    uint256 public totalUsers;

    /// @notice Total de assinaturas ativas
    uint256 public totalActiveSubscriptions;

    /// @notice Total distribuído em MLM
    uint256 public totalMLMDistributed;

    /// @notice Total sacado por todos os usuários
    uint256 public totalWithdrawn;

    // ========== EVENTOS ==========

    event UserRegistered(address indexed user, address indexed sponsor);
    event SubscriptionActivated(address indexed user, uint256 amount, uint256 expirationTimestamp);
    event SubscriptionRenewed(address indexed user, uint256 amount, uint256 newExpirationTimestamp);
    event SubscriptionExpired(address indexed user, uint256 expiredAt);
    event PerformanceFeeDistributed(address indexed user, uint256 amount, uint256 mlmAmount);
    event MLMCommissionPaid(address indexed recipient, address indexed from, uint256 level, uint256 amount);
    event MLMCommissionFailed(address indexed recipient, address indexed from, uint256 level, uint256 amount);
    event DirectBonusPaid(address indexed sponsor, address indexed newUser, uint256 amount);
    event EarningsWithdrawn(address indexed user, uint256 amount);
    event PoolDistribution(address indexed pool, uint256 amount, string poolType);
    event BetaModeToggled(bool betaMode);
    event WalletsUpdated(address liquidity, address infrastructure, address company);
    event UserPaused(address indexed user);
    event UserUnpaused(address indexed user);

    // ========== ERROS CUSTOMIZADOS ==========

    error InvalidAddress();
    error UserAlreadyRegistered();
    error UserNotRegistered();
    error SponsorNotRegistered();
    error InvalidAmount();
    error TransferFailed();
    error SubscriptionAlreadyActive();
    error SubscriptionNotActive();
    error ArrayLengthMismatch();
    error BatchSizeExceeded();
    error NoEarningsToWithdraw();
    error BelowMinimumWithdrawal();
    error UserIsPaused();

    // ========== MODIFICADORES ==========

    /// @notice Verifica se usuário não está pausado individualmente
    modifier whenUserNotPaused() {
        if (userPaused[msg.sender]) revert UserIsPaused();
        _;
    }

    // ========== CONSTRUTOR ==========

    /**
     * @notice Inicializa o contrato com o endereço do USDT e carteiras
     * @param _usdtAddress Endereço do token USDT na BNB Chain
     * @param _liquidityPool Endereço do pool de liquidez
     * @param _infrastructureWallet Endereço da carteira de infraestrutura
     * @param _companyWallet Endereço da carteira da empresa
     */
    constructor(
        address _usdtAddress,
        address _liquidityPool,
        address _infrastructureWallet,
        address _companyWallet
    ) Ownable(msg.sender) {
        if (_usdtAddress == address(0) ||
            _liquidityPool == address(0) ||
            _infrastructureWallet == address(0) ||
            _companyWallet == address(0)) {
            revert InvalidAddress();
        }

        USDT = IERC20(_usdtAddress);
        liquidityPool = _liquidityPool;
        infrastructureWallet = _infrastructureWallet;
        companyWallet = _companyWallet;

        // Registrar owner sem sponsor (primeiro usuário)
        users[msg.sender] = User({
            wallet: msg.sender,
            sponsor: address(0),
            isRegistered: true,
            subscriptionActive: true,
            subscriptionTimestamp: block.timestamp,
            subscriptionExpiration: block.timestamp + (365 days * 100), // Owner nunca expira
            totalEarned: 0,
            totalWithdrawn: 0,
            directReferrals: 0
        });
        totalUsers = 1;
        totalActiveSubscriptions = 1;
    }

    // ========== FUNÇÕES PRINCIPAIS ==========

    /**
     * @notice Cliente se registra no sistema com um sponsor
     * @param sponsorWallet Endereço da carteira do sponsor (indicador)
     */
    function selfRegister(address sponsorWallet) external whenNotPaused {
        if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();
        if (!users[sponsorWallet].isRegistered) revert SponsorNotRegistered();

        users[msg.sender] = User({
            wallet: msg.sender,
            sponsor: sponsorWallet,
            isRegistered: true,
            subscriptionActive: false,
            subscriptionTimestamp: 0,
            subscriptionExpiration: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            directReferrals: 0
        });

        // Incrementar referrals diretos do sponsor
        users[sponsorWallet].directReferrals++;
        totalUsers++;

        emit UserRegistered(msg.sender, sponsorWallet);
    }

    /**
     * @notice Cliente paga assinatura mensal de $29 USDT
     * @dev Requer aprovação prévia de USDT
     */
    function selfSubscribe() external nonReentrant whenNotPaused {
        if (!users[msg.sender].isRegistered) revert UserNotRegistered();
        if (users[msg.sender].subscriptionActive) revert SubscriptionAlreadyActive();

        // Transferir USDT do cliente para a empresa
        bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
        if (!success) revert TransferFailed();

        // Ativar assinatura
        uint256 expirationTime = block.timestamp + SUBSCRIPTION_DURATION;
        users[msg.sender].subscriptionActive = true;
        users[msg.sender].subscriptionTimestamp = block.timestamp;
        users[msg.sender].subscriptionExpiration = expirationTime;
        totalActiveSubscriptions++;

        emit SubscriptionActivated(msg.sender, SUBSCRIPTION_FEE, expirationTime);
    }

    /**
     * @notice Registra e assina em uma única transação
     * @param sponsorWallet Endereço do sponsor
     * @dev Paga assinatura ($29) + bônus direto ao sponsor ($5)
     */
    function registerAndSubscribe(address sponsorWallet) external nonReentrant whenNotPaused {
        // Registrar
        if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();
        if (!users[sponsorWallet].isRegistered) revert SponsorNotRegistered();

        uint256 expirationTime = block.timestamp + SUBSCRIPTION_DURATION;

        users[msg.sender] = User({
            wallet: msg.sender,
            sponsor: sponsorWallet,
            isRegistered: true,
            subscriptionActive: true,
            subscriptionTimestamp: block.timestamp,
            subscriptionExpiration: expirationTime,
            totalEarned: 0,
            totalWithdrawn: 0,
            directReferrals: 0
        });

        users[sponsorWallet].directReferrals++;
        totalUsers++;
        totalActiveSubscriptions++;

        emit UserRegistered(msg.sender, sponsorWallet);

        // Transferir assinatura ($29) para empresa
        bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
        if (!success) revert TransferFailed();

        // Transferir bônus direto ($5) para sponsor
        success = USDT.transferFrom(msg.sender, sponsorWallet, DIRECT_BONUS);
        if (!success) revert TransferFailed();

        // Registrar bônus direto
        users[sponsorWallet].totalEarned += DIRECT_BONUS;
        _recordEarning(sponsorWallet, DIRECT_BONUS, msg.sender, 0, EarningType.DIRECT_BONUS);

        emit SubscriptionActivated(msg.sender, SUBSCRIPTION_FEE, expirationTime);
        emit DirectBonusPaid(sponsorWallet, msg.sender, DIRECT_BONUS);
    }

    /**
     * @notice Renova assinatura expirada ou prestes a expirar
     * @dev Permite renovação até 7 dias antes da expiração
     */
    function renewSubscription() external nonReentrant whenNotPaused {
        if (!users[msg.sender].isRegistered) revert UserNotRegistered();
        if (!users[msg.sender].subscriptionActive) revert SubscriptionNotActive();

        // Permitir renovação se expirou ou está próximo de expirar (7 dias antes)
        uint256 currentExpiration = users[msg.sender].subscriptionExpiration;
        if (block.timestamp < currentExpiration - 7 days) {
            revert SubscriptionAlreadyActive();
        }

        // Transferir USDT
        bool success = USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE);
        if (!success) revert TransferFailed();

        // Calcular nova expiração (a partir da expiração anterior se ainda válida, ou agora se expirou)
        uint256 newExpiration;
        if (block.timestamp > currentExpiration) {
            // Já expirou - começar do zero
            newExpiration = block.timestamp + SUBSCRIPTION_DURATION;
            users[msg.sender].subscriptionActive = true;
            totalActiveSubscriptions++;
        } else {
            // Ainda válida - adicionar 30 dias à expiração atual
            newExpiration = currentExpiration + SUBSCRIPTION_DURATION;
        }

        users[msg.sender].subscriptionTimestamp = block.timestamp;
        users[msg.sender].subscriptionExpiration = newExpiration;

        emit SubscriptionRenewed(msg.sender, SUBSCRIPTION_FEE, newExpiration);
    }

    /**
     * @notice Admin processa performance fees em lote
     * @param clients Array de endereços dos clientes
     * @param amounts Array de valores de performance fee (em USDT)
     * @dev Distribui automaticamente: 60% MLM, 5% Liquidez, 12% Infra, 23% Empresa
     * @dev IMPORTANTE: Admin deve aprovar USDT total antes de chamar esta função
     * @dev Os fundos vêm da carteira do admin (msg.sender) que coletou as performance fees
     */
    function batchProcessPerformanceFees(
        address[] calldata clients,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant whenNotPaused {
        if (clients.length != amounts.length) revert ArrayLengthMismatch();
        if (clients.length == 0) revert InvalidAmount();
        if (clients.length > MAX_BATCH_SIZE) revert BatchSizeExceeded();

        for (uint256 i = 0; i < clients.length; i++) {
            _processPerformanceFee(clients[i], amounts[i]);
        }
    }

    /**
     * @notice Processa performance fee individual
     * @param client Endereço do cliente
     * @param amount Valor da performance fee em USDT
     */
    function _processPerformanceFee(address client, uint256 amount) private {
        if (amount == 0) revert InvalidAmount();
        if (!users[client].isRegistered) revert UserNotRegistered();

        // Registrar performance do cliente
        clientPerformances[client].totalFeesGenerated += amount;
        clientPerformances[client].totalFeesDistributed += amount;
        clientPerformances[client].lastFeeTimestamp = block.timestamp;
        clientPerformances[client].feeCount++;

        // Calcular distribuições
        uint256 mlmAmount = (amount * MLM_POOL_PERCENTAGE) / 10000;      // 60%
        uint256 liquidityAmount = (amount * LIQUIDITY_PERCENTAGE) / 10000; // 5%
        uint256 infraAmount = (amount * INFRASTRUCTURE_PERCENTAGE) / 10000; // 12%
        uint256 companyAmount = (amount * COMPANY_PERCENTAGE) / 10000;    // 23%

        // Transferir para os pools
        bool success;

        success = USDT.transferFrom(msg.sender, liquidityPool, liquidityAmount);
        if (!success) revert TransferFailed();
        emit PoolDistribution(liquidityPool, liquidityAmount, "Liquidity");

        success = USDT.transferFrom(msg.sender, infrastructureWallet, infraAmount);
        if (!success) revert TransferFailed();
        emit PoolDistribution(infrastructureWallet, infraAmount, "Infrastructure");

        success = USDT.transferFrom(msg.sender, companyWallet, companyAmount);
        if (!success) revert TransferFailed();
        emit PoolDistribution(companyWallet, companyAmount, "Company");

        // Distribuir MLM nos 10 níveis
        _distributeMLM(client, mlmAmount);

        emit PerformanceFeeDistributed(client, amount, mlmAmount);
    }

    /**
     * @notice Distribui comissão MLM nos 10 níveis
     * @param client Cliente que gerou a performance fee
     * @param mlmAmount Valor total disponível para MLM (60% da performance fee)
     * @dev CRÍTICO: Reverte transação se qualquer transferência falhar (segurança)
     */
    function _distributeMLM(address client, uint256 mlmAmount) private {
        address currentSponsor = users[client].sponsor;
        uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

        for (uint256 level = 0; level < MLM_LEVELS; level++) {
            // Se não tem mais sponsor, parar
            if (currentSponsor == address(0)) break;

            // Calcular comissão deste nível
            uint256 commission = (mlmAmount * percentages[level]) / 10000;

            // Transferir comissão para o CONTRATO - REVERTER SE FALHAR
            bool success = USDT.transferFrom(msg.sender, address(this), commission);
            if (!success) {
                emit MLMCommissionFailed(currentSponsor, client, level + 1, commission);
                revert TransferFailed();
            }

            // Atualizar contadores
            users[currentSponsor].totalEarned += commission;
            totalMLMDistributed += commission;

            // Registrar no histórico
            _recordEarning(currentSponsor, commission, client, uint8(level + 1), EarningType.MLM_COMMISSION);

            emit MLMCommissionPaid(currentSponsor, client, level + 1, commission);

            // Subir para o próximo nível
            currentSponsor = users[currentSponsor].sponsor;
        }
    }

    /**
     * @notice Registra ganho no histórico do usuário (limitado a 100 últimos)
     * @param recipient Quem recebeu
     * @param amount Valor
     * @param fromClient Cliente que gerou o ganho
     * @param level Nível MLM (0 para Direct Bonus)
     * @param earningType Tipo de ganho
     */
    function _recordEarning(
        address recipient,
        uint256 amount,
        address fromClient,
        uint8 level,
        EarningType earningType
    ) private {
        // Se já tem 100 registros, remove o mais antigo (FIFO)
        if (earningHistory[recipient].length >= MAX_HISTORY_PER_USER) {
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
    }

    // ========== FUNÇÕES DE SAQUE ==========

    /**
     * @notice Saca todas as comissões acumuladas
     * @dev Requer mínimo de $10 USDT
     */
    function withdrawEarnings() external nonReentrant whenNotPaused whenUserNotPaused {
        uint256 available = users[msg.sender].totalEarned - users[msg.sender].totalWithdrawn;

        if (available == 0) revert NoEarningsToWithdraw();
        if (available < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        users[msg.sender].totalWithdrawn += available;
        totalWithdrawn += available;

        bool success = USDT.transfer(msg.sender, available);
        if (!success) revert TransferFailed();

        emit EarningsWithdrawn(msg.sender, available);
    }

    /**
     * @notice Saca valor parcial das comissões
     * @param amount Valor a sacar
     */
    function withdrawPartial(uint256 amount) external nonReentrant whenNotPaused whenUserNotPaused {
        uint256 available = users[msg.sender].totalEarned - users[msg.sender].totalWithdrawn;

        if (amount == 0) revert InvalidAmount();
        if (available == 0) revert NoEarningsToWithdraw();
        if (amount > available) revert InvalidAmount();
        if (amount < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        users[msg.sender].totalWithdrawn += amount;
        totalWithdrawn += amount;

        bool success = USDT.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();

        emit EarningsWithdrawn(msg.sender, amount);
    }

    // ========== FUNÇÕES ADMINISTRATIVAS ==========

    /**
     * @notice Alterna entre modo Beta e Permanente
     */
    function toggleBetaMode() external onlyOwner {
        betaMode = !betaMode;
        emit BetaModeToggled(betaMode);
    }

    /**
     * @notice Atualiza as carteiras dos pools
     */
    function updateWallets(
        address _liquidityPool,
        address _infrastructureWallet,
        address _companyWallet
    ) external onlyOwner {
        if (_liquidityPool == address(0) ||
            _infrastructureWallet == address(0) ||
            _companyWallet == address(0)) {
            revert InvalidAddress();
        }

        liquidityPool = _liquidityPool;
        infrastructureWallet = _infrastructureWallet;
        companyWallet = _companyWallet;

        emit WalletsUpdated(_liquidityPool, _infrastructureWallet, _companyWallet);
    }

    /**
     * @notice Pausa o contrato em caso de emergência
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Desativa assinatura de um usuário (admin)
     */
    function deactivateSubscription(address user) external onlyOwner {
        if (users[user].subscriptionActive) {
            users[user].subscriptionActive = false;
            totalActiveSubscriptions--;
        }
    }

    /**
     * @notice Verifica e expira assinaturas vencidas (pode ser chamada por qualquer um)
     * @param userAddresses Array de endereços a verificar
     */
    function expireSubscriptions(address[] calldata userAddresses) external {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address user = userAddresses[i];
            if (users[user].subscriptionActive && block.timestamp > users[user].subscriptionExpiration) {
                users[user].subscriptionActive = false;
                totalActiveSubscriptions--;
                emit SubscriptionExpired(user, users[user].subscriptionExpiration);
            }
        }
    }

    /**
     * @notice Verifica se assinatura de um usuário está realmente ativa (não expirada)
     * @param user Endereço do usuário
     * @return true se assinatura está ativa e não expirada
     */
    function isSubscriptionActive(address user) public view returns (bool) {
        return users[user].subscriptionActive && block.timestamp <= users[user].subscriptionExpiration;
    }

    /**
     * @notice Pausa usuário individualmente (admin)
     * @param user Endereço do usuário
     */
    function pauseUser(address user) external onlyOwner {
        userPaused[user] = true;
        emit UserPaused(user);
    }

    /**
     * @notice Despausa usuário (admin)
     * @param user Endereço do usuário
     */
    function unpauseUser(address user) external onlyOwner {
        userPaused[user] = false;
        emit UserUnpaused(user);
    }

    // ========== FUNÇÕES DE VISUALIZAÇÃO ==========

    /**
     * @notice Retorna informações completas de um usuário
     */
    function getUserInfo(address userAddress) external view returns (
        address wallet,
        address sponsor,
        bool isRegistered,
        bool subscriptionActive,
        uint256 subscriptionTimestamp,
        uint256 subscriptionExpiration,
        uint256 totalEarned,
        uint256 totalWithdrawn,
        uint256 directReferrals
    ) {
        User memory user = users[userAddress];
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
    }

    /**
     * @notice Retorna últimos N ganhos do usuário
     * @param user Endereço do usuário
     * @param count Quantos registros retornar (máx 100)
     */
    function getEarningHistory(address user, uint256 count)
        external
        view
        returns (Earning[] memory)
    {
        uint256 len = earningHistory[user].length;
        uint256 returnCount = count > len ? len : count;

        Earning[] memory result = new Earning[](returnCount);
        for (uint i = 0; i < returnCount; i++) {
            result[i] = earningHistory[user][len - returnCount + i];
        }
        return result;
    }

    /**
     * @notice Retorna estatísticas rápidas do usuário
     * @param user Endereço do usuário
     */
    function getQuickStats(address user) external view returns (
        uint256 totalEarned,
        uint256 totalWithdrawn,
        uint256 availableBalance,
        uint256 directReferrals,
        bool subscriptionActive,
        uint256 daysUntilExpiry
    ) {
        User memory u = users[user];
        uint256 daysLeft = 0;

        if (u.subscriptionActive) {
            if (block.timestamp < u.subscriptionExpiration) {
                daysLeft = (u.subscriptionExpiration - block.timestamp) / 1 days;
            }
        }

        return (
            u.totalEarned,
            u.totalWithdrawn,
            u.totalEarned - u.totalWithdrawn,
            u.directReferrals,
            u.subscriptionActive && block.timestamp <= u.subscriptionExpiration,
            daysLeft
        );
    }

    /**
     * @notice Retorna estatísticas de rede do usuário
     * @param user Endereço do usuário
     */
    function getNetworkStats(address user) external view returns (NetworkStats memory) {
        User memory u = users[user];

        return NetworkStats({
            totalDirects: u.directReferrals,
            totalEarned: u.totalEarned,
            totalWithdrawn: u.totalWithdrawn,
            availableBalance: u.totalEarned - u.totalWithdrawn
        });
    }

    /**
     * @notice Retorna toda a linha ascendente (upline) de um usuário até 10 níveis
     */
    function getUpline(address userAddress) external view returns (address[10] memory) {
        address[10] memory upline;
        address currentSponsor = users[userAddress].sponsor;

        for (uint256 i = 0; i < MLM_LEVELS; i++) {
            if (currentSponsor == address(0)) break;
            upline[i] = currentSponsor;
            currentSponsor = users[currentSponsor].sponsor;
        }

        return upline;
    }

    /**
     * @notice Calcula quanto cada nível receberá de uma performance fee
     */
    function calculateMLMDistribution(uint256 performanceFee) external view returns (
        uint256[10] memory levelCommissions,
        uint256 totalMLM,
        uint256 liquidity,
        uint256 infrastructure,
        uint256 company
    ) {
        totalMLM = (performanceFee * MLM_POOL_PERCENTAGE) / 10000;
        liquidity = (performanceFee * LIQUIDITY_PERCENTAGE) / 10000;
        infrastructure = (performanceFee * INFRASTRUCTURE_PERCENTAGE) / 10000;
        company = (performanceFee * COMPANY_PERCENTAGE) / 10000;

        uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

        for (uint256 i = 0; i < MLM_LEVELS; i++) {
            levelCommissions[i] = (totalMLM * percentages[i]) / 10000;
        }

        return (levelCommissions, totalMLM, liquidity, infrastructure, company);
    }

    /**
     * @notice Retorna percentuais MLM ativos (Beta ou Permanente)
     */
    function getActiveMLMPercentages() external view returns (uint256[10] memory) {
        return betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;
    }

    /**
     * @notice Retorna estatísticas gerais do sistema
     */
    function getSystemStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalActiveSubscriptions,
        uint256 _totalMLMDistributed,
        bool _betaMode
    ) {
        return (totalUsers, totalActiveSubscriptions, totalMLMDistributed, betaMode);
    }
}
