'use client'

import { CheckCircle, Users, DollarSign, Calendar, FileText, ExternalLink } from 'lucide-react'
import type { WeeklyProof } from '@/types/proof'

interface ProofCardProps {
  proof: WeeklyProof
  onViewDetails?: () => void
}

export default function ProofCard({ proof, onViewDetails }: ProofCardProps) {
  const proofDate = new Date(proof.timestamp * 1000)
  const totalCommissionsNum = parseFloat(proof.totalCommissions)
  const totalProfitsNum = parseFloat(proof.totalProfits)

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Semana {proof.weekNumber}</h3>
            <p className="text-sm text-gray-400">
              {proofDate.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {proof.finalized && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">Finalizado</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Users */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Usuários Ativos</p>
          </div>
          <p className="text-2xl font-bold text-white">{proof.totalUsers}</p>
        </div>

        {/* Total Commissions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Comissões MLM</p>
          </div>
          <p className="text-2xl font-bold text-white">
            ${totalCommissionsNum.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Total Profits */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
        <p className="text-sm text-blue-300 mb-1">Lucro Total Distribuído</p>
        <p className="text-2xl font-bold text-white">
          ${totalProfitsNum.toFixed(2)}
        </p>
      </div>

      {/* IPFS Hash */}
      <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-3 mb-4">
        <p className="text-xs text-gray-400 mb-2">IPFS Hash</p>
        <p className="text-xs font-mono text-white break-all">
          {proof.ipfsHash}
        </p>
      </div>

      {/* Submitter */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-1">Submetido por</p>
        <p className="text-xs font-mono text-gray-300">
          {proof.submittedBy.slice(0, 10)}...{proof.submittedBy.slice(-8)}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onViewDetails}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Ver Detalhes
        </button>

        <a
          href={`https://gateway.pinata.cloud/ipfs/${proof.ipfsHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm rounded-xl font-semibold hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          IPFS
        </a>
      </div>
    </div>
  )
}
