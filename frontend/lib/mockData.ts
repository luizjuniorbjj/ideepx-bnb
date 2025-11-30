// ============================================================================
// 🎭 DADOS MOCKADOS PARA DEMONSTRAÇÃO DO DASHBOARD
// ============================================================================
// Use estes dados para visualizar como o dashboard fica populado

export const MOCK_USER_DATA = {
  // Dados básicos do usuário
  address: '0x1234567890123456789012345678901234567890',
  isActive: true,
  sponsor: '0x0987654321098765432109876543210987654321',

  // Saldos e valores
  usdtBalance: '1,245.50',
  internalBalance: '856.32',
  totalDeposited: '5,000.00',
  totalCommissions: '2,156.32',

  // Rede e indicações
  directReferrals: 12,
  activeDirectsCount: 8,
  totalNetwork: 47,

  // Volume e qualificação
  personalVolume: '5,000.00',
  networkVolume: '18,500.00',
  combinedVolume: '23,500.00',

  // MLM Stats
  mlmStats: {
    totalLevels: 10,
    activeLevels: 6,
    totalEarnings: '2,156.32',
    levelBreakdown: [
      { level: 1, users: 12, volume: '12,000.00', earnings: '960.00', percentage: 8 },
      { level: 2, users: 8, volume: '8,000.00', earnings: '240.00', percentage: 3 },
      { level: 3, users: 15, volume: '15,000.00', earnings: '300.00', percentage: 2 },
      { level: 4, users: 7, volume: '7,000.00', earnings: '70.00', percentage: 1 },
      { level: 5, users: 3, volume: '3,000.00', earnings: '30.00', percentage: 1 },
      { level: 6, users: 2, volume: '2,000.00', earnings: '40.00', percentage: 2 },
      { level: 7, users: 0, volume: '0.00', earnings: '0.00', percentage: 2 },
      { level: 8, users: 0, volume: '0.00', earnings: '0.00', percentage: 2 },
      { level: 9, users: 0, volume: '0.00', earnings: '0.00', percentage: 2 },
      { level: 10, users: 0, volume: '0.00', earnings: '0.00', percentage: 2 },
    ]
  },

  // Elegibilidade e qualificação
  eligibility: {
    canUnlock: true,
    activeDirects: 8,
    requiredDirects: 5,
    volume: 23500,
    requiredVolume: 5000,
    qualified: true,
    progress: 100,
    nextLevel: 'Diamond',
    currentLevel: 'Gold'
  },

  // GMI/MT5 Data
  gmiData: {
    connected: true,
    accountNumber: '12345678',
    server: 'GMI-Demo',
    balance: '15,842.75',
    equity: '16,123.50',
    monthlyVolume: '125,450.00',
    monthlyProfit: '3,245.80',
    monthlyLoss: '1,123.50',
    totalTrades: 156,
    profitTrades: 98,
    lossTrades: 58,
    winRate: '62.82',
    profitFactor: '2.89',
    lastSync: new Date().toISOString()
  },

  // Usuários da rede (diretos ativos)
  networkUsers: [
    {
      address: '0x1111111111111111111111111111111111111111',
      level: 1,
      volume: '1,200.00',
      earnings: '96.00',
      isActive: true,
      directReferrals: 3,
      joinedAt: '2024-11-01'
    },
    {
      address: '0x2222222222222222222222222222222222222222',
      level: 1,
      volume: '850.00',
      earnings: '68.00',
      isActive: true,
      directReferrals: 2,
      joinedAt: '2024-11-05'
    },
    {
      address: '0x3333333333333333333333333333333333333333',
      level: 1,
      volume: '2,100.00',
      earnings: '168.00',
      isActive: true,
      directReferrals: 5,
      joinedAt: '2024-11-08'
    },
    {
      address: '0x4444444444444444444444444444444444444444',
      level: 1,
      volume: '650.00',
      earnings: '52.00',
      isActive: true,
      directReferrals: 1,
      joinedAt: '2024-11-12'
    }
  ],

  // Usuários inativos (para testar função de ativar)
  inactiveUsers: [
    {
      walletAddress: '0x5555555555555555555555555555555555555555',
      level: 1,
      canActivate: true,
      joinedAt: '2024-10-15',
      daysInactive: 15,
      name: 'Usuário Inativo 1',
      hasBalance: true,
      requiredAmount: '29.00'
    },
    {
      walletAddress: '0x6666666666666666666666666666666666666666',
      level: 2,
      canActivate: true,
      joinedAt: '2024-10-20',
      daysInactive: 10,
      name: 'Usuário Inativo 2',
      hasBalance: true,
      requiredAmount: '29.00'
    },
    {
      walletAddress: '0x7777777777777777777777777777777777777777',
      level: 1,
      canActivate: false,
      joinedAt: '2024-11-01',
      daysInactive: 3,
      name: 'Usuário Inativo 3',
      hasBalance: false,
      requiredAmount: '29.00'
    }
  ],

  // Métricas do sistema
  systemMetrics: {
    solvencyRatio: '125.5',
    circuitBreakerActive: false,
    subscriptionFee: '29.00',
    totalUsers: 1247,
    totalVolume: '1,245,000.00',
    totalCommissionsPaid: '125,450.00'
  },

  // Histórico de ganhos (últimos 7 dias)
  earningsHistory: [
    { date: '2024-11-10', amount: '125.50', level: 1 },
    { date: '2024-11-11', amount: '89.30', level: 2 },
    { date: '2024-11-12', amount: '245.80', level: 1 },
    { date: '2024-11-13', amount: '67.20', level: 3 },
    { date: '2024-11-14', amount: '189.40', level: 1 },
    { date: '2024-11-15', amount: '134.70', level: 2 },
    { date: '2024-11-16', amount: '298.60', level: 1 }
  ]
}

