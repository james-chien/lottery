/**
 * When Hardhat is run, it searches for the closest hardhat.config.js file
 * starting from the Current Working Directory.
 */

 const fs = require('fs');
 const path = require('path');
 const argv = require('yargs/yargs')()
   .env('')
   .boolean('enableGasReport')
   .boolean('ci')
   .string('compileMode')
   .argv;

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");
require('solidity-coverage');

if (argv.enableGasReport) {
  require('hardhat-gas-reporter');
}

// get from Ganache
const privKey = '60e1a88fc1f317e54b88d55a81122358739da1abd45aeae2f366572dd4809607';

// It imports a Hardhat task definition, that can be used for
// testing.
// require('./tasks/faucet');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
   solidity: {
     version: '0.8.3',
     settings: {
       optimizer: {
         enabled: (argv.enableGasReport || argv.compileMode === 'production'),
         runs: 200,
       },
     },
   },
   networks: {
     hardhat: {
       blockGasLimit: 10000000,
     },
     ropsten: {
       url: 'https://eth-ropsten.alchemyapi.io/v2/xPdevR7gRNJrl83Fh7ZV2oA177AbABIH',
       accounts: [privKey],
     },
   },
   gasReporter: {
     currency: 'USD',
     outputFile: argv.ci ? 'gas-report.txt' : undefined,
   },
   etherscan: {
     apiKey: 'RW6CFAMWJUE4S645YEWZRXZBQNGMUIICEY',
   },
};
