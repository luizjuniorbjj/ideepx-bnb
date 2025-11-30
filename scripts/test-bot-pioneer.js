/**
 * 🤖 iDeepX Test Bot - Versão Adaptada para Contratos Existentes
 *
 * Cliente Pioneiro: 0x75d1a8ac59003088c60a20bde8953cbecfe41669
 * Admin: 0xeb2451a8dd58734134dd7bde64a5f86725b75ef2
 * Estrutura: Pioneiro → 5 diretos → distribuição em 10 níveis
 *
 * ⚠️ USA CONTRATOS JÁ DEPLOYADOS NA TESTNET
 */

import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

// ============ CONFIGURAÇÃO ============

const CONFIG = {
    // Contratos já deployados
    CONTRACT_ADDRESS: "0x1dEdE431aa189fc5790c4837014192078A89870F",
    USDT_ADDRESS: "0x89173cb21b8f8Ac8Bf6680c85541f5826B992C0f",

    // Carteiras reais
    ADMIN_WALLET: "0xeb2451a8dd58734134dd7bde64a5f86725b75ef2",
    PIONEER_WALLET: "0x75d1a8ac59003088c60a20bde8953cbecfe41669",

    // Estrutura da rede (50 usuários total)
    NETWORK_STRUCTURE: {
        // PIONEIRO: 1 (carteira real)
        NIVEL_1: 5,   // 5 DIRETOS DO PIONEIRO (OBRIGATÓRIO!)
        NIVEL_2: 10,  // 2 por cada nível 1
        NIVEL_3: 10,  // 1 por cada nível 2
        NIVEL_4: 8,   // distribuídos
        NIVEL_5: 6,   // distribuídos
        NIVEL_6: 4,   // distribuídos (qualificados)
        NIVEL_7: 3,   // distribuídos (qualificados)
        NIVEL_8: 2,   // distribuídos (qualificados)
        NIVEL_9: 1,   // distribuídos (qualificados)
        NIVEL_10: 1   // distribuídos (qualificados)
    },

    // Valores
    INITIAL_FUND: ethers.parseUnits("1000", 6), // $1000 USDT por usuário
    LAI_FEE: ethers.parseUnits("19", 6), // $19
    PERFORMANCE_DEPOSIT: ethers.parseUnits("10000", 6) // $10k para teste
};

// ============ CORES PARA CONSOLE ============

const colors = {
    cyan: (str) => `\x1b[36m${str}\x1b[0m`,
    green: (str) => `\x1b[32m${str}\x1b[0m`,
    yellow: (str) => `\x1b[33m${str}\x1b[0m`,
    magenta: (str) => `\x1b[35m${str}\x1b[0m`,
    red: (str) => `\x1b[31m${str}\x1b[0m`,
    gray: (str) => `\x1b[90m${str}\x1b[0m`
};

class iDeepXTestBot {
    constructor() {
        this.users = [];
        this.contracts = {};
        this.deployer = null;
        this.pioneer = null;
    }

    // ============ INICIALIZAÇÃO ============

    async initialize() {
        console.log(colors.cyan("\n🚀 Iniciando iDeepX Test Bot - Contratos Existentes"));
        console.log(colors.cyan("=====================================================\n"));

        // Conecta com o deployer
        const signers = await ethers.getSigners();
        this.deployer = signers[0];

        console.log(colors.green("📍 Contratos Existentes:"));
        console.log(colors.gray(`   iDeepX: ${CONFIG.CONTRACT_ADDRESS}`));
        console.log(colors.gray(`   USDT: ${CONFIG.USDT_ADDRESS}`));
        console.log(colors.magenta(`⭐ Pioneer: ${CONFIG.PIONEER_WALLET}`));
        console.log(colors.green(`👤 Admin: ${CONFIG.ADMIN_WALLET}`));
        console.log(colors.yellow(`🔧 Deployer: ${this.deployer.address}`));
        console.log('');

        // Conecta aos contratos
        await this.connectContracts();

        // Verifica balanços
        await this.checkBalances();
    }

    async connectContracts() {
        console.log(colors.cyan("🔗 Conectando aos contratos..."));

        this.contracts.main = await ethers.getContractAt(
            "iDeepXUnifiedSecure",
            CONFIG.CONTRACT_ADDRESS
        );

        this.contracts.usdt = await ethers.getContractAt(
            "contracts/mocks/MockUSDT.sol:MockUSDT",
            CONFIG.USDT_ADDRESS
        );

        console.log(colors.green("✅ Contratos conectados\n"));
    }

