import hre from "hardhat";
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Iniciando deploy do iDeepXDistributionV8_2 - Sistema MLM Production Ready...\n");

  // Obter o deployer
  const [deployer] = await ethers.getSigners();

  console.log("📝 Deploying com a conta:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Saldo da conta:", ethers.formatEther(balance), "BNB\n");

  // ========== CONFIGURAÇÕES ==========

  // USDT na BNB Smart Chain (6 decimais)
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
  const Distribution = await ethers.getContractFactory("iDeepXDistributionV8_2");

  console.log("🚀 Fazendo deploy do V8_2...");
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

  console.log("📊 Informações do Contrato V8_2:");
  console.log("   USDT Token:", await distribution.USDT());
  console.log("   Subscription Fee:", (await distribution.SUBSCRIPTION_FEE()) / 10**6, "USDT");
  console.log("   MLM Levels:", await distribution.MLM_LEVELS());
  console.log("   Beta Mode:", await distribution.betaMode());
  console.log("   Owner:", deployer.address);
  console.log("");

  // Estatísticas
  const stats = await distribution.getSystemStats();
  console.log("📈 Estatísticas Iniciais:");
  console.log("   Total Usuários:", stats[0].toString());
  console.log("   Assinaturas Ativas:", stats[1].toString());
  console.log("   Total MLM Distribuído:", stats[3] / BigInt(10**6), "USDT");
  console.log("   Modo:", stats[7] ? "Beta" : "Permanente");
  console.log("");

  // Percentuais MLM ativos
  console.log("💰 Percentuais MLM (Modo Beta - Basis Points):");
  for (let i = 0; i < 10; i++) {
    const percentage = await distribution.mlmPercentagesBeta(i);
    console.log(`   L${i + 1}: ${percentage}bp (${percentage / 100}%)`);
  }
  console.log("");

  // Features V8_2
  console.log("🆕 FEATURES V8_2:");
  console.log("   ✅ Pagamento com saldo interno");
  console.log("   ✅ Pagamento misto (USDT + Saldo)");
  console.log("   ✅ Descontos múltiplos meses (3/6/12)");
  console.log("   ✅ Comissões para inativos");
  console.log("   ✅ Upgrade de rank automático");
  console.log("   ✅ Upgrade de rank manual (requestRankUpgrade)");
  console.log("   ✅ Upgrade de rank batch admin");
  console.log("   ✅ Sistema de 8 ranks com boosts");
  console.log("   ✅ Solvência garantida");
  console.log("   ✅ Views detalhadas (getUserDetailedInfo)");
  console.log("");

  // ========== PRÓXIMOS PASSOS ==========

  console.log("📋 PRÓXIMOS PASSOS:");
  console.log("");
  console.log("1. Verificar o contrato no BscScan:");
  console.log(`   npx hardhat verify --network ${network} ${contractAddress} "${USDT_ADDRESS}" "${LIQUIDITY_POOL}" "${INFRASTRUCTURE_WALLET}" "${COMPANY_WALLET}"`);
  console.log("");
  console.log("2. Testar funções básicas:");
  console.log("   - registerWithSponsor(sponsorAddress)");
  console.log("   - activateSubscriptionWithUSDT(1) [requer aprovar 29 USDT]");
  console.log("   - activateSubscriptionWithBalance(1) [se tiver saldo]");
  console.log("   - requestRankUpgrade() [manual]");
  console.log("   - distributePerformanceFee([clientes], [valores])");
  console.log("");
  console.log("3. Gerenciar Roles:");
  console.log("   - grantDistributorRole(address)");
  console.log("   - grantTreasuryRole(address)");
  console.log("   - grantUpdaterRole(address)");
  console.log("");
  console.log("4. Configurar frontend com o endereço do contrato:");
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

  console.log("\n🎉 Deploy V8_2 completo!\n");

  // Salvar informações em arquivo JSON
  const deployInfo = {
    version: "V8_2",
    network: network,
    contractAddress: contractAddress,
    usdtAddress: USDT_ADDRESS,
    liquidityPool: LIQUIDITY_POOL,
    infrastructureWallet: INFRASTRUCTURE_WALLET,
    companyWallet: COMPANY_WALLET,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    subscriptionFee: "29",
    mlmLevels: 10,
    betaMode: true,
    features: [
      "Pagamento com saldo interno",
      "Pagamento misto",
      "Descontos múltiplos meses",
      "Comissões para inativos",
      "Upgrade de rank automático/manual/batch",
      "8 ranks com boosts",
      "Solvência garantida"
    ]
  };

  const filename = `deployment-v8_2-${network}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployInfo, null, 2));
  console.log(`💾 Informações salvas em ${filename}`);
  console.log("");

  // ========== INSTRUÇÕES DE USO ==========

  console.log("📚 COMO USAR O CONTRATO V8_2:");
  console.log("");
  console.log("🔹 Para usuários se registrarem:");
  console.log("   distribution.registerWithSponsor(sponsorAddress)");
  console.log("");
  console.log("🔹 Para usuários assinarem ($29 USDT):");
  console.log("   1. usdt.approve(contractAddress, 29 * 10**6)");
  console.log("   2. distribution.activateSubscriptionWithUSDT(1)");
  console.log("");
  console.log("🔹 Para assinar com saldo interno:");
  console.log("   1. Verificar: canPaySubscriptionWithBalance(address, months)");
  console.log("   2. distribution.activateSubscriptionWithBalance(months)");
  console.log("");
  console.log("🔹 Para assinar com pagamento misto:");
  console.log("   1. usdt.approve(contractAddress, valorUSDTNecessário)");
  console.log("   2. distribution.activateSubscriptionMixed(months, balanceAmount)");
  console.log("");
  console.log("🔹 Para processar performance fees (admin):");
  console.log("   1. usdt.approve(contractAddress, totalAmount)");
  console.log("   2. distribution.distributePerformanceFee([cliente1, cliente2], [valor1, valor2])");
  console.log("");
  console.log("   Distribuição automática:");
  console.log("   - 60% MLM (10 níveis) → 75% direto + 25% reserva");
  console.log("   - 5% Liquidez");
  console.log("   - 12% Infraestrutura");
  console.log("   - 23% Empresa");
  console.log("");
  console.log("🔹 Para fazer upgrade de rank:");
  console.log("   - Automático: Ocorre ao receber comissões");
  console.log("   - Manual: distribution.requestRankUpgrade()");
  console.log("   - Batch: distribution.batchUpgradeRanks([address1, address2])");
  console.log("");
}

// Executar deploy
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
