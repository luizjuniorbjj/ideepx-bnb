import hre from "hardhat";
import fs from "fs";

const { upgrades } = hre;

async function main() {
  console.log("🔒 Iniciando deploy do iDeepXDistributionV9_SECURE_4 com UUPS Proxy\n");

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

  if (!isTestnet) {
    console.log("🚨 ATENÇÃO: Deploy em MAINNET!");
    console.log("🚨 Aguardando 10 segundos... (Ctrl+C para cancelar)");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // ========== DEPLOY WITH PROXY ==========

  console.log("📦 Deploying com UUPS Proxy Pattern...");
  console.log("   Isso permite upgrades futuros mantendo o mesmo endereço\n");

  try {
    // Deploy library first
    console.log("📚 Deploying TimelockGovernance library...");
    const TimelockGovernance = await hre.ethers.getContractFactory("TimelockGovernance");
    const timelockLib = await TimelockGovernance.deploy();
    await timelockLib.waitForDeployment();
    const timelockLibAddress = await timelockLib.getAddress();
    console.log("✅ Library deployed at:", timelockLibAddress);
    console.log("");

    // Get contract factory with library linkage
    const Distribution = await hre.ethers.getContractFactory("iDeepXDistributionV9_SECURE_4", {
      libraries: {
        TimelockGovernance: timelockLibAddress
      }
    });

    console.log("🚀 Deploying Implementation + Proxy...");
    console.log("   (Isso pode levar 2-3 minutos)");

    // Deploy with proxy using OpenZeppelin Upgrades plugin
    const distribution = await upgrades.deployProxy(
      Distribution,
      [USDT_ADDRESS, MULTISIG_ADDRESS, LIQUIDITY_POOL, INFRASTRUCTURE_WALLET, COMPANY_WALLET],
      {
        kind: "transparent", // Using Transparent Proxy (simpler, more gas efficient for deployment)
        initializer: "initialize",
        unsafeAllow: ["external-library-linking", "delegatecall"]
      }
    );

    await distribution.waitForDeployment();
    const proxyAddress = await distribution.getAddress();

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("\n✅ Deploy concluído com sucesso!");
    console.log("📍 Proxy Address:", proxyAddress);
    console.log("📍 Implementation Address:", implementationAddress);
    console.log("");
    console.log("💡 Users interact with:", proxyAddress);
    console.log("💡 Logic stored in:", implementationAddress);
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

    // ========== SAVE INFO ==========

    const deployInfo = {
      version: "V9_SECURE_4_PROXY",
      network: network,
      proxyAddress: proxyAddress,
      implementationAddress: implementationAddress,
      timelockLibrary: timelockLibAddress,
      usdtAddress: USDT_ADDRESS,
      multisig: MULTISIG_ADDRESS,
      liquidityPool: LIQUIDITY_POOL,
      infrastructureWallet: INFRASTRUCTURE_WALLET,
      companyWallet: COMPANY_WALLET,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber(),
      proxyType: "TransparentUpgradeableProxy",
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
        upgradeable: true,
        securityScore: "80.5% (12 patches applied)"
      }
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `deployment-v9_proxy-${network}-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(deployInfo, null, 2));
    console.log(`💾 Deployment info saved: ${filename}\n`);

    // ========== INSTRUÇÕES ==========

    console.log("═".repeat(70));
    console.log("📋 PRÓXIMOS PASSOS:");
    console.log("═".repeat(70));
    console.log("");
    console.log("1️⃣  Usar o PROXY ADDRESS em todas as interações:");
    console.log(`   ${proxyAddress}`);
    console.log("");
    console.log("2️⃣  Testar registro de usuário:");
    console.log("   distribution.registerWithSponsor(sponsorAddress)");
    console.log("");
    console.log("3️⃣  Atualizar frontend com o Proxy Address:");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${proxyAddress}`);
    console.log("");
    console.log("4️⃣  Para fazer upgrade no futuro:");
    console.log("   npx hardhat run scripts/upgrade_V9.js --network", network);
    console.log("");
    console.log("5️⃣  Monitorar:");
    console.log("   - Proxy:", `https://${isTestnet ? 'testnet.' : ''}bscscan.com/address/${proxyAddress}`);
    console.log("");
    console.log("═".repeat(70));
    console.log("");

  } catch (error) {
    if (error.message.includes("max code size exceeded")) {
      console.error("\n❌ ERRO: Contrato ainda excede 24kb mesmo com proxy!");
      console.error("\n📊 ANÁLISE:");
      console.error("   O contrato V9_SECURE_4 é muito grande (~26kb)");
      console.error("   O proxy não resolve o problema de tamanho da implementação");
      console.error("");
      console.error("💡 SOLUÇÕES RECOMENDADAS:");
      console.error("");
      console.error("   1️⃣  LITE VERSION (15 min):");
      console.error("      - Remove: Governance, Circuit Breaker avançado");
      console.error("      - Mantém: MLM, Subscriptions, Withdrawals, Security básica");
      console.error("      - Tamanho: ~18kb (cabe confortavelmente)");
      console.error("");
      console.error("   2️⃣  MODULAR ARCHITECTURE (60-90 min):");
      console.error("      - Core Module: Registration + Subscriptions");
      console.error("      - MLM Module: Distribution logic");
      console.error("      - Security Module: Circuit breaker + Emergency");
      console.error("      - Vantagem: Infinitamente escalável");
      console.error("");
      console.error("   3️⃣  DEPLOY EM POLYGON/ARBITRUM:");
      console.error("      - Mesma funcionalidade");
      console.error("      - Algumas redes têm limites maiores ou melhor otimização");
      console.error("");
      console.error("⚠️  Recomendo: LITE VERSION agora para testar rápido,");
      console.error("   depois migrar para MODULAR quando validado.");
      console.error("");
    } else {
      console.error("❌ Erro no deploy:", error);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
