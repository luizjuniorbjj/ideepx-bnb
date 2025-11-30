const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Criando 5 usuários INATIVOS para teste de ativação...\n');

  const sponsorWallet = '0x75d1a8ac59003088c60a20bde8953cbecfe41669';

  // Buscar o sponsor
  const sponsor = await prisma.user.findUnique({
    where: { walletAddress: sponsorWallet }
  });

  if (!sponsor) {
    console.error('❌ Sponsor não encontrado:', sponsorWallet);
    process.exit(1);
  }

  console.log('✅ Sponsor encontrado:', sponsor.walletAddress);
  console.log('');

  // 5 usuários inativos para teste
  const inactiveUsers = [
    {
      wallet: '0xaaaa000000000000000000000000000000000001',
      name: 'Inativo 1',
      balance: '150.00',
      volume: '0.00'
    },
    {
      wallet: '0xaaaa000000000000000000000000000000000002',
      name: 'Inativo 2',
      balance: '75.50',
      volume: '0.00'
    },
    {
      wallet: '0xaaaa000000000000000000000000000000000003',
      name: 'Inativo 3',
      balance: '220.00',
      volume: '0.00'
    },
    {
      wallet: '0xaaaa000000000000000000000000000000000004',
      name: 'Inativo 4',
      balance: '95.00',
      volume: '0.00'
    },
    {
      wallet: '0xaaaa000000000000000000000000000000000005',
      name: 'Inativo 5',
      balance: '180.75',
      volume: '0.00'
    }
  ];

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 CRIANDO 5 USUÁRIOS INATIVOS (SEM ASSINATURA)');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (let i = 0; i < inactiveUsers.length; i++) {
    const user = inactiveUsers[i];

    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { walletAddress: user.wallet }
    });

    if (existing) {
      // Atualizar para inativo
      await prisma.user.update({
        where: { walletAddress: user.wallet },
        data: {
          sponsorAddress: sponsorWallet,
          sponsorId: sponsor.id,
          active: false, // ❌ INATIVO
          maxLevel: 5,
          kycStatus: 1,
          monthlyVolume: user.volume,
          totalVolume: user.volume,
          totalEarned: '0.00',
          totalWithdrawn: '0.00',
          internalBalance: user.balance,
          subscriptionExpiry: 0, // ❌ SEM ASSINATURA
          lastWithdrawMonth: 0,
          withdrawnThisMonth: '0.00'
        }
      });
      console.log(`✅ ${user.name} atualizado (INATIVO): ${user.wallet}`);
    } else {
      // Criar novo
      await prisma.user.create({
        data: {
          walletAddress: user.wallet,
          sponsorAddress: sponsorWallet,
          sponsorId: sponsor.id,
          active: false, // ❌ INATIVO
          maxLevel: 5,
          kycStatus: 1,
          monthlyVolume: user.volume,
          totalVolume: user.volume,
          totalEarned: '0.00',
          totalWithdrawn: '0.00',
          internalBalance: user.balance,
          subscriptionExpiry: 0, // ❌ SEM ASSINATURA
          lastWithdrawMonth: 0,
          withdrawnThisMonth: '0.00'
        }
      });
      console.log(`✅ ${user.name} criado (INATIVO): ${user.wallet}`);
    }

    console.log(`   💰 Saldo interno: $${user.balance}`);
    console.log(`   📊 Volume: $${user.volume}`);
    console.log(`   ❌ Status: INATIVO (sem assinatura)`);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ 5 USUÁRIOS INATIVOS CRIADOS COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Estatísticas finais
  const allReferrals = await prisma.user.findMany({
    where: { sponsorAddress: sponsorWallet }
  });

  const activeCount = allReferrals.filter(r => r.active).length;
  const inactiveCount = allReferrals.filter(r => !r.active).length;

  console.log('📊 RESUMO DA REDE DE', sponsorWallet.slice(0, 10) + '...');
  console.log('');
  console.log('👥 Total de indicados diretos:', allReferrals.length);
  console.log('✅ Ativos (com assinatura):', activeCount);
  console.log('❌ Inativos (sem assinatura):', inactiveCount);
  console.log('');

  console.log('💰 SALDOS DOS USUÁRIOS INATIVOS:');
  const totalBalance = inactiveUsers.reduce((sum, u) => sum + parseFloat(u.balance), 0);
  console.log('   Total disponível para ativação: $' + totalBalance.toFixed(2));
  console.log('');

  console.log('🎯 PRONTO PARA TESTAR:');
  console.log('1. Acesse o dashboard: http://localhost:5000/dashboard');
  console.log('2. Vá em "Ativar Membros da Rede"');
  console.log('3. Clique em "Ver Inativos"');
  console.log('4. Ative os 5 usuários usando o saldo interno deles');
  console.log('');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  console.error(e);
  process.exit(1);
});
