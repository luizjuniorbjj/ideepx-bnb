import { ethers } from 'ethers';
import config from '../config/index.js';
import logger from '../config/logger.js';
import fs from 'fs';
import path from 'path';

// ABI do contrato (carrega do arquivo compilado)
const abiPath = path.resolve(process.cwd(), '../iDeepXCoreV10_abi.json');
const contractAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

class ContractV10Service {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contractAddress = config.contractV10Address;

    // Wallets para diferentes roles (apenas se private keys estiverem configuradas)
    if (config.updaterPrivateKey) {
      this.updaterWallet = new ethers.Wallet(config.updaterPrivateKey, this.provider);
      this.contractAsUpdater = new ethers.Contract(this.contractAddress, contractAbi, this.updaterWallet);
    }

    if (config.distributorPrivateKey) {
      this.distributorWallet = new ethers.Wallet(config.distributorPrivateKey, this.provider);
      this.contractAsDistributor = new ethers.Contract(this.contractAddress, contractAbi, this.distributorWallet);
    }

    if (config.treasuryPrivateKey) {
      this.treasuryWallet = new ethers.Wallet(config.treasuryPrivateKey, this.provider);
      this.contractAsTreasury = new ethers.Contract(this.contractAddress, contractAbi, this.treasuryWallet);
    }

    // Instância read-only (sempre disponível)
    this.contractReadOnly = new ethers.Contract(this.contractAddress, contractAbi, this.provider);

