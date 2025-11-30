/**
 * Hooks para interação com o contrato iDeepXDistributionV2
 * TODOS os hooks espelham 100% as funções do contrato
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI, SUBSCRIPTION_FEE } from '@/config/contracts';
import { Address } from 'viem';

// ========== HOOKS READ (Dados do Usuário) ==========

/**
 * Retorna dados básicos do usuário via mapping users()
 */
export function useUserData(address?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'users',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // 10s
    },
  });
}

/**
 * Retorna informações completas do usuário
 */
export function useGetUserInfo(userAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000,
    },
  });
}

/**
 * Retorna estatísticas rápidas do usuário
 */
export function useGetQuickStats(userAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getQuickStats',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000,
    },
  });
}

/**
 * Retorna estatísticas da rede do usuário
 */
export function useGetNetworkStats(userAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getNetworkStats',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 15000,
    },
  });
}

/**
 * Retorna histórico de ganhos do usuário
 * @param userAddress Endereço do usuário
 * @param count Número de registros (máx 100)
 */
export function useGetEarningHistory(userAddress?: Address, count: number = 20) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEarningHistory',
    args: userAddress ? [userAddress, BigInt(count)] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 15000,
    },
  });
}

/**
 * Retorna upline do usuário (10 níveis)
 */
export function useGetUpline(userAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUpline',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 30000,
    },
  });
}

/**
 * Verifica se assinatura está ativa (não expirada)
 */
export function useIsSubscriptionActive(userAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isSubscriptionActive',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000,
    },
  });
}

/**
 * Verifica se usuário está pausado
 */
export function useIsUserPaused(userAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'userPaused',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 15000,
    },
  });
}

/**
 * Retorna performance de um cliente que gera fees
 */
export function useClientPerformance(clientAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'clientPerformances',
    args: clientAddress ? [clientAddress] : undefined,
    query: {
      enabled: !!clientAddress,
      refetchInterval: 20000,
    },
  });
}

// ========== HOOKS READ (Sistema) ==========

/**
 * Retorna estatísticas gerais do sistema
 */
export function useSystemStats() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSystemStats',
    query: {
      refetchInterval: 15000,
    },
  });
}

/**
 * Total de usuários registrados
 */
export function useTotalUsers() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalUsers',
    query: {
      refetchInterval: 20000,
    },
  });
}

/**
 * Total de assinaturas ativas
 */
export function useTotalActiveSubscriptions() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalActiveSubscriptions',
    query: {
      refetchInterval: 20000,
    },
  });
}

/**
 * Total distribuído em MLM
 */
export function useTotalMLMDistributed() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalMLMDistributed',
    query: {
      refetchInterval: 20000,
    },
  });
}

/**
 * Total sacado por todos os usuários
 */
export function useTotalWithdrawn() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalWithdrawn',
    query: {
      refetchInterval: 20000,
    },
  });
}

/**
 * Verifica se sistema está pausado
 */
export function useIsPaused() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'paused',
    query: {
      refetchInterval: 10000,
    },
  });
}

// ========== HOOKS READ (MLM e Cálculos) ==========

/**
 * Calcula distribuição MLM para uma performance fee
 */
export function useCalculateMLM(performanceFee?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'calculateMLMDistribution',
    args: performanceFee ? [performanceFee] : undefined,
    query: {
      enabled: !!performanceFee && performanceFee > 0n,
    },
  });
}

/**
 * Retorna percentuais MLM ativos (Beta ou Permanente)
 */
export function useActiveMLMPercentages() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveMLMPercentages',
    query: {
      refetchInterval: 30000,
    },
  });
}

/**
 * Verifica se modo Beta está ativo
 */
export function useIsBetaMode() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'betaMode',
    query: {
      refetchInterval: 30000,
    },
  });
}

/**
 * Retorna percentual MLM Beta de um nível específico
 */
export function useMLMPercentageBeta(level: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mlmPercentagesBeta',
    args: [BigInt(level)],
    query: {
      enabled: level >= 0 && level < 10,
    },
  });
}

/**
 * Retorna percentual MLM Permanente de um nível específico
 */
export function useMLMPercentagePermanent(level: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mlmPercentagesPermanent',
    args: [BigInt(level)],
    query: {
      enabled: level >= 0 && level < 10,
    },
  });
}

