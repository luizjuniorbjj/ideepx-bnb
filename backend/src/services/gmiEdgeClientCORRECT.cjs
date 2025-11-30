/**
 * GMI Edge API Client - IMPLEMENTAÇÃO CORRETA
 * Baseado na documentação oficial: GMI_Edge_API_Documentation2.md
 *
 * Diferenças da implementação anterior:
 * - Base URL correta: https://api.gmimarkets.com/v1
 * - Autenticação: POST /auth/login com {login, password, server}
 * - Usa mesmas credenciais do MT5 (não precisa BotId/Password separados)
 * - Token expira em 1 hora (não 24h)
 * - accountId obrigatório em todas as requisições
 */

const axios = require('axios');
const https = require('https');

class GMIEdgeClient {
  constructor(login, password, server) {
    // Base URL CORRETA da documentação oficial
    // Standard/ECN: https://live-edge-api.gmimarkets.com:7530/api/v1
    this.baseUrl = process.env.GMI_EDGE_API_URL || 'https://live-edge-api.gmimarkets.com:7530/api/v1';

    // Credenciais MT5 (mesmas da conta MT5!)
    this.accountLogin = login || process.env.MT5_LOGIN;
    this.accountPassword = password || process.env.MT5_PASSWORD;
    this.accountServer = server || process.env.MT5_SERVER || 'GMI3-Real';

    // Tokens
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    // Axios instance com SSL verification desabilitado (certificado inválido)
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
  }

  /**
   * Verifica se o token ainda é válido
   */
  isTokenValid() {
    if (!this.accessToken) return false;
    if (!this.expiresAt) return false;

    // Renovar 5 minutos antes de expirar
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() < (this.expiresAt - fiveMinutes);
  }

