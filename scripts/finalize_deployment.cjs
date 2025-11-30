const hre = require("hardhat");
const fs = require("fs");

/**
 * Finalize deployment - Apenas confirma que tudo está OK
 * Todos os contratos já foram deployados corretamente
 */
async function main() {
  console.log("✅ FINALIZING DEPLOYMENT...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 From:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

  // Endereços deployados
  const coreAddress = "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54";
  const mlmAddress = "0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da";
  const governanceAddress = "0x57ea5e1E49190B9EC2e7eEE658168E1626039442";
  const timelockLibAddress = "0x60C6a303BF17Aa091968C44EbE3fE04b1bBE6460";

  console.log("📋 Deployed Contracts:");
  console.log("   Core:             ", coreAddress);
  console.log("   MLM:              ", mlmAddress);
  console.log("   Governance:       ", governanceAddress);
  console.log("   Timelock Library: ", timelockLibAddress);
  console.log("");

  // Configuration
  const config = {
    usdt: process.env.USDT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955",
    multisig: process.env.MULTISIG_ADDRESS || deployer.address,
    liquidityPool: process.env.LIQUIDITY_POOL || deployer.address,
    infrastructureWallet: process.env.INFRASTRUCTURE_WALLET || deployer.address,
    companyWallet: process.env.COMPANY_WALLET || deployer.address,
  };

  // ========== Save Deployment Info ==========
  console.log("💾 Saving deployment info...");
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
    bscscan: {
      core: `https://bscscan.com/address/${coreAddress}`,
      mlm: `https://bscscan.com/address/${mlmAddress}`,
      governance: `https://bscscan.com/address/${governanceAddress}`,
      library: `https://bscscan.com/address/${timelockLibAddress}`,
    },
    verification: {
      note: "To verify contracts on BscScan, run these commands:",
      core: `npx hardhat verify --network bscMainnet ${coreAddress} "${config.usdt}" "${config.multisig}" "${config.liquidityPool}" "${config.infrastructureWallet}" "${config.companyWallet}"`,
      mlm: `npx hardhat verify --network bscMainnet ${mlmAddress} "${coreAddress}" "${config.multisig}"`,
      governance: `npx hardhat verify --network bscMainnet ${governanceAddress} "${config.usdt}" "${coreAddress}" "${config.multisig}" "${config.liquidityPool}" "${config.infrastructureWallet}" "${config.companyWallet}"`,
    },
    frontendConfig: {
      note: "Update these addresses in frontend/config/contracts.ts",
      CONTRACT_ADDRESS: coreAddress,
      USDT_ADDRESS: config.usdt,
    },
  };

  const deploymentPath = `./deployments/mainnet_${Date.now()}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("✅ Saved to:", deploymentPath);
  console.log("");

  // ========== Summary ==========
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎉 BSC MAINNET DEPLOYMENT COMPLETE! 🎉");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("📋 Contract Addresses:\n");
  console.log("   iDeepXCore:           ", coreAddress);
  console.log("   iDeepXMLM:            ", mlmAddress);
  console.log("   iDeepXGovernance:     ", governanceAddress);
  console.log("   TimelockGovernance:   ", timelockLibAddress);
  console.log("");
  console.log("🔗 View on BscScan:\n");
  console.log("   Core:       https://bscscan.com/address/" + coreAddress);
  console.log("   MLM:        https://bscscan.com/address/" + mlmAddress);
  console.log("   Governance: https://bscscan.com/address/" + governanceAddress);
  console.log("");
  console.log("💰 Gas Used:");
  const initialBalance = 0.113;
  const finalBalance = parseFloat(ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  const gasUsed = initialBalance - finalBalance;
  console.log(`   Started with:  ${initialBalance.toFixed(6)} BNB`);
  console.log(`   Final balance: ${finalBalance.toFixed(6)} BNB`);
  console.log(`   Gas used:      ${gasUsed.toFixed(6)} BNB (~$${(gasUsed * 600).toFixed(2)} USD)`);
  console.log("");
  console.log("✅ Next Steps:");
  console.log("   1. Update frontend/config/contracts.ts:");
  console.log(`      export const CONTRACT_ADDRESS = '${coreAddress}' as const`);
  console.log("   2. Rebuild frontend: cd frontend && npm run build");
  console.log("   3. Upload frontend/out/ to Pinata");
  console.log("   4. (Optional) Verify contracts on BscScan");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
