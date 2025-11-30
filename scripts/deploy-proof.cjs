// scripts/deploy-proof.js
// Deploy do iDeepXProofFinal (PROVAS SEMANAIS)

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting deployment of iDeepXProofFinal...\n");

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (chainId: ${network.chainId})`);

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} BNB\n`);

    // Get backend and rulebook addresses from environment
    const backendAddress = process.env.BACKEND_ADDRESS || deployer.address;
    const rulebookAddress = process.env.RULEBOOK_ADDRESS;

    console.log("🔧 Configuration:");
    console.log(`   Backend Address: ${backendAddress}`);
    console.log(`   Rulebook Address: ${rulebookAddress || 'NOT SET!'}`);
    console.log("");

    // Validations
    if (!rulebookAddress || rulebookAddress === "0x0000000000000000000000000000000000000000") {
        console.error("❌ ERROR: RULEBOOK_ADDRESS not set in .env!");
        console.error("   Please deploy Rulebook first and set RULEBOOK_ADDRESS in .env\n");
        process.exit(1);
    }

    if (backendAddress === deployer.address) {
        console.log("⚠️  WARNING: Backend address same as deployer");
        console.log("   This is OK for testing, but use separate address in production\n");
    }

    // Verify Rulebook exists
    console.log("🔍 Verifying Rulebook contract...");
    const code = await hre.ethers.provider.getCode(rulebookAddress);
    if (code === "0x") {
        console.error(`❌ ERROR: No contract found at Rulebook address ${rulebookAddress}`);
        console.error("   Please check the address and network\n");
        process.exit(1);
    }
    console.log("✅ Rulebook contract verified\n");

    // Deploy Proof contract
    console.log("📝 Deploying iDeepXProofFinal...");
    const ProofFactory = await hre.ethers.getContractFactory("iDeepXProofFinal");
    const proof = await ProofFactory.deploy(backendAddress, rulebookAddress);

    await proof.waitForDeployment();
    const proofAddress = await proof.getAddress();

    console.log(`✅ Proof contract deployed to: ${proofAddress}\n`);

    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    const deployTx = proof.deploymentTransaction();
    await deployTx.wait(5); // Wait for 5 confirmations
    console.log("✅ Contract confirmed!\n");

    // Verify initial state
    console.log("🔍 Verifying contract state:");
    const owner = await proof.owner();
    const backend = await proof.backend();
    const rulebook = await proof.rulebook();
    const paused = await proof.paused();
    const totalProofs = await proof.totalProofsSubmitted();

    console.log(`   Owner: ${owner}`);
    console.log(`   Backend: ${backend}`);
    console.log(`   Rulebook: ${rulebook}`);
    console.log(`   Paused: ${paused}`);
    console.log(`   Total Proofs: ${totalProofs}\n`);

    // Get Rulebook info
    console.log("📄 Rulebook Information:");
    const RulebookContract = await hre.ethers.getContractAt("iDeepXRulebookImmutable", rulebookAddress);
    const planCid = await RulebookContract.ipfsCid();
    const planHash = await RulebookContract.contentHash();
    console.log(`   Plan IPFS CID: ${planCid}`);
    console.log(`   Plan Hash: ${planHash}\n`);

    // Save deployment info
    const deploymentInfo = {
        contract: "iDeepXProofFinal",
        network: network.name,
        chainId: network.chainId.toString(),
        address: proofAddress,
        owner: owner,
        backend: backend,
        rulebookAddress: rulebook,
        planIpfsCid: planCid,
        planContentHash: planHash,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        txHash: deployTx.hash,
        blockNumber: deployTx.blockNumber
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `proof-${network.name}-${Date.now()}.json`;
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
                address: proofAddress,
                constructorArguments: [backendAddress, rulebookAddress],
            });
            console.log("✅ Contract verified!\n");
        } catch (error) {
            console.log("❌ Verification failed:", error.message);
            console.log("\nYou can verify manually with:");
            console.log(`npx hardhat verify --network ${network.name} ${proofAddress} ${backendAddress} ${rulebookAddress}\n`);
        }
    }

    // Summary
    console.log("=" .repeat(80));
    console.log("✅ PROOF CONTRACT DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(80));
    console.log(`Proof Contract: ${proofAddress}`);
    console.log(`Rulebook Contract: ${rulebookAddress}`);
    console.log(`Owner: ${owner}`);
    console.log(`Backend: ${backend}`);
    console.log(`Network: ${network.name}`);
    console.log(`Explorer: ${getExplorerUrl(network.chainId, proofAddress)}`);
    console.log("=" .repeat(80));
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Save these addresses in your backend");
    console.log("2. Update frontend with contract addresses");
    console.log("3. Test submitWeeklyProof() function");
    console.log("4. Configure IPFS integration");
    console.log("5. Start weekly automation\n");

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
