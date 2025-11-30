// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/TimelockGovernance.sol";

/**
 * @title IiDeepXGovernance
 * @dev Interface for governance module (security, admin, timelock)
 */
interface IiDeepXGovernance {

    // ========== SECURITY CHECKS ==========

    /**
     * @dev Check if circuit breaker is active
     */
    function isCircuitBreakerActive() external view returns (bool);

    /**
     * @dev Check deposit cap (beta mode)
     * @param newDeposit Amount to deposit
     */
    function checkDepositCap(uint256 newDeposit) external view;

    /**
     * @dev Check if beta user limit is reached
     */
    function checkBetaUserLimit() external view;

    /**
     * @dev Check solvency and update circuit breaker
     */
    function checkAndUpdateCircuitBreaker() external;

    /**
     * @dev Get solvency ratio (in basis points)
     */
    function getSolvencyRatio() external view returns (uint256);

    // ========== EMERGENCY RESERVE ==========

    /**
     * @dev Allocate funds to emergency reserve (called by Core)
     */
    function allocateEmergencyReserve(uint256 amount) external;

    /**
     * @dev Propose emergency reserve usage
     */
    function proposeEmergencyReserve(
        uint256 amount,
        string calldata justification,
        TimelockGovernance.ReserveDestination destination,
        address externalRecipient
    ) external returns (uint256);

    /**
     * @dev Execute emergency reserve proposal
     */
    function executeEmergencyReserve(uint256 proposalId) external;

    /**
     * @dev Cancel emergency reserve proposal
     */
    function cancelEmergencyReserve(uint256 proposalId) external;

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Update deposit cap (multisig only)
     */
    function updateDepositCap(uint256 newCap) external;

    /**
     * @dev Disable deposit cap permanently
     */
    function disableDepositCap() external;

    /**
     * @dev Toggle circuit breaker manually
     */
    function manualCircuitBreakerToggle(bool activate) external;

    /**
     * @dev Update multisig address
     */
    function updateMultisig(address newMultisig) external;

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get security status
     */
    function getSecurityStatus() external view returns (
        uint256 emergencyReserve,
        bool circuitBreakerActive,
        uint256 solvencyRatio
    );

    /**
     * @dev Check if cap is enabled
     */
    function isCapEnabled() external view returns (bool);

    /**
     * @dev Get max total deposits
     */
    function getMaxTotalDeposits() external view returns (uint256);

    /**
     * @dev Check if in beta mode
     */
    function isBetaMode() external view returns (bool);
}
