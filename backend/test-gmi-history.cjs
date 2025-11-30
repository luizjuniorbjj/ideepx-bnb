const { default: axios } = require('axios');
const https = require('https');

// Configuração para ignorar SSL (mesmo do gmiEdgeService.js)
const axiosConfig = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 30000
};

async function testGMIHistory() {
  console.log('🔍 Testando API GMI Edge - Trade History\n');

  const accountNumber = '3237386';
  const server = 'GMI Trading Platform Demo';

  // Dados de login (mesmos que estão no banco)
  const password = '7oH(y`EGgenX'; // encrypted payload do banco

  // API URL baseada no servidor (correto!)
  const apiUrls = {
    'GMI Trading Platform Demo': 'https://demo-edge-api.gmimarkets.com:7530/api/v1',
    'GMIEdge-Live': 'https://live-edge-api.gmimarkets.com:7530/api/v1'
  };

  const apiUrl = apiUrls[server];

  console.log('📋 Configuração:');
  console.log(`   Account: ${accountNumber}`);
  console.log(`   Server: ${server}`);
  console.log(`   API URL: ${apiUrl}\n`);

  try {
    // 1. Fazer login
    console.log('🔑 Fazendo login...');
    const loginResponse = await axios.post(
      `${apiUrl}/login`,
      {
        BotId: parseInt(accountNumber),  // ← INTEGER
        Password: password
        // NÃO precisa de Server
      },
      {
        ...axiosConfig,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const accessToken = loginResponse.data.AccessToken;
    console.log('✅ Login bem-sucedido');
    console.log(`   Token: ${accessToken.substring(0, 20)}...\n`);

    // 2. Buscar histórico de trades
    console.log('📊 Buscando histórico de trades...');

    // TESTE 1: Período de 7 dias
    console.log('\n🔍 TESTE 1: Últimos 7 dias');
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const requestFrom = sevenDaysAgo * 1000000; // Nanosegundos
    const requestTo = now * 1000000;

    console.log(`   Período: ${new Date(sevenDaysAgo).toISOString()} → ${new Date(now).toISOString()}`);

    let historyResponse = await axios.post(
      `${apiUrl}/tradehistory`,
      {
        RequestDirection: "FORWARD",
        RequestFrom: requestFrom,
        RequestTo: requestTo,
        OrderId: 0,
        LastRecordId: 0,
        PageSize: 1000
      },
      {
        ...axiosConfig,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log('   Status:', historyResponse.status);
    console.log('   Resultado:', historyResponse.data.TradeHistory?.length || 0, 'registros\n');

    // TESTE 2: Período maior (30 dias)
    console.log('🔍 TESTE 2: Últimos 30 dias');
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const requestFrom30 = thirtyDaysAgo * 1000000;

    const historyResponse30 = await axios.post(
      `${apiUrl}/tradehistory`,
      {
        RequestDirection: "FORWARD",
        RequestFrom: requestFrom30,
        RequestTo: requestTo,
        OrderId: 0,
        LastRecordId: 0,
        PageSize: 1000
      },
      {
        ...axiosConfig,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log('   Status:', historyResponse30.status);
    console.log('   Resultado:', historyResponse30.data.TradeHistory?.length || 0, 'registros\n');

    // TESTE 3: Sem período (BACKWARD do início)
    console.log('🔍 TESTE 3: BACKWARD sem período específico');
    const historyResponseBackward = await axios.post(
      `${apiUrl}/tradehistory`,
      {
        RequestDirection: "BACKWARD",
        RequestFrom: 0,
        RequestTo: 0,
        OrderId: 0,
        LastRecordId: 0,
        PageSize: 1000
      },
      {
        ...axiosConfig,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log('   Status:', historyResponseBackward.status);
    console.log('   Resultado:', historyResponseBackward.data.TradeHistory?.length || 0, 'registros\n');

    // TESTE 4: Tentar endpoint diferente (dealhistory)
    console.log('🔍 TESTE 4: Endpoint /dealhistory');
    try {
      const dealHistoryResponse = await axios.post(
        `${apiUrl}/dealhistory`,
        {
          RequestDirection: "FORWARD",
          RequestFrom: requestFrom30,
          RequestTo: requestTo,
          DealId: 0,
          LastRecordId: 0,
          PageSize: 1000
        },
        {
          ...axiosConfig,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      console.log('   Status:', dealHistoryResponse.status);
      console.log('   Resultado:', JSON.stringify(dealHistoryResponse.data, null, 2));
    } catch (e) {
      console.log('   Erro:', e.response?.status || e.message);
    }

    console.log('\n📦 Resposta completa do TESTE 1:');
    console.log(JSON.stringify(historyResponse.data, null, 2));

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('   Stack:', error.stack);
  }
}

testGMIHistory();
