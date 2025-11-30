'use client'

import { useState, useMemo } from 'react'
import { useIsBetaMode, useActiveMLMPercentages } from '@/hooks/useContract'
import { formatUSDT } from '@/config/contracts'

// Percentuais MLM (em basis points: 100 = 1%)
const MLM_PERCENTAGES_BETA = [600, 300, 250, 200, 100, 100, 100, 100, 100, 100] // Total: 2050 (20.5%)
const MLM_PERCENTAGES_PERMANENT = [400, 200, 150, 100, 100, 100, 100, 100, 100, 100] // Total: 1450 (14.5%)

// Distribuição dos pools (em basis points: 100 = 1%)
const POOL_DISTRIBUTION = {
  mlm: 6000,        // 60%
  liquidity: 500,   // 5%
  infrastructure: 1200, // 12%
  company: 2300     // 23%
}

export default function MLMCalculator() {
  const [performanceFee, setPerformanceFee] = useState<string>('100')
  const [customMode, setCustomMode] = useState<'beta' | 'permanent'>('beta')
  const [useContractMode, setUseContractMode] = useState<boolean>(true)

  // Buscar modo atual do contrato
  const { data: contractBetaMode } = useIsBetaMode()
  const { data: contractPercentages } = useActiveMLMPercentages()

  // Determinar qual modo usar
  const currentMode = useContractMode ? (contractBetaMode ? 'beta' : 'permanent') : customMode

  // Calcular distribuição
  const distribution = useMemo(() => {
    const feeValue = parseFloat(performanceFee) || 0
    const feeBigInt = BigInt(Math.floor(feeValue * 1e18))

    // Pool distributions
    const mlmPool = (feeBigInt * BigInt(POOL_DISTRIBUTION.mlm)) / 10000n
    const liquidityPool = (feeBigInt * BigInt(POOL_DISTRIBUTION.liquidity)) / 10000n
    const infrastructurePool = (feeBigInt * BigInt(POOL_DISTRIBUTION.infrastructure)) / 10000n
    const companyPool = (feeBigInt * BigInt(POOL_DISTRIBUTION.company)) / 10000n

    // MLM levels
    const percentages = currentMode === 'beta' ? MLM_PERCENTAGES_BETA : MLM_PERCENTAGES_PERMANENT
    const levels = percentages.map((percent, index) => {
      const amount = (mlmPool * BigInt(percent)) / 10000n
      return {
        level: index + 1,
        percent: percent / 100, // Convert to percentage
        amount: amount,
        amountUSD: formatUSDT(amount)
      }
    })

    const totalMLM = levels.reduce((sum, l) => sum + l.amount, 0n)

    return {
      total: feeBigInt,
      pools: {
        mlm: mlmPool,
        liquidity: liquidityPool,
        infrastructure: infrastructurePool,
        company: companyPool
      },
      levels,
      totalMLM
    }
  }, [performanceFee, currentMode])

  // Exemplos pré-definidos
  const examples = [
    { label: '$100', value: '100' },
    { label: '$500', value: '500' },
    { label: '$1,000', value: '1000' },
    { label: '$5,000', value: '5000' },
    { label: '$10,000', value: '10000' }
  ]

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🧮 Calculadora MLM</h2>
        <p className="text-sm text-gray-400">
          Calcule a distribuição de comissões nos 10 níveis MLM
        </p>
      </div>

      {/* Controles */}
      <div className="mb-6 space-y-4">
        {/* Input de Performance Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Performance Fee (USDT)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={performanceFee}
              onChange={(e) => setPerformanceFee(e.target.value)}
              placeholder="100"
              min="0"
              step="10"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Exemplos rápidos */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Exemplos rápidos:
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.value}
                onClick={() => setPerformanceFee(example.value)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seletor de Modo */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Modo de Cálculo
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={useContractMode}
                onChange={() => setUseContractMode(true)}
                className="text-blue-500"
              />
              <span className="text-white">
                Modo do Contrato {contractBetaMode !== undefined && (
                  <span className="text-xs text-gray-400">
                    ({contractBetaMode ? 'Beta' : 'Permanente'})
                  </span>
                )}
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={!useContractMode}
                onChange={() => setUseContractMode(false)}
                className="text-blue-500"
              />
              <span className="text-white">Modo Personalizado</span>
            </label>
          </div>

          {!useContractMode && (
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => setCustomMode('beta')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  customMode === 'beta'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Beta (20.5%)
              </button>
              <button
                onClick={() => setCustomMode('permanent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  customMode === 'permanent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Permanente (14.5%)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Distribuição dos Pools */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Distribuição Total</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">MLM Pool (60%)</div>
            <div className="text-xl font-bold text-blue-400">
              ${formatUSDT(distribution.pools.mlm)}
            </div>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Liquidez (5%)</div>
            <div className="text-xl font-bold text-green-400">
              ${formatUSDT(distribution.pools.liquidity)}
            </div>
          </div>
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Infraestrutura (12%)</div>
            <div className="text-xl font-bold text-purple-400">
              ${formatUSDT(distribution.pools.infrastructure)}
            </div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Empresa (23%)</div>
            <div className="text-xl font-bold text-yellow-400">
              ${formatUSDT(distribution.pools.company)}
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição MLM por Nível */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            🎯 Distribuição MLM - Modo {currentMode === 'beta' ? 'Beta' : 'Permanente'}
          </h3>
          <div className="text-sm text-gray-400">
            Total MLM: <span className="text-blue-400 font-bold">${formatUSDT(distribution.totalMLM)}</span>
          </div>
        </div>

        {/* Tabela de Níveis */}
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Nível</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Percentual</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Valor (USDT)</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Barra</th>
              </tr>
            </thead>
            <tbody>
              {distribution.levels.map((level) => {
                const maxPercent = Math.max(...distribution.levels.map(l => l.percent))
                const barWidth = (level.percent / maxPercent) * 100

                return (
                  <tr key={level.level} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-400">L{level.level}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {level.percent}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-green-400">
                        ${level.amountUSD}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparação Beta vs Permanente */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-blue-400">💡</span>
          <div className="text-sm text-gray-300">
            <strong className="text-blue-300">Diferença entre os modos:</strong>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-blue-400 mb-1">🚀 Modo Beta</div>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• L1: 6% | L2: 3% | L3: 2.5% | L4: 2%</li>
                  <li>• L5-L10: 1% cada</li>
                  <li>• <strong>Total: 20.5%</strong> do MLM Pool</li>
                  <li>• Mais recompensas para primeiros níveis</li>
                </ul>
              </div>
              <div>
                <div className="font-bold text-purple-400 mb-1">⚡ Modo Permanente</div>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• L1: 4% | L2: 2% | L3: 1.5% | L4: 1%</li>
                  <li>• L5-L10: 1% cada</li>
                  <li>• <strong>Total: 14.5%</strong> do MLM Pool</li>
                  <li>• Distribuição mais equilibrada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fórmula de Cálculo */}
      <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-300 hover:text-white">
            🔍 Como o cálculo funciona?
          </summary>
          <div className="mt-3 text-xs text-gray-400 space-y-2">
            <p>
              <strong className="text-white">1. Divisão inicial (da Performance Fee):</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>• 60% vai para o MLM Pool</li>
              <li>• 5% vai para Pool de Liquidez</li>
              <li>• 12% vai para Infraestrutura</li>
              <li>• 23% vai para Empresa</li>
            </ul>
            <p className="mt-2">
              <strong className="text-white">2. Distribuição do MLM Pool (dos 60%):</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>• No modo Beta: L1 recebe 6%, L2 recebe 3%, etc.</li>
              <li>• No modo Permanente: L1 recebe 4%, L2 recebe 2%, etc.</li>
              <li>• Estes percentuais são aplicados sobre o MLM Pool (60% do total)</li>
            </ul>
            <p className="mt-2">
              <strong className="text-white">Exemplo com $100 no modo Beta:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>• MLM Pool = $60 (60% de $100)</li>
              <li>• L1 = $3.60 (6% de $60)</li>
              <li>• L2 = $1.80 (3% de $60)</li>
              <li>• L3 = $1.50 (2.5% de $60)</li>
              <li>• E assim por diante...</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  )
}