    async checkBalances() {
        console.log(colors.cyan("💰 Verificando balanços..."));

        const deployerBalance = await ethers.provider.getBalance(this.deployer.address);

        console.log(colors.gray(`   Deployer: ${ethers.formatEther(deployerBalance)} BNB`));

        if (deployerBalance < ethers.parseEther("0.1")) {
            console.log(colors.red("\n❌ Saldo BNB insuficiente!"));
            console.log(colors.yellow("Pegue BNB testnet em: https://testnet.bnbchain.org/faucet-smart"));
            process.exit(1);
        }

        console.log(colors.green("✅ Saldo suficiente\n"));
    }

    // ============ GERAÇÃO DE USUÁRIOS ============

    async generateUsers() {
        console.log(colors.cyan("👥 Gerando usuários de teste..."));
        console.log(colors.magenta("⭐ Pioneer deve ter EXATAMENTE 5 diretos\n"));

        // Pioneer (usando carteira real)
        this.pioneer = {
            id: 0,
            address: CONFIG.PIONEER_WALLET,
            name: "PIONEER",
            level: 0,
            sponsor: null,
            directs: [],
            hasLAI: false,
            isReal: true
        };

        this.users.push(this.pioneer);
        console.log(colors.magenta(`⭐ Pioneer: ${this.pioneer.address}`));

        let userId = 1;

        // ============ NÍVEL 1: EXATAMENTE 5 DIRETOS DO PIONEIRO ============
        console.log(colors.yellow("\n📌 Nível 1: Criando 5 DIRETOS do Pioneer"));
        const level1Users = [];

        for (let i = 0; i < 5; i++) {
            const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
            const user = {
                id: userId++,
                address: wallet.address,
                wallet: wallet,
                name: `DIRECT_${i + 1}`,
                level: 1,
                sponsor: this.pioneer,
                directs: [],
                hasLAI: false,
                isReal: false
            };

            this.users.push(user);
            this.pioneer.directs.push(user);
            level1Users.push(user);

            console.log(colors.green(`  ✅ Direto ${i + 1}: ${user.address.substring(0, 12)}... → Pioneer`));
        }

        // ============ NÍVEL 2: 10 USUÁRIOS (2 por cada nível 1) ============
        console.log(colors.yellow("\n📌 Nível 2: Criando 10 usuários (2 cada do Nível 1)"));
        const level2Users = [];

        for (let i = 0; i < level1Users.length; i++) {
            for (let j = 0; j < 2; j++) {
                const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
                const user = {
                    id: userId++,
                    address: wallet.address,
                    wallet: wallet,
                    name: `L2_${i + 1}_${j + 1}`,
                    level: 2,
                    sponsor: level1Users[i],
                    directs: [],
                    hasLAI: false,
                    isReal: false
                };

                this.users.push(user);
                level1Users[i].directs.push(user);
                level2Users.push(user);

                console.log(colors.gray(`  ├─ ${user.name} → ${level1Users[i].name}`));
            }
        }

        // ============ NÍVEL 3: 10 USUÁRIOS ============
        console.log(colors.yellow("\n📌 Nível 3: Criando 10 usuários"));
        const level3Users = [];

        for (let i = 0; i < 10; i++) {
            const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
            const sponsor = level2Users[i % level2Users.length];

            const user = {
                id: userId++,
                address: wallet.address,
                wallet: wallet,
                name: `L3_${i + 1}`,
                level: 3,
                sponsor: sponsor,
                directs: [],
                hasLAI: false,
                isReal: false
            };

            this.users.push(user);
            sponsor.directs.push(user);
            level3Users.push(user);

            console.log(colors.gray(`  ├─ ${user.name} → ${sponsor.name}`));
        }

        // ============ NÍVEIS 4-10: DISTRIBUIÇÃO OTIMIZADA ============
        await this.generateRemainingLevels(userId, level3Users);

        console.log(colors.green(`\n✅ Total de usuários gerados: ${this.users.length}`));
        this.printNetworkStructure();
    }

    async generateRemainingLevels(startId, previousLevel) {
        let userId = startId;
        let currentSponsors = previousLevel;

        const levelSizes = [8, 6, 4, 3, 2, 1, 1]; // Níveis 4-10

        for (let level = 4; level <= 10; level++) {
            const usersInLevel = levelSizes[level - 4];
            const nextLevel = [];

            console.log(colors.yellow(`\n📌 Nível ${level}: Criando ${usersInLevel} usuários`));

            for (let i = 0; i < usersInLevel; i++) {
                const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
                const sponsor = currentSponsors[i % currentSponsors.length];

                const user = {
                    id: userId++,
                    address: wallet.address,
                    wallet: wallet,
                    name: `L${level}_${i + 1}`,
                    level: level,
                    sponsor: sponsor,
                    directs: [],
                    hasLAI: false,
                    isReal: false
                };

                this.users.push(user);
                sponsor.directs.push(user);
                nextLevel.push(user);

                console.log(colors.gray(`  ├─ ${user.name} → ${sponsor.name}`));
            }

            currentSponsors = nextLevel;
        }
    }

