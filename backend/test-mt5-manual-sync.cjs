// ================================================================================
// TEST MT5 MANUAL SYNC - Teste manual de sincronização MT5
// ================================================================================
// Este script faz um teste manual do endpoint /api/mt5/sync

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testManualSync() {
  console.log('\n🧪 TESTE MANUAL - MT5 SYNC');
  console.log('==========================================\n');

  try {
    // 1. Buscar conta mais recente do banco
    const account = await prisma.tradingAccount.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!account) {
      console.log('❌ Nenhuma conta encontrada no banco');
      return;
    }

    console.log(`✅ Conta encontrada:`);
    console.log(`   ID: ${account.id}`);
    console.log(`   Login: ${account.login}`);
    console.log(`   Server: ${account.server}\n`);

    // 2. Preparar dados para sync (simulando o Python)
    const syncData = {
      accountId: account.id,
      balance: 10000.50,
      equity: 10050.75,
      margin: 500.00,
      freeMargin: 9550.75,
      marginLevel: 2010.15,
      openTrades: 2,
      openPL: 50.25,
      dayPL: 25.50,
      weekPL: 100.75,
      monthPL: 450.00,
      totalPL: 50.75
    };

    console.log('📤 Enviando dados para /api/mt5/sync:');
    console.log(JSON.stringify(syncData, null, 2));
    console.log();

    // 3. Fazer POST para /api/mt5/sync
    const response = await fetch('http://localhost:5001/api/mt5/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncData)
    });

    console.log(`📥 Resposta HTTP: ${response.status} ${response.statusText}\n`);

    const responseText = await response.text();
    console.log('Resposta do servidor:');
    console.log(responseText);
    console.log();

    if (response.status === 200) {
      console.log('✅ SUCESSO! Sincronização funcionou!\n');
    } else {
      console.log('❌ ERRO! Sincronização falhou!\n');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testManualSync();
