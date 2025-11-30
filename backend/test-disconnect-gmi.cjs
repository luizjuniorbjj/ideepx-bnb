/**
 * 🧪 TESTE - Endpoint de Desconexão GMI
 */

async function testDisconnect() {
  console.log('\n🔌 ===== TESTE DE DESCONEXÃO =====\n');

  const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

  try {
    console.log(`📍 Testando desconexão para: ${address}\n`);

    const response = await fetch('http://localhost:5001/api/dev/disconnect-gmi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    console.log('\n📦 Resposta:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ DESCONEXÃO BEM-SUCEDIDA!');
      console.log(`   Account: ${data.data?.accountNumber}`);
      console.log(`   Connected: ${data.data?.connected}`);
    } else {
      console.log('\n❌ DESCONEXÃO FALHOU!');
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error(`   Mensagem: ${error.message}`);

    if (error.cause) {
      console.error(`   Causa: ${error.cause}`);
    }
  }

  console.log('\n');
}

testDisconnect();
