import hre from "hardhat";
import fs from "fs";

// ============================================================================
// 💵 DISTRIBUIR USDT V10 PARA CARTEIRAS EXISTENTES
// ============================================================================

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

const CONFIG = {
  usdtV10: "0x8d06e1376F205Ca66E034be72F50c889321110fA",
  inputFile: "testnet-population-1762219899726.json",
  usdtAmount: "100" // $100 por carteira
};

async function main() {
  console.log("\n" + "=".repeat(70));
  log("💵 DISTRIBUIR USDT V10 PARA CARTEIRAS", COLORS.bright + COLORS.cyan);
  console.log("=".repeat(70) + "\n");

  // Ler carteiras
  const inputData = JSON.parse(fs.readFileSync(CONFIG.inputFile, "utf8"));
  log(`✅ ${inputData.wallets.length} carteiras carregadas\n`, COLORS.green);

  const [deployer] = await hre.ethers.getSigners();
  log(`👤 Distribuidor: ${deployer.address}`, COLORS.cyan);

  const usdt = await hre.ethers.getContractAt("MockUSDT", CONFIG.usdtV10);
  const amount = hre.ethers.parseUnits(CONFIG.usdtAmount, 6);

  log(`💵 Distribuindo ${CONFIG.usdtAmount} USDT para cada carteira...\n`, COLORS.cyan);

  let distributed = 0;

  for (let i = 0; i < inputData.wallets.length; i++) {
    const w = inputData.wallets[i];

    try {
      const tx = await usdt.mint(w.address, amount);
      await tx.wait();

      distributed++;
      log(`   ✅ [${i + 1}/${inputData.wallets.length}] ${w.address}`, COLORS.green);

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      log(`   ❌ [${i + 1}/${inputData.wallets.length}] ${w.address}: ${error.message.slice(0, 80)}`, COLORS.red);
    }
  }

  console.log("\n" + "=".repeat(70));
  log(`✅ DISTRIBUIÇÃO COMPLETA: ${distributed}/${inputData.wallets.length}`, COLORS.bright + COLORS.green);
  console.log("=".repeat(70));

  log("\n🎯 Próximo passo:", COLORS.bright + COLORS.yellow);
  log("   npx hardhat run scripts/populate-v10-from-json.js --network bscTestnet", COLORS.yellow);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:\n", error);
    process.exit(1);
  });
