'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@/components/ConnectButton'
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import Logo from '@/components/Logo'
import { toast } from 'sonner'

interface MT5Account {
  id: string
  accountAlias: string
  brokerName: string
  login: string
  server: string
  platform: string
  status: string
  removalStatus: string
  connected: boolean
  lastError: string | null
  lastHeartbeat: string | null
  balance: string
  equity: string
  margin: string
  freeMargin: string
  marginLevel: string
  openTrades: number
  openPL: string
  dayPL: string
  weekPL: string
  monthPL: string
  totalPL: string
  createdAt: string
  updatedAt: string
  lastSnapshotAt: string | null
}

export default function MT5DashboardPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const [accounts, setAccounts] = useState<MT5Account[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const isFetchingRef = useRef(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showRemovalModal, setShowRemovalModal] = useState(false)
  const [accountToRemove, setAccountToRemove] = useState<MT5Account | null>(null)
  const [removalReason, setRemovalReason] = useState('')
  const [requestingRemoval, setRequestingRemoval] = useState(false)

  // Redirect se não conectado
  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  // Fetch accounts
  const fetchAccounts = useCallback(async (silent = false) => {
    if (!address) return
    if (isFetchingRef.current) return // Evita chamadas simultâneas

    isFetchingRef.current = true

    try {
      // Adiciona timestamp para evitar cache do browser
      const timestamp = Date.now()
      const response = await fetch(`/api/mt5/accounts?walletAddress=${address}&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar contas')
      }

      // Força novo array para React detectar mudança
      const newAccounts = [...(data.accounts || [])]
      if (!silent) {
        console.log('[MT5 Dashboard] Dados recebidos:', new Date().toLocaleTimeString(),
          newAccounts.length > 0 ? `Balance: ${newAccounts[0].balance}, Equity: ${newAccounts[0].equity}` : 'Sem contas')
      }
      setAccounts(newAccounts)
    } catch (error: any) {
      if (!silent) {
        toast.error('Erro ao carregar contas: ' + (error.message || 'Erro desconhecido'))
      }
    } finally {
      isFetchingRef.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }, [address])

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, [address])

  // Auto-refresh every 5s for real-time data when account is connected
  useEffect(() => {
    if (!address) return

    const interval = setInterval(() => {
      fetchAccounts(true) // silent = true para auto-refresh
    }, 5000)

    return () => clearInterval(interval)
  }, [address, fetchAccounts])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAccounts()
  }

  // Solicitar remoção
  const handleRequestRemoval = (account: MT5Account) => {
    setAccountToRemove(account)
    setShowRemovalModal(true)
  }

  // Confirmar solicitação de remoção
  const confirmRemovalRequest = async () => {
    if (!accountToRemove || !address) return

    setRequestingRemoval(true)

    try {
      const response = await fetch('/api/mt5/request-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: accountToRemove.id,
          walletAddress: address,
          reason: removalReason || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'REQUEST_ALREADY_EXISTS') {
          toast.error('Já existe uma solicitação pendente para esta conta')
        } else {
          throw new Error(data.message || 'Erro ao solicitar remoção')
        }
        return
      }

      toast.success('Solicitação enviada! Aguarde aprovação do administrador.')

      setShowRemovalModal(false)
      setAccountToRemove(null)
      setRemovalReason('')
      fetchAccounts()

    } catch (error: any) {
      console.error('Erro ao solicitar remoção:', error)
      toast.error(error.message || 'Erro ao solicitar remoção')
    } finally {
      setRequestingRemoval(false)
    }
  }

  // Remover conta (quando aprovado ou não conectada)
  const handleRemoveAccount = async (accountId: string) => {
    if (!address) return

    if (!confirm('Tem certeza que deseja remover esta conta?')) {
      return
    }

    setDeletingId(accountId)

    try {
      const response = await fetch(`/api/mt5/accounts/${accountId}?walletAddress=${address}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'REMOVAL_NOT_AUTHORIZED') {
          toast.error('Esta conta requer autorização do administrador. Use "Solicitar Remoção".')
        } else {
          throw new Error(data.message || 'Erro ao remover conta')
        }
        return
      }

      toast.success('Conta removida com sucesso!')
      fetchAccounts()

    } catch (error: any) {
      console.error('Erro ao remover conta:', error)
      toast.error(error.message || 'Erro ao remover conta')
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value || '0')
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  const formatPL = (value: string) => {
    const num = parseFloat(value || '0')
    const formatted = formatCurrency(value)
    return { value: num, formatted }
  }

  const getStatusBadge = (account: MT5Account) => {
    const { status, connected } = account

    if (status === 'CONNECTED' && connected) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>Conectado</span>
        </div>
      )
    }

    if (status === 'DISCONNECTED') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
          <XCircle className="w-3 h-3" />
          <span>Desconectado</span>
        </div>
      )
    }

    if (status === 'ERROR') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>Erro</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
        <Clock className="w-3 h-3" />
        <span>Pendente</span>
      </div>
    )
  }

  const getLastUpdate = (account: MT5Account) => {
    if (!account.lastHeartbeat) return 'Nunca'

    const date = new Date(account.lastHeartbeat)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 60) return `${diffSec}s atrás`
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min atrás`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h atrás`
    return `${Math.floor(diffSec / 86400)}d atrás`
  }

  if (!isConnected) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando contas MT5...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header sticky mobile-first */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <Logo className="h-8" />
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-1">Contas MT5</h1>
            <p className="text-sm text-gray-400">
              {accounts.length} {accounts.length === 1 ? 'conta conectada' : 'contas conectadas'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma conta conectada</h3>
            <p className="text-gray-400 mb-2">
              Cada cliente pode ter apenas uma conta MT5 conectada
            </p>
            <p className="text-gray-400 text-sm">
              Entre em contato com o administrador para conectar sua conta MT5
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const balance = parseFloat(account.balance)
              const dayPL = formatPL(account.dayPL)
              const weekPL = formatPL(account.weekPL)
              const monthPL = formatPL(account.monthPL)
              const totalPL = formatPL(account.totalPL)
              const openPL = formatPL(account.openPL)

              // Calcular porcentagens em relação ao capital
              const dayPercent = balance > 0 ? (dayPL.value / balance * 100).toFixed(2) : '0.00'
              const weekPercent = balance > 0 ? (weekPL.value / balance * 100).toFixed(2) : '0.00'
              const monthPercent = balance > 0 ? (monthPL.value / balance * 100).toFixed(2) : '0.00'
              const totalPercent = balance > 0 ? (totalPL.value / balance * 100).toFixed(2) : '0.00'

              return (
                <div
                  key={account.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{account.accountAlias}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{account.brokerName}</span>
                        <span>•</span>
                        <span>{account.login}@{account.server}</span>
                        <span>•</span>
                        <span>{account.platform}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(account)}

                      {/* Badge de Status de Remoção */}
                      {account.removalStatus !== 'ACTIVE' && (
                        <span className={`
                          text-xs font-semibold px-3 py-1 rounded-full
                          ${account.removalStatus === 'PENDING_REMOVAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : ''}
                          ${account.removalStatus === 'APPROVED_FOR_REMOVAL' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : ''}
                        `}>
                          {account.removalStatus === 'PENDING_REMOVAL' && '⏳ Aguardando'}
                          {account.removalStatus === 'APPROVED_FOR_REMOVAL' && '✅ Aprovado'}
                        </span>
                      )}

                      {/* Botões de Ação */}
                      {account.status === 'CONNECTED' && account.removalStatus === 'ACTIVE' && (
                        <button
                          onClick={() => handleRequestRemoval(account)}
                          className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs font-medium border border-yellow-500/50"
                        >
                          Solicitar Remoção
                        </button>
                      )}

                      {(account.removalStatus === 'APPROVED_FOR_REMOVAL' || account.status !== 'CONNECTED') && (
                        <button
                          onClick={() => handleRemoveAccount(account.id)}
                          disabled={deletingId === account.id}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium border border-red-500/50 disabled:opacity-50"
                        >
                          {deletingId === account.id ? 'Removendo...' : 'Remover'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {account.lastError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-300 text-xs">{account.lastError}</p>
                    </div>
                  )}

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                    {/* Balance */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Saldo</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(account.balance)}</p>
                    </div>

                    {/* Equity */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Equity</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(account.equity)}</p>
                    </div>

                    {/* Open Trades */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-gray-400">Trades Abertos</span>
                      </div>
                      <p className="text-lg font-bold text-white">{account.openTrades}</p>
                    </div>

                    {/* Open P/L */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {openPL.value >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs text-gray-400">P/L Aberto</span>
                      </div>
                      <p className={`text-lg font-bold ${openPL.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {openPL.formatted}
                      </p>
                    </div>

                    {/* Margin Level */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">Margem %</span>
                      </div>
                      <p className="text-lg font-bold text-white">{parseFloat(account.marginLevel).toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* P/L History Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    {/* Day P/L */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Dia</span>
                      <p className={`text-sm font-bold ${dayPL.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {dayPL.formatted} ({dayPL.value >= 0 ? '+' : ''}{dayPercent}%)
                      </p>
                    </div>

                    {/* Week P/L */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Semana</span>
                      <p className={`text-sm font-bold ${weekPL.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {weekPL.formatted} ({weekPL.value >= 0 ? '+' : ''}{weekPercent}%)
                      </p>
                    </div>

                    {/* Month P/L */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Mês</span>
                      <p className={`text-sm font-bold ${monthPL.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {monthPL.formatted} ({monthPL.value >= 0 ? '+' : ''}{monthPercent}%)
                      </p>
                    </div>

                    {/* Total P/L */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Total (P/L)</span>
                      <p className={`text-sm font-bold ${totalPL.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPL.formatted} ({totalPL.value >= 0 ? '+' : ''}{totalPercent}%)
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-gray-500">
                    Última atualização: {getLastUpdate(account)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-6">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            Sistema de Monitoramento Multi-Conta MT5
          </h3>
          <p className="text-gray-300 text-xs">
            Seus dados são atualizados automaticamente em tempo real pelo coletor MT5.
            Os dados são sincronizados com o iDeepX para cálculo de performance fees e distribuição.
          </p>
        </div>
      </main>

      {/* Modal de Solicitação de Remoção */}
      {showRemovalModal && accountToRemove && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Solicitar Remoção de Conta</h3>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ Esta solicitação será enviada ao administrador para análise.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-2">
                <strong>Conta:</strong> {accountToRemove.accountAlias}
              </p>
              <p className="text-gray-400 text-xs">
                {accountToRemove.login} @ {accountToRemove.server}
              </p>
            </div>

            <div className="mb-4">
              <label className="text-gray-300 text-sm font-semibold mb-2 block">
                Motivo da remoção (opcional)
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Ex: Quero trocar de corretora, conta encerrada, etc."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmRemovalRequest}
                disabled={requestingRemoval}
                className="flex-1 bg-yellow-500 text-gray-900 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {requestingRemoval ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
              <button
                onClick={() => {
                  setShowRemovalModal(false)
                  setAccountToRemove(null)
                  setRemovalReason('')
                }}
                className="flex-1 bg-white/5 text-white py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
