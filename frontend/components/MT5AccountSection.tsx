'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import api from '@/lib/api'
import { toast } from 'sonner'
import {
  Wallet, TrendingUp, BarChart, DollarSign,
  Activity, Clock, Loader, Download, AlertCircle,
  CheckCircle, RefreshCw
} from 'lucide-react'

interface MT5Account {
  accountNumber: string
  server: string
  platform: string
  balance: string
  equity: string
  monthlyVolume: string
  monthlyProfit: string
  monthlyLoss: string
  totalTrades: number
  connected: boolean
  lastSync: string | null
}

interface MT5History {
  month: string
  volume: string
  profit: string
  loss: string
  netProfit: string
  trades: number
  winRate: string
}

interface Props {
  address: string
  hasAccountHash: boolean
}

export default function MT5AccountSection({ address, hasAccountHash }: Props) {
  const [mt5Data, setMt5Data] = useState<{ account: MT5Account; history: MT5History[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const loadMT5Data = async () => {
    if (!hasAccountHash) return

    try {
      setLoading(true)
      const data = await api.getMT5Stats(address)
      setMt5Data(data)
    } catch (error: any) {
      // Não mostrar erro se conta não foi encontrada (normal para novos usuários)
      if (!error.message?.includes('not found')) {
        toast.error('Erro ao carregar dados MT5: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Simular dados MT5 (apenas dev)
  const handleMockSync = async () => {
    try {
      setSyncing(true)
      await api.mockMT5Sync(address)
      toast.success('Dados MT5 simulados com sucesso!')
      await loadMT5Data()
    } catch (error: any) {
      toast.error('Erro ao simular dados: ' + error.message)
    } finally {
      setSyncing(false)
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
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </div>
    )
  }

  if (!mt5Data) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <BarChart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Conta MetaTrader</h3>
            <p className="text-sm text-gray-400">Dados de trading não disponíveis</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold mb-1">Expert Advisor não conectado</p>
              <p className="text-gray-300 text-sm mb-3">
                Para coletar dados de trading, instale o EA iDeepX no seu MetaTrader 5/4
              </p>
              <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition flex items-center gap-2 font-semibold">
                <Download className="w-4 h-4" />
                Baixar EA iDeepX
              </button>
            </div>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleMockSync}
            disabled={syncing}
            className="w-full py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition flex items-center justify-center gap-2 font-semibold"
          >
            {syncing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Gerando dados...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Simular Dados MT5 (Dev)
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  const { account, history } = mt5Data

  return (
    <div className="space-y-6">
      {/* Dados Atuais */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <BarChart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Conta MetaTrader</h3>
              <p className="text-sm text-gray-400">
                {account.platform} • {account.accountNumber} • {account.server}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {account.connected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Aguardando EA</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Saldo */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400 text-xs">Saldo</p>
            </div>
            <p className="text-white text-lg font-bold">
              ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Equity */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400 text-xs">Equity</p>
            </div>
            <p className="text-white text-lg font-bold">
              ${parseFloat(account.equity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Volume Mensal */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart className="w-4 h-4 text-blue-400" />
              <p className="text-gray-400 text-xs">Volume Mensal</p>
            </div>
            <p className="text-blue-400 text-lg font-bold">
              ${parseFloat(account.monthlyVolume).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          {/* Lucro Mensal */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <p className="text-gray-400 text-xs">Lucro Mensal</p>
            </div>
            <p className="text-green-400 text-lg font-bold">
              ${parseFloat(account.monthlyProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Trades */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <p className="text-gray-400 text-xs">Trades</p>
            </div>
            <p className="text-purple-400 text-lg font-bold">{account.totalTrades}</p>
          </div>

          {/* Última Sync */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400 text-xs">Última Sync</p>
            </div>
            <p className="text-white text-sm font-semibold">
              {account.lastSync ? new Date(account.lastSync).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Nunca'}
            </p>
          </div>
        </div>

        {!account.connected && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-semibold mb-1">EA não conectado</p>
                <p className="text-gray-300 text-sm mb-3">
                  Instale o EA iDeepX no seu MT5 para coletar dados em tempo real
                </p>
                <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition flex items-center gap-2 font-semibold text-sm">
                  <Download className="w-4 h-4" />
                  Baixar EA
                </button>
              </div>
            </div>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleMockSync}
            disabled={syncing}
            className="w-full mt-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition flex items-center justify-center gap-2 font-semibold"
          >
            {syncing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Gerando dados...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Atualizar Dados (Dev)
              </>
            )}
          </button>
        )}
      </div>

      {/* Histórico */}
      {history && history.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4">Histórico Mensal</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 text-sm font-semibold pb-3">Mês</th>
                  <th className="text-right text-gray-400 text-sm font-semibold pb-3">Volume</th>
                  <th className="text-right text-gray-400 text-sm font-semibold pb-3">Lucro</th>
                  <th className="text-right text-gray-400 text-sm font-semibold pb-3">Prejuízo</th>
                  <th className="text-right text-gray-400 text-sm font-semibold pb-3">Líquido</th>
                  <th className="text-right text-gray-400 text-sm font-semibold pb-3">Trades</th>
                  <th className="text-right text-gray-400 text-sm font-semibold pb-3">Taxa Acerto</th>
                </tr>
              </thead>
              <tbody>
                {history.map((stat, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 text-white font-medium">{stat.month}</td>
                    <td className="py-3 text-right text-blue-400 font-semibold">
                      ${parseFloat(stat.volume).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 text-right text-green-400 font-semibold">
                      ${parseFloat(stat.profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-red-400 font-semibold">
                      ${parseFloat(stat.loss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-white font-bold">
                      ${parseFloat(stat.netProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-purple-400 font-semibold">{stat.trades}</td>
                    <td className="py-3 text-right text-white font-semibold">{parseFloat(stat.winRate).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
