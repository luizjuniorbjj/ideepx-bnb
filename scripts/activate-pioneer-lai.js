// ✅ Script para ativar LAI do Pioneer
// Custo: $19 USDT + gas

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🚀 Ativando LAI do Pioneer...\n");

  // Endereços
  const USDT_ADDRESS = "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc";
  const CONTRACT_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";
  const PIONEER_ADDRESS = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

  // Private key do Pioneer
  const PIONEER_PRIVATE_KEY = "0x54499b38fae729d771cbdb24e83a1212bea5bc47e7687a2785967f9f1098d3a5";

  // Conectar ao Pioneer wallet
  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
  const pioneerWallet = new ethers.Wallet(PIONEER_PRIVATE_KEY, provider);

  console.log(`👤 Pioneer Wallet: ${pioneerWallet.address}`);
  console.log(`💵 Pioneer BNB Balance: ${ethers.formatEther(await provider.getBalance(pioneerWallet.address))} BNB\n`);

  // Conectar aos contratos
  const MockUSDT = await ethers.getContractFactory("MockUSDTUnlimited");
  const usdt = MockUSDT.attach(USDT_ADDRESS).connect(pioneerWallet);

  const iDeepX = await ethers.getContractAt("iDeepXUnifiedSecure", CONTRACT_ADDRESS, pioneerWallet);

  // 1️⃣ Verificar balance USDT do Pioneer
  const pioneerBalance = await usdt.balanceOf(PIONEER_ADDRESS);
  console.log(`📊 Pioneer USDT Balance: $${ethers.formatUnits(pioneerBalance, 6)} USDT`);

  if (pioneerBalance < ethers.parseUnits("19", 6)) {
    console.log("❌ Pioneer não tem USDT suficiente para ativar LAI ($19)");
    return;
  }

  // 2️⃣ Verificar se já tem LAI ativo
  const userData = await iDeepX.getUserInfo(PIONEER_ADDRESS);
  console.log(`\n📋 Status Atual do Pioneer:`);
  console.log(`   Registrado: ${userData[2]}`);
  console.log(`   LAI Ativo: ${userData[3]}`);
  console.log(`   LAI Expiration: ${new Date(Number(userData[5]) * 1000).toLocaleString()}`);

  if (userData[3]) {
    console.log("\n✅ Pioneer já tem LAI ativo!");
    return;
  }

  // 3️⃣ Aprovar $19 USDT para o contrato
  console.log("\n🔐 Aprovando $19 USDT para o contrato...");
  const approveTx = await usdt.approve(
    CONTRACT_ADDRESS,
    ethers.parseUnits("19", 6)
  );
  console.log(`   Tx Hash: ${approveTx.hash}`);
  await approveTx.wait();
  console.log("   ✅ Aprovação confirmada!");

  // 4️⃣ Ativar LAI
  console.log("\n🎯 Ativando LAI do Pioneer...");
  const activateTx = await iDeepX.activateLAI();
  console.log(`   Tx Hash: ${activateTx.hash}`);
  await activateTx.wait();
  console.log("   ✅ LAI ativado com sucesso!");

  // 5️⃣ Verificar novo status
  const newUserData = await iDeepX.getUserInfo(PIONEER_ADDRESS);
  const newBalance = await usdt.balanceOf(PIONEER_ADDRESS);

  console.log("\n📊 RESULTADO:");
  console.log(`   LAI Ativo: ${newUserData[3]} ✅`);
  console.log(`   LAI Expiration: ${new Date(Number(newUserData[5]) * 1000).toLocaleString()}`);
  console.log(`   Novo Balance USDT: $${ethers.formatUnits(newBalance, 6)} USDT`);
  console.log(`   USDT Gasto: $19.00 ✅`);

  console.log("\n✅ PIONEER AGORA PODE RECEBER MLM! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
