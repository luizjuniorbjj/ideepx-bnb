/**
 * Cliente GMI Edge API
 * Documentação: https://gmimarkets.com/gmi-edge-api-documentation
 */

const axios = require('axios');

class GMIEdgeClient {
  constructor(apiUrl, botId, password) {
    this.apiUrl = apiUrl || process.env.GMI_EDGE_API_URL || 'https://api.gmimarkets.com';
    this.botId = botId || process.env.GMI_EDGE_BOT_ID;
    this.password = password || process.env.GMI_EDGE_PASSWORD;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Verifica se o token ainda é válido
   */
  isTokenValid() {
    if (!this.accessToken) return false;
    if (!this.tokenExpiry) return true; // Sem expiração conhecida, assume válido
    return Date.now() < this.tokenExpiry;
  }

  /**
   * Autentica e obtém access token
   */
  async login() {
    try {
      const response = await axios.post(`${this.apiUrl}/login`, {
        BotId: this.botId,
        Password: this.password
      });

      this.checkResponse(response);
      this.accessToken = response.data.AccessToken;

      // Assumir que o token expira em 24 horas (ajustar conforme necessário)
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);

      console.log('✅ GMI Edge: Autenticado com sucesso');
      return this.accessToken;
    } catch (error) {
      console.error('❌ GMI Edge: Erro ao autenticar:', error.message);
      throw error;
    }
  }

  /**
   * Garante que está autenticado antes de fazer requisição
   */
  async ensureAuthenticated() {
    if (!this.isTokenValid()) {
      await this.login();
    }
  }

  /**
   * Headers de autenticação
   */
  getAuthHeaders() {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call login() first.');
    }
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Verifica resposta da API
   */
  checkResponse(response) {
    if (response.status === 200 || response.status === 201) {
      return;
    }

    const errorData = response.data || {};
    const errorCode = errorData.Code || response.status;
    const errorMessage = errorData.Error || response.statusText || 'Unknown error';

    throw new Error(`GMI Edge API Error [${errorCode}]: ${errorMessage}`);
  }

  /**
   * GET /accountstate - Busca dados da conta
   */
  async getAccountState() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(`${this.apiUrl}/accountstate`, {
        headers: this.getAuthHeaders()
      });

      this.checkResponse(response);
      return response.data;
    } catch (error) {
      console.error('❌ GMI Edge: Erro ao buscar account state:', error.message);
      throw error;
    }
  }

  /**
   * GET /positionlist - Lista posições abertas
   */
  async getPositions() {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get(`${this.apiUrl}/positionlist`, {
        headers: this.getAuthHeaders()
      });

      this.checkResponse(response);
      return response.data.Orders || [];
    } catch (error) {
      console.error('❌ GMI Edge: Erro ao buscar posições:', error.message);
      throw error;
    }
  }

  /**
   * POST /closeposition - Fecha uma posição
   */
  async closePosition(orderId) {
    await this.ensureAuthenticated();

    try {
      const response = await axios.post(
        `${this.apiUrl}/closeposition`,
        { OrderId: orderId },
        { headers: this.getAuthHeaders() }
      );

      this.checkResponse(response);
      return response.data;
    } catch (error) {
      console.error(`❌ GMI Edge: Erro ao fechar posição ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * POST /sendorder - Cria nova ordem
   */
  async sendOrder({ symbol, side, amount, orderType = 'MARKET', stopLoss, takeProfit }) {
    await this.ensureAuthenticated();

    const orderData = {
      Symbol: symbol,
      OrderSide: side, // 'BUY' ou 'SELL'
      OrderType: orderType,
      Amount: amount
    };

    if (stopLoss) orderData.StopLoss = stopLoss;
    if (takeProfit) orderData.TakeProfit = takeProfit;

    try {
      const response = await axios.post(
        `${this.apiUrl}/sendorder`,
        orderData,
        { headers: this.getAuthHeaders() }
      );

      this.checkResponse(response);
      return response.data;
    } catch (error) {
      console.error('❌ GMI Edge: Erro ao enviar ordem:', error.message);
      throw error;
    }
  }

  /**
   * POST /symbolinfo - Busca informações do símbolo
   */
  async getSymbolInfo(symbol) {
    await this.ensureAuthenticated();

    try {
      const response = await axios.post(
        `${this.apiUrl}/symbolinfo`,
        { Symbol: symbol },
        { headers: this.getAuthHeaders() }
      );

      this.checkResponse(response);
      return response.data;
    } catch (error) {
      console.error(`❌ GMI Edge: Erro ao buscar info do símbolo ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Calcula estatísticas mensais baseado em OrderStates
   */
  calculateMonthlyStats(orderStates) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let monthlyVolume = 0;
    let monthlyProfit = 0;
    let monthlyLoss = 0;
    let monthlyTrades = 0;

    for (const order of orderStates) {
      // Parse OpenTime
      const openTime = new Date(order.OpenTime);

      if (openTime >= monthStart) {
        // Volume (Amount * OpenPrice)
        monthlyVolume += order.Amount * order.OpenPrice;
        monthlyTrades += 1;

        // Lucro/Prejuízo
        const profit = order.Profit || 0;
        if (profit > 0) {
          monthlyProfit += profit;
        } else {
          monthlyLoss += Math.abs(profit);
        }
      }
    }

    return {
      volume: monthlyVolume.toFixed(2),
      profit: monthlyProfit.toFixed(2),
      loss: monthlyLoss.toFixed(2),
      trades: monthlyTrades,
      netProfit: (monthlyProfit - monthlyLoss).toFixed(2)
    };
  }

  /**
   * Busca dados completos da conta + estatísticas mensais
   */
  async getCompleteAccountData() {
    const accountState = await this.getAccountState();

    const balance = accountState.AccountState?.Balance || 0;
    const equity = accountState.AccountState?.Equity || 0;
    const profit = accountState.AccountState?.Profit || 0;
    const orderStates = accountState.OrderStates || [];

    // Calcular estatísticas mensais
    const monthlyStats = this.calculateMonthlyStats(orderStates);

    return {
      balance: balance.toFixed(2),
      equity: equity.toFixed(2),
      profit: profit.toFixed(2),
      monthlyVolume: monthlyStats.volume,
      monthlyProfit: monthlyStats.profit,
      monthlyLoss: monthlyStats.loss,
      totalTrades: monthlyStats.trades,
      netProfit: monthlyStats.netProfit,
      connected: true,
      lastSync: new Date().toISOString()
    };
  }
}

module.exports = GMIEdgeClient;
