const { default: axios } = require('axios');
const https = require('https');

// Config SSL
const axiosConfig = {
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 30000
};

async function testHistory() {
  const apiUrl = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';
  const accountNumber = '3237386';
  const password = '7oH(y`EGgenX';

  try {
    // 1. Login
    console.log('🔑 Fazendo login...');
    const loginRes = await axios.post(
      `${apiUrl}/login`,
      { BotId: parseInt(accountNumber), Password: password },
      { ...axiosConfig, headers: { 'Content-Type': 'application/json' } }
    );
    const token = loginRes.data.AccessToken;
    console.log('✅ Login OK\n');

    // 2. Buscar histórico SEM filtro de data
    console.log('📊 Buscando TODO o histórico (sem filtro de data)...');
    const historyRes = await axios.post(
      `${apiUrl}/tradehistory`,
      {
        RequestDirection: "BACKWARD",  // Do mais recente para o mais antigo
        // NÃO especificar RequestFrom/RequestTo
        PageSize: 500  // Buscar até 500 registros
      },
      {
        ...axiosConfig,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const history = historyRes.data.TradeHistory || [];
    console.log(`✅ Histórico retornado: ${history.length} registros\n`);

    if (history.length > 0) {
      console.log('📋 Primeiros 3 registros:');
      history.slice(0, 3).forEach((trade, i) => {
        console.log(`\n--- Trade ${i + 1} ---`);
        console.log('TransactionType:', trade.TransactionType);
        console.log('Symbol:', trade.Symbol);
        console.log('Profit:', trade.Profit);
        console.log('OpenPrice:', trade.OpenPrice);
        console.log('ClosePrice:', trade.ClosePrice);
        console.log('Amount:', trade.Amount);
        console.log('TransactionTimestamp:', new Date(trade.TransactionTimestamp / 1000000).toISOString());
      });

      // Calcular lucro total
      const closedTrades = history.filter(t =>
        t.TransactionType === 'ORDER_CLOSED' ||
        t.TransactionType === 'POSITION_CLOSED'
      );

      const totalProfit = closedTrades.reduce((sum, t) => sum + (t.Profit || 0), 0);

      console.log(`\n\n📊 RESUMO:`);
      console.log(`   Total de registros: ${history.length}`);
      console.log(`   Trades fechados: ${closedTrades.length}`);
      console.log(`   Lucro total: $${totalProfit.toFixed(2)}`);
    } else {
      console.log('❌ Nenhum registro retornado');
    }

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testHistory();
