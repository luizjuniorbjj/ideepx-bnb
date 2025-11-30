/**
 * 🧪 TESTE - Verificar se campo "platform" causa problema
 */

const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

async function testPlatformField() {
  console.log('\n🔍 ===== TESTE: CAMPO PLATFORM =====\n');

  // Teste 1: Com platform='MT5'
  console.log('📍 TESTE 1: platform="MT5"');
  try {
    const response1 = await fetch('http://localhost:5001/api/dev/link-gmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        accountNumber: '3237386',
        investorPassword: '7oH(y`EGgenX',
        server: 'GMI Trading Platform Demo',
        platform: 'MT5'
      })
    });

    const data1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Success: ${data1.success}`);
    console.log(`   Connected: ${data1.data?.connected}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }

  await new Promise(r => setTimeout(r, 1000));

  // Desconectar
  console.log('🔌 Desconectando...');
  await fetch('http://localhost:5001/api/dev/disconnect-gmi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  console.log('   ✅ Desconectado\n');

  await new Promise(r => setTimeout(r, 1000));

  // Teste 2: Com platform='The Edge'
  console.log('📍 TESTE 2: platform="The Edge"');
  try {
    const response2 = await fetch('http://localhost:5001/api/dev/link-gmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        accountNumber: '3237386',
        investorPassword: '7oH(y`EGgenX',
        server: 'GMI Trading Platform Demo',
        platform: 'The Edge'
      })
    });

    const data2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Success: ${data2.success}`);
    console.log(`   Connected: ${data2.data?.connected}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }

  await new Promise(r => setTimeout(r, 1000));

  // Desconectar
  console.log('🔌 Desconectando...');
  await fetch('http://localhost:5001/api/dev/disconnect-gmi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  console.log('   ✅ Desconectado\n');

  await new Promise(r => setTimeout(r, 1000));

  // Teste 3: Sem campo platform
  console.log('📍 TESTE 3: SEM campo platform (deve usar padrão MT5)');
  try {
    const response3 = await fetch('http://localhost:5001/api/dev/link-gmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        accountNumber: '3237386',
        investorPassword: '7oH(y`EGgenX',
        server: 'GMI Trading Platform Demo'
        // SEM platform
      })
    });

    const data3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Success: ${data3.success}`);
    console.log(`   Connected: ${data3.data?.connected}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }

  console.log('✅ TESTES CONCLUÍDOS\n');
}

testPlatformField();
