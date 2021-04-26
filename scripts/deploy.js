// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log('Network:', network.name);
  console.log('Account balance:', ethers.utils.formatEther((await deployer.getBalance())));

  const Lottery = await ethers.getContractFactory('Lottery');

  const lottery = await Lottery.deploy([await deployer.getAddress()]);
  await lottery.deployed();

  console.log('Lottery address:', lottery.address);


  const LotteryProxyAdmin = await ethers.getContractFactory('LotteryProxyAdmin');

  const lotteryProxyAdmin = await LotteryProxyAdmin.deploy();
  await lotteryProxyAdmin.deployed();

  console.log('LotteryProxyAdmin address:', lotteryProxyAdmin.address);


  const LotteryUpgradeableProxy = await ethers.getContractFactory('LotteryUpgradeableProxy');

  const initializeData = Buffer.from('');
  const lotteryUpgradeableProxy = await LotteryUpgradeableProxy.deploy(lottery.address, lotteryProxyAdmin.address, initializeData);
  await lotteryUpgradeableProxy.deployed();

  console.log('LotteryUpgradeableProxy address:', lotteryUpgradeableProxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
