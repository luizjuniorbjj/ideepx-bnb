// ✅ Script para Admin depositar Performance Fee
// Valor: $35,000 USDT (teste)
// Distribuição: 5% Liquidez, 12% Infra, 23% Empresa, 60% MLM Pool

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("💰 Admin depositando Performance Fee...\n");

  // Endereços
  const USDT_ADDRESS = "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc";
  const CONTRACT_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";
  const ADMIN_PRIVATE_KEY = "0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03";

  // Conectar ao Admin wallet
  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

  console.log(`👨‍💼 Admin Wallet: ${adminWallet.address}`);

  // Conectar aos contratos
  const MockUSDT = await ethers.getContractFactory("MockUSDTUnlimited");
  const usdt = MockUSDT.attach(USDT_ADDRESS).connect(adminWallet);

  const iDeepX = await ethers.getContractAt("iDeepXUnifiedSecure", CONTRACT_ADDRESS, adminWallet);

  // Valor a depositar: $35,000 USDT
  const amount = ethers.parseUnits("35000", 6);
  console.log(`💵 Valor a depositar: $${ethers.formatUnits(amount, 6)} USDT\n`);

  // 1️⃣ Verificar balance do Admin
  const adminBalance = await usdt.balanceOf(adminWallet.address);
  console.log(`📊 Admin USDT Balance: $${ethers.formatUnits(adminBalance, 6)} USDT`);

  if (adminBalance < amount) {
    console.log("❌ Admin não tem USDT suficiente!");
    return;
  }

  // 2️⃣ Verificar estado atual do contrato
  console.log("\n📋 Estado do Contrato ANTES:");
  try {
    const systemState = await iDeepX.getSystemState();
    console.log(`   Total Usuários: ${systemState[0]}`);
    console.log(`   Usuários Ativos (LAI): ${systemState[1]}`);
    console.log(`   Pool Liquidez: $${ethers.formatUnits(systemState[2], 6)}`);
    console.log(`   Infraestrutura: $${ethers.formatUnits(systemState[3], 6)}`);
    console.log(`   Empresa: $${ethers.formatUnits(systemState[4], 6)}`);
    console.log(`   MLM Locked: $${ethers.formatUnits(systemState[5], 6)}`);
    console.log(`   Total Depositado: $${ethers.formatUnits(systemState[7], 6)}`);
  } catch (e) {
    console.log("   ⚠️ Não foi possível obter stats:", e.message);
  }

  // 3️⃣ Aprovar USDT
  console.log("\n🔐 Aprovando $35,000 USDT para o contrato...");
  const approveTx = await usdt.approve(CONTRACT_ADDRESS, amount);
  console.log(`   Tx Hash: ${approveTx.hash}`);
  await approveTx.wait();
  console.log("   ✅ Aprovação confirmada!");

  // 4️⃣ Depositar Performance
  console.log("\n💸 Depositando Performance...");
  const proof = "TEST_DEPOSIT_WEEK_1"; // Proof obrigatório
  const depositTx = await iDeepX.depositWeeklyPerformance(amount, proof);
  console.log(`   Tx Hash: ${depositTx.hash}`);
  const receipt = await depositTx.wait();
  console.log("   ✅ Depósito confirmado!");

  // Buscar eventos
  if (receipt.logs && receipt.logs.length > 0) {
    console.log(`\n📜 Eventos emitidos: ${receipt.logs.length}`);
  }

  // 5️⃣ Verificar novo estado
  console.log("\n📊 Estado do Contrato DEPOIS:");
  try {
    const newSystemState = await iDeepX.getSystemState();
    console.log(`   Total Usuários: ${newSystemState[0]}`);
    console.log(`   Usuários Ativos (LAI): ${newSystemState[1]}`);
    console.log(`   Pool Liquidez: $${ethers.formatUnits(newSystemState[2], 6)} ✅`);
    console.log(`   Infraestrutura: $${ethers.formatUnits(newSystemState[3], 6)} ✅`);
    console.log(`   Empresa: $${ethers.formatUnits(newSystemState[4], 6)} ✅`);
    console.log(`   MLM Locked: $${ethers.formatUnits(newSystemState[5], 6)} ✅`);
    console.log(`   Total Depositado: $${ethers.formatUnits(newSystemState[7], 6)} ✅`);

    // Calcular distribuição esperada
    console.log("\n📊 DISTRIBUIÇÃO ESPERADA ($35,000):");
    console.log(`   Liquidez (5%): $${(35000 * 0.05).toFixed(2)}`);
    console.log(`   Infraestrutura (12%): $${(35000 * 0.12).toFixed(2)}`);
    console.log(`   Empresa (23%): $${(35000 * 0.23).toFixed(2)}`);
    console.log(`   MLM Pool (60%): $${(35000 * 0.60).toFixed(2)}`);
  } catch (e) {
    console.log("   ⚠️ Erro ao obter stats:", e.message);
  }

  // Verificar balance do Admin
  const newAdminBalance = await usdt.balanceOf(adminWallet.address);
  console.log(`\n💰 Admin Balance:`);
  console.log(`   ANTES: $${ethers.formatUnits(adminBalance, 6)} USDT`);
  console.log(`   DEPOIS: $${ethers.formatUnits(newAdminBalance, 6)} USDT`);
  console.log(`   DEPOSITADO: $35,000.00 ✅`);

  console.log("\n✅ PERFORMANCE FEE DEPOSITADA COM SUCESSO! 🎉");
  console.log("\nPróximo passo: Processar batch de distribuição MLM");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
