import hre from 'hardhat';

async function checkBalance() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log('');
  console.log('💰 Deployer:', deployer.address);
  console.log('💵 Saldo BNB:', hre.ethers.formatEther(balance), 'BNB');
  console.log('');
  console.log('📊 Para adicionar 30 usuários:');
  console.log('   Necessário: ~0.003 BNB (0.0001 BNB/usuário)');
  console.log('   Atual:', hre.ethers.formatEther(balance), 'BNB');
  console.log('');

  const needed = hre.ethers.parseEther('0.003');
  if (balance < needed) {
    const missing = needed - balance;
    console.log('❌ INSUFICIENTE! Faltam:', hre.ethers.formatEther(missing), 'BNB');
    console.log('');
    console.log('💡 Solução: Adicione pelo menos 0.003 BNB na carteira do deployer');
    console.log('   Faucet BNB Testnet: https://testnet.bnbchain.org/faucet-smart');
  } else {
    console.log('✅ Saldo suficiente!');
  }
  console.log('');
}

checkBalance();
