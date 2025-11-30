/**
 * Teste de Conexão GMI Edge API - Conta Real Demo
 * Testa login e busca de dados com credenciais reais
 */

import https from 'https';

const API_URL = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';

const testCredentials = {
  BotId: 3237386,
  Password: '7oH(y`EGgenX'
};

// Agent HTTPS que ignora validação de certificado SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testConnection() {
  console.log('🔍 Testando conexão com GMI Edge API...\n');
  console.log('📋 Credenciais:');
  console.log(`   Conta: ${testCredentials.BotId}`);
  console.log(`   Servidor: GMI Trading Platform Demo`);
  console.log(`   API URL: ${API_URL}\n`);

  try {
    // 1. Testar server time (não requer autenticação)
    console.log('1️⃣ Testando /servertime...');
    const timeResponse = await fetch(`${API_URL}/servertime`, {
      agent: httpsAgent
    });

    if (!timeResponse.ok) {
      throw new Error(`Server time failed: ${timeResponse.status}`);
    }

    const timeData = await timeResponse.json();
    console.log('✅ Server time:', timeData);
    console.log('');

    // 2. Fazer login
    console.log('2️⃣ Testando /login...');
    console.log('   Enviando credenciais...');

    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials),
      agent: httpsAgent
    });

    console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}`);

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Resposta de erro:', errorText);
      throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    console.log('   Access Token:', loginData.AccessToken ? loginData.AccessToken.substring(0, 50) + '...' : 'N/A');
    console.log('   Refresh Token:', loginData.RefreshToken ? loginData.RefreshToken.substring(0, 50) + '...' : 'N/A');
    console.log('');

    // 3. Buscar informações da conta
    console.log('3️⃣ Testando /accountinfo...');
    const accountInfoResponse = await fetch(`${API_URL}/accountinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.AccessToken}`
      },
      agent: httpsAgent
    });

    if (!accountInfoResponse.ok) {
      const errorText = await accountInfoResponse.text();
      console.log('❌ Resposta de erro:', errorText);
      throw new Error(`Account info failed: ${accountInfoResponse.status}`);
    }

    const accountInfo = await accountInfoResponse.json();
    console.log('✅ Informações da conta:');
    console.log(JSON.stringify(accountInfo, null, 2));
    console.log('');

    // 4. Buscar estado da conta
    console.log('4️⃣ Testando /accountstate...');
    const accountStateResponse = await fetch(`${API_URL}/accountstate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.AccessToken}`
      },
      agent: httpsAgent
    });

    if (!accountStateResponse.ok) {
      const errorText = await accountStateResponse.text();
      console.log('❌ Resposta de erro:', errorText);
      throw new Error(`Account state failed: ${accountStateResponse.status}`);
    }

    const accountState = await accountStateResponse.json();
    console.log('✅ Estado da conta:');
    console.log(JSON.stringify(accountState, null, 2));
    console.log('');

    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!\n');
    console.log('📊 Resumo:');
    console.log(`   Conta: ${accountInfo.Login || testCredentials.BotId}`);
    console.log(`   Nome: ${accountInfo.Name || 'N/A'}`);
    console.log(`   Saldo: ${accountState.AccountState?.Balance || accountState.Balance || 'N/A'}`);
    console.log(`   Equity: ${accountState.AccountState?.Equity || accountState.Equity || 'N/A'}`);
    console.log(`   Servidor: ${accountInfo.Server || 'GMI Trading Platform Demo'}`);
    console.log('');
    console.log('✅ A integração está funcionando! Agora pode usar no dashboard.');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
testConnection();
