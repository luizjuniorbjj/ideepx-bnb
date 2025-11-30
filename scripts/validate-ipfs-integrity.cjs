/**
 * Script para validar integridade dos dados IPFS
 * Verifica se snapshot IPFS corresponde aos dados on-chain
 */

const { ethers } = require("hardhat");
const axios = require("axios");

async function main() {
  console.log("🔐 VALIDANDO INTEGRIDADE DOS DADOS IPFS...\n");

  const PROOF_CONTRACT = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";

  const abi = [
    "function getWeeklyProof(uint256 week) view returns (tuple(uint256 weekTimestamp, string ipfsHash, uint256 totalUsers, uint256 totalCommissions, uint256 totalProfits, address submitter, uint256 submittedAt, bool finalized))",
    "function getAllWeeks() view returns (uint256[])"
  ];

  const provider = ethers.provider;
  const contract = new ethers.Contract(PROOF_CONTRACT, abi, provider);

  try {
    // Buscar todas as semanas válidas (> 2023)
    const allWeeks = await contract.getAllWeeks();
    const validWeeks = allWeeks.filter(w => Number(w) > 1700000000);

    console.log(`📊 Total de semanas válidas: ${validWeeks.length}\n`);

    for (let i = 0; i < validWeeks.length; i++) {
      const week = validWeeks[i];
      console.log(`=== VALIDANDO WEEK ${i + 1} ===`);
      console.log(`Week Timestamp: ${week.toString()}`);

      // 1. Buscar proof on-chain
      const proof = await contract.getWeeklyProof(week);
      console.log(`IPFS Hash: ${proof.ipfsHash}`);
      console.log(`On-chain Users: ${proof.totalUsers.toString()}`);
      console.log(`On-chain Commissions: $${(Number(proof.totalCommissions) / 100).toFixed(2)}`);
      console.log(`On-chain Profits: $${(Number(proof.totalProfits) / 100).toFixed(2)}`);

      // 2. Baixar snapshot do IPFS
      console.log(`\n📥 Baixando snapshot do IPFS...`);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${proof.ipfsHash}`;

      try {
        const response = await axios.get(ipfsUrl);
        const snapshot = response.data;

        console.log(`✅ Snapshot baixado com sucesso!`);
        console.log(`IPFS Users: ${snapshot.summary.totalUsers}`);
        console.log(`IPFS Commissions: $${snapshot.summary.totalCommissions.toFixed(2)}`);
        console.log(`IPFS Profits: $${snapshot.summary.totalProfits.toFixed(2)}`);

        // 3. Validar correspondência
        console.log(`\n🔍 VALIDANDO CORRESPONDÊNCIA:`);

        const usersMatch = proof.totalUsers.toString() === snapshot.summary.totalUsers.toString();
        const commissionsMatch = Number(proof.totalCommissions) === Math.round(snapshot.summary.totalCommissions * 100);
        const profitsMatch = Number(proof.totalProfits) === Math.round(snapshot.summary.totalProfits * 100);

        console.log(`Users Match: ${usersMatch ? '✅' : '❌'}`);
        console.log(`Commissions Match: ${commissionsMatch ? '✅' : '❌'}`);
        console.log(`Profits Match: ${profitsMatch ? '✅' : '❌'}`);

        if (usersMatch && commissionsMatch && profitsMatch) {
          console.log(`\n🎉 INTEGRIDADE VERIFICADA! Dados IPFS = Dados On-chain\n`);
        } else {
          console.log(`\n⚠️ ALERTA: Dados não correspondem!\n`);
        }

        // 4. Validar estrutura do snapshot
        console.log(`📋 VALIDANDO ESTRUTURA DO SNAPSHOT:`);
        console.log(`  Version: ${snapshot.version || 'N/A'}`);
        console.log(`  Week Number: ${snapshot.weekNumber || 'N/A'}`);
        console.log(`  Rulebook Address: ${snapshot.rulebook?.address || 'N/A'}`);
        console.log(`  Rulebook IPFS: ${snapshot.rulebook?.ipfsCid || 'N/A'}`);
        console.log(`  Total Users in Array: ${snapshot.users?.length || 0}`);

        if (snapshot.users) {
          const activeUsers = snapshot.users.filter(u => u.lai?.active).length;
          const inactiveUsers = snapshot.users.filter(u => !u.lai?.active).length;
          console.log(`  Active Users: ${activeUsers}`);
          console.log(`  Inactive Users: ${inactiveUsers}`);
        }

        // 5. Validar cálculos de comissões
        console.log(`\n💰 VALIDANDO CÁLCULOS:`);
        if (snapshot.users) {
          let totalCommissionsCalc = 0;
          let totalProfitsCalc = 0;

          snapshot.users.forEach(user => {
            totalProfitsCalc += user.profit || 0;

            if (user.commissions) {
              Object.values(user.commissions).forEach(level => {
                if (level.amount) {
                  totalCommissionsCalc += level.amount;
                }
              });
            }
          });

          console.log(`  Total Profits Calculado: $${totalProfitsCalc.toFixed(2)}`);
          console.log(`  Total Profits Summary: $${snapshot.summary.totalProfits.toFixed(2)}`);
          console.log(`  Match: ${Math.abs(totalProfitsCalc - snapshot.summary.totalProfits) < 0.01 ? '✅' : '❌'}`);

          console.log(`  Total Commissions Calculado: $${totalCommissionsCalc.toFixed(2)}`);
          console.log(`  Total Commissions Summary: $${snapshot.summary.totalCommissions.toFixed(2)}`);
          console.log(`  Match: ${Math.abs(totalCommissionsCalc - snapshot.summary.totalCommissions) < 0.01 ? '✅' : '❌'}`);
        }

      } catch (ipfsError) {
        console.error(`❌ Erro ao baixar IPFS: ${ipfsError.message}`);
      }

      console.log(`\n${'='.repeat(60)}\n`);
    }

    console.log("✅ VALIDAÇÃO DE INTEGRIDADE CONCLUÍDA!");

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
