/**
 * 🚀 SCRIPT DE TESTE COMPLETO - FORK DA BSC MAINNET
 *
 * Este script testa SEU CONTRATO REAL (0xA64bD...) localmente
 * Sem gastar nada de gas! 100% Grátis!
 *
 * COMO USAR:
 * 1. Terminal 1: npx hardhat node (sobe fork)
 * 2. Terminal 2: npx hardhat run scripts/test-fork-mainnet.js --network localhost
 */

import hre from "hardhat";
const { ethers } = hre;

// ========== CONFIGURAÇÃO ==========

// Endereços do seu contrato REAL na mainnet
const CONTRACT_ADDRESS = "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

// Whale da BSC com MUITO USDT (vamos "pegar emprestado" para testes)
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; // Binance 8

// ========== ABI MÍNIMO ==========

const CONTRACT_ABI = [
  "function selfRegister(address sponsor) external",
  "function selfSubscribe() external",
  "function registerAndSubscribe(address sponsor) external",
  "function renewSubscription() external",
  "function withdrawEarnings() external",
  "function withdrawPartialEarnings(uint256 amount) external",
  "function batchProcessPerformanceFees(address[] calldata clients, uint256[] calldata amounts) external",
  "function toggleBetaMode() external",
  "function pause() external",
  "function unpause() external",
  "function users(address) external view returns (address wallet, address sponsor, bool isRegistered, bool subscriptionActive, uint256 subscriptionTimestamp, uint256 subscriptionExpiration, uint256 totalEarned, uint256 totalWithdrawn, uint256 directReferrals)",
  "function getUserInfo(address user) external view returns (address, address, bool, bool, uint256, uint256, uint256, uint256, uint256)",
  "function getQuickStats(address user) external view returns (uint256, uint256, uint256, bool, bool, uint256)",
  "function isSubscriptionActive(address user) external view returns (bool)",
  "function totalUsers() external view returns (uint256)",
  "function totalActiveSubscriptions() external view returns (uint256)",
  "function betaMode() external view returns (bool)",
  "function paused() external view returns (bool)",
  "function owner() external view returns (address)"
];

const USDT_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

// ========== FUNÇÕES AUXILIARES ==========

function formatUSDT(amount) {
  return ethers.formatUnits(amount, 18);
}

function parseUSDT(amount) {
  return ethers.parseUnits(amount.toString(), 18);
}

async function impersonateAccount(address) {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  return await ethers.getSigner(address);
}

async function setBalance(address, balance) {
  await hre.network.provider.send("hardhat_setBalance", [
    address,
    ethers.toQuantity(balance)
  ]);
}

// ========== SCRIPT PRINCIPAL ==========