    printNetworkStructure() {
        console.log(colors.cyan("\n📊 ESTRUTURA DA REDE"));
        console.log(colors.cyan("====================================="));

        // Validação do pioneiro
        console.log(colors.magenta(`\n⭐ VALIDAÇÃO DO PIONEER:`));
        console.log(colors.magenta(`   Endereço: ${this.pioneer.address}`));
        console.log(colors.magenta(`   Diretos: ${this.pioneer.directs.length} (DEVE SER 5)`));

        if (this.pioneer.directs.length === 5) {
            console.log(colors.green(`   ✅ VALIDAÇÃO OK - Pioneer tem exatamente 5 diretos`));

            console.log(colors.yellow(`\n   Time Direto do Pioneer:`));
            this.pioneer.directs.forEach((direct, i) => {
                console.log(colors.gray(`   ${i + 1}. ${direct.name}: ${direct.address.substring(0, 12)}...`));
            });
        } else {
            console.log(colors.red(`   ❌ VALIDAÇÃO FALHOU - Pioneer precisa ter 5 diretos!`));
            process.exit(1);
        }

        // Estrutura geral
        console.log(colors.cyan("\n📈 Distribuição por Nível:"));
        for (let level = 0; level <= 10; level++) {
            const count = this.users.filter(u => u.level === level).length;
            if (count > 0) {
                const bar = "█".repeat(Math.min(count * 2, 40));
                console.log(colors.yellow(
                    `  Nível ${level.toString().padStart(2)}: ${count.toString().padStart(2)} usuários ${bar}`
                ));
            }
        }

        console.log(colors.cyan("\n====================================="));
        console.log(colors.green(`Total da Rede: ${this.users.length} usuários`));
    }

    // ============ FUNDING USERS ============

    async fundUsers() {
        console.log(colors.cyan("\n💰 Financiando usuários com BNB e USDT..."));

        const bnbAmount = ethers.parseEther("0.05"); // 0.05 BNB para gas
        const usdtAmount = CONFIG.INITIAL_FUND;

        console.log(colors.yellow(`\n⏳ Financiando ${this.users.length - 1} usuários de teste...`));
        console.log(colors.gray(`   BNB por usuário: 0.05`));
        console.log(colors.gray(`   USDT por usuário: 1000`));
        console.log('');

        // Fund users em batches
        const batchSize = 5;
        let funded = 0;

        for (let i = 1; i < this.users.length; i += batchSize) {
            const batch = this.users.slice(i, Math.min(i + batchSize, this.users.length));

            console.log(colors.gray(`  📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil((this.users.length-1)/batchSize)}...`));

            for (const user of batch) {
                if (!user.isReal) {
                    try {
                        // Send BNB
                        const bnbTx = await this.deployer.sendTransaction({
                            to: user.address,
                            value: bnbAmount
                        });
                        await bnbTx.wait();

                        // Mint USDT
                        const usdtTx = await this.contracts.usdt.mint(user.address, usdtAmount);
                        await usdtTx.wait();

                        funded++;
                        process.stdout.write('.');

                    } catch (error) {
                        console.log(colors.red(`\n  ✗ Falha ${user.name}: ${error.message}`));
                    }
                }
            }
            console.log('');
        }

        console.log(colors.green(`\n✅ ${funded} usuários financiados`));
        console.log(colors.magenta(`⚠️  Pioneer precisa ser financiado manualmente (carteira real)`));
    }

    // ============ REGISTRATION ============

    async registerUsers() {
        console.log(colors.cyan("\n📝 Registrando usuários com sponsors..."));
        console.log(colors.magenta("⭐ Começando pelos 5 diretos do Pioneer\n"));

        let registered = 0;

        // Register all users with their sponsors
        for (const user of this.users) {
            if (user.sponsor && !user.isReal) {
                try {
                    // Register user with sponsor
                    const tx = await this.contracts.main.registerUser(
                        user.address,
                        user.sponsor.address
                    );
                    await tx.wait();

                    registered++;

                    if (user.level === 1) {
                        console.log(colors.green(`  ✅ DIRETO ${user.name} → PIONEER registrado`));
                    } else if (registered % 5 === 0) {
                        console.log(colors.gray(`  ✓ ${registered} usuários registrados...`));
                    }

                } catch (error) {
                    console.log(colors.red(`  ✗ Falha ${user.name}: ${error.message}`));
                }
            }
        }

        console.log(colors.green(`\n✅ ${registered} usuários registrados com sucesso`));
    }

