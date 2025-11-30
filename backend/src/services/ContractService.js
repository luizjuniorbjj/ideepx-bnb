/**
 * 📝 CONTRACT SERVICE - Interação com Smart Contract V10
 *
 * Responsável por toda comunicação com o contrato iDeepXDistributionV2
 *
 * Funções principais:
 * - Obter dados de usuários
 * - Processar performance fees
 * - Verificar assinaturas
 * - Calcular distribuições MLM
 */

import { ethers } from 'ethers';
import contractABI from '../../../contracts/abi/iDeepXDistributionV2.json' assert { type: 'json' };

class ContractService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.initialized = false;
  }

  /**
   * Inicializa conexão com o contrato
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const RPC_URL = process.env.RPC_URL;
      const CONTRACT_ADDRESS = process.env.CONTRACT_V10_ADDRESS;
      const PRIVATE_KEY = process.env.PRIVATE_KEY;

      if (!RPC_URL || !CONTRACT_ADDRESS) {
        throw new Error('❌ RPC_URL ou CONTRACT_ADDRESS não configurado');
      }

      // Criar provider
      this.provider = new ethers.JsonRpcProvider(RPC_URL);

      // Criar contrato (read-only)
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        this.provider
      );

      // Se tem private key, criar signer (para escrever)
      if (PRIVATE_KEY) {
        this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
        this.contract = this.contract.connect(this.signer);
        console.log('✅ ContractService: Modo READ/WRITE');
      } else {
        console.log('⚠️ ContractService: Modo READ-ONLY (sem PRIVATE_KEY)');
      }

      this.initialized = true;
      console.log(`✅ ContractService conectado: ${CONTRACT_ADDRESS}`);

    } catch (error) {
      console.error('❌ Erro ao inicializar ContractService:', error.message);
      throw error;
    }
  }

  /**
   * Obter informações de um usuário do contrato
   * @param {string} address - Endereço da carteira
   */
  async getUserInfo(address) {
    await this.initialize();

    try {
      const user = await this.contract.getUserInfo(address);

      return {
        wallet: user.wallet,
        sponsor: user.sponsor,
        isRegistered: user.isRegistered,
        subscriptionActive: user.subscriptionActive,
        subscriptionTimestamp: Number(user.subscriptionTimestamp),
        subscriptionExpiration: Number(user.subscriptionExpiration),
        totalEarned: ethers.formatUnits(user.totalEarned, 6), // USDT tem 6 decimais
        totalWithdrawn: ethers.formatUnits(user.totalWithdrawn, 6),
        directReferrals: Number(user.directReferrals)
      };
    } catch (error) {
      console.error(`❌ Erro ao obter info do usuário ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Verificar se assinatura está ativa (não expirada)
   * @param {string} address - Endereço da carteira
   */
  async isSubscriptionActive(address) {
    await this.initialize();

    try {
      return await this.contract.isSubscriptionActive(address);
    } catch (error) {
      console.error(`❌ Erro ao verificar assinatura de ${address}:`, error.message);
      return false;
    }
  }

  /**
   * Obter estatísticas rápidas do usuário
   * @param {string} address - Endereço da carteira
   */
  async getQuickStats(address) {
    await this.initialize();

    try {
      const stats = await this.contract.getQuickStats(address);

      return {
        totalEarned: ethers.formatUnits(stats.totalEarned, 6),
        totalWithdrawn: ethers.formatUnits(stats.totalWithdrawn, 6),
        availableBalance: ethers.formatUnits(stats.availableBalance, 6),
        directReferrals: Number(stats.directReferrals),
        subscriptionActive: stats.subscriptionActive,
        daysUntilExpiry: Number(stats.daysUntilExpiry)
      };
    } catch (error) {
      console.error(`❌ Erro ao obter stats de ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Obter upline (linha ascendente) de um usuário
   * @param {string} address - Endereço da carteira
   */
  async getUpline(address) {
    await this.initialize();

    try {
      const upline = await this.contract.getUpline(address);

      // Filtrar endereços zero
      return upline.filter(addr => addr !== ethers.ZeroAddress);
    } catch (error) {
      console.error(`❌ Erro ao obter upline de ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Obter estatísticas de rede de um usuário
   * @param {string} address - Endereço da carteira
   */
  async getNetworkStats(address) {
    await this.initialize();

    try {
      const stats = await this.contract.getNetworkStats(address);

      return {
        totalDirects: Number(stats.totalDirects),
        totalEarned: ethers.formatUnits(stats.totalEarned, 6),
        totalWithdrawn: ethers.formatUnits(stats.totalWithdrawn, 6),
        availableBalance: ethers.formatUnits(stats.availableBalance, 6)
      };
    } catch (error) {
      console.error(`❌ Erro ao obter network stats de ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Calcular distribuição MLM de uma performance fee
   * @param {number} performanceFee - Valor da fee em USDT
   */
  async calculateMLMDistribution(performanceFee) {
    await this.initialize();

    try {
      const feeInWei = ethers.parseUnits(performanceFee.toString(), 6);
      const result = await this.contract.calculateMLMDistribution(feeInWei);

      // Converter para formato legível
      const levelCommissions = result.levelCommissions.map(
        (commission) => ethers.formatUnits(commission, 6)
      );

      return {
        levelCommissions,
        totalMLM: ethers.formatUnits(result.totalMLM, 6),
        liquidity: ethers.formatUnits(result.liquidity, 6),
        infrastructure: ethers.formatUnits(result.infrastructure, 6),
        company: ethers.formatUnits(result.company, 6)
      };
    } catch (error) {
      console.error('❌ Erro ao calcular distribuição MLM:', error.message);
      throw error;
    }
  }

  /**
   * Obter percentuais MLM ativos (Beta ou Permanente)
   */
  async getActiveMLMPercentages() {
    await this.initialize();

    try {
      const percentages = await this.contract.getActiveMLMPercentages();

      // Converter basis points para percentual
      return percentages.map(bp => Number(bp) / 100);
    } catch (error) {
      console.error('❌ Erro ao obter percentuais MLM:', error.message);
      throw error;
    }
  }

  /**
   * Obter estatísticas gerais do sistema
   */
  async getSystemStats() {
    await this.initialize();

    try {
      const stats = await this.contract.getSystemStats();

      return {
        totalUsers: Number(stats._totalUsers),
        totalActiveSubscriptions: Number(stats._totalActiveSubscriptions),
        totalMLMDistributed: ethers.formatUnits(stats._totalMLMDistributed, 6),
        betaMode: stats._betaMode
      };
    } catch (error) {
      console.error('❌ Erro ao obter system stats:', error.message);
      throw error;
    }
  }

  /**
   * Processar performance fees em lote (requer signer)
   * @param {Array} clients - Array de endereços
   * @param {Array} amounts - Array de valores em USDT
   */
  async batchProcessPerformanceFees(clients, amounts) {
    await this.initialize();

    if (!this.signer) {
      throw new Error('❌ Signer não configurado. Adicione PRIVATE_KEY ao .env');
    }

    try {
      // Converter valores para Wei (6 decimais USDT)
      const amountsInWei = amounts.map(amount =>
        ethers.parseUnits(amount.toString(), 6)
      );

      console.log(`📊 Processando ${clients.length} performance fees...`);

      const tx = await this.contract.batchProcessPerformanceFees(
        clients,
        amountsInWei
      );

      console.log(`⏳ Transação enviada: ${tx.hash}`);

      const receipt = await tx.wait();

      console.log(`✅ Performance fees processadas! Gas usado: ${receipt.gasUsed.toString()}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        success: true
      };

    } catch (error) {
      console.error('❌ Erro ao processar performance fees:', error.message);
      throw error;
    }
  }

  /**
   * Verificar se modo beta está ativo
   */
  async isBetaMode() {
    await this.initialize();

    try {
      return await this.contract.betaMode();
    } catch (error) {
      console.error('❌ Erro ao verificar beta mode:', error.message);
      return true; // Default para beta
    }
  }

  /**
   * Obter endereços das carteiras do sistema
   */
  async getWallets() {
    await this.initialize();

    try {
      const [liquidity, infrastructure, company] = await Promise.all([
        this.contract.liquidityPool(),
        this.contract.infrastructureWallet(),
        this.contract.companyWallet()
      ]);

      return {
        liquidityPool: liquidity,
        infrastructureWallet: infrastructure,
        companyWallet: company
      };
    } catch (error) {
      console.error('❌ Erro ao obter carteiras:', error.message);
      throw error;
    }
  }

  /**
   * Obter histórico de ganhos de um usuário
   * @param {string} address - Endereço da carteira
   * @param {number} count - Quantos registros retornar (max 100)
   */
  async getEarningHistory(address, count = 10) {
    await this.initialize();

    try {
      const history = await this.contract.getEarningHistory(address, count);

      return history.map(earning => ({
        timestamp: Number(earning.timestamp),
        amount: ethers.formatUnits(earning.amount, 6),
        fromClient: earning.fromClient,
        level: Number(earning.level),
        earningType: Number(earning.earningType) // 0: MLM, 1: Direct, 2: Rank
      }));
    } catch (error) {
      console.error(`❌ Erro ao obter histórico de ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Verificar saldo USDT do contrato
   */
  async getContractBalance() {
    await this.initialize();

    try {
      const USDT_ADDRESS = process.env.USDT_ADDRESS;
      const CONTRACT_ADDRESS = process.env.CONTRACT_V10_ADDRESS;

      if (!USDT_ADDRESS) {
        throw new Error('❌ USDT_ADDRESS não configurado');
      }

      // ABI mínimo do USDT
      const USDT_ABI = ['function balanceOf(address) view returns (uint256)'];

      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, this.provider);
      const balance = await usdt.balanceOf(CONTRACT_ADDRESS);

      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('❌ Erro ao obter saldo do contrato:', error.message);
      throw error;
    }
  }
}

// Singleton
export default new ContractService();
