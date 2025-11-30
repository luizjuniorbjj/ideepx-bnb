/**
 * GMI Edge API Service
 *
 * Serviço para conectar e buscar dados da API GMI Edge real (The Edge Platform)
 */

import logger from '../config/logger.js';
import https from 'https';
import axios from 'axios';

class GMIEdgeService {
  constructor() {
    // URLs da API GMI Edge por servidor (baseado na documentação oficial)
    this.apiUrls = {
      'GMIEdge-Demo': process.env.GMI_EDGE_DEMO_API_URL || 'https://demo-edge-api.gmimarkets.com:7530/api/v1',
      'GMI Trading Platform Demo': 'https://demo-edge-api.gmimarkets.com:7530/api/v1', // Alias para o nome do servidor no e-mail
      'GMIEdge-Live': process.env.GMI_EDGE_LIVE_API_URL || 'https://live-edge-api.gmimarkets.com:7530/api/v1',
      'GMIEdge-Cent': process.env.GMI_EDGE_CENT_API_URL || 'https://cent-edge-api.gmimarkets.com:6530/api/v1'
    };

    // Cache de tokens por conta (accountNumber)
    this.tokenCache = new Map();

    // Agent HTTPS que ignora validação de certificado SSL
    // Necessário porque o certificado da GMI Edge tem problemas de validação
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    // Configuração axios padrão
    this.axiosConfig = {
      httpsAgent: this.httpsAgent,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Valida credenciais e faz login na API GMI Edge
   * @param {string} accountNumber - Número da conta
   * @param {string} password - Senha investidor (read-only)
   * @param {string} server - Servidor (GMIEdge-Live ou GMIEdge-Demo)
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  async login(accountNumber, password, server = 'GMIEdge-Live') {
    const apiUrl = this.apiUrls[server];

    if (!apiUrl) {
      throw new Error(`Servidor inválido: ${server}`);
    }

    try {
      logger.info(`[GMI Edge] Tentando login para conta ${accountNumber} no servidor ${server}`);

      const response = await axios.post(
        `${apiUrl}/login`,
        {
          BotId: parseInt(accountNumber),
          Password: password
        },
        this.axiosConfig
      );

      const data = response.data;

      if (!data.AccessToken || !data.RefreshToken) {
        throw new Error('Resposta da API inválida');
      }

      // Armazenar tokens no cache
      this.tokenCache.set(accountNumber, {
        accessToken: data.AccessToken,
        refreshToken: data.RefreshToken,
        server,
        timestamp: Date.now()
      });

      logger.info(`[GMI Edge] Login bem-sucedido para conta ${accountNumber}`);

      return {
        accessToken: data.AccessToken,
        refreshToken: data.RefreshToken
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Credenciais inválidas';
      logger.error(`[GMI Edge] Erro no login: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  /**
   * Obtém token de acesso (do cache ou faz refresh)
   * @param {string} accountNumber
   * @returns {Promise<string>}
   */
  async getAccessToken(accountNumber) {
    const cached = this.tokenCache.get(accountNumber);

    if (!cached) {
      throw new Error('Token não encontrado. Faça login novamente.');
    }

    // Token válido por 1 hora, renovar se estiver perto de expirar (55 min)
    const age = Date.now() - cached.timestamp;
    if (age > 55 * 60 * 1000) {
      logger.info(`[GMI Edge] Token expirado, renovando para conta ${accountNumber}`);
      await this.refreshToken(accountNumber, cached.refreshToken, cached.server);
      return this.tokenCache.get(accountNumber).accessToken;
    }

    return cached.accessToken;
  }

  /**
   * Renova token usando refresh token
   * @param {string} accountNumber
   * @param {string} refreshToken
   * @param {string} server
   */
  async refreshToken(accountNumber, refreshToken, server) {
    const apiUrl = this.apiUrls[server];

    try {
      const response = await axios.post(
        `${apiUrl}/refresh`,
        {
          BotId: parseInt(accountNumber),
          RefreshToken: refreshToken
        },
        this.axiosConfig
      );

      const data = response.data;

      this.tokenCache.set(accountNumber, {
        accessToken: data.AccessToken,
        refreshToken: data.RefreshToken,
        server,
        timestamp: Date.now()
      });

      logger.info(`[GMI Edge] Token renovado para conta ${accountNumber}`);
    } catch (error) {
      logger.error(`[GMI Edge] Erro ao renovar token: ${error.message}`);
      this.tokenCache.delete(accountNumber);
      throw error;
    }
  }

  /**
   * Busca informações gerais da conta
   * @param {string} accountNumber
   * @returns {Promise<Object>}
   */
  async getAccountInfo(accountNumber) {
    try {
      const token = await this.getAccessToken(accountNumber);
      const cached = this.tokenCache.get(accountNumber);
      const apiUrl = this.apiUrls[cached.server];

      const response = await axios.get(
        `${apiUrl}/accountinfo`,
        {
          ...this.axiosConfig,
          headers: {
            ...this.axiosConfig.headers,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      logger.info(`[GMI Edge] Informações da conta ${accountNumber} obtidas com sucesso`);

      return response.data;
    } catch (error) {
      logger.error(`[GMI Edge] Erro ao buscar info da conta: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca estado financeiro atual da conta
   * @param {string} accountNumber
   * @returns {Promise<Object>}
   */
  async getAccountState(accountNumber) {
    try {
      const token = await this.getAccessToken(accountNumber);
      const cached = this.tokenCache.get(accountNumber);
      const apiUrl = this.apiUrls[cached.server];

      const response = await axios.get(
        `${apiUrl}/accountstate`,
        {
          ...this.axiosConfig,
          headers: {
            ...this.axiosConfig.headers,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = response.data;
      logger.info(`[GMI Edge] Estado da conta ${accountNumber} obtido com sucesso`);

      // A API retorna { AccountState: {...}, OrderStates: [...] }
      // Retornar o objeto completo (AccountState + OrderStates)
      return data;
    } catch (error) {
      logger.error(`[GMI Edge] Erro ao buscar estado da conta: ${error.message}`);
      throw error;
    }
  }

  /**
   * Valida e conecta conta GMI Edge (faz login e busca dados iniciais)
   * @param {string} accountNumber
   * @param {string} password
   * @param {string} server
   * @returns {Promise<{accountInfo: Object, accountState: Object, tokens: Object}>}
   */
  async validateAndConnect(accountNumber, password, server = 'GMIEdge-Live') {
    try {
      // 1. Fazer login e validar credenciais
      const tokens = await this.login(accountNumber, password, server);

      // 2. Buscar informações da conta
      const accountInfo = await this.getAccountInfo(accountNumber);

      // 3. Buscar estado financeiro
      const accountState = await this.getAccountState(accountNumber);

      return {
        accountInfo,
        accountState,
        tokens
      };
    } catch (error) {
      logger.error(`[GMI Edge] Falha na validação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Buscar histórico de trades
   * @param {string} accountNumber
   * @param {number} daysBack - Dias para trás (padrão: 30)
   * @returns {Promise<Array>}
   */
  async getTradeHistory(accountNumber, daysBack = null) {
    const apiUrl = this._getApiUrlForAccount(accountNumber);

    if (!apiUrl) {
      throw new Error(`API URL não encontrada para conta ${accountNumber}`);
    }

    const token = this._getValidToken(accountNumber);

    if (!token) {
      throw new Error(`Token não encontrado ou expirado para conta ${accountNumber}`);
    }

    try {
      // ✅ CORREÇÃO: Não especificar RequestFrom/RequestTo retorna TODO o histórico
      // A API GMI Edge ignora os timestamps quando especificados, então buscamos tudo
      const response = await axios.post(
        `${apiUrl}/tradehistory`,
        {
          RequestDirection: "BACKWARD",  // Do mais recente para o mais antigo
          // RequestFrom e RequestTo REMOVIDOS - API retorna tudo sem eles
          PageSize: 1000  // Máximo de registros por página
        },
        {
          ...this.axiosConfig,
          headers: {
            ...this.axiosConfig.headers,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const tradeHistory = response.data.TradeHistory || [];
      logger.info(`[GMI Edge] Histórico de ${tradeHistory.length} registros obtido para conta ${accountNumber}`);

      // Filtrar por período se daysBack foi especificado
      if (daysBack && tradeHistory.length > 0) {
        const cutoffDate = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
        const filtered = tradeHistory.filter(trade => {
          const tradeDate = trade.TransactionTimestamp ? trade.TransactionTimestamp / 1000000 : 0;
          return tradeDate >= cutoffDate;
        });
        logger.info(`[GMI Edge] Histórico filtrado para últimos ${daysBack} dias: ${filtered.length} registros`);
        return filtered;
      }

      return tradeHistory;
    } catch (error) {
      logger.error(`[GMI Edge] Erro ao buscar histórico: ${error.message}`);
      return []; // Retornar array vazio se falhar
    }
  }

  /**
   * Calcular métricas baseadas no histórico de trades
   * @param {Array} tradeHistory
   * @param {Object} accountState
   * @returns {Object}
   */
  calculateMetrics(tradeHistory, accountState) {
    // Se não houver histórico, retornar métricas zeradas
    if (!tradeHistory || tradeHistory.length === 0) {
      return {
        monthlyVolume: 0,
        monthlyProfit: 0,
        monthlyLoss: 0,
        totalTrades: 0, // 0 porque não há trades FECHADOS
        winRate: 0,
        profitFactor: 0,
        hasHistory: false,
        openPositions: accountState?.OrderStates?.length || 0 // Posições abertas separadamente
      };
    }

    // Filtrar trades fechados
    const closedTrades = tradeHistory.filter(t =>
      t.TransactionType === 'ORDER_CLOSED' ||
      t.TransactionType === 'POSITION_CLOSED'
    );

    // Calcular métricas
    let totalVolume = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let profitableTrades = 0;
    let losingTrades = 0;

    // Filtrar trades do mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTrades = closedTrades.filter(trade => {
      if (trade.CloseTime || trade.TransactionTimestamp) {
        const tradeDate = new Date(trade.CloseTime || trade.TransactionTimestamp / 1000000);
        return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
      }
      return false;
    });

    monthTrades.forEach(trade => {
      // Volume
      if (trade.Volume) {
        totalVolume += trade.Volume;
      }

      // Profit/Loss
      const netProfit = trade.NetProfit || trade.Profit || 0;
      if (netProfit > 0) {
        profitableTrades++;
        totalProfit += netProfit;
      } else if (netProfit < 0) {
        losingTrades++;
        totalLoss += Math.abs(netProfit);
      }
    });

    const winRate = monthTrades.length > 0
      ? (profitableTrades / monthTrades.length) * 100
      : 0;

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    return {
      monthlyVolume: totalVolume,
      monthlyProfit: totalProfit,
      monthlyLoss: totalLoss,
      totalTrades: monthTrades.length,
      winRate: winRate,
      profitFactor: profitFactor,
      hasHistory: monthTrades.length > 0,
      openPositions: accountState?.OrderStates?.length || 0
    };
  }

  /**
   * Calcular métricas SEMANAIS baseadas no histórico de trades
   * @param {Array} tradeHistory
   * @param {Object} accountState
   * @returns {Object}
   */
  calculateWeeklyMetrics(tradeHistory, accountState) {
    // Se não houver histórico, retornar métricas zeradas
    if (!tradeHistory || tradeHistory.length === 0) {
      return {
        weeklyVolume: 0,
        weeklyProfit: 0,
        weeklyLoss: 0,
        weeklyNetProfit: 0,  // ✅ CORRIGIDO: Campo estava faltando
        totalTrades: 0,
        profitableTrades: 0,  // ✅ CORRIGIDO: Campo estava faltando
        losingTrades: 0,  // ✅ CORRIGIDO: Campo estava faltando
        winRate: 0,
        profitFactor: 0,
        hasHistory: false,
        openPositions: accountState?.OrderStates?.length || 0
      };
    }

    // Filtrar trades fechados
    const closedTrades = tradeHistory.filter(t =>
      t.TransactionType === 'ORDER_CLOSED' ||
      t.TransactionType === 'POSITION_CLOSED'
    );

    // Calcular métricas
    let totalVolume = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let profitableTrades = 0;
    let losingTrades = 0;

    // Filtrar trades dos últimos 7 dias
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const weekTrades = closedTrades.filter(trade => {
      if (trade.CloseTime || trade.TransactionTimestamp) {
        const tradeDate = new Date(trade.CloseTime || trade.TransactionTimestamp / 1000000);
        return tradeDate >= sevenDaysAgo;
      }
      return false;
    });

    weekTrades.forEach(trade => {
      // Volume
      if (trade.Volume) {
        totalVolume += trade.Volume;
      }

      // Profit/Loss
      const netProfit = trade.NetProfit || trade.Profit || 0;
      if (netProfit > 0) {
        profitableTrades++;
        totalProfit += netProfit;
      } else if (netProfit < 0) {
        losingTrades++;
        totalLoss += Math.abs(netProfit);
      }
    });

    const winRate = weekTrades.length > 0
      ? (profitableTrades / weekTrades.length) * 100
      : 0;

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
    const netProfit = totalProfit - totalLoss;

    return {
      weeklyVolume: totalVolume,
      weeklyProfit: totalProfit,
      weeklyLoss: totalLoss,
      weeklyNetProfit: netProfit,  // Lucro líquido (profit - loss)
      totalTrades: weekTrades.length,
      profitableTrades: profitableTrades,
      losingTrades: losingTrades,
      winRate: winRate,
      profitFactor: profitFactor,
      hasHistory: weekTrades.length > 0,
      openPositions: accountState?.OrderStates?.length || 0
    };
  }

  /**
   * Buscar lucro semanal de uma conta GMI Edge
   * @param {string} accountNumber - Número da conta
   * @returns {Promise<Object>} Métricas semanais
   */
  async getWeeklyProfit(accountNumber) {
    try {
      // 1. Buscar histórico dos últimos 7 dias
      const history = await this.getTradeHistory(accountNumber, 7);

      // 2. Buscar estado atual da conta
      const accountState = await this.getAccountState(accountNumber);

      // 3. Calcular métricas semanais
      const weeklyMetrics = this.calculateWeeklyMetrics(history, accountState);

      logger.info(`[GMI Edge] Lucro semanal da conta ${accountNumber}: $${weeklyMetrics.weeklyNetProfit.toFixed(2)}`);

      return weeklyMetrics;
    } catch (error) {
      logger.error(`[GMI Edge] Erro ao buscar lucro semanal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar e conectar, incluindo busca de histórico
   * @param {string} accountNumber
   * @param {string} password
   * @param {string} server
   * @returns {Promise<{accountInfo, accountState, tokens, history, metrics}>}
   */
  async validateAndConnectWithHistory(accountNumber, password, server = 'GMIEdge-Live') {
    try {
      // 1. Fazer login e validar credenciais
      const tokens = await this.login(accountNumber, password, server);

      // 2. Buscar informações da conta
      const accountInfo = await this.getAccountInfo(accountNumber);

      // 3. Buscar estado financeiro
      const accountState = await this.getAccountState(accountNumber);

      // 4. Buscar histórico de trades (últimos 30 dias)
      const history = await this.getTradeHistory(accountNumber, 30);

      // 5. Calcular métricas
      const metrics = this.calculateMetrics(history, accountState);

      return {
        accountInfo,
        accountState,
        tokens,
        history,
        metrics
      };
    } catch (error) {
      logger.error(`[GMI Edge] Falha na validação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obter API URL para uma conta (helper privado)
   * @private
   */
  _getApiUrlForAccount(accountNumber) {
    const cached = this.tokenCache.get(accountNumber);
    if (cached && cached.server) {
      return this.apiUrls[cached.server];
    }
    return null;
  }

  /**
   * Obter token válido do cache (helper privado)
   * @private
   */
  _getValidToken(accountNumber) {
    const cached = this.tokenCache.get(accountNumber);

    if (!cached) {
      return null;
    }

    // Verificar se o token expirou (1 hora = 3600000 ms)
    const now = Date.now();
    const expired = (now - cached.timestamp) > 3600000;

    if (expired) {
      logger.warn(`[GMI Edge] Token expirado para conta ${accountNumber}`);
      return null;
    }

    return cached.accessToken;
  }

  /**
   * Remove tokens do cache (logout)
   * @param {string} accountNumber
   */
  logout(accountNumber) {
    this.tokenCache.delete(accountNumber);
    logger.info(`[GMI Edge] Logout da conta ${accountNumber}`);
  }
}

export default new GMIEdgeService();
