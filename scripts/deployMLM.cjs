const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuração
const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

async function main() {
  console.log('🚀 DEPLOY DO iDeepXDistributionV2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Setup
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('📊 Configuração:');
  console.log(`   Deployer: ${wallet.address}`);
  console.log(`   Network: BSC Testnet (Chain ID 97)`);
  console.log(`   USDT: ${USDT_ADDRESS}\n`);

  // Verificar saldo
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Saldo: ${ethers.formatEther(balance)} BNB\n`);

  if (parseFloat(ethers.formatEther(balance)) < 0.05) {
    console.log('❌ Saldo BNB insuficiente para deploy!');
    process.exit(1);
  }

  // Ler o bytecode compilado
  const artifactPath = path.join(__dirname, '../artifacts/contracts/iDeepXDistributionV2.sol/iDeepXDistributionV2.json');

  if (!fs.existsSync(artifactPath)) {
    console.log('❌ Contrato não compilado! Execute: npx hardhat compile');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const { abi, bytecode } = artifact;

  console.log('📝 Fazendo deploy do contrato...\n');

  // Deploy
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy(
    wallet.address, // multisig (simplificado)
    wallet.address, // liquidityPool
    wallet.address, // infrastructure
    wallet.address  // company
  );

  console.log(`   TX Hash: ${contract.deploymentTransaction().hash}`);
  console.log(`   Aguardando confirmação...\n`);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('✅ DEPLOY CONCLUÍDO!\n');
  console.log(`📍 Endereço do contrato: ${contractAddress}`);
  console.log(`🔗 BSCScan: https://testnet.bscscan.com/address/${contractAddress}\n`);

  // Salvar endereço em arquivo
  const deployInfo = {
    contract: 'iDeepXDistributionV2',
    address: contractAddress,
    deployer: wallet.address,
    usdt: USDT_ADDRESS,
    network: 'BSC Testnet',
    chainId: 97,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash
  };

  fs.writeFileSync(
    path.join(__dirname, '../deployed-mlm-contract.json'),
    JSON.stringify(deployInfo, null, 2)
  );

  console.log('📝 Informações salvas em: deployed-mlm-contract.json\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
