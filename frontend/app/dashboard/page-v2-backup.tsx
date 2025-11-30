'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@/components/ConnectButton'
import { useCompleteUserData } from '@/hooks/useCompleteUserData'
import {
  useUserView,
  useSolvencyRatio,
  useCircuitBreakerActive,
  useSubscriptionFee,
  useActivateSubscriptionWithBalance,
} from '@/hooks/useContractV10'
import { CONTRACT_ADDRESS } from '@/config/contracts'
import api from '@/lib/api'
import {
  Wallet, TrendingUp, Calendar, Lock, Unlock,
  DollarSign, Network, Activity, Shield, Users,
  CheckCircle, XCircle, ChevronRight, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/Logo'

export default function DashboardMobileOptimized() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  // Dados do backend (otimizado - 1 requisição)
  const {
    userData: backendData,
    mlmStats,
    eligibility,
    referrals,
    loading: loadingUser,
    refetch: refetchBackend,
    internalBalance: backendInternalBalance,
    monthlyVolume: backendMonthlyVolume,
    totalEarned: backendTotalEarned,
    totalCommissions: backendTotalCommissions,
    directReferrals: backendDirectReferrals,
    canUnlock: backendCanUnlock,
    activeDirectsCount: backendActiveDirectsCount,
    combinedVolume: backendCombinedVolume
  } = useCompleteUserData()

  // Dados on-chain
  const { data: userData, refetch: refetchUser } = useUserView(address)
  const { data: solvencyRatio } = useSolvencyRatio()
  const { data: circuitBreakerActive } = useCircuitBreakerActive()
  const { data: subscriptionFee } = useSubscriptionFee()

  // Ações
  const {
    activate: activateWithBalance,
    isPending: isActivatingBalance
  } = useActivateSubscriptionWithBalance()

  // Estados locais
  const [showInactiveUsers, setShowInactiveUsers] = useState(false)
  const [inactiveUsers, setInactiveUsers] = useState<any[]>([])
  const [loadingInactive, setLoadingInactive] = useState(false)
  const [activatingUser, setActivatingUser] = useState<string | null>(null)

  // Redirecionar se não conectado
  useEffect(() => {
    const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
    if (!isConnected && !isE2ETesting) {
      router.push('/')
    }
  }, [isConnected, router])

  // Carregar usuários inativos
  const loadInactiveUsers = async () => {
    if (!address) return

    try {
      setLoadingInactive(true)
      const response = await api.getNetworkInactive(address)
      setInactiveUsers(response.inactive || [])
    } catch (error: any) {
      toast.error('Erro ao carregar inativos: ' + error.message)
    } finally {
      setLoadingInactive(false)
    }
  }

  useEffect(() => {
    if (showInactiveUsers) {
      loadInactiveUsers()
    }
  }, [showInactiveUsers])

  // Ativar membro da rede
  const handleActivateNetworkUser = async (targetAddress: string) => {
    if (!address) return

    try {
      setActivatingUser(targetAddress)
      await api.activateNetworkUser(address, targetAddress)
      toast.success('Assinatura ativada com sucesso!')
      loadInactiveUsers() // Recarregar lista
      refetchBackend()
    } catch (error: any) {
      toast.error('Erro ao ativar: ' + error.message)
    } finally {
      setActivatingUser(null)
    }
  }

  // Ativar com saldo interno
  const handleActivateWithBalance = async () => {
    try {
      await activateWithBalance()
      toast.success('Assinatura renovada!')
      refetchBackend()
      refetchUser()
    } catch (error: any) {
      toast.error('Erro ao renovar: ' + error.message)
    }
  }

  // Não renderizar se não conectado
  const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
  if (!isConnected && !isE2ETesting) {
    return null
  }

  // Loading state
  if (process.env.NODE_ENV === 'development' && loadingUser && !backendData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">🔄 Carregando...</div>
      </div>
    )
  }

  // Extrair dados
  const isDev = process.env.NODE_ENV === 'development'
  const sourceData = isDev ? (backendData || userData) : (userData || backendData)

  const isActive = sourceData?.active ?? false
  const maxLevel = sourceData?.maxLevel ?? 0
  const monthlyVolume = parseFloat(sourceData?.monthlyVolume ?? '0')
  const internalBalance = parseFloat(sourceData?.internalBalance ?? '0')
  const subscriptionExpiry = sourceData?.subscriptionExpiry ?? 0
  const withdrawnThisMonth = parseFloat(sourceData?.withdrawnThisMonth ?? '0')

  // Calcular dias até expirar
  const now = Math.floor(Date.now() / 1000)
  const daysUntilExpiry = subscriptionExpiry > now ? Math.floor((subscriptionExpiry - now) / 86400) : 0
  const isSubscriptionActive = subscriptionExpiry > now

  // Estatísticas MLM
  const totalCommissions = backendTotalCommissions
  const directReferrals = backendDirectReferrals
  const totalNetwork = mlmStats?.networkSize ?? 0

  // Elegibilidade
  const canUnlock = backendCanUnlock
  const recommendedMaxLevel = eligibility?.recommendedMaxLevel ?? 5
  const activeDirectsCount = backendActiveDirectsCount
  const combinedVolume = backendCombinedVolume

  const isSystemHealthy = (solvencyRatio ?? 0) >= 110

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header Mobile-First */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" href="/dashboard" />
              {address && (
                <div className="hidden sm:block">
                  <span className="text-xs text-gray-400">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
              )}
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Alertas */}
        {circuitBreakerActive && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm font-semibold text-center">
              ⚠️ Sistema em modo segurança - Saques pausados
            </p>
          </div>
        )}

        {/* Cards Principais - Grid Responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Saldo Interno */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              {isSubscriptionActive ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-gray-400 text-xs mb-1">Saldo Interno</p>
            <p className="text-2xl font-bold text-white">${internalBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Sacado: ${withdrawnThisMonth.toFixed(2)}
            </p>
          </div>

          {/* Volume Mensal */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Volume Mensal</p>
            <p className="text-2xl font-bold text-white">${monthlyVolume.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Comissões: ${totalCommissions.toFixed(2)}
            </p>
          </div>

          {/* Status Assinatura */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-gray-400 text-xs mb-1">Status Assinatura</p>
            <p className="text-xl font-bold text-white">
              {isSubscriptionActive ? 'Ativa' : 'Inativa'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isSubscriptionActive ? `${daysUntilExpiry} dias` : 'Inativa'}
            </p>
          </div>

          {/* Níveis Desbloqueados */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              {maxLevel >= 10 ? (
                <Unlock className="w-5 h-5 text-cyan-400" />
              ) : (
                <Lock className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <p className="text-gray-400 text-xs mb-1">Níveis Desbloqueados</p>
            <p className="text-2xl font-bold text-white">{maxLevel}/10</p>
            <p className="text-xs text-gray-500 mt-1">
              {maxLevel < 10 ? `Faltam ${10 - maxLevel}` : 'Completo'}
            </p>
          </div>
        </div>

        {/* Assinatura Mensal - Card Expandido */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Assinatura Mensal</h2>

          <div className="space-y-3">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-purple-300">💰 Valor: </span>
                  <span className="text-white font-semibold">${subscriptionFee ?? '19'} USDT</span>
                </div>
                <div>
                  <span className="text-purple-300">📅 Duração: </span>
                  <span className="text-white font-semibold">30 dias</span>
                </div>
                <div>
                  <span className="text-purple-300">🎯 Status: </span>
                  <span className="text-white font-semibold">{isActive ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            </div>

            {isSubscriptionActive ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-green-300 text-sm">
                  ✅ Assinatura ativa por mais {daysUntilExpiry} dias
                </p>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Assinatura inativa - Ative para receber comissões
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desbloquear Níveis 6-10 - Card Expandido */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Desbloquear Níveis 6-10</h2>

          <div className="space-y-3">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-cyan-300">👥 Diretos ativos: </span>
                  <span className="text-white font-semibold">{activeDirectsCount}/5</span>
                </div>
                <div>
                  <span className="text-cyan-300">💵 Volume: </span>
                  <span className="text-white font-semibold">${combinedVolume.toFixed(0)}/$5,000</span>
                </div>
                <div>
                  <span className="text-cyan-300">🎯 Nível: </span>
                  <span className="text-white font-semibold">{recommendedMaxLevel}</span>
                </div>
              </div>
            </div>

            {maxLevel >= 10 ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-green-300 text-sm">
                  🎉 Todos os níveis desbloqueados!
                </p>
              </div>
            ) : canUnlock ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                <p className="text-yellow-300 text-sm">
                  ✅ Você qualificou! Contate o suporte para desbloquear.
                </p>
              </div>
            ) : (
              <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                <p className="text-gray-300 text-sm">
                  Continue! Precisa de 5 diretos ativos e $5,000 de volume.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Minha Assinatura - Card Novo */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Minha Assinatura</h2>
          <p className="text-gray-400 text-sm mb-4">Ative ou renove usando seu saldo interno</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <p className={`text-lg font-bold ${isSubscriptionActive ? 'text-green-400' : 'text-red-400'}`}>
                {isSubscriptionActive ? 'Ativa' : 'Inativa'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Custo</p>
              <p className="text-lg font-bold text-white">${subscriptionFee ?? '19'} / mês</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Seu Saldo</p>
              <p className="text-lg font-bold text-white">${internalBalance.toFixed(2)}</p>
            </div>
          </div>

          {internalBalance >= parseFloat(subscriptionFee ?? '0') && (
            <button
              onClick={handleActivateWithBalance}
              disabled={isActivatingBalance || circuitBreakerActive}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {isActivatingBalance ? 'Renovando...' : 'Renovar Assinatura'}
            </button>
          )}
        </div>

        {/* Ativar Membros da Rede - Card Novo */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-2">Ativar Membros da Rede</h2>
          <p className="text-gray-400 text-sm mb-4">Ative assinaturas para sua rede (até 10 níveis)</p>

          <button
            onClick={() => setShowInactiveUsers(!showInactiveUsers)}
            disabled={loadingInactive}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            {loadingInactive ? 'Carregando...' : (showInactiveUsers ? 'Ocultar' : 'Ver Inativos')}
          </button>

          {showInactiveUsers && inactiveUsers.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {inactiveUsers.map((user: any) => (
                <div key={user.walletAddress} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-mono">
                      {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Nível {user.level} • {user.daysInactive} dias inativo
                    </p>
                  </div>
                  <button
                    onClick={() => handleActivateNetworkUser(user.walletAddress)}
                    disabled={activatingUser === user.walletAddress || internalBalance < parseFloat(subscriptionFee ?? '0')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activatingUser === user.walletAddress ? 'Ativando...' : 'Ativar'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {showInactiveUsers && inactiveUsers.length === 0 && !loadingInactive && (
            <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-green-300 text-sm">
                ✅ Todos os membros da sua rede estão ativos!
              </p>
            </div>
          )}
        </div>

        {/* Navegação Rápida */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => router.push('/network')}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <Network className="w-6 h-6 text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Minha Rede MLM</h3>
            <p className="text-gray-400 text-xs mb-2">Rede de {maxLevel} níveis</p>
            <p className="text-gray-300 text-xs">
              {directReferrals} diretos • {totalNetwork} total
            </p>
          </button>

          <button
            onClick={() => router.push('/withdraw')}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Sacar</h3>
            <p className="text-gray-400 text-xs mb-2">Saldo para carteira</p>
            <p className="text-gray-300 text-xs">
              Disponível: ${internalBalance.toFixed(2)}
            </p>
          </button>

          <button
            onClick={() => router.push('/gmi-hedge')}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">GMI Edge</h3>
            <p className="text-gray-400 text-xs mb-2">The Edge Platform</p>
            <p className="text-gray-300 text-xs">
              Ver estatísticas
            </p>
          </button>

          <button
            onClick={() => router.push('/transparency')}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-purple-400" />
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Transparência</h3>
            <p className="text-gray-400 text-xs mb-2">Provas on-chain</p>
            <p className="text-gray-300 text-xs">
              100% auditável
            </p>
          </button>
        </div>

        {/* Saúde do Sistema */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Saúde do Sistema</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Solvência</p>
              <p className={`text-2xl font-bold ${isSystemHealthy ? 'text-green-400' : 'text-red-400'}`}>
                {solvencyRatio ?? 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isSystemHealthy ? 'Sistema saudável' : 'Abaixo do mínimo'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Circuit Breaker</p>
              <p className={`text-2xl font-bold ${circuitBreakerActive ? 'text-red-400' : 'text-green-400'}`}>
                {circuitBreakerActive ? 'Ativo' : 'Inativo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {circuitBreakerActive ? 'Saques pausados' : 'Sistema normal'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Contrato</p>
              <p className="text-sm font-mono text-white">
                {CONTRACT_ADDRESS?.slice(0, 6)}...{CONTRACT_ADDRESS?.slice(-4)}
              </p>
              <a
                href={`https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
              >
                Ver no BSCScan ↗
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
