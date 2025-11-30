'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Users, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react'

interface TreeNode {
  id: string
  walletAddress: string
  level: number
  directReferrals: number
  networkSize: number
  active: boolean
  maxLevel: number
  monthlyVolume: number
  totalEarned: number
  internalBalance: number
  subscriptionActive: boolean
  children: TreeNode[]
}

interface MlmTreeViewProps {
  tree: TreeNode
  onNodeClick?: (node: TreeNode) => void
}

export default function MlmTreeView({ tree, onNodeClick }: MlmTreeViewProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Visualização da Árvore MLM
        </h2>
        <p className="text-gray-400 text-sm">Estrutura completa da sua rede unilevel</p>
      </div>

      <div className="overflow-x-auto">
        <TreeNodeComponent node={tree} onNodeClick={onNodeClick} />
      </div>
    </div>
  )
}

function TreeNodeComponent({ node, onNodeClick, depth = 0 }: { node: TreeNode; onNodeClick?: (node: TreeNode) => void; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 3) // Auto-expand primeiros 3 níveis

  const getLevelColor = (level: number) => {
    const colors = [
      'from-red-500/20 to-red-600/20 border-red-500',
      'from-orange-500/20 to-orange-600/20 border-orange-500',
      'from-yellow-500/20 to-yellow-600/20 border-yellow-500',
      'from-green-500/20 to-green-600/20 border-green-500',
      'from-teal-500/20 to-teal-600/20 border-teal-500',
      'from-blue-500/20 to-blue-600/20 border-blue-500',
      'from-purple-500/20 to-purple-600/20 border-purple-500',
      'from-pink-500/20 to-pink-600/20 border-pink-500',
      'from-indigo-500/20 to-indigo-600/20 border-indigo-500',
      'from-gray-500/20 to-gray-600/20 border-gray-500',
    ]
    return colors[level % colors.length]
  }

  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="ml-4">
      <div className="flex items-start gap-2 mb-2">
        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 p-1 hover:bg-white/10 rounded transition"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}

        {/* Node Card */}
        <div
          onClick={() => onNodeClick?.(node)}
          className={`
            flex-1 min-w-[320px] p-4 rounded-xl border-2 bg-gradient-to-br
            ${getLevelColor(node.level)}
            hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                {node.walletAddress.slice(0, 6)}...{node.walletAddress.slice(-4)}
              </span>
              {node.active ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/20 text-white">
                Nível {node.level}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="flex items-center gap-1 text-gray-300">
              <Users className="w-3 h-3" />
              <span>Diretos: {node.directReferrals}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <TrendingUp className="w-3 h-3" />
              <span>Rede: {node.networkSize}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <span>💼 Nível Max: {node.maxLevel}/10</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <span>{node.subscriptionActive ? '✅ Assinatura' : '❌ Expirada'}</span>
            </div>
          </div>

          {/* Finance */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="flex items-center gap-1 text-green-400">
              <DollarSign className="w-3 h-3" />
              <span>Volume: ${node.monthlyVolume.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <DollarSign className="w-3 h-3" />
              <span>Ganhou: ${node.totalEarned.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 border-l-2 border-white/10 pl-2">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              onNodeClick={onNodeClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
