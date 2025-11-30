const https = require('https');

const address = "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2";

const data = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getBalance",
  params: [address, "latest"],
  id: 1
});

const options = {
  hostname: 'bsc-dataseed1.binance.org',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log(`Verificando saldo de ${address} na BSC MAINNET...`);

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      if (result.result) {
        const balanceWei = BigInt(result.result);
        const balanceBNB = Number(balanceWei) / 1e18;
        console.log(`\nSaldo MAINNET: ${balanceBNB.toFixed(6)} BNB`);
        console.log(`Necessário: 0.5 BNB`);

        if (balanceBNB >= 0.5) {
          console.log('\n✅ SALDO SUFICIENTE PARA DEPLOY!');
        } else if (balanceBNB > 0) {
          console.log(`\n⚠️  SALDO INSUFICIENTE! Faltam ${(0.5 - balanceBNB).toFixed(6)} BNB`);
        } else {
          console.log('\n❌ CARTEIRA VAZIA! Este endereço não tem BNB na MAINNET!');
          console.log('Esta pode ser uma carteira de TESTNET.');
        }
      } else {
        console.log('Erro ao consultar saldo:', result);
      }
    } catch (e) {
      console.log('Erro:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Erro de conexão:', e.message);
});

req.write(data);
req.end();
