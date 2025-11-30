'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@/components/ConnectButton'
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Link as LinkIcon,
  Unlink,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import Logo from '@/components/Logo'
import { useGMIData } from '@/hooks/useGMIData'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function GMIHedgePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const {
    balance,
    equity,
    netProfit,
    winRate,
    totalTrades,
    loading,
    connected,
    refetch,
    data: gmiData
  } = useGMIData()
  const [disconnecting, setDisconnecting] = useState(false)
  const [showConnectForm, setShowConnectForm] = useState(false)

  // Connection form state - GMI Edge API
  const [botId, setBotId] = useState('')
  const [password, setPassword] = useState('')
  const [server, setServer] = useState('GMI Trading Platform Demo')
  const [connecting, setConnecting] = useState(false)

  // GMI data já vem do hook (não precisa extrair)
  const profit = netProfit

  // Redirect se não conectado (exceto em modo E2E)
  useEffect(() => {
    const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
    if (!isConnected && !isE2ETesting) {
      router.push('/')
    }
  }, [isConnected, router])

  const handleConnect = async () => {
    if (!botId || !password || !server) {
      toast.error('Preencha todos os campos')
      return
    }

    setConnecting(true)
    try {
      await api.linkGmiAccount(botId, password, server, address)
      toast.success('Conta GMI Edge conectada com sucesso!')
      await refetch()
      setShowConnectForm(false)
      // Reset form
      setBotId('')
      setPassword('')
      setServer('GMI Trading Platform Demo')
    } catch (error: any) {
      toast.error('Erro ao conectar: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await api.disconnectGmiAccount(address)
      toast.success('Conta GMI desconectada')
      await refetch()
    } catch (error: any) {
      toast.error('Erro ao desconectar: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setDisconnecting(false)
    }
  }

  // Não renderizar se não conectado (exceto em modo E2E)
  const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
  if (!isConnected && !isE2ETesting) {
    return null
  }

  if (loading && !gmiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dados GMI Edge...</p>
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

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title - Mobile optimized */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-1">GMI Edge</h1>
          <p className="text-sm text-gray-400">Seu dashboard de trading copy</p>
        </div>

        {/* Connection Status */}
        <div className={`rounded-xl p-5 ${connected ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connected ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-yellow-400" />
              )}
              <div>
                <p className={`font-semibold ${connected ? 'text-green-400' : 'text-yellow-400'}`}>
                  {connected ? 'Conectado' : 'Não Conectado'}
                </p>
                <p className="text-xs text-gray-400">
                  {connected ? 'Conta MT5 vinculada' : 'Conecte sua conta MT5 para começar'}
                </p>
              </div>
            </div>
            {connected ? (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                {disconnecting ? 'Desconectando...' : 'Desconectar'}
              </button>
            ) : (
              <button
                onClick={() => setShowConnectForm(!showConnectForm)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Conectar
              </button>
            )}
          </div>
        </div>

        {/* Connect Form - GMI Edge */}
        {showConnectForm && !connected && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Conectar Conta GMI Edge</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white mb-2">BotId (Número da Conta)</label>
                <input
                  type="text"
                  value={botId}
                  onChange={(e) => setBotId(e.target.value)}
                  placeholder="3237386"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Número da sua conta GMI Edge</p>
              </div>
              <div>
                <label className="block text-sm text-white mb-2">Senha da Conta</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Sua senha de login GMI Edge (não armazenamos)</p>
              </div>
              <div>
                <label className="block text-sm text-white mb-2">Servidor</label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="GMI Trading Platform Demo">GMI Trading Platform Demo</option>
                  <option value="GMIEdge-Live">GMIEdge-Live (Standard/ECN)</option>
                  <option value="GMIEdge-Cent">GMIEdge-Cent</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Selecione o servidor da sua conta</p>
              </div>

              {/* Alerta Importante */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-200 text-xs">
                  <strong>ℹ️ Importante:</strong> Esta é a integração oficial com GMI Edge API.
                  Use as credenciais da sua conta GMI Edge (não MT4/MT5).
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" />
                    Conectar Conta GMI Edge
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid - Only show if connected */}
        {connected && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Balance */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <h3 className="text-gray-400 text-xs">Saldo</h3>
                </div>
                <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Balance</p>
              </div>

              {/* Equity */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-gray-400 text-xs">Equity</h3>
                </div>
                <p className="text-2xl font-bold text-white">${equity.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Patrimônio</p>
              </div>

              {/* Profit */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {profit >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <h3 className="text-gray-400 text-xs">Lucro</h3>
                </div>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(profit).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{profit >= 0 ? 'Positivo' : 'Negativo'}</p>
              </div>

              {/* Win Rate - Full width on mobile */}
              <div className="col-span-2 lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-gray-400 text-xs">Taxa de Vitórias</h3>
                </div>
                <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(winRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Total Trades */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-gray-400 text-xs">Total Trades</h3>
                </div>
                <p className="text-2xl font-bold text-white">{totalTrades}</p>
                <p className="text-xs text-gray-500 mt-1">Operações</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                GMI Edge Copy Trading
              </h3>
              <p className="text-gray-300 text-xs">
                Seus resultados de copy trading são sincronizados automaticamente com o iDeepX.
                As performance fees são calculadas semanalmente e distribuídas na rede MLM.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
