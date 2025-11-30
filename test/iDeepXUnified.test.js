/**
 * 🧪 TESTES COMPLETOS - iDeepX v3.1 Unified
 *
 * Suite de testes para o contrato iDeepXUnified
 *
 * Execução:
 * npx hardhat test
 * npx hardhat test --grep "Registro"
 * npx hardhat test test/iDeepXUnified.test.js
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("iDeepXUnified - v3.1", function () {

    // ==============================================================================
    // FIXTURES
    // ==============================================================================

    /**
     * Deploy completo do sistema para testes
     */
    async function deployFixture() {
        // Obter signers
        const [owner, liquidityWallet, infrastructureWallet, companyWallet, user1, user2, user3, user4, user5, user6] =
            await ethers.getSigners();

        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const usdt = await MockUSDT.deploy();
        await usdt.waitForDeployment();

        // Deploy iDeepXUnified
        const iDeepXUnified = await ethers.getContractFactory("iDeepXUnified");
        const contract = await iDeepXUnified.deploy(
            await usdt.getAddress(),
            liquidityWallet.address,
            infrastructureWallet.address,
            companyWallet.address
        );
        await contract.waitForDeployment();

        // Distribuir USDT para testes
        const testAmount = ethers.parseUnits("10000", 6); // 10k USDT
        await usdt.mint(owner.address, testAmount);
        await usdt.mint(user1.address, testAmount);
        await usdt.mint(user2.address, testAmount);
        await usdt.mint(user3.address, testAmount);
        await usdt.mint(user4.address, testAmount);
        await usdt.mint(user5.address, testAmount);
        await usdt.mint(user6.address, testAmount);

        return {
            contract,
            usdt,
            owner,
            liquidityWallet,
            infrastructureWallet,
            companyWallet,
            user1,
            user2,
            user3,
            user4,
            user5,
            user6
        };
    }

    // ==============================================================================
    // TESTE 1: CONFIGURAÇÃO INICIAL
    // ==============================================================================

    describe("1. Configuração Inicial", function () {

        it("Deve deployar com configurações corretas", async function () {
            const { contract, usdt, liquidityWallet, infrastructureWallet, companyWallet, owner } =
                await loadFixture(deployFixture);

            // Verificar USDT
            expect(await contract.USDT()).to.equal(await usdt.getAddress());

            // Verificar carteiras
            expect(await contract.liquidityWallet()).to.equal(liquidityWallet.address);
            expect(await contract.infrastructureWallet()).to.equal(infrastructureWallet.address);
            expect(await contract.companyWallet()).to.equal(companyWallet.address);

            // Verificar owner
            expect(await contract.owner()).to.equal(owner.address);

            // Verificar LAI fee
            const subscriptionFee = await contract.subscriptionFee();
            expect(subscriptionFee).to.equal(ethers.parseUnits("19", 6)); // $19 USDT

            // Verificar semana inicial
            expect(await contract.currentWeek()).to.equal(1);

            // Verificar usuários
            expect(await contract.userCount()).to.equal(0);
        });

        it("Deve iniciar sem usuários", async function () {
            const { contract } = await loadFixture(deployFixture);

            const activeUsers = await contract.getActiveUsers();
            expect(activeUsers.length).to.equal(0);
        });

        it("Não deve estar pausado inicialmente", async function () {
            const { contract } = await loadFixture(deployFixture);

            expect(await contract.paused()).to.equal(false);
        });
    });

    // ==============================================================================
    // TESTE 2: REGISTRO DE USUÁRIOS
    // ==============================================================================

    describe("2. Registro de Usuários", function () {

        it("Deve registrar primeiro usuário sem sponsor", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await expect(
                contract.connect(user1).registerUser(
                    user1.address,
                    ethers.ZeroAddress
                )
            ).to.emit(contract, "UserRegistered")
             .withArgs(user1.address, ethers.ZeroAddress);

            expect(await contract.userCount()).to.equal(1);

            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.isRegistered).to.equal(true);
            expect(userInfo.sponsor).to.equal(ethers.ZeroAddress);
            expect(userInfo.hasActiveLAI).to.equal(false);
        });

        it("Deve registrar usuário com sponsor válido", async function () {
            const { contract, user1, user2 } = await loadFixture(deployFixture);

            // Registrar user1 primeiro
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            // Registrar user2 com sponsor user1
            await expect(
                contract.connect(user2).registerUser(user2.address, user1.address)
            ).to.emit(contract, "UserRegistered")
             .withArgs(user2.address, user1.address);

            const userInfo = await contract.getUserInfo(user2.address);
            expect(userInfo.sponsor).to.equal(user1.address);
        });

        it("Não deve registrar usuário já registrado", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            await expect(
                contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress)
            ).to.be.revertedWith("User already registered");
        });

        it("Não deve registrar com sponsor não registrado", async function () {
            const { contract, user1, user2 } = await loadFixture(deployFixture);

            await expect(
                contract.connect(user1).registerUser(user1.address, user2.address)
            ).to.be.revertedWith("Sponsor not registered");
        });

        it("Não deve permitir auto-patrocínio", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await expect(
                contract.connect(user1).registerUser(user1.address, user1.address)
            ).to.be.revertedWith("Cannot sponsor yourself");
        });
    });

    // ==============================================================================
    // TESTE 3: PAGAMENTO DE LAI
    // ==============================================================================

    describe("3. Pagamento de LAI", function () {

        it("Deve permitir pagamento de LAI após registro", async function () {
            const { contract, usdt, user1 } = await loadFixture(deployFixture);

            // Registrar
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            // Aprovar USDT
            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user1).approve(await contract.getAddress(), laiPrice);

            // Pagar LAI
            await expect(
                contract.connect(user1).payLAI()
            ).to.emit(contract, "LAIPurchased")
             .withArgs(user1.address, laiPrice);

            // Verificar
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.hasActiveLAI).to.equal(true);
        });

        it("Não deve permitir pagamento sem registro", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await expect(
                contract.connect(user1).payLAI()
            ).to.be.revertedWith("User not registered");
        });

        it("Deve pagar bônus de 25% ao sponsor (mesmo FREE)", async function () {
            const { contract, usdt, user1, user2 } = await loadFixture(deployFixture);

            // Registrar user1 e user2 (user1 é sponsor de user2)
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);
            await contract.connect(user2).registerUser(user2.address, user1.address);

            // user2 paga LAI
            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user2).approve(await contract.getAddress(), laiPrice);

            const balanceBefore = (await contract.getUserInfo(user1.address)).availableBalance;

            await contract.connect(user2).payLAI();

            const balanceAfter = (await contract.getUserInfo(user1.address)).availableBalance;

            // Bônus = 25% = $4.75
            const expectedBonus = laiPrice / 4n;
            expect(balanceAfter - balanceBefore).to.equal(expectedBonus);
        });

        it("Deve emitir evento SponsorBonusPaid", async function () {
            const { contract, usdt, user1, user2 } = await loadFixture(deployFixture);

            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);
            await contract.connect(user2).registerUser(user2.address, user1.address);

            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user2).approve(await contract.getAddress(), laiPrice);

            const expectedBonus = laiPrice / 4n;

            await expect(
                contract.connect(user2).payLAI()
            ).to.emit(contract, "SponsorBonusPaid")
             .withArgs(user1.address, user2.address, expectedBonus);
        });
    });

    // ==============================================================================
    // TESTE 4: ATUALIZAÇÃO DE NÍVEIS
    // ==============================================================================

    describe("4. Atualização de Níveis", function () {

        it("Usuário com LAI deve ter networkLevel 5 (L1-5)", async function () {
            const { contract, usdt, user1 } = await loadFixture(deployFixture);

            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user1).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user1).payLAI();

            // Atualizar nível
            await contract.updateUserLevel(user1.address);

            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.networkLevel).to.equal(5); // L1-5
        });

        it("Usuário sem LAI deve ter networkLevel 0", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            await contract.updateUserLevel(user1.address);

            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.networkLevel).to.equal(0);
        });

        it("Usuário qualificado (5 diretos + $5k volume) deve ter networkLevel 10 (L1-10)", async function () {
            const { contract, usdt, user1, user2, user3, user4, user5, user6 } =
                await loadFixture(deployFixture);

            // user1 registra
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user1).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user1).payLAI();

            // 5 diretos
            for (const user of [user2, user3, user4, user5, user6]) {
                await contract.connect(user).registerUser(user.address, user1.address);
            }

            // Simular volume de $5000
            const volumeRequired = ethers.parseUnits("5000", 6);
            await contract.updateUserVolume(user1.address, volumeRequired);

            // Atualizar nível
            await contract.updateUserLevel(user1.address);

            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.networkLevel).to.equal(10); // L1-10
        });
    });

    // ==============================================================================
    // TESTE 5: DISTRIBUIÇÃO SEMANAL
    // ==============================================================================

    describe("5. Distribuição Semanal", function () {

        it("Owner deve poder depositar performance semanal", async function () {
            const { contract, usdt, owner } = await loadFixture(deployFixture);

            const performanceFee = ethers.parseUnits("1000", 6); // $1000
            await usdt.connect(owner).approve(await contract.getAddress(), performanceFee);

            const ipfsHash = "QmTest123456789";

            await expect(
                contract.depositWeeklyPerformance(performanceFee, ipfsHash)
            ).to.emit(contract, "PerformanceDeposited");
        });

        it("Não deve permitir deposit sem IPFS hash", async function () {
            const { contract, usdt, owner } = await loadFixture(deployFixture);

            const performanceFee = ethers.parseUnits("1000", 6);
            await usdt.connect(owner).approve(await contract.getAddress(), performanceFee);

            await expect(
                contract.depositWeeklyPerformance(performanceFee, "")
            ).to.be.revertedWith("IPFS hash required");
        });

        it("Deve distribuir para carteiras corretamente (5/15/35)", async function () {
            const { contract, usdt, owner, liquidityWallet, infrastructureWallet, companyWallet } =
                await loadFixture(deployFixture);

            const performanceFee = ethers.parseUnits("1000", 6); // $1000
            await usdt.connect(owner).approve(await contract.getAddress(), performanceFee);

            const ipfsHash = "QmTest123456789";

            // Balances antes
            const liquidityBefore = await usdt.balanceOf(liquidityWallet.address);
            const infraBefore = await usdt.balanceOf(infrastructureWallet.address);
            const companyBefore = await usdt.balanceOf(companyWallet.address);

            await contract.depositWeeklyPerformance(performanceFee, ipfsHash);

            // Balances depois
            const liquidityAfter = await usdt.balanceOf(liquidityWallet.address);
            const infraAfter = await usdt.balanceOf(infrastructureWallet.address);
            const companyAfter = await usdt.balanceOf(companyWallet.address);

            // Verificar percentuais
            expect(liquidityAfter - liquidityBefore).to.equal(performanceFee * 5n / 100n); // 5%
            expect(infraAfter - infraBefore).to.equal(performanceFee * 15n / 100n); // 15%
            expect(companyAfter - companyBefore).to.equal(performanceFee * 35n / 100n); // 35%
        });

        it("Deve incrementar semana após distribuição", async function () {
            const { contract, usdt, owner } = await loadFixture(deployFixture);

            const weekBefore = await contract.currentWeek();

            const performanceFee = ethers.parseUnits("1000", 6);
            await usdt.connect(owner).approve(await contract.getAddress(), performanceFee);

            await contract.depositWeeklyPerformance(performanceFee, "QmTest");

            const weekAfter = await contract.currentWeek();

            expect(weekAfter).to.equal(weekBefore + 1n);
        });
    });

    // ==============================================================================
    // TESTE 6: SAQUE DE SALDO
    // ==============================================================================

    describe("6. Saque de Saldo", function () {

        it("Usuário deve poder sacar saldo disponível", async function () {
            const { contract, usdt, user1, user2 } = await loadFixture(deployFixture);

            // Setup: user2 paga LAI, user1 recebe bônus
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);
            await contract.connect(user2).registerUser(user2.address, user1.address);

            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user2).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user2).payLAI();

            // user1 tem saldo de bônus
            const userInfo = await contract.getUserInfo(user1.address);
            const availableBalance = userInfo.availableBalance;

            expect(availableBalance).to.be.gt(0);

            // Sacar
            const balanceBefore = await usdt.balanceOf(user1.address);

            await expect(
                contract.connect(user1).withdraw(availableBalance)
            ).to.emit(contract, "Withdrawal")
             .withArgs(user1.address, availableBalance);

            const balanceAfter = await usdt.balanceOf(user1.address);

            expect(balanceAfter - balanceBefore).to.equal(availableBalance);
        });

        it("Não deve permitir saque maior que saldo", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            const tooMuch = ethers.parseUnits("1000", 6);

            await expect(
                contract.connect(user1).withdraw(tooMuch)
            ).to.be.revertedWith("Insufficient balance");
        });
    });

    // ==============================================================================
    // TESTE 7: FUNÇÕES ADMIN
    // ==============================================================================

    describe("7. Funções Admin", function () {

        it("Owner deve poder pausar contrato", async function () {
            const { contract, owner } = await loadFixture(deployFixture);

            await contract.connect(owner).pause();

            expect(await contract.paused()).to.equal(true);
        });

        it("Owner deve poder despausar contrato", async function () {
            const { contract, owner } = await loadFixture(deployFixture);

            await contract.connect(owner).pause();
            await contract.connect(owner).unpause();

            expect(await contract.paused()).to.equal(false);
        });

        it("Não deve permitir operações quando pausado", async function () {
            const { contract, owner, user1 } = await loadFixture(deployFixture);

            await contract.connect(owner).pause();

            await expect(
                contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Não-owner não deve poder pausar", async function () {
            const { contract, user1 } = await loadFixture(deployFixture);

            await expect(
                contract.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Owner deve poder atualizar carteiras", async function () {
            const { contract, owner, user1 } = await loadFixture(deployFixture);

            await contract.connect(owner).updateLiquidityWallet(user1.address);

            expect(await contract.liquidityWallet()).to.equal(user1.address);
        });
    });

    // ==============================================================================
    // TESTE 8: EDGE CASES
    // ==============================================================================

    describe("8. Edge Cases", function () {

        it("Deve lidar com múltiplos registros em sequência", async function () {
            const { contract, user1, user2, user3, user4, user5 } =
                await loadFixture(deployFixture);

            // Registrar user1
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            // Registrar 4 users com sponsor user1
            for (const user of [user2, user3, user4, user5]) {
                await contract.connect(user).registerUser(user.address, user1.address);
            }

            expect(await contract.userCount()).to.equal(5);

            const user1Info = await contract.getUserInfo(user1.address);
            expect(user1Info.directsCount).to.equal(4);
        });

        it("Deve lidar com renovação de LAI", async function () {
            const { contract, usdt, user1 } = await loadFixture(deployFixture);

            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);

            const laiPrice = await contract.subscriptionFee();

            // Primeira LAI
            await usdt.connect(user1).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user1).payLAI();

            // Renovar LAI
            await usdt.connect(user1).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user1).payLAI();

            // Deve continuar ativa
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.hasActiveLAI).to.equal(true);
        });

        it("Deve retornar lista de usuários ativos corretamente", async function () {
            const { contract, usdt, user1, user2, user3 } =
                await loadFixture(deployFixture);

            // Registrar 3 users
            await contract.connect(user1).registerUser(user1.address, ethers.ZeroAddress);
            await contract.connect(user2).registerUser(user2.address, ethers.ZeroAddress);
            await contract.connect(user3).registerUser(user3.address, ethers.ZeroAddress);

            // Apenas user1 e user2 pagam LAI
            const laiPrice = await contract.subscriptionFee();
            await usdt.connect(user1).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user1).payLAI();

            await usdt.connect(user2).approve(await contract.getAddress(), laiPrice);
            await contract.connect(user2).payLAI();

            // Atualizar níveis
            await contract.updateUserLevel(user1.address);
            await contract.updateUserLevel(user2.address);
            await contract.updateUserLevel(user3.address);

            const activeUsers = await contract.getActiveUsers();
            expect(activeUsers.length).to.equal(2); // Apenas user1 e user2
        });
    });
});
