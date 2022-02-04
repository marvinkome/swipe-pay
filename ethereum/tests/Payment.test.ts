import { expect } from "./setup";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("Payment", () => {
  let deployer: Signer;
  let customer: Signer;
  let seller: Signer;

  let payment: Contract;
  let stableCoin: Contract;

  before(async () => {
    [deployer, customer, seller] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const PaymentFactory = await ethers.getContractFactory("Payment");
    const CoinFactory = await ethers.getContractFactory("TestStable");

    payment = await PaymentFactory.connect(deployer).deploy();
    stableCoin = await CoinFactory.connect(customer).deploy();

    await payment.deployTransaction.wait();
    await stableCoin.deployTransaction.wait();
  });

  it("deploys contract", async () => {
    expect(payment.address).to.exist;
    expect(stableCoin.address).to.exist;

    const customerBalance = await stableCoin.balanceOf(await customer.getAddress());
    expect(ethers.utils.formatUnits(customerBalance, 18)).to.not.eq("0");
  });

  describe("Make payments", () => {
    it("can pay with a stable coin", async () => {
      const amount = "100.0"; // we are paying the seller $100

      // customer approve contract to spend amount
      const approveTx = await stableCoin.connect(customer).increaseAllowance(payment.address, ethers.utils.parseUnits(amount, 18));
      await approveTx.wait();

      // customer make payment
      const sellerAddress = await seller.getAddress();
      const paymentTx = await payment
        .connect(customer)
        .receivePayment(stableCoin.address, sellerAddress, ethers.utils.parseUnits(amount, 18));
      await paymentTx.wait();

      // check balance of contract
      const contractBalance = await stableCoin.balanceOf(payment.address);
      expect(ethers.utils.formatUnits(contractBalance, 18)).to.eq(amount);

      // customer make payment which should fail because of no allowance
      const badPaymentTx = payment.connect(customer).receivePayment(stableCoin.address, sellerAddress, ethers.utils.parseUnits(amount, 18));
      // @ts-ignore
      await expect(badPaymentTx).to.be.rejected;
    });

    it("can pay with a stable coin - with a deposit fee", async () => {
      const amount = "100.0"; // we are paying the seller $100

      // set deposit fee and fee address
      const deployAddress = await deployer.getAddress();
      await payment.setDepositFee(100); // 1%
      await payment.setFeeAddress(deployAddress); // 1%

      // customer approve contract to spend amount
      const approveTx = await stableCoin.connect(customer).increaseAllowance(payment.address, ethers.utils.parseUnits(amount, 18));
      await approveTx.wait();

      // customer make payment
      const sellerAddress = await seller.getAddress();
      const paymentTx = await payment
        .connect(customer)
        .receivePayment(stableCoin.address, sellerAddress, ethers.utils.parseUnits(amount, 18));
      await paymentTx.wait();

      // check balance of contract
      const contractBalance = await stableCoin.balanceOf(payment.address);
      const deployerBalance = await stableCoin.balanceOf(deployAddress);

      expect(ethers.utils.formatUnits(contractBalance, 18)).to.eq("90.0");
      expect(ethers.utils.formatUnits(deployerBalance, 18)).to.eq("10.0");
    });
  });

  describe("Make withdrawers", () => {
    it("can't withdraw without funds", async () => {
      const sellerAddress = await seller.getAddress();
      const withdrawTx = payment.connect(deployer).withdrawFunds(sellerAddress, stableCoin.address, ethers.utils.parseUnits("10", 18));

      // @ts-ignore
      await expect(withdrawTx).to.be.rejected;
    });

    it("can withdraw stable coin", async () => {
      const amount = "100.0"; // we are paying the seller $100

      // customer approve contract to spend amount
      const approveTx = await stableCoin.connect(customer).increaseAllowance(payment.address, ethers.utils.parseUnits(amount, 18));
      await approveTx.wait();

      // customer make payment
      const sellerAddress = await seller.getAddress();
      const paymentTx = await payment
        .connect(customer)
        .receivePayment(stableCoin.address, sellerAddress, ethers.utils.parseUnits(amount, 18));
      await paymentTx.wait();

      // send funds to withdrawer address
      const withdrawTx = await payment.connect(deployer).withdrawFunds(sellerAddress, stableCoin.address);
      await withdrawTx.wait();

      // check balance of contract
      const contractBalance = await stableCoin.balanceOf(payment.address);
      expect(ethers.utils.formatUnits(contractBalance, 18)).to.eq("0.0");

      // check balance of seller
      const sellerBalance = await stableCoin.balanceOf(sellerAddress);
      expect(ethers.utils.formatUnits(sellerBalance, 18)).to.eq("100.0");
    });

    it("can withdraw stable coin - with deposit fees", async () => {
      const amount = "100.0"; // we are paying the seller $100

      // set deposit fee and fee address
      const deployAddress = await deployer.getAddress();
      await payment.setDepositFee(100); // 1%
      await payment.setFeeAddress(deployAddress); // 1%

      // customer approve contract to spend amount
      const approveTx = await stableCoin.connect(customer).increaseAllowance(payment.address, ethers.utils.parseUnits(amount, 18));
      await approveTx.wait();

      // customer make payment
      const sellerAddress = await seller.getAddress();
      const paymentTx = await payment
        .connect(customer)
        .receivePayment(stableCoin.address, sellerAddress, ethers.utils.parseUnits(amount, 18));
      await paymentTx.wait();

      // send funds to withdrawer address
      const withdrawTx = await payment.connect(deployer).withdrawFunds(sellerAddress, stableCoin.address);
      await withdrawTx.wait();

      // check balance of contract
      const contractBalance = await stableCoin.balanceOf(payment.address);
      expect(ethers.utils.formatUnits(contractBalance, 18)).to.eq("0.0");

      // check balance of contract
      const deployerBalance = await stableCoin.balanceOf(deployAddress);
      expect(ethers.utils.formatUnits(deployerBalance, 18)).to.eq("10.0");

      // check balance of seller
      const sellerBalance = await stableCoin.balanceOf(sellerAddress);
      expect(ethers.utils.formatUnits(sellerBalance, 18)).to.eq("90.0");
    });
  });
});
