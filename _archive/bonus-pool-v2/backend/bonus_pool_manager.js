// ================================================================================
// BÔNUS POOL MANAGER - Sistema de Rastreamento Contábil
// ================================================================================
// Gerencia os cálculos contábeis do Bônus Pool
// NÃO altera comissões - apenas rastreia origem e destino

import { proofContract } from './proof.js';

// ================================================================================
// CONSTANTES DO MODELO
// ================================================================================

const PERFORMANCE_FEE_PERCENTAGE = 35; // 35% dos lucros brutos
const BONUS_POOL_PERCENTAGE = 20; // 20% do performance fee
const OPERATIONAL_PERCENTAGE = 15; // 15% do performance fee
const CLIENT_SHARE_PERCENTAGE = 65; // 65% fica com o cliente

// ================================================================================
// FUNÇÕES DE CÁLCULO CONTÁBIL
// ================================================================================

/**
 * Calcular dados do Bônus Pool para uma semana
 *
 * @param {Object} weekData - Dados da semana
 * @param {number} weekData.totalClientProfits - Lucro bruto total dos clientes (em cents)
 * @param {number} weekData.totalCommissionsPaid - Total de comissões calculadas (em cents)
 * @param {number} weekData.previousPoolBalance - Saldo anterior do Pool (em cents)
 * @returns {Object} Dados contábeis do Bônus Pool
 *
 * @example
 * const result = calculateWeeklyBonusPool({
 *   totalClientProfits: 10000, // $100.00 em cents
 *   totalCommissionsPaid: 1625, // $16.25 em cents
 *   previousPoolBalance: 0      // Pool começa zerado
 * });
 *
 * // Resultado:
 * // {
 * //   totalPerformanceFee: 3500,      // $35.00 (35% de $100)
 * //   bonusPoolAdded: 700,            // $7.00 (20% de $35)
 * //   bonusPoolBalance: 0,            // Saldo anterior
 * //   bonusPoolDistributed: 1625,     // $16.25 distribuído
 * //   bonusPoolRemaining: 0,          // Pool zerado (déficit)
 * //   operationalRevenue: 525,        // $5.25 (15% de $35)
 * //   poolDeficit: 925                // $9.25 (coberto pela operação)
 * // }
 */
export function calculateWeeklyBonusPool(weekData) {
  const { totalClientProfits, totalCommissionsPaid, previousPoolBalance = 0 } = weekData;

  // Validações
  if (!totalClientProfits || totalClientProfits <= 0) {
    throw new Error('totalClientProfits deve ser maior que zero');
  }
  if (!totalCommissionsPaid || totalCommissionsPaid < 0) {
    throw new Error('totalCommissionsPaid deve ser maior ou igual a zero');
  }
  if (previousPoolBalance < 0) {
    throw new Error('previousPoolBalance não pode ser negativo');
  }

  // 1. Calcular performance fee total (35% dos lucros brutos)
  const totalPerformanceFee = Math.floor((totalClientProfits * PERFORMANCE_FEE_PERCENTAGE) / 100);

  // 2. Separar performance fee
  const bonusPoolAdded = Math.floor((totalPerformanceFee * BONUS_POOL_PERCENTAGE) / 100);
  const operationalRevenue = Math.floor((totalPerformanceFee * OPERATIONAL_PERCENTAGE) / 100);

  // 3. Adicionar ao Pool
  let newPoolBalance = previousPoolBalance + bonusPoolAdded;

  // 4. Verificar se Pool cobre as comissões
  let poolDeficit = 0;
  let finalPoolBalance = 0;

  if (totalCommissionsPaid > newPoolBalance) {
    // Pool NÃO cobre - há déficit
    poolDeficit = totalCommissionsPaid - newPoolBalance;
    finalPoolBalance = 0; // Pool zerado

    console.log(`⚠️  Bônus Pool - Déficit detectado: $${(poolDeficit / 100).toFixed(2)}`);
    console.log(`    Pool tinha: $${(newPoolBalance / 100).toFixed(2)}`);
    console.log(`    Precisava: $${(totalCommissionsPaid / 100).toFixed(2)}`);
    console.log(`    Déficit coberto pela receita operacional ($${(operationalRevenue / 100).toFixed(2)})`);
  } else {
    // Pool cobre normalmente
    finalPoolBalance = newPoolBalance - totalCommissionsPaid;

    console.log(`✅ Bônus Pool - Saldo suficiente`);
    console.log(`    Pool tinha: $${(newPoolBalance / 100).toFixed(2)}`);
    console.log(`    Distribuiu: $${(totalCommissionsPaid / 100).toFixed(2)}`);
    console.log(`    Saldo final: $${(finalPoolBalance / 100).toFixed(2)}`);
  }

  return {
    totalPerformanceFee,
    bonusPoolAdded,
    bonusPoolBalance: previousPoolBalance,
    bonusPoolDistributed: totalCommissionsPaid,
    bonusPoolRemaining: finalPoolBalance,
    operationalRevenue,
    poolDeficit
  };
}

