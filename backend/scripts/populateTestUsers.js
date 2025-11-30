import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function populateTestUsers() {
  console.log('🔄 Criando usuários de teste no database...\n');

  // Gerar 20 endereços de carteira aleatórios
  const testUsers = [];

  for (let i = 0; i < 20; i++) {
    const wallet = ethers.Wallet.createRandom();
    const isActive = i < 15; // 15 ativos, 5 inativos
    const now = Math.floor(Date.now() / 1000);
    const expiry = isActive ? now + (30 * 24 * 60 * 60) : now - (10 * 24 * 60 * 60);

    testUsers.push({
      walletAddress: wallet.address.toLowerCase(),
      active: isActive,
      kycStatus: isActive ? 1 : 0,
      subscriptionExpiry: expiry,
      sponsorAddress: i > 0 ? testUsers[Math.floor(i / 3)]?.walletAddress || null : null,
      maxLevel: isActive ? Math.min(10, Math.floor(i / 2) + 1) : 0,
      totalEarned: (Math.random() * 5000).toFixed(2),
      totalWithdrawn: (Math.random() * 2000).toFixed(2),
      internalBalance: (Math.random() * 1000).toFixed(2),
      monthlyVolume: (Math.random() * 10000).toFixed(2),
      totalVolume: (Math.random() * 50000).toFixed(2)
    });
  }

  let created = 0;

  for (const userData of testUsers) {
    try {
      const user = await prisma.user.create({
        data: userData
      });

      console.log(`✅ Criado: ${user.walletAddress.substring(0, 10)}...`);
      console.log(`   Status: ${user.active ? 'Ativo' : 'Inativo'}`);
      console.log(`   Total Earned: $${user.totalEarned}`);
      console.log(`   Max Level: ${user.maxLevel}\n`);

      created++;
    } catch (error) {
      console.error(`❌ Erro ao criar usuário:`);
      console.error(`   ${error.message}\n`);
    }
  }

  console.log('━'.repeat(60));
  console.log(`✅ Criação concluída!`);
  console.log(`   Usuários criados: ${created}`);
  console.log(`   Usuários ativos: ${testUsers.filter(u => u.active).length}`);
  console.log(`   Usuários inativos: ${testUsers.filter(u => !u.active).length}`);
  console.log('━'.repeat(60));

  await prisma.$disconnect();
}

populateTestUsers().catch(console.error);
