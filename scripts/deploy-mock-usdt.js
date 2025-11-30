import hre from "hardhat";

async function main() {
  console.log("\n💵 Deploying MockUSDT...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();

  const address = await usdt.getAddress();
  console.log(`\n✅ MockUSDT deployed: ${address}`);

  const balance = await usdt.balanceOf(deployer.address);
  console.log(`💰 Deployer balance: ${hre.ethers.formatUnits(balance, 6)} USDT\n`);

  console.log("🎯 Atualize o .env:");
  console.log(`USDT_ADDRESS=${address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
