const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const walletAddress = process.argv[2] || '0xdf3051d2982660ea265add9ef0323e9f2badc292';

  console.log('🔍 Buscando usuário:', walletAddress);
  console.log('');

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: {
      sponsor: {
        select: {
          walletAddress: true,
          active: true
        }
      },
      referrals: {
        select: {
          walletAddress: true,
          active: true,
          createdAt: true
        }
      },
      gmiAccount: true
    }
  });

  if (!user) {
    console.log('❌ Usuário não encontrado no banco de dados!');
    process.exit(1);
  }

  console.log('✅ USUÁRIO ENCONTRADO!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 INFORMAÇÕES BÁSICAS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('ID:', user.id);
  console.log('Carteira:', user.walletAddress);
  console.log('Ativo:', user.active ? '✅ SIM' : '❌ NÃO');
  console.log('KYC Status:', user.kycStatus);
  console.log('Max Level MLM:', user.maxLevel);
  console.log('Cadastrado em:', user.createdAt);
  console.log('Última atualização:', user.updatedAt);
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('💰 INFORMAÇÕES FINANCEIRAS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Saldo Interno:', '$' + user.internalBalance);
  console.log('Volume Mensal:', '$' + user.monthlyVolume);
  console.log('Volume Total:', '$' + user.totalVolume);
  console.log('Total Ganho:', '$' + user.totalEarned);
  console.log('Total Sacado:', '$' + user.totalWithdrawn);
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📅 ASSINATURA & SAQUES');
  console.log('═══════════════════════════════════════════════════════════');
  const subExpiry = user.subscriptionExpiry;
  if (subExpiry > 0) {
    const date = new Date(subExpiry * 1000);
    console.log('Validade Assinatura:', date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR'));
    console.log('Timestamp:', subExpiry);
  } else {
    console.log('Validade Assinatura: ❌ Não ativa');
  }
  console.log('Último mês de saque:', user.lastWithdrawMonth);
  console.log('Sacado este mês:', '$' + user.withdrawnThisMonth);
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('👥 REDE MLM');
  console.log('═══════════════════════════════════════════════════════════');
  if (user.sponsor) {
    console.log('Patrocinador:', user.sponsor.walletAddress);
    console.log('Patrocinador Ativo:', user.sponsor.active ? '✅ SIM' : '❌ NÃO');
  } else {
    console.log('Patrocinador: ❌ Nenhum (usuário raiz)');
  }
  console.log('Sponsor Address (campo):', user.sponsorAddress || 'N/A');
  console.log('');
  console.log('Total de Indicados Diretos:', user.referrals.length);
  if (user.referrals.length > 0) {
    console.log('');
    console.log('Lista de Indicados:');
    user.referrals.forEach((ref, i) => {
      const status = ref.active ? '✅' : '❌';
      console.log(`  [${i+1}] ${status} ${ref.walletAddress}`);
      console.log(`      Cadastrado: ${ref.createdAt.toLocaleDateString('pt-BR')}`);
    });
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 CONTA DE TRADING (GMI/MT5)');
  console.log('═══════════════════════════════════════════════════════════');
  if (user.gmiAccount) {
    console.log('✅ CONTA VINCULADA');
    console.log('Account Number:', user.gmiAccount.accountNumber);
    console.log('Server:', user.gmiAccount.server);
    console.log('Platform:', user.gmiAccount.platform);
    console.log('Account Hash:', user.gmiAccount.accountHash);
    console.log('Balance:', '$' + user.gmiAccount.balance);
    console.log('Equity:', '$' + user.gmiAccount.equity);
    console.log('Volume Mensal:', '$' + user.gmiAccount.monthlyVolume);
    console.log('Lucro Mensal:', '$' + user.gmiAccount.monthlyProfit);
    console.log('Prejuízo Mensal:', '$' + user.gmiAccount.monthlyLoss);
    console.log('Total de Trades:', user.gmiAccount.totalTrades);
    console.log('Conectado:', user.gmiAccount.connected ? '✅ SIM' : '❌ NÃO');
    console.log('Último Sync:', user.gmiAccount.lastSyncAt || 'Nunca');
    console.log('Criado em:', user.gmiAccount.createdAt);
    console.log('Atualizado em:', user.gmiAccount.updatedAt);
  } else {
    console.log('❌ NENHUMA CONTA VINCULADA');
  }
  console.log('');
  console.log('Account Hash (user field):', user.accountHash || 'N/A');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
