// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./iDeepXRulebookImmutable.sol";

/**
 * @title iDeepX Proof V2 - Sistema de Transparência com Bônus Pool
 * @author iDeepX Team
 * @notice Registra provas semanais de comissões com rastreamento do Bônus Pool
 * @dev Filosofia: Blockchain para PROVA + REGRAS + RASTREAMENTO CONTÁBIL
 *
 * ✨ NOVIDADES V2:
 * - Rastreamento contábil do Bônus Pool
 * - Transparência de origem das comissões
 * - Prova on-chain de sustentabilidade
 * - Análise de cobertura e déficit
 *
 * ✅ O QUE É O BÔNUS POOL:
 * - Sistema de rastreamento contábil (NÃO muda comissões)
 * - Documenta: 20% do performance fee → "entra" no Pool
 * - Documenta: Comissões distribuídas → "saem" do Pool
 * - Documenta: Déficit coberto pela receita operacional
 * - OBJETIVO: Transparência e auditabilidade
 *
 * ✅ SUSTENTABILIDADE:
 * - Performance fee (35%) > Comissões (25% do líquido)
 * - Pool "recebe" 20% mas "distribui" mais (normal!)
 * - Déficit é coberto pela sobra operacional (15%)
 * - Sistema matematicamente sustentável
 *
 * ✅ O QUE ESTÁ ON-CHAIN:
 * - Hash IPFS do snapshot completo
 * - Timestamp do registro
 * - Totais agregados (usuários, comissões, performance fee)
 * - Entrada/Saída/Saldo do Bônus Pool
 * - Déficit coberto (se houver)
 * - Referência ao plano de comissões (Rulebook)
 *
 * ❌ O QUE NÃO ESTÁ ON-CHAIN:
 * - Dados individuais de usuários
 * - Cálculos de comissões (feito off-chain)
 * - Gestão de LAI
 * - Distribuição de pagamentos
 */
