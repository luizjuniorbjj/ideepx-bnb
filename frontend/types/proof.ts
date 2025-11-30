/**
 * ============================================================================
 * TYPES - PROOF SYSTEM
 * ============================================================================
 * Tipos TypeScript para o sistema de proofs semanais
 */

// Informações do Rulebook (imutável)
export interface RulebookInfo {
  ipfsCid: string
  contentHash: string
  deployedAt: number
  version: string
  planName: string
  address: string
}

// Informações do contrato Proof
export interface ProofInfo {
  owner: string
  backend: string
  rulebookAddress: string
  paused: boolean
  totalProofs: number
  address: string
}

// Prova semanal
export interface WeeklyProof {
  weekNumber: number
  ipfsHash: string
  totalUsers: number
  totalCommissions: string // USDT string
  totalProfits: string // USDT string
  timestamp: number
  submittedBy: string
  finalized: boolean
}

// Snapshot completo do IPFS
export interface WeeklySnapshot {
  version: string
  week: {
    number: number
    startDate: string
    endDate: string
    timestamp: number
  }
  weekNumber: number
  summary: {
    totalUsers: number
    totalProfits: number
    totalCommissions: number
    totalPaid: number
    averagePerUser: number
  }
  rulebook: RulebookInfo
  businessModel: {
    clientShare: number
    companyFee: number
    mlmBase: number
    laiMonthlyCost: number
  }
  users: UserSnapshotData[]
  mlmBreakdown: {
    [level: string]: {
      totalPaid: number
      recipientsCount: number
      averagePerRecipient: number
    }
  }
  validation: {
    totalUsersChecksum: number
    totalCommissionsChecksum: number
    mlmBreakdownChecksum: number
    generatedAt: number
  }
}

// Dados de um usuário no snapshot
export interface UserSnapshotData {
  id: number
  wallet: string
  profit: number
  clientShare: number
  commissions: {
    [level: string]: {
      from: string
      amount: number
      qualified: boolean
    }
  }
  subscription: {
    active: boolean
    cost: number
    expiresAt: number
  }
  qualified: {
    basic: boolean
    advanced: boolean
    directsCount: number
    combinedVolume: number
  }
  netReceived: number
}

// Comissão MLM
export interface MLMCommission {
  from: string
  amount: number
  qualified: boolean
}

// Elegibilidade
export interface Qualification {
  basic: boolean
  advanced: boolean
  directsCount: number
  combinedVolume: number
}
