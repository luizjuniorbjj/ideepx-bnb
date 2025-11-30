/**
 * 🚀 DEPLOY LOCAL - Hardhat Network
 *
 * Deploy completo no Hardhat local com:
 * - Mock USDT (6 decimais, 1M supply)
 * - Contrato principal iDeepXDistributionV9_SECURE_4 (com correções críticas)
 * - Mint USDT para master account
 * - Setup completo para testes
 */

import hre from "hardhat";

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 DEPLOYING V9_SECURE_4 TO HARDHAT LOCAL NETWORK");
  console.log("🛡️  WITH 12 CRITICAL SECURITY FIXES APPLIED");
  console.log("=".repeat(60) + "\n");

  const [deployer, account1, account2, account3] = await hre.ethers.getSigners();

  console.log("📋 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB\n");

  // ========================================
  // 1. DEPLOY MOCK USDT
  // ========================================
  console.log("📦 Step 1/3: Deploying Mock USDT...");

  const MockUSDT = await hre.ethers.getContractFactory("MockERC20");

  // Constructor: name, symbol, initialSupply
  // USDT tem 6 decimais, então 1M USDT = 1M * 10^6
  const initialSupply = hre.ethers.parseUnits("1000000", 6); // 1M USDT

  const usdt = await MockUSDT.deploy("Mock USDT", "USDT", initialSupply);
  await usdt.waitForDeployment();

  const usdtAddress = await usdt.getAddress();
  console.log("   ✅ Mock USDT deployed to:", usdtAddress);
  console.log("   💵 Initial supply:", hre.ethers.formatUnits(initialSupply, 6), "USDT\n");

  // ========================================
  // 2. DEPLOY TIMELOCK GOVERNANCE LIBRARY
  // ========================================
  console.log("📦 Step 2/4: Deploying TimelockGovernance library...");

  const TimelockGovernance = await hre.ethers.getContractFactory("TimelockGovernance");
  const timelockLib = await TimelockGovernance.deploy();
  await timelockLib.waitForDeployment();

  const timelockLibAddress = await timelockLib.getAddress();
  console.log("   ✅ TimelockGovernance library deployed to:", timelockLibAddress + "\n");

  // ========================================
  // 3. DEPLOY CONTRATO PRINCIPAL (COM LINK)
  // ========================================
  console.log("📦 Step 3/4: Deploying iDeepXDistributionV9_SECURE_4 (CRITICAL FIXES)...");

  const Contract = await hre.ethers.getContractFactory("iDeepXDistributionV9_SECURE_4", {
    libraries: {
      TimelockGovernance: timelockLibAddress
    }
  });

  // Constructor params:
  // address _usdtAddress,
  // address _multisig,
  // address _liquidityPool,
  // address _infrastructureWallet,
  // address _companyWallet
  const contract = await Contract.deploy(
    usdtAddress,
    deployer.address,    // multisig = deployer (para testes)
    account1.address,    // liquidityPool
    account2.address,    // infrastructureWallet
    account3.address     // companyWallet
  );

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("   ✅ Contract deployed to:", contractAddress);
  console.log("   👤 Multisig:", deployer.address);
  console.log("   💧 Liquidity Pool:", account1.address);
  console.log("   🏗️  Infrastructure:", account2.address);
  console.log("   🏢 Company:", account3.address + "\n");

  // ========================================
  // 4. MINT USDT PARA MASTER E APPROVE
  // ========================================
  console.log("📦 Step 4/4: Setting up master account...");

  // Mint USDT adicional para master (para distribuir nos testes)
  const masterUsdtAmount = hre.ethers.parseUnits("500000", 6); // 500k USDT
  await usdt.mint(deployer.address, masterUsdtAmount);
  console.log("   ✅ Minted", hre.ethers.formatUnits(masterUsdtAmount, 6), "USDT to master");

  // Approve contrato para gastar USDT do master
  const approveAmount = hre.ethers.parseUnits("1000000", 6); // 1M USDT
  await usdt.approve(contractAddress, approveAmount);
  console.log("   ✅ Approved", hre.ethers.formatUnits(approveAmount, 6), "USDT for contract\n");

  // ========================================
  // 4. VERIFICAR ESTADO INICIAL
  // ========================================
  console.log("📊 Verifying initial state...");

  const masterUsdtBalance = await usdt.balanceOf(deployer.address);
  const systemStats = await contract.getSystemStats();
  const betaMode = await contract.betaMode();
  const maxDeposits = await contract.maxTotalDeposits();

  console.log("   💵 Master USDT balance:", hre.ethers.formatUnits(masterUsdtBalance, 6), "USDT");
  console.log("   👥 Total users:", systemStats[0].toString());
  console.log("   📊 Beta mode:", betaMode);
  console.log("   💰 Max deposits:", hre.ethers.formatUnits(maxDeposits, 6), "USDT\n");

  // ========================================
  // 5. SALVAR ENDEREÇOS PARA .ENV
  // ========================================
  console.log("=".repeat(60));
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60) + "\n");

  console.log("📝 Copy these addresses to your .env.local:\n");
  console.log("# ========================================");
  console.log("# HARDHAT LOCAL CONFIGURATION");
  console.log("# ========================================");
  console.log("");
  console.log("# Network");
  console.log("LOCAL_RPC_URL=http://127.0.0.1:8545");
  console.log("LOCAL_CHAIN_ID=31337");
  console.log("");
  console.log("# Contracts");
  console.log(`LOCAL_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`LOCAL_USDT_ADDRESS=${usdtAddress}`);
  console.log("");
  console.log("# Master Account (10,000 BNB + 500k USDT)");
  console.log(`LOCAL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
  console.log(`LOCAL_MASTER_ADDRESS=${deployer.address}`);
  console.log("");
  console.log("# Wallet addresses");
  console.log(`LOCAL_LIQUIDITY_POOL=${account1.address}`);
  console.log(`LOCAL_INFRASTRUCTURE_WALLET=${account2.address}`);
  console.log(`LOCAL_COMPANY_WALLET=${account3.address}`);
  console.log("");
  console.log("# ========================================\n");

  // ========================================
  // 6. SALVAR EM ARQUIVO
  // ========================================
  const fs = await import('fs');
  const deploymentInfo = {
    network: "hardhat-local",
    timestamp: new Date().toISOString(),
    contracts: {
      usdt: usdtAddress,
      distribution: contractAddress
    },
    accounts: {
      master: deployer.address,
      liquidityPool: account1.address,
      infrastructure: account2.address,
      company: account3.address
    },
    config: {
      chainId: 31337,
      rpcUrl: "http://127.0.0.1:8545"
    }
  };

  fs.writeFileSync(
    'deployment-local.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to: deployment-local.json\n");

  console.log("🎉 READY TO TEST!");
  console.log("   Run your bot: python intelligent_test_bot_fixed.py\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERROR DURING DEPLOYMENT:\n", error);
    process.exit(1);
  });
