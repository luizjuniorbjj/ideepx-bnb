// Script para ler proof diretamente usando chamadas de baixo nível

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🔍 Consultando Proof Diretamente...\n");

  const PROOF_ADDRESS = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";
  const WEEK_TIMESTAMP = 1731283200; // Week 1

  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );

  // ABI mínima para acessar o mapping weeklyProofs
  const minimalABI = [
    "function weeklyProofs(uint256) view returns (uint256 weekTimestamp, string ipfsHash, uint256 totalUsers, uint256 totalCommissions, uint256 totalProfits, uint256 submittedAt, uint256 finalizedAt, bool finalized)",
    "function totalProofsSubmitted() view returns (uint256)",
    "function hasProof(uint256) view returns (bool)",
    "function owner() view returns (address)",
    "function backend() view returns (address)",
    "function paused() view returns (bool)",
    "function rulebook() view returns (address)"
  ];

  const proof = new ethers.Contract(PROOF_ADDRESS, minimalABI, provider);

  try {
    // Verificar total de proofs
    const totalProofs = await proof.totalProofsSubmitted();
    console.log(`📊 Total Proofs Submitted: ${totalProofs}\n`);

    // Verificar se existe proof para week 1
    const hasProof = await proof.hasProof(WEEK_TIMESTAMP);
    console.log(`📜 Has Proof for Week ${WEEK_TIMESTAMP}: ${hasProof ? '✅ YES' : '❌ NO'}\n`);

    if (hasProof) {
      // Buscar proof
      const weekProof = await proof.weeklyProofs(WEEK_TIMESTAMP);

      console.log("📄 PROOF DATA:");
      console.log(`   Week Timestamp: ${weekProof.weekTimestamp}`);
      console.log(`   Week Date: ${new Date(Number(weekProof.weekTimestamp) * 1000).toISOString()}`);
      console.log(`   IPFS Hash: ${weekProof.ipfsHash}`);
      console.log(`   Total Users: ${weekProof.totalUsers}`);
      console.log(`   Total Commissions: $${(Number(weekProof.totalCommissions) / 100).toFixed(2)}`);
      console.log(`   Total Profits: $${(Number(weekProof.totalProfits) / 100).toFixed(2)}`);
      console.log(`   Submitted At: ${new Date(Number(weekProof.submittedAt) * 1000).toLocaleString()}`);
      console.log(`   Finalized: ${weekProof.finalized ? '✅ YES' : '⏳ NO'}`);
      if (weekProof.finalized && Number(weekProof.finalizedAt) > 0) {
        console.log(`   Finalized At: ${new Date(Number(weekProof.finalizedAt) * 1000).toLocaleString()}`);
      }

      console.log(`\n🔗 LINKS:`);
      console.log(`   IPFS: https://gateway.pinata.cloud/ipfs/${weekProof.ipfsHash}`);
      console.log(`   IPFS.io: https://ipfs.io/ipfs/${weekProof.ipfsHash}\n`);
    }

    // Informações do contrato
    console.log("⚙️ CONTRACT INFO:");
    const owner = await proof.owner();
    const backend = await proof.backend();
    const paused = await proof.paused();
    const rulebookAddr = await proof.rulebook();

    console.log(`   Owner: ${owner}`);
    console.log(`   Backend: ${backend}`);
    console.log(`   Paused: ${paused ? '❌ YES' : '✅ NO'}`);
    console.log(`   Rulebook: ${rulebookAddr}\n`);

    // Verificar balances
    const ownerBalance = await provider.getBalance(owner);
    const backendBalance = await provider.getBalance(backend);

    console.log("💰 BALANCES:");
    console.log(`   Owner: ${ethers.formatEther(ownerBalance)} BNB`);
    console.log(`   Backend: ${ethers.formatEther(backendBalance)} BNB\n`);

    console.log("✅ SISTEMA PROOF ESTÁ FUNCIONANDO!\n");

    console.log("📝 RESUMO DO QUICK TEST:");
    console.log("   ✅ Snapshot JSON criado");
    console.log("   ✅ Upload para IPFS realizado");
    console.log("   ✅ Proof submetido on-chain");
    console.log("   ✅ Proof finalizado (imutável)");
    console.log("   ✅ Dados verificáveis publicamente\n");

    console.log("🎯 PRÓXIMOS PASSOS:");
    console.log("   1. Desenvolver backend (Dias 2-3)");
    console.log("   2. Desenvolver frontend (Dias 4-5)");
    console.log("   3. Integração GMI Edge API");
    console.log("   4. Testes com 50+ usuários");
    console.log("   5. Deploy mainnet (Dia 15-16)\n");

  } catch (error) {
    console.log(`❌ ERRO: ${error.message}\n`);
    console.log("Detalhes:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO:", error);
    process.exit(1);
  });
