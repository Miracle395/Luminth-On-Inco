import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import { encryptValue, createClient } from "@inco/solana-sdk";

export const config = { runtime: "nodejs" };

const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pubkey, action, amount, message, signature } = req.body;

    if (!pubkey || !action || !amount || !message || !signature)
      return res.status(400).json({ error: "Missing fields" });

    const wallet = new PublicKey(pubkey);

    // Initialize Inco client
    const incoClient = await createClient({
      connection,
      network: "devnet"
    });

    // Encrypt the amount
    const encryptedAmount = await encryptValue(BigInt(Math.round(Number(amount) * 1e6)));

    // Build transaction targeting Inco devnet program
    const tx = await incoClient.tokens.buildTransaction({
      wallet,
      action, // "stake" or "unstake"
      amount: encryptedAmount
    });

    // Serialize tx for frontend signing
    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");

    return res.status(200).json({
      ok: true,
      tx: serialized
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
