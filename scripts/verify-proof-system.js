// ✅ Script para Verificar Sistema PROOF + Rulebook
// Verifica se os contratos deployados estão configurados corretamente

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🔍 Verificando Sistema PROOF + Rulebook...\n");

  // Endereços dos contratos
  const RULEBOOK_ADDRESS = "0x7A09383b65c07dc525bA0aF1b63DBe14a375aa2B";
  const PROOF_ADDRESS = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";
  const OWNER_ADDRESS = "0xEB2451A8dd58734134DD7Bde64A5f86725b75ef2";
  const BACKEND_ADDRESS = "0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F";

  // Conectar ao provider
  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );

  console.log("📋 CONTRATOS:");
  console.log(`   Rulebook: ${RULEBOOK_ADDRESS}`);
  console.log(`   ProofFinal: ${PROOF_ADDRESS}`);
  console.log(`   Owner: ${OWNER_ADDRESS}`);
  console.log(`   Backend: ${BACKEND_ADDRESS}\n`);

  // Conectar aos contratos
  const rulebook = await ethers.getContractAt(
    "iDeepXRulebookImmutable",
    RULEBOOK_ADDRESS
  );

  const proof = await ethers.getContractAt(
    "iDeepXProofFinal",
    PROOF_ADDRESS
  );

  // ========== VERIFICAR RULEBOOK ==========
  console.log("📄 RULEBOOK:");

  try {
    const ipfsCid = await rulebook.ipfsCid();
    const contentHash = await rulebook.contentHash();
    const deployedAt = await rulebook.deployedAt();
    const version = await rulebook.VERSION();
    const planName = await rulebook.PLAN_NAME();

    console.log(`   IPFS CID: ${ipfsCid}`);
    console.log(`   Content Hash: ${contentHash}`);
    console.log(`   Deployed At: ${new Date(Number(deployedAt) * 1000).toLocaleString()}`);
    console.log(`   Version: ${version}`);
    console.log(`   Plan Name: ${planName}`);
    console.log(`   IPFS URL: https://gateway.pinata.cloud/ipfs/${ipfsCid}`);

    // Verificar se CID está correto
    const expectedCid = "bafkreicfkbecmhcrsxq4fvond5xvpiwosj3e7a7emocxhr2clidvgfgbii";
    const cidMatch = ipfsCid === expectedCid;
    console.log(`   CID Match: ${cidMatch ? '✅' : '❌'} ${cidMatch ? 'CORRETO' : 'DIFERENTE'}`);
  } catch (error) {
    console.log(`   ❌ ERRO ao acessar Rulebook: ${error.message}`);
    console.log(`   ⚠️ Verifique se o contrato está correto no endereço: ${RULEBOOK_ADDRESS}`);
  }

  // ========== VERIFICAR PROOF CONTRACT ==========
  console.log("\n📊 PROOF CONTRACT:");

  const owner = await proof.owner();
  const backend = await proof.backend();
  const rulebookRef = await proof.rulebook();
  const totalProofs = await proof.totalProofsSubmitted();
  const paused = await proof.paused();

  console.log(`   Owner: ${owner}`);
  console.log(`   Backend: ${backend}`);
  console.log(`   Rulebook Reference: ${rulebookRef}`);
  console.log(`   Total Proofs: ${totalProofs}`);
  console.log(`   Paused: ${paused}`);

  // Verificar se addresses estão corretos
  const ownerMatch = owner.toLowerCase() === OWNER_ADDRESS.toLowerCase();
  const backendMatch = backend.toLowerCase() === BACKEND_ADDRESS.toLowerCase();
  console.log(`   Owner Match: ${ownerMatch ? '✅' : '❌'}`);
  console.log(`   Backend Match: ${backendMatch ? '✅' : '❌'}`);

  // Verificar se rulebook reference está correto
  const rulebookMatch = rulebookRef.toLowerCase() === RULEBOOK_ADDRESS.toLowerCase();
  console.log(`   Rulebook Match: ${rulebookMatch ? '✅' : '❌'}`);

  // ========== VERIFICAR BALANCES ==========
  console.log("\n💰 BALANCES:");

  const ownerBalance = await provider.getBalance(OWNER_ADDRESS);
  const backendBalance = await provider.getBalance(BACKEND_ADDRESS);
  const ownerBNB = ethers.formatEther(ownerBalance);
  const backendBNB = ethers.formatEther(backendBalance);

  console.log(`   Owner: ${ownerBNB} BNB ${parseFloat(ownerBNB) >= 0.01 ? '✅' : '⚠️'}`);
  console.log(`   Backend: ${backendBNB} BNB ${parseFloat(backendBNB) >= 0.01 ? '✅' : '⚠️'}`);

  if (parseFloat(backendBNB) < 0.01) {
    console.log(`   ⚠️ Backend precisa de tBNB para automação!`);
  }

  // ========== VERIFICAR PROVAS EXISTENTES ==========
  console.log("\n📜 PROVAS REGISTRADAS:");

  if (Number(totalProofs) > 0) {
    const allWeeks = await proof.getAllWeeks();
    console.log(`   Total de Semanas: ${allWeeks.length}`);

    // Mostrar últimas 3 provas
    const showCount = Math.min(3, allWeeks.length);
    for (let i = allWeeks.length - showCount; i < allWeeks.length; i++) {
      const weekProof = await proof.weeklyProofs(allWeeks[i]);
      console.log(`\n   Semana ${i + 1}:`);
      console.log(`     Timestamp: ${new Date(Number(weekProof.weekTimestamp) * 1000).toLocaleString()}`);
      console.log(`     IPFS: ${weekProof.ipfsHash}`);
      console.log(`     Users: ${weekProof.totalUsers}`);
      console.log(`     Commissions: $${(Number(weekProof.totalCommissions) / 100).toFixed(2)}`);
      console.log(`     Profits: $${(Number(weekProof.totalProfits) / 100).toFixed(2)}`);
      console.log(`     Finalized: ${weekProof.finalized ? '✅' : '⏳'}`);
    }
  } else {
    console.log(`   Nenhuma prova registrada ainda.`);
  }

  // ========== RESUMO FINAL ==========
  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMO:");
  console.log("=".repeat(50));

  const allOk = ownerMatch && backendMatch && rulebookMatch && parseFloat(ownerBNB) >= 0.01;

  if (allOk) {
    console.log("\n✅ SISTEMA TOTALMENTE FUNCIONAL!");
    console.log("\n🎯 PRÓXIMOS PASSOS:");
    console.log("   1. Desenvolver backend (Node.js + Express)");
    console.log("   2. Desenvolver frontend (Next.js)");
    console.log("   3. Testar ciclo completo de comissões");
  } else {
    console.log("\n⚠️ AÇÕES NECESSÁRIAS:");
    if (!ownerMatch) console.log("   ❌ Owner address não confere - verificar configuração");
    if (!backendMatch) console.log("   ❌ Backend address não confere - verificar configuração");
    if (!rulebookMatch) console.log("   ❌ Referência do Rulebook errada");
    if (parseFloat(ownerBNB) < 0.01) console.log("   ⚠️ Owner precisa tBNB: https://testnet.bnbchain.org/faucet-smart");
    if (parseFloat(backendBNB) < 0.01) console.log("   ⚠️ Backend precisa tBNB: https://testnet.bnbchain.org/faucet-smart");
  }

  console.log("\n" + "=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
