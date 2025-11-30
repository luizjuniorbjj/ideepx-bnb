// ================================================================================
// SCRIPT: POPULAR 50 USUÁRIOS COM ESTRUTURA MLM DE 10 NÍVEIS
// ================================================================================
// Cria 50 usuários estruturados em rede MLM de 10 níveis
// Completa 5 diretos sob o patrocinador base
// Distribui demais usuários nos níveis subsequentes

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ================================================================================
// CONFIGURAÇÃO
// ================================================================================

const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545';
const CONTRACT_ADDRESS = process.env.CONTRACT_V10_ADDRESS || '0x30aa684Bf585380BFe460ce7d7A90085339f18Ef';
const ADMIN_PRIVATE_KEY = process.env.UPDATER_PRIVATE_KEY;

// Patrocinador base (já existe no sistema)
const BASE_SPONSOR = '0x75d1a8ac59003088c60a20bde8953cbecfe41669';

// Total de usuários a criar
const TOTAL_USERS = 50;

// Estrutura da rede MLM (quantos por nível)
const LEVEL_STRUCTURE = {
  1: 5,   // 5 diretos do patrocinador base
  2: 10,  // 10 no segundo nível (2 por L1)
  3: 10,  // 10 no terceiro nível
  4: 8,   // 8 no quarto nível
  5: 6,   // 6 no quinto nível
  6: 4,   // 4 no sexto nível
  7: 3,   // 3 no sétimo nível
  8: 2,   // 2 no oitavo nível
  9: 1,   // 1 no nono nível
  10: 1   // 1 no décimo nível
};

// ================================================================================
// CARREGAR ABI
// ================================================================================

const contractABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../backend/abis/iDeepXCoreV10_abi.json'), 'utf8')
);

// ================================================================================
// FUNÇÕES AUXILIARES
// ================================================================================

/**
 * Gerar carteira única
 */
