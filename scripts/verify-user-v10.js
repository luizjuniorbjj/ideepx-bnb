import hre from "hardhat";

async function main() {
  const contract = await hre.ethers.getContractAt(
    "iDeepXCoreV10",
    "0x9F8bB784f96ADd0B139e90E652eDe926da3c3653"
  );

  // Verificar o primeiro usuário
  const userAddress = "0xA2921d64Cd8C7BC5B4acbC20420238356199f649";

  console.log(`\n📊 Verificando usuário: ${userAddress}\n`);

  const user = await contract.userView(userAddress);

  console.log(`✅ Ativo: ${user.active_}`);
  console.log(`📊 Max Level: ${user.maxLevel_}`);
  console.log(`🔐 KYC Status: ${user.kycStatus_}`);
  console.log(`💰 Saldo Interno: ${hre.ethers.formatUnits(user.internalBalance_, 6)} USDT`);
  console.log(`💵 Volume Mensal: ${hre.ethers.formatUnits(user.monthlyVolume_, 6)} USD`);
  console.log(`📅 Subscription Expira: ${new Date(Number(user.subscriptionExpiry_) * 1000).toLocaleString()}`);
  console.log(`📝 Account Hash: ${user.accountHash_}\n`);

  // Verificar total de usuários com subscription ativa
  console.log(`🎯 Contrato V10: 0x9F8bB784f96ADd0B139e90E652eDe926da3c3653`);
  console.log(`🌐 BSCScan: https://testnet.bscscan.com/address/0x9F8bB784f96ADd0B139e90E652eDe926da3c3653\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
