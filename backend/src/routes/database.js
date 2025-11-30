// ================================================================================
// ROTAS - DATABASE DEBUG
// ================================================================================
// Endpoints para visualizar dados do banco (debug/transparência)

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ================================================================================
// GET /api/database/overview
// ================================================================================

router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalGmi, totalPerf, totalComm] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.gmiAccount.count(),
      prisma.performanceRecord.count(),
      prisma.mlmCommission.count()
    ]);

    // Contar por nível
    const byLevel = {};
    for (let i = 1; i <= 10; i++) {
      const count = await prisma.user.count({ where: { maxLevel: i } });
      if (count > 0) byLevel[i] = count;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalGmiAccounts: totalGmi,
        totalPerformanceRecords: totalPerf,
        totalCommissions: totalComm,
        usersByLevel: byLevel
      }
    });
  } catch (error) {
    console.error('Error in /api/database/overview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================================
// GET /api/database/users
// ================================================================================

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: parseInt(limit),
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          gmiAccount: true,
          sponsor: {
            select: {
              walletAddress: true
            }
          },
          _count: {
            select: {
              referrals: true
            }
          }
        }
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/database/users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================================
// GET /api/database/mlm-structure/:address
// ================================================================================

router.get('/mlm-structure/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      include: {
        referrals: {
          include: {
            gmiAccount: true,
            _count: {
              select: {
                referrals: true
              }
            }
          }
        },
        sponsor: {
          select: {
            walletAddress: true,
            maxLevel: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Buscar upline (recursivo até 10 níveis)
    const upline = [];
    let currentUser = user;
    for (let i = 0; i < 10 && currentUser.sponsorId; i++) {
      const sponsor = await prisma.user.findUnique({
        where: { id: currentUser.sponsorId },
        select: {
          id: true,
          walletAddress: true,
          maxLevel: true,
          sponsorId: true
        }
      });

      if (!sponsor) break;

      upline.push({
        level: i + 1,
        walletAddress: sponsor.walletAddress,
        maxLevel: sponsor.maxLevel
      });

      currentUser = sponsor;
    }

    res.json({
      success: true,
      data: {
        user: {
          walletAddress: user.walletAddress,
          active: user.active,
          maxLevel: user.maxLevel,
          directReferrals: user._count?.referrals || 0,
          sponsor: user.sponsor?.walletAddress
        },
        upline,
        directReferrals: user.referrals
      }
    });
  } catch (error) {
    console.error('Error in /api/database/mlm-structure:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================================
// GET /api/database/performance
// ================================================================================

router.get('/performance', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      prisma.performanceRecord.findMany({
        take: parseInt(limit),
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              walletAddress: true
            }
          }
        }
      }),
      prisma.performanceRecord.count()
    ]);

    // Calcular totais
    const totals = records.reduce((acc, r) => {
      acc.profit += parseFloat(r.profitUsd || 0);
      acc.fee += parseFloat(r.feeUsd || 0);
      acc.mlmPool += parseFloat(r.mlmPool || 0);
      return acc;
    }, { profit: 0, fee: 0, mlmPool: 0 });

    res.json({
      success: true,
      data: {
        records,
        totals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/database/performance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================================
// GET /api/database/commissions
// ================================================================================

router.get('/commissions', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [commissions, total] = await Promise.all([
      prisma.mlmCommission.findMany({
        take: parseInt(limit),
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              walletAddress: true
            }
          }
        }
      }),
      prisma.mlmCommission.count()
    ]);

    // Calcular totais
    const totalAmount = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

    // Contar por nível
    const byLevel = {};
    for (let i = 1; i <= 10; i++) {
      const levelComm = await prisma.mlmCommission.findMany({
        where: { level: i }
      });
      const total = levelComm.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
      if (total > 0) {
        byLevel[i] = {
          count: levelComm.length,
          total: total.toFixed(2)
        };
      }
    }

    res.json({
      success: true,
      data: {
        commissions,
        totalAmount: totalAmount.toFixed(2),
        byLevel,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/database/commissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
