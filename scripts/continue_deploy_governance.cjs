const hre = require("hardhat");
const fs = require("fs");

/**
 * Continue deployment - Deploy apenas Governance e configurar módulos
 * Core e MLM já foram deployados
 */
async function main() {
  console.log("🔄 Continuing Deployment - Governance + Configuration...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

  // Endereços já deployados
  const coreAddress = "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54";
  const mlmAddress = "0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da";

  console.log("✅ Core já deployado:", coreAddress);
  console.log("✅ MLM já deployado:", mlmAddress);
  console.log("");

  // Configuration
  const config = {
    usdt: process.env.USDT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955",
    multisig: process.env.MULTISIG_ADDRESS || deployer.address,
    liquidityPool: process.env.LIQUIDITY_POOL || deployer.address,
    infrastructureWallet: process.env.INFRASTRUCTURE_WALLET || deployer.address,
    companyWallet: process.env.COMPANY_WALLET || deployer.address,
  };

  // ========== STEP 1: Deploy Library ==========
  console.log("📚 [1/2] Deploying TimelockGovernance Library...");
  const TimelockLib = await ethers.getContractFactory("TimelockGovernance");
  const timelockLib = await TimelockLib.deploy();
  await timelockLib.waitForDeployment();
  const timelockLibAddress = await timelockLib.getAddress();
  console.log("✅ TimelockGovernance Library at:", timelockLibAddress);
  console.log("");

  // ========== STEP 2: Deploy Governance ==========
  console.log("📦 [2/2] Deploying iDeepXGovernance...");
  const Governance = await ethers.getContractFactory("iDeepXGovernance", {
    libraries: {
      TimelockGovernance: timelockLibAddress,
    },
  });
  const governance = await Governance.deploy(
    config.usdt,
    coreAddress,
    config.multisig,
    config.liquidityPool,
    config.infrastructureWallet,
    config.companyWallet
  );
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ Governance deployed at:", governanceAddress);

  // Check size
  const governanceCode = await ethers.provider.getCode(governanceAddress);
  const governanceSize = (governanceCode.length - 2) / 2;
  console.log(`   Size: ${governanceSize} bytes (${((governanceSize / 24576) * 100).toFixed(1)}% of 24kb limit)`);
  console.log("");

  // ========== STEP 3: Connect Modules ==========
  console.log("🔗 [3/4] Connecting modules...");

  // Get contracts
  const core = await ethers.getContractAt("iDeepXCore", coreAddress);
  const mlm = await ethers.getContractAt("iDeepXMLM", mlmAddress);

  // Set modules in Core
  console.log("   Setting modules in Core...");
  const tx1 = await core.setModules(mlmAddress, governanceAddress);
  await tx1.wait();
  console.log("   ✅ Modules set in Core");

  // Set core in MLM
  console.log("   Setting core in MLM...");
  const tx2 = await mlm.setCore(coreAddress);
  await tx2.wait();
  console.log("   ✅ Core set in MLM");

  // Set core in Governance
  console.log("   Setting core in Governance...");
  const tx3 = await governance.setCore(coreAddress);
  await tx3.wait();
  console.log("   ✅ Core set in Governance");
  console.log("");

  // ========== STEP 4: Save Addresses ==========
  console.log("💾 [4/4] Saving deployment addresses...");
  const deployment = {
    network: "bscMainnet",
    chainId: 56,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      core: coreAddress,
      mlm: mlmAddress,
      governance: governanceAddress,
      timelockLibrary: timelockLibAddress,
    },
    config: config,
    verification: {
      bscscan: `https://bscscan.com/address/${coreAddress}#code`,
      core: `npx hardhat verify --network bscMainnet ${coreAddress} "${config.usdt}" "${config.multisig}" "${config.liquidityPool}" "${config.infrastructureWallet}" "${config.companyWallet}"`,
      mlm: `npx hardhat verify --network bscMainnet ${mlmAddress} "${coreAddress}"`,
      governance: `npx hardhat verify --network bscMainnet ${governanceAddress} "${config.usdt}" "${coreAddress}" "${config.multisig}" "${config.liquidityPool}" "${config.infrastructureWallet}" "${config.companyWallet}" --libraries libraries.js`,
    },
  };

  const deploymentPath = `./deployments/mainnet_${Date.now()}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("✅ Deployment info saved to:", deploymentPath);
  console.log("");

  // ========== Summary ==========
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE! 🎉");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("📋 Contract Addresses:\n");
  console.log("   iDeepXCore:           ", coreAddress);
  console.log("   iDeepXMLM:            ", mlmAddress);
  console.log("   iDeepXGovernance:     ", governanceAddress);
  console.log("   TimelockGovernance:   ", timelockLibAddress);
  console.log("");
  console.log("🔗 BscScan URLs:\n");
  console.log("   Core:       https://bscscan.com/address/" + coreAddress);
  console.log("   MLM:        https://bscscan.com/address/" + mlmAddress);
  console.log("   Governance: https://bscscan.com/address/" + governanceAddress);
  console.log("");
  console.log("💰 Final Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");
  console.log("");
  console.log("✅ Next Steps:");
  console.log("   1. Verify contracts on BscScan (commands saved in deployment file)");
  console.log("   2. Update frontend config with addresses above");
  console.log("   3. Test on mainnet");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