// ========== HOOKS READ (Configurações) ==========

/**
 * Retorna endereço do owner/multisig
 */
export function useOwner() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'multisig', // V9_SECURE_4 usa multisig ao invés de owner
  });
}

/**
 * Retorna endereço do token USDT
 */
export function useUSDTAddress() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'USDT',
  });
}

/**
 * Retorna endereço do liquidity pool
 */
export function useLiquidityPool() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'liquidityPool',
  });
}

/**
 * Retorna endereço da infrastructure wallet
 */
export function useInfrastructureWallet() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'infrastructureWallet',
  });
}

/**
 * Retorna endereço da company wallet
 */
export function useCompanyWallet() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'companyWallet',
  });
}

// ========== HOOKS READ (USDT) ==========

/**
 * Saldo de USDT do usuário
 */
export function useUSDTBalance(address?: Address) {
  return useReadContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });
}

/**
 * Allowance de USDT aprovado para o contrato
 */
export function useUSDTAllowance(owner?: Address) {
  return useReadContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: owner ? [owner, CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!owner,
      refetchInterval: 5000,
    },
  });
}

// ========== HOOKS WRITE (Cliente) ==========

/**
 * Registrar-se no sistema com um sponsor
 */
export function useSelfRegister() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (sponsorAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'selfRegister',
      args: [sponsorAddress],
    });
  };

  return { register, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Pagar assinatura de $29 USDT (requer aprovação prévia)
 */
export function useSelfSubscribe() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const subscribe = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'selfSubscribe',
    });
  };

  return { subscribe, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Registrar e assinar em uma transação ($29 assinatura + $5 bônus direto ao sponsor)
 */
export function useRegisterAndSubscribe() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const registerAndSubscribe = (sponsorAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerAndSubscribe',
      args: [sponsorAddress],
    });
  };

  return { registerAndSubscribe, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Renovar assinatura (pode renovar até 7 dias antes da expiração)
 */
export function useRenewSubscription() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const renew = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'renewSubscription',
    });
  };

  return { renew, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Sacar todas as comissões disponíveis (mínimo $10)
 */
export function useWithdrawEarnings() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'withdrawEarnings',
    });
  };

  return { withdraw, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Sacar valor parcial das comissões (mínimo $10)
 */
export function useWithdrawPartial() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdrawPartial = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'withdrawPartial',
      args: [amount],
    });
  };

  return { withdrawPartial, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// ========== HOOKS WRITE (USDT) ==========

/**
 * Aprovar USDT para o contrato
 */
export function useApproveUSDT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: bigint = SUBSCRIPTION_FEE) => {
    writeContract({
      address: USDT_ADDRESS,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amount],
    });
  };

  return { approve, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// ========== HOOKS UTILITÁRIOS ==========

/**
 * Verifica se usuário é owner
 */
export function useIsOwner(address?: Address) {
  const { data: owner } = useOwner();

  if (!address || !owner) return false;

  return address.toLowerCase() === (owner as string).toLowerCase();
}

/**
 * Retorna saldo disponível para saque
 */
export function useAvailableBalance(address?: Address) {
  const { data: userData } = useUserData(address);

  if (!userData || !Array.isArray(userData)) return 0n;

  const totalEarned = userData[6] as bigint || 0n;
  const totalWithdrawn = userData[7] as bigint || 0n;

  return totalEarned - totalWithdrawn;
}

/**
 * Hook combinado para dados completos do dashboard
 */
export function useDashboardData(address?: Address) {
  const userData = useUserData(address);
  const quickStats = useGetQuickStats(address);
  const networkStats = useGetNetworkStats(address);
  const earningHistory = useGetEarningHistory(address, 10);
  const upline = useGetUpline(address);
  const systemStats = useSystemStats();
  const usdtBalance = useUSDTBalance(address);
  const usdtAllowance = useUSDTAllowance(address);
  const isSubscriptionActive = useIsSubscriptionActive(address);
  const isPaused = useIsUserPaused(address);

  return {
    user: userData,
    quickStats,
    networkStats,
    earningHistory,
    upline,
    systemStats,
    usdtBalance,
    usdtAllowance,
    isSubscriptionActive,
    isPaused,
    isLoading: userData.isLoading || quickStats.isLoading,
    isError: userData.isError || quickStats.isError,
  };
}
