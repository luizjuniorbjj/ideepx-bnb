// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteMT5Account() {
  try {
    const accountId = process.argv[2];

    if (!accountId) {
      console.error('\n❌ ERRO: ID da conta não fornecido\n');
      console.log('Uso correto:');
      console.log('  node delete-mt5-account.cjs <ACCOUNT_ID>\n');
      console.log('💡 Para listar contas disponíveis, execute:');
      console.log('  node list-mt5-accounts.cjs\n');
      process.exit(1);
    }

    console.log('🔍 DELETAR CONTA MT5\n');
    console.log('='.repeat(80));

    // Buscar conta
    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: {
        user: {
          select: {
            walletAddress: true
          }
        },
        credentials: true
      }
    });

    if (!account) {
      console.error(`\n❌ Conta com ID "${accountId}" não encontrada.\n`);
      console.log('💡 Execute "node list-mt5-accounts.cjs" para ver contas disponíveis.\n');
      process.exit(1);
    }

    // Exibir informações da conta
    console.log(`\n📊 Detalhes da conta a ser deletada:\n`);
    console.log(`   Alias:      ${account.accountAlias || 'N/A'}`);
    console.log(`   Broker:     ${account.brokerName}`);
    console.log(`   Login:      ${account.login}`);
    console.log(`   Servidor:   ${account.server}`);
    console.log(`   Usuário:    ${account.user.walletAddress}`);
    console.log(`   Status:     ${account.status}`);
    console.log(`   Saldo:      US$ ${account.balance || '0.00'}`);
    console.log('');

    // Contar snapshots
    const snapshotCount = await prisma.accountSnapshot.count({
      where: { tradingAccountId: accountId }
    });

    console.log(`⚠️  AVISO: Esta ação irá deletar:\n`);
    console.log(`   - 1 conta MT5`);
    console.log(`   - ${account.credentials ? '1' : '0'} registro de credenciais`);
    console.log(`   - ${snapshotCount} snapshot(s) de histórico`);
    console.log('');
    console.log('   Esta operação NÃO PODE SER DESFEITA!\n');
    console.log('='.repeat(80));

    // Executar deleção
    console.log('\n🗑️  Deletando...\n');

    // 1. Deletar snapshots
    if (snapshotCount > 0) {
      const deletedSnapshots = await prisma.accountSnapshot.deleteMany({
        where: { tradingAccountId: accountId }
      });
      console.log(`   ✅ ${deletedSnapshots.count} snapshot(s) deletado(s)`);
    }

    // 2. Deletar credenciais
    if (account.credentials) {
      await prisma.tradingAccountCredential.delete({
        where: { tradingAccountId: accountId }
      });
      console.log(`   ✅ Credenciais deletadas`);
    }

    // 3. Deletar conta
    await prisma.tradingAccount.delete({
      where: { id: accountId }
    });
    console.log(`   ✅ Conta MT5 deletada`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ CONTA DELETADA COM SUCESSO!\n');
    console.log('💡 Para adicionar nova conta: http://localhost:3000/mt5/connect');
    console.log('💡 Para listar contas: node list-mt5-accounts.cjs\n');

  } catch (error) {
    console.error('\n❌ Erro ao deletar conta:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteMT5Account();
