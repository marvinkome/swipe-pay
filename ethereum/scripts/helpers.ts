import fs from "fs";
import { artifacts } from "hardhat";

export function saveFrontendFiles(address: string) {
  const contractsDir = __dirname + "/../../src/abi";
  if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

  const { abi } = artifacts.readArtifactSync("SwipePayment");

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
}
