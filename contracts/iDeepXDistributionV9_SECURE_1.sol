// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title iDeepX Distribution V9_SECURE_1 - ENTERPRISE GRADE
 * @dev Versão com segurança enterprise:
 *  - Multisig integration (Gnosis Safe compatible)
 *  - Emergency reserve (1% = 20% da liquidity)
 *  - Circuit breaker (120% solvency threshold)
 *  - Withdrawal limits ($10k/tx, $50k/month)
 *  - Address redirects (multisig migration sem quebrar sponsor tree)
 *  - Flexible emergency reserve usage
 *  + Todas features V8_2 (pagamento saldo, inativos, ranks)
 */
contract iDeepXDistributionV9_SECURE_1 is AccessControl, ReentrancyGuard, Pausable {

    // ========== ROLES ==========
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY");

    // ========== CONSTANTES ==========
    IERC20 public immutable USDT;

    // USDT BSC = 6 decimais
    uint256 public constant USDT_DECIMALS = 6;
    uint256 public constant SUBSCRIPTION_FEE = 29 * 10**6;   // $29
    uint256 public constant MIN_WITHDRAWAL = 10 * 10**6;     // $10
    uint256 public constant DIRECT_BONUS = 5 * 10**6;        // $5
    uint256 public constant FAST_START_BONUS = 5 * 10**6;    // $5

    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    uint256 public constant MAX_BATCH_SIZE = 50;
    uint256 public constant MLM_LEVELS = 10;

    // descontos
    uint256 public constant DISCOUNT_3_MONTHS = 500;    // 5%
    uint256 public constant DISCOUNT_6_MONTHS = 1000;   // 10%
    uint256 public constant DISCOUNT_12_MONTHS = 1500;  // 15%

    // 60/5/12/23
    uint256 public constant MLM_POOL_PERCENTAGE = 6000;       // 60%
    uint256 public constant LIQUIDITY_PERCENTAGE = 500;       // 5%
    uint256 public constant INFRASTRUCTURE_PERCENTAGE = 1200; // 12%
    uint256 public constant COMPANY_PERCENTAGE = 2300;        // 23%

    // Subdivisão MLM
    uint256 public constant MLM_DIRECT_DISTRIBUTION = 7500;  // 75% p/ níveis
    uint256 public constant MLM_RESERVE = 2500;              // 25% p/ reserva

    // NOVO V9: Subdivisão Liquidity (5% total)
    uint256 public constant LIQ_OP_SPLIT_BPS = 8000;         // 80% = 4% operational
    uint256 public constant LIQ_RESERVE_SPLIT_BPS = 2000;    // 20% = 1% emergency

    // Uso da reserva MLM (pode usar depois)
    uint256 public constant RESERVE_RANK_BONUS = 3000;
    uint256 public constant RESERVE_PERFORMANCE = 3000;
    uint256 public constant RESERVE_CONSISTENCY = 2000;
    uint256 public constant RESERVE_FAST_START = 2000;

    // NOVO V9: Circuit Breaker & Withdrawal Limits
    uint256 public constant SOLVENCY_THRESHOLD_BPS = 12000;  // 120%
    uint256 public constant SOLVENCY_RECOVERY_BPS = 15000;   // 150%
    uint256 public constant MAX_WITHDRAWAL_PER_TX = 10000 * 10**6;      // $10k
    uint256 public constant MAX_WITHDRAWAL_PER_MONTH = 50000 * 10**6;   // $50k
    uint256 public constant MAX_POOL_WITHDRAWAL_PER_DAY = 10000 * 10**6;  // $10k
    uint256 public constant MAX_POOL_WITHDRAWAL_PER_MONTH = 50000 * 10**6; // $50k

    // ========== ESTADO ==========
    bool public betaMode = true;
    address public multisig;  // NOVO V9: Gnosis Safe ou multisig externa
    address public liquidityPool;
    address public infrastructureWallet;
    address public companyWallet;

    // pools internos
    uint256 public mlmReserveBalance;
    uint256 public liquidityBalance;          // 4% operational
    uint256 public emergencyReserve;          // NOVO V9: 1% emergency
    uint256 public infrastructureBalance;
    uint256 public companyBalance;

    // controle de passivos
    uint256 public totalUserBalances;
    uint256 public totalPendingReserve;

    // controle de comissões a inativos
    uint256 public totalInactiveEarningsHistorical;
    uint256 public totalPendingInactiveEarnings;

    // NOVO V9: Circuit Breaker
    bool public circuitBreakerActive;

    // NOVO V9: Withdrawal tracking
    mapping(address => uint256) public lastWithdrawalMonth;
    mapping(address => uint256) public withdrawnThisMonth;
    mapping(string => uint256) public lastPoolWithdrawalDay;
    mapping(string => uint256) public lastPoolWithdrawalMonth;
    mapping(string => uint256) public poolWithdrawnToday;
    mapping(string => uint256) public poolWithdrawnThisMonth;

    // NOVO V9: Address redirects (para migração de multisig)
    mapping(address => address) public addressRedirects;

    // percentuais MLM
    uint256[10] public mlmPercentagesBeta = [
        3000, 1500, 1250, 1000, 750, 500, 500, 500, 500, 500
    ];

    uint256[10] public mlmPercentagesPermanent = [
        2500, 1500, 1000, 1000, 800, 800, 800, 800, 400, 400
    ];

    // ========== ENUMS ==========
    enum Rank {
        STARTER,
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND,
        MASTER,
        GRANDMASTER
    }

    enum PaymentMethod {
        EXTERNAL_USDT,
        INTERNAL_BALANCE,
        MIXED
    }

    // NOVO V9: Emergency Reserve Destination
    enum ReserveDestination {
        LIQUIDITY,
        INFRASTRUCTURE,
        COMPANY,
        EXTERNAL
    }

    // ========== STRUCTS ==========
    struct User {
        address wallet;
        address sponsor;
        bool isRegistered;
        bool subscriptionActive;
        uint256 subscriptionTimestamp;
        uint256 subscriptionExpiration;
        uint256 totalEarned;
        uint256 totalWithdrawn;
        uint256 availableBalance;
        uint256 directReferrals;
        uint256 totalVolume;
        uint256 consecutiveRenewals;
        Rank currentRank;
        bool fastStartClaimed;
        uint256 registrationTimestamp;
        uint256 totalPaidWithBalance;
        uint256 pendingInactiveEarnings;
    }

    struct RankRequirement {
        uint256 directsRequired;
        uint256 volumeRequired;
    }

    struct RankBonus {
        uint256 monthlyBonus;
        uint256 directBonusBoost;
        uint256 mlmBoost;
    }

    // ========== MAPPINGS ==========
    mapping(address => User) public users;
    mapping(address => uint256) public pendingReserveBonus;
    mapping(address => bool) public userPaused;
    mapping(Rank => RankRequirement) public rankRequirements;
    mapping(Rank => RankBonus) public rankBonuses;

    address[] public top100Traders;
    mapping(address => uint256) public traderRanking;

    // ========== ESTATÍSTICAS ==========
    uint256 public totalUsers;
    uint256 public totalActiveSubscriptions;
    uint256 public totalMLMDistributed;
    uint256 public totalReserveDistributed;
    uint256 public totalVolumeProcessed;
    uint256 public totalSubscriptionRevenue;
    uint256 public totalPerformanceRevenue;
    uint256 public totalPaidWithInternalBalance;
    uint256 public totalEmergencyReserveUsed;  // NOVO V9

    // ========== EVENTOS ==========
    event UserRegistered(address indexed user, address indexed sponsor);
    event SubscriptionActivated(address indexed user, uint256 amount, uint256 months, PaymentMethod method);
    event SubscriptionPaidWithBalance(address indexed user, uint256 amount);
    event MLMCommissionPaid(address indexed recipient, address indexed from, uint256 level, uint256 amount);
    event CommissionCreditedToInactive(address indexed recipient, uint256 amount);
    event ReserveBonusPaid(address indexed user, uint256 amount, uint8 bonusType);
    event PoolWithdrawal(address indexed recipient, uint256 amount, string poolType);
    event BalanceTransferred(address indexed from, address indexed to, uint256 amount);
    event RankUpgraded(address indexed user, Rank oldRank, Rank newRank);

    // NOVO V9: Eventos de segurança
    event MultisigUpdated(address indexed oldMultisig, address indexed newMultisig);
    event EmergencyReserveAllocated(uint256 amount);
    event EmergencyReserveUsed(uint256 amount, string justification, ReserveDestination destination, address externalRecipient);
    event CircuitBreakerActivated(uint256 solvencyRatio);
    event CircuitBreakerDeactivated(uint256 solvencyRatio);
    event AddressRedirected(address indexed oldAddress, address indexed newAddress);

    // ========== ERROS ==========
    error InvalidAddress();
    error UserAlreadyRegistered();
    error UserNotRegistered();
    error SponsorNotRegistered();
    error InvalidAmount();
    error TransferFailed();
    error SubscriptionNotActive();
    error InsufficientBalance();
    error InsufficientInternalBalance();
    error InsufficientContractBalance();
    error BatchSizeExceeded();
    error BelowMinimumWithdrawal();
    error UserIsPaused();
    error NoReserveBonus();
    error PoolWithdrawalWouldCauseInsolvency();
    error ContractIsInsolvent();
    error InvalidMonthsAmount();
    error OnlyMultisig();
    error CircuitBreakerActive();
    error WithdrawalLimitExceeded();
    error InvalidJustification();

    // ========== MODIFIER ==========
    modifier ensureSolvency() {
        _;
        _checkSolvency();
    }

    modifier onlyMultisig() {
        if (msg.sender != multisig) revert OnlyMultisig();
        _;
    }

    modifier whenCircuitBreakerInactive() {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        _;
    }

    // ========== CONSTRUTOR ==========
    constructor(
        address _usdtAddress,
        address _multisig,
        address _liquidityPool,
        address _infrastructureWallet,
        address _companyWallet
    ) {
        if (
            _usdtAddress == address(0) ||
            _multisig == address(0) ||
            _liquidityPool == address(0) ||
            _infrastructureWallet == address(0) ||
            _companyWallet == address(0)
        ) {
            revert InvalidAddress();
        }

        USDT = IERC20(_usdtAddress);
        multisig = _multisig;
        liquidityPool = _liquidityPool;
        infrastructureWallet = _infrastructureWallet;
        companyWallet = _companyWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, _multisig);
        _grantRole(DISTRIBUTOR_ROLE, _multisig);
        _grantRole(UPDATER_ROLE, _multisig);
        _grantRole(TREASURY_ROLE, _multisig);

        _initializeRanks();
        _registerMultisig();
    }

    // ========== INIT ==========
    function _initializeRanks() private {
        rankRequirements[Rank.BRONZE] = RankRequirement(3, 1000 * 10**6);
        rankRequirements[Rank.SILVER] = RankRequirement(10, 10000 * 10**6);
        rankRequirements[Rank.GOLD] = RankRequirement(25, 50000 * 10**6);
        rankRequirements[Rank.PLATINUM] = RankRequirement(50, 250000 * 10**6);
        rankRequirements[Rank.DIAMOND] = RankRequirement(100, 1000000 * 10**6);
        rankRequirements[Rank.MASTER] = RankRequirement(250, 5000000 * 10**6);
        rankRequirements[Rank.GRANDMASTER] = RankRequirement(500, 25000000 * 10**6);

        rankBonuses[Rank.BRONZE] = RankBonus(50 * 10**6, 10, 5);
        rankBonuses[Rank.SILVER] = RankBonus(100 * 10**6, 20, 10);
        rankBonuses[Rank.GOLD] = RankBonus(250 * 10**6, 30, 15);
        rankBonuses[Rank.PLATINUM] = RankBonus(500 * 10**6, 50, 20);
        rankBonuses[Rank.DIAMOND] = RankBonus(1000 * 10**6, 75, 30);
        rankBonuses[Rank.MASTER] = RankBonus(2000 * 10**6, 100, 40);
        rankBonuses[Rank.GRANDMASTER] = RankBonus(5000 * 10**6, 150, 50);
    }

    function _registerMultisig() private {
        users[multisig] = User({
            wallet: multisig,
            sponsor: address(0),
            isRegistered: true,
            subscriptionActive: true,
            subscriptionTimestamp: block.timestamp,
            subscriptionExpiration: block.timestamp + (365 days * 100),
            totalEarned: 0,
            totalWithdrawn: 0,
            availableBalance: 0,
            directReferrals: 0,
            totalVolume: 0,
            consecutiveRenewals: 0,
            currentRank: Rank.GRANDMASTER,
            fastStartClaimed: true,
            registrationTimestamp: block.timestamp,
            totalPaidWithBalance: 0,
            pendingInactiveEarnings: 0
        });

        totalUsers = 1;
        totalActiveSubscriptions = 1;
    }

    // ========== REGISTRO ==========
    function registerWithSponsor(address sponsorWallet) external nonReentrant whenNotPaused {
        if (sponsorWallet == address(0) || sponsorWallet == msg.sender) revert InvalidAddress();
        if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();

        // Resolve redirects antes de validar
        address actualSponsor = _resolveAddress(sponsorWallet);
        if (!users[actualSponsor].isRegistered) revert SponsorNotRegistered();

        users[msg.sender] = User({
            wallet: msg.sender,
            sponsor: actualSponsor,  // Usa o endereço resolvido
            isRegistered: true,
            subscriptionActive: false,
            subscriptionTimestamp: 0,
            subscriptionExpiration: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            availableBalance: 0,
            directReferrals: 0,
            totalVolume: 0,
            consecutiveRenewals: 0,
            currentRank: Rank.STARTER,
            fastStartClaimed: false,
            registrationTimestamp: block.timestamp,
            totalPaidWithBalance: 0,
            pendingInactiveEarnings: 0
        });

        users[actualSponsor].directReferrals++;
        totalUsers++;

        emit UserRegistered(msg.sender, actualSponsor);
        _checkAndUpgradeRank(actualSponsor);
    }

    // ========== ASSINATURA ==========
    function activateSubscriptionWithUSDT(uint8 months)
        external
        nonReentrant
        whenNotPaused
        whenCircuitBreakerInactive
        ensureSolvency
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _processSubscription(msg.sender, months, PaymentMethod.EXTERNAL_USDT);
    }

    function activateSubscriptionWithBalance(uint8 months)
        external
        nonReentrant
        whenNotPaused
        whenCircuitBreakerInactive
        ensureSolvency
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _processSubscription(msg.sender, months, PaymentMethod.INTERNAL_BALANCE);
    }

    function activateSubscriptionMixed(uint8 months, uint256 balanceAmount)
        external
        nonReentrant
        whenNotPaused
        whenCircuitBreakerInactive
        ensureSolvency
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();

        uint256 totalCost = _calculateSubscriptionCost(months);

        if (balanceAmount > users[msg.sender].availableBalance) {
            revert InsufficientInternalBalance();
        }

        uint256 usdtRequired = totalCost - balanceAmount;

        if (balanceAmount > 0) {
            users[msg.sender].availableBalance -= balanceAmount;
            users[msg.sender].totalPaidWithBalance += balanceAmount;
            totalPaidWithInternalBalance += balanceAmount;
            totalUserBalances -= balanceAmount;
        }

        if (usdtRequired > 0) {
            if (!USDT.transferFrom(msg.sender, address(this), usdtRequired)) {
                // rollback
                users[msg.sender].availableBalance += balanceAmount;
                users[msg.sender].totalPaidWithBalance -= balanceAmount;
                totalPaidWithInternalBalance -= balanceAmount;
                totalUserBalances += balanceAmount;
                revert TransferFailed();
            }
        }

        _activateSubscriptionInternal(msg.sender, months, totalCost, PaymentMethod.MIXED);
    }

    function _processSubscription(address user, uint8 months, PaymentMethod method) private {
        if (!users[user].isRegistered) revert UserNotRegistered();
        if (userPaused[user]) revert UserIsPaused();

        uint256 totalCost = _calculateSubscriptionCost(months);

        if (method == PaymentMethod.INTERNAL_BALANCE) {
            if (users[user].availableBalance < totalCost) {
                revert InsufficientInternalBalance();
            }

            users[user].availableBalance -= totalCost;
            users[user].totalPaidWithBalance += totalCost;
            totalPaidWithInternalBalance += totalCost;
            totalUserBalances -= totalCost;

            emit SubscriptionPaidWithBalance(user, totalCost);

        } else if (method == PaymentMethod.EXTERNAL_USDT) {
            if (!USDT.transferFrom(user, address(this), totalCost)) {
                revert TransferFailed();
            }
        }

        _activateSubscriptionInternal(user, months, totalCost, method);
    }

    function _activateSubscriptionInternal(
        address user,
        uint8 months,
        uint256 totalCost,
        PaymentMethod method
    ) private {
        // se estava inativo e tinha comissão pendente, libera
        bool wasInactive = !users[user].subscriptionActive ||
                          block.timestamp > users[user].subscriptionExpiration;

        if (wasInactive && users[user].pendingInactiveEarnings > 0) {
            uint256 pendingAmount = users[user].pendingInactiveEarnings;
            users[user].pendingInactiveEarnings = 0;
            users[user].availableBalance += pendingAmount;
            if (totalPendingInactiveEarnings >= pendingAmount) {
                totalPendingInactiveEarnings -= pendingAmount;
            } else {
                totalPendingInactiveEarnings = 0;
            }
        }

        bool isRenewal = users[user].subscriptionTimestamp > 0;
        if (isRenewal && block.timestamp <= users[user].subscriptionExpiration + 7 days) {
            users[user].consecutiveRenewals++;
        } else if (isRenewal) {
            users[user].consecutiveRenewals = 0;
        }

        users[user].subscriptionActive = true;
        users[user].subscriptionTimestamp = block.timestamp;

        if (users[user].subscriptionExpiration > block.timestamp) {
            users[user].subscriptionExpiration += months * SUBSCRIPTION_DURATION;
        } else {
            users[user].subscriptionExpiration = block.timestamp + (months * SUBSCRIPTION_DURATION);
        }

        if (wasInactive) {
            totalActiveSubscriptions++;
        }

        totalSubscriptionRevenue += totalCost;

        _distributeSubscriptionFee(user, totalCost);

        if (!users[user].fastStartClaimed &&
            block.timestamp <= users[user].registrationTimestamp + 7 days) {
            _payFastStartBonus(user);
        }

        if (users[user].consecutiveRenewals >= 3) {
            _payConsistencyBonus(user);
        }

        emit SubscriptionActivated(user, totalCost, months, method);
    }

    function _calculateSubscriptionCost(uint8 months) private pure returns (uint256) {
        uint256 baseCost = SUBSCRIPTION_FEE * months;

        if (months >= 12) {
            return (baseCost * (10000 - DISCOUNT_12_MONTHS)) / 10000;
        } else if (months >= 6) {
            return (baseCost * (10000 - DISCOUNT_6_MONTHS)) / 10000;
        } else if (months >= 3) {
            return (baseCost * (10000 - DISCOUNT_3_MONTHS)) / 10000;
        }

        return baseCost;
    }

    // ========== DISTRIBUIÇÃO ASSINATURA ==========
    function _distributeSubscriptionFee(address subscriber, uint256 amount) private {
        uint256 mlmAmount = (amount * MLM_POOL_PERCENTAGE) / 10000;     // 60%
        uint256 liqAmount = (amount * LIQUIDITY_PERCENTAGE) / 10000;    // 5%
        uint256 infAmount = (amount * INFRASTRUCTURE_PERCENTAGE) / 10000; // 12%
        uint256 compAmount = (amount * COMPANY_PERCENTAGE) / 10000;     // 23%

        // NOVO V9: Split liquidity 80/20 (4% + 1%)
        uint256 liqOp = (liqAmount * LIQ_OP_SPLIT_BPS) / 10000;        // 80% de 5% = 4%
        uint256 liqRes = liqAmount - liqOp;                            // 20% de 5% = 1%

        liquidityBalance += liqOp;
        emergencyReserve += liqRes;  // ✅ CORRETO: Reserve vem DA liquidity
        infrastructureBalance += infAmount;
        companyBalance += compAmount;

        emit EmergencyReserveAllocated(liqRes);

        address sponsor = _resolveAddress(users[subscriber].sponsor);
        uint256 directPaid = 0;

        if (sponsor != address(0)) {
            uint256 directAmount = DIRECT_BONUS;

            RankBonus memory rb = rankBonuses[users[sponsor].currentRank];
            if (rb.directBonusBoost > 0) {
                directAmount = (directAmount * (100 + rb.directBonusBoost)) / 100;
            }

            if (users[sponsor].subscriptionActive) {
                users[sponsor].availableBalance += directAmount;
            } else {
                users[sponsor].pendingInactiveEarnings += directAmount;
                totalInactiveEarningsHistorical += directAmount;
                totalPendingInactiveEarnings += directAmount;
                emit CommissionCreditedToInactive(sponsor, directAmount);
            }

            users[sponsor].totalEarned += directAmount;
            totalUserBalances += directAmount;
            directPaid = directAmount;

            emit MLMCommissionPaid(sponsor, subscriber, 0, directAmount);
        }

        if (mlmAmount > directPaid) {
            mlmReserveBalance += (mlmAmount - directPaid);
        }
    }

    // ========== PERFORMANCE ==========
    function distributePerformanceFee(
        address[] calldata clients,
        uint256[] calldata amounts
    )
        external
        nonReentrant
        whenNotPaused
        whenCircuitBreakerInactive
        ensureSolvency
        onlyRole(DISTRIBUTOR_ROLE)
    {
        if (clients.length != amounts.length) revert InvalidAmount();
        if (clients.length > MAX_BATCH_SIZE) revert BatchSizeExceeded();

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        if (!USDT.transferFrom(msg.sender, address(this), totalAmount)) {
            revert TransferFailed();
        }

        for (uint256 i = 0; i < clients.length; i++) {
            _processSinglePerformanceFee(clients[i], amounts[i]);
        }
    }

    function _processSinglePerformanceFee(address client, uint256 amount) private {
        if (!users[client].isRegistered) revert UserNotRegistered();
        if (!users[client].subscriptionActive) revert SubscriptionNotActive();

        totalVolumeProcessed += amount;
        totalPerformanceRevenue += amount;

        uint256 mlmTotal = (amount * MLM_POOL_PERCENTAGE) / 10000;
        uint256 liqAmount = (amount * LIQUIDITY_PERCENTAGE) / 10000;
        uint256 infAmount = (amount * INFRASTRUCTURE_PERCENTAGE) / 10000;
        uint256 compAmount = (amount * COMPANY_PERCENTAGE) / 10000;

        // NOVO V9: Split liquidity 80/20
        uint256 liqOp = (liqAmount * LIQ_OP_SPLIT_BPS) / 10000;
        uint256 liqRes = liqAmount - liqOp;

        liquidityBalance += liqOp;
        emergencyReserve += liqRes;
        infrastructureBalance += infAmount;
        companyBalance += compAmount;

        emit EmergencyReserveAllocated(liqRes);

        uint256 mlmDirect = (mlmTotal * MLM_DIRECT_DISTRIBUTION) / 10000;
        uint256 mlmReserve = mlmTotal - mlmDirect;

        mlmReserveBalance += mlmReserve;

        _distributeMLMCommissions(client, mlmDirect);
    }

    function _distributeMLMCommissions(address client, uint256 totalMLM) private {
        address currentSponsor = _resolveAddress(users[client].sponsor);
        uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

        for (uint8 level = 0; level < MLM_LEVELS; level++) {
            if (currentSponsor == address(0)) break;

            uint256 commission = (totalMLM * percentages[level]) / 10000;

            RankBonus memory rb = rankBonuses[users[currentSponsor].currentRank];
            if (rb.mlmBoost > 0) {
                commission = (commission * (100 + rb.mlmBoost)) / 100;
            }

            if (users[currentSponsor].subscriptionActive) {
                users[currentSponsor].availableBalance += commission;
            } else {
                users[currentSponsor].pendingInactiveEarnings += commission;
                totalInactiveEarningsHistorical += commission;
                totalPendingInactiveEarnings += commission;
                emit CommissionCreditedToInactive(currentSponsor, commission);
            }

            users[currentSponsor].totalEarned += commission;
            users[currentSponsor].totalVolume += commission;
            totalUserBalances += commission;
            totalMLMDistributed += commission;

            emit MLMCommissionPaid(currentSponsor, client, level + 1, commission);

            _checkAndUpgradeRank(currentSponsor);

            currentSponsor = _resolveAddress(users[currentSponsor].sponsor);
        }
    }

    // ========== BONIFICAÇÕES ==========
    function _payFastStartBonus(address user) private {
        address sponsor = _resolveAddress(users[user].sponsor);
        if (sponsor != address(0)) {
            if (mlmReserveBalance >= FAST_START_BONUS) {
                pendingReserveBonus[sponsor] += FAST_START_BONUS;
                totalPendingReserve += FAST_START_BONUS;
                mlmReserveBalance -= FAST_START_BONUS;
                users[user].fastStartClaimed = true;
                emit ReserveBonusPaid(sponsor, FAST_START_BONUS, 5);
            }
        }
    }

    function _payConsistencyBonus(address user) private {
        uint256 bonus = 0;
        uint256 renewals = users[user].consecutiveRenewals;

        if (renewals >= 24) {
            bonus = (SUBSCRIPTION_FEE * 30) / 100;
        } else if (renewals >= 12) {
            bonus = (SUBSCRIPTION_FEE * 20) / 100;
        } else if (renewals >= 6) {
            bonus = (SUBSCRIPTION_FEE * 10) / 100;
        } else if (renewals >= 3) {
            bonus = (SUBSCRIPTION_FEE * 5) / 100;
        }

        if (bonus > 0 && mlmReserveBalance >= bonus) {
            pendingReserveBonus[user] += bonus;
            totalPendingReserve += bonus;
            mlmReserveBalance -= bonus;
            emit ReserveBonusPaid(user, bonus, 4);
        }
    }

    function claimReserveBonus() external nonReentrant whenNotPaused {
        uint256 amount = pendingReserveBonus[msg.sender];
        if (amount == 0) revert NoReserveBonus();

        pendingReserveBonus[msg.sender] = 0;
        totalPendingReserve -= amount;

        users[msg.sender].availableBalance += amount;
        users[msg.sender].totalEarned += amount;
        totalUserBalances += amount;

        totalReserveDistributed += amount;
    }

    // ========== SAQUES ==========
    function withdrawEarnings(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        whenCircuitBreakerInactive
    {
        if (userPaused[msg.sender]) revert UserIsPaused();
        if (amount < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        // NOVO V9: Check withdrawal limits
        _checkWithdrawalLimits(msg.sender, amount);

        uint256 available = users[msg.sender].availableBalance;
        if (amount > available) revert InsufficientInternalBalance();

        if (USDT.balanceOf(address(this)) < amount) {
            revert InsufficientContractBalance();
        }

        users[msg.sender].availableBalance -= amount;
        users[msg.sender].totalWithdrawn += amount;
        totalUserBalances -= amount;

        // NOVO V9: Update withdrawal tracking
        uint256 currentMonth = block.timestamp / 30 days;
        if (lastWithdrawalMonth[msg.sender] != currentMonth) {
            lastWithdrawalMonth[msg.sender] = currentMonth;
            withdrawnThisMonth[msg.sender] = 0;
        }
        withdrawnThisMonth[msg.sender] += amount;

        if (!USDT.transfer(msg.sender, amount)) {
            // rollback
            users[msg.sender].availableBalance += amount;
            users[msg.sender].totalWithdrawn -= amount;
            totalUserBalances += amount;
            withdrawnThisMonth[msg.sender] -= amount;
            revert TransferFailed();
        }
    }

    function withdrawAllEarnings() external nonReentrant whenNotPaused whenCircuitBreakerInactive {
        uint256 available = users[msg.sender].availableBalance;
        if (available < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        // NOVO V9: Check withdrawal limits
        _checkWithdrawalLimits(msg.sender, available);

        if (USDT.balanceOf(address(this)) < available) {
            revert InsufficientContractBalance();
        }

        users[msg.sender].availableBalance = 0;
        users[msg.sender].totalWithdrawn += available;
        totalUserBalances -= available;

        // NOVO V9: Update withdrawal tracking
        uint256 currentMonth = block.timestamp / 30 days;
        if (lastWithdrawalMonth[msg.sender] != currentMonth) {
            lastWithdrawalMonth[msg.sender] = currentMonth;
            withdrawnThisMonth[msg.sender] = 0;
        }
        withdrawnThisMonth[msg.sender] += available;

        if (!USDT.transfer(msg.sender, available)) {
            users[msg.sender].availableBalance = available;
            users[msg.sender].totalWithdrawn -= available;
            totalUserBalances += available;
            withdrawnThisMonth[msg.sender] -= available;
            revert TransferFailed();
        }
    }

    function _checkWithdrawalLimits(address user, uint256 amount) private view {
        if (amount > MAX_WITHDRAWAL_PER_TX) {
            revert WithdrawalLimitExceeded();
        }

        uint256 currentMonth = block.timestamp / 30 days;
        uint256 withdrawn = 0;

        if (lastWithdrawalMonth[user] == currentMonth) {
            withdrawn = withdrawnThisMonth[user];
        }

        if (withdrawn + amount > MAX_WITHDRAWAL_PER_MONTH) {
            revert WithdrawalLimitExceeded();
        }
    }

    // ========== TRANSFERÊNCIA INTERNA ==========
    function transferBalance(address to, uint256 amount) external nonReentrant whenNotPaused {
        if (!users[to].isRegistered) revert UserNotRegistered();
        if (amount == 0) revert InvalidAmount();
        if (users[msg.sender].availableBalance < amount) revert InsufficientInternalBalance();

        users[msg.sender].availableBalance -= amount;
        users[to].availableBalance += amount;

        emit BalanceTransferred(msg.sender, to, amount);
    }

    // ========== ADMIN ==========
    function withdrawPoolFunds(string calldata poolType, uint256 amount)
        external
        nonReentrant
        onlyRole(TREASURY_ROLE)
        whenCircuitBreakerInactive
    {
        // NOVO V9: Check pool withdrawal limits
        _checkPoolWithdrawalLimits(poolType, amount);

        uint256 requiredBalance = totalUserBalances + totalPendingReserve;
        uint256 currentBalance = USDT.balanceOf(address(this));

        if (currentBalance < requiredBalance + amount) {
            revert PoolWithdrawalWouldCauseInsolvency();
        }

        address recipient;

        if (keccak256(bytes(poolType)) == keccak256("liquidity")) {
            if (amount > liquidityBalance) revert InsufficientBalance();
            liquidityBalance -= amount;
            recipient = liquidityPool;
        } else if (keccak256(bytes(poolType)) == keccak256("infrastructure")) {
            if (amount > infrastructureBalance) revert InsufficientBalance();
            infrastructureBalance -= amount;
            recipient = infrastructureWallet;
        } else if (keccak256(bytes(poolType)) == keccak256("company")) {
            if (amount > companyBalance) revert InsufficientBalance();
            companyBalance -= amount;
            recipient = companyWallet;
        } else {
            revert InvalidAmount();
        }

        // NOVO V9: Update pool withdrawal tracking
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;

        if (lastPoolWithdrawalDay[poolType] != currentDay) {
            lastPoolWithdrawalDay[poolType] = currentDay;
            poolWithdrawnToday[poolType] = 0;
        }

        if (lastPoolWithdrawalMonth[poolType] != currentMonth) {
            lastPoolWithdrawalMonth[poolType] = currentMonth;
            poolWithdrawnThisMonth[poolType] = 0;
        }

        poolWithdrawnToday[poolType] += amount;
        poolWithdrawnThisMonth[poolType] += amount;

        if (!USDT.transfer(recipient, amount)) {
            // rollback tracking
            poolWithdrawnToday[poolType] -= amount;
            poolWithdrawnThisMonth[poolType] -= amount;
            revert TransferFailed();
        }

        emit PoolWithdrawal(recipient, amount, poolType);
    }

    function _checkPoolWithdrawalLimits(string calldata poolType, uint256 amount) private view {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;

        uint256 poolWithdrawnToday_ = 0;
        uint256 poolWithdrawnThisMonth_ = 0;

        if (lastPoolWithdrawalDay[poolType] == currentDay) {
            poolWithdrawnToday_ = poolWithdrawnToday[poolType];
        }

        if (lastPoolWithdrawalMonth[poolType] == currentMonth) {
            poolWithdrawnThisMonth_ = poolWithdrawnThisMonth[poolType];
        }

        if (poolWithdrawnToday_ + amount > MAX_POOL_WITHDRAWAL_PER_DAY) {
            revert WithdrawalLimitExceeded();
        }

        if (poolWithdrawnThisMonth_ + amount > MAX_POOL_WITHDRAWAL_PER_MONTH) {
            revert WithdrawalLimitExceeded();
        }
    }

    // ========== NOVO V9: MULTISIG MANAGEMENT ==========
    function updateMultisig(address newMultisig) external onlyMultisig {
        if (newMultisig == address(0)) revert InvalidAddress();
        if (newMultisig == multisig) revert InvalidAddress();

        address old = multisig;
        multisig = newMultisig;

        // Transfer all roles
        _grantRole(DEFAULT_ADMIN_ROLE, newMultisig);
        _grantRole(DISTRIBUTOR_ROLE, newMultisig);
        _grantRole(UPDATER_ROLE, newMultisig);
        _grantRole(TREASURY_ROLE, newMultisig);

        _revokeRole(DEFAULT_ADMIN_ROLE, old);
        _revokeRole(DISTRIBUTOR_ROLE, old);
        _revokeRole(UPDATER_ROLE, old);
        _revokeRole(TREASURY_ROLE, old);

        // Transfer User struct if registered
        User storage uOld = users[old];
        if (uOld.isRegistered) {
            users[newMultisig] = uOld;
            users[newMultisig].wallet = newMultisig;

            // ✅ CORREÇÃO CRÍTICA: Usa redirect ao invés de deletar
            addressRedirects[old] = newMultisig;
            emit AddressRedirected(old, newMultisig);

            // NÃO deletar users[old] - mantém para histórico e referências
            // delete users[old];  // ❌ REMOVIDO
        }

        emit MultisigUpdated(old, newMultisig);
    }

    // ========== NOVO V9: EMERGENCY RESERVE ==========
    /**
     * @dev Usa a reserva de emergência com destino flexível
     * @param amount Quantidade de USDT da reserva a usar
     * @param justification Justificativa para audit trail
     * @param destination Para onde vai o dinheiro (LIQUIDITY, INFRASTRUCTURE, COMPANY, EXTERNAL)
     * @param externalRecipient Endereço externo (usado apenas se destination == EXTERNAL)
     */
    function useEmergencyReserve(
        uint256 amount,
        string calldata justification,
        ReserveDestination destination,
        address externalRecipient
    ) external onlyMultisig nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (bytes(justification).length == 0) revert InvalidJustification();
        if (amount > emergencyReserve) revert InsufficientBalance();

        emergencyReserve -= amount;
        totalEmergencyReserveUsed += amount;

        // ✅ CORREÇÃO CRÍTICA: Especifica destino do USDT
        if (destination == ReserveDestination.LIQUIDITY) {
            liquidityBalance += amount;
        } else if (destination == ReserveDestination.INFRASTRUCTURE) {
            infrastructureBalance += amount;
        } else if (destination == ReserveDestination.COMPANY) {
            companyBalance += amount;
        } else if (destination == ReserveDestination.EXTERNAL) {
            if (externalRecipient == address(0)) revert InvalidAddress();

            if (!USDT.transfer(externalRecipient, amount)) {
                // Rollback
                emergencyReserve += amount;
                totalEmergencyReserveUsed -= amount;
                revert TransferFailed();
            }
        }

        emit EmergencyReserveUsed(amount, justification, destination, externalRecipient);
    }

    // ========== NOVO V9: CIRCUIT BREAKER ==========
    function checkAndUpdateCircuitBreaker() external {
        uint256 required = totalUserBalances + totalPendingReserve;
        if (required == 0) return;  // Evita divisão por zero

        uint256 current = USDT.balanceOf(address(this));
        uint256 solvencyRatio = (current * 10000) / required;  // Em basis points

        if (!circuitBreakerActive && solvencyRatio < SOLVENCY_THRESHOLD_BPS) {
            circuitBreakerActive = true;
            emit CircuitBreakerActivated(solvencyRatio);
        } else if (circuitBreakerActive && solvencyRatio >= SOLVENCY_RECOVERY_BPS) {
            circuitBreakerActive = false;
            emit CircuitBreakerDeactivated(solvencyRatio);
        }
    }

    function manualCircuitBreakerToggle(bool activate) external onlyMultisig {
        circuitBreakerActive = activate;

        if (activate) {
            uint256 solvencyRatio = getSolvencyRatio();
            emit CircuitBreakerActivated(solvencyRatio);
        } else {
            uint256 solvencyRatio = getSolvencyRatio();
            emit CircuitBreakerDeactivated(solvencyRatio);
        }
    }

    // ========== NOVO V9: ADDRESS RESOLUTION ==========
    function _resolveAddress(address addr) private view returns (address) {
        address current = addr;
        uint256 depth = 0;

        // Limite de 10 redirects para evitar loops
        while (addressRedirects[current] != address(0) && depth < 10) {
            current = addressRedirects[current];
            depth++;
        }

        return current;
    }

    function resolveAddress(address addr) external view returns (address) {
        return _resolveAddress(addr);
    }

    // ========== ROLE MANAGEMENT ==========
    function grantDistributorRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(DISTRIBUTOR_ROLE, account);
    }

    function revokeDistributorRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        revokeRole(DISTRIBUTOR_ROLE, account);
    }

    function grantTreasuryRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(TREASURY_ROLE, account);
    }

    function revokeTreasuryRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        revokeRole(TREASURY_ROLE, account);
    }

    function grantUpdaterRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(UPDATER_ROLE, account);
    }

    function revokeUpdaterRole(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        revokeRole(UPDATER_ROLE, account);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function pauseUser(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        userPaused[user] = true;
    }

    function unpauseUser(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        userPaused[user] = false;
    }

    // ========== SOLVÊNCIA ==========
    function _checkSolvency() private view {
        uint256 required = totalUserBalances + totalPendingReserve;
        uint256 current = USDT.balanceOf(address(this));

        if (current < required) {
            revert ContractIsInsolvent();
        }
    }

    // ========== RANK UPGRADE ==========
    function _checkAndUpgradeRank(address user) private {
        User storage u = users[user];
        if (!u.isRegistered) return;
        if (u.currentRank == Rank.GRANDMASTER) return;

        Rank nextRank = Rank(uint8(u.currentRank) + 1);
        RankRequirement memory req = rankRequirements[nextRank];

        if (u.directReferrals >= req.directsRequired && u.totalVolume >= req.volumeRequired) {
            Rank oldRank = u.currentRank;
            u.currentRank = nextRank;

            uint256 upgradeBonus = rankBonuses[nextRank].monthlyBonus / 10;
            if (upgradeBonus > 0 && mlmReserveBalance >= upgradeBonus) {
                pendingReserveBonus[user] += upgradeBonus;
                totalPendingReserve += upgradeBonus;
                mlmReserveBalance -= upgradeBonus;
                emit ReserveBonusPaid(user, upgradeBonus, 2);
            }

            emit RankUpgraded(user, oldRank, nextRank);

            _checkAndUpgradeRank(user);
        }
    }

    function requestRankUpgrade() external nonReentrant whenNotPaused {
        if (!users[msg.sender].isRegistered) revert UserNotRegistered();
        _checkAndUpgradeRank(msg.sender);
    }

    function batchUpgradeRanks(address[] calldata addrs)
        external
        nonReentrant
        onlyRole(UPDATER_ROLE)
    {
        if (addrs.length > MAX_BATCH_SIZE) revert BatchSizeExceeded();

        for (uint256 i = 0; i < addrs.length; i++) {
            _checkAndUpgradeRank(addrs[i]);
        }
    }

    // ========== VIEWS ==========
    function getUserInfo(address user)
        external
        view
        returns (
            bool isRegistered,
            bool subscriptionActive,
            uint256 totalEarned,
            uint256 availableBalance,
            uint256 totalWithdrawn,
            uint256 subscriptionExpiration,
            uint256 totalPaidWithBalance,
            uint256 pendingBonus,
            uint256 pendingInactive,
            Rank currentRank
        )
    {
        User memory u = users[user];
        return (
            u.isRegistered,
            u.subscriptionActive && block.timestamp <= u.subscriptionExpiration,
            u.totalEarned,
            u.availableBalance,
            u.totalWithdrawn,
            u.subscriptionExpiration,
            u.totalPaidWithBalance,
            pendingReserveBonus[user],
            u.pendingInactiveEarnings,
            u.currentRank
        );
    }

    function getUserDetailedInfo(address user)
        external
        view
        returns (
            address sponsor,
            uint256 directReferrals,
            uint256 totalVolume,
            uint256 consecutiveRenewals,
            uint256 registrationTimestamp,
            bool fastStartClaimed
        )
    {
        User memory u = users[user];
        return (
            u.sponsor,
            u.directReferrals,
            u.totalVolume,
            u.consecutiveRenewals,
            u.registrationTimestamp,
            u.fastStartClaimed
        );
    }

    function getSubscriptionCost(uint8 months) external pure returns (uint256) {
        return _calculateSubscriptionCost(months);
    }

    function canPaySubscriptionWithBalance(address user, uint8 months)
        external
        view
        returns (bool canPay, uint256 cost, uint256 balance)
    {
        cost = _calculateSubscriptionCost(months);
        balance = users[user].availableBalance;
        canPay = balance >= cost;
    }

    function getSystemStats()
        external
        view
        returns (
            uint256 _totalUsers,
            uint256 _totalActive,
            uint256 _totalPaidWithBalance,
            uint256 _totalMLMDistributed,
            uint256 _totalInactiveHistorical,
            uint256 _totalInactivePending,
            uint256 _contractBalance,
            bool _betaMode
        )
    {
        return (
            totalUsers,
            totalActiveSubscriptions,
            totalPaidWithInternalBalance,
            totalMLMDistributed,
            totalInactiveEarningsHistorical,
            totalPendingInactiveEarnings,
            USDT.balanceOf(address(this)),
            betaMode
        );
    }

    function getSolvencyStatus()
        external
        view
        returns (
            bool isSolvent,
            uint256 requiredBalance,
            uint256 currentBalance,
            uint256 surplus,
            uint256 deficit
        )
    {
        uint256 required = totalUserBalances + totalPendingReserve;
        uint256 current = USDT.balanceOf(address(this));

        return (
            current >= required,
            required,
            current,
            current > required ? current - required : 0,
            required > current ? required - current : 0
        );
    }

    function getSolvencyRatio() public view returns (uint256) {
        uint256 required = totalUserBalances + totalPendingReserve;
        if (required == 0) return 10000;  // 100% se não há passivos

        uint256 current = USDT.balanceOf(address(this));
        return (current * 10000) / required;  // Em basis points
    }

    // NOVO V9: Security Views
    function getSecurityStatus()
        external
        view
        returns (
            address _multisig,
            uint256 _emergencyReserve,
            bool _circuitBreakerActive,
            uint256 _solvencyRatio,
            uint256 _totalEmergencyReserveUsed
        )
    {
        return (
            multisig,
            emergencyReserve,
            circuitBreakerActive,
            getSolvencyRatio(),
            totalEmergencyReserveUsed
        );
    }

    function getWithdrawalLimits(address user)
        external
        view
        returns (
            uint256 maxPerTx,
            uint256 maxPerMonth,
            uint256 remainingThisMonth
        )
    {
        uint256 currentMonth = block.timestamp / 30 days;
        uint256 withdrawn = 0;

        if (lastWithdrawalMonth[user] == currentMonth) {
            withdrawn = withdrawnThisMonth[user];
        }

        return (
            MAX_WITHDRAWAL_PER_TX,
            MAX_WITHDRAWAL_PER_MONTH,
            MAX_WITHDRAWAL_PER_MONTH > withdrawn ? MAX_WITHDRAWAL_PER_MONTH - withdrawn : 0
        );
    }

    function getPoolWithdrawalLimits(string calldata poolType)
        external
        view
        returns (
            uint256 maxPerDay,
            uint256 maxPerMonth,
            uint256 remainingToday,
            uint256 remainingThisMonth
        )
    {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;

        uint256 withdrawnToday = 0;
        uint256 withdrawnMonth = 0;

        if (lastPoolWithdrawalDay[poolType] == currentDay) {
            withdrawnToday = poolWithdrawnToday[poolType];
        }

        if (lastPoolWithdrawalMonth[poolType] == currentMonth) {
            withdrawnMonth = poolWithdrawnThisMonth[poolType];
        }

        return (
            MAX_POOL_WITHDRAWAL_PER_DAY,
            MAX_POOL_WITHDRAWAL_PER_MONTH,
            MAX_POOL_WITHDRAWAL_PER_DAY > withdrawnToday ? MAX_POOL_WITHDRAWAL_PER_DAY - withdrawnToday : 0,
            MAX_POOL_WITHDRAWAL_PER_MONTH > withdrawnMonth ? MAX_POOL_WITHDRAWAL_PER_MONTH - withdrawnMonth : 0
        );
    }
}
