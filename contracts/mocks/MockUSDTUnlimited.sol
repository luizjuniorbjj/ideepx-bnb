// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockUSDTUnlimited
 * @dev Mock USDT com mint ILIMITADO para testes
 *
 * ⚠️ APENAS PARA TESTNET! NUNCA USE EM PRODUÇÃO!
 *
 * Recursos especiais:
 * - Qualquer um pode fazer mint
 * - getFreeTokens() dá $10k grátis
 * - Admin pode mintar $10M para testes
 * - Sem custos, 100% grátis!
 */
contract MockUSDTUnlimited {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    string public name = "Mock USDT Unlimited (TEST ONLY)";
    string public symbol = "USDT";
    uint8 public decimals = 6;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event FreeMint(address indexed to, uint256 amount);

    /**
     * @dev Mint para qualquer endereço (usado pelo bot)
     */
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Mint para si mesmo (conveniente)
     */
    function mintToMe(uint256 amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    /**
     * @dev Pegar $10,000 USDT grátis! 🎁
     * Qualquer um pode chamar essa função
     */
    function getFreeTokens() external {
        uint256 amount = 10000 * 10**6; // $10k USDT
        balanceOf[msg.sender] += amount;
        totalSupply += amount;

        emit FreeMint(msg.sender, amount);
        emit Transfer(address(0), msg.sender, amount);
    }

    /**
     * @dev Transferir tokens
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Aprovar spender
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer from
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(balanceOf[from] >= amount, "Insufficient balance");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Burn tokens (para completude)
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
