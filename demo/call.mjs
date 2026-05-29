import { wrapFetchWithPaymentFromConfig, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

const BACKEND = process.env.BACKEND ?? "https://enigma-production-efad.up.railway.app";
const USER = process.env.ENIGMA_USER ?? "enigma";
const NETWORK = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";

const secretB58 = process.env.BUYER_SECRET_B58;
if (!secretB58) {
  console.error("Set BUYER_SECRET_B58 to your buyer wallet's base58 private key.");
  process.exit(1);
}

const [, , apiName, ...rest] = process.argv;
if (!apiName) {
  console.error("Usage: BUYER_SECRET_B58=... node call.mjs <api-name> [/path...]");
  console.error("Example: node call.mjs jokes /joke/Any?safe-mode");
  process.exit(1);
}

const path = rest.join(" ") || "";
const url = `${BACKEND}/${USER}/${apiName}${path}`;

const signer = await createKeyPairSignerFromBytes(base58.decode(secretB58));
console.log(`buyer:  ${signer.address}`);
console.log(`GET     ${url}`);

const fetchWithPayment = wrapFetchWithPaymentFromConfig(globalThis.fetch, {
  schemes: [{ network: NETWORK, client: new ExactSvmScheme(signer) }],
});

const t0 = Date.now();
const res = await fetchWithPayment(url, { method: "GET" });
const ms = Date.now() - t0;

console.log(`status: ${res.status} (${ms}ms)`);

const payHeader = res.headers.get("PAYMENT-RESPONSE");
if (payHeader) {
  try {
    console.log("settlement:", decodePaymentResponseHeader(payHeader));
  } catch {}
}

const ct = res.headers.get("content-type") ?? "";
const body = ct.includes("json") ? await res.json() : await res.text();
console.log("response:");
console.log(typeof body === "string" ? body : JSON.stringify(body, null, 2));
