/**
 * 🎭 GMI Summary Card
 *
 * Exibe dados da conta GMI/MT5 (trading)
 *
 * ⚠️ Dados atualmente são MOCK para desenvolvimento
 */

'use client';

import { useGMIData } from '@/hooks/useGMIData';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export function GMISummaryCard() {
  const {
    data,
    loading,
    connected,
    isMock,
    balance,
    equity,
    monthlyVolume,
    netProfit,
    totalTrades,
    winRate,
    refetch
  } = useGMIData();

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && !data) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Trading Account
              {isMock && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                  MOCK
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400">
              {connected ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected to GMI Markets
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Disconnected
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Balance */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <p className="text-sm text-gray-400">Balance</p>
          </div>
          <p className="text-2xl font-bold text-white">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Equity */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-400" />
            <p className="text-sm text-gray-400">Equity</p>
          </div>
          <p className="text-2xl font-bold text-white">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="space-y-3">
        {/* Monthly Volume */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <span className="text-sm text-gray-400">Monthly Volume</span>
          <span className="text-sm font-semibold text-white">
            ${monthlyVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Net Profit */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <span className="text-sm text-gray-400">Net Profit</span>
          <span className={`text-sm font-semibold flex items-center gap-1 ${
            netProfit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {netProfit >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            ${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Total Trades */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <span className="text-sm text-gray-400">Total Trades</span>
          <span className="text-sm font-semibold text-white">{totalTrades}</span>
        </div>

        {/* Win Rate */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-400">Win Rate</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${Math.min(winRate, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-white w-12 text-right">
              {winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      {isMock && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400/80 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Dados simulados para desenvolvimento. API GMI Edge real será integrada em breve.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default GMISummaryCard;
