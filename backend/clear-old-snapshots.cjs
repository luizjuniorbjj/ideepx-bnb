// ================================================================================
// CLEAR OLD SNAPSHOTS - Limpa snapshots antigos do banco
// ================================================================================
// Este script deleta snapshots antigos para forçar recálculo com nova lógica

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearOldSnapshots() {
  console.log('\n🗑️  LIMPANDO SNAPSHOTS ANTIGOS');
  console.log('==========================================\n');

  try {
    const accountId = '83afde98-e5d6-49cb-ad58-6d231c71aff4';

    // Conta quantos snapshots existem
    const count = await prisma.accountSnapshot.count({
      where: { tradingAccountId: accountId }
    });

    console.log(`📊 Snapshots encontrados: ${count}`);

    if (count === 0) {
      console.log('✅ Nenhum snapshot para deletar\n');
      return;
    }

    // Deleta todos os snapshots desta conta
    const result = await prisma.accountSnapshot.deleteMany({
      where: { tradingAccountId: accountId }
    });

    console.log(`✅ ${result.count} snapshots deletados com sucesso!\n`);
    console.log('⏰ Aguarde até 30 segundos para o coletor criar novo snapshot com valores corretos\n');

  } catch (error) {
    console.error('❌ Erro ao deletar snapshots:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearOldSnapshots();
