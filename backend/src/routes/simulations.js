// ================================================================================
// ROTAS - SIMULATIONS
// ================================================================================
// Endpoints para armazenar e consultar resultados de simulações MLM

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ================================================================================
// POST /api/simulations
// ================================================================================
// Recebe resultados de uma simulação do Python e salva no banco

router.post('/', async (req, res) => {
  try {
    const {
      totalClients,
      totalCapital,
      poolMlm,
      topId,
      topName,
      topWallet,
      topLevel = 0,
      topDirect = 0,
      topNetwork,
      topDepth = 0,
      topCommission,
      topLai = "19",
      topProfit,
      topRoi,
      topStatus = "Lucrativo",
      totalCommissions,
      maxNetwork,
      perfectDistribution = true,
      registeredBackend = 0,
      files,
      distribution
    } = req.body;

    // Validação básica
    if (!totalClients || !totalCapital || !poolMlm) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: totalClients, totalCapital, poolMlm'
      });
    }

    // Criar simulação
    const simulation = await prisma.simulation.create({
      data: {
        totalClients: parseInt(totalClients),
        totalCapital: totalCapital.toString(),
        poolMlm: poolMlm.toString(),
        topId: parseInt(topId),
        topName: topName || '',
        topWallet: topWallet || null,
        topLevel: parseInt(topLevel) || 0,
        topDirect: parseInt(topDirect) || 0,
        topNetwork: parseInt(topNetwork) || 0,
        topDepth: parseInt(topDepth) || 0,
        topCommission: topCommission.toString(),
        topLai: topLai.toString(),
        topProfit: topProfit.toString(),
        topRoi: topRoi.toString(),
        topStatus: topStatus || 'Lucrativo',
        totalCommissions: totalCommissions.toString(),
        maxNetwork: parseInt(maxNetwork) || 0,
        perfectDistribution: !!perfectDistribution,
        registeredBackend: parseInt(registeredBackend) || 0,
        files: JSON.stringify(files || {}),
        distribution: JSON.stringify(distribution || {})
      }
    });

    console.log(`✅ Simulação salva: ${simulation.id} (${totalClients} clientes, $${totalCapital})`);

    res.status(201).json({
      success: true,
      data: simulation
    });
  } catch (error) {
    console.error('Error in POST /api/simulations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/simulations
// ================================================================================
// Lista todas as simulações com paginação

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, orderBy = 'timestamp', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [simulations, total] = await Promise.all([
      prisma.simulation.findMany({
        take: parseInt(limit),
        skip,
        orderBy: { [orderBy]: order },
      }),
      prisma.simulation.count()
    ]);

    // Parse JSON fields
    const parsedSimulations = simulations.map(sim => ({
      ...sim,
      files: JSON.parse(sim.files),
      distribution: JSON.parse(sim.distribution)
    }));

    res.json({
      success: true,
      data: {
        simulations: parsedSimulations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/simulations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/simulations/latest
// ================================================================================
// Retorna a simulação mais recente

router.get('/latest', async (req, res) => {
  try {
    const simulation = await prisma.simulation.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma simulação encontrada'
      });
    }

    // Parse JSON fields
    const parsed = {
      ...simulation,
      files: JSON.parse(simulation.files),
      distribution: JSON.parse(simulation.distribution)
    };

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Error in GET /api/simulations/latest:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/simulations/stats
// ================================================================================
// Retorna estatísticas gerais das simulações

router.get('/stats', async (req, res) => {
  try {
    const [total, avgClients, maxRoi] = await Promise.all([
      prisma.simulation.count(),
      prisma.simulation.aggregate({
        _avg: { totalClients: true }
      }),
      prisma.simulation.findFirst({
        orderBy: { topRoi: 'desc' },
        select: { topRoi: true, id: true, timestamp: true }
      })
    ]);

    // Buscar distribuição de ROI e calcular total de capital
    const allSims = await prisma.simulation.findMany({
      select: { topRoi: true, totalCapital: true }
    });

    const roiValues = allSims.map(s => parseFloat(s.topRoi)).filter(r => !isNaN(r));
    const avgRoi = roiValues.length > 0
      ? (roiValues.reduce((a, b) => a + b, 0) / roiValues.length).toFixed(2)
      : '0';

    // Calcular total de capital somando manualmente (são Strings)
    const totalCapitalSimulated = allSims
      .map(s => parseFloat(s.totalCapital))
      .filter(c => !isNaN(c))
      .reduce((a, b) => a + b, 0)
      .toFixed(0);

    res.json({
      success: true,
      data: {
        totalSimulations: total,
        avgClients: Math.round(avgClients._avg?.totalClients || 0),
        avgRoi: avgRoi,
        maxRoi: {
          value: maxRoi?.topRoi || '0',
          simulationId: maxRoi?.id,
          timestamp: maxRoi?.timestamp
        },
        totalCapitalSimulated: totalCapitalSimulated
      }
    });
  } catch (error) {
    console.error('Error in GET /api/simulations/stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/simulations/:id
// ================================================================================
// Retorna uma simulação específica

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await prisma.simulation.findUnique({
      where: { id }
    });

    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: 'Simulação não encontrada'
      });
    }

    // Parse JSON fields
    const parsed = {
      ...simulation,
      files: JSON.parse(simulation.files),
      distribution: JSON.parse(simulation.distribution)
    };

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Error in GET /api/simulations/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// DELETE /api/simulations/:id
// ================================================================================
// Deleta uma simulação (admin only)

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Adicionar verificação de admin aqui se necessário

    await prisma.simulation.delete({
      where: { id }
    });

    console.log(`🗑️ Simulação deletada: ${id}`);

    res.json({
      success: true,
      message: 'Simulação deletada com sucesso'
    });
  } catch (error) {
    console.error('Error in DELETE /api/simulations/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/simulations/compare/:id1/:id2
// ================================================================================
// Compara duas simulações lado a lado

router.get('/compare/:id1/:id2', async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    const [sim1, sim2] = await Promise.all([
      prisma.simulation.findUnique({ where: { id: id1 } }),
      prisma.simulation.findUnique({ where: { id: id2 } })
    ]);

    if (!sim1 || !sim2) {
      return res.status(404).json({
        success: false,
        error: 'Uma ou ambas simulações não encontradas'
      });
    }

    // Parse JSON fields
    const parsed1 = {
      ...sim1,
      files: JSON.parse(sim1.files),
      distribution: JSON.parse(sim1.distribution)
    };

    const parsed2 = {
      ...sim2,
      files: JSON.parse(sim2.files),
      distribution: JSON.parse(sim2.distribution)
    };

    // Calcular diferenças
    const diff = {
      clients: parseInt(sim2.totalClients) - parseInt(sim1.totalClients),
      capital: parseFloat(sim2.totalCapital) - parseFloat(sim1.totalCapital),
      roi: parseFloat(sim2.topRoi) - parseFloat(sim1.topRoi),
      network: parseInt(sim2.topNetwork) - parseInt(sim1.topNetwork),
      commission: parseFloat(sim2.topCommission) - parseFloat(sim1.topCommission)
    };

    res.json({
      success: true,
      data: {
        simulation1: parsed1,
        simulation2: parsed2,
        differences: diff
      }
    });
  } catch (error) {
    console.error('Error in GET /api/simulations/compare:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// POST /api/simulations/:id/users
// ================================================================================
// Salva usuários de uma simulação em massa

router.post('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    const { users } = req.body;

    if (!users || !Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        error: 'Campo "users" é obrigatório e deve ser um array'
      });
    }

    // Verificar se a simulação existe
    const simulation = await prisma.simulation.findUnique({
      where: { id }
    });

    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: 'Simulação não encontrada'
      });
    }

    // Deletar usuários antigos desta simulação (se houver)
    await prisma.user.deleteMany({
      where: { simulationId: id }
    });

    console.log(`🗑️  Deletados usuários antigos da simulação ${id}`);

    // Criar usuários em massa usando transação
    const createdUsers = [];

    for (const userData of users) {
      try {
        const user = await prisma.user.create({
          data: {
            walletAddress: userData.walletAddress,
            simulationId: id,
            active: userData.active || false,
            sponsorAddress: userData.sponsorAddress || null,
            maxLevel: userData.maxLevel || 0,
            monthlyVolume: userData.monthlyVolume?.toString() || "0",
            totalVolume: userData.totalVolume?.toString() || "0",
            totalEarned: userData.totalEarned?.toString() || "0",
            internalBalance: userData.internalBalance?.toString() || "0"
          }
        });
        createdUsers.push(user);
      } catch (err) {
        // Ignorar erros de duplicação (wallet já existe)
        if (!err.message.includes('Unique constraint')) {
          console.error(`Erro ao criar usuário ${userData.walletAddress}:`, err);
        }
      }
    }

    console.log(`✅ Criados ${createdUsers.length}/${users.length} usuários para simulação ${id}`);

    // Atualizar contador de usuários registrados na simulação
    await prisma.simulation.update({
      where: { id },
      data: { registeredBackend: createdUsers.length }
    });

    res.status(201).json({
      success: true,
      data: {
        simulationId: id,
        totalRequested: users.length,
        totalCreated: createdUsers.length,
        message: `${createdUsers.length} usuários salvos com sucesso`
      }
    });
  } catch (error) {
    console.error('Error in POST /api/simulations/:id/users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================================================================
// GET /api/simulations/user/:walletAddress
// ================================================================================
// Retorna dados de simulação de um usuário específico (todas as simulações onde ele aparece)

router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Buscar usuário com dados de simulação
    const users = await prisma.user.findMany({
      where: {
        walletAddress: walletAddress,
        simulationId: {
          not: null
        }
      },
      include: {
        sponsor: {
          select: {
            walletAddress: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      return res.json({
        success: true,
        data: {
          user: null,
          simulations: [],
          stats: {
            totalSimulations: 0,
            avgEarned: '0',
            totalEarned: '0',
            avgVolume: '0',
            totalVolume: '0'
          }
        }
      });
    }

    // Buscar dados de todas as simulações onde o usuário aparece
    const simulationIds = [...new Set(users.map(u => u.simulationId))];
    const simulations = await prisma.simulation.findMany({
      where: {
        id: {
          in: simulationIds
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Parse JSON fields
    const parsedSimulations = simulations.map(sim => ({
      ...sim,
      files: JSON.parse(sim.files),
      distribution: JSON.parse(sim.distribution)
    }));

    // Criar mapa de simulações por ID
    const simMap = new Map(parsedSimulations.map(s => [s.id, s]));

    // Combinar dados de usuário com dados de simulação
    const userWithSimulations = users.map(user => {
      const simulation = simMap.get(user.simulationId);
      return {
        ...user,
        simulation: simulation || null
      };
    });

    // Calcular estatísticas
    const totalEarned = users.reduce((sum, u) => sum + parseFloat(u.totalEarned || 0), 0);
    const totalVolume = users.reduce((sum, u) => sum + parseFloat(u.totalVolume || 0), 0);
    const avgEarned = users.length > 0 ? totalEarned / users.length : 0;
    const avgVolume = users.length > 0 ? totalVolume / users.length : 0;

    // Buscar rede do usuário (diretos dele)
    const latestUser = users[0];
    const directReferrals = await prisma.user.findMany({
      where: {
        sponsorAddress: walletAddress,
        simulationId: latestUser.simulationId
      },
      select: {
        walletAddress: true,
        totalEarned: true,
        totalVolume: true,
        active: true
      }
    });

    res.json({
      success: true,
      data: {
        user: latestUser,
        simulations: userWithSimulations,
        directReferrals: directReferrals,
        stats: {
          totalSimulations: users.length,
          avgEarned: avgEarned.toFixed(2),
          totalEarned: totalEarned.toFixed(2),
          avgVolume: avgVolume.toFixed(2),
          totalVolume: totalVolume.toFixed(2),
          directCount: directReferrals.length
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/simulations/user/:walletAddress:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
