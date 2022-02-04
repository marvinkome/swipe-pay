// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestStable is ERC20 {
    // Decimals are set to 18 by default in `ERC20`
    constructor() ERC20("USDT", "USDT") {
        _mint(msg.sender, type(uint256).max);
    }
}
