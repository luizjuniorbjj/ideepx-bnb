// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title iDeepX Proof - Sistema Minimalista de Transparência
 * @author iDeepX Team
 * @notice Contrato SIMPLES para registrar provas semanais de comissões
 * @dev Filosofia: Blockchain para PROVA, não para cálculo
 * 
 * ✅ OBJETIVO:
 * - Registrar hash IPFS de snapshots semanais
 * - Garantir imutabilidade das provas
 * - Permitir auditoria pública
 * - Custo mínimo de gas
 * 
 * ✅ O QUE ESTÁ ON-CHAIN:
 * - Hash IPFS do snapshot completo
 * - Timestamp do registro
 * - Totais agregados (usuários, comissões)
 * 
 * ❌ O QUE NÃO ESTÁ ON-CHAIN:
 * - Dados individuais de usuários
 * - Cálculos de comissões
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

contract iDeepXProof {
    
    // ==================== ESTRUTURA ====================
    
    /**
     * @dev Estrutura de prova semanal
     * @param weekTimestamp Timestamp do início da semana (segunda-feira 00:00 UTC)
     * @param ipfsHash Hash do arquivo JSON no IPFS (QmXxx...)
     * @param totalUsers Total de usuários processados naquela semana
     * @param totalCommissions Total de comissões distribuídas (em centavos USD)
     * @param totalProfits Total de lucros da rede (em centavos USD)
     * @param submitter Endereço que submeteu a prova
     * @param submittedAt Timestamp de quando foi submetido
     */
    struct WeeklyProof {
        uint256 weekTimestamp;      // Semana (timestamp início)
        string ipfsHash;            // Hash IPFS do snapshot completo
        uint256 totalUsers;         // Total de usuários processados
        uint256 totalCommissions;   // Comissões em cents (ex: 150000 = $1,500.00)
        uint256 totalProfits;       // Lucros totais em cents
        address submitter;          // Quem submeteu
        uint256 submittedAt;        // Quando foi submetido
        bool verified;              // Flag de verificação extra (futuro)
    }
    
    // ==================== STATE VARIABLES ====================
    
    /// @notice Endereço do proprietário (pode submeter provas)
    address public owner;
    
    /// @notice Endereço do backend automático (pode submeter provas)
    address public backend;
    
    /// @notice Mapeamento de semana => prova
    mapping(uint256 => WeeklyProof) public weeklyProofs;
    
    /// @notice Array de todas as semanas registradas (para iteração)
    uint256[] public allWeeks;
    
    /// @notice Contador de provas submetidas
    uint256 public totalProofsSubmitted;
    
    /// @notice Flag de pause para emergências
    bool public paused;
    
    // ==================== EVENTOS ====================
    
    /**
     * @dev Emitido quando uma nova prova é submetida
     */
    event ProofSubmitted(
        uint256 indexed week,
        string ipfsHash,
        uint256 totalUsers,
        uint256 totalCommissions,
        uint256 totalProfits,
        address indexed submitter
    );
    
    /**
     * @dev Emitido quando uma prova é atualizada (correção)
     */
    event ProofUpdated(
        uint256 indexed week,
        string oldIpfsHash,
        string newIpfsHash,
        address indexed updater
    );
    
    /**
     * @dev Emitido quando ownership é transferido
     */
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    
    /**
     * @dev Emitido quando backend é atualizado
     */
    event BackendUpdated(
        address indexed previousBackend,
        address indexed newBackend
    );
    
    /**
     * @dev Emitido quando contrato é pausado/despausado
     */
    event PauseStatusChanged(bool isPaused);
    
    // ==================== MODIFIERS ====================
    
    /**
     * @dev Apenas owner pode executar
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "iDeepXProof: caller is not owner");
        _;
    }
    
    /**
     * @dev Apenas owner ou backend podem executar
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == backend,
            "iDeepXProof: caller not authorized"
        );
        _;
    }
    
    /**
     * @dev Verifica se contrato não está pausado
     */
    modifier whenNotPaused() {
        require(!paused, "iDeepXProof: contract is paused");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    /**
     * @notice Inicializa o contrato
     * @param _backend Endereço do backend automático
     */
    constructor(address _backend) {
        require(_backend != address(0), "iDeepXProof: invalid backend address");
        owner = msg.sender;
        backend = _backend;
        paused = false;
    }
    
    // ==================== FUNÇÕES PRINCIPAIS ====================
    
    /**
     * @notice Submeter prova semanal
     * @dev Apenas owner ou backend podem chamar
     * @param _week Timestamp da semana (início segunda-feira 00:00 UTC)
     * @param _ipfsHash Hash do arquivo JSON no IPFS (ex: "QmXxx...")
     * @param _totalUsers Total de usuários processados
     * @param _totalCommissions Total de comissões em cents (ex: 150000 = $1,500.00)
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
        require(_week > 0, "iDeepXProof: invalid week timestamp");
        require(bytes(_ipfsHash).length > 0, "iDeepXProof: empty IPFS hash");
        require(_totalUsers > 0, "iDeepXProof: total users must be > 0");
        
        // Verificar se já existe prova para esta semana
        bool isUpdate = bytes(weeklyProofs[_week].ipfsHash).length > 0;
        
        if (isUpdate) {
            // Atualização: emitir evento diferente
            emit ProofUpdated(
                _week,
                weeklyProofs[_week].ipfsHash,
                _ipfsHash,
                msg.sender
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
            verified: false
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
     * @notice Marcar prova como verificada (após audit externo, por exemplo)
     * @param _week Semana a ser verificada
     */
    function verifyProof(uint256 _week) external onlyOwner {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProof: proof does not exist"
        );
        weeklyProofs[_week].verified = true;
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @notice Buscar prova de uma semana específica
     * @param _week Timestamp da semana
     * @return Estrutura WeeklyProof completa
     */
    function getWeeklyProof(uint256 _week) 
        external 
        view 
        returns (WeeklyProof memory) 
    {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProof: proof not found for this week"
        );
        return weeklyProofs[_week];
    }
    
    /**
     * @notice Buscar todas as provas (histórico completo)
     * @return Array de todas as provas
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
     * @notice Buscar provas de um intervalo específico
     * @param _fromWeek Timestamp da semana inicial
     * @param _toWeek Timestamp da semana final
     * @return Array de provas no intervalo
     */
    function getProofsByRange(uint256 _fromWeek, uint256 _toWeek)
        external
        view
        returns (WeeklyProof[] memory)
    {
        require(_fromWeek <= _toWeek, "iDeepXProof: invalid range");
        
        // Contar quantas provas existem no range
        uint256 count = 0;
        for (uint256 i = 0; i < allWeeks.length; i++) {
            if (allWeeks[i] >= _fromWeek && allWeeks[i] <= _toWeek) {
                count++;
            }
        }
        
        // Preencher array
        WeeklyProof[] memory proofs = new WeeklyProof[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allWeeks.length; i++) {
            if (allWeeks[i] >= _fromWeek && allWeeks[i] <= _toWeek) {
                proofs[index] = weeklyProofs[allWeeks[i]];
                index++;
            }
        }
        
        return proofs;
    }
    
    /**
     * @notice Buscar últimas N provas
     * @param _count Quantidade de provas a retornar
     * @return Array das últimas N provas
     */
    function getLatestProofs(uint256 _count)
        external
        view
        returns (WeeklyProof[] memory)
    {
        require(_count > 0, "iDeepXProof: count must be > 0");
        
        uint256 totalWeeks = allWeeks.length;
        uint256 returnCount = _count > totalWeeks ? totalWeeks : _count;
        
        WeeklyProof[] memory proofs = new WeeklyProof[](returnCount);
        
        // Pegar as últimas N provas (do final do array)
        for (uint256 i = 0; i < returnCount; i++) {
            proofs[i] = weeklyProofs[allWeeks[totalWeeks - returnCount + i]];
        }
        
        return proofs;
    }
    
    /**
     * @notice Verificar se existe prova para uma semana
     * @param _week Timestamp da semana
     * @return true se existe prova
     */
    function hasProof(uint256 _week) external view returns (bool) {
        return bytes(weeklyProofs[_week].ipfsHash).length > 0;
    }
    
    /**
     * @notice Buscar total de provas registradas
     * @return Número total de provas
     */
    function getTotalProofs() external view returns (uint256) {
        return allWeeks.length;
    }
    
    /**
     * @notice Buscar lista de todas as semanas com provas
     * @return Array de timestamps de semanas
     */
    function getAllWeeks() external view returns (uint256[] memory) {
        return allWeeks;
    }
    
    /**
     * @notice Buscar estatísticas gerais
     * @return totalProofs Total de provas
     * @return totalUsersAllTime Total acumulado de usuários
     * @return totalCommissionsAllTime Total acumulado de comissões
     * @return totalProfitsAllTime Total acumulado de lucros
     */
    function getStatistics() 
        external 
        view 
        returns (
            uint256 totalProofs,
            uint256 totalUsersAllTime,
            uint256 totalCommissionsAllTime,
            uint256 totalProfitsAllTime
        )
    {
        totalProofs = allWeeks.length;
        
        // Somar totais (não é a soma correta pois usuários se repetem,
        // mas serve como métrica)
        for (uint256 i = 0; i < allWeeks.length; i++) {
            WeeklyProof memory proof = weeklyProofs[allWeeks[i]];
            totalUsersAllTime += proof.totalUsers;
            totalCommissionsAllTime += proof.totalCommissions;
            totalProfitsAllTime += proof.totalProfits;
        }
        
        return (
            totalProofs,
            totalUsersAllTime,
            totalCommissionsAllTime,
            totalProfitsAllTime
        );
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @notice Transferir ownership
     * @param _newOwner Novo endereço do owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "iDeepXProof: new owner is zero address");
        require(_newOwner != owner, "iDeepXProof: new owner is same as current");
        
        address oldOwner = owner;
        owner = _newOwner;
        
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
    
    /**
     * @notice Atualizar endereço do backend
     * @param _newBackend Novo endereço do backend
     */
    function setBackend(address _newBackend) external onlyOwner {
        require(_newBackend != address(0), "iDeepXProof: backend is zero address");
        
        address oldBackend = backend;
        backend = _newBackend;
        
        emit BackendUpdated(oldBackend, _newBackend);
    }
    
    /**
     * @notice Pausar contrato (emergência)
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
     * @param _week Semana da prova
     * @return URL completo do IPFS
     */
    function getIPFSUrl(uint256 _week) external view returns (string memory) {
        require(
            bytes(weeklyProofs[_week].ipfsHash).length > 0,
            "iDeepXProof: proof not found"
        );
        
        return string(abi.encodePacked(
            "https://ipfs.io/ipfs/",
            weeklyProofs[_week].ipfsHash
        ));
    }
}