    // ============ LAI ACTIVATION ============

    async activateLAI() {
        console.log(colors.cyan("\n🎫 Ativando LAI para todos os usuários..."));
        console.log(colors.yellow(`   Taxa LAI: $19 USDT`));
        console.log('');

        let activated = 0;
        let failed = 0;

        for (const user of this.users) {
            if (user.isReal) {
                console.log(colors.magenta(`⚠️  Pioneer precisa ativar LAI manualmente`));
                continue;
            }

            try {
                // Approve USDT
                const approveTx = await this.contracts.usdt
                    .connect(user.wallet)
                    .approve(CONFIG.CONTRACT_ADDRESS, CONFIG.LAI_FEE);
                await approveTx.wait();

                // Activate LAI
                const activateTx = await this.contracts.main
                    .connect(user.wallet)
                    .activateLAI();
                await activateTx.wait();

                user.hasLAI = true;
                activated++;

                if (user.level === 1) {
                    console.log(colors.green(`  ✅ LAI ativado para DIRETO ${user.name}`));
                } else if (activated % 5 === 0) {
                    console.log(colors.gray(`  ✓ ${activated} LAIs ativados...`));
                }

            } catch (error) {
                failed++;
                if (failed <= 3) {
                    console.log(colors.red(`  ✗ Falha ${user.name}: ${error.message}`));
                }
            }
        }

        console.log(colors.green(`\n✅ LAI ativado para ${activated} usuários`));
        if (failed > 0) {
            console.log(colors.yellow(`⚠️  ${failed} falhas`));
        }
    }

    // ============ TEST DEPOSIT ============

    async testDeposit() {
        console.log(colors.cyan("\n💵 Testando depósito de performance..."));

        const amount = CONFIG.PERFORMANCE_DEPOSIT;

        console.log(colors.yellow(`   Valor: ${ethers.formatUnits(amount, 6)} USDT`));
        console.log('');

        try {
            // Mint USDT for deployer
            console.log(colors.gray("⏳ Mintando USDT..."));
            const mintTx = await this.contracts.usdt.mint(this.deployer.address, amount);
            await mintTx.wait();

            // Approve
            console.log(colors.gray("⏳ Aprovando USDT..."));
            const approveTx = await this.contracts.usdt.approve(CONFIG.CONTRACT_ADDRESS, amount);
            await approveTx.wait();

            // Deposit
            console.log(colors.gray("⏳ Depositando performance..."));
            const depositTx = await this.contracts.main.depositWeeklyPerformance(
                amount,
                "ipfs://QmTestBot123"
            );
            await depositTx.wait();

            console.log(colors.green("✅ Performance depositada com sucesso!"));

        } catch (error) {
            console.log(colors.red(`❌ Falha no depósito: ${error.message}`));
        }
    }

    // ============ PROCESS BATCH ============

    async processBatch() {
        console.log(colors.cyan("\n⚡ Processando batch de distribuição..."));

        try {
            const tx = await this.contracts.main.processDistributionBatch(1);
            await tx.wait();

            console.log(colors.green("✅ Batch processado!"));

            // Check progress
            const progress = await this.contracts.main.getBatchProgress(1);
            console.log(colors.yellow("\n📊 Progresso do Batch:"));
            console.log(colors.gray(`   Total: ${progress.totalUsers}`));
            console.log(colors.gray(`   Processados: ${progress.processedUsers}`));
            console.log(colors.gray(`   Completo: ${progress.percentComplete}%`));

        } catch (error) {
            console.log(colors.red(`❌ Falha ao processar: ${error.message}`));
        }
    }

    // ============ VERIFICATION ============

