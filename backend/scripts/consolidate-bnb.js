/**
 * 💰 SCRIPT DE CONSOLIDAÇÃO DE BNB
 *
 * Coleta BNB de múltiplas carteiras e consolida em uma única carteira.
 *
 * QUANDO USAR:
 * - Você tem várias carteiras com pouco BNB cada
 * - Quer consolidar tudo em uma carteira principal
 * - Pegou BNB de múltiplos faucets em carteiras diferentes
 *
 * COMO FUNCIONA:
 * 1. Você fornece uma lista de private keys (carteiras fonte)
 * 2. Script verifica saldo de cada uma
 * 3. Envia todo BNB (menos gas) para carteira destino
 * 4. Consolida tudo em uma única carteira
 *
 * USO:
 * 1. Edite o array WALLETS_TO_CONSOLIDATE abaixo
 * 2. Execute: node backend/scripts/consolidate-bnb.js
 */

import { ethers } from 'ethers';
import readline from 'readline';

// ============================================================================
// ⚙️ CONFIGURAÇÃO - EDITE AQUI!
// ============================================================================

/**
 * ADICIONE SUAS PRIVATE KEYS AQUI:
 * - Coloque as private keys das carteiras que TÊM BNB
 * - Formato: ['0xprivatekey1', '0xprivatekey2', ...]
 * - ⚠️ NUNCA compartilhe este arquivo depois de adicionar as keys!
 */
const WALLETS_TO_CONSOLIDATE = [
  // Exemplo (REMOVA e adicione as suas):
  // '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  // '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
];

/**
 * CARTEIRA DESTINO (onde consolidar):
 * - Opção 1: Use PRIVATE_KEY do .env (deixe null)
 * - Opção 2: Cole um endereço específico aqui
 */
const DESTINATION_ADDRESS = null; // ou '0x...'

/**
 * RPC URL (testnet)
 */
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// ============================================================================
// STATE
// ============================================================================

const STATE = {
  provider: null,
  destinationAddress: null,
  results: [],
  totalCollected: 0n
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
    money: '💰'
  }[type] || 'ℹ️';

  console.log(`${emoji} ${message}`);
}

// ============================================================================
// FUNÇÕES
// ============================================================================

/**
 * Perguntar confirmação ao usuário
 */
async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${question} (s/n): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
    });
  });
}

/**
 * Inicializar
 */
async function initialize() {
  log('💰 Inicializando script de consolidação de BNB...', 'money');

  // 1. Verificar se há carteiras
  if (WALLETS_TO_CONSOLIDATE.length === 0) {
    throw new Error('⚠️ Nenhuma carteira configurada! Edite o array WALLETS_TO_CONSOLIDATE no script.');
  }

  log(`Encontradas ${WALLETS_TO_CONSOLIDATE.length} carteiras para consolidar`, 'info');

  // 2. Conectar ao provider
  STATE.provider = new ethers.JsonRpcProvider(RPC_URL);
  log(`Conectado ao RPC`, 'info');

  // 3. Determinar endereço de destino
  if (DESTINATION_ADDRESS) {
    STATE.destinationAddress = DESTINATION_ADDRESS;
    log(`Destino: ${STATE.destinationAddress} (configurado manualmente)`, 'info');
  } else {
    // Usar PRIVATE_KEY do .env
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY não encontrada no .env e DESTINATION_ADDRESS não configurado!');
    }

    const wallet = new ethers.Wallet(privateKey);
    STATE.destinationAddress = wallet.address;
    log(`Destino: ${STATE.destinationAddress} (do .env)`, 'info');
  }

  log('✅ Inicialização completa!\n', 'success');
}

/**
 * Verificar saldos
 */
async function checkBalances() {
  log('🔍 Verificando saldos...\n', 'info');

  let totalBNB = 0n;

  for (let i = 0; i < WALLETS_TO_CONSOLIDATE.length; i++) {
    const privateKey = WALLETS_TO_CONSOLIDATE[i];

    try {
      const wallet = new ethers.Wallet(privateKey, STATE.provider);
      const balance = await STATE.provider.getBalance(wallet.address);
      const balanceBNB = parseFloat(ethers.formatEther(balance));

      log(`[${i + 1}] ${wallet.address.slice(0, 10)}... → ${balanceBNB.toFixed(6)} BNB`, 'info');

      STATE.results.push({
        index: i + 1,
        address: wallet.address,
        privateKey: privateKey,
        balance: balance,
        balanceBNB: balanceBNB
      });

      totalBNB += balance;

    } catch (error) {
      log(`[${i + 1}] Erro ao verificar carteira: ${error.message}`, 'error');
    }
  }

  const totalBNBFormatted = ethers.formatEther(totalBNB);

  log(`\n💰 Total disponível: ${totalBNBFormatted} BNB`, 'money');

  return totalBNB;
}

