// ================================================================================
// TESTE MANUAL - WEEKLY PROOF WORKFLOW
// ================================================================================

import weeklyProofJobs from './src/jobs/weeklyProof.js';
import logger from './src/config/logger.js';

const { runWeeklyProofJobNow, getCurrentWeekNumber } = weeklyProofJobs;

async function testWeeklyProof() {
  try {
    logger.info('\n' + '='.repeat(80));
    logger.info('🧪 TESTE MANUAL - WEEKLY PROOF WORKFLOW');
    logger.info('='.repeat(80));

    const weekNumber = getCurrentWeekNumber();
    logger.info(`\n📅 Semana atual: ${weekNumber}`);
    logger.info(`🕐 Horário: ${new Date().toISOString()}\n`);

    const dryRun = process.env.WEEKLY_PROOF_DRY_RUN === 'true';

    if (dryRun) {
      logger.warn('⚠️ DRY RUN MODE - Nenhuma transação será enviada\n');
    } else {
      logger.warn('⚠️ MODO PRODUÇÃO - Transações REAIS serão enviadas!\n');
      logger.warn('   Se não deseja gastar gas, cancele agora (Ctrl+C)');
      logger.warn('   e configure WEEKLY_PROOF_DRY_RUN=true no .env\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    logger.info('🚀 Iniciando teste do workflow completo...\n');

    // Executar job
    const result = await runWeeklyProofJobNow(weekNumber);

    // Mostrar resultado
    logger.info('\n' + '='.repeat(80));
    logger.info('✅ TESTE CONCLUÍDO COM SUCESSO!');
    logger.info('='.repeat(80));
    logger.info(`\n📊 Resultado:`);
    logger.info(`   Semana: ${result.weekNumber}`);
    logger.info(`   IPFS Hash: ${result.ipfsHash}`);
    logger.info(`   IPFS URL: ${result.ipfsUrl}`);
    logger.info(`   TX Hash: ${result.txHash}`);
    logger.info(`\n💰 Summary:`);
    logger.info(`   Total Users: ${result.summary.totalUsers}`);
    logger.info(`   Total Profits: $${result.summary.totalProfits.toFixed(2)}`);
    logger.info(`   Total Commissions: $${result.summary.totalCommissions.toFixed(2)}`);
    logger.info(`   Total Paid: $${result.summary.totalPaid.toFixed(2)}`);

    logger.info('\n🔗 Links de verificação:');
    logger.info(`   IPFS: ${result.ipfsUrl}`);
    logger.info(`   BSCScan: https://testnet.bscscan.com/tx/${result.txHash}`);

    logger.info('\n' + '='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    logger.error('\n' + '='.repeat(80));
    logger.error('❌ ERRO NO TESTE');
    logger.error('='.repeat(80));
    logger.error(`\n${error.message}`);
    logger.error(`\nStack trace:`);
    logger.error(error.stack);
    logger.error('\n' + '='.repeat(80) + '\n');
    process.exit(1);
  }
}

testWeeklyProof();
