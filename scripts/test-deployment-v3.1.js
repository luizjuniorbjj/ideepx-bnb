/**
 * 🧪 SCRIPT DE TESTE - iDeepX v3.1 Unified Deployment
 *
 * Testa o deployment do contrato verificando:
 * - Configurações básicas
 * - Permissões
 * - Estado inicial
 * - Funções de leitura
 *
 * Uso:
 * npx hardhat run scripts/test-deployment-v3.1.js --network bscTestnet
 * npx hardhat run scripts/test-deployment-v3.1.js --network bsc
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TESTE DE DEPLOYMENT - iDeepX v3.1 Unified');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const network = hre.network.name;
    console.log(`📡 Rede: ${network}`);
    console.log('');

    // 1. BUSCAR DEPLOYMENT
    console.log('📂 Buscando deployment...');

    const deployDir = path.join(__dirname, '..', 'deployments');

    if (!fs.existsSync(deployDir)) {
        console.error('❌ ERRO: Pasta deployments não encontrada');
        process.exit(1);
    }

    const files = fs.readdirSync(deployDir)
        .filter(f => f.startsWith(`v3.1-unified_${network}_`) && f.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.error(`❌ ERRO: Nenhum deployment encontrado para rede ${network}`);
        process.exit(1);
    }

    const latestFile = files[0];
    const deployInfo = JSON.parse(fs.readFileSync(path.join(deployDir, latestFile), 'utf8'));

    console.log('✅ Deployment encontrado:');
    console.log(`   Contrato: ${deployInfo.contractAddress}`);
    console.log('');

    // 2. CONECTAR AO CONTRATO
    console.log('🔗 Conectando ao contrato...');

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("iDeepXUnified", deployInfo.contractAddress, signer);

    console.log('✅ Conectado');
    console.log('');

    // 3. TESTES DE CONFIGURAÇÃO
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 TESTE 1: Verificar Configurações');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    let passed = 0;
    let failed = 0;

    try {
        // USDT Address
        const usdtAddress = await contract.USDT();
        console.log(`✅ USDT Address: ${usdtAddress}`);
        if (usdtAddress === deployInfo.usdtAddress) {
            console.log('   ✓ Correto');
            passed++;
        } else {
            console.log(`   ✗ Esperado: ${deployInfo.usdtAddress}`);
            failed++;
        }
        console.log('');

        // Subscription Fee
        const subscriptionFee = await contract.subscriptionFee();
        const feeUSD = ethers.formatUnits(subscriptionFee, 6);
        console.log(`✅ Subscription Fee (LAI): $${feeUSD} USDT`);
        if (feeUSD === '19.0') {
            console.log('   ✓ Correto ($19)');
            passed++;
        } else {
            console.log('   ✗ Esperado: $19');
            failed++;
        }
        console.log('');

        // Liquidity Wallet
        const liquidityWallet = await contract.liquidityWallet();
        console.log(`✅ Liquidity Wallet: ${liquidityWallet}`);
        if (liquidityWallet === deployInfo.liquidityWallet) {
            console.log('   ✓ Correto');
            passed++;
        } else {
            console.log(`   ✗ Esperado: ${deployInfo.liquidityWallet}`);
            failed++;
        }
        console.log('');

        // Infrastructure Wallet
        const infrastructureWallet = await contract.infrastructureWallet();
        console.log(`✅ Infrastructure Wallet: ${infrastructureWallet}`);
        if (infrastructureWallet === deployInfo.infrastructureWallet) {
            console.log('   ✓ Correto');
            passed++;
        } else {
            console.log(`   ✗ Esperado: ${deployInfo.infrastructureWallet}`);
            failed++;
        }
        console.log('');

        // Company Wallet
        const companyWallet = await contract.companyWallet();
        console.log(`✅ Company Wallet: ${companyWallet}`);
        if (companyWallet === deployInfo.companyWallet) {
            console.log('   ✓ Correto');
            passed++;
        } else {
            console.log(`   ✗ Esperado: ${deployInfo.companyWallet}`);
            failed++;
        }
        console.log('');

        // Owner
        const owner = await contract.owner();
        console.log(`✅ Owner: ${owner}`);
        if (owner === deployInfo.deployer) {
            console.log('   ✓ Correto');
            passed++;
        } else {
            console.log(`   ⚠ Diferente do deployer: ${deployInfo.deployer}`);
            console.log('   (Ownership pode ter sido transferido)');
        }
        console.log('');

    } catch (error) {
        console.error('❌ Erro ao verificar configurações:', error.message);
        failed++;
    }

    // 4. TESTE DE ESTADO INICIAL
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 TESTE 2: Verificar Estado Inicial');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    try {
        // Current Week
        const currentWeek = await contract.currentWeek();
        console.log(`✅ Current Week: ${currentWeek.toString()}`);
        if (Number(currentWeek) === 1) {
            console.log('   ✓ Iniciou em semana 1');
            passed++;
        } else {
            console.log(`   ⚠ Semana diferente: ${currentWeek.toString()}`);
        }
        console.log('');

        // Total Users
        const userCount = await contract.userCount();
        console.log(`✅ Total Usuários: ${userCount.toString()}`);
        if (Number(userCount) === 0) {
            console.log('   ✓ Nenhum usuário registrado ainda');
            passed++;
        } else {
            console.log(`   ⚠ Já existem ${userCount} usuários registrados`);
        }
        console.log('');

        // Paused
        const paused = await contract.paused();
        console.log(`✅ Paused: ${paused}`);
        if (!paused) {
            console.log('   ✓ Contrato ativo');
            passed++;
        } else {
            console.log('   ⚠ Contrato está pausado');
        }
        console.log('');

    } catch (error) {
        console.error('❌ Erro ao verificar estado inicial:', error.message);
        failed++;
    }

    // 5. TESTE DE FUNÇÕES DE LEITURA
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 TESTE 3: Verificar Funções de Leitura');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    try {
        // Verificar endereço zero
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        const userInfo = await contract.getUserInfo(zeroAddress);

        console.log('✅ getUserInfo() funcionando');
        console.log(`   - hasActiveLAI: ${userInfo.hasActiveLAI}`);
        console.log(`   - networkLevel: ${userInfo.networkLevel}`);
        console.log(`   - directsCount: ${userInfo.directsCount}`);
        passed++;
        console.log('');

        // Verificar active users
        const activeUsers = await contract.getActiveUsers();
        console.log('✅ getActiveUsers() funcionando');
        console.log(`   - Total ativos: ${activeUsers.length}`);
        passed++;
        console.log('');

    } catch (error) {
        console.error('❌ Erro ao verificar funções de leitura:', error.message);
        failed++;
    }

    // 6. TESTE DE PERMISSÕES
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 TESTE 4: Verificar Permissões');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    try {
        const owner = await contract.owner();
        console.log(`✅ Owner atual: ${owner}`);
        console.log(`   Signer: ${signer.address}`);

        if (owner.toLowerCase() === signer.address.toLowerCase()) {
            console.log('   ✓ Você é o owner');
            passed++;
        } else {
            console.log('   ⚠ Você NÃO é o owner');
            console.log('   (Algumas funções admin não funcionarão)');
        }
        console.log('');

    } catch (error) {
        console.error('❌ Erro ao verificar permissões:', error.message);
        failed++;
    }

    // 7. RESUMO
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO DOS TESTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`   ✅ Testes passados: ${passed}`);
    console.log(`   ❌ Testes falhados: ${failed}`);
    console.log(`   📊 Total: ${passed + failed}`);
    console.log(`   🎯 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('');

    if (failed === 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 TODOS OS TESTES PASSARAM!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('✅ Contrato deployado corretamente');
        console.log('✅ Configurações validadas');
        console.log('✅ Estado inicial correto');
        console.log('✅ Funções de leitura operacionais');
        console.log('');
        console.log('📝 Próximos passos sugeridos:');
        console.log('   1. Registrar primeiro usuário teste');
        console.log('   2. Testar pagamento de LAI');
        console.log('   3. Testar distribuição semanal (mock)');
        console.log('   4. Configurar jobs do backend');
        console.log('');
    } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️ ALGUNS TESTES FALHARAM');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('Revise os erros acima e:');
        console.log('   1. Verifique as configurações do .env');
        console.log('   2. Confirme o endereço do contrato');
        console.log('   3. Verifique se o deploy foi bem-sucedido');
        console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('❌ Erro ao executar testes:', error);
        console.error('');
        process.exit(1);
    });
