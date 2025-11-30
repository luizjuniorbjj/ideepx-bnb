import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("iDeepXDistributionV2 - MLM System", function () {

  // ========== FIXTURE ==========
  async function deployContractFixture() {
    const [owner, liquidity, infrastructure, company, user1, user2, user3, user4, user5] = await ethers.getSigners();

    // Deploy Mock USDT Token
    const MockToken = await ethers.getContractFactory("MockERC20");
    const usdt = await MockToken.deploy("Tether USD", "USDT", ethers.parseEther("10000000"));
    await usdt.waitForDeployment();

    // Deploy Distribution Contract (MLM)
    const Distribution = await ethers.getContractFactory("iDeepXDistributionV2");
    const distribution = await Distribution.deploy(
      await usdt.getAddress(),
      liquidity.address,
      infrastructure.address,
      company.address
    );
    await distribution.waitForDeployment();

    // Distribuir USDT para usuários de teste
    await usdt.transfer(user1.address, ethers.parseEther("10000"));
    await usdt.transfer(user2.address, ethers.parseEther("10000"));
    await usdt.transfer(user3.address, ethers.parseEther("10000"));
    await usdt.transfer(user4.address, ethers.parseEther("10000"));
    await usdt.transfer(user5.address, ethers.parseEther("10000"));
    await usdt.transfer(owner.address, ethers.parseEther("1000000")); // Para processar performance fees

    return { distribution, usdt, owner, liquidity, infrastructure, company, user1, user2, user3, user4, user5 };
  }

  // ========== TESTES DE DEPLOYMENT ==========

  describe("Deployment", function () {
    it("Deve fazer deploy com parâmetros corretos", async function () {
      const { distribution, usdt, liquidity, infrastructure, company, owner } = await loadFixture(deployContractFixture);

      expect(await distribution.USDT()).to.equal(await usdt.getAddress());
      expect(await distribution.liquidityPool()).to.equal(liquidity.address);
      expect(await distribution.infrastructureWallet()).to.equal(infrastructure.address);
      expect(await distribution.companyWallet()).to.equal(company.address);
      expect(await distribution.betaMode()).to.equal(true);
      expect(await distribution.SUBSCRIPTION_FEE()).to.equal(ethers.parseEther("29"));
      expect(await distribution.MLM_LEVELS()).to.equal(10);

      // Owner deve estar registrado automaticamente
      const [wallet, sponsor, isRegistered, subscriptionActive] = await distribution.getUserInfo(owner.address);
      expect(isRegistered).to.equal(true);
      expect(subscriptionActive).to.equal(true);
      expect(wallet).to.equal(owner.address);
    });

    it("Deve reverter se endereços forem inválidos", async function () {
      const { usdt, liquidity, infrastructure } = await loadFixture(deployContractFixture);
      const Distribution = await ethers.getContractFactory("iDeepXDistributionV2");

      await expect(
        Distribution.deploy(ethers.ZeroAddress, liquidity.address, infrastructure.address, liquidity.address)
      ).to.be.revertedWithCustomError(Distribution, "InvalidAddress");
    });
  });

  // ========== TESTES DE REGISTRO ==========

  describe("selfRegister", function () {
    it("Deve registrar usuário com sponsor válido", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).selfRegister(owner.address);

      const [wallet, sponsor, isRegistered, , , , , , directReferrals] = await distribution.getUserInfo(user1.address);
      expect(isRegistered).to.equal(true);
      expect(wallet).to.equal(user1.address);
      expect(sponsor).to.equal(owner.address);

      // Verificar que owner ganhou 1 referral direto
      const [, , , , , , , , ownerReferrals] = await distribution.getUserInfo(owner.address);
      expect(ownerReferrals).to.equal(1);
    });

    it("Deve reverter se usuário já está registrado", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).selfRegister(owner.address);

      await expect(
        distribution.connect(user1).selfRegister(owner.address)
      ).to.be.revertedWithCustomError(distribution, "UserAlreadyRegistered");
    });

    it("Deve reverter se sponsor não está registrado", async function () {
      const { distribution, user1, user2 } = await loadFixture(deployContractFixture);

      await expect(
        distribution.connect(user1).selfRegister(user2.address)
      ).to.be.revertedWithCustomError(distribution, "SponsorNotRegistered");
    });

    it("Deve incrementar totalUsers", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      const totalBefore = await distribution.totalUsers();
      await distribution.connect(user1).selfRegister(owner.address);
      const totalAfter = await distribution.totalUsers();

      expect(totalAfter).to.equal(totalBefore + 1n);
    });
  });

  // ========== TESTES DE ASSINATURA ==========

  describe("selfSubscribe", function () {
    it("Deve ativar assinatura com pagamento de $29 USDT", async function () {
      const { distribution, usdt, owner, company, user1 } = await loadFixture(deployContractFixture);

      // Registrar usuário
      await distribution.connect(user1).selfRegister(owner.address);

      // Aprovar USDT
      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("29"));

      // Assinar
      const balanceBefore = await usdt.balanceOf(company.address);
      await distribution.connect(user1).selfSubscribe();
      const balanceAfter = await usdt.balanceOf(company.address);

      // Verificar assinatura ativa
      const [, , , subscriptionActive, , subscriptionExpiration] = await distribution.getUserInfo(user1.address);
      expect(subscriptionActive).to.equal(true);
      expect(subscriptionExpiration).to.be.greaterThan(0);

      // Verificar pagamento
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("29"));

      // Verificar totalActiveSubscriptions
      expect(await distribution.totalActiveSubscriptions()).to.be.greaterThan(0);
    });

    it("Deve reverter se usuário não está registrado", async function () {
      const { distribution, user1 } = await loadFixture(deployContractFixture);

      await expect(
        distribution.connect(user1).selfSubscribe()
      ).to.be.revertedWithCustomError(distribution, "UserNotRegistered");
    });

    it("Deve reverter se assinatura já está ativa", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).selfRegister(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("100"));
      await distribution.connect(user1).selfSubscribe();

      await expect(
        distribution.connect(user1).selfSubscribe()
      ).to.be.revertedWithCustomError(distribution, "SubscriptionAlreadyActive");
    });
  });

  // ========== TESTES DE REGISTRO + ASSINATURA ==========

  describe("registerAndSubscribe", function () {
    it("Deve registrar e assinar em uma única transação", async function () {
      const { distribution, usdt, owner, company, user1 } = await loadFixture(deployContractFixture);

      // Aprovar $29 (assinatura) + $5 (bônus direto) = $34
      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("34"));

      const companyBalanceBefore = await usdt.balanceOf(company.address);
      const ownerBalanceBefore = await usdt.balanceOf(owner.address);

      await distribution.connect(user1).registerAndSubscribe(owner.address);

      const companyBalanceAfter = await usdt.balanceOf(company.address);
      const ownerBalanceAfter = await usdt.balanceOf(owner.address);

      // Verificar registro
      const [wallet, sponsor, isRegistered, subscriptionActive, , subscriptionExpiration] = await distribution.getUserInfo(user1.address);
      expect(isRegistered).to.equal(true);
      expect(wallet).to.equal(user1.address);
      expect(sponsor).to.equal(owner.address);
      expect(subscriptionActive).to.equal(true);
      expect(subscriptionExpiration).to.be.greaterThan(0);

      // Verificar pagamento da assinatura ($29)
      expect(companyBalanceAfter - companyBalanceBefore).to.equal(ethers.parseEther("29"));

      // Verificar pagamento do bônus direto ($5)
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(ethers.parseEther("5"));
    });
  });

  // ========== TESTES DE DISTRIBUIÇÃO MLM ==========

  describe("batchProcessPerformanceFees - Distribuição MLM", function () {
    it("Deve distribuir corretamente nos 10 níveis (Beta Mode)", async function () {
      const { distribution, usdt, owner, liquidity, infrastructure, company, user1, user2, user3 } =
        await loadFixture(deployContractFixture);

      // Criar estrutura MLM de 3 níveis
      // Owner (L0) -> User1 (L1) -> User2 (L2) -> User3 (L3)
      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user1).registerAndSubscribe(owner.address);

      await usdt.connect(user2).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user2).registerAndSubscribe(user1.address);

      await usdt.connect(user3).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user3).registerAndSubscribe(user2.address);

      // Processar performance fee de $1000 para user3
      const performanceFee = ethers.parseEther("1000");

      // Aprovar USDT do owner para fazer a distribuição
      await usdt.connect(owner).approve(await distribution.getAddress(), performanceFee);

      // Processar
      await distribution.batchProcessPerformanceFees([user3.address], [performanceFee]);

      // Verificar distribuição nos pools
      // 60% MLM, 5% Liquidez, 12% Infra, 23% Empresa
      const mlmAmount = performanceFee * 6000n / 10000n; // 600 USDT
      const liquidityAmount = performanceFee * 500n / 10000n; // 50 USDT
      const infraAmount = performanceFee * 1200n / 10000n; // 120 USDT
      const companyAmount = performanceFee * 2300n / 10000n; // 230 USDT

      // Verificar comissões MLM + Bônus Direto
      // user2: L1 (6% de $600 = $36) + bônus direto de user3 ($5) = $41
      // user1: L2 (3% de $600 = $18) + bônus direto de user2 ($5) = $23
      // owner: L3 (2.5% de $600 = $15) + bônus direto de user1 ($5) = $20
      const [, , , , , , user2Earned] = await distribution.getUserInfo(user2.address);
      const [, , , , , , user1Earned] = await distribution.getUserInfo(user1.address);
      const [, , , , , , ownerEarned] = await distribution.getUserInfo(owner.address);

      expect(user2Earned).to.equal(mlmAmount * 600n / 10000n + ethers.parseEther("5")); // 36 + 5 = 41
      expect(user1Earned).to.equal(mlmAmount * 300n / 10000n + ethers.parseEther("5")); // 18 + 5 = 23
      expect(ownerEarned).to.equal(mlmAmount * 250n / 10000n + ethers.parseEther("5")); // 15 + 5 = 20
    });

    it("Deve distribuir para pools corretamente", async function () {
      const { distribution, usdt, owner, liquidity, infrastructure, company, user1 } =
        await loadFixture(deployContractFixture);

      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user1).registerAndSubscribe(owner.address);

      const performanceFee = ethers.parseEther("1000");
      await usdt.connect(owner).approve(await distribution.getAddress(), performanceFee);

      const liquidityBefore = await usdt.balanceOf(liquidity.address);
      const infraBefore = await usdt.balanceOf(infrastructure.address);
      const companyBefore = await usdt.balanceOf(company.address);

      await distribution.batchProcessPerformanceFees([user1.address], [performanceFee]);

      const liquidityAfter = await usdt.balanceOf(liquidity.address);
      const infraAfter = await usdt.balanceOf(infrastructure.address);
      const companyAfter = await usdt.balanceOf(company.address);

      // 5% Liquidez = 50 USDT
      expect(liquidityAfter - liquidityBefore).to.equal(performanceFee * 500n / 10000n);
      // 12% Infra = 120 USDT
      expect(infraAfter - infraBefore).to.equal(performanceFee * 1200n / 10000n);
      // 23% Empresa = 230 USDT (sem contar a assinatura)
      expect(companyAfter - companyBefore).to.equal(performanceFee * 2300n / 10000n);
    });

    it("Deve processar múltiplos clientes em batch", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user1).registerAndSubscribe(owner.address);

      await usdt.connect(user2).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user2).registerAndSubscribe(owner.address);

      const fees = [ethers.parseEther("1000"), ethers.parseEther("500")];
      const total = fees[0] + fees[1];
      await usdt.connect(owner).approve(await distribution.getAddress(), total);

      await distribution.batchProcessPerformanceFees(
        [user1.address, user2.address],
        fees
      );

      // Verificar que ambos foram processados
      const totalMLM = await distribution.totalMLMDistributed();
      expect(totalMLM).to.be.greaterThan(0);
    });

    it("Deve reverter se arrays tiverem tamanhos diferentes", async function () {
      const { distribution, user1 } = await loadFixture(deployContractFixture);

      await expect(
        distribution.batchProcessPerformanceFees(
          [user1.address],
          [ethers.parseEther("1000"), ethers.parseEther("500")]
        )
      ).to.be.revertedWithCustomError(distribution, "ArrayLengthMismatch");
    });
  });

  // ========== TESTES DE MODO BETA/PERMANENTE ==========

  describe("Beta Mode", function () {
    it("Deve alternar entre Beta e Permanente", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      expect(await distribution.betaMode()).to.equal(true);

      await distribution.toggleBetaMode();
      expect(await distribution.betaMode()).to.equal(false);

      await distribution.toggleBetaMode();
      expect(await distribution.betaMode()).to.equal(true);
    });

    it("Deve usar percentuais corretos em modo Beta", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      const percentages = await distribution.getActiveMLMPercentages();
      expect(percentages[0]).to.equal(600);  // L1: 6%
      expect(percentages[1]).to.equal(300);  // L2: 3%
      expect(percentages[2]).to.equal(250);  // L3: 2.5%
      expect(percentages[3]).to.equal(200);  // L4: 2%
      expect(percentages[4]).to.equal(100);  // L5: 1%
    });

    it("Deve usar percentuais corretos em modo Permanente", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      await distribution.toggleBetaMode(); // Desativar Beta

      const percentages = await distribution.getActiveMLMPercentages();
      expect(percentages[0]).to.equal(400);  // L1: 4%
      expect(percentages[1]).to.equal(200);  // L2: 2%
      expect(percentages[2]).to.equal(150);  // L3: 1.5%
      expect(percentages[3]).to.equal(100);  // L4: 1%
      expect(percentages[4]).to.equal(100);  // L5: 1%
    });
  });

  // ========== TESTES DE FUNÇÕES VIEW ==========

  describe("View Functions", function () {
    it("Deve retornar upline corretamente", async function () {
      const { distribution, owner, user1, user2, user3 } = await loadFixture(deployContractFixture);

      // Owner -> User1 -> User2 -> User3
      await distribution.connect(user1).selfRegister(owner.address);
      await distribution.connect(user2).selfRegister(user1.address);
      await distribution.connect(user3).selfRegister(user2.address);

      const upline = await distribution.getUpline(user3.address);
      expect(upline[0]).to.equal(user2.address);
      expect(upline[1]).to.equal(user1.address);
      expect(upline[2]).to.equal(owner.address);
      expect(upline[3]).to.equal(ethers.ZeroAddress);
    });

    it("Deve calcular distribuição MLM corretamente", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      const performanceFee = ethers.parseEther("1000");
      const [levelCommissions, totalMLM, liquidity, infrastructure, company] =
        await distribution.calculateMLMDistribution(performanceFee);

      expect(totalMLM).to.equal(performanceFee * 6000n / 10000n); // 60%
      expect(liquidity).to.equal(performanceFee * 500n / 10000n); // 5%
      expect(infrastructure).to.equal(performanceFee * 1200n / 10000n); // 12%
      expect(company).to.equal(performanceFee * 2300n / 10000n); // 23%

      // L1 = 6% de 600 = 36 USDT
      expect(levelCommissions[0]).to.equal(totalMLM * 600n / 10000n);
    });

    it("Deve retornar estatísticas do sistema", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).selfRegister(owner.address);

      const [totalUsers, totalActive, totalDistributed, betaMode] = await distribution.getSystemStats();
      expect(totalUsers).to.equal(2); // Owner + User1
      expect(betaMode).to.equal(true);
    });
  });

  // ========== TESTES ADMINISTRATIVOS ==========

  describe("Admin Functions", function () {
    it("Deve atualizar carteiras dos pools", async function () {
      const { distribution, user1, user2, user3 } = await loadFixture(deployContractFixture);

      await distribution.updateWallets(user1.address, user2.address, user3.address);

      expect(await distribution.liquidityPool()).to.equal(user1.address);
      expect(await distribution.infrastructureWallet()).to.equal(user2.address);
      expect(await distribution.companyWallet()).to.equal(user3.address);
    });

    it("Deve pausar e despausar", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.pause();
      expect(await distribution.paused()).to.equal(true);

      await expect(
        distribution.connect(user1).selfRegister(owner.address)
      ).to.be.revertedWithCustomError(distribution, "EnforcedPause");

      await distribution.unpause();
      expect(await distribution.paused()).to.equal(false);
    });

    it("Deve desativar assinatura de usuário", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await usdt.connect(user1).approve(await distribution.getAddress(), ethers.parseEther("34"));
      await distribution.connect(user1).registerAndSubscribe(owner.address);

      const [, , , activeBefore] = await distribution.getUserInfo(user1.address);
      expect(activeBefore).to.equal(true);

      await distribution.deactivateSubscription(user1.address);

      const [, , , activeAfter] = await distribution.getUserInfo(user1.address);
      expect(activeAfter).to.equal(false);
    });
  });
});
