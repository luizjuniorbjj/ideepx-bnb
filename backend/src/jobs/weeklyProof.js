// ================================================================================
// CRON JOB - WEEKLY PROOF
// ================================================================================
// Automação semanal de geração e submissão de proofs

import cron from 'node-cron';
import { generateWeeklySnapshot } from '../services/snapshotGenerator.js';
import { submitWeeklyProof, finalizeWeeklyProof, getProofInfo } from '../blockchain/proof.js';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

// ================================================================================
// CONFIGURAÇÃO
// ================================================================================

const ENABLED = process.env.WEEKLY_PROOF_JOB_ENABLED !== 'false'; // Habilitado por padrão
const DRY_RUN = process.env.WEEKLY_PROOF_DRY_RUN === 'true'; // Dry run mode

// Timezone: UTC (ajustar se necessário)
const TIMEZONE = 'UTC';

// ================================================================================
// FUNÇÕES AUXILIARES
// ================================================================================

/**
 * Obter número da semana atual
 */
function getCurrentWeekNumber() {
  // Semana 1 = 11/11/2024
  const baseDate = new Date('2024-11-11T00:00:00Z');
  const now = new Date();
  const diffTime = now.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  return weekNumber;
}

/**
 * Buscar lucros da semana (GMI Edge ou mock)
 */
async function fetchWeeklyProfits(weekNumber) {
  try {
    logger.info(`📈 Buscando lucros da semana ${weekNumber}...`);

    // TODO: Integrar com GMI Edge API real
    // Por enquanto, retorna valores mockados

    const now = Math.floor(Date.now() / 1000);
    const users = await prisma.user.findMany({
      where: {
        active: true,
        subscriptionExpiry: { gt: now }
      },
      select: { id: true, walletAddress: true }
    });

    const profits = {};
    for (const user of users) {
      // Mock: $1000 por usuário
      profits[user.id] = 1000.00;
    }

    logger.info(`   Encontrados ${Object.keys(profits).length} usuários com lucros`);

    return profits;
  } catch (error) {
    logger.error('❌ Erro ao buscar lucros:', error);
    throw error;
  }
}

/**
 * Salvar registro do processo no banco
 */
async function saveProofRecord(weekNumber, data) {
  try {
    // TODO: Criar tabela WeeklyProof no schema Prisma
    // await prisma.weeklyProof.create({
    //   data: {
    //     weekNumber,
    //     ipfsHash: data.ipfsHash,
    //     txHash: data.txHash,
    //     totalUsers: data.totalUsers,
    //     totalCommissions: data.totalCommissions,
    //     totalProfits: data.totalProfits,
    //     status: 'submitted',
    //     submittedAt: new Date()
    //   }
    // });

    logger.info(`💾 Registro salvo para semana ${weekNumber}`);
  } catch (error) {
    logger.error('❌ Erro ao salvar registro:', error);
  }
}

// ================================================================================
// JOBS
// ================================================================================

/**
 * JOB 1: DOMINGO 23:00 - GERAR E SUBMETER PROOF
 * Cron: '0 23 * * 0' (todo domingo às 23:00)
 */
