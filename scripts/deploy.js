import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Iniciando deploy do iDeepXDistributionV2 - Sistema MLM...\n");

  // Obter o deployer
  const [deployer] = await hre.hre.ethers.getSigners();

  console.log("📝 Deploying com a conta:", deployer.address);
  console.log("💰 Saldo da conta:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB\n");

  // ========== CONFIGURAÇÕES ==========

  // USDT na BNB Smart Chain
  const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP-20 Mainnet
  const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // USDT BEP-20 Testnet

  // Detectar rede
  const network = hre.network.name;
  const isTestnet = network === "bscTestnet" || network === "localhost" || network === "hardhat";

  const USDT_ADDRESS = isTestnet ? USDT_TESTNET : USDT_MAINNET;

  // Carteiras dos pools (usar .env ou endereços padrão)
  const LIQUIDITY_POOL = process.env.LIQUIDITY_POOL || deployer.address;
  const INFRASTRUCTURE_WALLET = process.env.INFRASTRUCTURE_WALLET || deployer.address;
  const COMPANY_WALLET = process.env.COMPANY_WALLET || deployer.address;

  console.log("⚙️  Configurações do deploy:");
  console.log("   Rede:", network);
  console.log("   USDT:", USDT_ADDRESS);
  console.log("   Liquidity Pool:", LIQUIDITY_POOL);
  console.log("   Infrastructure:", INFRASTRUCTURE_WALLET);
  console.log("   Company:", COMPANY_WALLET);
  console.log("");

  // Avisos importantes
  if (LIQUIDITY_POOL === deployer.address || INFRASTRUCTURE_WALLET === deployer.address || COMPANY_WALLET === deployer.address) {
    console.log("⚠️  AVISO: Usando endereço do deployer para os pools!");
    console.log("⚠️  Configure as carteiras corretas no .env antes do deploy em mainnet!");
    console.log("");
  }

  // ========== DEPLOY ==========

  console.log("📦 Compilando contratos...");
  const Distribution = await hre.ethers.getContractFactory("iDeepXDistributionV2");

  console.log("🚀 Fazendo deploy...");
  const distribution = await Distribution.deploy(
    USDT_ADDRESS,
    LIQUIDITY_POOL,
    INFRASTRUCTURE_WALLET,
    COMPANY_WALLET
  );

  await distribution.waitForDeployment();
  const contractAddress = await distribution.getAddress();

  console.log("\n✅ Deploy concluído com sucesso!");
  console.log("📍 Contrato deployado em:", contractAddress);
  console.log("");

  // ========== INFORMAÇÕES DO CONTRATO ==========

  console.log("📊 Informações do Contrato MLM:");
  console.log("   USDT Token:", await distribution.USDT());
  console.log("   Subscription Fee:", hre.ethers.formatEther(await distribution.SUBSCRIPTION_FEE()), "USDT");
  console.log("   MLM Levels:", await distribution.MLM_LEVELS());
  console.log("   Beta Mode:", await distribution.betaMode());
  console.log("   Owner:", await distribution.owner());
  console.log("");

  // Estatísticas
  const [totalUsers, totalActive, totalMLM, betaMode] = await distribution.getSystemStats();
  console.log("📈 Estatísticas:");
  console.log("   Total Usuários:", totalUsers.toString());
  console.log("   Assinaturas Ativas:", totalActive.toString());
  console.log("   Total MLM Distribuído:", hre.ethers.formatEther(totalMLM), "USDT");
  console.log("   Modo:", betaMode ? "Beta" : "Permanente");
  console.log("");

  // Percentuais MLM ativos
  const percentages = await distribution.getActiveMLMPercentages();
  console.log("💰 Percentuais MLM (Modo Beta):");
  for (let i = 0; i < 10; i++) {
    console.log(`   L${i + 1}: ${percentages[i] / 100}%`);
  }
  console.log("");

  // ========== PRÓXIMOS PASSOS ==========

  console.log("📋 PRÓXIMOS PASSOS:");
  console.log("");
  console.log("1. Verificar o contrato no BscScan:");
  console.log(`   npx hardhat verify --network ${network} ${contractAddress} "${USDT_ADDRESS}" "${LIQUIDITY_POOL}" "${INFRASTRUCTURE_WALLET}" "${COMPANY_WALLET}"`);
  console.log("");
  console.log("2. Testar funções básicas:");
  console.log("   - selfRegister(sponsorAddress)");
  console.log("   - selfSubscribe() [requer aprovar 29 USDT]");
  console.log("   - batchProcessPerformanceFees([clientes], [valores])");
  console.log("");
  console.log("3. Configurar frontend com o endereço do contrato:");
  console.log("   CONTRACT_ADDRESS=" + contractAddress);
  console.log("");

  // ========== VERIFICAÇÃO AUTOMÁTICA ==========

  if (process.env.BSCSCAN_API_KEY && network !== "hardhat" && network !== "localhost") {
    console.log("⏳ Aguardando 30 segundos antes de verificar o contrato...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("🔍 Verificando contrato no BscScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [USDT_ADDRESS, LIQUIDITY_POOL, INFRASTRUCTURE_WALLET, COMPANY_WALLET],
      });
      console.log("✅ Contrato verificado com sucesso!");
    } catch (error) {
      console.log("⚠️  Erro ao verificar contrato:", error.message);
      console.log("   Você pode verificar manualmente usando o comando acima.");
    }
  }

  console.log("\n🎉 Deploy completo!\n");

  // Salvar informações em arquivo JSON
  const deployInfo = {
    network: network,
    contractAddress: contractAddress,
    usdtAddress: USDT_ADDRESS,
    liquidityPool: LIQUIDITY_POOL,
    infrastructureWallet: INFRASTRUCTURE_WALLET,
    companyWallet: COMPANY_WALLET,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    subscriptionFee: "29",
    mlmLevels: 10,
    betaMode: true
  };

  const filename = `deployment-${network}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployInfo, null, 2));
  console.log(`💾 Informações salvas em ${filename}`);
  console.log("");

  // ========== INSTRUÇÕES DE USO ==========

  console.log("📚 COMO USAR O CONTRATO:");
  console.log("");
  console.log("🔹 Para usuários se registrarem:");
  console.log("   distribution.selfRegister(sponsorAddress)");
  console.log("");
  console.log("🔹 Para usuários assinarem ($29 USDT):");
  console.log("   1. usdt.approve(contractAddress, 29 USDT)");
  console.log("   2. distribution.selfSubscribe()");
  console.log("");
  console.log("🔹 Para registrar e assinar de uma vez:");
  console.log("   1. usdt.approve(contractAddress, 29 USDT)");
  console.log("   2. distribution.registerAndSubscribe(sponsorAddress)");
  console.log("");
  console.log("🔹 Para processar performance fees (admin):");
  console.log("   1. usdt.approve(contractAddress, totalAmount)");
  console.log("   2. distribution.batchProcessPerformanceFees([cliente1, cliente2], [valor1, valor2])");
  console.log("");
  console.log("   Distribuição automática:");
  console.log("   - 60% MLM (10 níveis)");
  console.log("   - 5% Liquidez");
  console.log("   - 12% Infraestrutura");
  console.log("   - 23% Empresa");
  console.log("");
}

// Executar deploy
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
