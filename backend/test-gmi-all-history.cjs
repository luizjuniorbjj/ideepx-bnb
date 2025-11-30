/**
 * 🧪 TESTE - Buscar TODO o histórico disponível
 */

const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const apiUrl = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';
const accountNumber = '3237386';
const password = '7oH(y`EGgenX';

async function testAllHistory() {
  console.log('\n📜 ===== TESTE: TODO O HISTÓRICO =====\n');

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

    // 2. BUSCAR TODO O HISTÓRICO (sem limitar por data)
    console.log('📍 BUSCANDO TODO O HISTÓRICO...');

    const historyResponse = await axios.post(
      `${apiUrl}/tradehistory`,
      {
        RequestDirection: "FORWARD",
        RequestFrom: 0,  // Do início
        RequestTo: 0,    // Até o fim
        OrderId: 0,
        LastRecordId: 0,
        PageSize: 1000   // Máximo possível
      },
      { headers, httpsAgent, timeout: 30000 }
    );

    console.log('   ✅ Resposta recebida!');
    console.log('');

    console.log('📦 RESPOSTA COMPLETA:');
    console.log(JSON.stringify(historyResponse.data, null, 2));

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

testAllHistory();
