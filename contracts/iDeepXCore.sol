// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IiDeepXMLM.sol";
import "./interfaces/IiDeepXGovernance.sol";

/**
 * @title iDeepXCore
 * @dev Core contract - User management, subscriptions, withdrawals
 *
 * MODULAR ARCHITECTURE:
 * - Core: This contract (user data, subscriptions, withdrawals)
 * - MLM: Commission distribution module
 * - Governance: Security & admin module
 */
contract iDeepXCore is AccessControl, ReentrancyGuard, Pausable {

    // ========== ROLES ==========
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER");

    // ========== CONSTANTS ==========
    IERC20 public immutable USDT;

    uint256 public constant USDT_DECIMALS = 6;
    uint256 public constant SUBSCRIPTION_FEE = 19 * 10**6;  // $19
    uint256 public constant MIN_WITHDRAWAL = 10 * 10**6;    // $10
    uint256 public constant DIRECT_BONUS = 5 * 10**6;       // $5
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    uint256 public constant MAX_BATCH_SIZE = 50;

    // Discounts
    uint256 public constant DISCOUNT_3_MONTHS = 500;   // 5%
    uint256 public constant DISCOUNT_6_MONTHS = 1000;  // 10%
    uint256 public constant DISCOUNT_12_MONTHS = 1500; // 15%

    // Distribution (60/5/12/23)
    uint256 public constant MLM_POOL_PERCENTAGE = 6000;       // 60%
    uint256 public constant LIQUIDITY_PERCENTAGE = 500;       // 5%
    uint256 public constant INFRASTRUCTURE_PERCENTAGE = 1200; // 12%
    uint256 public constant COMPANY_PERCENTAGE = 2300;        // 23%

    // Liquidity split (80/20)
    uint256 public constant LIQ_OP_SPLIT_BPS = 8000;      // 80% operational
    uint256 public constant LIQ_RESERVE_SPLIT_BPS = 2000; // 20% emergency reserve

    // Anti-Sybil
    uint256 public constant REGISTRATION_COOLDOWN = 1 hours;
    uint256 public constant SPONSOR_REFERRAL_COOLDOWN = 10 minutes;

    // Withdrawal limits
    uint256 public constant MAX_WITHDRAWAL_PER_TX = 10000 * 10**6;    // $10k
    uint256 public constant MAX_WITHDRAWAL_PER_MONTH = 50000 * 10**6; // $50k

    // ========== STATE ==========
    address public multisig;
    address public liquidityPool;
    address public infrastructureWallet;
    address public companyWallet;

    IiDeepXMLM public mlmModule;
    IiDeepXGovernance public governanceModule;

    uint256 public liquidityBalance;
    uint256 public infrastructureBalance;
    uint256 public companyBalance;
    uint256 public totalUserBalances;
    uint256 public totalUsers;
    uint256 public totalActiveSubscriptions;
    uint256 public totalSubscriptionRevenue;
    uint256 public totalPerformanceRevenue;
    uint256 public totalVolumeProcessed;
    uint256 public totalPaidWithInternalBalance;

    mapping(address => uint256) public lastWithdrawalMonth;
    mapping(address => uint256) public withdrawnThisMonth;
    mapping(address => address) public addressRedirects;
    mapping(address => uint256) public lastRegistrationTime;
    mapping(address => uint256) public lastSponsorReferralTime;

    // ========== ENUMS ==========
    enum Rank {
        STARTER, BRONZE, SILVER, GOLD,
        PLATINUM, DIAMOND, MASTER, GRANDMASTER
    }

    enum PaymentMethod { EXTERNAL_USDT, INTERNAL_BALANCE, MIXED }

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

    mapping(address => User) public users;
    mapping(address => bool) public userPaused;
    mapping(address => address[]) public userReferrals; // Lista de indicados diretos

    // ========== EVENTS ==========
    event UserRegistered(address indexed user, address indexed sponsor);
    event SubscriptionActivated(address indexed user, uint256 amount, uint256 months, PaymentMethod method);
    event SubscriptionPaidWithBalance(address indexed user, uint256 amount);
    event BalanceTransferred(address indexed from, address indexed to, uint256 amount);
    event WithdrawalExecuted(address indexed user, uint256 amount);
    event ModulesUpdated(address mlm, address governance);
    event MultisigUpdated(address indexed oldMultisig, address indexed newMultisig);
    event AddressRedirected(address indexed oldAddress, address indexed newAddress);

    // ========== ERRORS ==========
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
    error InvalidMonthsAmount();
    error OnlyMultisig();
    error WithdrawalLimitExceeded();
    error ModulesNotSet();

    // ========== MODIFIERS ==========
    modifier onlyMultisig() {
        if (msg.sender != multisig) revert OnlyMultisig();
        _;
    }

    modifier whenModulesSet() {
        if (address(mlmModule) == address(0) || address(governanceModule) == address(0)) {
            revert ModulesNotSet();
        }
        _;
    }

    // ========== CONSTRUCTOR ==========
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

        _registerMultisig();
    }

    // ========== INITIALIZATION ==========
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

    /**
     * @dev Set module addresses (called once after deployment)
     */
    function setModules(address _mlmModule, address _governanceModule) external onlyMultisig {
        if (_mlmModule == address(0) || _governanceModule == address(0)) revert InvalidAddress();

        mlmModule = IiDeepXMLM(_mlmModule);
        governanceModule = IiDeepXGovernance(_governanceModule);

        emit ModulesUpdated(_mlmModule, _governanceModule);
    }

    // ========== REGISTRATION ==========
    function registerWithSponsor(address sponsorWallet) external nonReentrant whenNotPaused {
        if (sponsorWallet == address(0) || sponsorWallet == msg.sender) revert InvalidAddress();
        if (users[msg.sender].isRegistered) revert UserAlreadyRegistered();

        // Anti-Sybil: user cooldown
        require(
            lastRegistrationTime[msg.sender] == 0 ||
            block.timestamp >= lastRegistrationTime[msg.sender] + REGISTRATION_COOLDOWN,
            "Registration cooldown active"
        );

        // Governance check: beta user limit
        if (address(governanceModule) != address(0)) {
            governanceModule.checkBetaUserLimit();
        }

        // Resolve redirects
        address actualSponsor = _resolveAddress(sponsorWallet);
        if (!users[actualSponsor].isRegistered) revert SponsorNotRegistered();

        // Circular referral prevention
        require(!_isInDownline(sponsorWallet, msg.sender), "Circular referral detected");
        require(!_isInDownline(actualSponsor, msg.sender), "Circular referral detected (resolved)");

        // Anti-Sybil: sponsor cooldown
        if (actualSponsor != multisig) {
            require(
                block.timestamp >= lastSponsorReferralTime[actualSponsor] + SPONSOR_REFERRAL_COOLDOWN,
                "Sponsor referral cooldown active"
            );
            lastSponsorReferralTime[actualSponsor] = block.timestamp;
        }

        users[msg.sender] = User({
            wallet: msg.sender,
            sponsor: actualSponsor,
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
        userReferrals[actualSponsor].push(msg.sender); // Adiciona à lista de indicados
        totalUsers++;
        lastRegistrationTime[msg.sender] = block.timestamp;

        emit UserRegistered(msg.sender, actualSponsor);

        // Upgrade rank via MLM module
        if (address(mlmModule) != address(0)) {
            mlmModule.checkAndUpgradeRank(actualSponsor);
        }
    }

    // ========== SUBSCRIPTION ==========
    function activateSubscriptionWithUSDT(uint8 months)
        external
        nonReentrant
        whenNotPaused
        whenModulesSet
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _checkCircuitBreaker();
        _processSubscription(msg.sender, months, PaymentMethod.EXTERNAL_USDT);
    }

    function activateSubscriptionWithBalance(uint8 months)
        external
        nonReentrant
        whenNotPaused
        whenModulesSet
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _checkCircuitBreaker();
        _processSubscription(msg.sender, months, PaymentMethod.INTERNAL_BALANCE);
    }

    function activateSubscriptionMixed(uint8 months, uint256 balanceAmount)
        external
        nonReentrant
        whenNotPaused
        whenModulesSet
    {
        if (months == 0 || months > 12) revert InvalidMonthsAmount();
        _checkCircuitBreaker();

        uint256 totalCost = _calculateSubscriptionCost(months);

        if (balanceAmount > users[msg.sender].availableBalance) {
            revert InsufficientInternalBalance();
        }

        uint256 usdtRequired = totalCost - balanceAmount;

        // Check deposit cap (only for external USDT)
        if (usdtRequired > 0) {
            governanceModule.checkDepositCap(usdtRequired);
        }

        if (balanceAmount > 0) {
            users[msg.sender].availableBalance -= balanceAmount;
            users[msg.sender].totalPaidWithBalance += balanceAmount;
            totalPaidWithInternalBalance += balanceAmount;
            totalUserBalances -= balanceAmount;
        }

        if (usdtRequired > 0) {
            // Double spending protection: allowance check
            uint256 allowanceBefore = USDT.allowance(msg.sender, address(this));
            if (allowanceBefore < usdtRequired) {
                // Rollback
                users[msg.sender].availableBalance += balanceAmount;
                users[msg.sender].totalPaidWithBalance -= balanceAmount;
                totalPaidWithInternalBalance -= balanceAmount;
                totalUserBalances += balanceAmount;
                revert("Insufficient allowance");
            }

            if (!USDT.transferFrom(msg.sender, address(this), usdtRequired)) {
                // Rollback
                users[msg.sender].availableBalance += balanceAmount;
                users[msg.sender].totalPaidWithBalance -= balanceAmount;
                totalPaidWithInternalBalance -= balanceAmount;
                totalUserBalances += balanceAmount;
                revert TransferFailed();
            }

            uint256 allowanceAfter = USDT.allowance(msg.sender, address(this));
            if (allowanceBefore - allowanceAfter != usdtRequired) {
                // Rollback
                users[msg.sender].availableBalance += balanceAmount;
                users[msg.sender].totalPaidWithBalance -= balanceAmount;
                totalPaidWithInternalBalance -= balanceAmount;
                totalUserBalances += balanceAmount;
                revert("Allowance not consumed correctly");
            }
        }

        _activateSubscriptionInternal(msg.sender, months, totalCost, PaymentMethod.MIXED);
    }

    function _processSubscription(address user, uint8 months, PaymentMethod method) private {
        if (!users[user].isRegistered) revert UserNotRegistered();
        if (userPaused[user]) revert UserIsPaused();

        uint256 totalCost = _calculateSubscriptionCost(months);

        // Check deposit cap (only for external USDT)
        if (method == PaymentMethod.EXTERNAL_USDT) {
            governanceModule.checkDepositCap(totalCost);
        }

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
            // Double spending protection: allowance check
            uint256 allowanceBefore = USDT.allowance(user, address(this));
            require(allowanceBefore >= totalCost, "Insufficient allowance");

            if (!USDT.transferFrom(user, address(this), totalCost)) {
                revert TransferFailed();
            }

            uint256 allowanceAfter = USDT.allowance(user, address(this));
            require(
                allowanceBefore - allowanceAfter == totalCost,
                "Allowance not consumed correctly"
            );
        }

        _activateSubscriptionInternal(user, months, totalCost, method);
    }

    function _activateSubscriptionInternal(
        address user,
        uint8 months,
        uint256 totalCost,
        PaymentMethod method
    ) private {
        // Release pending inactive earnings
        bool wasInactive = !users[user].subscriptionActive ||
                          block.timestamp > users[user].subscriptionExpiration;

        if (wasInactive && users[user].pendingInactiveEarnings > 0) {
            uint256 pendingAmount = users[user].pendingInactiveEarnings;
            users[user].pendingInactiveEarnings = 0;
            users[user].availableBalance += pendingAmount;
        }

        // Update consecutive renewals
        bool isRenewal = users[user].subscriptionTimestamp > 0;
        if (isRenewal && block.timestamp <= users[user].subscriptionExpiration + 7 days) {
            users[user].consecutiveRenewals++;
        } else if (isRenewal) {
            users[user].consecutiveRenewals = 0;
        }

        // Activate subscription
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

        // Distribute subscription fee (via MLM module)
        _distributeSubscriptionFee(user, totalCost);

        // Pay bonuses (via MLM module)
        if (!users[user].fastStartClaimed &&
            block.timestamp <= users[user].registrationTimestamp + 7 days) {
            mlmModule.payFastStartBonus(user);
        }

        if (users[user].consecutiveRenewals >= 3) {
            mlmModule.payConsistencyBonus(user);
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

    // ========== DISTRIBUTION ==========
    function _distributeSubscriptionFee(address subscriber, uint256 amount) private {
        uint256 mlmAmount = (amount * MLM_POOL_PERCENTAGE) / 10000;     // 60%
        uint256 liqAmount = (amount * LIQUIDITY_PERCENTAGE) / 10000;    // 5%
        uint256 infAmount = (amount * INFRASTRUCTURE_PERCENTAGE) / 10000; // 12%
        uint256 compAmount = (amount * COMPANY_PERCENTAGE) / 10000;     // 23%

        // Split liquidity 80/20
        uint256 liqOp = (liqAmount * LIQ_OP_SPLIT_BPS) / 10000;
        uint256 liqRes = liqAmount - liqOp;

        liquidityBalance += liqOp;
        infrastructureBalance += infAmount;
        companyBalance += compAmount;

        // Allocate to emergency reserve (governance module)
        governanceModule.allocateEmergencyReserve(liqRes);

        // Distribute MLM commissions
        mlmModule.distributeSubscriptionCommissions(subscriber, mlmAmount);
    }

    // ========== PERFORMANCE FEES ==========
    function distributePerformanceFee(
        address[] calldata clients,
        uint256[] calldata amounts
    )
        external
        nonReentrant
        whenNotPaused
        whenModulesSet
        onlyRole(DISTRIBUTOR_ROLE)
    {
        if (clients.length != amounts.length) revert InvalidAmount();
        if (clients.length > MAX_BATCH_SIZE) revert BatchSizeExceeded();

        _checkCircuitBreaker();

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        // Check deposit cap
        governanceModule.checkDepositCap(totalAmount);

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

        // Split liquidity 80/20
        uint256 liqOp = (liqAmount * LIQ_OP_SPLIT_BPS) / 10000;
        uint256 liqRes = liqAmount - liqOp;

        liquidityBalance += liqOp;
        infrastructureBalance += infAmount;
        companyBalance += compAmount;

        // Allocate to emergency reserve
        governanceModule.allocateEmergencyReserve(liqRes);

        // Distribute MLM commissions
        mlmModule.distributePerformanceCommissions(client, mlmTotal);
    }

    // ========== WITHDRAWALS ==========
    function withdrawEarnings(uint256 amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(_isSubscriptionActive(msg.sender), "No active subscription");
        _checkCircuitBreaker();

        if (userPaused[msg.sender]) revert UserIsPaused();
        if (amount < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        _checkWithdrawalLimits(msg.sender, amount);

        uint256 available = users[msg.sender].availableBalance;
        if (amount > available) revert InsufficientInternalBalance();

        if (USDT.balanceOf(address(this)) < amount) {
            revert InsufficientContractBalance();
        }

        users[msg.sender].availableBalance -= amount;
        users[msg.sender].totalWithdrawn += amount;
        totalUserBalances -= amount;

        // Update withdrawal tracking
        uint256 currentMonth = block.timestamp / 30 days;
        if (lastWithdrawalMonth[msg.sender] != currentMonth) {
            lastWithdrawalMonth[msg.sender] = currentMonth;
            withdrawnThisMonth[msg.sender] = 0;
        }
        withdrawnThisMonth[msg.sender] += amount;

        if (!USDT.transfer(msg.sender, amount)) {
            // Rollback
            users[msg.sender].availableBalance += amount;
            users[msg.sender].totalWithdrawn -= amount;
            totalUserBalances += amount;
            withdrawnThisMonth[msg.sender] -= amount;
            revert TransferFailed();
        }

        emit WithdrawalExecuted(msg.sender, amount);
    }

    function withdrawAllEarnings() external nonReentrant whenNotPaused {
        require(_isSubscriptionActive(msg.sender), "No active subscription");
        _checkCircuitBreaker();

        uint256 available = users[msg.sender].availableBalance;
        if (available < MIN_WITHDRAWAL) revert BelowMinimumWithdrawal();

        _checkWithdrawalLimits(msg.sender, available);

        if (USDT.balanceOf(address(this)) < available) {
            revert InsufficientContractBalance();
        }

        users[msg.sender].availableBalance = 0;
        users[msg.sender].totalWithdrawn += available;
        totalUserBalances -= available;

        // Update withdrawal tracking
        uint256 currentMonth = block.timestamp / 30 days;
        if (lastWithdrawalMonth[msg.sender] != currentMonth) {
            lastWithdrawalMonth[msg.sender] = currentMonth;
            withdrawnThisMonth[msg.sender] = 0;
        }
        withdrawnThisMonth[msg.sender] += available;

        if (!USDT.transfer(msg.sender, available)) {
            // Rollback
            users[msg.sender].availableBalance = available;
            users[msg.sender].totalWithdrawn -= available;
            totalUserBalances += available;
            withdrawnThisMonth[msg.sender] -= available;
            revert TransferFailed();
        }

        emit WithdrawalExecuted(msg.sender, available);
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

    // ========== BALANCE TRANSFER ==========
    function transferBalance(address to, uint256 amount) external nonReentrant whenNotPaused {
        if (!users[to].isRegistered) revert UserNotRegistered();
        if (amount == 0) revert InvalidAmount();
        if (users[msg.sender].availableBalance < amount) revert InsufficientInternalBalance();

        users[msg.sender].availableBalance -= amount;
        users[to].availableBalance += amount;

        emit BalanceTransferred(msg.sender, to, amount);
    }

    // ========== HELPER FUNCTIONS ==========
    function _isInDownline(address user, address potentialSponsor) private view returns (bool) {
        if (user == address(0) || potentialSponsor == address(0)) return false;

        address current = users[user].sponsor;
        uint256 maxDepth = 10;

        for (uint256 i = 0; i < maxDepth; i++) {
            if (current == address(0)) break;
            if (current == potentialSponsor) return true;
            current = users[current].sponsor;
        }

        return false;
    }

    function _isSubscriptionActive(address user) private view returns (bool) {
        return users[user].subscriptionActive && block.timestamp <= users[user].subscriptionExpiration;
    }

    function _resolveAddress(address addr) private view returns (address) {
        address current = addr;
        uint256 depth = 0;
        while (addressRedirects[current] != address(0) && depth < 10) {
            current = addressRedirects[current];
            depth++;
        }
        return current;
    }

    function _checkCircuitBreaker() private view {
        if (address(governanceModule) != address(0)) {
            require(!governanceModule.isCircuitBreakerActive(), "Circuit breaker active");
        }
    }

    // ========== INTERFACE FUNCTIONS (Called by Modules) ==========

    /**
     * @dev Update user balance (called by MLM module)
     */
    function updateUserBalance(address user, uint256 amount, bool credit) external {
        require(msg.sender == address(mlmModule), "Only MLM");

        if (credit) {
            users[user].availableBalance += amount;
            totalUserBalances += amount;
        } else {
            users[user].availableBalance -= amount;
            totalUserBalances -= amount;
        }
    }

    /**
     * @dev Update user stats (called by MLM module)
     */
    function updateUserStats(address user, uint256 volume, uint256 earned) external {
        require(msg.sender == address(mlmModule), "Only MLM");
        users[user].totalVolume += volume;
        users[user].totalEarned += earned;
    }

    // ========== ADMIN FUNCTIONS ==========

    function updateMultisig(address newMultisig) external onlyMultisig {
        if (newMultisig == address(0)) revert InvalidAddress();
        if (newMultisig == multisig) revert InvalidAddress();

        address old = multisig;
        multisig = newMultisig;

        _grantRole(DEFAULT_ADMIN_ROLE, newMultisig);
        _grantRole(DISTRIBUTOR_ROLE, newMultisig);
        _grantRole(UPDATER_ROLE, newMultisig);

        _revokeRole(DEFAULT_ADMIN_ROLE, old);
        _revokeRole(DISTRIBUTOR_ROLE, old);
        _revokeRole(UPDATER_ROLE, old);

        User storage uOld = users[old];
        if (uOld.isRegistered) {
            users[newMultisig] = uOld;
            users[newMultisig].wallet = newMultisig;
            addressRedirects[old] = newMultisig;
            emit AddressRedirected(old, newMultisig);
        }

        emit MultisigUpdated(old, newMultisig);
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

    // ========== VIEW FUNCTIONS (For Frontend) ==========

    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }

    function getSystemStats()
        external
        view
        returns (
            uint256 _totalUsers,
            uint256 _totalActive,
            uint256 _contractBalance,
            bool _betaMode
        )
    {
        bool betaMode = false;
        if (address(governanceModule) != address(0)) {
            betaMode = governanceModule.isBetaMode();
        }

        return (
            totalUsers,
            totalActiveSubscriptions,
            USDT.balanceOf(address(this)),
            betaMode
        );
    }

    function getSecurityStatus()
        external
        view
        returns (
            uint256 _emergencyReserve,
            bool _circuitBreakerActive,
            uint256 _solvencyRatio
        )
    {
        if (address(governanceModule) != address(0)) {
            return governanceModule.getSecurityStatus();
        }
        return (0, false, 10000);
    }

    function getReferrals(address user) external view returns (address[] memory) {
        return userReferrals[user];
    }

    function getPoolBalances()
        external
        view
        returns (
            uint256 _liquidityBalance,
            uint256 _infrastructureBalance,
            uint256 _companyBalance
        )
    {
        return (liquidityBalance, infrastructureBalance, companyBalance);
    }

    function getRevenueStats()
        external
        view
        returns (
            uint256 _totalSubscriptionRevenue,
            uint256 _totalPerformanceRevenue
        )
    {
        return (totalSubscriptionRevenue, totalPerformanceRevenue);
    }
}
