const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Configurando usuário de teste...\n');

  const mainWallet = '0x75d1a8ac59003088c60a20bde8953cbecfe41669';
  const sponsorWallet = '0x29061a4c6a0c4aedc79a24f37553f6b9fe8fec5f'; // Admin como sponsor

  // Verificar se já existe
  const existing = await prisma.user.findUnique({
    where: { walletAddress: mainWallet }
  });

  if (existing) {
    console.log('⚠️  Usuário já existe! Atualizando dados...\n');

    const updated = await prisma.user.update({
      where: { walletAddress: mainWallet },
      data: {
        active: true,
        maxLevel: 5,
        kycStatus: 1,
        monthlyVolume: '12500.00',
        totalVolume: '45000.00',
        totalEarned: '3250.50',
        totalWithdrawn: '0.00',
        internalBalance: '3250.50',
        subscriptionExpiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // +30 dias
        lastWithdrawMonth: 0,
        withdrawnThisMonth: '0.00'
      }
    });

    console.log('✅ Usuário atualizado:', updated.walletAddress);
  } else {
    console.log('📝 Criando novo usuário...\n');

    // Buscar sponsor
    const sponsor = await prisma.user.findUnique({
      where: { walletAddress: sponsorWallet }
    });

    const newUser = await prisma.user.create({
      data: {
        walletAddress: mainWallet,
        sponsorAddress: sponsorWallet,
        sponsorId: sponsor ? sponsor.id : null,
        active: true,
        maxLevel: 5,
        kycStatus: 1,
        monthlyVolume: '12500.00',
        totalVolume: '45000.00',
        totalEarned: '3250.50',
        totalWithdrawn: '0.00',
        internalBalance: '3250.50',
        subscriptionExpiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        lastWithdrawMonth: 0,
        withdrawnThisMonth: '0.00'
      }
    });

    console.log('✅ Usuário criado:', newUser.walletAddress);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 CRIANDO REDE MLM (3 INDICADOS DIRETOS)');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Buscar o usuário atualizado
  const mainUser = await prisma.user.findUnique({
    where: { walletAddress: mainWallet }
  });

  // Criar 3 indicados diretos
  const referrals = [
    {
      wallet: '0x1111111111111111111111111111111111111111',
      name: 'Indicado 1',
      balance: '850.00',
      volume: '4200.00',
      earned: '520.00'
    },
    {
      wallet: '0x2222222222222222222222222222222222222222',
      name: 'Indicado 2',
      balance: '1250.00',
      volume: '6800.00',
      earned: '890.00'
    },
    {
      wallet: '0x3333333333333333333333333333333333333333',
      name: 'Indicado 3',
      balance: '650.00',
      volume: '3100.00',
      earned: '420.00'
    }
  ];

  for (let i = 0; i < referrals.length; i++) {
    const ref = referrals[i];

    const existingRef = await prisma.user.findUnique({
      where: { walletAddress: ref.wallet }
    });

    if (existingRef) {
      await prisma.user.update({
        where: { walletAddress: ref.wallet },
        data: {
          sponsorAddress: mainWallet,
          sponsorId: mainUser.id,
          active: true,
          maxLevel: 3,
          monthlyVolume: ref.volume,
          totalVolume: ref.volume,
          totalEarned: ref.earned,
          internalBalance: ref.balance,
          subscriptionExpiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        }
      });
      console.log(`✅ ${ref.name} atualizado: ${ref.wallet}`);
    } else {
      await prisma.user.create({
        data: {
          walletAddress: ref.wallet,
          sponsorAddress: mainWallet,
          sponsorId: mainUser.id,
          active: true,
          maxLevel: 3,
          kycStatus: 1,
          monthlyVolume: ref.volume,
          totalVolume: ref.volume,
          totalEarned: ref.earned,
          totalWithdrawn: '0.00',
          internalBalance: ref.balance,
          subscriptionExpiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          lastWithdrawMonth: 0,
          withdrawnThisMonth: '0.00'
        }
      });
      console.log(`✅ ${ref.name} criado: ${ref.wallet}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ CONFIGURAÇÃO COMPLETA!');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Resumo final
  const finalUser = await prisma.user.findUnique({
    where: { walletAddress: mainWallet },
    include: {
      referrals: true
    }
  });

  console.log('📋 RESUMO DO USUÁRIO:');
  console.log('Carteira:', finalUser.walletAddress);
  console.log('Ativo:', finalUser.active ? '✅ SIM' : '❌ NÃO');
  console.log('Saldo Interno: $' + finalUser.internalBalance);
  console.log('Volume Mensal: $' + finalUser.monthlyVolume);
  console.log('Total Ganho: $' + finalUser.totalEarned);
  console.log('Max Level:', finalUser.maxLevel);
  console.log('Indicados Diretos:', finalUser.referrals.length);
  console.log('');
  console.log('Assinatura válida até:', new Date(finalUser.subscriptionExpiry * 1000).toLocaleString('pt-BR'));
  console.log('');
  console.log('🎉 Pronto para testar no frontend!');
  console.log('');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
