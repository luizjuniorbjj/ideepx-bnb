// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Configuração de criptografia (mesma do backend)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const algorithm = 'aes-256-cbc';

function decryptPassword(encryptedData) {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.error('❌ Erro ao descriptografar:', error.message);
    return null;
  }
}

async function syncAccount() {
  try {
    const accountId = process.argv[2];

    if (!accountId) {
      console.error('\n❌ ERRO: ID da conta não fornecido\n');
      console.log('Uso correto:');
      console.log('  node sync-account-by-id.cjs <ACCOUNT_ID>\n');
      console.log('💡 Para listar contas disponíveis:');
      console.log('  node list-mt5-accounts.cjs\n');
      process.exit(1);
    }

    console.log('🔄 SINCRONIZAR DADOS MT5 MANUALMENTE\n');
    console.log('='.repeat(80));

    // Buscar conta
    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId },
      include: {
        user: { select: { walletAddress: true } },
        credentials: true
      }
    });

    if (!account) {
      console.error(`\n❌ Conta com ID "${accountId}" não encontrada.\n`);
      console.log('💡 Execute "node list-mt5-accounts.cjs" para ver contas disponíveis.\n');
      process.exit(1);
    }

    console.log(`\n📊 Conta selecionada:\n`);
    console.log(`   Broker:     ${account.brokerName}`);
    console.log(`   Login:      ${account.login}`);
    console.log(`   Servidor:   ${account.server}`);
    console.log(`   Status:     ${account.status}`);
    console.log('');

    if (!account.credentials) {
      console.error('❌ Credenciais não encontradas para esta conta!\n');
      process.exit(1);
    }

    // Descriptografar senha
    const password = decryptPassword(account.credentials.encryptedPassword);
    if (!password) {
      console.error('❌ Erro ao descriptografar senha!\n');
      process.exit(1);
    }

    console.log('🔐 Credenciais descriptografadas com sucesso!\n');
    console.log('📋 INSTRUÇÕES:\n');
    console.log('1. Certifique-se de que o MT5 está aberto');
    console.log(`2. Faça login manualmente na conta ${account.login}`);
    console.log(`   Servidor: ${account.server}`);
    console.log(`   Login: ${account.login}`);
    console.log(`   Senha: ${password}`);
    console.log('3. Aguarde a conexão estabilizar');
    console.log('4. Anote os valores abaixo do MT5:\n');

    // Solicitar dados do usuário
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (query) => new Promise(resolve => readline.question(query, resolve));

    console.log('📊 Digite os valores do MT5:\n');

    const balance = await askQuestion('Balance (saldo): US$ ');
    const equity = await askQuestion('Equity: US$ ');
    const margin = await askQuestion('Margin (margem): US$ ');
    const freeMargin = await askQuestion('Free Margin (margem livre): US$ ');
    const marginLevel = await askQuestion('Margin Level (%): ');
    const openTrades = await askQuestion('Open Trades (posições abertas): ');
    const openPL = await askQuestion('Open P/L (lucro/perda aberto): US$ ');

    readline.close();

    console.log('\n🔄 Atualizando banco de dados...\n');

    const mt5Data = {
      balance: balance || '0',
      equity: equity || '0',
      margin: margin || '0',
      freeMargin: freeMargin || '0',
      marginLevel: marginLevel || '0',
      openTrades: parseInt(openTrades) || 0,
      openPL: openPL || '0',
      dayPL: '0',
      weekPL: '0',
      monthPL: '0',
      totalPL: openPL || '0',
      status: 'CONNECTED',
      connected: true,
      lastHeartbeat: new Date(),
      lastSnapshotAt: new Date()
    };

    // Atualizar conta
    const updated = await prisma.tradingAccount.update({
      where: { id: accountId },
      data: mt5Data
    });

    console.log('✅ Conta atualizada com sucesso!');
    console.log(`   Balance: US$ ${updated.balance}`);
    console.log(`   Equity: US$ ${updated.equity}`);
    console.log(`   Open Trades: ${updated.openTrades}\n`);

    // Criar snapshot
    await prisma.accountSnapshot.create({
      data: {
        tradingAccountId: accountId,
        balance: mt5Data.balance,
        equity: mt5Data.equity,
        margin: mt5Data.margin,
        freeMargin: mt5Data.freeMargin,
        marginLevel: mt5Data.marginLevel,
        openTrades: mt5Data.openTrades,
        openPL: mt5Data.openPL,
        dayPL: mt5Data.dayPL,
        weekPL: mt5Data.weekPL,
        monthPL: mt5Data.monthPL,
        totalPL: mt5Data.totalPL
      }
    });

    console.log('📸 Snapshot criado com sucesso!\n');
    console.log('='.repeat(80));
    console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA!\n');
    console.log('💡 Atualize o dashboard em: http://localhost:3000/mt5/dashboard\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncAccount();
