// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title iDeepX Distribution V8_2 - PRODUCTION READY
 * @dev Versão com:
 *  - pagamento com saldo interno
 *  - comissões para inativos (pendente até reativar)
 *  - solvência garantida
 *  - upgrade de rank 1 por vez (recursivo)
 *  - roles sem eventos duplicados
 *  - batchUpgradeRanks com limite
 */
contract iDeepXDistributionV8_2 is AccessControl, ReentrancyGuard, Pausable {

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

    // Uso da reserva (pode usar depois)
    uint256 public constant RESERVE_RANK_BONUS = 3000;
    uint256 public constant RESERVE_PERFORMANCE = 3000;
    uint256 public constant RESERVE_CONSISTENCY = 2000;
    uint256 public constant RESERVE_FAST_START = 2000;

    // ========== ESTADO ==========
    bool public betaMode = true;
    address public liquidityPool;
    address public infrastructureWallet;
    address public companyWallet;

    // pools internos
    uint256 public mlmReserveBalance;
    uint256 public liquidityBalance;
    uint256 public infrastructureBalance;
    uint256 public companyBalance;

    // controle de passivos
    uint256 public totalUserBalances;            // tudo que está em availableBalance / pendente
    uint256 public totalPendingReserve;          // bônus de reserva pendente

    // NOVO V8.1+: controle de comissões a inativos
    uint256 public totalInactiveEarningsHistorical; // sobe sempre que credita para inativo
    uint256 public totalPendingInactiveEarnings;    // sobe quando credita p/ inativo, desce quando ele reativa

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
        uint256 availableBalance;      // saldo interno usável
        uint256 directReferrals;
        uint256 totalVolume;
        uint256 consecutiveRenewals;
        Rank currentRank;
        bool fastStartClaimed;
        uint256 registrationTimestamp;
        uint256 totalPaidWithBalance;
        uint256 pendingInactiveEarnings;  // ganhos recebidos enquanto estava inativo
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

    // ========== MODIFIER ==========
    modifier ensureSolvency() {
        _;
        _checkSolvency();
    }

    // ========== CONSTRUTOR ==========
    constructor(
        address _usdtAddress,
        address _liquidityPool,
        address _infrastructureWallet,
        address _companyWallet
    ) {
        if (
            _usdtAddress == address(0) ||
            _liquidityPool == address(0) ||
            _infrastructureWallet == address(0) ||
            _companyWallet == address(0)
        ) {
            revert InvalidAddress();
        }

        USDT = IERC20(_usdtAddress);
        liquidityPool = _liquidityPool;
        infrastructureWallet = _infrastructureWallet;
        companyWallet = _companyWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);

        _initializeRanks();
        _registerOwner();
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

    function _registerOwner() private {
        users[msg.sender] = User({
            wallet: msg.sender,
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

        users[sponsorWallet].directReferrals++;
        totalUsers++;

        emit UserRegistered(msg.sender, sponsorWallet);
        _checkAndUpgradeRank(sponsorWallet);
    }

    // ========== ASSINATURA ==========
    function activateSubscriptionWithUSDT(uint8 months)
        external
        nonReentrant
        whenNotPaused
        ensureSolvency
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _processSubscription(msg.sender, months, PaymentMethod.EXTERNAL_USDT);
    }

    function activateSubscriptionWithBalance(uint8 months)
        external
        nonReentrant
        whenNotPaused
        ensureSolvency
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _processSubscription(msg.sender, months, PaymentMethod.INTERNAL_BALANCE);
    }

    function activateSubscriptionMixed(uint8 months, uint256 balanceAmount)
        external
        nonReentrant
        whenNotPaused
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
            // já estava em totalUserBalances
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
        uint256 mlmAmount = (amount * MLM_POOL_PERCENTAGE) / 10000;
        uint256 liqAmount = (amount * LIQUIDITY_PERCENTAGE) / 10000;
        uint256 infAmount = (amount * INFRASTRUCTURE_PERCENTAGE) / 10000;
        uint256 compAmount = (amount * COMPANY_PERCENTAGE) / 10000;

        liquidityBalance += liqAmount;
        infrastructureBalance += infAmount;
        companyBalance += compAmount;

        address sponsor = users[subscriber].sponsor;
        uint256 directPaid = 0;

        if (sponsor != address(0)) {
            uint256 directAmount = DIRECT_BONUS;

            RankBonus memory rb = rankBonuses[users[sponsor].currentRank];
            if (rb.directBonusBoost > 0) {
                directAmount = (directAmount * (100 + rb.directBonusBoost)) / 100;
            }

            // credita mesmo se inativo
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

        liquidityBalance += liqAmount;
        infrastructureBalance += infAmount;
        companyBalance += compAmount;

        uint256 mlmDirect = (mlmTotal * MLM_DIRECT_DISTRIBUTION) / 10000;
        uint256 mlmReserve = mlmTotal - mlmDirect;

        mlmReserveBalance += mlmReserve;

        _distributeMLMCommissions(client, mlmDirect);
    }

    function _distributeMLMCommissions(address client, uint256 totalMLM) private {
        address currentSponsor = users[client].sponsor;
        uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

        for (uint8 level = 0; level < MLM_LEVELS; level++) {
            if (currentSponsor == address(0)) break;

            uint256 commission = (totalMLM * percentages[level]) / 10000;

            RankBonus memory rb = rankBonuses[users[currentSponsor].currentRank];
            if (rb.mlmBoost > 0) {
                commission = (commission * (100 + rb.mlmBoost)) / 100;
            }

            // credita sempre
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

            // após receber comissão, tenta upgrade
            _checkAndUpgradeRank(currentSponsor);

            currentSponsor = users[currentSponsor].sponsor;
        }
    }

    // ========== BONIFICAÇÕES ==========
    function _payFastStartBonus(address user) private {
        address sponsor = users[user].sponsor;
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
    function withdrawEarnings(uint256 amount) external nonReentrant whenNotPaused {
        if (userPaused[msg.sender]) revert UserIsPaused();
        if (amount < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        uint256 available = users[msg.sender].availableBalance;
        if (amount > available) revert InsufficientInternalBalance();

        if (USDT.balanceOf(address(this)) < amount) {
            revert InsufficientContractBalance();
        }

        users[msg.sender].availableBalance -= amount;
        users[msg.sender].totalWithdrawn += amount;
        totalUserBalances -= amount;

        if (!USDT.transfer(msg.sender, amount)) {
            // rollback
            users[msg.sender].availableBalance += amount;
            users[msg.sender].totalWithdrawn -= amount;
            totalUserBalances += amount;
            revert TransferFailed();
        }
    }

    function withdrawAllEarnings() external nonReentrant whenNotPaused {
        uint256 available = users[msg.sender].availableBalance;
        if (available < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        if (USDT.balanceOf(address(this)) < available) {
            revert InsufficientContractBalance();
        }

        users[msg.sender].availableBalance = 0;
        users[msg.sender].totalWithdrawn += available;
        totalUserBalances -= available;

        if (!USDT.transfer(msg.sender, available)) {
            users[msg.sender].availableBalance = available;
            users[msg.sender].totalWithdrawn -= available;
            totalUserBalances += available;
            revert TransferFailed();
        }
    }

    // ========== TRANSFERÊNCIA INTERNA ==========
    function transferBalance(address to, uint256 amount) external nonReentrant whenNotPaused {
        if (!users[to].isRegistered) revert UserNotRegistered();
        if (amount == 0) revert InvalidAmount();
        if (users[msg.sender].availableBalance < amount) revert InsufficientInternalBalance();

        users[msg.sender].availableBalance -= amount;
        users[to].availableBalance += amount;
        // totalUserBalances NÃO muda

        emit BalanceTransferred(msg.sender, to, amount);
    }

    // ========== ADMIN ==========
    function withdrawPoolFunds(string calldata poolType, uint256 amount)
        external
        nonReentrant
        onlyRole(TREASURY_ROLE)
    {
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

        if (!USDT.transfer(recipient, amount)) {
            revert TransferFailed();
        }

        emit PoolWithdrawal(recipient, amount, poolType);
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
    // versão 1-por-vez, recursiva, já usada na tua análise
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

            // chama de novo pra ver se sobe mais 1
            _checkAndUpgradeRank(user);
        }
    }

    // NOVO: chamada pública para o próprio user pedir upgrade
    function requestRankUpgrade() external nonReentrant whenNotPaused {
        if (!users[msg.sender].isRegistered) revert UserNotRegistered();
        _checkAndUpgradeRank(msg.sender);
    }

    // NOVO: chamada em lote COM LIMITE (esta era tua sugestão)
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

    // view extra p/ painel
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
}
