import hre from "hardhat";
import fs from "fs";

// ============================================================================
// 🎯 SCRIPT PARA POPULAR CONTRATO TESTNET COM 100 CLIENTES
// ============================================================================
// Cria cenário MLM completo com 10 níveis para demonstração e testes
// ============================================================================

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

function log(message, color = COLORS.reset) {
  console.log(color + message + COLORS.reset);
}

// Configuração
const CONFIG = {
  contractAddress: "0xe678A271c096EF9CFE296243e022deaFBE05f4Ea",
  usdtAddress: "0xf484a22555113Cebac616bC84451Bf04085097b8",
  ownerAddress: "0x29061a4c6A0C4aedc79A24f37553F6B9fe8Fec5F",
  totalClients: 100,
  usdtPerClient: "1000", // $1000 USDT por cliente
  subscriptionFee: "29", // $29 USDT
  performanceFee: "10000", // $10,000 para distribuir
  clientsPerBatch: 10 // Processar 10 clientes por vez
};

async function main() {
  console.log("\n" + "=".repeat(70));
  log("🚀 POPULAR CONTRATO TESTNET - 100 CLIENTES", COLORS.bright + COLORS.cyan);
  console.log("=".repeat(70) + "\n");

  const startTime = Date.now();

  // ============================================================================
  // 1. SETUP INICIAL
  // ============================================================================
  log("\n📋 PASSO 1/7: Setup Inicial", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const [deployer] = await hre.ethers.getSigners();
  log(`   👤 Deployer: ${deployer.address}`, COLORS.cyan);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  log(`   💰 Saldo BNB: ${hre.ethers.formatEther(balance)} tBNB`, COLORS.green);

  if (parseFloat(hre.ethers.formatEther(balance)) < 0.1) {
    log("\n   ⚠️  AVISO: Saldo baixo! Recomendado ter pelo menos 0.1 tBNB", COLORS.yellow);
  }

  // Conectar aos contratos
  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_4",
    CONFIG.contractAddress
  );

  const usdt = await hre.ethers.getContractAt(
    "MockUSDT",
    CONFIG.usdtAddress
  );

  log(`   ✅ Contrato conectado: ${CONFIG.contractAddress}`, COLORS.green);
  log(`   ✅ USDT Mock conectado: ${CONFIG.usdtAddress}`, COLORS.green);

  // ============================================================================
  // 2. GERAR CARTEIRAS
  // ============================================================================
  log("\n\n📋 PASSO 2/7: Gerando 100 Carteiras", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const wallets = [];

  log(`   🔄 Gerando ${CONFIG.totalClients} carteiras...`, COLORS.cyan);

  for (let i = 0; i < CONFIG.totalClients; i++) {
    const wallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
    wallets.push({
      index: i + 1,
      address: wallet.address,
      privateKey: wallet.privateKey,
      wallet: wallet
    });

    if ((i + 1) % 20 === 0) {
      log(`   ✅ Geradas ${i + 1}/${CONFIG.totalClients} carteiras...`, COLORS.green);
    }
  }

  log(`   🎉 ${CONFIG.totalClients} carteiras geradas com sucesso!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 3. DISTRIBUIR USDT MOCK
  // ============================================================================
  log("\n\n📋 PASSO 3/7: Distribuindo USDT Mock", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const usdtAmount = hre.ethers.parseUnits(CONFIG.usdtPerClient, 6);
  log(`   💵 Distribuindo ${CONFIG.usdtPerClient} USDT para cada carteira...`, COLORS.cyan);

  for (let i = 0; i < wallets.length; i++) {
    const tx = await usdt.mint(wallets[i].address, usdtAmount);
    await tx.wait();

    if ((i + 1) % 10 === 0) {
      log(`   ✅ USDT distribuído para ${i + 1}/${CONFIG.totalClients} carteiras`, COLORS.green);
    }
  }

  log(`   🎉 USDT distribuído para todas as ${CONFIG.totalClients} carteiras!`, COLORS.bright + COLORS.green);

  // Verificar saldo total
  const totalUSDT = await usdt.totalSupply();
  log(`   💰 Supply total USDT: ${hre.ethers.formatUnits(totalUSDT, 6)} USDT`, COLORS.cyan);

  // ============================================================================
  // 4. REGISTRAR USUÁRIOS EM CADEIA MLM
  // ============================================================================
  log("\n\n📋 PASSO 4/7: Registrando Usuários (MLM de 10 Níveis)", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  log(`   🌳 Criando árvore MLM com 10 níveis...`, COLORS.cyan);
  log(`   📊 Estrutura: 10 clientes por nível`, COLORS.cyan);

  // Estrutura:
  // Nível 1: 10 clientes (sponsor = owner)
  // Nível 2: 10 clientes (sponsor = cliente 1)
  // Nível 3: 10 clientes (sponsor = cliente 11)
  // ... e assim por diante

  const subscriptionAmount = hre.ethers.parseUnits(CONFIG.subscriptionFee, 6);

  for (let i = 0; i < wallets.length; i++) {
    const client = wallets[i];
    let sponsorAddress;

    // Determinar sponsor baseado na posição
    if (i < 10) {
      // Nível 1: sponsor = owner
      sponsorAddress = CONFIG.ownerAddress;
    } else {
      // Níveis 2-10: sponsor = cliente do nível anterior
      // Cliente 11-20 tem sponsor cliente 1-10
      // Cliente 21-30 tem sponsor cliente 11-20, etc
      const sponsorIndex = i - 10;
      sponsorAddress = wallets[sponsorIndex].address;
    }

    try {
      // Aprovar USDT
      const approveTx = await usdt.connect(client.wallet).approve(
        CONFIG.contractAddress,
        subscriptionAmount
      );
      await approveTx.wait();

      // Registrar e assinar em uma transação
      const registerTx = await contract.connect(client.wallet).registerAndSubscribe(sponsorAddress);
      await registerTx.wait();

      if ((i + 1) % 10 === 0) {
        const level = Math.floor(i / 10) + 1;
        log(`   ✅ Nível ${level} completo: ${i + 1}/${CONFIG.totalClients} clientes registrados`, COLORS.green);
      }
    } catch (error) {
      log(`   ❌ Erro ao registrar cliente ${i + 1}: ${error.message}`, COLORS.red);
    }
  }

  log(`   🎉 Todos os ${CONFIG.totalClients} clientes registrados!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 5. PROCESSAR PERFORMANCE FEES
  // ============================================================================
  log("\n\n📋 PASSO 5/7: Processando Performance Fees", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const performanceFeeAmount = hre.ethers.parseUnits(CONFIG.performanceFee, 6);

  log(`   💰 Distribuindo $${CONFIG.performanceFee} em performance fees...`, COLORS.cyan);

  // Aprovar USDT para o contrato (do deployer)
  const approveTx = await usdt.approve(CONFIG.contractAddress, performanceFeeAmount);
  await approveTx.wait();
  log(`   ✅ USDT aprovado`, COLORS.green);

  // Processar em batches de 10
  const batches = Math.ceil(CONFIG.totalClients / CONFIG.clientsPerBatch);

  for (let i = 0; i < batches; i++) {
    const startIdx = i * CONFIG.clientsPerBatch;
    const endIdx = Math.min(startIdx + CONFIG.clientsPerBatch, CONFIG.totalClients);
    const batchAddresses = wallets.slice(startIdx, endIdx).map(w => w.address);

    try {
      const tx = await contract.batchProcessPerformanceFees(batchAddresses, performanceFeeAmount);
      await tx.wait();
      log(`   ✅ Batch ${i + 1}/${batches} processado (clientes ${startIdx + 1}-${endIdx})`, COLORS.green);
    } catch (error) {
      log(`   ⚠️  Erro no batch ${i + 1}: ${error.message}`, COLORS.yellow);
    }
  }

  log(`   🎉 Performance fees distribuídos!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 6. ESTATÍSTICAS FINAIS
  // ============================================================================
  log("\n\n📋 PASSO 6/7: Coletando Estatísticas", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const stats = await contract.getSystemStats();

  log(`\n   📊 ESTATÍSTICAS DO SISTEMA:`, COLORS.bright + COLORS.cyan);
  log(`   ├─ Total de usuários: ${stats.totalUsers}`, COLORS.cyan);
  log(`   ├─ Assinaturas ativas: ${stats.totalActiveSubscriptions}`, COLORS.cyan);
  log(`   ├─ Total distribuído MLM: $${hre.ethers.formatUnits(stats.totalMLMDistributed, 6)} USDT`, COLORS.cyan);
  log(`   ├─ Total performance fees: $${hre.ethers.formatUnits(stats.totalPerformanceFees, 6)} USDT`, COLORS.cyan);
  log(`   └─ Total depositado: $${hre.ethers.formatUnits(stats.totalDeposited, 6)} USDT`, COLORS.cyan);

  // Verificar alguns clientes aleatórios
  log(`\n   👥 AMOSTRA DE CLIENTES:`, COLORS.bright + COLORS.cyan);

  const sampleIndices = [0, 25, 50, 75, 99]; // Clientes de exemplo

  for (const idx of sampleIndices) {
    const client = wallets[idx];
    const userData = await contract.getUserInfo(client.address);
    const earnings = hre.ethers.formatUnits(userData.totalEarnings, 6);
    const level = Math.floor(idx / 10) + 1;

    log(`   ├─ Cliente ${idx + 1} (Nível ${level}): $${earnings} USDT ganhos`, COLORS.green);
  }

  // ============================================================================
  // 7. SALVAR DADOS
  // ============================================================================
  log("\n\n📋 PASSO 7/7: Salvando Dados", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const outputData = {
    metadata: {
      network: "BSC Testnet",
      chainId: 97,
      timestamp: new Date().toISOString(),
      contract: CONFIG.contractAddress,
      usdt: CONFIG.usdtAddress,
      totalClients: CONFIG.totalClients
    },
    config: CONFIG,
    statistics: {
      totalUsers: stats.totalUsers.toString(),
      activeSubscriptions: stats.totalActiveSubscriptions.toString(),
      mlmDistributed: hre.ethers.formatUnits(stats.totalMLMDistributed, 6),
      performanceFees: hre.ethers.formatUnits(stats.totalPerformanceFees, 6),
      totalDeposited: hre.ethers.formatUnits(stats.totalDeposited, 6)
    },
    wallets: wallets.map(w => ({
      index: w.index,
      address: w.address,
      privateKey: w.privateKey,
      level: Math.floor((w.index - 1) / 10) + 1
    }))
  };

  const filename = `testnet-population-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(outputData, null, 2));

  log(`   ✅ Dados salvos em: ${filename}`, COLORS.green);
  log(`   📁 Total de ${CONFIG.totalClients} carteiras com private keys`, COLORS.cyan);

  // ============================================================================
  // RESUMO FINAL
  // ============================================================================
  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log("\n" + "=".repeat(70));
  log("✅ POPULAÇÃO COMPLETA!", COLORS.bright + COLORS.green);
  console.log("=".repeat(70));

  log(`\n⏱️  Tempo total: ${minutes}m ${seconds}s`, COLORS.cyan);

  log(`\n📊 RESUMO:`, COLORS.bright + COLORS.yellow);
  log(`   ✅ ${CONFIG.totalClients} clientes criados e registrados`, COLORS.green);
  log(`   ✅ $${parseFloat(CONFIG.usdtPerClient) * CONFIG.totalClients} USDT distribuído`, COLORS.green);
  log(`   ✅ $${parseFloat(CONFIG.subscriptionFee) * CONFIG.totalClients} em assinaturas`, COLORS.green);
  log(`   ✅ $${CONFIG.performanceFee} em performance fees processados`, COLORS.green);
  log(`   ✅ Árvore MLM de 10 níveis criada`, COLORS.green);
  log(`   ✅ Dados salvos em: ${filename}`, COLORS.green);

  log(`\n🌐 ACESSO PÚBLICO:`, COLORS.bright + COLORS.cyan);
  log(`   URL: https://small-comics-divide.loca.lt`, COLORS.cyan);
  log(`   Senha: 146.70.98.125`, COLORS.cyan);

  log(`\n🎯 PRÓXIMOS PASSOS:`, COLORS.bright + COLORS.yellow);
  log(`   1. Acesse o site e conecte com qualquer carteira de teste`, COLORS.yellow);
  log(`   2. Veja a rede MLM completa em /network`, COLORS.yellow);
  log(`   3. Teste saques e transferências`, COLORS.yellow);
  log(`   4. Demonstre para parceiros/investidores!`, COLORS.yellow);

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO FATAL:\n", error);
    process.exit(1);
  });
