/**
 * 🔍 SCRIPT DE VERIFICAÇÃO - iDeepX v3.1 Unified
 *
 * Verifica o contrato no BSCScan
 *
 * Uso:
 * npx hardhat run scripts/verify-v3.1-unified.js --network bscTestnet
 * npx hardhat run scripts/verify-v3.1-unified.js --network bsc
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VERIFICAÇÃO iDeepX v3.1 Unified');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const network = hre.network.name;
    console.log(`📡 Rede: ${network}`);
    console.log('');

    // Verificar se tem API key
    if (!process.env.BSCSCAN_API_KEY) {
        console.error('❌ ERRO: BSCSCAN_API_KEY não configurado no .env');
        console.error('');
        console.error('Para obter uma API key:');
        console.error('1. Acesse: https://bscscan.com/myapikey');
        console.error('2. Crie uma conta e gere uma API key');
        console.error('3. Adicione no .env: BSCSCAN_API_KEY=sua_key_aqui');
        console.error('');
        process.exit(1);
    }

    // 1. BUSCAR DEPLOYMENT MAIS RECENTE
    console.log('📂 Buscando deployment mais recente...');

    const deployDir = path.join(__dirname, '..', 'deployments');

    if (!fs.existsSync(deployDir)) {
        console.error('❌ ERRO: Pasta deployments não encontrada');
        console.error('   Execute o deploy primeiro: npx hardhat run scripts/deploy-v3.1-unified.js --network', network);
        process.exit(1);
    }

    const files = fs.readdirSync(deployDir)
        .filter(f => f.startsWith(`v3.1-unified_${network}_`) && f.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.error(`❌ ERRO: Nenhum deployment encontrado para rede ${network}`);
        console.error('   Execute o deploy primeiro: npx hardhat run scripts/deploy-v3.1-unified.js --network', network);
        process.exit(1);
    }

    const latestFile = files[0];
    const deployInfo = JSON.parse(fs.readFileSync(path.join(deployDir, latestFile), 'utf8'));

    console.log('✅ Deployment encontrado:');
    console.log(`   Arquivo: ${latestFile}`);
    console.log(`   Contrato: ${deployInfo.contractAddress}`);
    console.log(`   Deploy: ${deployInfo.timestamp}`);
    console.log('');

    // 2. VERIFICAR CONTRATO
    console.log('🔍 Iniciando verificação no BSCScan...');
    console.log('');

    try {
        await hre.run("verify:verify", {
            address: deployInfo.contractAddress,
            constructorArguments: [
                deployInfo.usdtAddress,
                deployInfo.liquidityWallet,
                deployInfo.infrastructureWallet,
                deployInfo.companyWallet
            ]
        });

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');

        const scanUrl = network === 'bsc'
            ? 'https://bscscan.com'
            : 'https://testnet.bscscan.com';

        console.log('🔗 Contrato verificado:');
        console.log(`   ${scanUrl}/address/${deployInfo.contractAddress}#code`);
        console.log('');
        console.log('📊 Informações disponíveis no BSCScan:');
        console.log('   - Código fonte verificado ✅');
        console.log('   - ABI disponível ✅');
        console.log('   - Leitura de funções ✅');
        console.log('   - Escrita de funções ✅');
        console.log('');

    } catch (error) {
        if (error.message.includes('Already Verified')) {
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('ℹ️  CONTRATO JÁ VERIFICADO');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');

            const scanUrl = network === 'bsc'
                ? 'https://bscscan.com'
                : 'https://testnet.bscscan.com';

            console.log('🔗 Visualizar no BSCScan:');
            console.log(`   ${scanUrl}/address/${deployInfo.contractAddress}#code`);
            console.log('');

        } else {
            console.error('');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ ERRO NA VERIFICAÇÃO');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('');
            console.error(error.message);
            console.error('');
            console.error('💡 Dicas:');
            console.error('   1. Verifique se o contrato foi deployed recentemente');
            console.error('   2. Aguarde alguns minutos e tente novamente');
            console.error('   3. Verifique se a API key é válida');
            console.error('   4. Tente verificar manualmente no BSCScan');
            console.error('');
            console.error('📝 Verificação manual:');
            console.error('   1. Acesse: https://bscscan.com/verifyContract');
            console.error(`   2. Contract Address: ${deployInfo.contractAddress}`);
            console.error('   3. Compiler: v0.8.20');
            console.error('   4. Cole o código do contrato');
            console.error('');

            process.exit(1);
        }
    }

    // 3. ATUALIZAR ARQUIVO DE DEPLOYMENT
    deployInfo.verified = true;
    deployInfo.verifiedAt = new Date().toISOString();

    fs.writeFileSync(
        path.join(deployDir, latestFile),
        JSON.stringify(deployInfo, null, 2)
    );

    console.log('💾 Arquivo de deployment atualizado');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Processo concluído!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('❌ Erro na verificação:', error);
        console.error('');
        process.exit(1);
    });
