/**
 * 🤖 POPULATE LOCAL FORK - iDeepX v3.1
 *
 * Popula o ambiente local com usuários e estrutura MLM completa
 *
 * O que faz:
 * 1. Cria estrutura de rede MLM realista
 * 2. Registra usuários com sponsors
 * 3. Distribui LAIs ativas
 * 4. Simula volumes de trading
 * 5. Cria usuários em diferentes níveis (L0-L10)
 *
 * Uso:
 * npx hardhat run scripts/local-fork-populate.js --network localhost
 *
 * Opções via ENV:
 * USER_COUNT=50 npx hardhat run scripts/local-fork-populate.js --network localhost
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
    console.log('🤖 POPULATE LOCAL FORK - iDeepX v3.1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. CARREGAR CONFIGURAÇÃO DO SETUP
    console.log('📂 Carregando configuração...');

    const configFile = path.join(__dirname, '..', 'local-fork-config', 'setup.json');

    if (!fs.existsSync(configFile)) {
        console.error('❌ Configuração não encontrada!');
        console.error('   Execute primeiro: npx hardhat run scripts/local-fork-setup.js --network localhost');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    console.log('✅ Configuração carregada');
    console.log(`   Contrato: ${config.contractAddress}`);
    console.log(`   USDT: ${config.usdtAddress}`);
    console.log('');

    // 2. CONECTAR AOS CONTRATOS
    const signers = await ethers.getSigners();
    const [owner, , , , ...testUsers] = signers;

    const contract = await ethers.getContractAt("iDeepXUnified", config.contractAddress);
    const usdt = await ethers.getContractAt("contracts/mocks/MockUSDT.sol:MockUSDT", config.usdtAddress);

    // 3. CONFIGURAR QUANTIDADE DE USUÁRIOS
    const userCount = parseInt(process.env.USER_COUNT || '50');
    const availableUsers = Math.min(userCount, testUsers.length);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CONFIGURAÇÃO DE POPULATE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`👥 Usuários a criar: ${availableUsers}`);
    console.log('');
    console.log('📋 Distribuição:');
    console.log(`   - FREE (sem LAI): ~20%`);
    console.log(`   - L1-5 (com LAI): ~60%`);
    console.log(`   - L6-10 (qualificado): ~20%`);
    console.log('');

    // 4. CRIAR ESTRUTURA MLM
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌳 CRIANDO ESTRUTURA MLM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const laiPrice = await contract.subscriptionFee();
    const results = {
        registered: 0,
        withLAI: 0,
        qualified: 0, // L6-10
        totalLAIPaid: 0n,
        totalBonusPaid: 0n,
        errors: 0
    };

    // Estrutura de rede: primeiro usuário sem sponsor, resto com sponsors
    console.log('📝 Registrando usuários...');
    console.log('');

    for (let i = 0; i < availableUsers; i++) {
        const user = testUsers[i];
        const userNum = i + 1;

        try {
            // Determinar sponsor (estratégia balanceada)
            let sponsor = ethers.ZeroAddress;

            if (i > 0) {
                // Estratégia: criar rede realista
                // - Primeiros 10: patrocinados pelo user 0
                // - Próximos: distribuídos entre os 30% primeiros usuários
                if (i <= 10) {
                    sponsor = testUsers[0].address;
                } else {
                    const sponsorIndex = Math.floor(Math.random() * Math.floor(i * 0.3));
                    sponsor = testUsers[sponsorIndex].address;
                }
            }

            // Registrar usuário
            await contract.connect(user).registerUser(user.address, sponsor);
            results.registered++;

            // Determinar se terá LAI (80% dos usuários)
            const willHaveLAI = Math.random() < 0.8;

            if (willHaveLAI) {
                // Aprovar USDT
                await usdt.connect(user).approve(config.contractAddress, laiPrice);

                // Ativar LAI
                await contract.connect(user).activateLAI();

                results.withLAI++;
                results.totalLAIPaid += laiPrice;

                // Simular volume de trading (para qualificação L6-10)
                // 20% dos usuários com LAI terão volume alto
                if (Math.random() < 0.25) {
                    // Volume entre $5k e $50k
                    const volume = ethers.parseUnits(
                        (5000 + Math.random() * 45000).toFixed(2),
                        6
                    );

                    await contract.updateUserVolume(user.address, volume);
                }
            }

            // Feedback a cada 10 usuários
            if (userNum % 10 === 0 || userNum === availableUsers) {
                console.log(`✅ ${userNum}/${availableUsers} usuários processados`);
            }

        } catch (error) {
            console.error(`❌ Erro no usuário ${userNum}: ${error.message}`);
            results.errors++;
        }
    }

    console.log('');
    console.log('✅ Registro completo!');
    console.log('');

    // 5. ATUALIZAR NÍVEIS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 ATUALIZANDO NÍVEIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('⚙️ Calculando níveis para todos os usuários...');
    console.log('');

    const levels = {
        L0: 0,   // FREE (sem LAI)
        L5: 0,   // L1-5 (com LAI)
        L10: 0   // L6-10 (qualificado)
    };

    for (let i = 0; i < availableUsers; i++) {
        const user = testUsers[i];

        try {
            await contract.updateUserLevel(user.address);

            const userInfo = await contract.getUserInfo(user.address);
            const level = Number(userInfo.networkLevel);

            if (level === 0) levels.L0++;
            else if (level === 5) levels.L5++;
            else if (level === 10) {
                levels.L10++;
                results.qualified++;
            }

            if ((i + 1) % 10 === 0 || (i + 1) === availableUsers) {
                console.log(`✅ ${i + 1}/${availableUsers} níveis atualizados`);
            }

        } catch (error) {
            console.error(`❌ Erro ao atualizar nível: ${error.message}`);
        }
    }

    console.log('');
    console.log('✅ Níveis atualizados!');
    console.log('');

    // 6. CALCULAR ESTATÍSTICAS DE BÔNUS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 CALCULANDO BÔNUS PAGOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    let totalBonusPaid = 0n;
    let usersWithBonus = 0;

    for (let i = 0; i < availableUsers; i++) {
        const user = testUsers[i];
        const userInfo = await contract.getUserInfo(user.address);

        if (userInfo.totalEarned > 0n) {
            totalBonusPaid += userInfo.totalEarned;
            usersWithBonus++;
        }
    }

    results.totalBonusPaid = totalBonusPaid;

    console.log('✅ Cálculo concluído!');
    console.log('');

    // 7. ESTATÍSTICAS FINAIS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTATÍSTICAS FINAIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('👥 USUÁRIOS:');
    console.log(`   Total registrados: ${results.registered}`);
    console.log(`   Com LAI ativa: ${results.withLAI} (${((results.withLAI/results.registered)*100).toFixed(1)}%)`);
    console.log(`   FREE (sem LAI): ${results.registered - results.withLAI} (${(((results.registered - results.withLAI)/results.registered)*100).toFixed(1)}%)`);
    console.log(`   Qualificados L6-10: ${results.qualified} (${((results.qualified/results.registered)*100).toFixed(1)}%)`);
    console.log(`   Erros: ${results.errors}`);
    console.log('');
    console.log('🎯 NÍVEIS:');
    console.log(`   L0 (FREE): ${levels.L0}`);
    console.log(`   L5 (L1-5): ${levels.L5}`);
    console.log(`   L10 (L6-10): ${levels.L10}`);
    console.log('');
    console.log('💰 FINANCEIRO:');
    console.log(`   LAI vendidas: ${results.withLAI} × $${ethers.formatUnits(laiPrice, 6)} = $${ethers.formatUnits(results.totalLAIPaid, 6)}`);
    console.log(`   Bônus pagos (25%): $${ethers.formatUnits(results.totalBonusPaid, 6)}`);
    console.log(`   Usuários com bônus: ${usersWithBonus}`);
    console.log('');

    // Verificar contrato
    const contractUserCount = await contract.totalUsers();

    console.log('📋 CONTRATO:');
    console.log(`   Total usuários: ${contractUserCount.toString()}`);
    console.log(`   Semana atual: ${await contract.currentWeek()}`);
    console.log('');

    // 8. SALVAR RESULTADOS
    const populateResults = {
        timestamp: new Date().toISOString(),
        config: {
            contractAddress: config.contractAddress,
            usdtAddress: config.usdtAddress
        },
        results: {
            registered: results.registered,
            withLAI: results.withLAI,
            qualified: results.qualified,
            errors: results.errors
        },
        levels: levels,
        financial: {
            totalLAIPaid: ethers.formatUnits(results.totalLAIPaid, 6),
            totalBonusPaid: ethers.formatUnits(results.totalBonusPaid, 6),
            usersWithBonus: usersWithBonus
        },
        contract: {
            totalUsers: contractUserCount.toString(),
            currentWeek: (await contract.currentWeek()).toString()
        }
    };

    const resultsFile = path.join(__dirname, '..', 'local-fork-config', 'populate-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(populateResults, null, 2));

    console.log('💾 Resultados salvos:');
    console.log(`   ${resultsFile}`);
    console.log('');

    // 9. PRÓXIMOS PASSOS
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 PRÓXIMOS PASSOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('1. Simular distribuição semanal:');
    console.log('   npx hardhat run scripts/local-fork-simulate-week.js --network localhost');
    console.log('');
    console.log('2. Visualizar rede MLM:');
    console.log('   npx hardhat run scripts/local-fork-analyze.js --network localhost');
    console.log('');
    console.log('3. Adicionar mais usuários:');
    console.log('   USER_COUNT=100 npx hardhat run scripts/local-fork-populate.js --network localhost');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ POPULATE CONCLUÍDO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return populateResults;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO NO POPULATE');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error(error);
        console.error('');
        process.exit(1);
    });
