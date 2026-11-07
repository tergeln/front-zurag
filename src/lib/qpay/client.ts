import "server-only";

// QPay merchant API v2 client (https://developer.qpay.mn, "Merchant V2").
// Sandbox: https://merchant-sandbox.qpay.mn   Production: https://merchant.qpay.mn
// Field names follow QPay's v2 documentation; confirm them against the sandbox
// when merchant credentials arrive.

type Config = { base: string; username: string; password: string; invoiceCode: string };

export function qpayConfigured(): boolean {
  return Boolean(process.env.QPAY_USERNAME && process.env.QPAY_PASSWORD && process.env.QPAY_INVOICE_CODE);
}

function config(): Config {
  const { QPAY_BASE_URL, QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE } = process.env;
  if (!QPAY_USERNAME || !QPAY_PASSWORD || !QPAY_INVOICE_CODE) throw new Error("QPay is not configured (QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE).");
  return { base: QPAY_BASE_URL || "https://merchant-sandbox.qpay.mn", username: QPAY_USERNAME, password: QPAY_PASSWORD, invoiceCode: QPAY_INVOICE_CODE };
}

// One token per server instance, reused until shortly before it expires
// (QPay asks merchants not to request a new token for every call).
let cached: { token: string; expiresAt: number } | null = null;

async function token(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const c = config();
  const res = await fetch(`${c.base}/v2/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${c.username}:${c.password}`)}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`QPay auth failed: ${res.status}`);
  const body = (await res.json()) as { access_token: string; expires_in?: number };
  // expires_in may be a duration in seconds or an absolute unix time; handle both.
  const exp = Number(body.expires_in ?? 0);
  const expiresAt = exp > 1e9 ? exp * 1000 : Date.now() + (exp || 3600) * 1000;
  cached = { token: body.access_token, expiresAt };
  return body.access_token;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${config().base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 401) cached = null; // force a fresh token next time
  if (!res.ok) throw new Error(`QPay ${method} ${path} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json().catch(() => ({}))) as T;
}

export type QPayInvoice = {
  invoice_id: string;
  qr_text: string;
  qr_image?: string;
  qPay_shortUrl?: string;
  urls?: { name: string; description?: string; logo?: string; link: string }[];
};

export function createInvoice(input: { senderInvoiceNo: string; amount: number; description: string; callbackUrl: string; receiverCode: string }) {
  return call<QPayInvoice>("POST", "/v2/invoice", {
    invoice_code: config().invoiceCode,
    sender_invoice_no: input.senderInvoiceNo, // must be unique per invoice
    invoice_receiver_code: input.receiverCode,
    invoice_description: input.description,
    amount: input.amount,
    callback_url: input.callbackUrl,
  });
}

export function checkPayment(invoiceId: string) {
  return call<unknown>("POST", "/v2/payment/check", {
    object_type: "INVOICE",
    object_id: invoiceId,
    offset: { page_number: 1, page_limit: 100 },
  });
}

export function cancelInvoice(invoiceId: string) {
  return call<unknown>("DELETE", `/v2/invoice/${encodeURIComponent(invoiceId)}`);
}
