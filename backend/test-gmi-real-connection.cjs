/**
 * 🧪 TESTE DE CONEXÃO GMI EDGE - API REAL
 *
 * Testa conexão com a API GMI Edge usando credenciais reais
 */

require('dotenv').config();
const https = require('https');

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const ACCOUNT = '3237386';
const PASSWORD = '7oH(y`EGgenX';
const SERVER = 'GMI Trading Platform Demo';

// Mapeamento de servidores para URLs
const API_URLS = {
  'GMI Trading Platform Demo': 'https://demo-edge-api.gmimarkets.com:7530/api/v1',
  'GMIEdge-Demo': 'https://demo-edge-api.gmimarkets.com:7530/api/v1',
  'GMIEdge-Live': 'https://live-edge-api.gmimarkets.com:7530/api/v1',
  'GMIEdge-Cent': 'https://cent-edge-api.gmimarkets.com:6530/api/v1'
};

// Agent HTTPS que ignora SSL (necessário para GMI Edge)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// ============================================================================
// FUNÇÕES DE TESTE
// ============================================================================

async function testLogin() {
  console.log('\n🔐 ===== TESTE 1: LOGIN =====\n');

  const apiUrl = API_URLS[SERVER];
  console.log(`📍 Servidor: ${SERVER}`);
  console.log(`🔗 API URL: ${apiUrl}`);
  console.log(`👤 Account: ${ACCOUNT}`);
  console.log(`🔑 Password: ${'*'.repeat(PASSWORD.length)}`);

  try {
    console.log('\n⏳ Enviando requisição de login...');

    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BotId: parseInt(ACCOUNT),
        Password: PASSWORD
      }),
      agent: httpsAgent
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('\n❌ LOGIN FALHOU!');
      console.error('Erro:', JSON.stringify(error, null, 2));
      return null;
    }

    const data = await response.json();
    console.log('\n✅ LOGIN BEM-SUCEDIDO!\n');
    console.log('Tokens recebidos:');
    console.log(`  AccessToken: ${data.AccessToken?.substring(0, 30)}...`);
    console.log(`  RefreshToken: ${data.RefreshToken?.substring(0, 30)}...`);

    return data;
  } catch (error) {
    console.error('\n❌ ERRO NO LOGIN:');
    console.error(error.message);
    return null;
  }
}

async function testAccountInfo(accessToken) {
  console.log('\n📊 ===== TESTE 2: ACCOUNT INFO =====\n');

  const apiUrl = API_URLS[SERVER];

  try {
    console.log('⏳ Buscando informações da conta...');

    const response = await fetch(`${apiUrl}/accountinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      agent: httpsAgent
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('\n❌ FALHA AO BUSCAR INFO!');
      console.error('Erro:', JSON.stringify(error, null, 2));
      return null;
    }

    const data = await response.json();
    console.log('\n✅ INFORMAÇÕES DA CONTA:\n');
    console.log(JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('\n❌ ERRO AO BUSCAR INFO:');
    console.error(error.message);
    return null;
  }
}

async function testAccountState(accessToken) {
  console.log('\n💰 ===== TESTE 3: ACCOUNT STATE =====\n');

  const apiUrl = API_URLS[SERVER];

  try {
    console.log('⏳ Buscando estado financeiro da conta...');

    const response = await fetch(`${apiUrl}/accountstate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      agent: httpsAgent
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('\n❌ FALHA AO BUSCAR ESTADO!');
      console.error('Erro:', JSON.stringify(error, null, 2));
      return null;
    }

    const data = await response.json();
    console.log('\n✅ ESTADO DA CONTA:\n');

    // A API retorna { AccountState: {...}, OrderStates: [...] }
    if (data.AccountState) {
      console.log('AccountState:');
      console.log(JSON.stringify(data.AccountState, null, 2));
      console.log('\nOrderStates (Posições abertas):');
      console.log(JSON.stringify(data.OrderStates, null, 2));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }

    return data;
  } catch (error) {
    console.error('\n❌ ERRO AO BUSCAR ESTADO:');
    console.error(error.message);
    return null;
  }
}

// ============================================================================
// EXECUTAR TESTES
// ============================================================================

async function runTests() {
  console.log('\n🚀 ===== TESTE DE CONEXÃO GMI EDGE API =====');
  console.log(`⏰ Início: ${new Date().toISOString()}\n`);

  // Teste 1: Login
  const loginData = await testLogin();
  if (!loginData || !loginData.AccessToken) {
    console.error('\n❌ TESTE ABORTADO - Login falhou\n');
    process.exit(1);
  }

  // Aguardar 1 segundo entre requests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Teste 2: Account Info
  const accountInfo = await testAccountInfo(loginData.AccessToken);

  // Aguardar 1 segundo entre requests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Teste 3: Account State
  const accountState = await testAccountState(loginData.AccessToken);

  // Resumo final
  console.log('\n🎉 ===== RESUMO DOS TESTES =====\n');
  console.log(`✅ Login: ${loginData ? 'OK' : 'FALHOU'}`);
  console.log(`✅ Account Info: ${accountInfo ? 'OK' : 'FALHOU'}`);
  console.log(`✅ Account State: ${accountState ? 'OK' : 'FALHOU'}`);

  if (loginData && accountInfo && accountState) {
    console.log('\n🎊 TODOS OS TESTES PASSARAM!');
    console.log('\n📋 Dados obtidos:');
    console.log(`   Account: ${accountInfo.Login || 'N/A'}`);
    console.log(`   Balance: ${accountState.AccountState?.Balance || accountState.Balance || 'N/A'}`);
    console.log(`   Equity: ${accountState.AccountState?.Equity || accountState.Equity || 'N/A'}`);
    console.log(`   Positions: ${accountState.OrderStates?.length || 0}`);
  } else {
    console.log('\n❌ ALGUNS TESTES FALHARAM!');
  }

  console.log(`\n⏰ Fim: ${new Date().toISOString()}\n`);
}

// Executar
runTests().catch(console.error);
