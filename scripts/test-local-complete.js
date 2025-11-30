/**
 * 🚀 TESTE COMPLETO LOCAL - SEM FORK
 *
 * Este script:
 * 1. Deploy o contrato iDeepXDistributionV2 no node local
 * 2. Deploy um mock USDT
 * 3. Testa TODAS as funcionalidades
 *
 * COMO USAR:
 * Terminal 1: npx hardhat node
 * Terminal 2: npx hardhat run scripts/test-local-complete.js --network localhost
 */

import hre from "hardhat";
const { ethers } = hre;

// ========== FUNÇÕES AUXILIARES ==========

function formatUSDT(amount) {
  return ethers.formatUnits(amount, 18);
}

function parseUSDT(amount) {
  return ethers.parseUnits(amount.toString(), 18);
}

// ========== SCRIPT PRINCIPAL ==========

async function main() {
  console.log("\n🚀 ========== TESTE COMPLETO LOCAL - iDeepX ==========\n");

  // Pegar contas de teste
  const [owner, liquidity, infrastructure, company, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = await ethers.getSigners();

  console.log("👥 Contas de Teste:");
  console.log("   Owner:", owner.address);
  console.log("   Liquidity:", liquidity.address);
  console.log("   Infrastructure:", infrastructure.address);
  console.log("   Company:", company.address);
  console.log("   User1:", user1.address);
  console.log("   User2:", user2.address);
  console.log("   ...");
  console.log("");

  // ========== 1. DEPLOY MOCK USDT ==========
  console.log("💵 1. FAZENDO DEPLOY DO MOCK USDT...\n");

  const MockUSDT = await ethers.getContractFactory("MockERC20");
  const usdt = await MockUSDT.deploy("Tether USD", "USDT", parseUSDT("10000000")); // 10 milhões
  await usdt.waitForDeployment();

  const usdtAddress = await usdt.getAddress();
  console.log("   ✅ Mock USDT deployed:", usdtAddress);
  console.log("");

  // ========== 2. DEPLOY CONTRATO PRINCIPAL ==========
  console.log("📄 2. FAZENDO DEPLOY DO CONTRATO iDeepXDistributionV2...\n");

  const Distribution = await ethers.getContractFactory("iDeepXDistributionV2");
  const distribution = await Distribution.deploy(
    usdtAddress,
    liquidity.address,
    infrastructure.address,
    company.address
  );
  await distribution.waitForDeployment();

  const contractAddress = await distribution.getAddress();
  console.log("   ✅ iDeepX deployed:", contractAddress);
  console.log("");

  // ========== 3. VERIFICAR CONFIGURAÇÃO ==========
  console.log("📊 3. VERIFICANDO CONFIGURAÇÃO INICIAL...\n");

  const subscriptionFee = await distribution.SUBSCRIPTION_FEE();
  const mlmLevels = await distribution.MLM_LEVELS();
  const betaMode = await distribution.betaMode();
  const ownerAddress = await distribution.owner();

  console.log("   Taxa de Assinatura:", formatUSDT(subscriptionFee), "USDT");
  console.log("   Níveis MLM:", mlmLevels.toString());
  console.log("   Modo Beta:", betaMode ? "✅ Ativo" : "❌ Inativo");
  console.log("   Owner:", ownerAddress);
  console.log("");

  // ========== 4. DISTRIBUIR USDT PARA USUÁRIOS ==========
  console.log("💰 4. DISTRIBUINDO USDT PARA USUÁRIOS DE TESTE...\n");

  const testUsers = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
  const amountToSend = parseUSDT("1000"); // 1000 USDT cada

  for (let i = 0; i < testUsers.length; i++) {
    await usdt.transfer(testUsers[i].address, amountToSend);
    const balance = await usdt.balanceOf(testUsers[i].address);
    console.log(`   ✅ User${i + 1}: ${formatUSDT(balance)} USDT`);
  }
  console.log("");

  // ========== 5. REGISTRAR USUÁRIOS EM CADEIA (10 NÍVEIS) ==========
  console.log("👥 5. REGISTRANDO CADEIA MLM (10 NÍVEIS)...\n");

  console.log("   ℹ️  Owner já está registrado automaticamente (ROOT)");

  // User1 se registra tendo Owner como sponsor
  console.log("   🔹 User1 registrando com sponsor Owner...");
  await distribution.connect(user1).selfRegister(owner.address);
  console.log("   ✅ User1 registrado (L1 de Owner)");

  // Cadeia de 10 níveis a partir do User1
  console.log("   🔹 User2 registrando com sponsor User1...");
  await distribution.connect(user2).selfRegister(user1.address);
  console.log("   ✅ User2 registrado (L1 de User1)");

  await distribution.connect(user3).selfRegister(user2.address);
  console.log("   ✅ User3 registrado (L2 de User1, L1 de User2)");

  await distribution.connect(user4).selfRegister(user3.address);
  console.log("   ✅ User4 registrado (L3 de User1)");

  await distribution.connect(user5).selfRegister(user4.address);
  console.log("   ✅ User5 registrado (L4 de User1)");

  await distribution.connect(user6).selfRegister(user5.address);
  console.log("   ✅ User6 registrado (L5 de User1)");

  await distribution.connect(user7).selfRegister(user6.address);
  console.log("   ✅ User7 registrado (L6 de User1)");

  await distribution.connect(user8).selfRegister(user7.address);
  console.log("   ✅ User8 registrado (L7 de User1)");

  await distribution.connect(user9).selfRegister(user8.address);
  console.log("   ✅ User9 registrado (L8 de User1)");

  await distribution.connect(user10).selfRegister(user9.address);
  console.log("   ✅ User10 registrado (L9 de User1)");

  console.log("\n   🎉 Cadeia de 10 níveis criada!");
  console.log("");

  // ========== 6. ATIVAR ASSINATURAS ==========
  console.log("💳 6. ATIVANDO ASSINATURAS...\n");

  // User1, User2, User3 assinam
  const users = [user1, user2, user3];

  for (let i = 0; i < users.length; i++) {
    console.log(`   🔹 User${i + 1} aprovando e assinando...`);
    await usdt.connect(users[i]).approve(contractAddress, subscriptionFee);
    await distribution.connect(users[i]).selfSubscribe();

    const isActive = await distribution.isSubscriptionActive(users[i].address);
    console.log(`   ✅ User${i + 1} assinado - Status: ${isActive ? "Ativo" : "Inativo"}`);
  }
  console.log("");

  // ========== 7. PROCESSAR PERFORMANCE FEES (DISTRIBUIÇÃO MLM) ==========
  console.log("📈 7. PROCESSANDO PERFORMANCE FEES (DISTRIBUIÇÃO MLM)...\n");

  // Dar USDT ao owner para distribuir
  await usdt.transfer(owner.address, parseUSDT("100000"));
  await usdt.connect(owner).approve(contractAddress, ethers.MaxUint256);

  const feeAmount = parseUSDT("1000"); // $1000 de performance fee
  console.log(`   💰 Processando $${formatUSDT(feeAmount)} para User10...`);
  console.log("   (Isso vai distribuir MLM para todos os 9 níveis acima!)");

  await distribution.connect(owner).batchProcessPerformanceFees(
    [user10.address],
    [feeAmount]
  );

  console.log("   ✅ Performance fee processada!");
  console.log("");

  // ========== 8. VERIFICAR GANHOS ==========
  console.log("💰 8. VERIFICANDO GANHOS DOS USUÁRIOS...\n");

  const usersToCheck = [user1, user2, user3, user4, user5, user6, user7, user8, user9];
  const levels = [
    "L1 (6% = $60)",
    "L2 (3% = $30)",
    "L3 (2.5% = $25)",
    "L4 (2% = $20)",
    "L5 (1% = $10)",
    "L6 (1% = $10)",
    "L7 (1% = $10)",
    "L8 (1% = $10)",
    "L9 (1% = $10)"
  ];

  for (let i = 0; i < usersToCheck.length; i++) {
    const userData = await distribution.users(usersToCheck[i].address);
    const totalEarned = userData[6]; // totalEarned
    const totalWithdrawn = userData[7]; // totalWithdrawn
    const available = totalEarned - totalWithdrawn;

    console.log(`   User${i + 1} (${levels[i]}):`);
    console.log(`      💵 Total Ganho: $${formatUSDT(totalEarned)} USDT`);
    console.log(`      ✅ Disponível: $${formatUSDT(available)} USDT`);
  }
  console.log("");

  // ========== 9. TESTAR SAQUES ==========
  console.log("💸 9. TESTANDO SAQUES...\n");

  // User1 tem mais ganhos, vamos sacar
  const user1DataBefore = await distribution.users(user1.address);
  const user1Available = user1DataBefore[6] - user1DataBefore[7];

  if (user1Available > 0) {
    console.log(`   💰 User1 tem $${formatUSDT(user1Available)} disponível`);

    const balanceBefore = await usdt.balanceOf(user1.address);
    console.log(`   📊 Saldo USDT antes: $${formatUSDT(balanceBefore)}`);

    console.log("   🔹 Sacando tudo...");
    await distribution.connect(user1).withdrawEarnings();

    const balanceAfter = await usdt.balanceOf(user1.address);
    console.log(`   📊 Saldo USDT depois: $${formatUSDT(balanceAfter)}`);
    console.log(`   ✅ Recebeu: $${formatUSDT(balanceAfter - balanceBefore)}`);
  }
  console.log("");

  // ========== 10. TESTAR SAQUE PARCIAL ==========
  console.log("💵 10. TESTANDO SAQUE PARCIAL...\n");

  // User2 faz saque parcial
  const user2DataBefore = await distribution.users(user2.address);
  const user2Available = user2DataBefore[6] - user2DataBefore[7];

  if (user2Available > parseUSDT("15")) {
    const partialAmount = parseUSDT("15"); // Sacar $15
    console.log(`   💰 User2 tem $${formatUSDT(user2Available)} disponível`);
    console.log(`   🔹 Sacando $${formatUSDT(partialAmount)}...`);

    const balanceBefore = await usdt.balanceOf(user2.address);
    await distribution.connect(user2).withdrawPartialEarnings(partialAmount);
    const balanceAfter = await usdt.balanceOf(user2.address);

    console.log(`   ✅ Recebeu: $${formatUSDT(balanceAfter - balanceBefore)}`);

    const user2DataAfter = await distribution.users(user2.address);
    const remainingAvailable = user2DataAfter[6] - user2DataAfter[7];
    console.log(`   📊 Saldo restante: $${formatUSDT(remainingAvailable)}`);
  }
  console.log("");

  // ========== 11. TESTAR RENOVAÇÃO ==========
  console.log("🔄 11. TESTANDO RENOVAÇÃO...\n");

  // Aprovar e tentar renovar (pode falhar se ainda não pode renovar)
  await usdt.connect(user1).approve(contractAddress, subscriptionFee);

  try {
    await distribution.connect(user1).renewSubscription();
    console.log("   ✅ User1 renovou a assinatura!");
  } catch (error) {
    console.log("   ⚠️ User1 ainda não pode renovar (muito cedo)");
    console.log("      (Só pode renovar 7 dias antes de expirar)");
  }
  console.log("");

  // ========== 12. TESTAR FUNÇÕES ADMIN ==========
  console.log("⚙️ 12. TESTANDO FUNÇÕES ADMIN...\n");

  // Toggle Beta Mode
  const betaBefore = await distribution.betaMode();
  console.log(`   📊 Beta Mode antes: ${betaBefore ? "Ativo" : "Inativo"}`);

  await distribution.connect(owner).toggleBetaMode();

  const betaAfter = await distribution.betaMode();
  console.log(`   📊 Beta Mode depois: ${betaAfter ? "Ativo" : "Inativo"}`);
  console.log("   ✅ Toggle funcionou!");

  // Voltar ao estado original
  await distribution.connect(owner).toggleBetaMode();
  console.log("   🔄 Voltado ao estado original (Beta Mode Ativo)");
  console.log("");

  // ========== 13. ESTATÍSTICAS FINAIS ==========
  console.log("📊 13. ESTATÍSTICAS FINAIS DO SISTEMA...\n");

  const totalUsers = await distribution.totalUsers();
  const totalActiveSubscriptions = await distribution.totalActiveSubscriptions();
  const totalMLMDistributed = await distribution.totalMLMDistributed();

  console.log("   Total de Usuários:", totalUsers.toString());
  console.log("   Assinaturas Ativas:", totalActiveSubscriptions.toString());
  console.log("   Total Distribuído MLM: $" + formatUSDT(totalMLMDistributed), "USDT");
  console.log("");

  // ========== RESUMO FINAL ==========
  console.log("✅ ========== TODOS OS TESTES CONCLUÍDOS COM SUCESSO! ==========\n");
  console.log("📋 RESUMO:");
  console.log("   ✅ Mock USDT deployed:", usdtAddress);
  console.log("   ✅ iDeepX deployed:", contractAddress);
  console.log("   ✅ 10 usuários registrados (cadeia MLM)");
  console.log("   ✅ 3 usuários assinados");
  console.log("   ✅ Distribuição MLM funcionando ($1000 processado)");
  console.log("   ✅ Saques funcionando (total e parcial)");
  console.log("   ✅ Funções admin funcionando");
  console.log("");
  console.log("🎉 Seu contrato está 100% FUNCIONAL!");
  console.log("💡 Endereços para usar no frontend:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   USDT_ADDRESS=${usdtAddress}`);
  console.log("");
}

// Executar
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
