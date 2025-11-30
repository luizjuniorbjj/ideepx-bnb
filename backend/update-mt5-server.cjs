// Script para atualizar servidor da conta MT5
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateServer() {
  try {
    console.log('\n🔧 Atualizando servidor da conta MT5...\n');

    const updated = await prisma.tradingAccount.update({
      where: { id: '8f8107f7-5390-49b7-a886-aac0b53fc95f' },
      data: {
        server: 'GMI3-Real'
      }
    });

    console.log('✅ Conta atualizada com sucesso!');
    console.log(`   ID: ${updated.id}`);
    console.log(`   Login: ${updated.login}`);
    console.log(`   Novo Servidor: ${updated.server}`);
    console.log(`   Corretora: ${updated.brokerName}\n`);

  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServer();
