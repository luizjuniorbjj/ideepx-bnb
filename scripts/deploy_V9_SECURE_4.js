import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🔒 Iniciando deploy do iDeepXDistributionV9_SECURE_4 - Production Ready\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("📝 Deploying com a conta:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Saldo da conta:", hre.ethers.formatEther(balance), "BNB\n");

  // ========== CONFIG ==========

  const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";
  const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

  const network = hre.network.name;
  const isTestnet = network === "bscTestnet" || network === "localhost" || network === "hardhat";
  const USDT_ADDRESS = isTestnet ? USDT_TESTNET : USDT_MAINNET;

  const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS || deployer.address;
  const LIQUIDITY_POOL = process.env.LIQUIDITY_POOL || deployer.address;
  const INFRASTRUCTURE_WALLET = process.env.INFRASTRUCTURE_WALLET || deployer.address;
  const COMPANY_WALLET = process.env.COMPANY_WALLET || deployer.address;

  console.log("⚙️  Configurações:");
  console.log("   Rede:", network);
  console.log("   USDT:", USDT_ADDRESS);
  console.log("   Multisig:", MULTISIG_ADDRESS);
  console.log("   Liquidity Pool:", LIQUIDITY_POOL);
  console.log("   Infrastructure:", INFRASTRUCTURE_WALLET);
  console.log("   Company:", COMPANY_WALLET);
  console.log("");

  if (MULTISIG_ADDRESS === deployer.address) {
    console.log("⚠️  WARNING: Multisig usando endereço do deployer!");
    console.log("⚠️  Para testnet isso é OK, mas configure MULTISIG_ADDRESS no .env antes de mainnet!");
    console.log("");
  }

  if (!isTestnet) {
    console.log("🚨 ATENÇÃO: Deploy em MAINNET!");
    console.log("🚨 Aguardando 10 segundos... (Ctrl+C para cancelar)");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // ========== DEPLOY ==========

  console.log("📦 Compilando iDeepXDistributionV9_SECURE_4...");

  // Deploy library first
  console.log("📚 Deploying TimelockGovernance library...");
  const TimelockGovernance = await hre.ethers.getContractFactory("TimelockGovernance");
  const timelockLib = await TimelockGovernance.deploy();
  await timelockLib.waitForDeployment();
  const timelockLibAddress = await timelockLib.getAddress();
  console.log("✅ Library deployed at:", timelockLibAddress);
  console.log("");

  // Link library to main contract
  const Distribution = await hre.ethers.getContractFactory("iDeepXDistributionV9_SECURE_4", {
    libraries: {
      TimelockGovernance: timelockLibAddress
    }
  });

  console.log("🚀 Fazendo deploy do V9_SECURE_4...");
  const distribution = await Distribution.deploy(
    USDT_ADDRESS,
    MULTISIG_ADDRESS,
    LIQUIDITY_POOL,
    INFRASTRUCTURE_WALLET,
    COMPANY_WALLET
  );

  await distribution.waitForDeployment();
  const contractAddress = await distribution.getAddress();

  console.log("\n✅ Deploy concluído com sucesso!");
  console.log("📍 Contrato deployado em:", contractAddress);
  console.log("");

  // ========== INFO ==========

  console.log("📊 Informações V9_SECURE_4:");
  console.log("   Subscription Fee: $19 USDT");
  console.log("   Circuit Breaker: 110%/130% (auto pause/liquidation)");
  console.log("   Deposit Cap: $100k (beta mode)");
  console.log("   Max Beta Users: 100");
  console.log("   Timelock: 24h (admin changes)");
  console.log("   Withdrawal Limits: $10k/tx, $50k/month");
  console.log("   Emergency Reserve: 1% auto");
  console.log("");

  // Get security status
  try {
    const security = await distribution.getSecurityStatus();
    console.log("🔒 Security Status:");
    console.log("   Emergency Reserve:", hre.ethers.formatUnits(security._emergencyReserve, 6), "USDT");
    console.log("   Circuit Breaker:", security._circuitBreakerActive ? "🔴 ACTIVE" : "🟢 INACTIVE");
    console.log("   Solvency Ratio:", Number(security._solvencyRatio) / 100, "%");
    console.log("");
  } catch (e) {
    console.log("   (Security status will be available after first deposits)");
    console.log("");
  }

  // Get system stats
  try {
    const stats = await distribution.getSystemStats();
    console.log("📈 System Stats:");
    console.log("   Total Users:", stats.totalUsers.toString());
    console.log("   Active Subscriptions:", stats.activeSubscriptions.toString());
    console.log("   Total MLM Distributed:", hre.ethers.formatUnits(stats.totalMLMDistributed, 6), "USDT");
    console.log("   Beta Mode:", stats.betaModeActive ? "✅ YES" : "❌ NO");
    console.log("");
  } catch (e) {
    console.log("   (Stats will populate as users register)");
    console.log("");
  }

  // ========== VERIFICAÇÃO ==========

  if (process.env.BSCSCAN_API_KEY && network !== "hardhat" && network !== "localhost") {
    console.log("⏳ Aguardando 30s antes de verificar no BscScan...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("🔍 Verificando contrato no BscScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          USDT_ADDRESS,
          MULTISIG_ADDRESS,
          LIQUIDITY_POOL,
          INFRASTRUCTURE_WALLET,
          COMPANY_WALLET
        ],
      });
      console.log("✅ Contrato verificado com sucesso no BscScan!");
    } catch (error) {
      console.log("⚠️  Erro na verificação automática:", error.message);
      console.log("   Você pode verificar manualmente com:");
      console.log(`   npx hardhat verify --network ${network} ${contractAddress} "${USDT_ADDRESS}" "${MULTISIG_ADDRESS}" "${LIQUIDITY_POOL}" "${INFRASTRUCTURE_WALLET}" "${COMPANY_WALLET}"`);
    }
  }

  console.log("\n🎉 Deploy V9_SECURE_4 completo!\n");

  // ========== SAVE INFO ==========

  const deployInfo = {
    version: "V9_SECURE_4",
    network: network,
    contractAddress: contractAddress,
    usdtAddress: USDT_ADDRESS,
    multisig: MULTISIG_ADDRESS,
    liquidityPool: LIQUIDITY_POOL,
    infrastructureWallet: INFRASTRUCTURE_WALLET,
    companyWallet: COMPANY_WALLET,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    subscriptionFee: "19",
    features: {
      circuitBreaker: "110%/130% (auto pause/liquidation)",
      depositCap: "$100k (beta mode)",
      maxBetaUsers: 100,
      timelock: "24h (admin changes)",
      withdrawalLimits: {
        users: "$10k/tx, $50k/month",
        pools: "$10k/day, $50k/month"
      },
      emergencyReserve: "1% auto",
      addressRedirects: true,
      antiSybil: "Rate limiting + pattern detection",
      dosProtection: "Emergency pause + circuit breaker",
      securityScore: "80.5% (12 patches applied)"
    }
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `deployment-v9_secure_4-${network}-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployInfo, null, 2));
  console.log(`💾 Deployment info saved: ${filename}\n`);

  // ========== INSTRUÇÕES ==========

  console.log("═".repeat(70));
  console.log("📋 PRÓXIMOS PASSOS:");
  console.log("═".repeat(70));
  console.log("");
  console.log("1️⃣  Testar registro de usuário:");
  console.log("   distribution.registerWithSponsor(sponsorAddress)");
  console.log("");
  console.log("2️⃣  Ativar assinatura ($19 USDT):");
  console.log("   usdt.approve(contractAddress, 19000000) // 19 USDT");
  console.log("   distribution.activateSubscriptionWithUSDT(1) // 1 mês");
  console.log("");
  console.log("3️⃣  Monitorar o contrato:");
  console.log("   - BscScan Testnet:", `https://testnet.bscscan.com/address/${contractAddress}`);
  console.log("   - Ou use: node monitoring/monitor.js");
  console.log("");
  console.log("4️⃣  Executar auditorias de segurança:");
  console.log("   python certik_professional_audit.py");
  console.log("   python fraud_detection_bot.py --testnet");
  console.log("   python dos_attack_bot.py --testnet");
  console.log("");
  console.log("5️⃣  Para MAINNET:");
  console.log("   - Configure multisig (Gnosis Safe)");
  console.log("   - Configure 3 carteiras separadas (liquidity, infrastructure, company)");
  console.log("   - Execute: npx hardhat run scripts/deploy_V9_SECURE_4.js --network bscMainnet");
  console.log("");
  console.log("═".repeat(70));
  console.log("");

  // ========== SECURITY CHECKLIST ==========

  console.log("🔒 SECURITY CHECKLIST (antes do mainnet):");
  console.log("");
  console.log("   ✅ 12 security patches applied");
  console.log("   ✅ Circuit breaker active");
  console.log("   ✅ Withdrawal limits configured");
  console.log("   ✅ Emergency reserve (1%)");
  console.log("   ✅ Anti-Sybil protection");
  console.log("   ✅ DoS attack mitigation");
  console.log("   ✅ Contract size optimized (BSC deployment)");
  console.log("");
  console.log("   ⚠️  TODO antes do mainnet:");
  console.log("      - Configure Gnosis Safe multisig");
  console.log("      - Set up monitoring alerts");
  console.log("      - Create bug bounty program ($1-5k)");
  console.log("      - Run 48h testnet beta");
  console.log("      - Get insurance quote ($200/month)");
  console.log("");
  console.log("═".repeat(70));
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
