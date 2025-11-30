/**
 * 🎭 GMI MOCK SERVICE
 *
 * Serviço MOCK que simula a API GMI Edge conforme documentação.
 * Retorna dados simulados realistas para desenvolvimento.
 *
 * IMPORTANTE: Este é um MOCK temporário até a API real estar disponível.
 * Quando a API GMI Edge funcionar, substituir por gmiEdgeClient real.
 */

/**
 * Gera dados simulados de conta GMI/MT5
 * Baseado na estrutura da documentação GMI_Edge_API_Documentation2.md
 */
export function getMockAccountData(walletAddress) {
  // Simula variação de valores para parecer real
  const now = Date.now();
  const seed = walletAddress ? walletAddress.charCodeAt(2) : 0;

  const baseBalance = 100000 + (seed * 100);
  const variation = Math.sin(now / 10000) * 1000;
  const balance = baseBalance + variation;

  const margin = 200 + (Math.sin(now / 5000) * 100);
  const equity = balance - margin + (Math.sin(now / 7000) * 500);
  const profit = equity - balance;

  return {
    success: true,
    connected: true,
    account: {
      accountId: "32650015", // Account number
      accountType: "STANDARD",
      currency: "USD",
      balance: parseFloat(balance.toFixed(2)),
      equity: parseFloat(equity.toFixed(2)),
      margin: parseFloat(margin.toFixed(2)),
      freeMargin: parseFloat((equity - margin).toFixed(2)),
      marginLevel: parseFloat(((equity / margin) * 100).toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      leverage: 500,
      server: "GMI3-Real",
      status: "ACTIVE"
    },
    performance: {
      monthlyVolume: 15134.37 + (seed * 10),
      totalTrades: 39 + seed,
      profitTrades: 30 + Math.floor(seed / 2),
      lossTrades: 9 + Math.floor(seed / 4),
      winRate: parseFloat((((30 + Math.floor(seed / 2)) / (39 + seed)) * 100).toFixed(2)),
      grossProfit: 963.85 + (seed * 5),
      grossLoss: 303.78 + (seed * 2),
      netProfit: 660.07 + (seed * 3),
      profitFactor: 3.17
    },
    positions: generateMockPositions(seed),
    lastUpdate: new Date().toISOString(),
    source: 'mock'
  };
}

/**
 * Gera posições abertas simuladas
 */
function generateMockPositions(seed = 0) {
  const numPositions = Math.floor(Math.random() * 5);
  const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD'];

  const positions = [];

  for (let i = 0; i < numPositions; i++) {
    const symbol = symbols[i % symbols.length];
    const type = i % 2 === 0 ? 'BUY' : 'SELL';
    const volume = parseFloat((0.01 + Math.random() * 0.5).toFixed(2));
    const openPrice = 1000 + Math.random() * 2000;
    const currentPrice = openPrice + (Math.random() - 0.5) * 100;
    const profit = (currentPrice - openPrice) * volume * (type === 'BUY' ? 1 : -1);

    positions.push({
      positionId: `POS${Date.now()}${i}`,
      symbol: symbol,
      type: type,
      volume: volume,
      openPrice: parseFloat(openPrice.toFixed(2)),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      sl: 0,
      tp: 0,
      swap: parseFloat((Math.random() * 10).toFixed(2)),
      commission: parseFloat((Math.random() * 5).toFixed(2)),
      openTime: new Date(Date.now() - Math.random() * 86400000).toISOString()
    });
  }

  return positions;
}

/**
 * Calcula elegibilidade MLM baseada em dados MOCK
 */
export function getMockEligibility(walletAddress, directReferrals = 0) {
  const accountData = getMockAccountData(walletAddress);
  const monthlyVolume = accountData.performance.monthlyVolume;

  const volumeRequirement = 5000;
  const directsRequirement = 5;

  const hasVolumeRequirement = monthlyVolume >= volumeRequirement;
  const hasDirectsRequirement = directReferrals >= directsRequirement;
  const eligible = hasVolumeRequirement && hasDirectsRequirement;

  // Calcular maxLevel baseado em volume
  let maxLevel = 1;

  if (eligible) {
    if (monthlyVolume >= volumeRequirement * 10) {
      maxLevel = 10;
    } else if (monthlyVolume >= volumeRequirement * 5) {
      maxLevel = 7;
    } else if (monthlyVolume >= volumeRequirement * 2) {
      maxLevel = 4;
    } else if (monthlyVolume >= volumeRequirement) {
      maxLevel = 4;
    }
  }

  return {
    eligible,
    maxLevel,
    reason: eligible ? 'Eligible based on volume and directs' : 'Does not meet requirements',
    volumeRequirement,
    currentVolume: monthlyVolume,
    directsRequirement,
    currentDirects: directReferrals,
    volumeMultiplier: (monthlyVolume / volumeRequirement).toFixed(2),
    source: 'mock',
    timestamp: new Date().toISOString()
  };
}

/**
 * Simula histórico de trades
 */
export function getMockTradeHistory(days = 30) {
  const trades = [];
  const numTrades = Math.floor(Math.random() * 50) + 20;

  for (let i = 0; i < numTrades; i++) {
    const profit = (Math.random() - 0.3) * 500;
    const volume = parseFloat((0.01 + Math.random() * 1).toFixed(2));

    trades.push({
      tradeId: `TRADE${Date.now()}${i}`,
      symbol: ['XAUUSD', 'EURUSD', 'GBPUSD'][i % 3],
      type: i % 2 === 0 ? 'BUY' : 'SELL',
      volume: volume,
      openPrice: 1000 + Math.random() * 2000,
      closePrice: 1000 + Math.random() * 2000,
      profit: parseFloat(profit.toFixed(2)),
      commission: parseFloat((Math.random() * 10).toFixed(2)),
      swap: parseFloat((Math.random() * 5).toFixed(2)),
      openTime: new Date(Date.now() - Math.random() * days * 86400000).toISOString(),
      closeTime: new Date(Date.now() - Math.random() * (days - 1) * 86400000).toISOString()
    });
  }

  const profitTrades = trades.filter(t => t.profit > 0);
  const lossTrades = trades.filter(t => t.profit < 0);

  const summary = {
    totalTrades: trades.length,
    winningTrades: profitTrades.length,
    losingTrades: lossTrades.length,
    winRate: parseFloat(((profitTrades.length / trades.length) * 100).toFixed(2)),
    totalProfit: parseFloat(profitTrades.reduce((sum, t) => sum + t.profit, 0).toFixed(2)),
    totalLoss: parseFloat(Math.abs(lossTrades.reduce((sum, t) => sum + t.profit, 0)).toFixed(2)),
    totalCommission: parseFloat(trades.reduce((sum, t) => sum + t.commission, 0).toFixed(2)),
    totalSwap: parseFloat(trades.reduce((sum, t) => sum + t.swap, 0).toFixed(2)),
    totalNetProfit: parseFloat(trades.reduce((sum, t) => sum + t.profit - t.commission - t.swap, 0).toFixed(2))
  };

  return {
    trades,
    summary,
    period: {
      from: new Date(Date.now() - days * 86400000).toISOString(),
      to: new Date().toISOString(),
      days
    }
  };
}

/**
 * Simula símbolos disponíveis
 */
export function getMockSymbols() {
  return {
    symbols: [
      {
        symbol: 'XAUUSD',
        description: 'Gold vs US Dollar',
        category: 'Metals',
        digits: 2,
        minVolume: 0.01,
        maxVolume: 100,
        volumeStep: 0.01,
        contractSize: 100,
        spread: 0.35,
        tradingHours: '24/5'
      },
      {
        symbol: 'EURUSD',
        description: 'Euro vs US Dollar',
        category: 'Forex',
        digits: 5,
        minVolume: 0.01,
        maxVolume: 100,
        volumeStep: 0.01,
        contractSize: 100000,
        spread: 0.00012,
        tradingHours: '24/5'
      },
      {
        symbol: 'GBPUSD',
        description: 'British Pound vs US Dollar',
        category: 'Forex',
        digits: 5,
        minVolume: 0.01,
        maxVolume: 100,
        volumeStep: 0.01,
        contractSize: 100000,
        spread: 0.00015,
        tradingHours: '24/5'
      }
    ]
  };
}

export default {
  getMockAccountData,
  getMockEligibility,
  getMockTradeHistory,
  getMockSymbols
};
