/**
 * Verificar se a conta GMI foi conectada e salva no banco
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  console.log('\n🔍 Verificando conexões GMI no banco...\n');

  try {
    // Buscar todas as contas GMI
    const gmiAccounts = await prisma.gmiAccount.findMany({
      include: {
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    console.log(`📊 Total de contas GMI: ${gmiAccounts.length}\n`);

    if (gmiAccounts.length === 0) {
      console.log('❌ Nenhuma conta GMI encontrada no banco!\n');
      return;
    }

    // Exibir cada conta
    gmiAccounts.forEach((account, idx) => {
      console.log(`\n🔗 CONTA ${idx + 1}:`);
      console.log(`   Wallet: ${account.user.walletAddress}`);
      console.log(`   Account Number: ${account.accountNumber}`);
      console.log(`   Server: ${account.server}`);
      console.log(`   Platform: ${account.platform}`);
      console.log(`   Connected: ${account.connected ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Balance: $${account.balance}`);
      console.log(`   Equity: $${account.equity}`);
      console.log(`   Total Trades: ${account.totalTrades}`);
      console.log(`   Last Sync: ${account.lastSyncAt}`);
    });

    console.log('\n');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
