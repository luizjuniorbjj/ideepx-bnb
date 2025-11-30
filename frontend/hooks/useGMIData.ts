/**
 * Hook useGMIData - Dados da conta GMI/MT5
 *
 * Sistema ROBUSTO com retry automático e auto-refresh
 * Dados 100% REAIS da API GMI Edge quando conectado
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';

// Usar o proxy do Next.js em vez de requisições diretas ao backend
// O Next.js fará proxy de /api/* para http://localhost:5001/api/*
const API_BASE_URL = '/api';

export interface GMIAccount {
  accountId: string;
  accountType: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  leverage: number;
  server: string;
  status: string;
}

export interface GMIPerformance {
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

export interface GMIPosition {
  positionId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  sl: number;
  tp: number;
  swap: number;
  commission: number;
  openTime: string;
}

export interface GMIData {
  success: boolean;
  connected: boolean;
  account: GMIAccount | null;
  performance: GMIPerformance | null;
  positions: GMIPosition[];
  lastUpdate: string;
  source: string;
}

export interface GMIEligibility {
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

export function useGMIData() {
  const { address } = useAccount();
  const [data, setData] = useState<GMIData | null>(null);
  const [eligibility, setEligibility] = useState<GMIEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch account data com sistema de retry automático
   */
  const fetchAccountDataWithRetry = useCallback(async (attempt: number = 1): Promise<void> => {
    if (!address) {
      setData(null);
      return;
    }

    // Cancelar request anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      console.log(`🔄 [useGMIData] Fetching account data (attempt ${attempt}/${MAX_RETRIES})...`);

      setLoading(true);
      setError(null);
      setRetryCount(attempt - 1);

      const startTime = performance.now();

      const response = await fetch(
        `${API_BASE_URL}/dev/gmi/account/${address}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch GMI data');
      }

      const result = await response.json();
      const endTime = performance.now();

      const isMock = result.source === 'mock';
      const isReal = result.source === 'gmi-edge-api';

      console.log(
        `${isReal ? '✅ REAL' : isMock ? '⚠️ MOCK' : '❓ UNKNOWN'} [useGMIData] Data fetched in ${(endTime - startTime).toFixed(0)}ms`
      );

      // LOGS CRÍTICOS - DEBUG
      console.log('🔍 [useGMIData] DADOS COMPLETOS RETORNADOS:');
      console.log('   - success:', result.success);
      console.log('   - connected:', result.connected);
      console.log('   - source:', result.source);
      console.log('   - account exists:', !!result.account);
      console.log('   - account.accountId:', result.account?.accountId);
      console.log('   - account.balance:', result.account?.balance);
      console.log('   - account.equity:', result.account?.equity);

      if (result.connected) {
        console.log(`💰 [useGMIData] Balance: $${result.account?.balance?.toFixed(2) || '0.00'}`);
        console.log(`📊 [useGMIData] Equity: $${result.account?.equity?.toFixed(2) || '0.00'}`);
      } else {
        console.warn('⚠️ [useGMIData] ATENÇÃO: connected = FALSE!');
      }

      console.log('📝 [useGMIData] Salvando no estado setData(result)...');
      setData(result);
      setLastUpdate(new Date());
      setRetryCount(0);
      console.log('✅ [useGMIData] Estado atualizado!');
    } catch (err: any) {
      // Se foi abortado, ignorar
      if (err.name === 'AbortError') {
        console.log('🚫 [useGMIData] Request aborted');
        return;
      }

      console.error(`❌ [useGMIData] Error on attempt ${attempt}:`, err.message);

      // Tentar novamente se ainda tem tentativas
      if (attempt < MAX_RETRIES) {
        console.log(`🔁 [useGMIData] Retrying in ${RETRY_DELAY}ms...`);

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        // Retry recursivo
        return fetchAccountDataWithRetry(attempt + 1);
      } else {
        // Todas as tentativas falharam
        console.error(`💥 [useGMIData] All ${MAX_RETRIES} attempts failed`);
        setError(err.message);
        setData({
          success: false,
          connected: false,
          account: null,
          performance: null,
          positions: [],
          lastUpdate: new Date().toISOString(),
          source: 'error'
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [address]);

  /**
   * Fetch account data sem retry (para chamadas manuais)
   */
  const fetchAccountData = useCallback(async () => {
    return fetchAccountDataWithRetry(1);
  }, [fetchAccountDataWithRetry]);

  /**
   * Fetch GMI eligibility
   */
  const fetchEligibility = useCallback(async () => {
    if (!address) {
      setEligibility(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/dev/gmi/eligibility/${address}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch GMI eligibility');
      }

      const result = await response.json();
      setEligibility(result);
    } catch (err: any) {
      console.error('❌ [useGMIData] Eligibility error:', err);
      setEligibility(null);
    }
  }, [address]);

  /**
   * Sync GMI data with database
   */
  const syncGMI = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/dev/gmi/sync/${address}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to sync GMI data');
      }

      const result = await response.json();
      console.log('✅ [useGMIData] Sync successful:', result);

      // Refetch data after sync
      await fetchAccountData();
      await fetchEligibility();

      return result;
    } catch (err: any) {
      console.error('❌ [useGMIData] Sync error:', err);
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

  /**
   * Auto-refresh a cada 5 minutos quando conectado
   */
  useEffect(() => {
    if (!address || !data || !data.connected) {
      return;
    }

    console.log(`⏱️ [useGMIData] Auto-refresh enabled (every ${AUTO_REFRESH_INTERVAL / 60000} minutes)`);

    const interval = setInterval(() => {
      console.log('🔄 [useGMIData] Auto-refresh triggered');
      fetchAccountData();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      console.log('⏹️ [useGMIData] Auto-refresh disabled');
      clearInterval(interval);
    };
  }, [address, data, fetchAccountData]);

  /**
   * Limpar ao desmontar
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * LOG quando estado connected mudar
   */
  useEffect(() => {
    if (data) {
      console.log('🎁 [useGMIData] Estado connected mudou:');
      console.log('   - connected:', data.connected);
      console.log('   - source:', data.source);
      console.log('   - account exists:', !!data.account);
      console.log('   - balance:', data.account?.balance);
    }
  }, [data?.connected]);

  const returnValue = {
    // Data
    data,
    eligibility,
    loading,
    error,
    retryCount,
    lastUpdate,

    // Account data (shortcuts)
    account: data?.account,
    performance: data?.performance,
    positions: data?.positions || [],
    connected: data?.connected || false,
    isMock: data?.source === 'mock',
    isReal: data?.source === 'gmi-edge-api',

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
    syncGMI,
  };

  return returnValue;
}

export default useGMIData;
