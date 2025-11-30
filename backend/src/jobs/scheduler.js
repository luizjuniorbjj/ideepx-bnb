import cron from 'node-cron';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { syncMetrics } from './syncMetrics.js';
import { processPerformance } from './processPerformance.js';
import { cleanupLogs } from './cleanup.js';
import mlmUnlock from '../mlm/unlock.js';

/**
 * ============================================================================
 * JOB SCHEDULER
 * ============================================================================
 * Gerencia todos os cron jobs do backend
 */

class JobScheduler {
  constructor() {
    this.jobs = [];
    this.running = false;
  }

  /**
   * Inicia todos os jobs
   */
  start() {
    if (this.running) {
      logger.warn('Job scheduler already running');
      return;
    }

    logger.info('📅 Starting job scheduler...');

    // Job 1: Sync Métricas (a cada 6 horas)
    const syncMetricsJob = cron.schedule(config.syncMetricsCron, async () => {
      logger.info('⏰ Triggered: Sync Metrics');
      try {
        await syncMetrics();
      } catch (error) {
        logger.error(`Sync metrics job error: ${error.message}`);
      }
    });

    // Job 2: Processar Performance (diariamente às 2h)
    const processPerformanceJob = cron.schedule(config.processPerformanceCron, async () => {
      logger.info('⏰ Triggered: Process Performance');
      try {
        await processPerformance();
      } catch (error) {
        logger.error(`Process performance job error: ${error.message}`);
      }
    });

    // Job 3: Sync Eligibility (diariamente às 3h)
    const syncEligibilityJob = cron.schedule('0 3 * * *', async () => {
      logger.info('⏰ Triggered: Sync Eligibility');
      try {
        await mlmUnlock.batchUpdateAllUsers();
      } catch (error) {
        logger.error(`Sync eligibility job error: ${error.message}`);
      }
    });

    // Job 4: Cleanup Logs (semanalmente - domingo à meia-noite)
    const cleanupJob = cron.schedule(config.cleanupLogsCron, async () => {
      logger.info('⏰ Triggered: Cleanup Logs');
      try {
        await cleanupLogs();
      } catch (error) {
        logger.error(`Cleanup job error: ${error.message}`);
      }
    });

    this.jobs = [
      { name: 'syncMetrics', cron: config.syncMetricsCron, job: syncMetricsJob },
      { name: 'processPerformance', cron: config.processPerformanceCron, job: processPerformanceJob },
      { name: 'syncEligibility', cron: '0 3 * * *', job: syncEligibilityJob },
      { name: 'cleanup', cron: config.cleanupLogsCron, job: cleanupJob }
    ];

    this.running = true;

    logger.info(`✅ Job scheduler started with ${this.jobs.length} jobs:`);
    this.jobs.forEach(j => {
      logger.info(`   - ${j.name}: ${j.cron}`);
    });
  }

  /**
   * Para todos os jobs
   */
  stop() {
    if (!this.running) {
      logger.warn('Job scheduler not running');
      return;
    }

    logger.info('⏸️  Stopping job scheduler...');

    this.jobs.forEach(j => {
      j.job.stop();
    });

    this.jobs = [];
    this.running = false;

    logger.info('✅ Job scheduler stopped');
  }

  /**
   * Executa um job manualmente
   */
  async runNow(jobName) {
    logger.info(`🚀 Running job manually: ${jobName}`);

    try {
      let result;

      switch (jobName) {
        case 'syncMetrics':
          result = await syncMetrics();
          break;
        case 'processPerformance':
          result = await processPerformance();
          break;
        case 'syncEligibility':
          result = await mlmUnlock.batchUpdateAllUsers();
          break;
        case 'cleanup':
          result = await cleanupLogs();
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }

      logger.info(`✅ Job ${jobName} completed manually`);
      return result;

    } catch (error) {
      logger.error(`❌ Job ${jobName} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retorna status dos jobs
   */
  getStatus() {
    return {
      running: this.running,
      jobs: this.jobs.map(j => ({
        name: j.name,
        cron: j.cron,
        running: j.job.running
      }))
    };
  }
}

export default new JobScheduler();
