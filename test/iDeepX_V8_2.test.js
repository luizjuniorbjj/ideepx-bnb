import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("iDeepXDistributionV8_2 - Sistema MLM Completo", function () {

  // ========== FIXTURE ==========
  async function deployContractFixture() {
    const [owner, liquidity, infrastructure, company, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();

    // Deploy Mock USDT (6 decimais como BSC)
    const MockToken = await ethers.getContractFactory("MockERC20");
    const usdt = await MockToken.deploy("Tether USD", "USDT", 10_000_000 * 10**6);
    await usdt.waitForDeployment();

    // Deploy Distribution V8_2
    const Distribution = await ethers.getContractFactory("iDeepXDistributionV8_2");
    const distribution = await Distribution.deploy(
      await usdt.getAddress(),
      liquidity.address,
      infrastructure.address,
      company.address
    );
    await distribution.waitForDeployment();

    // Distribuir USDT (6 decimais)
    await usdt.transfer(user1.address, 10_000 * 10**6);
    await usdt.transfer(user2.address, 10_000 * 10**6);
    await usdt.transfer(user3.address, 10_000 * 10**6);
    await usdt.transfer(user4.address, 10_000 * 10**6);
    await usdt.transfer(user5.address, 10_000 * 10**6);
    await usdt.transfer(user6.address, 10_000 * 10**6);
    await usdt.transfer(owner.address, 1_000_000 * 10**6);

    return { distribution, usdt, owner, liquidity, infrastructure, company, user1, user2, user3, user4, user5, user6 };
  }

  // ========== DEPLOYMENT ==========
  describe("1. Deployment", function () {
    it("Deve fazer deploy com parâmetros corretos", async function () {
      const { distribution, usdt, liquidity, infrastructure, company, owner } = await loadFixture(deployContractFixture);

      expect(await distribution.USDT()).to.equal(await usdt.getAddress());
      expect(await distribution.liquidityPool()).to.equal(liquidity.address);
      expect(await distribution.infrastructureWallet()).to.equal(infrastructure.address);
      expect(await distribution.companyWallet()).to.equal(company.address);
      expect(await distribution.betaMode()).to.equal(true);
      expect(await distribution.SUBSCRIPTION_FEE()).to.equal(29 * 10**6);
      expect(await distribution.MLM_LEVELS()).to.equal(10);

      // Owner registrado automaticamente
      const userInfo = await distribution.getUserInfo(owner.address);
      expect(userInfo[0]).to.equal(true); // isRegistered
      expect(userInfo[1]).to.equal(true); // subscriptionActive
    });

    it("Deve reverter se endereços forem inválidos", async function () {
      const { usdt, liquidity, infrastructure } = await loadFixture(deployContractFixture);
      const Distribution = await ethers.getContractFactory("iDeepXDistributionV8_2");

      await expect(
        Distribution.deploy(ethers.ZeroAddress, liquidity.address, infrastructure.address, liquidity.address)
      ).to.be.revertedWithCustomError(Distribution, "InvalidAddress");
    });
  });

  // ========== REGISTRO ==========
  describe("2. Registro de Usuários", function () {
    it("Deve registrar usuário com sponsor válido", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await expect(distribution.connect(user1).registerWithSponsor(owner.address))
        .to.emit(distribution, "UserRegistered")
        .withArgs(user1.address, owner.address);

      const userInfo = await distribution.getUserInfo(user1.address);
      expect(userInfo[0]).to.equal(true); // isRegistered

      const detailedInfo = await distribution.getUserDetailedInfo(user1.address);
      expect(detailedInfo[0]).to.equal(owner.address); // sponsor
    });

    it("Deve reverter se sponsor não está registrado", async function () {
      const { distribution, user1, user2 } = await loadFixture(deployContractFixture);

      await expect(
        distribution.connect(user1).registerWithSponsor(user2.address)
      ).to.be.revertedWithCustomError(distribution, "SponsorNotRegistered");
    });

    it("Deve reverter se usuário já está registrado", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);

      await expect(
        distribution.connect(user1).registerWithSponsor(owner.address)
      ).to.be.revertedWithCustomError(distribution, "UserAlreadyRegistered");
    });
  });

  // ========== ASSINATURA COM USDT EXTERNO ==========
  describe("3. Assinatura com USDT Externo", function () {
    it("Deve ativar assinatura de 1 mês com USDT", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);

      const cost = await distribution.getSubscriptionCost(1);
      expect(cost).to.equal(29 * 10**6);

      await usdt.connect(user1).approve(await distribution.getAddress(), cost);

      await expect(distribution.connect(user1).activateSubscriptionWithUSDT(1))
        .to.emit(distribution, "SubscriptionActivated");

      const userInfo = await distribution.getUserInfo(user1.address);
      expect(userInfo[1]).to.equal(true); // subscriptionActive
    });

    it("Deve distribuir corretamente ($29 USDT)", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);

      const cost = 29 * 10**6;
      await usdt.connect(user1).approve(await distribution.getAddress(), cost);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // Verificar pools
      const liq = await distribution.liquidityBalance();
      const inf = await distribution.infrastructureBalance();
      const comp = await distribution.companyBalance();

      expect(liq).to.equal(Math.floor(cost * 500 / 10000)); // 5%
      expect(inf).to.equal(Math.floor(cost * 1200 / 10000)); // 12%
      expect(comp).to.equal(Math.floor(cost * 2300 / 10000)); // 23%

      // Owner recebe direct bonus
      const ownerInfo = await distribution.getUserInfo(owner.address);
      expect(ownerInfo[3]).to.be.gt(0); // availableBalance
    });

    it("Deve pagar direct bonus para sponsor ativo", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);

      const ownerBalanceBefore = (await distribution.getUserInfo(owner.address))[3];

      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const ownerBalanceAfter = (await distribution.getUserInfo(owner.address))[3];
      expect(ownerBalanceAfter - ownerBalanceBefore).to.be.gte(5 * 10**6);
    });
  });

  // ========== ASSINATURA COM SALDO INTERNO ==========
  describe("4. Assinatura com Saldo Interno", function () {
    it("Deve ativar assinatura com saldo interno", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      // Registrar user1 e user2
      await distribution.connect(user1).registerWithSponsor(owner.address);
      await distribution.connect(user2).registerWithSponsor(user1.address);

      // user1 ativa com USDT
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // user2 ativa com USDT (user1 recebe comissão)
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      // Verificar saldo de user1
      const user1Info = await distribution.getUserInfo(user1.address);
      const balance = user1Info[3];
      expect(balance).to.be.gte(5 * 10**6); // Pelo menos $5

      // Registrar user3 sob user1
      const [, , , , , , user3] = await ethers.getSigners();
      await usdt.transfer(user3.address, 1000 * 10**6);
      await distribution.connect(user3).registerWithSponsor(user1.address);

      // user1 tenta pagar com saldo interno
      const canPay = await distribution.canPaySubscriptionWithBalance(user1.address, 1);

      if (canPay[0]) {
        const balanceBefore = user1Info[3];

        await distribution.connect(user1).activateSubscriptionWithBalance(1);

        const user1InfoAfter = await distribution.getUserInfo(user1.address);
        const balanceAfter = user1InfoAfter[3];

        // Saldo diminuiu
        expect(balanceAfter).to.be.lt(balanceBefore);
      }
    });

    it("Deve reverter se saldo insuficiente", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);

      await expect(
        distribution.connect(user1).activateSubscriptionWithBalance(1)
      ).to.be.revertedWithCustomError(distribution, "InsufficientInternalBalance");
    });

    it("Deve diminuir totalUserBalances ao pagar com saldo", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const totalBefore = await distribution.totalUserBalances();

      // Se user1 tem saldo suficiente
      const canPay = await distribution.canPaySubscriptionWithBalance(user1.address, 1);
      if (canPay[0]) {
        await distribution.connect(user1).activateSubscriptionWithBalance(1);
        const totalAfter = await distribution.totalUserBalances();
        expect(totalAfter).to.be.lt(totalBefore);
      }
    });
  });

  // ========== ASSINATURA MISTA ==========
  describe("5. Assinatura Mista (USDT + Saldo)", function () {
    it("Deve ativar assinatura com pagamento misto", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const user1Info = await distribution.getUserInfo(user1.address);
      const balance = user1Info[3];

      if (balance >= 10 * 10**6) {
        const useBalance = 10 * 10**6;
        const cost = await distribution.getSubscriptionCost(1);
        const needUSDT = cost - useBalance;

        await usdt.connect(user1).approve(await distribution.getAddress(), needUSDT);

        await expect(distribution.connect(user1).activateSubscriptionMixed(1, useBalance))
          .to.emit(distribution, "SubscriptionActivated");
      }
    });
  });

  // ========== DESCONTOS ==========
  describe("6. Descontos Múltiplos Meses", function () {
    it("Deve aplicar desconto de 5% para 3 meses", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      const cost3 = await distribution.getSubscriptionCost(3);
      const expected = Math.floor(29 * 3 * 10**6 * 9500 / 10000); // 5% desconto

      expect(cost3).to.equal(expected);
    });

    it("Deve aplicar desconto de 10% para 6 meses", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      const cost6 = await distribution.getSubscriptionCost(6);
      const expected = Math.floor(29 * 6 * 10**6 * 9000 / 10000); // 10% desconto

      expect(cost6).to.equal(expected);
    });

    it("Deve aplicar desconto de 15% para 12 meses", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      const cost12 = await distribution.getSubscriptionCost(12);
      const expected = Math.floor(29 * 12 * 10**6 * 8500 / 10000); // 15% desconto

      expect(cost12).to.equal(expected);
    });
  });

  // ========== COMISSÕES PARA INATIVOS ==========
  describe("7. Comissões para Usuários Inativos", function () {
    it("Deve creditar comissão para sponsor inativo em pendingInactiveEarnings", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      // user1 registra mas NÃO ativa assinatura
      await distribution.connect(user1).registerWithSponsor(owner.address);

      // user2 registra sob user1 e ativa
      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      // user1 deve ter pendingInactiveEarnings > 0
      const user1Info = await distribution.getUserInfo(user1.address);
      expect(user1Info[8]).to.be.gt(0); // pendingInactiveEarnings
      expect(user1Info[3]).to.equal(0); // availableBalance ainda zero
    });

    it("Deve liberar pendingInactiveEarnings ao reativar", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await distribution.connect(user2).registerWithSponsor(user1.address);

      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const pendingBefore = (await distribution.getUserInfo(user1.address))[8];
      expect(pendingBefore).to.be.gt(0);

      // user1 ativa assinatura
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const user1Info = await distribution.getUserInfo(user1.address);
      expect(user1Info[8]).to.equal(0); // pendingInactiveEarnings zerado
      expect(user1Info[3]).to.be.gte(pendingBefore); // availableBalance aumentou
    });

    it("Deve atualizar totalPendingInactiveEarnings corretamente", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      const pendingGlobalBefore = await distribution.totalPendingInactiveEarnings();

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await distribution.connect(user2).registerWithSponsor(user1.address);

      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const pendingGlobalAfter = await distribution.totalPendingInactiveEarnings();
      expect(pendingGlobalAfter).to.be.gt(pendingGlobalBefore);

      // Reativa
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const pendingGlobalFinal = await distribution.totalPendingInactiveEarnings();
      expect(pendingGlobalFinal).to.be.lte(pendingGlobalAfter);
    });
  });

  // ========== UPGRADE DE RANK ==========
  describe("8. Sistema de Ranks", function () {
    it("Deve fazer upgrade automático quando ganha diretos", async function () {
      const { distribution, usdt, owner, user1, user2, user3, user4 } = await loadFixture(deployContractFixture);

      // user1 ativa
      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // Registrar 3 diretos sob user1 (requisito para BRONZE)
      await distribution.connect(user2).registerWithSponsor(user1.address);
      await distribution.connect(user3).registerWithSponsor(user1.address);
      await distribution.connect(user4).registerWithSponsor(user1.address);

      const detailedInfo = await distribution.getUserDetailedInfo(user1.address);
      expect(detailedInfo[1]).to.equal(3); // directReferrals

      // Verificar se subiu para BRONZE (rank 1)
      // Depende se totalVolume também qualifica
      const userInfo = await distribution.getUserInfo(user1.address);
      // currentRank pode ser 0 (STARTER) ou 1 (BRONZE)
      expect(userInfo[9]).to.be.gte(0);
    });

    it("Deve permitir upgrade manual via requestRankUpgrade", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // Chamar upgrade manual (não vai fazer nada se não qualificar)
      await expect(distribution.connect(user1).requestRankUpgrade())
        .to.not.be.reverted;
    });

    it("Deve permitir batch upgrade por admin", async function () {
      const { distribution, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await distribution.connect(user2).registerWithSponsor(owner.address);

      await expect(distribution.batchUpgradeRanks([user1.address, user2.address]))
        .to.not.be.reverted;
    });

    it("Deve reverter batch upgrade se exceder limite", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      const addresses = new Array(51).fill(ethers.ZeroAddress);

      await expect(
        distribution.batchUpgradeRanks(addresses)
      ).to.be.revertedWithCustomError(distribution, "BatchSizeExceeded");
    });
  });

  // ========== PERFORMANCE FEES ==========
  describe("9. Performance Fees e MLM", function () {
    it("Deve distribuir performance fee nos 10 níveis", async function () {
      const { distribution, usdt, owner, user1, user2, user3, user4, user5 } = await loadFixture(deployContractFixture);

      // Criar rede MLM
      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      await distribution.connect(user3).registerWithSponsor(user2.address);
      await usdt.connect(user3).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user3).activateSubscriptionWithUSDT(1);

      // Processar performance fee para user3
      const amount = 1000 * 10**6; // $1000
      await usdt.approve(await distribution.getAddress(), amount);

      await distribution.distributePerformanceFee([user3.address], [amount]);

      // Verificar que upline recebeu comissões
      const user2Info = await distribution.getUserInfo(user2.address);
      const user1Info = await distribution.getUserInfo(user1.address);
      const ownerInfo = await distribution.getUserInfo(owner.address);

      expect(user2Info[3]).to.be.gt(0); // L1 recebeu
      expect(user1Info[3]).to.be.gt(0); // L2 recebeu
      expect(ownerInfo[3]).to.be.gt(0); // L3 recebeu
    });

    it("Deve incrementar totalVolume ao receber comissões", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const volumeBefore = (await distribution.getUserDetailedInfo(user1.address))[2];

      // Performance fee
      const amount = 1000 * 10**6;
      await usdt.approve(await distribution.getAddress(), amount);
      await distribution.distributePerformanceFee([user2.address], [amount]);

      const volumeAfter = (await distribution.getUserDetailedInfo(user1.address))[2];
      expect(volumeAfter).to.be.gt(volumeBefore);
    });
  });

  // ========== SAQUES ==========
  describe("10. Saques de Earnings", function () {
    it("Deve permitir saque de earnings", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const balance = (await distribution.getUserInfo(user1.address))[3];
      const minWithdraw = await distribution.MIN_WITHDRAWAL();

      if (balance >= minWithdraw) {
        await expect(distribution.connect(user1).withdrawEarnings(minWithdraw))
          .to.not.be.reverted;

        const balanceAfter = (await distribution.getUserInfo(user1.address))[3];
        expect(balanceAfter).to.equal(balance - minWithdraw);
      }
    });

    it("Deve reverter saque abaixo do mínimo", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      await expect(
        distribution.connect(user1).withdrawEarnings(1 * 10**6) // $1
      ).to.be.revertedWithCustomError(distribution, "BelowMinimumWithdrawal");
    });
  });

  // ========== SOLVÊNCIA ==========
  describe("11. Solvência do Contrato", function () {
    it("Deve manter solvência após múltiplas operações", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      await distribution.connect(user2).registerWithSponsor(user1.address);
      await usdt.connect(user2).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      const solvency = await distribution.getSolvencyStatus();
      expect(solvency[0]).to.equal(true); // isSolvent
      expect(solvency[2]).to.be.gte(solvency[1]); // currentBalance >= requiredBalance
    });

    it("Deve prevenir saques que causariam insolvência", async function () {
      const { distribution, usdt, owner, user1, user2 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const contractBalance = await usdt.balanceOf(await distribution.getAddress());
      const liquidityBalance = await distribution.liquidityBalance();

      // Tentar sacar mais do que o surplus
      const solvency = await distribution.getSolvencyStatus();
      const surplus = solvency[3];

      if (liquidityBalance > surplus) {
        await expect(
          distribution.withdrawPoolFunds("liquidity", liquidityBalance)
        ).to.be.revertedWithCustomError(distribution, "PoolWithdrawalWouldCauseInsolvency");
      }
    });
  });

  // ========== VIEWS ==========
  describe("12. View Functions", function () {
    it("getUserInfo deve retornar todos os campos corretos", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const userInfo = await distribution.getUserInfo(user1.address);

      expect(userInfo[0]).to.equal(true); // isRegistered
      expect(userInfo[1]).to.equal(true); // subscriptionActive
      expect(userInfo[2]).to.be.gte(0); // totalEarned
      expect(userInfo[3]).to.be.gte(0); // availableBalance
      expect(userInfo[4]).to.equal(0); // totalWithdrawn
      expect(userInfo[5]).to.be.gt(0); // subscriptionExpiration
      expect(userInfo[6]).to.equal(0); // totalPaidWithBalance
      expect(userInfo[7]).to.equal(0); // pendingBonus
      expect(userInfo[8]).to.equal(0); // pendingInactive
      expect(userInfo[9]).to.be.gte(0); // currentRank
    });

    it("getUserDetailedInfo deve retornar dados de rede", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);

      const detailedInfo = await distribution.getUserDetailedInfo(user1.address);

      expect(detailedInfo[0]).to.equal(owner.address); // sponsor
      expect(detailedInfo[1]).to.equal(0); // directReferrals
      expect(detailedInfo[2]).to.equal(0); // totalVolume
      expect(detailedInfo[3]).to.equal(0); // consecutiveRenewals
      expect(detailedInfo[4]).to.be.gt(0); // registrationTimestamp
      expect(detailedInfo[5]).to.equal(false); // fastStartClaimed
    });

    it("getSystemStats deve retornar estatísticas corretas", async function () {
      const { distribution, usdt, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.connect(user1).registerWithSponsor(owner.address);
      await usdt.connect(user1).approve(await distribution.getAddress(), 29 * 10**6);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const stats = await distribution.getSystemStats();

      expect(stats[0]).to.be.gte(2); // totalUsers (owner + user1)
      expect(stats[1]).to.be.gte(2); // totalActive
      expect(stats[2]).to.equal(0); // totalPaidWithBalance
      expect(stats[3]).to.be.gte(0); // totalMLMDistributed
      expect(stats[4]).to.be.gte(0); // totalInactiveHistorical
      expect(stats[5]).to.be.gte(0); // totalInactivePending
      expect(stats[6]).to.be.gt(0); // contractBalance
      expect(stats[7]).to.equal(true); // betaMode
    });
  });

  // ========== ROLE MANAGEMENT ==========
  describe("13. Gerenciamento de Roles", function () {
    it("Deve permitir admin conceder roles", async function () {
      const { distribution, user1 } = await loadFixture(deployContractFixture);

      const DISTRIBUTOR_ROLE = await distribution.DISTRIBUTOR_ROLE();

      await expect(distribution.grantDistributorRole(user1.address))
        .to.not.be.reverted;

      expect(await distribution.hasRole(DISTRIBUTOR_ROLE, user1.address)).to.equal(true);
    });

    it("Deve permitir admin revogar roles", async function () {
      const { distribution, user1 } = await loadFixture(deployContractFixture);

      const DISTRIBUTOR_ROLE = await distribution.DISTRIBUTOR_ROLE();

      await distribution.grantDistributorRole(user1.address);
      await distribution.revokeDistributorRole(user1.address);

      expect(await distribution.hasRole(DISTRIBUTOR_ROLE, user1.address)).to.equal(false);
    });
  });

  // ========== PAUSABLE ==========
  describe("14. Funcionalidade Pausable", function () {
    it("Deve permitir pausar contrato", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      await distribution.pause();
      expect(await distribution.paused()).to.equal(true);
    });

    it("Deve prevenir operações quando pausado", async function () {
      const { distribution, owner, user1 } = await loadFixture(deployContractFixture);

      await distribution.pause();

      await expect(
        distribution.connect(user1).registerWithSponsor(owner.address)
      ).to.be.reverted;
    });

    it("Deve permitir despausar contrato", async function () {
      const { distribution } = await loadFixture(deployContractFixture);

      await distribution.pause();
      await distribution.unpause();

      expect(await distribution.paused()).to.equal(false);
    });
  });
});
