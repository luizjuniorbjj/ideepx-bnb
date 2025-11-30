// Teste de conexão MT5 via API
const fetch = require('node-fetch');

async function testConnect() {
  try {
    console.log('\n🧪 TESTE - Conectar Conta MT5\n');
    console.log('Dados da requisição:');
    console.log('  - Wallet: 0x75d1A8ac59003088c60A20bde8953cBECfe41669');
    console.log('  - Corretora: Doo Technology');
    console.log('  - Servidor: DooTechnology-Live');
    console.log('  - Login: 9941739');
    console.log('  - Senha: 110677Pa*');
    console.log('  - Plataforma: MT5\n');

    const response = await fetch('http://localhost:5001/api/mt5/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: '0x75d1A8ac59003088c60A20bde8953cBECfe41669',
        accountAlias: 'Doo Technology 9941739',
        brokerName: 'Doo Technology',
        login: '9941739',
        password: '110677Pa*',
        server: 'DooTechnology-Live',
        platform: 'MT5'
      })
    });

    const data = await response.json();

    console.log(`📊 Resposta HTTP: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      console.log('✅ SUCESSO! Conta conectada:\n');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n📌 ID da conta:', data.account.id);
      console.log('📌 Status:', data.account.status);
    } else {
      console.log('❌ ERRO:\n');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Exceção:', error.message);
  }
}

testConnect();
