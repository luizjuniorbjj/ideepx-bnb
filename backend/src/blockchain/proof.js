// ================================================================================
// INTEGRAÇÃO BLOCKCHAIN - PROOF + RULEBOOK SYSTEM
// ================================================================================
// Conexão com contratos iDeepXProofFinal e iDeepXRulebookImmutable
// Deployed em BSC Testnet

import { config } from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do backend/ primeiro, se não existir tenta do root
config({ path: path.join(__dirname, '../../.env') });
if (!process.env.PRIVATE_KEY) {
  config({ path: path.join(__dirname, '../../../.env') });
}

// ================================================================================
// 1. CARREGAR ABIs
// ================================================================================

const ProofABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../abis/iDeepXProofFinal.json'), 'utf8')
).abi;

const RulebookABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../abis/iDeepXRulebookImmutable.json'), 'utf8')
).abi;

// ================================================================================
// 2. CONFIGURAÇÃO DE REDE
// ================================================================================

// RPC URL (testnet por padrão)
const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545';

// Lazy initialization
let _provider, _wallet, _proofContract, _rulebookContract;

function initializeProvider() {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('🔗 Blockchain Provider inicializado');
    console.log('📍 RPC URL:', RPC_URL);
  }
  return _provider;
}

function initializeWallet() {
  if (!_wallet) {
    const provider = initializeProvider();
    // Adicionar prefixo "0x" se necessário
    let privateKey = process.env.PRIVATE_KEY;
    console.log('🔍 PRIVATE_KEY raw:', privateKey ? `${privateKey.substring(0,6)}...${privateKey.substring(privateKey.length-4)} (${privateKey.length} chars)` : 'undefined');
    if (privateKey && !privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    console.log('🔍 PRIVATE_KEY processed:', privateKey ? `${privateKey.substring(0,6)}...${privateKey.substring(privateKey.length-4)} (${privateKey.length} chars)` : 'undefined');
    _wallet = new ethers.Wallet(privateKey, provider);
    console.log('🔑 Backend Wallet:', _wallet.address);
  }
  return _wallet;
}

// Endereços dos contratos (testnet)
const PROOF_ADDRESS = process.env.PROOF_CONTRACT_ADDRESS || '0x620dA2A17Eb2C2fA39D03e47737f485D1C0194Aa';
const RULEBOOK_ADDRESS = process.env.RULEBOOK_ADDRESS || '0x7A09383b65c07dc525bA0aF1b63DBe14a375aa2B';

function initializeContracts() {
  if (!_proofContract) {
    const wallet = initializeWallet();
    const provider = initializeProvider();

    _proofContract = new ethers.Contract(
      PROOF_ADDRESS,
      ProofABI,
      wallet
    );

    _rulebookContract = new ethers.Contract(
      RULEBOOK_ADDRESS,
      RulebookABI,
      provider
    );

    console.log('📄 Proof Contract:', PROOF_ADDRESS);
    console.log('📚 Rulebook Contract:', RULEBOOK_ADDRESS);
  }

  return { proofContract: _proofContract, rulebookContract: _rulebookContract };
}

// Getters para lazy initialization
export const provider = () => initializeProvider();
export const wallet = () => initializeWallet();
export const proofContract = () => initializeContracts().proofContract;
export const rulebookContract = () => initializeContracts().rulebookContract;

// ================================================================================
// 4. FUNÇÕES DE LEITURA - RULEBOOK
// ================================================================================

/**
 * Buscar informações do plano de comissões (Rulebook)
 */
export async function getRulebookInfo() {
  try {
    const contract = rulebookContract();
    const [ipfsCid, contentHash, deployedAt, version, planName] = await Promise.all([
      contract.ipfsCid(),
      contract.contentHash(),
      contract.deployedAt(),
      contract.VERSION(),
      contract.PLAN_NAME()
    ]);

    return {
      ipfsCid,
      contentHash,
      deployedAt: Number(deployedAt),
      version,
      planName,
      address: RULEBOOK_ADDRESS
    };
  } catch (error) {
    console.error('❌ Erro ao buscar Rulebook info:', error);
    throw error;
  }
}

/**
 * Verificar hash do plano
 */
export async function verifyPlanHash(jsonContent) {
  try {
    const calculatedHash = ethers.keccak256(ethers.toUtf8Bytes(jsonContent));
    const contractHash = await rulebookContract().contentHash();

    return {
      match: calculatedHash === contractHash,
      calculatedHash,
      contractHash
    };
  } catch (error) {
    console.error('❌ Erro ao verificar hash:', error);
    throw error;
  }
}

// ================================================================================
// 5. FUNÇÕES DE LEITURA - PROOF
// ================================================================================

/**
 * Buscar informações básicas do Proof contract
 */
export async function getProofInfo() {
  try {
    const contract = proofContract();
    const [owner, backend, rulebookAddr, paused, totalProofs] = await Promise.all([
      contract.owner(),
      contract.backend(),
      contract.rulebook(),
      contract.paused(),
      contract.totalProofsSubmitted()
    ]);

    return {
      owner,
      backend,
      rulebookAddress: rulebookAddr,
      paused,
      totalProofs: Number(totalProofs),
      address: PROOF_ADDRESS
    };
  } catch (error) {
    console.error('❌ Erro ao buscar Proof info:', error);
    throw error;
  }
}

/**
 * Buscar prova de uma semana específica pelo TIMESTAMP
 * @param {number} weekTimestamp - Timestamp Unix do início da semana
 */
export async function getWeeklyProof(weekTimestamp) {
  try {
    const proof = await proofContract().weeklyProofs(weekTimestamp);

    // Struct retorna array: [weekTimestamp, ipfsHash, totalUsers, totalCommissions, totalProfits, submitter, submittedAt, finalized]
    return {
      weekTimestamp: Number(proof[0]),
      ipfsHash: proof[1],
      totalUsers: Number(proof[2]),
      totalCommissions: (Number(proof[3]) / 1000000).toFixed(2), // USDT 6 decimals
      totalProfits: (Number(proof[4]) / 1000000).toFixed(2), // USDT 6 decimals
      submittedBy: proof[5], // Frontend espera submittedBy
      timestamp: Number(proof[6]), // Frontend espera timestamp
      finalized: proof[7],
      // Adicionar data formatada
      weekDate: new Date(Number(proof[0]) * 1000).toISOString(),
      weekNumber: null // Será preenchido quando buscar via allWeeks
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar prova do timestamp ${weekTimestamp}:`, error);
    throw error;
  }
}

/**
 * Buscar últimas N provas
 */
export async function getLatestProofs(count = 10) {
  try {
    const contract = proofContract();
    const totalProofs = await contract.totalProofsSubmitted();
    const total = Number(totalProofs);

    if (total === 0) {
      return [];
    }

    // Buscar timestamps das semanas do array allWeeks
    const startIndex = Math.max(0, total - count);
    const promises = [];

    for (let i = startIndex; i < total; i++) {
      promises.push(contract.allWeeks(i));
    }

    const weekTimestamps = await Promise.all(promises);

    // Buscar dados de cada proof usando os timestamps
    const proofPromises = weekTimestamps.map((timestamp, index) =>
      getWeeklyProof(Number(timestamp)).then(proof => ({
        ...proof,
        weekNumber: startIndex + index + 1 // Adicionar weekNumber sequencial
      }))
    );

    const proofs = await Promise.all(proofPromises);
    return proofs.reverse(); // Mais recente primeiro
  } catch (error) {
    console.error('❌ Erro ao buscar últimas provas:', error);
    throw error;
  }
}

/**
 * Verificar se semana já foi submetida
 */
export async function isWeekSubmitted(weekNumber) {
  try {
    const proof = await proofContract().weeklyProofs(weekNumber);
    return proof.finalized;
  } catch (error) {
    console.error(`❌ Erro ao verificar semana ${weekNumber}:`, error);
    throw error;
  }
}

// ================================================================================
// 6. FUNÇÕES DE ESCRITA - PROOF (APENAS BACKEND/OWNER)
// ================================================================================

/**
 * Submeter prova semanal (Monday 00:00)
 */
export async function submitWeeklyProof(weekData) {
  try {
    const { weekNumber, ipfsHash, totalUsers, totalCommissions, totalProfits } = weekData;

    // Converter valores para formato correto
    const commissionsWei = ethers.parseUnits(totalCommissions.toString(), 6); // USDT 6 decimals
    const profitsWei = ethers.parseUnits(totalProfits.toString(), 6);

    console.log(`📤 Submetendo prova da semana ${weekNumber}...`);
    console.log('   IPFS Hash:', ipfsHash);
    console.log('   Total Users:', totalUsers);
    console.log('   Total Commissions:', totalCommissions, 'USDT');
    console.log('   Total Profits:', totalProfits, 'USDT');

    const tx = await proofContract().submitWeeklyProof(
      weekNumber,
      ipfsHash,
      totalUsers,
      commissionsWei,
      profitsWei
    );

    console.log('⏳ TX enviada:', tx.hash);
    console.log('⏳ Aguardando confirmação...');

    const receipt = await tx.wait();

    console.log('✅ Prova submetida com sucesso!');
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas usado:', receipt.gasUsed.toString());

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('❌ Erro ao submeter prova:', error);
    throw error;
  }
}

/**
 * Finalizar prova semanal (após verificação)
 */
export async function finalizeWeeklyProof(weekNumber) {
  try {
    console.log(`🔒 Finalizando prova da semana ${weekNumber}...`);

    const tx = await proofContract().finalizeWeek(weekNumber);

    console.log('⏳ TX enviada:', tx.hash);
    const receipt = await tx.wait();

    console.log('✅ Prova finalizada com sucesso!');
    console.log('   Block:', receipt.blockNumber);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ Erro ao finalizar prova:', error);
    throw error;
  }
}

/**
 * Pausar/Despausar contrato (emergência)
 */
export async function setPaused(paused) {
  try {
    console.log(`${paused ? '⏸️ Pausando' : '▶️ Despausando'} contrato...`);

    const contract = proofContract();
    const tx = paused
      ? await contract.pause()
      : await contract.unpause();

    const receipt = await tx.wait();

    console.log(`✅ Contrato ${paused ? 'pausado' : 'despausado'} com sucesso!`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ Erro ao mudar status pause:', error);
    throw error;
  }
}

// ================================================================================
// 7. EVENTOS - LISTENERS
// ================================================================================

/**
 * Escutar evento ProofSubmitted
 */
export function listenProofSubmitted(callback) {
  const contract = proofContract();
  contract.on('ProofSubmitted', (weekNumber, ipfsHash, totalUsers, event) => {
    callback({
      weekNumber: Number(weekNumber),
      ipfsHash,
      totalUsers: Number(totalUsers),
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber
    });
  });
  console.log('👂 Listening to ProofSubmitted events...');
}

/**
 * Escutar evento ProofFinalized
 */
export function listenProofFinalized(callback) {
  const contract = proofContract();
  contract.on('ProofFinalized', (weekNumber, event) => {
    callback({
      weekNumber: Number(weekNumber),
      txHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber
    });
  });
  console.log('👂 Listening to ProofFinalized events...');
}

/**
 * Parar de escutar todos os eventos
 */
export function stopListening() {
  const contract = proofContract();
  contract.removeAllListeners();
  console.log('🔇 Stopped listening to events');
}

// ================================================================================
// 8. TESTE DE CONEXÃO
// ================================================================================

/**
 * Testar conexão com contratos
 */
export async function testConnection() {
  console.log('\n🔍 TESTANDO CONEXÃO COM CONTRATOS...\n');

  try {
    // Test network
    const network = await provider().getNetwork();
    console.log('✅ Network:', network.name, `(chainId: ${network.chainId})`);

    // Test wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('✅ Backend Wallet Balance:', ethers.formatEther(balance), 'BNB');

    // Test Rulebook
    console.log('\n📚 RULEBOOK INFO:');
    const rulebookInfo = await getRulebookInfo();
    console.log('   IPFS CID:', rulebookInfo.ipfsCid);
    console.log('   Content Hash:', rulebookInfo.contentHash);
    console.log('   Version:', rulebookInfo.version);
    console.log('   Plan Name:', rulebookInfo.planName);
    console.log('   Deployed At:', new Date(rulebookInfo.deployedAt * 1000).toISOString());

    // Test Proof
    console.log('\n📄 PROOF CONTRACT INFO:');
    const proofInfo = await getProofInfo();
    console.log('   Owner:', proofInfo.owner);
    console.log('   Backend:', proofInfo.backend);
    console.log('   Rulebook:', proofInfo.rulebookAddress);
    console.log('   Paused:', proofInfo.paused);
    console.log('   Total Proofs:', proofInfo.totalProofs);

    // Test latest proofs
    if (proofInfo.totalProofs > 0) {
      console.log('\n📊 ÚLTIMAS PROVAS:');
      const latestProofs = await getLatestProofs(5);
      latestProofs.forEach(proof => {
        console.log(`   Semana ${proof.weekNumber}:`);
        console.log(`     IPFS: ${proof.ipfsHash}`);
        console.log(`     Users: ${proof.totalUsers}`);
        console.log(`     Comissões: ${proof.totalCommissions} USDT`);
        console.log(`     Finalizada: ${proof.finalized ? '✅' : '❌'}`);
      });
    } else {
      console.log('\n📊 Nenhuma prova submetida ainda');
    }

    console.log('\n✅ CONEXÃO OK! Contratos funcionando corretamente.\n');
    return true;
  } catch (error) {
    console.error('\n❌ ERRO NA CONEXÃO:', error);
    throw error;
  }
}

// ================================================================================
// EXPORTAR TUDO
// ================================================================================

export default {
  // Contratos
  provider,
  wallet,
  proofContract,
  rulebookContract,

  // Rulebook
  getRulebookInfo,
  verifyPlanHash,

  // Proof - Read
  getProofInfo,
  getWeeklyProof,
  getLatestProofs,
  isWeekSubmitted,

  // Proof - Write
  submitWeeklyProof,
  finalizeWeeklyProof,
  setPaused,

  // Events
  listenProofSubmitted,
  listenProofFinalized,
  stopListening,

  // Utils
  testConnection
};
