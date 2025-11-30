const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando usuários com indicados...\n');

  const allUsers = await prisma.user.findMany({
    select: {
      walletAddress: true,
      active: true,
      maxLevel: true,
      internalBalance: true,
      monthlyVolume: true,
      totalEarned: true,
      sponsorAddress: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  console.log('Total de usuários:', allUsers.length);
  console.log('');

  const usersWithReferrals = [];

  for (const user of allUsers) {
    const referralsCount = await prisma.user.count({
      where: {
        sponsorAddress: user.walletAddress
      }
    });

    if (referralsCount > 0) {
      const referrals = await prisma.user.findMany({
        where: {
          sponsorAddress: user.walletAddress
        },
        select: {
          walletAddress: true,
          active: true,
          createdAt: true
        }
      });

      usersWithReferrals.push({
        ...user,
        referrals,
        referralsCount
      });
    }
  }

  console.log('Usuários com indicados:', usersWithReferrals.length);
  console.log('');

  usersWithReferrals.forEach((user, i) => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`USUÁRIO #${i+1} - COM ${user.referralsCount} INDICADOS`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Carteira:', user.walletAddress);
    console.log('Ativo:', user.active ? '✅ SIM' : '❌ NÃO');
    console.log('Max Level MLM:', user.maxLevel);
    console.log('Saldo Interno: $' + user.internalBalance);
    console.log('Volume Mensal: $' + user.monthlyVolume);
    console.log('Total Ganho: $' + user.totalEarned);
    console.log('Cadastrado:', user.createdAt.toLocaleDateString('pt-BR'));
    console.log('');
    console.log('📊 Rede MLM:');
    console.log('  Patrocinador:', user.sponsorAddress || '❌ Nenhum (usuário raiz)');
    console.log('  Total de Indicados Diretos:', user.referralsCount);
    console.log('');
    console.log('Lista de Indicados:');
    user.referrals.forEach((ref, j) => {
      const status = ref.active ? '✅' : '❌';
      const date = ref.createdAt.toLocaleDateString('pt-BR');
      console.log(`  [${j+1}] ${status} ${ref.walletAddress}`);
      console.log(`      Cadastrado: ${date}`);
    });
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
