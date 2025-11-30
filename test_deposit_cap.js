// Testar updateDepositCap
import hre from "hardhat";

const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";

async function main() {
  console.log("🧪 TESTE: UPDATE DEPOSIT CAP\n");

  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  // Passo 1: Ver estado atual
  console.log("📊 PASSO 1: Estado atual");
  let currentCap = await contract.maxTotalDeposits();
  let capEnabled = await contract.capEnabled();
  console.log(`   maxTotalDeposits = $${hre.ethers.formatUnits(currentCap, 6)} USDT`);
  console.log(`   capEnabled = ${capEnabled}\n`);

  // Passo 2: Tentar atualizar cap
  const newCap = currentCap + hre.ethers.parseUnits("50000", 6); // +$50k

  console.log(`▶️ PASSO 2: Tentando atualizar cap para $${hre.ethers.formatUnits(newCap, 6)}`);
  try {
    const updateTx = await contract.updateDepositCap(newCap);
    const receipt = await updateTx.wait();
    console.log(`   ✅ Transação confirmada, Gas: ${receipt.gasUsed}`);

    // Verificar eventos
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed.name === "CapUpdated") {
          console.log(`   📡 Evento: CapUpdated(${hre.ethers.formatUnits(parsed.args[0], 6)}, ${hre.ethers.formatUnits(parsed.args[1], 6)})`);
        }
      } catch (e) {}
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message.substring(0, 100)}`);
  }

  // Passo 3: Verificar novo valor
  console.log("\n📊 PASSO 3: Verificando novo valor");
  await new Promise(resolve => setTimeout(resolve, 3000));

  currentCap = await contract.maxTotalDeposits();
  console.log(`   maxTotalDeposits = $${hre.ethers.formatUnits(currentCap, 6)} USDT`);

  if (currentCap.toString() === newCap.toString()) {
    console.log("\n✅ SUCCESS: Cap atualizado corretamente!");
  } else {
    console.log("\n❌ PROBLEMA: Cap NÃO foi atualizado!");
    console.log(`   Esperado: $${hre.ethers.formatUnits(newCap, 6)}`);
    console.log(`   Atual: $${hre.ethers.formatUnits(currentCap, 6)}`);
  }

  // Passo 4: Testar disable cap
  console.log("\n▶️ PASSO 4: Testando disableDepositCap()");
  try {
    const disableTx = await contract.disableDepositCap();
    await disableTx.wait();
    console.log(`   ✅ Transação confirmada`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message.substring(0, 100)}`);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  capEnabled = await contract.capEnabled();
  console.log(`\n📊 PASSO 5: Verificando capEnabled`);
  console.log(`   capEnabled = ${capEnabled}`);

  if (!capEnabled) {
    console.log("\n✅ SUCCESS: Cap desabilitado corretamente!");
  } else {
    console.log("\n❌ PROBLEMA: Cap ainda está habilitado!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
