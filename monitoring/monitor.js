import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * MONITOR V9_SECURE_2
 * Dashboard básico para monitoramento real-time
 *
 * Funcionalidades:
 * - Solvency ratio
 * - Circuit breaker status
 * - Deposit cap
 * - Emergency reserve
 * - User limits
 */

// ========== CONFIG ==========
const RPC_URL = process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const REFRESH_INTERVAL = 30000; // 30 segundos

// Auto-detect testnet
const isTestnet = RPC_URL.includes("testnet") || RPC_URL.includes("prebsc");
if (isTestnet) {
  console.log("🧪 Running on TESTNET mode");
}

// Thresholds para alertas
const THRESHOLDS = {
  SOLVENCY_WARNING: 13000,  // 130%
  SOLVENCY_CRITICAL: 11000, // 110%
  RESERVE_LOW: 1000 * 10**6, // $1k
  CAP_NEAR: 90, // 90% do cap
};

// ========== ABI MÍNIMO ==========
const ABI = [
  // V9_SECURE_2 Views (simplificadas)
  "function getSecurityStatus() view returns (uint256 _emergencyReserve, bool _circuitBreakerActive, uint256 _solvencyRatio)",
  "function getSystemStats() view returns (uint256 _totalUsers, uint256 _totalActive, uint256 _contractBalance, bool _betaMode)",
  "function getSolvencyRatio() view returns (uint256)",

  // Public state variables
  "function maxTotalDeposits() view returns (uint256)",
  "function capEnabled() view returns (bool)",
  "function totalSubscriptionRevenue() view returns (uint256)",
  "function totalPerformanceRevenue() view returns (uint256)",
  "function betaMode() view returns (bool)",
  "function totalUsers() view returns (uint256)",
  "function MAX_BETA_USERS() view returns (uint256)",
  "function multisig() view returns (address)",
  "function totalUserBalances() view returns (uint256)",
  "function totalPendingReserve() view returns (uint256)",
  "function USDT() view returns (address)",

  // Circuit breaker
  "function SOLVENCY_THRESHOLD_BPS() view returns (uint256)",
  "function SOLVENCY_RECOVERY_BPS() view returns (uint256)",
  "function circuitBreakerActive() view returns (bool)",
];

// ========== SETUP ==========
let provider;
let contract;

async function setup() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS not set in .env");
  }

  provider = new ethers.JsonRpcProvider(RPC_URL);
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  console.log("🔒 iDeepX V9_SECURE_2 Monitor");
  console.log("📍 Contract:", CONTRACT_ADDRESS);
  console.log("🌐 RPC:", RPC_URL);
  console.log("");
}

// ========== MONITOR FUNCTIONS ==========

async function checkSolvency() {
  const security = await contract.getSecurityStatus();

  // Calculate solvency manually since getSolvencyStatus() was removed
  const totalUserBalances = await contract.totalUserBalances();
  const totalPendingReserve = await contract.totalPendingReserve();
  const requiredBalance = totalUserBalances + totalPendingReserve;

  const usdtAddress = await contract.USDT();
  const usdtContract = new ethers.Contract(usdtAddress, ["function balanceOf(address) view returns (uint256)"], provider);
  const currentBalance = await usdtContract.balanceOf(CONTRACT_ADDRESS);

  const ratio = Number(security._solvencyRatio);
  const ratioPct = (ratio / 100).toFixed(2);

  let status = "✅ OK";
  if (ratio < THRESHOLDS.SOLVENCY_CRITICAL) {
    status = "🔴 CRITICAL";
  } else if (ratio < THRESHOLDS.SOLVENCY_WARNING) {
    status = "⚠️  WARNING";
  }

  const surplus = currentBalance > requiredBalance ? currentBalance - requiredBalance : 0n;

  console.log(`\n💰 SOLVENCY: ${status}`);
  console.log(`   Ratio: ${ratioPct}%`);
  console.log(`   Required: ${ethers.formatUnits(requiredBalance, 6)} USDT`);
  console.log(`   Current: ${ethers.formatUnits(currentBalance, 6)} USDT`);
  console.log(`   Surplus: ${ethers.formatUnits(surplus, 6)} USDT`);

  if (ratio < THRESHOLDS.SOLVENCY_CRITICAL) {
    await sendAlert(`🚨 SOLVENCY CRITICAL: ${ratioPct}%`);
  } else if (ratio < THRESHOLDS.SOLVENCY_WARNING) {
    await sendAlert(`⚠️ Solvency Warning: ${ratioPct}%`);
  }
}

