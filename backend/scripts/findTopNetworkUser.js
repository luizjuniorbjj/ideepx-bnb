import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function findTopNetworkUser() {
  console.log('🔍 Buscando usuário com maior rede...\n');

  try {
    // Buscar todos os usuários ativos com seus referrals
    const users = await prisma.user.findMany({
      where: { active: true },
      include: {
        referrals: {
          where: { active: true }
        }
      },
      orderBy: {
        referrals: {
          _count: 'desc'
        }
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      return;
    }

    // Pegar o usuário com mais referrals
    const topUser = users[0];
    const referralCount = topUser.referrals.length;

    console.log(`✅ Usuário encontrado com ${referralCount} referrals diretos!\n`);

    // Gerar nova carteira para substituir (para ter a private key)
    const newWallet = ethers.Wallet.createRandom();

    // Atualizar o endereço no banco
    const updatedUser = await prisma.user.update({
      where: { id: topUser.id },
      data: {
        walletAddress: newWallet.address.toLowerCase()
      },
      include: {
        referrals: {
          where: { active: true },
          select: {
            walletAddress: true,
            totalEarned: true,
            maxLevel: true
          }
        }
      }
    });

    console.log('━'.repeat(70));
    console.log('🏆 CARTEIRA COM MAIOR REDE MLM');
    console.log('━'.repeat(70));
    console.log(`\n🔑 Endereço da Carteira:\n   ${newWallet.address}`);
    console.log(`\n🔐 Private Key (GUARDAR COM SEGURANÇA!):\n   ${newWallet.privateKey}`);

    console.log(`\n📊 Status da Conta:`);
    console.log(`   - Status: ${updatedUser.active ? '✅ ATIVA' : '❌ INATIVA'}`);
    console.log(`   - KYC: ${updatedUser.kycStatus === 1 ? '✅ Aprovado' : '⏳ Pendente'}`);
    console.log(`   - Max Level MLM: ${updatedUser.maxLevel}`);
    console.log(`   - Total Earned: $${updatedUser.totalEarned}`);
    console.log(`   - Internal Balance: $${updatedUser.internalBalance}`);
    console.log(`   - Monthly Volume: $${updatedUser.monthlyVolume}`);
    console.log(`   - Total Volume: $${updatedUser.totalVolume}`);

    const expiryDate = new Date(updatedUser.subscriptionExpiry * 1000);
    console.log(`   - Assinatura válida até: ${expiryDate.toLocaleDateString('pt-BR')}`);

    console.log(`\n👥 Rede MLM:`);
    console.log(`   - Referrals Diretos (L1): ${updatedUser.referrals.length}`);
    console.log(`   - Sponsor: ${updatedUser.sponsorAddress || 'Nenhum (topo da rede)'}`);

    if (updatedUser.referrals.length > 0) {
      console.log(`\n📋 Lista de Referrals Diretos:`);
      updatedUser.referrals.forEach((ref, idx) => {
        console.log(`   ${idx + 1}. ${ref.walletAddress.substring(0, 10)}... - Level ${ref.maxLevel} - Earned: $${ref.totalEarned}`);
      });
    }

    console.log('\n━'.repeat(70));
    console.log('💡 COMO USAR:');
    console.log('━'.repeat(70));
    console.log('\n1. Abra o MetaMask');
    console.log('2. Clique em "Importar Conta"');
    console.log('3. Cole a Private Key acima');
    console.log('4. Configure BSC Testnet');
    console.log('5. Acesse http://localhost:3000');
    console.log('6. Conecte com esta carteira\n');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findTopNetworkUser().catch(console.error);
