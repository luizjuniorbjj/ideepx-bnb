// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TimelockGovernance
 * @dev Library para gerenciar timelock de emergency reserve
 * Extração para reduzir tamanho do contrato principal
 */
library TimelockGovernance {

    // ========== ENUMS ==========
    enum ReserveDestination {
        LIQUIDITY,
        INFRASTRUCTURE,
        COMPANY,
        EXTERNAL
    }

    // ========== STRUCTS ==========
    struct TimelockProposal {
        uint256 proposalId;
        uint256 amount;
        string justification;
        ReserveDestination destination;
        address externalRecipient;
        uint256 proposedAt;
        uint256 executeAfter;
        bool executed;
        bool cancelled;
    }

    // ========== ERRORS ==========
    error InvalidAmount();
    error InvalidJustification();
    error InsufficientBalance();
    error ProposalNotFound();
    error ProposalAlreadyExecuted();
    error ProposalCancelled();
    error TimelockNotExpired();
    error InvalidAddress();
    error TransferFailed();

    // ========== EVENTS ==========
    event EmergencyReserveProposed(uint256 indexed proposalId, uint256 amount, string justification, uint256 executeAfter);
    event EmergencyReserveExecuted(uint256 indexed proposalId, uint256 amount, ReserveDestination destination);
    event EmergencyReserveUsed(uint256 amount, string justification, ReserveDestination destination, address externalRecipient);
    event EmergencyReserveCancelled(uint256 indexed proposalId);

    /**
     * @dev Propor uso de emergency reserve com timelock
     */
    function proposeReserve(
        mapping(uint256 => TimelockProposal) storage proposals,
        uint256 proposalCounter,
        uint256 emergencyReserve,
        uint256 amount,
        string calldata justification,
        ReserveDestination destination,
        address externalRecipient,
        uint256 timelockDuration
    ) external returns (uint256) {
        if (amount == 0) revert InvalidAmount();
        if (bytes(justification).length == 0) revert InvalidJustification();
        if (amount > emergencyReserve) revert InsufficientBalance();

        uint256 proposalId = proposalCounter + 1;
        uint256 executeAfter = block.timestamp + timelockDuration;

        proposals[proposalId] = TimelockProposal({
            proposalId: proposalId,
            amount: amount,
            justification: justification,
            destination: destination,
            externalRecipient: externalRecipient,
            proposedAt: block.timestamp,
            executeAfter: executeAfter,
            executed: false,
            cancelled: false
        });

        emit EmergencyReserveProposed(proposalId, amount, justification, executeAfter);
        return proposalId;
    }

    /**
     * @dev Executar proposal após timelock
     */
    function executeReserve(
        mapping(uint256 => TimelockProposal) storage proposals,
        uint256 proposalId,
        IERC20 usdt
    ) external returns (
        uint256 amount,
        ReserveDestination destination,
        address externalRecipient,
        string memory justification
    ) {
        TimelockProposal storage proposal = proposals[proposalId];

        if (proposal.proposalId == 0) revert ProposalNotFound();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalCancelled();
        if (block.timestamp < proposal.executeAfter) revert TimelockNotExpired();

        proposal.executed = true;

        amount = proposal.amount;
        destination = proposal.destination;
        externalRecipient = proposal.externalRecipient;
        justification = proposal.justification;

        // Se destino é EXTERNAL, fazer transfer aqui
        if (destination == ReserveDestination.EXTERNAL) {
            if (externalRecipient == address(0)) revert InvalidAddress();
            if (!usdt.transfer(externalRecipient, amount)) {
                revert TransferFailed();
            }
        }

        emit EmergencyReserveExecuted(proposalId, amount, destination);
        emit EmergencyReserveUsed(amount, justification, destination, externalRecipient);
    }

    /**
     * @dev Cancelar proposal
     */
    function cancelReserve(
        mapping(uint256 => TimelockProposal) storage proposals,
        uint256 proposalId
    ) external {
        TimelockProposal storage proposal = proposals[proposalId];

        if (proposal.proposalId == 0) revert ProposalNotFound();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalCancelled();

        proposal.cancelled = true;
        emit EmergencyReserveCancelled(proposalId);
    }
}
