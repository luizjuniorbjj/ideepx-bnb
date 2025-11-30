/**
 * 🎁 iDeepX Test Bot - VERSÃO 100% GRÁTIS
 *
 * ✅ Admin recebe $10,000,000 USDT de teste
 * ✅ Pioneer recebe $100,000 USDT de teste
 * ✅ Cada usuário recebe $5,000 USDT de teste
 * ✅ Custo total: ~0.1 BNB apenas para gas ($0.50)
 * ✅ USDT: ILIMITADO! 🎉
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

const CONFIG = {
    ADMIN_WALLET: "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    // Tokens de teste (GRÁTIS!)
    ADMIN_INITIAL_TOKENS: ethers.parseUnits("10000000", 6), // $10M
    PIONEER_INITIAL_TOKENS: ethers.parseUnits("100000", 6), // $100k
    USER_INITIAL_TOKENS: ethers.parseUnits("5000", 6), // $5k cada

    // Apenas para gas (mínimo)
    USER_BNB_AMOUNT: ethers.parseEther("0.03"), // 0.03 BNB

    USERS_TO_CREATE: 20 // Apenas 20 para teste rápido
};

const colors = {
    cyan: (str) => `\x1b[36m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    magenta: (str) => `\x1b[35m${str}\x1b[0m`,
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    gray: (str) => `\x1b[90m${str}\x1b[0m`
};

class TestBotFree {
    constructor() {
        this.users = [];
        this.contracts = {};
        this.deployer = null;
    }

    async initialize() {
        console.log(colors.cyan("\n╔════════════════════════════════════════╗"));
        console.log(colors.cyan("║   🎁 iDeepX Test - FREE VERSION       ║"));
        console.log(colors.cyan("║   100% Test Tokens - No Real Cost!    ║"));
        console.log(colors.cyan("╚════════════════════════════════════════╝\n"));

        const [deployer] = await ethers.getSigners();
        this.deployer = deployer;

        console.log(colors.green("📍 Deployer:", deployer.address));
        console.log(colors.magenta("⭐ Pioneer:", CONFIG.PIONEER_WALLET));
        console.log(colors.green("👤 Admin:", CONFIG.ADMIN_WALLET));

        // Verificar saldo BNB (apenas para gas)
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(colors.yellow(`💰 BNB Balance: ${ethers.formatEther(balance)}`));

        if (balance < ethers.parseEther("0.05")) {
            console.log(colors.red("\n❌ Need at least 0.05 BNB for gas"));
            console.log(colors.yellow("Get testnet BNB: https://testnet.bnbchain.org/faucet-smart"));
            process.exit(1);
        }

        console.log(colors.green("✅ Ready to deploy!\n"));
    }

    async deployContracts() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("📦 DEPLOYING CONTRACTS"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        // Deploy Mock USDT Unlimited
        console.log(colors.yellow("1️⃣ Deploying Mock USDT Unlimited..."));
        const MockUSDT = await ethers.getContractFactory(
            "contracts/mocks/MockUSDTUnlimited.sol:MockUSDTUnlimited"
        );
        this.contracts.usdt = await MockUSDT.deploy();
        await this.contracts.usdt.waitForDeployment();
        const usdtAddress = await this.contracts.usdt.getAddress();
        console.log(colors.green(`✅ USDT: ${usdtAddress}\n`));

        // Deploy Main Contract
        console.log(colors.yellow("2️⃣ Deploying iDeepX Main Contract..."));
        const iDeepX = await ethers.getContractFactory("iDeepXUnifiedSecure");
        this.contracts.main = await iDeepX.deploy(
            usdtAddress,
            false // isProduction = false (testnet)
        );
        await this.contracts.main.waitForDeployment();
        const mainAddress = await this.contracts.main.getAddress();
        console.log(colors.green(`✅ Main: ${mainAddress}\n`));

        // Setup roles
        console.log(colors.yellow("3️⃣ Setting up roles..."));
        await this.contracts.main.setUpdater(this.deployer.address);
        console.log(colors.green("✅ Updater configured\n"));

        // MINT TOKENS GRÁTIS!
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("🎁 MINTING FREE TEST TOKENS"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        // Admin: $10,000,000
        console.log(colors.yellow("💰 Minting for Admin..."));
        const adminTx = await this.contracts.usdt.mint(CONFIG.ADMIN_WALLET, CONFIG.ADMIN_INITIAL_TOKENS);
        await adminTx.wait();
        console.log(colors.green("✅ Admin has $10,000,000 USDT (test)\n"));

        // Pioneer: $100,000
        console.log(colors.magenta("⭐ Minting for Pioneer..."));
        const pioneerTx = await this.contracts.usdt.mint(CONFIG.PIONEER_WALLET, CONFIG.PIONEER_INITIAL_TOKENS);
        await pioneerTx.wait();
        console.log(colors.green("✅ Pioneer has $100,000 USDT (test)\n"));

        this.saveDeploymentInfo();
    }

    saveDeploymentInfo() {
        const info = {
            network: "bscTestnet",
            timestamp: new Date().toISOString(),
            version: "FREE (Unlimited Test Tokens)",
            admin: CONFIG.ADMIN_WALLET,
            pioneer: CONFIG.PIONEER_WALLET,
            contracts: {
                usdt: this.contracts.usdt.target,
                main: this.contracts.main.target
            },
            testTokens: {
                admin: "$10,000,000 USDT",
                pioneer: "$100,000 USDT",
                perUser: "$5,000 USDT"
            }
        };

        const filename = `deployment-free-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(info, null, 2));

        console.log(colors.green(`💾 Saved: ${filename}\n`));
    }

    async generateUsers() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan(`👥 GENERATING ${CONFIG.USERS_TO_CREATE} TEST USERS`));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        for (let i = 0; i < CONFIG.USERS_TO_CREATE; i++) {
            const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

            this.users.push({
                id: i + 1,
                address: wallet.address,
                privateKey: wallet.privateKey,
                wallet: wallet,
                name: `USER_${(i + 1).toString().padStart(2, '0')}`,
                sponsor: CONFIG.PIONEER_WALLET
            });

            if ((i + 1) % 5 === 0) {
                console.log(colors.gray(`  ✓ ${i + 1}/${CONFIG.USERS_TO_CREATE} generated...`));
            }
        }

        console.log(colors.green(`\n✅ ${this.users.length} users generated\n`));
    }

    async fundUsers() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("💸 FUNDING USERS (FREE TOKENS!)"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        let funded = 0;

        for (const user of this.users) {
            try {
                // BNB mínimo para gas
                const bnbTx = await this.deployer.sendTransaction({
                    to: user.address,
                    value: CONFIG.USER_BNB_AMOUNT
                });
                await bnbTx.wait();

                // USDT GRÁTIS!
                await this.contracts.usdt.mint(user.address, CONFIG.USER_INITIAL_TOKENS);

                funded++;

                if (funded % 5 === 0) {
                    console.log(colors.gray(`  ✓ ${funded}/${this.users.length} funded...`));
                }

            } catch (error) {
                console.log(colors.red(`  ✗ ${user.name}: ${error.message}`));
            }
        }

        console.log(colors.green(`\n✅ ${funded} users funded with FREE tokens!\n`));
    }

    async registerPioneer() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("⭐ REGISTERING PIONEER"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        try {
            // Check if already registered
            const dashboard = await this.contracts.main.getUserDashboard(CONFIG.PIONEER_WALLET);
            console.log(colors.green("✅ Pioneer already registered\n"));
            return;
        } catch (error) {
            // Not registered, register now
            console.log(colors.yellow("Registering Pioneer..."));
            const tx = await this.contracts.main.registerUser(
                CONFIG.PIONEER_WALLET,
                ethers.ZeroAddress
            );
            await tx.wait();
            console.log(colors.green("✅ Pioneer registered!\n"));
        }
    }

    async registerUsers() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("📝 REGISTERING USERS"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        let registered = 0;

        for (const user of this.users) {
            try {
                const tx = await this.contracts.main.registerUser(
                    user.address,
                    CONFIG.PIONEER_WALLET
                );
                await tx.wait();

                registered++;

                if (registered % 5 === 0) {
                    console.log(colors.gray(`  ✓ ${registered}/${this.users.length} registered...`));
                }

            } catch (error) {
                console.log(colors.red(`  ✗ ${user.name}: ${error.message}`));
            }
        }

        console.log(colors.green(`\n✅ ${registered} users registered as Pioneer's directs!\n`));
    }

    async activateLAI() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("🎫 ACTIVATING LAI"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        const laiFee = ethers.parseUnits("19", 6);
        let activated = 0;

        for (const user of this.users) {
            try {
                // Approve
                const approveTx = await this.contracts.usdt
                    .connect(user.wallet)
                    .approve(this.contracts.main.target, laiFee);
                await approveTx.wait();

                // Activate
                const activateTx = await this.contracts.main
                    .connect(user.wallet)
                    .activateLAI();
                await activateTx.wait();

                activated++;

                if (activated % 5 === 0) {
                    console.log(colors.gray(`  ✓ ${activated}/${this.users.length} activated...`));
                }

            } catch (error) {
                console.log(colors.red(`  ✗ ${user.name}: ${error.message}`));
            }
        }

        console.log(colors.green(`\n✅ ${activated} LAIs activated!\n`));
    }

    async showResults() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("📊 RESULTS"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        // Pioneer status
        const pioneerDashboard = await this.contracts.main.getUserDashboard(CONFIG.PIONEER_WALLET);
        console.log(colors.magenta("⭐ Pioneer Status:"));
        console.log(colors.gray(`   Directs: ${pioneerDashboard.directs}`));
        console.log(colors.gray(`   LAI Active: ${pioneerDashboard.laiActive ? 'Yes' : 'No'}`));
        console.log(colors.gray(`   Balance: ${ethers.formatUnits(pioneerDashboard.available, 6)} USDT`));
        console.log('');

        // System state
        const systemState = await this.contracts.main.getSystemState();
        console.log(colors.yellow("🌐 System State:"));
        console.log(colors.gray(`   Total Users: ${systemState.totalUsersCount}`));
        console.log(colors.gray(`   Active Users: ${systemState.activeCount}`));
        console.log(colors.gray(`   Current Week: ${systemState.week}`));
        console.log(colors.gray(`   Total Deposited: ${ethers.formatUnits(systemState.deposited, 6)} USDT`));
        console.log('');

        // Balances
        const adminBalance = await this.contracts.usdt.balanceOf(CONFIG.ADMIN_WALLET);
        const pioneerBalance = await this.contracts.usdt.balanceOf(CONFIG.PIONEER_WALLET);

        console.log(colors.green("💰 Token Balances:"));
        console.log(colors.gray(`   Admin: ${ethers.formatUnits(adminBalance, 6)} USDT`));
        console.log(colors.gray(`   Pioneer: ${ethers.formatUnits(pioneerBalance, 6)} USDT`));
        console.log('');
    }

    async showInstructions() {
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
        console.log(colors.cyan("📋 NEXT STEPS"));
        console.log(colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

        console.log(colors.magenta("⭐ PIONEER ACTIONS:"));
        console.log(colors.yellow("   1. Activate LAI ($19 from your $100k):"));
        console.log(colors.gray(`      - USDT: ${this.contracts.usdt.target}`));
        console.log(colors.gray(`      - Main: ${this.contracts.main.target}`));
        console.log(colors.gray(`      - approve(Main, 19000000)`));
        console.log(colors.gray(`      - activateLAI()`));
        console.log('');

        console.log(colors.green("👤 ADMIN ACTIONS:"));
        console.log(colors.yellow("   2. Deposit Performance (from your $10M):"));
        console.log(colors.gray(`      - Test 1: $35,000 → depositWeeklyPerformance(35000000000, "test-1")`));
        console.log(colors.gray(`      - Test 2: $100,000 → depositWeeklyPerformance(100000000000, "test-2")`));
        console.log(colors.gray(`      - Test 3: $200,000 → depositWeeklyPerformance(200000000000, "test-3")`));
        console.log('');

        console.log(colors.cyan("⚡ PROCESS BATCH:"));
        console.log(colors.gray("   3. processDistributionBatch(1)"));
        console.log('');

        console.log(colors.yellow("🎁 GET MORE TOKENS (if needed):"));
        console.log(colors.gray("   - Anyone can call: getFreeTokens() → +$10k"));
        console.log(colors.gray("   - Admin can mint: mint(address, amount)"));
        console.log('');

        console.log(colors.green("🔗 Links:"));
        console.log(colors.gray(`   Contract: https://testnet.bscscan.com/address/${this.contracts.main.target}`));
        console.log(colors.gray(`   USDT: https://testnet.bscscan.com/address/${this.contracts.usdt.target}`));
        console.log(colors.gray(`   Pioneer: https://testnet.bscscan.com/address/${CONFIG.PIONEER_WALLET}`));
        console.log('');
    }

    async saveUserData() {
        const data = {
            timestamp: new Date().toISOString(),
            network: "bscTestnet",
            contracts: {
                usdt: this.contracts.usdt.target,
                main: this.contracts.main.target
            },
            pioneer: CONFIG.PIONEER_WALLET,
            admin: CONFIG.ADMIN_WALLET,
            users: this.users.map(u => ({
                id: u.id,
                name: u.name,
                address: u.address,
                privateKey: u.privateKey,
                sponsor: u.sponsor
            }))
        };

        const filename = `test-users-free-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log(colors.green(`💾 User data saved: ${filename}\n`));
    }

    async run() {
        try {
            await this.initialize();
            await this.deployContracts();
            await this.generateUsers();
            await this.fundUsers();
            await this.registerPioneer();
            await this.registerUsers();
            await this.activateLAI();
            await this.showResults();
            await this.saveUserData();
            await this.showInstructions();

            console.log(colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
            console.log(colors.green("✅ SETUP COMPLETE!"));
            console.log(colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

            console.log(colors.yellow("💰 Test Token Summary:"));
            console.log(colors.gray(`   Admin: $10,000,000 USDT (test)`));
            console.log(colors.gray(`   Pioneer: $100,000 USDT (test)`));
            console.log(colors.gray(`   Each User: $5,000 USDT (test)`));
            console.log(colors.gray(`   Total Cost: ~0.05 BNB gas ($0.25)\n`));

            console.log(colors.cyan("🎉 Ready for unlimited testing! 🚀\n"));

        } catch (error) {
            console.log(colors.red("\n❌ Error:", error.message));
            throw error;
        }
    }
}

async function main() {
    const bot = new TestBotFree();
    await bot.run();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
