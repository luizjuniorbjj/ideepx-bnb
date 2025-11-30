/**
 * MT5 Detailed Stats
 *
 * Estatísticas completas com histórico mensal:
 * - Saldo atual
 * - % Lucro de meses passados (últimos 6 meses)
 * - Lucro do mês atual
 */

'use client';

import { useGMIData } from '@/hooks/useGMIData';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3 } from 'lucide-react';

export function MT5DetailedStats() {
  const {
    data,
    loading,
    balance,
    equity,
    netProfit,
    monthlyVolume,
    totalTrades,
    winRate,
    connected,
    account
  } = useGMIData();

  // Mês atual (dados REAIS da API GMI Edge)
  const currentMonthProfit = netProfit;
  const currentMonthPercent = balance > 0 ? ((currentMonthProfit / balance) * 100) : 0;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');

  if (loading && !data) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/20 p-2 rounded-lg">
          <BarChart3 className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Estatísticas Completas</h3>
          <p className="text-sm text-gray-400">Desempenho detalhado da conta</p>
        </div>
      </div>

      {/* Current Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Balance */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <p className="text-sm text-gray-400">Saldo</p>
          </div>
          <p className="text-2xl font-bold text-white">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Equity: ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Monthly Volume */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <p className="text-sm text-gray-400">Volume Mensal</p>
          </div>
          <p className="text-2xl font-bold text-white">
            ${monthlyVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalTrades} operações
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-sm text-gray-400">Taxa de Acerto</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {winRate.toFixed(1)}%
          </p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(winRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Current Month */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Lucro - {currentMonth}</p>
              <p className={`text-2xl font-bold flex items-center gap-2 ${
                currentMonthProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentMonthProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                ${Math.abs(currentMonthProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">% Lucro</p>
            <p className={`text-3xl font-bold ${
              currentMonthPercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentMonthPercent >= 0 ? '+' : ''}{currentMonthPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400/80">
          ✅ Dados sincronizados em tempo real com a API GMI Edge.
          Todos os valores exibidos (saldo, equity, volume, lucro mensal) são 100% reais da sua conta MT5.
        </p>
      </div>

      {/* Future Feature Note */}
      <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-400/80">
          📊 Em breve: Histórico detalhado de performance dos últimos 6 meses (lucro mensal, % retorno, etc).
        </p>
      </div>
    </div>
  );
}

export default MT5DetailedStats;
