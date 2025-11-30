import { Address } from 'viem';

// ========== ENDEREÇOS ==========

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as Address;
export const USDT_ADDRESS = (process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955') as Address;

// ========== CONSTANTES DO CONTRATO V10 ==========

export const SUBSCRIPTION_FEE = 19_000000n; // 19 USDT (6 decimals)
export const SUBSCRIPTION_DURATION = 30 * 24 * 60 * 60; // 30 dias em segundos
export const MIN_WITHDRAWAL = 50_000000n; // 50 USDT (6 decimals)
export const MAX_WITHDRAWAL_PER_TX = 10000_000000n; // $10,000 USDT (6 decimals)
export const MAX_WITHDRAWAL_PER_MONTH = 30000_000000n; // $30,000 USDT (6 decimals)
export const MIN_SOLVENCY_BPS = 11000; // 110%

// Percentuais MLM (compatibilidade)
export const MLM_LEVELS = 10;
export const MAX_BATCH_SIZE = 50;
export const MAX_HISTORY_PER_USER = 100;

// ========== ABI DO CONTRATO iDeepXCoreV10 ==========

export const CONTRACT_ABI = [
  // ===== FUNÇÕES READ =====

  // userView - Dados completos do usuário
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "userView",
    "outputs": [
      {"internalType": "bool", "name": "active_", "type": "bool"},
      {"internalType": "uint8", "name": "maxLevel_", "type": "uint8"},
      {"internalType": "uint8", "name": "kycStatus_", "type": "uint8"},
      {"internalType": "uint64", "name": "lastWithdrawMonth_", "type": "uint64"},
      {"internalType": "uint256", "name": "monthlyVolume_", "type": "uint256"},
      {"internalType": "uint256", "name": "internalBalance_", "type": "uint256"},
      {"internalType": "uint256", "name": "withdrawnThisMonth_", "type": "uint256"},
      {"internalType": "uint256", "name": "subscriptionExpiry_", "type": "uint256"},
      {"internalType": "bytes32", "name": "accountHash_", "type": "bytes32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Solvência e circuit breaker
  {
    "inputs": [],
    "name": "getSolvencyRatio",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "circuitBreakerActive",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Subscription fee e duration
  {
    "inputs": [],
    "name": "subscriptionFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "subscriptionDuration",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Limites de saque
  {
    "inputs": [],
    "name": "minWithdrawal",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxWithdrawalPerTx",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxWithdrawalPerMonth",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Total de saldos dos usuários
  {
    "inputs": [],
    "name": "totalUserBalances",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // USDT token address
  {
    "inputs": [],
    "name": "USDT",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FUNÇÕES WRITE =====

  // Ativar subscription com USDT
  {
    "inputs": [],
    "name": "activateSubscriptionWithUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Ativar subscription com saldo interno
  {
    "inputs": [],
    "name": "activateSubscriptionWithBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Saque
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ===== EVENTOS =====

  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "expiry", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "method", "type": "string"}
    ],
    "name": "SubscriptionActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "PerformanceCredited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "WithdrawExecuted",
    "type": "event"
  }
] as const;

// ========== ABI DO USDT ==========

export const USDT_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "recipient", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// ========== HELPERS ==========

/**
 * Converte USDT (6 decimals) para valor legível
 */
export function formatUSDT(value: bigint): string {
  const divisor = 1_000000n;
  const integerPart = value / divisor;
  const decimalPart = value % divisor;
  return `${integerPart}.${decimalPart.toString().padStart(6, '0').slice(0, 2)}`;
}

/**
 * Converte valor legível para USDT (6 decimals)
 */
export function parseUSDT(value: string): bigint {
  const [integerPart, decimalPart = '0'] = value.split('.');
  const paddedDecimal = decimalPart.padEnd(6, '0').slice(0, 6);
  return BigInt(integerPart) * 1_000000n + BigInt(paddedDecimal);
}
