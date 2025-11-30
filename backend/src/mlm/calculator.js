import config from '../config/index.js';
import logger from '../config/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * MLM CALCULATOR - iDeepX V10
 * ============================================================================
 *
 * Calcula comissões MLM de acordo com o plano de negócios:
 * - 25% do lucro distribuído em 10 níveis
 * - Percentuais: [8, 3, 2, 1, 1, 2, 2, 2, 2, 2] = 25%
 * - Níveis 1-5: Desbloqueados automaticamente
 * - Níveis 6-10: Requer 5 diretos ativos + $5k volume
 */

class MlmCalculator {
  constructor() {
    // Percentuais MLM (em %, soma = 25%)
    this.percentages = config.mlmPercentages; // [8, 3, 2, 1, 1, 2, 2, 2, 2, 2]

    // Validar soma
    const sum = this.percentages.reduce((a, b) => a + b, 0);
    if (sum !== 25) {
      logger.warn(`MLM percentages sum is ${sum}%, expected 25%`);
    }

    logger.info(`MLM Calculator initialized with percentages: ${this.percentages.join(', ')}`);
  }

  /**
   * Calcula distribuição MLM para um usuário
   * @param {string} userId - ID do usuário que gerou lucro
   * @param {number} profitAmount - Lucro do cliente em USD
   * @returns {Promise<Array>} Array de comissões [{userId, level, percentage, amount}]
   */
  async calculateCommissions(userId, profitAmount) {
    try {
      logger.info(`Calculating MLM for user ${userId}, profit: $${profitAmount}`);

      const commissions = [];
      let currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { sponsor: true }
      });

      if (!currentUser) {
        throw new Error(`User ${userId} not found`);
      }

      // Pool MLM = 25% do lucro
      const mlmPool = profitAmount * 0.25;

      // Percorrer upline (até 10 níveis)
      let currentSponsor = currentUser.sponsor;
      let level = 1;

      while (currentSponsor && level <= 10) {
        // Verificar se nível está desbloqueado
        const isUnlocked = level <= currentSponsor.maxLevel;

        if (isUnlocked && currentSponsor.active) {
          // Calcular comissão
          const percentage = this.percentages[level - 1];
          const amount = (mlmPool * percentage) / 100;

          commissions.push({
            userId: currentSponsor.id,
            walletAddress: currentSponsor.walletAddress,
            level,
            percentage,
            amount: parseFloat(amount.toFixed(6))
          });

          logger.debug(`Level ${level}: ${currentSponsor.walletAddress} receives ${percentage}% = $${amount.toFixed(2)}`);
        } else {
          logger.debug(`Level ${level}: ${currentSponsor.walletAddress} - LOCKED (maxLevel: ${currentSponsor.maxLevel})`);
        }

        // Próximo nível
        currentSponsor = await prisma.user.findUnique({
          where: { id: currentSponsor.sponsorId },
          include: { sponsor: true }
        }).then(u => u?.sponsor);

        level++;
      }

      // Total distribuído
      const totalDistributed = commissions.reduce((sum, c) => sum + c.amount, 0);
      const unallocated = mlmPool - totalDistributed;

      logger.info(`MLM calculated: ${commissions.length} recipients, $${totalDistributed.toFixed(2)} distributed, $${unallocated.toFixed(2)} unallocated`);

