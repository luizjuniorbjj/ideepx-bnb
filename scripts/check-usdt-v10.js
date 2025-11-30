import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n📍 USDT V10: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd");
  console.log(`👤 Deployer: ${deployer.address}\n`);

  const usdt = await hre.ethers.getContractAt(
    "IERC20",
    "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
  );

  const balance = await usdt.balanceOf(deployer.address);
  console.log(`💰 Saldo USDT: ${hre.ethers.formatUnits(balance, 6)} USDT`);

  // Tentar ver se tem função mint
  try {
    const code = await hre.ethers.provider.getCode(usdt.target);
    console.log(`📄 Bytecode length: ${code.length} (contrato deployed)\n`);
  } catch (e) {
    console.log("❌ Erro ao verificar bytecode");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
