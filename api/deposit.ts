import { IncoClient } from "@inco/solana-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export default async function handler(req, res) {
  try {
    const { owner, amount } = req.body;

    const inco = await IncoClient.init({
      connection,
      network: "devnet",
      // backend wallet (env var)
      wallet: process.env.INCO_BACKEND_KEYPAIR
    });

    await inco.tokens.deposit({
      symbol: "USDC",
      owner: new PublicKey(owner),
      amount: Math.round(amount * 1e6)
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
