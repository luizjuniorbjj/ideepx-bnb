const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testando banco de dados...\n');

  // Buscar 3 primeiros usuários
  const users = await prisma.user.findMany({
    take: 3,
    select: {
      walletAddress: true,
      active: true,
      maxLevel: true,
      monthlyVolume: true,
      internalBalance: true,
      subscriptionExpiry: true,
      lastWithdrawMonth: true,
      withdrawnThisMonth: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`✅ Total de usuários encontrados: ${users.length}\n`);

  users.forEach((user, i) => {
    console.log(`[${i + 1}] ${user.walletAddress}`);
    console.log(`    Active: ${user.active}`);
    console.log(`    MaxLevel: ${user.maxLevel}`);
    console.log(`    MonthlyVolume: $${user.monthlyVolume}`);
    console.log(`    InternalBalance: $${user.internalBalance}`);
    console.log(`    Subscription Expiry: ${user.subscriptionExpiry}`);
    console.log(`    Last Withdraw Month: ${user.lastWithdrawMonth}`);
    console.log(`    Withdrawn This Month: $${user.withdrawnThisMonth}`);
    console.log(`    Created: ${user.createdAt}\n`);
  });

  // Stats gerais
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { active: true } });

  console.log('📊 Estatísticas:');
  console.log(`   Total: ${totalUsers} usuários`);
  console.log(`   Ativos: ${activeUsers} usuários`);
  console.log(`   Inativos: ${totalUsers - activeUsers} usuários`);
}

main()
  .catch(e => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
