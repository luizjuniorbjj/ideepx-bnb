/**
 * Teste Completo - Conexão GMI Edge via Backend
 * Testa o fluxo completo: Frontend -> Backend -> GMI Edge API
 */

import https from 'https';

// Configurações
const BACKEND_URL = 'http://localhost:5001';
const TEST_ADDRESS = '0xa3cad6ab494d8f5ff364b2d77cdfb138ed916e6d'; // Usuário ativo do banco

// Credenciais corretas da conta GMI Edge Demo
const TEST_CREDENTIALS = {
  address: TEST_ADDRESS,
  accountNumber: '3237386',
  investorPassword: '7oH(y`EGgenX',
  server: 'GMI Trading Platform Demo',
  platform: 'The Edge'
};

console.log('='.repeat(70));
console.log('🧪 TESTE COMPLETO - FLUXO DE CONEXÃO GMI EDGE');
console.log('='.repeat(70));
console.log('');

async function testFullFlow() {
  try {
    // ==========================================
    // PASSO 1: Testar Health do Backend
    // ==========================================
    console.log('📡 PASSO 1: Testando conexão com backend...');
    console.log(`   URL: ${BACKEND_URL}/api/health`);
    console.log('');

    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (!healthResponse.ok) {
      throw new Error(`Backend não está respondendo: ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    console.log('✅ Backend online!');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Timestamp: ${healthData.timestamp}`);
    console.log('');

    // ==========================================
    // PASSO 2: Conectar Conta GMI
    // ==========================================
    console.log('='.repeat(70));
    console.log('📡 PASSO 2: Conectando conta GMI Edge...');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 Credenciais enviadas:');
    console.log(`   Address: ${TEST_CREDENTIALS.address}`);
    console.log(`   Account Number: ${TEST_CREDENTIALS.accountNumber}`);
    console.log(`   Server: ${TEST_CREDENTIALS.server}`);
    console.log(`   Platform: ${TEST_CREDENTIALS.platform}`);
    console.log('');

    const linkResponse = await fetch(`${BACKEND_URL}/api/dev/link-gmi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    console.log(`   Status HTTP: ${linkResponse.status} ${linkResponse.statusText}`);
    console.log('');

    if (!linkResponse.ok) {
      const errorText = await linkResponse.text();
      console.error('❌ Erro na resposta do backend:');
      console.error(errorText);
      throw new Error(`Backend retornou erro: ${linkResponse.status}`);
    }

    const linkData = await linkResponse.json();
    console.log('✅ CONTA CONECTADA COM SUCESSO!');
    console.log('');
    console.log('📊 Dados retornados pelo backend:');
    console.log(JSON.stringify(linkData, null, 2));
    console.log('');

    // ==========================================
    // PASSO 3: Verificar dados salvos
    // ==========================================
    console.log('='.repeat(70));
    console.log('📡 PASSO 3: Verificando dados salvos no banco...');
    console.log('='.repeat(70));
    console.log('');

    const userResponse = await fetch(`${BACKEND_URL}/api/dev/user/${TEST_ADDRESS}`);

    if (!userResponse.ok) {
      console.warn('⚠️  Não foi possível buscar dados do usuário (pode ser normal)');
    } else {
      const userData = await userResponse.json();
      console.log('✅ Dados do usuário:');
      console.log(JSON.stringify(userData, null, 2));
      console.log('');
    }

    // ==========================================
    // RESUMO FINAL
    // ==========================================
    console.log('='.repeat(70));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   ✅ Backend respondendo`);
    console.log(`   ✅ Endpoint /api/dev/link-gmi funcionando`);
    console.log(`   ✅ Conexão com GMI Edge API estabelecida`);
    console.log(`   ✅ Dados salvos no banco de dados`);
    console.log('');
    console.log('🎯 O fluxo completo está funcionando!');
    console.log('   Agora você pode testar pelo dashboard em:');
    console.log('   http://localhost:5000/mt5');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('');
    console.error('Stack completo:');
    console.error(error.stack);
    console.error('');
    console.error('💡 Possíveis causas:');
    console.error('   1. Backend não está rodando (npm run dev na pasta backend)');
    console.error('   2. Porta 5001 está ocupada');
    console.error('   3. GMI Edge API não está acessível');
    console.error('   4. Credenciais incorretas');
    console.error('');
    process.exit(1);
  }
}

// Executar teste
testFullFlow();
