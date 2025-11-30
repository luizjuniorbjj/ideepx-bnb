import hre from "hardhat";
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("🔒 Iniciando deploy do iDeepXDistributionV9_SECURE_1 - Enterprise Grade...  \n");

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

  // NOVO V9: Multisig address (CRITICAL!)
  const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS || deployer.address;

  // Carteiras dos pools
  const LIQUIDITY_POOL = process.env.LIQUIDITY_POOL || deployer.address;
  const INFRASTRUCTURE_WALLET = process.env.INFRASTRUCTURE_WALLET || deployer.address;
  const COMPANY_WALLET = process.env.COMPANY_WALLET || deployer.address;

  console.log("⚙️  Configurações do deploy:");
  console.log("   Rede:", network);
  console.log("   USDT:", USDT_ADDRESS);
  console.log("   Multisig:", MULTISIG_ADDRESS);
  console.log("   Liquidity Pool:", LIQUIDITY_POOL);
  console.log("   Infrastructure:", INFRASTRUCTURE_WALLET);
  console.log("   Company:", COMPANY_WALLET);
  console.log("");

  // Avisos importantes
  if (MULTISIG_ADDRESS === deployer.address) {
    console.log("⚠️  WARNING: Multisig usando endereço do deployer!");
    console.log("⚠️  Configure MULTISIG_ADDRESS no .env antes do deploy em mainnet!");
    console.log("⚠️  Recomendado: Usar Gnosis Safe (3/5 ou 4/7 signatários)");
    console.log("");
  }

  if (LIQUIDITY_POOL === deployer.address || INFRASTRUCTURE_WALLET === deployer.address || COMPANY_WALLET === deployer.address) {
    console.log("⚠️  AVISO: Usando endereço do deployer para os pools!");
    console.log("⚠️  Configure as carteiras corretas no .env antes do deploy em mainnet!");
    console.log("");
  }

  if (!isTestnet) {
    console.log("🚨 ATENÇÃO: Deploy em MAINNET!");
    console.log("🚨 Certifique-se de ter:");
    console.log("   ✅ Testado em testnet por 30+ dias");
    console.log("   ✅ Auditoria externa profissional");
    console.log("   ✅ Multisig Gnosis Safe configurado");
    console.log("   ✅ Monitoramento 24/7 pronto");
    console.log("");
    console.log("⏸️  Pressione Ctrl+C para cancelar ou aguarde 10 segundos...");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // ========== DEPLOY ==========

  console.log("📦 Compilando contratos...");
  const Distribution = await ethers.getContractFactory("iDeepXDistributionV9_SECURE_1");

  console.log("🚀 Fazendo deploy do V9_SECURE_1...");
  const distribution = await Distribution.deploy(
    USDT_ADDRESS,
    MULTISIG_ADDRESS,  // NOVO: Multisig como primeiro param após USDT
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

  console.log("📊 Informações do Contrato V9_SECURE_1:");
  console.log("   USDT Token:", await distribution.USDT());
  console.log("   Multisig:", await distribution.multisig());
  console.log("   Subscription Fee:", (await distribution.SUBSCRIPTION_FEE()) / 10**6, "USDT");
  console.log("   MLM Levels:", await distribution.MLM_LEVELS());
  console.log("   Beta Mode:", await distribution.betaMode());
  console.log("");

  // Estatísticas
  const stats = await distribution.getSystemStats();
  console.log("📈 Estatísticas Iniciais:");
  console.log("   Total Usuários:", stats[0].toString());
  console.log("   Assinaturas Ativas:", stats[1].toString());
  console.log("   Total MLM Distribuído:", stats[3] / BigInt(10**6), "USDT");
  console.log("   Modo:", stats[7] ? "Beta" : "Permanente");
  console.log("");

  // NOVO V9: Security Status
  const security = await distribution.getSecurityStatus();
  console.log("🔒 Status de Segurança:");
  console.log("   Emergency Reserve:", security._emergencyReserve / BigInt(10**6), "USDT");
  console.log("   Circuit Breaker Ativo:", security._circuitBreakerActive);
  console.log("   Solvency Ratio:", security._solvencyRatio / 100n, "%");
  console.log("");

  // Withdrawal Limits
  console.log("🛡️  Withdrawal Limits:");
  console.log("   Usuários:");
  console.log("      - Max por TX: $10,000");
  console.log("      - Max por mês: $50,000");
  console.log("   Admin Pools:");
  console.log("      - Max por dia: $10,000");
  console.log("      - Max por mês: $50,000");
  console.log("");

  // Circuit Breaker Thresholds
  console.log("🚨 Circuit Breaker:");
  console.log("   Ativa quando: Solvency < 120%");
  console.log("   Desativa quando: Solvency ≥ 150%");
  console.log("");

  // Percentuais MLM ativos
  console.log("💰 Percentuais MLM (Modo Beta - Basis Points):");
  for (let i = 0; i < 10; i++) {
    const percentage = await distribution.mlmPercentagesBeta(i);
    console.log(`   L${i + 1}: ${percentage}bp (${percentage / 100}%)`);
  }
  console.log("");

  // Features V9
  console.log("🆕 FEATURES V9_SECURE_1:");
  console.log("   ✅ Multisig integration (Gnosis Safe compatible)");
  console.log("   ✅ Emergency reserve (1% auto-allocated)");
  console.log("   ✅ Circuit breaker (120%/150%)");
  console.log("   ✅ Withdrawal limits ($10k/tx, $50k/mês)");
  console.log("   ✅ Address redirects (multisig migration safe)");
  console.log("   ✅ Flexible emergency reserve usage");
  console.log("");
  console.log("♻️  MANTÉM DO V8_2:");
  console.log("   ✅ Pagamento com saldo interno");
  console.log("   ✅ Pagamento misto (USDT + Saldo)");
  console.log("   ✅ Descontos múltiplos meses (3/6/12)");
  console.log("   ✅ Comissões para inativos");
  console.log("   ✅ Upgrade de rank automático/manual/batch");
  console.log("   ✅ 8 ranks com boosts");
  console.log("   ✅ Solvência garantida");
  console.log("");

  // ========== PRÓXIMOS PASSOS ==========

  console.log("📋 PRÓXIMOS PASSOS:");
  console.log("");
  console.log("1. Verificar o contrato no BscScan:");
  console.log(`   npx hardhat verify --network ${network} ${contractAddress} "${USDT_ADDRESS}" "${MULTISIG_ADDRESS}" "${LIQUIDITY_POOL}" "${INFRASTRUCTURE_WALLET}" "${COMPANY_WALLET}"`);
  console.log("");
  console.log("2. Testar funções básicas:");
  console.log("   - registerWithSponsor(sponsorAddress)");
  console.log("   - activateSubscriptionWithUSDT(1) [requer aprovar 29 USDT]");
  console.log("   - distributePerformanceFee([clientes], [valores])");
  console.log("");
  console.log("3. Configurar Multisig (se ainda não fez):");
  console.log("   - Criar Gnosis Safe em https://app.safe.global");
  console.log("   - Adicionar signatários (mín 3)");
  console.log("   - Configurar threshold (ex: 3/5)");
  console.log("   - Se já deployou, migrar: updateMultisig(newSafeAddress)");
  console.log("");
  console.log("4. Monitoramento:");
  console.log("   - checkAndUpdateCircuitBreaker() [anyone can call]");
  console.log("   - getSecurityStatus() [view solvency, reserve, circuit breaker]");
  console.log("   - getSolvencyStatus() [view detailed solvency]");
  console.log("");
  console.log("5. Funções Enterprise (apenas Multisig):");
  console.log("   - useEmergencyReserve(amount, justification, destination, recipient)");
  console.log("   - updateMultisig(newMultisigAddress)");
  console.log("   - manualCircuitBreakerToggle(true/false)");
  console.log("");

  // ========== VERIFICAÇÃO AUTOMÁTICA ==========

  if (process.env.BSCSCAN_API_KEY && network !== "hardhat" && network !== "localhost") {
    console.log("⏳ Aguardando 30 segundos antes de verificar o contrato...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("🔍 Verificando contrato no BscScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [USDT_ADDRESS, MULTISIG_ADDRESS, LIQUIDITY_POOL, INFRASTRUCTURE_WALLET, COMPANY_WALLET],
      });
      console.log("✅ Contrato verificado com sucesso!");
    } catch (error) {
      console.log("⚠️  Erro ao verificar contrato:", error.message);
      console.log("   Você pode verificar manualmente usando o comando acima.");
    }
  }

  console.log("\n🎉 Deploy V9_SECURE_1 completo!\n");

  // Salvar informações em arquivo JSON
  const deployInfo = {
    version: "V9_SECURE_1",
    network: network,
    contractAddress: contractAddress,
    usdtAddress: USDT_ADDRESS,
    multisig: MULTISIG_ADDRESS,
    liquidityPool: LIQUIDITY_POOL,
    infrastructureWallet: INFRASTRUCTURE_WALLET,
    companyWallet: COMPANY_WALLET,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    subscriptionFee: "29",
    mlmLevels: 10,
    betaMode: true,
    enterpriseFeatures: {
      multisigIntegration: true,
      emergencyReserve: "1% (20% of 5% liquidity)",
      circuitBreaker: "120% activation, 150% deactivation",
      withdrawalLimits: {
        users: {
          perTx: "$10,000",
          perMonth: "$50,000"
        },
        adminPools: {
          perDay: "$10,000",
          perMonth: "$50,000"
        }
      },
      addressRedirects: true
    },
    v8_2_features: [
      "Pagamento com saldo interno",
      "Pagamento misto",
      "Descontos múltiplos meses",
      "Comissões para inativos",
      "Upgrade de rank automático/manual/batch",
      "8 ranks com boosts",
      "Solvência garantida"
    ]
  };

  const filename = `deployment-v9_secure_1-${network}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployInfo, null, 2));
  console.log(`💾 Informações salvas em ${filename}`);
  console.log("");

  // ========== INSTRUÇÕES DE USO ==========

  console.log("📚 COMO USAR O CONTRATO V9_SECURE_1:");
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
  console.log("🔹 Para processar performance fees (multisig):");
  console.log("   1. usdt.approve(contractAddress, totalAmount)");
  console.log("   2. distribution.distributePerformanceFee([cliente1, cliente2], [valor1, valor2])");
  console.log("");
  console.log("🔹 Para usar emergency reserve (multisig):");
  console.log("   distribution.useEmergencyReserve(amount, justification, destination, recipient)");
  console.log("   Destinations: 0=LIQUIDITY, 1=INFRASTRUCTURE, 2=COMPANY, 3=EXTERNAL");
  console.log("");
  console.log("🔹 Para migrar multisig (multisig):");
  console.log("   distribution.updateMultisig(newMultisigAddress)");
  console.log("   (Cria redirect automático, não quebra sponsor tree)");
  console.log("");
  console.log("🔹 Para gerenciar circuit breaker:");
  console.log("   - Automático: distribution.checkAndUpdateCircuitBreaker()");
  console.log("   - Manual: distribution.manualCircuitBreakerToggle(true/false) [multisig only]");
  console.log("");

  // Warnings finais
  console.log("⚠️  AVISOS IMPORTANTES:");
  console.log("");
  if (isTestnet) {
    console.log("✅ Deploy em TESTNET - recomendado testar por 30+ dias antes de mainnet");
  } else {
    console.log("🚨 Deploy em MAINNET:");
    console.log("   - Configure monitoramento 24/7 para solvency e circuit breaker");
    console.log("   - Tenha plano de resposta a incidentes");
    console.log("   - Contato de emergência sempre disponível");
  }
  console.log("");
  console.log("📖 Consulte README_V9_SECURE_1.md para documentação completa");
  console.log("📖 Consulte AUDIT_REPORT_V9_SECURE_1.md para detalhes da auditoria");
  console.log("");
}

// Executar deploy
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
