/**
 * Script para testar todas as queries de proofs
 * Testa: getAllProofs, getLatestProofs, getWeeklyProof
 */

import { ethers } from "hardhat";

async function main() {
  console.log("🧪 TESTANDO TODAS AS QUERIES DE PROOFS...\n");

  // Endereços dos contratos
  const PROOF_CONTRACT = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";

  // ABI mínima
  const abi = [
    "function getAllProofs() view returns (tuple(uint256 weekTimestamp, string ipfsHash, uint256 totalUsers, uint256 totalCommissions, uint256 totalProfits, address submitter, uint256 submittedAt, bool finalized)[])",
    "function getLatestProofs(uint256 count) view returns (tuple(uint256 weekTimestamp, string ipfsHash, uint256 totalUsers, uint256 totalCommissions, uint256 totalProfits, address submitter, uint256 submittedAt, bool finalized)[])",
    "function getWeeklyProof(uint256 week) view returns (tuple(uint256 weekTimestamp, string ipfsHash, uint256 totalUsers, uint256 totalCommissions, uint256 totalProfits, address submitter, uint256 submittedAt, bool finalized))",
    "function getAllWeeks() view returns (uint256[])",
    "function totalProofsSubmitted() view returns (uint256)",
    "function hasProof(uint256 week) view returns (bool)"
  ];

  const provider = ethers.provider;
  const contract = new ethers.Contract(PROOF_CONTRACT, abi, provider);

  try {
    // 1. Total de proofs
    console.log("📊 1. TOTAL DE PROOFS:");
    const total = await contract.totalProofsSubmitted();
    console.log(`   Total: ${total.toString()}`);
    console.log();

    // 2. Todas as semanas
    console.log("📅 2. TODAS AS SEMANAS:");
    const allWeeks = await contract.getAllWeeks();
    console.log(`   Semanas registradas: ${allWeeks.length}`);
    allWeeks.forEach((week, index) => {
      const date = new Date(Number(week) * 1000);
      console.log(`   ${index + 1}. Week ${week.toString()} (${date.toISOString()})`);
    });
    console.log();

    // 3. Verificar se tem proof para cada semana
    console.log("🔍 3. VERIFICANDO PROOFS INDIVIDUAIS:");
    for (let i = 0; i < allWeeks.length; i++) {
      const week = allWeeks[i];
      const hasProof = await contract.hasProof(week);
      console.log(`   Week ${week.toString()}: ${hasProof ? '✅' : '❌'}`);
    }
    console.log();

    // 4. Buscar todos os proofs
    console.log("📄 4. TODOS OS PROOFS (getAllProofs):");
    const allProofs = await contract.getAllProofs();
    console.log(`   Total retornado: ${allProofs.length}\n`);

    allProofs.forEach((proof, index) => {
      const date = new Date(Number(proof.weekTimestamp) * 1000);
      console.log(`   === PROOF ${index + 1} ===`);
      console.log(`   Week: ${proof.weekTimestamp.toString()} (${date.toISOString()})`);
      console.log(`   IPFS: ${proof.ipfsHash}`);
      console.log(`   Users: ${proof.totalUsers.toString()}`);
      console.log(`   Commissions: $${(Number(proof.totalCommissions) / 100).toFixed(2)}`);
      console.log(`   Profits: $${(Number(proof.totalProfits) / 100).toFixed(2)}`);
      console.log(`   Finalized: ${proof.finalized ? '✅' : '⏳'}`);
      console.log();
    });

    // 5. Buscar últimos 2 proofs
    console.log("📄 5. ÚLTIMOS 2 PROOFS (getLatestProofs):");
    const latestProofs = await contract.getLatestProofs(2);
    console.log(`   Total retornado: ${latestProofs.length}\n`);

    latestProofs.forEach((proof, index) => {
      const date = new Date(Number(proof.weekTimestamp) * 1000);
      console.log(`   === LATEST PROOF ${index + 1} ===`);
      console.log(`   Week: ${proof.weekTimestamp.toString()} (${date.toISOString()})`);
      console.log(`   IPFS: ${proof.ipfsHash}`);
      console.log(`   Users: ${proof.totalUsers.toString()}`);
      console.log(`   Finalized: ${proof.finalized ? '✅' : '⏳'}`);
      console.log();
    });

    // 6. Buscar proof específico Week 1
    console.log("🔎 6. BUSCAR PROOF WEEK 1 (1731283200):");
    try {
      const proof1 = await contract.getWeeklyProof(1731283200);
      const date1 = new Date(Number(proof1.weekTimestamp) * 1000);
      console.log(`   Week: ${proof1.weekTimestamp.toString()} (${date1.toISOString()})`);
      console.log(`   IPFS: ${proof1.ipfsHash}`);
      console.log(`   Users: ${proof1.totalUsers.toString()}`);
      console.log(`   Finalized: ${proof1.finalized ? '✅' : '⏳'}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    console.log();

    // 7. Buscar proof específico Week 2
    console.log("🔎 7. BUSCAR PROOF WEEK 2 (1731888000):");
    try {
      const proof2 = await contract.getWeeklyProof(1731888000);
      const date2 = new Date(Number(proof2.weekTimestamp) * 1000);
      console.log(`   Week: ${proof2.weekTimestamp.toString()} (${date2.toISOString()})`);
      console.log(`   IPFS: ${proof2.ipfsHash}`);
      console.log(`   Users: ${proof2.totalUsers.toString()}`);
      console.log(`   Finalized: ${proof2.finalized ? '✅' : '⏳'}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    console.log();

    console.log("✅ TESTES CONCLUÍDOS!");

  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
