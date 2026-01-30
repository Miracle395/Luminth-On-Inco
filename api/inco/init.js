import nacl from "tweetnacl";
import { PublicKey, Connection, Transaction, SystemProgram } from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";

export const config = {
  runtime: "nodejs"
};

const connection = new Connection(
  process.env.SOLANA_RPC_URL,
  "confirmed"
);

function verifySignature({ pubkey, message, signature }) {
  const pk = new PublicKey(pubkey);
  const msg = new TextEncoder().encode(message);
  const sig = Uint8Array.from(signature);

  return nacl.sign.detached.verify(msg, sig, pk.toBytes());
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pubkey, action, amount, message, signature } = req.body;

    if (!pubkey || !action || !amount || !message || !signature)
      return res.status(400).json({ error: "Missing fields" });

    if (!verifySignature({ pubkey, message, signature }))
      return res.status(401).json({ error: "Invalid signature" });

    const user = new PublicKey(pubkey);

    // 🔐 Encrypt amount (Inco)
    const encryptedAmount = await encryptValue(
      BigInt(Math.round(Number(amount) * 1e6))
    );

    // ⚠️ Placeholder instruction
    // Replace programId + data with your Inco-enabled program
    const ix = SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: user,
      lamports: 0
    });

    const tx = new Transaction().add(ix);
    tx.feePayer = user;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // 🚫 Server cannot sign for user
    // Tx returned for client-side signing OR relayer flow
    const serialized = tx.serialize({
      requireAllSignatures: false
    }).toString("base64");

    return res.status(200).json({
      ok: true,
      action,
      encrypted: true,
      encryptedAmount,
      tx: serialized
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
