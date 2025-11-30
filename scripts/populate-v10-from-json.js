import hre from "hardhat";
import fs from "fs";

// ============================================================================
// 🎯 POPULAR iDeepXCoreV10 COM DADOS EXISTENTES
// ============================================================================
// Usa carteiras já geradas em testnet-population-*.json
// Registra todos os clientes no contrato V10

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

function log(message, color = COLORS.reset) {
  console.log(color + message + COLORS.reset);
}

// Configuração V10
const CONFIG = {
  contractV10: "0x9F8bB784f96ADd0B139e90E652eDe926da3c3653",
  usdtAddress: "0x8d06e1376F205Ca66E034be72F50c889321110fA",
  inputFile: "testnet-population-1762219899726.json",
  subscriptionFee: "19" // $19 USDT no V10
};

async function main() {
  console.log("\n" + "=".repeat(70));
  log("🚀 POPULAR iDeepXCoreV10 - USANDO CARTEIRAS EXISTENTES", COLORS.bright + COLORS.cyan);
  console.log("=".repeat(70) + "\n");

  const startTime = Date.now();

  // ============================================================================
  // 1. SETUP
  // ============================================================================
  log("\n📋 PASSO 1/5: Setup Inicial", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  // Ler dados existentes
  if (!fs.existsSync(CONFIG.inputFile)) {
    log(`\n   ❌ ERRO: Arquivo ${CONFIG.inputFile} não encontrado!`, COLORS.red);
    process.exit(1);
  }

  const inputData = JSON.parse(fs.readFileSync(CONFIG.inputFile, "utf8"));
  log(`   ✅ Arquivo lido: ${CONFIG.inputFile}`, COLORS.green);
  log(`   📊 Total de carteiras: ${inputData.wallets.length}`, COLORS.cyan);

  // Conectar deployer (admin)
  const [deployer] = await hre.ethers.getSigners();
  log(`   👤 Admin: ${deployer.address}`, COLORS.cyan);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  log(`   💰 Saldo admin: ${hre.ethers.formatEther(balance)} tBNB`, COLORS.green);

  // Conectar contratos
  const contractV10 = await hre.ethers.getContractAt(
    "iDeepXCoreV10",
    CONFIG.contractV10
  );

  const usdt = await hre.ethers.getContractAt(
    "MockUSDT",
    CONFIG.usdtAddress
  );

  log(`   ✅ Contratos V10 conectados`, COLORS.green);

  // Verificar roles do admin
  const UPDATER_ROLE = await contractV10.UPDATER_ROLE();
  const hasUpdaterRole = await contractV10.hasRole(UPDATER_ROLE, deployer.address);

  if (!hasUpdaterRole) {
    log(`\n   ❌ ERRO: Admin não tem UPDATER_ROLE!`, COLORS.red);
    log(`   Configure roles primeiro.`, COLORS.red);
    process.exit(1);
  }

  log(`   ✅ Admin tem UPDATER_ROLE`, COLORS.green);

  // ============================================================================
  // 2. VERIFICAR SALDOS DAS CARTEIRAS
  // ============================================================================
  log("\n\n📋 PASSO 2/5: Verificando Saldos", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  let walletsReady = 0;
  const subscriptionAmount = hre.ethers.parseUnits(CONFIG.subscriptionFee, 6);

  for (let i = 0; i < inputData.wallets.length; i++) {
    const w = inputData.wallets[i];
    const wallet = new hre.ethers.Wallet(w.privateKey, hre.ethers.provider);

    const bnbBalance = await hre.ethers.provider.getBalance(wallet.address);
    const usdtBalance = await usdt.balanceOf(wallet.address);

    const hasBnb = bnbBalance > hre.ethers.parseEther("0.001");
    const hasUsdt = usdtBalance >= subscriptionAmount;

    if (hasBnb && hasUsdt) {
      walletsReady++;
    }

    if ((i + 1) % 5 === 0 || i === inputData.wallets.length - 1) {
      log(`   ✅ Verificadas ${i + 1}/${inputData.wallets.length} carteiras`, COLORS.green);
    }
  }

  log(`\n   📊 Carteiras prontas: ${walletsReady}/${inputData.wallets.length}`, COLORS.cyan);

  if (walletsReady === 0) {
    log(`   ❌ Nenhuma carteira tem tBNB e USDT!`, COLORS.red);
    process.exit(1);
  }

  // ============================================================================
  // 3. ATIVAR USUÁRIOS (ADMIN)
  // ============================================================================
  log("\n\n📋 PASSO 3/5: Ativando Usuários (Admin)", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  log(`   🔧 Setando status ativo e nível 1 para cada usuário...`, COLORS.cyan);

  let activatedCount = 0;

  for (let i = 0; i < inputData.wallets.length; i++) {
    const w = inputData.wallets[i];

    try {
      // Setar usuário como ativo
      const setActiveTx = await contractV10.setUserActive(w.address, true);
      await setActiveTx.wait();

      // Aguardar 500ms entre transações
      await new Promise(resolve => setTimeout(resolve, 500));

      // Setar nível 1
      const setLevelTx = await contractV10.setUnlockedLevels(w.address, 1);
      await setLevelTx.wait();

      activatedCount++;
      inputData.wallets[i].activatedByAdmin = true;

      log(`   ✅ Usuário ${i + 1}/${inputData.wallets.length} ativado (${w.address})`, COLORS.green);

      // Aguardar 500ms antes do próximo
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      log(`   ❌ Erro ao ativar usuário ${i + 1}: ${error.message.slice(0, 100)}`, COLORS.red);
      inputData.wallets[i].activatedByAdmin = false;
      inputData.wallets[i].activationError = error.message.slice(0, 200);
    }
  }

  log(`\n   🎉 ${activatedCount}/${inputData.wallets.length} usuários ativados pelo admin!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 4. PAGAR SUBSCRIPTIONS (USUÁRIOS)
  // ============================================================================
  log("\n\n📋 PASSO 4/5: Ativando Subscriptions (Usuários)", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  log(`   💵 Cada usuário vai aprovar USDT e pagar subscription...`, COLORS.cyan);

  let subscribedCount = 0;

  for (let i = 0; i < inputData.wallets.length; i++) {
    const w = inputData.wallets[i];

    // Pular se não foi ativado pelo admin
    if (!w.activatedByAdmin) {
      log(`   ⏭️  Pulando usuário ${i + 1} (não ativado)`, COLORS.yellow);
      continue;
    }

    try {
      const wallet = new hre.ethers.Wallet(w.privateKey, hre.ethers.provider);

      // Aprovar USDT
      const approveTx = await usdt.connect(wallet).approve(
        CONFIG.contractV10,
        subscriptionAmount
      );
      await approveTx.wait();

      // Aguardar 1 segundo entre transações
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ativar subscription
      const subscribeTx = await contractV10.connect(wallet).activateSubscriptionWithUSDT();
      await subscribeTx.wait();

      subscribedCount++;
      inputData.wallets[i].subscribed = true;

      log(`   ✅ Subscription ${i + 1}/${inputData.wallets.length} ativada (${w.address})`, COLORS.green);

      // Aguardar 1 segundo antes do próximo
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      log(`   ❌ Erro ao ativar subscription ${i + 1}: ${error.message.slice(0, 100)}`, COLORS.red);
      inputData.wallets[i].subscribed = false;
      inputData.wallets[i].subscriptionError = error.message.slice(0, 200);
    }
  }

  log(`\n   🎉 ${subscribedCount}/${activatedCount} subscriptions ativadas!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 5. SALVAR RESULTADOS
  // ============================================================================
  log("\n\n📋 PASSO 5/5: Salvando Resultados", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const outputData = {
    ...inputData,
    v10_metadata: {
      contractV10: CONFIG.contractV10,
      usdtAddress: CONFIG.usdtAddress,
      timestamp: new Date().toISOString(),
      activatedByAdmin: activatedCount,
      subscribed: subscribedCount
    },
    v10_summary: {
      totalActivated: activatedCount,
      totalSubscribed: subscribedCount,
      subscriptionFee: CONFIG.subscriptionFee,
      totalRevenue: subscribedCount * parseFloat(CONFIG.subscriptionFee),
      successRate: ((subscribedCount / inputData.wallets.length) * 100).toFixed(1) + "%"
    }
  };

  const filename = `testnet-population-v10-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(outputData, null, 2));

  log(`   ✅ Resultados salvos em: ${filename}`, COLORS.green);

  // ============================================================================
  // RESUMO FINAL
  // ============================================================================
  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log("\n" + "=".repeat(70));
  log("✅ POPULAÇÃO V10 COMPLETA!", COLORS.bright + COLORS.green);
  console.log("=".repeat(70));

  log(`\n⏱️  Tempo total: ${minutes}m ${seconds}s`, COLORS.cyan);

  log(`\n📊 RESUMO:`, COLORS.bright + COLORS.yellow);
  log(`   ✅ ${inputData.wallets.length} carteiras processadas`, COLORS.green);
  log(`   ✅ ${activatedCount} usuários ativados pelo admin (${((activatedCount / inputData.wallets.length) * 100).toFixed(1)}%)`, COLORS.green);
  log(`   ✅ ${subscribedCount} subscriptions pagas (${((subscribedCount / inputData.wallets.length) * 100).toFixed(1)}%)`, COLORS.green);
  log(`   💵 $${subscribedCount * parseFloat(CONFIG.subscriptionFee)} em receita de subscriptions`, COLORS.green);
  log(`   📁 Dados salvos em: ${filename}`, COLORS.green);

  log(`\n🎯 CONTRATO V10:`, COLORS.bright + COLORS.cyan);
  log(`   📍 Endereço: ${CONFIG.contractV10}`, COLORS.cyan);
  log(`   🌐 BSCScan: https://testnet.bscscan.com/address/${CONFIG.contractV10}`, COLORS.cyan);

  log(`\n💡 PRÓXIMOS PASSOS:`, COLORS.bright + COLORS.yellow);
  log(`   1. Verificar usuários registrados no contrato`, COLORS.yellow);
  log(`   2. Testar login no frontend com essas wallets`, COLORS.yellow);
  log(`   3. Creditar performance fees para testar saques`, COLORS.yellow);
  log(`   4. Popular banco MongoDB com esses dados`, COLORS.yellow);

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO FATAL:\n", error);
    process.exit(1);
  });
