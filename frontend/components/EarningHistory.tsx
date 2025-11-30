'use client'

import { useState, useMemo } from 'react'
import { Address } from 'viem'
import { useGetEarningHistory } from '@/hooks/useContract'
import { formatUSDT } from '@/config/contracts'

// Tipos de ganhos
type EarningType = 'MLM Commission' | 'Direct Bonus' | 'Subscription' | 'Unknown'

interface EarningRecord {
  timestamp: bigint
  amount: bigint
  level: number
  clientAddress: Address
}

interface EarningHistoryProps {
  userAddress?: Address
  maxRecords?: number
}

export default function EarningHistory({ userAddress, maxRecords = 50 }: EarningHistoryProps) {
  const { data: earningHistory, isLoading, isError } = useGetEarningHistory(userAddress, maxRecords)

  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Processar dados do histórico
  const earnings = useMemo(() => {
    if (!earningHistory || !Array.isArray(earningHistory) || earningHistory.length === 0) {
      return []
    }

    // O contrato retorna: (uint256[] timestamps, uint256[] amounts, uint8[] levels, address[] clients)
    const [timestamps, amounts, levels, clients] = earningHistory

    if (!timestamps || !amounts || !levels || !clients) return []

    const records: EarningRecord[] = []

    for (let i = 0; i < timestamps.length; i++) {
      records.push({
        timestamp: timestamps[i] as bigint,
        amount: amounts[i] as bigint,
        level: Number(levels[i]),
        clientAddress: clients[i] as Address,
      })
    }

    return records
  }, [earningHistory])

  // Aplicar filtros
  const filteredEarnings = useMemo(() => {
    let filtered = [...earnings]

    // Filtrar por nível
    if (filterLevel !== 'all') {
      filtered = filtered.filter(e => e.level === filterLevel)
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = Number(a.timestamp - b.timestamp)
        return sortOrder === 'asc' ? comparison : -comparison
      } else {
        const comparison = Number(a.amount - b.amount)
        return sortOrder === 'asc' ? comparison : -comparison
      }
    })

    return filtered
  }, [earnings, filterLevel, sortBy, sortOrder])

  // Determinar tipo de ganho baseado no nível e valor
  const getEarningType = (level: number, amount: bigint): EarningType => {
    if (level === 0) {
      // Nível 0 pode ser Direct Bonus ($5) ou Subscription
      if (amount === 5_000000000000000000n) return 'Direct Bonus'
      if (amount === 29_000000000000000000n) return 'Subscription'
      return 'Unknown'
    }
    return 'MLM Commission'
  }

  // Formatar data
  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Encurtar endereço
  const shortenAddress = (address: Address): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredEarnings.reduce((sum, e) => sum + e.amount, 0n)
    const byLevel: { [key: number]: bigint } = {}

    filteredEarnings.forEach(e => {
      byLevel[e.level] = (byLevel[e.level] || 0n) + e.amount
    })

    return { total, byLevel, count: filteredEarnings.length }
  }, [filteredEarnings])

  if (!userAddress) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border border-gray-700">
        <p className="text-gray-400">Conecte sua carteira para ver o histórico de ganhos</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 border border-gray-700">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border border-red-900">
        <p className="text-red-400">❌ Erro ao carregar histórico de ganhos</p>
      </div>
    )
  }

  if (earnings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border border-gray-700">
        <p className="text-gray-400">📊 Nenhum ganho registrado ainda</p>
        <p className="text-sm text-gray-500 mt-2">Seus ganhos aparecerão aqui quando você começar a receber comissões</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">📊 Histórico de Ganhos</h2>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-green-400">{stats.count}</span> registro(s) |
            Total: <span className="font-semibold text-green-400">${formatUSDT(stats.total)}</span>
          </div>
        </div>
      </div>

      {/* Filtros e Ordenação */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por Nível */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Nível</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os níveis</option>
            <option value={0}>Diretos</option>
            <option value={1}>Nível 1</option>
            <option value={2}>Nível 2</option>
            <option value={3}>Nível 3</option>
            <option value={4}>Nível 4</option>
            <option value={5}>Nível 5</option>
            <option value={6}>Nível 6</option>
            <option value={7}>Nível 7</option>
            <option value={8}>Nível 8</option>
            <option value={9}>Nível 9</option>
            <option value={10}>Nível 10</option>
          </select>
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Data</option>
            <option value="amount">Valor</option>
          </select>
        </div>

        {/* Ordem */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ordem</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Mais recente primeiro</option>
            <option value="asc">Mais antigo primeiro</option>
          </select>
        </div>
      </div>

      {/* Estatísticas por Nível */}
      {Object.keys(stats.byLevel).length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats.byLevel)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([level, amount]) => (
              <div key={level} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-gray-400">
                  {level === '0' ? 'Direto' : `Nível ${level}`}
                </div>
                <div className="text-sm font-bold text-green-400">${formatUSDT(amount)}</div>
              </div>
            ))}
        </div>
      )}

      {/* Tabela de Histórico */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Tipo</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Nível</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Cliente</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredEarnings.map((earning, index) => {
              const earningType = getEarningType(earning.level, earning.amount)

              return (
                <tr
                  key={index}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-300">
                    {formatDate(earning.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${earningType === 'MLM Commission' ? 'bg-blue-900/50 text-blue-300' : ''}
                      ${earningType === 'Direct Bonus' ? 'bg-green-900/50 text-green-300' : ''}
                      ${earningType === 'Subscription' ? 'bg-purple-900/50 text-purple-300' : ''}
                      ${earningType === 'Unknown' ? 'bg-gray-700 text-gray-300' : ''}
                    `}>
                      {earningType === 'MLM Commission' ? '🔄 Comissão MLM' : ''}
                      {earningType === 'Direct Bonus' ? '🎁 Bônus Direto' : ''}
                      {earningType === 'Subscription' ? '📝 Assinatura' : ''}
                      {earningType === 'Unknown' ? '❓ Desconhecido' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {earning.level === 0 ? (
                      <span className="text-yellow-400 font-medium">L0</span>
                    ) : (
                      <span className="text-blue-400 font-medium">L{earning.level}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`https://bscscan.com/address/${earning.clientAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors font-mono"
                    >
                      {shortenAddress(earning.clientAddress)}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-green-400">
                      +${formatUSDT(earning.amount)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer com resumo */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-400">
          Mostrando {filteredEarnings.length} de {earnings.length} registros
          {filterLevel !== 'all' && ` (filtrado por ${filterLevel === 0 ? 'Diretos' : `Nível ${filterLevel}`})`}
        </p>
      </div>
    </div>
  )
}