function generateWallet(index) {
  const wallet = ethers.Wallet.createRandom();
  return {
    index,
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

/**
 * Aguardar um tempo
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formatar endereço
 */
function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ================================================================================
// ESTRUTURAR REDE MLM
// ================================================================================

/**
 * Criar estrutura hierárquica da rede MLM
 */
function createMLMStructure(wallets) {
  const structure = [];
  let currentIndex = 0;

  // Nível 1: 5 diretos do patrocinador base
  console.log('\n📊 ESTRUTURANDO REDE MLM:\n');

  const level1Users = [];
  for (let i = 0; i < LEVEL_STRUCTURE[1]; i++) {
    const user = {
      ...wallets[currentIndex],
      level: 1,
      sponsor: BASE_SPONSOR,
      sponsorIndex: 'BASE'
    };
    level1Users.push(user);
    structure.push(user);
    console.log(`   L1 #${i + 1}: ${formatAddress(user.address)} ← ${formatAddress(BASE_SPONSOR)}`);
    currentIndex++;
  }

  // Níveis 2-10: Distribuir usuários sob os anteriores
  let previousLevelUsers = level1Users;

  for (let level = 2; level <= 10; level++) {
    const usersInLevel = LEVEL_STRUCTURE[level];
    if (!usersInLevel || currentIndex >= TOTAL_USERS) break;

    const currentLevelUsers = [];
    const usersPerSponsor = Math.ceil(usersInLevel / previousLevelUsers.length);

    console.log(`\n   Nível ${level} (${usersInLevel} usuários):`);

    for (let i = 0; i < usersInLevel && currentIndex < TOTAL_USERS; i++) {
      const sponsorIndex = Math.floor(i / usersPerSponsor);
      const sponsor = previousLevelUsers[sponsorIndex];

      const user = {
        ...wallets[currentIndex],
        level,
        sponsor: sponsor.address,
        sponsorIndex: sponsor.index
      };

      currentLevelUsers.push(user);
      structure.push(user);

      console.log(`      L${level} #${i + 1}: ${formatAddress(user.address)} ← ${formatAddress(sponsor.address)}`);
      currentIndex++;
    }

    previousLevelUsers = currentLevelUsers;
  }

  return structure;
}

// ================================================================================
// REGISTRAR NO BLOCKCHAIN
// ================================================================================

/**
 * Registrar usuário no contrato V10
 */
async function registerUser(contract, user, index, total) {
  try {
    console.log(`\n[${index + 1}/${total}] Registrando L${user.level} ${formatAddress(user.address)}...`);
    console.log(`   Patrocinador: ${formatAddress(user.sponsor)}`);

    // Chamar função de registro (ajustar conforme ABI do contrato)
    // Assumindo que tem função: registerUser(address user, address sponsor)
    const tx = await contract.registerUser(user.address, user.sponsor, {
      gasLimit: 300000
    });

    console.log(`   ⏳ TX enviada: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   ✅ Confirmada no bloco: ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error(`   ❌ Erro ao registrar:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Registrar todos os usuários
 */
async function registerAllUsers(structure) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 REGISTRANDO USUÁRIOS NO BLOCKCHAIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Conectar ao contrato
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

  console.log(`\n🔗 Conectado à BSC Testnet`);
  console.log(`📄 Contrato: ${CONTRACT_ADDRESS}`);
  console.log(`🔑 Admin: ${wallet.address}`);

  const results = [];
  const total = structure.length;

  for (let i = 0; i < total; i++) {
    const user = structure[i];
    const result = await registerUser(contract, user, i, total);
    results.push({ ...user, ...result });

    // Aguardar entre transações
    if (i < total - 1) {
      await sleep(2000); // 2 segundos entre TXs
    }
  }

  return results;
}

// ================================================================================
// SALVAR RESULTADOS
// ================================================================================

/**
 * Salvar dados dos usuários criados
 */
function saveUsersData(structure, results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `users-mlm-50_${timestamp}.json`;
  const filepath = path.join(__dirname, 'data', filename);

  // Criar pasta data se não existir
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const data = {
    timestamp: new Date().toISOString(),
    baseSponsor: BASE_SPONSOR,
    totalUsers: TOTAL_USERS,
    levelStructure: LEVEL_STRUCTURE,
    contractAddress: CONTRACT_ADDRESS,
    users: results.map((user, index) => ({
      index: index + 1,
      level: user.level,
      address: user.address,
      privateKey: user.privateKey,
      mnemonic: user.mnemonic,
      sponsor: user.sponsor,
      sponsorIndex: user.sponsorIndex,
      registered: user.success,
      txHash: user.txHash,
      blockNumber: user.blockNumber,
      error: user.error
    }))
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Dados salvos em: ${filepath}`);

  // Também criar CSV para fácil visualização
  const csvFilename = `users-mlm-50_${timestamp}.csv`;
  const csvFilepath = path.join(__dirname, 'data', csvFilename);

  const csvLines = [
    'Index,Level,Address,Private Key,Sponsor,Registered,TxHash'
  ];

  data.users.forEach(user => {
    csvLines.push(
      `${user.index},${user.level},${user.address},${user.privateKey},${user.sponsor},${user.registered},${user.txHash || ''}`
    );
  });

  fs.writeFileSync(csvFilepath, csvLines.join('\n'));
  console.log(`📊 CSV salvo em: ${csvFilepath}`);

  return filepath;
}

/**
 * Gerar relatório final
 */
function generateReport(results) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RELATÓRIO FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Usuários registrados: ${successful}/${TOTAL_USERS}`);
  console.log(`❌ Falhas: ${failed}`);

  // Estatísticas por nível
  console.log('\n📊 Distribuição por Nível:');
  for (let level = 1; level <= 10; level++) {
    const usersInLevel = results.filter(r => r.level === level);
    const successInLevel = usersInLevel.filter(r => r.success).length;
    if (usersInLevel.length > 0) {
      console.log(`   Nível ${level.toString().padStart(2)}: ${successInLevel}/${usersInLevel.length} usuários`);
    }
  }

  // Listar falhas se houver
  if (failed > 0) {
    console.log('\n❌ Registros que falharam:');
    results.filter(r => !r.success).forEach(user => {
      console.log(`   ${formatAddress(user.address)} (L${user.level}): ${user.error}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ================================================================================
// MAIN
// ================================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        POPULAR SISTEMA MLM - 50 USUÁRIOS (10 NÍVEIS)          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Validações
  if (!ADMIN_PRIVATE_KEY) {
    console.error('❌ ERRO: UPDATER_PRIVATE_KEY não encontrada no .env');
    process.exit(1);
  }

  // Etapa 1: Gerar carteiras
  console.log('🔑 ETAPA 1: Gerando carteiras...\n');
  const wallets = [];
  for (let i = 0; i < TOTAL_USERS; i++) {
    const wallet = generateWallet(i);
    wallets.push(wallet);
    if ((i + 1) % 10 === 0) {
      console.log(`   ✓ ${i + 1}/${TOTAL_USERS} carteiras geradas`);
    }
  }
  console.log(`\n✅ ${TOTAL_USERS} carteiras geradas com sucesso!\n`);

  // Etapa 2: Estruturar rede MLM
  console.log('🌐 ETAPA 2: Estruturando rede MLM...');
  const structure = createMLMStructure(wallets);
  console.log(`\n✅ Rede MLM estruturada com ${structure.length} usuários!\n`);

  // Etapa 3: Confirmar antes de registrar
  console.log('⚠️  ATENÇÃO: Vai registrar 50 usuários no blockchain.');
  console.log('   Isso pode levar ~3-5 minutos e custar gas.\n');

  // Para automático, comentar as linhas abaixo:
  // const readline = require('readline').createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // });
  // const answer = await new Promise(resolve => {
  //   readline.question('   Deseja continuar? (yes/no): ', resolve);
  // });
  // readline.close();
  // if (answer.toLowerCase() !== 'yes') {
  //   console.log('\n❌ Operação cancelada pelo usuário.\n');
  //   process.exit(0);
  // }

  // Etapa 4: Registrar no blockchain
  console.log('\n📝 ETAPA 3: Registrando usuários no blockchain...\n');
  const results = await registerAllUsers(structure);

  // Etapa 5: Salvar dados
  console.log('\n💾 ETAPA 4: Salvando dados...');
  saveUsersData(structure, results);

  // Etapa 6: Relatório final
  generateReport(results);

  console.log('✅ PROCESSO CONCLUÍDO!\n');
}

// Executar
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ ERRO FATAL:', error);
    process.exit(1);
  });
