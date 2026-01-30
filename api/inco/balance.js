import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@inco/solana-sdk";

export const config = { runtime: "nodejs" };

const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pubkey } = req.body;
    if (!pubkey) return res.status(400).json({ error: "Missing pubkey" });

    const wallet = new PublicKey(pubkey);

    // Initialize Inco client
    const incoClient = await createClient({
      connection,
      network: "devnet"
    });

    // Get balance
    const bal = await incoClient.tokens.getBalance({ wallet, symbol: "USDC" });

    return res.status(200).json({
      ok: true,
      balance: Number(bal) / 1e6
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
