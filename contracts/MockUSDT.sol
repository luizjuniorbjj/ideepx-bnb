// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1 milhão de USDT
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USDT usa 6 decimals
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
