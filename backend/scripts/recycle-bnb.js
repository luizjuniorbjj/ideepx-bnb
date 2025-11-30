/**
 * 🔄 SCRIPT DE RECICLAGEM DE BNB
 *
 * Recupera BNB não utilizado dos usuários criados pelo bot
 * e envia de volta para a carteira principal (deployer).
 *
 * QUANDO USAR:
 * - Após executar o bot de simulação
 * - Quando quiser recuperar BNB dos usuários
 * - Para economizar BNB testnet
 *
 * COMO FUNCIONA:
 * 1. Lê arquivo mlm-bot-progress.json
 * 2. Para cada usuário, verifica saldo BNB
 * 3. Se saldo > 0.001 BNB, envia de volta (deixa um pouco para gas)
 * 4. Consolida tudo no deployer
 *
 * USO:
 * node backend/scripts/recycle-bnb.js
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const CONFIG = {
  RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  PROGRESS_FILE: 'mlm-bot-progress.json',

  // Deixar um pouco de BNB para gas futuro (em BNB)
  MIN_BNB_TO_LEAVE: '0.001',

  // Mínimo para valer a pena reciclar (em BNB)
  MIN_BNB_TO_RECYCLE: '0.002',
};

// ============================================================================
// STATE
// ============================================================================

const STATE = {
  provider: null,
  deployer: null,
  users: [],
  stats: {
    totalUsers: 0,
    usersChecked: 0,
    usersRecycled: 0,
    bnbRecovered: '0',
    errors: []
  }
};

// ============================================================================
// LOGGER
// ============================================================================

function log(message, type = 'info') {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    recycle: '🔄'
  }[type] || 'ℹ️';

  console.log(`${emoji} ${message}`);
}

// ============================================================================
// FUNÇÕES
// ============================================================================

/**
 * Carregar progresso do bot
 */
function loadProgress() {
  const progressPath = path.join(__dirname, CONFIG.PROGRESS_FILE);

  if (!fs.existsSync(progressPath)) {
    throw new Error(`Arquivo ${CONFIG.PROGRESS_FILE} não encontrado!`);
  }

  const data = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  STATE.users = data.users || [];
  STATE.stats.totalUsers = STATE.users.length;

  log(`Carregados ${STATE.users.length} usuários do arquivo`, 'success');
}

/**
 * Inicializar
 */
async function initialize() {
  log('🔄 Inicializando script de reciclagem de BNB...', 'recycle');

  // 1. Carregar progresso
  loadProgress();

  // 2. Conectar ao provider
  STATE.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  log(`Conectado ao RPC`, 'info');

  // 3. Carregar deployer
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY não encontrada no .env');
  }

  STATE.deployer = new ethers.Wallet(privateKey, STATE.provider);
  const balance = await STATE.provider.getBalance(STATE.deployer.address);

  log(`Deployer: ${STATE.deployer.address}`, 'info');
  log(`Saldo atual: ${ethers.formatEther(balance)} BNB`, 'info');

  log('✅ Inicialização completa!\n', 'success');
}

/**
 * Reciclar BNB de um usuário
 */
async function recycleUser(user, index) {
  try {
    STATE.stats.usersChecked++;

    // 1. Verificar saldo
    const balance = await STATE.provider.getBalance(user.address);
    const balanceBNB = parseFloat(ethers.formatEther(balance));

    log(`\n[${index + 1}/${STATE.stats.totalUsers}] ${user.address.slice(0, 10)}...`, 'info');
    log(`   Saldo: ${balanceBNB.toFixed(6)} BNB`, 'info');

    // 2. Verificar se vale a pena reciclar
    const minToRecycle = parseFloat(CONFIG.MIN_BNB_TO_RECYCLE);
    const minToLeave = parseFloat(CONFIG.MIN_BNB_TO_LEAVE);

    if (balanceBNB < minToRecycle) {
      log(`   ⏭️  Saldo muito baixo, pulando`, 'warning');
      return;
    }

    // 3. Calcular quanto enviar
    const leaveAmount = ethers.parseEther(CONFIG.MIN_BNB_TO_LEAVE);

    // Estimar gas para a transação de envio
    const gasPrice = await STATE.provider.getFeeData();
    const estimatedGas = 21000n; // Gas padrão para transfer
    const gasCost = estimatedGas * gasPrice.gasPrice;

    // Valor a enviar = saldo - gas - valor a deixar
    const amountToSend = balance - gasCost - leaveAmount;

    if (amountToSend <= 0n) {
      log(`   ⏭️  Após descontar gas, não sobra nada`, 'warning');
      return;
    }

    const amountToSendBNB = parseFloat(ethers.formatEther(amountToSend));
    log(`   💰 Reciclando: ${amountToSendBNB.toFixed(6)} BNB`, 'recycle');

    // 4. Conectar carteira do usuário
    const userWallet = new ethers.Wallet(user.privateKey, STATE.provider);

    // 5. Enviar BNB de volta para deployer
    const tx = await userWallet.sendTransaction({
      to: STATE.deployer.address,
      value: amountToSend,
      gasLimit: estimatedGas,
      gasPrice: gasPrice.gasPrice
    });

    await tx.wait();

    log(`   ✅ BNB reciclado! TX: ${tx.hash.slice(0, 10)}...`, 'success');

    // 6. Atualizar stats
    STATE.stats.usersRecycled++;
    STATE.stats.bnbRecovered = (
      parseFloat(STATE.stats.bnbRecovered) + amountToSendBNB
    ).toString();

  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'error');
    STATE.stats.errors.push({
      user: user.address,
      error: error.message
    });
  }
}

/**
 * Executar reciclagem
 */
async function runRecycling() {
  try {
    await initialize();

    log(`\n🔄 Iniciando reciclagem de ${STATE.users.length} usuários...\n`, 'recycle');
    log(`⚙️ Configurações:`, 'info');
    log(`   - Deixar no usuário: ${CONFIG.MIN_BNB_TO_LEAVE} BNB`, 'info');
    log(`   - Mínimo para reciclar: ${CONFIG.MIN_BNB_TO_RECYCLE} BNB\n`, 'info');

    // Processar cada usuário
    for (let i = 0; i < STATE.users.length; i++) {
      await recycleUser(STATE.users[i], i);

      // Pequeno delay para evitar throttle
      if (i < STATE.users.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Relatório final
    await printFinalReport();

  } catch (error) {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'error');
    console.error(error);
  }
}

/**
 * Relatório final
 */
async function printFinalReport() {
  log(`\n\n${'='.repeat(60)}`, 'success');
  log(`🎉 RECICLAGEM CONCLUÍDA!`, 'success');
  log(`${'='.repeat(60)}\n`, 'success');

  log(`📊 RELATÓRIO:\n`, 'recycle');
  log(`   📝 Total de usuários: ${STATE.stats.totalUsers}`, 'info');
  log(`   ✅ Usuários verificados: ${STATE.stats.usersChecked}`, 'success');
  log(`   🔄 Usuários reciclados: ${STATE.stats.usersRecycled}`, 'success');
  log(`   💰 BNB recuperado: ${parseFloat(STATE.stats.bnbRecovered).toFixed(6)} BNB`, 'success');

  if (STATE.stats.errors.length > 0) {
    log(`   ⚠️ Erros: ${STATE.stats.errors.length}`, 'warning');
  }

  // Verificar saldo final do deployer
  const finalBalance = await STATE.provider.getBalance(STATE.deployer.address);
  log(`\n💼 Saldo final do deployer: ${ethers.formatEther(finalBalance)} BNB`, 'success');
}

// ============================================================================
// EXECUTAR
// ============================================================================

runRecycling().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
