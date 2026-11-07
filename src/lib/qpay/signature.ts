// HMAC-SHA256 signature for our own callback URL, so random requests cannot
// even trigger a payment check. (Payments are still verified with QPay itself;
// the signature only filters noise.) Uses Web Crypto: works on Cloudflare Workers.

const enc = new TextEncoder();

async function key(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function signOrderId(orderId: string, secret: string): Promise<string> {
  const mac = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(`qpay-callback:${orderId}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyOrderSignature(orderId: string, signature: string, secret: string): Promise<boolean> {
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;
  const expected = await signOrderId(orderId, secret);
  // Constant-time comparison.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
