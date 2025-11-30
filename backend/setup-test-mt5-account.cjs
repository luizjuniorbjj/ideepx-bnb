/**
 * Script completo para testar conta MT5 real
 * Cria usuário, vincula conta GMI, envia dados
 */

const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers');

const prisma = new PrismaClient();

// Dados da conta real
const TEST_WALLET = '0xdf3051d2982660ea265add9ef0323e9f2badc292'; // Carteira real do usuário
const accountNumber = '32650015';
const server = 'GMI3-Real';
const platform = 'MT5';

// Calcular accountHash
const accountHash = ethers.keccak256(
  ethers.toUtf8Bytes(accountNumber + server)
);

console.log('\n=== CONFIGURAÇÃO DA CONTA MT5 ===');
console.log('Carteira de teste:', TEST_WALLET);
console.log('Número da conta:', accountNumber);
console.log('Servidor:', server);
console.log('Plataforma:', platform);
console.log('Account Hash:', accountHash);

async function setupTestAccount() {
  try {
    console.log('\n=== PASSO 1: Criar/Atualizar Usuário ===');

    // Criar ou atualizar usuário
    const user = await prisma.user.upsert({
      where: { walletAddress: TEST_WALLET.toLowerCase() },
      update: {},
      create: {
        walletAddress: TEST_WALLET.toLowerCase(),
        monthlyVolume: '0'
      }
    });

    console.log('✅ Usuário criado/encontrado:', user.walletAddress);

    console.log('\n=== PASSO 2: Vincular Conta GMI ===');

    // Criar ou atualizar conta GMI
    const gmiAccount = await prisma.gmiAccount.upsert({
      where: { userId: user.id },
      update: {
        accountNumber,
        server,
        platform,
        encryptedPayload: JSON.stringify({ accountNumber, server, platform }),
        accountHash,
        connected: false
      },
      create: {
        userId: user.id,
        accountNumber,
        server,
        platform,
        encryptedPayload: JSON.stringify({ accountNumber, server, platform }),
        accountHash,
        balance: '0',
        equity: '0',
        monthlyVolume: '0',
        monthlyProfit: '0',
        monthlyLoss: '0',
        totalTrades: 0,
        connected: false
      }
    });

    console.log('✅ Conta GMI vinculada:', gmiAccount.accountNumber);

    // Atualizar usuário com accountHash
    await prisma.user.update({
      where: { id: user.id },
      data: { accountHash, active: true }
    });

    console.log('✅ Usuário atualizado com accountHash');

    console.log('\n=== PASSO 3: Simular Dados de Trading ===');

    // Dados realistas de trading
    const tradingData = {
      balance: '15750.50',
      equity: '15832.75',
      monthlyVolume: '287500.00',
      monthlyProfit: '3250.75',
      monthlyLoss: '1180.25',
      totalTrades: 47
    };

    // Atualizar conta com dados de trading
    await prisma.gmiAccount.update({
      where: { id: gmiAccount.id },
      data: {
        ...tradingData,
        connected: true,
        lastSyncAt: new Date()
      }
    });

    // Atualizar volume do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyVolume: tradingData.monthlyVolume }
    });

    console.log('✅ Dados de trading atualizados:');
    console.log('   Saldo:', tradingData.balance);
    console.log('   Equity:', tradingData.equity);
    console.log('   Volume Mensal:', tradingData.monthlyVolume);
    console.log('   Lucro Mensal:', tradingData.monthlyProfit);
    console.log('   Prejuízo Mensal:', tradingData.monthlyLoss);
    console.log('   Total Trades:', tradingData.totalTrades);

    console.log('\n=== PASSO 4: Criar Estatística Mensal ===');

    const now = new Date();
    const year = now.getFullYear();
    const month = parseInt(`${year}${String(now.getMonth() + 1).padStart(2, '0')}`);

    await prisma.tradingStat.upsert({
      where: {
        gmiAccountId_month_year: {
          gmiAccountId: gmiAccount.id,
          month,
          year
        }
      },
      update: {
        volume: tradingData.monthlyVolume,
        profit: tradingData.monthlyProfit,
        loss: tradingData.monthlyLoss,
        netProfit: (parseFloat(tradingData.monthlyProfit) - parseFloat(tradingData.monthlyLoss)).toFixed(2),
        trades: tradingData.totalTrades,
        winRate: ((parseFloat(tradingData.monthlyProfit) / (parseFloat(tradingData.monthlyProfit) + parseFloat(tradingData.monthlyLoss))) * 100).toFixed(2)
      },
      create: {
        gmiAccountId: gmiAccount.id,
        month,
        year,
        volume: tradingData.monthlyVolume,
        profit: tradingData.monthlyProfit,
        loss: tradingData.monthlyLoss,
        netProfit: (parseFloat(tradingData.monthlyProfit) - parseFloat(tradingData.monthlyLoss)).toFixed(2),
        trades: tradingData.totalTrades,
        winRate: ((parseFloat(tradingData.monthlyProfit) / (parseFloat(tradingData.monthlyProfit) + parseFloat(tradingData.monthlyLoss))) * 100).toFixed(2)
      }
    });

    console.log('✅ Estatística mensal criada para', `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`);

    console.log('\n=== ✅ CONFIGURAÇÃO COMPLETA ===');
    console.log('');
    console.log('🎯 Próximos passos:');
    console.log('1. Acesse: http://localhost:3000/dashboard');
    console.log('2. Conecte a carteira:', TEST_WALLET);
    console.log('3. Veja o card MT5 na dashboard');
    console.log('4. Clique para ver detalhes completos');
    console.log('');
    console.log('📊 Para testar o endpoint GET:');
    console.log(`   curl http://localhost:3001/api/mt5/stats/${TEST_WALLET}`);
    console.log('');
    console.log('🔄 Para atualizar dados:');
    console.log(`   curl -X POST http://localhost:3001/api/dev/mt5/mock-sync -H "Content-Type: application/json" -d '{"address":"${TEST_WALLET}"}'`);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
setupTestAccount();