/**
 * Validar sustentabilidade do modelo
 *
 * @param {number} totalPerformanceFee - Total de performance fee (cents)
 * @param {number} totalCommissions - Total de comissões (cents)
 * @returns {Object} Análise de sustentabilidade
 */
export function validateSustainability(totalPerformanceFee, totalCommissions) {
  const isSustainable = totalPerformanceFee > totalCommissions;
  const margin = totalPerformanceFee - totalCommissions;
  const marginPercentage = (margin / totalPerformanceFee) * 100;

  return {
    isSustainable,
    totalPerformanceFee,
    totalCommissions,
    margin,
    marginPercentage: marginPercentage.toFixed(2)
  };
}

/**
 * Formatar valores do Bônus Pool para exibição
 *
 * @param {Object} bonusPoolData - Dados calculados do Pool
 * @returns {Object} Dados formatados em dólares
 */
export function formatBonusPoolData(bonusPoolData) {
  return {
    totalPerformanceFee: (bonusPoolData.totalPerformanceFee / 100).toFixed(2),
    bonusPoolAdded: (bonusPoolData.bonusPoolAdded / 100).toFixed(2),
    bonusPoolBalance: (bonusPoolData.bonusPoolBalance / 100).toFixed(2),
    bonusPoolDistributed: (bonusPoolData.bonusPoolDistributed / 100).toFixed(2),
    bonusPoolRemaining: (bonusPoolData.bonusPoolRemaining / 100).toFixed(2),
    operationalRevenue: (bonusPoolData.operationalRevenue / 100).toFixed(2),
    poolDeficit: (bonusPoolData.poolDeficit / 100).toFixed(2)
  };
}

// ================================================================================
// FUNÇÕES DE CONSULTA BLOCKCHAIN
// ================================================================================

/**
 * Buscar saldo atual do Bônus Pool on-chain
 *
 * @returns {Promise<number>} Saldo em cents
 */
export async function getBonusPoolBalance() {
  try {
    const contract = proofContract();
    const balance = await contract.getBonusPoolBalance();
    return Number(balance);
  } catch (error) {
    console.error('❌ Erro ao buscar saldo do Bônus Pool:', error);
    throw error;
  }
}

/**
 * Buscar estatísticas completas do Bônus Pool
 *
 * @returns {Promise<Object>} Estatísticas do Pool
 */
