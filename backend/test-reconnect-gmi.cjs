/**
 * 🧪 TESTE - Fluxo Completo: Conectar → Desconectar → Reconectar
 */

const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';
const accountNumber = '3237386';
const password = '7oH(y`EGgenX';
const server = 'GMI Trading Platform Demo';

async function testFullCycle() {
  console.log('\n🔄 ===== TESTE: CONECTAR → DESCONECTAR → RECONECTAR =====\n');

  try {
    // ========================================
    // 1. CONECTAR
    // ========================================
    console.log('📍 PASSO 1: CONECTAR CONTA GMI');
    console.log('   Address:', address);
    console.log('   Account:', accountNumber);
    console.log('   Server:', server);
    console.log('');

    const connectResponse = await fetch('http://localhost:5001/api/dev/link-gmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        accountNumber,
        investorPassword: password,
        server,
        platform: 'MT5'
      })
    });

    console.log(`   Status: ${connectResponse.status} ${connectResponse.statusText}`);

    const connectData = await connectResponse.json();
    console.log('   Resposta:', JSON.stringify(connectData, null, 2));

    if (!connectData.success || !connectData.data || !connectData.data.connected) {
      console.log('   ❌ FALHA: Conta não conectou!');
      return;
    }

    console.log('   ✅ Conectado!');
    console.log('');

    // ========================================
    // 2. AGUARDAR 2 SEGUNDOS
    // ========================================
    console.log('⏳ PASSO 2: AGUARDANDO 2 SEGUNDOS...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ Aguarde concluído!');
    console.log('');

    // ========================================
    // 3. DESCONECTAR
    // ========================================
    console.log('📍 PASSO 3: DESCONECTAR CONTA GMI');

    const disconnectResponse = await fetch('http://localhost:5001/api/dev/disconnect-gmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    console.log(`   Status: ${disconnectResponse.status} ${disconnectResponse.statusText}`);

    const disconnectData = await disconnectResponse.json();
    console.log('   Resposta:', JSON.stringify(disconnectData, null, 2));

    if (!disconnectData.success || disconnectData.data.connected !== false) {
      console.log('   ❌ FALHA: Conta não desconectou corretamente!');
      return;
    }

    console.log('   ✅ Desconectado!');
    console.log('');

    // ========================================
    // 4. AGUARDAR 2 SEGUNDOS
    // ========================================
    console.log('⏳ PASSO 4: AGUARDANDO 2 SEGUNDOS...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ Aguarde concluído!');
    console.log('');

    // ========================================
    // 5. RECONECTAR
    // ========================================
    console.log('📍 PASSO 5: RECONECTAR CONTA GMI');
    console.log('   (Mesmas credenciais)');
    console.log('');

    const reconnectResponse = await fetch('http://localhost:5001/api/dev/link-gmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        accountNumber,
        investorPassword: password,
        server,
        platform: 'MT5'
      })
    });

    console.log(`   Status: ${reconnectResponse.status} ${reconnectResponse.statusText}`);

    const reconnectData = await reconnectResponse.json();
    console.log('   Resposta:', JSON.stringify(reconnectData, null, 2));

    if (!reconnectData.success || !reconnectData.data || !reconnectData.data.connected) {
      console.log('   ❌ FALHA: Conta não reconectou!');
      console.log('');
      console.log('🔍 ANÁLISE DO ERRO:');
      if (reconnectData.error) {
        console.log('   Erro:', reconnectData.error);
      }
      if (reconnectData.message) {
        console.log('   Mensagem:', reconnectData.message);
      }
      return;
    }

    console.log('   ✅ Reconectado!');
    console.log('');

    // ========================================
    // RESULTADO FINAL
    // ========================================
    console.log('🎉 ===== TESTE COMPLETO =====');
    console.log('✅ Conectar: OK');
    console.log('✅ Desconectar: OK');
    console.log('✅ Reconectar: OK');
    console.log('');
    console.log('🎯 FLUXO FUNCIONA PERFEITAMENTE!');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
  }

  console.log('\n');
}

testFullCycle();
