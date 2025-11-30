/**
 * Hooks administrativos para o contrato iDeepXDistributionV2
 * Apenas funções que requerem permissão de owner
 */

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';
import { Address } from 'viem';

// ========== HOOKS WRITE (Admin - Processamento de Fees) ==========

/**
 * Processar performance fees em lote (máx 50 clientes)
 * Distribui automaticamente: 60% MLM, 5% Liquidez, 12% Infra, 23% Empresa
 *
 * IMPORTANTE: Admin deve aprovar USDT total antes de chamar
 */
export function useBatchProcessPerformanceFees() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const batchProcess = (clients: Address[], amounts: bigint[]) => {
    if (clients.length !== amounts.length) {
      throw new Error('Arrays de clientes e valores devem ter o mesmo tamanho');
    }

    if (clients.length === 0 || clients.length > 50) {
      throw new Error('Número de clientes deve estar entre 1 e 50');
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'batchProcessPerformanceFees',
      args: [clients, amounts],
    });
  };

  return { batchProcess, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// ========== HOOKS WRITE (Admin - Configurações) ==========

/**
 * Alternar entre modo Beta e Permanente
 * Beta: L1=6%, L2=3%, L3=2.5%, L4=2%, L5-L10=1%
 * Permanente: L1=4%, L2=2%, L3=1.5%, L4=1%, L5-L10=1%
 */
export function useToggleBetaMode() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const toggle = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'toggleBetaMode',
    });
  };

  return { toggle, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Atualizar endereços das carteiras dos pools
 */
export function useUpdateWallets() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateWallets = (
    liquidityPool: Address,
    infrastructureWallet: Address,
    companyWallet: Address
  ) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'updateWallets',
      args: [liquidityPool, infrastructureWallet, companyWallet],
    });
  };

  return { updateWallets, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// ========== HOOKS WRITE (Admin - Controle do Sistema) ==========

/**
 * Pausar o contrato em caso de emergência
 * Bloqueia todas as operações exceto saques
 */
export function usePause() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pause = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'pause',
    });
  };

  return { pause, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Despausar o contrato
 * Retoma operações normais
 */
export function useUnpause() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unpause = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'unpause',
    });
  };

  return { unpause, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// ========== HOOKS WRITE (Admin - Gerenciamento de Usuários) ==========

/**
 * Desativar assinatura de um usuário
 */
export function useDeactivateSubscription() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deactivate = (userAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'deactivateSubscription',
      args: [userAddress],
    });
  };

  return { deactivate, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Pausar usuário individualmente
 * Bloqueia operações deste usuário
 */
export function usePauseUser() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pauseUser = (userAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'pauseUser',
      args: [userAddress],
    });
  };

  return { pauseUser, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Despausar usuário
 * Retoma operações normais do usuário
 */
export function useUnpauseUser() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unpauseUser = (userAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'unpauseUser',
      args: [userAddress],
    });
  };

  return { unpauseUser, isPending: isPending || isConfirming, isSuccess, error, hash };
}

/**
 * Expirar assinaturas vencidas em lote
 * Pode ser chamada por qualquer um, não requer owner
 */
export function useExpireSubscriptions() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const expireSubscriptions = (userAddresses: Address[]) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'expireSubscriptions',
      args: [userAddresses],
    });
  };

  return { expireSubscriptions, isPending: isPending || isConfirming, isSuccess, error, hash };
}

// ========== HOOKS UTILITÁRIOS ADMIN ==========

/**
 * Hook combinado para dados completos do painel admin
 */
export function useAdminDashboardData() {
  const { useSystemStats, useIsBetaMode, useIsPaused, useOwner, useLiquidityPool, useInfrastructureWallet, useCompanyWallet } = require('./useContract');

  const systemStats = useSystemStats();
  const isBetaMode = useIsBetaMode();
  const isPaused = useIsPaused();
  const owner = useOwner();
  const liquidityPool = useLiquidityPool();
  const infrastructureWallet = useInfrastructureWallet();
  const companyWallet = useCompanyWallet();

  return {
    systemStats,
    isBetaMode,
    isPaused,
    owner,
    liquidityPool,
    infrastructureWallet,
    companyWallet,
    isLoading: systemStats.isLoading || isBetaMode.isLoading,
    isError: systemStats.isError || isBetaMode.isError,
  };
}

/**
 * Calcula total de USDT necessário para batch processing
 */
export function calculateBatchTotal(amounts: bigint[]): bigint {
  return amounts.reduce((acc, amount) => acc + amount, 0n);
}

/**
 * Valida se arrays de batch processing estão corretos
 */
export function validateBatchProcessing(clients: Address[], amounts: bigint[]): {
  isValid: boolean;
  error?: string;
} {
  if (clients.length !== amounts.length) {
    return { isValid: false, error: 'Arrays devem ter o mesmo tamanho' };
  }

  if (clients.length === 0) {
    return { isValid: false, error: 'Deve haver pelo menos 1 cliente' };
  }

  if (clients.length > 50) {
    return { isValid: false, error: 'Máximo de 50 clientes por batch' };
  }

  // Verificar se há clientes duplicados
  const uniqueClients = new Set(clients.map(c => c.toLowerCase()));
  if (uniqueClients.size !== clients.length) {
    return { isValid: false, error: 'Há endereços duplicados na lista' };
  }

  // Verificar se todos os valores são > 0
  const hasInvalidAmount = amounts.some(amount => amount <= 0n);
  if (hasInvalidAmount) {
    return { isValid: false, error: 'Todos os valores devem ser maiores que zero' };
  }

  return { isValid: true };
}
