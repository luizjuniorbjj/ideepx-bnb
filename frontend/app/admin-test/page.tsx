'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@/components/ConnectButton'
import {
  Shield, AlertTriangle, Users, DollarSign, Settings,
  Power, RefreshCw, Wallet, TrendingUp, UserX, Search,
  Calendar, Activity, Award, ChevronDown, ChevronUp
} from 'lucide-react'
import { isAddress } from 'viem'
import {
  useSystemStats,
  useIsBetaMode,
  useIsPaused,
  useTotalMLMDistributed,
  useTotalWithdrawn,
  useActiveMLMPercentages,
  useLiquidityPool,
  useInfrastructureWallet,
  useCompanyWallet,
  useGetUserInfo,
  useGetQuickStats,
  useGetEarningHistory,
  useGetUpline,
  useIsSubscriptionActive,
  useIsUserPaused,
  useUSDTBalance,
} from '@/hooks/useContract'
import {
  useBatchProcessPerformanceFees,
  useToggleBetaMode,
  usePause,
  useUnpause,
  usePauseUser,
  useUnpauseUser,
  useDeactivateSubscription,
  useUpdateWallets,
  useExpireSubscriptions,
} from '@/hooks/useAdmin'
import { formatUSDT, MAX_BATCH_SIZE, basisPointsToPercent } from '@/config/contracts'
import { toast } from 'sonner'
import { Address } from 'viem'

