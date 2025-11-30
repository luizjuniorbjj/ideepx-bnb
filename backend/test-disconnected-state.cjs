/**
 * 🧪 TESTE - Verificar estado desconectado
 */

const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

async function testDisconnectedState() {
  console.log('\n🔍 ===== TESTE: ESTADO DESCONECTADO =====\n');

  try {
    console.log('📍 Buscando dados GMI para conta DESCONECTADA...');
    console.log('   Address:', address);
    console.log('');

    const response = await fetch(`http://localhost:5001/api/dev/gmi/account/${address}`);

    console.log(`   Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    console.log('\n📦 Resposta:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    // Verificações
    console.log('✅ VERIFICAÇÕES:');
    console.log(`   success: ${data.success} ${data.success ? '✅' : '❌'}`);
    console.log(`   connected: ${data.connected} ${!data.connected ? '✅' : '❌'}`);
    console.log(`   account: ${data.account} ${data.account === null ? '✅' : '❌'}`);
    console.log(`   performance: ${data.performance} ${data.performance === null ? '✅' : '❌'}`);
    console.log(`   source: ${data.source}`);
    console.log('');

    if (data.connected === false && data.account === null) {
      console.log('🎉 PERFEITO! Estado desconectado correto!');
    } else {
      console.log('❌ ERRO! Ainda retornando dados quando desconectado!');
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error('   Mensagem:', error.message);
  }

  console.log('\n');
}

testDisconnectedState();
