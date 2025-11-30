/**
 * Teste do endpoint weekly-profit
 *
 * Debug do erro "Internal server error"
 */

import gmiEdgeService from './src/services/gmiEdgeService.js';

async function testWeeklyProfit() {
  const accountNumber = '3237386';

  console.log('🧪 Testando getWeeklyProfit()...');
  console.log(`   Account: ${accountNumber}`);

  try {
    // 1. Verificar token no cache
    const cached = gmiEdgeService.tokenCache.get(accountNumber);

    if (!cached) {
      console.log('❌ ERRO: Token não encontrado no cache!');
      console.log('   A conta precisa estar conectada primeiro.');
      console.log('');
      console.log('💡 Solução:');
      console.log('   1. Acesse http://localhost:5000/gmi-hedge');
      console.log('   2. Faça login com a conta 3237386');
      console.log('   3. Tente novamente');
      return;
    }

    console.log('✅ Token encontrado no cache');
    console.log(`   Server: ${cached.server}`);
    console.log(`   Age: ${Math.floor((Date.now() - cached.timestamp) / 1000)}s`);
    console.log('');

    // 2. Buscar historical de 7 dias
    console.log('📊 Buscando histórico dos últimos 7 dias...');
    const weeklyProfit = await gmiEdgeService.getWeeklyProfit(accountNumber);

    console.log('✅ Sucesso!');
    console.log('');
    console.log('📈 Resultados:');
    console.log(`   Lucro Semanal: $${weeklyProfit.weeklyNetProfit.toFixed(2)}`);
    console.log(`   Volume: $${weeklyProfit.weeklyVolume.toFixed(2)}`);
    console.log(`   Trades: ${weeklyProfit.totalTrades}`);
    console.log(`   Win Rate: ${weeklyProfit.winRate.toFixed(1)}%`);
    console.log(`   Profit Factor: ${weeklyProfit.profitFactor.toFixed(2)}x`);
    console.log('');
    console.log('📦 Objeto completo:');
    console.log(JSON.stringify(weeklyProfit, null, 2));

  } catch (error) {
    console.error('');
    console.error('❌ ERRO:');
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error('');

    if (error.message.includes('Token não encontrado')) {
      console.log('💡 Solução: Conecte a conta GMI primeiro.');
    }

    if (error.response?.status === 401) {
      console.log('💡 Token expirado. Faça login novamente.');
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      console.log('💡 API GMI Edge inacessível. Verifique conexão.');
    }
  }
}

// Executar teste
testWeeklyProfit();
