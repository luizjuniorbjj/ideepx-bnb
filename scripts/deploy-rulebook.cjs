// scripts/deploy-rulebook.js
// Deploy do iDeepXRulebookImmutable (PLANO IMUTÁVEL)

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting deployment of iDeepXRulebookImmutable...\n");

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (chainId: ${network.chainId})`);

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} BNB\n`);

    // IMPORTANTE: Configure estes valores com seu plano real
    // Você deve fazer upload do JSON do plano para IPFS primeiro!
    const planIpfsCid = process.env.PLAN_IPFS_CID || "QmExamplePlanHash123";

    // IMPORTANTE: Calcule o contentHash do seu JSON
    // Use: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(planJson)))
    const planContentHash = process.env.PLAN_CONTENT_HASH ||
        "0x1234567890123456789012345678901234567890123456789012345678901234";

    console.log("📄 Plan Configuration:");
    console.log(`   IPFS CID: ${planIpfsCid}`);
    console.log(`   Content Hash: ${planContentHash}`);
    console.log("");

    // Verificar se valores são defaults (aviso)
    if (planIpfsCid === "QmExamplePlanHash123") {
        console.log("⚠️  WARNING: Using default IPFS CID!");
        console.log("   Please update PLAN_IPFS_CID in .env with your real plan hash\n");
    }

    // Deploy Rulebook
    console.log("📝 Deploying iDeepXRulebookImmutable...");
    const RulebookFactory = await hre.ethers.getContractFactory("iDeepXRulebookImmutable");
    const rulebook = await RulebookFactory.deploy(planIpfsCid, planContentHash);

    await rulebook.waitForDeployment();
    const rulebookAddress = await rulebook.getAddress();

    console.log(`✅ Rulebook deployed to: ${rulebookAddress}\n`);

    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    const deployTx = rulebook.deploymentTransaction();
    await deployTx.wait(5); // Wait for 5 confirmations
    console.log("✅ Contract confirmed!\n");

    // Verify initial state
    console.log("🔍 Verifying contract state:");
    const ipfsCid = await rulebook.ipfsCid();
    const contentHash = await rulebook.contentHash();
    const deployedAt = await rulebook.deployedAt();
    const ipfsUrl = await rulebook.getIPFSUrl();

    console.log(`   IPFS CID: ${ipfsCid}`);
    console.log(`   Content Hash: ${contentHash}`);
    console.log(`   Deployed At: ${new Date(Number(deployedAt) * 1000).toISOString()}`);
    console.log(`   IPFS URL: ${ipfsUrl}\n`);

    // Save deployment info
    const deploymentInfo = {
        contract: "iDeepXRulebookImmutable",
        network: network.name,
        chainId: network.chainId.toString(),
        address: rulebookAddress,
        ipfsCid: ipfsCid,
        contentHash: contentHash,
        deployedAt: new Date(Number(deployedAt) * 1000).toISOString(),
        deployer: deployer.address,
        txHash: deployTx.hash,
        blockNumber: deployTx.blockNumber
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `rulebook-${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`💾 Deployment info saved to: ${filepath}\n`);

    // Verify on explorer (if not localhost)
    if (network.chainId !== 31337n && network.chainId !== 1337n) {
        console.log("🔎 Verifying contract on block explorer...");
        console.log("⏳ Waiting 30 seconds before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            await hre.run("verify:verify", {
                address: rulebookAddress,
                constructorArguments: [planIpfsCid, planContentHash],
            });
            console.log("✅ Contract verified!\n");
        } catch (error) {
            console.log("❌ Verification failed:", error.message);
            console.log("\nYou can verify manually with:");
            console.log(`npx hardhat verify --network ${network.name} ${rulebookAddress} "${planIpfsCid}" "${planContentHash}"\n`);
        }
    }

    // Summary
    console.log("=" .repeat(80));
    console.log("✅ RULEBOOK DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(80));
    console.log(`Contract Address: ${rulebookAddress}`);
    console.log(`IPFS CID: ${ipfsCid}`);
    console.log(`Network: ${network.name}`);
    console.log(`Explorer: ${getExplorerUrl(network.chainId, rulebookAddress)}`);
    console.log("=" .repeat(80));
    console.log("\n⚠️  IMPORTANT: Save this Rulebook address!");
    console.log("   You'll need it to deploy the Proof contract.\n");
    console.log(`   Set in .env: RULEBOOK_ADDRESS=${rulebookAddress}\n`);

    return deploymentInfo;
}

function getExplorerUrl(chainId, address) {
    const explorers = {
        1: `https://etherscan.io/address/${address}`,
        137: `https://polygonscan.com/address/${address}`,
        80001: `https://mumbai.polygonscan.com/address/${address}`,
        56: `https://bscscan.com/address/${address}`,
        97: `https://testnet.bscscan.com/address/${address}`,
    };
    return explorers[Number(chainId)] || "Unknown network";
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
