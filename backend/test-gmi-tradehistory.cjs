/**
 * 🧪 TESTE - Endpoint /tradehistory da API GMI Edge
 */

const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const apiUrl = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';
const accountNumber = '3237386';
const password = '7oH(y`EGgenX';

async function testTradeHistory() {
  console.log('\n📜 ===== TESTE: TRADE HISTORY =====\n');

  try {
    // 1. LOGIN
    console.log('📍 LOGIN...');
    const loginResponse = await axios.post(
      `${apiUrl}/login`,
      { BotId: parseInt(accountNumber), Password: password },
      { httpsAgent, timeout: 30000 }
    );

    const { AccessToken } = loginResponse.data;
    console.log('   ✅ Login OK!');
    console.log('');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AccessToken}`
    };

    // 2. BUSCAR HISTÓRICO DOS ÚLTIMOS 30 DIAS
    console.log('📍 BUSCANDO HISTÓRICO DOS ÚLTIMOS 30 DIAS...');

    // Calcular timestamps (em nanosegundos)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Converter para nanosegundos (multiplicar por 1000000)
    const requestFrom = thirtyDaysAgo * 1000000;
    const requestTo = now * 1000000;

    const historyResponse = await axios.post(
      `${apiUrl}/tradehistory`,
      {
        RequestDirection: "FORWARD",
        RequestFrom: requestFrom,
        RequestTo: requestTo,
        OrderId: 0,
        LastRecordId: 0,
        PageSize: 100 // Buscar até 100 trades
      },
      { headers, httpsAgent, timeout: 30000 }
    );

    console.log('   ✅ Histórico recebido!');
    console.log('');

    const { TradeHistory, LastRecordId } = historyResponse.data;

    console.log(`📊 TOTAL DE REGISTROS: ${TradeHistory ? TradeHistory.length : 0}`);
    console.log(`📍 Last Record ID: ${LastRecordId}`);
    console.log('');

    if (TradeHistory && TradeHistory.length > 0) {
      console.log('📋 PRIMEIROS 5 REGISTROS:');
      TradeHistory.slice(0, 5).forEach((record, index) => {
        console.log(`\n   Registro ${index + 1}:`);
        console.log(JSON.stringify(record, null, 2));
      });
      console.log('');

      // Analisar estrutura dos dados
      console.log('🔍 CAMPOS DISPONÍVEIS NO PRIMEIRO REGISTRO:');
      if (TradeHistory[0]) {
        Object.keys(TradeHistory[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof TradeHistory[0][key]}`);
        });
      }
      console.log('');

      // Calcular estatísticas
      console.log('📈 ESTATÍSTICAS DO HISTÓRICO:');

      const closedTrades = TradeHistory.filter(t =>
        t.TransactionType === 'ORDER_CLOSED' ||
        t.TransactionType === 'POSITION_CLOSED'
      );

      console.log(`   Total de registros: ${TradeHistory.length}`);
      console.log(`   Trades fechados: ${closedTrades.length}`);

      if (closedTrades.length > 0) {
        let totalProfit = 0;
        let profitableTrades = 0;
        let losingTrades = 0;

        closedTrades.forEach(trade => {
          if (trade.NetProfit) {
            totalProfit += trade.NetProfit;
            if (trade.NetProfit > 0) {
              profitableTrades++;
            } else if (trade.NetProfit < 0) {
              losingTrades++;
            }
          }
        });

        const winRate = closedTrades.length > 0
          ? ((profitableTrades / closedTrades.length) * 100).toFixed(2)
          : 0;

        console.log(`   Lucrativos: ${profitableTrades}`);
        console.log(`   Perdedores: ${losingTrades}`);
        console.log(`   Win Rate: ${winRate}%`);
        console.log(`   Lucro Total: $${totalProfit.toFixed(2)}`);
      }

    } else {
      console.log('⚠️ Nenhum registro de histórico encontrado nos últimos 30 dias.');
    }

  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error('   Mensagem:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n');
}

testTradeHistory();
