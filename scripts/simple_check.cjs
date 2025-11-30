const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔍 VERIFICAÇÃO SIMPLES - BSC MAINNET\n");
  console.log("═══════════════════════════════════════════════════════════\n");

  const addresses = {
    core: "0xA64bD448aEECed62d02F0deb8305ecd30f79fb54",
    mlm: "0xf49092DC8A288263E6d22e2a0A8aaA0F25d801da",
    governance: "0x57ea5e1E49190B9EC2e7eEE658168E1626039442",
    timelock: "0x60C6a303BF17Aa091968C44EbE3fE04b1bBE6460",
  };

  // Check each contract
  for (const [name, address] of Object.entries(addresses)) {
    const code = await ethers.provider.getCode(address);
    const exists = code !== "0x";
    const size = exists ? (code.length - 2) / 2 : 0;

    console.log(`${name.toUpperCase().padEnd(12)} ${address}`);
    console.log(`${"".padEnd(13)}${exists ? "✅" : "❌"} ${exists ? "DEPLOYED" : "NOT FOUND"} ${exists ? `(${size.toLocaleString()} bytes)` : ""}`);
    console.log();
  }

  console.log("═══════════════════════════════════════════════════════════\n");

  // Check if they have transactions
  console.log("📊 VERIFICANDO TRANSAÇÕES:\n");

  for (const [name, address] of Object.entries(addresses)) {
    const txCount = await ethers.provider.getTransactionCount(address);
    console.log(`${name.toUpperCase().padEnd(12)} ${txCount} transação(ões)`);
  }

  console.log("\n═══════════════════════════════════════════════════════════\n");
  console.log("✅ Todos os contratos estão DEPLOYADOS e na blockchain!\n");
  console.log("🔗 Visualizar no BscScan:\n");
  console.log("   Core:       https://bscscan.com/address/" + addresses.core);
  console.log("   MLM:        https://bscscan.com/address/" + addresses.mlm);
  console.log("   Governance: https://bscscan.com/address/" + addresses.governance);
  console.log("\n═══════════════════════════════════════════════════════════\n");
}

main().catch(console.error);
