// Script para verificar se há código deployado nos endereços

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🔍 Verificando código nos contratos...\n");

  const RULEBOOK_ADDRESS = "0x7A09383b65c07dc525bA0aF1b63DBe14a375aa2B";
  const PROOF_ADDRESS = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";

  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );

  console.log("📄 RULEBOOK:");
  console.log(`   Address: ${RULEBOOK_ADDRESS}`);
  const rulebookCode = await provider.getCode(RULEBOOK_ADDRESS);
  console.log(`   Has Code: ${rulebookCode !== '0x' ? '✅ YES' : '❌ NO'}`);
  if (rulebookCode !== '0x') {
    console.log(`   Code Length: ${rulebookCode.length} bytes`);
  }

  console.log("\n📊 PROOF CONTRACT:");
  console.log(`   Address: ${PROOF_ADDRESS}`);
  const proofCode = await provider.getCode(PROOF_ADDRESS);
  console.log(`   Has Code: ${proofCode !== '0x' ? '✅ YES' : '❌ NO'}`);
  if (proofCode !== '0x') {
    console.log(`   Code Length: ${proofCode.length} bytes`);
  }

  console.log("\n🔗 BSCScan Links:");
  console.log(`   Rulebook: https://testnet.bscscan.com/address/${RULEBOOK_ADDRESS}`);
  console.log(`   ProofFinal: https://testnet.bscscan.com/address/${PROOF_ADDRESS}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO:", error);
    process.exit(1);
  });
