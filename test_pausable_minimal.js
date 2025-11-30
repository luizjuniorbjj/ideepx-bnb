// Teste mínimo de Pausable
import hre from "hardhat";

async function main() {
  console.log("🔬 TESTE MÍNIMO DE PAUSABLE\n");

  const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";

  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  console.log("📊 ANTES:");
  let paused = await contract.paused();
  console.log(`   paused() = ${paused}`);

  console.log("\n▶️ Chamando pause()...");
  const tx = await contract.pause({ gasLimit: 100000 });
  const receipt = await tx.wait();
  console.log(`   Gas usado: ${receipt.gasUsed}`);
  console.log(`   Status: ${receipt.status === 1 ? "Success" : "Failed"}`);

  // Verificar eventos emitidos
  console.log(`\n   Eventos emitidos: ${receipt.logs.length}`);
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      console.log(`   - ${parsed.name}(${parsed.args.map(a => a.toString()).join(", ")})`);
    } catch (e) {
      // Log não é do nosso contrato
    }
  }

  console.log("\n📊 DEPOIS:");
  paused = await contract.paused();
  console.log(`   paused() = ${paused}`);

  if (paused) {
    console.log("\n✅ SUCCESS: Pausado corretamente!");
  } else {
    console.log("\n❌ PROBLEMA: NÃO pausou!");
    console.log("\n🔍 Investigando...");

    // Verificar se a função paused() está retornando o valor correto
    const provider = hre.ethers.provider;
    const pausedSlot = await provider.getStorage(CONTRACT_ADDRESS, 0);
    console.log(`   Storage slot 0 (onde Pausable guarda estado): ${pausedSlot}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
