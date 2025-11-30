// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncGMIQuick() {
  try {
    console.log('🔄 SINCRONIZAÇÃO RÁPIDA GMI EDGE\n');
    console.log('='.repeat(80));

    const accountId = '022cfd0e-baa1-4364-969d-9a2b41bc3215';

    // Buscar conta
    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      console.error('\n❌ Conta não encontrada!\n');
      process.exit(1);
    }

    console.log(`\n📊 Conta: GMI Edge ${account.login}\n`);
    console.log('📋 INSTRUÇÕES:\n');
    console.log('1. Verifique o MT5 - ele deve estar logado na conta 32650016');
    console.log('2. Anote os valores abaixo:\n');
    console.log('Digite os valores EXATOS do MT5:\n');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (query) => new Promise(resolve => readline.question(query, resolve));

    const balance = await askQuestion('Balance: US$ ');
    const equity = await askQuestion('Equity: US$ ');
    const margin = await askQuestion('Margin: US$ ');
    const freeMargin = await askQuestion('Free Margin: US$ ');
    const openTrades = await askQuestion('Trades Abertos: ');

    readline.close();

    console.log('\n🔄 Atualizando...\n');

    const mt5Data = {
      balance: balance || '0',
      equity: equity || '0',
      margin: margin || '0',
      freeMargin: freeMargin || '0',
      marginLevel: margin > 0 ? String((parseFloat(equity) / parseFloat(margin)) * 100) : '0',
      openTrades: parseInt(openTrades) || 0,
      openPL: String(parseFloat(equity || 0) - parseFloat(balance || 0)),
      dayPL: '0',
      weekPL: '0',
      monthPL: '0',
      totalPL: String(parseFloat(equity || 0) - parseFloat(balance || 0)),
      status: 'CONNECTED',
      connected: true,
      lastHeartbeat: new Date(),
      lastSnapshotAt: new Date()
    };

    // Atualizar conta
    const updated = await prisma.tradingAccount.update({
      where: { id: accountId },
      data: mt5Data
    });

    console.log('✅ Conta atualizada!');
    console.log(`   Balance: US$ ${updated.balance}`);
    console.log(`   Equity: US$ ${updated.equity}`);
    console.log(`   Trades: ${updated.openTrades}\n`);

    // Criar snapshot
    await prisma.accountSnapshot.create({
      data: {
        tradingAccountId: accountId,
        balance: mt5Data.balance,
        equity: mt5Data.equity,
        margin: mt5Data.margin,
        freeMargin: mt5Data.freeMargin,
        marginLevel: mt5Data.marginLevel,
        openTrades: mt5Data.openTrades,
        openPL: mt5Data.openPL,
        dayPL: mt5Data.dayPL,
        weekPL: mt5Data.weekPL,
        monthPL: mt5Data.monthPL,
        totalPL: mt5Data.totalPL
      }
    });

    console.log('📸 Snapshot criado!\n');
    console.log('='.repeat(80));
    console.log('\n✅ CONCLUÍDO! Atualize o dashboard: http://localhost:3000/mt5/dashboard\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncGMIQuick();
