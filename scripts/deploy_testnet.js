import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("\n============================================================");
  console.log("🚀 DEPLOYING TO BSC TESTNET");
  console.log("🛡️  V9_SECURE_4 WITH 12 CRITICAL SECURITY FIXES");
  console.log("============================================================\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("📋 Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "BNB\n");

  // Endereços do .env
  const multisigAddress = process.env.MULTISIG_ADDRESS || deployer.address;
  const liquidityPool = process.env.LIQUIDITY_POOL || deployer.address;
  const infrastructureWallet = process.env.INFRASTRUCTURE_WALLET || deployer.address;
  const companyWallet = process.env.COMPANY_WALLET || deployer.address;

  // ========================================
  // 1. DEPLOY MOCK USDT
  // ========================================
  console.log("📦 Step 1/3: Deploying Mock USDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("   ✅ Mock USDT deployed to:", usdtAddress);

  const totalSupply = await usdt.totalSupply();
  console.log("   💵 Initial supply:", hre.ethers.formatUnits(totalSupply, 6), "USDT\n");

  // ========================================
  // 2. DEPLOY TIMELOCK GOVERNANCE LIBRARY
  // ========================================
  console.log("📦 Step 2/3: Deploying TimelockGovernance library...");
  const TimelockGovernance = await hre.ethers.getContractFactory("TimelockGovernance");
  const timelockLib = await TimelockGovernance.deploy();
  await timelockLib.waitForDeployment();
  const timelockLibAddress = await timelockLib.getAddress();
  console.log("   ✅ TimelockGovernance library deployed to:", timelockLibAddress + "\n");

  // ========================================
  // 3. DEPLOY MAIN CONTRACT
  // ========================================
  console.log("📦 Step 3/3: Deploying iDeepXDistributionV9_SECURE_4...");

  const Contract = await hre.ethers.getContractFactory("iDeepXDistributionV9_SECURE_4", {
    libraries: {
      TimelockGovernance: timelockLibAddress
    }
  });

  const contract = await Contract.deploy(
    usdtAddress,
    multisigAddress,
    liquidityPool,
    infrastructureWallet,
    companyWallet
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("   ✅ Contract deployed to:", contractAddress);
  console.log("   👤 Multisig:", multisigAddress);
  console.log("   💧 Liquidity Pool:", liquidityPool);
  console.log("   🏗️  Infrastructure:", infrastructureWallet);
  console.log("   🏢 Company:", companyWallet + "\n");

  // ========================================
  // 4. MINT USDT PARA DEPLOYER
  // ========================================
  console.log("💵 Minting USDT for testing...");
  const mintAmount = hre.ethers.parseUnits("100000", 6); // 100k USDT
  await usdt.mint(deployer.address, mintAmount);
  console.log("   ✅ Minted 100,000 USDT to deployer\n");

  // ========================================
  // SUMMARY
  // ========================================
  console.log("============================================================");
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("============================================================\n");

  console.log("📋 DEPLOYED ADDRESSES:");
  console.log("   🪙  USDT Mock:", usdtAddress);
  console.log("   📚 TimelockGovernance Library:", timelockLibAddress);
  console.log("   📜 iDeepXDistribution:", contractAddress);
  console.log("\n");

  console.log("👥 WALLETS:");
  console.log("   👤 Multisig (Owner):", multisigAddress);
  console.log("   💧 Liquidity Pool:", liquidityPool);
  console.log("   🏗️  Infrastructure:", infrastructureWallet);
  console.log("   🏢 Company:", companyWallet);
  console.log("\n");

  console.log("🔗 VERIFY ON BSCSCAN:");
  console.log(`   https://testnet.bscscan.com/address/${contractAddress}`);
  console.log("\n");

  // Save deployment info
  const fs = await import('fs');
  const deploymentInfo = {
    network: "bscTestnet",
    timestamp: new Date().toISOString(),
    contracts: {
      usdt: usdtAddress,
      timelockLibrary: timelockLibAddress,
      distribution: contractAddress
    },
    wallets: {
      multisig: multisigAddress,
      liquidityPool,
      infrastructure: infrastructureWallet,
      company: companyWallet
    },
    config: {
      chainId: 97,
      rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
    }
  };

  fs.writeFileSync(
    'deployment-testnet.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to: deployment-testnet.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERROR DURING DEPLOYMENT:\n", error);
    process.exit(1);
  });
