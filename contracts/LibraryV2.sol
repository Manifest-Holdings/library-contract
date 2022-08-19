// SPDX-License-Identifier: Unlicense

/*
Library.sol
This contract is a gas efficient way to store a collection stories, lore, passages etc on the blockchain.  
Publishing to this collection can be token gated OR access listed.

*/

pragma solidity ^0.8.1;

import "./Library.sol";

contract LibraryV2 is Library {
    function version() public pure returns (string memory) {
        return "2.0.0";
    }
}
