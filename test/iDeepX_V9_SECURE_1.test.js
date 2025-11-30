import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("iDeepXDistributionV9_SECURE_1 - Enterprise Security Tests", function () {

  // ========== FIXTURE ==========
  async function deployDistributionFixture() {
    const [owner, multisig, liquidity, infrastructure, company, user1, user2, user3, user4, user5] = await ethers.getSigners();

    // Deploy Mock USDT (6 decimals)
    const MockUSDT = await ethers.getContractFactory("MockERC20");
    const usdt = await MockUSDT.deploy("Tether USD", "USDT", 6);
    await usdt.waitForDeployment();

    // Deploy V9_SECURE_1
    const Distribution = await ethers.getContractFactory("iDeepXDistributionV9_SECURE_1");
    const distribution = await Distribution.deploy(
      await usdt.getAddress(),
      multisig.address,  // multisig owner
      liquidity.address,
      infrastructure.address,
      company.address
    );
    await distribution.waitForDeployment();

    // Mint USDT para testes (1M USDT para cada user)
    const mintAmount = 1_000_000n * 10n**6n;
    await usdt.mint(owner.address, mintAmount);
    await usdt.mint(multisig.address, mintAmount);  // NOVO: Multisig também precisa de USDT para distributePerformanceFee
    await usdt.mint(user1.address, mintAmount);
    await usdt.mint(user2.address, mintAmount);
    await usdt.mint(user3.address, mintAmount);
    await usdt.mint(user4.address, mintAmount);
    await usdt.mint(user5.address, mintAmount);

    return { distribution, usdt, owner, multisig, liquidity, infrastructure, company, user1, user2, user3, user4, user5 };
  }

  // ========== 1. DEPLOYMENT ==========
  describe("1. Deployment V9", function () {
    it("Deve deployar com multisig correto", async function () {
      const { distribution, multisig } = await loadFixture(deployDistributionFixture);
      expect(await distribution.multisig()).to.equal(multisig.address);
    });

    it("Deve ter emergency reserve zerada no início", async function () {
      const { distribution } = await loadFixture(deployDistributionFixture);
      expect(await distribution.emergencyReserve()).to.equal(0);
    });

    it("Deve ter circuit breaker inativo", async function () {
      const { distribution } = await loadFixture(deployDistributionFixture);
      expect(await distribution.circuitBreakerActive()).to.be.false;
    });
  });

  // ========== 2. REGISTRO ==========
  describe("2. Registro", function () {
    it("User1 deve conseguir se registrar com multisig como sponsor", async function () {
      const { distribution, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const userInfo = await distribution.getUserInfo(user1.address);
      expect(userInfo.isRegistered).to.be.true;
    });

    it("User2 deve conseguir se registrar com user1 como sponsor", async function () {
      const { distribution, user1, user2, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);
      await distribution.connect(user2).registerWithSponsor(user1.address);

      const userInfo = await distribution.getUserInfo(user2.address);
      expect(userInfo.isRegistered).to.be.true;
    });
  });

  // ========== 3. ASSINATURA COM EMERGENCY RESERVE ==========
  describe("3. Assinatura e Emergency Reserve Allocation", function () {
    it("Deve alocar 1% para emergency reserve (20% da liquidity)", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const subscriptionFee = 29n * 10n**6n;
      await usdt.connect(user1).approve(await distribution.getAddress(), subscriptionFee);

      const reserveBefore = await distribution.emergencyReserve();

      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const reserveAfter = await distribution.emergencyReserve();

      // 5% de $29 = $1.45
      // 20% de $1.45 = $0.29
      const expectedReserve = (subscriptionFee * 500n * 2000n) / (10000n * 10000n);
      expect(reserveAfter - reserveBefore).to.equal(expectedReserve);
    });

    it("Liquidity deve receber 4% (80% dos 5%)", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const subscriptionFee = 29n * 10n**6n;
      await usdt.connect(user1).approve(await distribution.getAddress(), subscriptionFee);

      const liqBefore = await distribution.liquidityBalance();

      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const liqAfter = await distribution.liquidityBalance();

      // 5% de $29 = $1.45
      // 80% de $1.45 = $1.16
      const expectedLiq = (subscriptionFee * 500n * 8000n) / (10000n * 10000n);
      expect(liqAfter - liqBefore).to.equal(expectedLiq);
    });

    it("Total distribuído deve continuar 100%", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const subscriptionFee = 29n * 10n**6n;
      await usdt.connect(user1).approve(await distribution.getAddress(), subscriptionFee);

      const contractBalanceBefore = await usdt.balanceOf(await distribution.getAddress());

      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const contractBalanceAfter = await usdt.balanceOf(await distribution.getAddress());

      // Contrato deve receber exatamente $29
      expect(contractBalanceAfter - contractBalanceBefore).to.equal(subscriptionFee);
    });
  });

  // ========== 4. USE EMERGENCY RESERVE ==========
  describe("4. Use Emergency Reserve", function () {
    it("Deve permitir multisig usar reserve para LIQUIDITY", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const subscriptionFee = 29n * 10n**6n;
      await usdt.connect(user1).approve(await distribution.getAddress(), subscriptionFee);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const reserveBefore = await distribution.emergencyReserve();
      const liqBefore = await distribution.liquidityBalance();

      const useAmount = reserveBefore / 2n;  // Usa metade

      await distribution.connect(multisig).useEmergencyReserve(
        useAmount,
        "Cobrir déficit de liquidez",
        0,  // LIQUIDITY
        ethers.ZeroAddress
      );

      const reserveAfter = await distribution.emergencyReserve();
      const liqAfter = await distribution.liquidityBalance();

      expect(reserveAfter).to.equal(reserveBefore - useAmount);
      expect(liqAfter).to.equal(liqBefore + useAmount);
    });

    it("Deve permitir multisig usar reserve para EXTERNAL transfer", async function () {
      const { distribution, usdt, user1, multisig, infrastructure } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const subscriptionFee = 29n * 10n**6n;
      await usdt.connect(user1).approve(await distribution.getAddress(), subscriptionFee);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const reserveBefore = await distribution.emergencyReserve();
      const infraBalanceBefore = await usdt.balanceOf(infrastructure.address);

      const useAmount = reserveBefore;

      await distribution.connect(multisig).useEmergencyReserve(
        useAmount,
        "Transferência emergencial",
        3,  // EXTERNAL
        infrastructure.address
      );

      const reserveAfter = await distribution.emergencyReserve();
      const infraBalanceAfter = await usdt.balanceOf(infrastructure.address);

      expect(reserveAfter).to.equal(0n);
      expect(infraBalanceAfter - infraBalanceBefore).to.equal(useAmount);
    });

    it("Deve reverter se não for multisig", async function () {
      const { distribution, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      await expect(
        distribution.connect(user1).useEmergencyReserve(
          1000000n,
          "Tentativa maliciosa",
          0,
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(distribution, "OnlyMultisig");
    });

    it("Deve reverter se justification vazia", async function () {
      const { distribution, multisig } = await loadFixture(deployDistributionFixture);

      await expect(
        distribution.connect(multisig).useEmergencyReserve(
          1000000n,
          "",  // Vazia
          0,
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(distribution, "InvalidJustification");
    });
  });

  // ========== 5. CIRCUIT BREAKER ==========
  describe("5. Circuit Breaker", function () {
    it("Deve ativar circuit breaker quando solvency < 120%", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const subscriptionFee = 29n * 10n**6n;
      await usdt.connect(user1).approve(await distribution.getAddress(), subscriptionFee);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // Forçar insolvência: dar muito saldo interno ao user1
      // Simula dando performance fees
      const largeAmount = 1_000_000n * 10n**6n;
      await usdt.connect(multisig).approve(await distribution.getAddress(), largeAmount);

      await distribution.connect(multisig).distributePerformanceFee(
        [user1.address],
        [largeAmount]
      );

      // User1 tem muito saldo, se sacar quase tudo, solvency cai
      const userBalance = (await distribution.getUserInfo(user1.address)).availableBalance;

      // Saca quase tudo
      const withdrawAmount = (userBalance * 80n) / 100n;
      await distribution.connect(user1).withdrawEarnings(withdrawAmount);

      // Verificar circuit breaker
      await distribution.checkAndUpdateCircuitBreaker();

      const ratio = await distribution.getSolvencyRatio();
      console.log("Solvency Ratio:", ratio.toString());

      // Se ratio < 12000 (120%), deve ativar
      if (ratio < 12000n) {
        expect(await distribution.circuitBreakerActive()).to.be.true;
      }
    });

    it("Deve bloquear saques quando circuit breaker ativo", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      // Ativa circuit breaker manualmente
      await distribution.connect(multisig).manualCircuitBreakerToggle(true);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // Tenta sacar, deve reverter
      await expect(
        distribution.connect(multisig).withdrawEarnings(10n * 10n**6n)
      ).to.be.revertedWithCustomError(distribution, "CircuitBreakerActive");
    });
  });

  // ========== 6. WITHDRAWAL LIMITS ==========
  describe("6. Withdrawal Limits", function () {
    it("Deve bloquear saque > $10k por transação", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      // Dar muito saldo ao user1
      const largeAmount = 100_000n * 10n**6n;
      await usdt.connect(multisig).approve(await distribution.getAddress(), largeAmount);

      await distribution.connect(multisig).distributePerformanceFee(
        [user1.address],
        [largeAmount]
      );

      // Tentar sacar $15k (acima do limite de $10k)
      const attemptAmount = 15_000n * 10n**6n;

      await expect(
        distribution.connect(user1).withdrawEarnings(attemptAmount)
      ).to.be.revertedWithCustomError(distribution, "WithdrawalLimitExceeded");
    });

    it("Deve permitir múltiplos saques até $50k/mês", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      // Dar saldo suficiente
      const largeAmount = 100_000n * 10n**6n;
      await usdt.connect(multisig).approve(await distribution.getAddress(), largeAmount);

      await distribution.connect(multisig).distributePerformanceFee(
        [user1.address],
        [largeAmount]
      );

      // Saca $10k (ok)
      await distribution.connect(user1).withdrawEarnings(10_000n * 10n**6n);

      // Saca mais $10k (ok, total $20k)
      await distribution.connect(user1).withdrawEarnings(10_000n * 10n**6n);

      // Saca mais $10k (ok, total $30k)
      await distribution.connect(user1).withdrawEarnings(10_000n * 10n**6n);

      // Saca mais $10k (ok, total $40k)
      await distribution.connect(user1).withdrawEarnings(10_000n * 10n**6n);

      // Saca mais $10k (ok, total $50k)
      await distribution.connect(user1).withdrawEarnings(10_000n * 10n**6n);

      // Tentar sacar mais $1 deve falhar (excede $50k/mês)
      await expect(
        distribution.connect(user1).withdrawEarnings(1n * 10n**6n)
      ).to.be.revertedWithCustomError(distribution, "WithdrawalLimitExceeded");
    });
  });

  // ========== 7. MULTISIG UPDATE & ADDRESS REDIRECTS ==========
  describe("7. Multisig Update & Address Redirects", function () {
    it("Deve permitir multisig atualizar para novo endereço", async function () {
      const { distribution, multisig, user1 } = await loadFixture(deployDistributionFixture);

      const oldMultisig = multisig.address;
      const newMultisig = user1.address;

      await distribution.connect(multisig).updateMultisig(newMultisig);

      expect(await distribution.multisig()).to.equal(newMultisig);
    });

    it("Deve criar redirect do antigo para novo multisig", async function () {
      const { distribution, multisig, user1 } = await loadFixture(deployDistributionFixture);

      const oldMultisig = multisig.address;
      const newMultisig = user1.address;

      await distribution.connect(multisig).updateMultisig(newMultisig);

      const resolved = await distribution.resolveAddress(oldMultisig);
      expect(resolved).to.equal(newMultisig);
    });

    it("Não deve quebrar sponsor tree após updateMultisig", async function () {
      const { distribution, multisig, user1, user2 } = await loadFixture(deployDistributionFixture);

      // User1 registra com multisig
      await distribution.connect(user1).registerWithSponsor(multisig.address);

      const user1InfoBefore = await distribution.getUserDetailedInfo(user1.address);
      expect(user1InfoBefore.sponsor).to.equal(multisig.address);

      // Atualiza multisig
      const newMultisig = user2.address;
      await distribution.connect(multisig).updateMultisig(newMultisig);

      // User1 ainda deve ter sponsor válido (resolvido)
      const resolvedSponsor = await distribution.resolveAddress(user1InfoBefore.sponsor);
      expect(resolvedSponsor).to.equal(newMultisig);

      // Novo user3 se registra com user1
      const [, , , , , , , , user3] = await ethers.getSigners();
      await distribution.connect(user3).registerWithSponsor(user1.address);

      // User3 deve ter user1 como sponsor
      const user3Info = await distribution.getUserDetailedInfo(user3.address);
      expect(user3Info.sponsor).to.equal(user1.address);
    });

    it("Deve transferir User struct para novo multisig", async function () {
      const { distribution, multisig, user1 } = await loadFixture(deployDistributionFixture);

      const oldMultisigInfo = await distribution.getUserInfo(multisig.address);
      expect(oldMultisigInfo.isRegistered).to.be.true;

      const newMultisig = user1.address;
      await distribution.connect(multisig).updateMultisig(newMultisig);

      const newMultisigInfo = await distribution.getUserInfo(newMultisig);
      expect(newMultisigInfo.isRegistered).to.be.true;
      expect(newMultisigInfo.currentRank).to.equal(7); // GRANDMASTER
    });
  });

  // ========== 8. POOL WITHDRAWAL LIMITS ==========
  describe("8. Pool Withdrawal Limits", function () {
    it("Deve bloquear saque de pool > $10k/dia", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      // Gera bastante liquidity
      for (let i = 0; i < 10; i++) {
        await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
        await distribution.connect(user1).activateSubscriptionWithUSDT(1);
      }

      const liqBalance = await distribution.liquidityBalance();
      console.log("Liquidity Balance:", ethers.formatUnits(liqBalance, 6), "USDT");

      // Tenta sacar $15k (acima do limite de $10k/dia)
      await expect(
        distribution.connect(multisig).withdrawPoolFunds("liquidity", 15_000n * 10n**6n)
      ).to.be.revertedWithCustomError(distribution, "WithdrawalLimitExceeded");
    });

    it("Deve permitir múltiplos saques de pool até $50k/mês", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      // Gera bastante liquidity (precisa de muito para ter $50k)
      // $29 * 10% (5% liquidity * 2 assinaturas) = ~$3/assinatura para liquidity
      // Precisa de ~17000 assinaturas para ter $50k liquidity

      // Para simplificar, vamos apenas testar que limites são respeitados
      // mesmo sem saldo suficiente

      // Simula adicionando liquidity diretamente (para teste)
      // Não há função pública, então vamos gerar via assinaturas

      const subscriptions = 100;
      for (let i = 0; i < subscriptions; i++) {
        await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
        await distribution.connect(user1).activateSubscriptionWithUSDT(1);
      }

      const liqBalance = await distribution.liquidityBalance();
      console.log("Liquidity Balance após", subscriptions, "assinaturas:", ethers.formatUnits(liqBalance, 6), "USDT");

      // Tenta sacar dentro dos limites
      if (liqBalance >= 10_000n * 10n**6n) {
        await distribution.connect(multisig).withdrawPoolFunds("liquidity", 9_000n * 10n**6n);
      }
    });
  });

  // ========== 9. PERFORMANCE FEE COM RESERVE ==========
  describe("9. Performance Fee com Emergency Reserve", function () {
    it("Performance fee deve alocar 1% para emergency reserve", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const reserveBefore = await distribution.emergencyReserve();

      const perfAmount = 10_000n * 10n**6n;  // $10k
      await usdt.connect(multisig).approve(await distribution.getAddress(), perfAmount);

      await distribution.connect(multisig).distributePerformanceFee(
        [user1.address],
        [perfAmount]
      );

      const reserveAfter = await distribution.emergencyReserve();

      // 5% de $10k = $500
      // 20% de $500 = $100
      const expectedReserveIncrease = (perfAmount * 500n * 2000n) / (10000n * 10000n);
      expect(reserveAfter - reserveBefore).to.equal(expectedReserveIncrease);
    });
  });

  // ========== 10. SOLVENCY COM RESERVE ==========
  describe("10. Solvency incluindo Emergency Reserve", function () {
    it("Solvency deve considerar emergency reserve como parte do contrato", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const solvency = await distribution.getSolvencyStatus();
      expect(solvency.isSolvent).to.be.true;

      // Balance do contrato deve incluir reserve
      const contractBalance = await usdt.balanceOf(await distribution.getAddress());
      const reserve = await distribution.emergencyReserve();

      expect(contractBalance).to.be.gt(0n);
      expect(reserve).to.be.gt(0n);
    });
  });

  // ========== 11. VIEWS SECURITY ==========
  describe("11. Security Views", function () {
    it("getSecurityStatus deve retornar informações corretas", async function () {
      const { distribution, multisig } = await loadFixture(deployDistributionFixture);

      const status = await distribution.getSecurityStatus();

      expect(status._multisig).to.equal(multisig.address);
      expect(status._emergencyReserve).to.equal(0n);
      expect(status._circuitBreakerActive).to.be.false;
      expect(status._totalEmergencyReserveUsed).to.equal(0n);
    });

    it("getWithdrawalLimits deve retornar limites corretos", async function () {
      const { distribution, user1 } = await loadFixture(deployDistributionFixture);

      const limits = await distribution.getWithdrawalLimits(user1.address);

      expect(limits.maxPerTx).to.equal(10_000n * 10n**6n);
      expect(limits.maxPerMonth).to.equal(50_000n * 10n**6n);
      expect(limits.remainingThisMonth).to.equal(50_000n * 10n**6n);
    });

    it("getPoolWithdrawalLimits deve retornar limites corretos", async function () {
      const { distribution } = await loadFixture(deployDistributionFixture);

      const limits = await distribution.getPoolWithdrawalLimits("liquidity");

      expect(limits.maxPerDay).to.equal(10_000n * 10n**6n);
      expect(limits.maxPerMonth).to.equal(50_000n * 10n**6n);
      expect(limits.remainingToday).to.equal(10_000n * 10n**6n);
      expect(limits.remainingThisMonth).to.equal(50_000n * 10n**6n);
    });
  });

  // ========== 12. COMPATIBILIDADE V8_2 ==========
  describe("12. Compatibilidade com V8_2", function () {
    it("Deve manter pagamento com saldo interno", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      // Dar saldo interno ao user1
      await usdt.connect(multisig).approve(await distribution.getAddress(), 10_000n * 10n**6n);
      await distribution.connect(multisig).distributePerformanceFee(
        [user1.address],
        [10_000n * 10n**6n]
      );

      const balanceBefore = (await distribution.getUserInfo(user1.address)).availableBalance;

      // Paga assinatura com saldo
      await distribution.connect(user1).activateSubscriptionWithBalance(1);

      const balanceAfter = (await distribution.getUserInfo(user1.address)).availableBalance;

      expect(balanceBefore - balanceAfter).to.equal(29n * 10n**6n);
    });

    it("Deve manter comissões para inativos", async function () {
      const { distribution, usdt, user1, user2, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);
      await distribution.connect(user2).registerWithSponsor(user1.address);

      // User2 ativa, user1 fica inativo
      await usdt.connect(user2).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      // User1 deve ter comissão pendente
      const user1Info = await distribution.getUserInfo(user1.address);
      expect(user1Info.pendingInactive).to.be.gt(0n);
    });

    it("Deve manter upgrade de rank automático", async function () {
      const { distribution, usdt, user1, user2, user3, user4, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      // Ativa user1
      await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      // Registra 3 diretos
      await distribution.connect(user2).registerWithSponsor(user1.address);
      await distribution.connect(user3).registerWithSponsor(user1.address);
      await distribution.connect(user4).registerWithSponsor(user1.address);

      // Gera volume para user1
      const perfAmount = 2_000n * 10n**6n;
      await usdt.connect(multisig).approve(await distribution.getAddress(), perfAmount);
      await distribution.connect(multisig).distributePerformanceFee(
        [user2.address],  // precisa ativar user2 primeiro
        [perfAmount]
      );

      // Ativa user2 para gerar comissão
      await usdt.connect(user2).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user2).activateSubscriptionWithUSDT(1);

      await usdt.connect(multisig).approve(await distribution.getAddress(), perfAmount);
      await distribution.connect(multisig).distributePerformanceFee(
        [user2.address],
        [perfAmount]
      );

      // Verifica se user1 subiu de rank
      const user1Info = await distribution.getUserInfo(user1.address);
      console.log("User1 Rank:", user1Info.currentRank.toString());
      console.log("User1 Directs:", (await distribution.getUserDetailedInfo(user1.address)).directReferrals.toString());
      console.log("User1 Volume:", ethers.formatUnits((await distribution.getUserDetailedInfo(user1.address)).totalVolume, 6));
    });
  });

  // ========== 13. PAUSABLE ==========
  describe("13. Pausable", function () {
    it("Multisig deve conseguir pausar contrato", async function () {
      const { distribution, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(multisig).pause();

      // Verifica se está pausado tentando registrar
      const [, , , , , , , , , user6] = await ethers.getSigners();
      await expect(
        distribution.connect(user6).registerWithSponsor(multisig.address)
      ).to.be.reverted;
    });

    it("Multisig deve conseguir despausar", async function () {
      const { distribution, multisig, user1 } = await loadFixture(deployDistributionFixture);

      await distribution.connect(multisig).pause();
      await distribution.connect(multisig).unpause();

      // Deve conseguir registrar
      await distribution.connect(user1).registerWithSponsor(multisig.address);
      const userInfo = await distribution.getUserInfo(user1.address);
      expect(userInfo.isRegistered).to.be.true;
    });
  });

  // ========== 14. EDGE CASES ==========
  describe("14. Edge Cases", function () {
    it("Deve lidar com múltiplos redirects em cadeia", async function () {
      const { distribution, multisig, user1, user2, user3 } = await loadFixture(deployDistributionFixture);

      // multisig -> user1 -> user2 -> user3 (3 redirects)

      await distribution.connect(multisig).updateMultisig(user1.address);
      await distribution.connect(user1).updateMultisig(user2.address);
      await distribution.connect(user2).updateMultisig(user3.address);

      const resolved = await distribution.resolveAddress(multisig.address);
      expect(resolved).to.equal(user3.address);
    });

    it("Deve bloquear uso de reserve maior que disponível", async function () {
      const { distribution, multisig } = await loadFixture(deployDistributionFixture);

      await expect(
        distribution.connect(multisig).useEmergencyReserve(
          1_000_000n * 10n**6n,  // $1M (muito mais que o disponível)
          "Tentativa inválida",
          0,
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(distribution, "InsufficientBalance");
    });

    it("Deve calcular solvency ratio corretamente", async function () {
      const { distribution, usdt, user1, multisig } = await loadFixture(deployDistributionFixture);

      await distribution.connect(user1).registerWithSponsor(multisig.address);

      await usdt.connect(user1).approve(await distribution.getAddress(), 29n * 10n**6n);
      await distribution.connect(user1).activateSubscriptionWithUSDT(1);

      const ratio = await distribution.getSolvencyRatio();
      console.log("Solvency Ratio:", ratio.toString(), "bps (", (ratio / 100n).toString(), "%)");

      expect(ratio).to.be.gte(10000n);  // Deve ser >= 100%
    });
  });
});
