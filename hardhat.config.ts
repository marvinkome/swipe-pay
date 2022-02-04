require("dotenv").config({ path: ".env.local" });
import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

const config: HardhatUserConfig = {
  solidity: "0.8.2",

  paths: {
    root: "./ethereum",
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    rinkeby: {
      url: process.env.INFURA_RINKEBY,
      accounts: {
        mnemonic: process.env.mnemonic || "",
      },
    },
    polygon: {
      url: process.env.INFURA_POLYGON,
      accounts: {
        mnemonic: process.env.mnemonic || "",
      },
    },
    mumbai: {
      url: process.env.INFURA_MUMBAI,
      accounts: {
        mnemonic: process.env.mnemonic || "",
      },
    },
  },
};

export default config;
