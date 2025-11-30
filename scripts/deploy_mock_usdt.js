import hre from "hardhat";

async function main() {
  console.log("💵 Deploying Mock USDT for testing...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);

  // Deploy Mock USDT
  const MockUSDT = await hre.ethers.getContractFactory("MockERC20");
  const usdt = await MockUSDT.deploy("Tether USD", "USDT", 6); // 6 decimals like real USDT

  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();

  console.log("✅ Mock USDT deployed at:", usdtAddress);
  console.log("");

  // Mint some tokens to deployer for testing
  const mintAmount = hre.ethers.parseUnits("1000000", 6); // 1M USDT
  await usdt.mint(deployer.address, mintAmount);
  console.log("💰 Minted 1,000,000 USDT to deployer");
  console.log("");

  console.log("📋 Next Steps:");
  console.log("1. Add to .env:");
  console.log(`   USDT_TESTNET=${usdtAddress}`);
  console.log("");
  console.log("2. Use in hardhat console:");
  console.log(`   const usdt = await ethers.getContractAt("MockERC20", "${usdtAddress}");`);
  console.log(`   await usdt.approve(contractAddress, ethers.parseUnits("1000", 6));`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
