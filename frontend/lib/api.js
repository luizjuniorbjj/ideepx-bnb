/**
 * ============================================================================
 * API Service - Frontend
 * ============================================================================
 * Comunicação com backend iDeepX V10
 */

const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10) || 60000; // 60 segundos

class ApiService {
  constructor() {
    this.timeout = TIMEOUT;
    this.token = null;
  }

  /**
   * Retorna a URL base da API
   * IMPORTANTE: Usa o proxy do Next.js para evitar problemas de CORS
   */
  getApiUrl() {
    // Sempre usar o proxy relativo do Next.js
    // O Next.js fará proxy de /api/* para http://localhost:5001/api/*
    // (configurado em next.config.js)
    return '/api';
  }

  /**
   * Define token JWT
   */
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Obtém token do localStorage
   */
  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Remove token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Request genérico
   */
  async request(method, endpoint, data = null, requiresAuth = false) {
    const baseUrl = this.getApiUrl();
    const url = `${baseUrl}${endpoint}`;

    console.log(`🌐 [API] ${method} ${url}`);
    if (data) {
      console.log(`📤 [API] Body:`, data);
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error(`⏱️ [API] TIMEOUT após ${this.timeout}ms`);
        controller.abort();
      }, this.timeout);

      console.log(`⏳ [API] Aguardando resposta... (timeout: ${this.timeout}ms)`);
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`✅ [API] Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ [API] Resposta com erro! Status: ${response.status}`);
        const errorBody = await response.text();
        console.error(`❌ [API] Error body:`, errorBody);

        let errorData;
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = { error: 'Request failed', details: errorBody };
        }

        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`📥 [API] Resposta:`, responseData);
      return responseData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`⏱️ [API] Request abortado (timeout)`);
        throw new Error('Request timeout - A requisição demorou muito para responder');
      }
      console.error(`❌ [API] Erro [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ============================================================================
  // HEALTH
  // ============================================================================

  async health() {
    return this.request('GET', '/health');
  }

  // ============================================================================
  // AUTH - SIWE
  // ============================================================================

  async siweStart(walletAddress) {
    return this.request('POST', '/auth/siwe/start', { walletAddress });
  }

  async siweVerify(message, signature) {
    const response = await this.request('POST', '/auth/siwe/verify', { message, signature });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // ============================================================================
  // USER
  // ============================================================================

  async getMe(address = null) {
    // Em desenvolvimento sem auth, usar endereço diretamente
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('GET', `/dev/user/${address}`, null, false);
    }
    return this.request('GET', '/user/me', null, true);
  }

  async getMlmStats(address = null) {
    // Em desenvolvimento sem auth, usar endereço diretamente
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('GET', `/dev/user/${address}/mlm/stats`, null, false);
    }
    return this.request('GET', '/user/mlm/stats', null, true);
  }

  async getEligibility(address = null) {
    // Em desenvolvimento sem auth, usar endereço diretamente
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('GET', `/dev/user/${address}/eligibility`, null, false);
    }
    return this.request('GET', '/user/eligibility', null, true);
  }

  async getReferrals(address = null) {
    // Em desenvolvimento sem auth, usar endereço diretamente
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('GET', `/dev/user/${address}/referrals`, null, false);
    }
    return this.request('GET', '/user/referrals', null, true);
  }

  // GMI Edge API - usa BotId e Password (não accountNumber e investorPassword)
  async linkGmiAccount(botId, password, server, address = null) {
    // Em desenvolvimento sem auth, usar endereço diretamente
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('POST', '/dev/link-gmi', { address, botId, password, server }, false);
    }
    return this.request('POST', '/link-gmi', { botId, password, server }, true);
  }

  async disconnectGmiAccount(address = null) {
    // Em desenvolvimento sem auth, usar endereço diretamente
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('POST', '/dev/disconnect-gmi', { address }, false);
    }
    return this.request('POST', '/disconnect-gmi', null, true);
  }

  // Obter lucro semanal da conta GMI Edge
  async getWeeklyProfit(address = null) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('GET', `/dev/gmi/weekly-profit/${address}`, null, false);
    }
    return this.request('GET', '/gmi/weekly-profit', null, true);
  }

  // ============================================================================
  // MT5 / MT4 INTEGRATION
  // ============================================================================

  // Obter estatísticas MT5 de um usuário
  async getMT5Stats(address) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && address) {
      return this.request('GET', `/mt5/stats/${address}`, null, false);
    }
    return this.request('GET', '/mt5/stats', null, true);
  }

  // Dev: Simular dados MT5 (para testes sem EA)
  async mockMT5Sync(address) {
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
      throw new Error('Mock sync only available in development mode');
    }
    return this.request('POST', '/dev/mt5/mock-sync', { address }, false);
  }

  // ============================================================================
  // ADMIN
  // ============================================================================

  async getSystemStats() {
    // Em desenvolvimento, usar rota pública sem autenticação
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return this.request('GET', '/dev/stats', null, false);
    }
    return this.request('GET', '/admin/system', null, true);
  }

  async syncEligibility() {
    // Em desenvolvimento, usar rota pública sem autenticação
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return this.request('POST', '/dev/sync/eligibility', null, false);
    }
    return this.request('POST', '/admin/sync/eligibility', null, true);
  }

  async getJobsStatus() {
    // Em desenvolvimento, usar rota pública sem autenticação
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return this.request('GET', '/dev/jobs', null, false);
    }
    return this.request('GET', '/admin/jobs/status', null, true);
  }

  async runJob(jobName) {
    // Em desenvolvimento, usar rota pública sem autenticação
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return this.request('POST', `/dev/jobs/run/${jobName}`, null, false);
    }
    return this.request('POST', `/admin/jobs/run/${jobName}`, null, true);
  }

  // Sacar saldo interno
  async withdraw(address, amount) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      // Em dev mode, chamar endpoint mock
      return this.request('POST', '/dev/withdraw', { address, amount }, false);
    }
    // Em produção, usar o endpoint autenticado
    return this.request('POST', '/withdraw', { address, amount }, true);
  }

  // Ativar assinatura usando saldo interno
  async activateWithBalance(address) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      // Em dev mode, chamar endpoint mock
      return this.request('POST', '/dev/activate-with-balance', { address }, false);
    }
    // Em produção, usar o endpoint autenticado
    return this.request('POST', '/activate-with-balance', { address }, true);
  }

  // Ativar assinatura de usuário na rede
  async activateNetworkUser(payerAddress, targetAddress) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return this.request('POST', '/dev/activate-network-user', { payerAddress, targetAddress }, false);
    }
    return this.request('POST', '/activate-network-user', { payerAddress, targetAddress }, true);
  }

  // Listar usuários inativos na rede (até 10 níveis)
  async getNetworkInactive(address) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return this.request('GET', `/dev/network-inactive/${address}`, null, false);
    }
    return this.request('GET', `/network-inactive/${address}`, null, true);
  }

  // ============================================================================
  // BLOCKCHAIN - PROOF SYSTEM
  // ============================================================================

  // Obter informações do Rulebook
  async getRulebookInfo() {
    return this.request('GET', '/blockchain/rulebook', null, false);
  }

  // Obter informações do contrato Proof
  async getProofInfo() {
    return this.request('GET', '/blockchain/proof', null, false);
  }

  // Obter prova de uma semana específica
  async getWeeklyProof(weekNumber) {
    return this.request('GET', `/blockchain/proofs/${weekNumber}`, null, false);
  }

  // Obter últimas N provas
  async getLatestProofs(count = 10) {
    const response = await this.request('GET', `/blockchain/proofs?limit=${count}`, null, false);
    return response.data?.proofs || response;
  }

  // Obter snapshot do IPFS
  async getIPFSSnapshot(ipfsHash) {
    return this.request('GET', `/blockchain/ipfs/${ipfsHash}`, null, false);
  }
}

export default new ApiService();
