import { ethers } from "hardhat";
import { saveFrontendFiles } from "./helpers";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const SwipePayment = await ethers.getContractFactory("SwipePayment");
  const swipePayment = await SwipePayment.deploy();

  console.log("Contract address:", swipePayment.address);

  // transfer ownership
  await (await swipePayment.connect(deployer).setFeeAddress(deployer.address)).wait();
  await (await swipePayment.connect(deployer).setDepositFee("100")).wait(); // 1%

  const owner = await swipePayment.owner();
  console.log("Contract owner:", owner);

  // save frontend files
  saveFrontendFiles(swipePayment.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
