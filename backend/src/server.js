import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import logger from './config/logger.js';
import siweAuth from './auth/siwe.js';
import contractV10 from './contracts/v10.js';
import mlmCalculator from './mlm/calculator.js';
import mlmUnlock from './mlm/unlock.js';
import jobScheduler from './jobs/scheduler.js';
import weeklyProofJobs from './jobs/weeklyProof.js'; // ✅ NEW: Weekly PROOF automation
// import mt5Service from './services/mt5Service.js'; // ❌ DESABILITADO - Não usar MT5 Python
import gmiMockService from './services/gmiMockService.js';
import gmiEdgeService from './services/gmiEdgeService.js';
import blockchainRouter from './routes/blockchain.js'; // ✅ NEW: Proof + Rulebook routes
// import databaseRouter from './routes/database.js'; // ✅ NEW: Database debug routes - TEMPORARILY DISABLED
import simulationsRouter from './routes/simulations.js'; // ✅ NEW: Simulations tracking routes
import mlmTreeRouter from './routes/mlm-tree.js'; // ✅ NEW: MLM Tree visualization routes
import adminRouter from './routes/admin.js'; // ✅ NEW: Admin routes
import mt5Router from './routes/mt5.js'; // ✅ NEW: MT5 multi-account system routes
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { ethers } from 'ethers';

const prisma = new PrismaClient();
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());
// Configurar CORS para aceitar múltiplos origins
const corsOrigins = config.corsOrigin.split(',').map(origin => origin.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting (DESABILITADO em desenvolvimento para facilitar testes)
// Atualizado: 2025-11-05 - Desabilitar rate limit em dev
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: 'Too many requests'
  });
  app.use('/api', limiter);
  logger.info('[Rate Limit] Habilitado: 100 req/15min');
} else {
  logger.info('[Rate Limit] DESABILITADO em desenvolvimento');
}

// ============================================================================
// ROUTES - PUBLIC
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================================================
// AUTH ROUTES - SIWE
// ============================================================================

