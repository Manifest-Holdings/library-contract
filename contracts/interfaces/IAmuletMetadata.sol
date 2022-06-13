//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.8;

import {IAmulet} from "./IAmulet.sol";

interface IAmuletMetadata {
    error InvalidTokenID();
    error NotEnoughPixelData();

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
