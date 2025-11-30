// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IiDeepXCore
 * @dev Interface for core contract (user management, subscriptions, withdrawals)
 */
interface IiDeepXCore {

    // ========== STRUCTS (Mirror from Core) ==========
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

    struct UserInfo {
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

    // ========== CORE FUNCTIONS ==========

    /**
     * @dev Update user balance (called by MLM module)
     */
    function updateUserBalance(address user, uint256 amount, bool credit) external;

    /**
     * @dev Update user statistics (called by MLM module)
     */
    function updateUserStats(address user, uint256 volume, uint256 earned) external;

    /**
     * @dev Update totalUserBalances (accounting)
     */
    function updateTotalBalances(uint256 amount, bool increase) external;

    /**
     * @dev Check if user is registered
     */
    function isUserRegistered(address user) external view returns (bool);

    /**
     * @dev Check if user has active subscription
     */
    function isSubscriptionActive(address user) external view returns (bool);

    /**
     * @dev Get user sponsor (with redirect resolution)
     */
    function getUserSponsor(address user) external view returns (address);

    /**
     * @dev Get user info
     */
    function getUserInfo(address user) external view returns (UserInfo memory);

    /**
     * @dev Get total user balances (for solvency checks)
     */
    function getTotalUserBalances() external view returns (uint256);

    /**
     * @dev Get system stats
     */
    function getSystemStats() external view returns (
        uint256 totalUsers,
        uint256 totalActive,
        uint256 contractBalance,
        bool betaMode
    );

    /**
     * @dev Get pool balances (liquidity, infrastructure, company)
     */
    function getPoolBalances() external view returns (
        uint256 liquidityBalance,
        uint256 infrastructureBalance,
        uint256 companyBalance
    );

    /**
     * @dev Get revenue stats
     */
    function getRevenueStats() external view returns (
        uint256 totalSubscriptionRevenue,
        uint256 totalPerformanceRevenue
    );

    /**
     * @dev Pause contract (emergency)
     */
    function pause() external;

    /**
     * @dev Unpause contract
     */
    function unpause() external;
}
