import hre from "hardhat";

async function main() {
  console.log("\n🚀 Redeploying iDeepXCoreV10 com USDT correto...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  const usdtAddress = "0x8d06e1376F205Ca66E034be72F50c889321110fA";
  console.log(`💵 USDT: ${usdtAddress}\n`);

  const Contract = await hre.ethers.getContractFactory("iDeepXCoreV10");

  console.log("📦 Deploying...");
  const contract = await Contract.deploy(usdtAddress, deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n✅ iDeepXCoreV10 deployed: ${address}`);
  console.log(`🌐 BSCScan: https://testnet.bscscan.com/address/${address}\n`);

  // Conceder roles
  console.log("🔧 Concedendo roles...");

  const UPDATER_ROLE = await contract.UPDATER_ROLE();
  const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
  const TREASURY_ROLE = await contract.TREASURY_ROLE();

  const tx1 = await contract.grantRole(UPDATER_ROLE, deployer.address);
  await tx1.wait();
  console.log("✅ UPDATER_ROLE concedida");

  const tx2 = await contract.grantRole(DISTRIBUTOR_ROLE, deployer.address);
  await tx2.wait();
  console.log("✅ DISTRIBUTOR_ROLE concedida");

  const tx3 = await contract.grantRole(TREASURY_ROLE, deployer.address);
  await tx3.wait();
  console.log("✅ TREASURY_ROLE concedida\n");

  console.log("🎯 Atualize o script populate-v10-from-json.js:");
  console.log(`contractV10: "${address}"\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
