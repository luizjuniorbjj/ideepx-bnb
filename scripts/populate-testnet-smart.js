import hre from "hardhat";
import fs from "fs";

// ============================================================================
// 🎯 SCRIPT INTELIGENTE - POPULAR TESTNET COM tBNB + USDT + REGISTRO
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
  totalClients: 20, // 20 clientes (viável com 0.278 tBNB)
  bnbPerClient: "0.003", // 0.003 tBNB por carteira (suficiente para ~10 transações)
  usdtPerClient: "100", // $100 USDT por cliente
  subscriptionFee: "29" // $29 USDT
};

async function main() {
  console.log("\n" + "=".repeat(70));
  log("🚀 POPULAR TESTNET - VERSÃO INTELIGENTE", COLORS.bright + COLORS.cyan);
  console.log("=".repeat(70) + "\n");

  const startTime = Date.now();

  // ============================================================================
  // 1. SETUP
  // ============================================================================
  log("\n📋 PASSO 1/6: Setup Inicial", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const [deployer] = await hre.ethers.getSigners();
  log(`   👤 Deployer: ${deployer.address}`, COLORS.cyan);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  log(`   💰 Saldo inicial: ${hre.ethers.formatEther(balance)} tBNB`, COLORS.green);

  // Calcular custo total
  const bnbPerClient = hre.ethers.parseEther(CONFIG.bnbPerClient);
  const totalBnbNeeded = bnbPerClient * BigInt(CONFIG.totalClients);
  log(`   💸 BNB necessário: ${hre.ethers.formatEther(totalBnbNeeded)} tBNB`, COLORS.yellow);

  if (balance < totalBnbNeeded) {
    log(`\n   ❌ ERRO: Saldo insuficiente!`, COLORS.red);
    log(`   Necessário: ${hre.ethers.formatEther(totalBnbNeeded)} tBNB`, COLORS.red);
    log(`   Disponível: ${hre.ethers.formatEther(balance)} tBNB`, COLORS.red);
    process.exit(1);
  }

  const contract = await hre.ethers.getContractAt(
    "iDeepXDistributionV9_SECURE_4",
    CONFIG.contractAddress
  );

  const usdt = await hre.ethers.getContractAt(
    "MockUSDT",
    CONFIG.usdtAddress
  );

  log(`   ✅ Contratos conectados`, COLORS.green);

  // ============================================================================
  // 2. GERAR CARTEIRAS
  // ============================================================================
  log("\n\n📋 PASSO 2/6: Gerando Carteiras", COLORS.bright + COLORS.blue);
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
  }

  log(`   ✅ ${CONFIG.totalClients} carteiras geradas!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 3. DISTRIBUIR tBNB
  // ============================================================================
  log("\n\n📋 PASSO 3/6: Distribuindo tBNB (GAS)", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  log(`   💸 Enviando ${CONFIG.bnbPerClient} tBNB para cada carteira...`, COLORS.cyan);

  for (let i = 0; i < wallets.length; i++) {
    try {
      const tx = await deployer.sendTransaction({
        to: wallets[i].address,
        value: bnbPerClient
      });
      await tx.wait();

      if ((i + 1) % 5 === 0 || i === wallets.length - 1) {
        log(`   ✅ tBNB enviado para ${i + 1}/${CONFIG.totalClients} carteiras`, COLORS.green);
      }
    } catch (error) {
      log(`   ❌ Erro ao enviar tBNB para carteira ${i + 1}: ${error.message}`, COLORS.red);
    }
  }

  log(`   🎉 tBNB distribuído para todas as carteiras!`, COLORS.bright + COLORS.green);

  // Verificar saldo restante
  const balanceAfterBnb = await hre.ethers.provider.getBalance(deployer.address);
  log(`   💰 Saldo restante: ${hre.ethers.formatEther(balanceAfterBnb)} tBNB`, COLORS.cyan);

  // ============================================================================
  // 4. DISTRIBUIR USDT
  // ============================================================================
  log("\n\n📋 PASSO 4/6: Distribuindo USDT Mock", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const usdtAmount = hre.ethers.parseUnits(CONFIG.usdtPerClient, 6);
  log(`   💵 Distribuindo ${CONFIG.usdtPerClient} USDT para cada carteira...`, COLORS.cyan);

  for (let i = 0; i < wallets.length; i++) {
    try {
      const tx = await usdt.mint(wallets[i].address, usdtAmount);
      await tx.wait();

      if ((i + 1) % 5 === 0 || i === wallets.length - 1) {
        log(`   ✅ USDT distribuído para ${i + 1}/${CONFIG.totalClients} carteiras`, COLORS.green);
      }
    } catch (error) {
      log(`   ❌ Erro ao distribuir USDT para carteira ${i + 1}: ${error.message}`, COLORS.red);
    }
  }

  log(`   🎉 USDT distribuído para todas as carteiras!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 5. REGISTRAR USUÁRIOS
  // ============================================================================
  log("\n\n📋 PASSO 5/6: Registrando Usuários (MLM)", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const subscriptionAmount = hre.ethers.parseUnits(CONFIG.subscriptionFee, 6);

  log(`   🌳 Criando árvore MLM...`, COLORS.cyan);
  log(`   📊 Estrutura: Owner → Cliente 1 → Cliente 2 → ...`, COLORS.cyan);

  let registeredCount = 0;

  for (let i = 0; i < wallets.length; i++) {
    const client = wallets[i];
    let sponsorAddress;

    // Estrutura de sponsor
    if (i === 0) {
      // Primeiro cliente: sponsor = owner
      sponsorAddress = CONFIG.ownerAddress;
    } else {
      // Demais clientes: sponsor = cliente anterior
      sponsorAddress = wallets[i - 1].address;
    }

    try {
      // Aprovar USDT
      const approveTx = await usdt.connect(client.wallet).approve(
        CONFIG.contractAddress,
        subscriptionAmount
      );
      await approveTx.wait();

      // Aguardar 1 segundo entre transações (evitar nonce issues)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Registrar e assinar
      const registerTx = await contract.connect(client.wallet).registerAndSubscribe(sponsorAddress);
      await registerTx.wait();

      registeredCount++;
      wallets[i].registered = true;
      wallets[i].sponsor = sponsorAddress;

      log(`   ✅ Cliente ${i + 1}/${CONFIG.totalClients} registrado (sponsor: ${i === 0 ? 'Owner' : 'Cliente ' + i})`, COLORS.green);

      // Aguardar 1 segundo entre registros
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      log(`   ❌ Erro ao registrar cliente ${i + 1}: ${error.message.slice(0, 100)}`, COLORS.red);
      wallets[i].registered = false;
      wallets[i].error = error.message.slice(0, 200);
    }
  }

  log(`\n   🎉 ${registeredCount}/${CONFIG.totalClients} clientes registrados com sucesso!`, COLORS.bright + COLORS.green);

  // ============================================================================
  // 6. SALVAR DADOS
  // ============================================================================
  log("\n\n📋 PASSO 6/6: Salvando Dados", COLORS.bright + COLORS.blue);
  console.log("-".repeat(70));

  const outputData = {
    metadata: {
      network: "BSC Testnet",
      chainId: 97,
      timestamp: new Date().toISOString(),
      contract: CONFIG.contractAddress,
      usdt: CONFIG.usdtAddress,
      owner: CONFIG.ownerAddress,
      totalClients: CONFIG.totalClients,
      registeredClients: registeredCount
    },
    config: CONFIG,
    wallets: wallets.map(w => ({
      index: w.index,
      address: w.address,
      privateKey: w.privateKey,
      registered: w.registered || false,
      sponsor: w.sponsor || null,
      error: w.error || null
    })),
    summary: {
      totalBnbSpent: hre.ethers.formatEther(balance - balanceAfterBnb),
      totalUsdtDistributed: parseFloat(CONFIG.usdtPerClient) * CONFIG.totalClients,
      totalSubscriptions: registeredCount * parseFloat(CONFIG.subscriptionFee),
      successRate: ((registeredCount / CONFIG.totalClients) * 100).toFixed(1) + "%"
    }
  };

  const filename = `testnet-population-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(outputData, null, 2));

  log(`   ✅ Dados salvos em: ${filename}`, COLORS.green);

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
  log(`   ✅ ${CONFIG.totalClients} carteiras criadas`, COLORS.green);
  log(`   ✅ ${registeredCount} clientes registrados (${((registeredCount / CONFIG.totalClients) * 100).toFixed(1)}%)`, COLORS.green);
  log(`   💸 ${hre.ethers.formatEther(balance - balanceAfterBnb)} tBNB gastos`, COLORS.yellow);
  log(`   💰 $${parseFloat(CONFIG.usdtPerClient) * CONFIG.totalClients} USDT distribuído`, COLORS.green);
  log(`   💵 $${registeredCount * parseFloat(CONFIG.subscriptionFee)} em assinaturas`, COLORS.green);
  log(`   📁 Dados salvos em: ${filename}`, COLORS.green);

  log(`\n🔑 CARTEIRAS SALVAS:`, COLORS.bright + COLORS.cyan);
  log(`   Arquivo: ${filename}`, COLORS.cyan);
  log(`   Todas as ${CONFIG.totalClients} private keys estão salvas`, COLORS.cyan);

  log(`\n🌐 ACESSO PÚBLICO:`, COLORS.bright + COLORS.cyan);
  log(`   URL: https://small-comics-divide.loca.lt`, COLORS.cyan);
  log(`   Senha: 146.70.98.125`, COLORS.cyan);

  log(`\n🎯 PRÓXIMOS PASSOS:`, COLORS.bright + COLORS.yellow);
  log(`   1. Abra o arquivo ${filename}`, COLORS.yellow);
  log(`   2. Copie qualquer private key`, COLORS.yellow);
  log(`   3. Importe no MetaMask`, COLORS.yellow);
  log(`   4. Acesse o site e teste!`, COLORS.yellow);

  log(`\n💡 DICA:`, COLORS.bright + COLORS.cyan);
  log(`   Cliente 1 está no nível 1 (sponsor = Owner)`, COLORS.cyan);
  log(`   Cliente 2 está no nível 2 (sponsor = Cliente 1)`, COLORS.cyan);
  log(`   Cliente 3 está no nível 3 (sponsor = Cliente 2)`, COLORS.cyan);
  log(`   E assim por diante...`, COLORS.cyan);

  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ERRO FATAL:\n", error);
    process.exit(1);
  });
