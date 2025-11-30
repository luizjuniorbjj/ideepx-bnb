const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0x1E61B5c379fb583D341f2F1eDcEf4db9A3Be22a8';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);
  const usdt = new ethers.Contract(USDT_ADDRESS, ["function transfer(address,uint256) returns(bool)","function approve(address,uint256) returns(bool)"], admin);

  console.log('🚀 Teste: Criando 5 usuários\n');

  for (let i = 0; i < 5; i++) {
    console.log(`[${i+1}/5]`);
    const w = ethers.Wallet.createRandom();
    const u = new ethers.Wallet(w.privateKey, provider);

    await (await admin.sendTransaction({to:w.address,value:ethers.parseEther('0.01')})).wait();
    await sleep(1000);

    await (await usdt.transfer(w.address, ethers.parseUnits('29', 18))).wait();
    await sleep(1000);

    const c = new ethers.Contract(CONTRACT_ADDRESS, ["function selfRegister(address)","function selfSubscribe()"], u);
    await (await c.selfRegister(admin.address)).wait();
    await sleep(1000);

    const u2 = new ethers.Contract(USDT_ADDRESS, ["function approve(address,uint256) returns(bool)"], u);
    await (await u2.approve(CONTRACT_ADDRESS, ethers.parseUnits('29', 18))).wait();
    await sleep(1000);

    await (await c.selfSubscribe()).wait();
    console.log(`✅ ${w.address}\n`);
    await sleep(2000);
  }

  console.log('✅ 5 usuários criados!');
}

main().catch(console.error);
