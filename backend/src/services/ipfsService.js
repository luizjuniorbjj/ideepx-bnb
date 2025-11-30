// ================================================================================
// SERVIÇO IPFS - PINATA INTEGRATION
// ================================================================================
// Upload e download de snapshots semanais via Pinata (IPFS)

import axios from 'axios';
import FormData from 'form-data';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do root
config({ path: path.join(__dirname, '../../../.env') });

// ================================================================================
// CONFIGURAÇÃO PINATA
// ================================================================================

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Validar credenciais
if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  logger.warn('⚠️ Credenciais Pinata não configuradas no .env');
}

// ================================================================================
// FUNÇÕES DE UPLOAD
// ================================================================================

/**
 * Upload de snapshot semanal para IPFS via Pinata
 * @param {Object} snapshotData - Dados do snapshot (objeto JSON)
 * @param {Object} metadata - Metadata do arquivo (opcional)
 * @returns {Promise<Object>} { ipfsHash, pinSize, timestamp, url }
 */
export async function uploadSnapshot(snapshotData, metadata = {}) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Credenciais Pinata não configuradas');
    }

    logger.info(`📤 Iniciando upload snapshot para IPFS...`);

    // Converter objeto para JSON string e depois para Buffer
    const jsonString = JSON.stringify(snapshotData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf8');

    // Criar FormData
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `snapshot-week-${snapshotData.weekNumber || snapshotData.week}.json`,
      contentType: 'application/json'
    });

    // Metadata do pin
    const pinataMetadata = {
      name: metadata.name || `iDeepX-Week-${snapshotData.weekNumber || snapshotData.week}`,
      keyvalues: {
        week: (snapshotData.weekNumber || snapshotData.week).toString(),
        timestamp: snapshotData.timestamp?.toString() || Date.now().toString(),
        totalUsers: snapshotData.summary?.totalUsers?.toString() || snapshotData.totalUsers?.toString() || '0',
        totalCommissions: snapshotData.summary?.totalCommissions?.toString() || '0',
        type: 'weekly-snapshot',
        version: snapshotData.version || '1.0.0',
        ...metadata.keyvalues
      }
    };

    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    // Opções de pinning
    const pinataOptions = {
      cidVersion: 0,
    };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    // Fazer upload
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity
      }
    );

    const { IpfsHash, PinSize, Timestamp } = response.data;

    logger.info(`✅ Upload concluído!`);
    logger.info(`   IPFS Hash: ${IpfsHash}`);
    logger.info(`   Size: ${PinSize} bytes`);
    logger.info(`   Timestamp: ${Timestamp}`);

    return {
      ipfsHash: IpfsHash,
      pinSize: PinSize,
      timestamp: Timestamp,
      url: `${PINATA_GATEWAY}/ipfs/${IpfsHash}`,
      gateway: PINATA_GATEWAY,
      metadata: pinataMetadata
    };
  } catch (error) {
    logger.error('❌ Erro ao fazer upload para IPFS:', error.message);
    if (error.response) {
      logger.error('   Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Upload de arquivo genérico (JSON, text, etc)
 */
export async function uploadFile(content, filename, metadata = {}) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Credenciais Pinata não configuradas');
    }

    logger.info(`📤 Uploading file: ${filename}`);

    const buffer = Buffer.from(
      typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      'utf8'
    );

    const formData = new FormData();
    formData.append('file', buffer, { filename });

    if (Object.keys(metadata).length > 0) {
      formData.append('pinataMetadata', JSON.stringify(metadata));
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
          ...formData.getHeaders()
        }
      }
    );

    logger.info(`✅ File uploaded: ${response.data.IpfsHash}`);

    return {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
      url: `${PINATA_GATEWAY}/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    logger.error('❌ Erro ao fazer upload:', error.message);
    throw error;
  }
}

// ================================================================================
// FUNÇÕES DE DOWNLOAD
// ================================================================================

/**
 * Buscar snapshot do IPFS
 * @param {string} ipfsHash - Hash IPFS do snapshot
 * @returns {Promise<Object>} Dados do snapshot
 */
export async function getSnapshot(ipfsHash) {
  try {
    logger.info(`📥 Buscando snapshot do IPFS: ${ipfsHash}`);

    const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    const response = await axios.get(url, {
      timeout: 30000, // 30 segundos
      headers: {
        'Accept': 'application/json'
      }
    });

    logger.info(`✅ Snapshot recuperado com sucesso`);
    logger.info(`   Size: ${JSON.stringify(response.data).length} bytes`);

    return response.data;
  } catch (error) {
    logger.error(`❌ Erro ao buscar snapshot do IPFS:`, error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout ao buscar snapshot do IPFS');
    }
    throw error;
  }
}

/**
 * Buscar conteúdo genérico do IPFS
 */
export async function getIPFSContent(ipfsHash) {
  try {
    const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    const response = await axios.get(url, { timeout: 30000 });
    return response.data;
  } catch (error) {
    logger.error(`❌ Erro ao buscar conteúdo IPFS:`, error.message);
    throw error;
  }
}

/**
 * Verificar se hash IPFS existe
 */
export async function verifyIPFSHash(ipfsHash) {
  try {
    const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    const response = await axios.head(url, { timeout: 10000 });
    return response.status === 200;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    logger.error(`❌ Erro ao verificar hash IPFS:`, error.message);
    throw error;
  }
}

// ================================================================================
// GERENCIAMENTO DE PINS
// ================================================================================

/**
 * Listar todos os pins
 * @param {Object} filters - Filtros (status, metadata, etc)
 * @returns {Promise<Array>} Lista de pins
 */
export async function listPins(filters = {}) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Credenciais Pinata não configuradas');
    }

    const params = {
      status: filters.status || 'pinned',
      pageLimit: filters.limit || 10,
      pageOffset: filters.offset || 0
    };

    // Filtros de metadata
    if (filters.metadata) {
      Object.keys(filters.metadata).forEach((key, index) => {
        params[`metadata[keyvalues][${key}]`] = filters.metadata[key];
      });
    }

    const response = await axios.get(
      'https://api.pinata.cloud/data/pinList',
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        params
      }
    );

    return response.data.rows || [];
  } catch (error) {
    logger.error('❌ Erro ao listar pins:', error.message);
    throw error;
  }
}

/**
 * Listar snapshots por semana
 */
export async function listSnapshotsByWeek(weekNumber) {
  try {
    return await listPins({
      metadata: {
        week: weekNumber.toString(),
        type: 'weekly-snapshot'
      }
    });
  } catch (error) {
    logger.error(`❌ Erro ao listar snapshots da semana ${weekNumber}:`, error.message);
    throw error;
  }
}

/**
 * Listar todos os snapshots
 */
export async function listAllSnapshots(limit = 100) {
  try {
    return await listPins({
      metadata: {
        type: 'weekly-snapshot'
      },
      limit
    });
  } catch (error) {
    logger.error('❌ Erro ao listar snapshots:', error.message);
    throw error;
  }
}

/**
 * Remover pin (CUIDADO!)
 */
export async function unpinFile(ipfsHash) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Credenciais Pinata não configuradas');
    }

    logger.warn(`⚠️ Removendo pin: ${ipfsHash}`);

    await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );

    logger.info(`✅ Pin removido: ${ipfsHash}`);
    return { success: true, ipfsHash };
  } catch (error) {
    logger.error('❌ Erro ao remover pin:', error.message);
    throw error;
  }
}

// ================================================================================
// UTILITÁRIOS
// ================================================================================

/**
 * Testar conexão com Pinata
 */
export async function testPinataConnection() {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Credenciais Pinata não configuradas no .env');
    }

    logger.info('🔍 Testando conexão com Pinata...');

    // Testar autenticação
    const response = await axios.get(
      'https://api.pinata.cloud/data/testAuthentication',
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );

    logger.info('✅ Pinata autenticado com sucesso!');
    logger.info('   Message:', response.data.message);

    return {
      success: true,
      authenticated: true,
      message: response.data.message
    };
  } catch (error) {
    logger.error('❌ Erro ao testar Pinata:', error.message);
    return {
      success: false,
      authenticated: false,
      error: error.message
    };
  }
}

/**
 * Obter estatísticas do Pinata
 */
export async function getPinataStats() {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Credenciais Pinata não configuradas');
    }

    const response = await axios.get(
      'https://api.pinata.cloud/data/userPinnedDataTotal',
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );

    return {
      totalPins: response.data.pin_count,
      totalSize: response.data.pin_size_total,
      totalSizeGB: (response.data.pin_size_total / (1024 ** 3)).toFixed(2)
    };
  } catch (error) {
    logger.error('❌ Erro ao buscar stats Pinata:', error.message);
    throw error;
  }
}

// ================================================================================
// EXPORTAR
// ================================================================================

export default {
  // Upload
  uploadSnapshot,
  uploadFile,

  // Download
  getSnapshot,
  getIPFSContent,
  verifyIPFSHash,

  // Gerenciamento
  listPins,
  listSnapshotsByWeek,
  listAllSnapshots,
  unpinFile,

  // Utilitários
  testPinataConnection,
  getPinataStats
};
