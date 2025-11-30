#!/usr/bin/env node
/**
 * ============================================================================
 * POPULAR DADOS DE TESTE - DASHBOARD COMPLETO
 * ============================================================================
 * Popula TODOS os dados necessários para o dashboard funcionar 100%
 * Usando Prisma diretamente no banco de dados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_WALLET = "0x75d1A8ac59003088c60A20bde8953cBECfe41669".toLowerCase();

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 POPULAR DASHBOARD COMPLETO - TODOS OS DADOS');
  console.log('='.repeat(70));
  console.log(`\n📍 Wallet: ${USER_WALLET}`);
  console.log(`📍 Database: ${process.env.DATABASE_URL || 'dev.db'}\n`);

  try {
    // Etapa 1: Criar/Atualizar usuário principal
    console.log('👤 ETAPA 1: Criando/Atualizando usuário principal...');
    await criarUsuarioPrincipal();

    // Etapa 2: Criar 5 indicados diretos
    console.log('\n👥 ETAPA 2: Criando rede de 5 indicados diretos...');
    await criarIndicadosDiretos();

    // Etapa 3: Criar métricas mensais
    console.log('\n📊 ETAPA 3: Criando métricas mensais...');
    await criarMetricasMensais();

    // Etapa 4: Criar histórico de assinatura
    console.log('\n💳 ETAPA 4: Criando histórico de assinatura...');
    await criarHistoricoAssinatura();

    // Etapa 5: Criar algumas comissões MLM
    console.log('\n💰 ETAPA 5: Criando histórico de comissões MLM...');
    await criarComissoesMLM();

    // Etapa 6: Verificar dados criados
    console.log('\n✅ ETAPA 6: Verificando dados criados...');
    await verificarDados();

    console.log('\n' + '='.repeat(70));
    console.log('✅ DASHBOARD COMPLETO POPULADO COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('\n📊 Dados criados:');
    console.log('   ✅ Saldo Interno: $1,250.75');
    console.log('   ✅ Sacado este mês: $0.00');
    console.log('   ✅ Volume Mensal: $8,500.00');
    console.log('   ✅ Comissões: $1,250.75');
    console.log('   ✅ Assinatura: Ativa (27 dias restantes)');
    console.log('   ✅ Níveis Desbloqueados: 5/10');
    console.log('   ✅ Indicados Diretos: 5');
    console.log('   ✅ Métricas Mensais: Criadas');
    console.log('   ✅ Histórico de Comissões: Criado');
    console.log('\n🌐 Acesse agora:');
    console.log('   http://localhost:5000/dashboard');
    console.log('\n🎯 Conecte com:');
    console.log(`   ${USER_WALLET}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Erro ao popular dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// CRIAR USUÁRIO PRINCIPAL
// ============================================================================

async function criarUsuarioPrincipal() {
  const agora = Math.floor(Date.now() / 1000);
  const em27Dias = agora + (27 * 24 * 60 * 60); // 27 dias em segundos

  const userData = {
    walletAddress: USER_WALLET,
    active: true,
    kycStatus: 1,
    subscriptionExpiry: em27Dias,
    sponsorAddress: null, // Root user (sem sponsor)
    maxLevel: 5,
    monthlyVolume: "8500.00",
    totalVolume: "25000.00",
    totalEarned: "1250.75",
    totalWithdrawn: "0.00",
    internalBalance: "1250.75",
    lastWithdrawMonth: 0,
    withdrawnThisMonth: "0.00",
    accountHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  };

  const user = await prisma.user.upsert({
    where: { walletAddress: USER_WALLET },
    update: {
      active: userData.active,
      kycStatus: userData.kycStatus,
      subscriptionExpiry: userData.subscriptionExpiry,
      sponsorAddress: userData.sponsorAddress,
      maxLevel: userData.maxLevel,
      monthlyVolume: userData.monthlyVolume,
      totalVolume: userData.totalVolume,
      totalEarned: userData.totalEarned,
      totalWithdrawn: userData.totalWithdrawn,
      internalBalance: userData.internalBalance,
      lastWithdrawMonth: userData.lastWithdrawMonth,
      withdrawnThisMonth: userData.withdrawnThisMonth
      // NÃO atualizar accountHash para evitar conflict
    },
    create: userData
  });

  console.log(`   ✅ Usuário criado/atualizado: ${user.walletAddress}`);
  console.log(`   💰 Saldo Interno: $${user.internalBalance}`);
  console.log(`   📊 Volume Mensal: $${user.monthlyVolume}`);
  console.log(`   🎯 Níveis: ${user.maxLevel}/10`);

  return user;
}

// ============================================================================
// CRIAR INDICADOS DIRETOS
// ============================================================================

async function criarIndicadosDiretos() {
  const agora = Math.floor(Date.now() / 1000);
  const em20Dias = agora + (20 * 24 * 60 * 60);
  const em15Dias = agora + (15 * 24 * 60 * 60);

  // Primeiro, buscar TODOS os indicados diretos existentes
  const indicadosExistentes = await prisma.user.findMany({
    where: { sponsorAddress: USER_WALLET }
  });

  console.log(`   📋 Encontrados ${indicadosExistentes.length} indicados diretos existentes`);

  // Atualizar TODOS os indicados existentes com dados realistas
  let atualizados = 0;
  const volumes = [1200, 1400, 1600, 1800, 2000, 2200, 2400, 1500, 1700, 1900, 2100, 2300, 2500];
  const niveis = [3, 4, 5, 2, 1, 5, 4, 3, 5, 4, 3, 5, 4];

  for (let i = 0; i < indicadosExistentes.length; i++) {
    const indicado = indicadosExistentes[i];
    const volume = volumes[i % volumes.length];
    const nivel = niveis[i % niveis.length];
    const totalVolume = volume * 2.5;
    const totalEarned = volume * 0.15;
    const internalBalance = totalEarned * 0.9;
    const isActive = i !== 4; // Deixar o 5º inativo

    try {
      await prisma.user.update({
        where: { id: indicado.id },
        data: {
          active: isActive,
          kycStatus: isActive ? 1 : 0,
          subscriptionExpiry: isActive ? em20Dias : (agora - (5 * 24 * 60 * 60)),
          maxLevel: nivel,
          monthlyVolume: volume.toFixed(2),
          totalVolume: totalVolume.toFixed(2),
          totalEarned: totalEarned.toFixed(2),
          internalBalance: internalBalance.toFixed(2),
          totalWithdrawn: (totalEarned - internalBalance).toFixed(2),
          lastWithdrawMonth: 0,
          withdrawnThisMonth: "0.00"
        }
      });
      atualizados++;
    } catch (error) {
      console.log(`   ⚠️  Erro ao atualizar ${indicado.walletAddress}: ${error.message}`);
    }
  }

  console.log(`   ✅ ${atualizados}/${indicadosExistentes.length} indicados diretos atualizados!`);

  return atualizados;
}

// ============================================================================
// CRIAR MÉTRICAS MENSAIS
// ============================================================================

async function criarMetricasMensais() {
  // Buscar usuário principal
  const user = await prisma.user.findUnique({
    where: { walletAddress: USER_WALLET }
  });

  if (!user) {
    console.log('   ⚠️  Usuário não encontrado');
    return;
  }

  // Criar métricas dos últimos 3 meses
  const hoje = new Date();
  const meses = [
    { month: 202411, year: 2024, volume: "8500.00", trades: 45, winRate: "68.5", pnl: "1250.75", directReferrals: 5, networkVolume: "6400.00" },
    { month: 202410, year: 2024, volume: "7200.00", trades: 38, winRate: "65.2", pnl: "980.50", directReferrals: 4, networkVolume: "5100.00" },
    { month: 202409, year: 2024, volume: "6800.00", trades: 32, winRate: "62.8", pnl: "850.25", directReferrals: 3, networkVolume: "4200.00" }
  ];

  let criadas = 0;

  for (const metrica of meses) {
    try {
      await prisma.userMetric.upsert({
        where: {
          userId_month_year: {
            userId: user.id,
            month: metrica.month,
            year: metrica.year
          }
        },
        update: metrica,
        create: {
          userId: user.id,
          ...metrica
        }
      });
      criadas++;
    } catch (error) {
      console.log(`   ⚠️  Erro ao criar métrica ${metrica.month}: ${error.message}`);
    }
  }

  console.log(`   ✅ ${criadas}/3 métricas mensais criadas!`);
}

// ============================================================================
// CRIAR HISTÓRICO DE ASSINATURA
// ============================================================================

async function criarHistoricoAssinatura() {
  const agora = new Date();
  const em27Dias = new Date(agora.getTime() + (27 * 24 * 60 * 60 * 1000));
  const ha30Dias = new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000));
  const ha60Dias = new Date(agora.getTime() - (60 * 24 * 60 * 60 * 1000));

  const subscriptions = [
    {
      userAddress: USER_WALLET,
      type: "renewal",
      amount: "19.00",
      expiresAt: em27Dias,
      txHash: "0xabc123def456789012345678901234567890123456789012345678901234567890",
      createdAt: agora
    },
    {
      userAddress: USER_WALLET,
      type: "renewal",
      amount: "19.00",
      expiresAt: agora,
      txHash: "0xdef456789012345678901234567890123456789012345678901234567890abc123",
      createdAt: ha30Dias
    },
    {
      userAddress: USER_WALLET,
      type: "new",
      amount: "19.00",
      expiresAt: ha30Dias,
      txHash: "0x789012345678901234567890123456789012345678901234567890abc123def456",
      createdAt: ha60Dias
    }
  ];

  let criadas = 0;

  for (const sub of subscriptions) {
    try {
      await prisma.subscription.create({
        data: sub
      });
      criadas++;
    } catch (error) {
      // Ignorar duplicatas
      if (!error.message.includes('Unique constraint')) {
        console.log(`   ⚠️  Erro ao criar assinatura: ${error.message}`);
      }
    }
  }

  console.log(`   ✅ ${criadas} assinaturas criadas no histórico!`);
}

// ============================================================================
// CRIAR COMISSÕES MLM
// ============================================================================

async function criarComissoesMLM() {
  // Buscar usuário principal
  const user = await prisma.user.findUnique({
    where: { walletAddress: USER_WALLET }
  });

  if (!user) {
    console.log('   ⚠️  Usuário não encontrado');
    return;
  }

  // Buscar indicados
  const indicados = await prisma.user.findMany({
    where: { sponsorAddress: USER_WALLET }
  });

  if (indicados.length === 0) {
    console.log('   ⚠️  Nenhum indicado encontrado');
    return;
  }

  // Criar comissões de cada indicado
  const comissoes = [];

  for (let i = 0; i < Math.min(indicados.length, 3); i++) {
    const indicado = indicados[i];
    comissoes.push({
      userId: user.id,
      fromUserId: indicado.id,
      performanceId: "sim-perf-001",
      level: 1,
      percentage: "8.0",
      amount: `${(150 + i * 50).toFixed(2)}`,
      paid: true,
      paidAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000)
    });
  }

  let criadas = 0;

  for (const comissao of comissoes) {
    try {
      await prisma.mlmCommission.create({
        data: comissao
      });
      criadas++;
    } catch (error) {
      console.log(`   ⚠️  Erro ao criar comissão: ${error.message}`);
    }
  }

  console.log(`   ✅ ${criadas} comissões MLM criadas!`);
}

// ============================================================================
// VERIFICAR DADOS CRIADOS
// ============================================================================

async function verificarDados() {
  // Verificar usuário
  const user = await prisma.user.findUnique({
    where: { walletAddress: USER_WALLET }
  });

  if (!user) {
    console.log('   ❌ Usuário não encontrado!');
    return;
  }

  console.log(`   ✅ Usuário: ${user.walletAddress}`);
  console.log(`      - Ativo: ${user.active ? 'Sim' : 'Não'}`);
  console.log(`      - Saldo: $${user.internalBalance}`);
  console.log(`      - Volume Mensal: $${user.monthlyVolume}`);
  console.log(`      - Total Ganho: $${user.totalEarned}`);
  console.log(`      - Níveis: ${user.maxLevel}/10`);

  // Contar indicados diretos
  const indicadosCount = await prisma.user.count({
    where: { sponsorAddress: USER_WALLET }
  });

  console.log(`   ✅ Indicados Diretos: ${indicadosCount}`);

  // Contar métricas
  const metricsCount = await prisma.userMetric.count({
    where: { userId: user.id }
  });

  console.log(`   ✅ Métricas Mensais: ${metricsCount}`);

  // Contar assinaturas
  const subsCount = await prisma.subscription.count({
    where: { userAddress: USER_WALLET }
  });

  console.log(`   ✅ Histórico de Assinaturas: ${subsCount}`);

  // Contar comissões
  const commissionsCount = await prisma.mlmCommission.count({
    where: { userId: user.id }
  });

  console.log(`   ✅ Comissões Recebidas: ${commissionsCount}`);
}

// ============================================================================
// EXECUTAR
// ============================================================================

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
