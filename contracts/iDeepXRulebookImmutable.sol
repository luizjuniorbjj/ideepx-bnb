// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title iDeepX Rulebook Immutable
 * @notice Armazena de forma IMUTÁVEL o plano de comissões MLM
 * @dev Contrato minimalista que referencia o plano de negócios no IPFS
 *
 * FILOSOFIA:
 * - Blockchain = TRANSPARÊNCIA, não cálculo
 * - Plano de comissões armazenado no IPFS (imutável)
 * - Content hash garante integridade do plano
 * - Uma vez deployed, NUNCA pode ser alterado
 *
 * PLANO DE NEGÓCIOS:
 * - Cliente recebe 65% do lucro líquido
 * - MLM recebe 25% do que o cliente recebeu (16.25% do total)
 * - Empresa fica com 35% (performance fee)
 *
 * ESTRUTURA MLM (10 níveis):
 * - L1: 8.0% (sobre os 65% do cliente)
 * - L2: 3.0%
 * - L3: 2.0%
 * - L4: 1.0%
 * - L5: 1.0%
 * - L6-L10: 2.0% cada (requer qualificação avançada)
 *
 * QUALIFICAÇÃO AVANÇADA (L6-L10):
 * - Mínimo 5 diretos ativos
 * - Volume mínimo $5.000/mês na rede
 *
 * LAI (Licença de Acesso Inteligente):
 * - $19/mês obrigatório
 * - Sem LAI = sem comissões
 */
contract iDeepXRulebookImmutable {

    // ============================================
    // ESTADO IMUTÁVEL
    // ============================================

    /// @notice CID do plano de comissões no IPFS
    /// @dev Formato: QmXxxx... (IPFS CID v0 ou v1)
    /// @dev Definido no construtor e nunca mais alterado (sem setter)
    string public ipfsCid;

    /// @notice Hash do conteúdo para verificação
    /// @dev keccak256 do JSON completo do plano
    bytes32 public immutable contentHash;

    /// @notice Timestamp do deploy
    /// @dev Marca quando o plano foi estabelecido
    uint256 public immutable deployedAt;

    /// @notice Versão do plano
    /// @dev Permite múltiplas versões imutáveis (v1, v2, etc)
    string public constant VERSION = "1.0.0";

    /// @notice Nome do plano
    string public constant PLAN_NAME = "iDeepX MLM Commission Plan";

    /// @notice Gateway IPFS padrão
    string public constant IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

    // ============================================
    // EVENTOS
    // ============================================

    /// @notice Emitido quando o contrato é deployed
    /// @param ipfsCid CID do plano no IPFS
    /// @param contentHash Hash do conteúdo
    /// @param timestamp Quando foi deployed
    event RulebookDeployed(
        string ipfsCid,
        bytes32 contentHash,
        uint256 timestamp
    );

    /// @notice Emitido quando alguém verifica o plano
    /// @param verifier Endereço que verificou
    /// @param timestamp Quando verificou
    event PlanVerified(
        address indexed verifier,
        uint256 timestamp
    );

    // ============================================
    // CONSTRUTOR
    // ============================================

    /**
     * @notice Cria uma versão imutável do plano de comissões
     * @param _ipfsCid CID do JSON no IPFS (ex: QmXxxx...)
     * @param _contentHash keccak256 do JSON para verificação
     *
     * @dev Uma vez deployed, este contrato NUNCA pode ser alterado
     * @dev Para mudar o plano, precisa fazer deploy de novo contrato
     */
    constructor(
        string memory _ipfsCid,
        bytes32 _contentHash
    ) {
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(_contentHash != bytes32(0), "Content hash cannot be zero");

        ipfsCid = _ipfsCid;
        contentHash = _contentHash;
        deployedAt = block.timestamp;

        emit RulebookDeployed(_ipfsCid, _contentHash, block.timestamp);
    }

    // ============================================
    // FUNÇÕES DE LEITURA
    // ============================================

    /**
     * @notice Retorna URL completa do plano no IPFS
     * @return URL completa (gateway + CID)
     */
    function getIPFSUrl() external view returns (string memory) {
        return string(abi.encodePacked(IPFS_GATEWAY, ipfsCid));
    }

    /**
     * @notice Verifica se um hash corresponde ao plano armazenado
     * @param _hash Hash para verificar
     * @return true se corresponde, false caso contrário
     *
     * @dev Permite validar se um JSON local corresponde ao on-chain
     * @dev Uso: keccak256(abi.encodePacked(jsonString))
     */
    function verifyContentHash(bytes32 _hash) external returns (bool) {
        bool isValid = (_hash == contentHash);

        if (isValid) {
            emit PlanVerified(msg.sender, block.timestamp);
        }

        return isValid;
    }

    /**
     * @notice Retorna informações completas do plano
     * @return _ipfsCid CID do plano no IPFS
     * @return _contentHash Hash do conteúdo
     * @return _deployedAt Timestamp do deploy
     * @return _version Versão do plano
     * @return _planName Nome do plano
     * @return _ipfsUrl URL completa do IPFS
     */
    function getPlanInfo() external view returns (
        string memory _ipfsCid,
        bytes32 _contentHash,
        uint256 _deployedAt,
        string memory _version,
        string memory _planName,
        string memory _ipfsUrl
    ) {
        return (
            ipfsCid,
            contentHash,
            deployedAt,
            VERSION,
            PLAN_NAME,
            string(abi.encodePacked(IPFS_GATEWAY, ipfsCid))
        );
    }

    /**
     * @notice Retorna idade do plano em dias
     * @return Número de dias desde o deploy
     */
    function getPlanAgeInDays() external view returns (uint256) {
        return (block.timestamp - deployedAt) / 1 days;
    }

    /**
     * @notice Verifica se o plano ainda é válido (< 2 anos)
     * @return true se válido, false se muito antigo
     *
     * @dev Planos muito antigos podem precisar de atualização
     * @dev Isso NÃO invalida o contrato, apenas avisa
     */
    function isPlanCurrent() external view returns (bool) {
        uint256 maxAge = 730 days; // 2 anos
        return (block.timestamp - deployedAt) < maxAge;
    }
}
