/**
 * Hooks simplificados para iDeepXCoreV10
 * V10 é híbrido: on-chain (state) + off-chain (ML

M/histórico)
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI, SUBSCRIPTION_FEE } from '@/config/contracts';
import { Address } from 'viem';

// ========== HOOKS READ (V10) ==========

/**
 * Retorna dados completos do usuário via userView()
 * V10 retorna: active, maxLevel, kycStatus, internalBalance, subscriptionExpiry, etc.
 */
export function useUserView(address?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'userView',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // 10s
    },
  });
}

/**
 * Retorna solvency ratio do contrato (em basis points: 11000 = 110%)
 */
export function useSolvencyRatio() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getSolvencyRatio',
    query: {
      refetchInterval: 15000,
    },
  });
}

/**
 * Verifica se circuit breaker está ativo
 */
export function useCircuitBreakerActive() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'circuitBreakerActive',
    query: {
      refetchInterval: 10000,
    },
  });
}

/**
 * Retorna subscription fee configurado no contrato
 */
export function useSubscriptionFee() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'subscriptionFee',
  });
}

/**
 * Retorna limites de saque
 */
export function useWithdrawalLimits() {
  const minWithdrawal = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'minWithdrawal',
  });

  const maxPerTx = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxWithdrawalPerTx',
  });

  const maxPerMonth = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxWithdrawalPerMonth',
  });

  return {
    minWithdrawal,
    maxPerTx,
    maxPerMonth,
  };
}

/**
 * Retorna total de saldos de todos os usuários (passivo)
 */
export function useTotalUserBalances() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalUserBalances',
    query: {
      refetchInterval: 15000,
    },
  });
}

// ========== HOOKS USDT ==========

/**
 * Retorna saldo USDT do usuário
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
 * Retorna allowance USDT que o contrato pode usar
 */
export function useUSDTAllowance(ownerAddress?: Address) {
  return useReadContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress, CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!ownerAddress,
      refetchInterval: 10000,
    },
  });
}

// ========== HOOKS WRITE (V10) ==========

/**
 * Hook para aprovar USDT para o contrato
 */
export function useApproveUSDT() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const approve = (amount: bigint) => {
    writeContract({
      address: USDT_ADDRESS,
      abi: USDT_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook para ativar subscription com USDT
 */
export function useActivateSubscriptionWithUSDT() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const activate = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'activateSubscriptionWithUSDT',
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return {
    activate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook para ativar subscription com saldo interno
 */
export function useActivateSubscriptionWithBalance() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const activate = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'activateSubscriptionWithBalance',
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return {
    activate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook para saque
 */
export function useWithdraw() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const withdraw = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// ========== HOOKS COMBINADOS (Para compatibilidade com páginas antigas) ==========

/**
 * Hook combinado que simula getUserInfo() usando userView()
 * Para manter compatibilidade com código existente
 */
export function useGetUserInfo(userAddress?: Address) {
  const { data, ...rest } = useUserView(userAddress);

  // Adaptar formato V10 para formato esperado pelo frontend
  if (data) {
    const [active, maxLevel, kycStatus, lastWithdrawMonth, monthlyVolume,
           internalBalance, withdrawnThisMonth, subscriptionExpiry, accountHash] = data;

    return {
      data: {
        wallet: userAddress,
        sponsor: '0x0000000000000000000000000000000000000000' as Address, // V10 não armazena sponsor on-chain
        isRegistered: active, // No V10, "active" equivale a "registrado"
        subscriptionActive: subscriptionExpiry > BigInt(Math.floor(Date.now() / 1000)),
        subscriptionTimestamp: BigInt(0), // V10 não armazena timestamp de ativação
        subscriptionExpiration: subscriptionExpiry,
        totalEarned: internalBalance, // Aproximação: saldo interno representa ganhos
        totalWithdrawn: withdrawnThisMonth, // Aproximação
        directReferrals: BigInt(0), // V10 não armazena referrals on-chain
        // Campos extras do V10
        active_: active,
        maxLevel_: maxLevel,
        kycStatus_: kycStatus,
        monthlyVolume_: monthlyVolume,
        internalBalance_: internalBalance,
        accountHash_: accountHash,
      },
      ...rest,
    };
  }

  return { data: undefined, ...rest };
}

/**
 * Hook para stats rápidas (compatibilidade)
 */
export function useGetQuickStats(userAddress?: Address) {
  const { data, ...rest } = useUserView(userAddress);

  if (data) {
    const [active, maxLevel, kycStatus, lastWithdrawMonth, monthlyVolume,
           internalBalance, withdrawnThisMonth, subscriptionExpiry, accountHash] = data;

    return {
      data: {
        totalEarned: internalBalance,
        totalWithdrawn: withdrawnThisMonth,
        availableBalance: internalBalance,
        directReferrals: BigInt(0), // Não disponível no V10
        subscriptionExpiry,
        subscriptionActive: subscriptionExpiry > BigInt(Math.floor(Date.now() / 1000)),
      },
      ...rest,
    };
  }

  return { data: undefined, ...rest };
}

// ========== EXPORTS PARA COMPATIBILIDADE ==========

// Re-exportar hooks principais com nomes compatíveis
export { useUserView as useUserData };
