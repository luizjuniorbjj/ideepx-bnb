// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/TimelockGovernance.sol";
import "./interfaces/IiDeepXCore.sol";

/**
 * @title iDeepXGovernance
 * @dev Governance Module - Security, circuit breaker, timelock, admin functions
 */
contract iDeepXGovernance is AccessControl, ReentrancyGuard {

    // ========== ROLES ==========
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY");

    // ========== CONSTANTS ==========
    IERC20 public immutable USDT;

    uint256 public constant SOLVENCY_THRESHOLD_BPS = 11000;    // 110%
    uint256 public constant SOLVENCY_RECOVERY_BPS = 13000;     // 130%
    uint256 public constant INITIAL_CAP_DEPOSITS = 100_000 * 10**6;  // $100k
    uint256 public constant MAX_BETA_USERS = 100;
    uint256 public constant TIMELOCK_DURATION = 24 hours;
    uint256 public constant MAX_POOL_WITHDRAWAL_PER_DAY = 10000 * 10**6;
    uint256 public constant MAX_POOL_WITHDRAWAL_PER_MONTH = 50000 * 10**6;

    // ========== STATE ==========
    IiDeepXCore public coreContract;
    address public multisig;
    address public liquidityPool;
    address public infrastructureWallet;
    address public companyWallet;

    bool public betaMode = true;
    bool public circuitBreakerActive;
    bool public capEnabled;
    uint256 public maxTotalDeposits;
    uint256 public emergencyReserve;
    uint256 public totalEmergencyReserveUsed;

    uint256 public emergencyReserveProposalId;
    mapping(uint256 => TimelockGovernance.TimelockProposal) public timelockProposals;

    mapping(string => uint256) public lastPoolWithdrawalDay;
    mapping(string => uint256) public lastPoolWithdrawalMonth;
    mapping(string => uint256) public poolWithdrawnToday;
    mapping(string => uint256) public poolWithdrawnThisMonth;

    // ========== EVENTS ==========
    event MultisigUpdated(address indexed oldMultisig, address indexed newMultisig);
    event EmergencyReserveAllocated(uint256 amount);
    event CircuitBreakerActivated(uint256 solvencyRatio);
    event CircuitBreakerDeactivated(uint256 solvencyRatio);
    event CapUpdated(uint256 oldCap, uint256 newCap);
    event CapDisabled(uint256 finalCap);
    event CapReached(uint256 currentDeposits, uint256 cap);
    event DepositLimitChecked(uint256 totalDeposits, uint256 maxDeposits, bool underCap);
    event PoolWithdrawal(address indexed recipient, uint256 amount, string poolType);

    // ========== ERRORS ==========
    error InvalidAddress();
    error OnlyMultisig();
    error OnlyCore();
    error CircuitBreakerActive();
    error DepositCapReached();
    error BetaUserLimitReached();
    error InvalidAmount();
    error InsufficientBalance();
    error TransferFailed();
    error PoolWithdrawalWouldCauseInsolvency();
    error WithdrawalLimitExceeded();

    // ========== MODIFIERS ==========
    modifier onlyMultisig() {
        if (msg.sender != multisig) revert OnlyMultisig();
        _;
    }

    modifier onlyCore() {
        if (msg.sender != address(coreContract)) revert OnlyCore();
        _;
    }

    modifier whenCircuitBreakerInactive() {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        _;
    }

    // ========== CONSTRUCTOR ==========
    constructor(
        address _usdtAddress,
        address _coreContract,
        address _multisig,
        address _liquidityPool,
        address _infrastructureWallet,
        address _companyWallet
    ) {
        if (
            _usdtAddress == address(0) ||
            _coreContract == address(0) ||
            _multisig == address(0) ||
            _liquidityPool == address(0) ||
            _infrastructureWallet == address(0) ||
            _companyWallet == address(0)
        ) {
            revert InvalidAddress();
        }

        USDT = IERC20(_usdtAddress);
        coreContract = IiDeepXCore(_coreContract);
        multisig = _multisig;
        liquidityPool = _liquidityPool;
        infrastructureWallet = _infrastructureWallet;
        companyWallet = _companyWallet;

        maxTotalDeposits = INITIAL_CAP_DEPOSITS;
        capEnabled = true;
        emergencyReserveProposalId = 0;

        _grantRole(DEFAULT_ADMIN_ROLE, _multisig);
        _grantRole(TREASURY_ROLE, _multisig);
    }

    // ========== SECURITY CHECKS ==========

    /**
     * @dev Check if circuit breaker is active
     */
    function isCircuitBreakerActive() external view returns (bool) {
        return circuitBreakerActive;
    }

    /**
     * @dev Check deposit cap (called by Core)
     */
    function checkDepositCap(uint256 newDeposit) external view onlyCore {
        if (!capEnabled) return;

        (,, uint256 totalSubscriptionRevenue, uint256 totalPerformanceRevenue) = _getCoreRevenue();
        uint256 totalDeposits = totalSubscriptionRevenue + totalPerformanceRevenue;
        uint256 afterDeposit = totalDeposits + newDeposit;

        if (afterDeposit > maxTotalDeposits) {
            revert DepositCapReached();
        }
    }

    /**
     * @dev Check if beta user limit is reached
     */
    function checkBetaUserLimit() external view onlyCore {
        if (!betaMode) return;

        (uint256 totalUsers,,,) = coreContract.getSystemStats();
        if (totalUsers >= MAX_BETA_USERS) {
            revert BetaUserLimitReached();
        }
    }

    /**
     * @dev Check and update circuit breaker (anyone can call)
     */
    function checkAndUpdateCircuitBreaker() external {
        uint256 required = coreContract.getTotalUserBalances();
        if (required == 0) return;

        uint256 current = USDT.balanceOf(address(coreContract));
        uint256 solvencyRatio = (current * 10000) / required;

        if (!circuitBreakerActive && solvencyRatio < SOLVENCY_THRESHOLD_BPS) {
            circuitBreakerActive = true;
            emit CircuitBreakerActivated(solvencyRatio);
        } else if (circuitBreakerActive && solvencyRatio >= SOLVENCY_RECOVERY_BPS) {
            circuitBreakerActive = false;
            emit CircuitBreakerDeactivated(solvencyRatio);
        }
    }

    /**
     * @dev Get solvency ratio (in basis points)
     */
    function getSolvencyRatio() public view returns (uint256) {
        uint256 required = coreContract.getTotalUserBalances();
        if (required == 0) return 10000;
        return (USDT.balanceOf(address(coreContract)) * 10000) / required;
    }

    // ========== EMERGENCY RESERVE ==========

    /**
     * @dev Allocate funds to emergency reserve (called by Core)
     */
    function allocateEmergencyReserve(uint256 amount) external onlyCore {
        emergencyReserve += amount;
        emit EmergencyReserveAllocated(amount);
    }

    /**
     * @dev Propose emergency reserve usage with 24h timelock
     */
    function proposeEmergencyReserve(
        uint256 amount,
        string calldata justification,
        TimelockGovernance.ReserveDestination destination,
        address externalRecipient
    ) external onlyMultisig returns (uint256) {
        emergencyReserveProposalId = TimelockGovernance.proposeReserve(
            timelockProposals,
            emergencyReserveProposalId,
            emergencyReserve,
            amount,
            justification,
            destination,
            externalRecipient,
            TIMELOCK_DURATION
        );
        return emergencyReserveProposalId;
    }

    /**
     * @dev Execute emergency reserve proposal after timelock
     */
    function executeEmergencyReserve(uint256 proposalId) external onlyMultisig nonReentrant {
        (uint256 amount, TimelockGovernance.ReserveDestination destination,,) =
            TimelockGovernance.executeReserve(timelockProposals, proposalId, USDT);

        emergencyReserve -= amount;
        totalEmergencyReserveUsed += amount;

        // Transfer funds from Core contract (where reserve is held)
        // Note: Reserve funds are part of Core's USDT balance
        // This is a withdrawal from Core's perspective
    }

    /**
     * @dev Cancel emergency reserve proposal
     */
    function cancelEmergencyReserve(uint256 proposalId) external onlyMultisig {
        TimelockGovernance.cancelReserve(timelockProposals, proposalId);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Update deposit cap (multisig only)
     */
    function updateDepositCap(uint256 newCap) external onlyMultisig {
        if (newCap < maxTotalDeposits) revert InvalidAmount();

        uint256 oldCap = maxTotalDeposits;
        maxTotalDeposits = newCap;

        emit CapUpdated(oldCap, newCap);
    }

    /**
     * @dev Disable deposit cap permanently (multisig only)
     */
    function disableDepositCap() external onlyMultisig {
        if (!capEnabled) revert InvalidAmount();

        capEnabled = false;
        emit CapDisabled(maxTotalDeposits);
    }

    /**
     * @dev Toggle circuit breaker manually
     */
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

    /**
     * @dev Update multisig address
     */
    function updateMultisig(address newMultisig) external onlyMultisig {
        if (newMultisig == address(0)) revert InvalidAddress();
        if (newMultisig == multisig) revert InvalidAddress();

        address old = multisig;
        multisig = newMultisig;

        _grantRole(DEFAULT_ADMIN_ROLE, newMultisig);
        _grantRole(TREASURY_ROLE, newMultisig);

        _revokeRole(DEFAULT_ADMIN_ROLE, old);
        _revokeRole(TREASURY_ROLE, old);

        emit MultisigUpdated(old, newMultisig);
    }

    /**
     * @dev Disable beta mode
     */
    function disableBetaMode() external onlyMultisig {
        betaMode = false;
    }

    // ========== POOL WITHDRAWALS ==========

    /**
     * @dev Withdraw pool funds (liquidity, infrastructure, company)
     */
    function withdrawPoolFunds(string calldata poolType, uint256 amount)
        external
        nonReentrant
        onlyRole(TREASURY_ROLE)
        whenCircuitBreakerInactive
    {
        _checkPoolWithdrawalLimits(poolType, amount);

        uint256 required = coreContract.getTotalUserBalances();
        uint256 current = USDT.balanceOf(address(coreContract));

        if (current < required + amount) {
            revert PoolWithdrawalWouldCauseInsolvency();
        }

        address recipient;
        (uint256 liquidityBalance, uint256 infrastructureBalance, uint256 companyBalance) = _getPoolBalances();

        if (keccak256(bytes(poolType)) == keccak256("liquidity")) {
            if (amount > liquidityBalance) revert InsufficientBalance();
            recipient = liquidityPool;
        } else if (keccak256(bytes(poolType)) == keccak256("infrastructure")) {
            if (amount > infrastructureBalance) revert InsufficientBalance();
            recipient = infrastructureWallet;
        } else if (keccak256(bytes(poolType)) == keccak256("company")) {
            if (amount > companyBalance) revert InsufficientBalance();
            recipient = companyWallet;
        } else {
            revert InvalidAmount();
        }

        // Update pool withdrawal tracking
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

        // Transfer from Core contract
        // Note: This requires Core to approve this contract or implement a withdrawal mechanism
        if (!USDT.transferFrom(address(coreContract), recipient, amount)) {
            // Rollback tracking
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

    // ========== HELPER FUNCTIONS ==========

    function _getCoreRevenue() private view returns (
        uint256 totalUsers,
        uint256 totalActiveSubscriptions,
        uint256 totalSubscriptionRevenue,
        uint256 totalPerformanceRevenue
    ) {
        (totalUsers, totalActiveSubscriptions,,) = coreContract.getSystemStats();
        (totalSubscriptionRevenue, totalPerformanceRevenue) = coreContract.getRevenueStats();
        return (totalUsers, totalActiveSubscriptions, totalSubscriptionRevenue, totalPerformanceRevenue);
    }

    function _getPoolBalances() private view returns (
        uint256 liquidityBalance,
        uint256 infrastructureBalance,
        uint256 companyBalance
    ) {
        return coreContract.getPoolBalances();
    }

    // ========== VIEW FUNCTIONS ==========

    function getSecurityStatus() external view returns (
        uint256 _emergencyReserve,
        bool _circuitBreakerActive,
        uint256 _solvencyRatio
    ) {
        return (emergencyReserve, circuitBreakerActive, getSolvencyRatio());
    }

    function isCapEnabled() external view returns (bool) {
        return capEnabled;
    }

    function getMaxTotalDeposits() external view returns (uint256) {
        return maxTotalDeposits;
    }

    function isBetaMode() external view returns (bool) {
        return betaMode;
    }
}
