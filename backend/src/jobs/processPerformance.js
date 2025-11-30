import logger from '../config/logger.js';
import contractV10 from '../contracts/v10.js';
import mlmCalculator from '../mlm/calculator.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * PROCESS PERFORMANCE JOB
 * ============================================================================
 * Processa performance records pendentes e credita on-chain
 * Cron: Diariamente às 2h da manhã
 */

export async function processPerformance() {
  try {
    logger.info('🔄 Starting performance processing job');

    // Buscar performance records não processados
    const pending = await prisma.performanceRecord.findMany({
      where: { processed: false },
      include: { user: true },
      take: 100 // Processar max 100 por vez
    });

    if (pending.length === 0) {
      logger.info('No pending performance records');
      return { processed: 0 };
    }

    logger.info(`Found ${pending.length} pending performance records`);

    // Agrupar comissões por carteira
    const commissionsMap = new Map();

    for (const perf of pending) {
      // Calcular MLM para esta performance
      const mlmResult = await mlmCalculator.calculateCommissions(
        perf.user.id,
        parseFloat(perf.profitUsd)
      );

      // Adicionar cliente (65% do lucro)
      if (!commissionsMap.has(perf.user.walletAddress)) {
        commissionsMap.set(perf.user.walletAddress, 0);
      }
      commissionsMap.set(
        perf.user.walletAddress,
        commissionsMap.get(perf.user.walletAddress) + parseFloat(perf.clientShare)
      );

      // Adicionar comissões MLM
      for (const comm of mlmResult.commissions) {
        if (!commissionsMap.has(comm.walletAddress)) {
          commissionsMap.set(comm.walletAddress, 0);
        }
        commissionsMap.set(
          comm.walletAddress,
          commissionsMap.get(comm.walletAddress) + comm.amount
        );

        // Salvar comissão MLM no banco
        await prisma.mlmCommission.create({
          data: {
            fromUserId: comm.userId,
            performanceId: perf.id,
            level: comm.level,
            percentage: comm.percentage,
            amount: comm.amount,
            credited: false
          }
        });
      }
    }

    // Converter Map para arrays
    const users = Array.from(commissionsMap.keys());
    const amounts = Array.from(commissionsMap.values());

    logger.info(`Crediting ${users.length} users with total $${amounts.reduce((a, b) => a + b, 0).toFixed(2)}`);

    // Creditar on-chain em lote
    const receipt = await contractV10.creditPerformance(users, amounts);

    logger.info(`✅ Performance credited on-chain. TX: ${receipt.hash}`);

    // Marcar performance records como processados
    const perfIds = pending.map(p => p.id);
    await prisma.performanceRecord.updateMany({
      where: { id: { in: perfIds } },
      data: {
        processed: true,
        processedAt: new Date(),
        txHash: receipt.hash
      }
    });

    // Marcar comissões como pagas
    await prisma.mlmCommission.updateMany({
      where: { performanceId: { in: perfIds } },
      data: {
        paid: true,
        paidAt: new Date(),
        txHash: receipt.hash
      }
    });

    logger.info(`✅ Performance processing completed: ${pending.length} records processed`);

    // Salvar log
    await prisma.syncLog.create({
      data: {
        type: 'credit',
        status: 'success',
        message: `Processed ${pending.length} performance records`,
        data: {
          processed: pending.length,
          recipients: users.length,
          txHash: receipt.hash
        }
      }
    });

    return {
      processed: pending.length,
      recipients: users.length,
      txHash: receipt.hash
    };

  } catch (error) {
    logger.error(`❌ Performance processing job failed: ${error.message}`);

    await prisma.syncLog.create({
      data: {
        type: 'credit',
        status: 'error',
        message: error.message
      }
    });

    throw error;
  }
}
