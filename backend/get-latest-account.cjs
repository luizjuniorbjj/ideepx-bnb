// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getLatestAccount() {
  try {
    const accounts = await prisma.tradingAccount.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        credentials: true
      }
    });

    console.log(JSON.stringify(accounts, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getLatestAccount();
