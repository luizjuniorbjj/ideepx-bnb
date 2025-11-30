const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();

    console.log('\n📊 ========== STATUS DO BANCO DE DADOS ==========\n');
    console.log('📈 TOTAL DE USUÁRIOS:', users.length);
    console.log('');

    const activeUsers = users.filter(u => u.active);
    const inactiveUsers = users.filter(u => !u.active);

    console.log('✅ Usuários ATIVOS:', activeUsers.length);
    console.log('❌ Usuários INATIVOS:', inactiveUsers.length);
    console.log('');

    // Total em saldos
    const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.internalBalance || '0'), 0);
    const totalEarned = users.reduce((sum, u) => sum + parseFloat(u.totalEarned || '0'), 0);
    const totalVolume = users.reduce((sum, u) => sum + parseFloat(u.totalVolume || '0'), 0);

    console.log('💰 TOTAIS:');
    console.log(`   Saldo Total: $${totalBalance.toFixed(2)}`);
    console.log(`   Total Ganho: $${totalEarned.toFixed(2)}`);
    console.log(`   Volume Total: $${totalVolume.toFixed(2)}`);
    console.log('');

    // Top 5 por saldo
    console.log('🏆 TOP 5 POR SALDO INTERNO:');
    users
      .sort((a, b) => parseFloat(b.internalBalance || '0') - parseFloat(a.internalBalance || '0'))
      .slice(0, 5)
      .forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.walletAddress.slice(0, 10)}...${u.walletAddress.slice(-4)} - Saldo: $${parseFloat(u.internalBalance || '0').toFixed(2)} - Nível: ${u.maxLevel}/10 - ${u.active ? '✅' : '❌'}`);
      });
    console.log('');

    // Top 5 por total ganho
    console.log('💎 TOP 5 POR TOTAL GANHO:');
    users
      .sort((a, b) => parseFloat(b.totalEarned || '0') - parseFloat(a.totalEarned || '0'))
      .slice(0, 5)
      .forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.walletAddress.slice(0, 10)}...${u.walletAddress.slice(-4)} - Ganho: $${parseFloat(u.totalEarned || '0').toFixed(2)} - Volume: $${parseFloat(u.monthlyVolume || '0').toFixed(2)}`);
      });
    console.log('');

    // Distribuição por nível
    console.log('📊 DISTRIBUIÇÃO POR NÍVEL MLM:');
    for (let level = 0; level <= 10; level++) {
      const count = users.filter(u => u.maxLevel === level).length;
      if (count > 0) {
        console.log(`   Nível ${level}: ${count} usuários`);
      }
    }
    console.log('');

    console.log('===============================================\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
