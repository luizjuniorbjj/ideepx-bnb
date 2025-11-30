const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy Modular Architecture:
 * 1. Core (user management, subscriptions, withdrawals)
 * 2. MLM (commissions, ranks, bonuses)
 * 3. Governance (security, circuit breaker, timelock)
 */
async function main() {
  console.log("🚀 Starting Modular Deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

  // Configuration
  const config = {
    usdt: process.env.USDT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet USDT
    multisig: process.env.MULTISIG_ADDRESS || deployer.address,
    liquidityPool: process.env.LIQUIDITY_POOL || deployer.address,
    infrastructureWallet: process.env.INFRASTRUCTURE_WALLET || deployer.address,
    companyWallet: process.env.COMPANY_WALLET || deployer.address,
  };

  console.log("⚙️  Configuration:");
  console.log("  USDT:", config.usdt);
  console.log("  Multisig:", config.multisig);
  console.log("  Liquidity Pool:", config.liquidityPool);
  console.log("  Infrastructure:", config.infrastructureWallet);
  console.log("  Company:", config.companyWallet);
  console.log("");

  // ========== STEP 1: Deploy Core ==========
  console.log("📦 [1/3] Deploying iDeepXCore...");
  const Core = await ethers.getContractFactory("iDeepXCore");
  const core = await Core.deploy(
    config.usdt,
    config.multisig,
    config.liquidityPool,
    config.infrastructureWallet,
    config.companyWallet
  );
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log("✅ Core deployed at:", coreAddress);

  // Check size
  const coreCode = await ethers.provider.getCode(coreAddress);
  const coreSize = (coreCode.length - 2) / 2; // -2 for "0x", /2 for hex
  console.log(`   Size: ${coreSize} bytes (${((coreSize / 24576) * 100).toFixed(1)}% of 24kb limit)`);
  if (coreSize > 24576) {
    console.warn("   ⚠️  WARNING: Core exceeds 24kb limit!");
  }
  console.log("");

  // ========== STEP 2: Deploy MLM ==========
  console.log("📦 [2/3] Deploying iDeepXMLM...");
  const MLM = await ethers.getContractFactory("iDeepXMLM");
  const mlm = await MLM.deploy(coreAddress, config.multisig);
  await mlm.waitForDeployment();
  const mlmAddress = await mlm.getAddress();
  console.log("✅ MLM deployed at:", mlmAddress);

  // Check size
  const mlmCode = await ethers.provider.getCode(mlmAddress);
  const mlmSize = (mlmCode.length - 2) / 2;
  console.log(`   Size: ${mlmSize} bytes (${((mlmSize / 24576) * 100).toFixed(1)}% of 24kb limit)`);
  if (mlmSize > 24576) {
    console.warn("   ⚠️  WARNING: MLM exceeds 24kb limit!");
  }
  console.log("");

  // ========== STEP 3: Deploy Library + Governance ==========
  console.log("📚 [3a/3] Deploying TimelockGovernance Library...");
  const TimelockLib = await ethers.getContractFactory("TimelockGovernance");
  const timelockLib = await TimelockLib.deploy();
  await timelockLib.waitForDeployment();
  const timelockLibAddress = await timelockLib.getAddress();
  console.log("✅ TimelockGovernance Library at:", timelockLibAddress);
  console.log("");

  console.log("📦 [3b/3] Deploying iDeepXGovernance (with library)...");
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
  if (governanceSize > 24576) {
    console.warn("   ⚠️  WARNING: Governance exceeds 24kb limit!");
  }
  console.log("");

  // ========== STEP 4: Connect Modules ==========
  console.log("🔗 [4/4] Connecting modules...");
  const tx = await core.setModules(mlmAddress, governanceAddress);
  await tx.wait();
  console.log("✅ Modules connected successfully\n");

  // ========== SUMMARY ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("  Core:       ", coreAddress);
  console.log("  MLM:        ", mlmAddress);
  console.log("  Governance: ", governanceAddress);
  console.log("");
  console.log("📏 Contract Sizes:");
  console.log(`  Core:       ${coreSize.toLocaleString()} bytes (${((coreSize / 24576) * 100).toFixed(1)}%)`);
  console.log(`  MLM:        ${mlmSize.toLocaleString()} bytes (${((mlmSize / 24576) * 100).toFixed(1)}%)`);
  console.log(`  Governance: ${governanceSize.toLocaleString()} bytes (${((governanceSize / 24576) * 100).toFixed(1)}%)`);
  console.log(`  Total:      ${(coreSize + mlmSize + governanceSize).toLocaleString()} bytes`);
  console.log("");

  // Size check
  const totalSize = coreSize + mlmSize + governanceSize;
  const originalSize = 26262; // V9_SECURE_4 size
  const savings = originalSize - totalSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

  if (coreSize <= 24576 && mlmSize <= 24576 && governanceSize <= 24576) {
    console.log("✅ All contracts are within 24kb limit!");
    console.log(`✅ Size reduction: ${savings} bytes (${savingsPercent}% saved)`);
  } else {
    console.log("⚠️  Some contracts exceed 24kb limit - enable optimizer!");
  }
  console.log("");

  // ========== SAVE DEPLOYMENT INFO ==========
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      core: {
        address: coreAddress,
        size: coreSize,
        percentOf24kb: ((coreSize / 24576) * 100).toFixed(1) + "%",
      },
      mlm: {
        address: mlmAddress,
        size: mlmSize,
        percentOf24kb: ((mlmSize / 24576) * 100).toFixed(1) + "%",
      },
      governance: {
        address: governanceAddress,
        size: governanceSize,
        percentOf24kb: ((governanceSize / 24576) * 100).toFixed(1) + "%",
      },
    },
    config: config,
    totalSize: totalSize,
    sizeReduction: {
      bytes: savings,
      percent: savingsPercent + "%",
    },
  };

  const deploymentPath = path.join(__dirname, "..", "deployment-modular.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment-modular.json\n");

  // ========== VERIFICATION COMMANDS ==========
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 Verification commands:");
    console.log("");
    console.log("npx hardhat verify --network", hre.network.name, coreAddress,
      config.usdt, config.multisig, config.liquidityPool, config.infrastructureWallet, config.companyWallet);
    console.log("");
    console.log("npx hardhat verify --network", hre.network.name, mlmAddress,
      coreAddress, config.multisig);
    console.log("");
    console.log("npx hardhat verify --network", hre.network.name, governanceAddress,
      config.usdt, coreAddress, config.multisig, config.liquidityPool, config.infrastructureWallet, config.companyWallet);
    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Frontend Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("Update your frontend .env.local:");
  console.log("");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${coreAddress}`);
  console.log(`NEXT_PUBLIC_USDT_ADDRESS=${config.usdt}`);
  console.log("");
  console.log("⚠️  Frontend only needs Core address!");
  console.log("    MLM and Governance are called internally by Core.");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
