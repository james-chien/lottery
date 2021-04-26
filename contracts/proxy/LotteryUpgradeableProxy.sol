// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/**
 * @dev This contract implements a proxy that is upgradeable by an admin.
 */
contract LotteryUpgradeableProxy is TransparentUpgradeableProxy {
    constructor (address _logic, address admin_, bytes memory _data) payable TransparentUpgradeableProxy(_logic, admin_, _data) {
        // only inherit
    }
}
