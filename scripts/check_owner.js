import hre from "hardhat";

async function main() {
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_4",
    contractAddress
  );

  const multisig = await contract.multisig();
  console.log("\n🔑 MULTISIG (OWNER) DO CONTRATO:");
  console.log("Endereço:", multisig);

  // Contas do Hardhat
  const accounts = await hre.ethers.getSigners();
  console.log("\n👥 CONTAS HARDHAT:");
  for (let i = 0; i < Math.min(3, accounts.length); i++) {
    const address = await accounts[i].getAddress();
    const isOwner = address.toLowerCase() === multisig.toLowerCase();
    console.log(`Account #${i}: ${address} ${isOwner ? '✅ (MULTISIG/OWNER)' : ''}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
