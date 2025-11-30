/**
 * 🔍 VERIFICAR POOLS DO CONTRATO
 *
 * Verifica se os 40% (Liquidity 5%, Infra 12%, Company 23%)
 * estão sendo corretamente separados dos depósitos
 */

import pkg from "hardhat";
const { ethers } = pkg;

const CONFIG = {
    MAIN_ADDRESS: "0x2d436d57a9Fd7559E569977652A082dDC9510740"
};

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VERIFICAÇÃO DE POOLS DO CONTRATO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const main = await ethers.getContractAt("iDeepXUnifiedSecure", CONFIG.MAIN_ADDRESS);

    // Buscar estado global
    console.log('📊 ESTADO GLOBAL DO CONTRATO\n');

    try {
        const currentWeek = await main.currentWeek();
        console.log(`  Semana atual: ${currentWeek}`);

        const totalDeposited = await main.totalDeposited();
        console.log(`  Total depositado: $${ethers.formatUnits(totalDeposited, 6)} USDT`);

        const totalDistributed = await main.totalDistributed();
        console.log(`  Total distribuído: $${ethers.formatUnits(totalDistributed, 6)} USDT`);

        console.log('');

        // Verificar pools individuais
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💰 POOLS ACUMULADOS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const poolLiquidity = await main.liquidityPoolReserve();
        console.log(`  🌊 Pool Liquidez: $${ethers.formatUnits(poolLiquidity, 6)} USDT`);
        console.log(`     └─ Esperado (5%): $${(parseFloat(ethers.formatUnits(totalDeposited, 6)) * 0.05).toFixed(2)} USDT`);

        const poolInfrastructure = await main.infrastructureBalance();
        console.log(`  🏗️  Pool Infraestrutura: $${ethers.formatUnits(poolInfrastructure, 6)} USDT`);
        console.log(`     └─ Esperado (12%): $${(parseFloat(ethers.formatUnits(totalDeposited, 6)) * 0.12).toFixed(2)} USDT`);

        const poolCompany = await main.companyBalance();
        console.log(`  🏢 Pool Empresa: $${ethers.formatUnits(poolCompany, 6)} USDT`);
        console.log(`     └─ Esperado (23%): $${(parseFloat(ethers.formatUnits(totalDeposited, 6)) * 0.23).toFixed(2)} USDT`);

        const mlmLocked = await main.mlmLockedBalance();
        console.log(`  🔒 MLM Locked (30%): $${ethers.formatUnits(mlmLocked, 6)} USDT`);
        console.log(`     └─ Esperado (30% do 60% MLM): $${(parseFloat(ethers.formatUnits(totalDeposited, 6)) * 0.18).toFixed(2)} USDT`);

        console.log('');

        // Calcular percentuais reais
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 ANÁLISE DE PERCENTUAIS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const totalDepositedFloat = parseFloat(ethers.formatUnits(totalDeposited, 6));
        const totalDistributedFloat = parseFloat(ethers.formatUnits(totalDistributed, 6));
        const liquidityFloat = parseFloat(ethers.formatUnits(poolLiquidity, 6));
        const infraFloat = parseFloat(ethers.formatUnits(poolInfrastructure, 6));
        const companyFloat = parseFloat(ethers.formatUnits(poolCompany, 6));
        const mlmLockedFloat = parseFloat(ethers.formatUnits(mlmLocked, 6));

        if (totalDepositedFloat > 0) {
            const liquidityPercent = (liquidityFloat / totalDepositedFloat) * 100;
            const infraPercent = (infraFloat / totalDepositedFloat) * 100;
            const companyPercent = (companyFloat / totalDepositedFloat) * 100;
            const distributedPercent = (totalDistributedFloat / totalDepositedFloat) * 100;
            const mlmLockedPercent = (mlmLockedFloat / totalDepositedFloat) * 100;

            console.log(`  Pool Liquidez:`);
            console.log(`    └─ Real: ${liquidityPercent.toFixed(2)}% | Esperado: 5% ${Math.abs(liquidityPercent - 5) < 0.5 ? '✅' : '⚠️'}`);
            console.log('');

            console.log(`  Pool Infraestrutura:`);
            console.log(`    └─ Real: ${infraPercent.toFixed(2)}% | Esperado: 12% ${Math.abs(infraPercent - 12) < 0.5 ? '✅' : '⚠️'}`);
            console.log('');

            console.log(`  Pool Empresa:`);
            console.log(`    └─ Real: ${companyPercent.toFixed(2)}% | Esperado: 23% ${Math.abs(companyPercent - 23) < 0.5 ? '✅' : '⚠️'}`);
            console.log('');

            console.log(`  MLM Distribuído (disponível):`);
            console.log(`    └─ Real: ${distributedPercent.toFixed(2)}% | Esperado: 42% (70% do 60% MLM) ${Math.abs(distributedPercent - 42) < 2 ? '✅' : '⚠️'}`);
            console.log('');

            console.log(`  MLM Locked (bloqueado):`);
            console.log(`    └─ Real: ${mlmLockedPercent.toFixed(2)}% | Esperado: 18% (30% do 60% MLM) ${Math.abs(mlmLockedPercent - 18) < 1 ? '✅' : '⚠️'}`);
            console.log('');

            const totalMLM = distributedPercent + mlmLockedPercent;
            console.log(`  TOTAL MLM (distribuído + locked):`);
            console.log(`    └─ Real: ${totalMLM.toFixed(2)}% | Esperado: 60% ${Math.abs(totalMLM - 60) < 2 ? '✅' : '⚠️'}`);
            console.log('');

            const total = liquidityPercent + infraPercent + companyPercent + totalMLM;
            console.log(`  TOTAL ALOCADO: ${total.toFixed(2)}%`);
            console.log(`  └─ Esperado: 100% ${Math.abs(total - 100) < 1 ? '✅' : '⚠️'}`);
        }

        console.log('');

        // Verificar depósitos por semana
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📅 DEPÓSITOS POR SEMANA');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        for (let week = 0; week <= currentWeek; week++) {
            try {
                const weekData = await main.weeklyDeposits(week);
                const amount = weekData.amount;
                const processed = weekData.processed;

                if (amount > 0) {
                    console.log(`  Semana ${week}:`);
                    console.log(`    └─ Valor: $${ethers.formatUnits(amount, 6)} USDT`);
                    console.log(`    └─ Processado: ${processed ? '✅ Sim' : '❌ Não'}`);
                }
            } catch (error) {
                // Semana não existe
            }
        }

        console.log('');

        // Resumo final
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 RESUMO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const totalPools = liquidityFloat + infraFloat + companyFloat;
        const totalMLM = totalDistributedFloat + mlmLockedFloat;
        const grandTotal = totalPools + totalMLM;

        console.log(`  💰 Total em Pools (L+I+C): $${totalPools.toFixed(2)} USDT`);
        console.log(`  👥 Total MLM Distribuído: $${totalDistributedFloat.toFixed(2)} USDT`);
        console.log(`  🔒 Total MLM Locked: $${mlmLockedFloat.toFixed(2)} USDT`);
        console.log(`  📊 Total MLM (dist + locked): $${totalMLM.toFixed(2)} USDT`);
        console.log(`  💵 Total Geral Alocado: $${grandTotal.toFixed(2)} USDT`);
        console.log(`  💰 Total Depositado: $${totalDepositedFloat.toFixed(2)} USDT`);
        console.log('');

        const difference = totalDepositedFloat - grandTotal;
        if (Math.abs(difference) < 1) {
            console.log('  ✅ Valores batem! Todos os depósitos foram alocados corretamente.');
        } else {
            console.log(`  ⚠️  Diferença encontrada: $${difference.toFixed(2)} USDT`);
            console.log(`     └─ Pode ser arredondamento ou valor ainda não distribuído`);
        }

    } catch (error) {
        console.error('❌ Erro ao ler estado:', error.message);
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICAÇÃO COMPLETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Erro:', error);
        process.exit(1);
    });
