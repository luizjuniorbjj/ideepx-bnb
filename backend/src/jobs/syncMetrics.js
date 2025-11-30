import logger from '../config/logger.js';
import contractV10 from '../contracts/v10.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * SYNC METRICS JOB
 * ============================================================================
 * Sincroniza métricas dos usuários entre database e blockchain
 * Cron: A cada 6 horas
 */

export async function syncMetrics() {
  try {
    logger.info('🔄 Starting metrics sync job');

    const users = await prisma.user.findMany({
      where: { active: true }
    });

    let synced = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Buscar dados on-chain
        const onChainData = await contractV10.getUserView(user.walletAddress);

        // Atualizar campos se diferentes
        const updates = {};

        if (onChainData.active !== user.active) {
          updates.active = onChainData.active;
        }

        if (Number(onChainData.maxLevel) !== user.maxLevel) {
          updates.maxLevel = Number(onChainData.maxLevel);
        }

        if (onChainData.monthlyVolume !== user.monthlyVolume.toString()) {
          updates.monthlyVolume = parseFloat(onChainData.monthlyVolume);
        }

        // Se houver mudanças, atualizar
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: updates
          });
          synced++;
          logger.debug(`Synced ${user.walletAddress}: ${JSON.stringify(updates)}`);
        }

      } catch (error) {
        errors++;
        logger.error(`Error syncing user ${user.walletAddress}: ${error.message}`);
      }
    }

    logger.info(`✅ Metrics sync completed: ${synced} users synced, ${errors} errors`);

    // Salvar log
    await prisma.syncLog.create({
      data: {
        type: 'metrics',
        status: 'success',
        message: `Synced ${synced}/${users.length} users`,
        data: { synced, errors, total: users.length }
      }
    });

    return { synced, errors, total: users.length };

  } catch (error) {
    logger.error(`❌ Metrics sync job failed: ${error.message}`);

    await prisma.syncLog.create({
      data: {
        type: 'metrics',
        status: 'error',
        message: error.message
      }
    });

    throw error;
  }
}
