// ================================================================================
// ROTAS - MLM TREE
// ================================================================================
// Endpoints para buscar estrutura de árvore unilevel MLM

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ================================================================================
// GET /api/mlm-tree/:walletAddress
// ================================================================================
// Retorna a árvore MLM completa do usuário (até 10 níveis)

router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { maxDepth = 10 } = req.query;

    console.log(`📊 [MLM-TREE] Buscando árvore para: ${walletAddress}`);

    // Buscar usuário root
    const rootUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!rootUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Função recursiva para construir a árvore
    const buildTree = async (userId, currentDepth = 0, maxDepth = 10) => {
      if (currentDepth >= maxDepth) {
        return null;
      }

      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          referrals: {
            where: { simulationId: null }, // Apenas usuários reais
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!user) return null;

      // Contar rede total (recursivo)
      const countNetwork = async (uid, depth = 0, maxD = 10) => {
        if (depth >= maxD) return 0;

        const refs = await prisma.user.findMany({
          where: {
            sponsorId: uid,
            simulationId: null
          },
          select: { id: true }
        });

        let total = refs.length;
        for (const ref of refs) {
          total += await countNetwork(ref.id, depth + 1, maxD);
        }

        return total;
      };

      const networkSize = await countNetwork(user.id);

      // Construir nó da árvore
      const node = {
        id: user.id,
        walletAddress: user.walletAddress,
        level: currentDepth,
        directReferrals: user.referrals.length,
        networkSize: networkSize,
        active: user.active,
        maxLevel: user.maxLevel,
        monthlyVolume: parseFloat(user.monthlyVolume || '0'),
        totalEarned: parseFloat(user.totalEarned || '0'),
        internalBalance: parseFloat(user.internalBalance || '0'),
        subscriptionActive: user.subscriptionExpiry > Math.floor(Date.now() / 1000),
        children: []
      };

      // Recursivamente buscar filhos
      for (const referral of user.referrals) {
        const childNode = await buildTree(referral.id, currentDepth + 1, maxDepth);
        if (childNode) {
          node.children.push(childNode);
        }
      }

      return node;
    };

    // Construir árvore completa
    console.log(`🌳 [MLM-TREE] Construindo árvore (max depth: ${maxDepth})...`);
    const tree = await buildTree(rootUser.id, 0, parseInt(maxDepth));

    // Calcular estatísticas da árvore
    const calculateStats = (node) => {
      let totalUsers = 1;
      let totalActive = node.active ? 1 : 0;
      let totalVolume = node.monthlyVolume;
      let totalEarnings = node.totalEarned;
      let maxDepth = 0;

      const traverse = (n, depth) => {
        if (depth > maxDepth) maxDepth = depth;

        for (const child of n.children) {
          totalUsers++;
          if (child.active) totalActive++;
          totalVolume += child.monthlyVolume;
          totalEarnings += child.totalEarned;
          traverse(child, depth + 1);
        }
      };

      traverse(node, 0);

      return {
        totalUsers,
        totalActive,
        totalVolume: totalVolume.toFixed(2),
        totalEarnings: totalEarnings.toFixed(2),
        maxDepth
      };
    };

    const stats = calculateStats(tree);

    console.log(`✅ [MLM-TREE] Árvore construída: ${stats.totalUsers} usuários, ${stats.maxDepth} níveis`);

    res.json({
      success: true,
      data: {
        tree,
        stats
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/mlm-tree/:walletAddress:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
