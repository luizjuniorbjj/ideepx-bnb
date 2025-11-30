// ================================================================================
// SCRIPT: POPULAR 50 USUÁRIOS NO BANCO DE DADOS - REDE MLM 10 NÍVEIS
// ================================================================================
// Cria 50 usuários no banco de dados SQLite via Prisma
// Estrutura rede MLM completa de 10 níveis
// Gera dados realistas de performance e comissões para testes

import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

// ================================================================================
// CONFIGURAÇÃO
// ================================================================================

// Patrocinador base (já existe - será buscado do banco)
const BASE_SPONSOR_ADDRESS = '0x75d1a8ac59003088c60a20bde8953cbecfe41669';

// Total de usuários a criar
const TOTAL_USERS = 50;

// Estrutura da rede MLM (quantos por nível)
const LEVEL_STRUCTURE = {
  1: 5,   // 5 diretos do patrocinador base
  2: 10,  // 10 no segundo nível (2 por L1)
  3: 10,  // 10 no terceiro nível
  4: 8,   // 8 no quarto nível
  5: 6,   // 6 no quinto nível
  6: 4,   // 4 no sexto nível
  7: 3,   // 3 no sétimo nível
  8: 2,   // 2 no oitavo nível
  9: 1,   // 1 no nono nível
  10: 1   // 1 no décimo nível
};

// Mês atual para dados de performance
const CURRENT_MONTH = parseInt(new Date().toISOString().slice(0, 7).replace('-', ''));
const CURRENT_YEAR = new Date().getFullYear();

// ================================================================================
// FUNÇÕES AUXILIARES
// ================================================================================

/**
 * Gerar carteira única
 */
function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address.toLowerCase(),
    privateKey: wallet.privateKey
  };
}

/**
 * Gerar dados realistas de performance
 */
function generatePerformanceData() {
  // Lucro entre $50 e $500
  const profit = (Math.random() * 450 + 50).toFixed(2);
  const profitCents = Math.floor(parseFloat(profit) * 100);

  // 35% performance fee
  const fee = (profitCents * 0.35).toFixed(0);

  // 65% fica com cliente
  const clientShare = (profitCents * 0.65).toFixed(0);

  // 60% do fee vai para MLM pool
  const mlmPool = (fee * 0.60).toFixed(0);

  // 40% para empresa
  const companyShare = (fee * 0.40).toFixed(0);

  return {
    profitUsd: profitCents.toString(),
    feeUsd: fee.toString(),
    clientShare: clientShare.toString(),
    mlmPool: mlmPool.toString(),
    companyShare: companyShare.toString()
  };
}

/**
 * Formatar endereço
 */
function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Aguardar
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ================================================================================
// ESTRUTURAR REDE MLM
// ================================================================================

/**
 * Criar estrutura hierárquica da rede MLM
 */
function createMLMStructure(wallets, baseSponsor) {
  const structure = [];
  let currentIndex = 0;

  console.log('\n📊 ESTRUTURANDO REDE MLM:\n');

  // Nível 1: 5 diretos do patrocinador base
  const level1Users = [];
  for (let i = 0; i < LEVEL_STRUCTURE[1]; i++) {
    const user = {
      ...wallets[currentIndex],
      level: 1,
      sponsorAddress: baseSponsor.walletAddress,
      sponsorId: baseSponsor.id
    };
    level1Users.push(user);
    structure.push(user);
    console.log(`   L1 #${i + 1}: ${formatAddress(user.address)} ← ${formatAddress(baseSponsor.walletAddress)}`);
    currentIndex++;
  }

  // Níveis 2-10: Distribuir usuários sob os anteriores
  let previousLevelUsers = level1Users;

  for (let level = 2; level <= 10; level++) {
    const usersInLevel = LEVEL_STRUCTURE[level];
    if (!usersInLevel || currentIndex >= TOTAL_USERS) break;

    const currentLevelUsers = [];
    const usersPerSponsor = Math.ceil(usersInLevel / previousLevelUsers.length);

    console.log(`\n   Nível ${level} (${usersInLevel} usuários):`);

    for (let i = 0; i < usersInLevel && currentIndex < TOTAL_USERS; i++) {
      const sponsorIndex = Math.floor(i / usersPerSponsor);
      const sponsor = previousLevelUsers[sponsorIndex];

      const user = {
        ...wallets[currentIndex],
        level,
        sponsorAddress: sponsor.address,
        sponsorId: sponsor.dbId // Será preenchido após criar no DB
      };

      currentLevelUsers.push(user);
      structure.push(user);

      console.log(`      L${level} #${i + 1}: ${formatAddress(user.address)} ← ${formatAddress(sponsor.address)}`);
      currentIndex++;
    }

    previousLevelUsers = currentLevelUsers;
  }

  return structure;
}

// ================================================================================
// CRIAR USUÁRIOS NO BANCO
// ================================================================================

/**
 * Criar usuário no banco de dados
 */
