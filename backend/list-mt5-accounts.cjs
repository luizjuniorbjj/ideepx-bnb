// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listMT5Accounts() {
  try {
    console.log('📋 LISTAGEM DE CONTAS MT5\n');
    console.log('='.repeat(80));

    // Buscar todas as contas MT5
    const accounts = await prisma.tradingAccount.findMany({
      include: {
        user: {
          select: {
            walletAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (accounts.length === 0) {
      console.log('⚠️  Nenhuma conta MT5 encontrada no banco de dados.\n');
      return;
    }

    console.log(`\n✅ Total: ${accounts.length} conta(s) encontrada(s)\n`);
    console.log('='.repeat(80));

    accounts.forEach((account, index) => {
      const status = account.connected ? '🟢 CONECTADO' : '🔴 DESCONECTADO';
      const lastUpdate = account.lastHeartbeat
        ? new Date(account.lastHeartbeat).toLocaleString('pt-BR')
        : 'Nunca';

      console.log(`\n[${index + 1}] ${account.accountAlias || `Conta ${account.login}`}`);
      console.log('-'.repeat(80));
      console.log(`   ID:              ${account.id}`);
      console.log(`   Usuário:         ${account.user.walletAddress}`);
      console.log(`   Broker:          ${account.brokerName}`);
      console.log(`   Login:           ${account.login}`);
      console.log(`   Servidor:        ${account.server}`);
      console.log(`   Plataforma:      ${account.platform}`);
      console.log(`   Status:          ${status} (${account.status})`);
      console.log(`   Saldo:           US$ ${account.balance || '0.00'}`);
      console.log(`   Equity:          US$ ${account.equity || '0.00'}`);
      console.log(`   Trades Abertos:  ${account.openTrades || 0}`);
      console.log(`   Última Atualiz.: ${lastUpdate}`);
      console.log(`   Criada em:       ${new Date(account.createdAt).toLocaleString('pt-BR')}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Para deletar uma conta, use: node delete-mt5-account.cjs <ID>');
    console.log('💡 Para adicionar nova conta: http://localhost:3000/mt5/connect\n');

  } catch (error) {
    console.error('❌ Erro ao listar contas:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listMT5Accounts();
