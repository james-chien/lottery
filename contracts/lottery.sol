// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @dev This contract implements lottery logic.
 */
contract Lottery is AccessControl {
    using SafeMath for uint256;
    using Address for address;

    bytes32 public constant LOTTERY_ADMIN_ROLE = keccak256("LOTTERY_ADMIN_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    mapping(uint256 => uint256[]) private _results;

    /**
     * @dev Modifier to make a function callable only by a certain role.
     */
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, _msgSender()) || hasRole(role, address(0)), "Lottery: sender requires permission");
        _;
    }

    /**
     * @dev Emitted when lottery drew.
     */
    event LotteryDrew(uint256 indexed drawings, address indexed executor);

    /**
     * @dev Emitted when drew numbers.
     */
    event LotteryNumbers(uint256 indexed drawings, uint256 number1, uint256 number2, uint256 number3, uint256 number4);

    /**
     * @dev Sets the values for {executors}.
     */
    constructor (address[] memory executors) {
        _setRoleAdmin(LOTTERY_ADMIN_ROLE, LOTTERY_ADMIN_ROLE);
        _setRoleAdmin(EXECUTOR_ROLE, EXECUTOR_ROLE);

        // deployer + self administration
        _setupRole(LOTTERY_ADMIN_ROLE, _msgSender());
        _setupRole(LOTTERY_ADMIN_ROLE, address(this));

        // register executors
        for (uint256 i = 0; i < executors.length; ++i) {
            _setupRole(EXECUTOR_ROLE, executors[i]);
        }
    }

    /**
     * @dev Draw numbers.
     */
    function draw(uint256 drawings) public virtual {
        require(_results[drawings].length <= 4, "Already drew 4 times");

        // simply request each numnber here
        _requestRandomness(drawings);

        emit LotteryDrew(drawings, _msgSender());
    }

    /**
     * @dev Returns whether user is winner.
     */
    function isWinner(uint256 drawings, uint256[] memory numbers) public view virtual returns (bool) {
        require(_results[drawings].length == 4, "Not yet draw");

        uint256 matches = 0;

        for (uint256 i = 0; i < _results[drawings].length; i++) {
            if (_results[drawings][i] == numbers[i]) {
                matches = matches + 1;
            }
        }

        return (matches >= 3);
    }

    /**
     * @dev Returns whether user is winner.
     */
    function drawingNumbers(uint256 drawings) public view virtual returns (uint256[] memory) {
      require(_results[drawings].length == 4, "Not yet draw");

      return _results[drawings];
    }

    /**
     * @dev Draw numbers.
     * HK mark six max number: 49
     */
    function _fulfillRandomness(uint256 drawings, uint256 randomness) internal {
        uint256 number = randomness.mod(49).add(1);

        _results[drawings].push(number);

        if (_results[drawings].length == 4) {
            emit LotteryNumbers(drawings, _results[drawings][0], _results[drawings][1], _results[drawings][2], _results[drawings][3]);
        }
    }

    /**
     * @dev Request random numbers.
     * Call via oracle, but not implement here.
     */
    function _requestRandomness(uint256 drawings) internal {
        _fulfillRandomness(drawings, block.timestamp);
    }
}
