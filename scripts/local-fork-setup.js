/**
 * 🚀 SETUP LOCAL FORK - iDeepX v3.1
 *
 * Configura ambiente local completo para testes em escala
 *
 * O que faz:
 * 1. Deploy do contrato iDeepXUnified
 * 2. Deploy de Mock USDT (já que fork não tem acesso direto ao USDT real)
 * 3. Distribui USDT para todas as contas de teste
 * 4. Retorna informações para uso em outros scripts
 *
 * Uso:
 * npx hardhat run scripts/local-fork-setup.js --network localhost
 */

import pkg from "hardhat";
const { ethers } = pkg;
const hre = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 SETUP LOCAL FORK - iDeepX v3.1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('⚙️ Configuração:');
    console.log('   - Fork: BSC Mainnet local');
    console.log('   - Contas: 100 pré-financiadas (10k BNB cada)');
    console.log('   - Mining: Instantâneo');
    console.log('   - USDT: Ilimitado (mock)');
    console.log('');

    // 1. OBTER SIGNERS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ETAPA 1: Obter Contas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const signers = await ethers.getSigners();
    const [owner, ...testUsers] = signers;

    console.log(`✅ ${signers.length} contas disponíveis`);
    console.log('');
    console.log('🔑 Contas principais:');
    console.log(`   Owner: ${owner.address}`);
    console.log(`   Contas de teste: ${testUsers.length}`);
    console.log('');

    // 2. DEPLOY MOCK USDT
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ETAPA 2: Deploy Mock USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const MockUSDT = await ethers.getContractFactory("contracts/mocks/MockUSDT.sol:MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();

    const usdtAddress = await usdt.getAddress();
    console.log(`✅ Mock USDT deployed: ${usdtAddress}`);
    console.log('');

    // 3. DEPLOY IDEEPX UNIFIED
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ETAPA 3: Deploy iDeepXUnified');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const iDeepXUnified = await ethers.getContractFactory("iDeepXUnified");
    const contract = await iDeepXUnified.deploy(
        usdtAddress
    );
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`✅ iDeepXUnified deployed: ${contractAddress}`);
    console.log('');

    // Verificar configurações
    const subscriptionFee = await contract.subscriptionFee();
    console.log('📊 Configurações do contrato:');
    console.log(`   LAI Fee: $${ethers.formatUnits(subscriptionFee, 6)} USDT`);
    console.log(`   Current Week: ${await contract.currentWeek()}`);
    console.log(`   Owner: ${await contract.owner()}`);
    console.log('');

    // 4. DISTRIBUIR USDT PARA TODAS AS CONTAS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ETAPA 4: Distribuir USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const usdtAmount = ethers.parseUnits("100000", 6); // 100k USDT por conta

    console.log('💰 Distribuindo 100,000 USDT para cada conta...');
    console.log('');

    // Owner
    await usdt.mint(owner.address, usdtAmount);
    console.log(`✅ Owner: ${ethers.formatUnits(usdtAmount, 6)} USDT`);

    // Contas de teste (em lotes de 10 para feedback)
    let mintedCount = 0;
    for (let i = 0; i < testUsers.length; i++) {
        await usdt.mint(testUsers[i].address, usdtAmount);
        mintedCount++;

        if (mintedCount % 10 === 0 || mintedCount === testUsers.length) {
            console.log(`✅ ${mintedCount}/${testUsers.length} contas financiadas`);
        }
    }

    console.log('');
    console.log(`✅ Total distribuído: ${ethers.formatUnits(usdtAmount * BigInt(signers.length), 6)} USDT`);
    console.log('');

    // 5. SALVAR CONFIGURAÇÃO
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ETAPA 5: Salvar Configuração');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const localConfig = {
        network: 'localhost',
        fork: 'Local (no fork)',
        contractAddress: contractAddress,
        usdtAddress: usdtAddress,
        owner: owner.address,
        accounts: {
            total: signers.length,
            testAccounts: testUsers.length,
            addresses: testUsers.slice(0, 20).map(s => s.address) // Primeiras 20 para referência
        },
        funding: {
            bnbPerAccount: '10000',
            usdtPerAccount: '100000'
        },
        timestamp: new Date().toISOString()
    };

    const configDir = path.join(__dirname, '..', 'local-fork-config');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    const configFile = path.join(configDir, 'setup.json');
    fs.writeFileSync(configFile, JSON.stringify(localConfig, null, 2));

    console.log('💾 Configuração salva:');
    console.log(`   ${configFile}`);
    console.log('');

    // 6. RESUMO FINAL
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SETUP COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 Informações do ambiente:');
    console.log('');
    console.log('🔗 Contratos:');
    console.log(`   iDeepXUnified: ${contractAddress}`);
    console.log(`   Mock USDT: ${usdtAddress}`);
    console.log('');
    console.log('👥 Contas:');
    console.log(`   Total: ${signers.length}`);
    console.log(`   Disponíveis para testes: ${testUsers.length}`);
    console.log('');
    console.log('💰 Saldos:');
    console.log('   BNB: 10,000 por conta');
    console.log('   USDT: 100,000 por conta');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('');
    console.log('1. Populate com usuários:');
    console.log('   npx hardhat run scripts/local-fork-populate.js --network localhost');
    console.log('');
    console.log('2. Simular distribuição semanal:');
    console.log('   npx hardhat run scripts/local-fork-simulate-week.js --network localhost');
    console.log('');
    console.log('3. Teste de stress (1000+ usuários):');
    console.log('   npx hardhat run scripts/local-fork-stress-test.js --network localhost');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return {
        contract,
        usdt,
        contractAddress,
        usdtAddress,
        owner,
        testUsers,
        config: localConfig
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO NO SETUP');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error(error);
        console.error('');
        console.error('💡 Certifique-se de que:');
        console.error('   1. Hardhat node está rodando: npx hardhat node');
        console.error('   2. Fork está habilitado no hardhat.config.js');
        console.error('   3. RPC endpoint está acessível');
        console.error('');
        process.exit(1);
    });
