// ✅ Script para Processar Batch de Distribuição MLM
// Distribui comissões MLM para todos os usuários ativos da semana

import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🎯 Processando Batch de Distribuição MLM...\n");

  // Endereços
  const CONTRACT_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";
  const ADMIN_PRIVATE_KEY = "0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03";

  // Conectar ao Admin wallet
  const provider = new ethers.JsonRpcProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

  console.log(`👨‍💼 Admin Wallet: ${adminWallet.address}\n`);

  // Conectar ao contrato
  const iDeepX = await ethers.getContractAt("iDeepXUnifiedSecure", CONTRACT_ADDRESS, adminWallet);

  // 1️⃣ Verificar semana atual
  const currentWeek = await iDeepX.currentWeek();
  console.log(`📅 Semana Atual: ${currentWeek}\n`);

  if (currentWeek == 0) {
    console.log("❌ Nenhuma performance fee foi depositada ainda!");
    return;
  }

  // 2️⃣ Verificar estado do batch
  console.log("📊 Estado do Batch:");
  const batch = await iDeepX.distributionBatches(currentWeek);
  console.log(`   Total Amount: $${ethers.formatUnits(batch.totalAmount, 6)}`);
  console.log(`   Start Index: ${batch.startIndex}`);
  console.log(`   End Index: ${batch.endIndex}`);
  console.log(`   Processed Users: ${batch.processedUsers}`);
  console.log(`   Completed: ${batch.completed}`);
  console.log(`   Distributed: $${ethers.formatUnits(batch.distributed, 6)}`);

  if (batch.completed) {
    console.log("\n✅ Batch já foi completamente processado!");
    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`   Usuários Recompensados: ${batch.processedUsers}`);
    console.log(`   Total Distribuído: $${ethers.formatUnits(batch.distributed, 6)}`);
    return;
  }

  // 3️⃣ Verificar snapshot de usuários
  const snapshotLength = await iDeepX.batchUserSnapshots(currentWeek, 0).catch(() => null);
  console.log(`\n👥 Usuários no Snapshot: Verificando...`);

  // 4️⃣ Processar batch
  console.log("\n🚀 Processando batch...");
  console.log("   (Isso vai distribuir MLM para todos os usuários ativos)");

  const processTx = await iDeepX.processDistributionBatch(currentWeek);
  console.log(`   Tx Hash: ${processTx.hash}`);

  const receipt = await processTx.wait();
  console.log("   ✅ Batch processado com sucesso!");

  // Buscar eventos
  if (receipt.logs && receipt.logs.length > 0) {
    console.log(`\n📜 Eventos emitidos: ${receipt.logs.length}`);
  }

  // 5️⃣ Verificar novo estado
  console.log("\n📊 Estado do Batch DEPOIS:");
  const newBatch = await iDeepX.distributionBatches(currentWeek);
  console.log(`   Total Amount: $${ethers.formatUnits(newBatch.totalAmount, 6)}`);
  console.log(`   Start Index: ${newBatch.startIndex}`);
  console.log(`   End Index: ${newBatch.endIndex}`);
  console.log(`   Processed Users: ${newBatch.processedUsers} ✅`);
  console.log(`   Completed: ${newBatch.completed} ${newBatch.completed ? '✅' : '⏳'}`);
  console.log(`   Distributed: $${ethers.formatUnits(newBatch.distributed, 6)} ✅`);

  if (newBatch.completed) {
    console.log("\n🎉 BATCH COMPLETAMENTE PROCESSADO!");
    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`   Semana: ${currentWeek}`);
    console.log(`   Usuários Recompensados: ${newBatch.processedUsers}`);
    console.log(`   Total Distribuído: $${ethers.formatUnits(newBatch.distributed, 6)}`);
    console.log(`   Média por Usuário: $${(parseFloat(ethers.formatUnits(newBatch.distributed, 6)) / Number(newBatch.processedUsers)).toFixed(2)}`);
  } else {
    console.log("\n⏳ Batch parcialmente processado.");
    console.log("Execute o script novamente para processar mais usuários.");
  }

  console.log("\nPróximo passo: Verificar balances individuais dos usuários");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO:", error);
    process.exit(1);
  });
