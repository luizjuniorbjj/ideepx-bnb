/**
 * Teste Completo GMI Edge API
 * Testa login, account info e account state com as credenciais corretas
 */

import https from 'https';

const API_URL = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';

// ✅ CREDENCIAIS VALIDADAS
const testCredentials = {
  BotId: 3237386,
  Password: '7oH(y`EGgenX'
};

// Agent HTTPS que ignora validação de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testGMIEdgeAPI() {
  console.log('=' .repeat(70));
  console.log('🔍 TESTE COMPLETO GMI EDGE API');
  console.log('='.repeat(70));
  console.log('');
  console.log('📋 Credenciais:');
  console.log(`   BotId: ${testCredentials.BotId}`);
  console.log(`   Server: GMI Trading Platform Demo`);
  console.log(`   API URL: ${API_URL}`);
  console.log('');

  try {
    // ==========================================
    // PASSO 1: LOGIN
    // ==========================================
    console.log('=' .repeat(70));
    console.log('PASSO 1: LOGIN');
    console.log('='.repeat(70));
    console.log('');

    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials),
      agent: httpsAgent
    });

    console.log(`Status: ${loginResponse.status} ${loginResponse.statusText}`);
    console.log('');

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ LOGIN BEM-SUCEDIDO!');
    console.log('');
    console.log('🔑 Tokens obtidos:');
    console.log(`   AccessToken: ${loginData.AccessToken.substring(0, 50)}...`);
    console.log(`   RefreshToken: ${loginData.RefreshToken.substring(0, 50)}...`);
    console.log('');

    const accessToken = loginData.AccessToken;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // ==========================================
    // PASSO 2: ACCOUNT INFO
    // ==========================================
    console.log('='.repeat(70));
    console.log('PASSO 2: ACCOUNT INFO');
    console.log('='.repeat(70));
    console.log('');

    const accountInfoResponse = await fetch(`${API_URL}/accountinfo`, {
      method: 'GET',
      headers,
      agent: httpsAgent
    });

    console.log(`Status: ${accountInfoResponse.status}`);
    console.log('');

    if (!accountInfoResponse.ok) {
      const errorText = await accountInfoResponse.text();
      throw new Error(`Account info failed: ${accountInfoResponse.status} - ${errorText}`);
    }

    const accountInfo = await accountInfoResponse.json();
    console.log('✅ ACCOUNT INFO OBTIDO COM SUCESSO!');
    console.log('');
    console.log('📋 Informações da Conta:');
    console.log(JSON.stringify(accountInfo, null, 2));
    console.log('');

    // ==========================================
    // PASSO 3: ACCOUNT STATE (Balance/Equity)
    // ==========================================
    console.log('='.repeat(70));
    console.log('PASSO 3: ACCOUNT STATE');
    console.log('='.repeat(70));
    console.log('');

    const accountStateResponse = await fetch(`${API_URL}/accountstate`, {
      method: 'GET',
      headers,
      agent: httpsAgent
    });

    console.log(`Status: ${accountStateResponse.status}`);
    console.log('');

    if (!accountStateResponse.ok) {
      const errorText = await accountStateResponse.text();
      throw new Error(`Account state failed: ${accountStateResponse.status} - ${errorText}`);
    }

    const accountState = await accountStateResponse.json();
    console.log('✅ ACCOUNT STATE OBTIDO COM SUCESSO!');
    console.log('');

    // A API retorna { AccountState: {...}, OrderStates: [...] }
    const state = accountState.AccountState || accountState;
    const balance = state.Balance || 0;
    const equity = state.Equity || 0;
    const margin = state.Margin || 0;
    const freeMargin = state.FreeMargin || 0;

    console.log('💰 Estado Financeiro:');
    console.log(`   Balance: $${balance.toFixed(2)}`);
    console.log(`   Equity: $${equity.toFixed(2)}`);
    console.log(`   Margin: $${margin.toFixed(2)}`);
    console.log(`   Free Margin: $${freeMargin.toFixed(2)}`);
    console.log('');
    console.log('📋 Resposta Completa:');
    console.log(JSON.stringify(accountState, null, 2));
    console.log('');

    // ==========================================
    // RESUMO FINAL
    // ==========================================
    console.log('='.repeat(70));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   Conta: ${accountInfo.Login || testCredentials.BotId}`);
    console.log(`   Nome: ${accountInfo.Name || 'N/A'}`);
    console.log(`   Balance: $${balance.toFixed(2)}`);
    console.log(`   Equity: $${equity.toFixed(2)}`);
    console.log(`   Servidor: ${accountInfo.Server || 'GMI Trading Platform Demo'}`);
    console.log('');
    console.log('🎯 A integração está 100% funcional!');
    console.log('   O backend pode usar este mesmo fluxo para conectar contas.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
    process.exit(1);
  }
}

// Executar teste
testGMIEdgeAPI();
