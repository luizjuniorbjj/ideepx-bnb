const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Criando rede MLM de 20 usuários...\n');

  const mainWallet = '0x75d1a8ac59003088c60a20bde8953cbecfe41669';

  // Buscar usuário principal
  const mainUser = await prisma.user.findUnique({
    where: { walletAddress: mainWallet }
  });

  if (!mainUser) {
    console.error('❌ Usuário principal não encontrado!');
    process.exit(1);
  }

  console.log('✅ Usuário principal encontrado:', mainUser.walletAddress);
  console.log('');

  // Função para gerar endereço aleatório
  function generateAddress(index) {
    return '0x' + (10000 + index).toString().padStart(40, '0');
  }

  // Função para criar ou atualizar usuário
  async function createOrUpdateUser(wallet, sponsorWallet, sponsorUser, level, index) {
    const volumes = [8500, 12000, 6500, 15000, 9200, 11500, 7800, 13500, 10200, 8900,
                     9500, 11000, 7200, 14000, 8600, 12500, 9800, 10500, 7500, 13000];
    const balances = [1200, 1800, 950, 2100, 1350, 1650, 1100, 1900, 1450, 1250,
                      1400, 1600, 1050, 2000, 1300, 1750, 1500, 1550, 1150, 1850];

    const volume = volumes[index] || 10000;
    const balance = balances[index] || 1500;
    const earned = (volume * 0.25).toFixed(2);

    const existing = await prisma.user.findUnique({
      where: { walletAddress: wallet }
    });

    const subscriptionExpiry = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    if (existing) {
      return await prisma.user.update({
        where: { walletAddress: wallet },
        data: {
          sponsorAddress: sponsorWallet,
          sponsorId: sponsorUser.id,
          active: true,
          maxLevel: Math.min(level + 2, 10),
          kycStatus: 1,
          monthlyVolume: volume.toString(),
          totalVolume: (volume * 1.5).toString(),
          totalEarned: earned,
          totalWithdrawn: '0.00',
          internalBalance: balance.toString(),
          subscriptionExpiry,
          lastWithdrawMonth: 0,
          withdrawnThisMonth: '0.00'
        }
      });
    } else {
      return await prisma.user.create({
        data: {
          walletAddress: wallet,
          sponsorAddress: sponsorWallet,
          sponsorId: sponsorUser.id,
          active: true,
          maxLevel: Math.min(level + 2, 10),
          kycStatus: 1,
          monthlyVolume: volume.toString(),
          totalVolume: (volume * 1.5).toString(),
          totalEarned: earned,
          totalWithdrawn: '0.00',
          internalBalance: balance.toString(),
          subscriptionExpiry,
          lastWithdrawMonth: 0,
          withdrawnThisMonth: '0.00'
        }
      });
    }
  }

  let userIndex = 0;
  const createdUsers = [];

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 CRIANDO ESTRUTURA MLM (4 NÍVEIS)');
  console.log('═══════════════════════════════════════════════════════════\n');

  // NÍVEL 1: 5 indicados diretos
  console.log('🔵 NÍVEL 1 - 5 indicados diretos do usuário principal');
  console.log('');
  const level1Users = [];

  for (let i = 0; i < 5; i++) {
    const wallet = generateAddress(userIndex++);
    const user = await createOrUpdateUser(wallet, mainWallet, mainUser, 1, userIndex);
    level1Users.push(user);
    createdUsers.push(user);
    console.log(`  ✅ [L1-${i+1}] ${wallet} | Saldo: $${user.internalBalance} | Volume: $${user.monthlyVolume}`);
  }
  console.log('');

  // NÍVEL 2: 5 indicados (1 para cada do nível 1)
  console.log('🟢 NÍVEL 2 - 5 indicados (1 de cada L1)');
  console.log('');
  const level2Users = [];

  for (let i = 0; i < 5; i++) {
    const wallet = generateAddress(userIndex++);
    const sponsor = level1Users[i];
    const user = await createOrUpdateUser(wallet, sponsor.walletAddress, sponsor, 2, userIndex);
    level2Users.push(user);
    createdUsers.push(user);
    console.log(`  ✅ [L2-${i+1}] ${wallet} | Sponsor: ${sponsor.walletAddress.slice(0, 10)}...`);
  }
  console.log('');

  // NÍVEL 3: 5 indicados (1 para cada do nível 2)
  console.log('🟡 NÍVEL 3 - 5 indicados (1 de cada L2)');
  console.log('');
  const level3Users = [];

  for (let i = 0; i < 5; i++) {
    const wallet = generateAddress(userIndex++);
    const sponsor = level2Users[i];
    const user = await createOrUpdateUser(wallet, sponsor.walletAddress, sponsor, 3, userIndex);
    level3Users.push(user);
    createdUsers.push(user);
    console.log(`  ✅ [L3-${i+1}] ${wallet} | Sponsor: ${sponsor.walletAddress.slice(0, 10)}...`);
  }
  console.log('');

  // NÍVEL 4: 5 indicados (1 para cada do nível 3)
  console.log('🔴 NÍVEL 4 - 5 indicados (1 de cada L3)');
  console.log('');

  for (let i = 0; i < 5; i++) {
    const wallet = generateAddress(userIndex++);
    const sponsor = level3Users[i];
    const user = await createOrUpdateUser(wallet, sponsor.walletAddress, sponsor, 4, userIndex);
    createdUsers.push(user);
    console.log(`  ✅ [L4-${i+1}] ${wallet} | Sponsor: ${sponsor.walletAddress.slice(0, 10)}...`);
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ REDE MLM CRIADA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Estatísticas finais
  const totalUsers = await prisma.user.count();
  const directReferrals = await prisma.user.count({
    where: { sponsorAddress: mainWallet }
  });

  // Calcular total da rede do usuário principal
  async function countNetwork(userId) {
    const directUsers = await prisma.user.findMany({
      where: { sponsorId: userId },
      select: { id: true }
    });

    let total = directUsers.length;

    for (const user of directUsers) {
      total += await countNetwork(user.id);
    }

    return total;
  }

  const totalNetwork = await countNetwork(mainUser.id);

  console.log('📊 ESTATÍSTICAS FINAIS:');
  console.log('');
  console.log('👤 Usuário Principal:', mainWallet);
  console.log('📈 Total de usuários no sistema:', totalUsers);
  console.log('👥 Seus indicados DIRETOS (Nível 1):', directReferrals);
  console.log('🌐 Sua REDE TOTAL (todos níveis):', totalNetwork);
  console.log('');

  console.log('💰 VOLUMES E SALDOS CRIADOS:');
  const totalVolume = createdUsers.reduce((sum, u) => sum + parseFloat(u.monthlyVolume), 0);
  const totalBalance = createdUsers.reduce((sum, u) => sum + parseFloat(u.internalBalance), 0);
  const totalEarned = createdUsers.reduce((sum, u) => sum + parseFloat(u.totalEarned), 0);

  console.log('  Volume total da rede: $' + totalVolume.toFixed(2));
  console.log('  Saldo total da rede: $' + totalBalance.toFixed(2));
  console.log('  Ganhos totais: $' + totalEarned.toFixed(2));
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎯 ESTRUTURA DA SUA REDE:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('                    VOCÊ (L0)');
  console.log('                       |');
  console.log('         ┌─────┬───────┼───────┬─────┐');
  console.log('         │     │       │       │     │');
  console.log('        L1-1  L1-2   L1-3   L1-4  L1-5  (5 diretos)');
  console.log('         │     │       │       │     │');
  console.log('        L2-1  L2-2   L2-3   L2-4  L2-5  (nível 2)');
  console.log('         │     │       │       │     │');
  console.log('        L3-1  L3-2   L3-3   L3-4  L3-5  (nível 3)');
  console.log('         │     │       │       │     │');
  console.log('        L4-1  L4-2   L4-3   L4-4  L4-5  (nível 4)');
  console.log('');
  console.log('Total: 1 + 5 + 5 + 5 + 5 = 21 pessoas na sua rede!');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 PRONTO PARA TESTAR!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Agora você pode:');
  console.log('✅ Ver sua rede em: http://localhost:5000/network');
  console.log('✅ Ativar assinaturas da rede no dashboard');
  console.log('✅ Testar comissões MLM (4 níveis de profundidade)');
  console.log('✅ Testar saques de $' + (parseFloat(mainUser.internalBalance) + totalBalance).toFixed(2));
  console.log('');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erro:', e.message);
  console.error(e);
  process.exit(1);
});
