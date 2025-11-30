const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';
const USDT_ADDRESS = '0x6B38Da364B41880fc20B8eF88E7045AC4AAd2cdA';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🚀 CRIANDO 40 USUÁRIOS MLM\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);

  const usdt = new ethers.Contract(USDT_ADDRESS, [
    "function decimals() view returns(uint8)",
    "function transfer(address,uint256) returns(bool)",
    "function approve(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)"
  ], admin);

  const decimals = await usdt.decimals();
  console.log('Admin:', admin.address);
  console.log('MockUSDT:', USDT_ADDRESS);
  console.log('MLM Contract:', CONTRACT_ADDRESS);
  console.log();

  const bnb = await provider.getBalance(admin.address);
  const usdtBal = await usdt.balanceOf(admin.address);
  console.log(`BNB: ${ethers.formatEther(bnb)}`);
  console.log(`USDT: ${ethers.formatUnits(usdtBal, decimals)}`);
  console.log();

  let successCount = 0;
  const wallets = [];

  for (let i = 0; i < 40; i++) {
    console.log(`[${i+1}/40]`);

    const w = ethers.Wallet.createRandom();
    const u = new ethers.Wallet(w.privateKey, provider);

    try {
      // BNB
      await (await admin.sendTransaction({to:w.address,value:ethers.parseEther('0.01')})).wait();
      await sleep(1000);

      // USDT
      await (await usdt.transfer(w.address, ethers.parseUnits('29', decimals))).wait();
      await sleep(1000);

      // Sponsor (primeiro usa admin, depois aleatório da rede)
      const sponsor = i === 0 ? admin.address : wallets[Math.floor(Math.random() * wallets.length)].address;

      // Registrar
      const c = new ethers.Contract(CONTRACT_ADDRESS, [
        "function selfRegister(address)",
        "function selfSubscribe()"
      ], u);
      await (await c.selfRegister(sponsor)).wait();
      await sleep(1000);

      // Aprovar
      const u2 = new ethers.Contract(USDT_ADDRESS, ["function approve(address,uint256) returns(bool)"], u);
      await (await u2.approve(CONTRACT_ADDRESS, ethers.parseUnits('29', decimals))).wait();
      await sleep(1000);

      // Assinar
      await (await c.selfSubscribe()).wait();
      console.log(`  ✅ ${w.address} (sponsor: ${sponsor.substring(0, 10)}...)`);
      console.log();

      wallets.push({ address: w.address, privateKey: w.privateKey });
      successCount++;
      await sleep(2000);

    } catch (error) {
      console.log(`  ❌ ERRO: ${error.message.substring(0, 100)}`);
      console.log();
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Criados: ${successCount}/40`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Salvar wallets
  const fs = require('fs');
  fs.writeFileSync(
    'created-wallets.json',
    JSON.stringify(wallets, null, 2)
  );
  console.log('📝 Wallets salvas em: created-wallets.json');
}

main().catch(console.error);
