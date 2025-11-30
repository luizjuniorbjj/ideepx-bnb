const https = require('https');

// Gas estimado para cada operação
const gasEstimates = {
  'Deploy iDeepXCore': 4_030_000,
  'Deploy iDeepXMLM': 1_740_000,
  'Deploy iDeepXGovernance': 1_870_000,
  'Deploy Mock USDT (se necessário)': 800_000,
  'setModules no Core': 100_000,
  'setCore no MLM': 50_000,
  'setCore no Governance': 50_000,
  'Configurações iniciais': 200_000,
};

// Gas price médio BSC (5 gwei)
const gasPriceGwei = 5;
const gasPriceWei = gasPriceGwei * 1e9;

console.log('💰 CALCULANDO CUSTO DE DEPLOY NA BSC MAINNET\n');
console.log('═══════════════════════════════════════════════════════════');

let totalGas = 0;

console.log('\n📋 OPERAÇÕES E CUSTOS:\n');
Object.entries(gasEstimates).forEach(([operation, gas]) => {
  const costBNB = (gas * gasPriceWei) / 1e18;
  totalGas += gas;
  console.log(`${operation}:`);
  console.log(`  Gas: ${(gas / 1_000_000).toFixed(2)}M`);
  console.log(`  Custo: ${costBNB.toFixed(6)} BNB`);
  console.log();
});

const totalCostBNB = (totalGas * gasPriceWei) / 1e18;

console.log('═══════════════════════════════════════════════════════════');
console.log(`\n📊 RESUMO TOTAL:\n`);
console.log(`Gas total estimado: ${(totalGas / 1_000_000).toFixed(2)} milhões`);
console.log(`Gas price: ${gasPriceGwei} gwei`);
console.log(`Custo base: ${totalCostBNB.toFixed(6)} BNB`);

// Buscar preço atual do BNB
const options = {
  hostname: 'api.binance.com',
  path: '/api/v3/ticker/price?symbol=BNBUSDT',
  method: 'GET'
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const price = JSON.parse(data);
      const bnbPrice = parseFloat(price.price);
      const costUSD = totalCostBNB * bnbPrice;

      console.log(`\n💵 PREÇO ATUAL BNB: $${bnbPrice.toFixed(2)} USD`);
      console.log(`\n💰 CUSTO TOTAL EM USD: $${costUSD.toFixed(2)} USD`);

      // Com margem de segurança
      const withBuffer = totalCostBNB * 1.3; // +30% buffer
      const withBufferUSD = withBuffer * bnbPrice;

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('\n🎯 RECOMENDAÇÃO:\n');
      console.log(`Custo estimado: ${totalCostBNB.toFixed(4)} BNB ($${costUSD.toFixed(2)})`);
      console.log(`+ Buffer 30%:   ${(withBuffer - totalCostBNB).toFixed(4)} BNB ($${(withBufferUSD - costUSD).toFixed(2)})`);
      console.log(`─────────────────────────────────────────────────────────`);
      console.log(`TOTAL SEGURO:   ${withBuffer.toFixed(4)} BNB ($${withBufferUSD.toFixed(2)})`);

      console.log('\n⚠️  VOCÊ TEM ATUALMENTE: 0.113 BNB (~$56 USD)');
      console.log(`⚠️  FALTAM: ${(withBuffer - 0.113).toFixed(4)} BNB (~$${((withBuffer - 0.113) * bnbPrice).toFixed(2)} USD)`);

      console.log('\n═══════════════════════════════════════════════════════════\n');

      // Testnet
      console.log('💡 ALTERNATIVA: DEPLOY EM TESTNET\n');
      console.log('Custo: $0.00 USD (GRÁTIS)');
      console.log('BNB necessário: 0 (usa BNB fake do faucet)');
      console.log('Tempo: 20-30 minutos');
      console.log('Resultado: Idêntico à mainnet (pode testar tudo)');
      console.log('\n═══════════════════════════════════════════════════════════\n');

    } catch (e) {
      console.log('\n❌ Erro ao buscar preço do BNB:', e.message);
      console.log(`\nCusto estimado: ${totalCostBNB.toFixed(6)} BNB`);
      console.log(`(~$${(totalCostBNB * 500).toFixed(2)} USD, assumindo BNB = $500)`);
    }
  });
}).on('error', (e) => {
  console.log('\n❌ Erro de conexão:', e.message);
  console.log(`\nCusto estimado: ${totalCostBNB.toFixed(6)} BNB`);
  console.log(`(~$${(totalCostBNB * 500).toFixed(2)} USD, assumindo BNB = $500)`);
});
