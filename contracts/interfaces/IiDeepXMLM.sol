// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IiDeepXMLM
 * @dev Interface for MLM module (commissions, ranks, bonuses)
 */
interface IiDeepXMLM {

    // ========== MLM DISTRIBUTION ==========

    /**
     * @dev Distribute subscription commissions (called by Core)
     * @param subscriber User who activated subscription
     * @param amount Total subscription amount
     */
    function distributeSubscriptionCommissions(address subscriber, uint256 amount) external;

    /**
     * @dev Distribute performance fee commissions (called by Core)
     * @param client User who generated performance fees
     * @param amount Total performance fee amount
     */
    function distributePerformanceCommissions(address client, uint256 amount) external;

    // ========== RANK MANAGEMENT ==========

    /**
     * @dev Check and upgrade user rank if eligible
     */
    function checkAndUpgradeRank(address user) external;

    /**
     * @dev Get user current rank
     */
    function getUserRank(address user) external view returns (uint8);

    // ========== BONUSES ==========

    /**
     * @dev Pay fast start bonus (called automatically)
     */
    function payFastStartBonus(address user) external;

    /**
     * @dev Pay consistency bonus (called automatically)
     */
    function payConsistencyBonus(address user) external;

    /**
     * @dev Claim reserve bonus
     */
    function claimReserveBonus(address user) external returns (uint256);

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get MLM reserve balance
     */
    function getMLMReserveBalance() external view returns (uint256);

    /**
     * @dev Get pending reserve bonus for user
     */
    function getPendingReserveBonus(address user) external view returns (uint256);

    /**
     * @dev Get active MLM percentages (beta or permanent mode)
     */
    function getActiveMLMPercentages() external view returns (uint256[10] memory);
}
