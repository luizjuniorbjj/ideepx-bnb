'use client'

import { useEffect, useState } from 'react'
import { Shield, TrendingUp, Users, FileCheck, ExternalLink } from 'lucide-react'
import Logo from '@/components/Logo'
import { ConnectButton } from '@/components/ConnectButton'
import RulebookInfo from '@/components/proof/RulebookInfo'
import ProofCard from '@/components/proof/ProofCard'
import SnapshotModal from '@/components/proof/SnapshotModal'
import api from '@/lib/api'
import type { RulebookInfo as RulebookInfoType, ProofInfo, WeeklyProof } from '@/types/proof'

export default function TransparencyPage() {
  const [rulebookInfo, setRulebookInfo] = useState<RulebookInfoType | null>(null)
  const [proofInfo, setProofInfo] = useState<ProofInfo | null>(null)
  const [proofs, setProofs] = useState<WeeklyProof[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [selectedProof, setSelectedProof] = useState<WeeklyProof | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [rulebookRes, proofRes, proofsRes] = await Promise.all([
          api.getRulebookInfo(),
          api.getProofInfo(),
          api.getLatestProofs(20), // Últimas 20 semanas
        ])

        // Extrair dados das respostas (formato { success: true, data: ... })
        setRulebookInfo(rulebookRes.data || rulebookRes)
        setProofInfo(proofRes.data || proofRes)
        setProofs(proofsRes.data?.proofs || proofsRes || [])
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleViewDetails = (proof: WeeklyProof) => {
    setSelectedProof(proof)
  }

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
            <Logo size="md" href="/" />
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Transparência Total
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Todas as distribuições de lucro são registradas on-chain e armazenadas no IPFS.
            Sistema 100% transparente, auditável e imutável.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-400" />
              <span>Provas On-Chain</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <span>Dados no IPFS</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Imutável</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-xl">🔄 Carregando dados da blockchain...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
            <p className="text-red-300 text-center">❌ {error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats Overview */}
            {proofInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total de Provas</p>
                      <p className="text-3xl font-bold text-white">{proofInfo.totalProofs}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Provas submetidas desde o início</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status do Sistema</p>
                      <p className="text-2xl font-bold text-white">
                        {proofInfo.paused ? '⏸️ Pausado' : '✅ Ativo'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {proofInfo.paused ? 'Sistema temporariamente pausado' : 'Sistema operacional'}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Última Semana</p>
                      <p className="text-3xl font-bold text-white">
                        {proofs[0]?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Usuários ativos na última semana</p>
                </div>
              </div>
            )}

            {/* Rulebook Info */}
            {rulebookInfo && (
              <div className="mb-12">
                <RulebookInfo info={rulebookInfo} />
              </div>
            )}

            {/* Proofs List */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                Provas Semanais ({proofs.length})
              </h2>

              {proofs.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-gray-400 text-lg">
                    Nenhuma prova submetida ainda. Volte em breve!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proofs.map((proof) => (
                    <ProofCard
                      key={proof.weekNumber}
                      proof={proof}
                      onViewDetails={() => handleViewDetails(proof)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Contract Info */}
            {proofInfo && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Informações dos Contratos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Contrato Proof</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-mono text-white">{proofInfo.address}</p>
                      <a
                        href={`https://testnet.bscscan.com/address/${proofInfo.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
                      >
                        BSCScan ↗
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Backend Autorizado</p>
                    <p className="text-sm font-mono text-white">{proofInfo.backend}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal - Snapshot Details */}
      {selectedProof && (
        <SnapshotModal
          ipfsHash={selectedProof.ipfsHash}
          weekNumber={selectedProof.weekNumber}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  )
}
