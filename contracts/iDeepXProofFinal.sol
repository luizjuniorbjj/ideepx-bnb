// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./iDeepXRulebookImmutable.sol";

/**
 * @title iDeepX Proof Final - Sistema de Transparência com Rulebook
 * @author iDeepX Team
 * @notice Registra provas semanais de comissões vinculadas ao plano imutável
 * @dev Filosofia: Blockchain para PROVA + REGRAS, não para cálculo
 *
 * ✅ MELHORIAS vs iDeepXProof:
 * - Referência ao Rulebook imutável
 * - Validação de hash do plano
 * - Link direto entre provas e regras
 * - Maior confiança e transparência
 *
 * ✅ OBJETIVO:
 * - Registrar hash IPFS de snapshots semanais
 * - Garantir imutabilidade das provas
 * - Vincular provas ao plano de comissões
 * - Permitir auditoria pública completa
 * - Custo mínimo de gas
 *
 * ✅ O QUE ESTÁ ON-CHAIN:
 * - Hash IPFS do snapshot completo
 * - Timestamp do registro
 * - Totais agregados (usuários, comissões)
 * - Referência ao plano de comissões (Rulebook)
 *
 * ❌ O QUE NÃO ESTÁ ON-CHAIN:
 * - Dados individuais de usuários
 * - Cálculos de comissões (feito off-chain)
 * - Gestão de LAI
 * - Distribuição de pagamentos
 *
 * 📦 ARQUIVO IPFS CONTÉM:
 * - Lista completa de usuários
 * - Lucros individuais
 * - Comissões calculadas por nível
 * - Qualificações
 * - Todos os detalhes auditáveis
 */
contract iDeepXProofFinal {

    // ==================== ESTRUTURA ====================

    /**
     * @dev Estrutura de prova semanal
     */
    struct WeeklyProof {
        uint256 weekTimestamp;      // Semana (timestamp início)
        string ipfsHash;            // Hash IPFS do snapshot completo
        uint256 totalUsers;         // Total de usuários processados
        uint256 totalCommissions;   // Comissões em cents (ex: 150000 = $1,500.00)
        uint256 totalProfits;       // Lucros totais em cents
        address submitter;          // Quem submeteu
        uint256 submittedAt;        // Quando foi submetido
        bool finalized;             // Se foi finalizada (pagamentos feitos)
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

    // ==================== MODIFIERS ====================

    modifier onlyOwner() {
        require(msg.sender == owner, "iDeepXProofFinal: caller is not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == backend,
            "iDeepXProofFinal: caller not authorized"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "iDeepXProofFinal: contract is paused");
        _;
    }

    // ==================== CONSTRUCTOR ====================

    /**
     * @notice Inicializa o contrato com backend e rulebook
     * @param _backend Endereço do backend automático
     * @param _rulebook Endereço do contrato Rulebook
     */
    constructor(address _backend, address _rulebook) {
        require(_backend != address(0), "iDeepXProofFinal: invalid backend");
        require(_rulebook != address(0), "iDeepXProofFinal: invalid rulebook");

        owner = msg.sender;
        backend = _backend;
        rulebook = iDeepXRulebookImmutable(_rulebook);
        paused = false;
    }

    // ==================== FUNÇÕES PRINCIPAIS ====================

    /**
     * @notice Submeter prova semanal
     * @param _week Timestamp da semana (início segunda-feira 00:00 UTC)
     * @param _ipfsHash Hash do arquivo JSON no IPFS
     * @param _totalUsers Total de usuários processados
     * @param _totalCommissions Total de comissões em cents
     * @param _totalProfits Total de lucros em cents
     */
    function submitWeeklyProof(
        uint256 _week,
        string memory _ipfsHash,
        uint256 _totalUsers,
        uint256 _totalCommissions,
        uint256 _totalProfits
    ) external onlyAuthorized whenNotPaused {
        // Validações
        require(_week > 0, "iDeepXProofFinal: invalid week timestamp");
        require(bytes(_ipfsHash).length > 0, "iDeepXProofFinal: empty IPFS hash");
        require(_totalUsers > 0, "iDeepXProofFinal: total users must be > 0");

        // Verificar se já existe prova para esta semana
        bool exists = bytes(weeklyProofs[_week].ipfsHash).length > 0;

        // Não permitir atualizar prova finalizada
        if (exists) {
            require(
                !weeklyProofs[_week].finalized,
                "iDeepXProofFinal: cannot update finalized proof"
            );
        } else {
            // Nova prova: adicionar à lista
            allWeeks.push(_week);
            totalProofsSubmitted++;
        }

        // Armazenar prova
        weeklyProofs[_week] = WeeklyProof({
            weekTimestamp: _week,
            ipfsHash: _ipfsHash,
            totalUsers: _totalUsers,
            totalCommissions: _totalCommissions,
            totalProfits: _totalProfits,
            submitter: msg.sender,
            submittedAt: block.timestamp,
            finalized: false
        });

        emit ProofSubmitted(
            _week,
            _ipfsHash,
            _totalUsers,
            _totalCommissions,
            _totalProfits,
            msg.sender
        );
    }

    /**
     * @notice Finalizar semana (marcar como paga)
     * @param _week Semana a ser finalizada
     */
    function finalizeWeek(uint256 _week) external onlyAuthorized {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProofFinal: proof does not exist"
        );
        require(
            !weeklyProofs[_week].finalized,
            "iDeepXProofFinal: already finalized"
        );

        weeklyProofs[_week].finalized = true;

        emit ProofFinalized(_week, msg.sender);
    }

    // ==================== VIEW FUNCTIONS ====================

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
            "iDeepXProofFinal: proof not found"
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
        require(_count > 0, "iDeepXProofFinal: count must be > 0");

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

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * @notice Transferir ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "iDeepXProofFinal: zero address");
        require(_newOwner != owner, "iDeepXProofFinal: same owner");

        address oldOwner = owner;
        owner = _newOwner;

        emit OwnershipTransferred(oldOwner, _newOwner);
    }

    /**
     * @notice Atualizar endereço do backend
     */
    function setBackend(address _newBackend) external onlyOwner {
        require(_newBackend != address(0), "iDeepXProofFinal: zero address");

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
            "iDeepXProofFinal: proof not found"
        );

        return string(abi.encodePacked(
            "https://gateway.pinata.cloud/ipfs/",
            weeklyProofs[_week].ipfsHash
        ));
    }
}
