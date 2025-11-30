import { Address } from 'viem';

// ========== ENDEREÇOS ==========

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '') as Address;
export const USDT_ADDRESS = (process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955') as Address;

// ========== CONSTANTES DO CONTRATO ==========

export const SUBSCRIPTION_FEE = 29_000000000000000000n; // 29 USDT (18 decimals)
export const SUBSCRIPTION_DURATION = 30 * 24 * 60 * 60; // 30 dias em segundos
export const MIN_WITHDRAWAL = 10_000000000000000000n; // 10 USDT (18 decimals)
export const DIRECT_BONUS = 5_000000000000000000n; // 5 USDT (18 decimals)
export const MAX_BATCH_SIZE = 50;
export const MLM_LEVELS = 10;
export const MAX_HISTORY_PER_USER = 100;

// Percentuais de distribuição (em basis points: 100 = 1%)
export const MLM_POOL_PERCENTAGE = 6000;      // 60%
export const LIQUIDITY_PERCENTAGE = 500;      // 5%
export const INFRASTRUCTURE_PERCENTAGE = 1200; // 12%
export const COMPANY_PERCENTAGE = 2300;       // 23%

// Percentuais MLM Beta (em basis points)
export const MLM_PERCENTAGES_BETA = [
  600,  // L1: 6%
  300,  // L2: 3%
  250,  // L3: 2.5%
  200,  // L4: 2%
  100,  // L5: 1%
  100,  // L6: 1%
  100,  // L7: 1%
  100,  // L8: 1%
  100,  // L9: 1%
  100   // L10: 1%
];

// Percentuais MLM Permanente (em basis points)
export const MLM_PERCENTAGES_PERMANENT = [
  400,  // L1: 4%
  200,  // L2: 2%
  150,  // L3: 1.5%
  100,  // L4: 1%
  100,  // L5: 1%
  100,  // L6: 1%
  100,  // L7: 1%
  100,  // L8: 1%
  100,  // L9: 1%
  100   // L10: 1%
];

// ========== ABI DO CONTRATO iDeepXDistributionV2 ==========

export const CONTRACT_ABI = [
  // ===== FUNÇÕES READ =====

  // Dados do usuário
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "users",
    "outputs": [
      {"name": "wallet", "type": "address"},
      {"name": "sponsor", "type": "address"},
      {"name": "isRegistered", "type": "bool"},
      {"name": "subscriptionActive", "type": "bool"},
      {"name": "subscriptionTimestamp", "type": "uint256"},
      {"name": "subscriptionExpiration", "type": "uint256"},
      {"name": "totalEarned", "type": "uint256"},
      {"name": "totalWithdrawn", "type": "uint256"},
      {"name": "directReferrals", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "userAddress", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      {"name": "wallet", "type": "address"},
      {"name": "sponsor", "type": "address"},
      {"name": "isRegistered", "type": "bool"},
      {"name": "subscriptionActive", "type": "bool"},
      {"name": "subscriptionTimestamp", "type": "uint256"},
      {"name": "subscriptionExpiration", "type": "uint256"},
      {"name": "totalEarned", "type": "uint256"},
      {"name": "totalWithdrawn", "type": "uint256"},
      {"name": "directReferrals", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getQuickStats",
    "outputs": [
      {"name": "totalEarned", "type": "uint256"},
      {"name": "totalWithdrawn", "type": "uint256"},
      {"name": "availableBalance", "type": "uint256"},
      {"name": "directReferrals", "type": "uint256"},
      {"name": "subscriptionActive", "type": "bool"},
      {"name": "daysUntilExpiry", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getNetworkStats",
    "outputs": [
      {"name": "totalDirects", "type": "uint256"},
      {"name": "totalEarned", "type": "uint256"},
      {"name": "totalWithdrawn", "type": "uint256"},
      {"name": "availableBalance", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "count", "type": "uint256"}
    ],
    "name": "getEarningHistory",
    "outputs": [
      {
        "components": [
          {"name": "timestamp", "type": "uint256"},
          {"name": "amount", "type": "uint256"},
          {"name": "fromClient", "type": "address"},
          {"name": "level", "type": "uint8"},
          {"name": "earningType", "type": "uint8"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "userAddress", "type": "address"}],
    "name": "getUpline",
    "outputs": [{"name": "", "type": "address[10]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "isSubscriptionActive",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "userPaused",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "client", "type": "address"}],
    "name": "clientPerformances",
    "outputs": [
      {"name": "totalFeesGenerated", "type": "uint256"},
      {"name": "totalFeesDistributed", "type": "uint256"},
      {"name": "lastFeeTimestamp", "type": "uint256"},
      {"name": "feeCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Sistema geral
  {
    "inputs": [],
    "name": "getSystemStats",
    "outputs": [
      {"name": "_totalUsers", "type": "uint256"},
      {"name": "_totalActiveSubscriptions", "type": "uint256"},
      {"name": "_totalMLMDistributed", "type": "uint256"},
      {"name": "_betaMode", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalUsers",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalActiveSubscriptions",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMLMDistributed",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalWithdrawn",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },

  // MLM e cálculos
  {
    "inputs": [{"name": "performanceFee", "type": "uint256"}],
    "name": "calculateMLMDistribution",
    "outputs": [
      {"name": "levelCommissions", "type": "uint256[10]"},
      {"name": "totalMLM", "type": "uint256"},
      {"name": "liquidity", "type": "uint256"},
      {"name": "infrastructure", "type": "uint256"},
      {"name": "company", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveMLMPercentages",
    "outputs": [{"name": "", "type": "uint256[10]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "betaMode",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "mlmPercentagesBeta",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "mlmPercentagesPermanent",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Configurações
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "multisig",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "USDT",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liquidityPool",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "infrastructureWallet",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "companyWallet",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SUBSCRIPTION_FEE",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SUBSCRIPTION_DURATION",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_WITHDRAWAL",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DIRECT_BONUS",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_BATCH_SIZE",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MLM_LEVELS",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // ===== FUNÇÕES WRITE (Cliente) =====

  {
    "inputs": [{"name": "sponsorWallet", "type": "address"}],
    "name": "selfRegister",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "selfSubscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "sponsorWallet", "type": "address"}],
    "name": "registerAndSubscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renewSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawEarnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "withdrawPartial",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ===== FUNÇÕES WRITE (Admin) =====

  {
    "inputs": [
      {"name": "clients", "type": "address[]"},
      {"name": "amounts", "type": "uint256[]"}
    ],
    "name": "batchProcessPerformanceFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleBetaMode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_liquidityPool", "type": "address"},
      {"name": "_infrastructureWallet", "type": "address"},
      {"name": "_companyWallet", "type": "address"}
    ],
    "name": "updateWallets",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "deactivateSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "pauseUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "unpauseUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "userAddresses", "type": "address[]"}],
    "name": "expireSubscriptions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ===== EVENTOS =====

  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": true, "name": "sponsor", "type": "address"}
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "expirationTimestamp", "type": "uint256"}
    ],
    "name": "SubscriptionActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "newExpirationTimestamp", "type": "uint256"}
    ],
    "name": "SubscriptionRenewed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "expiredAt", "type": "uint256"}
    ],
    "name": "SubscriptionExpired",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "mlmAmount", "type": "uint256"}
    ],
    "name": "PerformanceFeeDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "recipient", "type": "address"},
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": false, "name": "level", "type": "uint256"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "MLMCommissionPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "sponsor", "type": "address"},
      {"indexed": true, "name": "newUser", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "DirectBonusPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "EarningsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "pool", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "poolType", "type": "string"}
    ],
    "name": "PoolDistribution",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "betaMode", "type": "bool"}],
    "name": "BetaModeToggled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "liquidity", "type": "address"},
      {"indexed": false, "name": "infrastructure", "type": "address"},
      {"indexed": false, "name": "company", "type": "address"}
    ],
    "name": "WalletsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "user", "type": "address"}],
    "name": "UserPaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "user", "type": "address"}],
    "name": "UserUnpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "account", "type": "address"}],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "account", "type": "address"}],
    "name": "Unpaused",
    "type": "event"
  }
] as const;

// ========== ABI DO TOKEN USDT (BEP-20) ==========

export const USDT_ABI = [
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
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
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ========== TIPOS TYPESCRIPT ==========

export enum EarningType {
  MLM_COMMISSION = 0,
  DIRECT_BONUS = 1,
  RANK_BONUS = 2
}

export interface User {
  wallet: Address;
  sponsor: Address;
  isRegistered: boolean;
  subscriptionActive: boolean;
  subscriptionTimestamp: bigint;
  subscriptionExpiration: bigint;
  totalEarned: bigint;
  totalWithdrawn: bigint;
  directReferrals: bigint;
}

export interface Earning {
  timestamp: bigint;
  amount: bigint;
  fromClient: Address;
  level: number;
  earningType: EarningType;
}

export interface ClientPerformance {
  totalFeesGenerated: bigint;
  totalFeesDistributed: bigint;
  lastFeeTimestamp: bigint;
  feeCount: bigint;
}

export interface QuickStats {
  totalEarned: bigint;
  totalWithdrawn: bigint;
  availableBalance: bigint;
  directReferrals: bigint;
  subscriptionActive: boolean;
  daysUntilExpiry: bigint;
}

export interface NetworkStats {
  totalDirects: bigint;
  totalEarned: bigint;
  totalWithdrawn: bigint;
  availableBalance: bigint;
}

export interface SystemStats {
  totalUsers: bigint;
  totalActiveSubscriptions: bigint;
  totalMLMDistributed: bigint;
  betaMode: boolean;
}

export interface MLMDistribution {
  levelCommissions: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
  totalMLM: bigint;
  liquidity: bigint;
  infrastructure: bigint;
  company: bigint;
}

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Formata valor USDT (18 decimais) para exibição
 */
export function formatUSDT(amount: bigint | undefined): string {
  if (!amount) return '0.00';
  return (Number(amount) / 1e18).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Converte valor em dólares para USDT (18 decimais)
 */
export function toUSDT(dollars: number): bigint {
  return BigInt(Math.floor(dollars * 1e18));
}

/**
 * Calcula dias restantes até expiração
 */
export function daysUntilExpiry(expirationTimestamp: bigint): number {
  const now = Math.floor(Date.now() / 1000);
  const expiry = Number(expirationTimestamp);

  if (expiry <= now) return 0;

  return Math.floor((expiry - now) / (24 * 60 * 60));
}

/**
 * Verifica se assinatura está ativa e não expirada
 */
export function isActiveSubscription(subscriptionActive: boolean, expirationTimestamp: bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  return subscriptionActive && Number(expirationTimestamp) > now;
}

/**
 * Retorna nome do tipo de ganho
 */
export function getEarningTypeName(type: EarningType): string {
  switch (type) {
    case EarningType.MLM_COMMISSION:
      return 'Comissão MLM';
    case EarningType.DIRECT_BONUS:
      return 'Bônus Direto';
    case EarningType.RANK_BONUS:
      return 'Bônus de Rank';
    default:
      return 'Desconhecido';
  }
}

/**
 * Converte basis points para percentual
 */
export function basisPointsToPercent(basisPoints: number): number {
  return basisPoints / 100;
}
