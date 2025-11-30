// ✅ Script para enviar BNB do Admin para o Pioneer
// Quantidade: 0.05 BNB (suficiente para várias transações)

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("💰 Enviando BNB para o Pioneer...\n");

  // Endereços
  const ADMIN_PRIVATE_KEY = "0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03";
  const PIONEER_ADDRESS = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

  // Conectar ao Admin wallet
  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

  console.log(`👨‍💼 Admin: ${adminWallet.address}`);
  console.log(`👤 Pioneer: ${PIONEER_ADDRESS}`);

  // Verificar balances
  const adminBalance = await provider.getBalance(adminWallet.address);
  const pioneerBalance = await provider.getBalance(PIONEER_ADDRESS);

  console.log(`\n📊 Balances ANTES:`);
  console.log(`   Admin BNB: ${ethers.formatEther(adminBalance)} BNB`);
  console.log(`   Pioneer BNB: ${ethers.formatEther(pioneerBalance)} BNB`);

  if (adminBalance < ethers.parseEther("0.05")) {
    console.log("\n❌ Admin não tem BNB suficiente!");
    console.log("Pegue tBNB no faucet: https://testnet.bnbchain.org/faucet-smart");
    return;
  }

  // Enviar 0.05 BNB para o Pioneer
  const amount = ethers.parseEther("0.05");
  console.log(`\n💸 Enviando ${ethers.formatEther(amount)} BNB para Pioneer...`);

  const tx = await adminWallet.sendTransaction({
    to: PIONEER_ADDRESS,
    value: amount
  });

  console.log(`   Tx Hash: ${tx.hash}`);
  await tx.wait();
  console.log("   ✅ Transferência confirmada!");

  // Verificar novos balances
  const newAdminBalance = await provider.getBalance(adminWallet.address);
  const newPioneerBalance = await provider.getBalance(PIONEER_ADDRESS);

  console.log(`\n📊 Balances DEPOIS:`);
  console.log(`   Admin BNB: ${ethers.formatEther(newAdminBalance)} BNB`);
  console.log(`   Pioneer BNB: ${ethers.formatEther(newPioneerBalance)} BNB ✅`);

  console.log("\n✅ PIONEER AGORA TEM BNB PARA GAS! 🎉");
  console.log("\nPróximo passo: npx hardhat run scripts/activate-pioneer-lai.js --network bscTestnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
