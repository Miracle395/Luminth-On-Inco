import nacl from "tweetnacl";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { encryptValue, createInstruction } from "@inco/solana-sdk/encryption";

export const config = { runtime: "nodejs" };

// Devnet
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// Official Inco devnet program
const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");

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

    // --- ENCRYPT AMOUNT ---
    const encryptedAmount = await encryptValue(BigInt(Math.round(Number(amount) * 1e6)));

    // --- BUILD INCO INSTRUCTION ---
    const instruction = createInstruction({
      programId: INCO_PROGRAM_ID,
      user,
      action,
      encryptedAmount
    });

    // --- BUILD TRANSACTION ---
    const tx = new Transaction().add(instruction);
    tx.feePayer = user;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // --- SERIALIZE TX (frontend will sign & send) ---
    const serializedTx = tx.serialize({ requireAllSignatures: false }).toString("base64");

    return res.status(200).json({
      ok: true,
      action,
      encrypted: true,
      encryptedAmount,
      tx: serializedTx
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
