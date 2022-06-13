//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IAmulet is IERC721 {
    function useOffchainMetadata(uint256) external view returns (bool);
}