export async function getBonusPoolStats() {
  try {
    const contract = proofContract();
    const stats = await contract.getBonusPoolStats();

    // stats retorna: [currentBalance, totalAdded, totalDistributed, totalDeficitsCovered, utilizationRate, coverageRate]
    return {
      currentBalance: Number(stats[0]),
      totalAdded: Number(stats[1]),
      totalDistributed: Number(stats[2]),
      totalDeficitsCovered: Number(stats[3]),
      utilizationRate: Number(stats[4]) / 100, // De base 10000 para percentual
      coverageRate: Number(stats[5]) / 100 // De base 10000 para percentual
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do Bônus Pool:', error);
    throw error;
  }
}

/**
 * Buscar análise de sustentabilidade on-chain
 *
 * @returns {Promise<Object>} Análise de sustentabilidade
 */
export async function getSustainabilityAnalysis() {
  try {
    const contract = proofContract();
    const analysis = await contract.getSustainabilityAnalysis();

    // analysis retorna: [avgPerformanceFee, avgCommissionsPaid, avgOperationalRevenue, avgPoolContribution, avgDeficit, isSustainable]
    return {
      avgPerformanceFee: Number(analysis[0]),
      avgCommissionsPaid: Number(analysis[1]),
      avgOperationalRevenue: Number(analysis[2]),
      avgPoolContribution: Number(analysis[3]),
      avgDeficit: Number(analysis[4]),
      isSustainable: analysis[5]
    };
  } catch (error) {
    console.error('❌ Erro ao buscar análise de sustentabilidade:', error);
    throw error;
  }
}

/**
 * Buscar dados recentes do Bônus Pool (últimas N semanas)
 *
 * @param {number} count - Número de semanas
 * @returns {Promise<Array>} Array de dados semanais
 */
export async function getRecentBonusPoolData(count = 12) {
  try {
    const contract = proofContract();
    const data = await contract.getRecentBonusPoolData(count);

    // data retorna: [weeks[], added[], distributed[], balances[], deficits[]]
    const weeks = data[0].map(Number);
    const added = data[1].map(Number);
    const distributed = data[2].map(Number);
    const balances = data[3].map(Number);
    const deficits = data[4].map(Number);

    // Combinar em array de objetos
    return weeks.map((week, index) => ({
      week,
      weekDate: new Date(week * 1000).toISOString(),
      bonusPoolAdded: added[index],
      bonusPoolDistributed: distributed[index],
      bonusPoolBalance: balances[index],
      poolDeficit: deficits[index]
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar dados recentes do Bônus Pool:', error);
    throw error;
  }
}

// ================================================================================
// FUNÇÕES DE LOG E DEBUG
// ================================================================================

/**
 * Log detalhado do cálculo do Bônus Pool
 *
 * @param {Object} weekData - Dados da semana
 * @param {Object} bonusPoolData - Dados calculados
 */
export function logBonusPoolCalculation(weekData, bonusPoolData) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CÁLCULO DO BÔNUS POOL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n💰 ENTRADA:');
  console.log(`   Lucro bruto clientes: $${(weekData.totalClientProfits / 100).toFixed(2)}`);
  console.log(`   Performance fee (35%): $${(bonusPoolData.totalPerformanceFee / 100).toFixed(2)}`);
  console.log(`   └─ Para Bônus Pool (20%): $${(bonusPoolData.bonusPoolAdded / 100).toFixed(2)}`);
  console.log(`   └─ Para Operação (15%): $${(bonusPoolData.operationalRevenue / 100).toFixed(2)}`);

  console.log('\n💸 SAÍDA:');
  console.log(`   Comissões distribuídas: $${(bonusPoolData.bonusPoolDistributed / 100).toFixed(2)}`);

  console.log('\n🏦 SALDOS:');
  console.log(`   Saldo anterior: $${(bonusPoolData.bonusPoolBalance / 100).toFixed(2)}`);
  console.log(`   Saldo + entrada: $${((bonusPoolData.bonusPoolBalance + bonusPoolData.bonusPoolAdded) / 100).toFixed(2)}`);
  console.log(`   Saldo final: $${(bonusPoolData.bonusPoolRemaining / 100).toFixed(2)}`);

  if (bonusPoolData.poolDeficit > 0) {
    console.log('\n⚠️  DÉFICIT:');
    console.log(`   Déficit: $${(bonusPoolData.poolDeficit / 100).toFixed(2)}`);
    console.log(`   Coberto por: Receita operacional`);
    console.log(`   Sobra operacional após cobrir: $${((bonusPoolData.operationalRevenue - bonusPoolData.poolDeficit) / 100).toFixed(2)}`);
  }

  const sustainability = validateSustainability(
    bonusPoolData.totalPerformanceFee,
    bonusPoolData.bonusPoolDistributed
  );

  console.log('\n✅ SUSTENTABILIDADE:');
  console.log(`   Performance fee: $${(sustainability.totalPerformanceFee / 100).toFixed(2)}`);
  console.log(`   Comissões: $${(sustainability.totalCommissions / 100).toFixed(2)}`);
  console.log(`   Margem: $${(sustainability.margin / 100).toFixed(2)} (${sustainability.marginPercentage}%)`);
  console.log(`   Status: ${sustainability.isSustainable ? '✅ SUSTENTÁVEL' : '❌ INSUSTENTÁVEL'}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Gerar relatório semanal do Bônus Pool
 *
 * @param {number} weekNumber - Número da semana
 * @param {Object} weekData - Dados da semana
 * @param {Object} bonusPoolData - Dados calculados
 * @returns {string} Relatório formatado
 */
export function generateWeeklyReport(weekNumber, weekData, bonusPoolData) {
  const formatted = formatBonusPoolData(bonusPoolData);
  const sustainability = validateSustainability(
    bonusPoolData.totalPerformanceFee,
    bonusPoolData.bonusPoolDistributed
  );

  return `
╔════════════════════════════════════════════════════════════════╗
║                   RELATÓRIO SEMANAL - BÔNUS POOL               ║
║                         Semana ${weekNumber.toString().padStart(3, '0')}                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📊 PERFORMANCE:                                               ║
║     Lucro bruto clientes ........... $${((weekData.totalClientProfits / 100).toFixed(2)).padStart(10)}  ║
║     Performance fee (35%) .......... $${formatted.totalPerformanceFee.padStart(10)}  ║
║                                                                ║
║  🏦 BÔNUS POOL:                                                ║
║     Entrada (20% do perf. fee) ..... $${formatted.bonusPoolAdded.padStart(10)}  ║
║     Distribuído (comissões) ........ $${formatted.bonusPoolDistributed.padStart(10)}  ║
║     Déficit (se houver) ............ $${formatted.poolDeficit.padStart(10)}  ║
║     Saldo final .................... $${formatted.bonusPoolRemaining.padStart(10)}  ║
║                                                                ║
║  💼 OPERAÇÃO:                                                  ║
║     Receita (15% do perf. fee) ..... $${formatted.operationalRevenue.padStart(10)}  ║
║     Sobra após déficit ............. $${((bonusPoolData.operationalRevenue - bonusPoolData.poolDeficit) / 100).toFixed(2).padStart(10)}  ║
║                                                                ║
║  ✅ SUSTENTABILIDADE:                                          ║
║     Margem ......................... $${(sustainability.margin / 100).toFixed(2).padStart(10)}  ║
║     Margem % ....................... ${sustainability.marginPercentage.padStart(9)}%  ║
║     Status ......................... ${sustainability.isSustainable ? '✅ SUSTENTÁVEL' : '❌ INSUSTENTÁVEL'}       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `;
}

// ================================================================================
// EXPORTAR TUDO
// ================================================================================

export default {
  // Cálculos
  calculateWeeklyBonusPool,
  validateSustainability,
  formatBonusPoolData,

  // Blockchain queries
  getBonusPoolBalance,
  getBonusPoolStats,
  getSustainabilityAnalysis,
  getRecentBonusPoolData,

  // Utils
  logBonusPoolCalculation,
  generateWeeklyReport,

  // Constantes
  PERFORMANCE_FEE_PERCENTAGE,
  BONUS_POOL_PERCENTAGE,
  OPERATIONAL_PERCENTAGE,
  CLIENT_SHARE_PERCENTAGE
};
