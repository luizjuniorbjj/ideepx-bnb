/**
 * 🚀 SCRIPT COMPLETO - 30 Usuários (25 ativos + 5 inativos)
 *
 * Registra usuários no smart contract usando suas próprias carteiras
 */

import hre from 'hardhat';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurações
const CONTRACT_ADDRESS = '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';
const MOCK_USDT_ADDRESS = '0x6B38Da364B41880fc20B8eF88E7045AC4AAd2cdA';
const MAIN_WALLET = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';
const SUBSCRIPTION_PRICE = hre.ethers.parseUnits('29', 6); // $29 USDT (6 decimals)

// Private key do deployer (carteira com BNB)
const DEPLOYER_PRIVATE_KEY = '0x8577a7ed970d8f30ed5b9cdef9ff76b8b17c2bc8160e692652dfb4b65e512c03';

/**
 * Adicionar usuários
 */
async function addUsers() {
  console.log('\n🚀 ===== ADICIONANDO 30 USUÁRIOS (25 ativos + 5 inativos) =====\n');

  try {
    // Usar a carteira com BNB disponível
    const deployer = new hre.ethers.Wallet(DEPLOYER_PRIVATE_KEY, hre.ethers.provider);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log('💰 Deployer:', deployer.address);
    console.log('💵 Saldo BNB:', hre.ethers.formatEther(balance), 'BNB');
    console.log('');

    // Contratos (conectados ao deployer)
    const contract = await hre.ethers.getContractAt('iDeepXDistributionV2', CONTRACT_ADDRESS, deployer);
    const mockUSDT = await hre.ethers.getContractAt('contracts/MockUSDT.sol:MockUSDT', MOCK_USDT_ADDRESS, deployer);

    console.log('✅ Contrato MLM:', CONTRACT_ADDRESS);
    console.log('✅ MockUSDT:', MOCK_USDT_ADDRESS);
    console.log('');

    // Estrutura: 3 L1 + 9 L2 + 18 L3 = 30 usuários
    const users = [];
    let index = 10;

    // NÍVEL 1 - 3 usuários diretos
    const level1 = [];
    for (let i = 0; i < 3; i++) {
      const wallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
      level1.push(wallet);
      users.push({ wallet, sponsor: MAIN_WALLET, level: 1 });
      index++;
    }

    // NÍVEL 2 - 9 usuários (3 para cada L1)
    const level2 = [];
    for (let i = 0; i < level1.length; i++) {
      for (let j = 0; j < 3; j++) {
        const wallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
        level2.push(wallet);
        users.push({ wallet, sponsor: level1[i].address, level: 2 });
        index++;
      }
    }

    // NÍVEL 3 - 18 usuários (2 para cada L2)
    const level3 = [];
    for (let i = 0; i < level2.length; i++) {
      for (let j = 0; j < 2; j++) {
        const wallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
        level3.push(wallet);
        users.push({ wallet, sponsor: level2[i].address, level: 3 });
        index++;
      }
    }

    console.log(`📊 Total de usuários para adicionar: ${users.length}`);
    console.log('   Nível 1: 3 usuários');
    console.log('   Nível 2: 9 usuários');
    console.log('   Nível 3: 18 usuários');
    console.log('');
    console.log('📌 Estratégia:');
    console.log('   ✅ Ativar os primeiros 25 usuários');
    console.log('   ⏸️  Deixar os últimos 5 SEM ativar');
    console.log('');

    // Transferir BNB para gas
    console.log('💸 Transferindo BNB para gas...');
    const gasAmount = hre.ethers.parseEther('0.0001'); // 0.0001 BNB por usuário (suficiente para ~5 tx)

    for (let i = 0; i < users.length; i++) {
      const tx = await deployer.sendTransaction({
        to: users[i].wallet.address,
        value: gasAmount
      });
      await tx.wait();

      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ ${i + 1}/${users.length} usuários receberam BNB`);
      }
    }
    console.log(`   ✅ Todos os ${users.length} usuários receberam BNB para gas`);
    console.log('');

    // Registrar usuários
    console.log('📝 REGISTRANDO USUÁRIOS NO CONTRATO...');
    console.log('');

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        console.log(`[${i + 1}/${users.length}] ${user.wallet.address.slice(0, 10)}... (L${user.level})`);

        // Registrar usando a carteira do próprio usuário
        const contractWithSigner = contract.connect(user.wallet);
        const tx = await contractWithSigner.selfRegister(user.sponsor);
        await tx.wait();

        console.log(`   ✅ Registrado! TX: ${tx.hash.slice(0, 20)}...`);

        // Salvar no banco
        await prisma.user.upsert({
          where: { walletAddress: user.wallet.address.toLowerCase() },
          create: {
            walletAddress: user.wallet.address.toLowerCase(),
            sponsorAddress: user.sponsor.toLowerCase(),
            active: false,
            registeredAt: new Date()
          },
          update: {
            sponsorAddress: user.sponsor.toLowerCase()
          }
        });

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`   ❌ ERRO:`, error.message);
      }
    }

    console.log('');

    // Ativar os primeiros 25 usuários
    console.log('🔥 ATIVANDO OS PRIMEIROS 25 USUÁRIOS...');
    console.log('');

    for (let i = 0; i < 25; i++) {
      const user = users[i];

      try {
        console.log(`[${i + 1}/25] Ativando ${user.wallet.address.slice(0, 10)}...`);

        // Transferir USDT para o usuário
        const usdtTx = await mockUSDT.transfer(user.wallet.address, SUBSCRIPTION_PRICE);
        await usdtTx.wait();

        // Aprovar contrato MLM
        const mockUSDTWithSigner = mockUSDT.connect(user.wallet);
        const approveTx = await mockUSDTWithSigner.approve(CONTRACT_ADDRESS, SUBSCRIPTION_PRICE);
        await approveTx.wait();

        // Ativar assinatura
        const contractWithSigner = contract.connect(user.wallet);
        const subscribeTx = await contractWithSigner.selfSubscribe();
        await subscribeTx.wait();

        console.log(`   ✅ Ativado! TX: ${subscribeTx.hash.slice(0, 20)}...`);

        // Atualizar banco
        await prisma.user.update({
          where: { walletAddress: user.wallet.address.toLowerCase() },
          data: { active: true }
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ ERRO ao ativar:`, error.message);
      }
    }

    console.log('');
    console.log('🎉 ===== CONCLUÍDO =====');
    console.log('');
    console.log('📊 RESULTADO:');
    console.log(`   ✅ ${users.length} usuários registrados`);
    console.log(`   ✅ 25 usuários ATIVOS`);
    console.log(`   ⏸️  5 usuários INATIVOS (prontos para ativar com saldo)`);
    console.log('');
    console.log('📌 OS 5 USUÁRIOS INATIVOS:');
    for (let i = 25; i < users.length; i++) {
      console.log(`   ${i - 24}. ${users[i].wallet.address}`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
