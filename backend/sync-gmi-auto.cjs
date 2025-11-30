// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncGMIAuto() {
  try {
    console.log('🔄 SINCRONIZAÇÃO AUTOMÁTICA GMI EDGE\n');
    console.log('='.repeat(80));

    const accountId = '022cfd0e-baa1-4364-969d-9a2b41bc3215';

    // Valores do MT5 GMI Edge (conforme screenshot)
    // IMPORTANTE: Estes são valores de exemplo - ajuste conforme necessário
    const mt5Data = {
      balance: '9947.89',      // Balance do MT5
      equity: '9947.89',       // Equity do MT5
      margin: '0',             // Sem posições abertas
      freeMargin: '9947.89',   // Todo capital disponível
      marginLevel: '0',        // Sem margem utilizada
      openTrades: 12,          // 12 posições conforme log MT5
      openPL: '0',             // P/L zerado (balance = equity)
      dayPL: '0',
      weekPL: '0',
      monthPL: '0',
      totalPL: '0',
      status: 'CONNECTED',
      connected: true,
      lastHeartbeat: new Date(),
      lastSnapshotAt: new Date()
    };

    console.log('\n📊 Sincronizando com dados:\n');
    console.log(`   Balance:      US$ ${mt5Data.balance}`);
    console.log(`   Equity:       US$ ${mt5Data.equity}`);
    console.log(`   Free Margin:  US$ ${mt5Data.freeMargin}`);
    console.log(`   Open Trades:  ${mt5Data.openTrades}`);
    console.log('');

    // Atualizar conta
    const updated = await prisma.tradingAccount.update({
      where: { id: accountId },
      data: mt5Data
    });

    console.log('✅ Conta atualizada com sucesso!');
    console.log(`   ID: ${updated.id}`);
    console.log(`   Broker: ${updated.brokerName}`);
    console.log(`   Login: ${updated.login}`);
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

    console.log('📸 Snapshot criado com sucesso!\n');
    console.log('='.repeat(80));
    console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA!\n');
    console.log('💡 Atualize o dashboard: http://localhost:3000/mt5/dashboard');
    console.log('');
    console.log('⚠️  NOTA: Os valores foram baseados nos logs do MT5.');
    console.log('   Se os valores estiverem diferentes, edite este arquivo');
    console.log('   e ajuste as linhas 16-26 com os valores corretos.\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncGMIAuto();