export function scheduleWeeklyGeneration() {
  if (!ENABLED) {
    logger.warn('⚠️ Weekly Proof Job DESABILITADO');
    return;
  }

  const schedule = '0 23 * * 0'; // Domingo 23:00

  cron.schedule(schedule, async () => {
    logger.info('\n' + '='.repeat(80));
    logger.info('🕐 CRON JOB: WEEKLY PROOF GENERATION & SUBMISSION');
    logger.info('='.repeat(80));

    try {
      const weekNumber = getCurrentWeekNumber();
      logger.info(`📅 Semana: ${weekNumber}`);
      logger.info(`🕐 Horário: ${new Date().toISOString()}`);

      if (DRY_RUN) {
        logger.warn('⚠️ DRY RUN MODE - Nenhuma transação será enviada');
      }

      // 1. Verificar se já foi submetida
      const proofInfo = await getProofInfo();
      if (proofInfo.totalProofs >= weekNumber) {
        logger.warn(`⚠️ Prova da semana ${weekNumber} já foi submetida!`);
        logger.warn('   Abortando job...');
        return;
      }

      // 2. Buscar lucros da semana
      logger.info('\n📊 PASSO 1: Buscar lucros da semana');
      const profits = await fetchWeeklyProfits(weekNumber);
      logger.info(`   ✅ ${Object.keys(profits).length} usuários encontrados`);

      // 3. Gerar snapshot e upload IPFS
      logger.info('\n📝 PASSO 2: Gerar snapshot e upload IPFS');
      const { snapshot, ipfsHash, ipfsUrl, summary } = await generateWeeklySnapshot({
        weekNumber,
        profits,
        uploadToIPFS: !DRY_RUN
      });

      logger.info(`   ✅ Snapshot gerado`);
      logger.info(`   📊 Total Users: ${summary.totalUsers}`);
      logger.info(`   💰 Total Profits: $${summary.totalProfits.toFixed(2)}`);
      logger.info(`   💵 Total Commissions: $${summary.totalCommissions.toFixed(2)}`);

      if (!DRY_RUN) {
        logger.info(`   📤 IPFS Hash: ${ipfsHash}`);
        logger.info(`   🔗 URL: ${ipfsUrl}`);
      }

      // 4. Submeter proof on-chain
      if (!DRY_RUN) {
        logger.info('\n⛓️ PASSO 3: Submeter proof on-chain');

        const proofData = {
          weekNumber,
          ipfsHash,
          totalUsers: summary.totalUsers,
          totalCommissions: summary.totalCommissions.toString(),
          totalProfits: summary.totalProfits.toString()
        };

        const result = await submitWeeklyProof(proofData);

        logger.info(`   ✅ Proof submetido!`);
        logger.info(`   📤 TX Hash: ${result.txHash}`);
        logger.info(`   ⛓️ Block: ${result.blockNumber}`);
        logger.info(`   ⛽ Gas usado: ${result.gasUsed}`);

        // 5. Salvar registro
        await saveProofRecord(weekNumber, {
          ipfsHash,
          txHash: result.txHash,
          totalUsers: summary.totalUsers,
          totalCommissions: summary.totalCommissions,
          totalProfits: summary.totalProfits
        });
      }

      logger.info('\n✅ JOB CONCLUÍDO COM SUCESSO!');
      logger.info('='.repeat(80) + '\n');
    } catch (error) {
      logger.error('\n❌ ERRO NO JOB:', error);
      logger.error('='.repeat(80) + '\n');

      // TODO: Notificar admin via email/telegram/discord
    }
  }, {
    timezone: TIMEZONE
  });

  logger.info(`📅 Cron job agendado: ${schedule} (${TIMEZONE})`);
  logger.info(`   Descrição: Gerar e submeter proof (Domingo 23:00)`);
  logger.info(`   Status: ${ENABLED ? '✅ ATIVO' : '❌ DESABILITADO'}`);
  logger.info(`   Dry Run: ${DRY_RUN ? '✅ SIM (sem transações)' : '❌ NÃO (produção)'}`);
}

/**
 * JOB 2: SEGUNDA 01:00 - FINALIZAR PROOF
 * Cron: '0 1 * * 1' (toda segunda às 01:00)
 */
