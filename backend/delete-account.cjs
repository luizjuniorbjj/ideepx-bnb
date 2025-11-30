// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAccount() {
  try {
    console.log('🗑️  Deletando conta problemática...\n');

    // Deletar TODAS as contas e credenciais
    const deletedCreds = await prisma.tradingAccountCredential.deleteMany({});
    console.log(`   ✅ Deletadas ${deletedCreds.count} credenciais`);

    const deletedAccounts = await prisma.tradingAccount.deleteMany({});
    console.log(`   ✅ Deletadas ${deletedAccounts.count} contas\n`);

    console.log('✅ Pronto! Agora você pode reconectar pelo frontend:');
    console.log('   1. Acesse http://localhost:3000/mt5/connect');
    console.log('   2. Selecione "Doo Prime"');
    console.log('   3. Selecione "DooTechnology-Live"');
    console.log('   4. Login: 9941739');
    console.log('   5. Senha: A13a@2580');
    console.log('\n✨ Isso vai usar a criptografia correta e integração adequada!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAccount();
