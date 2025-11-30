/**
 * 🔍 DEBUG - Teste de conectividade GMI Edge
 */

require('dotenv').config();
const https = require('https');

const URLS = [
  'https://demo-edge-api.gmimarkets.com:7530/api/v1/login',
  'https://live-edge-api.gmimarkets.com:7530/api/v1/login',
  'https://www.gmimarkets.com'
];

async function testConnectivity() {
  console.log('🔍 ===== TESTE DE CONECTIVIDADE =====\n');

  for (const url of URLS) {
    console.log(`\n📍 Testando: ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        agent: new https.Agent({ rejectUnauthorized: false })
      }).catch(err => {
        // Tentar com POST se HEAD falhar
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller.signal,
          agent: new https.Agent({ rejectUnauthorized: false })
        });
      });

      clearTimeout(timeoutId);
      console.log(`   ✅ Status: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      console.log(`   Tipo: ${error.name}`);
      if (error.cause) {
        console.log(`   Causa: ${error.cause.message || error.cause}`);
      }
    }
  }

  console.log('\n🔍 ===== TESTE COM AXIOS (alternativa) =====\n');

  // Tentar com axios se disponível
  try {
    const axios = require('axios');

    const response = await axios.post(
      'https://demo-edge-api.gmimarkets.com:7530/api/v1/login',
      {
        BotId: 3237386,
        Password: '7oH(y`EGgenX'
      },
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 10000
      }
    );

    console.log('✅ Axios funcionou!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (axiosError) {
    console.log('❌ Axios também falhou:');
    console.log('   Mensagem:', axiosError.message);
    if (axiosError.response) {
      console.log('   Status:', axiosError.response.status);
      console.log('   Data:', axiosError.response.data);
    }
  }
}

testConnectivity().catch(console.error);
