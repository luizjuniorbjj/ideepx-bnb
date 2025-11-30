/**
 * Teste Completo de Autenticação GMI Edge API
 * Segue EXATAMENTE o guia: GUIA_AUTENTICACAO_MANUAL_GMI.md
 */

import https from 'https';
import fetch from 'node-fetch';

// URL base da API
const API_URL = 'https://demo-edge-api.gmimarkets.com:7530/api/v1';

// Credenciais conforme documentação
const CREDENTIALS = {
  BotId: 3237386,
  Password: '7oH(y`EGgenX'
};

// Agent HTTPS para bypass SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

console.log('='.repeat(80));
console.log('🔐 TESTE COMPLETO DE AUTENTICAÇÃO GMI EDGE API');
console.log('='.repeat(80));
console.log('');
console.log('📋 Configuração:');
console.log(`   API URL: ${API_URL}`);
console.log(`   BotId: ${CREDENTIALS.BotId}`);
console.log(`   Password: ${CREDENTIALS.Password}`);
console.log('');

async function testGMIAuth() {
  let accessToken = null;

  try {
    // ==========================================
    // PASSO 1: LOGIN
    // ==========================================
    console.log('='.repeat(80));
    console.log('PASSO 1: LOGIN - Obter AccessToken');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Endpoint: POST ${API_URL}/login`);
    console.log('Headers: Content-Type: application/json');
    console.log('Body:', JSON.stringify(CREDENTIALS, null, 2));
    console.log('');

    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(CREDENTIALS),
      agent: httpsAgent
    });

    console.log(`Status: ${loginResponse.status} ${loginResponse.statusText}`);

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Erro na resposta:');
      console.error(errorText);
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    accessToken = loginData.AccessToken;
    const refreshToken = loginData.RefreshToken;

    console.log('');
    console.log('✅ LOGIN BEM-SUCEDIDO!');
    console.log('');
    console.log('🔑 Tokens obtidos:');
    console.log(`   AccessToken: ${accessToken.substring(0, 50)}...`);
    console.log(`   RefreshToken: ${refreshToken.substring(0, 50)}...`);
    console.log('');
    console.log('⏱️  AccessToken expira em ~1 hora');
    console.log('');

    // ==========================================
    // PASSO 2: ACCOUNT INFO
    // ==========================================
    console.log('='.repeat(80));
    console.log('PASSO 2: ACCOUNT INFO - Informações da Conta');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Endpoint: GET ${API_URL}/accountinfo`);
    console.log('Headers:');
    console.log('  Content-Type: application/json');
    console.log(`  Authorization: Bearer ${accessToken.substring(0, 30)}...`);
    console.log('');

    const accountInfoResponse = await fetch(`${API_URL}/accountinfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      agent: httpsAgent
    });

    console.log(`Status: ${accountInfoResponse.status} ${accountInfoResponse.statusText}`);

    if (!accountInfoResponse.ok) {
      const errorText = await accountInfoResponse.text();
      console.error('❌ Erro na resposta:');
      console.error(errorText);
      throw new Error(`Account info falhou: ${accountInfoResponse.status}`);
    }

    const accountInfo = await accountInfoResponse.json();
    console.log('');
    console.log('✅ ACCOUNT INFO OBTIDO!');
    console.log('');
    console.log('📋 Informações da Conta:');
    console.log(JSON.stringify(accountInfo, null, 2));
    console.log('');

    // ==========================================
    // PASSO 3: ACCOUNT STATE (Balance/Equity)
    // ==========================================
    console.log('='.repeat(80));
    console.log('PASSO 3: ACCOUNT STATE - Balance e Equity');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Endpoint: GET ${API_URL}/accountstate`);
    console.log('Headers:');
    console.log('  Content-Type: application/json');
    console.log(`  Authorization: Bearer ${accessToken.substring(0, 30)}...`);
    console.log('');

    const accountStateResponse = await fetch(`${API_URL}/accountstate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      agent: httpsAgent
    });

    console.log(`Status: ${accountStateResponse.status} ${accountStateResponse.statusText}`);

    if (!accountStateResponse.ok) {
      const errorText = await accountStateResponse.text();
      console.error('❌ Erro na resposta:');
      console.error(errorText);
      throw new Error(`Account state falhou: ${accountStateResponse.status}`);
    }

    const accountState = await accountStateResponse.json();
    console.log('');
    console.log('✅ ACCOUNT STATE OBTIDO!');
    console.log('');

    const state = accountState.AccountState || accountState;
    const balance = state.Balance || 0;
    const equity = state.Equity || 0;
    const margin = state.Margin || 0;
    const freeMargin = state.FreeMargin || 0;

    console.log('💰 Estado Financeiro:');
    console.log(`   Balance: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Equity: $${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Margin: $${margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log(`   Free Margin: $${freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log('');
    console.log('📋 Resposta Completa:');
    console.log(JSON.stringify(accountState, null, 2));
    console.log('');

    // ==========================================
    // PASSO 4: POSITION LIST (Posições Abertas)
    // ==========================================
    console.log('='.repeat(80));
    console.log('PASSO 4: POSITION LIST - Posições Abertas');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Endpoint: GET ${API_URL}/positionlist`);
    console.log('');

    const positionListResponse = await fetch(`${API_URL}/positionlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      agent: httpsAgent
    });

    console.log(`Status: ${positionListResponse.status} ${positionListResponse.statusText}`);

    if (positionListResponse.ok) {
      const positions = await positionListResponse.json();
      console.log('');
      console.log('✅ POSITION LIST OBTIDO!');
      console.log('');
      console.log('📊 Posições:');
      console.log(JSON.stringify(positions, null, 2));
      console.log('');
    } else {
      console.log('⚠️  Não foi possível obter posições (pode ser normal se não houver posições abertas)');
      console.log('');
    }

    // ==========================================
    // RESUMO FINAL
    // ==========================================
    console.log('='.repeat(80));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(80));
    console.log('');
    console.log('📊 Resumo Final:');
    console.log(`   ✅ Login realizado com sucesso`);
    console.log(`   ✅ AccessToken obtido e funcionando`);
    console.log(`   ✅ Account Info: Login ${accountInfo.Login || CREDENTIALS.BotId}`);
    console.log(`   ✅ Account State: Balance $${balance.toFixed(2)}`);
    console.log('');
    console.log('🎯 A AUTENTICAÇÃO ESTÁ 100% FUNCIONAL!');
    console.log('');
    console.log('Próximo passo:');
    console.log('  → Integrar este fluxo no gmiEdgeService.js');
    console.log('  → Garantir que o backend use EXATAMENTE este mesmo fluxo');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ ERRO NO TESTE');
    console.error('='.repeat(80));
    console.error('');
    console.error('Mensagem de erro:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    console.error('💡 Possíveis causas:');
    console.error('   1. Credenciais incorretas');
    console.error('   2. URL da API incorreta');
    console.error('   3. Problema de rede/firewall');
    console.error('   4. API GMI Edge offline/inacessível');
    console.error('');
    process.exit(1);
  }
}

// Executar teste
testGMIAuth();
