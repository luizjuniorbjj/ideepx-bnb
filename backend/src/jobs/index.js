/**
 * 🤖 JOBS SCHEDULER - iDeepX v3.1
 *
 * Centraliza todos os jobs agendados do sistema
 *
 * Jobs configurados:
 * - Daily (09:00): Notificações LAI
 * - Weekly (Dom 23:00): Atualização de níveis
 * - Weekly (Seg 00:30): Distribuição de performance
 * - Monthly (Dia 1 00:00): Reset de volumes
 */

import { logger } from '../utils/logger.js';

// Import dos jobs
import { scheduleDailyNotificationsJob, runDailyNotificationsJobNow } from './daily-notifications.job.js';
import { scheduleWeeklyLevelsJob, runWeeklyLevelsJobNow } from './weekly-levels.job.js';
import { scheduleWeeklyDistributionJob, runWeeklyDistributionJobNow } from './weekly-distribution.job.js';
import { scheduleMonthlyVolumeJob, runMonthlyVolumeJobNow } from './monthly-volume.job.js';

/**
 * Inicializa todos os jobs agendados
 */
export function initializeJobs() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🤖 Inicializando Jobs Agendados...');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        // 1. Job Diário - Notificações LAI (09:00)
        scheduleDailyNotificationsJob();

        // 2. Job Semanal - Níveis (Domingo 23:00)
        scheduleWeeklyLevelsJob();

        // 3. Job Semanal - Distribuição (Segunda 00:30)
        scheduleWeeklyDistributionJob();

        // 4. Job Mensal - Volumes (Dia 1 00:00)
        scheduleMonthlyVolumeJob();

        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('✅ TODOS OS JOBS FORAM AGENDADOS COM SUCESSO!');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('');
        logger.info('📅 CRONOGRAMA:');
        logger.info('   - DIÁRIO (09:00):        Notificações LAI');
        logger.info('   - DOMINGO (23:00):       Atualização de Níveis');
        logger.info('   - SEGUNDA (00:30):       Distribuição Performance');
        logger.info('   - MENSAL (Dia 1 00:00):  Reset de Volumes');
        logger.info('');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        logger.error('❌ Erro ao inicializar jobs:', error);
        throw error;
    }
}

/**
 * Executa job específico manualmente (para testes)
 */
export async function runJobManually(jobName) {
    logger.warn('⚠️⚠️⚠️ EXECUTANDO JOB MANUALMENTE ⚠️⚠️⚠️');
    logger.warn(`Job: ${jobName}`);

    switch (jobName) {
        case 'daily-notifications':
            await runDailyNotificationsJobNow();
            break;

        case 'weekly-levels':
            await runWeeklyLevelsJobNow();
            break;

        case 'weekly-distribution':
            logger.warn('⚠️ ATENÇÃO: Distribuição REAL será executada!');
            await runWeeklyDistributionJobNow();
            break;

        case 'monthly-volume':
            await runMonthlyVolumeJobNow();
            break;

        default:
            logger.error(`❌ Job desconhecido: ${jobName}`);
            logger.info('Jobs disponíveis:');
            logger.info('  - daily-notifications');
            logger.info('  - weekly-levels');
            logger.info('  - weekly-distribution');
            logger.info('  - monthly-volume');
            throw new Error(`Job desconhecido: ${jobName}`);
    }

    logger.info('✅ Job manual concluído!');
}

/**
 * Lista status de todos os jobs
 */
export function listJobs() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('📋 JOBS AGENDADOS - iDeepX v3.1');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('');
    logger.info('1️⃣ DAILY NOTIFICATIONS (Diário - 09:00)');
    logger.info('   Arquivo: daily-notifications.job.js');
    logger.info('   Função: Notificar LAIs expirando (7d, 3d, 1d, hoje)');
    logger.info('   Cron: 0 9 * * *');
    logger.info('');
    logger.info('2️⃣ WEEKLY LEVELS (Domingo - 23:00)');
    logger.info('   Arquivo: weekly-levels.job.js');
    logger.info('   Função: Atualizar níveis de usuários (L1-10)');
    logger.info('   Cron: 0 23 * * 0');
    logger.info('');
    logger.info('3️⃣ WEEKLY DISTRIBUTION (Segunda - 00:30)');
    logger.info('   Arquivo: weekly-distribution.job.js');
    logger.info('   Função: Distribuir performance semanal via smart contract');
    logger.info('   Cron: 30 0 * * 1');
    logger.info('');
    logger.info('4️⃣ MONTHLY VOLUME (Dia 1 - 00:00)');
    logger.info('   Arquivo: monthly-volume.job.js');
    logger.info('   Função: Resetar e atualizar volumes mensais');
    logger.info('   Cron: 0 0 1 * *');
    logger.info('');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export default {
    initializeJobs,
    runJobManually,
    listJobs
};
