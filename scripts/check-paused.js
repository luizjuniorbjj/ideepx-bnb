import pkg from "hardhat";
const { ethers } = pkg;

const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

async function main() {
    const main = await ethers.getContractAt("iDeepXUnifiedSecure", MAIN_ADDRESS);

    const paused = await main.paused();
    const distributionPaused = await main.distributionPaused();

    console.log('Contrato pausado:', paused);
    console.log('Distribuição pausada:', distributionPaused);

    if (paused) {
        console.log('⚠️  Contrato está PAUSADO!');
        console.log('Solução: Chamar unpause()');
    }

    if (distributionPaused) {
        console.log('⚠️  Distribuição está PAUSADA!');
        console.log('Solução: Chamar unpauseDistribution()');
    }

    if (!paused && !distributionPaused) {
        console.log('✅ Tudo OK - não está pausado!');
    }
}

main().then(() => process.exit(0)).catch(console.error);