export default function AdminTestPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  // Manual owner address (TEMPORÁRIO - até resolver o problema)
  const [manualOwner, setManualOwner] = useState('')
  const [ownerConfirmed, setOwnerConfirmed] = useState(false)

  // Dados do sistema
  const { data: systemStats } = useSystemStats()
  const { data: isBetaMode } = useIsBetaMode()
  const { data: isPaused } = useIsPaused()
  const { data: totalMLMDistributed } = useTotalMLMDistributed()
  const { data: totalWithdrawn } = useTotalWithdrawn()
  const { data: mlmPercentages } = useActiveMLMPercentages()
  const { data: liquidityPool } = useLiquidityPool()
  const { data: infrastructureWallet } = useInfrastructureWallet()
  const { data: companyWallet } = useCompanyWallet()

  // Hooks de ações
  const { batchProcess, isPending: isBatchProcessing } = useBatchProcessPerformanceFees()
  const { toggle: toggleBeta, isPending: isTogglingBeta } = useToggleBetaMode()
  const { pause: pauseSystem, isPending: isPausingSystem } = usePause()
  const { unpause: unpauseSystem, isPending: isUnpausingSystem } = useUnpause()
  const { pauseUser, isPending: isPausingUser } = usePauseUser()
  const { unpauseUser, isPending: isUnpausingUser } = useUnpauseUser()
  const { deactivate, isPending: isDeactivating } = useDeactivateSubscription()
  const { updateWallets, isPending: isUpdatingWallets } = useUpdateWallets()
  const { expireSubscriptions, isPending: isExpiring } = useExpireSubscriptions()

  // Estados locais - Batch Processing
  const [showBatchProcessor, setShowBatchProcessor] = useState(false)
  const [batchClients, setBatchClients] = useState('')
  const [batchAmounts, setBatchAmounts] = useState('')

  // Estados locais - User Management
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [targetUser, setTargetUser] = useState('')

  // Estados locais - Wallet Update
  const [showWalletUpdate, setShowWalletUpdate] = useState(false)
  const [newLiquidityPool, setNewLiquidityPool] = useState('')
  const [newInfrastructureWallet, setNewInfrastructureWallet] = useState('')
  const [newCompanyWallet, setNewCompanyWallet] = useState('')

  // Estados locais - Expire Subscriptions
  const [showExpireSubscriptions, setShowExpireSubscriptions] = useState(false)
  const [expireAddresses, setExpireAddresses] = useState('')

  // Estados locais - User Search
  const [searchAddress, setSearchAddress] = useState('')
  const [searchedAddress, setSearchedAddress] = useState<Address | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  // Buscar dados do usuário pesquisado
  const { data: searchedUserInfo } = useGetUserInfo(searchedAddress ?? undefined)
  const { data: searchedQuickStats } = useGetQuickStats(searchedAddress ?? undefined)
  const { data: searchedEarningHistory } = useGetEarningHistory(searchedAddress ?? undefined, 20)
  const { data: searchedUpline } = useGetUpline(searchedAddress ?? undefined)
  const { data: searchedIsActive } = useIsSubscriptionActive(searchedAddress ?? undefined)
  const { data: searchedIsPaused } = useIsUserPaused(searchedAddress ?? undefined)

  // Saldos dos pools
  const { data: liquidityPoolBalance } = useUSDTBalance(liquidityPool as Address)
  const { data: infrastructureBalance } = useUSDTBalance(infrastructureWallet as Address)
  const { data: companyBalance } = useUSDTBalance(companyWallet as Address)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Painel Admin (Modo Teste)</h1>
          <p className="text-gray-400 mb-6">
            Conecte sua carteira para acessar.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  // Se não confirmou o owner ainda
  if (!ownerConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 max-w-2xl">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4 text-center">⚠️ Modo Teste Admin</h1>

          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <p className="text-gray-300 mb-4">
              A função <code className="text-red-400">owner()</code> do contrato está revertendo.
            </p>
            <p className="text-gray-300 mb-4">
              Para acessar o painel admin temporariamente, você precisa <strong>confirmar manualmente</strong> o endereço do owner.
            </p>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">
                1. Abra o BSCScan e encontre o owner:
              </label>
              <a
                href="https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54#readContract"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm"
              >
                Ver Contrato no BSCScan →
              </a>
            </div>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">
                2. Cole o endereço do owner aqui:
              </label>
              <input
                type="text"
                value={manualOwner}
                onChange={(e) => setManualOwner(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white font-mono"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Sua carteira conectada:</strong><br/>
                <code className="text-blue-400">{address}</code>
              </p>
            </div>

            <button
              onClick={() => {
                if (!isAddress(manualOwner)) {
                  toast.error('Endereço inválido')
                  return
                }

                if (address?.toLowerCase() !== manualOwner.toLowerCase()) {
                  toast.error('Você não é o owner! Troque para a carteira owner.')
                  return
                }

                setOwnerConfirmed(true)
                toast.success('Acesso admin confirmado!')
              }}
              disabled={!manualOwner}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition"
            >
              Confirmar e Acessar Admin
            </button>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Admin confirmado - mostrar painel completo
  const totalUsers = systemStats?.[0] ?? 0n
  const activeSubscriptions = systemStats?.[1] ?? 0n
  const mlmDistributed = totalMLMDistributed ?? 0n
  const withdrawn = totalWithdrawn ?? 0n
  const betaMode = isBetaMode ?? false
  const paused = isPaused ?? false

  // Handlers
  const handleBatchProcess = () => {
    try {
      const clientsArray = batchClients.split('\n').map(s => s.trim()).filter(s => s)
      const amountsArray = batchAmounts.split('\n').map(s => s.trim()).filter(s => s)

      if (clientsArray.length === 0 || amountsArray.length === 0) {
        toast.error('Informe clientes e valores')
        return
      }

      if (clientsArray.length !== amountsArray.length) {
        toast.error('Número de clientes e valores deve ser igual')
        return
      }

      if (clientsArray.length > MAX_BATCH_SIZE) {
        toast.error(`Máximo de ${MAX_BATCH_SIZE} clientes por lote`)
        return
      }

      const clients = clientsArray as Address[]
      const amounts = amountsArray.map(a => BigInt(Math.floor(parseFloat(a) * 1e18)))

      batchProcess(clients, amounts)
      toast.success('Processando performance fees...')
      setBatchClients('')
      setBatchAmounts('')
      setShowBatchProcessor(false)
    } catch (error) {
      toast.error('Erro ao processar: ' + (error as Error).message)
    }
  }

  const handleToggleBeta = () => {
    toggleBeta()
    toast.success(betaMode ? 'Mudando para modo Permanente...' : 'Mudando para modo Beta...')
  }

  const handlePauseSystem = () => {
    if (paused) {
      unpauseSystem()
      toast.success('Despausando sistema...')
    } else {
      pauseSystem()
      toast.success('Pausando sistema...')
    }
  }

  const handlePauseUser = () => {
    if (!targetUser) {
      toast.error('Informe o endereço do usuário')
      return
    }
    pauseUser(targetUser as Address)
    toast.success('Pausando usuário...')
    setTargetUser('')
  }

  const handleUnpauseUser = () => {
    if (!targetUser) {
      toast.error('Informe o endereço do usuário')
      return
    }
    unpauseUser(targetUser as Address)
    toast.success('Despausando usuário...')
    setTargetUser('')
  }

  const handleDeactivateSubscription = () => {
    if (!targetUser) {
      toast.error('Informe o endereço do usuário')
      return
    }
    deactivate(targetUser as Address)
    toast.success('Desativando assinatura...')
    setTargetUser('')
  }

  const handleUpdateWallets = () => {
    if (!newLiquidityPool || !newInfrastructureWallet || !newCompanyWallet) {
      toast.error('Informe todos os endereços')
      return
    }
    updateWallets(
      newLiquidityPool as Address,
      newInfrastructureWallet as Address,
      newCompanyWallet as Address
    )
    toast.success('Atualizando carteiras...')
    setShowWalletUpdate(false)
  }

  const handleExpireSubscriptions = () => {
    try {
      const addressesArray = expireAddresses.split('\n').map(s => s.trim()).filter(s => s)

      if (addressesArray.length === 0) {
        toast.error('Informe pelo menos um endereço')
        return
      }

      const addresses = addressesArray as Address[]

      expireSubscriptions(addresses)
      toast.success(`Expirando ${addresses.length} assinaturas...`)
      setExpireAddresses('')
      setShowExpireSubscriptions(false)
    } catch (error) {
      toast.error('Erro ao expirar: ' + (error as Error).message)
    }
  }

  const handleSearchUser = () => {
    if (!searchAddress) {
      toast.error('Informe o endereço do usuário')
      return
    }

    if (!isAddress(searchAddress)) {
      toast.error('Endereço inválido')
      return
    }

    setSearchedAddress(searchAddress as Address)
    setShowUserDetails(true)
    toast.success('Buscando dados do usuário...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Admin Panel (Modo Teste)
              </h1>
              <p className="text-xs text-yellow-400">⚠️ Função owner() não disponível - Acesso manual</p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alertas */}
        {paused && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-white font-bold">⚠️ Sistema Pausado</p>
                <p className="text-sm text-gray-400">
                  Todas as operações estão bloqueadas (exceto saques).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Total de Usuários</p>
            <p className="text-3xl font-bold text-white">{totalUsers.toString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {activeSubscriptions.toString()} assinaturas ativas
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">MLM Distribuído</p>
            <p className="text-3xl font-bold text-white">${formatUSDT(mlmDistributed)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
            <DollarSign className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Total Sacado</p>
            <p className="text-3xl font-bold text-white">${formatUSDT(withdrawn)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6">
            <Settings className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Modo Atual</p>
            <p className="text-3xl font-bold text-white">{betaMode ? 'Beta' : 'Permanente'}</p>
          </div>
        </div>

        {/* Percentuais MLM Ativos */}
        {mlmPercentages && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              📊 Percentuais MLM - {betaMode ? 'Modo Beta (20.5%)' : 'Modo Permanente (14.5%)'}
            </h2>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {(mlmPercentages as readonly bigint[]).map((percentage, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">L{index + 1}</p>
                  <p className="text-lg font-bold text-white">
                    {basisPointsToPercent(Number(percentage))}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info dos Pools */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">💰 Carteiras dos Pools de Distribuição</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Liquidity Pool */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-gray-400">Liquidity Pool (5%)</p>
              </div>
              <p className="text-xs text-gray-500 font-mono mb-2 break-all">
                {liquidityPool ? (liquidityPool as string) : 'Carregando...'}
              </p>
              <p className="text-lg font-bold text-white">
                {liquidityPoolBalance ? `${formatUSDT(liquidityPoolBalance)} USDT` : 'Carregando...'}
              </p>
            </div>

            {/* Infrastructure Wallet */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-gray-400">Infrastructure (12%)</p>
              </div>
              <p className="text-xs text-gray-500 font-mono mb-2 break-all">
                {infrastructureWallet ? (infrastructureWallet as string) : 'Carregando...'}
              </p>
              <p className="text-lg font-bold text-white">
                {infrastructureBalance ? `${formatUSDT(infrastructureBalance)} USDT` : 'Carregando...'}
              </p>
            </div>

            {/* Company Wallet */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-sm text-gray-400">Company (23%)</p>
              </div>
              <p className="text-xs text-gray-500 font-mono mb-2 break-all">
                {companyWallet ? (companyWallet as string) : 'Carregando...'}
              </p>
              <p className="text-lg font-bold text-white">
                {companyBalance ? `${formatUSDT(companyBalance)} USDT` : 'Carregando...'}
              </p>
            </div>
          </div>
        </div>

        {/* Buscar Usuário */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            🔍 Buscar Usuário
          </h2>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Digite o endereço do usuário (0x...)"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={handleSearchUser}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition"
            >
              Buscar
            </button>
          </div>

          {/* Detalhes do Usuário */}
          {showUserDetails && searchedAddress && (
            <div className="space-y-4">
              {/* Info Básica */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">📋 Informações do Usuário</h3>
                  <button
                    onClick={() => {
                      setShowUserDetails(false)
                      setSearchedAddress(null)
                      setSearchAddress('')
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Endereço:</p>
                    <p className="text-white font-mono text-sm">{searchedAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status Assinatura:</p>
                    <p className={`font-bold ${searchedIsActive ? 'text-green-400' : 'text-red-400'}`}>
                      {searchedIsActive ? '✅ ATIVA' : '❌ INATIVA'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status Usuário:</p>
                    <p className={`font-bold ${searchedIsPaused ? 'text-red-400' : 'text-green-400'}`}>
                      {searchedIsPaused ? '🚫 PAUSADO' : '✅ ATIVO'}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                {searchedQuickStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Ganhos Totais</p>
                      <p className="text-lg font-bold text-green-400">
                        ${formatUSDT((searchedQuickStats as any)[0] || 0n)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Já Sacou</p>
                      <p className="text-lg font-bold text-purple-400">
                        ${formatUSDT((searchedQuickStats as any)[1] || 0n)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Saldo Disponível</p>
                      <p className="text-lg font-bold text-blue-400">
                        ${formatUSDT((searchedQuickStats as any)[2] || 0n)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Total Indicados</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {String((searchedQuickStats as any)[3] || 0)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upline */}
                {searchedUpline && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">🔗 Upline (10 níveis):</p>
                    <div className="bg-white/5 rounded-lg p-3 max-h-60 overflow-y-auto">
                      {(searchedUpline as Address[]).map((addr, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2 last:mb-0">
                          <span className="text-xs text-gray-500">L{index + 1}:</span>
                          <span className="text-xs font-mono text-gray-300">
                            {addr === '0x0000000000000000000000000000000000000000' ? '—' : addr}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Earning History */}
                {searchedEarningHistory && (searchedEarningHistory as any[]).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">💰 Histórico de Ganhos (últimos 20):</p>
                    <div className="bg-white/5 rounded-lg p-3 max-h-60 overflow-y-auto">
                      {(searchedEarningHistory as any[]).map((earning: any, index: number) => (
                        <div key={index} className="flex justify-between items-center mb-2 last:mb-0 pb-2 border-b border-gray-700 last:border-0">
                          <div>
                            <p className="text-xs text-gray-400">Nível {earning.level?.toString() || '?'}</p>
                            <p className="text-xs text-gray-500">
                              {earning.timestamp ? new Date(Number(earning.timestamp) * 1000).toLocaleDateString() : '—'}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-green-400">
                            ${formatUSDT(earning.amount || 0n)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações Admin para este usuário */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-3">⚙️ Ações Administrativas:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        pauseUser(searchedAddress)
                        toast.success('Pausando usuário...')
                      }}
                      disabled={isPausingUser}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 text-sm"
                    >
                      🚫 Pausar
                    </button>
                    <button
                      onClick={() => {
                        unpauseUser(searchedAddress)
                        toast.success('Despausando usuário...')
                      }}
                      disabled={isUnpausingUser}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 text-sm"
                    >
                      ✅ Despausar
                    </button>
                    <button
                      onClick={() => {
                        deactivate(searchedAddress)
                        toast.success('Desativando assinatura...')
                      }}
                      disabled={isDeactivating}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 text-sm"
                    >
                      ❌ Desativar Assinatura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Batch Processing */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📦 Processar Performance Fees</h2>

            {!showBatchProcessor ? (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Distribua performance fees para múltiplos clientes em uma única transação
                  (máx {MAX_BATCH_SIZE} clientes).
                </p>
                <button
                  onClick={() => setShowBatchProcessor(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition"
                >
                  Abrir Processador
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Endereços dos Clientes (um por linha)
                  </label>
                  <textarea
                    value={batchClients}
                    onChange={(e) => setBatchClients(e.target.value)}
                    placeholder="0x...&#10;0x...&#10;0x..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Valores em USDT (um por linha)
                  </label>
                  <textarea
                    value={batchAmounts}
                    onChange={(e) => setBatchAmounts(e.target.value)}
                    placeholder="100.50&#10;250.75&#10;500.00"
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                  <p className="text-yellow-300 text-xs">
                    ⚠️ IMPORTANTE: Você deve ter aprovado USDT total ANTES de processar!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBatchProcess}
                    disabled={isBatchProcessing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
                  >
                    {isBatchProcessing ? 'Processando...' : 'Processar Lote'}
                  </button>

                  <button
                    onClick={() => {
                      setShowBatchProcessor(false)
                      setBatchClients('')
                      setBatchAmounts('')
                    }}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gerenciamento de Usuários */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">👥 Gerenciar Usuários</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Endereço do Usuário
                </label>
                <input
                  type="text"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handlePauseUser}
                  disabled={isPausingUser || !targetUser}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition disabled:opacity-50"
                >
                  {isPausingUser ? 'Pausando...' : '🚫 Pausar Usuário'}
                </button>

                <button
                  onClick={handleUnpauseUser}
                  disabled={isUnpausingUser || !targetUser}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
                >
                  {isUnpausingUser ? 'Despausando...' : '✅ Despausar Usuário'}
                </button>

                <button
                  onClick={handleDeactivateSubscription}
                  disabled={isDeactivating || !targetUser}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50"
                >
                  {isDeactivating ? 'Desativando...' : '❌ Desativar Assinatura'}
                </button>

                <button
                  onClick={() => setShowExpireSubscriptions(!showExpireSubscriptions)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition"
                >
                  📅 {showExpireSubscriptions ? 'Fechar' : 'Expirar Assinaturas em Lote'}
                </button>
              </div>

              {/* Expire Subscriptions em lote */}
              {showExpireSubscriptions && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                  <label className="block text-sm text-gray-400 mb-2">
                    Endereços para expirar (um por linha)
                  </label>
                  <textarea
                    value={expireAddresses}
                    onChange={(e) => setExpireAddresses(e.target.value)}
                    placeholder="0x...&#10;0x...&#10;0x..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleExpireSubscriptions}
                      disabled={isExpiring}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50"
                    >
                      {isExpiring ? 'Expirando...' : '✅ Confirmar Expiração'}
                    </button>
                    <button
                      onClick={() => {
                        setShowExpireSubscriptions(false)
                        setExpireAddresses('')
                      }}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controles do Sistema */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">⚙️ Controles do Sistema</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pausar/Despausar Sistema */}
            <button
              onClick={handlePauseSystem}
              disabled={isPausingSystem || isUnpausingSystem}
              className={`p-4 rounded-xl border transition ${
                paused
                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                  : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
              }`}
            >
              <Power className="w-5 h-5 text-white mb-2" />
              <p className="text-white font-semibold mb-1">
                {paused ? 'Despausar' : 'Pausar'} Sistema
              </p>
              <p className="text-sm text-gray-400">
                {paused ? 'Retomar' : 'Bloquear'} todas operações
              </p>
            </button>

            {/* Toggle Beta Mode */}
            <button
              onClick={handleToggleBeta}
              disabled={isTogglingBeta}
              className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 transition"
            >
              <RefreshCw className={`w-5 h-5 text-purple-400 mb-2 ${isTogglingBeta ? 'animate-spin' : ''}`} />
              <p className="text-white font-semibold mb-1">
                {betaMode ? 'Desativar' : 'Ativar'} Modo Beta
              </p>
              <p className="text-sm text-gray-400">
                Alterar percentuais MLM
              </p>
            </button>

            {/* Atualizar Carteiras */}
            <button
              onClick={() => setShowWalletUpdate(true)}
              className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 transition"
            >
              <Wallet className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-white font-semibold mb-1">Atualizar Carteiras</p>
              <p className="text-sm text-gray-400">Pools de distribuição</p>
            </button>
          </div>
        </div>

        {/* Modal Atualizar Carteiras */}
        {showWalletUpdate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-4">💼 Atualizar Carteiras dos Pools</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Liquidity Pool - 5% (Atual: {liquidityPool ? (liquidityPool as string).slice(0, 10) + '...' : 'Carregando...'})
                  </label>
                  <input
                    type="text"
                    value={newLiquidityPool}
                    onChange={(e) => setNewLiquidityPool(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Infrastructure Wallet - 12% (Atual: {infrastructureWallet ? (infrastructureWallet as string).slice(0, 10) + '...' : 'Carregando...'})
                  </label>
                  <input
                    type="text"
                    value={newInfrastructureWallet}
                    onChange={(e) => setNewInfrastructureWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Company Wallet - 23% (Atual: {companyWallet ? (companyWallet as string).slice(0, 10) + '...' : 'Carregando...'})
                  </label>
                  <input
                    type="text"
                    value={newCompanyWallet}
                    onChange={(e) => setNewCompanyWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateWallets}
                  disabled={isUpdatingWallets}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
                >
                  {isUpdatingWallets ? 'Atualizando...' : 'Confirmar Atualização'}
                </button>

                <button
                  onClick={() => {
                    setShowWalletUpdate(false)
                    setNewLiquidityPool('')
                    setNewInfrastructureWallet('')
                    setNewCompanyWallet('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
