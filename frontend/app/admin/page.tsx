'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@/components/ConnectButton'
import {
  Shield, Users, DollarSign, RefreshCw, TrendingUp, Activity,
  Network, CheckCircle, XCircle, AlertTriangle, ArrowLeft,
  BarChart3, UserCheck, Wallet, Database, Calendar, Play, Clock
} from 'lucide-react'
import { toast } from 'sonner'

// Carteiras admin (configurar no .env ou hardcoded para teste)
const ADMIN_WALLETS = [
  '0xeb2451a8dd58734134dd7bde64a5f86725b75ef2', // Backend Wallet (Admin Principal)
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0xf172771b808E6CdC2Cfe802b7a93EDd006Cce762', // Admin GMI
  '0x75d1A8ac59003088c60A20bde8953cBECfe41669', // Admin Doo Prime
].map(w => w.toLowerCase())

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  // Estados
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [networkOverview, setNetworkOverview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState<any>(null)
  const [showFeesModal, setShowFeesModal] = useState(false)
  const [performanceReport, setPerformanceReport] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any>(null)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [showSystemModal, setShowSystemModal] = useState(false)
  const [pauseReason, setPauseReason] = useState('')

  // Estados para coleta MT5
  const [mt5CollectionStatus, setMt5CollectionStatus] = useState<any>(null)
  const [mt5ReferenceDate, setMt5ReferenceDate] = useState('')
  const [mt5Collecting, setMt5Collecting] = useState(false)
  const [showMt5Modal, setShowMt5Modal] = useState(false)

  // Verificar se é admin
  const isAdmin = address && ADMIN_WALLETS.includes(address.toLowerCase())

  // Carregar dados
  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin, usersPage])

  const loadAdminData = async () => {
    try {
      setLoading(true)

      const [statsRes, usersRes, networkRes, activityRes, statusRes, mt5StatusRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/stats'),
        fetch(`http://localhost:5001/api/admin/users?page=${usersPage}&limit=10`),
        fetch('http://localhost:5001/api/admin/network-overview'),
        fetch('http://localhost:5001/api/admin/recent-activity'),
        fetch('http://localhost:5001/api/admin/system-status'),
        fetch('http://localhost:5001/api/mt5/collection-status')
      ])

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      const networkData = await networkRes.json()
      const activityData = await activityRes.json()
      const statusData = await statusRes.json()
      const mt5StatusData = await mt5StatusRes.json()

      if (statsData.success) setStats(statsData.data)
      if (usersData.success) {
        setUsers(usersData.data.users)
        setUsersPagination(usersData.data.pagination)
      }
      if (networkData.success) setNetworkOverview(networkData.data)
      if (activityData.success) setRecentActivity(activityData.data)
      if (statusData.success) setSystemStatus(statusData.data)
      if (mt5StatusData.success) setMt5CollectionStatus(mt5StatusData.data)

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do painel')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncEligibility = async () => {
    try {
      setLoading(true)
      toast.info('🔄 Sincronizando elegibilidade de todos os usuários...')

      const response = await fetch('http://localhost:5001/api/admin/sync-eligibility', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        const { totalChecked, updated, alreadyCorrect } = data.data

        if (updated > 0) {
          toast.success(
            `✅ Sincronização concluída!\n\n` +
            `📊 Total verificados: ${totalChecked}\n` +
            `⬆️ Atualizados: ${updated}\n` +
            `✔️ Já corretos: ${alreadyCorrect}`,
            { duration: 5000 }
          )
        } else {
          toast.success(
            `✅ Sincronização concluída!\n\n` +
            `Todos os ${totalChecked} usuários já estão no nível correto.`,
            { duration: 4000 }
          )
        }

        await loadAdminData()
      } else {
        toast.error('Erro ao sincronizar: ' + data.error)
      }
    } catch (error: any) {
      toast.error('Erro ao sincronizar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserActive = async (wallet: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/user/${wallet}/toggle-active`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Usuário ${data.data.active ? 'ativado' : 'desativado'} com sucesso!`)
        await loadAdminData()
      } else {
        toast.error('Erro: ' + data.error)
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    }
  }

  const handleUpdateUserLevel = async (wallet: string, level: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/user/${wallet}/update-level`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Nível atualizado para L${level}`)
        await loadAdminData()
      } else {
        toast.error('Erro: ' + data.error)
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    }
  }

  const loadPerformanceReport = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/performance-report')
      const data = await response.json()

      if (data.success) {
        setPerformanceReport(data.data)
      } else {
        toast.error('Erro ao carregar relatório: ' + data.error)
      }
    } catch (error: any) {
      console.error('Erro ao carregar relatório:', error)
      toast.error('Erro ao carregar relatório de performance')
    }
  }

  const handleProcessFees = async () => {
    try {
      setLoading(true)
      toast.info('🔄 Processando performance fees automaticamente...')

      const response = await fetch('http://localhost:5001/api/admin/process-fees', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        const { clientsProcessed, commissionsCreated, totalFeesProcessed, totalCommissionsDistributed, companyShare } = data.data

        toast.success(
          `✅ Fees processadas e distribuídas com sucesso!\n\n` +
          `👥 Clientes processados: ${clientsProcessed}\n` +
          `📊 Comissões criadas: ${commissionsCreated}\n` +
          `💰 Total em fees: $${totalFeesProcessed.toLocaleString()}\n` +
          `🎁 MLM distribuído: $${totalCommissionsDistributed.toLocaleString()}\n` +
          `🏢 Empresa: $${companyShare.toLocaleString()}`,
          { duration: 8000 }
        )

        setShowFeesModal(false)
        await loadAdminData()
        await loadPerformanceReport()
      } else {
        toast.error('Erro ao processar fees: ' + data.error)
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseSystem = async () => {
    try {
      setLoading(true)
      toast.info('Pausando sistema...')

      const response = await fetch('http://localhost:5001/api/admin/system/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: pauseReason || 'Pausado pelo administrador'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('⏸️ Sistema pausado com sucesso!')
        setShowSystemModal(false)
        setPauseReason('')
        await loadAdminData()
      } else {
        toast.error('Erro ao pausar sistema: ' + data.error)
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSystem = async () => {
    try {
      setLoading(true)
      toast.info('Retomando sistema...')

      const response = await fetch('http://localhost:5001/api/admin/system/resume', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Sistema retomado com sucesso!')
        await loadAdminData()
      } else {
        toast.error('Erro ao retomar sistema: ' + data.error)
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Disparar coleta MT5 manual
  const handleTriggerMt5Collection = async () => {
    try {
      setMt5Collecting(true)
      toast.info('Iniciando coleta MT5... Deploy das contas em andamento')

      // Usar caminho relativo para o proxy do Next.js funcionar
      const response = await fetch(`/api/mt5/trigger-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminWallet: address,
          referenceDate: mt5ReferenceDate || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          `Coleta MT5 iniciada!\n` +
          `Contas: ${data.data.totalAccounts}\n` +
          `Data ref: ${data.data.referenceDate || 'hoje'}`,
          { duration: 5000 }
        )
        setShowMt5Modal(false)

        // Atualizar status após 5 segundos
        setTimeout(async () => {
          await loadAdminData()
        }, 5000)
      } else {
        toast.error('Erro ao iniciar coleta: ' + data.error)
      }
    } catch (error: any) {
      console.error('❌ [MT5] Erro na coleta:', error)
      toast.error('Erro: ' + error.message)
    } finally {
      setMt5Collecting(false)
    }
  }

  // Não conectado
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400 mb-6">
            Conecte sua carteira para acessar o painel admin.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  // Não é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-2xl">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4 text-center">❌ Acesso Negado</h1>
          <p className="text-gray-300 mb-6 text-center text-lg">
            Esta página é restrita <strong>APENAS</strong> para administradores.
          </p>

          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">👤 Sua Carteira Conectada:</p>
              <code className="text-red-400 font-mono text-sm break-all bg-gray-900 p-3 rounded block">
                {address}
              </code>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Para acessar o painel admin:</strong> Você precisa conectar com uma carteira admin configurada no sistema.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                  <p className="text-sm text-gray-400">iDeepX System Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        {stats && (
          <>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400" />
              Estatísticas Gerais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total de Usuários */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-gray-400 text-sm mb-1">Total de Usuários</p>
                <p className="text-3xl font-bold text-white">{stats.users.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.users.active} ativos ({stats.users.activationRate}%)
                </p>
              </div>

              {/* Volume Total */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
                <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-gray-400 text-sm mb-1">Volume Total</p>
                <p className="text-3xl font-bold text-white">${stats.financial.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Mensal: ${stats.financial.monthlyVolume.toLocaleString()}
                </p>
              </div>

              {/* Total Ganho */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
                <DollarSign className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-gray-400 text-sm mb-1">Total Ganho (MLM)</p>
                <p className="text-3xl font-bold text-white">${stats.financial.totalEarned.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Comissões pagas
                </p>
              </div>

              {/* Saldo Interno */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-6">
                <Wallet className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-gray-400 text-sm mb-1">Saldo Interno Total</p>
                <p className="text-3xl font-bold text-white">${stats.financial.internalBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Sacado: ${stats.financial.totalWithdrawn.toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Ações Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Sincronizar Elegibilidade */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <RefreshCw className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Sincronizar Elegibilidade</h3>
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">
                Atualiza maxLevel automaticamente baseado nas regras:
              </p>
              <ul className="text-gray-500 text-xs space-y-1 ml-4">
                <li>• <strong>L1:</strong> Sem taxa (recebe de diretos 30 dias)</li>
                <li>• <strong>L5:</strong> Com taxa ativa (recebe até L5)</li>
                <li>• <strong>L10:</strong> Taxa + 5 diretos + $5k volume</li>
              </ul>
            </div>
            <button
              onClick={handleSyncEligibility}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
            </button>
          </div>

          {/* Processar Fees */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold text-white">Performance Fees</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              GMI Edge + Smart Contract: 35% Performance Fee → 25% MLM Pool + 10% Empresa
            </p>
            <button
              onClick={async () => {
                await loadPerformanceReport()
                setShowFeesModal(true)
              }}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition disabled:opacity-50 font-semibold"
            >
              Ver Relatório & Processar
            </button>
          </div>

          {/* Gerenciamento */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Sistema</h3>
            </div>
            {systemStatus && (
              <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${
                systemStatus.paused
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                Status: <strong>{systemStatus.paused ? 'Pausado' : 'Ativo'}</strong>
              </div>
            )}
            <p className="text-gray-400 text-sm mb-4">
              Controles gerais do sistema (pausar/retomar)
            </p>
            {systemStatus?.paused ? (
              <button
                onClick={handleResumeSystem}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition disabled:opacity-50 font-semibold"
              >
                Retomar Sistema
              </button>
            ) : (
              <button
                onClick={() => setShowSystemModal(true)}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition disabled:opacity-50 font-semibold"
              >
                Pausar Sistema
              </button>
            )}
          </div>

          {/* Coleta MT5 */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Coleta MT5</h3>
            </div>
            {mt5CollectionStatus && (
              <div className="mb-3 px-3 py-2 rounded-lg text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {mt5CollectionStatus.lastCollectionAt
                      ? `Ultima: ${new Date(mt5CollectionStatus.lastCollectionAt).toLocaleString('pt-BR')}`
                      : 'Nenhuma coleta'}
                  </span>
                </div>
                <div className="text-xs text-cyan-300 mt-1">
                  {mt5CollectionStatus.totalAccounts || 0} contas |
                  {mt5CollectionStatus.collectedToday || 0} coletadas hoje
                </div>
              </div>
            )}
            <p className="text-gray-400 text-sm mb-4">
              Deploy → Coleta → Undeploy (economia)
            </p>
            <button
              onClick={() => setShowMt5Modal(true)}
              disabled={mt5Collecting}
              className="w-full px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {mt5Collecting ? 'Coletando...' : 'Coletar Agora'}
            </button>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-400" />
              Usuários ({usersPagination?.total || 0})
            </h2>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm">Carteira</th>
                    <th className="text-center py-3 px-4 text-gray-400 text-sm">Status</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Nível</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Volume Mensal</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Total Ganho</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Indicados</th>
                    <th className="text-center py-3 px-4 text-gray-400 text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any, index: number) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <code className="text-white font-mono text-sm">
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.active ? (
                          <CheckCircle className="w-5 h-5 text-green-400 inline" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 inline" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-white">{user.maxLevel}/10</td>
                      <td className="py-3 px-4 text-right text-white">
                        ${parseFloat(user.monthlyVolume || '0').toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-green-400">
                        ${parseFloat(user.totalEarned || '0').toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-400">
                        {user._count.referrals}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Toggle Ativo/Inativo */}
                          <button
                            onClick={() => handleToggleUserActive(user.walletAddress)}
                            disabled={loading}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                              user.active
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                            title={user.active ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            {user.active ? 'Desativar' : 'Ativar'}
                          </button>

                          {/* Selector de Nível */}
                          <select
                            value={user.maxLevel}
                            onChange={(e) => handleUpdateUserLevel(user.walletAddress, parseInt(e.target.value))}
                            disabled={loading}
                            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                            title="Alterar nível máximo"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                              <option key={level} value={level}>
                                L{level}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhum usuário encontrado</p>
          )}

          {/* Paginação */}
          {usersPagination && usersPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                disabled={usersPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-gray-400 text-sm">
                Página {usersPage} de {usersPagination.totalPages}
              </span>
              <button
                onClick={() => setUsersPage(p => Math.min(usersPagination.totalPages, p + 1))}
                disabled={usersPage === usersPagination.totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>

        {/* Visão Geral da Rede */}
        {networkOverview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Distribuição por Nível */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Distribuição por Nível
              </h2>
              <div className="space-y-3">
                {Object.entries(networkOverview.levelDistribution).map(([level, count]: any) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {level.replace('level', 'Nível ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                          style={{ width: `${Math.min((count / stats?.users?.active || 1) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sponsors */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Network className="w-6 h-6 text-green-400" />
                Top 5 Sponsors
              </h2>
              <div className="space-y-3">
                {networkOverview.topSponsors.slice(0, 5).map((sponsor: any) => (
                  <div key={sponsor.walletAddress} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div>
                      <code className="text-white font-mono text-sm">
                        {sponsor.walletAddress.slice(0, 6)}...{sponsor.walletAddress.slice(-4)}
                      </code>
                      <p className="text-xs text-gray-400 mt-1">
                        Nível {sponsor.maxLevel} • ${sponsor.totalEarned.toLocaleString()} ganho
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{sponsor.directReferrals}</p>
                      <p className="text-xs text-gray-400">diretos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Atividades Recentes */}
        {recentActivity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Comissões Recentes */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-400" />
                Últimas Comissões
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(recentActivity.recentCommissions || recentActivity.commissions)?.length > 0 ? (
                  (recentActivity.recentCommissions || recentActivity.commissions).map((commission: any) => (
                    <div key={commission.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-white font-mono text-xs">
                          {commission.user ? (typeof commission.user === 'string' ? `${commission.user.slice(0, 8)}...${commission.user.slice(-6)}` : `${commission.user.walletAddress?.slice(0, 8)}...${commission.user.walletAddress?.slice(-6)}`) : 'N/A'}
                        </code>
                        <span className="text-green-400 font-semibold">
                          +${parseFloat(commission.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Nível {commission.level}</span>
                        <span>•</span>
                        <span>de {commission.fromUser ? (typeof commission.fromUser === 'string' ? commission.fromUser.slice(0, 6) : commission.fromUser.walletAddress?.slice(0, 6)) : 'N/A'}...</span>
                        <span>•</span>
                        <span>{new Date(commission.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhuma comissão recente</p>
                )}
              </div>
            </div>

            {/* Novos Usuários */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Novos Usuários
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.newUsers?.length > 0 ? (
                  recentActivity.newUsers.map((user: any) => (
                    <div key={user.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-white font-mono text-xs">
                          {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                        </code>
                        <div className="flex items-center gap-2">
                          {user.active ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-xs text-gray-400">L{user.maxLevel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                        {user.sponsor && (
                          <>
                            <span>•</span>
                            <span>Sponsor: {user.sponsor.walletAddress.slice(0, 6)}...</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum usuário recente</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-300 text-sm">
            💡 <strong>Dica:</strong> Use este painel para monitorar a saúde do sistema, gerenciar usuários e acompanhar métricas MLM.
          </p>
        </div>
      </div>

      {/* Modal de Processar Fees - NOVO SISTEMA */}
      {showFeesModal && performanceReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                Relatório de Performance & Fees
              </h2>
              <button
                onClick={() => setShowFeesModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Resumo Geral - GMI EDGE + SMART CONTRACT */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">📊 Distribuição GMI Edge + Smart Contract</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Clientes</p>
                  <p className="text-white text-xl font-bold">{performanceReport.summary.totalClients}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Lucro Bruto (100%)</p>
                  <p className="text-white text-xl font-bold">${performanceReport.summary.totalGrossProfit.toLocaleString()}</p>
                </div>
                <div className="border-l border-green-500/30 pl-4">
                  <p className="text-gray-400 text-xs mb-1">Clientes (65%)</p>
                  <p className="text-blue-400 text-xl font-bold">${performanceReport.summary.totalClientShare.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">GMI Edge auto</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">MLM Pool (25%)</p>
                  <p className="text-purple-400 text-xl font-bold">${performanceReport.summary.totalMlmPool.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Smart Contract</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Empresa (10%)</p>
                  <p className="text-yellow-400 text-xl font-bold">${performanceReport.summary.totalCompanyShare.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Operação</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-500/30">
                <p className="text-gray-400 text-xs mb-2">Performance Fee Total (35%):</p>
                <p className="text-green-400 text-lg font-bold">${performanceReport.summary.totalPerformanceFee.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">= MLM Pool (${ performanceReport.summary.totalMlmPool.toLocaleString()}) + Empresa (${performanceReport.summary.totalCompanyShare.toLocaleString()})</p>
              </div>
            </div>

            {/* Lista de Clientes com Lucro */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">👥 Clientes com Lucro</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                {performanceReport.clients.filter((c: any) => c.grossProfit > 0).length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
                      <tr>
                        <th className="text-left p-2 text-gray-400">Cliente</th>
                        <th className="text-left p-2 text-gray-400">GMI ID</th>
                        <th className="text-right p-2 text-gray-400">Lucro Bruto</th>
                        <th className="text-right p-2 text-gray-400">Cliente (65%)</th>
                        <th className="text-right p-2 text-gray-400">MLM (25%)</th>
                        <th className="text-right p-2 text-gray-400">Empresa (10%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceReport.clients.filter((c: any) => c.grossProfit > 0).map((client: any) => (
                        <tr key={client.wallet} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="p-2">
                            <code className="text-white text-xs font-mono">
                              {client.wallet.slice(0, 6)}...{client.wallet.slice(-4)}
                            </code>
                          </td>
                          <td className="p-2 text-gray-400">{client.gmiAccountId}</td>
                          <td className="p-2 text-right text-white font-semibold">${client.grossProfit.toFixed(2)}</td>
                          <td className="p-2 text-right text-blue-400">${client.clientShare.toFixed(2)}</td>
                          <td className="p-2 text-right text-purple-400 font-semibold">${client.mlmPool.toFixed(2)}</td>
                          <td className="p-2 text-right text-yellow-400">${client.companyShare.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum cliente com lucro no período</p>
                )}
              </div>
            </div>

            {/* Informação sobre o Processo - GMI EDGE + SMART CONTRACT */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-300 text-sm mb-2">
                ℹ️ <strong>Modelo GMI Edge + Smart Contract:</strong>
              </p>
              <div className="text-blue-200 text-xs space-y-2">
                <p>📊 <strong>GMI Edge (automático):</strong> Divide lucro bruto em 65% Cliente + 35% iDeepX</p>
                <p>💰 <strong>Performance Fee (35% = $630 de $1800):</strong></p>
                <ul className="ml-6 space-y-1">
                  <li>• 25% → Smart Contract ($450) = MLM Pool 100% distribuído</li>
                  <li>• 10% → iDeepX ($180) = Operação da empresa</li>
                </ul>
                <p>🎯 <strong>Distribuição MLM (Smart Contract):</strong></p>
                <ul className="ml-6 space-y-1">
                  <li>• L1: 32%, L2: 12%, L3: 8%, L4: 4%, L5: 4%</li>
                  <li>• L6-L10: 8% cada (conforme maxLevel de cada usuário)</li>
                  <li>• Total: 100% = $450k (25% do lucro bruto) distribuído via MLM</li>
                </ul>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFeesModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessFees}
                disabled={loading || performanceReport.summary.totalMlmPool === 0}
                className="flex-1 px-4 py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Processando...' : `✅ Processar ${performanceReport.clients.filter((c: any) => c.grossProfit > 0).length} Clientes`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pausar Sistema */}
      {showSystemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Pausar Sistema
              </h2>
              <button
                onClick={() => {
                  setShowSystemModal(false)
                  setPauseReason('')
                }}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm">
                ⚠️ <strong>ATENÇÃO:</strong> Pausar o sistema impedirá todas as operações até que seja retomado. Use apenas em casos de emergência ou manutenção.
              </p>
            </div>

            {/* Motivo */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Motivo da pausa (opcional)
              </label>
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Ex: Manutenção programada, correção de bugs, etc."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            {/* Informações do Sistema */}
            {systemStatus?.stats && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">📊 Status Atual:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Total de Usuários</p>
                    <p className="text-white font-semibold">{systemStatus.stats.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Usuários Ativos</p>
                    <p className="text-white font-semibold">{systemStatus.stats.activeUsers}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSystemModal(false)
                  setPauseReason('')
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handlePauseSystem}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Pausando...' : 'Confirmar Pausa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Coleta MT5 */}
      {showMt5Modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-cyan-400" />
                Coleta Manual MT5
              </h2>
              <button
                onClick={() => {
                  setShowMt5Modal(false)
                  setMt5ReferenceDate('')
                }}
                className="text-gray-400 hover:text-white transition"
              >
                X
              </button>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
              <p className="text-cyan-300 text-sm">
                <strong>Economia de custos:</strong> O sistema fara deploy das contas MetaAPI, coletara os dados e depois fara undeploy automaticamente.
              </p>
            </div>

            {/* Seletor de Data */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Referencia (opcional)
              </label>
              <input
                type="date"
                value={mt5ReferenceDate}
                onChange={(e) => setMt5ReferenceDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-gray-500 text-xs mt-2">
                Deixe vazio para usar a data de hoje. Use para recalcular P/L de dias anteriores.
              </p>
            </div>

            {/* Status Atual */}
            {mt5CollectionStatus && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">Status Atual:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Contas MT5</p>
                    <p className="text-white font-semibold">{mt5CollectionStatus.totalAccounts || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Coletadas Hoje</p>
                    <p className="text-white font-semibold">{mt5CollectionStatus.collectedToday || 0}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Ultima Coleta</p>
                    <p className="text-white font-semibold">
                      {mt5CollectionStatus.lastCollectionAt
                        ? new Date(mt5CollectionStatus.lastCollectionAt).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informacoes */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>Coleta automatica:</strong> O sistema coleta automaticamente as 22:00 UTC (19:00 BRT) - virada do dia forex.
              </p>
            </div>

            {/* Botoes */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMt5Modal(false)
                  setMt5ReferenceDate('')
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleTriggerMt5Collection}
                disabled={mt5Collecting}
                className="flex-1 px-4 py-3 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {mt5Collecting ? 'Iniciando...' : 'Iniciar Coleta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
