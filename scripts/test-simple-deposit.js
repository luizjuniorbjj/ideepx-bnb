import pkg from "hardhat";
const { ethers } = pkg;

const USDT_ADDRESS = "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc";
const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

async function main() {
    console.log('\n🧪 TESTE SIMPLES DE DEPOSIT\n');

    const [deployer] = await ethers.getSigners();

    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited",
        USDT_ADDRESS
    );

    const main = await ethers.getContractAt("iDeepXUnifiedSecure", MAIN_ADDRESS);

    // Verificar tudo
    const owner = await main.owner();
    const paused = await main.paused();
    const distPaused = await main.distributionPaused();
    const balance = await usdt.balanceOf(deployer.address);
    const allowance = await usdt.allowance(deployer.address, MAIN_ADDRESS);

    console.log('Deployer:', deployer.address);
    console.log('Owner:', owner);
    console.log('É owner?', owner.toLowerCase() === deployer.address.toLowerCase());
    console.log('Pausado?', paused);
    console.log('Dist pausado?', distPaused);
    console.log('Balance:', ethers.formatUnits(balance, 6));
    console.log('Allowance:', ethers.formatUnits(allowance, 6));
    console.log('');

    const amount = ethers.parseUnits("1000", 6); // Apenas $1k para testar

    // Approve se necessário
    if (allowance < amount) {
        console.log('Fazendo approve...');
        const approveTx = await usdt.approve(MAIN_ADDRESS, amount);
        await approveTx.wait();
        console.log('✅ Approve OK\n');
    }

    // Tentar deposit
    console.log('Tentando deposit de $1000...');

    try {
        // Tentar com estimate gas primeiro
        const estimatedGas = await main.depositWeeklyPerformance.estimateGas(
            amount,
            "test-small"
        );
        console.log('Gas estimado:', estimatedGas.toString());

        const tx = await main.depositWeeklyPerformance(
            amount,
            "test-small",
            { gasLimit: estimatedGas * 2n }
        );

        console.log('TX enviada:', tx.hash);

        const receipt = await tx.wait();

        console.log('✅ Deposit sucesso!');
        console.log('Gas usado:', receipt.gasUsed.toString());

    } catch (error) {
        console.log('❌ ERRO:', error.message);

        if (error.data) {
            console.log('Error data:', error.data);
        }

        if (error.reason) {
            console.log('Reason:', error.reason);
        }

        // Tentar decodificar o erro
        try {
            const decodedError = main.interface.parseError(error.data);
            console.log('Decoded error:', decodedError);
        } catch (e) {
            console.log('Não consegui decodificar erro');
        }
    }
}

main().then(() => process.exit(0)).catch(console.error);
