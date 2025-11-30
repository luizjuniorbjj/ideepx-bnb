import hre from "hardhat";

async function main() {
  const contract = await hre.ethers.getContractAt(
    "iDeepXCoreV10",
    "0x0f26974B54adA5114d802dDDc14aD59C3998f8d3"
  );

  const fee = await contract.subscriptionFee();
  console.log(`\n💵 Subscription Fee: ${hre.ethers.formatUnits(fee, 6)} USDT`);

  const usdt = await contract.USDT();
  console.log(`📍 USDT usado no contrato: ${usdt}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