// Função auxiliar para usar dados mockados
export function useMockDataIfEmpty<T>(realData: T | null | undefined, mockData: T, enableMock: boolean = false): T {
  if (enableMock || !realData) {
    return mockData
  }
  return realData
}

// Flag para ativar/desativar modo demonstração
export const DEMO_MODE = typeof window !== 'undefined'
  ? localStorage.getItem('DEMO_MODE') === 'true'
  : false

// Função para ativar modo demonstração
export function enableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('DEMO_MODE', 'true')
    window.location.reload()
  }
}

// Função para desativar modo demonstração
export function disableDemoMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('DEMO_MODE')
    window.location.reload()
  }
}

// ============================================================================
// 🎮 FUNÇÕES SIMULADAS PARA MODO DEMONSTRAÇÃO
// ============================================================================

// Simular ativação de usuário da rede
export async function mockActivateNetworkUser(userAddress: string) {
  // Simular delay de transação
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Remover usuário da lista de inativos
  const inactive = MOCK_USER_DATA.inactiveUsers.filter(
    u => u.walletAddress.toLowerCase() !== userAddress.toLowerCase()
  )

  console.log(`✅ [DEMO] Usuário ${userAddress} ativado com sucesso!`)

  return {
    success: true,
    message: 'Usuário ativado com sucesso (simulação)',
    txHash: '0x' + Math.random().toString(16).substring(2, 66)
  }
}

// Simular renovação de assinatura com saldo interno
export async function mockActivateWithBalance() {
  // Simular delay de transação
  await new Promise(resolve => setTimeout(resolve, 1500))

  const currentBalance = parseFloat(MOCK_USER_DATA.internalBalance.replace(/,/g, ''))
  const subscriptionFee = 29.00

  if (currentBalance < subscriptionFee) {
    throw new Error('Saldo insuficiente para renovar')
  }

  // Atualizar saldo (simulado)
  const newBalance = currentBalance - subscriptionFee

  console.log(`✅ [DEMO] Assinatura renovada! Novo saldo: $${newBalance.toFixed(2)}`)

  return {
    success: true,
    message: 'Assinatura renovada com sucesso (simulação)',
    newBalance: newBalance.toFixed(2),
    txHash: '0x' + Math.random().toString(16).substring(2, 66)
  }
}

// Simular carregamento de usuários inativos
export async function mockLoadInactiveUsers() {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    success: true,
    inactive: MOCK_USER_DATA.inactiveUsers,
    total: MOCK_USER_DATA.inactiveUsers.length
  }
}

// Simular saque
export async function mockWithdraw(amount: number) {
  await new Promise(resolve => setTimeout(resolve, 2000))

  const currentBalance = parseFloat(MOCK_USER_DATA.internalBalance.replace(/,/g, ''))

  if (amount > currentBalance) {
    throw new Error('Saldo insuficiente para saque')
  }

  return {
    success: true,
    message: `Saque de $${amount.toFixed(2)} processado (simulação)`,
    newBalance: (currentBalance - amount).toFixed(2),
    txHash: '0x' + Math.random().toString(16).substring(2, 66)
  }
}