/**
 * Consolidar carteira individual
 */
async function consolidateWallet(walletData) {
  try {
    log(`\n[${walletData.index}/${STATE.results.length}] ${walletData.address.slice(0, 10)}...`, 'info');

    // Verificar se tem saldo suficiente
    if (walletData.balance < ethers.parseEther('0.001')) {
      log(`   ⏭️  Saldo muito baixo (< 0.001 BNB), pulando`, 'warning');
      return;
    }

    // Conectar carteira
    const wallet = new ethers.Wallet(walletData.privateKey, STATE.provider);

    // Estimar gas
    const gasPrice = await STATE.provider.getFeeData();
    const estimatedGas = 21000n;
    const gasCost = estimatedGas * gasPrice.gasPrice;

    // Calcular valor a enviar (saldo - gas)
    const amountToSend = walletData.balance - gasCost;

    if (amountToSend <= 0n) {
      log(`   ⏭️  Após descontar gas, não sobra nada`, 'warning');
      return;
    }

    const amountBNB = parseFloat(ethers.formatEther(amountToSend));
    log(`   💸 Enviando: ${amountBNB.toFixed(6)} BNB`, 'money');

    // Enviar transação
    const tx = await wallet.sendTransaction({
      to: STATE.destinationAddress,
      value: amountToSend,
      gasLimit: estimatedGas,
      gasPrice: gasPrice.gasPrice
    });

    log(`   ⏳ Aguardando confirmação...`, 'info');
    await tx.wait();

    log(`   ✅ Enviado! TX: ${tx.hash.slice(0, 10)}...`, 'success');

    STATE.totalCollected += amountToSend;

  } catch (error) {
    log(`   ❌ Erro: ${error.message}`, 'error');
  }
}

/**
 * Executar consolidação
 */
async function runConsolidation() {
  try {
    await initialize();

    // 1. Verificar saldos
    const totalAvailable = await checkBalances();

    if (totalAvailable === 0n) {
      log('\n⚠️ Nenhuma carteira tem saldo. Nada para consolidar.', 'warning');
      return;
    }

    // 2. Confirmar com usuário
    log(`\n⚠️ ATENÇÃO:`, 'warning');
    log(`   Destino: ${STATE.destinationAddress}`, 'info');
    log(`   Total a enviar: ~${ethers.formatEther(totalAvailable)} BNB (menos gas)`, 'info');
    log(`   Carteiras: ${STATE.results.length}`, 'info');

    const confirmed = await askConfirmation('\nConfirma consolidação?');

    if (!confirmed) {
      log('\n❌ Operação cancelada pelo usuário.', 'error');
      return;
    }

    // 3. Consolidar cada carteira
    log(`\n💰 Iniciando consolidação...\n`, 'money');

    for (const walletData of STATE.results) {
      await consolidateWallet(walletData);

      // Pequeno delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Relatório final
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
  log(`🎉 CONSOLIDAÇÃO CONCLUÍDA!`, 'success');
  log(`${'='.repeat(60)}\n`, 'success');

  log(`📊 RELATÓRIO:\n`, 'money');
  log(`   💰 BNB consolidado: ${ethers.formatEther(STATE.totalCollected)} BNB`, 'success');
  log(`   📝 Carteiras processadas: ${STATE.results.length}`, 'info');

  // Verificar saldo final do destino
  const finalBalance = await STATE.provider.getBalance(STATE.destinationAddress);
  log(`\n💼 Saldo final (destino): ${ethers.formatEther(finalBalance)} BNB`, 'success');

  log(`\n✅ Agora você tem todo BNB consolidado em: ${STATE.destinationAddress}`, 'success');
}

// ============================================================================
// EXECUTAR
// ============================================================================

runConsolidation().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
