'use client'

import { useState, useEffect } from 'react'
import { Wallet, DollarSign, TrendingUp, Check } from 'lucide-react'
import { formatUnits, parseUnits } from 'viem'
import { SUBSCRIPTION_FEE } from '@/config/contracts'
import { formatUSDT } from '@/lib/utils'

type PaymentMode = 'usdt' | 'balance' | 'mixed'

interface PaymentModeSelectorProps {
  availableBalance: bigint
  months: number
  onModeChange: (mode: PaymentMode, balanceAmount?: bigint) => void
}

export default function PaymentModeSelector({
  availableBalance,
  months,
  onModeChange,
}: PaymentModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<PaymentMode>('usdt')
  const [mixedBalanceAmount, setMixedBalanceAmount] = useState('')

  const totalCost = SUBSCRIPTION_FEE * BigInt(months)
  const hasEnoughBalance = availableBalance >= totalCost

  useEffect(() => {
    if (selectedMode === 'mixed') {
      const amount = mixedBalanceAmount ? parseUnits(mixedBalanceAmount, 6) : 0n
      onModeChange('mixed', amount)
    } else {
      onModeChange(selectedMode)
    }
  }, [selectedMode, mixedBalanceAmount, onModeChange])

  const handleModeSelect = (mode: PaymentMode) => {
    setSelectedMode(mode)
    if (mode !== 'mixed') {
      setMixedBalanceAmount('')
    }
  }

  const maxBalanceForMixed = availableBalance < totalCost ? availableBalance : totalCost

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold mb-3">Escolha a forma de pagamento:</h3>

      {/* Option 1: USDT */}
      <button
        onClick={() => handleModeSelect('usdt')}
        className={`w-full p-4 rounded-xl border-2 transition text-left ${
          selectedMode === 'usdt'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-white font-semibold">Pagar com USDT</p>
              <p className="text-gray-400 text-sm">
                Total: ${formatUSDT(totalCost)} USDT
              </p>
            </div>
          </div>
          {selectedMode === 'usdt' && (
            <Check className="w-5 h-5 text-blue-400" />
          )}
        </div>
      </button>

      {/* Option 2: Internal Balance */}
      <button
        onClick={() => handleModeSelect('balance')}
        disabled={!hasEnoughBalance}
        className={`w-full p-4 rounded-xl border-2 transition text-left ${
          selectedMode === 'balance'
            ? 'border-green-500 bg-green-500/10'
            : !hasEnoughBalance
            ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-white font-semibold">Pagar com Saldo Interno</p>
              <p className="text-gray-400 text-sm">
                Disponível: ${formatUSDT(availableBalance)} USDT
              </p>
              {!hasEnoughBalance && (
                <p className="text-red-400 text-xs mt-1">
                  Saldo insuficiente
                </p>
              )}
            </div>
          </div>
          {selectedMode === 'balance' && (
            <Check className="w-5 h-5 text-green-400" />
          )}
        </div>
      </button>

      {/* Option 3: Mixed Payment */}
      <div
        className={`p-4 rounded-xl border-2 transition ${
          selectedMode === 'mixed'
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-700 bg-gray-800/50'
        }`}
      >
        <button
          onClick={() => handleModeSelect('mixed')}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white font-semibold">Pagamento Misto</p>
                <p className="text-gray-400 text-sm">
                  Combine saldo interno + USDT
                </p>
              </div>
            </div>
            {selectedMode === 'mixed' && (
              <Check className="w-5 h-5 text-purple-400" />
            )}
          </div>
        </button>

        {selectedMode === 'mixed' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Quanto do saldo interno usar?
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={mixedBalanceAmount}
                  onChange={(e) => setMixedBalanceAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={formatUnits(maxBalanceForMixed, 6)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => setMixedBalanceAmount(formatUnits(maxBalanceForMixed, 6))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition"
                >
                  Máx
                </button>
              </div>
            </div>

            {mixedBalanceAmount && Number(mixedBalanceAmount) > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Saldo Interno:</span>
                  <span className="text-white font-medium">${mixedBalanceAmount} USDT</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">USDT necessário:</span>
                  <span className="text-white font-medium">
                    ${formatUSDT(totalCost - parseUnits(mixedBalanceAmount, 6))} USDT
                  </span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-purple-400 font-semibold">
                    ${formatUSDT(totalCost)} USDT
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-400 text-sm">
          💡 <strong>Dica:</strong> Use seu saldo interno para economizar no gas da transação!
        </p>
      </div>
    </div>
  )
}
