// ✅ Script para Submeter Proof On-Chain
// Submete o hash IPFS do snapshot semanal para o contrato ProofFinal

import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';

async function main() {
  console.log("📝 Submetendo Proof On-Chain...\n");

  // Endereços
  const PROOF_ADDRESS = "0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa";
  const ADMIN_PRIVATE_KEY = "0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03";

  // Conectar ao Admin wallet
  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

  console.log(`👨‍💼 Admin Wallet: ${adminWallet.address}`);

  // Verificar balance
  const balance = await provider.getBalance(adminWallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  if (parseFloat(ethers.formatEther(balance)) < 0.01) {
    console.log("⚠️ ATENÇÃO: Balance baixo de BNB para gas!");
    console.log("   Recomendado: pelo menos 0.01 BNB\n");
  }

  // Conectar ao contrato
  const proof = await ethers.getContractAt("iDeepXProofFinal", PROOF_ADDRESS, adminWallet);

  // Ler informações do upload
  const uploadInfoFile = process.argv[2] || "upload-info-week-1.json";

  if (!fs.existsSync(uploadInfoFile)) {
    console.log(`❌ ERRO: Arquivo de upload info não encontrado: ${uploadInfoFile}`);
    console.log("\nExecute primeiro: node scripts/upload-snapshot-to-ipfs.js\n");
    process.exit(1);
  }

  const uploadInfo = JSON.parse(fs.readFileSync(uploadInfoFile, 'utf8'));
  console.log("📊 Upload Info:");
  console.log(`   IPFS Hash: ${uploadInfo.ipfsHash}`);
  console.log(`   Week: ${uploadInfo.week}`);
  console.log(`   Week Number: ${uploadInfo.weekNumber}`);
  console.log(`   Uploaded At: ${uploadInfo.uploadedAt}\n`);

  // Ler snapshot para pegar os valores
  const snapshotData = JSON.parse(fs.readFileSync(uploadInfo.snapshotFile, 'utf8'));

  // Preparar dados para submit (valores em centavos, 2 decimais)
  const weekTimestamp = snapshotData.week;
  const ipfsHash = uploadInfo.ipfsHash;
  const totalUsers = snapshotData.summary.totalUsers;
  const totalCommissions = Math.round(snapshotData.summary.totalCommissions * 100); // USD -> centavos
  const totalProfits = Math.round(snapshotData.summary.totalProfits * 100); // USD -> centavos

  console.log("📋 Dados para submissão:");
  console.log(`   Week Timestamp: ${weekTimestamp} (${new Date(weekTimestamp * 1000).toISOString()})`);
  console.log(`   IPFS Hash: ${ipfsHash}`);
  console.log(`   Total Users: ${totalUsers}`);
  console.log(`   Total Commissions: ${totalCommissions} (centavos) = $${(totalCommissions / 100).toFixed(2)}`);
  console.log(`   Total Profits: ${totalProfits} (centavos) = $${(totalProfits / 100).toFixed(2)}\n`);

  // Verificar se já existe proof para esta semana
  const hasProof = await proof.hasProof(weekTimestamp);

  if (hasProof) {
    console.log("⚠️ ATENÇÃO: Já existe um proof para esta semana!");
    console.log("\nDeseja sobrescrever? (Isto pode falhar se o contrato não permitir)\n");

    const existingProof = await proof.weeklyProofs(weekTimestamp);
    console.log("📜 Proof existente:");
    console.log(`   IPFS Hash: ${existingProof.ipfsHash}`);
    console.log(`   Total Users: ${existingProof.totalUsers}`);
    console.log(`   Finalized: ${existingProof.finalized}\n`);

    if (existingProof.finalized) {
      console.log("❌ ERRO: Proof já foi finalizado e não pode ser alterado!");
      process.exit(1);
    }
  }

  // Verificar se contrato está pausado
  const paused = await proof.paused();
  if (paused) {
    console.log("❌ ERRO: Contrato está pausado!");
    process.exit(1);
  }

  // Verificar se admin é owner ou backend autorizado
  const owner = await proof.owner();
  const backend = await proof.backend();
  console.log("🔐 Permissões:");
  console.log(`   Owner: ${owner}`);
  console.log(`   Backend: ${backend}`);
  console.log(`   Admin é Owner: ${owner.toLowerCase() === adminWallet.address.toLowerCase() ? '✅' : '❌'}`);
  console.log(`   Admin é Backend: ${backend.toLowerCase() === adminWallet.address.toLowerCase() ? '✅' : '❌'}\n`);

  const isAuthorized =
    owner.toLowerCase() === adminWallet.address.toLowerCase() ||
    backend.toLowerCase() === adminWallet.address.toLowerCase();

  if (!isAuthorized) {
    console.log("❌ ERRO: Admin não tem permissão para submeter proofs!");
    console.log("   Apenas owner ou backend podem submeter.\n");
    process.exit(1);
  }

  // Estimar gas
  console.log("⛽ Estimando gas...");
  try {
    const gasEstimate = await proof.submitWeeklyProof.estimateGas(
      weekTimestamp,
      ipfsHash,
      totalUsers,
      totalCommissions,
      totalProfits
    );
    console.log(`   Gas estimado: ${gasEstimate.toString()}`);
    const gasPrice = await provider.getFeeData();
    const estimatedCost = gasEstimate * gasPrice.gasPrice;
    console.log(`   Custo estimado: ${ethers.formatEther(estimatedCost)} BNB\n`);
  } catch (error) {
    console.log("   ⚠️ Erro ao estimar gas:", error.message);
    console.log("   Continuando mesmo assim...\n");
  }

  // Submeter proof
  console.log("🚀 Submetendo proof on-chain...");
  console.log("   (Aguarde confirmação da transação...)\n");

  try {
    const tx = await proof.submitWeeklyProof(
      weekTimestamp,
      ipfsHash,
      totalUsers,
      totalCommissions,
      totalProfits
    );

    console.log(`📤 Transação enviada!`);
    console.log(`   Tx Hash: ${tx.hash}`);
    console.log(`   BSCScan: https://testnet.bscscan.com/tx/${tx.hash}\n`);

    console.log("⏳ Aguardando confirmação...");
    const receipt = await tx.wait();

    console.log(`✅ Transação confirmada!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas usado: ${receipt.gasUsed.toString()}`);
    console.log(`   Gas efetivo: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} BNB\n`);

    // Verificar eventos emitidos
    if (receipt.logs && receipt.logs.length > 0) {
      console.log(`📜 Eventos emitidos: ${receipt.logs.length}`);

      // Tentar parsear evento WeeklyProofSubmitted
      for (const log of receipt.logs) {
        try {
          const parsedLog = proof.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'WeeklyProofSubmitted') {
            console.log(`\n✅ WeeklyProofSubmitted:`);
            console.log(`   Week: ${parsedLog.args.week}`);
            console.log(`   IPFS Hash: ${parsedLog.args.ipfsHash}`);
            console.log(`   Total Users: ${parsedLog.args.totalUsers}`);
            console.log(`   Total Commissions: $${(Number(parsedLog.args.totalCommissions) / 100).toFixed(2)}`);
            console.log(`   Total Profits: $${(Number(parsedLog.args.totalProfits) / 100).toFixed(2)}`);
          }
        } catch (e) {
          // Log não é do nosso contrato, ignorar
        }
      }
    }

    // Verificar proof foi salvo corretamente
    console.log("\n🔍 Verificando proof salvo on-chain...");
    const savedProof = await proof.weeklyProofs(weekTimestamp);
    console.log(`   Week Timestamp: ${savedProof.weekTimestamp}`);
    console.log(`   IPFS Hash: ${savedProof.ipfsHash}`);
    console.log(`   Total Users: ${savedProof.totalUsers}`);
    console.log(`   Total Commissions: $${(Number(savedProof.totalCommissions) / 100).toFixed(2)}`);
    console.log(`   Total Profits: $${(Number(savedProof.totalProfits) / 100).toFixed(2)}`);
    console.log(`   Submitted At: ${new Date(Number(savedProof.submittedAt) * 1000).toLocaleString()}`);
    console.log(`   Finalized: ${savedProof.finalized ? '✅ Sim' : '⏳ Não'}\n`);

    console.log("🎉 PROOF SUBMETIDO COM SUCESSO!\n");

    console.log("📝 PRÓXIMOS PASSOS:");
    console.log("   1. Verificar proof no BSCScan (link acima)");
    console.log("   2. Acessar snapshot via IPFS:");
    console.log(`      ${uploadInfo.pinataUrl}`);
    console.log("   3. Finalizar proof (opcional):");
    console.log("      node scripts/finalize-proof.js");
    console.log("   4. Verificar sistema completo:");
    console.log("      node scripts/verify-proof-system.js\n");

    // Salvar informações da submissão
    const submitInfo = {
      ...uploadInfo,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      submittedAt: new Date().toISOString(),
      proofData: {
        weekTimestamp,
        totalUsers,
        totalCommissions,
        totalProfits,
        finalized: false
      }
    };

    const submitInfoFile = `submit-info-week-${uploadInfo.weekNumber}.json`;
    fs.writeFileSync(submitInfoFile, JSON.stringify(submitInfo, null, 2));
    console.log(`💾 Info de submissão salva em: ${submitInfoFile}\n`);

  } catch (error) {
    console.log("\n❌ ERRO ao submeter proof:");
    console.log(`   ${error.message}`);

    if (error.message.includes("Only owner or backend")) {
      console.log("\n💡 SOLUÇÃO: Use a carteira owner ou backend autorizada");
    } else if (error.message.includes("Pausable: paused")) {
      console.log("\n💡 SOLUÇÃO: Contrato está pausado, peça ao owner para unpause");
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
