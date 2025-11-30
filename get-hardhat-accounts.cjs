const { ethers } = require('ethers');

const mnemonic = "test test test test test test test test test test test junk";

console.log('🔑 CONTAS HARDHAT PADRÃO:\n');

for (let i = 0; i < 20; i++) {
  const path = `m/44'/60'/0'/0/${i}`;
  const wallet = ethers.Wallet.fromPhrase(mnemonic, path);

  console.log(`Conta #${i}:`);
  console.log(`  Endereço: ${wallet.address}`);
  console.log(`  Chave Privada: ${wallet.privateKey}`);
  console.log('');

  // Se encontrou a carteira procurada
  if (wallet.address.toLowerCase() === '0x75d1a8ac59003088c60a20bde8953cbecfe41669'.toLowerCase()) {
    console.log('✅ ENCONTRADA! Esta é a conta procurada!\n');
  }
}
