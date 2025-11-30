/**
 * 🔧 ENABLE TEST MODE - iDeepX v3.1
 *
 * Ativa o modo de teste no contrato para permitir
 * que usuários se registrem sem precisar de updater
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 ATIVAR MODO DE TESTE - iDeepX v3.1');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Carregar configuração
    const configFile = path.join(__dirname, '..', 'local-fork-config', 'setup.json');

    if (!fs.existsSync(configFile)) {
        console.error('❌ Configuração não encontrada!');
        console.error('   Execute primeiro: npx hardhat run scripts/local-fork-setup.js --network localhost');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    console.log(`📋 Contrato: ${config.contractAddress}`);
    console.log('');

    // Conectar ao contrato
    const [owner] = await ethers.getSigners();
    const contract = await ethers.getContractAt("iDeepXUnified", config.contractAddress);

    // Verificar estado atual
    const currentTestMode = await contract.testMode();
    console.log(`Estado atual: testMode = ${currentTestMode}`);
    console.log('');

    if (currentTestMode) {
        console.log('✅ Modo de teste já está ativado!');
        console.log('');
        return;
    }

    // Ativar test mode
    console.log('🔧 Ativando modo de teste...');
    const tx = await contract.setTestMode(true);
    await tx.wait();

    const newTestMode = await contract.testMode();

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MODO DE TESTE ATIVADO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`   testMode = ${newTestMode}`);
    console.log('');
    console.log('⚠️  AVISO: Em test mode, qualquer um pode registrar usuários!');
    console.log('   Isso é APENAS para ambiente local de testes.');
    console.log('');
    console.log('🚀 Próximo passo:');
    console.log('   npx hardhat run scripts/local-fork-populate.js --network localhost');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO AO ATIVAR TEST MODE');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error(error);
        console.error('');
        process.exit(1);
    });
