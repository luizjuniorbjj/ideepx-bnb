'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@/components/ConnectButton'
import { ArrowLeft, Users, TrendingUp, Copy, Check, Share2, Network } from 'lucide-react'
import { toast } from 'sonner'
import { useUserData, useUserReferrals, useUserMlmStats } from '@/hooks/useUserData'
import UplineTree from '@/components/UplineTree'
import MlmTreeView from '@/components/MlmTreeView'
import Logo from '@/components/Logo'

export default function NetworkPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [mlmTree, setMlmTree] = useState<any>(null)
  const [loadingTree, setLoadingTree] = useState(false)

  const { userData } = useUserData()
  const { referrals } = useUserReferrals()
  const { stats: mlmStats } = useUserMlmStats()

  // Parse user data
  const sponsor = userData?.sponsorAddress || null
  const isRegistered = userData?.active || false

  // Network stats from MLM stats endpoint
  const totalNetwork = mlmStats?.networkSize || 0
  const activeReferrals = referrals?.filter((r: any) => r.active)?.length || 0
  const networkVolume = parseFloat(userData?.totalVolume || '0')

  // Generate referral link
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${address}`
    : ''

  // Redirecionar se não conectado (exceto em modo E2E)
  useEffect(() => {
    const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
    if (!isConnected && !isE2ETesting) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
    if (userData && !isRegistered && !isE2ETesting) {
      toast.error('Você precisa se registrar primeiro')
      router.push('/register')
    }
  }, [userData, isRegistered, router])

  // Fetch MLM Tree
  useEffect(() => {
    if (!address || !isRegistered) return

    const fetchMlmTree = async () => {
      setLoadingTree(true)
      try {
        const response = await fetch(`http://localhost:5001/api/mlm-tree/${address}`)
        const data = await response.json()

        if (data.success && data.data.tree) {
          setMlmTree(data.data.tree)
        }
      } catch (error) {
        console.error('Error fetching MLM tree:', error)
        toast.error('Erro ao carregar árvore MLM')
      } finally {
        setLoadingTree(false)
      }
    }

    fetchMlmTree()
  }, [address, isRegistered])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'iDeepX - Junte-se à minha rede!',
        text: 'Cadastre-se no iDeepX através do meu link de indicação',
        url: referralLink
      })
    } else {
      copyLink()
    }
  }

  // Não renderizar se não conectado (exceto em modo E2E)
  const isE2ETesting = typeof window !== 'undefined' && localStorage.getItem('E2E_TESTING') === 'true'
  if (!isConnected && !isE2ETesting) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Minha Rede</h1>
            <p className="text-gray-400">Gerencie suas indicações e acompanhe seu crescimento</p>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-6 h-6 text-blue-400" />
                <h3 className="text-gray-400 text-sm">Total na Rede</h3>
              </div>
              <p className="text-3xl font-bold text-white">{totalNetwork}</p>
              <p className="text-xs text-gray-500 mt-1">Todos os níveis</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-green-400" />
                <h3 className="text-gray-400 text-sm">Ativos</h3>
              </div>
              <p className="text-3xl font-bold text-white">{activeReferrals}</p>
              <p className="text-xs text-gray-500 mt-1">Com assinatura ativa</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-gray-400 text-sm">Volume da Rede</h3>
              </div>
              <p className="text-3xl font-bold text-white">${networkVolume.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Total gerado</p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Seu Link de Indicação</h2>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800/50 rounded-xl px-4 py-3 text-white font-mono text-sm overflow-x-auto">
                {referralLink}
              </div>
              <button
                onClick={copyLink}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={shareLink}
                className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Compartilhe este link para convidar pessoas para sua rede
            </p>
          </div>

          {/* Sponsor Info */}
          {sponsor && sponsor !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-white font-semibold mb-2">👤 Seu Patrocinador</h3>
              <div className="flex items-center justify-between">
                <code className="text-gray-300 font-mono text-sm">{sponsor}</code>
                <a
                  href={`https://bscscan.com/address/${sponsor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Ver no BSCScan →
                </a>
              </div>
            </div>
          )}

          {/* Upline Tree */}
          <div className="mb-8">
            <UplineTree userAddress={address} />
          </div>

          {/* MLM Tree Visualization */}
          {mlmTree && (
            <div className="mb-8">
              <MlmTreeView tree={mlmTree} />
            </div>
          )}

          {loadingTree && (
            <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">Carregando árvore MLM...</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">💡 Como funciona o MLM?</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Você ganha comissões em <strong>10 níveis</strong></li>
              <li>• Quando alguém na sua rede gera performance fees, você recebe uma parte</li>
              <li>• Quanto mais pessoas ativas na sua rede, mais você ganha</li>
              <li>• Use seu link de indicação para convidar mais pessoas</li>
              <li>• Todas as comissões são pagas automaticamente via smart contract</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
