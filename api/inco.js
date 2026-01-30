import { IncoClient } from "@inco/solana-sdk";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const backendKeypair = JSON.parse(process.env.INCO_BACKEND_KEYPAIR);

const inco = await IncoClient.init({
  connection,
  network: "devnet",
  backendKeypair
});

export async function getBalance(req, res) {
  const bal = await inco.tokens.getBalance("USDC");
  res.json({ balance: bal });
}

export async function deposit(req, res) {
  const { amount } = req.body;

  try {
    await inco.tokens.deposit({ symbol: "USDC", amount });
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
}

export async function withdraw(req, res) {
  const { amount } = req.body;

  try {
    await inco.tokens.withdraw({ symbol: "USDC", amount });
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
}
