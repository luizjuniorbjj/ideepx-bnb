import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';

export function useUserData() {
  const { address } = useAccount();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUserData = async () => {
    if (!address) {
      setUserData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useUserData] Fetching data for address:', address);
      const data = await api.getMe(address);
      console.log('✅ [useUserData] Received data:', data);
      console.log('📊 [useUserData] internalBalance:', data?.internalBalance);
      console.log('📊 [useUserData] monthlyVolume:', data?.monthlyVolume);
      console.log('📊 [useUserData] maxLevel:', data?.maxLevel);
      setUserData(data);
    } catch (err: any) {
      console.error('❌ [useUserData] Error fetching user data:', err);
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [address, refreshTrigger]);

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { userData, loading, error, refetch };
}

export function useUserMlmStats() {
  const { address } = useAccount();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMlmStats(address);
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching MLM stats:', err);
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [address]);

  return { stats, loading, error };
}

export function useUserEligibility() {
  const { address } = useAccount();
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setEligibility(null);
      return;
    }

    const fetchEligibility = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getEligibility(address);
        setEligibility(data);
      } catch (err: any) {
        console.error('Error fetching eligibility:', err);
        setError(err.message);
        setEligibility(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [address]);

  return { eligibility, loading, error };
}

export function useUserReferrals() {
  const { address } = useAccount();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setReferrals([]);
      return;
    }

    const fetchReferrals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getReferrals(address);
        setReferrals(data.referrals || []);
      } catch (err: any) {
        console.error('Error fetching referrals:', err);
        setError(err.message);
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [address]);

  return { referrals, loading, error };
}
