// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncMT5Manual() {
  try {
    console.log('🔄 Sincronizando dados do MT5 manualmente...\n');

    const accountId = 'c6a7c6f6-16e0-46c1-a4ff-10d965ca1d46';

    // Dados do MT5 (Balance: 0.91 USC conforme screenshot)
    const mt5Data = {
      balance: '0.91',
      equity: '0.91',
      margin: '0',
      freeMargin: '0.91',
      marginLevel: '0',
      openTrades: 0,
      openPL: '0',
      dayPL: '0',
      weekPL: '0',
      monthPL: '0',
      totalPL: '0',
      status: 'CONNECTED',
      connected: true,
      lastHeartbeat: new Date(),
      lastSnapshotAt: new Date()
    };

    console.log('📊 Dados a sincronizar:');
    console.log(`   Balance: US$ ${mt5Data.balance}`);
    console.log(`   Equity: US$ ${mt5Data.equity}`);
    console.log(`   Free Margin: US$ ${mt5Data.freeMargin}`);
    console.log(`   Open Trades: ${mt5Data.openTrades}\n`);

    // Atualizar conta
    const updated = await prisma.tradingAccount.update({
      where: { id: accountId },
      data: mt5Data
    });

    console.log('✅ Conta atualizada com sucesso!');
    console.log(`   ID: ${updated.id}`);
    console.log(`   Status: ${updated.status}`);
    console.log(`   Balance: US$ ${updated.balance}`);
    console.log(`   Equity: US$ ${updated.equity}\n`);

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

    console.log('📸 Snapshot criado com sucesso!\n');
    console.log('✨ Agora atualize o dashboard em: http://localhost:3000/mt5/dashboard');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncMT5Manual();