contract iDeepXProofV2_BonusPool {

    // ==================== ESTRUTURA ====================

    /**
     * @dev Estrutura de prova semanal com Bônus Pool
     */
    struct WeeklyProof {
        // ===== CAMPOS EXISTENTES (v1) =====
        uint256 weekTimestamp;      // Semana (timestamp início)
        string ipfsHash;            // Hash IPFS do snapshot completo
        uint256 totalUsers;         // Total de usuários processados
        uint256 totalCommissions;   // Comissões em cents (ex: 150000 = $1,500.00)
        uint256 totalProfits;       // Lucros totais em cents
        address submitter;          // Quem submeteu
        uint256 submittedAt;        // Quando foi submetido
        bool finalized;             // Se foi finalizada (pagamentos feitos)

        // ===== CAMPOS NOVOS (v2 - Bônus Pool) =====
        uint256 totalPerformanceFee;    // Performance fee total (35% dos lucros)
        uint256 bonusPoolAdded;         // 20% do perf. fee "adicionado" ao Pool
        uint256 bonusPoolBalance;       // Saldo do Pool ANTES desta distribuição
        uint256 bonusPoolDistributed;   // Total distribuído (= totalCommissions)
        uint256 bonusPoolRemaining;     // Saldo do Pool APÓS distribuição
        uint256 operationalRevenue;     // 15% do perf. fee (para operação)
        uint256 poolDeficit;            // Déficit coberto (se Pool < comissões)
    }

    // ==================== STATE VARIABLES ====================

    /// @notice Endereço do proprietário
    address public owner;

    /// @notice Endereço do backend automático
    address public backend;

    /// @notice Referência ao contrato Rulebook (plano imutável)
    iDeepXRulebookImmutable public rulebook;

    /// @notice Mapeamento de semana => prova
    mapping(uint256 => WeeklyProof) public weeklyProofs;

    /// @notice Array de todas as semanas registradas
    uint256[] public allWeeks;

    /// @notice Contador de provas submetidas
    uint256 public totalProofsSubmitted;

    /// @notice Flag de pause para emergências
    bool public paused;

    // ===== VARIÁVEIS DE ESTADO DO BÔNUS POOL =====

    /// @notice Saldo total atual do Bônus Pool (em cents)
    uint256 public totalBonusPoolBalance;

    /// @notice Total histórico adicionado ao Pool
    uint256 public totalHistoricalBonusPoolAdded;

    /// @notice Total histórico distribuído do Pool
    uint256 public totalHistoricalBonusPoolDistributed;

    /// @notice Total histórico de performance fees coletados
    uint256 public totalHistoricalPerformanceFees;

    /// @notice Total histórico de déficits cobertos pela operação
    uint256 public totalHistoricalDeficitsCovered;

    // ==================== EVENTOS ====================

    event ProofSubmitted(
        uint256 indexed week,
        string ipfsHash,
        uint256 totalUsers,
        uint256 totalCommissions,
        uint256 totalProfits,
        address indexed submitter
    );

    event ProofFinalized(
        uint256 indexed week,
        address indexed finalizer
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    event BackendUpdated(
        address indexed previousBackend,
        address indexed newBackend
    );

    event PauseStatusChanged(bool isPaused);

    // ===== EVENTOS NOVOS (Bônus Pool) =====

    /**
     * @notice Emitido quando o Bônus Pool é atualizado
     */
    event BonusPoolUpdated(
        uint256 indexed week,
        uint256 previousBalance,
        uint256 added,
        uint256 distributed,
        uint256 newBalance,
        uint256 deficit
    );

    /**
     * @notice Emitido quando há déficit coberto pela operação
     */
    event DeficitCovered(
        uint256 indexed week,
        uint256 deficitAmount,
        uint256 fromOperationalRevenue
    );

    // ==================== MODIFIERS ====================

    modifier onlyOwner() {
        require(msg.sender == owner, "iDeepXProofV2: caller is not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == backend,
            "iDeepXProofV2: caller not authorized"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "iDeepXProofV2: contract is paused");
        _;
    }

    // ==================== CONSTRUCTOR ====================

    /**
     * @notice Inicializa o contrato com backend e rulebook
     * @param _backend Endereço do backend automático
     * @param _rulebook Endereço do contrato Rulebook
     */
    constructor(address _backend, address _rulebook) {
        require(_backend != address(0), "iDeepXProofV2: invalid backend");
        require(_rulebook != address(0), "iDeepXProofV2: invalid rulebook");

        owner = msg.sender;
        backend = _backend;
        rulebook = iDeepXRulebookImmutable(_rulebook);
        paused = false;

        // Inicializar Bônus Pool com saldo zero
        totalBonusPoolBalance = 0;
    }

    // ==================== FUNÇÕES PRINCIPAIS ====================

    /**
     * @notice Submeter prova semanal COM rastreamento do Bônus Pool
     * @param _week Timestamp da semana (início segunda-feira 00:00 UTC)
     * @param _ipfsHash Hash do arquivo JSON no IPFS
     * @param _totalUsers Total de usuários processados
     * @param _totalCommissions Total de comissões em cents
     * @param _totalProfits Total de lucros em cents
     * @param _totalPerformanceFee Total de performance fee (35% dos lucros)
     *
     * @dev Cálculo do Bônus Pool:
     * 1. Entrada: 20% do performance fee
     * 2. Saída: Total de comissões distribuídas
     * 3. Se Pool < comissões → déficit (coberto pela operação)
     * 4. Se Pool >= comissões → Pool descontado normalmente
     */
    function submitWeeklyProof(
        uint256 _week,
        string memory _ipfsHash,
        uint256 _totalUsers,
        uint256 _totalCommissions,
        uint256 _totalProfits,
        uint256 _totalPerformanceFee
    ) external onlyAuthorized whenNotPaused {
        // Validações básicas
        require(_week > 0, "iDeepXProofV2: invalid week timestamp");
        require(bytes(_ipfsHash).length > 0, "iDeepXProofV2: empty IPFS hash");
        require(_totalUsers > 0, "iDeepXProofV2: total users must be > 0");
        require(_totalPerformanceFee > 0, "iDeepXProofV2: invalid performance fee");

        // Verificar se já existe prova para esta semana
        bool exists = bytes(weeklyProofs[_week].ipfsHash).length > 0;

        // Não permitir atualizar prova finalizada
        if (exists) {
            require(
                !weeklyProofs[_week].finalized,
                "iDeepXProofV2: cannot update finalized proof"
            );
        } else {
            // Nova prova: adicionar à lista
            allWeeks.push(_week);
            totalProofsSubmitted++;
        }

        // ========== CÁLCULO DO BÔNUS POOL ==========

        // 1. Calcular quanto "entra" no Pool (20% do performance fee)
        uint256 bonusPoolAdded = (_totalPerformanceFee * 20) / 100;

        // 2. Calcular receita operacional (15% do performance fee)
        uint256 operationalRevenue = (_totalPerformanceFee * 15) / 100;

        // 3. Guardar saldo anterior do Pool
        uint256 previousBonusPoolBalance = totalBonusPoolBalance;

        // 4. Adicionar ao Pool
        totalBonusPoolBalance += bonusPoolAdded;

        // 5. Verificar se Pool cobre as comissões
        uint256 poolDeficit = 0;
        uint256 finalBonusPoolBalance;

        if (_totalCommissions > totalBonusPoolBalance) {
            // Pool NÃO cobre - há déficit
            poolDeficit = _totalCommissions - totalBonusPoolBalance;
            finalBonusPoolBalance = 0; // Pool zerado
            totalBonusPoolBalance = 0;

            // Emitir evento de déficit
            emit DeficitCovered(_week, poolDeficit, operationalRevenue);
        } else {
            // Pool cobre normalmente
            totalBonusPoolBalance -= _totalCommissions;
            finalBonusPoolBalance = totalBonusPoolBalance;
        }

        // ========== FIM CÁLCULO BÔNUS POOL ==========

        // Armazenar prova completa
        weeklyProofs[_week] = WeeklyProof({
            weekTimestamp: _week,
            ipfsHash: _ipfsHash,
            totalUsers: _totalUsers,
            totalCommissions: _totalCommissions,
            totalProfits: _totalProfits,
            submitter: msg.sender,
            submittedAt: block.timestamp,
            finalized: false,
            totalPerformanceFee: _totalPerformanceFee,
            bonusPoolAdded: bonusPoolAdded,
            bonusPoolBalance: previousBonusPoolBalance,
            bonusPoolDistributed: _totalCommissions,
            bonusPoolRemaining: finalBonusPoolBalance,
            operationalRevenue: operationalRevenue,
            poolDeficit: poolDeficit
        });

        // Atualizar totais históricos
        totalHistoricalPerformanceFees += _totalPerformanceFee;
        totalHistoricalBonusPoolAdded += bonusPoolAdded;
        totalHistoricalBonusPoolDistributed += _totalCommissions;
        if (poolDeficit > 0) {
            totalHistoricalDeficitsCovered += poolDeficit;
        }

        // Emitir eventos
        emit ProofSubmitted(
            _week,
            _ipfsHash,
            _totalUsers,
            _totalCommissions,
            _totalProfits,
            msg.sender
        );

        emit BonusPoolUpdated(
            _week,
            previousBonusPoolBalance,
            bonusPoolAdded,
            _totalCommissions,
            finalBonusPoolBalance,
            poolDeficit
        );
    }

    /**
     * @notice Finalizar semana (marcar como paga)
     * @param _week Semana a ser finalizada
     */
    function finalizeWeek(uint256 _week) external onlyAuthorized {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProofV2: proof does not exist"
        );
        require(
            !weeklyProofs[_week].finalized,
            "iDeepXProofV2: already finalized"
        );

        weeklyProofs[_week].finalized = true;

        emit ProofFinalized(_week, msg.sender);
    }

    // ==================== VIEW FUNCTIONS (Existentes) ====================

    /**
     * @notice Buscar prova de uma semana específica
     */
    function getWeeklyProof(uint256 _week)
        external
        view
        returns (WeeklyProof memory)
    {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProofV2: proof not found"
        );
        return weeklyProofs[_week];
    }

    /**
     * @notice Buscar todas as provas
     */
    function getAllProofs()
        external
        view
        returns (WeeklyProof[] memory)
    {
        WeeklyProof[] memory proofs = new WeeklyProof[](allWeeks.length);

        for (uint256 i = 0; i < allWeeks.length; i++) {
            proofs[i] = weeklyProofs[allWeeks[i]];
        }

        return proofs;
    }

    /**
     * @notice Buscar últimas N provas
     */
    function getLatestProofs(uint256 _count)
        external
        view
        returns (WeeklyProof[] memory)
    {
        require(_count > 0, "iDeepXProofV2: count must be > 0");

        uint256 totalWeeks = allWeeks.length;
        uint256 returnCount = _count > totalWeeks ? totalWeeks : _count;

        WeeklyProof[] memory proofs = new WeeklyProof[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            proofs[i] = weeklyProofs[allWeeks[totalWeeks - returnCount + i]];
        }

        return proofs;
    }

    /**
     * @notice Verificar se existe prova para uma semana
     */
    function hasProof(uint256 _week) external view returns (bool) {
        return bytes(weeklyProofs[_week].ipfsHash).length > 0;
    }

    /**
     * @notice Buscar informações do Rulebook vinculado
     */
    function getRulebookInfo()
        external
        view
        returns (
            address rulebookAddress,
            string memory ipfsCid,
            bytes32 contentHash,
            uint256 deployedAt
        )
    {
        return (
            address(rulebook),
            rulebook.ipfsCid(),
            rulebook.contentHash(),
            rulebook.deployedAt()
        );
    }

    /**
     * @notice Buscar estatísticas gerais
     */
    function getStatistics()
        external
        view
        returns (
            uint256 totalProofs,
            uint256 totalUsersAllTime,
            uint256 totalCommissionsAllTime,
            uint256 totalProfitsAllTime,
            uint256 totalFinalized
        )
    {
        totalProofs = allWeeks.length;

        for (uint256 i = 0; i < allWeeks.length; i++) {
            WeeklyProof memory proof = weeklyProofs[allWeeks[i]];
            totalUsersAllTime += proof.totalUsers;
            totalCommissionsAllTime += proof.totalCommissions;
            totalProfitsAllTime += proof.totalProfits;
            if (proof.finalized) {
                totalFinalized++;
            }
        }

        return (
            totalProofs,
            totalUsersAllTime,
            totalCommissionsAllTime,
            totalProfitsAllTime,
            totalFinalized
        );
    }

    /**
     * @notice Buscar lista de todas as semanas
     */
    function getAllWeeks() external view returns (uint256[] memory) {
        return allWeeks;
    }

    // ==================== VIEW FUNCTIONS (NOVAS - Bônus Pool) ====================

    /**
     * @notice Retorna o saldo atual do Bônus Pool
     * @return Saldo em cents
     */
    function getBonusPoolBalance() external view returns (uint256) {
        return totalBonusPoolBalance;
    }

    /**
     * @notice Retorna estatísticas completas do Bônus Pool
     * @return currentBalance Saldo atual do Pool
     * @return totalAdded Total histórico adicionado
     * @return totalDistributed Total histórico distribuído
     * @return totalDeficitsCovered Total de déficits cobertos
     * @return utilizationRate Taxa de utilização (base 10000 = 100.00%)
     * @return coverageRate Taxa de cobertura (base 10000 = 100.00%)
     */
    function getBonusPoolStats() external view returns (
        uint256 currentBalance,
        uint256 totalAdded,
        uint256 totalDistributed,
        uint256 totalDeficitsCovered,
        uint256 utilizationRate,
        uint256 coverageRate
    ) {
        currentBalance = totalBonusPoolBalance;
        totalAdded = totalHistoricalBonusPoolAdded;
        totalDistributed = totalHistoricalBonusPoolDistributed;
        totalDeficitsCovered = totalHistoricalDeficitsCovered;

        // Taxa de utilização = Total distribuído / Total adicionado
        if (totalAdded > 0) {
            utilizationRate = (totalDistributed * 10000) / totalAdded;
        } else {
            utilizationRate = 0;
        }

        // Taxa de cobertura = Total adicionado / Total distribuído
        if (totalDistributed > 0) {
            coverageRate = (totalAdded * 10000) / totalDistributed;
        } else {
            coverageRate = 10000; // 100% se ainda não distribuiu nada
        }

        return (
            currentBalance,
            totalAdded,
            totalDistributed,
            totalDeficitsCovered,
            utilizationRate,
            coverageRate
        );
    }

    /**
     * @notice Retorna análise de sustentabilidade do modelo
     * @return avgPerformanceFee Performance fee médio por semana
     * @return avgCommissionsPaid Comissões médias por semana
     * @return avgOperationalRevenue Receita operacional média por semana
     * @return avgPoolContribution Contribuição média ao Pool por semana
     * @return avgDeficit Déficit médio por semana
     * @return isSustainable Se o modelo é sustentável (perf. fee > comissões)
     */
    function getSustainabilityAnalysis() external view returns (
        uint256 avgPerformanceFee,
        uint256 avgCommissionsPaid,
        uint256 avgOperationalRevenue,
        uint256 avgPoolContribution,
        uint256 avgDeficit,
        bool isSustainable
    ) {
        uint256 totalWeeks = allWeeks.length;
        if (totalWeeks == 0) {
            return (0, 0, 0, 0, 0, true);
        }

        uint256 totalCommissions = 0;
        for (uint256 i = 0; i < totalWeeks; i++) {
            totalCommissions += weeklyProofs[allWeeks[i]].totalCommissions;
        }

        avgPerformanceFee = totalHistoricalPerformanceFees / totalWeeks;
        avgCommissionsPaid = totalCommissions / totalWeeks;
        avgOperationalRevenue = (totalHistoricalPerformanceFees * 15 / 100) / totalWeeks;
        avgPoolContribution = totalHistoricalBonusPoolAdded / totalWeeks;
        avgDeficit = totalHistoricalDeficitsCovered / totalWeeks;

        // Modelo é sustentável se performance fee > comissões
        isSustainable = avgPerformanceFee > avgCommissionsPaid;

        return (
            avgPerformanceFee,
            avgCommissionsPaid,
            avgOperationalRevenue,
            avgPoolContribution,
            avgDeficit,
            isSustainable
        );
    }

    /**
     * @notice Retorna as últimas N semanas com dados de Bônus Pool
     * @param _count Número de semanas a retornar
     */
    function getRecentBonusPoolData(uint256 _count) external view returns (
        uint256[] memory,
        uint256[] memory,
        uint256[] memory,
        uint256[] memory,
        uint256[] memory
    ) {
        require(_count > 0, "iDeepXProofV2: count must be > 0");

        uint256 totalWeeks = allWeeks.length;
        uint256 returnCount = _count > totalWeeks ? totalWeeks : _count;

        uint256[] memory weeksArray = new uint256[](returnCount);
        uint256[] memory addedArray = new uint256[](returnCount);
        uint256[] memory distributedArray = new uint256[](returnCount);
        uint256[] memory balancesArray = new uint256[](returnCount);
        uint256[] memory deficitsArray = new uint256[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            uint256 weekIndex = totalWeeks - returnCount + i;
            WeeklyProof memory proof = weeklyProofs[allWeeks[weekIndex]];

            weeksArray[i] = proof.weekTimestamp;
            addedArray[i] = proof.bonusPoolAdded;
            distributedArray[i] = proof.bonusPoolDistributed;
            balancesArray[i] = proof.bonusPoolRemaining;
            deficitsArray[i] = proof.poolDeficit;
        }

        return (weeksArray, addedArray, distributedArray, balancesArray, deficitsArray);
    }

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * @notice Transferir ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "iDeepXProofV2: zero address");
        require(_newOwner != owner, "iDeepXProofV2: same owner");

        address oldOwner = owner;
        owner = _newOwner;

        emit OwnershipTransferred(oldOwner, _newOwner);
    }

    /**
     * @notice Atualizar endereço do backend
     */
    function setBackend(address _newBackend) external onlyOwner {
        require(_newBackend != address(0), "iDeepXProofV2: zero address");

        address oldBackend = backend;
        backend = _newBackend;

        emit BackendUpdated(oldBackend, _newBackend);
    }

    /**
     * @notice Pausar contrato
     */
    function pause() external onlyOwner {
        paused = true;
        emit PauseStatusChanged(true);
    }

    /**
     * @notice Despausar contrato
     */
    function unpause() external onlyOwner {
        paused = false;
        emit PauseStatusChanged(false);
    }

    // ==================== UTILITY ====================

    /**
     * @notice Helper para gerar URL completo do IPFS
     */
    function getIPFSUrl(uint256 _week) external view returns (string memory) {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProofV2: proof not found"
        );

        return string(abi.encodePacked(
            "https://gateway.pinata.cloud/ipfs/",
            weeklyProofs[_week].ipfsHash
        ));
    }
}
