import pkg from "hardhat";
const { ethers } = pkg;

const USDT_ADDRESS = "0x1A77b3eD262986aB97F3A2eF066f1f3127c3b0Cc";
const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

async function main() {
    const [deployer] = await ethers.getSigners();

    const usdt = await ethers.getContractAt(
        "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited",
        USDT_ADDRESS
    );

    const allowance = await usdt.allowance(deployer.address, MAIN_ADDRESS);
    const balance = await usdt.balanceOf(deployer.address);

    console.log('Deployer:', deployer.address);
    console.log('Balance USDT:', ethers.formatUnits(balance, 6));
    console.log('Allowance para contrato:', ethers.formatUnits(allowance, 6));

    const needed = ethers.parseUnits("35000", 6);

    if (allowance >= needed) {
        console.log('✅ Allowance OK!');
    } else {
        console.log('❌ Allowance insuficiente!');
        console.log('Necessário:', ethers.formatUnits(needed, 6));
    }
}

main().then(() => process.exit(0)).catch(console.error);
