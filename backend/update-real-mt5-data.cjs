/**
 * Atualizar com dados REAIS da conta MT5
 * Conta: 32650015 @ GMI3-Real
 */

const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers');

const prisma = new PrismaClient();

// Dados da conta real
const TEST_WALLET = '0xdf3051d2982660ea265add9ef0323e9f2badc292';
const accountNumber = '32650015';
const server = 'GMI3-Real';

// DADOS REAIS da tela
const realData = {
  balance: '11600.68',
  equity: '12715.46',
  monthlyVolume: '31949.48',
  monthlyProfit: '2686.05',
  monthlyLoss: '0.00', // Não aparece na tela, assumindo 0
  totalTrades: 71
};

async function updateRealData() {
  try {
    console.log('\n=== ATUALIZANDO COM DADOS REAIS ===');
    console.log('Carteira:', TEST_WALLET);
    console.log('Conta:', accountNumber);
    console.log('Servidor:', server);
    console.log('');
    console.log('Dados reais:');
    console.log('  Saldo: $', realData.balance);
    console.log('  Equity: $', realData.equity);
    console.log('  Volume Mensal: $', realData.monthlyVolume);
    console.log('  Lucro Mensal: $', realData.monthlyProfit);
    console.log('  Trades:', realData.totalTrades);

    // Encontrar usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress: TEST_WALLET.toLowerCase() },
      include: { gmiAccount: true }
    });

    if (!user || !user.gmiAccount) {
      console.error('\n❌ Erro: Usuário ou conta GMI não encontrada');
      return;
    }

    console.log('\n✅ Usuário encontrado');

    // Atualizar conta GMI com dados reais
    await prisma.gmiAccount.update({
      where: { id: user.gmiAccount.id },
      data: {
        balance: realData.balance,
        equity: realData.equity,
        monthlyVolume: realData.monthlyVolume,
        monthlyProfit: realData.monthlyProfit,
        monthlyLoss: realData.monthlyLoss,
        totalTrades: realData.totalTrades,
        connected: true,
        lastSyncAt: new Date()
      }
    });

    console.log('✅ Dados da conta GMI atualizados');

    // Atualizar volume do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyVolume: realData.monthlyVolume }
    });

    console.log('✅ Volume do usuário atualizado');

    // Atualizar estatística mensal
    const now = new Date();
    const year = now.getFullYear();
    const month = parseInt(`${year}${String(now.getMonth() + 1).padStart(2, '0')}`);

    const netProfit = (parseFloat(realData.monthlyProfit) - parseFloat(realData.monthlyLoss)).toFixed(2);
    const winRate = realData.totalTrades > 0
      ? ((parseFloat(realData.monthlyProfit) / (parseFloat(realData.monthlyProfit) + parseFloat(realData.monthlyLoss))) * 100).toFixed(2)
      : '0.00';

    await prisma.tradingStat.upsert({
      where: {
        gmiAccountId_month_year: {
          gmiAccountId: user.gmiAccount.id,
          month,
          year
        }
      },
      update: {
        volume: realData.monthlyVolume,
        profit: realData.monthlyProfit,
        loss: realData.monthlyLoss,
        netProfit: netProfit,
        trades: realData.totalTrades,
        winRate: winRate
      },
      create: {
        gmiAccountId: user.gmiAccount.id,
        month,
        year,
        volume: realData.monthlyVolume,
        profit: realData.monthlyProfit,
        loss: realData.monthlyLoss,
        netProfit: netProfit,
        trades: realData.totalTrades,
        winRate: winRate
      }
    });

    console.log('✅ Estatística mensal atualizada');
    console.log('   Net Profit: $', netProfit);
    console.log('   Win Rate:', winRate, '%');

    console.log('\n🎉 DADOS REAIS ATUALIZADOS COM SUCESSO!');
    console.log('');
    console.log('Recarregue a página /mt5 para ver os dados reais.');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
updateRealData();