      return {
        commissions,
        summary: {
          mlmPool,
          totalDistributed,
          unallocated,
          recipients: commissions.length
        }
      };
    } catch (error) {
      logger.error(`Error calculating MLM: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calcula comissões em lote (para múltiplos usuários)
   * @param {Array} performances - [{userId, profitAmount}]
   * @returns {Promise<Object>} Comissões agrupadas por carteira
   */
  async calculateBatchCommissions(performances) {
    try {
      logger.info(`Calculating batch MLM for ${performances.length} users`);

      const allCommissions = [];

      // Calcular para cada usuário
      for (const perf of performances) {
        const result = await this.calculateCommissions(perf.userId, perf.profitAmount);
        allCommissions.push(...result.commissions);
      }

      // Agrupar por carteira (somar comissões do mesmo usuário)
      const grouped = {};
      for (const comm of allCommissions) {
        if (!grouped[comm.walletAddress]) {
          grouped[comm.walletAddress] = {
            userId: comm.userId,
            walletAddress: comm.walletAddress,
            totalAmount: 0,
            commissions: []
          };
        }
        grouped[comm.walletAddress].totalAmount += comm.amount;
        grouped[comm.walletAddress].commissions.push(comm);
      }

      // Converter para array
      const result = Object.values(grouped).map(g => ({
        userId: g.userId,
        walletAddress: g.walletAddress,
        totalAmount: parseFloat(g.totalAmount.toFixed(6)),
        commissionsCount: g.commissions.length
      }));

      const totalAmount = result.reduce((sum, r) => sum + r.totalAmount, 0);

      logger.info(`Batch MLM calculated: ${result.length} unique recipients, $${totalAmount.toFixed(2)} total`);

      return {
        recipients: result,
        summary: {
          totalRecipients: result.length,
          totalAmount,
          averagePerRecipient: result.length > 0 ? totalAmount / result.length : 0
        }
      };
    } catch (error) {
      logger.error(`Error calculating batch MLM: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simula distribuição MLM (sem salvar no banco)
   * @param {string} userId - ID do usuário
   * @param {number} profitAmount - Lucro em USD
   * @returns {Promise<Object>} Simulação completa
   */
  async simulate(userId, profitAmount) {
    try {
      const result = await this.calculateCommissions(userId, profitAmount);

      // Adicionar detalhes da upline
      const uplineDetails = [];
      let currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { sponsor: true }
      });

      let sponsor = currentUser.sponsor;
      let level = 1;

      while (sponsor && level <= 10) {
        uplineDetails.push({
          level,
          walletAddress: sponsor.walletAddress,
          active: sponsor.active,
          maxLevel: sponsor.maxLevel,
          unlocked: level <= sponsor.maxLevel,
          directReferrals: sponsor.directReferrals,
          totalVolume: parseFloat(sponsor.totalVolume)
        });

        sponsor = await prisma.user.findUnique({
          where: { id: sponsor.sponsorId },
          include: { sponsor: true }
        }).then(u => u?.sponsor);

        level++;
      }

      return {
        ...result,
        uplineDetails
      };
    } catch (error) {
      logger.error(`Error simulating MLM: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém estatísticas MLM de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Estatísticas
   */
  async getUserMlmStats(userId) {
    try {
      // Total earned via MLM
      const commissions = await prisma.mlmCommission.findMany({
        where: { fromUserId: userId, paid: true }
      });

      const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

      // Count por nível
      const byLevel = {};
      for (let i = 1; i <= 10; i++) {
        byLevel[`level${i}`] = commissions
          .filter(c => c.level === i)
          .reduce((sum, c) => sum + parseFloat(c.amount), 0);
      }

      // Network stats - usar contagem recursiva completa
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      // Contar rede total recursivamente (até 10 níveis)
      const networkSize = await this._countNetworkSizeRecursive(userId);

      // Contar apenas indicados diretos ativos
      const directReferrals = await prisma.user.count({
        where: { sponsorId: userId, active: true }
      });

      return {
        totalEarned,
        commissionsCount: commissions.length,
        byLevel,
        networkSize,
        maxLevel: user.maxLevel,
        directReferrals
      };
    } catch (error) {
      logger.error(`Error getting MLM stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Conta tamanho da rede recursivamente até 10 níveis
   * Faz queries do Prisma em cada nível (solução para limitação do include recursivo)
   */
  async _countNetworkSizeRecursive(userId, depth = 0, maxDepth = 10) {
    if (!userId || depth >= maxDepth) return 0;

    // Buscar indicados diretos
    const directReferrals = await prisma.user.findMany({
      where: { sponsorId: userId },
      select: { id: true }
    });

    let count = directReferrals.length;

    // Contar recursivamente para cada indicado
    for (const ref of directReferrals) {
      count += await this._countNetworkSizeRecursive(ref.id, depth + 1, maxDepth);
    }

    return count;
  }
}

export default new MlmCalculator();
