'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import { parseUnits, Address } from 'viem'

interface Proposal {
  proposalId: number
  proposer: Address
  amount: bigint
  proposedAt: bigint
  executedAt: bigint
  cancelled: boolean
  executed: boolean
  justification: string
  destination: number
  externalRecipient: Address
}

interface EmergencyReservePanelProps {
  availableReserve: bigint
  totalUsed: bigint
  currentProposalId: number
  proposal?: Proposal
  onProposeUsage: (amount: bigint, justification: string, destination: number, recipient: Address) => void
  onExecuteProposal: (proposalId: number) => void
  onCancelProposal: (proposalId: number) => void
  isPending: boolean
}

const DESTINATIONS = [
  { value: 0, label: 'Users Distribution', description: 'Distribute to user balances' },
  { value: 1, label: 'Liquidity Pool', description: 'Add to liquidity reserves' },
  { value: 2, label: 'Infrastructure', description: 'Infrastructure wallet' },
  { value: 3, label: 'Company', description: 'Company wallet' },
  { value: 4, label: 'External Address', description: 'Custom recipient' },
]

const TIMELOCK_DURATION = 24 * 60 * 60 // 24 hours in seconds

export function EmergencyReservePanel({
  availableReserve,
  totalUsed,
  currentProposalId,
  proposal,
  onProposeUsage,
  onExecuteProposal,
  onCancelProposal,
  isPending,
}: EmergencyReservePanelProps) {
  const [showProposeForm, setShowProposeForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [justification, setJustification] = useState('')
  const [destination, setDestination] = useState(0)
  const [externalRecipient, setExternalRecipient] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)

  const formatUSDT = (val: bigint) => {
    return (Number(val) / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Calculate time left for proposal execution
  useEffect(() => {
    if (!proposal || proposal.executed || proposal.cancelled) return

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000)
      const proposedAt = Number(proposal.proposedAt)
      const readyAt = proposedAt + TIMELOCK_DURATION
      const remaining = readyAt - now

      setTimeLeft(Math.max(0, remaining))
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [proposal])

  const canExecute = proposal && !proposal.executed && !proposal.cancelled && timeLeft === 0

  const handlePropose = () => {
    if (!amount || !justification) return

    try {
      const amountBigInt = parseUnits(amount, 6)
      const recipient = destination === 4 && externalRecipient
        ? externalRecipient as Address
        : '0x0000000000000000000000000000000000000000' as Address

      onProposeUsage(amountBigInt, justification, destination, recipient)
      setShowProposeForm(false)
      setAmount('')
      setJustification('')
      setDestination(0)
      setExternalRecipient('')
    } catch (error) {
      console.error('Error proposing:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Emergency Reserve</h3>
          <p className="text-sm text-gray-400">24h timelock for withdrawals</p>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Available</p>
          <p className="text-2xl font-bold text-white">${formatUSDT(availableReserve)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Total Used</p>
          <p className="text-2xl font-bold text-orange-400">${formatUSDT(totalUsed)}</p>
        </div>
      </div>

      {/* Active Proposal */}
      {proposal && !proposal.executed && !proposal.cancelled && (
        <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-white">Proposal #{currentProposalId}</h4>
            {timeLeft > 0 ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">{formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Ready</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <span className="text-gray-400 text-sm">Amount: </span>
              <span className="text-white font-semibold">${formatUSDT(proposal.amount)}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Destination: </span>
              <span className="text-white">
                {DESTINATIONS[proposal.destination]?.label || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Justification: </span>
              <p className="text-white mt-1">{proposal.justification}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onExecuteProposal(currentProposalId)}
              disabled={!canExecute || isPending}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                canExecute && !isPending
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPending ? 'Executing...' : canExecute ? 'Execute' : 'Locked'}
            </button>
            <button
              onClick={() => onCancelProposal(currentProposalId)}
              disabled={isPending}
              className="px-6 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Propose New Usage */}
      {!showProposeForm && (!proposal || proposal.executed || proposal.cancelled) && (
        <button
          onClick={() => setShowProposeForm(true)}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Propose Reserve Usage
        </button>
      )}

      {/* Propose Form */}
      {showProposeForm && (
        <div className="space-y-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in USDT"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500"
          />

          <select
            value={destination}
            onChange={(e) => setDestination(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
          >
            {DESTINATIONS.map((dest) => (
              <option key={dest.value} value={dest.value}>
                {dest.label} - {dest.description}
              </option>
            ))}
          </select>

          {destination === 4 && (
            <input
              type="text"
              value={externalRecipient}
              onChange={(e) => setExternalRecipient(e.target.value)}
              placeholder="External recipient address (0x...)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500"
            />
          )}

          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Justification for emergency reserve usage"
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none"
          />

          <div className="flex gap-2">
            <button
              onClick={handlePropose}
              disabled={isPending || !amount || !justification}
              className={`flex-1 py-3 rounded-xl font-semibold ${
                !isPending && amount && justification
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPending ? 'Proposing...' : 'Submit Proposal'}
            </button>
            <button
              onClick={() => setShowProposeForm(false)}
              disabled={isPending}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
        <p className="text-xs text-gray-400">
          Emergency reserve proposals require a 24-hour timelock before execution. This prevents hasty decisions during critical moments.
        </p>
      </div>
    </div>
  )
}
