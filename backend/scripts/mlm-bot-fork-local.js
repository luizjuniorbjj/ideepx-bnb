/**
 * 🤖 BOT DE SIMULAÇÃO MLM - FORK LOCAL (BNB ILIMITADO!)
 *
 * Versão otimizada para rodar em Hardhat fork local da BSC.
 *
 * VANTAGENS:
 * - ✅ BNB ILIMITADO (você imprime!)
 * - ✅ Mining instantâneo (sem espera)
 * - ✅ 1000+ usuários em minutos
 * - ✅ Reset fácil se der erro
 * - ✅ Debug completo (console.log funciona)
 *
 * SETUP:
 * 1. Terminal 1: npx hardhat node (mantém rodando)
 * 2. Terminal 2: node backend/scripts/mlm-bot-fork-local.js
 *
 * USO:
 * node backend/scripts/mlm-bot-fork-local.js
 */

import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURAÇÕES DO BOT (FORK LOCAL)
// ============================================================================

const CONFIG = {
  // 📝 Contratos (serão deployados automaticamente no fork!)
  DEPLOY_CONTRACTS: true, // Se true, deploya contratos antes de testar

  // 💰 Financeiro (VALORES DO CONTRATO V10)
  SUBSCRIPTION_FEE: '29', // $29 USDT (conforme contrato)
  BNB_FOR_GAS: '0.1', // Pode usar MUITO BNB no fork (é ilimitado!)

  // 🎯 Comportamento do Bot
  USERS_TO_CREATE: 100, // Quantos usuários criar (pode ser 1000+ no fork!)
  ACTIVATION_RATE: 0.8, // 80% dos usuários ativam assinatura
  MAX_CHILDREN_PER_SPONSOR: 5, // Máximo de filhos diretos por sponsor

  // ⏱️ Delays (MUITO MENORES no fork local!)
  DELAY_BETWEEN_USERS: 100, // 0.1 segundo (fork é instantâneo!)
  DELAY_BETWEEN_ACTIONS: 50, // 0.05 segundos

  // 📊 Logs
  SAVE_PROGRESS: true,
  PROGRESS_FILE: 'mlm-bot-fork-progress.json',
  LOG_FILE: 'mlm-bot-fork-activity.log'
};

// ============================================================================
// STATE DO BOT
// ============================================================================

const STATE = {
  users: [],
  stats: {
    usersCreated: 0,
    usersRegistered: 0,
    usersActivated: 0,
    totalGasUsed: '0',
    errors: [],
    startTime: null,
    endTime: null
  },
  deployer: null,
  mlmContract: null,
  usdtContract: null,
  accounts: [] // Contas pré-financiadas do Hardhat
};

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
    bot: '🤖',
    rocket: '🚀'
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveProgress() {
  if (!CONFIG.SAVE_PROGRESS) return;

  const progressPath = path.join(__dirname, CONFIG.PROGRESS_FILE);
  fs.writeFileSync(progressPath, JSON.stringify({
    config: CONFIG,
    users: STATE.users,
    stats: STATE.stats,
    contracts: {
      mlm: STATE.mlmContract?.target,
      usdt: STATE.usdtContract?.target
    }
  }, null, 2));
}

// ============================================================================
// DEPLOY DOS CONTRATOS (FORK LOCAL)
// ============================================================================

