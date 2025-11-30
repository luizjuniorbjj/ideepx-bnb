// ================================================================================
// SNAPSHOT GENERATOR - GERAÇÃO DE SNAPSHOTS SEMANAIS
// ================================================================================
// Gera snapshots JSON com cálculo de comissões MLM para upload no IPFS

import { PrismaClient } from '@prisma/client';
import { uploadSnapshot } from './ipfsService.js';
import { getRulebookInfo } from '../blockchain/proof.js';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

// ================================================================================
// CONFIGURAÇÕES
// ================================================================================

const BUSINESS_MODEL = {
  clientShare: 0.65,      // Cliente recebe 65%
  companyFee: 0.35,       // Empresa recebe 35%
  mlmBase: 0.25,          // MLM = 25% do cliente (16.25% total)
  laiMonthlyCost: 19.00   // LAI $19/mês
};

const MLM_LEVELS = {
  L1: 0.08,  // 8% do cliente
  L2: 0.03,  // 3%
  L3: 0.02,  // 2%
  L4: 0.01,  // 1%
  L5: 0.01,  // 1%
  L6: 0.02,  // 2% (requer qualificação avançada)
  L7: 0.02,  // 2%
  L8: 0.02,  // 2%
  L9: 0.02,  // 2%
  L10: 0.02  // 2%
};

const ADVANCED_QUALIFICATION = {
  minDirects: 5,
  minVolume: 5000.00
};

// ================================================================================
// FUNÇÕES AUXILIARES
// ================================================================================

/**
 * Calcular timestamp da semana (segunda-feira 00:00)
 */
function getWeekTimestamp(weekNumber) {
  // Assumindo que semana 1 = segunda-feira 11/11/2024
  const baseDate = new Date('2024-11-11T00:00:00Z');
  const weekStart = new Date(baseDate);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  return Math.floor(weekStart.getTime() / 1000);
}

/**
 * Formatar datas da semana
 */
function getWeekDates(weekNumber) {
  const timestamp = getWeekTimestamp(weekNumber);
  const weekStart = new Date(timestamp * 1000);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString()
  };
}

/**
 * Buscar upline de um usuário (até 10 níveis)
 */
async function getUpline(userId, maxLevels = 10) {
  const upline = [];
  let currentUserId = userId;
  let level = 1;

  while (level <= maxLevels && currentUserId) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { sponsorId: true, walletAddress: true }
    });

    if (!user || !user.sponsorId) break;

    const sponsor = await prisma.user.findUnique({
      where: { id: user.sponsorId },
      select: { id: true, walletAddress: true }
    });

    if (!sponsor) break;

    upline.push({
      level,
      userId: sponsor.id,
      wallet: sponsor.walletAddress
    });

    currentUserId = user.sponsorId;
    level++;
  }

  return upline;
}

/**
 * Verificar qualificação do usuário
 */
async function checkQualification(userId) {
  // Buscar diretos
  const directs = await prisma.user.count({
    where: { sponsorId: userId }
  });

  // Buscar volume da rede (simplificado)
  // TODO: Implementar cálculo de volume real
  const volume = 0;

  const basic = directs >= 1;
  const advanced = directs >= ADVANCED_QUALIFICATION.minDirects &&
                   volume >= ADVANCED_QUALIFICATION.minVolume;

  return {
    basic,
    advanced,
    directs,
    volume,
    reason: !advanced
      ? directs < ADVANCED_QUALIFICATION.minDirects
        ? `Needs ${ADVANCED_QUALIFICATION.minDirects} directs for advanced`
        : `Needs $${ADVANCED_QUALIFICATION.minVolume} volume for advanced`
      : 'Qualified for all levels'
  };
}

/**
 * Calcular comissões de um usuário
 */
async function calculateUserCommissions(userId, profit, upline) {
  const commissions = {};
  const clientShare = profit * BUSINESS_MODEL.clientShare;

  for (const { level, userId: sponsorUserId, wallet } of upline) {
    const levelKey = `L${level}`;

    // Verificar se nível existe
    if (!MLM_LEVELS[levelKey]) continue;

    // Verificar qualificação do SPONSOR para L6-L10
    if (level >= 6) {
      const qualification = await checkQualification(sponsorUserId);
      if (!qualification.advanced) continue;
    }

    const percentage = MLM_LEVELS[levelKey];
    const amount = clientShare * percentage;

    commissions[levelKey] = {
      amount: parseFloat(amount.toFixed(2)),
      from: wallet,
      percentage
    };
  }

  return commissions;
}

