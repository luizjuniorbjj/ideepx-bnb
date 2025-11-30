/**
 * Card de Lucro Semanal
 *
 * Exibe lucro semanal e distribuição (cliente, empresa, MLM)
 */

'use client';

import { useWeeklyProfit } from '@/hooks/useWeeklyProfit';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, Users } from 'lucide-react';

export function WeeklyProfitCard() {
  const {
    data,
    loading,
    error,
    weeklyNetProfit,
    clientShare,
    mlmPool,
    winRate,
    totalTrades
  } = useWeeklyProfit();

  if (loading && !data) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-400">Erro ao buscar lucro semanal</h3>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isProfitable = weeklyNetProfit >= 0;
  const weekStart = new Date(data.period.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const weekEnd = new Date(data.period.end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Lucro Semanal</h3>
            <p className="text-sm text-gray-400">{weekStart} - {weekEnd}</p>
          </div>
        </div>

        {/* Source Badge */}
        {data.source === 'mock-fallback' && (
          <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400 font-medium">DEMO</p>
          </div>
        )}
      </div>

      {/* Main Profit Display */}
      <div className={`bg-gradient-to-br rounded-lg p-6 mb-6 ${
        isProfitable
          ? 'from-green-500/10 to-emerald-500/10 border border-green-500/30'
          : 'from-red-500/10 to-orange-500/10 border border-red-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Lucro Líquido (7 dias)</p>
            <div className={`text-3xl font-bold flex items-center gap-2 ${
              isProfitable ? 'text-green-400' : 'text-red-400'
            }`}>
              {isProfitable ? (
                <TrendingUp className="h-7 w-7" />
              ) : (
                <TrendingDown className="h-7 w-7" />
              )}
              <span>
                {isProfitable ? '+' : '-'}${Math.abs(weeklyNetProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Trades Info */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Operações</p>
            <p className="text-2xl font-bold text-white">{totalTrades}</p>
            <p className="text-xs text-gray-500 mt-1">Win Rate: {winRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cliente Share */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <p className="text-sm text-gray-400">Você Recebe (65%)</p>
          </div>
          <p className={`text-xl font-bold ${clientShare >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {clientShare >= 0 ? '+' : '-'}${Math.abs(clientShare).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* MLM Pool */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-400" />
            <p className="text-sm text-gray-400">MLM Pool (16.25%)</p>
          </div>
          <p className={`text-xl font-bold ${mlmPool >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {mlmPool >= 0 ? '+' : '-'}${Math.abs(mlmPool).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">25% do seu share</p>
        </div>

        {/* Company Fee */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-400" />
            <p className="text-sm text-gray-400">Empresa (35%)</p>
          </div>
          <p className={`text-xl font-bold ${data.distribution.companyFee >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {data.distribution.companyFee >= 0 ? '+' : '-'}${Math.abs(data.distribution.companyFee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-900/30 rounded-lg p-3">
          <p className="text-xs text-gray-400">Volume</p>
          <p className="text-sm font-semibold text-white">
            ${data.metrics.weeklyVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-gray-900/30 rounded-lg p-3">
          <p className="text-xs text-gray-400">Lucros</p>
          <p className="text-sm font-semibold text-green-400">
            ${data.metrics.weeklyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gray-900/30 rounded-lg p-3">
          <p className="text-xs text-gray-400">Perdas</p>
          <p className="text-sm font-semibold text-red-400">
            ${data.metrics.weeklyLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gray-900/30 rounded-lg p-3">
          <p className="text-xs text-gray-400">Profit Factor</p>
          <p className="text-sm font-semibold text-white">
            {data.metrics.profitFactor.toFixed(2)}x
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400/80">
          {data.source === 'gmi-edge-api' ? (
            <>✅ Dados sincronizados em tempo real com a API GMI Edge. Cálculo de comissões MLM baseado no lucro semanal real.</>
          ) : (
            <>⚠️ Modo demonstração: Dados simulados para fins de teste. Conecte uma conta GMI Edge real para dados precisos.</>
          )}
        </p>
      </div>
    </div>
  );
}

export default WeeklyProfitCard;