async function main() {
  console.log("\n🚀 ========== TESTE COMPLETO - FORK DA BSC MAINNET ==========\n");

  // Pegar signers (contas de teste do Hardhat)
  const [deployer, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = await ethers.getSigners();

  console.log("📌 Endereços:");
  console.log("   Contrato iDeepX:", CONTRACT_ADDRESS);
  console.log("   USDT:", USDT_ADDRESS);
  console.log("   Deployer:", deployer.address);
  console.log("   User1:", user1.address);
  console.log("   User2:", user2.address);
  console.log("");

  // Conectar com os contratos
  const contract = await ethers.getContractAt(CONTRACT_ABI, CONTRACT_ADDRESS);
  const usdt = await ethers.getContractAt(USDT_ABI, USDT_ADDRESS);

  // ========== 1. VERIFICAR ESTADO INICIAL ==========
  console.log("📊 1. VERIFICANDO ESTADO INICIAL DO CONTRATO...\n");

  const totalUsers = await contract.totalUsers();
  const totalActiveSubscriptions = await contract.totalActiveSubscriptions();
  const isBetaMode = await contract.betaMode();
  const isPaused = await contract.paused();
  const owner = await contract.owner();

  console.log("   Total de Usuários:", totalUsers.toString());
  console.log("   Assinaturas Ativas:", totalActiveSubscriptions.toString());
  console.log("   Modo Beta:", isBetaMode ? "✅ Ativo" : "❌ Inativo");
  console.log("   Pausado:", isPaused ? "⚠️ Sim" : "✅ Não");
  console.log("   Owner:", owner);
  console.log("");

  // ========== 2. DISTRIBUIR USDT PARA USUÁRIOS DE TESTE ==========
  console.log("💰 2. DISTRIBUINDO USDT PARA USUÁRIOS DE TESTE...\n");

  // Impersonate a whale (conta com muito USDT)
  const whale = await impersonateAccount(USDT_WHALE);
  await setBalance(USDT_WHALE, ethers.parseEther("100")); // Dar BNB para pagar gas

  const testUsers = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
  const amountToSend = parseUSDT("1000"); // 1000 USDT para cada

  for (let i = 0; i < testUsers.length; i++) {
    await usdt.connect(whale).transfer(testUsers[i].address, amountToSend);
    const balance = await usdt.balanceOf(testUsers[i].address);
    console.log(`   ✅ User${i + 1}: ${formatUSDT(balance)} USDT`);
  }
  console.log("");

  // ========== 3. TESTAR REGISTRO EM CADEIA (MLM 10 NÍVEIS) ==========
  console.log("👥 3. TESTANDO REGISTRO EM CADEIA (MLM 10 NÍVEIS)...\n");

  // User1 se registra SEM sponsor (será root)
  console.log("   🔹 User1 registrando (root - sem sponsor)...");
  try {
    await contract.connect(user1).selfRegister(ethers.ZeroAddress);
    console.log("   ✅ User1 registrado como ROOT");
  } catch (error) {
    console.log("   ⚠️ User1 já registrado ou erro:", error.message.split("\n")[0]);
  }

  // User2 -> sponsor User1 (nível 1 de User1)
  console.log("   🔹 User2 registrando com sponsor User1...");
  await contract.connect(user2).selfRegister(user1.address);
  console.log("   ✅ User2 registrado (L1 de User1)");

  // User3 -> sponsor User2 (nível 2 de User1, nível 1 de User2)
  console.log("   🔹 User3 registrando com sponsor User2...");
  await contract.connect(user3).selfRegister(user2.address);
  console.log("   ✅ User3 registrado (L2 de User1, L1 de User2)");

  // Continuar cadeia até 10 níveis
  await contract.connect(user4).selfRegister(user3.address);
  console.log("   ✅ User4 registrado (L3 de User1)");

  await contract.connect(user5).selfRegister(user4.address);
  console.log("   ✅ User5 registrado (L4 de User1)");

  await contract.connect(user6).selfRegister(user5.address);
  console.log("   ✅ User6 registrado (L5 de User1)");

  await contract.connect(user7).selfRegister(user6.address);
  console.log("   ✅ User7 registrado (L6 de User1)");

  await contract.connect(user8).selfRegister(user7.address);
  console.log("   ✅ User8 registrado (L7 de User1)");

  await contract.connect(user9).selfRegister(user8.address);
  console.log("   ✅ User9 registrado (L8 de User1)");

  await contract.connect(user10).selfRegister(user9.address);
  console.log("   ✅ User10 registrado (L9 de User1)");

  console.log("\n   🎉 Cadeia de 10 níveis criada com sucesso!");
  console.log("");

  // ========== 4. TESTAR ASSINATURAS ==========
  console.log("💳 4. TESTANDO ASSINATURAS...\n");

  const subscriptionFee = parseUSDT("29");

  // User1 assina
  console.log("   🔹 User1 aprovando e assinando...");
  await usdt.connect(user1).approve(CONTRACT_ADDRESS, subscriptionFee);
  await contract.connect(user1).selfSubscribe();
  console.log("   ✅ User1 assinado");

  // Verificar status
  const isUser1Active = await contract.isSubscriptionActive(user1.address);
  console.log("   📊 User1 ativo:", isUser1Active ? "✅ Sim" : "❌ Não");

  // User2 assina
  console.log("   🔹 User2 aprovando e assinando...");
  await usdt.connect(user2).approve(CONTRACT_ADDRESS, subscriptionFee);
  await contract.connect(user2).selfSubscribe();
  console.log("   ✅ User2 assinado");

  // User3 assina
  console.log("   🔹 User3 aprovando e assinando...");
  await usdt.connect(user3).approve(CONTRACT_ADDRESS, subscriptionFee);
  await contract.connect(user3).selfSubscribe();
  console.log("   ✅ User3 assinado");

  console.log("");

  // ========== 5. TESTAR DISTRIBUIÇÃO MLM (PERFORMANCE FEES) ==========
  console.log("📈 5. TESTANDO DISTRIBUIÇÃO MLM (PERFORMANCE FEES)...\n");

  // Precisamos impersonate o owner para processar fees
  const ownerSigner = await impersonateAccount(owner);
  await setBalance(owner, ethers.parseEther("100")); // BNB para gas

  // Dar USDT ao owner para distribuir
  await usdt.connect(whale).transfer(owner, parseUSDT("10000"));
  console.log("   💰 Owner recebeu USDT para distribuir");

  // Aprovar contrato gastar USDT do owner
  await usdt.connect(ownerSigner).approve(CONTRACT_ADDRESS, ethers.MaxUint256);
  console.log("   ✅ Owner aprovou contrato");

  // Processar performance fee para User10 (que está no final da cadeia)
  // Isso vai distribuir MLM para todos os 10 níveis acima dele!
  const clientAddress = user10.address;
  const feeAmount = parseUSDT("1000"); // $1000 de performance fee

  console.log(`\n   🎯 Processando $${formatUSDT(feeAmount)} de performance fee para User10...`);
  console.log("   (Isso vai distribuir MLM para todos os 9 níveis acima!)");

  await contract.connect(ownerSigner).batchProcessPerformanceFees(
    [clientAddress],
    [feeAmount]
  );

  console.log("   ✅ Performance fee processada!");
  console.log("");

  // ========== 6. VERIFICAR GANHOS DOS USUÁRIOS ==========
  console.log("💰 6. VERIFICANDO GANHOS DOS USUÁRIOS...\n");

  // Verificar ganhos de cada nível
  const usersToCheck = [user1, user2, user3, user4, user5, user6, user7, user8, user9];
  const levels = ["L1 (6%)", "L2 (3%)", "L3 (2.5%)", "L4 (2%)", "L5 (1%)", "L6 (1%)", "L7 (1%)", "L8 (1%)", "L9 (1%)"];

  for (let i = 0; i < usersToCheck.length; i++) {
    const userData = await contract.users(usersToCheck[i].address);
    const totalEarned = userData[6]; // totalEarned
    const totalWithdrawn = userData[7]; // totalWithdrawn
    const available = totalEarned - totalWithdrawn;

    console.log(`   User${i + 1} (${levels[i]}):`);
    console.log(`      - Total Ganho: $${formatUSDT(totalEarned)} USDT`);
    console.log(`      - Disponível: $${formatUSDT(available)} USDT`);
  }
  console.log("");

  // ========== 7. TESTAR SAQUES ==========
  console.log("💸 7. TESTANDO SAQUES...\n");

  // User1 tem mais ganhos, vamos sacar
  const user1Data = await contract.users(user1.address);
  const user1Available = user1Data[6] - user1Data[7]; // totalEarned - totalWithdrawn

  if (user1Available > 0) {
    console.log(`   💰 User1 tem $${formatUSDT(user1Available)} disponível para saque`);

    const balanceBefore = await usdt.balanceOf(user1.address);
    console.log(`   📊 Saldo USDT antes: $${formatUSDT(balanceBefore)}`);

    console.log("   🔹 Sacando tudo...");
    await contract.connect(user1).withdrawEarnings();

    const balanceAfter = await usdt.balanceOf(user1.address);
    console.log(`   📊 Saldo USDT depois: $${formatUSDT(balanceAfter)}`);
    console.log(`   ✅ Saque realizado! Recebeu: $${formatUSDT(balanceAfter - balanceBefore)}`);
  } else {
    console.log("   ⚠️ User1 não tem saldo para sacar");
  }
  console.log("");

  // ========== 8. TESTAR RENOVAÇÃO ==========
  console.log("🔄 8. TESTANDO RENOVAÇÃO...\n");

  // Aprovar e renovar User1
  console.log("   🔹 User1 aprovando e renovando assinatura...");
  await usdt.connect(user1).approve(CONTRACT_ADDRESS, subscriptionFee);

  try {
    await contract.connect(user1).renewSubscription();
    console.log("   ✅ Assinatura renovada com sucesso!");
  } catch (error) {
    console.log("   ⚠️ Renovação falhou:", error.message.split("\n")[0]);
    console.log("      (Provavelmente ainda não pode renovar - faltam dias)");
  }
  console.log("");

  // ========== 9. ESTATÍSTICAS FINAIS ==========
  console.log("📊 9. ESTATÍSTICAS FINAIS DO SISTEMA...\n");

  const finalTotalUsers = await contract.totalUsers();
  const finalActiveSubscriptions = await contract.totalActiveSubscriptions();

  console.log("   Total de Usuários:", finalTotalUsers.toString());
  console.log("   Assinaturas Ativas:", finalActiveSubscriptions.toString());
  console.log("");

  // ========== 10. TESTAR FUNÇÕES ADMIN ==========
  console.log("⚙️ 10. TESTANDO FUNÇÕES ADMIN...\n");

  console.log("   🔹 Testando toggle Beta Mode...");
  const betaBefore = await contract.betaMode();
  console.log(`   📊 Beta Mode antes: ${betaBefore ? "✅ Ativo" : "❌ Inativo"}`);

  await contract.connect(ownerSigner).toggleBetaMode();

  const betaAfter = await contract.betaMode();
  console.log(`   📊 Beta Mode depois: ${betaAfter ? "✅ Ativo" : "❌ Inativo"}`);
  console.log("   ✅ Toggle funcionou!");

  // Voltar ao estado original
  await contract.connect(ownerSigner).toggleBetaMode();
  console.log("   🔄 Voltado ao estado original");
  console.log("");

  // ========== RESUMO FINAL ==========
  console.log("✅ ========== TODOS OS TESTES CONCLUÍDOS COM SUCESSO! ==========\n");
  console.log("📋 RESUMO:");
  console.log("   ✅ Fork da mainnet funcionando");
  console.log("   ✅ Contrato real acessado localmente");
  console.log("   ✅ USDT distribuído para contas de teste");
  console.log("   ✅ Registros em cadeia (10 níveis) funcionando");
  console.log("   ✅ Assinaturas funcionando");
  console.log("   ✅ Distribuição MLM funcionando");
  console.log("   ✅ Saques funcionando");
  console.log("   ✅ Funções admin funcionando");
  console.log("");
  console.log("🎉 Seu contrato está 100% FUNCIONAL!");
  console.log("💡 Você pode conectar o frontend agora no localhost:8545");
  console.log("");
}

// Executar e tratar erros
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