export function scheduleWeeklyFinalization() {
  if (!ENABLED) {
    logger.warn('⚠️ Weekly Finalization Job DESABILITADO');
    return;
  }

  const schedule = '0 1 * * 1'; // Segunda 01:00

  cron.schedule(schedule, async () => {
    logger.info('\n' + '='.repeat(80));
    logger.info('🔒 CRON JOB: WEEKLY PROOF FINALIZATION');
    logger.info('='.repeat(80));

    try {
      const weekNumber = getCurrentWeekNumber();
      logger.info(`📅 Finalizando semana: ${weekNumber}`);
      logger.info(`🕐 Horário: ${new Date().toISOString()}`);

      if (DRY_RUN) {
        logger.warn('⚠️ DRY RUN MODE - Nenhuma transação será enviada');
        logger.info('='.repeat(80) + '\n');
        return;
      }

      // Finalizar proof
      logger.info('\n🔒 Finalizando proof on-chain...');

      const result = await finalizeWeeklyProof(weekNumber);

      logger.info(`   ✅ Proof finalizado!`);
      logger.info(`   📤 TX Hash: ${result.txHash}`);
      logger.info(`   ⛓️ Block: ${result.blockNumber}`);

      // Atualizar registro
      // TODO: Atualizar tabela WeeklyProof
      // await prisma.weeklyProof.update({
      //   where: { weekNumber },
      //   data: {
      //     status: 'finalized',
      //     finalizedAt: new Date(),
      //     finalizeTxHash: result.txHash
      //   }
      // });

      logger.info('\n✅ FINALIZAÇÃO CONCLUÍDA!');
      logger.info('='.repeat(80) + '\n');
    } catch (error) {
      logger.error('\n❌ ERRO NA FINALIZAÇÃO:', error);
      logger.error('='.repeat(80) + '\n');

      // TODO: Notificar admin
    }
  }, {
    timezone: TIMEZONE
  });

  logger.info(`📅 Cron job agendado: ${schedule} (${TIMEZONE})`);
  logger.info(`   Descrição: Finalizar proof (Segunda 01:00)`);
  logger.info(`   Status: ${ENABLED ? '✅ ATIVO' : '❌ DESABILITADO'}`);
}

// ================================================================================
// TESTES MANUAIS
// ================================================================================

/**
 * Executar job manualmente (para testes)
 */
export async function runWeeklyProofJobNow(weekNumber = null) {
  logger.info('🧪 EXECUTANDO JOB MANUALMENTE...\n');

  const week = weekNumber || getCurrentWeekNumber();

  try {
    // 1. Buscar lucros
    const profits = await fetchWeeklyProfits(week);

    // 2. Gerar snapshot
    const { snapshot, ipfsHash, ipfsUrl, summary } = await generateWeeklySnapshot({
      weekNumber: week,
      profits,
      uploadToIPFS: true
    });

    logger.info('\n✅ Snapshot gerado e uploaded!');
    logger.info(`   IPFS: ${ipfsHash}`);
    logger.info(`   URL: ${ipfsUrl}`);

    // 3. Submeter proof
    const result = await submitWeeklyProof({
      weekNumber: week,
      ipfsHash,
      totalUsers: summary.totalUsers,
      totalCommissions: summary.totalCommissions.toString(),
      totalProfits: summary.totalProfits.toString()
    });

    logger.info('\n✅ Proof submetido!');
    logger.info(`   TX: ${result.txHash}`);

    return {
      weekNumber: week,
      ipfsHash,
      ipfsUrl,
      txHash: result.txHash,
      summary
    };
  } catch (error) {
    logger.error('❌ Erro no job manual:', error);
    throw error;
  }
}

/**
 * Finalizar proof manualmente
 */
export async function finalizeProofNow(weekNumber = null) {
  const week = weekNumber || getCurrentWeekNumber();

  logger.info(`🔒 Finalizando proof da semana ${week}...\n`);

  try {
    const result = await finalizeWeeklyProof(week);

    logger.info('✅ Proof finalizado!');
    logger.info(`   TX: ${result.txHash}`);

    return result;
  } catch (error) {
    logger.error('❌ Erro ao finalizar:', error);
    throw error;
  }
}

// ================================================================================
// INICIALIZAÇÃO
// ================================================================================

/**
 * Iniciar todos os cron jobs
 */
export function startWeeklyProofJobs() {
  logger.info('\n📅 Iniciando Weekly Proof Cron Jobs...\n');

  scheduleWeeklyGeneration();
  scheduleWeeklyFinalization();

  logger.info('\n✅ Cron jobs inicializados!\n');
}

// ================================================================================
// EXPORTAR
// ================================================================================

export default {
  startWeeklyProofJobs,
  scheduleWeeklyGeneration,
  scheduleWeeklyFinalization,
  runWeeklyProofJobNow,
  finalizeProofNow,
  getCurrentWeekNumber
};