async function createUser(userData, index, total) {
  try {
    console.log(`\n[${index + 1}/${total}] Criando L${userData.level} ${formatAddress(userData.address)}...`);

    // Buscar sponsor no banco
    const sponsor = await prisma.user.findUnique({
      where: { walletAddress: userData.sponsorAddress }
    });

    if (!sponsor) {
      throw new Error(`Sponsor não encontrado: ${userData.sponsorAddress}`);
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        walletAddress: userData.address,
        active: true,
        kycStatus: 1,
        subscriptionExpiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // +30 dias
        sponsorId: sponsor.id,
        sponsorAddress: sponsor.walletAddress,
        maxLevel: userData.level,
        monthlyVolume: '0',
        totalVolume: '0',
        totalEarned: '0',
        totalWithdrawn: '0',
        internalBalance: '0'
      }
    });

    console.log(`   ✅ Usuário criado: ${user.id}`);

    // Criar conta GMI simulada
    const accountNumber = `MT5-${100000 + index}`;
    const gmiAccount = await prisma.gmiAccount.create({
      data: {
        userId: user.id,
        accountNumber,
        server: 'GMI-Demo',
        platform: 'MT5',
        encryptedPayload: 'encrypted_data_here',
        accountHash: ethers.id(`${accountNumber}-${user.walletAddress}`).slice(0, 16),
        balance: '1000.00',
        equity: '1000.00',
        connected: true,
        lastSyncAt: new Date()
      }
    });

    console.log(`   ✅ GMI Account criado: ${accountNumber}`);

    // Criar dados de performance
    const perfData = generatePerformanceData();
    const performance = await prisma.performanceRecord.create({
      data: {
        userId: user.id,
        month: CURRENT_MONTH,
        year: CURRENT_YEAR,
        periodStart: new Date(CURRENT_YEAR, new Date().getMonth(), 1),
        periodEnd: new Date(CURRENT_YEAR, new Date().getMonth() + 1, 0),
        ...perfData,
        processed: true,
        distributed: false
      }
    });

    console.log(`   ✅ Performance criada: $${(parseInt(perfData.profitUsd) / 100).toFixed(2)} lucro`);

    // Retornar dados do usuário criado
    return {
      success: true,
      user,
      gmiAccount,
      performance,
      level: userData.level,
      address: userData.address
    };
  } catch (error) {
    console.error(`   ❌ Erro:`, error.message);
    return {
      success: false,
      error: error.message,
      address: userData.address,
      level: userData.level
    };
  }
}

/**
 * Criar usuários em lotes (por nível) para garantir sponsorIds corretos
 */
async function createUsersHierarchically(structure) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 CRIANDO USUÁRIOS NO BANCO DE DADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = [];
  const usersByLevel = {};

  // Agrupar por nível
  structure.forEach(user => {
    if (!usersByLevel[user.level]) {
      usersByLevel[user.level] = [];
    }
    usersByLevel[user.level].push(user);
  });

  // Criar nível por nível
  for (let level = 1; level <= 10; level++) {
    const usersInLevel = usersByLevel[level];
    if (!usersInLevel || usersInLevel.length === 0) continue;

    console.log(`\n🔹 NÍVEL ${level} - Criando ${usersInLevel.length} usuários...\n`);

    for (let i = 0; i < usersInLevel.length; i++) {
      const userData = usersInLevel[i];
      const result = await createUser(userData, results.length, structure.length);
      results.push(result);

      // Guardar dbId para ser usado como sponsor dos próximos níveis
      if (result.success) {
        userData.dbId = result.user.id;
      }

      // Aguardar um pouco entre criações
      await sleep(100);
    }
  }

  return results;
}

// ================================================================================
// CALCULAR COMISSÕES MLM
// ================================================================================

/**
 * Calcular comissões MLM para todos os usuários
 */
async function calculateMLMCommissions() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 CALCULANDO COMISSÕES MLM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Percentuais MLM por nível
  const MLM_PERCENTAGES = {
    1: 8,   // 8%
    2: 3,   // 3%
    3: 2.5, // 2.5%
    4: 2,   // 2%
    5: 1,   // 1%
    6: 2,   // 2%
    7: 2,   // 2%
    8: 2,   // 2%
    9: 1.5, // 1.5%
    10: 1   // 1%
  };

  // Buscar todos usuários com performance
  const users = await prisma.user.findMany({
    include: {
      performances: {
        where: {
          month: CURRENT_MONTH,
          year: CURRENT_YEAR
        }
      }
    }
  });

  let totalCommissions = 0;

  for (const user of users) {
    if (!user.performances || user.performances.length === 0) continue;

    const performance = user.performances[0];
    const mlmPool = parseInt(performance.mlmPool);

    console.log(`\n👤 ${formatAddress(user.walletAddress)} - MLM Pool: $${(mlmPool / 100).toFixed(2)}`);

    // Percorrer upline até 10 níveis
    let currentUser = user;
    for (let level = 1; level <= 10; level++) {
      if (!currentUser.sponsorId) break;

      // Buscar sponsor
      const sponsor = await prisma.user.findUnique({
        where: { id: currentUser.sponsorId }
      });

      if (!sponsor) break;

      // Calcular comissão
      const percentage = MLM_PERCENTAGES[level];
      const commissionAmount = Math.floor((mlmPool * percentage) / 100);

      // Criar registro de comissão
      await prisma.mlmCommission.create({
        data: {
          userId: sponsor.id,
          fromUserId: user.id,
          performanceId: performance.id,
          level,
          percentage: `${percentage}%`,
          amount: commissionAmount.toString(),
          paid: false
        }
      });

      console.log(`   L${level} → ${formatAddress(sponsor.walletAddress)}: ${percentage}% = $${(commissionAmount / 100).toFixed(2)}`);

      totalCommissions += commissionAmount;
      currentUser = sponsor;
    }
  }

  console.log(`\n✅ Total de comissões calculadas: $${(totalCommissions / 100).toFixed(2)}`);
  return totalCommissions;
}

