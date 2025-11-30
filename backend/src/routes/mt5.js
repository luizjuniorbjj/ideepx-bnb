// ================================================================================
// ROTAS - MT5 (Multi-Account Trading System)
// ================================================================================
// Endpoints para gerenciamento de contas MT5

import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from 'child_process';

const router = express.Router();
const prisma = new PrismaClient();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================================================================================
// MT5 CONFIG CLEANUP HELPER
// ================================================================================
// Remove configurações de conta MT5 do desktop quando cliente troca de conta

function cleanMT5Config(serverName) {
  if (!serverName) {
    console.log('⚠️  [cleanMT5Config] ServerName vazio, pulando limpeza MT5');
    return false;
  }

  console.log(`🔧 [cleanMT5Config] Limpando configuração MT5 para servidor: ${serverName}`);

  const scriptPath = path.join(__dirname, '..', '..', 'force-remove-mt5-account.ps1');

  try {
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -ServerName "${serverName}"`;

    console.log(`   Executando: ${command}`);

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(output);
    console.log(`✅ [cleanMT5Config] Configuração do servidor ${serverName} removida com sucesso`);

    return true;

  } catch (error) {
    console.error(`❌ [cleanMT5Config] Erro ao limpar configuração MT5:`, error.message);
    console.log(`⚠️  [cleanMT5Config] Continuando mesmo com erro (MT5 pode não estar instalado)`);

    return false;
  }
}

// ================================================================================
// ENCRYPTION HELPERS (AES-256 compatible with Python Fernet)
// ================================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

function encryptPassword(password) {
  try {
    // Simples encryption com AES-256-CBC (compatível com Fernet pattern)
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(ENCRYPTION_KEY, 'base64');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key.slice(0, 32), iv);
    let encrypted = cipher.update(password, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Formato: IV + encrypted (similar ao Fernet)
    return Buffer.concat([iv, Buffer.from(encrypted, 'base64')]).toString('base64');
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    throw new Error('Failed to encrypt password');
  }
}

function decryptPassword(encryptedData) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(ENCRYPTION_KEY, 'base64');

    // Decode base64
    const buffer = Buffer.from(encryptedData, 'base64');

    // Extrair IV (primeiros 16 bytes) e dados criptografados
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16);

    const decipher = crypto.createDecipheriv(algorithm, key.slice(0, 32), iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar senha:', error);
    throw new Error('Failed to decrypt password');
  }
}

// ================================================================================
// POST /api/mt5/connect
// ================================================================================
// Conecta nova conta MT5

router.post('/connect', async (req, res) => {
  try {
    const { walletAddress, accountAlias, brokerName, login, password, server, platform } = req.body;

    console.log(`🔗 [POST /mt5/connect] Conectando conta MT5 para ${walletAddress}`);

    // Validações
    if (!walletAddress || !login || !password || !server) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['walletAddress', 'login', 'password', 'server']
      });
    }

    // ============================================================================
    // VALIDAÇÃO: IMPEDIR CONTA MT5 DUPLICADA (MESMO LOGIN + SERVIDOR)
    // ============================================================================
    // Verifica se já existe outra conta com o mesmo login + servidor
    // (independente de qual carteira seja)

    const duplicateAccount = await prisma.tradingAccount.findFirst({
      where: {
        login: login,
        server: server
      },
      include: {
        user: {
          select: {
            walletAddress: true
          }
        }
      }
    });

    if (duplicateAccount) {
      // Se encontrou conta duplicada E não é do usuário atual
      if (duplicateAccount.user.walletAddress !== walletAddress) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🚨 ALERTA ANTI-FRAUDE - TENTATIVA DE DUPLICAÇÃO DE CONTA MT5`);
        console.log(`${'='.repeat(80)}`);
        console.log(`❌ Conta MT5: ${login}@${server}`);
        console.log(`❌ Já registrada por: ${duplicateAccount.user.walletAddress}`);
        console.log(`❌ Tentativa de registro por: ${walletAddress}`);
        console.log(`⚠️  AÇÃO: Bloqueio automático - Tentativa de fraude detectada`);
        console.log(`⚠️  MOTIVO: Uma conta MT5 só pode estar conectada a UMA carteira`);
        console.log(`⚠️  Esta tentativa foi BLOQUEADA e registrada no sistema`);
        console.log(`${'='.repeat(80)}\n`);

        return res.status(409).json({
          error: 'DUPLICATE_MT5_ACCOUNT',
          message: '🚨 ALERTA ANTI-FRAUDE: Esta conta MT5 já está registrada por outro cliente',
          details: {
            login: login,
            server: server,
            reason: 'Cada conta MT5 só pode estar conectada a UMA carteira. Tentativa de duplicação é considerada FRAUDE e resultará em BLOQUEIO PERMANENTE.',
            fraudAttempt: true,
            attemptedBy: walletAddress,
            registeredTo: duplicateAccount.user.walletAddress.substring(0, 10) + '...' // Mostra apenas início por privacidade
          }
        });
      } else {
        // É a mesma carteira tentando reconectar - OK, vai substituir a conta antiga
        console.log(`ℹ️ [POST /mt5/connect] Carteira ${walletAddress} reconectando sua própria conta ${login}@${server}`);
      }
    }

    // Busca ou cria usuário automaticamente
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      console.log(`👤 [POST /mt5/connect] Usuário não encontrado, criando automaticamente...`);

      // Cria usuário automaticamente
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress,
          active: true
        }
      });

      console.log(`✅ [POST /mt5/connect] Usuário criado: ${user.id}`);
    }

    // ============================================================================
    // REGRA: 1 CONTA POR USUÁRIO
    // ============================================================================
    // Antes de criar nova conta, deletar TODAS as contas antigas do usuário
    // Isso garante que apenas a última conta conectada permanece ativa

    const existingAccounts = await prisma.tradingAccount.findMany({
      where: { userId: user.id }
    });

    if (existingAccounts.length > 0) {
      console.log(`🗑️ [POST /mt5/connect] Usuário já possui ${existingAccounts.length} conta(s), deletando antigas...`);

      for (const oldAccount of existingAccounts) {
        // ========================================================================
        // PASSO 1: Limpar configuração MT5 do desktop ANTES de deletar do banco
        // ========================================================================
        // Isso evita que MT5 continue tentando conectar em conta deletada

        console.log(`\n🔧 [POST /mt5/connect] Limpando MT5 para conta antiga: ${oldAccount.server}`);
        cleanMT5Config(oldAccount.server);

        // ========================================================================
        // PASSO 2: Deletar do banco de dados
        // ========================================================================

        // Deletar snapshots
        await prisma.accountSnapshot.deleteMany({
          where: { tradingAccountId: oldAccount.id }
        });

        // Deletar credenciais
        await prisma.tradingAccountCredential.deleteMany({
          where: { tradingAccountId: oldAccount.id }
        });

        // Deletar conta
        await prisma.tradingAccount.delete({
          where: { id: oldAccount.id }
        });

        console.log(`   ✅ Deletada do banco: ${oldAccount.brokerName} ${oldAccount.login}@${oldAccount.server}\n`);
      }

      console.log(`✅ [POST /mt5/connect] ${existingAccounts.length} conta(s) antiga(s) removida(s) (banco + MT5)`);
    }

    // Criptografa senha
    const encryptedPassword = encryptPassword(password);

    // CRIA nova conta (sempre criar nova, nunca atualizar)
    const tradingAccount = await prisma.tradingAccount.create({
      data: {
        userId: user.id,
        accountAlias: accountAlias || `${brokerName} ${login}`,
        brokerName: brokerName || 'Unknown Broker',
        login: login,
        server: server,
        platform: platform || 'MT5',
        status: 'PENDING'
      }
    });

    await prisma.tradingAccountCredential.create({
      data: {
        tradingAccountId: tradingAccount.id,
        encryptedPassword: encryptedPassword
      }
    });

    console.log(`✅ [POST /mt5/connect] Nova conta conectada: ${login}@${server}`);

    // ============================================================================
    // COLETA INICIAL VIA METAAPI (Deploy → Coleta → Undeploy)
    // ============================================================================
    // Quando cliente conecta, fazemos UMA coleta imediata via MetaAPI
    // Depois a conta fica UNDEPLOYED até próxima coleta (22:00 UTC ou Admin)
    try {
      const { spawn } = await import('child_process');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const collectorPath = path.resolve(__dirname, '../../..', 'mt5-collector', 'metaapi_daily_collector.py');

      console.log(`🚀 [POST /mt5/connect] Iniciando coleta inicial MetaAPI para conta ${tradingAccount.id}`);
      console.log(`   📝 Fluxo: Deploy → Coleta → Undeploy (economia de custos)`);

      // Executa coleta única com --now (deploy → coleta → undeploy)
      const collector = spawn('python', [collectorPath, '--now'], {
        detached: true,
        stdio: 'ignore'
      });

      collector.unref();

      console.log(`✅ [POST /mt5/connect] Coleta inicial iniciada em background (PID: ${collector.pid})`);
      console.log(`   ⏰ Próximas coletas: 22:00 UTC (automático) ou via Admin`);
    } catch (error) {
      console.error(`⚠️ [POST /mt5/connect] Erro ao iniciar coleta inicial:`, error);
      // Não falha a requisição, apenas loga o erro
    }

    res.json({
      success: true,
      account: {
        id: tradingAccount.id,
        accountAlias: tradingAccount.accountAlias,
        brokerName: tradingAccount.brokerName,
        login: tradingAccount.login,
        server: tradingAccount.server,
        platform: tradingAccount.platform,
        status: tradingAccount.status
      }
    });

  } catch (error) {
    console.error(`❌ [POST /mt5/connect] Error:`, error);
    res.status(500).json({ error: 'Failed to connect account', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/accounts
// ================================================================================
// Lista contas MT5 do usuário

router.get('/accounts', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    console.log(`📋 [GET /mt5/accounts] Buscando contas para ${walletAddress}`);

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Busca contas MT5
    const accounts = await prisma.tradingAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        accountAlias: true,
        brokerName: true,
        login: true,
        server: true,
        platform: true,
        status: true,
        connected: true,
        lastError: true,
        lastHeartbeat: true,
        balance: true,
        equity: true,
        margin: true,
        freeMargin: true,
        marginLevel: true,
        openTrades: true,
        openPL: true,
        dayPL: true,
        weekPL: true,
        monthPL: true,
        totalPL: true,
        createdAt: true,
        updatedAt: true,
        lastSnapshotAt: true
      }
    });

    console.log(`✅ [GET /mt5/accounts] Encontradas ${accounts.length} contas para ${walletAddress}`);

    // Desabilita cache para dados em tempo real
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({ accounts });

  } catch (error) {
    console.error(`❌ [GET /mt5/accounts] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch accounts', details: error.message });
  }
});

// ================================================================================
// DELETE /api/mt5/accounts/:id
// ================================================================================
// Remove conta MT5

router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    console.log(`🗑️ [DELETE /mt5/accounts/${id}] Tentativa de remoção para ${walletAddress}`);

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Busca conta
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found or not owned by user' });
    }

    // ============================================================================
    // VERIFICAÇÃO DE STATUS DE REMOÇÃO - REQUER AUTORIZAÇÃO DO ADMIN
    // ============================================================================
    // Após conectada com sucesso, conta só pode ser removida com aprovação admin

    if (account.status === 'CONNECTED' && account.removalStatus !== 'APPROVED_FOR_REMOVAL') {
      console.log(`⚠️  [DELETE /mt5/accounts/${id}] Bloqueado - Conta conectada requer autorização admin`);
      console.log(`   Status atual: ${account.removalStatus}`);

      return res.status(403).json({
        error: 'REMOVAL_NOT_AUTHORIZED',
        message: 'Esta conta está conectada e só pode ser removida com autorização do administrador',
        details: {
          currentStatus: account.removalStatus,
          accountId: id,
          instruction: 'Use o botão "Solicitar Remoção" para enviar uma solicitação ao administrador'
        }
      });
    }

    // Se chegou aqui, pode remover (conta não conectada OU aprovada para remoção)
    console.log(`✅ [DELETE /mt5/accounts/${id}] Autorizado para remoção`);

    // Remove conta (cascade delete remove credentials e snapshots)
    await prisma.tradingAccount.delete({
      where: { id: id }
    });

    // Se havia solicitação de remoção aprovada, atualiza o status
    if (account.removalStatus === 'APPROVED_FOR_REMOVAL') {
      await prisma.accountRemovalRequest.updateMany({
        where: {
          tradingAccountId: id,
          status: 'APPROVED'
        },
        data: {
          status: 'COMPLETED'
        }
      });
    }

    console.log(`✅ [DELETE /mt5/accounts/${id}] Conta removida com sucesso`);

    res.json({ success: true });

  } catch (error) {
    console.error(`❌ [DELETE /mt5/accounts] Error:`, error);
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/accounts/:id/history
// ================================================================================
// Busca histórico de snapshots

router.get('/accounts/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress, limit = 100 } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    console.log(`📈 [GET /mt5/accounts/${id}/history] Buscando histórico para ${walletAddress}`);

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verifica se conta pertence ao usuário
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found or not owned by user' });
    }

    // Busca snapshots
    const snapshots = await prisma.accountSnapshot.findMany({
      where: { tradingAccountId: id },
      orderBy: { capturedAt: 'desc' },
      take: parseInt(limit)
    });

    console.log(`✅ [GET /mt5/accounts/${id}/history] Encontrados ${snapshots.length} snapshots`);

    res.json({ snapshots });

  } catch (error) {
    console.error(`❌ [GET /mt5/accounts/history] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/stats
// ================================================================================
// Estatísticas gerais do sistema MT5

router.get('/stats', async (req, res) => {
  try {
    console.log(`📊 [GET /mt5/stats] Buscando estatísticas MT5`);

    const [totalAccounts, connectedAccounts, disconnectedAccounts, errorAccounts] = await Promise.all([
      prisma.tradingAccount.count(),
      prisma.tradingAccount.count({ where: { status: 'CONNECTED' } }),
      prisma.tradingAccount.count({ where: { status: 'DISCONNECTED' } }),
      prisma.tradingAccount.count({ where: { status: 'ERROR' } })
    ]);

    const stats = {
      totalAccounts,
      connectedAccounts,
      disconnectedAccounts,
      errorAccounts,
      pendingAccounts: totalAccounts - connectedAccounts - disconnectedAccounts - errorAccounts
    };

    console.log(`✅ [GET /mt5/stats] Estatísticas:`, stats);

    res.json(stats);

  } catch (error) {
    console.error(`❌ [GET /mt5/stats] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// ================================================================================
// POST /api/mt5/sync
// ================================================================================
// Recebe dados do coletor Python e atualiza conta

router.post('/sync', async (req, res) => {
  try {
    const { accountId, balance, equity, margin, freeMargin, marginLevel, openTrades, openPL, dayPL, weekPL, monthPL, totalPL } = req.body;

    console.log(`🔄 [POST /mt5/sync] Sincronizando conta ${accountId}`);

    // Validações
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    // Busca conta pelo ID
    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Atualiza dados da conta
    const updatedAccount = await prisma.tradingAccount.update({
      where: { id: accountId },
      data: {
        balance: balance !== undefined ? String(balance) : account.balance,
        equity: equity !== undefined ? String(equity) : account.equity,
        margin: margin !== undefined ? String(margin) : account.margin,
        freeMargin: freeMargin !== undefined ? String(freeMargin) : account.freeMargin,
        marginLevel: marginLevel !== undefined ? String(marginLevel) : account.marginLevel,
        openTrades: openTrades !== undefined ? parseInt(openTrades) : account.openTrades,
        openPL: openPL !== undefined ? String(openPL) : account.openPL,
        dayPL: dayPL !== undefined ? String(dayPL) : account.dayPL,
        weekPL: weekPL !== undefined ? String(weekPL) : account.weekPL,
        monthPL: monthPL !== undefined ? String(monthPL) : account.monthPL,
        totalPL: totalPL !== undefined ? String(totalPL) : account.totalPL,
        status: 'CONNECTED',
        connected: true,
        lastHeartbeat: new Date(),
        lastSnapshotAt: new Date(),
        lastError: null
      }
    });

    // Criar snapshot
    await prisma.accountSnapshot.create({
      data: {
        tradingAccountId: accountId,
        balance: String(balance),
        equity: String(equity),
        margin: String(margin || 0),
        freeMargin: String(freeMargin || 0),
        marginLevel: String(marginLevel || 0),
        openTrades: parseInt(openTrades || 0),
        openPL: String(openPL || 0),
        dayPL: String(dayPL || 0),
        weekPL: String(weekPL || 0),
        monthPL: String(monthPL || 0),
        totalPL: String(totalPL || 0)
      }
    });

    console.log(`✅ [POST /mt5/sync] Conta ${accountId} atualizada - Balance: $${balance}, Equity: $${equity}`);

    res.json({
      success: true,
      account: {
        id: updatedAccount.id,
        status: updatedAccount.status,
        connected: updatedAccount.connected,
        balance: updatedAccount.balance,
        equity: updatedAccount.equity
      }
    });

  } catch (error) {
    console.error(`❌ [POST /mt5/sync] Error:`, error);
    res.status(500).json({ error: 'Failed to sync account', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/brokers
// ================================================================================
// Lista todas as corretoras disponíveis

router.get('/brokers', async (req, res) => {
  try {
    const { search } = req.query;

    console.log(`📋 [GET /mt5/brokers] Listando corretoras (search: ${search || 'none'})`);

    const where = {
      active: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const brokers = await prisma.broker.findMany({
      where,
      orderBy: { displayName: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        logoUrl: true,
        website: true,
        supportsMT5: true,
        supportsMT4: true
      }
    });

    console.log(`✅ [GET /mt5/brokers] Encontradas ${brokers.length} corretoras`);

    res.json({
      success: true,
      brokers
    });

  } catch (error) {
    console.error(`❌ [GET /mt5/brokers] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch brokers', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/brokers/:id/servers
// ================================================================================
// Retorna lista de servidores MT5 de uma corretora específica

router.get('/brokers/:id/servers', async (req, res) => {
  try {
    const { id } = req.params;
    const { isDemo, isLive } = req.query;

    console.log(`🔍 [GET /mt5/brokers/${id}/servers] Buscando servidores`);

    const broker = await prisma.broker.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        displayName: true
      }
    });

    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    const where = {
      brokerId: id,
      active: true
    };

    if (isDemo !== undefined) {
      where.isDemo = isDemo === 'true';
    }

    if (isLive !== undefined) {
      where.isLive = isLive === 'true';
    }

    const servers = await prisma.brokerServer.findMany({
      where,
      orderBy: [
        { isLive: 'desc' },
        { serverName: 'asc' }
      ],
      select: {
        id: true,
        serverName: true,
        serverAddress: true,
        isDemo: true,
        isLive: true
      }
    });

    console.log(`✅ [GET /mt5/brokers/${id}/servers] Encontrados ${servers.length} servidores para ${broker.displayName}`);

    res.json({
      success: true,
      broker: broker.displayName,
      servers
    });

  } catch (error) {
    console.error(`❌ [GET /mt5/brokers/servers] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch servers', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/accounts/all
// ================================================================================
// Retorna TODAS as contas MT5 com credenciais para o carrossel collector

router.get('/accounts/all', async (req, res) => {
  try {
    console.log(`📋 [GET /mt5/accounts/all] Buscando TODAS as contas para carrossel`);

    // Busca todas as contas
    const accounts = await prisma.tradingAccount.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Para cada conta, busca credenciais e descriptografa
    const accountsWithCredentials = [];

    for (const account of accounts) {
      try {
        const credential = await prisma.tradingAccountCredential.findUnique({
          where: { tradingAccountId: account.id }
        });

        if (credential) {
          const password = decryptPassword(credential.encryptedPassword);

          accountsWithCredentials.push({
            id: account.id,
            login: account.login,
            password: password,
            server: account.server,
            platform: account.platform,
            brokerName: account.brokerName,
            accountAlias: account.accountAlias
          });
        } else {
          console.log(`⚠️ [GET /mt5/accounts/all] Conta ${account.id} sem credenciais, pulando...`);
        }
      } catch (e) {
        console.log(`⚠️ [GET /mt5/accounts/all] Erro ao processar conta ${account.id}: ${e.message}`);
      }
    }

    console.log(`✅ [GET /mt5/accounts/all] ${accountsWithCredentials.length} contas encontradas para coleta`);

    res.json(accountsWithCredentials);

  } catch (error) {
    console.error(`❌ [GET /mt5/accounts/all] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch all accounts', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/credentials/:id
// ================================================================================
// Retorna credenciais descriptografadas para o coletor Python

router.get('/credentials/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔐 [GET /mt5/credentials/${id}] Buscando credenciais`);

    // Busca conta
    const account = await prisma.tradingAccount.findUnique({
      where: { id }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Busca credencial separadamente
    const credential = await prisma.tradingAccountCredential.findUnique({
      where: { tradingAccountId: id }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Credentials not found' });
    }

    // Descriptografa senha
    const password = decryptPassword(credential.encryptedPassword);

    console.log(`✅ [GET /mt5/credentials/${id}] Credenciais descriptografadas`);

    res.json({
      id: account.id,
      login: account.login,
      password: password,
      server: account.server,
      platform: account.platform
    });

  } catch (error) {
    console.error(`❌ [GET /mt5/credentials] Error:`, error);
    res.status(500).json({ error: 'Failed to get credentials', details: error.message });
  }
});

// ================================================================================
// POST /api/mt5/request-removal
// ================================================================================
// Cliente solicita remoção de conta MT5 conectada

router.post('/request-removal', async (req, res) => {
  try {
    const { accountId, walletAddress, reason } = req.body;

    if (!accountId || !walletAddress) {
      return res.status(400).json({ error: 'accountId and walletAddress required' });
    }

    console.log(`📝 [POST /mt5/request-removal] Solicitação de remoção - Cliente: ${walletAddress}, Conta: ${accountId}`);

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Busca conta e verifica propriedade
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: accountId,
        userId: user.id
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found or not owned by user' });
    }

    // Verifica se já existe solicitação pendente
    const existingRequest = await prisma.accountRemovalRequest.findFirst({
      where: {
        tradingAccountId: accountId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      console.log(`⚠️  [POST /mt5/request-removal] Já existe solicitação pendente para esta conta`);
      return res.status(409).json({
        error: 'REQUEST_ALREADY_EXISTS',
        message: 'Já existe uma solicitação de remoção pendente para esta conta',
        requestId: existingRequest.id,
        requestedAt: existingRequest.requestedAt
      });
    }

    // Cria solicitação de remoção
    const removalRequest = await prisma.accountRemovalRequest.create({
      data: {
        tradingAccountId: accountId,
        userId: user.id,
        userWalletAddress: walletAddress,
        accountLogin: account.login,
        accountServer: account.server,
        accountAlias: account.accountAlias,
        brokerName: account.brokerName,
        reason: reason || null
      }
    });

    // Atualiza status da conta para PENDING_REMOVAL
    await prisma.tradingAccount.update({
      where: { id: accountId },
      data: { removalStatus: 'PENDING_REMOVAL' }
    });

    console.log(`✅ [POST /mt5/request-removal] Solicitação criada com sucesso - ID: ${removalRequest.id}`);
    console.log(`   Conta: ${account.login}@${account.server}`);
    console.log(`   Motivo: ${reason || 'Não especificado'}`);

    res.json({
      success: true,
      requestId: removalRequest.id,
      message: 'Solicitação de remoção enviada com sucesso. Aguarde aprovação do administrador.',
      request: {
        id: removalRequest.id,
        accountId: accountId,
        accountAlias: account.accountAlias,
        status: 'PENDING',
        requestedAt: removalRequest.requestedAt
      }
    });

  } catch (error) {
    console.error(`❌ [POST /mt5/request-removal] Error:`, error);
    res.status(500).json({ error: 'Failed to create removal request', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/removal-requests
// ================================================================================
// Lista solicitações de remoção (para admin ou usuário específico)

router.get('/removal-requests', async (req, res) => {
  try {
    const { walletAddress, status } = req.query;

    console.log(`📋 [GET /mt5/removal-requests] Listando solicitações (wallet: ${walletAddress || 'all'}, status: ${status || 'all'})`);

    const where = {};

    // Se especificar walletAddress, filtra por usuário
    if (walletAddress) {
      where.userWalletAddress = walletAddress;
    }

    // Filtra por status se especificado
    if (status) {
      where.status = status;
    }

    const requests = await prisma.accountRemovalRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      select: {
        id: true,
        tradingAccountId: true,
        userId: true,
        userWalletAddress: true,
        accountLogin: true,
        accountServer: true,
        accountAlias: true,
        brokerName: true,
        reason: true,
        status: true,
        reviewedBy: true,
        reviewedAt: true,
        rejectionReason: true,
        requestedAt: true
      }
    });

    console.log(`✅ [GET /mt5/removal-requests] Encontradas ${requests.length} solicitações`);

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error(`❌ [GET /mt5/removal-requests] Error:`, error);
    res.status(500).json({ error: 'Failed to fetch removal requests', details: error.message });
  }
});

// ================================================================================
// POST /api/mt5/removal-requests/:id/approve
// ================================================================================
// Admin aprova solicitação de remoção

router.post('/removal-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminWallet } = req.body;

    if (!adminWallet) {
      return res.status(400).json({ error: 'adminWallet required' });
    }

    console.log(`✅ [POST /mt5/removal-requests/${id}/approve] Admin ${adminWallet} aprovando solicitação`);

    // Busca solicitação
    const request = await prisma.accountRemovalRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ error: 'Removal request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        error: 'REQUEST_NOT_PENDING',
        message: `Esta solicitação já foi ${request.status === 'APPROVED' ? 'aprovada' : 'rejeitada'}`,
        currentStatus: request.status
      });
    }

    // Atualiza solicitação para APPROVED
    await prisma.accountRemovalRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: adminWallet,
        reviewedAt: new Date()
      }
    });

    // Atualiza conta para APPROVED_FOR_REMOVAL
    await prisma.tradingAccount.update({
      where: { id: request.tradingAccountId },
      data: { removalStatus: 'APPROVED_FOR_REMOVAL' }
    });

    console.log(`✅ [POST /mt5/removal-requests/${id}/approve] Solicitação aprovada com sucesso`);
    console.log(`   Conta: ${request.accountLogin}@${request.accountServer}`);
    console.log(`   Cliente: ${request.userWalletAddress}`);

    res.json({
      success: true,
      message: 'Solicitação aprovada. O cliente já pode remover a conta.',
      request: {
        id: request.id,
        accountId: request.tradingAccountId,
        status: 'APPROVED',
        reviewedBy: adminWallet,
        reviewedAt: new Date()
      }
    });

  } catch (error) {
    console.error(`❌ [POST /mt5/removal-requests/:id/approve] Error:`, error);
    res.status(500).json({ error: 'Failed to approve removal request', details: error.message });
  }
});

// ================================================================================
// POST /api/mt5/trigger-collection
// ================================================================================
// Admin aciona coleta manual de dados MT5

router.post('/trigger-collection', async (req, res) => {
  try {
    const { adminWallet, referenceDate } = req.body;

    console.log(`🔄 [POST /mt5/trigger-collection] Admin ${adminWallet} acionando coleta manual`);

    if (!adminWallet) {
      return res.status(400).json({ error: 'adminWallet required' });
    }

    // Monta comando para executar o collector
    const { spawn } = await import('child_process');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const collectorPath = path.resolve(__dirname, '../../..', 'mt5-collector', 'metaapi_daily_collector.py');

    // Argumentos do comando
    const args = [collectorPath, '--now'];

    // Se tiver data de referência, adiciona
    if (referenceDate) {
      args.push('--date', referenceDate);
      console.log(`   📅 Data de referência: ${referenceDate}`);
    }

    console.log(`   🚀 Executando: python ${args.join(' ')}`);

    // Executa em background
    const collector = spawn('python', args, {
      detached: true,
      stdio: 'ignore'
    });

    collector.unref();

    console.log(`📝 [trigger-collection] Coleta manual acionada por ${adminWallet} para data ${referenceDate || 'hoje'}`);

    // Busca total de contas MT5
    const totalAccounts = await prisma.tradingAccount.count();

    console.log(`✅ [POST /mt5/trigger-collection] Coleta iniciada em background (PID: ${collector.pid})`);

    res.json({
      success: true,
      data: {
        message: 'Coleta iniciada em background',
        pid: collector.pid,
        referenceDate: referenceDate || null,
        totalAccounts
      }
    });

  } catch (error) {
    console.error(`❌ [POST /mt5/trigger-collection] Error:`, error);
    res.status(500).json({ error: 'Failed to trigger collection', details: error.message });
  }
});

// ================================================================================
// GET /api/mt5/collection-status
// ================================================================================
// Retorna status da última coleta

router.get('/collection-status', async (req, res) => {
  try {
    console.log(`📊 [GET /mt5/collection-status] Buscando status da coleta`);

    // Busca última coleta de cada conta
    const accounts = await prisma.tradingAccount.findMany({
      select: {
        id: true,
        login: true,
        server: true,
        brokerName: true,
        status: true,
        lastSnapshotAt: true,
        balance: true,
        equity: true,
        dayPL: true,
        weekPL: true,
        monthPL: true
      },
      orderBy: { lastSnapshotAt: 'desc' }
    });

    // Calcula estatísticas
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const collectedToday = accounts.filter(a =>
      a.lastSnapshotAt && new Date(a.lastSnapshotAt) >= todayStart
    ).length;

    const lastCollection = accounts.length > 0 && accounts[0].lastSnapshotAt
      ? accounts[0].lastSnapshotAt
      : null;

    res.json({
      success: true,
      data: {
        totalAccounts: accounts.length,
        collectedToday: collectedToday,
        pendingToday: accounts.length - collectedToday,
        lastCollectionAt: lastCollection,
        accounts: accounts.map(a => ({
          login: a.login,
          server: a.server,
          broker: a.brokerName,
          status: a.status,
          lastCollection: a.lastSnapshotAt,
          balance: a.balance,
          equity: a.equity,
          dayPL: a.dayPL,
          weekPL: a.weekPL,
          monthPL: a.monthPL
        }))
      }
    });

  } catch (error) {
    console.error(`❌ [GET /mt5/collection-status] Error:`, error);
    res.status(500).json({ error: 'Failed to get collection status', details: error.message });
  }
});

// ================================================================================
// POST /api/mt5/collection-status
// ================================================================================
// Recebe notificação do collector sobre status da coleta

router.post('/collection-status', async (req, res) => {
  try {
    const { status, timestamp, accounts_success, accounts_failed, duration_seconds } = req.body;

    console.log(`📥 [POST /mt5/collection-status] Status recebido: ${status}`);
    console.log(`   ✅ Sucesso: ${accounts_success}, ❌ Falhas: ${accounts_failed}, ⏱️ Duração: ${duration_seconds}s`);

    // Log de coleta apenas em console (SystemLog não existe no schema)
    console.log(`📊 [MT5_COLLECTION] ${new Date().toISOString()} - ${status}: ${accounts_success} sucesso, ${accounts_failed} falhas, ${duration_seconds}s`);

    res.json({ success: true });

  } catch (error) {
    console.error(`❌ [POST /mt5/collection-status] Error:`, error);
    res.status(500).json({ error: 'Failed to record collection status', details: error.message });
  }
});

// ================================================================================
// POST /api/mt5/removal-requests/:id/reject
// ================================================================================
// Admin rejeita solicitação de remoção

router.post('/removal-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminWallet, reason } = req.body;

    if (!adminWallet) {
      return res.status(400).json({ error: 'adminWallet required' });
    }

    console.log(`❌ [POST /mt5/removal-requests/${id}/reject] Admin ${adminWallet} rejeitando solicitação`);

    // Busca solicitação
    const request = await prisma.accountRemovalRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ error: 'Removal request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        error: 'REQUEST_NOT_PENDING',
        message: `Esta solicitação já foi ${request.status === 'APPROVED' ? 'aprovada' : 'rejeitada'}`,
        currentStatus: request.status
      });
    }

    // Atualiza solicitação para REJECTED
    await prisma.accountRemovalRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: adminWallet,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Não especificado'
      }
    });

    // Volta conta para ACTIVE
    await prisma.tradingAccount.update({
      where: { id: request.tradingAccountId },
      data: { removalStatus: 'ACTIVE' }
    });

    console.log(`❌ [POST /mt5/removal-requests/${id}/reject] Solicitação rejeitada`);
    console.log(`   Motivo: ${reason || 'Não especificado'}`);

    res.json({
      success: true,
      message: 'Solicitação rejeitada.',
      request: {
        id: request.id,
        accountId: request.tradingAccountId,
        status: 'REJECTED',
        reviewedBy: adminWallet,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Não especificado'
      }
    });

  } catch (error) {
    console.error(`❌ [POST /mt5/removal-requests/:id/reject] Error:`, error);
    res.status(500).json({ error: 'Failed to reject removal request', details: error.message });
  }
});

export default router;
