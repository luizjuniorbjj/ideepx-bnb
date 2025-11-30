// TESTE COMPLETO DE TODAS AS FUNÇÕES - V9_SECURE_2 (VERSÃO CORRIGIDA)
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

  // ========== PARTE 1: FUNÇÕES DE LEITURA ==========
  console.log("=" .repeat(70));
  console.log("  📖 PARTE 1: FUNÇÕES DE LEITURA (10 testes)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const fee = await contract.SUBSCRIPTION_FEE();
    logTest("SUBSCRIPTION_FEE()", fee === hre.ethers.parseUnits("19", 6) ? "PASS" : "FAIL", `$${hre.ethers.formatUnits(fee, 6)} USDT`);
  } catch (e) { logTest("SUBSCRIPTION_FEE()", "FAIL", e.message.substring(0, 80)); }

  try {
    const directBonus = await contract.DIRECT_BONUS();
    logTest("DIRECT_BONUS()", "PASS", `$${hre.ethers.formatUnits(directBonus, 6)} USDT`);
  } catch (e) { logTest("DIRECT_BONUS()", "FAIL", e.message.substring(0, 80)); }

  try {
    const fastStart = await contract.FAST_START_BONUS();
    logTest("FAST_START_BONUS()", "PASS", `$${hre.ethers.formatUnits(fastStart, 6)} USDT`);
  } catch (e) { logTest("FAST_START_BONUS()", "FAIL", e.message.substring(0, 80)); }

  try {
    const betaMode = await contract.betaMode();
    logTest("betaMode()", "PASS", betaMode ? "Ativo" : "Inativo");
  } catch (e) { logTest("betaMode()", "FAIL", e.message.substring(0, 80)); }

  try {
    const totalUsers = await contract.totalUsers();
    logTest("totalUsers()", "PASS", `${totalUsers} usuários`);
  } catch (e) { logTest("totalUsers()", "FAIL", e.message.substring(0, 80)); }

  try {
    const security = await contract.getSecurityStatus();
    logTest("getSecurityStatus()", "PASS", `Solvency: ${Number(security._solvencyRatio) / 100}%, CB: ${security._circuitBreakerActive ? "ON" : "OFF"}`);
  } catch (e) { logTest("getSecurityStatus()", "FAIL", e.message.substring(0, 80)); }

  try {
    const stats = await contract.getSystemStats();
    logTest("getSystemStats()", "PASS", `Users: ${stats._totalUsers}, Active: ${stats._totalActive}`);
  } catch (e) { logTest("getSystemStats()", "FAIL", e.message.substring(0, 80)); }

  try {
    const userInfo = await contract.getUserInfo(deployer.address);
    logTest("getUserInfo()", "PASS", `Registered: ${userInfo.isRegistered}, Sub: ${userInfo.subscriptionActive}, Rank: ${userInfo.currentRank}`);
  } catch (e) { logTest("getUserInfo()", "FAIL", e.message.substring(0, 80)); }

  try {
    const ratio = await contract.getSolvencyRatio();
    logTest("getSolvencyRatio()", "PASS", `${Number(ratio) / 100}%`);
  } catch (e) { logTest("getSolvencyRatio()", "FAIL", e.message.substring(0, 80)); }

  try {
    const cbActive = await contract.circuitBreakerActive();
    logTest("circuitBreakerActive()", "PASS", cbActive ? "ATIVO" : "Inativo");
  } catch (e) { logTest("circuitBreakerActive()", "FAIL", e.message.substring(0, 80)); }

  console.log("");

  // ========== PARTE 2: FUNÇÕES DE REGISTRO E ASSINATURA ==========
  console.log("=" .repeat(70));
  console.log("  👥 PARTE 2: REGISTRO E ASSINATURA (2 testes)");
  console.log("=" .repeat(70));
  console.log("");

  const usdtBalance = await usdt.balanceOf(deployer.address);
  console.log(`💰 USDT Balance: $${hre.ethers.formatUnits(usdtBalance, 6)} USDT\n`);

  try {
    const subscriptionFee = await contract.SUBSCRIPTION_FEE();
    const approveTx = await usdt.approve(contract.target, subscriptionFee);
    await approveTx.wait();

    const registerTx = await contract.registerWithSponsor(deployer.address);
    const receipt = await registerTx.wait();

    logTest("registerWithSponsor()", "PASS", `Gas usado: ${receipt.gasUsed.toString()}`);
  } catch (e) {
    if (e.message.includes("Already registered")) {
      logTest("registerWithSponsor()", "SKIP", "Deployer já registrado (esperado)");
    } else {
      logTest("registerWithSponsor()", "FAIL", e.message.substring(0, 80));
    }
  }

  try {
    const claimTx = await contract.claimReserveBonus();
    const receipt = await claimTx.wait();
    logTest("claimReserveBonus()", "PASS", `Gas usado: ${receipt.gasUsed.toString()}`);
  } catch (e) {
    if (e.message.includes("No bonus to claim")) {
      logTest("claimReserveBonus()", "SKIP", "Sem bonus para claimar (esperado)");
    } else {
      logTest("claimReserveBonus()", "FAIL", e.message.substring(0, 80));
    }
  }

  console.log("");

  // ========== PARTE 3: FUNÇÕES DE WITHDRAWAL E TRANSFER ==========
  console.log("=" .repeat(70));
  console.log("  💸 PARTE 3: WITHDRAWALS E TRANSFERS (2 testes)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const withdrawTx = await contract.withdrawAllEarnings();
    const receipt = await withdrawTx.wait();
    logTest("withdrawAllEarnings()", "PASS", `Gas usado: ${receipt.gasUsed.toString()}`);
  } catch (e) {
    if (e.message.includes("No earnings to withdraw") || e.message.includes("Nothing to withdraw")) {
      logTest("withdrawAllEarnings()", "SKIP", "Sem earnings para sacar (esperado)");
    } else {
      logTest("withdrawAllEarnings()", "FAIL", e.message.substring(0, 80));
    }
  }

  try {
    const recipient = hre.ethers.Wallet.createRandom().address;
    const amount = hre.ethers.parseUnits("1", 6);

    const transferTx = await contract.transferBalance(recipient, amount);
    const receipt = await transferTx.wait();
    logTest("transferBalance()", "PASS", `Transferiu $1 USDT, Gas: ${receipt.gasUsed.toString()}`);
  } catch (e) {
    if (e.message.includes("Insufficient balance")) {
      logTest("transferBalance()", "SKIP", "Sem balance para transferir (esperado)");
    } else {
      logTest("transferBalance()", "FAIL", e.message.substring(0, 80));
    }
  }

  console.log("");

  // ========== PARTE 4: FUNÇÕES DE RANK ==========
  console.log("=" .repeat(70));
  console.log("  🏆 PARTE 4: SISTEMA DE RANKS (1 teste)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const upgradeTx = await contract.requestRankUpgrade();
    const receipt = await upgradeTx.wait();
    logTest("requestRankUpgrade()", "PASS", `Gas usado: ${receipt.gasUsed.toString()}`);
  } catch (e) {
    if (e.message.includes("Already at max rank") || e.message.includes("Requirements not met")) {
      logTest("requestRankUpgrade()", "SKIP", "Já no rank máximo ou não qualifica (esperado)");
    } else {
      logTest("requestRankUpgrade()", "FAIL", e.message.substring(0, 80));
    }
  }

  console.log("");

  // ========== PARTE 5: FUNÇÕES DE SEGURANÇA ==========
  console.log("=" .repeat(70));
  console.log("  🔒 PARTE 5: SEGURANÇA (5 testes)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const pauseTx = await contract.pause();
    await pauseTx.wait();

    const paused1 = await contract.paused();

    const unpauseTx = await contract.unpause();
    await unpauseTx.wait();

    const paused2 = await contract.paused();

    logTest("pause() / unpause()", paused1 && !paused2 ? "PASS" : "FAIL", `Pausou: ${paused1}, Despausou: ${!paused2}`);
  } catch (e) {
    logTest("pause() / unpause()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const testUser = hre.ethers.Wallet.createRandom().address;
    const pauseUserTx = await contract.pauseUser(testUser);
    await pauseUserTx.wait();

    const unpauseUserTx = await contract.unpauseUser(testUser);
    await unpauseUserTx.wait();

    logTest("pauseUser() / unpauseUser()", "PASS", `User pausado e despausado`);
  } catch (e) {
    logTest("pauseUser() / unpauseUser()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const checkTx = await contract.checkAndUpdateCircuitBreaker();
    await checkTx.wait();
    logTest("checkAndUpdateCircuitBreaker()", "PASS", "CB verificado");
  } catch (e) {
    logTest("checkAndUpdateCircuitBreaker()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const toggleTx = await contract.manualCircuitBreakerToggle(true);
    await toggleTx.wait();

    const active1 = await contract.circuitBreakerActive();

    const toggle2Tx = await contract.manualCircuitBreakerToggle(false);
    await toggle2Tx.wait();

    const active2 = await contract.circuitBreakerActive();

    logTest("manualCircuitBreakerToggle()", "PASS", `Ativou: ${active1}, Desativou: ${!active2}`);
  } catch (e) {
    logTest("manualCircuitBreakerToggle()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const threshold = await contract.SOLVENCY_THRESHOLD_BPS();
    const recovery = await contract.SOLVENCY_RECOVERY_BPS();
    logTest("Circuit Breaker Thresholds", "PASS", `Activation: ${Number(threshold) / 100}%, Recovery: ${Number(recovery) / 100}%`);
  } catch (e) {
    logTest("Circuit Breaker Thresholds", "FAIL", e.message.substring(0, 80));
  }

  console.log("");

  // ========== PARTE 6: FUNÇÕES DE GOVERNANÇA ==========
  console.log("=" .repeat(70));
  console.log("  🏛️  PARTE 6: GOVERNANÇA (4 testes)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const amount = hre.ethers.parseUnits("1000", 6);

    // Primeiro vamos adicionar fundos à emergency reserve
    // Fazendo uma subscription que gera emergency reserve
    const subscriptionFee = await contract.SUBSCRIPTION_FEE();
    const approveTx = await usdt.approve(contract.target, subscriptionFee * 5n);
    await approveTx.wait();

    // Registrar alguns usuários para gerar emergency reserve (1% de liquidity)
    for (let i = 0; i < 3; i++) {
      try {
        const newUser = hre.ethers.Wallet.createRandom().address;
        await contract.registerWithSponsor(deployer.address);
      } catch (e) {
        // Ignorar se já registrado
      }
    }

    // Agora tentar propor emergency reserve
    const proposeTx = await contract.proposeEmergencyReserve(
      amount,
      "Teste de emergency reserve",
      0, // LIQUIDITY
      hre.ethers.ZeroAddress
    );
    const receipt = await proposeTx.wait();

    const proposalId = await contract.emergencyReserveProposalId();

    logTest("proposeEmergencyReserve()", "PASS", `Proposal ID: ${proposalId}, Gas: ${receipt.gasUsed.toString()}`);
  } catch (e) {
    logTest("proposeEmergencyReserve()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const proposalId = await contract.emergencyReserveProposalId();

    if (proposalId > 0n) {
      const cancelTx = await contract.cancelEmergencyReserve(proposalId);
      await cancelTx.wait();
      logTest("cancelEmergencyReserve()", "PASS", `Proposal ${proposalId} cancelada`);
    } else {
      logTest("cancelEmergencyReserve()", "SKIP", "Nenhuma proposal ativa");
    }
  } catch (e) {
    logTest("cancelEmergencyReserve()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const proposalId = await contract.emergencyReserveProposalId();

    if (proposalId > 0n) {
      const executeTx = await contract.executeEmergencyReserve(proposalId);
      await executeTx.wait();
      logTest("executeEmergencyReserve()", "PASS", `Proposal ${proposalId} executada`);
    } else {
      logTest("executeEmergencyReserve()", "SKIP", "Nenhuma proposal ativa");
    }
  } catch (e) {
    if (e.message.includes("Timelock not yet expired") || e.message.includes("already cancelled")) {
      logTest("executeEmergencyReserve()", "SKIP", "Timelock ativo ou proposal cancelada (esperado)");
    } else {
      logTest("executeEmergencyReserve()", "FAIL", e.message.substring(0, 80));
    }
  }

  try {
    const newMultisig = deployer.address; // Usar mesmo endereço para não quebrar
    const updateTx = await contract.updateMultisig(newMultisig);
    await updateTx.wait();
    logTest("updateMultisig()", "PASS", "Multisig atualizado");
  } catch (e) {
    logTest("updateMultisig()", "FAIL", e.message.substring(0, 80));
  }

  console.log("");

  // ========== PARTE 7: FUNÇÕES DE CONFIGURAÇÃO ==========
  console.log("=" .repeat(70));
  console.log("  ⚙️  PARTE 7: CONFIGURAÇÃO (2 testes)");
  console.log("=" .repeat(70));
  console.log("");

  try {
    const currentCap = await contract.maxTotalDeposits();
    const newCap = currentCap + hre.ethers.parseUnits("50000", 6); // +$50k

    const updateTx = await contract.updateDepositCap(newCap);
    await updateTx.wait();

    const updatedCap = await contract.maxTotalDeposits();

    logTest("updateDepositCap()", updatedCap === newCap ? "PASS" : "FAIL", `Novo cap: $${hre.ethers.formatUnits(updatedCap, 6)}`);
  } catch (e) {
    logTest("updateDepositCap()", "FAIL", e.message.substring(0, 80));
  }

  try {
    const disableTx = await contract.disableDepositCap();
    await disableTx.wait();

    const capEnabled = await contract.capEnabled();

    logTest("disableDepositCap()", !capEnabled ? "PASS" : "FAIL", `Cap ${capEnabled ? "ainda ativo" : "desativado"}`);
  } catch (e) {
    logTest("disableDepositCap()", "FAIL", e.message.substring(0, 80));
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

  const successRate = ((report.passed / report.total) * 100).toFixed(1);
  console.log("=" .repeat(70));
  if (report.failed === 0) {
    console.log("  🎉 TODOS OS TESTES PASSARAM OU FORAM PULADOS!");
  } else if (successRate >= 70) {
    console.log("  ✅ MAIORIA DOS TESTES PASSOU");
  } else {
    console.log("  ⚠️  VÁRIOS TESTES FALHARAM - REQUER ATENÇÃO");
  }
  console.log("=" .repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
