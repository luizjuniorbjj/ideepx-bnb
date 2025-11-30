/**
 * 🧪 TESTE - Conectar e verificar métricas calculadas
 */

const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

async function testConnectWithMetrics() {
  console.log('\n🔍 ===== TESTE: CONECTAR COM MÉTRICAS =====\n');

  try {
    console.log('📍 Conectando conta GMI com histórico...');

    const response = await fetch('http://localhost:5001/api/dev/link-gmi', {
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

    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log('');
    console.log('📦 Resposta:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    if (data.success && data.data) {
      console.log('✅ DADOS SALVOS:');
      console.log(`   Account: ${data.data.accountNumber}`);
      console.log(`   Balance: $${data.data.balance}`);
      console.log(`   Equity: $${data.data.equity}`);
      console.log(`   Monthly Volume: ${data.data.monthlyVolume || 0}`);
      console.log(`   Total Trades: ${data.data.totalTrades || 0}`);
      console.log(`   Has History: ${data.data.hasHistory ? 'SIM' : 'NÃO'}`);
    }

  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error('   Mensagem:', error.message);
  }

  console.log('\n');
}

testConnectWithMetrics();
