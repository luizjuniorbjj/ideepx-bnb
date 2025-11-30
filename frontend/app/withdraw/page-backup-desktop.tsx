'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@/components/ConnectButton'
import {
  useUserView,
  useCircuitBreakerActive,
  useWithdraw
} from '@/hooks/useContractV10'
import { useUserData } from '@/hooks/useUserData'
import {
  ArrowLeft, Wallet, DollarSign, ArrowDownToLine,
  CheckCircle, AlertTriangle, Loader, TrendingDown,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { parseUnits } from 'viem'
import Logo from '@/components/Logo'
import api from '@/lib/api'

export default function WithdrawPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  // Dados do usuário do backend (modo dev)
  const { userData: backendData, refetch: refetchBackend } = useUserData()

  // Dados on-chain (produção)
  const { data: userData, refetch: refetchUser } = useUserView(address)
  const { data: circuitBreakerActive } = useCircuitBreakerActive()

  // Estado local
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawingDev, setIsWithdrawingDev] = useState(false)
  const [isSuccessDev, setIsSuccessDev] = useState(false)

  // Dev mode detection
  const isDev = process.env.NODE_ENV === 'development'

  // Withdraw hook para produção (blockchain)
  const amount = withdrawAmount && !isNaN(Number(withdrawAmount)) ? Number(withdrawAmount) : 0
  const {
    withdraw: withdrawBlockchain,
    isPending: isWithdrawingBlockchain,
    isConfirmed: isSuccessBlockchain,
  } = useWithdraw()

  // Estados combinados (dev ou blockchain)
  const isWithdrawing = isDev ? isWithdrawingDev : isWithdrawingBlockchain
  const isSuccess = isDev ? isSuccessDev : isSuccessBlockchain

  // Extrair dados (prioriza backend em dev)
  const sourceData = backendData || userData
  const internalBalance = parseFloat(sourceData?.internalBalance ?? '0')
  const withdrawnThisMonth = parseFloat(sourceData?.withdrawnThisMonth ?? '0')
  const subscriptionExpiry = sourceData?.subscriptionExpiry ?? 0
  const monthlyVolume = parseFloat(sourceData?.monthlyVolume ?? '0')

  // Calcular se assinatura está ativa
  const now = Math.floor(Date.now() / 1000)
  const isSubscriptionActive = subscriptionExpiry > now

  // Mínimo de saque: $10 USDT
  const MIN_WITHDRAWAL = 10
  const canWithdraw = internalBalance >= MIN_WITHDRAWAL && !circuitBreakerActive

  // Redirect se não conectado
  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  // Success handling
  useEffect(() => {
    if (isSuccess) {
      toast.success(`Saque de $${withdrawAmount} USDT realizado com sucesso!`)
      setWithdrawAmount('')
      if (isDev) {
        refetchBackend()
      } else {
        refetchUser()
      }
      // Reset success state after 2s
      if (isDev) {
        setTimeout(() => setIsSuccessDev(false), 2000)
      }
    }
  }, [isSuccess])

  const handleWithdrawAll = async () => {
    if (internalBalance < MIN_WITHDRAWAL) {
      toast.error(`Saldo mínimo para saque: $${MIN_WITHDRAWAL} USDT`)
      return
    }

    if (circuitBreakerActive) {
      toast.error('Sistema em modo segurança - Saques temporariamente pausados')
      return
    }

    const amount = internalBalance

    if (isDev) {
      // Dev mode: usar API
      setIsWithdrawingDev(true)
      try {
        setWithdrawAmount(amount.toString())
        await api.withdraw(address, amount.toString())
        setIsSuccessDev(true)
      } catch (error) {
        toast.error('Erro ao realizar saque: ' + (error.message || 'Erro desconhecido'))
      } finally {
        setIsWithdrawingDev(false)
      }
    } else {
      // Produção: usar blockchain
      setWithdrawAmount(amount.toString())
      setTimeout(() => {
        if (withdrawBlockchain) {
          withdrawBlockchain(parseUnits(amount.toString(), 6)) // USDT tem 6 decimais
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

    if (circuitBreakerActive) {
      toast.error('Sistema em modo segurança - Saques temporariamente pausados')
      return
    }

    if (isDev) {
      // Dev mode: usar API
      setIsWithdrawingDev(true)
      try {
        await api.withdraw(address, amount.toString())
        setIsSuccessDev(true)
      } catch (error) {
        toast.error('Erro ao realizar saque: ' + (error.message || 'Erro desconhecido'))
      } finally {
        setIsWithdrawingDev(false)
      }
    } else {
      // Produção: usar blockchain
      if (withdrawBlockchain) {
        withdrawBlockchain(parseUnits(amount.toString(), 6)) // USDT tem 6 decimais
      }
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Dashboard
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Sacar Saldo
            </h1>
            <p className="text-gray-400">
              Retire seu saldo interno para sua carteira
            </p>
          </div>

          {/* Alerta: Circuit Breaker */}
          {circuitBreakerActive && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 font-semibold">
                  ⚠️ Sistema em modo segurança - Saques temporariamente pausados
                </p>
              </div>
            </div>
          )}

          {/* Warning if not active */}
          {!isSubscriptionActive && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-400 font-semibold">
                  Sua assinatura está inativa. Ative para continuar recebendo comissões.
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-6 h-6 text-green-400" />
                <h3 className="text-gray-400 text-sm">Saldo Disponível</h3>
              </div>
              <p className="text-3xl font-bold text-white">${internalBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo: ${MIN_WITHDRAWAL}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-6 h-6 text-blue-400" />
                <h3 className="text-gray-400 text-sm">Sacado Este Mês</h3>
              </div>
              <p className="text-3xl font-bold text-white">${withdrawnThisMonth.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-purple-400" />
                <h3 className="text-gray-400 text-sm">Volume Mensal</h3>
              </div>
              <p className="text-3xl font-bold text-white">${monthlyVolume.toFixed(2)}</p>
            </div>
          </div>

          {/* Withdraw Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Opções de Saque</h2>

            {/* Partial Amount Input */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
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
                  className="w-full px-4 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  disabled={isWithdrawing || circuitBreakerActive}
                />
                <button
                  onClick={() => setWithdrawAmount(internalBalance.toString())}
                  disabled={isWithdrawing || circuitBreakerActive}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Máx
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Disponível: ${internalBalance.toFixed(2)} USDT | Mínimo: ${MIN_WITHDRAWAL} USDT
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleWithdrawPartial}
                disabled={
                  isWithdrawing ||
                  !canWithdraw ||
                  !withdrawAmount ||
                  Number(withdrawAmount) < MIN_WITHDRAWAL ||
                  Number(withdrawAmount) > internalBalance
                }
                className={`py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                  !isWithdrawing && canWithdraw && withdrawAmount && Number(withdrawAmount) >= MIN_WITHDRAWAL
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isWithdrawing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-5 h-5" />
                    Sacar Valor
                  </>
                )}
              </button>

              <button
                onClick={handleWithdrawAll}
                disabled={isWithdrawing || !canWithdraw}
                className={`py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                  !isWithdrawing && canWithdraw
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/50'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isWithdrawing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-5 h-5" />
                    Sacar Tudo (${internalBalance.toFixed(2)})
                  </>
                )}
              </button>
            </div>

            {/* Transaction Note */}
            {isWithdrawing && (
              <p className="text-center text-gray-400 text-sm mt-4">
                ⏳ Aguardando confirmação da transação na blockchain...
              </p>
            )}
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Fees Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Sem Taxas!
              </h3>
              <p className="text-gray-300 text-sm">
                O iDeepX não cobra taxas de saque. Você paga apenas o gas da rede BSC.
              </p>
            </div>

            {/* Security Info */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Circuit Breaker
              </h3>
              <p className="text-gray-300 text-sm">
                Sistema de proteção automática contra insolvência. Saques são pausados se a solvência cair abaixo de 110%.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>Importante:</strong> Saque mínimo de ${MIN_WITHDRAWAL} USDT. Os valores são debitados do seu saldo interno creditado pelo sistema.
              </p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-400 text-sm">
                💡 <strong>Nota:</strong> Seu limite mensal de saque é resetado todo mês. Os valores sacados este mês: ${withdrawnThisMonth.toFixed(2)} USDT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