  /**
   * Autentica na API GMI Edge
   * Endpoint: POST /auth/login
   */
  async login() {
    try {
      console.log('🔐 [GMI] Autenticando...');
      console.log(`   Login: ${this.accountLogin}`);
      console.log(`   Server: ${this.accountServer}`);

      const response = await this.axiosInstance.post(`${this.baseUrl}/auth/login`, {
        login: this.accountLogin,
        password: this.accountPassword,
        server: this.accountServer
      });

      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken;

      // Token expira em expiresIn segundos (geralmente 3600 = 1 hora)
      const expiresIn = response.data.expiresIn || 3600;
      this.expiresAt = Date.now() + (expiresIn * 1000);

      const expiresInMinutes = Math.floor(expiresIn / 60);
      console.log(`✅ [GMI] Autenticado! Token expira em ${expiresInMinutes} minutos`);

      return this.accessToken;
    } catch (error) {
      console.error('❌ [GMI] Erro ao autenticar:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Renova o token usando refresh token
   * Endpoint: POST /auth/refresh
   */
  async refreshAccessToken() {
    try {
      console.log('🔄 [GMI] Renovando token...');

      const response = await this.axiosInstance.post(`${this.baseUrl}/auth/refresh`, {
        refreshToken: this.refreshToken
      });

      this.accessToken = response.data.accessToken;
      const expiresIn = response.data.expiresIn || 3600;
      this.expiresAt = Date.now() + (expiresIn * 1000);

      console.log('✅ [GMI] Token renovado!');
      return this.accessToken;
    } catch (error) {
      console.error('❌ [GMI] Erro ao renovar token:', error.response?.data || error.message);
      // Se refresh falhar, fazer login novamente
      return await this.login();
    }
  }

  /**
   * Garante que está autenticado antes de fazer requisição
   */
  async ensureAuthenticated() {
    if (!this.isTokenValid()) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        await this.login();
      }
    }
  }

  /**
   * Headers de autenticação
   */
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * GET /accounts - Listar contas disponíveis
   */
  async listAccounts() {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.get(`${this.baseUrl}/accounts`, {
        headers: this.getAuthHeaders()
      });

      return response.data.accounts;
    } catch (error) {
      console.error('❌ [GMI] Erro ao listar contas:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /accounts/{accountId}/info - Informações detalhadas da conta
   */
  async getAccountInfo() {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/accounts/${this.accountLogin}/info`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('❌ [GMI] Erro ao buscar info da conta:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /accounts/{accountId}/margin - Estado da margem
   */
  async getMarginState() {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/accounts/${this.accountLogin}/margin`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('❌ [GMI] Erro ao buscar estado da margem:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /positions - Lista posições abertas
   */
  async getPositions(symbol = null) {
    await this.ensureAuthenticated();

    try {
      const params = { accountId: this.accountLogin };
      if (symbol) params.symbol = symbol;

      const response = await this.axiosInstance.get(`${this.baseUrl}/positions`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data.positions || [];
    } catch (error) {
      console.error('❌ [GMI] Erro ao buscar posições:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * DELETE /positions/{positionId} - Fecha uma posição
   */
  async closePosition(positionId, volume = null) {
    await this.ensureAuthenticated();

    try {
      const payload = {
        accountId: this.accountLogin,
        volume: volume,
        deviation: 10
      };

      const response = await this.axiosInstance.delete(
        `${this.baseUrl}/positions/${positionId}`,
        {
          headers: this.getAuthHeaders(),
          data: payload
        }
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [GMI] Erro ao fechar posição ${positionId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /history/trades - Histórico de trades
   */
  async getHistory(days = 30, symbol = null, limit = 1000) {
    await this.ensureAuthenticated();

    try {
      const now = Date.now();
      const from = now - (days * 24 * 60 * 60 * 1000);

      const params = {
        accountId: this.accountLogin,
        from,
        to: now,
        limit
      };

      if (symbol) params.symbol = symbol;

      const response = await this.axiosInstance.get(`${this.baseUrl}/history/trades`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('❌ [GMI] Erro ao buscar histórico:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /symbols - Listar símbolos disponíveis
   */
  async listSymbols(category = null) {
    await this.ensureAuthenticated();

    try {
      const params = { accountId: this.accountLogin };
      if (category) params.category = category;

      const response = await this.axiosInstance.get(`${this.baseUrl}/symbols`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data.symbols;
    } catch (error) {
      console.error('❌ [GMI] Erro ao listar símbolos:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /symbols/{symbol} - Informações de um símbolo
   */
  async getSymbolInfo(symbol) {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/symbols/${symbol}`,
        {
          headers: this.getAuthHeaders(),
          params: { accountId: this.accountLogin }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [GMI] Erro ao buscar símbolo ${symbol}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET /price/{symbol} - Preço atual de um símbolo
   */
  async getCurrentPrice(symbol) {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/price/${symbol}`,
        {
          headers: this.getAuthHeaders(),
          params: { accountId: this.accountLogin }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`❌ [GMI] Erro ao buscar preço de ${symbol}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Calcula lucro/prejuízo mensal baseado no histórico
   */
  async calculateMonthlyPerformance() {
    try {
      // Buscar histórico do mês
      const history = await this.getHistory(30);

      if (!history || !history.summary) {
        return null;
      }

      // Buscar informações da conta
      const account = await this.getAccountInfo();

      const summary = history.summary;
      const balance = account.balance;

      // Calcular volume mensal (soma de todos os volumes dos trades)
      let monthlyVolume = 0;
      if (history.trades && history.trades.length > 0) {
        monthlyVolume = history.trades.reduce((sum, trade) => {
          return sum + (trade.volume * trade.openPrice);
        }, 0);
      }

      // Calcular percentual de lucro
      const profitPercentage = balance > 0
        ? (summary.totalNetProfit / balance) * 100
        : 0;

      return {
        // Dados da conta
        balance: balance.toFixed(2),
        equity: account.equity.toFixed(2),
        margin: account.margin.toFixed(2),
        freeMargin: account.freeMargin.toFixed(2),
        marginLevel: account.marginLevel.toFixed(2),
        profit: account.profit.toFixed(2),

        // Estatísticas mensais
        monthlyVolume: monthlyVolume.toFixed(2),
        totalTrades: summary.totalTrades,
        winningTrades: summary.winningTrades,
        losingTrades: summary.losingTrades,
        winRate: summary.winRate.toFixed(2),

        // Lucros e perdas
        grossProfit: summary.totalProfit.toFixed(2),
        totalCommission: summary.totalCommission.toFixed(2),
        totalSwap: summary.totalSwap.toFixed(2),
        netProfit: summary.totalNetProfit.toFixed(2),
        profitPercentage: profitPercentage.toFixed(2),

        // Metadados
        lastSync: new Date().toISOString(),
        connected: true
      };
    } catch (error) {
      console.error('❌ [GMI] Erro ao calcular performance mensal:', error.message);
      return null;
    }
  }

  /**
   * Busca dados completos para o dashboard
   */
  async getCompleteData() {
    try {
      console.log('📊 [GMI] Buscando dados completos...');

      // Buscar todos os dados em paralelo
      const [accountInfo, positions, performance] = await Promise.all([
        this.getAccountInfo(),
        this.getPositions(),
        this.calculateMonthlyPerformance()
      ]);

      console.log('✅ [GMI] Dados completos obtidos!');

      return {
        account: accountInfo,
        positions,
        performance,
        connected: true,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [GMI] Erro ao buscar dados completos:', error.message);
      throw error;
    }
  }
}

module.exports = GMIEdgeClient;
