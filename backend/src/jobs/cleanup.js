import logger from '../config/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * CLEANUP JOB
 * ============================================================================
 * Remove logs antigos do banco
 * Cron: Semanalmente (domingo à meia-noite)
 */

export async function cleanupLogs() {
  try {
    logger.info('🧹 Starting cleanup job');

    // Remover sync logs com mais de 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await prisma.syncLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    logger.info(`✅ Cleanup completed: ${deleted.count} old logs removed`);

    return { deleted: deleted.count };

  } catch (error) {
    logger.error(`❌ Cleanup job failed: ${error.message}`);
    throw error;
  }
}
