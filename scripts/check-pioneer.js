/**
 * 🔍 Verificar Status do Pioneer
 */

import pkg from "hardhat";
const { ethers } = pkg;

const CONTRACT_ADDRESS = "0x1dEdE431aa189fc5790c4837014192078A89870F";
const PIONEER_WALLET = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

async function main() {
    console.log('\n🔍 Verificando Pioneer...\n');

    const contract = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        CONTRACT_ADDRESS
    );

    // Tentar getUserDashboard (mais confiável)
    try {
        const dashboard = await contract.getUserDashboard(PIONEER_WALLET);

        console.log('📊 Dashboard do Pioneer:');
        console.log('   Available:', ethers.formatUnits(dashboard[0], 6), 'USDT');
        console.log('   Locked:', ethers.formatUnits(dashboard[1], 6), 'USDT');
        console.log('   Total Earned:', ethers.formatUnits(dashboard[2], 6), 'USDT');
        console.log('   LAI Active:', dashboard[3] ? 'Sim' : 'Não');
        console.log('   LAI Expires:', new Date(Number(dashboard[4]) * 1000).toLocaleString());
        console.log('   Level:', dashboard[5].toString());
        console.log('   Directs:', dashboard[6].toString());
        console.log('   Volume:', ethers.formatUnits(dashboard[7], 6), 'USDT');
        console.log('');

        if (dashboard[6] > 0) {
            console.log('✅ Pioneer registrado e com diretos!');
        } else {
            console.log('⚠️  Pioneer registrado mas sem diretos ainda');
        }

    } catch (error) {
        console.log('❌ Erro:', error.message);

        if (error.message.includes('Not registered')) {
            console.log('⚠️  Pioneer NÃO está registrado no contrato');
        }
    }

    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
