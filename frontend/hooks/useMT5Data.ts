/**
 * 🔌 Hook useMT5Data - Dados reais do MetaTrader 5
 *
 * Este hook busca dados reais da conta MT5 via backend Python integration.
 * Retorna informações da conta, performance mensal e posições abertas.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MT5Account {
  login: number;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  credit: number;
  leverage: number;
  currency: string;
}

export interface MT5Performance {
  monthlyVolume: number;
  totalTrades: number;
  profitTrades: number;
  lossTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  profitFactor: number;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  open_price: number;
  current_price: number;
  profit: number;
  sl: number;
  tp: number;
  swap: number;
  commission: number;
  time: string;
}

export interface MT5Data {
  success: boolean;
  connected: boolean;
  account: MT5Account | null;
  performance: MT5Performance | null;
  positions: MT5Position[];
  lastUpdate: string;
  syncTime?: number;
  error?: string;
}

export interface MT5Eligibility {
  eligible: boolean;
  maxLevel: number;
  reason: string;
  volumeRequirement: number;
  currentVolume: number;
  directsRequirement: number;
  currentDirects: number;
  volumeMultiplier: string;
  source: string;
  timestamp: string;
}

export function useMT5Data() {
  const { address } = useAccount();
  const [data, setData] = useState<MT5Data | null>(null);
  const [eligibility, setEligibility] = useState<MT5Eligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch MT5 account data
   */
  const fetchAccountData = useCallback(async () => {
    if (!address) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTime = performance.now();

      const response = await fetch(
        `${API_BASE_URL}/api/dev/mt5/account/${address}`
      );

      if (!response.ok) {
        if (response.status === 403) {
          // Not MT5 account owner - return empty data
          setData({
            success: false,
            connected: false,
            account: null,
            performance: null,
            positions: [],
            lastUpdate: new Date().toISOString(),
            error: 'Not MT5 account owner'
          });
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to fetch MT5 data');
      }

      const result = await response.json();
      const endTime = performance.now();

      console.log(`✅ [useMT5Data] Data fetched in ${(endTime - startTime).toFixed(0)}ms`);

      setData(result);
    } catch (err: any) {
      console.error('❌ [useMT5Data] Error:', err);
      setError(err.message);
      setData({
        success: false,
        connected: false,
        account: null,
        performance: null,
        positions: [],
        lastUpdate: new Date().toISOString(),
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [address]);

  /**
   * Fetch MT5 eligibility
   */
  const fetchEligibility = useCallback(async () => {
    if (!address) {
      setEligibility(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dev/mt5/eligibility/${address}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch MT5 eligibility');
      }

      const result = await response.json();
      setEligibility(result);
    } catch (err: any) {
      console.error('❌ [useMT5Data] Eligibility error:', err);
      setEligibility(null);
    }
  }, [address]);

  /**
   * Sync MT5 data with database
   */
  const syncMT5 = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dev/mt5/sync/${address}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to sync MT5 data');
      }

      const result = await response.json();
      console.log('✅ [useMT5Data] Sync successful:', result);

      // Refetch data after sync
      await fetchAccountData();
      await fetchEligibility();

      return result;
    } catch (err: any) {
      console.error('❌ [useMT5Data] Sync error:', err);
      throw err;
    }
  }, [address, fetchAccountData, fetchEligibility]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchAccountData();
    fetchEligibility();
  }, [fetchAccountData, fetchEligibility]);

  return {
    // Data
    data,
    eligibility,
    loading,
    error,

    // Account data (shortcuts)
    account: data?.account,
    performance: data?.performance,
    positions: data?.positions || [],
    connected: data?.connected || false,

    // Calculated values
    balance: data?.account?.balance || 0,
    equity: data?.account?.equity || 0,
    monthlyVolume: data?.performance?.monthlyVolume || 0,
    netProfit: data?.performance?.netProfit || 0,
    totalTrades: data?.performance?.totalTrades || 0,
    winRate: data?.performance?.winRate || 0,

    // Eligibility
    eligible: eligibility?.eligible || false,
    maxLevel: eligibility?.maxLevel || 1,
    volumeRequirement: eligibility?.volumeRequirement || 5000,
    currentVolume: eligibility?.currentVolume || 0,

    // Actions
    refetch: fetchAccountData,
    syncMT5,
  };
}

export default useMT5Data;
