// ================================================================================
// ROTAS - DEV (Desenvolvimento)
// ================================================================================
// Endpoints para facilitar desenvolvimento e testes

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ================================================================================
// GET /api/dev/user/:wallet/complete
// ================================================================================
// Retorna TODOS os dados do usuário em uma única requisição (OTIMIZADO)

router.get('/user/:wallet/complete', async (req, res) => {
  try {
    const { wallet } = req.params;
    const walletLower = wallet.toLowerCase();

    console.log(`📦 [GET /dev/user/:wallet/complete] Fetching complete data for: ${wallet}`);

    // Buscar usuário com todas as relações
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletLower },
      include: {
        gmiAccount: true,
        sponsor: {
          select: {
            id: true,
            walletAddress: true,
            maxLevel: true
          }
        },
        referrals: {
          where: { simulationId: null }, // Apenas usuários reais (não de simulação)
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
        metrics: {
          orderBy: { month: 'desc' },
          take: 3 // Últimos 3 meses
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Últimas 10 comissões
        }
      }
    });

    // Se usuário não existe, criar registro vazio
    if (!user) {
      console.log(`⚠️  User not found, creating empty record for: ${wallet}`);

      const newUser = await prisma.user.create({
        data: {
          walletAddress: walletLower,
          active: false,
          kycStatus: 0,
          subscriptionExpiry: 0,
          maxLevel: 0,
          monthlyVolume: "0",
          totalVolume: "0",
          totalEarned: "0",
          totalWithdrawn: "0",
          internalBalance: "0",
          lastWithdrawMonth: 0,
          withdrawnThisMonth: "0"
        }
      });

      return res.json({
        user: newUser,
        mlmStats: {
          totalCommissions: 0,
          directReferrals: 0,
          totalNetwork: 0,
          activeDirects: 0
        },
        eligibility: {
          qualifies: false,
          recommendedMaxLevel: 5,
          activeDirects: 0,
          combinedVolume: 0
        },
        referrals: []
      });
    }

    // Calcular estatísticas MLM
    const directReferrals = user.referrals.length;
    const activeDirects = user.referrals.filter(r => r.active).length;

    // Calcular total de comissões
    const totalCommissions = user.commissions.reduce(
      (sum, comm) => sum + parseFloat(comm.amount || '0'),
      0
    );

    // Calcular rede total (recursivo - simplificado) - apenas usuários reais
    const countNetworkRecursive = async (userId, maxDepth = 10, currentDepth = 0) => {
      if (currentDepth >= maxDepth) return 0;

      const directCount = await prisma.user.count({
        where: {
          sponsorId: userId,
          simulationId: null // Apenas usuários reais (não de simulação)
        }
      });

      const directUsers = await prisma.user.findMany({
        where: {
          sponsorId: userId,
          simulationId: null // Apenas usuários reais (não de simulação)
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

    // Calcular volume combinado (usuário + diretos ativos)
    const combinedVolume = user.referrals
      .filter(r => r.active)
      .reduce((sum, r) => sum + parseFloat(r.monthlyVolume || '0'), 0) +
      parseFloat(user.monthlyVolume || '0');

    // Determinar se qualifica para desbloquear nível
    const recommendedMaxLevel = Math.min(
      5 + Math.floor(activeDirects / 2),
      10
    );

    const qualifies = activeDirects >= 2 &&
                      combinedVolume >= 1000 &&
                      user.maxLevel < recommendedMaxLevel;

    // Montar resposta completa
    const response = {
      user: {
        ...user,
        gmiAccount: user.gmiAccount || null,
        sponsor: user.sponsor || null,
        // Remover relações aninhadas (já incluídas separadamente)
        referrals: undefined,
        metrics: undefined,
        commissions: undefined
      },
      mlmStats: {
        totalCommissions: parseFloat(totalCommissions.toFixed(2)),
        directReferrals,
        totalNetwork,
        activeDirects
      },
      eligibility: {
        qualifies,
        recommendedMaxLevel,
        activeDirects,
        combinedVolume: parseFloat(combinedVolume.toFixed(2))
      },
      referrals: user.referrals,
      metrics: user.metrics,
      commissions: user.commissions
    };

    console.log(`✅ [GET /dev/user/:wallet/complete] Data returned for: ${wallet}`);
    console.log(`   - Direct Referrals: ${directReferrals}`);
    console.log(`   - Total Network: ${totalNetwork}`);
    console.log(`   - Active Directs: ${activeDirects}`);
    console.log(`   - Total Commissions: $${totalCommissions.toFixed(2)}`);

    res.json(response);
  } catch (error) {
    console.error('❌ Error in GET /dev/user/:wallet/complete:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/dev/user/:wallet/register
// ================================================================================
// Registra novo usuário (para testes de desenvolvimento)

router.post('/user/:wallet/register', async (req, res) => {
  try {
    const { wallet } = req.params;
    const walletLower = wallet.toLowerCase();
    const userData = req.body;

    console.log(`📝 [POST /dev/user/:wallet/register] Registering user: ${wallet}`);

    // Criar ou atualizar usuário
    const user = await prisma.user.upsert({
      where: { walletAddress: walletLower },
      update: {
        active: userData.active ?? false,
        kycStatus: userData.kycStatus ?? 0,
        subscriptionExpiry: userData.subscriptionExpiry ?? 0,
        sponsorAddress: userData.sponsorAddress?.toLowerCase() ?? null,
        maxLevel: userData.maxLevel ?? 0,
        monthlyVolume: userData.monthlyVolume?.toString() ?? "0",
        totalVolume: userData.totalVolume?.toString() ?? "0",
        totalEarned: userData.totalEarned?.toString() ?? "0",
        internalBalance: userData.internalBalance?.toString() ?? "0",
        accountHash: userData.accountHash ?? null
      },
      create: {
        walletAddress: walletLower,
        active: userData.active ?? false,
        kycStatus: userData.kycStatus ?? 0,
        subscriptionExpiry: userData.subscriptionExpiry ?? 0,
        sponsorAddress: userData.sponsorAddress?.toLowerCase() ?? null,
        maxLevel: userData.maxLevel ?? 0,
        monthlyVolume: userData.monthlyVolume?.toString() ?? "0",
        totalVolume: userData.totalVolume?.toString() ?? "0",
        totalEarned: userData.totalEarned?.toString() ?? "0",
        totalWithdrawn: "0",
        internalBalance: userData.internalBalance?.toString() ?? "0",
        lastWithdrawMonth: 0,
        withdrawnThisMonth: "0",
        accountHash: userData.accountHash ?? null
      }
    });

    // Se tem sponsor, criar relação
    if (userData.sponsorAddress) {
      const sponsor = await prisma.user.findUnique({
        where: { walletAddress: userData.sponsorAddress.toLowerCase() }
      });

      if (sponsor) {
        await prisma.user.update({
          where: { id: user.id },
          data: { sponsorId: sponsor.id }
        });
      }
    }

    console.log(`✅ [POST /dev/user/:wallet/register] User registered: ${wallet}`);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error in POST /dev/user/:wallet/register:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/dev/user/:wallet
// ================================================================================
// Retorna dados básicos do usuário (compatibilidade)

router.get('/user/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const walletLower = wallet.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletLower },
      include: {
        gmiAccount: true,
        sponsor: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in GET /dev/user/:wallet:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
