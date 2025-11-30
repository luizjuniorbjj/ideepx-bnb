'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { BarChart, TrendingUp, CheckCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react'

interface Props {
  address: string
  hasAccountHash: boolean
}

export default function MT5SummaryCard({ address, hasAccountHash }: Props) {
  const router = useRouter()
  const [mt5Data, setMt5Data] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadMT5Data = async () => {
    if (!hasAccountHash) return

    try {
      setLoading(true)
      const data = await api.getMT5Stats(address)
      setMt5Data(data)
    } catch (error: any) {
      // Silently fail - card will show "not connected" state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasAccountHash && address) {
      loadMT5Data()
    }
  }, [hasAccountHash, address])

  if (!hasAccountHash) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      </div>
    )
  }

  const account = mt5Data?.account
  const connected = account?.connected || false
  const platform = account?.platform || 'MT5'
  const monthlyVolume = parseFloat(account?.monthlyVolume || '0')
  const monthlyProfit = parseFloat(account?.monthlyProfit || '0')
  const monthlyLoss = parseFloat(account?.monthlyLoss || '0')
  const profitPercent = monthlyVolume > 0 ? ((monthlyProfit - monthlyLoss) / monthlyVolume * 100) : 0

  return (
    <button
      onClick={() => router.push('/mt5')}
      className="w-full p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition text-left group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <BarChart className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{platform}</h3>
            <p className="text-xs text-gray-400">Trading Account</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
      </div>

      <div className="space-y-3">
        {/* Volume Mensal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Volume Mensal</span>
          <span className="text-white font-semibold">
            ${monthlyVolume.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        {/* Lucro Mensal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Lucro Mensal</span>
          <span className={`font-semibold ${profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-sm text-gray-400">Status</span>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm">Aguardando EA</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center group-hover:text-gray-300 transition">
          Clique para ver detalhes completos →
        </p>
      </div>
    </button>
  )
}
