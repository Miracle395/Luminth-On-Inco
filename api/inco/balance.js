import { Connection, PublicKey } from "@solana/web3.js";
import { getBalance } from "@inco/solana-sdk/encryption";

export const config = { runtime: "nodejs" };

// Devnet connection
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pubkey } = req.body;
    if (!pubkey) return res.status(400).json({ error: "Missing pubkey" });

    const user = new PublicKey(pubkey);

    // --- FETCH BALANCE VIA INCO SDK ---
    const bal = await getBalance({ user, connection, symbol: "USDC" });

    return res.status(200).json({
      ok: true,
      balance: Number(bal) / 1e6
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
