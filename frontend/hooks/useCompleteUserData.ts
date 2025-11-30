/**
 * Hook otimizado que busca TODOS os dados do usuário de uma vez
 * Reduz 4 requisições HTTP para apenas 1!
 *
 * Antes: useUserData + useUserMlmStats + useUserEligibility + useUserReferrals = 4 requests
 * Depois: useCompleteUserData = 1 request
 */

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';

// Usar o proxy do Next.js em vez de requisições diretas ao backend
const getApiBaseUrl = () => {
  // Sempre usar o proxy relativo do Next.js
  // O Next.js fará proxy de /api/* para http://localhost:5001/api/*
  return '/api';
};

interface CompleteUserData {
  user: any;
  mlmStats: any;
  eligibility: any;
  referrals: any[];
}

export function useCompleteUserData() {
  const { address } = useAccount();
  const [data, setData] = useState<CompleteUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCompleteData = useCallback(async () => {
    if (!address) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTime = performance.now();
      console.log('🚀 [useCompleteUserData] Fetching ALL data for:', address);

      const apiUrl = getApiBaseUrl();
      console.log('🌐 [useCompleteUserData] API URL:', apiUrl);

      const response = await fetch(`${apiUrl}/dev/user/${address}/complete`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const endTime = performance.now();

      console.log(`✅ [useCompleteUserData] Data fetched in ${(endTime - startTime).toFixed(0)}ms`);
      console.log('📦 [useCompleteUserData] User:', result.user);
      console.log('📊 [useCompleteUserData] MLM Stats:', result.mlmStats);
      console.log('🎯 [useCompleteUserData] Eligibility:', result.eligibility);
      console.log('👥 [useCompleteUserData] Referrals:', result.referrals?.length || 0);

      setData(result);
    } catch (err: any) {
      console.error('❌ [useCompleteUserData] Error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchCompleteData();
  }, [fetchCompleteData, refreshTrigger]);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    // Dados completos
    data,
    loading,
    error,
    refetch,

    // Dados individuais (para compatibilidade com código existente)
    userData: data?.user,
    mlmStats: data?.mlmStats,
    eligibility: data?.eligibility,
    referrals: data?.referrals || [],

    // Valores específicos mais usados
    isActive: data?.user?.active ?? false,
    maxLevel: data?.user?.maxLevel ?? 0,
    internalBalance: parseFloat(data?.user?.internalBalance ?? '0'),
    monthlyVolume: parseFloat(data?.user?.monthlyVolume ?? '0'),
    totalEarned: parseFloat(data?.user?.totalEarned ?? '0'),
    totalVolume: parseFloat(data?.user?.totalVolume ?? '0'),
    hasAccountHash: !!(data?.user?.accountHash && data.user.accountHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'),

    // Estatísticas MLM
    totalCommissions: data?.mlmStats?.totalCommissions ?? 0,
    directReferrals: data?.mlmStats?.directReferrals ?? 0,
    totalNetwork: data?.mlmStats?.totalNetwork ?? 0,

    // Elegibilidade
    canUnlock: data?.eligibility?.qualifies ?? false,
    recommendedMaxLevel: data?.eligibility?.recommendedMaxLevel ?? 5,
    activeDirectsCount: data?.eligibility?.requirements?.directs?.current ?? 0,
    combinedVolume: data?.eligibility?.requirements?.volume?.current ?? 0,

    // Contagem de referrals
    referralsCount: data?.referrals?.length ?? 0
  };
}
