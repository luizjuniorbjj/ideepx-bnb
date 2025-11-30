/**
 * Script de teste para GMI Edge API
 *
 * Uso:
 * 1. Configure as variáveis no .env:
 *    GMI_EDGE_API_URL=https://api.gmimarkets.com
 *    GMI_EDGE_BOT_ID=seu_bot_id
 *    GMI_EDGE_PASSWORD=sua_senha
 *
 * 2. Execute: node backend/test-gmi-edge-api.js
 */

require('dotenv').config();
const GMIEdgeClient = require('./src/services/gmiEdgeClient');

async function testGMIEdgeAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTE GMI EDGE API');
  console.log('='.repeat(60) + '\n');

  // Verificar credenciais
  const apiUrl = process.env.GMI_EDGE_API_URL;
  const botId = process.env.GMI_EDGE_BOT_ID;
  const password = process.env.GMI_EDGE_PASSWORD;

  if (!apiUrl || !botId || !password) {
    console.error('❌ ERRO: Credenciais não configuradas!');
    console.log('\nConfigure no arquivo .env:');
    console.log('  GMI_EDGE_API_URL=https://api.gmimarkets.com');
    console.log('  GMI_EDGE_BOT_ID=seu_bot_id');
    console.log('  GMI_EDGE_PASSWORD=sua_senha');
    console.log('\nPara obter as credenciais:');
    console.log('  1. Acesse: https://app.gmimarkets.com/account/signin');
    console.log('  2. Crie uma conta GMI Edge Trading');
    console.log('  3. Obtenha BotId e Password\n');
    process.exit(1);
  }

  console.log('📋 Configuração:');
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   Bot ID: ${botId}`);
  console.log(`   Password: ${'*'.repeat(password.length)}\n`);

  // Criar cliente
  const client = new GMIEdgeClient(apiUrl, botId, password);

  try {
    // 1. Teste de Login
    console.log('1️⃣  Testando autenticação...');
    await client.login();
    console.log('   ✅ Login bem-sucedido!\n');

    // 2. Teste de Account State
    console.log('2️⃣  Buscando dados da conta...');
    const accountData = await client.getCompleteAccountData();
    console.log('   ✅ Dados recebidos:');
    console.log(`      Saldo: $${accountData.balance}`);
    console.log(`      Equity: $${accountData.equity}`);
    console.log(`      Lucro Aberto: $${accountData.profit}`);
    console.log(`      Volume Mensal: $${accountData.monthlyVolume}`);
    console.log(`      Lucro Mensal: $${accountData.monthlyProfit}`);
    console.log(`      Prejuízo Mensal: $${accountData.monthlyLoss}`);
    console.log(`      Trades Mensais: ${accountData.totalTrades}`);
    console.log(`      Net Profit: $${accountData.netProfit}\n`);

    // 3. Teste de Posições
    console.log('3️⃣  Buscando posições abertas...');
    const positions = await client.getPositions();
    console.log(`   ✅ ${positions.length} posição(ões) aberta(s):`);

    if (positions.length > 0) {
      positions.slice(0, 5).forEach((pos, index) => {
        console.log(`      ${index + 1}. ${pos.Symbol} ${pos.OrderSide} ${pos.Amount} @ ${pos.OpenPrice}`);
        console.log(`         Status: ${pos.OrderStatus} | Profit: $${pos.Profit}`);
      });
      if (positions.length > 5) {
        console.log(`      ... e mais ${positions.length - 5} posição(ões)`);
      }
    } else {
      console.log('      (Nenhuma posição aberta)');
    }
    console.log('');

    // 4. Teste de Symbol Info
    console.log('4️⃣  Buscando informações do símbolo EURUSD...');
    const symbolInfo = await client.getSymbolInfo('EURUSD');
    console.log('   ✅ Informações recebidas:');
    console.log(`      Símbolo: ${symbolInfo.Symbol}`);
    console.log(`      Descrição: ${symbolInfo.Description}`);
    console.log(`      Volume Mínimo: ${symbolInfo.MinTradeAmount}`);
    console.log(`      Tamanho do Contrato: ${symbolInfo.ContractSize}`);
    console.log(`      Spread: ${symbolInfo.Spread}`);
    console.log(`      Bid: ${symbolInfo.Bid}`);
    console.log(`      Ask: ${symbolInfo.Ask}\n`);

    // Resultado final
    console.log('='.repeat(60));
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(60));
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Integrar GMIEdgeClient no backend (server.js)');
    console.log('   2. Criar endpoints /api/gmi-edge/*');
    console.log('   3. Atualizar frontend para exibir dados');
    console.log('   4. Decidir: Usar MT5 direto OU GMI Edge API\n');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('💡 Dica: Credenciais inválidas. Verifique:');
      console.log('   - BotId está correto?');
      console.log('   - Password está correta?');
      console.log('   - Conta GMI Edge está ativa?\n');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log('💡 Dica: Erro de conexão. Verifique:');
      console.log('   - URL da API está correta?');
      console.log('   - Você tem conexão com a internet?');
      console.log('   - O servidor GMI está online?\n');
    }

    process.exit(1);
  }
}

// Executar teste
testGMIEdgeAPI();
