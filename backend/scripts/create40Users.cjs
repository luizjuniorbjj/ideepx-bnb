const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Configuração
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const CONTRACT_ADDRESS = process.env.CONTRACT_V10_ADDRESS || process.env.CONTRACT_ADDRESS;
const USDT_ADDRESS = process.env.USDT_ADDRESS;

// ABIs simplificados
const CONTRACT_ABI = [
  "function selfRegister(address sponsor) external",
  "function selfSubscribe() external",
  "function isUserRegistered(address user) external view returns (bool)",
  "function getUserInfo(address user) external view returns (tuple(bool isActive, address sponsor, uint256 directReferrals, uint256 totalEarnings, uint256 currentLevel, uint256 registrationDate))"
];

const USDT_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// Função para gerar carteira aleatória
function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

// Função para esperar alguns segundos
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 CRIANDO 40 NOVOS USUÁRIOS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Setup
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);

  console.log('📊 Configuração:');
  console.log(`   Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`   USDT: ${USDT_ADDRESS}`);
  console.log(`   Admin: ${wallet.address}\n`);

  // Verificar saldo de BNB
  const bnbBalance = await provider.getBalance(wallet.address);
  console.log(`💰 Saldo BNB: ${ethers.formatEther(bnbBalance)} BNB`);

  if (parseFloat(ethers.formatEther(bnbBalance)) < 0.35) {
    console.log('⚠️  ATENÇÃO: Saldo BNB baixo! Recomendado: 0.35 BNB');
  }

  // Verificar saldo de USDT
  const usdtBalance = await usdt.balanceOf(wallet.address);
  console.log(`💰 Saldo USDT: ${ethers.formatUnits(usdtBalance, 6)} USDT\n`);

  if (parseFloat(ethers.formatUnits(usdtBalance, 6)) < 3300) {
    console.log('⚠️  ATENÇÃO: Saldo USDT baixo! Recomendado: 3,300 USDT\n');
  }

  // Estatísticas iniciais
  const initialStats = await prisma.user.count();
  console.log(`📈 Usuários atuais no database: ${initialStats}\n`);

  // Buscar sponsors ativos
  let sponsors = await prisma.user.findMany({
    where: { active: true }
  });

  if (sponsors.length === 0) {
    console.log('⚠️  Nenhum sponsor ativo encontrado. Usando admin como primeiro sponsor...\n');
    sponsors = [{ walletAddress: wallet.address }];
  } else {
    console.log(`✅ Encontrados ${sponsors.length} sponsors ativos\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CRIANDO 40 NOVOS USUÁRIOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let successCount = 0;
  let failCount = 0;
  const createdWallets = [];

  for (let i = 0; i < 40; i++) {
    console.log(`[${i+1}/40] Criando usuário completo...`);

    try {
      const newWallet = generateWallet();
      console.log(`   Carteira: ${newWallet.address}`);

      // Enviar BNB para gas
      const bnbAmount = ethers.parseEther('0.01');
      const bnbTx = await wallet.sendTransaction({
        to: newWallet.address,
        value: bnbAmount
      });
      await bnbTx.wait();
      console.log(`   ✅ BNB enviado (0.01 BNB)`);

      await sleep(2000);

      // Enviar USDT (29 USDT para assinatura - contrato V10)
      const usdtAmount = ethers.parseUnits('29', 6);
      const usdtTx = await usdt.transfer(newWallet.address, usdtAmount);
      await usdtTx.wait();
      console.log(`   ✅ USDT enviado (29 USDT)`);

      await sleep(2000);

      // Criar provider para novo usuário
      const newUserWallet = new ethers.Wallet(newWallet.privateKey, provider);
      const newUserContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newUserWallet);
      const newUserUsdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, newUserWallet);

      // Selecionar sponsor aleatório
      const randomSponsor = sponsors[Math.floor(Math.random() * sponsors.length)];
      console.log(`   Sponsor: ${randomSponsor.walletAddress.substring(0, 10)}...`);

      // Registrar
      const registerTx = await newUserContract.selfRegister(randomSponsor.walletAddress);
      await registerTx.wait();
      console.log(`   ✅ Registrado`);

      await sleep(2000);

      // Aprovar USDT
      const approveTx = await newUserUsdt.approve(CONTRACT_ADDRESS, usdtAmount);
      await approveTx.wait();
      console.log(`   ✅ USDT aprovado`);

      await sleep(2000);

      // Assinar
      const subscribeTx = await newUserContract.selfSubscribe();
      await subscribeTx.wait();
      console.log(`   ✅ Assinado e ativado`);

      // Salvar no banco
      await prisma.user.create({
        data: {
          walletAddress: newWallet.address.toLowerCase(),
          sponsorAddress: randomSponsor.walletAddress.toLowerCase(),
          active: true,
          kycStatus: 1,
          subscriptionExpiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          maxLevel: 1,
          totalEarned: '0',
          totalWithdrawn: '0',
          internalBalance: '0',
          monthlyVolume: '0',
          totalVolume: '0'
        }
      });

      // Adicionar aos sponsors disponíveis
      sponsors.push({ walletAddress: newWallet.address });

      successCount++;
      createdWallets.push({
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        sponsor: randomSponsor.walletAddress
      });

      console.log(`   ✅ [${successCount}/40] CONCLUÍDO!\n`);

      await sleep(3000);
    } catch (error) {
      failCount++;
      console.log(`   ❌ ERRO: ${error.message}\n`);
    }
  }

  // ==========================================
  // RELATÓRIO FINAL
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RELATÓRIO FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { active: true } });
  const inactiveCount = await prisma.user.count({ where: { active: false } });

  const stats = await prisma.user.aggregate({
    _sum: {
      totalEarned: true,
      totalVolume: true
    }
  });

  console.log('📈 Estatísticas Atualizadas:');
  console.log(`   Total de usuários: ${totalUsers} (antes: ${initialStats})`);
  console.log(`   Usuários ativos: ${activeUsers}`);
  console.log(`   Usuários inativos: ${inactiveCount}`);
  console.log(`   Total em comissões: $${parseFloat(stats._sum.totalEarned || 0).toFixed(2)}`);
  console.log(`   Volume total: $${parseFloat(stats._sum.totalVolume || 0).toFixed(2)}`);
  console.log('');

  console.log('✅ Resultados da Operação:');
  console.log(`   Criados com sucesso: ${successCount}/40`);
  console.log(`   Falhas: ${failCount}/40`);
  console.log(`   Taxa de sucesso: ${((successCount/40)*100).toFixed(1)}%`);
  console.log('');

  // Saldos finais
  const finalBnb = await provider.getBalance(wallet.address);
  const finalUsdt = await usdt.balanceOf(wallet.address);

  console.log('💰 Saldos Finais:');
  console.log(`   BNB: ${ethers.formatEther(finalBnb)} BNB`);
  console.log(`   USDT: ${ethers.formatUnits(finalUsdt, 6)} USDT`);
  console.log('');

  // Salvar carteiras criadas em arquivo
  if (createdWallets.length > 0) {
    const fs = require('fs');
    const outputPath = path.join(__dirname, 'created_wallets.json');
    fs.writeFileSync(outputPath, JSON.stringify(createdWallets, null, 2));
    console.log(`📝 Carteiras salvas em: ${outputPath}\n`);
  }

  console.log('🚀 CRIAÇÃO CONCLUÍDA COM SUCESSO!\n');

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
