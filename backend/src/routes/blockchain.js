// ================================================================================
// ROTAS API - BLOCKCHAIN (PROOF + RULEBOOK)
// ================================================================================
// Endpoints para interagir com contratos Proof e Rulebook

import { Router } from 'express';
import {
  getRulebookInfo,
  verifyPlanHash,
  getProofInfo,
  getWeeklyProof,
  getLatestProofs,
  isWeekSubmitted,
  submitWeeklyProof,
  finalizeWeeklyProof
} from '../blockchain/proof.js';
import { getSnapshot } from '../services/ipfsService.js';

const router = Router();

// ================================================================================
// 1. RULEBOOK ENDPOINTS (READ-ONLY)
// ================================================================================

/**
 * GET /api/blockchain/rulebook
 * Buscar informações do plano de comissões
 */
router.get('/rulebook', async (req, res) => {
  try {
    const info = await getRulebookInfo();

    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('❌ Erro ao buscar Rulebook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar informações do Rulebook',
      details: error.message
    });
  }
});

/**
 * POST /api/blockchain/rulebook/verify
 * Verificar hash do plano (validação de integridade)
 * Body: { jsonContent: "..." }
 */
router.post('/rulebook/verify', async (req, res) => {
  try {
    const { jsonContent } = req.body;

    if (!jsonContent) {
      return res.status(400).json({
        success: false,
        error: 'jsonContent é obrigatório'
      });
    }

    const verification = await verifyPlanHash(jsonContent);

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('❌ Erro ao verificar hash:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar hash do plano',
      details: error.message
    });
  }
});

// ================================================================================
// 2. PROOF CONTRACT INFO (READ-ONLY)
// ================================================================================

/**
 * GET /api/blockchain/proof
 * Buscar informações básicas do Proof contract
 */
router.get('/proof', async (req, res) => {
  try {
    const info = await getProofInfo();

    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('❌ Erro ao buscar Proof info:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar informações do Proof contract',
      details: error.message
    });
  }
});

// ================================================================================
// 3. WEEKLY PROOFS (READ)
// ================================================================================

/**
 * GET /api/blockchain/proofs
 * Buscar últimas N provas
 * Query params: ?limit=10
 */
router.get('/proofs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit deve estar entre 1 e 100'
      });
    }

    const proofs = await getLatestProofs(limit);

    res.json({
      success: true,
      data: {
        count: proofs.length,
        proofs
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar provas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar provas',
      details: error.message
    });
  }
});

/**
 * GET /api/blockchain/proofs/:week
 * Buscar prova de uma semana específica
 */
router.get('/proofs/:week', async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.week);

    if (!weekNumber || weekNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Número da semana inválido'
      });
    }

    const proof = await getWeeklyProof(weekNumber);

    // Se não foi submetida ainda, retornar 404
    if (proof.weekNumber === 0) {
      return res.status(404).json({
        success: false,
        error: `Prova da semana ${weekNumber} não encontrada`
      });
    }

    res.json({
      success: true,
      data: proof
    });
  } catch (error) {
    console.error('❌ Erro ao buscar prova:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar prova',
      details: error.message
    });
  }
});

/**
 * GET /api/blockchain/proofs/:week/status
 * Verificar se semana foi submetida
 */
router.get('/proofs/:week/status', async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.week);

    if (!weekNumber || weekNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Número da semana inválido'
      });
    }

    const submitted = await isWeekSubmitted(weekNumber);

    res.json({
      success: true,
      data: {
        weekNumber,
        submitted,
        status: submitted ? 'finalized' : 'pending'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status da semana',
      details: error.message
    });
  }
});

/**
 * GET /api/blockchain/ipfs/:hash
 * Buscar snapshot completo do IPFS
 */
router.get('/ipfs/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash || !hash.startsWith('Qm')) {
      return res.status(400).json({
        success: false,
        error: 'IPFS hash inválido'
      });
    }

    const snapshot = await getSnapshot(hash);

    res.json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    console.error('❌ Erro ao buscar snapshot do IPFS:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar snapshot do IPFS',
      details: error.message
    });
  }
});

// ================================================================================
// 4. SUBMIT & FINALIZE (WRITE - PROTECTED)
// ================================================================================

/**
 * POST /api/blockchain/proofs/submit
 * Submeter prova semanal (APENAS BACKEND/OWNER)
 *
 * Body: {
 *   weekNumber: 1,
 *   ipfsHash: "Qm...",
 *   totalUsers: 100,
 *   totalCommissions: "1250.50",
 *   totalProfits: "10000.00"
 * }
 *
 * TODO: Adicionar autenticação (JWT, API Key, etc)
 */
router.post('/proofs/submit', async (req, res) => {
  try {
    const { weekNumber, ipfsHash, totalUsers, totalCommissions, totalProfits } = req.body;

    // Validações
    if (!weekNumber || !ipfsHash || !totalUsers || !totalCommissions || !totalProfits) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios',
        required: ['weekNumber', 'ipfsHash', 'totalUsers', 'totalCommissions', 'totalProfits']
      });
    }

    if (weekNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'weekNumber deve ser >= 1'
      });
    }

    if (totalUsers < 0 || totalCommissions < 0 || totalProfits < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valores negativos não são permitidos'
      });
    }

    // Verificar se já foi submetida
    const alreadySubmitted = await isWeekSubmitted(weekNumber);
    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        error: `Semana ${weekNumber} já foi submetida e finalizada`
      });
    }

    // Submeter prova
    const result = await submitWeeklyProof({
      weekNumber,
      ipfsHash,
      totalUsers,
      totalCommissions,
      totalProfits
    });

    res.json({
      success: true,
      message: `Prova da semana ${weekNumber} submetida com sucesso`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao submeter prova:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao submeter prova',
      details: error.message
    });
  }
});

/**
 * POST /api/blockchain/proofs/:week/finalize
 * Finalizar prova semanal (APENAS BACKEND/OWNER)
 *
 * TODO: Adicionar autenticação (JWT, API Key, etc)
 */
router.post('/proofs/:week/finalize', async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.week);

    if (!weekNumber || weekNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Número da semana inválido'
      });
    }

    // Verificar se já foi finalizada
    const alreadyFinalized = await isWeekSubmitted(weekNumber);
    if (alreadyFinalized) {
      return res.status(409).json({
        success: false,
        error: `Semana ${weekNumber} já está finalizada`
      });
    }

    // Finalizar prova
    const result = await finalizeWeeklyProof(weekNumber);

    res.json({
      success: true,
      message: `Prova da semana ${weekNumber} finalizada com sucesso`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar prova:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao finalizar prova',
      details: error.message
    });
  }
});

// ================================================================================
// 5. HEALTH CHECK
// ================================================================================

/**
 * GET /api/blockchain/health
 * Verificar saúde da conexão blockchain
 */
router.get('/health', async (req, res) => {
  try {
    const [rulebookInfo, proofInfo] = await Promise.all([
      getRulebookInfo(),
      getProofInfo()
    ]);

    res.json({
      success: true,
      message: 'Blockchain connection OK',
      data: {
        rulebook: {
          address: rulebookInfo.address,
          ipfsCid: rulebookInfo.ipfsCid,
          version: rulebookInfo.version
        },
        proof: {
          address: proofInfo.address,
          owner: proofInfo.owner,
          backend: proofInfo.backend,
          paused: proofInfo.paused,
          totalProofs: proofInfo.totalProofs
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(503).json({
      success: false,
      error: 'Blockchain connection failed',
      details: error.message
    });
  }
});

// ================================================================================
// EXPORTAR ROUTER
// ================================================================================

export default router;
