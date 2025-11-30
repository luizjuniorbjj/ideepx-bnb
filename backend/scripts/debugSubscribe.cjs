const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0xd1Ee3Dec38b2Adeaa3F724c9DCAc4E84B6e327C2';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

async function main() {
  console.log('🔍 DEBUG: selfSubscribe\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);

  // Criar wallet de teste
  const w = ethers.Wallet.createRandom();
  const u = new ethers.Wallet(w.privateKey, provider);

  console.log('Admin:', admin.address);
  console.log('User:', w.address);
  console.log();

  // Contratos
  const usdt = new ethers.Contract(USDT_ADDRESS, [
    "function decimals() view returns(uint8)",
    "function transfer(address,uint256) returns(bool)",
    "function approve(address,uint256) returns(bool)",
    "function balanceOf(address) view returns(uint256)",
    "function allowance(address,address) view returns(uint256)"
  ], admin);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, [
    "function selfRegister(address)",
    "function selfSubscribe()",
    "function users(address) view returns(address,address,bool,bool,uint256,uint256,uint256,uint256,uint256)",
    "function SUBSCRIPTION_FEE() view returns(uint256)",
    "function companyWallet() view returns(address)"
  ], u);

  // 1. Verificar USDT decimals
  const decimals = await usdt.decimals();
  console.log('1. USDT decimals:', decimals.toString());

  // 2. Verificar SUBSCRIPTION_FEE no contrato
  const subFee = await contract.SUBSCRIPTION_FEE();
  console.log('2. SUBSCRIPTION_FEE:', ethers.formatUnits(subFee, decimals), 'USDT');
  console.log('   Raw value:', subFee.toString());

  // 3. Verificar companyWallet
  const companyWallet = await contract.companyWallet();
  console.log('3. companyWallet:', companyWallet);
  console.log();

  // 4. Enviar BNB
  console.log('4. Enviando BNB...');
  await (await admin.sendTransaction({to:w.address,value:ethers.parseEther('0.01')})).wait();
  console.log('   ✅ BNB enviado');

  // 5. Enviar USDT
  console.log('5. Enviando USDT...');
  await (await usdt.transfer(w.address, ethers.parseUnits('29', decimals))).wait();
  const bal = await usdt.balanceOf(w.address);
  console.log('   ✅ USDT enviado');
  console.log('   Balance:', ethers.formatUnits(bal, decimals), 'USDT');

  // 6. Registrar
  console.log('6. Registrando usuário...');
  const c = new ethers.Contract(CONTRACT_ADDRESS, [
    "function selfRegister(address)",
    "function selfSubscribe()"
  ], u);
  await (await c.selfRegister(admin.address)).wait();
  console.log('   ✅ Registrado');

  // 7. Verificar se está registrado
  const userInfo = await contract.users(w.address);
  console.log('7. User info:');
  console.log('   wallet:', userInfo[0]);
  console.log('   sponsor:', userInfo[1]);
  console.log('   isRegistered:', userInfo[2]);
  console.log('   subscriptionActive:', userInfo[3]);

  // 8. Aprovar USDT
  console.log('8. Aprovando USDT...');
  const u2 = new ethers.Contract(USDT_ADDRESS, ["function approve(address,uint256) returns(bool)"], u);
  await (await u2.approve(CONTRACT_ADDRESS, subFee)).wait();
  console.log('   ✅ USDT aprovado');

  // 9. Verificar allowance
  const allowance = await usdt.allowance(w.address, CONTRACT_ADDRESS);
  console.log('9. Allowance:', ethers.formatUnits(allowance, decimals), 'USDT');
  console.log('   Sufficient?', allowance >= subFee);

  // 10. Tentar selfSubscribe
  console.log('10. Tentando selfSubscribe...');
  try {
    const tx = await c.selfSubscribe();
    console.log('   TX enviada:', tx.hash);
    await tx.wait();
    console.log('   ✅ SUCESSO!');
  } catch (error) {
    console.log('   ❌ ERRO:', error.message);
    console.log();

    // Tentar com mais detalhes
    console.log('Debug adicional:');
    console.log('- User balance:', ethers.formatUnits(bal, decimals), 'USDT');
    console.log('- Allowance:', ethers.formatUnits(allowance, decimals), 'USDT');
    console.log('- Required:', ethers.formatUnits(subFee, decimals), 'USDT');
    console.log('- isRegistered:', userInfo[2]);
    console.log('- subscriptionActive:', userInfo[3]);
  }
}

main().catch(console.error);
