/**
 * GMI Account Summary - Resumo compacto para Dashboard
 *
 * Exibe apenas:
 * - Status de conexão
 * - Número da conta
 * - Saldo
 * - % Lucro
 * - Link para /mt5 (dados completos)
 */

'use client';

import { useGMIData } from '@/hooks/useGMIData';
import { Activity, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function GMIAccountSummary() {
  const {
    data,
    loading,
    connected,
    isMock,
    balance,
    netProfit
  } = useGMIData();

  // Calcular % de lucro
  const profitPercentage = balance > 0 ? ((netProfit / balance) * 100) : 0;
  const accountNumber = data?.account?.accountId || '----';

  if (loading && !data) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Conta Trading</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              {connected ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  GMI Connected
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Disconnected
                </>
              )}
            </p>
          </div>
        </div>
        {isMock && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
            MOCK
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 mb-4">
        {/* Account Number */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Conta</span>
          <span className="text-sm font-semibold text-white font-mono">{accountNumber}</span>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Saldo</span>
          <span className="text-lg font-bold text-white">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Profit % */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Lucro</span>
          <span className={`text-sm font-semibold flex items-center gap-1 ${
            profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {profitPercentage >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Link to Full Page */}
      <Link
        href="/gmi-hedge"
        className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors py-2 border-t border-gray-700"
      >
        <span>Ver detalhes completos</span>
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default GMIAccountSummary;
