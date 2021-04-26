// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @dev This is an lottery admin contract meant to be assigned as the admin of a {LotteryUpgradeableProxy}.
 */
contract LotteryProxyAdmin is ProxyAdmin {
    /**
     * @dev Initialize proxy admin.
     */
    constructor () {
        //
    }
}
