// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as ethers from "ethers";
import contractInfo from "abi/SwipePayment.json";
import { TOKENS } from "libs/wallet";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, body } = req;

    switch (method) {
      case "POST": {
        const SELLER_ADDRESS = "0x67009eec57b6BADBFECf4578b8029cB212cdc70b";
        console.log("handle payment transaction", { body });

        const { transactionHash } = body;

        const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RINKEBY);
        const signer = ethers.Wallet.fromMnemonic(process.env.mnemonic || "").connect(provider);

        // we need to verify that X (amount) has been sent to Y (seller address)
        const tx = await provider.getTransaction(transactionHash);

        const fn: any = contractInfo.abi.find((f) => f.name === "receivePayment");
        const result = ethers.utils.defaultAbiCoder.decode(fn?.inputs || [], ethers.utils.hexDataSlice(tx.data, 4));

        const tokenTransferred = result[0];
        const sellerAddress = result[1];
        const token = TOKENS.find((t) => t.address.toLowerCase() === tokenTransferred.toLowerCase());
        const amount = ethers.utils.formatUnits(result[2], token?.decimals);

        console.log("parsed transaction", { tokenTransferred, sellerAddress, amount });

        // verify amount paid
        if (amount !== "50.0") {
          console.log("[warning]", "invalid amount paid, skipping the frontend ey", { amount });
          return res.status(400).send({ message: "Invalid amount paid", transactionHash });
        }

        if (SELLER_ADDRESS !== sellerAddress) {
          console.log("[warning]", "invalid seller address", { amount });
          return res.status(400).send({ message: "Invalid seller address", transactionHash });
        }

        // send funds to the seller
        const paymentContract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
        const payoutTx = await paymentContract.withdrawFunds(SELLER_ADDRESS, token?.address);
        await payoutTx.wait();

        console.log("payment processed");
        return res.status(200).send({ message: "payment processed", transactionHash, payoutHash: payoutTx.hash });
      }
      default:
        console.log("[error]", "unauthorized method", method);
        return res.status(500).send({ error: "unauthorized method" });
    }
  } catch (error) {
    console.log("[error]", "general error", {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack,
    });

    return res.status(500).send({ error: "request failed" });
  }
}
