// Pure rules for deciding whether a QPay payment/check answer means "paid".
// Kept separate from the HTTP client so it can be unit-tested.

export type QPayPaymentRow = {
  payment_id: string | number;
  payment_status: string; // "PAID" when paid (QPay v2)
  payment_amount: string | number;
  payment_currency?: string;
};

export type QPayCheckResponse = { count?: number; paid_amount?: string | number; rows?: QPayPaymentRow[] };

export type Verdict =
  | { paid: true; paymentId: string; amount: number }
  | { paid: false; reason: "not_paid" | "amount_mismatch" | "currency_mismatch" | "malformed"; amount?: number };

/**
 * The order counts as paid only if QPay lists PAID rows in MNT whose total is
 * exactly the order total. Anything else (nothing paid, partial or extra
 * amounts, other currencies, unexpected shapes) is not paid.
 */
export function evaluateCheck(check: unknown, expectedMnt: number): Verdict {
  if (!check || typeof check !== "object" || !Array.isArray((check as QPayCheckResponse).rows)) return { paid: false, reason: "malformed" };
  const paidRows = (check as QPayCheckResponse).rows!.filter((r) => String(r?.payment_status).toUpperCase() === "PAID");
  if (!paidRows.length) return { paid: false, reason: "not_paid" };
  if (paidRows.some((r) => r.payment_currency && r.payment_currency.toUpperCase() !== "MNT")) return { paid: false, reason: "currency_mismatch" };

  const amounts = paidRows.map((r) => Number(r.payment_amount));
  if (amounts.some((a) => !Number.isFinite(a))) return { paid: false, reason: "malformed" };
  const total = amounts.reduce((s, a) => s + a, 0);
  if (Math.round(total) !== expectedMnt) return { paid: false, reason: "amount_mismatch", amount: total };

  return { paid: true, paymentId: paidRows.map((r) => String(r.payment_id)).join(","), amount: Math.round(total) };
}
