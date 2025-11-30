const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0xd1Ee3Dec38b2Adeaa3F724c9DCAc4E84B6e327C2';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🧪 TESTANDO registerAndSubscribe\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);

  const usdt = new ethers.Contract(USDT_ADDRESS, [
    "function decimals() view returns(uint8)",
    "function transfer(address,uint256) returns(bool)",
    "function approve(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)"
  ], admin);

  const decimals = await usdt.decimals();
  console.log('USDT decimals:', decimals.toString());

  // registerAndSubscribe precisa de $29 (subscription) + $5 (direct bonus) = $34
  const totalAmount = ethers.parseUnits('34', decimals);
  console.log('Total needed: 34 USDT\n');

  for (let i = 0; i < 3; i++) {
    console.log(`[${i+1}/3]`);

    const w = ethers.Wallet.createRandom();
    const u = new ethers.Wallet(w.privateKey, provider);

    try {
      // 1. Enviar BNB
      await (await admin.sendTransaction({to:w.address,value:ethers.parseEther('0.01')})).wait();
      console.log('  ✅ BNB enviado');
      await sleep(1000);

      // 2. Enviar USDT (34 em vez de 29)
      await (await usdt.transfer(w.address, totalAmount)).wait();
      console.log('  ✅ USDT enviado');
      await sleep(1000);

      // 3. Aprovar USDT (34 em vez de 29)
      const u2 = new ethers.Contract(USDT_ADDRESS, ["function approve(address,uint256) returns(bool)"], u);
      await (await u2.approve(CONTRACT_ADDRESS, totalAmount)).wait();
      console.log('  ✅ USDT aprovado');
      await sleep(1000);

      // 4. Chamar registerAndSubscribe
      const c = new ethers.Contract(CONTRACT_ADDRESS, ["function registerAndSubscribe(address)"], u);
      const tx = await c.registerAndSubscribe(admin.address);
      await tx.wait();
      console.log(`  ✅ ${w.address}`);
      console.log();
      await sleep(2000);

    } catch (error) {
      console.log(`  ❌ ERRO: ${error.message.substring(0, 100)}`);
      console.log();
    }
  }

  console.log('✅ Teste concluído!');
}

main().catch(console.error);
