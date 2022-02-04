import fs from "fs";
import { artifacts } from "hardhat";

export function saveFrontendFiles(address: string) {
  const contractsDir = __dirname + "/../../src/abi";
  if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

  const { abi } = artifacts.readArtifactSync("SwipePayment");
  const { abi: erc20Abi } = artifacts.readArtifactSync("ERC20");

  fs.writeFileSync(
    contractsDir + "/SwipePayment.json",
    JSON.stringify(
      {
        address,
        abi,
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    contractsDir + "/ERC20.json",
    JSON.stringify(
      {
        abi: erc20Abi,
      },
      null,
      2
    )
  );
}
