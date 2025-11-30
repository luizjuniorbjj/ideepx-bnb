const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';
const COMPANY_WALLET = '0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2';

async function main() {
  console.log('🧪 TESTANDO TRANSFERFROM DO USDT\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);

  // Criar wallet de teste
  const w = ethers.Wallet.createRandom();
  const u = new ethers.Wallet(w.privateKey, provider);

  console.log('Admin:', admin.address);
  console.log('User:', w.address);
  console.log('Company:', COMPANY_WALLET);
  console.log();

  const usdt = new ethers.Contract(USDT_ADDRESS, [
    "function decimals() view returns(uint8)",
    "function transfer(address,uint256) returns(bool)",
    "function approve(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)",
    "function allowance(address,address) view returns(uint256)",
    "function transferFrom(address,address,uint256) returns(bool)"
  ], admin);

  const decimals = await usdt.decimals();
  const amount = ethers.parseUnits('29', decimals);

  // 1. Enviar BNB
  console.log('1. Enviando BNB...');
  await (await admin.sendTransaction({to:w.address,value:ethers.parseEther('0.01')})).wait();
  console.log('   ✅ BNB enviado');

  // 2. Enviar USDT
  console.log('2. Enviando USDT...');
  await (await usdt.transfer(w.address, amount)).wait();
  const bal = await usdt.balanceOf(w.address);
  console.log('   ✅ USDT enviado');
  console.log('   Balance:', ethers.formatUnits(bal, decimals), 'USDT');

  // 3. Aprovar USDT para admin
  console.log('3. Aprovando USDT (user aprova para admin)...');
  const userUsdt = new ethers.Contract(USDT_ADDRESS, [
    "function approve(address,uint256) returns(bool)"
  ], u);
  await (await userUsdt.approve(admin.address, amount)).wait();
  console.log('   ✅ Aprovado');

  const allowance = await usdt.allowance(w.address, admin.address);
  console.log('   Allowance:', ethers.formatUnits(allowance, decimals), 'USDT');

  // 4. Tentar transferFrom (admin transfere de user para company)
  console.log('4. Tentando transferFrom (user → company)...');
  try {
    const tx = await usdt.transferFrom(w.address, COMPANY_WALLET, amount);
    console.log('   TX enviada:', tx.hash);
    await tx.wait();
    console.log('   ✅ SUCESSO!');

    // Verificar balances
    const userBal = await usdt.balanceOf(w.address);
    const companyBal = await usdt.balanceOf(COMPANY_WALLET);
    console.log();
    console.log('Balanços finais:');
    console.log('  User:', ethers.formatUnits(userBal, decimals), 'USDT');
    console.log('  Company:', ethers.formatUnits(companyBal, decimals), 'USDT');

  } catch (error) {
    console.log('   ❌ ERRO:', error.message);
  }
}

main().catch(console.error);
