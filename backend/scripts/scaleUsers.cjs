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
  console.log('🚀 INICIANDO SCALE DE USUÁRIOS\n');

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
  console.log('📈 Buscando usuários inativos...\n');
  const inactiveUsers = await prisma.user.findMany({
    where: { isActive: false }
  });

  console.log(`Encontrados: ${inactiveUsers.length} usuários inativos`);
  console.log('Endereços:');
  inactiveUsers.forEach((u, i) => {
    console.log(`   ${i+1}. ${u.walletAddress} (Sponsor: ${u.sponsorAddress?.substring(0, 10)}...)`);
  });
  console.log('');

  // ==========================================
  // FASE 1: ATIVAR USUÁRIOS INATIVOS (5)
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FASE 1: ATIVANDO USUÁRIOS INATIVOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let activatedCount = 0;

  for (let i = 0; i < Math.min(5, inactiveUsers.length); i++) {
    const user = inactiveUsers[i];
    console.log(`[${i+1}/5] Ativando ${user.walletAddress}...`);

    try {
      // Transferir USDT para o usuário poder pagar
      const usdtAmount = ethers.parseUnits('19', 6);
      const transferTx = await usdt.transfer(user.walletAddress, usdtAmount);
      await transferTx.wait();
      console.log(`   ✅ USDT transferido`);

      // Aguardar um pouco
      await sleep(2000);

      // Criar carteira do usuário e fazer subscribe
      const userWallet = new ethers.Wallet(user.walletAddress, provider);

      // Aprovar USDT
      const userUsdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, userWallet);
      const approveTx = await userUsdt.approve(CONTRACT_ADDRESS, usdtAmount);
      await approveTx.wait();
      console.log(`   ✅ USDT aprovado`);

      await sleep(2000);

      // Fazer subscribe
      const userContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userWallet);
      const subscribeTx = await userContract.selfSubscribe();
      await subscribeTx.wait();
      console.log(`   ✅ Assinatura ativada`);

      // Atualizar no banco
      await prisma.user.update({
        where: { walletAddress: user.walletAddress },
        data: { isActive: true }
      });

      activatedCount++;
      console.log(`   ✅ [${activatedCount}/5] CONCLUÍDO!\n`);

      await sleep(3000);
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
    }
  }

  console.log(`✅ Fase 1 concluída: ${activatedCount} usuários ativados\n`);

  // ==========================================
  // FASE 2: CRIAR E ATIVAR 15 NOVOS USUÁRIOS
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FASE 2: CRIANDO E ATIVANDO 15 NOVOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Pegar usuário ativo aleatório como sponsor
  const activeSponsor = await prisma.user.findFirst({
    where: { isActive: true }
  });

  if (!activeSponsor) {
    console.log('❌ Nenhum sponsor ativo encontrado!');
    return;
  }

  console.log(`📌 Sponsor selecionado: ${activeSponsor.walletAddress}\n`);

  let phase2Count = 0;

  for (let i = 0; i < 15; i++) {
    console.log(`[${i+1}/15] Criando novo usuário...`);

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
      console.log(`   ✅ BNB enviado (gas)`);

      await sleep(2000);

      // Enviar USDT para assinatura
      const usdtAmount = ethers.parseUnits('19', 6);
      const usdtTx = await usdt.transfer(newWallet.address, usdtAmount);
      await usdtTx.wait();
      console.log(`   ✅ USDT enviado`);

      await sleep(2000);

      // Criar provider para novo usuário
      const newUserWallet = new ethers.Wallet(newWallet.privateKey, provider);
      const newUserContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newUserWallet);
      const newUserUsdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, newUserWallet);

      // Registrar
      const registerTx = await newUserContract.selfRegister(activeSponsor.walletAddress);
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
          walletAddress: newWallet.address,
          sponsorAddress: activeSponsor.walletAddress,
          isActive: true,
          level: 1,
          directReferrals: 0,
          totalEarnings: '0',
          totalVolume: '0'
        }
      });

      phase2Count++;
      console.log(`   ✅ [${phase2Count}/15] CONCLUÍDO!\n`);

      await sleep(3000);
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
    }
  }

  console.log(`✅ Fase 2 concluída: ${phase2Count} novos usuários criados e ativados\n`);

  // ==========================================
  // FASE 3: CRIAR 20 USUÁRIOS COMPLETOS COM USDT
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FASE 3: CRIANDO 20 USUÁRIOS COMPLETOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let phase3Count = 0;

  for (let i = 0; i < 20; i++) {
    console.log(`[${i+1}/20] Criando usuário completo...`);

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
      console.log(`   ✅ BNB enviado (gas)`);

      await sleep(2000);

      // Enviar USDT (100 + 29 = 129 USDT - contrato V10)
      const totalUsdt = ethers.parseUnits('129', 6);
      const usdtTx = await usdt.transfer(newWallet.address, totalUsdt);
      await usdtTx.wait();
      console.log(`   ✅ USDT enviado (129 USDT)`);

      await sleep(2000);

      // Criar provider para novo usuário
      const newUserWallet = new ethers.Wallet(newWallet.privateKey, provider);
      const newUserContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newUserWallet);
      const newUserUsdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, newUserWallet);

      // Pegar sponsor aleatório dos usuários ativos
      const sponsors = await prisma.user.findMany({
        where: { isActive: true }
      });
      const randomSponsor = sponsors[Math.floor(Math.random() * sponsors.length)];

      // Registrar
      const registerTx = await newUserContract.selfRegister(randomSponsor.walletAddress);
      await registerTx.wait();
      console.log(`   ✅ Registrado (sponsor: ${randomSponsor.walletAddress.substring(0, 10)}...)`);

      await sleep(2000);

      // Aprovar USDT
      const subscriptionAmount = ethers.parseUnits('19', 6);
      const approveTx = await newUserUsdt.approve(CONTRACT_ADDRESS, subscriptionAmount);
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
          walletAddress: newWallet.address,
          sponsorAddress: randomSponsor.walletAddress,
          isActive: true,
          level: 1,
          directReferrals: 0,
          totalEarnings: '0',
          totalVolume: '0'
        }
      });

      phase3Count++;
      console.log(`   ✅ [${phase3Count}/20] CONCLUÍDO!\n`);

      await sleep(3000);
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
    }
  }

  console.log(`✅ Fase 3 concluída: ${phase3Count} usuários completos criados\n`);

  // ==========================================
  // RELATÓRIO FINAL
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RELATÓRIO FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { isActive: true } });
  const inactiveCount = await prisma.user.count({ where: { isActive: false } });

  const stats = await prisma.user.aggregate({
    _sum: {
      totalEarnings: true,
      totalVolume: true
    }
  });

  console.log('📈 Estatísticas Atualizadas:');
  console.log(`   Total de usuários: ${totalUsers}`);
  console.log(`   Usuários ativos: ${activeUsers}`);
  console.log(`   Usuários inativos: ${inactiveCount}`);
  console.log(`   Total em comissões: $${parseFloat(stats._sum.totalEarnings || 0).toFixed(2)}`);
  console.log(`   Volume total: $${parseFloat(stats._sum.totalVolume || 0).toFixed(2)}`);
  console.log('');

  console.log('✅ Resultados da Operação:');
  console.log(`   Fase 1 - Ativados: ${activatedCount}/5`);
  console.log(`   Fase 2 - Novos ativados: ${phase2Count}/15`);
  console.log(`   Fase 3 - Completos criados: ${phase3Count}/20`);
  console.log(`   TOTAL PROCESSADO: ${activatedCount + phase2Count + phase3Count}/40`);
  console.log('');

  // Saldos finais
  const finalBnb = await provider.getBalance(wallet.address);
  const finalUsdt = await usdt.balanceOf(wallet.address);

  console.log('💰 Saldos Finais:');
  console.log(`   BNB: ${ethers.formatEther(finalBnb)} BNB`);
  console.log(`   USDT: ${ethers.formatUnits(finalUsdt, 6)} USDT`);
  console.log('');

  console.log('🚀 SCALE CONCLUÍDO COM SUCESSO!\n');

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
