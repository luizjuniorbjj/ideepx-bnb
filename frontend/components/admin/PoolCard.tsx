'use client'

import { useState } from 'react'
import { Droplets, Building2, Briefcase, ArrowDownToLine } from 'lucide-react'
import { parseUnits } from 'viem'

interface PoolCardProps {
  poolType: 'liquidity' | 'infrastructure' | 'company'
  balance: bigint
  withdrawnToday: bigint
  withdrawnThisMonth: bigint
  dailyLimit: bigint
  monthlyLimit: bigint
  onWithdraw: (amount: bigint) => void
  isPending: boolean
}

const POOL_CONFIG = {
  liquidity: {
    name: 'Liquidity Pool',
    icon: Droplets,
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-500/30',
  },
  infrastructure: {
    name: 'Infrastructure Pool',
    icon: Building2,
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-500/30',
  },
  company: {
    name: 'Company Pool',
    icon: Briefcase,
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-500/10 to-green-600/10',
    borderColor: 'border-green-500/30',
  },
}

export function PoolCard({
  poolType,
  balance,
  withdrawnToday,
  withdrawnThisMonth,
  dailyLimit,
  monthlyLimit,
  onWithdraw,
  isPending,
}: PoolCardProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)

  const config = POOL_CONFIG[poolType]
  const Icon = config.icon

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const availableToday = dailyLimit - withdrawnToday
  const availableThisMonth = monthlyLimit - withdrawnThisMonth

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return

    try {
      const amount = parseUnits(withdrawAmount, 6)
      onWithdraw(amount)
      setWithdrawAmount('')
      setShowWithdrawForm(false)
    } catch (error) {
      console.error('Error parsing amount:', error)
    }
  }

  const canWithdraw = balance > 0n && availableToday > 0n && availableThisMonth > 0n

  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border ${config.borderColor} rounded-2xl p-6`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{config.name}</h3>
          <p className="text-sm text-gray-400">{poolType}</p>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-1">Current Balance</p>
        <p className="text-3xl font-bold text-white">${formatUSDT(balance)}</p>
      </div>

      {/* Limits */}
      <div className="space-y-3 mb-6">
        {/* Daily Limit */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Today</span>
            <span className="text-white">
              ${formatUSDT(withdrawnToday)} / ${formatUSDT(dailyLimit)}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all`}
              style={{
                width: `${Math.min((Number(withdrawnToday) / Number(dailyLimit)) * 100, 100)}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available today: ${formatUSDT(availableToday)}
          </p>
        </div>

        {/* Monthly Limit */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">This Month</span>
            <span className="text-white">
              ${formatUSDT(withdrawnThisMonth)} / ${formatUSDT(monthlyLimit)}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all`}
              style={{
                width: `${Math.min((Number(withdrawnThisMonth) / Number(monthlyLimit)) * 100, 100)}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available this month: ${formatUSDT(availableThisMonth)}
          </p>
        </div>
      </div>

      {/* Withdraw Button/Form */}
      {!showWithdrawForm ? (
        <button
          onClick={() => setShowWithdrawForm(true)}
          disabled={!canWithdraw || isPending}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
            canWithdraw && !isPending
              ? `bg-gradient-to-r ${config.gradient} text-white hover:shadow-lg`
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ArrowDownToLine className="w-5 h-5" />
          Withdraw Funds
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount in USDT"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
          <div className="flex gap-2">
            <button
              onClick={handleWithdraw}
              disabled={isPending || !withdrawAmount}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                !isPending && withdrawAmount
                  ? `bg-gradient-to-r ${config.gradient} text-white hover:shadow-lg`
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPending ? 'Withdrawing...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setShowWithdrawForm(false)
                setWithdrawAmount('')
              }}
              disabled={isPending}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
