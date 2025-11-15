'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { StatCard, GlassCard } from '@/components/GlassCard'
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
  CheckCircle, XCircle, Zap, ChevronRight, AlertCircle,
  Clock, Award, AlertOctagon, Info, ChevronDown, ChevronUp, Target
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  // Dados do backend (otimizado - 1 requisição)
  const {
    userData: backendData,
    mlmStats,
    eligibility,
    loading: loadingUser,
    refetch: refetchBackend,
    internalBalance: backendInternalBalance,
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
  const [showAllLevels, setShowAllLevels] = useState(false)

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
      loadInactiveUsers()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex items-center justify-center">
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
    <PageLayout>
      {/* Alerta Circuit Breaker */}
      {circuitBreakerActive && (
        <GlassCard className="p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm font-medium">
              Sistema em modo segurança - Saques temporariamente pausados
            </p>
          </div>
        </GlassCard>
      )}

      {/* Stats Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Saldo Interno"
          value={`$${internalBalance.toFixed(2)}`}
          subtitle={`Sacado: $${withdrawnThisMonth.toFixed(2)}`}
          color="blue"
          trend={isSubscriptionActive ? 'up' : 'neutral'}
        />

        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Volume Mensal"
          value={`$${monthlyVolume.toFixed(2)}`}
          subtitle={`Comissões: $${totalCommissions.toFixed(2)}`}
          color="green"
          trend="up"
        />

        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Assinatura"
          value={isSubscriptionActive ? 'Ativa' : 'Inativa'}
          subtitle={isSubscriptionActive ? `${daysUntilExpiry} dias` : 'Renovar'}
          color={isSubscriptionActive ? 'green' : 'orange'}
          trend={isSubscriptionActive ? 'up' : 'down'}
        />

        <StatCard
          icon={maxLevel >= 10 ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          label="Níveis MLM"
          value={`${maxLevel}/10`}
          subtitle={maxLevel >= 10 ? 'Completo' : `Faltam ${10 - maxLevel}`}
          color={maxLevel >= 10 ? 'cyan' : 'orange'}
        />
      </div>

      {/* Grid Inteligente: LAI + Ativar Membros */}
      <div className={`grid gap-6 items-stretch ${
        // LAI urgente (inativa ou ≤7 dias) = full width para destaque
        !isSubscriptionActive || daysUntilExpiry <= 7
          ? 'grid-cols-1'
          // LAI OK (>7 dias) = lado a lado em desktop (60%/40%)
          : 'grid-cols-1 lg:grid-cols-[3fr_2fr]'
      }`}>
        {/* LAI - Licença de Acesso Inteligente (DESTAQUE) */}
        <GlassCard
        className={`h-full flex flex-col p-6 border-2 ${
          !isSubscriptionActive
            ? 'border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10'
            : daysUntilExpiry <= 3
            ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
            : 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-cyan-500/10'
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              !isSubscriptionActive
                ? 'bg-red-500/20'
                : daysUntilExpiry <= 3
                ? 'bg-yellow-500/20'
                : 'bg-green-500/20'
            }`}>
              {!isSubscriptionActive ? (
                <AlertOctagon className="w-7 h-7 text-red-400" />
              ) : (
                <Award className="w-7 h-7 text-green-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">
                  Licença de Acesso Inteligente (LAI)
                </h3>
                {/* Ícone Info com Tooltip */}
                <div className="relative group">
                  <Info className="w-5 h-5 text-blue-400 cursor-help" />

                  {/* Tooltip - aparece ABAIXO do ícone */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-72 bg-slate-900 border border-blue-500/50 rounded-xl p-4 shadow-2xl z-[9999] pointer-events-none">
                    {/* Seta do tooltip apontando para CIMA */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px] w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-slate-900"></div>

                    <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Importância da LAI
                    </h4>
                    <ul className="text-xs text-gray-300 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        <span><strong>Sem LAI ativa</strong>, você <strong>NÃO recebe comissões</strong> da sua rede MLM</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 flex-shrink-0">•</span>
                        <span>A LAI garante seu direito de ganhar nos <strong>10 níveis</strong> de indicações</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 flex-shrink-0">•</span>
                        <span>Renove antes de expirar para <strong>não perder comissões</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 flex-shrink-0">•</span>
                        <span>Valor: <strong>${subscriptionFee ?? '19'}/mês</strong> - Investimento que se paga sozinho</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className={`text-sm font-semibold ${
                !isSubscriptionActive
                  ? 'text-red-300'
                  : daysUntilExpiry <= 3
                  ? 'text-yellow-300'
                  : 'text-green-300'
              }`}>
                {!isSubscriptionActive
                  ? '❌ INATIVA - Você não está recebendo comissões'
                  : daysUntilExpiry <= 3
                  ? `⚠️ ATENÇÃO: Expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}`
                  : `✅ ATIVA - ${daysUntilExpiry} dias restantes`
                }
              </p>
            </div>
          </div>

          <div className={`text-right px-4 py-2 rounded-xl ${
            !isSubscriptionActive
              ? 'bg-red-500/20 border border-red-500/30'
              : daysUntilExpiry <= 3
              ? 'bg-yellow-500/20 border border-yellow-500/30'
              : 'bg-green-500/20 border border-green-500/30'
          }`}>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className={`text-lg font-bold ${
              !isSubscriptionActive
                ? 'text-red-400'
                : daysUntilExpiry <= 3
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}>
              {!isSubscriptionActive ? 'INATIVA' : 'ATIVA'}
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        {isSubscriptionActive && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Tempo restante</span>
              </div>
              <span className="text-xs font-semibold text-white">
                {daysUntilExpiry} de 30 dias
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  daysUntilExpiry <= 3
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : daysUntilExpiry <= 7
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-cyan-500'
                }`}
                style={{ width: `${(daysUntilExpiry / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Data de Expiração */}
        {isSubscriptionActive && (
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Data de Expiração:</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {new Date(subscriptionExpiry * 1000).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Botão de Renovação */}
        {(!isSubscriptionActive || daysUntilExpiry <= 7) && internalBalance >= parseFloat(subscriptionFee ?? '0') && (
          <div className="mt-4">
            <button
              onClick={handleActivateWithBalance}
              disabled={isActivatingBalance || circuitBreakerActive}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-xl flex items-center justify-center gap-3 ${
                !isSubscriptionActive
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-500/30'
                  : 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 shadow-green-500/30'
              }`}
            >
              <Zap className="w-5 h-5" />
              {isActivatingBalance
                ? 'Renovando LAI...'
                : !isSubscriptionActive
                ? `🚨 ATIVAR LAI AGORA - $${subscriptionFee ?? '19'}`
                : `🔄 RENOVAR LAI - $${subscriptionFee ?? '19'}`
              }
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Será debitado do seu saldo interno (${internalBalance.toFixed(2)} disponível)
            </p>
          </div>
        )}

        {/* Aviso se não tiver saldo */}
        {(!isSubscriptionActive || daysUntilExpiry <= 7) && internalBalance < parseFloat(subscriptionFee ?? '0') && (
          <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-300 mb-1">
                  Saldo insuficiente para renovar
                </p>
                <p className="text-xs text-gray-300">
                  Você precisa de <strong>${subscriptionFee ?? '19'}</strong> mas tem apenas <strong>${internalBalance.toFixed(2)}</strong> de saldo interno.
                  Gere mais volume ou deposite USDT para renovar sua LAI.
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Ativar Membros da Rede */}
      <GlassCard className="h-full flex flex-col p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Ativar Membros da Rede</h3>
            <p className="text-sm text-gray-400">
              Ative assinaturas para sua rede (até 10 níveis)
            </p>
          </div>
          <Users className="w-6 h-6 text-purple-400 flex-shrink-0" />
        </div>

        {/* Espaçador para alinhar o botão */}
        <div className="flex-1" />

        <button
          onClick={() => setShowInactiveUsers(!showInactiveUsers)}
          disabled={loadingInactive}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] shadow-lg shadow-purple-500/20"
        >
          {loadingInactive ? 'Carregando...' : (showInactiveUsers ? 'Ocultar Lista' : 'Ver Membros Inativos')}
        </button>

        {showInactiveUsers && inactiveUsers.length > 0 && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {inactiveUsers.map((user: any) => (
              <div key={user.walletAddress} className="bg-white/5 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-white/10 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono truncate">
                    {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Nível {user.level} • {user.daysInactive} dias inativo
                  </p>
                </div>
                <button
                  onClick={() => handleActivateNetworkUser(user.walletAddress)}
                  disabled={activatingUser === user.walletAddress || internalBalance < parseFloat(subscriptionFee ?? '0')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {activatingUser === user.walletAddress ? '...' : 'Ativar'}
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
      </GlassCard>
      </div>
      {/* Fim Grid Inteligente: LAI + Ativar Membros */}

      {/* Renovar Assinatura */}
      {internalBalance >= parseFloat(subscriptionFee ?? '0') && (
        <GlassCard className="p-5 border-green-500/20">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Renovar Assinatura</h3>
              <p className="text-sm text-gray-400">
                Use seu saldo interno de ${internalBalance.toFixed(2)} para renovar por ${subscriptionFee ?? '19'}
              </p>
            </div>
            <Zap className="w-6 h-6 text-green-400 flex-shrink-0" />
          </div>

          <button
            onClick={handleActivateWithBalance}
            disabled={isActivatingBalance || circuitBreakerActive}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-lg shadow-green-500/20"
          >
            {isActivatingBalance ? 'Renovando...' : 'Renovar Agora'}
          </button>
        </GlassCard>
      )}

      {/* Qualificação de Níveis */}
      <GlassCard className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Qualificação de Níveis</h3>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400">
              Acompanhe seu progresso nos 10 níveis MLM
            </p>
          </div>
        </div>

        {/* Nível Atual - Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Seu Nível Atual</p>
            <p className="text-lg font-bold text-white">{maxLevel} de 10</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(maxLevel / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{Math.round((maxLevel / 10) * 100)}% completo</p>
        </div>

        {/* Próximo Nível */}
        {maxLevel < 10 && (
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-white font-semibold">Próximo Nível: {maxLevel + 1}</h4>
              {canUnlock ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-400" />
              )}
            </div>

            {/* Requisito: Diretos Ativos */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Diretos Ativos</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {activeDirectsCount || 0}/{eligibility?.requirements?.directs?.required || 5}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (activeDirectsCount || 0) >= (eligibility?.requirements?.directs?.required || 5)
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(((activeDirectsCount || 0) / (eligibility?.requirements?.directs?.required || 5)) * 100, 100)}%`
                  }}
                />
              </div>
              {(activeDirectsCount || 0) >= (eligibility?.requirements?.directs?.required || 5) ? (
                <p className="text-xs text-green-400 mt-1">✓ Completo!</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Faltam {(eligibility?.requirements?.directs?.required || 5) - (activeDirectsCount || 0)} diretos
                </p>
              )}
            </div>

            {/* Requisito: Volume Mensal */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Volume Mensal</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  ${combinedVolume.toFixed(0)}/${eligibility?.requirements?.volume?.required?.toLocaleString() || '5,000'}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    combinedVolume >= (eligibility?.requirements?.volume?.required || 5000)
                      ? 'bg-green-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((combinedVolume / (eligibility?.requirements?.volume?.required || 5000)) * 100, 100)}%`
                  }}
                />
              </div>
              {combinedVolume >= (eligibility?.requirements?.volume?.required || 5000) ? (
                <p className="text-xs text-green-400 mt-1">✓ Completo!</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Faltam ${((eligibility?.requirements?.volume?.required || 5000) - combinedVolume).toFixed(2)}
                </p>
              )}
            </div>

            {/* Mensagem de Qualificação */}
            {canUnlock && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                <p className="text-green-300 text-sm font-medium text-center">
                  ✅ Você qualificou para o Nível {maxLevel + 1}!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Nível Máximo Alcançado */}
        {maxLevel === 10 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <Award className="w-12 h-12 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-bold text-lg mb-1">🎉 Parabéns!</p>
            <p className="text-gray-300 text-sm">
              Você alcançou o nível máximo (10/10)
            </p>
          </div>
        )}

        {/* Botão Ver Todos os Níveis */}
        <button
          onClick={() => setShowAllLevels(!showAllLevels)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white"
        >
          <span className="text-sm font-medium">
            {showAllLevels ? 'Ocultar' : 'Ver'} Todos os Níveis
          </span>
          {showAllLevels ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Lista de Todos os Níveis (Expansível) */}
        {showAllLevels && (
          <div className="mt-4 space-y-2">
            {[...Array(10)].map((_, index) => {
              const level = 10 - index // Inverter ordem (10 -> 1)
              const isCurrentLevel = level === maxLevel
              const isUnlocked = level <= maxLevel
              const isNext = level === maxLevel + 1

              return (
                <div
                  key={level}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrentLevel
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : isNext
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : isUnlocked
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        isCurrentLevel
                          ? 'bg-purple-500 text-white'
                          : isUnlocked
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {level}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${
                          isCurrentLevel
                            ? 'text-purple-300'
                            : isUnlocked
                            ? 'text-green-300'
                            : 'text-gray-400'
                        }`}>
                          Nível {level}
                          {isCurrentLevel && ' (Você está aqui)'}
                          {isNext && ' (Próximo)'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isUnlocked ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : isNext ? (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Navegação Rápida */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassCard
          hover
          className="p-4 cursor-pointer group"
          onClick={() => router.push('/network')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Minha Rede</h3>
          <p className="text-gray-400 text-xs mb-2">{maxLevel} níveis ativos</p>
          <p className="text-gray-300 text-xs">
            {directReferrals} diretos • {totalNetwork} total
          </p>
        </GlassCard>

        <GlassCard
          hover
          className="p-4 cursor-pointer group"
          onClick={() => router.push('/withdraw')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Sacar</h3>
          <p className="text-gray-400 text-xs mb-2">Saldo para carteira</p>
          <p className="text-gray-300 text-xs">
            Disponível: ${internalBalance.toFixed(2)}
          </p>
        </GlassCard>

        <GlassCard
          hover
          className="p-4 cursor-pointer group"
          onClick={() => router.push('/gmi-hedge')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">GMI Edge</h3>
          <p className="text-gray-400 text-xs mb-2">The Edge Platform</p>
          <p className="text-gray-300 text-xs">
            Trading automático
          </p>
        </GlassCard>

        <GlassCard
          hover
          className="p-4 cursor-pointer group"
          onClick={() => router.push('/transparency')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">Transparência</h3>
          <p className="text-gray-400 text-xs mb-2">Provas on-chain</p>
          <p className="text-gray-300 text-xs">
            100% auditável
          </p>
        </GlassCard>
      </div>

      {/* Saúde do Sistema */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-white mb-4">Saúde do Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-2">Solvência</p>
            <p className={`text-3xl font-bold mb-1 ${isSystemHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {solvencyRatio ?? 0}%
            </p>
            <p className="text-xs text-gray-500">
              {isSystemHealthy ? '✅ Sistema saudável' : '⚠️ Abaixo do mínimo'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-2">Circuit Breaker</p>
            <p className={`text-3xl font-bold mb-1 ${circuitBreakerActive ? 'text-red-400' : 'text-green-400'}`}>
              {circuitBreakerActive ? 'Ativo' : 'OK'}
            </p>
            <p className="text-xs text-gray-500">
              {circuitBreakerActive ? '🔒 Saques pausados' : '✅ Sistema normal'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-2">Contrato</p>
            <p className="text-sm font-mono text-white mb-2">
              {CONTRACT_ADDRESS?.slice(0, 8)}...{CONTRACT_ADDRESS?.slice(-6)}
            </p>
            <a
              href={`https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-all inline-flex items-center gap-1"
            >
              Ver no BSCScan
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </GlassCard>
    </PageLayout>
  )
}
