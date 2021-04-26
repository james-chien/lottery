/**
 * This file is only here to make interacting with the Dapp easier,
 * feel free to ignore it if you don't need it.
 */

 task('faucet', 'Sends ETH and tokens to an address')
   .addPositionalParam('receiver', 'The address that will receive them')
   .setAction(async ({ receiver }) => {
      if (network.name === 'hardhat') {
         console.warn(
           'You are running the faucet task with Hardhat network, which' +
           'gets automatically created and destroyed every time. Use the Hardhat' +
           " option '--network localhost'"
         );
      }

      // 
   });
