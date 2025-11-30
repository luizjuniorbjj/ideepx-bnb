// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IiDeepXCore.sol";

/**
 * @title iDeepXMLM
 * @dev MLM Module - Commission distribution, ranks, bonuses
 */
contract iDeepXMLM is AccessControl {

    // ========== ROLES ==========
    bytes32 public constant MLM_MANAGER_ROLE = keccak256("MLM_MANAGER");

    // ========== CONSTANTS ==========
    uint256 public constant MLM_LEVELS = 10;
    uint256 public constant FAST_START_BONUS = 5 * 10**6;  // $5

    // MLM subdivision
    uint256 public constant MLM_DIRECT_DISTRIBUTION = 7500;  // 75%
    uint256 public constant MLM_RESERVE = 2500;              // 25%

    // Reserve usage
    uint256 public constant RESERVE_RANK_BONUS = 3000;
    uint256 public constant RESERVE_PERFORMANCE = 3000;
    uint256 public constant RESERVE_CONSISTENCY = 2000;
    uint256 public constant RESERVE_FAST_START = 2000;

    // ========== STATE ==========
    IiDeepXCore public coreContract;
    address public multisig;
    bool public betaMode = true;

    uint256 public mlmReserveBalance;
    uint256 public totalMLMDistributed;
    uint256 public totalReserveDistributed;
    uint256 public totalPendingReserve;
    uint256 public totalPendingInactiveEarnings;
    uint256 public totalInactiveEarningsHistorical;

    mapping(address => uint256) public pendingReserveBonus;

    // MLM percentages (basis points)
    uint256[10] public mlmPercentagesBeta = [
        3000, 1500, 1250, 1000, 750, 500, 500, 500, 500, 500
    ];

    uint256[10] public mlmPercentagesPermanent = [
        2500, 1500, 1000, 1000, 800, 800, 800, 800, 400, 400
    ];

    // ========== RANK SYSTEM ==========
    struct RankRequirement {
        uint256 directsRequired;
        uint256 volumeRequired;
    }

    struct RankBonus {
        uint256 monthlyBonus;
        uint256 directBonusBoost;
        uint256 mlmBoost;
    }

    mapping(uint8 => RankRequirement) public rankRequirements;
    mapping(uint8 => RankBonus) public rankBonuses;

    // ========== EVENTS ==========
    event MLMCommissionPaid(address indexed recipient, address indexed from, uint256 level, uint256 amount);
    event CommissionCreditedToInactive(address indexed recipient, uint256 amount);
    event ReserveBonusPaid(address indexed user, uint256 amount, uint8 bonusType);
    event RankUpgraded(address indexed user, uint8 oldRank, uint8 newRank);
    event BetaModeToggled(bool enabled);

    // ========== ERRORS ==========
    error InvalidAddress();
    error OnlyCore();
    error OnlyMultisig();
    error NoReserveBonus();

    // ========== MODIFIERS ==========
    modifier onlyCore() {
        if (msg.sender != address(coreContract)) revert OnlyCore();
        _;
    }

    modifier onlyMultisig() {
        if (msg.sender != multisig) revert OnlyMultisig();
        _;
    }

    // ========== CONSTRUCTOR ==========
    constructor(address _coreContract, address _multisig) {
        if (_coreContract == address(0) || _multisig == address(0)) revert InvalidAddress();

        coreContract = IiDeepXCore(_coreContract);
        multisig = _multisig;

        _grantRole(DEFAULT_ADMIN_ROLE, _multisig);
        _grantRole(MLM_MANAGER_ROLE, _multisig);

        _initializeRanks();
    }

    // ========== INITIALIZATION ==========
    function _initializeRanks() private {
        // Rank requirements (Rank enum: 0=STARTER, 1=BRONZE, ..., 7=GRANDMASTER)
        rankRequirements[1] = RankRequirement(3, 1000 * 10**6);        // BRONZE
        rankRequirements[2] = RankRequirement(10, 10000 * 10**6);      // SILVER
        rankRequirements[3] = RankRequirement(25, 50000 * 10**6);      // GOLD
        rankRequirements[4] = RankRequirement(50, 250000 * 10**6);     // PLATINUM
        rankRequirements[5] = RankRequirement(100, 1000000 * 10**6);   // DIAMOND
        rankRequirements[6] = RankRequirement(250, 5000000 * 10**6);   // MASTER
        rankRequirements[7] = RankRequirement(500, 25000000 * 10**6);  // GRANDMASTER

        // Rank bonuses
        rankBonuses[1] = RankBonus(50 * 10**6, 10, 5);       // BRONZE
        rankBonuses[2] = RankBonus(100 * 10**6, 20, 10);     // SILVER
        rankBonuses[3] = RankBonus(250 * 10**6, 30, 15);     // GOLD
        rankBonuses[4] = RankBonus(500 * 10**6, 50, 20);     // PLATINUM
        rankBonuses[5] = RankBonus(1000 * 10**6, 75, 30);    // DIAMOND
        rankBonuses[6] = RankBonus(2000 * 10**6, 100, 40);   // MASTER
        rankBonuses[7] = RankBonus(5000 * 10**6, 150, 50);   // GRANDMASTER
    }

    // ========== MLM DISTRIBUTION ==========

    /**
     * @dev Distribute subscription commissions (called by Core)
     */
    function distributeSubscriptionCommissions(address subscriber, uint256 mlmAmount) external onlyCore {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(subscriber);
        address sponsor = userInfo.sponsor;
        uint256 directPaid = 0;

        if (sponsor != address(0)) {
            uint256 directAmount = 5 * 10**6; // DIRECT_BONUS = $5

            IiDeepXCore.UserInfo memory sponsorInfo = coreContract.getUserInfo(sponsor);
            RankBonus memory rb = rankBonuses[uint8(sponsorInfo.currentRank)];
            if (rb.directBonusBoost > 0) {
                directAmount = (directAmount * (100 + rb.directBonusBoost)) / 100;
            }

            _creditToUser(sponsor, directAmount);
            directPaid = directAmount;

            emit MLMCommissionPaid(sponsor, subscriber, 0, directAmount);
        }

        if (mlmAmount > directPaid) {
            mlmReserveBalance += (mlmAmount - directPaid);
        }
    }

    /**
     * @dev Distribute performance commissions (called by Core)
     */
    function distributePerformanceCommissions(address client, uint256 mlmTotal) external onlyCore {
        uint256 mlmDirect = (mlmTotal * MLM_DIRECT_DISTRIBUTION) / 10000;  // 75%
        uint256 mlmReserve = mlmTotal - mlmDirect;                        // 25%

        mlmReserveBalance += mlmReserve;

        _distributeMLMCommissions(client, mlmDirect);
    }

    function _distributeMLMCommissions(address client, uint256 totalMLM) private {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(client);
        address currentSponsor = userInfo.sponsor;
        uint256[10] memory percentages = betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;

        for (uint8 level = 0; level < MLM_LEVELS; level++) {
            if (currentSponsor == address(0)) break;

            uint256 commission = (totalMLM * percentages[level]) / 10000;

            IiDeepXCore.UserInfo memory sponsorInfo = coreContract.getUserInfo(currentSponsor);
            RankBonus memory rb = rankBonuses[uint8(sponsorInfo.currentRank)];
            if (rb.mlmBoost > 0) {
                commission = (commission * (100 + rb.mlmBoost)) / 100;
            }

            // Credit commission
            if (sponsorInfo.subscriptionActive) {
                coreContract.updateUserBalance(currentSponsor, commission, true);
            } else {
                // Inactive user: credit to pending
                totalInactiveEarningsHistorical += commission;
                totalPendingInactiveEarnings += commission;
                emit CommissionCreditedToInactive(currentSponsor, commission);
            }

            coreContract.updateUserStats(currentSponsor, commission, commission);
            totalMLMDistributed += commission;

            emit MLMCommissionPaid(currentSponsor, client, level + 1, commission);

            // Check rank upgrade
            checkAndUpgradeRank(currentSponsor);

            // Move to next sponsor
            IiDeepXCore.UserInfo memory nextInfo = coreContract.getUserInfo(currentSponsor);
            currentSponsor = nextInfo.sponsor;
        }
    }

    function _creditToUser(address user, uint256 amount) private {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(user);

        if (userInfo.subscriptionActive) {
            coreContract.updateUserBalance(user, amount, true);
        } else {
            totalInactiveEarningsHistorical += amount;
            totalPendingInactiveEarnings += amount;
            emit CommissionCreditedToInactive(user, amount);
        }

        coreContract.updateUserStats(user, 0, amount);
    }

    // ========== RANK MANAGEMENT ==========

    /**
     * @dev Check and upgrade user rank if eligible
     */
    function checkAndUpgradeRank(address user) public {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(user);
        if (!userInfo.isRegistered) return;

        uint8 currentRank = uint8(userInfo.currentRank);

        // Limit to 3 upgrades per call
        uint8 maxIterations = 3;
        for (uint8 i = 0; i < maxIterations; i++) {
            if (currentRank == 7) break; // GRANDMASTER (max rank)

            uint8 nextRank = currentRank + 1;
            RankRequirement memory req = rankRequirements[nextRank];

            if (userInfo.directReferrals >= req.directsRequired &&
                userInfo.totalVolume >= req.volumeRequired) {

                uint8 oldRank = currentRank;
                currentRank = nextRank;

                uint256 upgradeBonus = rankBonuses[nextRank].monthlyBonus / 10;
                if (upgradeBonus > 0 && mlmReserveBalance >= upgradeBonus) {
                    pendingReserveBonus[user] += upgradeBonus;
                    totalPendingReserve += upgradeBonus;
                    mlmReserveBalance -= upgradeBonus;
                    emit ReserveBonusPaid(user, upgradeBonus, 2);
                }

                emit RankUpgraded(user, oldRank, nextRank);

                // Refresh userInfo for next iteration
                userInfo = coreContract.getUserInfo(user);
            } else {
                break;
            }
        }
    }

    /**
     * @dev Get user current rank
     */
    function getUserRank(address user) external view returns (uint8) {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(user);
        return uint8(userInfo.currentRank);
    }

    // ========== BONUSES ==========

    /**
     * @dev Pay fast start bonus (called by Core)
     */
    function payFastStartBonus(address user) external onlyCore {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(user);
        address sponsor = userInfo.sponsor;

        if (sponsor != address(0)) {
            if (mlmReserveBalance >= FAST_START_BONUS) {
                pendingReserveBonus[sponsor] += FAST_START_BONUS;
                totalPendingReserve += FAST_START_BONUS;
                mlmReserveBalance -= FAST_START_BONUS;
                emit ReserveBonusPaid(sponsor, FAST_START_BONUS, 5);
            }
        }
    }

    /**
     * @dev Pay consistency bonus (called by Core)
     */
    function payConsistencyBonus(address user) external onlyCore {
        IiDeepXCore.UserInfo memory userInfo = coreContract.getUserInfo(user);
        uint256 renewals = userInfo.consecutiveRenewals;

        uint256 bonus = 0;
        uint256 subscriptionFee = 19 * 10**6;

        if (renewals >= 24) {
            bonus = (subscriptionFee * 30) / 100;
        } else if (renewals >= 12) {
            bonus = (subscriptionFee * 20) / 100;
        } else if (renewals >= 6) {
            bonus = (subscriptionFee * 10) / 100;
        } else if (renewals >= 3) {
            bonus = (subscriptionFee * 5) / 100;
        }

        if (bonus > 0 && mlmReserveBalance >= bonus) {
            pendingReserveBonus[user] += bonus;
            totalPendingReserve += bonus;
            mlmReserveBalance -= bonus;
            emit ReserveBonusPaid(user, bonus, 4);
        }
    }

    /**
     * @dev Claim reserve bonus
     */
    function claimReserveBonus(address user) external returns (uint256) {
        uint256 amount = pendingReserveBonus[user];
        if (amount == 0) revert NoReserveBonus();

        pendingReserveBonus[user] = 0;
        totalPendingReserve -= amount;

        coreContract.updateUserBalance(user, amount, true);
        coreContract.updateUserStats(user, 0, amount);

        totalReserveDistributed += amount;

        return amount;
    }

    // ========== ADMIN FUNCTIONS ==========

    function toggleBetaMode() external onlyMultisig {
        betaMode = !betaMode;
        emit BetaModeToggled(betaMode);
    }

    function updateMultisig(address newMultisig) external onlyMultisig {
        if (newMultisig == address(0)) revert InvalidAddress();
        multisig = newMultisig;
    }

    // ========== VIEW FUNCTIONS ==========

    function getMLMReserveBalance() external view returns (uint256) {
        return mlmReserveBalance;
    }

    function getPendingReserveBonus(address user) external view returns (uint256) {
        return pendingReserveBonus[user];
    }

    function getActiveMLMPercentages() external view returns (uint256[10] memory) {
        return betaMode ? mlmPercentagesBeta : mlmPercentagesPermanent;
    }
}
