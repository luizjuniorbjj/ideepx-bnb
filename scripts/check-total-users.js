/**
 * 📊 Verificar Total de Usuários Registrados
 */

import pkg from "hardhat";
const { ethers } = pkg;

const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 VERIFICANDO TOTAL DE USUÁRIOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const main = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        MAIN_ADDRESS
    );

    // Pegar estado do sistema
    console.log('🔍 Consultando contrato...\n');
    const [
        poolReserve,
        infrastructure,
        company,
        mlmLocked,
        deposited,
        distributed,
        week,
        activeCount,
        totalUsersCount
    ] = await main.getSystemState();

    console.log('📊 RESULTADOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Total de Usuários: ${totalUsersCount.toString()}`);
    console.log(`🎯 Usuários Ativos: ${activeCount.toString()}`);
    console.log(`💰 Pool de Liquidez: ${ethers.formatUnits(poolReserve, 6)} USDT`);
    console.log(`🏢 Balance Infraestrutura: ${ethers.formatUnits(infrastructure, 6)} USDT`);
    console.log(`🏦 Balance Empresa: ${ethers.formatUnits(company, 6)} USDT`);
    console.log(`🔒 MLM Locked: ${ethers.formatUnits(mlmLocked, 6)} USDT`);
    console.log(`📥 Total Depositado: ${ethers.formatUnits(deposited, 6)} USDT`);
    console.log(`📤 Total Distribuído: ${ethers.formatUnits(distributed, 6)} USDT`);
    console.log(`📅 Semana Atual: ${week.toString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Detalhar quem são os usuários
    console.log('📋 Detalhes dos Cadastros:\n');

    const PIONEER = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";
    const dashboard = await main.getUserDashboard(PIONEER);

    console.log('⭐ Pioneer:');
    console.log(`   Endereço: ${PIONEER}`);
    console.log(`   Diretos: ${dashboard.directs.toString()}`);
    console.log(`   LAI Ativo: ${dashboard.laiActive ? 'Sim' : 'Não'}`);
    console.log(`   Balance: ${ethers.formatUnits(dashboard.available, 6)} USDT`);
    console.log('');

    console.log('✅ Resumo:');
    console.log(`   • 1 Pioneer (${PIONEER.substring(0, 10)}...)`);
    console.log(`   • ${dashboard.directs.toString()} Diretos do Pioneer`);
    console.log(`   • ${activeCount.toString()} Usuários com LAI ativo`);
    console.log(`   • ${totalUsersCount.toString()} Total de cadastros`);
    console.log('');

    console.log('🔗 Verificar no BSCScan:');
    console.log(`   https://testnet.bscscan.com/address/${MAIN_ADDRESS}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    });
