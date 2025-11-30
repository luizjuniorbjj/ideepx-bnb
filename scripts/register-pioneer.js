/**
 * 🌟 Script para Registrar o Pioneer
 *
 * Pioneer: 0x75d1a8ac59003088c60a20bde8953cbecfe41669
 *
 * Este script registra o Pioneer (sem sponsor) no contrato
 */

import pkg from "hardhat";
const { ethers } = pkg;

const CONTRACT_ADDRESS = "0x1dEdE431aa189fc5790c4837014192078A89870F";
const USDT_ADDRESS = "0x89173cb21b8f8Ac8Bf6680c85541f5826B992C0f";
const PIONEER_WALLET = "0x75d1a8ac59003088c60a20bde8953cbecfe41669";

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ REGISTRAR PIONEER NO CONTRATO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Conectar
    const [deployer] = await ethers.getSigners();
    console.log('🔧 Deployer:', deployer.address);
    console.log('⭐ Pioneer:', PIONEER_WALLET);
    console.log('');

    // Conectar aos contratos
    const contract = await ethers.getContractAt(
        "iDeepXUnifiedSecure",
        CONTRACT_ADDRESS
    );

    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDT.sol:MockUSDT",
        USDT_ADDRESS
    );

    // Verificar se já está registrado
    console.log('🔍 Verificando registro atual...');
    const pioneerData = await contract.users(PIONEER_WALLET);
    const isRegistered = pioneerData.registered;

    if (isRegistered) {
        console.log('✅ Pioneer JÁ está registrado!');
        console.log('');

        const dashboard = await contract.getUserDashboard(PIONEER_WALLET);
        console.log('📊 Dashboard do Pioneer:');
        console.log('   LAI Ativo:', dashboard.laiActive ? 'Sim' : 'Não');
        console.log('   Diretos:', dashboard.directs.toString());
        console.log('   Nível:', dashboard.level.toString());
        console.log('');

        return;
    }

    console.log('⚠️  Pioneer NÃO está registrado');
    console.log('');

    // Registrar Pioneer (sem sponsor)
    console.log('⏳ Registrando Pioneer...');
    console.log('   (Usando ZeroAddress como sponsor - primeiro usuário)');
    console.log('');

    try {
        const tx = await contract.registerUser(
            PIONEER_WALLET,
            ethers.ZeroAddress // Primeiro usuário, sem sponsor
        );

        console.log('⏳ Aguardando confirmação...');
        const receipt = await tx.wait();

        console.log('✅ Pioneer registrado com sucesso!');
        console.log('   TX:', receipt.hash);
        console.log('');

        // Verificar
        const dashboard = await contract.getUserDashboard(PIONEER_WALLET);
        console.log('📊 Dashboard do Pioneer:');
        console.log('   Registrado: ✅');
        console.log('   LAI Ativo:', dashboard.laiActive ? 'Sim' : 'Não');
        console.log('   Diretos:', dashboard.directs.toString());
        console.log('   Nível:', dashboard.level.toString());
        console.log('');

        // Instruções para LAI
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 PRÓXIMOS PASSOS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('⚠️  AÇÃO MANUAL NECESSÁRIA:');
        console.log('');
        console.log('O Pioneer precisa ativar LAI da sua própria carteira:');
        console.log('');
        console.log('1️⃣  Obter USDT de teste:');
        console.log('   a) Mint via BSCScan:');
        console.log('      https://testnet.bscscan.com/address/' + USDT_ADDRESS + '#writeContract');
        console.log('   b) Conecte a carteira do Pioneer');
        console.log('   c) Chame mint(address, amount)');
        console.log('      address: ' + PIONEER_WALLET);
        console.log('      amount: 19000000 (= $19 USDT)');
        console.log('');

        console.log('2️⃣  Aprovar USDT:');
        console.log('   a) Na mesma página do USDT');
        console.log('   b) Chame approve(spender, amount)');
        console.log('      spender: ' + CONTRACT_ADDRESS);
        console.log('      amount: 19000000');
        console.log('');

        console.log('3️⃣  Ativar LAI:');
        console.log('   a) Ir para o contrato principal:');
        console.log('      https://testnet.bscscan.com/address/' + CONTRACT_ADDRESS + '#writeContract');
        console.log('   b) Chame activateLAI()');
        console.log('      (sem parâmetros)');
        console.log('');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Pioneer registrado! Aguardando ativação de LAI...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.log('❌ Erro ao registrar:', error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
