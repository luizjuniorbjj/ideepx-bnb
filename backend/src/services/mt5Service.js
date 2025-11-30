/**
 * 🔌 MT5 SERVICE - Integração com MetaTrader 5
 *
 * Este serviço executa o script Python que conecta ao MT5
 * e retorna dados da conta de trading.
 *
 * Fluxo:
 * 1. Backend Node.js chama este serviço
 * 2. Serviço executa sync-mt5-real.py via child_process
 * 3. Python conecta ao MT5 e retorna JSON
 * 4. Serviço processa e retorna dados estruturados
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executa script Python e retorna resultado
 * @param {string} scriptName - Nome do script Python
 * @param {Array} args - Argumentos para o script
 * @returns {Promise<Object>} - Dados do MT5
 */
async function executePythonScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', scriptName);

    console.log(`🐍 [MT5Service] Executando: python ${scriptPath}`);

    const pythonProcess = spawn('python', [scriptPath, ...args]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ [MT5Service] Python error (code ${code}):`, stderr);
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }

      try {
        // Procurar JSON na saída (pode ter outros prints antes)
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          console.error('❌ [MT5Service] No JSON found in output:', stdout);
          reject(new Error('No JSON output from Python script'));
          return;
        }

        const data = JSON.parse(jsonMatch[0]);
        console.log('✅ [MT5Service] Dados recebidos do Python');
        resolve(data);
      } catch (error) {
        console.error('❌ [MT5Service] JSON parse error:', error.message);
        console.error('stdout:', stdout);
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('❌ [MT5Service] Process error:', error);
      reject(error);
    });
  });
}

/**
 * Obtém dados completos da conta MT5
 * @param {string} walletAddress - Endereço da carteira (para associar com usuário)
 * @returns {Promise<Object>} - Dados da conta
 */
export async function getMT5AccountData(walletAddress) {
  try {
    console.log(`📊 [MT5Service] Buscando dados MT5 para: ${walletAddress}`);

    const startTime = Date.now();
    const data = await executePythonScript('get-mt5-data.py');
    const endTime = Date.now();

    console.log(`⚡ [MT5Service] Dados obtidos em ${endTime - startTime}ms`);

    // Estruturar dados conforme esperado pelo frontend
    return {
      success: true,
      connected: data.connected || false,
      account: {
        login: data.login || process.env.MT5_LOGIN,
        server: data.server || process.env.MT5_SERVER,
        balance: parseFloat(data.balance || 0),
        equity: parseFloat(data.equity || 0),
        margin: parseFloat(data.margin || 0),
        freeMargin: parseFloat(data.free_margin || 0),
        marginLevel: parseFloat(data.margin_level || 0),
        profit: parseFloat(data.profit || 0),
        credit: parseFloat(data.credit || 0),
        leverage: parseInt(data.leverage || 0),
        currency: data.currency || 'USD',
      },
      performance: {
        monthlyVolume: parseFloat(data.monthly_volume || 0),
        totalTrades: parseInt(data.total_trades || 0),
        profitTrades: parseInt(data.profit_trades || 0),
        lossTrades: parseInt(data.loss_trades || 0),
        winRate: parseFloat(data.win_rate || 0),
        grossProfit: parseFloat(data.gross_profit || 0),
        grossLoss: parseFloat(data.gross_loss || 0),
        netProfit: parseFloat(data.net_profit || 0),
        profitFactor: parseFloat(data.profit_factor || 0),
      },
      positions: data.positions || [],
      lastUpdate: new Date().toISOString(),
      syncTime: endTime - startTime,
    };
  } catch (error) {
    console.error('❌ [MT5Service] Error:', error.message);

    return {
      success: false,
      connected: false,
      error: error.message,
      account: null,
      performance: null,
      positions: [],
      lastUpdate: new Date().toISOString(),
    };
  }
}

/**
 * Calcula elegibilidade baseado em volume MT5 real
 * @param {string} walletAddress - Endereço da carteira
 * @param {number} directReferrals - Número de referrals diretos ativos
 * @returns {Promise<Object>} - Elegibilidade calculada
 */
export async function calculateMT5Eligibility(walletAddress, directReferrals = 0) {
  try {
    const mt5Data = await getMT5AccountData(walletAddress);

    if (!mt5Data.success || !mt5Data.connected) {
      return {
        eligible: false,
        maxLevel: 1, // Default se não conectado
        reason: 'MT5 not connected',
        volumeRequirement: 5000,
        currentVolume: 0,
        directsRequirement: 5,
        currentDirects: directReferrals,
      };
    }

    const monthlyVolume = mt5Data.performance.monthlyVolume;
    const volumeRequirement = parseFloat(process.env.MLM_UNLOCK_REQUIREMENT_VOLUME || 5000);
    const directsRequirement = parseInt(process.env.MLM_UNLOCK_REQUIREMENT_DIRECTS || 5);

    // Verificar se atende requisitos
    const hasVolumeRequirement = monthlyVolume >= volumeRequirement;
    const hasDirectsRequirement = directReferrals >= directsRequirement;
    const eligible = hasVolumeRequirement && hasDirectsRequirement;

    // Calcular nível máximo baseado em volume
    let maxLevel = 1; // Default

    if (eligible) {
      // L1-L4: Desbloqueado com requisitos mínimos
      // L5-L10: Pode ter requisitos adicionais de volume
      if (monthlyVolume >= volumeRequirement * 10) {
        maxLevel = 10; // Volume 10x = todos os níveis
      } else if (monthlyVolume >= volumeRequirement * 5) {
        maxLevel = 7;
      } else if (monthlyVolume >= volumeRequirement * 2) {
        maxLevel = 4;
      } else if (monthlyVolume >= volumeRequirement) {
        maxLevel = 4; // Volume mínimo = L1-L4
      }
    }

    return {
      eligible,
      maxLevel,
      reason: eligible ? 'Eligible' : 'Does not meet requirements',
      volumeRequirement,
      currentVolume: monthlyVolume,
      directsRequirement,
      currentDirects: directReferrals,
      volumeMultiplier: (monthlyVolume / volumeRequirement).toFixed(2),
    };
  } catch (error) {
    console.error('❌ [MT5Service] Eligibility calculation error:', error.message);

    return {
      eligible: false,
      maxLevel: 1,
      reason: 'Error calculating eligibility',
      error: error.message,
    };
  }
}

export default {
  getMT5AccountData,
  calculateMT5Eligibility,
};