    async verifyResults() {
        console.log(colors.cyan("\n📊 VERIFICANDO RESULTADOS"));
        console.log(colors.cyan("=====================================\n"));

        let totalDistributed = 0n;
        const earners = [];

        // Check Pioneer
        console.log(colors.magenta("⭐ Verificando Pioneer..."));
        try {
            const pioneerDashboard = await this.contracts.main.getUserDashboard(CONFIG.PIONEER_WALLET);
            const pioneerBalance = pioneerDashboard[0];

            if (pioneerBalance > 0n) {
                console.log(colors.green(`   Ganhos: ${ethers.formatUnits(pioneerBalance, 6)} USDT`));
                totalDistributed += pioneerBalance;

                earners.push({
                    name: "PIONEER",
                    level: 0,
                    earned: pioneerBalance,
                    isPioneer: true
                });
            } else {
                console.log(colors.yellow(`   Ganhos: 0 USDT (LAI não ativo?)`));
            }
        } catch (error) {
            console.log(colors.red(`   Erro ao verificar: ${error.message}`));
        }

        // Check top earners
        console.log(colors.cyan("\n🔍 Verificando top earners..."));
        for (const user of this.users.slice(1, 11)) { // Check first 10 test users
            try {
                const dashboard = await this.contracts.main.getUserDashboard(user.address);
                const balance = dashboard[0];

                if (balance > 0n) {
                    totalDistributed += balance;
                    earners.push({
                        name: user.name,
                        level: user.level,
                        earned: balance,
                        isPioneer: false
                    });
                }
            } catch (error) {
                // Skip
            }
        }

        // Sort and display
        earners.sort((a, b) => Number(b.earned - a.earned));

        console.log(colors.yellow("\n🏆 Top 10 Earners:"));
        for (let i = 0; i < Math.min(10, earners.length); i++) {
            const e = earners[i];
            const mark = e.isPioneer ? "⭐" : "  ";
            console.log(colors.gray(
                `${mark} ${(i+1).toString().padStart(2)}. ${e.name.padEnd(15)} L${e.level}: $${ethers.formatUnits(e.earned, 6)}`
            ));
        }

        console.log(colors.green(`\n💰 Total Distribuído: $${ethers.formatUnits(totalDistributed, 6)}`));
    }

    // ============ SAVE USERS ============

    saveUsers() {
        const data = {
            timestamp: new Date().toISOString(),
            network: "bscTestnet",
            contracts: {
                main: CONFIG.CONTRACT_ADDRESS,
                usdt: CONFIG.USDT_ADDRESS
            },
            pioneer: CONFIG.PIONEER_WALLET,
            users: this.users.map(u => ({
                id: u.id,
                address: u.address,
                name: u.name,
                level: u.level,
                sponsor: u.sponsor ? u.sponsor.address : null,
                isReal: u.isReal
            }))
        };

        const filename = `test-users-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log(colors.green(`\n💾 Usuários salvos em: ${filename}`));
    }
}

// ============ MAIN EXECUTION ============

async function main() {
    console.log(colors.magenta(`
╔═══════════════════════════════════════╗
║   iDeepX Test Bot - Pioneer Mode     ║
║   Contratos Existentes na Testnet    ║
╚═══════════════════════════════════════╝
    `));

    const bot = new iDeepXTestBot();

    try {
        await bot.initialize();

        console.log(colors.cyan("\n📋 MENU DE AÇÕES"));
        console.log(colors.cyan("====================================="));
        console.log(colors.yellow("1. Gerar usuários"));
        console.log(colors.yellow("2. Financiar usuários"));
        console.log(colors.yellow("3. Registrar usuários"));
        console.log(colors.yellow("4. Ativar LAI"));
        console.log(colors.yellow("5. Depositar performance"));
        console.log(colors.yellow("6. Processar batch"));
        console.log(colors.yellow("7. Verificar resultados"));
        console.log(colors.yellow("8. EXECUTAR TUDO"));
        console.log(colors.cyan("=====================================\n"));

        // Execute tudo
        console.log(colors.green("🚀 Executando TODAS as etapas...\n"));

        await bot.generateUsers();
        await bot.fundUsers();
        await bot.registerUsers();
        await bot.activateLAI();
        await bot.testDeposit();
        await bot.processBatch();
        await bot.verifyResults();
        bot.saveUsers();

        console.log(colors.green("\n✅ TESTE COMPLETO!"));
        console.log(colors.cyan("\n🎉 Todos os usuários criados e configurados!"));
        console.log(colors.magenta("\n⚠️  AÇÕES MANUAIS NECESSÁRIAS:"));
        console.log(colors.yellow("   1. Pioneer precisa ativar LAI manualmente"));
        console.log(colors.yellow("   2. Admin pode depositar mais performance"));
        console.log(colors.yellow("   3. Verificar BSCScan: " + CONFIG.CONTRACT_ADDRESS));

    } catch (error) {
        console.log(colors.red("\n❌ Erro:"), error);
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
