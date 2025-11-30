// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * iDeepX — Core V10 (Mainnet-ready)
 * - RBAC (AccessControl)
 * - Pausable + ReentrancyGuard
 * - EIP-712 attestation (opcional)
 * - Subscriptions ($19 / 30d) via USDT ou saldo interno
 * - Crédito de performance (backend → contrato → usuários)
 * - Saques com limites e circuit breaker por solvência
 * - Sem dados sensíveis on-chain (GMI fica off-chain)
 *
 * Requisitos:
 * - Instale OpenZeppelin ^5.x
 *   npm i @openzeppelin/contracts
 */

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract iDeepXCoreV10 is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    // ---------- ROLES ----------
    bytes32 public constant UPDATER_ROLE     = keccak256("UPDATER_ROLE");      // backend orquestrador
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");  // tesouraria/distribuição
    bytes32 public constant TREASURY_ROLE    = keccak256("TREASURY_ROLE");     // saídas de tesouraria

    // ---------- TOKEN ----------
    IERC20 public immutable USDT;

    // ---------- ASSINATURA EIP-712 ----------
    // Attestation permite aplicar várias atualizações de uma vez (opcional)
    bytes32 public constant ATTEST_TYPEHASH = keccak256(
        "Attest(address user,bytes32 accountHash,bool active,uint8 maxLevel,uint256 monthlyVolume,uint8 kycStatus,uint256 issuedAt,uint256 expiresAt,uint256 nonce)"
    );
    mapping(address => uint256) public nonces;

    // ---------- SUBSCRIPTION ----------
    uint256 public subscriptionFee = 19e6;       // USDT possui 6 casas decimais na BSC (ajuste se diferente)
    uint256 public subscriptionDuration = 30 days;

    // ---------- SAQUES / LIMITES ----------
    uint256 public minWithdrawal = 50e6;         // $50
    uint256 public maxWithdrawalPerTx = 10_000e6;
    uint256 public maxWithdrawalPerMonth = 30_000e6;

    // ---------- TESOURARIA / LIMITES ----------
    uint256 public maxTreasuryPerDay = 50_000e6; // $50k diário
    mapping(uint256 => uint256) public treasuryWithdrawnToday;

    // ---------- SOLVÊNCIA / BREAKER ----------
    uint256 public minSolvencyBps = 11000;       // 110.00%
    bool    public circuitBreakerActive;         // true se solvência < alvo

    // ---------- ESTADO USUÁRIOS ----------
    struct UserState {
        bool    active;            // status ativo na operação (validado off-chain)
        uint8   maxLevel;          // maior nível liberado
        uint8   kycStatus;         // 0 desconhecido, 1 pendente, 2 aprovado, 3 rejeitado
        uint64  lastWithdrawMonth; // AAAAMM, ex.: 202511
        uint256 monthlyVolume;     // volume consolidado do mês corrente (unidade: 1e6 USD, compatível com backend)
        uint256 internalBalance;   // saldo interno disponível para saque/ativação
        uint256 withdrawnThisMonth;// controle mensal de saque
        uint256 subscriptionExpiry;// timestamp de expiração
        bytes32 accountHash;       // keccak(accountNumber + server) - sem dados sensíveis
    }

    mapping(address => UserState) private _users;
    uint256 public totalUserBalances; // passivo agregado para solvência

    // ---------- EVENTOS ----------
    event UserLinked(address indexed user, bytes32 indexed accountHash);
    event UserActivityUpdated(address indexed user, bool active);
    event UserVolumeUpdated(address indexed user, uint256 monthlyVolume);
    event UserLevelsUnlocked(address indexed user, uint8 maxLevel);
    event UserKYCUpdated(address indexed user, uint8 status);

    event SubscriptionActivated(address indexed user, uint256 fee, uint256 expiry, string method);
    event PerformanceCredited(address indexed user, uint256 amount);
    event InternalTransfer(address indexed from, address indexed to, uint256 amount);

    event WithdrawExecuted(address indexed user, uint256 amount);
    event LimitsUpdated(uint256 minW, uint256 maxPerTx, uint256 maxPerMonth);
    event TreasuryLimitUpdated(uint256 maxPerDay);
    event SolvencyTargetUpdated(uint256 minBps);
    event BreakerStateChanged(bool active);

    // ---------- MODIFIERS ----------
    modifier onlyUpdater()     { require(hasRole(UPDATER_ROLE,     msg.sender), "UPDATER_ROLE");     _; }
    modifier onlyDistributor() { require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "DISTRIBUTOR_ROLE"); _; }
    modifier onlyTreasury()    { require(hasRole(TREASURY_ROLE,    msg.sender), "TREASURY_ROLE");    _; }

    // ---------- CONSTRUTOR ----------
    constructor(address usdt, address admin) EIP712("iDeepX-Oracle", "1") {
        require(usdt != address(0) && admin != address(0), "zero addr");
        USDT = IERC20(usdt);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        // Por padrão, admin também pode gerenciar roles
    }

    // ============ VIEWs ============

    function userView(address user) external view returns (
        bool active_,
        uint8 maxLevel_,
        uint256 monthlyVolume_,
        bytes32 accountHash_,
        uint8 kycStatus_,
        uint256 internalBalance_,
        uint256 subscriptionExpiry_,
        uint256 withdrawnThisMonth_,
        uint64 lastWithdrawMonth_
    ) {
        UserState storage u = _users[user];
        return (
            u.active,
            u.maxLevel,
            u.monthlyVolume,
            u.accountHash,
            u.kycStatus,
            u.internalBalance,
            u.subscriptionExpiry,
            u.withdrawnThisMonth,
            u.lastWithdrawMonth
        );
    }

    /// @dev assets / liabilities em bps (ex.: 11000 = 110.00%)
    function getSolvencyRatio() public view returns (uint256 bps) {
        uint256 assets = USDT.balanceOf(address(this));
        if (totalUserBalances == 0) return type(uint256).max;
        return (assets * 10000) / totalUserBalances;
    }

    // ============ ADMIN / PARAMS ============

    function setSubscription(uint256 fee, uint256 duration) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(fee > 0 && duration >= 1 days, "bad params");
        subscriptionFee = fee;
        subscriptionDuration = duration;
    }

    function setWithdrawLimits(uint256 minW, uint256 maxPerTx, uint256 maxPerMonth) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(minW > 0 && maxPerTx >= minW && maxPerMonth >= maxPerTx, "bad limits");
        minWithdrawal = minW;
        maxWithdrawalPerTx = maxPerTx;
        maxWithdrawalPerMonth = maxPerMonth;
        emit LimitsUpdated(minW, maxPerTx, maxPerMonth);
    }

    function setTreasuryLimit(uint256 maxPerDay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(maxPerDay > 0, "must be positive");
        maxTreasuryPerDay = maxPerDay;
        emit TreasuryLimitUpdated(maxPerDay);
    }

    function setSolvencyTarget(uint256 minBps_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(minBps_ >= 10000, "min 100%");
        minSolvencyBps = minBps_;
        emit SolvencyTargetUpdated(minBps_);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ============ EIP-712 ATTESTATION (opcional) ============

    struct Attest {
        address user;
        bytes32 accountHash;
        bool    active;
        uint8   maxLevel;
        uint256 monthlyVolume;
        uint8   kycStatus;
        uint256 issuedAt;
        uint256 expiresAt;
        uint256 nonce;
        bytes   sig; // assinatura do signer que possui UPDATER_ROLE
    }

    function applyAttestation(Attest calldata a) external whenNotPaused nonReentrant {
        require(a.expiresAt >= block.timestamp, "expired");
        require(a.nonce == nonces[a.user]++, "bad nonce");

        bytes32 structHash = keccak256(abi.encode(
            ATTEST_TYPEHASH,
            a.user, a.accountHash, a.active, a.maxLevel, a.monthlyVolume, a.kycStatus, a.issuedAt, a.expiresAt, a.nonce
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, a.sig);
        require(hasRole(UPDATER_ROLE, signer), "unauthorized signer");

        _applyUserUpdates(a.user, a.accountHash, a.active, a.maxLevel, a.monthlyVolume, a.kycStatus);
    }

    // ============ BACKEND (UPDATER) — LINK E MÉTRICAS ============

    function confirmLink(address user, bytes32 accountHash) external onlyUpdater whenNotPaused {
        require(user != address(0) && accountHash != bytes32(0), "bad args");
        _users[user].accountHash = accountHash;
        emit UserLinked(user, accountHash);
    }

    function setUserActive(address user, bool active_) external onlyUpdater whenNotPaused {
        _users[user].active = active_;
        emit UserActivityUpdated(user, active_);
    }

    function updateUserVolume(address user, uint256 monthlyVolume_) external onlyUpdater whenNotPaused {
        _users[user].monthlyVolume = monthlyVolume_;
        emit UserVolumeUpdated(user, monthlyVolume_);
    }

    function setUnlockedLevels(address user, uint8 maxLevel_) external onlyUpdater whenNotPaused {
        require(maxLevel_ >= 1 && maxLevel_ <= 10, "level 1..10");
        _users[user].maxLevel = maxLevel_;
        emit UserLevelsUnlocked(user, maxLevel_);
    }

    function setKycStatus(address user, uint8 status) external onlyUpdater whenNotPaused {
        require(status <= 3, "0..3");
        _users[user].kycStatus = status;
        emit UserKYCUpdated(user, status);
    }

    // ============ SUBSCRIPTION ============

    function activateSubscriptionWithUSDT() external whenNotPaused nonReentrant {
        // transfere do usuário para o contrato
        USDT.safeTransferFrom(msg.sender, address(this), subscriptionFee);
        // não muda totalUserBalances (é receita do sistema)
        _setSubscription(msg.sender, "USDT");
    }

    function activateSubscriptionWithBalance() external whenNotPaused nonReentrant {
        UserState storage u = _users[msg.sender];
        require(u.internalBalance >= subscriptionFee, "insuf. balance");
        u.internalBalance -= subscriptionFee;
        totalUserBalances  -= subscriptionFee;
        _setSubscription(msg.sender, "BALANCE");
    }

    function _setSubscription(address user, string memory method) internal {
        UserState storage u = _users[user];
        uint256 old = u.subscriptionExpiry;
        uint256 base = block.timestamp > old ? block.timestamp : old;
        u.subscriptionExpiry = base + subscriptionDuration;
        emit SubscriptionActivated(user, subscriptionFee, u.subscriptionExpiry, method);
        _refreshBreaker();
    }

    // ============ CRÉDITO DE PERFORMANCE (DISTRIBUTOR) ============

    /**
     * @notice Backend já envia valores finais por usuário (pós-MLM off-chain).
     * O caller (tesouraria) abastece USDT → contrato e credita usuários.
     */
    function creditPerformance(address[] calldata users, uint256[] calldata amounts)
        external
        onlyDistributor
        whenNotPaused
        nonReentrant
    {
        require(users.length == amounts.length && users.length > 0, "len mismatch");

        uint256 sum;
        for (uint256 i; i < amounts.length; i++) sum += amounts[i];
        // Puxa USDT da carteira de distribuição (precisa allowance)
        USDT.safeTransferFrom(msg.sender, address(this), sum);

        for (uint256 i; i < users.length; i++) {
            address uaddr = users[i];
            uint256 amt   = amounts[i];
            _users[uaddr].internalBalance += amt;
            totalUserBalances += amt;
            emit PerformanceCredited(uaddr, amt);
        }
        _refreshBreaker();
    }

    // ============ TRANSFERÊNCIA INTERNA ENTRE USUÁRIOS ============

    function transferBalance(address to, uint256 amount) external whenNotPaused nonReentrant {
        require(to != address(0) && amount > 0, "bad args");
        UserState storage s = _users[msg.sender];
        require(s.internalBalance >= amount, "insuf. balance");
        s.internalBalance -= amount;
        _users[to].internalBalance += amount;
        // totalUserBalances não muda (passivo apenas realocado)
        emit InternalTransfer(msg.sender, to, amount);
    }

    // ============ SAQUES ============

    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        require(amount >= minWithdrawal, "below min");
        require(amount <= maxWithdrawalPerTx, "above per-tx");
        UserState storage u = _users[msg.sender];
        require(u.internalBalance >= amount, "insuf. balance");

        // controle mensal
        uint64 ym = _yyyymm(block.timestamp);
        if (u.lastWithdrawMonth != ym) {
            u.lastWithdrawMonth = ym;
            u.withdrawnThisMonth = 0;
        }
        require(u.withdrawnThisMonth + amount <= maxWithdrawalPerMonth, "above monthly cap");

        // ✅ FIX: Atualiza estado PRIMEIRO
        u.withdrawnThisMonth += amount;
        u.internalBalance    -= amount;
        totalUserBalances    -= amount;

        // ✅ FIX: Verifica solvência COM estado atualizado
        uint256 bps = getSolvencyRatio();
        if (bps < minSolvencyBps) {
            // Rollback se insolvente
            u.withdrawnThisMonth -= amount;
            u.internalBalance    += amount;
            totalUserBalances    += amount;
            circuitBreakerActive = true;
            revert("breaker active");
        }

        // ✅ Tudo OK, transfere
        USDT.safeTransfer(msg.sender, amount);
        emit WithdrawExecuted(msg.sender, amount);

        _refreshBreaker();
    }

    // ============ TESOURARIA (opcional) ============

    /// @notice Saída controlada (infra/ops). Exige solvência acima do alvo.
    function treasuryPayout(address to, uint256 amount) external onlyTreasury whenNotPaused nonReentrant {
        require(to != address(0) && amount > 0, "bad args");
        require(getSolvencyRatio() >= minSolvencyBps, "solvency low");

        // ✅ FIX: Verificar limite diário
        uint256 today = block.timestamp / 1 days;
        require(
            treasuryWithdrawnToday[today] + amount <= maxTreasuryPerDay,
            "daily treasury limit exceeded"
        );
        treasuryWithdrawnToday[today] += amount;

        // não altera totalUserBalances (passivo), pois é saída operacional
        USDT.safeTransfer(to, amount);
        _refreshBreaker();
    }

    // ============ INTERNOS ============

    function _applyUserUpdates(
        address user,
        bytes32 accountHash,
        bool active_,
        uint8 maxLevel_,
        uint256 monthlyVolume_,
        uint8 kycStatus_
    ) internal {
        if (accountHash != bytes32(0)) {
            _users[user].accountHash = accountHash;
            emit UserLinked(user, accountHash);
        }
        _users[user].active = active_;
        emit UserActivityUpdated(user, active_);

        if (maxLevel_ > 0) {
            require(maxLevel_ <= 10, "level 1..10");
            _users[user].maxLevel = maxLevel_;
            emit UserLevelsUnlocked(user, maxLevel_);
        }
        _users[user].monthlyVolume = monthlyVolume_;
        emit UserVolumeUpdated(user, monthlyVolume_);

        require(kycStatus_ <= 3, "kyc 0..3");
        _users[user].kycStatus = kycStatus_;
        emit UserKYCUpdated(user, kycStatus_);
    }

    function _yyyymm(uint256 ts) internal pure returns (uint64) {
        // ✅ FIX: Usa "mês ordinal" desde epoch (30 dias fixos)
        // Mais preciso para controle de limites mensais
        // 0 = jan/1970, 1 = fev/1970, etc.
        // Exemplo: Se ts = hoje, retorna ~660 (55 anos * 12 meses)
        return uint64(ts / 30 days);
    }

    function _refreshBreaker() internal {
        bool nowActive = getSolvencyRatio() < minSolvencyBps;
        if (nowActive != circuitBreakerActive) {
            circuitBreakerActive = nowActive;
            emit BreakerStateChanged(nowActive);
        }
    }
}
