import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function findTopBySponsorAddress() {
  console.log('🔍 Analisando rede MLM por sponsorAddress...\n');

  try {
    // Buscar todos os usuários
    const allUsers = await prisma.user.findMany({
      where: { active: true }
    });

    console.log(`📊 Total de usuários ativos: ${allUsers.length}\n`);

    // Contar quantas pessoas têm cada usuário como sponsor
    const networkSize = {};

    for (const user of allUsers) {
      // Contar quantos usuários têm este como sponsor
      const downline = allUsers.filter(u =>
        u.sponsorAddress && u.sponsorAddress.toLowerCase() === user.walletAddress.toLowerCase()
      );

      networkSize[user.walletAddress] = {
        user: user,
        directReferrals: downline.length,
        referralAddresses: downline.map(u => u.walletAddress)
      };
    }

    // Encontrar o usuário com mais referrals diretos
    const sortedByNetwork = Object.values(networkSize)
      .sort((a, b) => b.directReferrals - a.directReferrals);

    if (sortedByNetwork.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      return;
    }

    const topUser = sortedByNetwork[0];

    console.log('🏆 Top 5 usuários com mais referrals diretos:\n');
    sortedByNetwork.slice(0, 5).forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.user.walletAddress.substring(0, 15)}... - ${item.directReferrals} referrals diretos`);
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 Selecionado: Usuário com ${topUser.directReferrals} referrals diretos\n`);

    // Gerar nova carteira para ter a private key
    const newWallet = ethers.Wallet.createRandom();

    // Atualizar o endereço no banco
    const updatedUser = await prisma.user.update({
      where: { id: topUser.user.id },
      data: {
        walletAddress: newWallet.address.toLowerCase()
      }
    });

    // Atualizar todos os referrals para apontarem para o novo endereço
    if (topUser.directReferrals > 0) {
      await prisma.user.updateMany({
        where: {
          sponsorAddress: topUser.user.walletAddress.toLowerCase()
        },
        data: {
          sponsorAddress: newWallet.address.toLowerCase()
        }
      });
      console.log(`✅ ${topUser.directReferrals} referrals atualizados com novo sponsor address\n`);
    }

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
    console.log(`   - Referrals Diretos (L1): ${topUser.directReferrals}`);
    console.log(`   - Sponsor: ${updatedUser.sponsorAddress || 'Nenhum (topo da rede)'}`);

    if (topUser.directReferrals > 0) {
      console.log(`\n📋 Endereços dos Referrals Diretos:`);
      topUser.referralAddresses.forEach((addr, idx) => {
        console.log(`   ${idx + 1}. ${addr.substring(0, 20)}...`);
      });
    }

    console.log('\n━'.repeat(70));
    console.log('💡 COMO USAR:');
    console.log('━'.repeat(70));
    console.log('\n1. Abra o MetaMask');
    console.log('2. Clique em "Importar Conta"');
    console.log('3. Cole a Private Key acima');
    console.log('4. Configure BSC Testnet (Chain ID: 97)');
    console.log('5. Acesse http://localhost:3000');
    console.log('6. Conecte com esta carteira\n');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

findTopBySponsorAddress().catch(console.error);
