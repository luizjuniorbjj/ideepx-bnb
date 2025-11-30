/**
 * 🔍 TESTE - Ver TODOS os dados que a API GMI Edge retorna
 */

const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const apiUrl = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';
const accountNumber = '3237386';
const password = '7oH(y`EGgenX';

async function testFullData() {
  console.log('\n🔍 ===== DADOS COMPLETOS DA API GMI EDGE =====\n');

  try {
    // 1. LOGIN
    console.log('📍 PASSO 1: LOGIN');
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

    // 2. ACCOUNT INFO
    console.log('📍 PASSO 2: ACCOUNT INFO');
    const infoResponse = await axios.get(
      `${apiUrl}/accountinfo`,
      { headers, httpsAgent, timeout: 30000 }
    );

    console.log('   Account Info:');
    console.log(JSON.stringify(infoResponse.data, null, 2));
    console.log('');

    // 3. ACCOUNT STATE (com OrderStates)
    console.log('📍 PASSO 3: ACCOUNT STATE');
    const stateResponse = await axios.get(
      `${apiUrl}/accountstate`,
      { headers, httpsAgent, timeout: 30000 }
    );

    console.log('   Account State:');
    console.log(JSON.stringify(stateResponse.data, null, 2));
    console.log('');

    // 4. ANALISAR ORDER STATES
    const orderStates = stateResponse.data.OrderStates || [];
    console.log(`📊 TOTAL DE TRADES: ${orderStates.length}`);
    console.log('');

    if (orderStates.length > 0) {
      console.log('📋 PRIMEIROS 3 TRADES:');
      orderStates.slice(0, 3).forEach((order, index) => {
        console.log(`\n   Trade ${index + 1}:`);
        console.log('   ', JSON.stringify(order, null, 2));
      });
      console.log('');

      // Calcular estatísticas dos trades
      console.log('📈 ESTATÍSTICAS DOS TRADES:');

      let totalVolume = 0;
      let profitableTrades = 0;
      let losingTrades = 0;
      let totalProfit = 0;
      let totalLoss = 0;

      orderStates.forEach(order => {
        // Volume
        if (order.Volume) {
          totalVolume += order.Volume;
        }

        // Profit/Loss
        if (order.NetProfit) {
          if (order.NetProfit > 0) {
            profitableTrades++;
            totalProfit += order.NetProfit;
          } else if (order.NetProfit < 0) {
            losingTrades++;
            totalLoss += Math.abs(order.NetProfit);
          }
        }
      });

      const winRate = orderStates.length > 0
        ? ((profitableTrades / orderStates.length) * 100).toFixed(2)
        : 0;

      console.log(`   Total Trades: ${orderStates.length}`);
      console.log(`   Profitable: ${profitableTrades}`);
      console.log(`   Losing: ${losingTrades}`);
      console.log(`   Win Rate: ${winRate}%`);
      console.log(`   Total Volume: ${totalVolume.toFixed(2)}`);
      console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
      console.log(`   Total Loss: $${totalLoss.toFixed(2)}`);
      console.log(`   Net Profit: $${(totalProfit - totalLoss).toFixed(2)}`);
      console.log('');

      // Trades por mês
      console.log('📅 TRADES POR MÊS:');
      const tradesByMonth = {};

      orderStates.forEach(order => {
        if (order.CloseTime) {
          const closeDate = new Date(order.CloseTime);
          const monthKey = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, '0')}`;

          if (!tradesByMonth[monthKey]) {
            tradesByMonth[monthKey] = {
              count: 0,
              profit: 0,
              volume: 0
            };
          }

          tradesByMonth[monthKey].count++;
          tradesByMonth[monthKey].profit += order.NetProfit || 0;
          tradesByMonth[monthKey].volume += order.Volume || 0;
        }
      });

      Object.keys(tradesByMonth).sort().reverse().slice(0, 6).forEach(month => {
        const data = tradesByMonth[month];
        console.log(`   ${month}: ${data.count} trades, Profit: $${data.profit.toFixed(2)}, Volume: ${data.volume.toFixed(2)}`);
      });
    }

  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error('   Mensagem:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }

  console.log('\n');
}

testFullData();
