// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.8;

import {ERC721A} from "erc721a/contracts/ERC721A.sol";

contract WritePassMock is ERC721A {
    /* --------------------------------- ****** --------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                               INITIALIZATION                               */
    /* -------------------------------------------------------------------------- */
    constructor() ERC721A("WritePassMock", "WritePassMock") {}

    /* -------------------------------------------------------------------------- */
    /*                                  RENDERER                                  */
    /* -------------------------------------------------------------------------- */

    /* --------------------------------- PUBLIC --------------------------------- */
    /// @notice Mint your Amulet.
    function mint() external {
        _safeMint(msg.sender, 1);
    }

    /* --------------------------------- ****** --------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                                   ERC721A                                  */
    /* -------------------------------------------------------------------------- */
    /* -------------------------------- INTERNAL -------------------------------- */
    /// @notice ERC721A override to start tokenId's at 1 instead of 0.
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /* --------------------------------- ****** --------------------------------- */
}
