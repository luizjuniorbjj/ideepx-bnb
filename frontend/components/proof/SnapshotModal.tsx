'use client'

import { useEffect, useState } from 'react'
import { X, Users, DollarSign, TrendingUp, Calendar, Hash, CheckCircle, XCircle } from 'lucide-react'
import api from '@/lib/api'
import type { WeeklySnapshot } from '@/types/proof'

interface SnapshotModalProps {
  ipfsHash: string
  weekNumber: number
  onClose: () => void
}

export default function SnapshotModal({ ipfsHash, weekNumber, onClose }: SnapshotModalProps) {
  const [snapshot, setSnapshot] = useState<WeeklySnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        setLoading(true)
        const response = await api.getIPFSSnapshot(ipfsHash)
        const data = response.data || response
        setSnapshot(data)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar snapshot')
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshot()
  }, [ipfsHash])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Snapshot - Semana {weekNumber}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Prova completa on-chain + IPFS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-white text-lg">🔄 Carregando snapshot do IPFS...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300">❌ {error}</p>
            </div>
          )}

          {snapshot && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <p className="text-sm text-gray-400">Usuários Ativos</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{snapshot.summary.totalUsers}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-gray-400">Lucro Total</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${(snapshot.summary.totalProfits || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-gray-400">Comissões MLM</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${(snapshot.summary.totalCommissions || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <p className="text-sm text-gray-400">Total Pago</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${(snapshot.summary.totalPaid || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Week Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Período da Semana
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Início</p>
                    <p className="text-white font-mono text-sm">
                      {new Date(snapshot.week.startDate).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Fim</p>
                    <p className="text-white font-mono text-sm">
                      {new Date(snapshot.week.endDate).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Média por Usuário</p>
                    <p className="text-white font-bold text-lg">
                      ${(snapshot.summary.averagePerUser ||
                         (snapshot.summary.totalPaid / snapshot.summary.totalUsers || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* MLM Breakdown */}
              {snapshot.mlmBreakdown && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Distribuição por Nível MLM</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(snapshot.mlmBreakdown).map(([level, data]) => (
                      <div key={level} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">{level}</p>
                        <p className="text-lg font-bold text-white">
                          ${(data.totalPaid || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {data.recipientsCount || 0} usuários
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Usuários ({snapshot.users.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-gray-400 py-3 px-2">ID</th>
                        <th className="text-left text-gray-400 py-3 px-2">Wallet</th>
                        <th className="text-right text-gray-400 py-3 px-2">Lucro</th>
                        <th className="text-right text-gray-400 py-3 px-2">Cliente (65%)</th>
                        <th className="text-right text-gray-400 py-3 px-2">Comissões</th>
                        <th className="text-right text-gray-400 py-3 px-2">LAI</th>
                        <th className="text-right text-gray-400 py-3 px-2">Net</th>
                        <th className="text-center text-gray-400 py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.users.map((user) => {
                        const commissionsTotal = user.commissions
                          ? Object.values(user.commissions).reduce((sum, c) => sum + (c.amount || 0), 0)
                          : 0
                        return (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-2 text-white">{user.id}</td>
                            <td className="py-3 px-2 text-white font-mono text-xs">
                              {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                            </td>
                            <td className="py-3 px-2 text-right text-white">
                              ${(user.profit || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right text-green-400">
                              ${(user.clientShare || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right text-blue-400">
                              ${commissionsTotal.toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right text-red-400">
                              -${(user.subscription?.cost || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-right text-white font-bold">
                              ${(user.netReceived || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {user.subscription?.active ? (
                                <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Validação (Checksums)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Total Users</p>
                    <p className="text-white font-mono">{snapshot.validation.totalUsersChecksum}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Commissions</p>
                    <p className="text-white font-mono">{snapshot.validation.totalCommissionsChecksum.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">MLM Breakdown</p>
                    <p className="text-white font-mono">{snapshot.validation.mlmBreakdownChecksum.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <a
            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition"
          >
            Ver JSON Completo no IPFS ↗
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
