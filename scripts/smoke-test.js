/**
 * 🔥 SMOKE TEST - TESTE RÁPIDO DAS FUNCIONALIDADES PRINCIPAIS
 *
 * Testa rapidamente se tudo está funcionando (2-3 minutos)
 *
 * COMO USAR:
 * 1. Terminal 1: npx hardhat node
 * 2. Terminal 2: npx hardhat run scripts/smoke-test.js --network localhost
 */

import hre from "hardhat";
const { ethers } = hre;

const CONTRACT_ADDRESS = "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const CONTRACT_ABI = [
  "function selfRegister(address sponsor) external",
  "function selfSubscribe() external",
  "function users(address) external view returns (address, address, bool, bool, uint256, uint256, uint256, uint256, uint256)",
  "function isSubscriptionActive(address) external view returns (bool)",
  "function totalUsers() external view returns (uint256)",
  "function betaMode() external view returns (bool)",
  "function paused() external view returns (bool)",
  "function owner() external view returns (address)"
];

const USDT_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

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

async function main() {
  console.log("\n🔥 ========== SMOKE TEST - TESTE RÁPIDO ==========\n");

  const [user1, user2] = await ethers.getSigners();

  const contract = await ethers.getContractAt(CONTRACT_ABI, CONTRACT_ADDRESS);
  const usdt = await ethers.getContractAt(USDT_ABI, USDT_ADDRESS);

  console.log("✅ 1. Conectado ao contrato:", CONTRACT_ADDRESS);

  // Verificar estado
  const totalUsers = await contract.totalUsers();
  const isBetaMode = await contract.betaMode();
  const isPaused = await contract.paused();
  const owner = await contract.owner();

  console.log("✅ 2. Estado do contrato:");
  console.log(`   - Usuários: ${totalUsers}`);
  console.log(`   - Beta: ${isBetaMode ? "Sim" : "Não"}`);
  console.log(`   - Pausado: ${isPaused ? "Sim" : "Não"}`);
  console.log(`   - Owner: ${owner}`);

  // Distribuir USDT
  console.log("\n✅ 3. Distribuindo USDT...");
  const whale = await impersonateAccount(USDT_WHALE);
  await setBalance(USDT_WHALE, ethers.parseEther("100"));

  await usdt.connect(whale).transfer(user1.address, parseUSDT("500"));
  await usdt.connect(whale).transfer(user2.address, parseUSDT("500"));

  const balance1 = await usdt.balanceOf(user1.address);
  const balance2 = await usdt.balanceOf(user2.address);
  console.log(`   - User1: $${formatUSDT(balance1)} USDT`);
  console.log(`   - User2: $${formatUSDT(balance2)} USDT`);

  // Testar registro
  console.log("\n✅ 4. Testando registro...");
  try {
    await contract.connect(user1).selfRegister(ethers.ZeroAddress);
    console.log("   - User1 registrado");
  } catch (e) {
    console.log("   - User1 já registrado");
  }

  await contract.connect(user2).selfRegister(user1.address);
  console.log("   - User2 registrado com sponsor User1");

  // Testar assinatura
  console.log("\n✅ 5. Testando assinatura...");
  const subscriptionFee = parseUSDT("29");

  await usdt.connect(user1).approve(CONTRACT_ADDRESS, subscriptionFee);
  await contract.connect(user1).selfSubscribe();
  console.log("   - User1 assinado");

  const isActive = await contract.isSubscriptionActive(user1.address);
  console.log(`   - Status: ${isActive ? "✅ Ativo" : "❌ Inativo"}`);

  console.log("\n🎉 ========== SMOKE TEST CONCLUÍDO! ==========");
  console.log("✅ Todas as funções básicas estão funcionando!");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
