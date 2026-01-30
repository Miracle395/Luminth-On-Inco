import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { encryptValue } from "@inco/solana-sdk/encryption";
// import { decrypt } from "@inco/solana-sdk/attested-decrypt"; // enable when needed

export const config = {
  runtime: "nodejs"
};

function verifySignature({ pubkey, message, signature }) {
  const pk = new PublicKey(pubkey);
  const msg = new TextEncoder().encode(message);
  const sig = Uint8Array.from(signature);

  return nacl.sign.detached.verify(msg, sig, pk.toBytes());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pubkey, action, amount, message, signature } = req.body;

    if (!pubkey || !action || !amount || !message || !signature) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const ok = verifySignature({ pubkey, message, signature });
    if (!ok) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // --- INCO PRIVACY CORE ---
    // Encrypt amount (USDC assumed 6 decimals)
    const encryptedAmount = await encryptValue(
      BigInt(Math.round(Number(amount) * 1e6))
    );

    // TODO:
    // - Build Solana instruction with encryptedAmount
    // - Submit tx
    // - Optionally decrypt handle after confirmation

    // Stub deterministic response (replace after tx wiring)
    return res.status(200).json({
      ok: true,
      action,
      encrypted: true,
      balance: "0.00" // update after tx integration
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
