/**
 * 🔍 VERIFICAR: O que tem no banco de dados para essa wallet?
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('\n🔍 ===== VERIFICANDO BANCO DE DADOS GMI =====\n');

  const address = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('👤 USUÁRIO ENCONTRADO:');
    console.log('   ID:', user.id);
    console.log('   Wallet:', user.walletAddress);
    console.log('');

    // Buscar conta GMI
    const gmiAccount = await prisma.gmiAccount.findUnique({
      where: { userId: user.id }
    });

    if (!gmiAccount) {
      console.log('❌ Nenhuma conta GMI vinculada!');
      return;
    }

    console.log('🏦 CONTA GMI NO BANCO:');
    console.log('   Account Number:', gmiAccount.accountNumber);
    console.log('   Server:', gmiAccount.server);
    console.log('   Platform:', gmiAccount.platform);
    console.log('   Connected:', gmiAccount.connected);
    console.log('   Balance:', gmiAccount.balance);
    console.log('   Equity:', gmiAccount.equity);
    console.log('   Monthly Volume:', gmiAccount.monthlyVolume);
    console.log('   Monthly Profit:', gmiAccount.monthlyProfit);
    console.log('   Total Trades:', gmiAccount.totalTrades);
    console.log('   Last Sync:', gmiAccount.lastSyncAt);
    console.log('   Created:', gmiAccount.createdAt);
    console.log('   Updated:', gmiAccount.updatedAt);
    console.log('');

    console.log('🔑 DADOS SENSÍVEIS:');
    console.log('   Account Hash:', gmiAccount.accountHash);
    console.log('   Encrypted Payload:', gmiAccount.encryptedPayload ? '***PRESENTE***' : 'AUSENTE');
    console.log('');

    // Buscar TODAS as contas GMI (ver se tem dados de outras pessoas)
    const allAccounts = await prisma.gmiAccount.findMany({
      include: { user: true }
    });

    console.log(`📊 TOTAL DE CONTAS GMI NO BANCO: ${allAccounts.length}`);
    console.log('');

    if (allAccounts.length > 1) {
      console.log('⚠️ MÚLTIPLAS CONTAS ENCONTRADAS:');
      for (const acc of allAccounts) {
        console.log(`   - Account: ${acc.accountNumber}, User: ${acc.user.walletAddress.slice(0, 10)}..., Connected: ${acc.connected}`);
      }
    }

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n');
}

checkDatabase();