    logger.info('ContractV10Service initialized');
    if (!config.updaterPrivateKey || !config.distributorPrivateKey || !config.treasuryPrivateKey) {
      logger.warn('⚠️  Some private keys missing - write operations will fail');
    }
  }

  // ============================================================================
  // UPDATER ROLE - Gerenciar estado dos usuários
  // ============================================================================

  /**
   * Confirma link de conta GMI
   */
  async confirmLink(userAddress, accountHash) {
    try {
      logger.info(`Confirming link for ${userAddress}`);
      const tx = await this.contractAsUpdater.confirmLink(userAddress, accountHash);
      const receipt = await tx.wait();
      logger.info(`Link confirmed. TX: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      logger.error(`Error confirming link: ${error.message}`);
      throw error;
    }
  }

  /**
   * Define usuário como ativo/inativo
   */
  async setUserActive(userAddress, active) {
    try {
      const tx = await this.contractAsUpdater.setUserActive(userAddress, active);
      const receipt = await tx.wait();
      logger.info(`User ${userAddress} active status: ${active}. TX: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      logger.error(`Error setting user active: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atualiza volume mensal do usuário
   */
  async updateUserVolume(userAddress, monthlyVolume) {
    try {
      // Convert to 6 decimals (USDT)
      const volumeInUnits = ethers.parseUnits(monthlyVolume.toString(), 6);
      const tx = await this.contractAsUpdater.updateUserVolume(userAddress, volumeInUnits);
      const receipt = await tx.wait();
      logger.info(`User ${userAddress} volume updated: ${monthlyVolume}. TX: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      logger.error(`Error updating user volume: ${error.message}`);
      throw error;
    }
  }

  /**
   * Define níveis MLM desbloqueados (1-10)
   */
  async setUnlockedLevels(userAddress, maxLevel) {
    try {
      const tx = await this.contractAsUpdater.setUnlockedLevels(userAddress, maxLevel);
      const receipt = await tx.wait();
      logger.info(`User ${userAddress} unlocked levels: ${maxLevel}. TX: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      logger.error(`Error setting unlocked levels: ${error.message}`);
      throw error;
    }
  }

  /**
   * Define status KYC do usuário
   */
  async setKycStatus(userAddress, status) {
    try {
      const tx = await this.contractAsUpdater.setKycStatus(userAddress, status);
      const receipt = await tx.wait();
      logger.info(`User ${userAddress} KYC status: ${status}. TX: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      logger.error(`Error setting KYC status: ${error.message}`);
      throw error;
    }
  }

  // ============================================================================
  // DISTRIBUTOR ROLE - Creditar performance
  // ============================================================================

  /**
   * Credita performance em lote (pós-MLM)
   */
  async creditPerformance(users, amounts) {
    try {
      logger.info(`Crediting performance for ${users.length} users`);

      // Convert amounts to 6 decimals
      const amountsInUnits = amounts.map(amt => ethers.parseUnits(amt.toString(), 6));

      // Calcular total necessário
      const totalAmount = amountsInUnits.reduce((acc, amt) => acc + amt, 0n);

      // Aprovar USDT
      const usdt = new ethers.Contract(
        config.usdtAddress,
        ['function approve(address spender, uint256 amount) external returns (bool)'],
        this.distributorWallet
      );

      logger.info(`Approving ${ethers.formatUnits(totalAmount, 6)} USDT`);
      const approveTx = await usdt.approve(this.contractAddress, totalAmount);
      await approveTx.wait();

      // Creditar
      const tx = await this.contractAsDistributor.creditPerformance(users, amountsInUnits);
      const receipt = await tx.wait();

      logger.info(`Performance credited. TX: ${receipt.hash}`);
      return receipt;
    } catch (error) {
      logger.error(`Error crediting performance: ${error.message}`);
      throw error;
    }
  }

  // ============================================================================
  // VIEW FUNCTIONS - Leitura sem custo de gas
  // ============================================================================

  /**
   * Obtém informações completas do usuário
   */
  async getUserView(userAddress) {
    try {
      const data = await this.contractReadOnly.getUserInfo(userAddress);
      return {
        wallet: data[0],
        sponsor: data[1],
        isRegistered: data[2],
        subscriptionActive: data[3],
        subscriptionTimestamp: Number(data[4]),
        subscriptionExpiration: Number(data[5]),
        totalEarned: ethers.formatUnits(data[6], 6),
        totalWithdrawn: ethers.formatUnits(data[7], 6),
        directReferrals: Number(data[8])
      };
    } catch (error) {
      logger.error(`Error getting user view: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém ratio de solvência (em basis points)
   */
  async getSolvencyRatio() {
    try {
      const ratio = await this.contractReadOnly.getSolvencyRatio();
      return Number(ratio) / 100; // Convert to percentage
    } catch (error) {
      logger.error(`Error getting solvency ratio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do sistema
   */
  async getSystemStats() {
    try {
      const [subscriptionFee, subscriptionDuration, minSolvencyBps, circuitBreakerActive] = await Promise.all([
        this.contractReadOnly.subscriptionFee(),
        this.contractReadOnly.subscriptionDuration(),
        this.contractReadOnly.minSolvencyBps(),
        this.contractReadOnly.circuitBreakerActive()
      ]);

      return {
        subscriptionFee: ethers.formatUnits(subscriptionFee, 6),
        subscriptionDuration: Number(subscriptionDuration) / 86400, // days
        minSolvencyBps: Number(minSolvencyBps) / 100, // percentage
        circuitBreakerActive,
        solvencyRatio: await this.getSolvencyRatio()
      };
    } catch (error) {
      logger.error(`Error getting system stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifica se carteira tem role
   */
  async hasRole(role, address) {
    try {
      // Role hashes (keccak256)
      const roles = {
        UPDATER: await this.contractReadOnly.UPDATER_ROLE(),
        DISTRIBUTOR: await this.contractReadOnly.DISTRIBUTOR_ROLE(),
        TREASURY: await this.contractReadOnly.TREASURY_ROLE(),
        ADMIN: await this.contractReadOnly.DEFAULT_ADMIN_ROLE()
      };

      const roleHash = roles[role.toUpperCase()];
      if (!roleHash) throw new Error(`Invalid role: ${role}`);

      return await this.contractReadOnly.hasRole(roleHash, address);
    } catch (error) {
      logger.error(`Error checking role: ${error.message}`);
      throw error;
    }
  }

  // ============================================================================
  // EVENTOS - Escutar eventos do contrato
  // ============================================================================

  /**
   * Escuta eventos UserLinked
   */
  onUserLinked(callback) {
    this.contractReadOnly.on('UserLinked', (user, accountHash, event) => {
      callback({ user, accountHash, event });
    });
  }

  /**
   * Escuta eventos PerformanceCredited
   */
  onPerformanceCredited(callback) {
    this.contractReadOnly.on('PerformanceCredited', (user, amount, event) => {
      callback({
        user,
        amount: ethers.formatUnits(amount, 6),
        event
      });
    });
  }

  /**
   * Escuta eventos WithdrawExecuted
   */
  onWithdrawExecuted(callback) {
    this.contractReadOnly.on('WithdrawExecuted', (user, amount, event) => {
      callback({
        user,
        amount: ethers.formatUnits(amount, 6),
        event
      });
    });
  }

  /**
   * Remove todos os listeners
   */
  removeAllListeners() {
    this.contractReadOnly.removeAllListeners();
  }
}

export default new ContractV10Service();
