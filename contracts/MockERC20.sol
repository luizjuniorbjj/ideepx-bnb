// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev Token ERC20 de teste para simular o iDeepX durante os testes
 * @notice Este contrato é APENAS para testes locais, não fazer deploy em produção
 */
contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Função de mint para facilitar testes
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
