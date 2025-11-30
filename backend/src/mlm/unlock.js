import config from '../config/index.js';
import logger from '../config/logger.js';
import contractV10 from '../contracts/v10.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * MLM UNLOCK SERVICE
 * ============================================================================
 *
 * Verifica e desbloqueia níveis MLM baseado em pré-requisitos:
 * - Níveis 1-5: Desbloqueados automaticamente
 * - Níveis 6-10: Requer 5 diretos ativos + $5,000 volume combinado
 */

class MlmUnlockService {
  constructor() {
    this.requiredDirects = config.mlmUnlockDirects; // 5
    this.requiredVolume = config.mlmUnlockVolume;   // 5000
    logger.info(`MLM Unlock initialized: ${this.requiredDirects} directs + $${this.requiredVolume} volume`);
  }

  /**
   * Verifica se usuário qualifica para níveis 6-10
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da verificação
   */
  async checkEligibility(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          referrals: {
            where: { active: true } // Apenas diretos ativos
          }
        }
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Contar diretos ativos
      const activeDirects = user.referrals.length;

      // Calcular volume combinado dos diretos
      const combinedVolume = user.referrals.reduce(
        (sum, ref) => sum + parseFloat(ref.totalVolume),
        0
      );

      // Verificar se qualifica
      const qualifies = activeDirects >= this.requiredDirects && combinedVolume >= this.requiredVolume;

      // Determinar maxLevel adequado
      let recommendedMaxLevel;
      if (qualifies) {
        recommendedMaxLevel = 10; // Todos os níveis desbloqueados
      } else {
        recommendedMaxLevel = 5;  // Apenas primeiros 5 níveis
      }

      const result = {
        userId: user.id,
        walletAddress: user.walletAddress,
        currentMaxLevel: user.maxLevel,
        recommendedMaxLevel,
        qualifies,
        requirements: {
          directs: {
            required: this.requiredDirects,
            current: activeDirects,
            met: activeDirects >= this.requiredDirects
          },
          volume: {
            required: this.requiredVolume,
            current: parseFloat(combinedVolume.toFixed(2)),
            met: combinedVolume >= this.requiredVolume
          }
        },
        needsUpdate: user.maxLevel !== recommendedMaxLevel
      };

      logger.debug(`Eligibility check for ${user.walletAddress}: qualifies=${qualifies}, current=${user.maxLevel}, recommended=${recommendedMaxLevel}`);

      return result;
    } catch (error) {
      logger.error(`Error checking eligibility: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atualiza níveis desbloqueados do usuário (database + blockchain)
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da atualização
   */
  async updateUnlockedLevels(userId) {
    try {
      // Verificar elegibilidade
      const eligibility = await this.checkEligibility(userId);

      if (!eligibility.needsUpdate) {
        logger.info(`User ${eligibility.walletAddress} already has correct maxLevel (${eligibility.currentMaxLevel})`);
        return {
          updated: false,
          eligibility
        };
      }

      // Atualizar no banco
      const user = await prisma.user.update({
        where: { id: userId },
        data: { maxLevel: eligibility.recommendedMaxLevel }
      });

      logger.info(`Database updated: ${user.walletAddress} maxLevel ${eligibility.currentMaxLevel} → ${eligibility.recommendedMaxLevel}`);

      // Atualizar on-chain
      const receipt = await contractV10.setUnlockedLevels(
        user.walletAddress,
        eligibility.recommendedMaxLevel
      );

      logger.info(`Blockchain updated: TX ${receipt.hash}`);

      return {
        updated: true,
        previousMaxLevel: eligibility.currentMaxLevel,
        newMaxLevel: eligibility.recommendedMaxLevel,
        txHash: receipt.hash,
        eligibility
      };
    } catch (error) {
      logger.error(`Error updating unlocked levels: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica e atualiza níveis para todos os usuários (cron job)
   * @returns {Promise<Object>} Resumo das atualizações
   */
  async batchUpdateAllUsers() {
    try {
      logger.info('Starting batch unlock update for all users');

      // Buscar todos os usuários ativos
      const users = await prisma.user.findMany({
        where: { active: true }
      });

      const results = {
        total: users.length,
        checked: 0,
        updated: 0,
        errors: 0,
        details: []
      };

      for (const user of users) {
        try {
          results.checked++;

          const result = await this.updateUnlockedLevels(user.id);

          if (result.updated) {
            results.updated++;
            results.details.push({
              walletAddress: user.walletAddress,
              previousMaxLevel: result.previousMaxLevel,
              newMaxLevel: result.newMaxLevel,
              txHash: result.txHash
            });
          }
        } catch (error) {
          results.errors++;
          logger.error(`Error updating user ${user.walletAddress}: ${error.message}`);
        }
      }

      logger.info(`Batch unlock update completed: ${results.updated}/${results.total} users updated, ${results.errors} errors`);

      // Salvar log
      await prisma.syncLog.create({
        data: {
          type: 'eligibility',
          status: 'success',
          message: `Updated ${results.updated}/${results.total} users`,
          data: results
        }
      });

      return results;
    } catch (error) {
      logger.error(`Error in batch unlock update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém detalhes dos diretos de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de diretos com detalhes
   */
  async getDirectReferralsDetails(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          referrals: {
            orderBy: { totalVolume: 'desc' }
          }
        }
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      return user.referrals.map(ref => ({
        walletAddress: ref.walletAddress,
        active: ref.active,
        totalVolume: parseFloat(ref.totalVolume),
        monthlyVolume: parseFloat(ref.monthlyVolume),
        directReferrals: ref.directReferrals,
        createdAt: ref.createdAt
      }));
    } catch (error) {
      logger.error(`Error getting direct referrals: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simula elegibilidade com volumes hipotéticos
   * @param {string} userId - ID do usuário
   * @param {number} additionalDirects - Diretos adicionais simulados
   * @param {number} additionalVolume - Volume adicional simulado
   * @returns {Promise<Object>} Simulação
   */
  async simulateEligibility(userId, additionalDirects = 0, additionalVolume = 0) {
    try {
      const currentEligibility = await this.checkEligibility(userId);

      const simulatedDirects = currentEligibility.requirements.directs.current + additionalDirects;
      const simulatedVolume = currentEligibility.requirements.volume.current + additionalVolume;

      const wouldQualify = simulatedDirects >= this.requiredDirects && simulatedVolume >= this.requiredVolume;

      return {
        current: currentEligibility,
        simulated: {
          directs: simulatedDirects,
          volume: simulatedVolume,
          qualifies: wouldQualify,
          recommendedMaxLevel: wouldQualify ? 10 : 5
        },
        toQualify: {
          directsNeeded: Math.max(0, this.requiredDirects - simulatedDirects),
          volumeNeeded: Math.max(0, this.requiredVolume - simulatedVolume)
        }
      };
    } catch (error) {
      logger.error(`Error simulating eligibility: ${error.message}`);
      throw error;
    }
  }
}

export default new MlmUnlockService();
