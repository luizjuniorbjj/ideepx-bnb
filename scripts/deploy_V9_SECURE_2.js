import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🔒 Iniciando deploy do iDeepXDistributionV9_SECURE_2 - Enterprise Grade\n");

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
    console.log("⚠️  Configure MULTISIG_ADDRESS no .env antes de mainnet!");
    console.log("");
  }

  if (!isTestnet) {
    console.log("🚨 ATENÇÃO: Deploy em MAINNET!");
    console.log("🚨 Aguardando 10 segundos... (Ctrl+C para cancelar)");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // ========== DEPLOY ==========

  console.log("📦 Compilando contratos...");

  // Deploy library first
  console.log("📚 Deploying TimelockGovernance library...");
  const TimelockGovernance = await hre.ethers.getContractFactory("TimelockGovernance");
  const timelockLib = await TimelockGovernance.deploy();
  await timelockLib.waitForDeployment();
  const timelockLibAddress = await timelockLib.getAddress();
  console.log("✅ Library deployed at:", timelockLibAddress);

  // Link library to main contract
  const Distribution = await hre.ethers.getContractFactory("iDeepXDistributionV9_SECURE_2", {
    libraries: {
      TimelockGovernance: timelockLibAddress
    }
  });

  console.log("🚀 Fazendo deploy do V9_SECURE_2...");
  const distribution = await Distribution.deploy(
    USDT_ADDRESS,
    MULTISIG_ADDRESS,
    LIQUIDITY_POOL,
    INFRASTRUCTURE_WALLET,
    COMPANY_WALLET
  );

  await distribution.waitForDeployment();
  const contractAddress = await distribution.getAddress();

  console.log("\n✅ Deploy concluído!");
  console.log("📍 Contrato:", contractAddress);
  console.log("");

  // ========== INFO ==========

  console.log("📊 Informações V9_SECURE_2:");
  console.log("   Subscription Fee: $19 USDT");
  console.log("   Circuit Breaker: 110%/130%");
  console.log("   Deposit Cap: $100k (beta)");
  console.log("   Max Beta Users: 100");
  console.log("   Timelock: 24h");
  console.log("");

  const security = await distribution.getSecurityStatus();
  console.log("🔒 Security Status:");
  console.log("   Emergency Reserve:", hre.ethers.formatUnits(security._emergencyReserve, 6), "USDT");
  console.log("   Circuit Breaker:", security._circuitBreakerActive ? "ACTIVE" : "INACTIVE");
  console.log("   Solvency Ratio:", Number(security._solvencyRatio) / 100, "%");
  console.log("");

  // ========== VERIFICAÇÃO ==========

  if (process.env.BSCSCAN_API_KEY && network !== "hardhat" && network !== "localhost") {
    console.log("⏳ Aguardando 30s antes de verificar...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("🔍 Verificando no BscScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [USDT_ADDRESS, MULTISIG_ADDRESS, LIQUIDITY_POOL, INFRASTRUCTURE_WALLET, COMPANY_WALLET],
      });
      console.log("✅ Contrato verificado!");
    } catch (error) {
      console.log("⚠️  Erro na verificação:", error.message);
    }
  }

  console.log("\n🎉 Deploy V9_SECURE_2 completo!\n");

  // ========== SAVE INFO ==========

  const deployInfo = {
    version: "V9_SECURE_2",
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
      circuitBreaker: "110%/130%",
      depositCap: "$100k",
      maxBetaUsers: 100,
      timelock: "24h",
      withdrawalLimits: {
        users: "$10k/tx, $50k/month",
        pools: "$10k/day, $50k/month"
      },
      emergencyReserve: "1%",
      addressRedirects: true
    }
  };

  const filename = `deployment-v9_secure_2-${network}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployInfo, null, 2));
  console.log(`💾 Informações salvas em ${filename}\n`);

  // ========== INSTRUÇÕES ==========

  console.log("📋 PRÓXIMOS PASSOS:");
  console.log("");
  console.log("1. Monitorar:");
  console.log("   node monitoring/monitor.js");
  console.log("");
  console.log("2. Registrar usuários:");
  console.log("   distribution.registerWithSponsor(sponsorAddress)");
  console.log("");
  console.log("3. Ativar assinatura ($19):");
  console.log("   usdt.approve(contractAddress, 19 * 10**6)");
  console.log("   distribution.activateSubscriptionWithUSDT(1)");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
