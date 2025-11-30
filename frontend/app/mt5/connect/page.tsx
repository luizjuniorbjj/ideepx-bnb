'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@/components/ConnectButton'
import {
  ArrowLeft,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react'
import Logo from '@/components/Logo'
import api from '@/lib/api'
import { toast } from 'sonner'

// Types
interface Broker {
  id: string
  name: string
  displayName: string
  logoUrl: string | null
  website: string | null
  supportsMT5: boolean
  supportsMT4: boolean
}

interface BrokerServer {
  id: string
  serverName: string
  serverAddress: string
  isDemo: boolean
  isLive: boolean
}

export default function MT5ConnectPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  // State
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [filteredBrokers, setFilteredBrokers] = useState<Broker[]>([])
  const [brokerSearch, setBrokerSearch] = useState('')
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [servers, setServers] = useState<BrokerServer[]>([])
  const [selectedServer, setSelectedServer] = useState<BrokerServer | null>(null)
  const [customServer, setCustomServer] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [accountAlias, setAccountAlias] = useState('')
  const [loadingBrokers, setLoadingBrokers] = useState(false)
  const [loadingServers, setLoadingServers] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false)

  // Fetch brokers on mount
  useEffect(() => {
    fetchBrokers()
  }, [])

  // Filter brokers based on search
  useEffect(() => {
    if (brokerSearch.trim() === '') {
      setFilteredBrokers(brokers)
    } else {
      const search = brokerSearch.toLowerCase()
      setFilteredBrokers(
        brokers.filter(
          (b) =>
            b.name.toLowerCase().includes(search) ||
            b.displayName.toLowerCase().includes(search)
        )
      )
    }
  }, [brokerSearch, brokers])

  // Fetch servers when broker selected
  useEffect(() => {
    if (selectedBroker) {
      fetchServers(selectedBroker.id)
    } else {
      setServers([])
      setSelectedServer(null)
    }
  }, [selectedBroker])

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/mt5/dashboard')
    }
  }, [isConnected, router])

  const fetchBrokers = async () => {
    setLoadingBrokers(true)
    try {
      const response = await fetch('/api/mt5/brokers')
      const data = await response.json()

      if (data.success && data.brokers) {
        setBrokers(data.brokers)
        setFilteredBrokers(data.brokers)

        // Auto-select first broker (DooPrime or GMI)
        if (data.brokers.length > 0) {
          setSelectedBroker(data.brokers[0])
        }
      } else {
        toast.error('Erro ao carregar corretoras')
      }
    } catch (error) {
      console.error('Erro ao buscar corretoras:', error)
      toast.error('Erro ao carregar corretoras')
    } finally {
      setLoadingBrokers(false)
    }
  }

  const fetchServers = async (brokerId: string) => {
    setLoadingServers(true)
    try {
      const response = await fetch(`/api/mt5/brokers/${brokerId}/servers`)
      const data = await response.json()

      if (data.success && data.servers) {
        setServers(data.servers)

        // Auto-select first live server or first server
        const liveServer = data.servers.find((s: BrokerServer) => s.isLive)
        setSelectedServer(liveServer || data.servers[0] || null)
      } else {
        toast.error('Erro ao carregar servidores')
        setServers([])
        setSelectedServer(null)
      }
    } catch (error) {
      console.error('Erro ao buscar servidores:', error)
      toast.error('Erro ao carregar servidores')
      setServers([])
      setSelectedServer(null)
    } finally {
      setLoadingServers(false)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBroker) {
      toast.error('Selecione uma corretora')
      return
    }

    if (!login || !password) {
      toast.error('Preencha número da conta e senha')
      return
    }

    const serverToUse =
      selectedServer?.serverName === 'Custom' ? customServer : selectedServer?.serverName

    if (!serverToUse) {
      toast.error('Selecione ou digite um servidor')
      return
    }

    setConnecting(true)
    try {
      const requestBody = {
        walletAddress: address,
        accountAlias: accountAlias || `${selectedBroker.displayName} ${login}`,
        brokerName: selectedBroker.displayName,
        login: login,
        password: password,
        server: serverToUse,
        platform: 'MT5' // Fixo em MT5
      }

      const response = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar conta')
      }

      toast.success('Conta MT5 conectada com sucesso!')

      // Reset form
      setLogin('')
      setPassword('')
      setAccountAlias('')

      // Redirect to dashboard after 1s
      setTimeout(() => {
        router.push('/mt5/dashboard')
      }, 1000)
    } catch (error: any) {
      console.error('Erro ao conectar:', error)
      toast.error('Erro ao conectar: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setConnecting(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/mt5/dashboard')}
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

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Page Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2">
            <LinkIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-1">Conectar Conta MT5</h1>
          <p className="text-sm text-gray-400">Conecte sua conta de qualquer corretora MT5</p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-200 text-sm font-semibold mb-1">Como funciona</p>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Conecte múltiplas contas MT5 de qualquer corretora</li>
                <li>• Seus dados são coletados automaticamente</li>
                <li>• Credenciais criptografadas com AES-256</li>
                <li>• Nunca compartilhamos suas credenciais</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connect Form */}
        <form onSubmit={handleConnect} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-5">

          {/* Alias (Optional) */}
          <div>
            <label className="block text-sm text-white mb-2">Nome da Conta (Opcional)</label>
            <input
              type="text"
              value={accountAlias}
              onChange={(e) => setAccountAlias(e.target.value)}
              placeholder="Ex: Minha Conta GMI, Doo Prime Principal"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Se vazio, será gerado automaticamente</p>
          </div>

          {/* Broker Search */}
          <div className="relative">
            <label className="block text-sm text-white mb-2">
              Corretora * {loadingBrokers && <span className="text-blue-400 text-xs">(Carregando...)</span>}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={selectedBroker ? selectedBroker.displayName : brokerSearch}
                onChange={(e) => {
                  setBrokerSearch(e.target.value)
                  setSelectedBroker(null)
                  setShowBrokerDropdown(true)
                }}
                onFocus={() => setShowBrokerDropdown(true)}
                placeholder="Digite para buscar (GMI, DooPrime, etc)"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Broker Dropdown */}
            {showBrokerDropdown && !selectedBroker && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredBrokers.length > 0 ? (
                  filteredBrokers.map((broker) => (
                    <button
                      key={broker.id}
                      type="button"
                      onClick={() => {
                        setSelectedBroker(broker)
                        setBrokerSearch('')
                        setShowBrokerDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 transition text-white border-b border-white/5 last:border-0"
                    >
                      <div className="font-semibold">{broker.displayName}</div>
                      <div className="text-xs text-gray-400">
                        {broker.supportsMT5 && 'MT5'} {broker.supportsMT4 && 'MT4'}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-sm">Nenhuma corretora encontrada</div>
                )}
              </div>
            )}

            {selectedBroker && (
              <div className="mt-2 flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                <span className="text-blue-200 text-sm">{selectedBroker.displayName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBroker(null)
                    setBrokerSearch('')
                    setShowBrokerDropdown(true)
                  }}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Alterar
                </button>
              </div>
            )}
          </div>

          {/* Server Selection */}
          {selectedBroker && (
            <div>
              <label className="block text-sm text-white mb-2">
                Servidor * {loadingServers && <span className="text-blue-400 text-xs">(Carregando...)</span>}
              </label>
              <select
                value={selectedServer?.id || ''}
                onChange={(e) => {
                  const server = servers.find((s) => s.id === e.target.value)
                  setSelectedServer(server || null)
                }}
                disabled={loadingServers || servers.length === 0}
                className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                style={{
                  colorScheme: 'dark'
                }}
              >
                {servers.length === 0 ? (
                  <option className="bg-gray-800 text-white">Nenhum servidor disponível</option>
                ) : (
                  servers.map((server) => (
                    <option key={server.id} value={server.id} className="bg-gray-800 text-white">
                      {server.serverName} {server.isDemo ? '(Demo)' : '(Live)'}
                    </option>
                  ))
                )}
              </select>
              {selectedServer?.serverName === 'Custom' && (
                <input
                  type="text"
                  value={customServer}
                  onChange={(e) => setCustomServer(e.target.value)}
                  placeholder="Digite o nome do servidor"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mt-2"
                />
              )}
            </div>
          )}

          {/* Login */}
          <div>
            <label className="block text-sm text-white mb-2">Login (Número da Conta) *</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Ex: 12345678"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-white mb-2">Senha *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Senha do seu terminal MT5 (criptografada e armazenada com segurança)</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={connecting || !selectedBroker || !selectedServer}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Conectar Conta MT5
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-200 text-sm font-semibold mb-1">Segurança Garantida</p>
              <p className="text-green-300 text-xs">
                Suas credenciais são criptografadas com AES-256 antes de serem armazenadas.
                Nunca compartilhamos ou exibimos suas senhas. O coletor MT5 roda localmente
                e apenas você tem acesso aos dados.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