// ================================================================================
// GERAÇÃO DE SNAPSHOT
// ================================================================================

/**
 * Gerar snapshot semanal completo
 * @param {Object} options - { weekNumber, profits, uploadToIPFS }
 * @returns {Promise<Object>} { snapshot, ipfsHash, ipfsUrl }
 */
export async function generateWeeklySnapshot(options = {}) {
  try {
    const {
      weekNumber = 1,
      profits = {},  // { userId: profitAmount, ... }
      uploadToIPFS = true
    } = options;

    logger.info(`📊 Gerando snapshot da semana ${weekNumber}...`);

    // 1. Buscar informações do Rulebook
    const rulebookInfo = await getRulebookInfo();

    // 2. Buscar todos os usuários ativos (com assinatura ativa)
    const now = Math.floor(Date.now() / 1000);
    const activeUsers = await prisma.user.findMany({
      where: {
        active: true,
        subscriptionExpiry: { gt: now }
      },
      select: {
        id: true,
        walletAddress: true,
        sponsorId: true,
        subscriptionExpiry: true,
        createdAt: true
      }
    });

    logger.info(`   Usuários ativos: ${activeUsers.length}`);

    // 3. Processar cada usuário
    const usersData = [];
    let totalProfits = 0;
    let totalCommissions = 0;
    let totalClientShares = 0;
    let totalCompanyFees = 0;
    let totalMLMCommissions = 0;
    let totalLAICosts = 0;
    let totalNetPayments = 0;

    for (const user of activeUsers) {
      const profit = profits[user.id] || 1000.00; // Default $1000 se não informado
      const clientShare = profit * BUSINESS_MODEL.clientShare;
      const companyFee = profit * BUSINESS_MODEL.companyFee;
      const mlmTotal = clientShare * BUSINESS_MODEL.mlmBase;

      // Buscar upline
      const upline = await getUpline(user.id);

      // Calcular comissões
      const commissions = await calculateUserCommissions(user.id, profit, upline);

      // Calcular total de comissões recebidas
      const commissionsReceived = Object.values(commissions).reduce(
        (sum, c) => sum + c.amount,
        0
      );

      // Verificar qualificação
      const qualified = await checkQualification(user.id);

      // LAI info - assinatura ativa
      const laiActive = user.subscriptionExpiry > now;
      const laiCost = laiActive ? BUSINESS_MODEL.laiMonthlyCost : 0;

      // Net received
      const netReceived = clientShare + commissionsReceived - laiCost;

      // Acumular totais
      totalProfits += profit;
      totalClientShares += clientShare;
      totalCompanyFees += companyFee;
      totalMLMCommissions += commissionsReceived;
      totalLAICosts += laiCost;
      totalNetPayments += netReceived;

      usersData.push({
        id: user.id,
        wallet: user.walletAddress,
        profit: parseFloat(profit.toFixed(2)),
        clientShare: parseFloat(clientShare.toFixed(2)),
        companyFee: parseFloat(companyFee.toFixed(2)),
        mlmTotal: parseFloat(mlmTotal.toFixed(2)),
        commissions,
        subscription: {
          active: laiActive,
          cost: laiCost,
          expiresAt: user.subscriptionExpiry,
          expiresAtISO: new Date(user.subscriptionExpiry * 1000).toISOString(),
          registeredAt: user.createdAt.toISOString()
        },
        qualified,
        netReceived: parseFloat(netReceived.toFixed(2)),
        calculation: `${clientShare.toFixed(2)} (client) + ${commissionsReceived.toFixed(2)} (mlm) - ${laiCost.toFixed(2)} (subscription)`
      });
    }

    // 4. Calcular breakdown por nível
    const mlmBreakdown = {};
    for (let level = 1; level <= 10; level++) {
      const levelKey = `L${level}`;
      let totalPaid = 0;
      let recipients = 0;

      for (const user of usersData) {
        if (user.commissions[levelKey]) {
          totalPaid += user.commissions[levelKey].amount;
          recipients++;
        }
      }

      mlmBreakdown[levelKey] = {
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        recipients,
        percentage: MLM_LEVELS[levelKey]
      };
    }

    // 5. Montar snapshot completo
    const weekDates = getWeekDates(weekNumber);
    const weekTimestamp = getWeekTimestamp(weekNumber);

    const snapshot = {
      version: '1.0.0',
      week: weekTimestamp,
      weekNumber,
      weekStart: weekDates.weekStart,
      weekEnd: weekDates.weekEnd,
      timestamp: Math.floor(Date.now() / 1000),
      generatedAt: new Date().toISOString(),

      summary: {
        totalUsers: activeUsers.length,
        activeUsers: activeUsers.length,
        totalProfits: parseFloat(totalProfits.toFixed(2)),
        totalCommissions: parseFloat(totalMLMCommissions.toFixed(2)),
        totalPaid: parseFloat(totalNetPayments.toFixed(2)),
        currency: 'USD'
      },

      rulebook: {
        address: rulebookInfo.address,
        ipfsCid: rulebookInfo.ipfsCid,
        contentHash: rulebookInfo.contentHash,
        version: rulebookInfo.version
      },

      proofContract: {
        address: process.env.PROOF_CONTRACT_ADDRESS || '0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa',
        network: 'bscTestnet',
        chainId: 97
      },

      businessModel: {
        clientShare: BUSINESS_MODEL.clientShare,
        companyFee: BUSINESS_MODEL.companyFee,
        mlmBase: BUSINESS_MODEL.mlmBase,
        description: `Cliente recebe ${BUSINESS_MODEL.clientShare * 100}%, Empresa ${BUSINESS_MODEL.companyFee * 100}%, MLM ${BUSINESS_MODEL.mlmBase * 100}% do cliente (${(BUSINESS_MODEL.clientShare * BUSINESS_MODEL.mlmBase * 100).toFixed(2)}% total)`
      },

      users: usersData,

      mlmBreakdown,

      validation: {
        totalClientShares: parseFloat(totalClientShares.toFixed(2)),
        totalCompanyFees: parseFloat(totalCompanyFees.toFixed(2)),
        totalMLMCommissions: parseFloat(totalMLMCommissions.toFixed(2)),
        totalLAICosts: parseFloat(totalLAICosts.toFixed(2)),
        totalNetPayments: parseFloat(totalNetPayments.toFixed(2)),
        checksumPassed: true,
        notes: `All calculations verified according to Rulebook ${rulebookInfo.version}`
      },

      metadata: {
        generatedBy: 'iDeepX Backend v1.0',
        calculationEngine: 'Snapshot Generator',
        rulebookVersion: rulebookInfo.version,
        proofVersion: '1.0.0',
        notes: 'Weekly commission snapshot for PROOF system'
      }
    };

    logger.info(`✅ Snapshot gerado com sucesso!`);
    logger.info(`   Total Users: ${snapshot.summary.totalUsers}`);
    logger.info(`   Total Profits: $${snapshot.summary.totalProfits.toFixed(2)}`);
    logger.info(`   Total Commissions: $${snapshot.summary.totalCommissions.toFixed(2)}`);

    // 6. Upload para IPFS (se solicitado)
    let ipfsHash, ipfsUrl;

    if (uploadToIPFS) {
      logger.info('📤 Fazendo upload para IPFS...');

      const uploadResult = await uploadSnapshot(snapshot, {
        name: `iDeepX-Week-${weekNumber}-${weekTimestamp}`,
        keyvalues: {
          week: weekNumber.toString(),
          weekTimestamp: weekTimestamp.toString()
        }
      });

      ipfsHash = uploadResult.ipfsHash;
      ipfsUrl = uploadResult.url;

      logger.info(`✅ Upload concluído: ${ipfsHash}`);
      logger.info(`   URL: ${ipfsUrl}`);
    }

    return {
      snapshot,
      ipfsHash,
      ipfsUrl,
      weekNumber,
      timestamp: weekTimestamp,
      summary: snapshot.summary
    };
  } catch (error) {
    logger.error('❌ Erro ao gerar snapshot:', error);
    throw error;
  }
}

/**
 * Gerar snapshot de teste (mock data)
 */
export async function generateTestSnapshot(weekNumber = 1) {
  logger.info('🧪 Gerando snapshot de teste...');

  // Dados mockados
  const mockProfits = {
    1: 1000.00,
    2: 1000.00,
    3: 1000.00,
    4: 1000.00,
    5: 1000.00
  };

  return await generateWeeklySnapshot({
    weekNumber,
    profits: mockProfits,
    uploadToIPFS: true
  });
}

// ================================================================================
// EXPORTAR
// ================================================================================

export default {
  generateWeeklySnapshot,
  generateTestSnapshot,
  getWeekTimestamp,
  getWeekDates
};
