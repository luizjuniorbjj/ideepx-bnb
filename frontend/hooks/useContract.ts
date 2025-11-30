/**
 * Hooks para interação com o contrato
 * Adaptado para iDeepXCoreV10
 */

// Re-exportar todos os hooks do V10
export * from './useContractV10';

// Exportações nomeadas principais para compatibilidade
export {
  useUserView,
  useGetUserInfo,
  useGetQuickStats,
  useSolvencyRatio,
  useCircuitBreakerActive,
  useSubscriptionFee,
  useWithdrawalLimits,
  useTotalUserBalances,
  useUSDTBalance,
  useUSDTAllowance,
  useApproveUSDT,
  useActivateSubscriptionWithUSDT,
  useActivateSubscriptionWithBalance,
  useWithdraw,
} from './useContractV10';
