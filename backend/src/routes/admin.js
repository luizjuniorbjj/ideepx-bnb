// ================================================================================
// ROTAS - ADMIN (Administração)
// ================================================================================
// Endpoints para administração do sistema iDeepX

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ================================================================================
// GET /api/admin/stats
// ================================================================================
// Retorna estatísticas gerais do sistema

router.get('/stats', async (req, res) => {
  try {
    console.log('📊 [GET /admin/stats] Fetching system statistics...');

    // Estatísticas de usuários
    const [totalUsers, activeUsers, totalWithKyc] = await Promise.all([
      prisma.user.count({ where: { simulationId: null } }),
      prisma.user.count({ where: { active: true, simulationId: null } }),
      prisma.user.count({ where: { kycStatus: 1, simulationId: null } })
    ]);

    // Estatísticas financeiras - buscando todos os users e somando manualmente
    // (campos são String no Prisma, não podemos usar aggregate._sum)
    const allUsers = await prisma.user.findMany({
      where: { simulationId: null },
      select: {
        monthlyVolume: true,
        totalVolume: true,
        totalEarned: true,
        totalWithdrawn: true,
        internalBalance: true
      }
    });

    // Converter strings para números e somar
    const totalMonthlyVolume = allUsers.reduce((sum, u) => sum + parseFloat(u.monthlyVolume || '0'), 0);
    const totalVolume = allUsers.reduce((sum, u) => sum + parseFloat(u.totalVolume || '0'), 0);
    const totalEarned = allUsers.reduce((sum, u) => sum + parseFloat(u.totalEarned || '0'), 0);
    const totalWithdrawn = allUsers.reduce((sum, u) => sum + parseFloat(u.totalWithdrawn || '0'), 0);
    const totalInternalBalance = allUsers.reduce((sum, u) => sum + parseFloat(u.internalBalance || '0'), 0);

    // Comissões recentes (últimas 100)
    const recentCommissions = await prisma.mlmCommission.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
        }
      }
    });

    const totalCommissions = await prisma.mlmCommission.count();

    // Estatísticas MLM - buscar todas e somar manualmente (amount é String)
    const recentMlmCommissions = await prisma.mlmCommission.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: { amount: true }
    });

    const totalCommissionsAmount30Days = recentMlmCommissions.reduce(
      (sum, c) => sum + parseFloat(c.amount || '0'), 0
    );

    // Taxa de ativação
    const activationRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const response = {
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          withKyc: totalWithKyc,
          activationRate: parseFloat(activationRate.toFixed(2))
        },
        financial: {
          monthlyVolume: parseFloat(totalMonthlyVolume.toFixed(2)),
          totalVolume: parseFloat(totalVolume.toFixed(2)),
          totalEarned: parseFloat(totalEarned.toFixed(2)),
          totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
          internalBalance: parseFloat(totalInternalBalance.toFixed(2))
        },
        mlm: {
          totalCommissions,
          recentCommissions,
          commissions30Days: parseFloat(totalCommissionsAmount30Days.toFixed(2))
        },
        timestamp: Date.now()
      }
    };

    console.log('✅ [GET /admin/stats] Statistics fetched successfully');
    console.log(`   - Total Users: ${totalUsers} (${activeUsers} active)`);
    console.log(`   - Total Volume: $${totalVolume.toFixed(2)}`);
    console.log(`   - Total Earned: $${totalEarned.toFixed(2)}`);

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /admin/stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/users
// ================================================================================
// Retorna lista paginada de usuários com filtros

