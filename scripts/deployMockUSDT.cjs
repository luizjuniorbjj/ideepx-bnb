const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

async function main() {
  console.log('🪙 DEPLOY DO MOCKUSDT\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('Deployer:', wallet.address);
  console.log();

  // Ler artifacts
  const artifactPath = path.join(__dirname, '../artifacts/contracts/MockUSDT.sol/MockUSDT.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const { abi, bytecode } = artifact;

  console.log('Deploying MockUSDT...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const token = await factory.deploy();

  console.log('TX:', token.deploymentTransaction().hash);
  console.log('Aguardando...\n');

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log('✅ MockUSDT deployed!');
  console.log('   Address:', address);
  console.log('   Decimals: 6');
  console.log('   Initial supply: 1,000,000 USDT');
  console.log();

  // Salvar
  fs.writeFileSync(
    path.join(__dirname, '../mock-usdt.json'),
    JSON.stringify({ address, deployer: wallet.address }, null, 2)
  );

  console.log('Agora vou fazer redeploy do MLM contract com esse USDT...\n');

  // Deploy MLM
  const mlmArtifact = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../artifacts/contracts/iDeepXDistributionV2.sol/iDeepXDistributionV2.json'),
    'utf8'
  ));

  const mlmFactory = new ethers.ContractFactory(mlmArtifact.abi, mlmArtifact.bytecode, wallet);
  const mlmContract = await mlmFactory.deploy(
    address, // MockUSDT address
    wallet.address, // liquidityPool
    wallet.address, // infrastructure
    wallet.address  // company
  );

  console.log('MLM TX:', mlmContract.deploymentTransaction().hash);
  await mlmContract.waitForDeployment();
  const mlmAddress = await mlmContract.getAddress();

  console.log('✅ MLM contract deployed!');
  console.log('   Address:', mlmAddress);
  console.log();

  // Salvar
  fs.writeFileSync(
    path.join(__dirname, '../deployed-mlm-with-mock-usdt.json'),
    JSON.stringify({
      mlm: mlmAddress,
      usdt: address,
      deployer: wallet.address,
      network: 'BSC Testnet',
      timestamp: new Date().toISOString()
    }, null, 2)
  );

  console.log('📝 Informações salvas!');
  console.log();
  console.log('🎯 NOVO SETUP:');
  console.log('   MockUSDT:', address);
  console.log('   MLM Contract:', mlmAddress);
}

main().catch(console.error);
