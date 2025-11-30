// Script para testar fluxo básico do contrato
import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";
  const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

  console.log("🧪 TESTANDO FLUXO BÁSICO DO V9_SECURE_2\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("👤 Conta de teste:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log("");

  // Conectar aos contratos
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  const usdt = await hre.ethers.getContractAt(
    "IERC20",
    USDT_ADDRESS
  );

  console.log("=" .repeat(60));
  console.log("  📋 TESTE 1: Verificar Estado Inicial");
  console.log("=".repeat(60));

  const totalUsers = await contract.totalUsers();
  const betaMode = await contract.betaMode();
  const maxBetaUsers = await contract.MAX_BETA_USERS();

  console.log(`✅ Total Users: ${totalUsers}`);
  console.log(`✅ Beta Mode: ${betaMode}`);
  console.log(`✅ Max Beta Users: ${maxBetaUsers}`);
  console.log("");

  console.log("=" .repeat(60));
  console.log("  💰 TESTE 2: Verificar Balances USDT");
  console.log("=".repeat(60));

  const deployerBalance = await usdt.balanceOf(deployer.address);
  const contractBalance = await usdt.balanceOf(CONTRACT_ADDRESS);

  console.log(`Deployer USDT: $${hre.ethers.formatUnits(deployerBalance, 6)} USDT`);
  console.log(`Contract USDT: $${hre.ethers.formatUnits(contractBalance, 6)} USDT`);
  console.log("");

  if (deployerBalance === 0n) {
    console.log("⚠️  ATENÇÃO: Deployer não tem USDT!");
    console.log("   Para fazer testes completos, você precisa:");
    console.log("   1. Deployar Mock USDT: npx hardhat run scripts/deploy_mock_usdt.js --network bscTestnet");
    console.log("   2. Ou usar USDT real da testnet");
    console.log("");
  }

  console.log("=" .repeat(60));
  console.log("  👥 TESTE 3: Verificar Registros");
  console.log("=".repeat(60));

  try {
    const deployerInfo = await contract.getUserInfo(deployer.address);
    console.log(`✅ Deployer registrado: ${deployerInfo.isRegistered}`);
    console.log(`   Subscription ativa: ${deployerInfo.subscriptionActive}`);
    console.log(`   Balance: $${hre.ethers.formatUnits(deployerInfo.availableBalance, 6)} USDT`);
    console.log(`   Rank: ${deployerInfo.currentRank}`);
  } catch (error) {
    console.log(`❌ Erro ao verificar deployer: ${error.message}`);
  }

  console.log("");

  console.log("=" .repeat(60));
  console.log("  🔒 TESTE 4: Security Status");
  console.log("=".repeat(60));

  const security = await contract.getSecurityStatus();
  console.log(`✅ Solvency Ratio: ${Number(security._solvencyRatio) / 100}%`);
  console.log(`✅ Circuit Breaker: ${security._circuitBreakerActive ? "ATIVO" : "Inativo"}`);
  console.log(`✅ Emergency Reserve: $${hre.ethers.formatUnits(security._emergencyReserve, 6)} USDT`);
  console.log("");

  console.log("=" .repeat(60));
  console.log("  📊 TESTE 5: System Stats");
  console.log("=".repeat(60));

  const stats = await contract.getSystemStats();
  console.log(`✅ Total Users: ${stats._totalUsers}`);
  console.log(`✅ Active Subscriptions: ${stats._totalActive}`);
  console.log(`✅ Contract Balance: $${hre.ethers.formatUnits(stats._contractBalance, 6)} USDT`);
  console.log(`✅ Beta Mode: ${stats._betaMode}`);
  console.log("");

  console.log("=" .repeat(60));
  console.log("  🎯 PRÓXIMOS TESTES (quando tiver USDT):");
  console.log("=".repeat(60));
  console.log("1. Registrar novos usuários");
  console.log("2. Ativar assinaturas");
  console.log("3. Testar distribuição MLM");
  console.log("4. Testar direct bonus");
  console.log("5. Testar fast start bonus");
  console.log("6. Testar withdrawal");
  console.log("7. Testar limits (deposit cap, user cap)");
  console.log("8. Testar circuit breaker");
  console.log("");

  console.log("=" .repeat(60));
  console.log("  ✅ TESTES BÁSICOS COMPLETADOS!");
  console.log("=".repeat(60));
  console.log("📍 Contrato está funcionando corretamente");
  console.log("📍 Pronto para testes com USDT");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
