'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { StatCard, GlassCard } from '@/components/GlassCard'
import { useCompleteUserData } from '@/hooks/useCompleteUserData'
import UplineTree from '@/components/UplineTree'
import {
  Network, Users, UserCheck, TrendingUp,
  Search, Copy, Share2, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { toast } from 'sonner'

export default function NetworkPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const {
    userData,
    mlmStats,
    referrals,
    loading
  } = useCompleteUserData()

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showTree, setShowTree] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex items-center justify-center">
        <div className="text-white text-xl">🔄 Carregando rede...</div>
      </div>
    )
  }

  // Dados
  const totalNetwork = mlmStats?.networkSize ?? 0
  const directReferrals = referrals?.filter((r: any) => r.level === 1).length ?? 0
  const activeDirects = referrals?.filter((r: any) => r.level === 1 && r.active).length ?? 0
  const totalVolume = parseFloat(mlmStats?.totalVolume ?? '0')

  // Link de referral
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${address}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast.success('Link copiado!')
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'iDeepX - Junte-se à minha rede',
          text: 'Cadastre-se usando meu link de referência!',
          url: referralLink
        })
      } catch (err) {
        // Usuário cancelou
      }
    } else {
      copyLink()
    }
  }

  // Filtrar referrals
  const filteredReferrals = referrals?.filter((r: any) => {
    if (filter === 'active' && !r.active) return false
    if (filter === 'inactive' && r.active) return false
    if (searchTerm && !r.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  }) || []

  return (
    <PageLayout
      title="Minha Rede MLM"
      subtitle="Gerencie sua rede de 10 níveis"
      icon={<Network className="w-8 h-8 text-cyan-400" />}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Network className="w-5 h-5" />}
          label="Rede Total"
          value={totalNetwork}
          subtitle="Todos os níveis"
          color="cyan"
          trend="up"
        />

        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Diretos"
          value={directReferrals}
          subtitle="Nível 1"
          color="blue"
        />

        <StatCard
          icon={<UserCheck className="w-5 h-5" />}
          label="Ativos"
          value={activeDirects}
          subtitle={`${directReferrals > 0 ? Math.round((activeDirects / directReferrals) * 100) : 0}% dos diretos`}
          color="green"
          trend="up"
        />

        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Volume"
          value={`$${totalVolume.toFixed(0)}`}
          subtitle="Volume total"
          color="purple"
          trend="up"
        />
      </div>

      {/* Link de Referral */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-white mb-3">Seu Link de Referência</h3>
        <p className="text-sm text-gray-400 mb-4">
          Compartilhe este link para convidar novos membros
        </p>

        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-all flex items-center gap-2 text-white font-semibold hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copiar</span>
          </button>
          <button
            onClick={shareLink}
            className="px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl transition-all flex items-center gap-2 text-white font-semibold hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </GlassCard>

      {/* Filtros e Busca */}
      <GlassCard className="p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                filter === 'active'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                filter === 'inactive'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Árvore MLM */}
      <GlassCard className="p-5">
        <button
          onClick={() => setShowTree(!showTree)}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <h3 className="text-lg font-bold text-white">Árvore da Rede</h3>
          {showTree ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </button>

        {showTree && (
          <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
            {address && <UplineTree userAddress={address} />}
          </div>
        )}
      </GlassCard>

      {/* Lista de Referrals */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-white mb-4">
          Membros da Rede ({filteredReferrals.length})
        </h3>

        {filteredReferrals.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">
              {searchTerm
                ? 'Nenhum membro encontrado'
                : filter === 'all'
                ? 'Sua rede está vazia. Compartilhe seu link!'
                : `Nenhum membro ${filter === 'active' ? 'ativo' : 'inativo'} encontrado`}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredReferrals.map((referral: any) => (
              <div
                key={referral.walletAddress}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-mono text-sm truncate">
                        {referral.walletAddress.slice(0, 10)}...{referral.walletAddress.slice(-8)}
                      </p>
                      {referral.active ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Nível {referral.level} • Max Nível {referral.maxLevel}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      ${parseFloat(referral.monthlyVolume || '0').toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">Volume</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Info Box */}
      <GlassCard className="p-5 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <h3 className="text-white font-semibold">Como funciona o MLM?</h3>
        </div>
        <ul className="text-gray-300 text-sm space-y-2 ml-8">
          <li>• Você ganha comissões em <strong>10 níveis</strong></li>
          <li>• Quando alguém na sua rede gera performance fees, você recebe uma parte</li>
          <li>• Quanto mais pessoas ativas, mais você ganha</li>
          <li>• Todas as comissões são pagas automaticamente via smart contract</li>
        </ul>
      </GlassCard>
    </PageLayout>
  )
}