router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      active,
      search,
      orderBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log(`📋 [GET /admin/users] Page: ${page}, Limit: ${limit}, Active: ${active}`);

    // Construir filtros
    const where = {
      simulationId: null // Apenas usuários reais
    };

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where.walletAddress = {
        contains: search.toLowerCase()
      };
    }

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          [orderBy]: order
        },
        include: {
          sponsor: {
            select: {
              walletAddress: true
            }
          },
          _count: {
            select: {
              referrals: {
                where: { simulationId: null }
              },
              commissions: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const response = {
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    };

    console.log(`✅ [GET /admin/users] Returned ${users.length} users (${total} total)`);

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /admin/users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/user/:wallet
// ================================================================================
// Retorna detalhes completos de um usuário específico

router.get('/user/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const walletLower = wallet.toLowerCase();

    console.log(`🔍 [GET /admin/user/:wallet] Fetching details for: ${wallet}`);

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletLower },
      include: {
        gmiAccount: true,
        sponsor: {
          select: {
            id: true,
            walletAddress: true,
            active: true
          }
        },
        referrals: {
          where: { simulationId: null },
          select: {
            id: true,
            walletAddress: true,
            active: true,
            maxLevel: true,
            monthlyVolume: true,
            totalVolume: true,
            totalEarned: true,
            createdAt: true
          }
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Últimas 50 comissões
        },
        metrics: {
          orderBy: { month: 'desc' },
          take: 12 // Últimos 12 meses
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calcular rede total
    const countNetworkRecursive = async (userId, maxDepth = 10, currentDepth = 0) => {
      if (currentDepth >= maxDepth) return 0;

      const directCount = await prisma.user.count({
        where: {
          sponsorId: userId,
          simulationId: null
        }
      });

      const directUsers = await prisma.user.findMany({
        where: {
          sponsorId: userId,
          simulationId: null
        },
        select: { id: true }
      });

      let totalCount = directCount;
      for (const ref of directUsers) {
        totalCount += await countNetworkRecursive(ref.id, maxDepth, currentDepth + 1);
      }

      return totalCount;
    };

    const totalNetwork = await countNetworkRecursive(user.id);

    const response = {
      success: true,
      data: {
        user,
        stats: {
          directReferrals: user.referrals.length,
          activeReferrals: user.referrals.filter(r => r.active).length,
          totalNetwork,
          totalCommissions: user.commissions.reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0)
        }
      }
    };

    console.log(`✅ [GET /admin/user/:wallet] User details fetched for: ${wallet}`);

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /admin/user/:wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/financial-report
// ================================================================================
// Retorna relatório financeiro detalhado

router.get('/financial-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('💰 [GET /admin/financial-report] Generating financial report...');

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Comissões no período
    const commissionsFilter = Object.keys(dateFilter).length > 0
      ? { createdAt: dateFilter }
      : {};

    const commissions = await prisma.mlmCommission.findMany({
      where: commissionsFilter,
      include: {
        user: {
          select: {
            walletAddress: true,
            active: true
          }
        }
      }
    });

    // Agrupar por nível
    const commissionsByLevel = {};
    let totalCommissions = 0;

    for (let i = 1; i <= 10; i++) {
      commissionsByLevel[`level${i}`] = {
        count: 0,
        total: 0
      };
    }

    commissions.forEach(comm => {
      const level = comm.level;
      const amount = parseFloat(comm.amount || '0');

      if (level >= 1 && level <= 10) {
        commissionsByLevel[`level${level}`].count++;
        commissionsByLevel[`level${level}`].total += amount;
        totalCommissions += amount;
      }
    });

    // Usuários ativos no período
    const usersFilter = Object.keys(dateFilter).length > 0
      ? { createdAt: dateFilter, simulationId: null }
      : { simulationId: null };

    const newUsers = await prisma.user.count({ where: usersFilter });

    const response = {
      success: true,
      data: {
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Now'
        },
        commissions: {
          total: parseFloat(totalCommissions.toFixed(2)),
          count: commissions.length,
          byLevel: commissionsByLevel
        },
        users: {
          newUsers
        }
      }
    };

    console.log('✅ [GET /admin/financial-report] Financial report generated');
    console.log(`   - Total Commissions: $${totalCommissions.toFixed(2)}`);
    console.log(`   - Commission Count: ${commissions.length}`);

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /admin/financial-report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/network-overview
// ================================================================================
// Retorna visão geral da rede MLM

router.get('/network-overview', async (req, res) => {
  try {
    console.log('🌐 [GET /admin/network-overview] Generating network overview...');

    // Calcular distribuição real da rede MLM (por profundidade)
    const levelDistribution = {};
    for (let i = 1; i <= 10; i++) {
      levelDistribution[`level${i}`] = 0;
    }

    // Buscar todos os usuários ativos
    const allActiveUsers = await prisma.user.findMany({
      where: {
        simulationId: null,
        active: true
      },
      select: {
        id: true,
        sponsorId: true
      }
    });

    // Função para calcular o nível de profundidade de um usuário
    const calculateDepth = (userId, visited = new Set()) => {
      if (visited.has(userId)) return 0; // Evitar loops
      visited.add(userId);

      const user = allActiveUsers.find(u => u.id === userId);
      if (!user || !user.sponsorId) return 1; // Nível 1 (topo da rede ou sem sponsor)

      return 1 + calculateDepth(user.sponsorId, visited);
    };

    // Calcular nível de cada usuário
    allActiveUsers.forEach(user => {
      const depth = calculateDepth(user.id);
      if (depth >= 1 && depth <= 10) {
        levelDistribution[`level${depth}`]++;
      }
    });

    // Top sponsors (usuários com mais indicados diretos)
    const allUsers = await prisma.user.findMany({
      where: {
        simulationId: null,
        active: true
      },
      include: {
        _count: {
          select: {
            referrals: {
              where: { simulationId: null }
            }
          }
        }
      },
      take: 10,
      orderBy: {
        referrals: {
          _count: 'desc'
        }
      }
    });

    const topSponsors = allUsers.map(user => ({
      walletAddress: user.walletAddress,
      directReferrals: user._count.referrals,
      maxLevel: user.maxLevel,
      totalEarned: parseFloat(user.totalEarned || '0')
    }));

    // Top earners (usuários com mais comissões ganhas)
    const topEarners = await prisma.user.findMany({
      where: {
        simulationId: null,
        active: true
      },
      orderBy: {
        totalEarned: 'desc'
      },
      take: 10,
      select: {
        walletAddress: true,
        totalEarned: true,
        maxLevel: true,
        _count: {
          select: {
            referrals: {
              where: { simulationId: null }
            }
          }
        }
      }
    });

    const response = {
      success: true,
      data: {
        levelDistribution,
        topSponsors,
        topEarners: topEarners.map(user => ({
          walletAddress: user.walletAddress,
          totalEarned: parseFloat(user.totalEarned || '0'),
          maxLevel: user.maxLevel,
          directReferrals: user._count.referrals
        }))
      }
    };

    console.log('✅ [GET /admin/network-overview] Network overview generated');

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /admin/network-overview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/performance-report
// ================================================================================
// Busca relatório de performance dos clientes para cálculo automático de fees

router.get('/performance-report', async (req, res) => {
  try {
    console.log('📊 [GET /admin/performance-report] Generating performance report...');

    // Buscar todos os clientes ativos com GMI accounts
    const clients = await prisma.user.findMany({
      where: {
        simulationId: null,
        active: true,
        gmiAccount: {
          isNot: null
        }
      },
      include: {
        gmiAccount: true
      },
      orderBy: {
        monthlyVolume: 'desc'
      }
    });

    // MODELO CORRETO: GMI Edge + Smart Contract
    const PERFORMANCE_FEE_PERCENTAGE = 0.35; // 35% do lucro bruto
    const SMART_CONTRACT_PERCENTAGE = 0.25;  // 25% do lucro bruto = MLM Pool
    const COMPANY_PERCENTAGE = 0.10;         // 10% do lucro bruto
    const CLIENT_PERCENTAGE = 0.65;          // 65% do lucro bruto (GMI Edge automático)

    const clientsWithFees = clients.map(client => {
      // Pegar lucro bruto do GMI account (ou usar monthlyVolume como proxy)
      const grossProfit = parseFloat(client.monthlyVolume || '0');

      // Calcular distribuição GMI Edge + Smart Contract
      const performanceFee = grossProfit > 0 ? grossProfit * PERFORMANCE_FEE_PERCENTAGE : 0;  // 35%
      const mlmPool = grossProfit > 0 ? grossProfit * SMART_CONTRACT_PERCENTAGE : 0;         // 25%
      const companyShare = grossProfit > 0 ? grossProfit * COMPANY_PERCENTAGE : 0;           // 10%
      const clientShare = grossProfit > 0 ? grossProfit * CLIENT_PERCENTAGE : 0;             // 65%

      return {
        wallet: client.walletAddress,
        gmiAccountId: client.gmiAccount?.gmiAccountId || 'N/A',
        grossProfit: grossProfit,
        performanceFee: performanceFee,
        mlmPool: mlmPool,
        companyShare: companyShare,
        clientShare: clientShare,
        maxLevel: client.maxLevel,
        active: client.active
      };
    });

    // Calcular totais
    const totalGrossProfit = clientsWithFees.reduce((sum, c) => sum + c.grossProfit, 0);
    const totalPerformanceFee = clientsWithFees.reduce((sum, c) => sum + c.performanceFee, 0);
    const totalMlmPool = clientsWithFees.reduce((sum, c) => sum + c.mlmPool, 0);
    const totalCompanyShare = clientsWithFees.reduce((sum, c) => sum + c.companyShare, 0);
    const totalClientShare = clientsWithFees.reduce((sum, c) => sum + c.clientShare, 0);

    const summary = {
      totalClients: clientsWithFees.length,
      totalGrossProfit: parseFloat(totalGrossProfit.toFixed(2)),       // 100%
      totalClientShare: parseFloat(totalClientShare.toFixed(2)),       // 65% (GMI automático)
      totalPerformanceFee: parseFloat(totalPerformanceFee.toFixed(2)), // 35%
      totalMlmPool: parseFloat(totalMlmPool.toFixed(2)),               // 25% (Smart Contract)
      totalCompanyShare: parseFloat(totalCompanyShare.toFixed(2))      // 10%
    };

    console.log(`✅ [GET /admin/performance-report] Report generated:`);
    console.log(`   Total clients: ${summary.totalClients}`);
    console.log(`   Total gross profit (100%): $${summary.totalGrossProfit}`);
    console.log(`   Client share (65% GMI): $${summary.totalClientShare}`);
    console.log(`   Performance fee (35%): $${summary.totalPerformanceFee}`);
    console.log(`   MLM pool (25%): $${summary.totalMlmPool}`);
    console.log(`   Company share (10%): $${summary.totalCompanyShare}`);

    res.json({
      success: true,
      data: {
        summary,
        clients: clientsWithFees
      }
    });
  } catch (error) {
    console.error('❌ Error in GET /admin/performance-report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/admin/process-fees
// ================================================================================
// Processar performance fees automaticamente baseado em lucros reais

router.post('/process-fees', async (req, res) => {
  try {
    console.log('🔄 [POST /admin/process-fees] Starting automatic fee processing...');

    // Buscar clientes com lucro positivo no período
    const clients = await prisma.user.findMany({
      where: {
        simulationId: null,
        active: true,
        gmiAccount: {
          isNot: null
        }
      },
      include: {
        gmiAccount: true,
        sponsor: true
      }
    });

    console.log(`🔍 [DEBUG] Total de clientes encontrados na query: ${clients.length}`);

    // Log dos primeiros 5 clientes para debug
    clients.slice(0, 5).forEach((c, i) => {
      console.log(`   Cliente ${i + 1}: ${c.walletAddress.slice(0, 10)}... monthlyVolume=${c.monthlyVolume} gmiAccount=${c.gmiAccount ? 'SIM' : 'NÃO'}`);
    });

    // MODELO CORRETO: GMI Edge + Smart Contract
    const PERFORMANCE_FEE_PERCENTAGE = 0.35; // 35% do lucro bruto = Performance Fee (GMI Edge)
    const SMART_CONTRACT_PERCENTAGE = 0.25;  // 25% do lucro bruto = Pool MLM (Smart Contract)
    const COMPANY_PERCENTAGE = 0.10;         // 10% do lucro bruto = iDeepX operação
    // 65% restante vai direto para clientes (GMI Edge automático)

    // Percentuais MLM (aplicados sobre os 25% = $450k de $1.8M)
    const MLM_PERCENTAGES = [32, 12, 8, 4, 4, 8, 8, 8, 8, 8]; // L1-L10 (soma = 100%)

    let totalFeesProcessed = 0;
    let totalCommissionsDistributed = 0;
    let clientsProcessed = 0;
    let commissionsCreated = 0;
    const errors = [];

    // Período atual (ano e mês)
    const now = new Date();
    const currentMonth = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);
    const currentYear = now.getFullYear();

    console.log(`🔍 [DEBUG] Período: ${currentMonth} (${currentYear})`);
    console.log(`🔍 [DEBUG] Iniciando processamento...`);

    // Processar cada cliente
    for (const client of clients) {
      try {
        // Pegar lucro bruto do cliente (usando monthlyVolume como proxy)
        const grossProfit = parseFloat(client.monthlyVolume || '0');

        console.log(`🔍 [DEBUG] Cliente ${client.walletAddress.slice(0, 10)}... grossProfit=${grossProfit}`);

        if (grossProfit <= 0) {
          console.log(`   ⏭️  Pulando (sem lucro)`);
          continue; // Pula clientes sem lucro
        }

        console.log(`   ✅ Processando...`);


        // DISTRIBUIÇÃO GMI EDGE + SMART CONTRACT:
        // 65% → Cliente (automático GMI Edge)
        // 35% → Performance Fee iDeepX
        //   ├─ 25% → Smart Contract (distribuído via MLM)
        //   └─ 10% → iDeepX operação

        const performanceFee = grossProfit * PERFORMANCE_FEE_PERCENTAGE;    // 35% = $630 de $1800
        const mlmPoolAmount = grossProfit * SMART_CONTRACT_PERCENTAGE;      // 25% = $450 de $1800
        const companyAmount = grossProfit * COMPANY_PERCENTAGE;             // 10% = $180 de $1800
        const clientAmount = grossProfit * 0.65;                            // 65% = $1170 de $1800 (já recebido via GMI)

        console.log(`   Processing ${client.walletAddress.slice(0, 10)}...`)
        console.log(`      Gross Profit: $${grossProfit.toFixed(2)}`)
        console.log(`      Client (65% GMI): $${clientAmount.toFixed(2)}`)
        console.log(`      Performance Fee (35%): $${performanceFee.toFixed(2)}`)
        console.log(`      MLM Pool (25%): $${mlmPoolAmount.toFixed(2)}`)
        console.log(`      Company (10%): $${companyAmount.toFixed(2)}`);

        // Criar PerformanceRecord
        const performanceRecord = await prisma.performanceRecord.create({
          data: {
            userId: client.id,
            month: currentMonth,
            year: currentYear,
            periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
            periodEnd: now,
            profitUsd: grossProfit.toFixed(2),           // 100% = $1800
            feeUsd: performanceFee.toFixed(2),           // 35% = $630
            clientShare: clientAmount.toFixed(2),        // 65% = $1170 (GMI Edge automático)
            mlmPool: mlmPoolAmount.toFixed(2),           // 25% = $450 (Smart Contract)
            companyShare: companyAmount.toFixed(2),      // 10% = $180 (iDeepX operação)
            processed: true,
            distributed: true,
            distributedAt: now
          }
        });

        // Distribuir comissões MLM
        let currentSponsor = client.sponsor;
        let level = 1;
        let distributedThisClient = 0;

        while (currentSponsor && level <= 10) {
          try {
            // Verificar se o sponsor qualifica para receber neste nível
            const qualifies = currentSponsor.maxLevel >= level;

            if (qualifies) {
              // Calcular comissão para este nível
              // Os percentuais são aplicados sobre o MLM Pool (25% do lucro bruto = $450k de $1.8M)
              const levelPercentage = MLM_PERCENTAGES[level - 1]; // Array 0-indexed
              const commissionAmount = mlmPoolAmount * (levelPercentage / 100);

              // Criar registro de comissão
              await prisma.mlmCommission.create({
                data: {
                  userId: currentSponsor.id,
                  fromUserId: client.id,
                  performanceId: performanceRecord.id,
                  level: level,
                  percentage: `${levelPercentage}%`,
                  amount: commissionAmount.toFixed(2),
                  paid: false
                }
              });

              // Atualizar saldo interno do sponsor
              const newBalance = parseFloat(currentSponsor.internalBalance || '0') + commissionAmount;
              const newTotalEarned = parseFloat(currentSponsor.totalEarned || '0') + commissionAmount;

              await prisma.user.update({
                where: { id: currentSponsor.id },
                data: {
                  internalBalance: newBalance.toFixed(2),
                  totalEarned: newTotalEarned.toFixed(2)
                }
              });

              distributedThisClient += commissionAmount;
              commissionsCreated++;

              console.log(`      L${level}: ${currentSponsor.walletAddress.slice(0, 10)} - $${commissionAmount.toFixed(2)} (${levelPercentage}%)`);
            } else {
              console.log(`      L${level}: ${currentSponsor.walletAddress.slice(0, 10)} - SKIP (maxLevel=${currentSponsor.maxLevel})`);
            }

            // Buscar próximo sponsor na cadeia
            if (currentSponsor.sponsorId) {
              currentSponsor = await prisma.user.findUnique({
                where: { id: currentSponsor.sponsorId }
              });
            } else {
              currentSponsor = null;
            }

            level++;
          } catch (levelError) {
            console.error(`      Error at level ${level}:`, levelError.message);
            level++;
            if (currentSponsor?.sponsorId) {
              currentSponsor = await prisma.user.findUnique({
                where: { id: currentSponsor.sponsorId }
              });
            } else {
              currentSponsor = null;
            }
          }
        }

        totalFeesProcessed += feeAmount;
        totalCommissionsDistributed += distributedThisClient;
        clientsProcessed++;

        // Atualizar volume processado do cliente
        await prisma.user.update({
          where: { id: client.id },
          data: {
            monthlyVolume: "0" // Reset para próximo período
          }
        });

      } catch (error) {
        console.error(`❌ Error processing client ${client.walletAddress}:`, error);
        errors.push({
          wallet: client.walletAddress,
          error: error.message
        });
      }
    }

    const results = {
      clientsProcessed,
      commissionsCreated,
      totalFeesProcessed: parseFloat(totalFeesProcessed.toFixed(2)),
      totalCommissionsDistributed: parseFloat(totalCommissionsDistributed.toFixed(2)),
      companyShare: parseFloat((totalFeesProcessed - totalCommissionsDistributed).toFixed(2)),
      errors: errors.length,
      errorDetails: errors
    };

    console.log(`✅ [POST /admin/process-fees] Processing completed!`);
    console.log(`   Clients processed: ${clientsProcessed}`);
    console.log(`   Commissions created: ${commissionsCreated}`);
    console.log(`   Total fees: $${results.totalFeesProcessed}`);
    console.log(`   MLM distributed: $${results.totalCommissionsDistributed}`);
    console.log(`   Company share: $${results.companyShare}`);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('❌ Error in POST /admin/process-fees:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/admin/user/:wallet/toggle-active
// ================================================================================
// Ativar ou desativar usuário manualmente

router.post('/user/:wallet/toggle-active', async (req, res) => {
  try {
    const { wallet } = req.params;
    const walletLower = wallet.toLowerCase();

    console.log(`🔄 [POST /admin/user/:wallet/toggle-active] Toggling for: ${wallet}`);

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletLower }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const newActiveState = !user.active;

    const updated = await prisma.user.update({
      where: { walletAddress: walletLower },
      data: {
        active: newActiveState,
        subscriptionExpiry: newActiveState
          ? Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
          : 0
      }
    });

    console.log(`✅ [POST /admin/user/:wallet/toggle-active] User ${newActiveState ? 'activated' : 'deactivated'}: ${wallet}`);

    res.json({
      success: true,
      data: {
        wallet: updated.walletAddress,
        active: updated.active
      }
    });
  } catch (error) {
    console.error('❌ Error in POST /admin/user/:wallet/toggle-active:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/admin/user/:wallet/update-level
// ================================================================================
// Atualizar nível máximo do usuário

router.post('/user/:wallet/update-level', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { level } = req.body;
    const walletLower = wallet.toLowerCase();

    if (!level || level < 1 || level > 10) {
      return res.status(400).json({
        success: false,
        error: 'Level must be between 1 and 10'
      });
    }

    console.log(`🔄 [POST /admin/user/:wallet/update-level] Setting level ${level} for: ${wallet}`);

    const updated = await prisma.user.update({
      where: { walletAddress: walletLower },
      data: { maxLevel: level }
    });

    console.log(`✅ [POST /admin/user/:wallet/update-level] Level updated: ${wallet} -> L${level}`);

    res.json({
      success: true,
      data: {
        wallet: updated.walletAddress,
        maxLevel: updated.maxLevel
      }
    });
  } catch (error) {
    console.error('❌ Error in POST /admin/user/:wallet/update-level:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/recent-activity
// ================================================================================
// Retorna atividade recente no sistema

router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    console.log(`📋 [GET /admin/recent-activity] Fetching last ${limit} activities...`);

    // Buscar últimas comissões
    const recentCommissions = await prisma.mlmCommission.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    // Buscar informações de fromUser separadamente (não há relação no schema)
    const fromUserIds = [...new Set(recentCommissions.map(c => c.fromUserId).filter(Boolean))];
    const fromUsers = fromUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: fromUserIds } },
          select: { id: true, walletAddress: true }
        })
      : [];
    const fromUsersMap = Object.fromEntries(fromUsers.map(u => [u.id, u.walletAddress]));

    // Buscar novos usuários
    const recentUsers = await prisma.user.findMany({
      where: { simulationId: null },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        walletAddress: true,
        active: true,
        maxLevel: true,
        createdAt: true
      }
    });

    const response = {
      success: true,
      data: {
        commissions: recentCommissions.map(c => ({
          id: c.id,
          amount: parseFloat(c.amount || '0'),
          level: c.level,
          user: c.user?.walletAddress,
          fromUser: fromUsersMap[c.fromUserId] || null,
          createdAt: c.createdAt
        })),
        newUsers: recentUsers,
        timestamp: Date.now()
      }
    };

    console.log(`✅ [GET /admin/recent-activity] Returned ${recentCommissions.length} commissions, ${recentUsers.length} users`);

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /admin/recent-activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/admin/sync-eligibility
// ================================================================================
// Sincronizar elegibilidade de todos os usuários

router.post('/sync-eligibility', async (req, res) => {
  try {
    console.log('🔄 [POST /admin/sync-eligibility] Starting eligibility sync...');

    // Buscar TODOS os usuários ativos (não apenas reais)
    const users = await prisma.user.findMany({
      where: {
        simulationId: null, // Apenas usuários reais
        active: true
      },
      include: {
        referrals: {
          where: {
            simulationId: null,
            active: true // Apenas diretos ativos
          }
        }
      }
    });

    console.log(`📊 Checking eligibility for ${users.length} active users...`);

    let updated = 0;
    let checked = 0;
    const REQUIRED_DIRECTS = 5;    // Mínimo 5 indicados diretos ativos para L6-L10
    const REQUIRED_VOLUME = 5000;  // Mínimo $5000 volume combinado para L6-L10

    const updates = [];

    for (const user of users) {
      checked++;
      const activeDirects = user.referrals.length; // Já filtrado no include
      const monthlyVolume = parseFloat(user.monthlyVolume || '0');

      // Volume combinado (user + diretos ativos)
      const directsVolume = user.referrals.reduce(
        (sum, r) => sum + parseFloat(r.monthlyVolume || '0'),
        0
      );
      const combinedVolume = monthlyVolume + directsVolume;

      // Verificar se tem taxa ativa
      const now = Math.floor(Date.now() / 1000);
      const hasActiveSubscription = user.subscriptionExpiry > now;

      // Determinar nível recomendado
      let recommendedLevel;

      if (!hasActiveSubscription) {
        // Sem taxa ativa = L1 (recebe apenas de indicados diretos)
        // Permite receber comissões dos diretos por período inicial/teste
        recommendedLevel = 1;
      } else if (activeDirects >= REQUIRED_DIRECTS && combinedVolume >= REQUIRED_VOLUME) {
        // Qualifica para L6-L10 (com taxa + 5 diretos + $5k volume)
        recommendedLevel = 10;
      } else {
        // Com taxa ativa, mas sem requisitos premium = L5
        recommendedLevel = 5;
      }

      // Verifica se precisa atualizar
      const needsUpdate = user.maxLevel !== recommendedLevel;

      if (needsUpdate) {
        // Atualizar nível
        await prisma.user.update({
          where: { id: user.id },
          data: { maxLevel: recommendedLevel }
        });

        updated++;
        updates.push({
          wallet: user.walletAddress,
          oldLevel: user.maxLevel,
          newLevel: recommendedLevel,
          activeDirects,
          combinedVolume: Math.round(combinedVolume),
          hasSubscription: hasActiveSubscription
        });

        console.log(
          `   ✅ ${user.walletAddress.slice(0, 10)}... | ` +
          `L${user.maxLevel} → L${recommendedLevel} | ` +
          `Diretos: ${activeDirects} | Volume: $${Math.round(combinedVolume)} | ` +
          `Taxa: ${hasActiveSubscription ? 'Ativa' : 'Inativa'}`
        );
      } else {
        console.log(
          `   ⏭️  ${user.walletAddress.slice(0, 10)}... | ` +
          `L${user.maxLevel} (correto) | ` +
          `Diretos: ${activeDirects} | Volume: $${Math.round(combinedVolume)} | ` +
          `Taxa: ${hasActiveSubscription ? 'Ativa' : 'Inativa'}`
        );
      }
    }

    console.log('');
    console.log(`✅ [POST /admin/sync-eligibility] Sync completed!`);
    console.log(`   📊 Total verificados: ${checked}`);
    console.log(`   ⬆️  Atualizados: ${updated}`);
    console.log(`   ⏭️  Já corretos: ${checked - updated}`);

    res.json({
      success: true,
      data: {
        totalChecked: checked,
        updated,
        alreadyCorrect: checked - updated,
        updates
      }
    });
  } catch (error) {
    console.error('❌ Error in POST /admin/sync-eligibility:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/admin/system-status
// ================================================================================
// Retorna status atual do sistema

// Status do sistema (em produção, usar banco de dados ou Redis)
let systemStatus = {
  paused: false,
  pausedAt: null,
  pausedBy: null,
  reason: null
};

router.get('/system-status', async (req, res) => {
  try {
    console.log('📊 [GET /admin/system-status] Fetching system status');

    // Estatísticas adicionais
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count({ where: { simulationId: null } }),
      prisma.user.count({ where: { simulationId: null, active: true } })
    ]);

    res.json({
      success: true,
      data: {
        ...systemStatus,
        stats: {
          totalUsers,
          activeUsers,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in GET /admin/system-status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/admin/system/pause
// ================================================================================
// Pausa o sistema

router.post('/system/pause', async (req, res) => {
  try {
    const { reason } = req.body;

    console.log('⏸️  [POST /admin/system/pause] Pausing system');

    systemStatus = {
      paused: true,
      pausedAt: new Date().toISOString(),
      pausedBy: 'admin', // Em produção, pegar do token de autenticação
      reason: reason || 'Paused by administrator'
    };

    console.log('✅ System paused successfully');

    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('❌ Error in POST /admin/system/pause:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/admin/system/resume
// ================================================================================
// Retoma o sistema

router.post('/system/resume', async (req, res) => {
  try {
    console.log('▶️  [POST /admin/system/resume] Resuming system');

    systemStatus = {
      paused: false,
      pausedAt: null,
      pausedBy: null,
      reason: null
    };

    console.log('✅ System resumed successfully');

    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('❌ Error in POST /admin/system/resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
