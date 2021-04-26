const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const { ZERO_ADDRESS } = constants;

const Lottery = artifacts.require('Lottery');
const LotteryProxyAdmin = artifacts.require('LotteryProxyAdmin');
const LotteryUpgradeableProxy = artifacts.require('LotteryUpgradeableProxy');

describe('Lottery', function () {
  let deployer; // 😎
  let thor;     // ⛈
  let batman;   // 🦇
  let superman; // 🕵️‍♂️
  let ironMan;  // 🤖

  before(async function () {
    [ deployer, thor, batman, superman, ironMan ] = await ethers.getSigners();

    this.lottery = await Lottery.new([deployer.address], { from: deployer.address });
    this.lotteryV2 = await Lottery.new([thor.address], { from: deployer.address });
  });

  beforeEach(async function () {
    const initializeData = Buffer.from('');

    this.lotteryProxyAdmin = await LotteryProxyAdmin.new({ from: deployer.address });
    this.lotteryUpgradeableProxy = await LotteryUpgradeableProxy.new(
      this.lottery.address,
      this.lotteryProxyAdmin.address,
      initializeData,
      { from: deployer.address }
    );
  });

  it('has an owner', async function () {
    expect(await this.lotteryProxyAdmin.owner()).to.equal(deployer.address);
  });

  describe('getProxyAdmin', function () {
    it('returns proxyAdmin as admin of the proxy', async function () {
      const admin = await this.lotteryProxyAdmin.getProxyAdmin(this.lotteryUpgradeableProxy.address);
      expect(admin).to.be.equal(this.lotteryProxyAdmin.address);
    });

    it('call to invalid proxy', async function () {
      await expectRevert.unspecified(this.lotteryProxyAdmin.getProxyAdmin(this.lottery.address));
    });
  });

  describe('changeProxyAdmin', function () {
    it('fails to change proxy admin if its not the proxy owner', async function () {
      await expectRevert(
        this.lotteryProxyAdmin.changeProxyAdmin(this.lotteryUpgradeableProxy.address, thor.address, { from: thor.address }),
        'caller is not the owner',
      );
    });

    it('changes proxy admin', async function () {
      await this.lotteryProxyAdmin.changeProxyAdmin(this.lotteryUpgradeableProxy.address, thor.address, { from: deployer.address });
      expect(await this.lotteryUpgradeableProxy.admin.call({ from: thor.address })).to.eq(thor.address);
    });
  });

  describe('getProxyImplementation', function () {
    it('returns proxy implementation address', async function () {
      const implementationAddress = await this.lotteryProxyAdmin.getProxyImplementation(this.lotteryUpgradeableProxy.address);
      expect(implementationAddress).to.be.equal(this.lottery.address);
    });

    it('call to invalid proxy', async function () {
      await expectRevert.unspecified(this.lotteryProxyAdmin.getProxyImplementation(this.lottery.address));
    });
  });

  describe('upgrade', function () {
    context('with unauthorized account', function () {
      it('fails to upgrade', async function () {
        await expectRevert(
          this.lotteryProxyAdmin.upgrade(this.lotteryUpgradeableProxy.address, this.lotteryV2.address, { from: thor.address }),
          'caller is not the owner',
        );
      });
    });

    context('with authorized account', function () {
      it('upgrades implementation', async function () {
        await this.lotteryProxyAdmin.upgrade(this.lotteryUpgradeableProxy.address, this.lotteryV2.address, { from: deployer.address });
        const implementationAddress = await this.lotteryProxyAdmin.getProxyImplementation(this.lotteryUpgradeableProxy.address);
        expect(implementationAddress).to.be.equal(this.lotteryV2.address);
      });
    });
  });

  describe('upgradeAndCall', function () {
    context('with invalid callData', function () {
      it('fails to upgrade', async function () {
        const callData = '0x12345678';
        await expectRevert.unspecified(
          this.lotteryProxyAdmin.upgradeAndCall(this.lotteryUpgradeableProxy.address, this.lotteryV2.address, callData,
            { from: deployer.address },
          ),
        );
      });
    });

    context('with valid callData', function () {
      it('upgrades implementation', async function () {
        const EXECUTOR_ROLE = web3.utils.soliditySha3('EXECUTOR_ROLE');
        const callData = new Lottery('').contract.methods.hasRole(EXECUTOR_ROLE, deployer.address).encodeABI();
        await this.lotteryProxyAdmin.upgradeAndCall(this.lotteryUpgradeableProxy.address, this.lotteryV2.address, callData,
          { from: deployer.address },
        );
        const implementationAddress = await this.lotteryProxyAdmin.getProxyImplementation(this.lotteryUpgradeableProxy.address);
        expect(implementationAddress).to.be.equal(this.lotteryV2.address);
      });
    });
  });

  describe('draw lottery', function () {
    beforeEach(async function () {
      this.lotteryProxy = new Lottery(this.lotteryUpgradeableProxy.address);

      await this.lotteryProxy.draw(new BN('1'), { from: deployer.address });
      await this.lotteryProxy.draw(new BN('1'), { from: deployer.address });
      await this.lotteryProxy.draw(new BN('1'), { from: deployer.address });
      await this.lotteryProxy.draw(new BN('1'), { from: deployer.address });
    });

    it('can draw numbers', async function () {
      expect(await this.lotteryProxy.drawingNumbers(new BN('1'))).to.have.length(4);
    });

    it('has correct drawing numbers', async function () {
      const drawingNumbers = (await this.lotteryProxy.drawingNumbers(new BN('1')));
      expect(drawingNumbers[0]).to.be.bignumber.equal(drawingNumbers[0].toString());
    });

    it('has correct winner', async function () {
      const drawingNumbers = (await this.lotteryProxy.drawingNumbers(new BN('1')));
      const isWinner = (await this.lotteryProxy.isWinner(new BN('1'), drawingNumbers));
      
      expect(isWinner).to.be.true;
    });
  });
});
