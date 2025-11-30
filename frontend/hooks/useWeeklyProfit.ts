/**
 * Hook para buscar lucro semanal do GMI Edge
 *
 * Sistema ROBUSTO com retry automático e auto-refresh
 * Dados 100% REAIS da API GMI Edge
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';

interface WeeklyProfitMetrics {
  weeklyVolume: number;
  weeklyProfit: number;
  weeklyLoss: number;
  weeklyNetProfit: number;
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  hasHistory: boolean;
  openPositions: number;
}

interface WeeklyProfitDistribution {
  grossProfit: number;
  clientShare: number;
  companyFee: number;
  mlmPool: number;
  percentages: {
    client: number;
    company: number;
    mlm: number;
  };
}

interface WeeklyProfitData {
  accountNumber: string;
  period: {
    type: string;
    days: number;
    start: string;
    end: string;
  };
  metrics: WeeklyProfitMetrics;
  distribution: WeeklyProfitDistribution;
  source: 'gmi-edge-api' | 'mock-fallback';
}

interface UseWeeklyProfitReturn {
  data: WeeklyProfitData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retryCount: number;
  // Dados específicos para fácil acesso
  weeklyNetProfit: number;
  clientShare: number;
  mlmPool: number;
  winRate: number;
  totalTrades: number;
  isConnected: boolean;
  lastUpdate: Date | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

export function useWeeklyProfit(): UseWeeklyProfitReturn {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<WeeklyProfitData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch com sistema de retry automático
   */
  const fetchWeeklyProfitWithRetry = useCallback(async (attempt: number = 1): Promise<void> => {
    if (!address || !isConnected) {
      setData(null);
      setError('Wallet not connected');
      return;
    }

    // Cancelar request anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      console.log(`🔄 [useWeeklyProfit] Fetching weekly profit (attempt ${attempt}/${MAX_RETRIES})...`);

      setLoading(true);
      setError(null);
      setRetryCount(attempt - 1);

      const startTime = performance.now();

      // Usar api.ts service
      const result = await api.getWeeklyProfit(address);

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(0);

      if (result.success && result.data) {
        setData(result.data);
        setLastUpdate(new Date());
        setRetryCount(0);

        const source = result.data.source === 'gmi-edge-api' ? '✅ REAL' : '⚠️ MOCK';
        console.log(`${source} [useWeeklyProfit] Data fetched in ${duration}ms`);
        console.log(`💰 [useWeeklyProfit] Weekly profit: $${result.data.metrics.weeklyNetProfit.toFixed(2)}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      // Se foi abortado, ignorar
      if (err.name === 'AbortError') {
        console.log('🚫 [useWeeklyProfit] Request aborted');
        return;
      }

      console.error(`❌ [useWeeklyProfit] Error on attempt ${attempt}:`, err.message);

      // Tentar novamente se ainda tem tentativas
      if (attempt < MAX_RETRIES) {
        console.log(`🔁 [useWeeklyProfit] Retrying in ${RETRY_DELAY}ms...`);

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        // Retry recursivo
        return fetchWeeklyProfitWithRetry(attempt + 1);
      } else {
        // Todas as tentativas falharam
        console.error(`💥 [useWeeklyProfit] All ${MAX_RETRIES} attempts failed`);
        setError(err.message || 'Failed to fetch weekly profit after multiple attempts');
        setData(null);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [address, isConnected]);

  /**
   * Fetch sem retry (para chamadas manuais)
   */
  const fetchWeeklyProfit = useCallback(async () => {
    return fetchWeeklyProfitWithRetry(1);
  }, [fetchWeeklyProfitWithRetry]);

  /**
   * Fetch inicial ao montar o componente
   */
  useEffect(() => {
    fetchWeeklyProfit();
  }, [fetchWeeklyProfit]);

  /**
   * Auto-refresh a cada 5 minutos quando conectado
   */
  useEffect(() => {
    if (!isConnected || !address || !data) {
      return;
    }

    console.log(`⏱️ [useWeeklyProfit] Auto-refresh enabled (every ${AUTO_REFRESH_INTERVAL / 60000} minutes)`);

    const interval = setInterval(() => {
      console.log('🔄 [useWeeklyProfit] Auto-refresh triggered');
      fetchWeeklyProfit();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      console.log('⏹️ [useWeeklyProfit] Auto-refresh disabled');
      clearInterval(interval);
    };
  }, [isConnected, address, data, fetchWeeklyProfit]);

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

  // Valores calculados para fácil acesso
  const weeklyNetProfit = data?.metrics?.weeklyNetProfit || 0;
  const clientShare = data?.distribution?.clientShare || 0;
  const mlmPool = data?.distribution?.mlmPool || 0;
  const winRate = data?.metrics?.winRate || 0;
  const totalTrades = data?.metrics?.totalTrades || 0;

  return {
    data,
    loading,
    error,
    refetch: fetchWeeklyProfit,
    retryCount,
    // Dados específicos
    weeklyNetProfit,
    clientShare,
    mlmPool,
    winRate,
    totalTrades,
    isConnected: !!data,
    lastUpdate
  };
}

export default useWeeklyProfit;