app.post('/api/auth/siwe/start', (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const message = siweAuth.generateMessage(walletAddress, nonce);

    res.json({ message: message.message, nonce });
  } catch (error) {
    logger.error(`SIWE start error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/siwe/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;

    if (!message || !signature) {
      return res.status(400).json({ error: 'message and signature required' });
    }

    const result = await siweAuth.verify(message, signature);
    res.json(result);
  } catch (error) {
    logger.error(`SIWE verify error: ${error.message}`);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// ============================================================================
// USER ROUTES - PROTECTED
// ============================================================================

app.get('/api/user/me', siweAuth.authMiddleware(), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        sponsor: { select: { walletAddress: true } },
        referrals: { where: { active: true } }
      }
    });

    // Get on-chain data
    const onChainData = await contractV10.getUserView(user.walletAddress);

    res.json({
      ...user,
      onChain: onChainData,
      directReferralsCount: user.referrals.length
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/mlm/stats', siweAuth.authMiddleware(), async (req, res) => {
  try {
    const stats = await mlmCalculator.getUserMlmStats(req.user.userId);
    res.json(stats);
  } catch (error) {
    logger.error(`Get MLM stats error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/eligibility', siweAuth.authMiddleware(), async (req, res) => {
  try {
    const eligibility = await mlmUnlock.checkEligibility(req.user.userId);
    res.json(eligibility);
  } catch (error) {
    logger.error(`Check eligibility error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/referrals', siweAuth.authMiddleware(), async (req, res) => {
  try {
    const referrals = await mlmUnlock.getDirectReferralsDetails(req.user.userId);
    res.json({ referrals });
  } catch (error) {
    logger.error(`Get referrals error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// LINK GMI ACCOUNT
// ============================================================================

app.post('/api/link', siweAuth.authMiddleware(), async (req, res) => {
  try {
    const { accountNumber, server, platform = 'MT5' } = req.body;

    if (!accountNumber || !server) {
      return res.status(400).json({ error: 'accountNumber and server required' });
    }

    // Validar platform
    if (!['MT5', 'MT4'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be MT5 or MT4' });
    }

    // Generate accountHash (keccak256)
    const accountHash = ethers.keccak256(
      ethers.toUtf8Bytes(accountNumber + server)
    );

    // Save (encrypted) - DEMO: não estamos encriptando aqui
    const gmiAccount = await prisma.gmiAccount.upsert({
      where: { userId: req.user.userId },
      update: {
        accountNumber,
        server,
        platform,
        encryptedPayload: JSON.stringify({ accountNumber, server, platform }),
        accountHash,
        connected: false, // Será true quando EA enviar primeiro sync
        lastSyncAt: null
      },
      create: {
        userId: req.user.userId,
        accountNumber,
        server,
        platform,
        encryptedPayload: JSON.stringify({ accountNumber, server, platform }),
        accountHash,
        connected: false
      }
    });

    // Update on-chain
    await contractV10.confirmLink(req.user.walletAddress, accountHash);

    // Update user
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { accountHash, active: true }
    });

    logger.info(`Account linked: ${accountNumber} (${platform}) on ${server}`);

    res.json({
      success: true,
      accountHash,
      platform
    });
  } catch (error) {
    logger.error(`Link error: ${error.message}`);
    res.status(500).json({ error: 'Failed to link account' });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.get('/api/admin/system', siweAuth.authMiddleware(), siweAuth.adminMiddleware(), async (req, res) => {
  try {
    const stats = await contractV10.getSystemStats();
    const solvency = await contractV10.getSolvencyRatio();

    const users = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { active: true } });

    res.json({
      onChain: stats,
      solvency,
      database: {
        totalUsers: users,
        activeUsers
      }
    });
  } catch (error) {
    logger.error(`Get system stats error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/sync/eligibility', siweAuth.authMiddleware(), siweAuth.adminMiddleware(), async (req, res) => {
  try {
    const result = await mlmUnlock.batchUpdateAllUsers();
    res.json(result);
  } catch (error) {
    logger.error(`Sync eligibility error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Jobs status
app.get('/api/admin/jobs/status', siweAuth.authMiddleware(), siweAuth.adminMiddleware(), (req, res) => {
  try {
    const status = jobScheduler.getStatus();
    res.json(status);
  } catch (error) {
    logger.error(`Get jobs status error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Run job manually
app.post('/api/admin/jobs/run/:jobName', siweAuth.authMiddleware(), siweAuth.adminMiddleware(), async (req, res) => {
  try {
    const { jobName } = req.params;
    const result = await jobScheduler.runNow(jobName);
    res.json({ success: true, result });
  } catch (error) {
    logger.error(`Run job error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// DEV ROUTES (SEM AUTENTICAÇÃO - APENAS PARA DESENVOLVIMENTO)
// ============================================================================

if (config.nodeEnv === 'development') {
  // Stats públicas para desenvolvimento
  app.get('/api/dev/stats', async (req, res) => {
    try {
      const users = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { active: true } });

      res.json({
        database: {
          totalUsers: users,
          activeUsers
        }
      });
    } catch (error) {
      logger.error(`Dev stats error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Jobs status público para desenvolvimento
  app.get('/api/dev/jobs', (req, res) => {
    try {
      const status = jobScheduler.getStatus();
      res.json(status);
    } catch (error) {
      logger.error(`Dev jobs error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Executar job manualmente (desenvolvimento - mock)
  app.post('/api/dev/jobs/run/:jobName', async (req, res) => {
    try {
      const { jobName } = req.params;
      logger.info(`Dev mode: Job '${jobName}' execution simulated (no on-chain update)`);

      res.json({
        success: true,
        message: `Dev mode: Job '${jobName}' simulated successfully`,
        jobName,
        executedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Dev run job error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Sincronizar elegibilidade (desenvolvimento - mock sem on-chain)
  app.post('/api/dev/sync/eligibility', async (req, res) => {
    try {
      // Em dev sem private keys, apenas simular resultado
      const users = await prisma.user.findMany({ where: { active: true } });
      logger.info(`Dev mode: Eligibility sync simulated for ${users.length} active users`);

      res.json({
        success: true,
        updated: users.length,
        message: `Dev mode: Simulated eligibility check for ${users.length} users (no on-chain update)`
      });
    } catch (error) {
      logger.error(`Dev sync eligibility error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 🚀 ENDPOINT AGREGADO - TODOS OS DADOS DE UMA VEZ (OTIMIZADO)
  app.get('/api/dev/user/:address/complete', async (req, res) => {
    try {
      const { address } = req.params;
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: {
          sponsor: { select: { walletAddress: true } },
          referrals: { where: { active: true } }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar todos os dados em paralelo (mais rápido!)
      const [mlmStats, eligibility, referrals] = await Promise.all([
        mlmCalculator.getUserMlmStats(user.id).catch(err => {
          logger.error(`MLM stats error: ${err.message}`);
          return null;
        }),
        mlmUnlock.checkEligibility(user.id).catch(err => {
          logger.error(`Eligibility error: ${err.message}`);
          return null;
        }),
        prisma.user.findMany({
          where: { sponsorAddress: user.walletAddress.toLowerCase() },
          select: {
            walletAddress: true,
            active: true,
            totalEarned: true,
            monthlyVolume: true,
            maxLevel: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }).catch(err => {
          logger.error(`Referrals error: ${err.message}`);
          return [];
        })
      ]);

      // Retornar TUDO de uma vez
      res.json({
        user: {
          ...user,
          directReferralsCount: referrals.length
        },
        mlmStats,
        eligibility,
        referrals
      });
    } catch (error) {
      logger.error(`Dev get complete user data error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Buscar dados do usuário (desenvolvimento - por endereço da carteira)
  app.get('/api/dev/user/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: {
          sponsor: { select: { walletAddress: true } },
          referrals: { where: { active: true } }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get on-chain data
      const onChainData = await contractV10.getUserView(user.walletAddress);

      res.json({
        ...user,
        onChain: onChainData,
        directReferralsCount: user.referrals.length
      });
    } catch (error) {
      logger.error(`Dev get user error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Buscar stats MLM do usuário (desenvolvimento)
  app.get('/api/dev/user/:address/mlm/stats', async (req, res) => {
    try {
      const { address } = req.params;
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stats = await mlmCalculator.getUserMlmStats(user.id);
      res.json(stats);
    } catch (error) {
      logger.error(`Dev get MLM stats error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Buscar elegibilidade do usuário (desenvolvimento)
  app.get('/api/dev/user/:address/eligibility', async (req, res) => {
    try {
      const { address } = req.params;
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const eligibility = await mlmUnlock.checkEligibility(user.id);
      res.json(eligibility);
    } catch (error) {
      logger.error(`Dev check eligibility error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Buscar referrals do usuário (desenvolvimento)
  app.get('/api/dev/user/:address/referrals', async (req, res) => {
    try {
      const { address } = req.params;
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar referrals diretos pelo sponsorAddress
      const referrals = await prisma.user.findMany({
        where: {
          sponsorAddress: user.walletAddress.toLowerCase()
        },
        select: {
          walletAddress: true,
          active: true,
          totalEarned: true,
          monthlyVolume: true,
          maxLevel: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({ referrals });
    } catch (error) {
      logger.error(`Dev get referrals error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Sacar saldo (desenvolvimento - mock sem on-chain)
  app.post('/api/dev/withdraw', async (req, res) => {
    try {
      const { address, amount } = req.body;

      if (!address || !amount) {
        return res.status(400).json({ error: 'address and amount required' });
      }

      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const withdrawAmount = parseFloat(amount);
      const currentBalance = parseFloat(user.internalBalance || '0');

      // Validações
      if (withdrawAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }

      if (withdrawAmount > currentBalance) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Atualizar saldo do usuário
      const newBalance = currentBalance - withdrawAmount;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          internalBalance: newBalance.toFixed(2),
          totalWithdrawn: (parseFloat(user.totalWithdrawn || '0') + withdrawAmount).toFixed(2)
        }
      });

      logger.info(`Dev mode: Withdrawal of $${withdrawAmount} processed for ${address} (no on-chain tx)`);

      res.json({
        success: true,
        amount: withdrawAmount,
        newBalance: newBalance.toFixed(2),
        message: `Dev mode: Withdrawal of $${withdrawAmount} simulated successfully`
      });
    } catch (error) {
      logger.error(`Dev withdraw error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Ativar assinatura usando saldo interno (desenvolvimento - mock)
  app.post('/api/dev/activate-with-balance', async (req, res) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'address required' });
      }

      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const SUBSCRIPTION_PRICE = 19; // $19/mês
      const currentBalance = parseFloat(user.internalBalance || '0');

      // Validar saldo suficiente
      if (currentBalance < SUBSCRIPTION_PRICE) {
        return res.status(400).json({
          error: 'Insufficient balance',
          required: SUBSCRIPTION_PRICE,
          current: currentBalance
        });
      }

      // Calcular nova data de expiração (30 dias a partir de agora ou da expiração atual)
      const now = Math.floor(Date.now() / 1000);
      const currentExpiry = user.subscriptionExpiry || 0;
      const baseTime = currentExpiry > now ? currentExpiry : now;
      const newExpiry = baseTime + (30 * 24 * 60 * 60); // +30 dias

      // Debitar saldo e ativar assinatura
      const newBalance = currentBalance - SUBSCRIPTION_PRICE;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          internalBalance: newBalance.toFixed(2),
          subscriptionExpiry: newExpiry,
          active: true
        }
      });

      logger.info(`Dev mode: Subscription activated for ${address} using internal balance ($${SUBSCRIPTION_PRICE})`);

      res.json({
        success: true,
        subscriptionPrice: SUBSCRIPTION_PRICE,
        newBalance: newBalance.toFixed(2),
        subscriptionExpiry: newExpiry,
        expiresAt: new Date(newExpiry * 1000).toISOString(),
        message: `Subscription activated! Valid for 30 days.`
      });
    } catch (error) {
      logger.error(`Dev activate error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Ativar assinatura de usuário na rede (até 10 níveis) usando saldo interno
  app.post('/api/dev/activate-network-user', async (req, res) => {
    try {
      const { payerAddress, targetAddress } = req.body;

      if (!payerAddress || !targetAddress) {
        return res.status(400).json({ error: 'payerAddress and targetAddress required' });
      }

      // Buscar usuário pagador
      const payer = await prisma.user.findUnique({
        where: { walletAddress: payerAddress.toLowerCase() }
      });

      if (!payer) {
        return res.status(404).json({ error: 'Payer not found' });
      }

      // Buscar usuário alvo
      const target = await prisma.user.findUnique({
        where: { walletAddress: targetAddress.toLowerCase() }
      });

      if (!target) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // Validar que o target está na rede do payer (até 10 níveis)
      let currentUser = target;
      let level = 0;
      let isInNetwork = false;

      while (level < 10 && currentUser.sponsorAddress) {
        level++;
        if (currentUser.sponsorAddress.toLowerCase() === payerAddress.toLowerCase()) {
          isInNetwork = true;
          break;
        }
        // Buscar próximo sponsor
        currentUser = await prisma.user.findUnique({
          where: { walletAddress: currentUser.sponsorAddress.toLowerCase() }
        });
        if (!currentUser) break;
      }

      if (!isInNetwork) {
        return res.status(403).json({
          error: 'User not in your network',
          message: 'You can only activate users in your downline (up to 10 levels)'
        });
      }

      const SUBSCRIPTION_PRICE = 19;
      const payerBalance = parseFloat(payer.internalBalance || '0');

      // Validar saldo suficiente do pagador
      if (payerBalance < SUBSCRIPTION_PRICE) {
        return res.status(400).json({
          error: 'Insufficient balance',
          required: SUBSCRIPTION_PRICE,
          current: payerBalance
        });
      }

      // Calcular nova data de expiração para o target
      const now = Math.floor(Date.now() / 1000);
      const currentExpiry = target.subscriptionExpiry || 0;
      const baseTime = currentExpiry > now ? currentExpiry : now;
      const newExpiry = baseTime + (30 * 24 * 60 * 60);

      // Debitar saldo do pagador
      const newPayerBalance = payerBalance - SUBSCRIPTION_PRICE;
      await prisma.user.update({
        where: { id: payer.id },
        data: {
          internalBalance: newPayerBalance.toFixed(2)
        }
      });

      // Ativar assinatura do target
      await prisma.user.update({
        where: { id: target.id },
        data: {
          subscriptionExpiry: newExpiry,
          active: true
        }
      });

      logger.info(`Dev mode: ${payerAddress} activated subscription for ${targetAddress} (Level ${level}) - $${SUBSCRIPTION_PRICE}`);

      res.json({
        success: true,
        subscriptionPrice: SUBSCRIPTION_PRICE,
        payerNewBalance: newPayerBalance.toFixed(2),
        targetAddress: targetAddress,
        targetSubscriptionExpiry: newExpiry,
        targetExpiresAt: new Date(newExpiry * 1000).toISOString(),
        networkLevel: level,
        message: `Subscription activated for user at level ${level}!`
      });
    } catch (error) {
      logger.error(`Dev activate network user error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Listar usuários inativos na rede (até 10 níveis)
  app.get('/api/dev/network-inactive/:address', async (req, res) => {
    try {
      const { address } = req.params;

      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar todos os usuários da rede (BFS até 10 níveis)
      const networkUsers = [];
      const queue = [{ userId: user.id, level: 0 }];
      const visited = new Set([user.id]);

      while (queue.length > 0) {
        const { userId, level } = queue.shift();

        if (level >= 10) continue;

        // Buscar referrals diretos
        const referrals = await prisma.user.findMany({
          where: {
            sponsorId: userId
          }
        });

        for (const referral of referrals) {
          if (!visited.has(referral.id)) {
            visited.add(referral.id);

            const now = Math.floor(Date.now() / 1000);
            const isActive = referral.subscriptionExpiry > now;

            networkUsers.push({
              walletAddress: referral.walletAddress,
              level: level + 1,
              active: isActive,
              subscriptionExpiry: referral.subscriptionExpiry,
              expiresAt: referral.subscriptionExpiry ? new Date(referral.subscriptionExpiry * 1000).toISOString() : null
            });

            // Adicionar à fila para próximo nível
            queue.push({ userId: referral.id, level: level + 1 });
          }
        }
      }

      // Filtrar apenas inativos
      const inactiveUsers = networkUsers.filter(u => !u.active);

      res.json({
        totalInNetwork: networkUsers.length,
        inactiveCount: inactiveUsers.length,
        inactiveUsers
      });
    } catch (error) {
      logger.error(`Dev get network inactive error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  logger.info('⚠️  Dev routes enabled (no authentication)');
}

// ============================================================================
// GMI INTEGRATION - Expert Advisor Sync (DEPRECATED - use /api/mt5/sync from mt5.js router)
// ============================================================================

// Webhook para receber dados do EA GMI (renomeado para evitar conflito)
app.post('/api/gmi/ea-sync', async (req, res) => {
  try {
    const {
      accountNumber,
      accountHash,
      balance,
      equity,
      monthlyVolume,
      monthlyProfit,
      monthlyLoss,
      totalTrades,
      timestamp
    } = req.body;

    // Validações
    if (!accountNumber || !accountHash) {
      return res.status(400).json({ error: 'accountNumber and accountHash required' });
    }

    // Buscar conta GMI pelo accountHash
    const gmiAccount = await prisma.gmiAccount.findFirst({
      where: { accountHash },
      include: { user: true }
    });

    if (!gmiAccount) {
      return res.status(404).json({ error: 'GMI Account not found' });
    }

    // Atualizar dados em tempo real
    await prisma.gmiAccount.update({
      where: { id: gmiAccount.id },
      data: {
        balance: balance || '0',
        equity: equity || '0',
        monthlyVolume: monthlyVolume || '0',
        monthlyProfit: monthlyProfit || '0',
        monthlyLoss: monthlyLoss || '0',
        totalTrades: totalTrades || 0,
        connected: true,
        lastSyncAt: new Date()
      }
    });

    // Atualizar também o monthlyVolume do usuário (usado para elegibilidade)
    await prisma.user.update({
      where: { id: gmiAccount.userId },
      data: {
        monthlyVolume: monthlyVolume || '0'
      }
    });

    // Criar/atualizar estatística mensal
    const now = new Date();
    const year = now.getFullYear();
    const month = parseInt(`${year}${String(now.getMonth() + 1).padStart(2, '0')}`);

    await prisma.tradingStat.upsert({
      where: {
        gmiAccountId_month_year: {
          gmiAccountId: gmiAccount.id,
          month,
          year
        }
      },
      update: {
        volume: monthlyVolume || '0',
        profit: monthlyProfit || '0',
        loss: monthlyLoss || '0',
        netProfit: (parseFloat(monthlyProfit || '0') - parseFloat(monthlyLoss || '0')).toFixed(2),
        trades: totalTrades || 0,
        winRate: totalTrades > 0
          ? ((parseFloat(monthlyProfit || '0') / totalTrades) * 100).toFixed(2)
          : '0'
      },
      create: {
        gmiAccountId: gmiAccount.id,
        month,
        year,
        volume: monthlyVolume || '0',
        profit: monthlyProfit || '0',
        loss: monthlyLoss || '0',
        netProfit: (parseFloat(monthlyProfit || '0') - parseFloat(monthlyLoss || '0')).toFixed(2),
        trades: totalTrades || 0,
        winRate: totalTrades > 0
          ? ((parseFloat(monthlyProfit || '0') / totalTrades) * 100).toFixed(2)
          : '0'
      }
    });

    logger.info(`MT5 sync successful for account ${accountNumber}`);

    res.json({
      success: true,
      message: 'Data synced successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`MT5 sync error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obter dados MT5 de um usuário
app.get('/api/mt5/stats/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      include: {
        gmiAccount: {
          include: {
            tradingStats: {
              orderBy: { createdAt: 'desc' },
              take: 12 // Últimos 12 meses
            }
          }
        }
      }
    });

    if (!user || !user.gmiAccount) {
      return res.status(404).json({ error: 'MT5 account not found' });
    }

    const account = user.gmiAccount;

    res.json({
      account: {
        accountNumber: account.accountNumber,
        server: account.server,
        platform: account.platform,
        balance: account.balance,
        equity: account.equity,
        monthlyVolume: account.monthlyVolume,
        monthlyProfit: account.monthlyProfit,
        monthlyLoss: account.monthlyLoss,
        totalTrades: account.totalTrades,
        connected: account.connected,
        lastSync: account.lastSyncAt
      },
      history: account.tradingStats.map(stat => ({
        month: `${Math.floor(stat.month / 100)}-${String(stat.month % 100).padStart(2, '0')}`,
        volume: stat.volume,
        profit: stat.profit,
        loss: stat.loss,
        netProfit: stat.netProfit,
        trades: stat.trades,
        winRate: stat.winRate
      }))
    });

  } catch (error) {
    logger.error(`MT5 stats error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dev: Endpoint para simular dados MT5 (para testes sem EA)
console.log('🔧 DEBUG: config.nodeEnv =', config.nodeEnv);
if (config.nodeEnv === 'development') {
  console.log('🔧 DEBUG: Entrando no segundo bloco development (linha 976)');
  app.post('/api/dev/mt5/mock-sync', async (req, res) => {
    try {
      const { address } = req.body;

      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: { gmiAccount: true }
      });

      if (!user || !user.gmiAccount) {
        return res.status(404).json({ error: 'GMI account not found. Link an account first.' });
      }

      // Dados simulados
      const mockData = {
        balance: (Math.random() * 10000 + 5000).toFixed(2),
        equity: (Math.random() * 10500 + 5000).toFixed(2),
        monthlyVolume: (Math.random() * 50000 + 10000).toFixed(2),
        monthlyProfit: (Math.random() * 3000 + 500).toFixed(2),
        monthlyLoss: (Math.random() * 500 + 100).toFixed(2),
        totalTrades: Math.floor(Math.random() * 100 + 20)
      };

      // Atualizar conta
      await prisma.gmiAccount.update({
        where: { id: user.gmiAccount.id },
        data: {
          ...mockData,
          connected: true,
          lastSyncAt: new Date()
        }
      });

      // Atualizar volume do usuário
      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyVolume: mockData.monthlyVolume }
      });

      logger.info(`Mock MT5 data created for ${address}`);

      res.json({
        success: true,
        message: 'Mock data created',
        data: mockData
      });

    } catch (error) {
      logger.error(`Mock MT5 sync error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 🔌 MT5 REAL - DESABILITADO (usuário não quer conexão MT5 externa)
  // ============================================================================

  /*
  // ❌ DESABILITADO - Não usar conexão MT5 Python
  app.get('/api/dev/mt5/account/:address', async (req, res) => {
    try {
      const { address } = req.params;

      logger.info(`[MT5] Buscando dados MT5 para ${address}`);

      // Verificar se usuário existe e tem MT5_WALLET_ADDRESS configurado
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verificar se este endereço está autorizado a buscar dados MT5
      const mt5WalletAddress = process.env.MT5_WALLET_ADDRESS?.toLowerCase();

      if (address.toLowerCase() !== mt5WalletAddress) {
        return res.status(403).json({
          error: 'Not authorized',
          message: 'Only MT5 account owner can access MT5 data'
        });
      }

      // Buscar dados reais do MT5
      const mt5Data = await mt5Service.getMT5AccountData(address);

      if (!mt5Data.success) {
        return res.status(503).json({
          error: 'MT5 connection failed',
          message: mt5Data.error,
          connected: false
        });
      }

      res.json(mt5Data);

    } catch (error) {
      logger.error(`[MT5] Error fetching account data: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/dev/mt5/eligibility/:address - Elegibilidade baseada em MT5 real
  app.get('/api/dev/mt5/eligibility/:address', async (req, res) => {
    try {
      const { address } = req.params;

      logger.info(`[MT5] Calculando elegibilidade MT5 para ${address}`);

      // Buscar usuário e contar referrals diretos
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: {
          referrals: {
            where: { active: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const directReferrals = user.referrals.length;

      // Verificar se este endereço está autorizado
      const mt5WalletAddress = process.env.MT5_WALLET_ADDRESS?.toLowerCase();

      if (address.toLowerCase() !== mt5WalletAddress) {
        // Se não for o dono da conta MT5, retornar elegibilidade padrão
        return res.json({
          eligible: false,
          maxLevel: 1,
          reason: 'Not MT5 account owner',
          volumeRequirement: parseFloat(process.env.MLM_UNLOCK_REQUIREMENT_VOLUME || 5000),
          currentVolume: 0,
          directsRequirement: parseInt(process.env.MLM_UNLOCK_REQUIREMENT_DIRECTS || 5),
          currentDirects: directReferrals,
          source: 'default'
        });
      }

      // Calcular elegibilidade baseada em dados MT5 reais
      const eligibility = await mt5Service.calculateMT5Eligibility(address, directReferrals);

      res.json({
        ...eligibility,
        source: 'mt5_real',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`[MT5] Error calculating eligibility: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/dev/mt5/sync/:address - Sincronizar dados MT5 com banco
  app.post('/api/dev/mt5/sync/:address', async (req, res) => {
    try {
      const { address } = req.params;

      logger.info(`[MT5] Sincronizando dados MT5 para ${address}`);

      // Verificar autorização
      const mt5WalletAddress = process.env.MT5_WALLET_ADDRESS?.toLowerCase();

      if (address.toLowerCase() !== mt5WalletAddress) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar dados MT5
      const mt5Data = await mt5Service.getMT5AccountData(address);

      if (!mt5Data.success) {
        return res.status(503).json({
          error: 'MT5 connection failed',
          message: mt5Data.error
        });
      }

      // Atualizar volume mensal do usuário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyVolume: mt5Data.performance.monthlyVolume.toString()
        }
      });

      logger.info(`[MT5] Volume atualizado: ${mt5Data.performance.monthlyVolume}`);

      res.json({
        success: true,
        message: 'MT5 data synchronized',
        data: {
          monthlyVolume: mt5Data.performance.monthlyVolume,
          balance: mt5Data.account.balance,
          equity: mt5Data.account.equity,
          totalTrades: mt5Data.performance.totalTrades,
          netProfit: mt5Data.performance.netProfit
        }
      });

    } catch (error) {
      logger.error(`[MT5] Sync error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  */

  // 🎭 GMI MOCK - Endpoints que simulam API GMI Edge
  // ============================================================================
  // IMPORTANTE: Estes são dados SIMULADOS para desenvolvimento
  // Quando a API GMI Edge real funcionar, substituir por gmiEdgeClient
  // ============================================================================

  // GET /api/dev/gmi/account/:address - Dados da conta GMI (MOCK)
  app.get('/api/dev/gmi/account/:address', async (req, res) => {
    try {
      const { address } = req.params;

      // Verificar se usuário existe e tem conta GMI conectada
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: {
          gmiAccount: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 🔍 DEBUG CRÍTICO: Ver o que está no banco
      console.log('🔍 [GET-GMI] DEBUG BANCO:');
      console.log('   - user exists:', !!user);
      console.log('   - user.gmiAccount exists:', !!user.gmiAccount);
      console.log('   - user.gmiAccount:', user.gmiAccount);
      if (user.gmiAccount) {
        console.log('   - user.gmiAccount.connected:', user.gmiAccount.connected);
        console.log('   - user.gmiAccount.accountNumber:', user.gmiAccount.accountNumber);
        console.log('   - user.gmiAccount.balance:', user.gmiAccount.balance);
        console.log('   - user.gmiAccount.equity:', user.gmiAccount.equity);
      }

      // Verificar se tem conta GMI conectada
      if (user.gmiAccount && user.gmiAccount.connected) {
        console.log('✅ [GET-GMI] Conta conectada:', user.gmiAccount.accountNumber);

        // 📊 BUSCAR HISTÓRICO MENSAL DA API GMI EDGE EM TEMPO REAL
        let monthlyVolume = 0;
        let monthlyProfit = 0;
        let monthlyLoss = 0;
        let totalTrades = 0;
        let profitTrades = 0;
        let lossTrades = 0;
        let winRate = 0;
        let profitFactor = 0;
        let hasHistory = false;

        try {
          // Fazer login primeiro para obter token
          await gmiEdgeService.login(
            user.gmiAccount.accountNumber,
            user.gmiAccount.encryptedPayload,
            user.gmiAccount.server
          );

          // Buscar histórico de trades (sem filtro de daysBack = histórico completo)
          const tradeHistory = await gmiEdgeService.getTradeHistory(user.gmiAccount.accountNumber);

          if (tradeHistory && tradeHistory.length > 0) {
            // Filtrar trades do mês atual
            const now = Date.now();
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const monthStartTimestamp = startOfMonth.getTime();

            const monthlyTrades = tradeHistory.filter(trade => {
              const tradeDate = trade.TransactionTimestamp ? trade.TransactionTimestamp / 1000000 : 0;
              return tradeDate >= monthStartTimestamp && tradeDate <= now;
            });

            // Filtrar apenas trades fechados
            const closedTrades = monthlyTrades.filter(t =>
              t.TransactionType === 'ORDER_CLOSED' || t.TransactionType === 'POSITION_CLOSED'
            );

            if (closedTrades.length > 0) {
              hasHistory = true;
              totalTrades = closedTrades.length;

              // Separar lucros e perdas
              profitTrades = closedTrades.filter(t => (t.Profit || 0) > 0).length;
              lossTrades = closedTrades.filter(t => (t.Profit || 0) < 0).length;

              // Somar lucros e perdas
              monthlyProfit = closedTrades.reduce((sum, t) => {
                const profit = t.Profit || 0;
                return profit > 0 ? sum + profit : sum;
              }, 0);

              monthlyLoss = closedTrades.reduce((sum, t) => {
                const profit = t.Profit || 0;
                return profit < 0 ? sum + Math.abs(profit) : sum;
              }, 0);

              // Calcular métricas
              winRate = totalTrades > 0 ? (profitTrades / totalTrades) * 100 : 0;
              profitFactor = monthlyLoss > 0 ? monthlyProfit / monthlyLoss : 0;

              console.log(`📊 [GET-GMI] Performance mensal calculada:`, {
                totalTrades,
                profitTrades,
                lossTrades,
                winRate: winRate.toFixed(2) + '%',
                monthlyProfit: monthlyProfit.toFixed(2),
                monthlyLoss: monthlyLoss.toFixed(2),
                profitFactor: profitFactor.toFixed(2)
              });
            }
          }
        } catch (error) {
          console.error(`❌ [GET-GMI] Erro ao buscar histórico mensal:`, error.message);
          // Continuar com valores zerados em caso de erro
        }

        // Retornar dados da conta GMI (usando dados reais do banco)
        const accountData = {
          success: true,
          connected: true,
          hasHistory: hasHistory, // Indica se tem histórico de trades fechados
          account: {
            accountId: user.gmiAccount.accountNumber,
            accountType: user.gmiAccount.platform === 'demo' ? 'Demo' : 'Real',
            currency: 'USD',
            balance: parseFloat(user.gmiAccount.balance),
            equity: parseFloat(user.gmiAccount.equity),
            margin: 0,
            freeMargin: parseFloat(user.gmiAccount.equity),
            marginLevel: 0,
            profit: monthlyProfit - monthlyLoss, // Lucro líquido mensal
            leverage: 100,
            server: user.gmiAccount.server,
            status: 'Active'
          },
          performance: {
            monthlyVolume: monthlyVolume,
            totalTrades: totalTrades,
            profitTrades: profitTrades,
            lossTrades: lossTrades,
            winRate: winRate,
            grossProfit: monthlyProfit,
            grossLoss: monthlyLoss,
            netProfit: monthlyProfit - monthlyLoss,
            profitFactor: profitFactor
          },
          positions: [],
          lastUpdate: user.gmiAccount.lastSyncAt?.toISOString() || new Date().toISOString(),
          source: 'gmi-edge-api' // Dados vieram da API GMI Edge (salvos no banco)
        };

        console.log('📤 [GET-GMI] Retornando dados:', {
          accountId: accountData.account.accountId,
          balance: accountData.account.balance,
          equity: accountData.account.equity,
          source: accountData.source
        });

        res.json(accountData);
      } else {
        // Se não tem conta conectada, retornar estado desconectado
        console.log('❌ [GET-GMI] CAIU NO ELSE! Conta desconectada ou inexistente');
        console.log('   - Motivo: user.gmiAccount =', !!user.gmiAccount, '&& connected =', user.gmiAccount?.connected);

        res.json({
          success: true,
          connected: false,
          account: null,
          performance: null,
          positions: [],
          lastUpdate: new Date().toISOString(),
          source: 'database'
        });
      }

    } catch (error) {
      logger.error(`[GMI] Error fetching account data: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/dev/gmi/eligibility/:address - Elegibilidade baseada em GMI (MOCK)
  app.get('/api/dev/gmi/eligibility/:address', async (req, res) => {
    try {
      const { address } = req.params;

      logger.info(`[GMI MOCK] Calculando elegibilidade para ${address}`);

      // Buscar usuário e contar referrals diretos
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: {
          referrals: {
            where: { active: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const directReferrals = user.referrals.length;

      // Calcular elegibilidade com dados MOCK
      const eligibility = gmiMockService.getMockEligibility(address, directReferrals);

      res.json(eligibility);

    } catch (error) {
      logger.error(`[GMI MOCK] Error calculating eligibility: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/dev/gmi/history/:address - Histórico de trades (MOCK)
  app.get('/api/dev/gmi/history/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const { days = 30 } = req.query;

      logger.info(`[GMI MOCK] Buscando histórico (${days} dias) para ${address}`);

      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Retornar histórico MOCK
      const history = gmiMockService.getMockTradeHistory(parseInt(days));

      res.json(history);

    } catch (error) {
      logger.error(`[GMI MOCK] Error fetching history: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/dev/gmi/symbols - Símbolos disponíveis (MOCK)
  app.get('/api/dev/gmi/symbols', async (req, res) => {
    try {
      logger.info(`[GMI MOCK] Buscando símbolos disponíveis`);

      const symbols = gmiMockService.getMockSymbols();

      res.json(symbols);

    } catch (error) {
      logger.error(`[GMI MOCK] Error fetching symbols: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/dev/gmi/sync/:address - Sincronizar dados GMI com banco (MOCK)
  app.post('/api/dev/gmi/sync/:address', async (req, res) => {
    try {
      const { address } = req.params;

      logger.info(`[GMI MOCK] Sincronizando dados para ${address}`);

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar dados MOCK
      const mockData = gmiMockService.getMockAccountData(address);

      // Atualizar volume mensal do usuário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyVolume: mockData.performance.monthlyVolume.toString()
        }
      });

      logger.info(`[GMI MOCK] Volume atualizado: ${mockData.performance.monthlyVolume}`);

      res.json({
        success: true,
        message: 'GMI data synchronized (MOCK)',
        data: {
          monthlyVolume: mockData.performance.monthlyVolume,
          balance: mockData.account.balance,
          equity: mockData.account.equity,
          totalTrades: mockData.performance.totalTrades,
          netProfit: mockData.performance.netProfit
        },
        source: 'mock'
      });

    } catch (error) {
      logger.error(`[GMI MOCK] Sync error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  console.log('🔧 DEBUG: Registrando rota /api/dev/link-gmi');

  // POST /api/dev/link-gmi - Conectar conta GMI Edge
  app.post('/api/dev/link-gmi', async (req, res) => {
    try {
      const { address, botId, password, server } = req.body;

      console.log('🔗 [LINK-GMI] Conectando conta GMI Edge', botId, 'para', address?.slice(0,6));

      if (!address || !botId || !password) {
        console.log('❌ [LINK-GMI] Dados faltando!');
        return res.status(400).json({
          error: 'address, botId and password are required'
        });
      }

      logger.info(`[GMI] Linking GMI Edge account ${botId} for ${address}`);

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        console.log('❌ [LINK-GMI] Usuário não encontrado!');
        return res.status(404).json({ error: 'User not found' });
      }

      // Validar credenciais na API GMI Edge
      let gmiData;
      let useRealApi = true;

      try {
        logger.info(`[GMI] Validando credenciais GMI Edge e buscando dados...`);
        gmiData = await gmiEdgeService.validateAndConnectWithHistory(
          botId,
          password,
          server || 'GMI Trading Platform Demo'
        );
        logger.info(`[GMI] ✅ Credenciais GMI Edge válidas! BotId: ${gmiData.accountInfo.Login}, Histórico: ${gmiData.metrics.hasHistory ? 'SIM' : 'NÃO'}`);
      } catch (gmiError) {
        logger.error(`[GMI] ❌ Falha na validação GMI Edge: ${gmiError.message}`);

        // Em desenvolvimento, permitir conexão com dados mock se a API falhar
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`[GMI] ⚠️ API GMI Edge indisponível. Usando modo MOCK para desenvolvimento.`);
          useRealApi = false;

          // Gerar dados mock para desenvolvimento
          const mockData = gmiMockService.getMockAccountData(address);
          gmiData = {
            accountInfo: {
              Login: parseInt(botId),
              Name: `GMI Edge Demo ${botId}`,
              IsDemo: true,
              IsTradeEnabled: true
            },
            accountState: {
              Balance: mockData.account.balance,
              Equity: mockData.account.equity,
              Profit: mockData.performance.grossProfit,
              OpenPositions: []
            }
          };
        } else {
          // Em produção, sempre rejeitar se a API falhar
          return res.status(401).json({
            error: gmiError.message || 'Credenciais GMI Edge inválidas. Verifique o BotId, senha e servidor.'
          });
        }
      }

      // Criar hash da conta GMI Edge
      const accountHash = crypto.createHash('sha256').update(`${botId}:${server}`).digest('hex');

      // Extrair dados da API GMI Edge
      const accountInfo = gmiData.accountInfo;
      const accountStateData = gmiData.accountState;

      // A API retorna { AccountState: {...}, OrderStates: [...] }
      const accountState = accountStateData.AccountState || accountStateData;
      const orderStates = accountStateData.OrderStates || [];

      // Extrair métricas calculadas
      const metrics = gmiData.metrics || {
        monthlyVolume: 0,
        monthlyProfit: 0,
        monthlyLoss: 0,
        totalTrades: orderStates.length || 0,
        winRate: 0,
        hasHistory: false
      };

      // Criar ou atualizar GmiAccount com dados reais e métricas GMI Edge
      const gmiAccount = await prisma.gmiAccount.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          accountNumber: botId.toString(),
          server: server || 'GMI Trading Platform Demo',
          platform: 'GMI Edge',
          encryptedPayload: password, // TODO: Criptografar em produção
          accountHash,
          connected: true,
          balance: accountState.Balance?.toString() || '0',
          equity: accountState.Equity?.toString() || '0',
          monthlyVolume: metrics.monthlyVolume.toString(),
          monthlyProfit: metrics.monthlyProfit.toString(),
          monthlyLoss: metrics.monthlyLoss.toString(),
          totalTrades: metrics.totalTrades,
          lastSyncAt: new Date()
        },
        update: {
          accountNumber: botId.toString(),
          server: server || 'GMI Trading Platform Demo',
          platform: 'GMI Edge',
          encryptedPayload: password, // TODO: Criptografar em produção
          accountHash,
          connected: true,
          balance: accountState.Balance?.toString() || '0',
          equity: accountState.Equity?.toString() || '0',
          monthlyVolume: metrics.monthlyVolume.toString(),
          monthlyProfit: metrics.monthlyProfit.toString(),
          monthlyLoss: metrics.monthlyLoss.toString(),
          totalTrades: metrics.totalTrades,
          lastSyncAt: new Date()
        }
      });

      console.log('✅ [LINK-GMI] Salvo! Balance:', gmiAccount.balance);

      if (useRealApi) {
        logger.info(`[GMI] ✅ Account ${botId} linked successfully with REAL data from GMI Edge API`);
      } else {
        logger.info(`[GMI] ⚠️ Account ${botId} linked with MOCK data (API unavailable)`);
      }

      res.json({
        success: true,
        message: useRealApi
          ? 'GMI account linked successfully'
          : 'Conta conectada em modo desenvolvimento (API GMI indisponível)',
        data: {
          accountNumber: botId,
          accountName: accountInfo.Name,
          isDemo: accountInfo.IsDemo,
          server: server || 'GMIEdge-Live',
          platform: 'GMI Edge',
          connected: true,
          balance: accountState.Balance,
          equity: accountState.Equity,
          source: useRealApi ? 'gmi-edge-api' : 'mock-fallback'
        }
      });

    } catch (error) {
      logger.error(`[GMI] Link account error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/dev/disconnect-gmi - Desconectar conta GMI
  app.post('/api/dev/disconnect-gmi', async (req, res) => {
    try {
      const { address } = req.body;

      console.log('🔌 [DISCONNECT-GMI] Desconectando conta para', address?.slice(0,6));

      if (!address) {
        console.log('❌ [DISCONNECT-GMI] Endereço não fornecido!');
        return res.status(400).json({
          error: 'address is required'
        });
      }

      logger.info(`[GMI] Disconnecting account for ${address}`);

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() }
      });

      if (!user) {
        console.log('❌ [DISCONNECT-GMI] Usuário não encontrado!');
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar conta GMI
      const gmiAccount = await prisma.gmiAccount.findUnique({
        where: { userId: user.id }
      });

      if (!gmiAccount) {
        console.log('⚠️ [DISCONNECT-GMI] Nenhuma conta GMI para desconectar');
        return res.json({
          success: true,
          message: 'No GMI account connected',
          alreadyDisconnected: true
        });
      }

      // Remover tokens do cache do gmiEdgeService
      if (gmiAccount.accountNumber) {
        gmiEdgeService.logout(gmiAccount.accountNumber);
        console.log('🔑 [DISCONNECT-GMI] Tokens removidos do cache');
      }

      // Atualizar conta GMI para desconectada
      await prisma.gmiAccount.update({
        where: { userId: user.id },
        data: {
          connected: false,
          lastSyncAt: new Date()
        }
      });

      console.log('✅ [DISCONNECT-GMI] Conta desconectada com sucesso!');

      logger.info(`[GMI] ✅ Account ${gmiAccount.accountNumber} disconnected successfully`);

      res.json({
        success: true,
        message: 'GMI account disconnected successfully',
        data: {
          accountNumber: gmiAccount.accountNumber,
          connected: false
        }
      });

    } catch (error) {
      logger.error(`[GMI] Disconnect account error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/dev/gmi/weekly-profit/:address - Buscar lucro semanal
  app.get('/api/dev/gmi/weekly-profit/:address', async (req, res) => {
    try {
      const { address } = req.params;

      console.log('🔍 [WEEKLY-PROFIT] Iniciando busca para:', address.slice(0, 6));
      logger.info(`[GMI] Buscando lucro semanal para ${address}`);

      // Buscar usuário e conta GMI
      const user = await prisma.user.findUnique({
        where: { walletAddress: address.toLowerCase() },
        include: {
          gmiAccount: true
        }
      });

      if (!user) {
        console.log('❌ [WEEKLY-PROFIT] Usuário não encontrado');
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('✅ [WEEKLY-PROFIT] Usuário encontrado');
      console.log('   - gmiAccount exists:', !!user.gmiAccount);
      console.log('   - connected:', user.gmiAccount?.connected);

      if (!user.gmiAccount || !user.gmiAccount.connected) {
        console.log('❌ [WEEKLY-PROFIT] Conta GMI não conectada');
        return res.status(400).json({
          error: 'GMI account not connected',
          connected: false
        });
      }

      const accountNumber = user.gmiAccount.accountNumber;
      const server = user.gmiAccount.server;
      const password = user.gmiAccount.encryptedPayload; // TODO: Decrypt in production

      console.log('📋 [WEEKLY-PROFIT] Dados da conta:');
      console.log('   - accountNumber:', accountNumber);
      console.log('   - server:', server);
      console.log('   - password exists:', !!password);

      // Buscar lucro semanal via GMI Edge Service
      let weeklyData;
      let useRealApi = true;

      try {
        console.log('🔑 [WEEKLY-PROFIT] Verificando token no cache...');
        // Verificar se o token está no cache
        const cached = gmiEdgeService.tokenCache.get(accountNumber);
        console.log('   - Token no cache:', !!cached);

        if (!cached) {
          // Token não encontrado - fazer login automático
          console.log('⚠️ [WEEKLY-PROFIT] Token não encontrado. Fazendo login automático...');
          logger.info(`[GMI] Token não encontrado no cache. Fazendo login automático...`);

          try {
            await gmiEdgeService.login(accountNumber, password, server);
            console.log('✅ [WEEKLY-PROFIT] Login automático bem-sucedido!');
            logger.info(`[GMI] ✅ Login automático bem-sucedido!`);
          } catch (loginError) {
            console.error('❌ [WEEKLY-PROFIT] Falha no login automático:', loginError.message);
            logger.error(`[GMI] ❌ Falha no login automático: ${loginError.message}`);
            throw new Error('Token não encontrado. Falha no login automático.');
          }
        } else {
          console.log('✅ [WEEKLY-PROFIT] Token encontrado no cache');
        }

        // Buscar lucro semanal
        console.log('📊 [WEEKLY-PROFIT] Buscando dados de lucro semanal...');
        weeklyData = await gmiEdgeService.getWeeklyProfit(accountNumber);
        console.log('✅ [WEEKLY-PROFIT] Dados retornados:', weeklyData);
        console.log('   - weeklyNetProfit:', weeklyData?.weeklyNetProfit);

        // Garantir que todos os campos existam com valores padrão
        weeklyData = {
          weeklyVolume: weeklyData?.weeklyVolume ?? 0,
          weeklyProfit: weeklyData?.weeklyProfit ?? 0,
          weeklyLoss: weeklyData?.weeklyLoss ?? 0,
          weeklyNetProfit: weeklyData?.weeklyNetProfit ?? 0,
          totalTrades: weeklyData?.totalTrades ?? 0,
          profitableTrades: weeklyData?.profitableTrades ?? 0,
          losingTrades: weeklyData?.losingTrades ?? 0,
          winRate: weeklyData?.winRate ?? 0,
          profitFactor: weeklyData?.profitFactor ?? 0,
          hasHistory: weeklyData?.hasHistory ?? false,
          openPositions: weeklyData?.openPositions ?? 0
        };

        console.log('✅ [WEEKLY-PROFIT] Dados validados:', weeklyData);
        logger.info(`[GMI] ✅ Lucro semanal obtido da API: $${weeklyData.weeklyNetProfit.toFixed(2)}`);
      } catch (gmiError) {
        console.error('❌ [WEEKLY-PROFIT] Erro ao buscar lucro semanal:', gmiError.message);
        console.error('❌ [WEEKLY-PROFIT] Stack:', gmiError.stack);
        logger.error(`[GMI] ❌ Erro ao buscar lucro semanal: ${gmiError.message}`);

        // Em desenvolvimento, retornar dados mock se a API falhar
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`[GMI] ⚠️ Usando dados MOCK para desenvolvimento`);
          useRealApi = false;

          // Gerar dados mock baseados no balance atual
          const balance = parseFloat(user.gmiAccount.balance || '10000');
          const mockWeeklyProfit = (balance * 0.02) * (Math.random() * 0.5 + 0.75); // 1.5% a 2.5% do balance

          weeklyData = {
            weeklyVolume: balance * 5,
            weeklyProfit: mockWeeklyProfit > 0 ? mockWeeklyProfit : 0,
            weeklyLoss: mockWeeklyProfit < 0 ? Math.abs(mockWeeklyProfit) : mockWeeklyProfit * 0.3,
            weeklyNetProfit: mockWeeklyProfit,
            totalTrades: Math.floor(Math.random() * 30) + 10,
            profitableTrades: Math.floor(Math.random() * 20) + 5,
            losingTrades: Math.floor(Math.random() * 10),
            winRate: 55 + Math.random() * 20,
            profitFactor: 1.5 + Math.random() * 1.5,
            hasHistory: true,
            openPositions: Math.floor(Math.random() * 3)
          };
        } else {
          throw gmiError;
        }
      }

      // Calcular distribuição (65% cliente, 35% empresa, 25% MLM do cliente)
      const clientShare = weeklyData.weeklyNetProfit * 0.65;
      const companyFee = weeklyData.weeklyNetProfit * 0.35;
      const mlmPool = clientShare * 0.25;

      res.json({
        success: true,
        data: {
          accountNumber: accountNumber,
          period: {
            type: 'weekly',
            days: 7,
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          metrics: {
            weeklyVolume: weeklyData.weeklyVolume,
            weeklyProfit: weeklyData.weeklyProfit,
            weeklyLoss: weeklyData.weeklyLoss,
            weeklyNetProfit: weeklyData.weeklyNetProfit,
            totalTrades: weeklyData.totalTrades,
            profitableTrades: weeklyData.profitableTrades,
            losingTrades: weeklyData.losingTrades,
            winRate: weeklyData.winRate,
            profitFactor: weeklyData.profitFactor,
            hasHistory: weeklyData.hasHistory,
            openPositions: weeklyData.openPositions
          },
          distribution: {
            grossProfit: weeklyData.weeklyNetProfit,
            clientShare: clientShare,
            companyFee: companyFee,
            mlmPool: mlmPool,
            percentages: {
              client: 65,
              company: 35,
              mlm: 16.25  // 25% do cliente = 16.25% do total
            }
          },
          source: useRealApi ? 'gmi-edge-api' : 'mock-fallback'
        }
      });

    } catch (error) {
      console.error('💥 [WEEKLY-PROFIT] ERRO FATAL:', error.message);
      console.error('💥 [WEEKLY-PROFIT] Stack completo:', error.stack);
      logger.error(`[GMI] Weekly profit error: ${error.message}`);
      logger.error(`[GMI] Stack: ${error.stack}`);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
}

// ============================================================================
// WEBHOOK GMI (MOCK - Sem HMAC por simplicidade)
// ============================================================================

app.post('/api/webhook/gmi/pnl', async (req, res) => {
  try {
    logger.info('GMI PnL webhook received');

    const { performances } = req.body; // [{walletAddress, profitUsd}]

    if (!Array.isArray(performances)) {
      return res.status(400).json({ error: 'performances array required' });
    }

    // Para cada performance, calcular MLM e creditar
    for (const perf of performances) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: perf.walletAddress.toLowerCase() }
      });

      if (!user) {
        logger.warn(`User not found: ${perf.walletAddress}`);
        continue;
      }

      // Calcular split (65% cliente / 35% empresa)
      const clientShare = perf.profitUsd * 0.65;
      const companyShare = perf.profitUsd * 0.35;

      // Calcular MLM (25% do lucro total = 71.43% da company share)
      const mlmResult = await mlmCalculator.calculateCommissions(user.id, perf.profitUsd);

      // Salvar performance record
      await prisma.performanceRecord.create({
        data: {
          userId: user.id,
          profitUsd: perf.profitUsd,
          feeUsd: companyShare,
          clientShare,
          mlmPool: mlmResult.summary.mlmPool,
          companyShare: companyShare - mlmResult.summary.mlmPool,
          periodStart: new Date(),
          periodEnd: new Date(),
          processed: false
        }
      });

      // Salvar comissões MLM
      for (const comm of mlmResult.commissions) {
        await prisma.mlmCommission.create({
          data: {
            userId: comm.userId,
            fromUserId: user.id,
            performanceId: 'temp', // TODO: usar ID real
            level: comm.level,
            percentage: comm.percentage,
            amount: comm.amount,
            paid: false
          }
        });
      }
    }

    res.json({ success: true, processed: performances.length });
  } catch (error) {
    logger.error(`GMI webhook error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// BLOCKCHAIN ROUTES (PROOF + RULEBOOK)
// ============================================================================

app.use('/api/blockchain', blockchainRouter);
// app.use('/api/database', databaseRouter); // ✅ Database debug routes - TEMPORARILY DISABLED
app.use('/api/simulations', simulationsRouter); // ✅ Simulations tracking routes
app.use('/api/mlm-tree', mlmTreeRouter); // ✅ MLM Tree visualization routes
app.use('/api/admin', adminRouter); // ✅ Admin routes
app.use('/api/mt5', mt5Router); // ✅ MT5 multi-account system routes

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`✅ iDeepX Backend V10 started on port ${PORT}`);
  logger.info(`   Environment: ${config.nodeEnv}`);
  logger.info(`   Network: ${config.isTestnet() ? 'BSC Testnet' : 'BSC Mainnet'}`);
  logger.info(`   Contract: ${config.contractV10Address}`);

  // Iniciar job scheduler
  jobScheduler.start();

  // Iniciar Weekly Proof automation
  weeklyProofJobs.startWeeklyProofJobs();

  logger.info(`   Ready for requests! 🚀`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  jobScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  jobScheduler.stop();
  process.exit(0);
});

export default app;
