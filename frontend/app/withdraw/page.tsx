'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/PageLayout'
import { StatCard, GlassCard } from '@/components/GlassCard'
import {
  useCircuitBreakerActive,
  useWithdraw
} from '@/hooks/useContractV10'
import { useCompleteUserData } from '@/hooks/useCompleteUserData'
import {
  Wallet, DollarSign, ArrowDownToLine, AlertTriangle,
  Loader, TrendingDown, Clock, History, ExternalLink, Info
} from 'lucide-react'
import { toast } from 'sonner'
import { parseUnits } from 'viem'
import api from '@/lib/api'

interface WithdrawalHistoryItem {
  id: string
  amount: string
  date: string
  status: 'pending' | 'confirmed' | 'failed'
  txHash?: string
}

export default function WithdrawPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const { userData, loading, refetch: refetchBackend } = useCompleteUserData()
  const { data: circuitBreakerActive } = useCircuitBreakerActive()

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawingDev, setIsWithdrawingDev] = useState(false)
  const [isSuccessDev, setIsSuccessDev] = useState(false)
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistoryItem[]>([])

  const isDev = process.env.NODE_ENV === 'development'

  const amount = withdrawAmount && !isNaN(Number(withdrawAmount)) ? Number(withdrawAmount) : 0
  const {
    withdraw: withdrawBlockchain,
    isPending: isWithdrawingBlockchain,
    isConfirmed: isSuccessBlockchain,
  } = useWithdraw()

  const isWithdrawing = isDev ? isWithdrawingDev : isWithdrawingBlockchain
  const isSuccess = isDev ? isSuccessDev : isSuccessBlockchain

  const internalBalance = parseFloat(userData?.internalBalance ?? '0')
  const withdrawnThisMonth = parseFloat(userData?.withdrawnThisMonth ?? '0')
  const subscriptionExpiry = userData?.subscriptionExpiry ?? 0
  const monthlyVolume = parseFloat(userData?.monthlyVolume ?? '0')

  const now = Math.floor(Date.now() / 1000)
  const isSubscriptionActive = subscriptionExpiry > now

  const MIN_WITHDRAWAL = 10
  const MONTHLY_LIMIT = 10000
  const remainingMonthlyLimit = MONTHLY_LIMIT - withdrawnThisMonth

  const canWithdraw = internalBalance >= MIN_WITHDRAWAL && !circuitBreakerActive

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    if (address) {
      const mockHistory: WithdrawalHistoryItem[] = [
        {
          id: '1',
          amount: '500.00',
          date: '2025-11-10',
          status: 'confirmed',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        }
      ]
      setWithdrawalHistory(mockHistory)
    }
  }, [address])

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Saque de $${withdrawAmount} USDT realizado!`)
      setWithdrawAmount('')
      if (isDev) {
        refetchBackend()
        setTimeout(() => setIsSuccessDev(false), 2000)
      }
    }
  }, [isSuccess])

  const handleWithdrawAll = async () => {
    if (internalBalance < MIN_WITHDRAWAL) {
      toast.error(`Saldo mínimo: $${MIN_WITHDRAWAL} USDT`)
      return
    }

    if (circuitBreakerActive) {
      toast.error('Sistema em modo segurança - Saques pausados')
      return
    }

    const amount = internalBalance

    if (isDev) {
      setIsWithdrawingDev(true)
      try {
        setWithdrawAmount(amount.toString())
        await api.withdraw(address, amount.toString())
        setIsSuccessDev(true)
      } catch (error: any) {
        toast.error('Erro: ' + (error.message || 'Erro desconhecido'))
      } finally {
        setIsWithdrawingDev(false)
      }
    } else {
      setWithdrawAmount(amount.toString())
      setTimeout(() => {
        if (withdrawBlockchain) {
          withdrawBlockchain(parseUnits(amount.toString(), 6))
        }
      }, 100)
    }
  }

  const handleWithdrawPartial = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast.error('Digite um valor válido')
      return
    }

    const amount = Number(withdrawAmount)

    if (amount < MIN_WITHDRAWAL) {
      toast.error(`Valor mínimo: $${MIN_WITHDRAWAL} USDT`)
      return
    }

    if (amount > internalBalance) {
      toast.error('Valor maior que o saldo disponível')
      return
    }

    if (withdrawnThisMonth + amount > MONTHLY_LIMIT) {
      toast.error(`Limite mensal excedido ($${MONTHLY_LIMIT})`)
      return
    }

    if (circuitBreakerActive) {
      toast.error('Sistema em modo segurança - Saques pausados')
      return
    }

    if (isDev) {
      setIsWithdrawingDev(true)
      try {
        await api.withdraw(address, amount.toString())
        setIsSuccessDev(true)
      } catch (error: any) {
        toast.error('Erro: ' + (error.message || 'Erro desconhecido'))
      } finally {
        setIsWithdrawingDev(false)
      }
    } else {
      if (withdrawBlockchain) {
        withdrawBlockchain(parseUnits(amount.toString(), 6))
      }
    }
  }

  if (!isConnected) {
    return null
  }

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex items-center justify-center">
        <div className="text-white text-xl">🔄 Carregando...</div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Sacar Saldo"
      subtitle="Retire seu saldo interno para sua carteira"
      icon={<DollarSign className="w-8 h-8 text-green-400" />}
    >
      {/* Alertas */}
      {circuitBreakerActive && (
        <GlassCard className="p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm font-medium">
              Sistema em modo segurança - Saques temporariamente pausados
            </p>
          </div>
        </GlassCard>
      )}

      {!isSubscriptionActive && (
        <GlassCard className="p-4 border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-300 text-sm font-medium">
              Assinatura inativa. Ative para continuar recebendo comissões.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Saldo Disponível"
          value={`$${internalBalance.toFixed(2)}`}
          subtitle={`Mínimo: $${MIN_WITHDRAWAL}`}
          color="green"
          trend="neutral"
        />

        <StatCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="Sacado Este Mês"
          value={`$${withdrawnThisMonth.toFixed(2)}`}
          subtitle={`Restante: $${remainingMonthlyLimit.toFixed(0)}`}
          color="blue"
        />

        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Volume Mensal"
          value={`$${monthlyVolume.toFixed(2)}`}
          subtitle="Gerado neste mês"
          color="purple"
          trend="up"
        />
      </div>

      {/* Progresso Limite Mensal */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-white mb-3">Limite Mensal de Saques</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mensal</span>
            <span className="text-white font-semibold">
              ${withdrawnThisMonth.toFixed(0)} / ${MONTHLY_LIMIT.toFixed(0)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                withdrawnThisMonth / MONTHLY_LIMIT > 0.9
                  ? 'bg-red-500'
                  : withdrawnThisMonth / MONTHLY_LIMIT > 0.7
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((withdrawnThisMonth / MONTHLY_LIMIT) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            Você ainda pode sacar ${remainingMonthlyLimit.toFixed(2)} este mês
          </p>
        </div>
      </GlassCard>

      {/* Formulário de Saque */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-white mb-4">Realizar Saque</h3>

        <div className="mb-4">
          <label className="block text-white text-sm font-semibold mb-2">
            Valor a Sacar (USDT)
          </label>
          <div className="relative">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min={MIN_WITHDRAWAL}
              max={internalBalance}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              disabled={isWithdrawing || circuitBreakerActive}
            />
            <button
              onClick={() => setWithdrawAmount(internalBalance.toString())}
              disabled={isWithdrawing || circuitBreakerActive}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
            >
              Máx
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Disponível: ${internalBalance.toFixed(2)} USDT
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleWithdrawPartial}
            disabled={
              isWithdrawing ||
              !canWithdraw ||
              !withdrawAmount ||
              Number(withdrawAmount) < MIN_WITHDRAWAL ||
              Number(withdrawAmount) > internalBalance
            }
            className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg shadow-blue-500/20"
          >
            {isWithdrawing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                Sacar Valor
              </>
            )}
          </button>

          <button
            onClick={handleWithdrawAll}
            disabled={isWithdrawing || !canWithdraw}
            className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg shadow-green-500/20"
          >
            {isWithdrawing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                Sacar Tudo
              </>
            )}
          </button>
        </div>

        {isWithdrawing && (
          <p className="text-center text-gray-400 text-xs mt-3">
            Aguardando confirmação da transação...
          </p>
        )}
      </GlassCard>

      {/* Histórico */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          Histórico de Saques
        </h3>

        {withdrawalHistory.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhum saque realizado ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawalHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex-1">
                  <p className="text-white font-semibold">${item.amount}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.status === 'confirmed' ? 'Confirmado' : item.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </span>
                  {item.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GlassCard className="p-4 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Sem Taxas!</h4>
              <p className="text-gray-300 text-xs">
                Você paga apenas o gas da rede BSC.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-green-500/20 bg-green-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Circuit Breaker</h4>
              <p className="text-gray-300 text-xs">
                Proteção automática contra insolvência {'<'} 110%.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  )
}
