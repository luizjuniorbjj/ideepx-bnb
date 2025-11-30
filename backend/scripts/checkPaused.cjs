const { ethers } = require('ethers');

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0xd1Ee3Dec38b2Adeaa3F724c9DCAc4E84B6e327C2';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, [
    "function paused() view returns(bool)"
  ], provider);

  const isPaused = await contract.paused();

  console.log('Contrato pausado?', isPaused);

  if (isPaused) {
    console.log('⚠️  O contrato está PAUSADO! Precisa despausar antes de usar.');
  } else {
    console.log('✅ Contrato NÃO está pausado.');
  }
}

main().catch(console.error);
