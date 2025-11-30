/**
 * 🤖 BOT DE SIMULAÇÃO MLM - iDeepX
 *
 * Bot que simula atividade realista no contrato MLM em testnet:
 * - Cria usuários automaticamente
 * - Registra e ativa assinaturas
 * - Distribui na rede MLM (múltiplos níveis)
 * - Gera fluxo contínuo de transações
 * - Detecta erros automaticamente
 *
 * USO:
 * node backend/scripts/mlm-activity-bot.js
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURAÇÕES DO BOT
// ============================================================================

const CONFIG = {
  // 🌐 Rede
  RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  CHAIN_ID: 97,

  // 📝 Contratos
  MLM_CONTRACT: '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef',
  USDT_CONTRACT: '0x6B38Da364B41880fc20B8eF88E7045AC4AAd2cdA',

  // 💰 Financeiro (VALORES DO CONTRATO V10)
  SUBSCRIPTION_FEE: '29', // $29 USDT (conforme contrato V10)
  BNB_FOR_GAS: '0.003', // BNB por usuário para gas (OTIMIZADO: 0.003 é suficiente!)

  // 🎯 Comportamento do Bot
  USERS_TO_CREATE: 50, // Quantos usuários criar
  ACTIVATION_RATE: 0.8, // 80% dos usuários ativam assinatura
  MAX_CHILDREN_PER_SPONSOR: 5, // Máximo de filhos diretos por sponsor

  // ⏱️ Delays (em ms)
  DELAY_BETWEEN_USERS: 3000, // 3 segundos entre cada usuário
  DELAY_BETWEEN_ACTIONS: 1500, // 1.5 segundos entre ações do mesmo usuário

  // 🔐 Segurança
  TESTNET_ONLY: true, // Só funciona em testnet
  MAX_GAS_PRICE: ethers.parseUnits('10', 'gwei'), // Máximo 10 gwei

  // 📊 Logs
  SAVE_PROGRESS: true, // Salvar progresso em arquivo
  PROGRESS_FILE: 'mlm-bot-progress.json',
  LOG_FILE: 'mlm-bot-activity.log'
};

// ============================================================================
// STATE DO BOT
// ============================================================================

const STATE = {
  // Carteiras criadas
  users: [],

  // Estatísticas
  stats: {
    usersCreated: 0,
    usersRegistered: 0,
    usersActivated: 0,
    totalGasUsed: '0',
    errors: [],
    startTime: null,
    endTime: null
  },

  // Carteira principal (deployer com BNB e USDT)
  deployer: null,

  // Contratos
  mlmContract: null,
  usdtContract: null,

  // Provider
  provider: null
};

// ============================================================================
// ABIs
// ============================================================================

const MLM_ABI = [
  'function selfRegister(address sponsor) external',
  'function selfSubscribe() external',
  'function getUserInfo(address) external view returns (address wallet, address sponsor, bool isRegistered, bool subscriptionActive, uint256 subscriptionTimestamp, uint256 subscriptionExpiration, uint256 totalEarned, uint256 totalWithdrawn, uint256 directReferrals)',
  'function isRegistered(address) external view returns (bool)'
];

const USDT_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function mint(address to, uint256 amount) external'
];

// ============================================================================
// LOGGER
// ============================================================================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    bot: '🤖'
  }[type] || 'ℹ️';

  const logMessage = `[${timestamp}] ${emoji} ${message}`;
  console.log(logMessage);

  // Salvar em arquivo
  if (CONFIG.LOG_FILE) {
    const logPath = path.join(__dirname, CONFIG.LOG_FILE);
    fs.appendFileSync(logPath, logMessage + '\n');
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Delay assíncrono
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Salvar progresso em arquivo
 */
function saveProgress() {
  if (!CONFIG.SAVE_PROGRESS) return;

  const progressPath = path.join(__dirname, CONFIG.PROGRESS_FILE);
  fs.writeFileSync(progressPath, JSON.stringify({
    config: CONFIG,
    users: STATE.users,
    stats: STATE.stats
  }, null, 2));

  log(`Progresso salvo em ${CONFIG.PROGRESS_FILE}`, 'info');
}

/**
 * Carregar progresso de arquivo (se existir)
 */
