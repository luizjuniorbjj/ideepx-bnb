import pkg from "hardhat";
const { ethers } = pkg;

const MAIN_ADDRESS = "0x2d436d57a9Fd7559E569977652A082dDC9510740";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    const main = await ethers.getContractAt("iDeepXUnifiedSecure", MAIN_ADDRESS);

    const owner = await main.owner();
    console.log('Contract Owner:', owner);

    if (owner.toLowerCase() === deployer.address.toLowerCase()) {
        console.log('✅ Deployer É o owner!');
    } else {
        console.log('❌ Deployer NÃO é o owner!');
        console.log('Solução: Transferir ownership ou usar a carteira owner');
    }
}

main().then(() => process.exit(0)).catch(console.error);
