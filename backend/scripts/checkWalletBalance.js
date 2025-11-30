import hre from 'hardhat';

const WALLET = '0xeb2451a8dd58734134dd7bde64a5f86725b75ef2';

async function checkBalance() {
  const balance = await hre.ethers.provider.getBalance(WALLET);

  console.log('');
  console.log('💰 Carteira:', WALLET);
  console.log('💵 Saldo BNB:', hre.ethers.formatEther(balance), 'BNB');
  console.log('');
  console.log('📊 Para adicionar 30 usuários:');
  console.log('   Necessário: ~0.003 BNB');
  console.log('   Atual:', hre.ethers.formatEther(balance), 'BNB');
  console.log('');

  const needed = hre.ethers.parseEther('0.003');
  if (balance >= needed) {
    console.log('✅ Saldo SUFICIENTE para executar o script!');
  } else {
    const missing = needed - balance;
    console.log('❌ INSUFICIENTE! Faltam:', hre.ethers.formatEther(missing), 'BNB');
  }
  console.log('');
}

checkBalance();