// ================================================================================
// RELATÓRIO
// ================================================================================

/**
 * Gerar relatório final
 */
async function generateReport(results) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RELATÓRIO FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Usuários criados: ${successful}/${TOTAL_USERS}`);
  console.log(`❌ Falhas: ${failed}`);

  // Estatísticas por nível
  console.log('\n📊 Distribuição por Nível:');
  for (let level = 1; level <= 10; level++) {
    const usersInLevel = results.filter(r => r.level === level);
    const successInLevel = usersInLevel.filter(r => r.success).length;
    if (usersInLevel.length > 0) {
      console.log(`   Nível ${level.toString().padStart(2)}: ${successInLevel}/${usersInLevel.length} usuários`);
    }
  }

  // Estatísticas de performance
  const totalUsers = await prisma.user.count();
  const totalPerformances = await prisma.performanceRecord.count();
  const totalCommissions = await prisma.mlmCommission.count();

  console.log('\n💰 Estatísticas de Performance:');
  console.log(`   Total de usuários no sistema: ${totalUsers}`);
  console.log(`   Performance records criados: ${totalPerformances}`);
  console.log(`   Comissões MLM calculadas: ${totalCommissions}`);

  // Calcular totais
  const performances = await prisma.performanceRecord.findMany();
  const totalProfit = performances.reduce((sum, p) => sum + parseInt(p.profitUsd), 0);
  const totalMLMPool = performances.reduce((sum, p) => sum + parseInt(p.mlmPool), 0);

  console.log(`   Lucro total gerado: $${(totalProfit / 100).toFixed(2)}`);
  console.log(`   MLM Pool total: $${(totalMLMPool / 100).toFixed(2)}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ================================================================================
// MAIN
// ================================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║      POPULAR BANCO DE DADOS - 50 USUÁRIOS (10 NÍVEIS MLM)     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Etapa 1: Verificar patrocinador base
    console.log('🔍 ETAPA 1: Verificando patrocinador base...\n');
    const baseSponsor = await prisma.user.findUnique({
      where: { walletAddress: BASE_SPONSOR_ADDRESS }
    });

    if (!baseSponsor) {
      console.error(`❌ Patrocinador base não encontrado: ${BASE_SPONSOR_ADDRESS}`);
      console.log('\n💡 Criando patrocinador base...\n');

      const newBaseSponsor = await prisma.user.create({
        data: {
          walletAddress: BASE_SPONSOR_ADDRESS,
          active: true,
          kycStatus: 1,
          subscriptionExpiry: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
          maxLevel: 0
        }
      });

      console.log(`✅ Patrocinador base criado: ${newBaseSponsor.id}\n`);
      baseSponsor = newBaseSponsor;
    } else {
      console.log(`✅ Patrocinador base encontrado: ${baseSponsor.id}`);
      console.log(`   Wallet: ${baseSponsor.walletAddress}\n`);
    }

    // Etapa 2: Gerar carteiras
    console.log('🔑 ETAPA 2: Gerando carteiras...\n');
    const wallets = [];
    for (let i = 0; i < TOTAL_USERS; i++) {
      const wallet = generateWallet();
      wallets.push(wallet);
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ ${i + 1}/${TOTAL_USERS} carteiras geradas`);
      }
    }
    console.log(`\n✅ ${TOTAL_USERS} carteiras geradas!\n`);

    // Etapa 3: Estruturar rede MLM
    console.log('🌐 ETAPA 3: Estruturando rede MLM...');
    const structure = createMLMStructure(wallets, baseSponsor);
    console.log(`\n✅ Rede MLM estruturada com ${structure.length} usuários!\n`);

    // Etapa 4: Criar usuários no banco
    const results = await createUsersHierarchically(structure);

    // Etapa 5: Calcular comissões MLM
    await calculateMLMCommissions();

    // Etapa 6: Relatório final
    await generateReport(results);

    console.log('✅ PROCESSO CONCLUÍDO COM SUCESSO!\n');
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  });
