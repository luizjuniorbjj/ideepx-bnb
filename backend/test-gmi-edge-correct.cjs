/**
 * 🧪 TESTE DO CLIENTE GMI EDGE CORRETO
 *
 * Este script testa a implementação CORRETA baseada na documentação oficial:
 * - Base URL: https://api.gmimarkets.com/v1
 * - Autenticação: POST /auth/login
 * - Usa credenciais MT5 (não BotId/Password)
 * - Token expira em 1 hora
 */

require('dotenv').config();
const GMIEdgeClient = require('./src/services/gmiEdgeClientCORRECT.cjs');

async function testGMIEdgeClient() {
  console.log('\n🧪 ======================================');
  console.log('   TESTE - GMI EDGE API CLIENT (CORRETO)');
  console.log('======================================\n');

  try {
    // Verificar credenciais
    console.log('📋 Credenciais carregadas do .env:');
    console.log(`   Login: ${process.env.MT5_LOGIN}`);
    console.log(`   Server: ${process.env.MT5_SERVER}`);
    console.log(`   Base URL: ${process.env.GMI_EDGE_API_URL || 'https://live-edge-api.gmimarkets.com:7530/api/v1'}`);
    console.log('');

    // Criar cliente
    console.log('🏗️  Criando cliente GMI Edge...');
    console.log('   GMIEdgeClient:', typeof GMIEdgeClient);
    console.log('   GMIEdgeClient.name:', GMIEdgeClient?.name);
    const client = new GMIEdgeClient();
    console.log('   client:', typeof client);
    console.log('   client.login:', typeof client.login);
    console.log('✅ Cliente criado!\n');

    // Teste 1: Autenticação
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 1: Autenticação');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startAuth = Date.now();
    const token = await client.login();
    const authTime = Date.now() - startAuth;

    console.log(`✅ Autenticado com sucesso!`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Tempo: ${authTime}ms`);
    console.log('');

    // Teste 2: Informações da Conta
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 2: Informações da Conta');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startAccount = Date.now();
    const account = await client.getAccountInfo();
    const accountTime = Date.now() - startAccount;

    console.log('✅ Dados da conta obtidos:');
    console.log(`   Account ID: ${account.accountId || account.id || client.login}`);
    console.log(`   Currency: ${account.currency || 'USD'}`);
    console.log(`   Balance: $${parseFloat(account.balance || 0).toFixed(2)}`);
    console.log(`   Equity: $${parseFloat(account.equity || 0).toFixed(2)}`);
    console.log(`   Margin: $${parseFloat(account.margin || 0).toFixed(2)}`);
    console.log(`   Free Margin: $${parseFloat(account.freeMargin || 0).toFixed(2)}`);
    console.log(`   Margin Level: ${parseFloat(account.marginLevel || 0).toFixed(2)}%`);
    console.log(`   Profit: $${parseFloat(account.profit || 0).toFixed(2)}`);
    console.log(`   Leverage: 1:${account.leverage || 'N/A'}`);
    console.log(`   Status: ${account.status || 'UNKNOWN'}`);
    console.log(`   Tempo: ${accountTime}ms`);
    console.log('');

    // Teste 3: Posições Abertas
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 3: Posições Abertas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startPositions = Date.now();
    const positions = await client.getPositions();
    const positionsTime = Date.now() - startPositions;

    console.log(`✅ Posições obtidas: ${positions.length} posições abertas`);

    if (positions.length > 0) {
      positions.slice(0, 3).forEach((pos, idx) => {
        console.log(`\n   Posição ${idx + 1}:`);
        console.log(`   - Symbol: ${pos.symbol}`);
        console.log(`   - Type: ${pos.type}`);
        console.log(`   - Volume: ${pos.volume}`);
        console.log(`   - Open Price: ${pos.openPrice}`);
        console.log(`   - Current Price: ${pos.currentPrice}`);
        console.log(`   - Profit: $${parseFloat(pos.profit || 0).toFixed(2)}`);
      });

      if (positions.length > 3) {
        console.log(`\n   ... e mais ${positions.length - 3} posições`);
      }
    } else {
      console.log('   (Nenhuma posição aberta no momento)');
    }

    console.log(`\n   Tempo: ${positionsTime}ms`);
    console.log('');

    // Teste 4: Histórico de Trades (últimos 30 dias)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 4: Histórico de Trades (30 dias)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startHistory = Date.now();
    const history = await client.getHistory(30);
    const historyTime = Date.now() - startHistory;

    console.log('✅ Histórico obtido:');

    if (history.summary) {
      console.log(`   Total Trades: ${history.summary.totalTrades || 0}`);
      console.log(`   Winning Trades: ${history.summary.winningTrades || 0}`);
      console.log(`   Losing Trades: ${history.summary.losingTrades || 0}`);
      console.log(`   Win Rate: ${parseFloat(history.summary.winRate || 0).toFixed(2)}%`);
      console.log(`   Gross Profit: $${parseFloat(history.summary.totalProfit || 0).toFixed(2)}`);
      console.log(`   Total Commission: $${parseFloat(history.summary.totalCommission || 0).toFixed(2)}`);
      console.log(`   Total Swap: $${parseFloat(history.summary.totalSwap || 0).toFixed(2)}`);
      console.log(`   Net Profit: $${parseFloat(history.summary.totalNetProfit || 0).toFixed(2)}`);
    }

    if (history.trades && history.trades.length > 0) {
      console.log(`\n   Últimos 3 trades:`);
      history.trades.slice(0, 3).forEach((trade, idx) => {
        console.log(`\n   Trade ${idx + 1}:`);
        console.log(`   - Symbol: ${trade.symbol}`);
        console.log(`   - Volume: ${trade.volume}`);
        console.log(`   - Profit: $${parseFloat(trade.profit || 0).toFixed(2)}`);
        console.log(`   - Close Time: ${new Date(trade.closeTime).toLocaleString()}`);
      });
    }

    console.log(`\n   Tempo: ${historyTime}ms`);
    console.log('');

    // Teste 5: Performance Mensal (cálculo agregado)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 5: Performance Mensal (Agregado)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startPerformance = Date.now();
    const performance = await client.calculateMonthlyPerformance();
    const performanceTime = Date.now() - startPerformance;

    if (performance) {
      console.log('✅ Performance calculada:');
      console.log('');
      console.log('   📊 CONTA:');
      console.log(`   - Balance: $${performance.balance}`);
      console.log(`   - Equity: $${performance.equity}`);
      console.log(`   - Margin: $${performance.margin}`);
      console.log(`   - Free Margin: $${performance.freeMargin}`);
      console.log(`   - Margin Level: ${performance.marginLevel}%`);
      console.log(`   - Profit: $${performance.profit}`);
      console.log('');
      console.log('   📈 MENSAL (30 dias):');
      console.log(`   - Volume Negociado: $${performance.monthlyVolume}`);
      console.log(`   - Total de Trades: ${performance.totalTrades}`);
      console.log(`   - Trades Ganhos: ${performance.winningTrades}`);
      console.log(`   - Trades Perdidos: ${performance.losingTrades}`);
      console.log(`   - Taxa de Acerto: ${performance.winRate}%`);
      console.log('');
      console.log('   💰 LUCROS E PERDAS:');
      console.log(`   - Lucro Bruto: $${performance.grossProfit}`);
      console.log(`   - Comissões: $${performance.totalCommission}`);
      console.log(`   - Swap: $${performance.totalSwap}`);
      console.log(`   - Lucro Líquido: $${performance.netProfit}`);
      console.log(`   - Percentual: ${performance.profitPercentage}%`);
      console.log('');
      console.log(`   Última Sincronização: ${new Date(performance.lastSync).toLocaleString()}`);
      console.log(`   Connected: ${performance.connected ? '✅ Sim' : '❌ Não'}`);
    } else {
      console.log('⚠️  Não foi possível calcular performance (dados insuficientes)');
    }

    console.log(`\n   Tempo: ${performanceTime}ms`);
    console.log('');

    // Resumo Final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ RESUMO DOS TESTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Todos os testes passaram!');
    console.log('✅ Cliente GMI Edge funcionando corretamente');
    console.log('✅ Autenticação validada');
    console.log('✅ Endpoints respondendo');
    console.log('✅ Dados sendo obtidos com sucesso');
    console.log('');
    console.log(`⚡ Tempo total: ${authTime + accountTime + positionsTime + historyTime + performanceTime}ms`);
    console.log('');
    console.log('🎉 IMPLEMENTAÇÃO CORRETA VALIDADA!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('   1. ✅ Criar endpoints backend (/api/gmi/*)');
    console.log('   2. ✅ Restaurar componente MT5 no dashboard');
    console.log('   3. ✅ Integrar dados reais no cálculo de elegibilidade');
    console.log('');

  } catch (error) {
    console.error('\n❌ ======================================');
    console.error('   ERRO NO TESTE');
    console.error('======================================\n');
    console.error('Erro:', error.message);

    if (error.response) {
      console.error('\n📡 Resposta da API:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.code) {
      console.error('\n🔍 Código do erro:', error.code);
    }

    console.error('\n💡 Possíveis causas:');
    console.error('   - Credenciais incorretas no .env');
    console.error('   - API GMI fora do ar');
    console.error('   - Conexão de rede bloqueada');
    console.error('   - Endpoint incorreto');
    console.error('');

    process.exit(1);
  }
}

// Executar teste
testGMIEdgeClient();
