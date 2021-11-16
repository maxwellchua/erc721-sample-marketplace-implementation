// contracts/Collectible.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.5;

interface IMarket {
    function putOnSaleInitial(
        uint256 price,
        bool isAuction,
        uint256 startTime,
        uint256 endTime
    ) external;
}
