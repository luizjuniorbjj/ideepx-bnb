import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("\n🚀 DEPLOY iDeepXCoreV10 - Sistema Híbrido (On-chain + Off-chain)\n");
  console.log("═".repeat(80));

  // ========== CONFIGURAÇÃO ==========
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Deploying com a conta:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Saldo:", hre.ethers.formatEther(balance), "BNB\n");

  // Detectar rede
  const network = await hre.ethers.provider.getNetwork();
  const isTestnet = network.chainId === 97n;
  const networkName = isTestnet ? "BSC Testnet" : "BSC Mainnet";

  console.log("🌐 Rede:", networkName);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("");

  // Endereços USDT
  const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";
  const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // Oficial

  const usdtAddress = isTestnet ? USDT_TESTNET : USDT_MAINNET;
  const adminAddress = deployer.address; // Admin inicial = deployer

  console.log("📄 Parâmetros do Deploy:");
  console.log("   USDT Address:", usdtAddress);
  console.log("   Admin Address:", adminAddress);
  console.log("");

  // Confirmar antes de deploy
  console.log("⏳ Iniciando deploy em 3 segundos...\n");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // ========== DEPLOY ==========
  console.log("🔨 Compilando e deployando iDeepXCoreV10...\n");

  const CoreV10 = await hre.ethers.getContractFactory("iDeepXCoreV10");
  const core = await CoreV10.deploy(usdtAddress, adminAddress);

  console.log("⏳ Aguardando confirmação da transação...");
  await core.waitForDeployment();

  const coreAddress = await core.getAddress();
  console.log("\n✅ iDeepXCoreV10 deployado com sucesso!");
  console.log("📍 Endereço:", coreAddress);
  console.log("");

  // ========== VERIFICAÇÃO ==========
  console.log("🔍 Verificando configurações...\n");

  const subscriptionFee = await core.subscriptionFee();
  const subscriptionDuration = await core.subscriptionDuration();
  const minWithdrawal = await core.minWithdrawal();
  const maxWithdrawalPerTx = await core.maxWithdrawalPerTx();
  const maxWithdrawalPerMonth = await core.maxWithdrawalPerMonth();
  const maxTreasuryPerDay = await core.maxTreasuryPerDay();
  const minSolvencyBps = await core.minSolvencyBps();
  const usdt = await core.USDT();

  console.log("📊 Configurações do Contrato:");
  console.log("   USDT:", usdt);
  console.log("   Subscription Fee:", hre.ethers.formatUnits(subscriptionFee, 6), "USDT");
  console.log("   Subscription Duration:", Number(subscriptionDuration) / 86400, "dias");
  console.log("   Min Withdrawal:", hre.ethers.formatUnits(minWithdrawal, 6), "USDT");
  console.log("   Max Withdrawal/TX:", hre.ethers.formatUnits(maxWithdrawalPerTx, 6), "USDT");
  console.log("   Max Withdrawal/Mês:", hre.ethers.formatUnits(maxWithdrawalPerMonth, 6), "USDT");
  console.log("   Max Treasury/Dia:", hre.ethers.formatUnits(maxTreasuryPerDay, 6), "USDT");
  console.log("   Min Solvency:", Number(minSolvencyBps) / 100, "%");
  console.log("   Circuit Breaker:", await core.circuitBreakerActive() ? "🔴 ATIVO" : "✅ INATIVO");
  console.log("");

  // Verificar roles
  const DEFAULT_ADMIN_ROLE = await core.DEFAULT_ADMIN_ROLE();
  const UPDATER_ROLE = await core.UPDATER_ROLE();
  const DISTRIBUTOR_ROLE = await core.DISTRIBUTOR_ROLE();
  const TREASURY_ROLE = await core.TREASURY_ROLE();

  const hasAdmin = await core.hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
  console.log("🔑 Roles:");
  console.log("   DEFAULT_ADMIN_ROLE:", hasAdmin ? "✅" : "❌", adminAddress);
  console.log("");

  // ========== SALVAR DADOS ==========
  const deployData = {
    network: networkName,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      iDeepXCoreV10: coreAddress,
      USDT: usdtAddress
    },
    config: {
      subscriptionFee: subscriptionFee.toString(),
      subscriptionDuration: subscriptionDuration.toString(),
      minWithdrawal: minWithdrawal.toString(),
      maxWithdrawalPerTx: maxWithdrawalPerTx.toString(),
      maxWithdrawalPerMonth: maxWithdrawalPerMonth.toString(),
      maxTreasuryPerDay: maxTreasuryPerDay.toString(),
      minSolvencyBps: minSolvencyBps.toString()
    },
    roles: {
      admin: adminAddress,
      DEFAULT_ADMIN_ROLE: DEFAULT_ADMIN_ROLE,
      UPDATER_ROLE: UPDATER_ROLE,
      DISTRIBUTOR_ROLE: DISTRIBUTOR_ROLE,
      TREASURY_ROLE: TREASURY_ROLE
    }
  };

  const filename = `deploy-v10-${networkName.toLowerCase().replace(' ', '-')}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deployData, null, 2));
  console.log("💾 Dados salvos em:", filename);
  console.log("");

  // ========== PRÓXIMOS PASSOS ==========
  console.log("═".repeat(80));
  console.log("\n📋 PRÓXIMOS PASSOS:\n");
  console.log("1️⃣  Conceder roles adicionais (se necessário):");
  console.log("    - UPDATER_ROLE: Backend/Oracle");
  console.log("    - DISTRIBUTOR_ROLE: Tesouraria de distribuição");
  console.log("    - TREASURY_ROLE: Carteira de saques operacionais");
  console.log("");
  console.log("2️⃣  Atualizar .env.local do frontend:");
  console.log(`    NEXT_PUBLIC_CONTRACT_V10=${coreAddress}`);
  console.log("");
  console.log("3️⃣  Verificar contrato no BSCScan:");
  const scanUrl = isTestnet
    ? `https://testnet.bscscan.com/address/${coreAddress}`
    : `https://bscscan.com/address/${coreAddress}`;
  console.log(`    ${scanUrl}`);
  console.log("");
  console.log("4️⃣  Testar funções básicas:");
  console.log("    - activateSubscriptionWithUSDT()");
  console.log("    - creditPerformance() (como DISTRIBUTOR)");
  console.log("    - withdraw()");
  console.log("");
  console.log("5️⃣  Desenvolver backend MLM off-chain");
  console.log("    - Implementar cálculo 25% em 10 níveis");
  console.log("    - Integrar com GMI (seguro)");
  console.log("    - Webhook PnL mensal");
  console.log("");
  console.log("═".repeat(80));
  console.log("\n✅ DEPLOY CONCLUÍDO COM SUCESSO!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erro no deploy:", error);
    process.exit(1);
  });
