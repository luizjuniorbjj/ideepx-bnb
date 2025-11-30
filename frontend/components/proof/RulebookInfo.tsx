'use client'

import { FileText, Hash, Calendar, Package } from 'lucide-react'
import type { RulebookInfo } from '@/types/proof'

interface RulebookInfoProps {
  info: RulebookInfo
}

export default function RulebookInfo({ info }: RulebookInfoProps) {
  const deployDate = new Date(info.deployedAt * 1000)

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Rulebook Imutável</h2>
          <p className="text-sm text-gray-400">Plano de comissões registrado on-chain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plano */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-gray-400">Nome do Plano</p>
          </div>
          <p className="text-lg font-bold text-white">{info.planName}</p>
        </div>

        {/* Versão */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-gray-400">Versão</p>
          </div>
          <p className="text-lg font-bold text-white">{info.version}</p>
        </div>

        {/* Data de Deploy */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <p className="text-sm text-gray-400">Deploy em</p>
          </div>
          <p className="text-sm font-mono text-white">
            {deployDate.toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {deployDate.toLocaleTimeString('pt-BR')}
          </p>
        </div>

        {/* Content Hash */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-cyan-400" />
            <p className="text-sm text-gray-400">Content Hash</p>
          </div>
          <p className="text-xs font-mono text-white break-all">
            {info.contentHash.slice(0, 20)}...
          </p>
        </div>
      </div>

      {/* IPFS CID */}
      <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <p className="text-sm text-purple-300 mb-2">IPFS CID (Plano Completo)</p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-mono text-white break-all">{info.ipfsCid}</p>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${info.ipfsCid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition whitespace-nowrap"
          >
            Ver no IPFS ↗
          </a>
        </div>
      </div>

      {/* Endereço do Contrato */}
      <div className="mt-4 bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-2">Endereço do Contrato</p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-mono text-white break-all">{info.address}</p>
          <a
            href={`https://testnet.bscscan.com/address/${info.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
          >
            Ver no BSCScan ↗
          </a>
        </div>
      </div>
    </div>
  )
}
