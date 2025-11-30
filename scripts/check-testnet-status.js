import hre from "hardhat";

async function main() {
  console.log("\n🔍 VERIFICANDO STATUS DO TESTNET...\n");

  const contractAddress = "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea";
  const usdtAddress = "0xf484a22555113Cebac616bC84451Bf04085097b8";

  // Conectar USDT
  const usdt = await hre.ethers.getContractAt("MockUSDT", usdtAddress);

  // Verificar supply total
  const totalSupply = await usdt.totalSupply();
  console.log(`💰 Supply Total USDT: ${hre.ethers.formatUnits(totalSupply, 6)} USDT`);

  // Supply inicial era 1M, se temos mais, foi mintado
  const initialSupply = hre.ethers.parseUnits("1000000", 6);
  const mintedAmount = totalSupply - initialSupply;
  console.log(`📈 USDT Mintado: ${hre.ethers.formatUnits(mintedAmount, 6)} USDT`);

  // Calcular quantas carteiras receberam (1000 USDT cada)
  const usdtPerWallet = hre.ethers.parseUnits("1000", 6);
  const walletsCreated = Number(mintedAmount / usdtPerWallet);
  console.log(`👥 Carteiras que receberam USDT: ~${walletsCreated}`);

  // Conectar ao contrato
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_4",
    contractAddress
  );

  // Verificar funções disponíveis
  console.log("\n📋 FUNÇÕES DISPONÍVEIS NO CONTRATO:");
  const functions = Object.keys(contract.interface.functions);
  const relevantFunctions = functions.filter(f =>
    f.includes("User") ||
    f.includes("Stats") ||
    f.includes("process") ||
    f.includes("batch")
  );
  relevantFunctions.forEach(f => console.log(`   ✅ ${f}`));

  console.log("\n✅ Verificação completa!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
