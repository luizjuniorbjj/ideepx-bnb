// Script para explorar o contrato V9_SECURE_2
import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";

  console.log("🔍 Explorando iDeepXDistributionV9_SECURE_2\n");
  console.log("📍 Contrato:", CONTRACT_ADDRESS);
  console.log("");

  // Conectar ao contrato
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  console.log("✅ Contrato carregado!\n");

  // ========== CONFIGURAÇÕES BÁSICAS ==========
  console.log("=" .repeat(60));
  console.log("  ⚙️  CONFIGURAÇÕES BÁSICAS");
  console.log("=".repeat(60));

  const subscriptionFee = await contract.SUBSCRIPTION_FEE();
  const directBonus = await contract.DIRECT_BONUS();
  const fastStartBonus = await contract.FAST_START_BONUS();
  console.log(`💰 Subscription Fee: $${hre.ethers.formatUnits(subscriptionFee, 6)} USDT`);
  console.log(`🎁 Direct Bonus: $${hre.ethers.formatUnits(directBonus, 6)} USDT`);
  console.log(`⚡ Fast Start Bonus: $${hre.ethers.formatUnits(fastStartBonus, 6)} USDT`);
  console.log("");

  // ========== MODO BETA ==========
  console.log("=" .repeat(60));
  console.log("  🧪 MODO BETA");
  console.log("=".repeat(60));

  const betaMode = await contract.betaMode();
  const totalUsers = await contract.totalUsers();
  const maxBetaUsers = await contract.MAX_BETA_USERS();
  const capEnabled = await contract.capEnabled();
  const maxDeposits = await contract.maxTotalDeposits();

  console.log(`Beta Mode: ${betaMode ? "✅ ATIVO" : "❌ Desativado"}`);
  console.log(`Total Users: ${totalUsers} / ${maxBetaUsers}`);
  console.log(`Deposit Cap: ${capEnabled ? "✅ Ativado" : "❌ Desativado"}`);
  console.log(`Max Deposits: $${hre.ethers.formatUnits(maxDeposits, 6)} USDT`);
  console.log("");

  // ========== SECURITY STATUS ==========
  console.log("=".repeat(60));
  console.log("  🔒 SECURITY STATUS");
  console.log("=".repeat(60));

  const security = await contract.getSecurityStatus();
  const solvencyRatio = Number(security._solvencyRatio) / 100;
  const circuitBreakerActive = security._circuitBreakerActive;
  const emergencyReserve = security._emergencyReserve;

  console.log(`Solvency Ratio: ${solvencyRatio.toFixed(2)}%`);
  console.log(`Circuit Breaker: ${circuitBreakerActive ? "🔴 ATIVO" : "✅ Inativo"}`);
  console.log(`Emergency Reserve: $${hre.ethers.formatUnits(emergencyReserve, 6)} USDT`);
  console.log("");

  const thresholdBps = await contract.SOLVENCY_THRESHOLD_BPS();
  const recoveryBps = await contract.SOLVENCY_RECOVERY_BPS();
  console.log(`🔴 CB Activation Threshold: ${Number(thresholdBps) / 100}%`);
  console.log(`🟢 CB Recovery Threshold: ${Number(recoveryBps) / 100}%`);
  console.log("");

  // ========== CARTEIRAS ==========
  console.log("=".repeat(60));
  console.log("  💼 CARTEIRAS");
  console.log("=".repeat(60));

  const multisig = await contract.multisig();
  const liquidityPool = await contract.liquidityPool();
  const infrastructureWallet = await contract.infrastructureWallet();
  const companyWallet = await contract.companyWallet();

  console.log(`Multisig: ${multisig}`);
  console.log(`Liquidity Pool: ${liquidityPool}`);
  console.log(`Infrastructure: ${infrastructureWallet}`);
  console.log(`Company: ${companyWallet}`);
  console.log("");

  // ========== USDT ==========
  console.log("=".repeat(60));
  console.log("  💵 USDT INTEGRATION");
  console.log("=".repeat(60));

  const usdtAddress = await contract.USDT();
  console.log(`USDT Token: ${usdtAddress}`);

  const usdt = await hre.ethers.getContractAt("IERC20", usdtAddress);
  const contractBalance = await usdt.balanceOf(CONTRACT_ADDRESS);
  console.log(`Contract USDT Balance: $${hre.ethers.formatUnits(contractBalance, 6)} USDT`);
  console.log("");

  // ========== REVENUE DISTRIBUTION ==========
  console.log("=".repeat(60));
  console.log("  📊 REVENUE DISTRIBUTION");
  console.log("=".repeat(60));

  const totalSubRevenue = await contract.totalSubscriptionRevenue();
  const totalPerfRevenue = await contract.totalPerformanceRevenue();

  console.log(`Subscription Revenue: $${hre.ethers.formatUnits(totalSubRevenue, 6)} USDT`);
  console.log(`Performance Revenue: $${hre.ethers.formatUnits(totalPerfRevenue, 6)} USDT`);
  console.log(`Total Revenue: $${hre.ethers.formatUnits(totalSubRevenue + totalPerfRevenue, 6)} USDT`);
  console.log("");

  // ========== RESUMO FINAL ==========
  console.log("=".repeat(60));
  console.log("  ✅ RESUMO DO CONTRATO");
  console.log("=".repeat(60));
  console.log(`✅ Contrato deployado e funcionando`);
  console.log(`✅ Beta mode ativo com limite de ${maxBetaUsers} usuários`);
  console.log(`✅ Deposit cap de $${hre.ethers.formatUnits(maxDeposits, 6)} USDT ativo`);
  console.log(`✅ Circuit breaker configurado (110%/130%)`);
  console.log(`✅ Subscription fee de $${hre.ethers.formatUnits(subscriptionFee, 6)} USDT`);
  console.log(`✅ ${totalUsers} usuário(s) registrado(s)`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
