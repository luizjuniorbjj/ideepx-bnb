import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * SIWE AUTHENTICATION SERVICE
 * ============================================================================
 * Sign-In With Ethereum (EIP-4361)
 */

class SiweAuthService {
  /**
   * Gera mensagem SIWE para assinatura
   * @param {string} walletAddress - Endereço da carteira
   * @param {string} nonce - Nonce único
   * @returns {Object} Mensagem SIWE
   */
  generateMessage(walletAddress, nonce) {
    const message = new SiweMessage({
      domain: config.siweDomain,
      address: walletAddress,
      statement: config.siweStatement,
      uri: `https://${config.siweDomain}`,
      version: '1',
      chainId: config.chainId,
      nonce,
      issuedAt: new Date().toISOString()
    });

    return {
      message: message.prepareMessage(),
      nonce
    };
  }

  /**
   * Verifica assinatura SIWE e gera JWT
   * @param {string} message - Mensagem assinada
   * @param {string} signature - Assinatura
   * @returns {Promise<Object>} Token JWT e dados do usuário
   */
  async verify(message, signature) {
    try {
      // Parse e validar mensagem SIWE
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (!fields.success) {
        throw new Error('SIWE signature verification failed');
      }

      const walletAddress = fields.data.address.toLowerCase();

      // Buscar ou criar usuário
      let user = await prisma.user.findUnique({
        where: { walletAddress }
      });

      if (!user) {
        // Criar novo usuário
        user = await prisma.user.create({
          data: {
            walletAddress,
            active: false,
            maxLevel: 5 // Primeiros 5 níveis desbloqueados por padrão
          }
        });
        logger.info(`New user created: ${walletAddress}`);
      } else {
        // Atualizar lastActiveAt
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() }
        });
      }

      // Gerar JWT
      const token = jwt.sign(
        {
          userId: user.id,
          walletAddress: user.walletAddress
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiration }
      );

      logger.info(`User authenticated: ${walletAddress}`);

      return {
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          active: user.active,
          maxLevel: user.maxLevel,
          hasGmiAccount: !!user.accountHash
        }
      };
    } catch (error) {
      logger.error(`SIWE verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica JWT e retorna dados do usuário
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Dados do usuário
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.id,
        walletAddress: user.walletAddress,
        active: user.active,
        maxLevel: user.maxLevel
      };
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Middleware Express para autenticação
   */
  authMiddleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const userData = await this.verifyToken(token);

        req.user = userData;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  }

  /**
   * Middleware para verificar se usuário é admin
   */
  adminMiddleware() {
    return (req, res, next) => {
      const isAdmin = config.adminWallets.includes(req.user.walletAddress.toLowerCase());

      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      next();
    };
  }
}

export default new SiweAuthService();
