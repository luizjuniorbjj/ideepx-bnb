// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Só depois carregar Prisma
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

// Verificar se DATABASE_URL foi carregada
console.log('🔍 Verificando DATABASE_URL...');
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no .env!');
  process.exit(1);
}
console.log('✅ DATABASE_URL:', process.env.DATABASE_URL);
console.log('');

const prisma = new PrismaClient();

// Chave de encriptação do .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ghcrgM0DSS1UMddKSbOLXVXCsgbI4T106KrG5aAfR84=';

function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(ENCRYPTION_KEY, 'base64');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

async function recreateMT5Account() {
  try {
    console.log('🔄 Recriando usuário e conta MT5...\n');

    // Dados do usuário Pioneer
    const walletAddress = '0x75d1A8ac59003088c60A20bde8953cBECfe41669';

    // Verificar se usuário já existe
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      // Criar usuário
      user = await prisma.user.create({
        data: {
          walletAddress,
          active: true,
          kycStatus: 1,
        }
      });
      console.log('✅ Usuário criado:', user.id);
    } else {
      console.log('✅ Usuário já existe:', user.id);
    }

    // Dados da conta MT5 Doo Prime
    const accountData = {
      login: '9941739',
      password: 'A13a@2580', // Senha será encriptada
      server: 'DooFinancialAU-Live',
      accountAlias: 'Doo Prime Live',
      brokerName: 'Doo Prime'
    };

    // Verificar se conta já existe
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        userId: user.id,
        login: accountData.login,
        server: accountData.server
      }
    });

    if (existingAccount) {
      console.log('⚠️  Conta MT5 já existe:', existingAccount.id);
      console.log('\nDeletando conta antiga para recriar...');
      await prisma.tradingAccount.delete({
        where: { id: existingAccount.id }
      });
    }

    // Criar conta MT5
    const tradingAccount = await prisma.tradingAccount.create({
      data: {
        userId: user.id,
        login: accountData.login,
        server: accountData.server,
        accountAlias: accountData.accountAlias,
        brokerName: accountData.brokerName,
        platform: 'MT5',
        status: 'CONNECTED',
        connected: true,
        credentials: {
          create: {
            encryptedPassword: encrypt(accountData.password)
          }
        }
      },
      include: {
        credentials: true
      }
    });

    console.log('✅ Conta MT5 criada com sucesso!');
    console.log('\n📊 Detalhes:');
    console.log('   ID:', tradingAccount.id);
    console.log('   Usuário:', user.walletAddress);
    console.log('   Login:', tradingAccount.login);
    console.log('   Server:', tradingAccount.server);
    console.log('   Broker:', tradingAccount.brokerName);
    console.log('   Status:', tradingAccount.status);
    console.log('\n✅ Agora você pode rodar o collector para atualizar os dados!');
    console.log('   cd C:\\ideepx-bnb\\mt5-collector');
    console.log('   python collect_all_accounts.py');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recreateMT5Account();
