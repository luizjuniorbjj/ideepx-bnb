// ================================================================================
// TESTE - FINALIZE WEEKLY PROOF
// ================================================================================
// Testa a finalização do proof da semana 52 (já submetido)

import weeklyProofJobs from './src/jobs/weeklyProof.js';
import logger from './src/config/logger.js';

const { finalizeProofNow } = weeklyProofJobs;

async function testFinalizeProof() {
  try {
    logger.info('\n' + '='.repeat(80));
    logger.info('🔒 TESTE - FINALIZAÇÃO DE PROOF');
    logger.info('='.repeat(80));

    const weekNumber = 52; // Semana que acabamos de submeter
    logger.info(`\n📅 Finalizando proof da semana: ${weekNumber}`);
    logger.info(`🕐 Horário: ${new Date().toISOString()}\n`);

    logger.info('⚠️ Isso tornará o proof imutável (não poderá ser alterado)\n');

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    logger.info('🚀 Iniciando finalização...\n');

    // Finalizar proof
    const result = await finalizeProofNow(weekNumber);

    // Mostrar resultado
    logger.info('\n' + '='.repeat(80));
    logger.info('✅ FINALIZAÇÃO CONCLUÍDA COM SUCESSO!');
    logger.info('='.repeat(80));
    logger.info(`\n📊 Resultado:`);
    logger.info(`   Semana: ${weekNumber}`);
    logger.info(`   TX Hash: ${result.txHash}`);
    logger.info(`   Block: ${result.blockNumber}`);
    logger.info(`   Gas usado: ${result.gasUsed}`);

    logger.info('\n🔗 Link de verificação:');
    logger.info(`   BSCScan: https://testnet.bscscan.com/tx/${result.txHash}`);

    logger.info('\n✅ Proof da semana 52 agora está FINALIZADO e IMUTÁVEL!');
    logger.info('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    logger.error('\n' + '='.repeat(80));
    logger.error('❌ ERRO NA FINALIZAÇÃO');
    logger.error('='.repeat(80));
    logger.error(`\n${error.message}`);
    logger.error(`\nStack trace:`);
    logger.error(error.stack);
    logger.error('\n' + '='.repeat(80) + '\n');
    process.exit(1);
  }
}

testFinalizeProof();
