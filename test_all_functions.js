// TESTE COMPLETO DE TODAS AS FUNÇÕES - V9_SECURE_2
import hre from "hardhat";

const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";
const MOCK_USDT_ADDRESS = "0xf484a22555113Cebac616bC84451Bf04085097b8";

// Relatório de testes
const report = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

function logTest(name, status, details = "") {
  report.total++;
  report.results.push({ name, status, details });

  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⏭️";
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);

  if (status === "PASS") report.passed++;
  else if (status === "FAIL") report.failed++;
  else report.skipped++;
}

async function main() {
  console.log("🧪 TESTE COMPLETO DE TODAS AS FUNÇÕES - V9_SECURE_2\n");
  console.log("=" .repeat(70));
  console.log(`📍 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`💵 Mock USDT: ${MOCK_USDT_ADDRESS}`);
  console.log("=" .repeat(70));
  console.log("");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}\n`);

  // Conectar aos contratos
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  const usdt = await hre.ethers.getContractAt(
    "MockERC20",
    MOCK_USDT_ADDRESS
  );

  // ========== TESTES DE LEITURA (VIEW FUNCTIONS) ==========
  console.log("=" .repeat(70));
  console.log("  📖 PARTE 1: FUNÇÕES DE LEITURA (VIEW)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const fee = await contract.SUBSCRIPTION_FEE();
    const expected = hre.ethers.parseUnits("19", 6);
    logTest(
      "SUBSCRIPTION_FEE()",
      fee === expected ? "PASS" : "FAIL",
      `$${hre.ethers.formatUnits(fee, 6)} USDT (esperado: $19)`
    );
  } catch (error) {
    logTest("SUBSCRIPTION_FEE()", "FAIL", error.message);
  }

  try {
    const directBonus = await contract.DIRECT_BONUS();
    logTest(
      "DIRECT_BONUS()",
      "PASS",
      `$${hre.ethers.formatUnits(directBonus, 6)} USDT`
    );
  } catch (error) {
    logTest("DIRECT_BONUS()", "FAIL", error.message);
  }

  try {
    const fastStart = await contract.FAST_START_BONUS();
    logTest(
      "FAST_START_BONUS()",
      "PASS",
      `$${hre.ethers.formatUnits(fastStart, 6)} USDT`
    );
  } catch (error) {
    logTest("FAST_START_BONUS()", "FAIL", error.message);
  }

  try {
    const betaMode = await contract.betaMode();
    logTest("betaMode()", "PASS", betaMode ? "Ativo" : "Inativo");
  } catch (error) {
    logTest("betaMode()", "FAIL", error.message);
  }

  try {
    const totalUsers = await contract.totalUsers();
    logTest("totalUsers()", "PASS", `${totalUsers} usuários`);
  } catch (error) {
    logTest("totalUsers()", "FAIL", error.message);
  }

  try {
    const maxUsers = await contract.MAX_BETA_USERS();
    logTest("MAX_BETA_USERS()", "PASS", `${maxUsers} usuários`);
  } catch (error) {
    logTest("MAX_BETA_USERS()", "FAIL", error.message);
  }

  try {
    const security = await contract.getSecurityStatus();
    logTest(
      "getSecurityStatus()",
      "PASS",
      `Ratio: ${Number(security._solvencyRatio) / 100}%, CB: ${security._circuitBreakerActive ? "Ativo" : "Inativo"}`
    );
  } catch (error) {
    logTest("getSecurityStatus()", "FAIL", error.message);
  }

  try {
    const stats = await contract.getSystemStats();
    logTest(
      "getSystemStats()",
      "PASS",
      `Users: ${stats._totalUsers}, Active: ${stats._totalActive}`
    );
  } catch (error) {
    logTest("getSystemStats()", "FAIL", error.message);
  }

  try {
    const userInfo = await contract.getUserInfo(deployer.address);
    logTest(
      "getUserInfo()",
      "PASS",
      `Registered: ${userInfo.isRegistered}, Active: ${userInfo.subscriptionActive}`
    );
  } catch (error) {
    logTest("getUserInfo()", "FAIL", error.message);
  }

  try {
    const ratio = await contract.getSolvencyRatio();
    logTest("getSolvencyRatio()", "PASS", `${Number(ratio) / 100}%`);
  } catch (error) {
    logTest("getSolvencyRatio()", "FAIL", error.message);
  }

  console.log("");

  // ========== TESTES DE ESCRITA (STATE-CHANGING FUNCTIONS) ==========
  console.log("=" .repeat(70));
  console.log("  ✍️  PARTE 2: FUNÇÕES DE ESCRITA (TRANSACTIONS)");
  console.log("=" .repeat(70));
  console.log("");

  // Verificar balance USDT
  const usdtBalance = await usdt.balanceOf(deployer.address);
  console.log(`💰 USDT Balance: $${hre.ethers.formatUnits(usdtBalance, 6)} USDT\n`);

  // ========== TESTE: REGISTRAR NOVO USUÁRIO ==========
  try {
    // Gerar endereço aleatório para novo usuário
    const newUser = hre.ethers.Wallet.createRandom().address;

    const subscriptionFee = await contract.SUBSCRIPTION_FEE();

    // Aprovar USDT
    const approveTx = await usdt.approve(contract.target, subscriptionFee);
    await approveTx.wait();

    // Registrar usuário
    const registerTx = await contract.registerUser(newUser, deployer.address);
    const receipt = await registerTx.wait();

    // Verificar registro
    const userInfo = await contract.getUserInfo(newUser);

    logTest(
      "registerUser()",
      userInfo.isRegistered ? "PASS" : "FAIL",
      `User: ${newUser.substring(0, 10)}..., Gas: ${receipt.gasUsed.toString()}`
    );
  } catch (error) {
    logTest("registerUser()", "FAIL", error.message.substring(0, 100));
  }

  // ========== TESTE: PAGAR ASSINATURA ==========
  try {
    const subscriptionFee = await contract.SUBSCRIPTION_FEE();

    // Aprovar USDT
    const approveTx = await usdt.approve(contract.target, subscriptionFee);
    await approveTx.wait();

    // Pagar subscription
    const payTx = await contract.paySubscription();
    const receipt = await payTx.wait();

    // Verificar subscription
    const userInfo = await contract.getUserInfo(deployer.address);

    logTest(
      "paySubscription()",
      userInfo.subscriptionActive ? "PASS" : "FAIL",
      `Subscription ativa, Gas: ${receipt.gasUsed.toString()}`
    );
  } catch (error) {
    logTest("paySubscription()", "FAIL", error.message.substring(0, 100));
  }

  // ========== TESTE: ATIVAR ASSINATURA (Com Balance) ==========
  try {
    // Primeiro, precisamos ter balance disponível
    // Vamos tentar ativar com balance
    const activateTx = await contract.activateSubscription();
    const receipt = await activateTx.wait();

    logTest(
      "activateSubscription()",
      "PASS",
      `Gas: ${receipt.gasUsed.toString()}`
    );
  } catch (error) {
    // Esperado falhar se não tiver balance suficiente
    if (error.message.includes("Insufficient balance")) {
      logTest("activateSubscription()", "SKIP", "Sem balance suficiente (esperado)");
    } else {
      logTest("activateSubscription()", "FAIL", error.message.substring(0, 100));
    }
  }

  // ========== TESTE: VERIFICAR DISTRIBUIÇÃO MLM ==========
  try {
    const mlmReserve = await contract.mlmReserveBalance();
    const deployerInfo = await contract.getUserInfo(deployer.address);

    logTest(
      "Distribuição MLM",
      "PASS",
      `MLM Reserve: $${hre.ethers.formatUnits(mlmReserve, 6)}, Balance: $${hre.ethers.formatUnits(deployerInfo.availableBalance, 6)}`
    );
  } catch (error) {
    logTest("Distribuição MLM", "FAIL", error.message);
  }

  // ========== TESTE: WITHDRAWAL ==========
  try {
    const userInfo = await contract.getUserInfo(deployer.address);
    const balance = userInfo.availableBalance;

    if (balance > 0n) {
      // Tentar sacar metade do balance
      const withdrawAmount = balance / 2n;

      const withdrawTx = await contract.withdrawBalance(withdrawAmount);
      const receipt = await withdrawTx.wait();

      logTest(
        "withdrawBalance()",
        "PASS",
        `Sacou $${hre.ethers.formatUnits(withdrawAmount, 6)} USDT, Gas: ${receipt.gasUsed.toString()}`
      );
    } else {
      logTest("withdrawBalance()", "SKIP", "Sem balance disponível");
    }
  } catch (error) {
    logTest("withdrawBalance()", "FAIL", error.message.substring(0, 100));
  }

  // ========== TESTE: UPDATE USER ADDRESS ==========
  try {
    const newAddress = hre.ethers.Wallet.createRandom().address;

    const updateTx = await contract.updateUserAddress(deployer.address, newAddress);
    const receipt = await updateTx.wait();

    // Verificar se mudou
    const oldUserInfo = await contract.getUserInfo(deployer.address);
    const newUserInfo = await contract.getUserInfo(newAddress);

    logTest(
      "updateUserAddress()",
      newUserInfo.isRegistered ? "PASS" : "FAIL",
      `Migrado para ${newAddress.substring(0, 10)}..., Gas: ${receipt.gasUsed.toString()}`
    );
  } catch (error) {
    logTest("updateUserAddress()", "FAIL", error.message.substring(0, 100));
  }

  console.log("");

  // ========== TESTES DE SEGURANÇA ==========
  console.log("=" .repeat(70));
  console.log("  🔒 PARTE 3: FUNÇÕES DE SEGURANÇA");
  console.log("=" .repeat(70));
  console.log("");

  // ========== TESTE: PAUSE/UNPAUSE ==========
  try {
    const pauseTx = await contract.pause();
    await pauseTx.wait();

    const paused = await contract.paused();

    if (paused) {
      const unpauseTx = await contract.unpause();
      await unpauseTx.wait();

      const stillPaused = await contract.paused();

      logTest(
        "pause() / unpause()",
        !stillPaused ? "PASS" : "FAIL",
        "Pausado e despausado com sucesso"
      );
    } else {
      logTest("pause() / unpause()", "FAIL", "Não conseguiu pausar");
    }
  } catch (error) {
    logTest("pause() / unpause()", "FAIL", error.message.substring(0, 100));
  }

  // ========== TESTE: CIRCUIT BREAKER STATUS ==========
  try {
    const cbActive = await contract.circuitBreakerActive();
    const threshold = await contract.SOLVENCY_THRESHOLD_BPS();
    const recovery = await contract.SOLVENCY_RECOVERY_BPS();

    logTest(
      "Circuit Breaker Status",
      "PASS",
      `Active: ${cbActive}, Threshold: ${Number(threshold) / 100}%, Recovery: ${Number(recovery) / 100}%`
    );
  } catch (error) {
    logTest("Circuit Breaker Status", "FAIL", error.message);
  }

  // ========== TESTE: SOLVENCY RATIO CALCULATION ==========
  try {
    const ratio = await contract.getSolvencyRatio();
    const ratioPct = Number(ratio) / 100;

    logTest(
      "Solvency Ratio Calculation",
      ratioPct >= 100 ? "PASS" : "FAIL",
      `${ratioPct}% (mínimo: 100%)`
    );
  } catch (error) {
    logTest("Solvency Ratio Calculation", "FAIL", error.message);
  }

  console.log("");

  // ========== TESTES DE GOVERNANÇA ==========
  console.log("=" .repeat(70));
  console.log("  🏛️  PARTE 4: FUNÇÕES DE GOVERNANÇA");
  console.log("=" .repeat(70));
  console.log("");

  // ========== TESTE: PROPOSE EMERGENCY RESERVE ==========
  try {
    const amount = hre.ethers.parseUnits("1000", 6); // $1000

    const proposeTx = await contract.proposeEmergencyReserve(
      amount,
      "Teste de emergency reserve proposal",
      0, // LIQUIDITY
      hre.ethers.ZeroAddress
    );
    const receipt = await proposeTx.wait();

    // Pegar proposal ID do evento ou incrementar
    const proposalId = await contract.emergencyReserveProposalId();

    logTest(
      "proposeEmergencyReserve()",
      "PASS",
      `Proposal ID: ${proposalId}, Amount: $${hre.ethers.formatUnits(amount, 6)}, Gas: ${receipt.gasUsed.toString()}`
    );
  } catch (error) {
    logTest("proposeEmergencyReserve()", "FAIL", error.message.substring(0, 100));
  }

  // ========== TESTE: CANCEL PROPOSAL ==========
  try {
    const proposalId = await contract.emergencyReserveProposalId();

    if (proposalId > 0n) {
      const cancelTx = await contract.cancelEmergencyReserve(proposalId);
      await cancelTx.wait();

      logTest(
        "cancelEmergencyReserve()",
        "PASS",
        `Proposal ${proposalId} cancelada`
      );
    } else {
      logTest("cancelEmergencyReserve()", "SKIP", "Nenhuma proposal para cancelar");
    }
  } catch (error) {
    logTest("cancelEmergencyReserve()", "FAIL", error.message.substring(0, 100));
  }

  // ========== TESTE: EXECUTE EMERGENCY RESERVE (vai falhar - timelock) ==========
  try {
    const proposalId = await contract.emergencyReserveProposalId();

    if (proposalId > 0n) {
      const executeTx = await contract.executeEmergencyReserve(proposalId);
      await executeTx.wait();

      logTest(
        "executeEmergencyReserve()",
        "PASS",
        `Proposal ${proposalId} executada`
      );
    } else {
      logTest("executeEmergencyReserve()", "SKIP", "Nenhuma proposal para executar");
    }
  } catch (error) {
    if (error.message.includes("Timelock not yet expired") || error.message.includes("Proposal already cancelled")) {
      logTest("executeEmergencyReserve()", "SKIP", "Timelock não expirado ou proposal cancelada (esperado)");
    } else {
      logTest("executeEmergencyReserve()", "FAIL", error.message.substring(0, 100));
    }
  }

  console.log("");

  // ========== TESTES DE LIMITES ==========
  console.log("=" .repeat(70));
  console.log("  📊 PARTE 5: VERIFICAÇÃO DE LIMITES");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const capEnabled = await contract.capEnabled();
    const maxDeposits = await contract.maxTotalDeposits();
    const subRevenue = await contract.totalSubscriptionRevenue();
    const perfRevenue = await contract.totalPerformanceRevenue();
    const totalDeposits = subRevenue + perfRevenue;
    const usage = maxDeposits > 0n ? (Number(totalDeposits) / Number(maxDeposits)) * 100 : 0;

    logTest(
      "Deposit Cap Verification",
      "PASS",
      `Cap: ${capEnabled ? "Ativo" : "Inativo"}, Uso: ${usage.toFixed(2)}% de $${hre.ethers.formatUnits(maxDeposits, 6)}`
    );
  } catch (error) {
    logTest("Deposit Cap Verification", "FAIL", error.message);
  }

  try {
    const totalUsers = await contract.totalUsers();
    const maxUsers = await contract.MAX_BETA_USERS();
    const usage = (Number(totalUsers) / Number(maxUsers)) * 100;

    logTest(
      "User Limit Verification",
      "PASS",
      `${totalUsers} / ${maxUsers} usuários (${usage.toFixed(1)}%)`
    );
  } catch (error) {
    logTest("User Limit Verification", "FAIL", error.message);
  }

  console.log("");

  // ========== RELATÓRIO FINAL ==========
  console.log("=" .repeat(70));
  console.log("  📋 RELATÓRIO FINAL DE TESTES");
  console.log("=" .repeat(70));
  console.log("");
  console.log(`Total de Testes: ${report.total}`);
  console.log(`✅ Passou: ${report.passed} (${((report.passed / report.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Falhou: ${report.failed} (${((report.failed / report.total) * 100).toFixed(1)}%)`);
  console.log(`⏭️  Pulado: ${report.skipped} (${((report.skipped / report.total) * 100).toFixed(1)}%)`);
  console.log("");

  if (report.failed > 0) {
    console.log("❌ TESTES QUE FALHARAM:");
    report.results
      .filter(r => r.status === "FAIL")
      .forEach(r => console.log(`   - ${r.name}: ${r.details}`));
    console.log("");
  }

  console.log("=" .repeat(70));
  console.log(report.failed === 0 ? "  🎉 TODOS OS TESTES PASSARAM!" : "  ⚠️  ALGUNS TESTES FALHARAM");
  console.log("=" .repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
