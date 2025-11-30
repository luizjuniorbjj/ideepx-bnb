// Script para limpar todas as contas MT5 do banco de dados
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpando todas as contas MT5...\n');

  // Deletar todas as credenciais (cascade deleta as contas também)
  const deletedCredentials = await prisma.tradingAccountCredential.deleteMany({});
  console.log(`✅ ${deletedCredentials.count} credenciais deletadas`);

  // Deletar todas as contas
  const deletedAccounts = await prisma.tradingAccount.deleteMany({});
  console.log(`✅ ${deletedAccounts.count} contas deletadas`);

  console.log('\n✨ Banco limpo! Agora você pode conectar contas novamente.');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
