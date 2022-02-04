// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, body } = req;

    switch (method) {
      case "POST": {
        console.log("handle payment transaction", { body });

        const { transactionHash } = body;

        console.log("payment processed");
        return res.status(200).send({ message: "payment processed", payoutHash: "" });
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
