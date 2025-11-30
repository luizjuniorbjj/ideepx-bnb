'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@/components/ConnectButton'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  useUserView,
  useSolvencyRatio,
  useCircuitBreakerActive,
  useSubscriptionFee,
  useActivateSubscriptionWithUSDT,
  useActivateSubscriptionWithBalance,
  useWithdraw
} from '@/hooks/useContractV10'
// Hook antigo (4 requisições separadas) - COMENTADO
// import {
//   useUserData,
//   useUserMlmStats,
//   useUserEligibility,
//   useUserReferrals
// } from '@/hooks/useUserData'

// ✅ Hook NOVO OTIMIZADO (1 requisição apenas!)
import { useCompleteUserData } from '@/hooks/useCompleteUserData'
import { CONTRACT_ADDRESS } from '@/config/contracts'
import api from '@/lib/api'
import { formatUnits, parseUnits } from 'viem'
import {
  Wallet, TrendingUp, Users, Calendar, ArrowUpRight,
  CheckCircle, XCircle, Lock, Unlock, DollarSign, Network,
  Link as LinkIcon, Activity, Shield
} from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/Logo'
import ActivateSubscriptionSection from '@/components/ActivateSubscriptionSection'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { authenticated, signIn, loading: authLoading } = useAuth()

  // Dados do usuário on-chain
  const { data: userData, refetch: refetchUser } = useUserView(address)
  const { data: solvencyRatio } = useSolvencyRatio()
  const { data: circuitBreakerActive } = useCircuitBreakerActive()
  const { data: subscriptionFee } = useSubscriptionFee()

  // ✅ DADOS DO BACKEND - HOOK OTIMIZADO (1 requisição em vez de 4!)
  const {
    userData: backendData,
    mlmStats,
    eligibility,
    referrals,
    loading: loadingUser,
    refetch: refetchBackend,
    // Valores já calculados (para facilitar)
    isActive: backendIsActive,
    maxLevel: backendMaxLevel,
    internalBalance: backendInternalBalance,
    monthlyVolume: backendMonthlyVolume,
    totalEarned: backendTotalEarned,
    hasAccountHash: backendHasAccountHash,
    totalCommissions: backendTotalCommissions,
    directReferrals: backendDirectReferrals,
    canUnlock: backendCanUnlock,
    activeDirectsCount: backendActiveDirectsCount,
    combinedVolume: backendCombinedVolume
  } = useCompleteUserData()

  // Ações do contrato
  const {
    activate: activateWithUSDT,
    isPending: isActivating,
    isConfirmed: activateSuccess
  } = useActivateSubscriptionWithUSDT()

  const {
    activate: activateWithBalance,
    isPending: isActivatingBalance
  } = useActivateSubscriptionWithBalance()

  // Estados locais
  const [gmiAccount, setGmiAccount] = useState('')
  const [gmiServer, setGmiServer] = useState('real')
  const [gmiPlatform, setGmiPlatform] = useState('MT5')
  const [showLinkGMI, setShowLinkGMI] = useState(false)
  const [loading, setLoading] = useState(false)

  // Estados para ativação de rede
  const [inactiveUsers, setInactiveUsers] = useState<any[]>([])
  const [loadingInactive, setLoadingInactive] = useState(false)
  const [showActivateNetwork, setShowActivateNetwork] = useState(false)
  const [activatingUser, setActivatingUser] = useState<string | null>(null)


  // Redirecionar se não conectado (exceto em modo E2E)
  useEffect(() => {
    const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
    if (!isConnected && !isE2ETesting) {
      router.push('/')
    }
  }, [isConnected, router])

  // Atualizar dados após ativação
  useEffect(() => {
    if (activateSuccess) {
      toast.success('Assinatura ativada com sucesso!')
      refetchUser()
    }
  }, [activateSuccess])

  const handleSignIn = async () => {
    try {
      await signIn()
      toast.success('Autenticado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao autenticar: ' + error.message)
    }
  }

  const handleLinkGMI = async () => {
    if (!gmiAccount) {
      toast.error('Informe o número da conta GMI')
      return
    }

    try {
      setLoading(true)
      await api.linkGmiAccount(gmiAccount, gmiServer, gmiPlatform)
      toast.success(`Conta ${gmiPlatform} vinculada com sucesso!`)
      setShowLinkGMI(false)
      setGmiAccount('')
      refetchUser()
      refetchBackend()
      // Dados serão recarregados automaticamente pelos hooks
    } catch (error: any) {
      toast.error('Erro ao vincular conta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateSubscription = async () => {
    try {
      if (!activateWithUSDT) {
        toast.error('Função não disponível')
        return
      }
      await activateWithUSDT()
    } catch (error: any) {
      toast.error('Erro ao ativar assinatura: ' + error.message)
    }
  }

  const handleActivateWithBalance = async () => {
    try {
      if (!activateWithBalance) {
        toast.error('Função não disponível')
        return
      }
      await activateWithBalance()
    } catch (error: any) {
      toast.error('Erro ao ativar: ' + error.message)
    }
  }

  // Callback para quando uma ativação for bem sucedida
  const handleActivateSuccess = () => {
    // Refetch dados do backend
    if (refetchBackend) {
      refetchBackend()
    }
    // Refetch dados on-chain em produção
    if (process.env.NODE_ENV === 'production' && refetchUser) {
      refetchUser()
    }
  }

  // Não renderizar se não conectado (exceto em modo E2E)
  const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
  if (!isConnected && !isE2ETesting) {
    return null
  }

  // Em dev mode, esperar dados do backend antes de renderizar
  if (process.env.NODE_ENV === 'development' && loadingUser && !backendData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">
          🔄 Carregando dados do backend...
        </div>
      </div>
    )
  }

  // Extrair dados (prioriza backendData em dev, userData em produção)
  const isDev = process.env.NODE_ENV === 'development'
  const sourceData = isDev
    ? (backendData || userData)  // Dev: prioriza backend
    : (userData || backendData)  // Prod: prioriza on-chain

  const isActive = sourceData?.active ?? false
  const maxLevel = sourceData?.maxLevel ?? 0
  const monthlyVolume = parseFloat(sourceData?.monthlyVolume ?? '0')
  const internalBalance = parseFloat(sourceData?.internalBalance ?? '0')
  const subscriptionExpiry = sourceData?.subscriptionExpiry ?? 0
  const withdrawnThisMonth = parseFloat(sourceData?.withdrawnThisMonth ?? '0')
  const hasAccountHash = sourceData?.accountHash && sourceData.accountHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  const totalEarned = parseFloat(sourceData?.totalEarned ?? '0')
  const totalVolume = parseFloat(sourceData?.totalVolume ?? '0')

  // Calcular dias até expirar
  const now = Math.floor(Date.now() / 1000)
  const daysUntilExpiry = subscriptionExpiry > now ? Math.floor((subscriptionExpiry - now) / 86400) : 0
  const isSubscriptionActive = subscriptionExpiry > now

  // Estatísticas MLM do backend (já vem do hook otimizado)
  const totalCommissions = backendTotalCommissions
  const directReferrals = backendDirectReferrals
  const totalNetwork = mlmStats?.totalNetwork ?? 0

  // Elegibilidade para níveis 6-10 (já vem do hook otimizado)
  const canUnlock = backendCanUnlock
  const recommendedMaxLevel = eligibility?.recommendedMaxLevel ?? 5
  const activeDirectsCount = backendActiveDirectsCount
  const combinedVolume = backendCombinedVolume

  const isSystemHealthy = (solvencyRatio ?? 0) >= 110

  // Verificar se o usuário é admin
  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',').map(w => w.toLowerCase()) || [
    '0xeb2451a8dd58734134dd7bde64a5f86725b75ef2', // Backend Wallet (Admin Principal)
    '0x742d35cc6634c0532925a3b844bc9e7595f0beb'
  ];
  const isAdmin = address ? adminWallets.includes(address.toLowerCase()) : false;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url('/images/home_site.png')`
      }}
    >
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" href="/dashboard" />
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Alerta: Circuit Breaker */}
        {circuitBreakerActive && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <p className="text-red-400 font-bold">⚠️ Sistema em modo segurança - Saques temporariamente pausados</p>
          </div>
        )}

        {/* Alerta: Não autenticado (apenas em produção) */}
        {!authenticated && process.env.NODE_ENV === 'production' && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 font-bold">🔐 Autenticação necessária</p>
                <p className="text-yellow-200 text-sm mt-1">
                  Faça login com sua carteira para acessar dados completos e funcionalidades MLM
                </p>
              </div>
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {authLoading ? 'Carregando...' : 'Fazer Login'}
              </button>
            </div>
          </div>
        )}

        {/* Alerta: Conta GMI não vinculada */}
        {authenticated && !hasAccountHash && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 font-bold">🔗 Vincule sua conta GMI</p>
                <p className="text-blue-200 text-sm mt-1">
                  Vincule sua conta de trading para começar a receber comissões
                </p>
              </div>
              <button
                onClick={() => setShowLinkGMI(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition"
              >
                Vincular Agora
              </button>
            </div>
          </div>
        )}

        {/* Modal: Link GMI */}
        {showLinkGMI && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Vincular Conta GMI</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Número da Conta GMI
                  </label>
                  <input
                    type="text"
                    value={gmiAccount}
                    onChange={(e) => setGmiAccount(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={gmiServer}
                    onChange={(e) => setGmiServer(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="real">Real (Produção)</option>
                    <option value="demo">Demo (Teste)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Plataforma
                  </label>
                  <select
                    value={gmiPlatform}
                    onChange={(e) => setGmiPlatform(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MT5">MetaTrader 5</option>
                    <option value="MT4">MetaTrader 4</option>
                  </select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                  <p className="text-yellow-300 text-xs">
                    ⚠️ Certifique-se de informar o número correto. Esta informação será criptografada e usada para calcular suas comissões MLM.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleLinkGMI}
                    disabled={loading || !gmiAccount}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Vinculando...' : 'Confirmar'}
                  </button>

                  <button
                    onClick={() => {
                      setShowLinkGMI(false)
                      setGmiAccount('')
                    }}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Saldo Interno */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-6 h-6 text-blue-400" />
              {isSubscriptionActive ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">Saldo Interno</p>
            <p className="text-3xl font-bold text-white">${internalBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Sacado este mês: ${withdrawnThisMonth.toFixed(2)}
            </p>
          </div>

          {/* Volume Mensal */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Volume Mensal</p>
            <p className="text-3xl font-bold text-white">${monthlyVolume.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Comissões: ${totalCommissions.toFixed(2)}
            </p>
          </div>

          {/* Assinatura */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Status Assinatura</p>
            <p className="text-2xl font-bold text-white">
              {isSubscriptionActive ? 'Ativa' : 'Inativa'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isSubscriptionActive
                ? `${daysUntilExpiry} dias restantes`
                : 'Não ativa'
              }
            </p>
          </div>

          {/* Níveis MLM */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              {maxLevel >= 10 ? (
                <Unlock className="w-6 h-6 text-cyan-400" />
              ) : (
                <Lock className="w-6 h-6 text-orange-400" />
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">Níveis Desbloqueados</p>
            <p className="text-3xl font-bold text-white">{maxLevel}/10</p>
            <p className="text-xs text-gray-500 mt-1">
              {maxLevel < 10 ? `Faltam ${10 - maxLevel} níveis` : 'Todos desbloqueados'}
            </p>
          </div>
        </div>

        {/* Seção Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Card: Ativar Assinatura */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Assinatura Mensal</h2>

            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-300 text-sm">
                  💰 Valor: ${subscriptionFee ?? '19.00'} USDT
                </p>
                <p className="text-purple-300 text-sm">
                  📅 Duração: 30 dias
                </p>
                <p className="text-purple-300 text-sm">
                  🎯 Status: {isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>

              {!isSubscriptionActive ? (
                <div className="space-y-3">
                  <button
                    onClick={handleActivateSubscription}
                    disabled={isActivating || circuitBreakerActive}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActivating ? 'Ativando...' : `Ativar com USDT ($${subscriptionFee ?? '19'})`}
                  </button>

                  {internalBalance >= parseFloat(subscriptionFee ?? '0') && (
                    <button
                      onClick={handleActivateWithBalance}
                      disabled={isActivatingBalance || circuitBreakerActive}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isActivatingBalance ? 'Ativando...' : 'Ativar com Saldo Interno'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-300 text-center">
                    ✅ Assinatura ativa por mais {daysUntilExpiry} dias
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card: Unlock Níveis */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Desbloquear Níveis 6-10</h2>

            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-cyan-300 text-sm">
                  👥 Diretos ativos: {activeDirectsCount}/5
                </p>
                <p className="text-cyan-300 text-sm">
                  💵 Volume combinado: ${combinedVolume.toFixed(2)}/$5,000
                </p>
                <p className="text-cyan-300 text-sm">
                  🎯 Nível recomendado: {recommendedMaxLevel}
                </p>
              </div>

              {maxLevel >= 10 ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-300 text-center">
                    🎉 Todos os níveis desbloqueados!
                  </p>
                </div>
              ) : canUnlock ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-300 text-center text-sm">
                    ✅ Você qualificou! Entre em contato com o suporte para desbloquear níveis 6-10.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                  <p className="text-gray-300 text-center text-sm">
                    Continue trabalhando! Você precisa de 5 indicações diretas ativas e $5,000 de volume combinado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Ativação de Assinaturas com Saldo Interno */}
        <div className="mb-8">
          <ActivateSubscriptionSection
            internalBalance={internalBalance}
            isSubscriptionActive={isSubscriptionActive}
            onActivateSuccess={handleActivateSuccess}
          />
        </div>

        {/* Navegação Rápida */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isAdmin ? '4' : '4'} gap-4 mb-8`}>
          <button
            onClick={() => router.push('/network')}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition text-left"
          >
            <Network className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Minha Rede MLM</h3>
            <p className="text-gray-400 text-sm">Visualize sua rede de {maxLevel} níveis</p>
            <p className="text-gray-300 text-sm mt-1">
              {directReferrals} diretos • {totalNetwork} total
            </p>
          </button>

          <button
            onClick={() => router.push('/withdraw')}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition text-left"
          >
            <DollarSign className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Sacar</h3>
            <p className="text-gray-400 text-sm">Sacar saldo interno para carteira</p>
            <p className="text-gray-300 text-sm mt-1">
              Disponível: ${internalBalance.toFixed(2)}
            </p>
          </button>

          <button
            onClick={() => router.push('/gmi-hedge')}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition text-left"
          >
            <Activity className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">GMI Edge</h3>
            <p className="text-gray-400 text-sm">Dados The Edge Platform</p>
            <p className="text-gray-300 text-sm mt-1">
              Ver estatísticas e desempenho
            </p>
          </button>

          <button
            onClick={() => router.push('/transparency')}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition text-left"
          >
            <Shield className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Transparência</h3>
            <p className="text-gray-400 text-sm">Provas on-chain + IPFS</p>
            <p className="text-gray-300 text-sm mt-1">
              Sistema 100% auditável
            </p>
          </button>

          {/* Botão Admin - Apenas para administradores */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition text-left"
            >
              <Users className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Admin</h3>
              <p className="text-gray-400 text-sm">Painel administrativo</p>
              <p className="text-gray-300 text-sm mt-1">
                Solvência: {solvencyRatio ?? 0}%
              </p>
            </button>
          )}
        </div>

        {/* Sistema Health */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Saúde do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Solvência</p>
              <p className={`text-2xl font-bold ${isSystemHealthy ? 'text-green-400' : 'text-red-400'}`}>
                {solvencyRatio ?? 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isSystemHealthy ? 'Sistema saudável' : 'Abaixo do mínimo'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Circuit Breaker</p>
              <p className={`text-2xl font-bold ${circuitBreakerActive ? 'text-red-400' : 'text-green-400'}`}>
                {circuitBreakerActive ? 'Ativo' : 'Inativo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {circuitBreakerActive ? 'Saques pausados' : 'Sistema normal'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Contrato</p>
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
