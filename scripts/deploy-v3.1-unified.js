/**
 * 🚀 SCRIPT DE DEPLOY - iDeepX v3.1 Unified
 *
 * Deploy do contrato iDeepXUnified para BSC (Testnet ou Mainnet)
 *
 * Uso:
 * - Testnet: npx hardhat run scripts/deploy-v3.1-unified.js --network bscTestnet
 * - Mainnet: npx hardhat run scripts/deploy-v3.1-unified.js --network bsc
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 DEPLOY iDeepX v3.1 Unified');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. VERIFICAR REDE
    const network = hre.network.name;
    console.log(`📡 Rede: ${network}`);

    if (network === 'hardhat' || network === 'localhost') {
        console.error('❌ ERRO: Esta rede não é suportada para deploy!');
        console.error('   Use: --network bscTestnet ou --network bsc');
        process.exit(1);
    }

    // 2. VERIFICAR VARIÁVEIS DE AMBIENTE
    console.log('🔍 Verificando configurações...');

    // Endereços USDT
    const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";
    const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

    const isTestnet = network === 'bscTestnet';
    const USDT_ADDRESS = process.env.USDT_ADDRESS || (isTestnet ? USDT_TESTNET : USDT_MAINNET);

    const LIQUIDITY_WALLET = process.env.LIQUIDITY_WALLET;
    const INFRASTRUCTURE_WALLET = process.env.INFRASTRUCTURE_WALLET;
    const COMPANY_WALLET = process.env.COMPANY_WALLET;

    if (!USDT_ADDRESS) {
        console.error('❌ ERRO: USDT_ADDRESS não configurado');
        process.exit(1);
    }

    // 3. OBTER SIGNER
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log('✅ Configurações OK');
    console.log('');
    console.log('👤 Deployer:', deployer.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'BNB');
    console.log('');

    // Usar deployer address como fallback para carteiras
    const liquidityWallet = LIQUIDITY_WALLET || deployer.address;
    const infrastructureWallet = INFRASTRUCTURE_WALLET || deployer.address;
    const companyWallet = COMPANY_WALLET || deployer.address;

    console.log('📦 Configurações do contrato:');
    console.log(`   - USDT: ${USDT_ADDRESS}`);
    console.log(`   - Liquidity Wallet: ${liquidityWallet}`);
    console.log(`   - Infrastructure Wallet: ${infrastructureWallet}`);
    console.log(`   - Company Wallet: ${companyWallet}`);
    console.log('');

    if (liquidityWallet === deployer.address || infrastructureWallet === deployer.address || companyWallet === deployer.address) {
        console.log('⚠️ AVISO: Usando endereço do deployer como fallback!');
        console.log('   Configure LIQUIDITY_WALLET, INFRASTRUCTURE_WALLET, COMPANY_WALLET no .env');
        console.log('');
    }

    // Verificar balance mínimo
    const minBalance = ethers.parseEther('0.05');
    if (balance < minBalance) {
        console.error('❌ ERRO: Balance insuficiente!');
        console.error(`   Necessário: mínimo 0.05 BNB`);
        console.error(`   Disponível: ${ethers.formatEther(balance)} BNB`);
        process.exit(1);
    }

    // 4. CONFIRMAR DEPLOY NA MAINNET
    if (network === 'bsc') {
        console.log('⚠️⚠️⚠️ ATENÇÃO: DEPLOY NA MAINNET! ⚠️⚠️⚠️');
        console.log('');
        console.log('Aguardando 5 segundos para confirmação...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('');
    }

    // 5. COMPILAR CONTRATO
    console.log('🔨 Compilando contrato...');
    await hre.run('compile');
    console.log('✅ Compilação concluída');
    console.log('');

    // 6. DEPLOY
    console.log('🚀 Iniciando deploy...');
    console.log('');

    const iDeepXUnified = await ethers.getContractFactory("iDeepXUnified");

    console.log('⏳ Enviando transação de deploy...');

    const contract = await iDeepXUnified.deploy(
        USDT_ADDRESS,
        liquidityWallet,
        infrastructureWallet,
        companyWallet
    );

    console.log('⏳ Aguardando confirmação...');

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DEPLOY CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 INFORMAÇÕES DO CONTRATO:');
    console.log('');
    console.log(`   Endereço: ${contractAddress}`);
    console.log(`   Rede: ${network}`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   TX Hash: ${contract.deploymentTransaction().hash}`);
    console.log('');

    // 7. VERIFICAR INFORMAÇÕES DO CONTRATO
    console.log('🔍 Verificando configurações do contrato...');
    console.log('');

    const subscriptionFee = await contract.subscriptionFee();
    const currentWeek = await contract.currentWeek();
    const owner = await contract.owner();

    console.log('📊 Configurações do contrato:');
    console.log(`   - Subscription Fee (LAI): $${ethers.formatUnits(subscriptionFee, 6)} USDT`);
    console.log(`   - Current Week: ${currentWeek.toString()}`);
    console.log(`   - Owner: ${owner}`);
    console.log(`   - USDT Token: ${USDT_ADDRESS}`);
    console.log('');

    // 8. SALVAR INFORMAÇÕES
    const deployInfo = {
        version: "v3.1-unified",
        network: network,
        contractAddress: contractAddress,
        deployer: deployer.address,
        usdtAddress: USDT_ADDRESS,
        liquidityWallet: liquidityWallet,
        infrastructureWallet: infrastructureWallet,
        companyWallet: companyWallet,
        subscriptionFee: "19",
        deploymentTx: contract.deploymentTransaction().hash,
        timestamp: new Date().toISOString(),
        blockNumber: contract.deploymentTransaction().blockNumber || 'Pending',
        config: {
            mlmLevels: 10,
            laiPrice: "$19/month",
            distribution: {
                liquidity: "5%",
                infrastructure: "15%",
                company: "35%",
                mlmDistributed: "30%",
                mlmLocked: "15%"
            },
            processing: "Weekly (Monday 00:30)"
        }
    };

    const deployDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deployDir)) {
        fs.mkdirSync(deployDir, { recursive: true });
    }

    const filename = `v3.1-unified_${network}_${Date.now()}.json`;
    const filepath = path.join(deployDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(deployInfo, null, 2));

    console.log('💾 Informações salvas em:');
    console.log(`   ${filepath}`);
    console.log('');

    // 9. PRÓXIMOS PASSOS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('1. Verificar contrato no BSCScan:');
    console.log(`   npx hardhat verify --network ${network} ${contractAddress} "${USDT_ADDRESS}" "${liquidityWallet}" "${infrastructureWallet}" "${companyWallet}"`);
    console.log('');
    console.log('2. Testar funções básicas:');
    console.log('   - registerUser(wallet, sponsor)');
    console.log('   - payLAI() [requer aprovar 19 USDT]');
    console.log('   - depositWeeklyPerformance(amount, ipfsHash)');
    console.log('');
    console.log('3. Configurar backend:');
    console.log(`   - Adicionar CONTRACT_ADDRESS=${contractAddress} no .env`);
    console.log('   - Iniciar jobs agendados:');
    console.log('     • Daily (09:00): Notificações LAI');
    console.log('     • Weekly Sunday (23:00): Atualização de níveis');
    console.log('     • Weekly Monday (00:30): Distribuição performance');
    console.log('     • Monthly (Dia 1 00:00): Reset de volumes');
    console.log('');
    console.log('4. Configurar frontend:');
    console.log(`   - Atualizar NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log('   - Rebuild e redeploy');
    console.log('');

    if (network === 'bsc') {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️ CHECKLIST CRÍTICO MAINNET:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('✅ Antes de usar em produção:');
        console.log('   1. Auditoria de segurança completa');
        console.log('   2. Testes extensivos em testnet (mínimo 1 semana)');
        console.log('   3. Verificar aprovações de USDT do owner');
        console.log('   4. Configurar monitoramento 24/7');
        console.log('   5. Plano de resposta a incidentes');
        console.log('   6. Backup das private keys em local seguro');
        console.log('   7. Considerar multisig para owner');
        console.log('   8. Testar função pause() e unpause()');
        console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 MODELO DE NEGÓCIO V3.1:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💰 LAI (Licença de Acesso Inteligente): $19/mês');
    console.log('');
    console.log('🎁 Bônus de Patrocínio: 25% ($4.75)');
    console.log('   - Pago SEMPRE quando indicado paga LAI');
    console.log('   - Mesmo para usuários FREE (sem LAI ativa)');
    console.log('');
    console.log('📊 Distribuição Performance Fee (35%):');
    console.log('   - 5% Liquidity Pool');
    console.log('   - 15% Infrastructure');
    console.log('   - 35% Company');
    console.log('   - 30% MLM Distribuído (10 níveis)');
    console.log('   - 15% MLM Locked (vesting)');
    console.log('');
    console.log('🎯 Níveis:');
    console.log('   - L1-5: Automático com LAI ativa');
    console.log('   - L6-10: 5 diretos + $5,000 volume mensal');
    console.log('');
    console.log('⏰ Processamento: Semanal (toda segunda às 00:30)');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Deploy concluído com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 10. VERIFICAÇÃO AUTOMÁTICA
    if (process.env.BSCSCAN_API_KEY) {
        console.log('🔍 Tentando verificação automática...');
        console.log('⏳ Aguardando 30 segundos para indexação...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [
                    USDT_ADDRESS,
                    liquidityWallet,
                    infrastructureWallet,
                    companyWallet
                ]
            });
            console.log('✅ Verificação concluída automaticamente!');
        } catch (error) {
            console.log('⚠️ Verificação automática falhou (normal se já verificado)');
            console.log('   Use o comando acima para verificar manualmente');
        }
        console.log('');
    }

    return {
        contractAddress,
        deployInfo
    };
}

// Executar deploy
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO NO DEPLOY');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error(error);
        console.error('');
        process.exit(1);
    });
