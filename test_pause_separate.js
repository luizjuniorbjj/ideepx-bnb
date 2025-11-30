// Teste pause em transações separadas
import hre from "hardhat";

const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  console.log("🧪 TESTE: PAUSE EM TRANSAÇÕES SEPARADAS\n");

  // Passo 1: Verificar estado inicial
  console.log("📊 PASSO 1: Estado inicial");
  let paused = await contract.paused();
  console.log(`   paused() = ${paused}\n`);

  // Passo 2: Pausar (se não estiver pausado)
  if (!paused) {
    console.log("▶️ PASSO 2: Pausando...");
    const pauseTx = await contract.pause();
    await pauseTx.wait();
    console.log("   ✅ Transação pause() confirmada\n");
  } else {
    console.log("⏭️ PASSO 2: Já está pausado, pulando...\n");
  }

  // Passo 3: Aguardar um bloco
  console.log("⏳ PASSO 3: Aguardando 5 segundos...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Passo 4: Ler estado NOVAMENTE (nova chamada view)
  console.log("\n📊 PASSO 4: Lendo estado APÓS aguardar");
  paused = await contract.paused();
  console.log(`   paused() = ${paused}`);

  if (paused) {
    console.log("\n✅ SUCCESS: Contrato ESTÁ pausado!");

    // Agora despausar
    console.log("\n▶️ PASSO 5: Despausando...");
    const unpauseTx = await contract.unpause();
    await unpauseTx.wait();
    console.log("   ✅ Transação unpause() confirmada");

    // Aguardar novamente
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar se despausou
    paused = await contract.paused();
    console.log(`\n📊 PASSO 6: Estado após unpause`);
    console.log(`   paused() = ${paused}`);

    if (!paused) {
      console.log("\n✅ PERFEITO: Pause/Unpause funcionam CORRETAMENTE!");
    } else {
      console.log("\n❌ PROBLEMA: Unpause não funcionou!");
    }
  } else {
    console.log("\n❌ PROBLEMA: Contrato NÃO está pausado após pause()!");
    console.log("   Isso indica um bug sério no contrato ou no OpenZeppelin Pausable!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
