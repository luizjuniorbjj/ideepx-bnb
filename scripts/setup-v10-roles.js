import hre from "hardhat";

// ============================================================================
// 🔧 SETUP ROLES - iDeepXCoreV10
// ============================================================================
// Configura roles necessárias para operação

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

function log(message, color = COLORS.reset) {
  console.log(color + message + COLORS.reset);
}

const CONFIG = {
  contractV10: "0x0f26974B54adA5114d802dDDc14aD59C3998f8d3"
};

async function main() {
  console.log("\n" + "=".repeat(70));
  log("🔧 CONFIGURAR ROLES - iDeepXCoreV10", COLORS.bright + COLORS.cyan);
  console.log("=".repeat(70) + "\n");

  const [deployer] = await hre.ethers.getSigners();
  log(`👤 Admin: ${deployer.address}`, COLORS.cyan);

  const contract = await hre.ethers.getContractAt(
    "iDeepXCoreV10",
    CONFIG.contractV10
  );

  log(`✅ Contrato conectado: ${CONFIG.contractV10}\n`, COLORS.green);

  // Obter roles
  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const UPDATER_ROLE = await contract.UPDATER_ROLE();
  const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
  const TREASURY_ROLE = await contract.TREASURY_ROLE();

  log("📋 VERIFICANDO ROLES ATUAIS:", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  // Verificar roles atuais
  const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasUpdater = await contract.hasRole(UPDATER_ROLE, deployer.address);
  const hasDistributor = await contract.hasRole(DISTRIBUTOR_ROLE, deployer.address);
  const hasTreasury = await contract.hasRole(TREASURY_ROLE, deployer.address);

  log(`DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? '✅' : '❌'}`, hasDefaultAdmin ? COLORS.green : COLORS.red);
  log(`UPDATER_ROLE:       ${hasUpdater ? '✅' : '❌'}`, hasUpdater ? COLORS.green : COLORS.red);
  log(`DISTRIBUTOR_ROLE:   ${hasDistributor ? '✅' : '❌'}`, hasDistributor ? COLORS.green : COLORS.red);
  log(`TREASURY_ROLE:      ${hasTreasury ? '✅' : '❌'}`, hasTreasury ? COLORS.green : COLORS.red);

  if (!hasDefaultAdmin) {
    log("\n❌ ERRO: Você não é DEFAULT_ADMIN!", COLORS.red);
    log("Apenas o DEFAULT_ADMIN pode conceder roles.", COLORS.red);
    process.exit(1);
  }

  log("\n\n📋 CONCEDENDO ROLES:", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  // Conceder UPDATER_ROLE
  if (!hasUpdater) {
    log("🔧 Concedendo UPDATER_ROLE...", COLORS.cyan);
    const tx1 = await contract.grantRole(UPDATER_ROLE, deployer.address);
    await tx1.wait();
    log("✅ UPDATER_ROLE concedida!", COLORS.green);
  } else {
    log("✅ UPDATER_ROLE já concedida", COLORS.green);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // Conceder DISTRIBUTOR_ROLE
  if (!hasDistributor) {
    log("🔧 Concedendo DISTRIBUTOR_ROLE...", COLORS.cyan);
    const tx2 = await contract.grantRole(DISTRIBUTOR_ROLE, deployer.address);
    await tx2.wait();
    log("✅ DISTRIBUTOR_ROLE concedida!", COLORS.green);
  } else {
    log("✅ DISTRIBUTOR_ROLE já concedida", COLORS.green);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // Conceder TREASURY_ROLE
  if (!hasTreasury) {
    log("🔧 Concedendo TREASURY_ROLE...", COLORS.cyan);
    const tx3 = await contract.grantRole(TREASURY_ROLE, deployer.address);
    await tx3.wait();
    log("✅ TREASURY_ROLE concedida!", COLORS.green);
  } else {
    log("✅ TREASURY_ROLE já concedida", COLORS.green);
  }

  console.log("\n" + "=".repeat(70));
  log("✅ ROLES CONFIGURADAS COM SUCESSO!", COLORS.bright + COLORS.green);
  console.log("=".repeat(70));

  log("\n🎯 Próximo passo:", COLORS.bright + COLORS.yellow);
  log("   Execute: npx hardhat run scripts/populate-v10-from-json.js --network bscTestnet", COLORS.yellow);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO FATAL:\n", error);
    process.exit(1);
  });
