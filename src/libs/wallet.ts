import { InjectedConnector } from "@web3-react/injected-connector";

export const TOKENS = [
  {
    symbol: "DAI",
    address: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    decimals: 18,
  },
  {
    symbol: "USDT",
    address: "0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02",
    decimals: 18,
  },
  {
    symbol: "USDC",
    address: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
    decimals: 6,
  },
];

export const injected = new InjectedConnector({
  supportedChainIds: [1, 4, 56, 97], // todo:: add more selected chain IDs
});

export async function switchNetwork() {
  const { ethereum } = global as any;
  if (!ethereum) {
    console.log("MetaMask extension not available");
    return;
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${Number(4).toString(16)}` }],
    });
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask.
    if ((error as any).code === 4902) {
    }
  }
}