async function checkCircuitBreaker() {
  const security = await contract.getSecurityStatus();
  const threshold = await contract.SOLVENCY_THRESHOLD_BPS();
  const recovery = await contract.SOLVENCY_RECOVERY_BPS();

  const active = security._circuitBreakerActive;

  console.log(`\n🚨 CIRCUIT BREAKER: ${active ? "🔴 ACTIVE" : "✅ INACTIVE"}`);
  console.log(`   Activation: ${Number(threshold) / 100}%`);
  console.log(`   Recovery: ${Number(recovery) / 100}%`);

  if (active) {
    await sendAlert("🚨 CIRCUIT BREAKER ATIVO!");
  }
}

async function checkDepositCap() {
  const capEnabled = await contract.capEnabled();
  const maxDeposits = await contract.maxTotalDeposits();
  const subRevenue = await contract.totalSubscriptionRevenue();
  const perfRevenue = await contract.totalPerformanceRevenue();

  const totalDeposits = subRevenue + perfRevenue;
  const usage = (Number(totalDeposits) / Number(maxDeposits)) * 100;

  let status = "✅ OK";
  if (usage >= THRESHOLDS.CAP_NEAR) {
    status = "⚠️  NEAR LIMIT";
  }

  console.log(`\n💵 DEPOSIT CAP: ${status}`);
  console.log(`   Enabled: ${capEnabled ? "Yes" : "No"}`);
  console.log(`   Current: ${ethers.formatUnits(totalDeposits, 6)} USDT (${usage.toFixed(1)}%)`);
  console.log(`   Max: ${ethers.formatUnits(maxDeposits, 6)} USDT`);
  console.log(`   Remaining: ${ethers.formatUnits(maxDeposits - totalDeposits, 6)} USDT`);

  if (capEnabled && usage >= THRESHOLDS.CAP_NEAR) {
    await sendAlert(`⚠️ Cap Usage: ${usage.toFixed(1)}%`);
  }
}

async function checkEmergencyReserve() {
  const security = await contract.getSecurityStatus();

  const reserve = security._emergencyReserve;

  let status = "✅ OK";
  if (reserve < THRESHOLDS.RESERVE_LOW) {
    status = "⚠️  LOW";
  }

  console.log(`\n🛡️  EMERGENCY RESERVE: ${status}`);
  console.log(`   Available: ${ethers.formatUnits(reserve, 6)} USDT`);

  if (reserve < THRESHOLDS.RESERVE_LOW) {
    await sendAlert(`⚠️ Emergency Reserve Low: $${ethers.formatUnits(reserve, 6)}`);
  }
}

async function checkUserLimits() {
  const betaMode = await contract.betaMode();
  const totalUsers = await contract.totalUsers();
  const maxBetaUsers = await contract.MAX_BETA_USERS();

  const usage = (Number(totalUsers) / Number(maxBetaUsers)) * 100;

  let status = "✅ OK";
  if (betaMode && usage >= 90) {
    status = "⚠️  NEAR LIMIT";
  }

  console.log(`\n👥 USER LIMITS: ${status}`);
  console.log(`   Beta Mode: ${betaMode ? "Active" : "Inactive"}`);
  console.log(`   Total Users: ${totalUsers} / ${maxBetaUsers} (${usage.toFixed(1)}%)`);

  if (betaMode && usage >= 90) {
    await sendAlert(`⚠️ User Limit: ${totalUsers}/${maxBetaUsers}`);
  }
}

async function checkSystemStats() {
  const stats = await contract.getSystemStats();

  console.log(`\n📊 SYSTEM STATS:`);
  console.log(`   Total Users: ${stats._totalUsers}`);
  console.log(`   Active Subscriptions: ${stats._totalActive}`);
  console.log(`   Contract Balance: ${ethers.formatUnits(stats._contractBalance, 6)} USDT`);
  console.log(`   Beta Mode: ${stats._betaMode ? "Yes" : "No"}`);
}

// ========== ALERTAS ==========

async function sendAlert(message) {
  console.log(`\n🔔 ALERT: ${message}`);

  // TODO: Integrar com Telegram Bot
  // await sendTelegramMessage(message);

  // Por enquanto, apenas log
  const timestamp = new Date().toISOString();
  console.log(`   [${timestamp}] ${message}`);
}

// ========== MAIN LOOP ==========

async function runMonitoring() {
  console.clear();
  console.log("=".repeat(60));
  console.log(`  📡 Monitoring Update - ${new Date().toLocaleString()}`);
  console.log("=".repeat(60));

  try {
    await checkSolvency();
    await checkCircuitBreaker();
    await checkDepositCap();
    await checkEmergencyReserve();
    await checkUserLimits();
    await checkSystemStats();

  } catch (error) {
    console.error("\n❌ Error during monitoring:", error.message);
    await sendAlert(`Error: ${error.message}`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Next update in ${REFRESH_INTERVAL / 1000}s...`);
  console.log(`${"=".repeat(60)}`);
}

// ========== START ==========

async function main() {
  await setup();

  // Primeira execução
  await runMonitoring();

  // Loop de monitoramento
  setInterval(runMonitoring, REFRESH_INTERVAL);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
