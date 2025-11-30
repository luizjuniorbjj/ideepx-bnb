// Script para deletar todas as contas MT5
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllAccounts() {
  try {
    console.log('\n🗑️  Deletando todas as contas MT5...\n');

    // Deletar credenciais
    const deletedCredentials = await prisma.tradingAccountCredential.deleteMany({});
    console.log(`✅ ${deletedCredentials.count} credenciais deletadas`);

    // Deletar snapshots
    const deletedSnapshots = await prisma.accountSnapshot.deleteMany({});
    console.log(`✅ ${deletedSnapshots.count} snapshots deletados`);

    // Deletar contas
    const deletedAccounts = await prisma.tradingAccount.deleteMany({});
    console.log(`✅ ${deletedAccounts.count} contas deletadas`);

    console.log('\n✅ Todas as contas MT5 foram removidas!\n');

  } catch (error) {
    console.error('❌ Erro ao deletar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllAccounts();
