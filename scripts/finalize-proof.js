// ✅ Script para Finalizar Proof
// Marca um proof como finalizado (imutável após isso)

import pkg from "hardhat";
const { ethers } = pkg;
import fs from 'fs';

async function main() {
  console.log("🔒 Finalizando Proof...\n");

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

  // Conectar ao contrato
  const proof = await ethers.getContractAt("iDeepXProofFinal", PROOF_ADDRESS, adminWallet);

  // Ler informações da submissão ou usar argumento
  const submitInfoFile = process.argv[2] || "submit-info-week-1.json";
  let weekTimestamp;

  if (fs.existsSync(submitInfoFile)) {
    const submitInfo = JSON.parse(fs.readFileSync(submitInfoFile, 'utf8'));
    weekTimestamp = submitInfo.proofData.weekTimestamp;
    console.log(`📊 Usando week timestamp de: ${submitInfoFile}`);
    console.log(`   Week: ${weekTimestamp} (${new Date(weekTimestamp * 1000).toISOString()})`);
    console.log(`   Week Number: ${submitInfo.weekNumber}\n`);
  } else {
    // Argumento direto
    weekTimestamp = parseInt(process.argv[2]);
    if (!weekTimestamp) {
      console.log("❌ ERRO: Forneça o week timestamp ou arquivo submit-info");
      console.log("\nUso:");
      console.log("   node scripts/finalize-proof.js submit-info-week-1.json");
      console.log("   OU");
      console.log("   node scripts/finalize-proof.js 1731283200\n");
      process.exit(1);
    }
    console.log(`📊 Week Timestamp: ${weekTimestamp} (${new Date(weekTimestamp * 1000).toISOString()})\n`);
  }

  // Verificar se proof existe
  const hasProof = await proof.hasProof(weekTimestamp);
  if (!hasProof) {
    console.log("❌ ERRO: Não existe proof para esta semana!");
    console.log("\nExecute primeiro: node scripts/submit-proof.js\n");
    process.exit(1);
  }

  // Buscar proof atual
  const currentProof = await proof.weeklyProofs(weekTimestamp);
  console.log("📜 Proof Atual:");
  console.log(`   IPFS Hash: ${currentProof.ipfsHash}`);
  console.log(`   Total Users: ${currentProof.totalUsers}`);
  console.log(`   Total Commissions: $${(Number(currentProof.totalCommissions) / 100).toFixed(2)}`);
  console.log(`   Total Profits: $${(Number(currentProof.totalProfits) / 100).toFixed(2)}`);
  console.log(`   Submitted At: ${new Date(Number(currentProof.submittedAt) * 1000).toLocaleString()}`);
  console.log(`   Finalized: ${currentProof.finalized ? '✅ Sim' : '⏳ Não'}\n`);

  if (currentProof.finalized) {
    console.log("ℹ️ Proof já está finalizado!");
    console.log("   Uma vez finalizado, não pode mais ser alterado.\n");
    process.exit(0);
  }

  // Verificar permissões
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
    console.log("❌ ERRO: Admin não tem permissão para finalizar proofs!");
    console.log("   Apenas owner ou backend podem finalizar.\n");
    process.exit(1);
  }

  // Verificar se contrato está pausado
  const paused = await proof.paused();
  if (paused) {
    console.log("❌ ERRO: Contrato está pausado!");
    process.exit(1);
  }

  // Estimar gas
  console.log("⛽ Estimando gas...");
  try {
    const gasEstimate = await proof.finalizeWeek.estimateGas(weekTimestamp);
    console.log(`   Gas estimado: ${gasEstimate.toString()}`);
    const gasPrice = await provider.getFeeData();
    const estimatedCost = gasEstimate * gasPrice.gasPrice;
    console.log(`   Custo estimado: ${ethers.formatEther(estimatedCost)} BNB\n`);
  } catch (error) {
    console.log("   ⚠️ Erro ao estimar gas:", error.message);
    console.log("   Continuando mesmo assim...\n");
  }

  // Finalizar proof
  console.log("🔒 Finalizando proof...");
  console.log("   ⚠️ ATENÇÃO: Após finalização, o proof não pode mais ser alterado!");
  console.log("   (Aguarde confirmação da transação...)\n");

  try {
    const tx = await proof.finalizeWeek(weekTimestamp);

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

      // Tentar parsear evento WeekFinalized
      for (const log of receipt.logs) {
        try {
          const parsedLog = proof.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'WeekFinalized') {
            console.log(`\n✅ WeekFinalized:`);
            console.log(`   Week: ${parsedLog.args.week}`);
            console.log(`   Finalized By: ${parsedLog.args.finalizedBy}`);
          }
        } catch (e) {
          // Log não é do nosso contrato, ignorar
        }
      }
    }

    // Verificar proof finalizado
    console.log("\n🔍 Verificando proof finalizado on-chain...");
    const finalizedProof = await proof.weeklyProofs(weekTimestamp);
    console.log(`   Week Timestamp: ${finalizedProof.weekTimestamp}`);
    console.log(`   IPFS Hash: ${finalizedProof.ipfsHash}`);
    console.log(`   Total Users: ${finalizedProof.totalUsers}`);
    console.log(`   Total Commissions: $${(Number(finalizedProof.totalCommissions) / 100).toFixed(2)}`);
    console.log(`   Total Profits: $${(Number(finalizedProof.totalProfits) / 100).toFixed(2)}`);
    console.log(`   Submitted At: ${new Date(Number(finalizedProof.submittedAt) * 1000).toLocaleString()}`);
    console.log(`   Finalized: ${finalizedProof.finalized ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Finalized At: ${new Date(Number(finalizedProof.finalizedAt) * 1000).toLocaleString()}\n`);

    console.log("🎉 PROOF FINALIZADO COM SUCESSO!\n");

    console.log("📝 PRÓXIMOS PASSOS:");
    console.log("   1. Verificar transação no BSCScan (link acima)");
    console.log("   2. Verificar sistema completo:");
    console.log("      node scripts/verify-proof-system.js");
    console.log("   3. Acessar snapshot IPFS:");
    console.log(`      https://gateway.pinata.cloud/ipfs/${finalizedProof.ipfsHash}\n`);

    console.log("ℹ️ IMPORTANTE:");
    console.log("   • Proof agora é IMUTÁVEL (não pode ser alterado)");
    console.log("   • Hash IPFS garante integridade do snapshot");
    console.log("   • Qualquer pessoa pode auditar os dados\n");

  } catch (error) {
    console.log("\n❌ ERRO ao finalizar proof:");
    console.log(`   ${error.message}`);

    if (error.message.includes("Only owner or backend")) {
      console.log("\n💡 SOLUÇÃO: Use a carteira owner ou backend autorizada");
    } else if (error.message.includes("Pausable: paused")) {
      console.log("\n💡 SOLUÇÃO: Contrato está pausado, peça ao owner para unpause");
    } else if (error.message.includes("Already finalized")) {
      console.log("\n💡 INFO: Proof já foi finalizado anteriormente");
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
