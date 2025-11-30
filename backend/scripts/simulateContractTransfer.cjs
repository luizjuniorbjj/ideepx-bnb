const { ethers } = require('ethers');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0xd1Ee3Dec38b2Adeaa3F724c9DCAc4E84B6e327C2';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

async function main() {
  console.log('🧪 SIMULANDO TRANSFERFROM DO CONTRATO\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const admin = new ethers.Wallet(PRIVATE_KEY, provider);

  // Criar wallet de teste
  const w = ethers.Wallet.createRandom();
  const u = new ethers.Wallet(w.privateKey, provider);

  console.log('Admin:', admin.address);
  console.log('User:', w.address);
  console.log('Contract:', CONTRACT_ADDRESS);
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

  // 2. Enviar USDT
  console.log('2. Enviando USDT...');
  await (await usdt.transfer(w.address, amount)).wait();
  console.log('   Balance:', ethers.formatUnits(await usdt.balanceOf(w.address), decimals), 'USDT');

  // 3. User aprova CONTRATO (NÃO o admin)
  console.log('3. User aprova CONTRATO...');
  const userUsdt = new ethers.Contract(USDT_ADDRESS, [
    "function approve(address,uint256) returns(bool)"
  ], u);
  await (await userUsdt.approve(CONTRACT_ADDRESS, amount)).wait();

  const allowance = await usdt.allowance(w.address, CONTRACT_ADDRESS);
  console.log('   Allowance (user → contract):', ethers.formatUnits(allowance, decimals), 'USDT');

  // 4. Agora vamos SIMULAR o que o contrato faz:
  //    O contrato chama: USDT.transferFrom(msg.sender, companyWallet, SUBSCRIPTION_FEE)
  //
  //    Mas como o contrato não tem permissão, vamos usar um contrato mock
  console.log('4. Criando contrato mock para simular...');

  // Deploy um contrato simples que chama transferFrom
  const mockCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract MockTransfer {
    function doTransfer(address token, address from, address to, uint256 amount) external returns (bool) {
        return IERC20(token).transferFrom(from, to, amount);
    }
}
`;

  console.log('Mock Solidity code:\n', mockCode);
  console.log();
  console.log('⚠️  Preciso compilar esse contrato...');
  console.log('Mas vou tentar um approach diferente!');
  console.log();

  // Melhor: vamos ver se o problema é que o contrato precisa ter allowance!
  console.log('5. Verificando allowance do contrato...');

  // O contrato chama transferFrom(user, company, amount)
  // Para isso funcionar, o user precisa ter dado approve para o CONTRATO
  // Que já fizemos!

  console.log('   User balance:', ethers.formatUnits(await usdt.balanceOf(w.address), decimals));
  console.log('   Company wallet:', admin.address);
  console.log('   Allowance (user → contract):', ethers.formatUnits(allowance, decimals));
  console.log();

  console.log('✅ Tudo parece OK! O problema deve estar no contrato...');
  console.log();
  console.log('Vou verificar se o USDT token no testnet é compatível com ERC20 padrão:');

  // Tentar ler o código do USDT
  const code = await provider.getCode(USDT_ADDRESS);
  console.log('USDT bytecode size:', code.length, 'bytes');

  if (code === '0x' || code.length < 100) {
    console.log('⚠️  USDT parece não estar deployed!');
  } else {
    console.log('✅ USDT está deployed');
  }
}

main().catch(console.error);
