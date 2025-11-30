// Script para verificar contas MT5 no banco de dados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMT5Accounts() {
  try {
    console.log('\n🔍 Verificando contas MT5 no banco de dados...\n');

    // Buscar todas as contas
    const accounts = await prisma.tradingAccount.findMany({
      include: {
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    if (accounts.length === 0) {
      console.log('❌ Nenhuma conta MT5 encontrada no banco de dados.\n');
      return;
    }

    console.log(`✅ Encontradas ${accounts.length} conta(s) MT5:\n`);

    accounts.forEach((account, index) => {
      console.log(`📊 Conta ${index + 1}:`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Usuário: ${account.user.walletAddress}`);
      console.log(`   Alias: ${account.accountAlias}`);
      console.log(`   Corretora: ${account.brokerName}`);
      console.log(`   Login: ${account.login}`);
      console.log(`   Servidor: ${account.server}`);
      console.log(`   Plataforma: ${account.platform}`);
      console.log(`   Status: ${account.status}`);
      console.log(`   Conectado: ${account.connected ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Balance: $${account.balance}`);
      console.log(`   Equity: $${account.equity}`);
      console.log(`   Última Sync: ${account.lastHeartbeat || 'Nunca'}`);
      console.log(`   Último Erro: ${account.lastError || 'Nenhum'}`);
      console.log(`   Criada em: ${account.createdAt}`);
      console.log('');
    });

    // Verificar credenciais
    const credentials = await prisma.tradingAccountCredential.findMany();
    console.log(`🔐 Credenciais armazenadas: ${credentials.length}`);

  } catch (error) {
    console.error('❌ Erro ao verificar contas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMT5Accounts();
