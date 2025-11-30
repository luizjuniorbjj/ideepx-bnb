import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const totalUsers = await prisma.user.count();

    // Usuários ativos = active: true E subscriptionExpiry > agora
    const now = Math.floor(Date.now() / 1000);
    const users = await prisma.user.findMany({
      where: {
        active: true,
        subscriptionExpiry: { gt: now }
      },
      select: { id: true, walletAddress: true, subscriptionExpiry: true }
    });

    const activeUsers = users.length;

    console.log('\n📊 STATUS DO BANCO DE DADOS:');
    console.log('   Total de usuários:', totalUsers);
    console.log('   Usuários com assinatura ativa:', activeUsers);

    if (activeUsers > 0) {
      console.log('\n✅ Há usuários ativos! Pode prosseguir com o teste.');
      console.log('\nUsuários ativos:');
      users.forEach(u => {
        const expiresAt = new Date(u.subscriptionExpiry * 1000).toISOString();
        console.log(`   - ${u.walletAddress} (expira: ${expiresAt})`);
      });
    } else {
      console.log('\n⚠️ Nenhum usuário com assinatura ativa encontrado!');
      console.log('   O snapshot será gerado mas estará vazio.');
      console.log('   Recomendação: Criar usuários de teste primeiro.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkUsers();
