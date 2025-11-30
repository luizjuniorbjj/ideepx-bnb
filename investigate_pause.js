// Investigar problema pause/unpause
import hre from "hardhat";

const CONTRACT_ADDRESS = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";

async function main() {
  console.log("🔍 INVESTIGANDO PAUSE/UNPAUSE\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_2",
    CONTRACT_ADDRESS
  );

  // Verificar roles
  console.log("\n📋 VERIFICANDO ROLES:");
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log(`✓ Deployer tem DEFAULT_ADMIN_ROLE? ${hasAdminRole}`);

  const multisig = await contract.multisig();
  console.log(`✓ Multisig: ${multisig}`);

  const multisigHasRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, multisig);
  console.log(`✓ Multisig tem DEFAULT_ADMIN_ROLE? ${multisigHasRole}`);

  // Verificar estado atual
  console.log("\n📊 ESTADO ATUAL:");
  const isPaused = await contract.paused();
  console.log(`✓ Contrato pausado? ${isPaused}`);

  // Teste 1: Pausar
  console.log("\n🧪 TESTE 1: PAUSAR CONTRATO");
  try {
    const pauseTx = await contract.pause();
    const receipt = await pauseTx.wait();
    console.log("✅ Pause() executado, Gas:", receipt.gasUsed.toString());

    const isPausedNow = await contract.paused();
    console.log(`✓ Contrato pausado agora? ${isPausedNow}`);
  } catch (error) {
    console.log("❌ Erro ao pausar:", error.message.substring(0, 100));
  }

  // Teste 2: Despausar
  console.log("\n🧪 TESTE 2: DESPAUSAR CONTRATO");
  try {
    const unpauseTx = await contract.unpause();
    const receipt = await unpauseTx.wait();
    console.log("✅ Unpause() executado, Gas:", receipt.gasUsed.toString());

    const isPausedAfter = await contract.paused();
    console.log(`✓ Contrato pausado após unpause? ${isPausedAfter}`);

    if (isPausedAfter) {
      console.log("❌ PROBLEMA: Contrato ainda está pausado após unpause()!");
    } else {
      console.log("✅ SUCCESS: Contrato despausado com sucesso!");
    }
  } catch (error) {
    console.log("❌ Erro ao despausar:", error.message.substring(0, 100));
  }

  // Verificar eventos
  console.log("\n📡 VERIFICANDO EVENTOS:");
  const filter = contract.filters.Paused();
  const pauseEvents = await contract.queryFilter(filter, -100);
  console.log(`✓ Eventos Paused encontrados: ${pauseEvents.length}`);

  const unpauseFilter = contract.filters.Unpaused();
  const unpauseEvents = await contract.queryFilter(unpauseFilter, -100);
  console.log(`✓ Eventos Unpaused encontrados: ${unpauseEvents.length}`);

  console.log("\n" + "=".repeat(60));
  console.log("DIAGNÓSTICO COMPLETO");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