function loadProgress() {
  if (!CONFIG.SAVE_PROGRESS) return false;

  const progressPath = path.join(__dirname, CONFIG.PROGRESS_FILE);

  if (!fs.existsSync(progressPath)) {
    return false;
  }

  try {
    const data = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    STATE.users = data.users || [];
    STATE.stats = data.stats || STATE.stats;

    log(`Progresso carregado: ${STATE.users.length} usuários existentes`, 'success');
    return true;
  } catch (error) {
    log(`Erro ao carregar progresso: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Verificar se está em testnet
 */
async function verifyTestnet() {
  const network = await STATE.provider.getNetwork();
  const chainId = Number(network.chainId);

  if (chainId !== CONFIG.CHAIN_ID) {
    throw new Error(`❌ ERRO: Rede errada! Esperado: ${CONFIG.CHAIN_ID}, Atual: ${chainId}`);
  }

  if (CONFIG.TESTNET_ONLY && chainId === 56) {
    throw new Error('❌ ERRO: Bot configurado para TESTNET ONLY, mas detectou MAINNET!');
  }

  log(`Rede verificada: BSC Testnet (Chain ID: ${chainId})`, 'success');
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

async function initialize() {
  log('🚀 Inicializando Bot de Simulação MLM...', 'bot');

  // 1. Conectar ao provider
  STATE.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  log(`Conectado ao RPC: ${CONFIG.RPC_URL}`, 'info');

  // 2. Verificar testnet
  await verifyTestnet();

  // 3. Carregar carteira deployer
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('❌ PRIVATE_KEY não encontrada no .env');
  }

  STATE.deployer = new ethers.Wallet(privateKey, STATE.provider);
  const balance = await STATE.provider.getBalance(STATE.deployer.address);

  log(`Deployer: ${STATE.deployer.address}`, 'info');
  log(`Saldo BNB: ${ethers.formatEther(balance)} BNB`, 'info');

  // 4. Conectar aos contratos
  STATE.mlmContract = new ethers.Contract(CONFIG.MLM_CONTRACT, MLM_ABI, STATE.deployer);
  STATE.usdtContract = new ethers.Contract(CONFIG.USDT_CONTRACT, USDT_ABI, STATE.deployer);

  log(`MLM Contract: ${CONFIG.MLM_CONTRACT}`, 'info');
  log(`USDT Contract: ${CONFIG.USDT_CONTRACT}`, 'info');

  // 5. Verificar saldo USDT do deployer
  const usdtBalance = await STATE.usdtContract.balanceOf(STATE.deployer.address);
  log(`Saldo USDT: ${ethers.formatUnits(usdtBalance, 6)} USDT`, 'info');

  // 6. Carregar progresso anterior (se existir)
  loadProgress();

  log('✅ Inicialização completa!\n', 'success');
}

// ============================================================================
// FUNÇÕES DO BOT
// ============================================================================

/**
 * Criar nova carteira de usuário
 */
async function createUser(index) {
  log(`\n📝 Criando usuário #${index + 1}...`, 'bot');

  try {
    // 1. Gerar carteira aleatória
    const wallet = ethers.Wallet.createRandom().connect(STATE.provider);

    log(`   Endereço: ${wallet.address}`, 'info');
    log(`   Private Key: ${wallet.privateKey}`, 'info');

    // 2. Enviar BNB para gas
    const bnbAmount = ethers.parseEther(CONFIG.BNB_FOR_GAS);
    log(`   Enviando ${CONFIG.BNB_FOR_GAS} BNB para gas...`, 'info');

    const bnbTx = await STATE.deployer.sendTransaction({
      to: wallet.address,
      value: bnbAmount
    });
    await bnbTx.wait();

    log(`   ✅ BNB enviado (${bnbTx.hash.slice(0, 10)}...)`, 'success');

    // 3. Mintar USDT (MockUSDT permite mint)
    const usdtAmount = ethers.parseUnits(CONFIG.SUBSCRIPTION_FEE, 6);
    log(`   Mintando ${CONFIG.SUBSCRIPTION_FEE} USDT...`, 'info');

    const mintTx = await STATE.usdtContract.mint(wallet.address, usdtAmount);
    await mintTx.wait();

    log(`   ✅ USDT mintado (${mintTx.hash.slice(0, 10)}...)`, 'success');

    // 4. Salvar usuário
    const user = {
      index: index + 1,
      address: wallet.address,
      privateKey: wallet.privateKey,
      createdAt: new Date().toISOString(),
      registered: false,
      activated: false,
      sponsor: null,
      children: []
    };

    STATE.users.push(user);
    STATE.stats.usersCreated++;

    log(`   ✅ Usuário #${index + 1} criado com sucesso!`, 'success');

    return user;

  } catch (error) {
    log(`   ❌ Erro ao criar usuário: ${error.message}`, 'error');
    STATE.stats.errors.push({
      action: 'createUser',
      index: index + 1,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

/**
 * Registrar usuário no contrato (selfRegister)
 */
async function registerUser(user, sponsor) {
  log(`\n📋 Registrando usuário ${user.address}...`, 'bot');

  try {
    // Conectar carteira do usuário
    const wallet = new ethers.Wallet(user.privateKey, STATE.provider);
    const mlmContract = STATE.mlmContract.connect(wallet);

    // Verificar se já está registrado
    const isReg = await mlmContract.isRegistered(user.address);
    if (isReg) {
      log(`   ⚠️ Usuário já registrado!`, 'warning');
      user.registered = true;
      return true;
    }

    // Registrar
    log(`   Sponsor: ${sponsor}`, 'info');
    const tx = await mlmContract.selfRegister(sponsor);
    const receipt = await tx.wait();

    log(`   ✅ Registrado! Gas usado: ${receipt.gasUsed.toString()}`, 'success');
    log(`   TX: ${tx.hash}`, 'info');

    // Atualizar estado
    user.registered = true;
    user.sponsor = sponsor;
    STATE.stats.usersRegistered++;

    return true;

  } catch (error) {
    log(`   ❌ Erro ao registrar: ${error.message}`, 'error');
    STATE.stats.errors.push({
      action: 'registerUser',
      user: user.address,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Ativar assinatura do usuário (selfSubscribe)
 */
async function activateUser(user) {
  log(`\n💳 Ativando assinatura para ${user.address}...`, 'bot');

  try {
    // Conectar carteira do usuário
    const wallet = new ethers.Wallet(user.privateKey, STATE.provider);
    const mlmContract = STATE.mlmContract.connect(wallet);
    const usdtContract = STATE.usdtContract.connect(wallet);

    // 1. Aprovar USDT
    const usdtAmount = ethers.parseUnits(CONFIG.SUBSCRIPTION_FEE, 6);
    log(`   Aprovando ${CONFIG.SUBSCRIPTION_FEE} USDT...`, 'info');

    const approveTx = await usdtContract.approve(CONFIG.MLM_CONTRACT, usdtAmount);
    await approveTx.wait();

    log(`   ✅ USDT aprovado`, 'success');

    // 2. Ativar assinatura
    log(`   Chamando selfSubscribe()...`, 'info');

    const tx = await mlmContract.selfSubscribe();
    const receipt = await tx.wait();

    log(`   ✅ Assinatura ativada! Gas usado: ${receipt.gasUsed.toString()}`, 'success');
    log(`   TX: ${tx.hash}`, 'info');

    // Atualizar estado
    user.activated = true;
    STATE.stats.usersActivated++;

    return true;

  } catch (error) {
    log(`   ❌ Erro ao ativar: ${error.message}`, 'error');
    STATE.stats.errors.push({
      action: 'activateUser',
      user: user.address,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Escolher sponsor inteligentemente
 * Distribui usuários para evitar concentração
 */
function chooseSponsor() {
  // Se não há usuários registrados, usar o deployer
  if (STATE.users.filter(u => u.registered).length === 0) {
    return STATE.deployer.address;
  }

  // Buscar usuários registrados com menos filhos
  const registeredUsers = STATE.users.filter(u => u.registered);

  // Ordenar por número de filhos (menos filhos primeiro)
  registeredUsers.sort((a, b) => a.children.length - b.children.length);

  // Pegar um dos 3 com menos filhos (randomizado)
  const topCandidates = registeredUsers.slice(0, Math.min(3, registeredUsers.length));
  const sponsor = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  return sponsor.address;
}

/**
 * Adicionar filho ao sponsor
 */
function addChildToSponsor(sponsorAddress, childAddress) {
  if (sponsorAddress === STATE.deployer.address) {
    return; // Deployer não está na lista de users
  }

  const sponsor = STATE.users.find(u => u.address === sponsorAddress);
  if (sponsor) {
    sponsor.children.push(childAddress);
  }
}

// ============================================================================
// FLUXO PRINCIPAL
// ============================================================================

async function runBot() {
  try {
    // 1. Inicializar
    await initialize();

    STATE.stats.startTime = new Date().toISOString();

    // 2. Criar e processar usuários
    log(`\n🤖 Iniciando criação de ${CONFIG.USERS_TO_CREATE} usuários...\n`, 'bot');
    log(`⚙️ Configurações:`, 'info');
    log(`   - Taxa de ativação: ${CONFIG.ACTIVATION_RATE * 100}%`, 'info');
    log(`   - Delay entre usuários: ${CONFIG.DELAY_BETWEEN_USERS}ms`, 'info');
    log(`   - Delay entre ações: ${CONFIG.DELAY_BETWEEN_ACTIONS}ms\n`, 'info');

    for (let i = 0; i < CONFIG.USERS_TO_CREATE; i++) {
      log(`\n${'='.repeat(60)}`, 'info');
      log(`PROCESSANDO USUÁRIO ${i + 1}/${CONFIG.USERS_TO_CREATE}`, 'bot');
      log(`${'='.repeat(60)}`, 'info');

      // 1. Criar usuário
      const user = await createUser(i);
      if (!user) {
        log(`⚠️ Pulando usuário ${i + 1} devido a erro na criação`, 'warning');
        continue;
      }

      await sleep(CONFIG.DELAY_BETWEEN_ACTIONS);

      // 2. Escolher sponsor
      const sponsor = chooseSponsor();

      // 3. Registrar
      const registered = await registerUser(user, sponsor);
      if (!registered) {
        log(`⚠️ Pulando ativação do usuário ${i + 1} devido a erro no registro`, 'warning');
        continue;
      }

      // Adicionar como filho do sponsor
      addChildToSponsor(sponsor, user.address);

      await sleep(CONFIG.DELAY_BETWEEN_ACTIONS);

      // 4. Ativar (baseado na taxa de ativação)
      const shouldActivate = Math.random() < CONFIG.ACTIVATION_RATE;

      if (shouldActivate) {
        await activateUser(user);
      } else {
        log(`   ⏸️ Usuário não será ativado (simulando inativo)`, 'warning');
      }

      // 5. Salvar progresso
      saveProgress();

      // 6. Delay antes do próximo usuário
      if (i < CONFIG.USERS_TO_CREATE - 1) {
        log(`\n⏳ Aguardando ${CONFIG.DELAY_BETWEEN_USERS}ms antes do próximo usuário...`, 'info');
        await sleep(CONFIG.DELAY_BETWEEN_USERS);
      }
    }

    // 3. Finalizar
    STATE.stats.endTime = new Date().toISOString();

    log(`\n\n${'='.repeat(60)}`, 'success');
    log(`🎉 BOT FINALIZADO COM SUCESSO!`, 'success');
    log(`${'='.repeat(60)}\n`, 'success');

    printFinalReport();

  } catch (error) {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'error');
    console.error(error);

    // Salvar progresso mesmo em caso de erro
    saveProgress();
  }
}

/**
 * Imprimir relatório final
 */
function printFinalReport() {
  const duration = STATE.stats.endTime
    ? new Date(STATE.stats.endTime) - new Date(STATE.stats.startTime)
    : 0;

  const durationMinutes = Math.floor(duration / 1000 / 60);
  const durationSeconds = Math.floor((duration / 1000) % 60);

  log(`\n📊 RELATÓRIO FINAL:\n`, 'bot');
  log(`   ✅ Usuários criados: ${STATE.stats.usersCreated}`, 'success');
  log(`   ✅ Usuários registrados: ${STATE.stats.usersRegistered}`, 'success');
  log(`   ✅ Usuários ativados: ${STATE.stats.usersActivated}`, 'success');
  log(`   ⏱️ Duração: ${durationMinutes}m ${durationSeconds}s`, 'info');

  if (STATE.stats.errors.length > 0) {
    log(`   ⚠️ Erros encontrados: ${STATE.stats.errors.length}`, 'warning');
    STATE.stats.errors.forEach((err, i) => {
      log(`      ${i + 1}. ${err.action}: ${err.error}`, 'error');
    });
  }

  log(`\n📁 Arquivos gerados:`, 'info');
  log(`   - ${CONFIG.PROGRESS_FILE} (dados dos usuários)`, 'info');
  log(`   - ${CONFIG.LOG_FILE} (log completo)`, 'info');

  log(`\n🔗 Verificar no BSCScan:`, 'info');
  log(`   https://testnet.bscscan.com/address/${CONFIG.MLM_CONTRACT}\n`, 'info');
}

// ============================================================================
// EXECUTAR BOT
// ============================================================================

runBot().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
