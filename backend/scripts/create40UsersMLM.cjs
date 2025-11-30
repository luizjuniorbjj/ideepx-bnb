const { ethers } = require('ethers');

// Configuração
const PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = '0x1E61B5c379fb583D341f2F1eDcEf4db9A3Be22a8';
const USDT_ADDRESS = '0x8d06e1376F205Ca66E034be72F50c889321110fA';

// ABIs
const CONTRACT_ABI = [
  "function selfRegister(address sponsorWallet) external",
  "function selfSubscribe() external"
];

const USDT_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 CRIANDO 40 NOVOS USUÁRIOS NO MLM\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, adminWallet);

  console.log(`Admin: ${adminWallet.address}`);
  console.log(`Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`USDT: ${USDT_ADDRESS}\n`);

  const bnb = await provider.getBalance(adminWallet.address);
  const usdtBal = await usdt.balanceOf(adminWallet.address);
  console.log(`BNB: ${ethers.formatEther(bnb)}`);
  console.log(`USDT: ${ethers.formatUnits(usdtBal, 18)} USDT\n`);

  let successCount = 0;
  const wallets = [];

  for (let i = 0; i < 40; i++) {
    console.log(`[${i+1}/40] Criando usuário...`);

    try {
      // Gerar carteira
      const newWallet = ethers.Wallet.createRandom();
      const newWalletWithProvider = new ethers.Wallet(newWallet.privateKey, provider);
      console.log(`   ${newWallet.address}`);

      // Enviar BNB (0.01)
      const bnbTx = await adminWallet.sendTransaction({
        to: newWallet.address,
        value: ethers.parseEther('0.01')
      });
      await bnbTx.wait();
      await sleep(1000);

      // Enviar USDT (29)
      const usdtAmount = ethers.parseEther('29');
      const usdtTx = await usdt.transfer(newWallet.address, usdtAmount);
      await usdtTx.wait();
      await sleep(1000);

      // Registrar
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newWalletWithProvider);
      const sponsor = i === 0 ? adminWallet.address : wallets[Math.floor(Math.random() * wallets.length)].address;

      const regTx = await contract.selfRegister(sponsor);
      await regTx.wait();
      await sleep(1000);

      // Aprovar USDT
      const newUsdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, newWalletWithProvider);
      const approveTx = await newUsdt.approve(CONTRACT_ADDRESS, usdtAmount);
      await approveTx.wait();
      await sleep(1000);

      // Assinar
      const subTx = await contract.selfSubscribe();
      await subTx.wait();

      wallets.push(newWallet);
      successCount++;
      console.log(`   ✅ [${successCount}/40]\n`);

      await sleep(2000);
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message.substring(0, 80)}\n`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Criados: ${successCount}/40`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().then(() => process.exit(0)).catch(console.error);