async function deployContracts() {
  log('\n🚀 Deployando contratos no fork local...', 'rocket');

  try {
    // 1. Deploy MockUSDT
    log('   Deployando MockUSDT...', 'info');
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    STATE.usdtContract = await MockUSDT.deploy();
    await STATE.usdtContract.waitForDeployment();

    log(`   ✅ MockUSDT: ${STATE.usdtContract.target}`, 'success');

    // 2. Deploy iDeepXDistributionV2
    log('   Deployando iDeepXDistributionV2...', 'info');
    const MLMContract = await ethers.getContractFactory('iDeepXDistributionV2');
    STATE.mlmContract = await MLMContract.deploy(STATE.usdtContract.target);
    await STATE.mlmContract.waitForDeployment();

    log(`   ✅ MLM Contract: ${STATE.mlmContract.target}`, 'success');

    log('\n✅ Contratos deployados com sucesso!\n', 'success');

    return true;

  } catch (error) {
    log(`❌ Erro ao deployar contratos: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

async function initialize() {
  log('🚀 Inicializando Bot de Simulação MLM (FORK LOCAL)...', 'bot');

  // 1. Obter contas do Hardhat (100 contas com 10k BNB cada!)
  STATE.accounts = await ethers.getSigners();
  STATE.deployer = STATE.accounts[0];

  const balance = await ethers.provider.getBalance(STATE.deployer.address);

  log(`Deployer: ${STATE.deployer.address}`, 'info');
  log(`Saldo BNB: ${ethers.formatEther(balance)} BNB 💰`, 'success');
  log(`Contas disponíveis: ${STATE.accounts.length}`, 'info');

  // 2. Deploy contratos (se configurado)
  if (CONFIG.DEPLOY_CONTRACTS) {
    await deployContracts();
  } else {
    log('⚠️ Deploy de contratos desativado. Configure endereços manualmente.', 'warning');
  }

  log('✅ Inicialização completa!\n', 'success');
}

// ============================================================================
// FUNÇÕES DO BOT
// ============================================================================

/**
 * Criar novo usuário (usa conta do Hardhat já financiada!)
 */
async function createUser(index) {
  log(`\n📝 Criando usuário #${index + 1}...`, 'bot');

  try {
    // Usar conta do Hardhat (já tem BNB!)
    const accountIndex = (index % STATE.accounts.length) + 1; // +1 para pular deployer
    const signer = STATE.accounts[accountIndex];

    log(`   Usando conta Hardhat #${accountIndex}`, 'info');
    log(`   Endereço: ${signer.address}`, 'info');

    const balance = await ethers.provider.getBalance(signer.address);
    log(`   Saldo BNB: ${ethers.formatEther(balance)} BNB`, 'success');

    // Mintar USDT para o usuário
    const usdtAmount = ethers.parseUnits(CONFIG.SUBSCRIPTION_FEE, 6);
    log(`   Mintando ${CONFIG.SUBSCRIPTION_FEE} USDT...`, 'info');

    const mintTx = await STATE.usdtContract.mint(signer.address, usdtAmount);
    await mintTx.wait();

    log(`   ✅ USDT mintado`, 'success');

    // Salvar usuário
    const user = {
      index: index + 1,
      address: signer.address,
      accountIndex: accountIndex,
      createdAt: new Date().toISOString(),
      registered: false,
      activated: false,
      sponsor: null,
      children: []
    };

    STATE.users.push(user);
    STATE.stats.usersCreated++;

    log(`   ✅ Usuário #${index + 1} criado!`, 'success');

    return user;

  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'error');
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
 * Registrar usuário no contrato
 */
async function registerUser(user, sponsor) {
  log(`\n📋 Registrando usuário ${user.address.slice(0, 10)}...`, 'bot');

  try {
    const signer = STATE.accounts[user.accountIndex];
    const mlmContract = STATE.mlmContract.connect(signer);

    log(`   Sponsor: ${sponsor}`, 'info');
    const tx = await mlmContract.selfRegister(sponsor);
    const receipt = await tx.wait();

    log(`   ✅ Registrado! Gas: ${receipt.gasUsed.toString()}`, 'success');

    user.registered = true;
    user.sponsor = sponsor;
    STATE.stats.usersRegistered++;

    return true;

  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'error');
    STATE.stats.errors.push({
      action: 'registerUser',
      user: user.address,
      error: error.message
    });
    return false;
  }
}

/**
 * Ativar assinatura
 */
async function activateUser(user) {
  log(`\n💳 Ativando assinatura ${user.address.slice(0, 10)}...`, 'bot');

  try {
    const signer = STATE.accounts[user.accountIndex];
    const mlmContract = STATE.mlmContract.connect(signer);
    const usdtContract = STATE.usdtContract.connect(signer);

    const usdtAmount = ethers.parseUnits(CONFIG.SUBSCRIPTION_FEE, 6);

    // 1. Aprovar
    log(`   Aprovando USDT...`, 'info');
    const approveTx = await usdtContract.approve(STATE.mlmContract.target, usdtAmount);
    await approveTx.wait();

    // 2. Ativar
    log(`   Ativando...`, 'info');
    const tx = await mlmContract.selfSubscribe();
    const receipt = await tx.wait();

    log(`   ✅ Ativado! Gas: ${receipt.gasUsed.toString()}`, 'success');

    user.activated = true;
    STATE.stats.usersActivated++;

    return true;

  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'error');
    STATE.stats.errors.push({
      action: 'activateUser',
      user: user.address,
      error: error.message
    });
    return false;
  }
}

/**
 * Escolher sponsor inteligentemente
 */
function chooseSponsor() {
  if (STATE.users.filter(u => u.registered).length === 0) {
    return STATE.deployer.address;
  }

  const registeredUsers = STATE.users.filter(u => u.registered);
  registeredUsers.sort((a, b) => a.children.length - b.children.length);

  const topCandidates = registeredUsers.slice(0, Math.min(3, registeredUsers.length));
  const sponsor = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  return sponsor.address;
}

/**
 * Adicionar filho ao sponsor
 */
function addChildToSponsor(sponsorAddress, childAddress) {
  if (sponsorAddress === STATE.deployer.address) return;

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
    await initialize();

    STATE.stats.startTime = new Date().toISOString();

    log(`\n🤖 Iniciando criação de ${CONFIG.USERS_TO_CREATE} usuários...\n`, 'bot');
    log(`⚡ Configurações (FORK LOCAL):`, 'info');
    log(`   - BNB ILIMITADO! 💰`, 'success');
    log(`   - Mining instantâneo ⚡`, 'success');
    log(`   - Taxa de ativação: ${CONFIG.ACTIVATION_RATE * 100}%`, 'info');
    log(`   - Delay entre usuários: ${CONFIG.DELAY_BETWEEN_USERS}ms\n`, 'info');

    for (let i = 0; i < CONFIG.USERS_TO_CREATE; i++) {
      log(`\n${'='.repeat(60)}`, 'info');
      log(`PROCESSANDO USUÁRIO ${i + 1}/${CONFIG.USERS_TO_CREATE}`, 'bot');
      log(`${'='.repeat(60)}`, 'info');

      // 1. Criar
      const user = await createUser(i);
      if (!user) continue;

      await sleep(CONFIG.DELAY_BETWEEN_ACTIONS);

      // 2. Escolher sponsor
      const sponsor = chooseSponsor();

      // 3. Registrar
      const registered = await registerUser(user, sponsor);
      if (!registered) continue;

      addChildToSponsor(sponsor, user.address);

      await sleep(CONFIG.DELAY_BETWEEN_ACTIONS);

      // 4. Ativar (baseado na taxa)
      const shouldActivate = Math.random() < CONFIG.ACTIVATION_RATE;

      if (shouldActivate) {
        await activateUser(user);
      } else {
        log(`   ⏸️ Usuário inativo (simulação)`, 'warning');
      }

      // 5. Salvar progresso
      saveProgress();

      // 6. Delay
      if (i < CONFIG.USERS_TO_CREATE - 1) {
        await sleep(CONFIG.DELAY_BETWEEN_USERS);
      }
    }

    STATE.stats.endTime = new Date().toISOString();

    log(`\n\n${'='.repeat(60)}`, 'success');
    log(`🎉 BOT FINALIZADO!`, 'success');
    log(`${'='.repeat(60)}\n`, 'success');

    printFinalReport();

  } catch (error) {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'error');
    console.error(error);
    saveProgress();
  }
}

/**
 * Relatório final
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
    log(`   ⚠️ Erros: ${STATE.stats.errors.length}`, 'warning');
  }

  log(`\n📁 Arquivos gerados:`, 'info');
  log(`   - ${CONFIG.PROGRESS_FILE}`, 'info');
  log(`   - ${CONFIG.LOG_FILE}`, 'info');

  log(`\n🔗 Contratos (FORK LOCAL):`, 'info');
  log(`   - MLM: ${STATE.mlmContract.target}`, 'info');
  log(`   - USDT: ${STATE.usdtContract.target}`, 'info');

  log(`\n🚀 Fork local foi um SUCESSO!`, 'rocket');
  log(`   Com ${CONFIG.USERS_TO_CREATE} usuários testados em ${durationMinutes}m!`, 'success');
}

// ============================================================================
// EXECUTAR BOT
// ============================================================================

runBot().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
