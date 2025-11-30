import hre from "hardhat";

async function main() {
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  console.log("\n🔍 TESTANDO FUNÇÃO MULTISIG...\n");

  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_4",
    contractAddress
  );

  try {
    console.log("📞 Chamando multisig()...");
    const multisig = await contract.multisig();
    console.log("✅ SUCESSO! Multisig:", multisig);
  } catch (error) {
    console.log("❌ ERRO ao chamar multisig():");
    console.log(error.message);
  }

  try {
    console.log("\n📞 Chamando owner() (se existir)...");
    const owner = await contract.owner();
    console.log("✅ SUCESSO! Owner:", owner);
  } catch (error) {
    console.log("❌ Owner não existe (esperado)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
