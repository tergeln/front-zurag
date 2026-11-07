import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPayment } from "./client";
import { evaluateCheck } from "./verify";

export type SyncResult = "paid" | "already_paid" | "not_paid" | "amount_mismatch" | "throttled" | "unknown_invoice" | "error";

const MIN_CHECK_INTERVAL_MS = 5_000; // never ask QPay about one invoice more often than this

/**
 * The only way an order becomes paid: ask QPay about the invoice, check the
 * answer (status, currency, exact amount), and let the database confirm it in
 * one transaction. Safe to call any number of times for the same invoice.
 */
export async function syncInvoice(invoiceId: string, { force = false } = {}): Promise<SyncResult> {
  const db = createAdminClient();
  const { data: pay } = await db
    .from("payments")
    .select("qpay_invoice_id, amount_mnt, status, last_checked_at")
    .eq("qpay_invoice_id", invoiceId)
    .maybeSingle<{ qpay_invoice_id: string; amount_mnt: number; status: string; last_checked_at: string | null }>();
  if (!pay) return "unknown_invoice";
  if (pay.status === "paid") return "already_paid";
  if (!force && pay.last_checked_at && Date.now() - new Date(pay.last_checked_at).getTime() < MIN_CHECK_INTERVAL_MS) return "throttled";

  let raw: unknown;
  try {
    raw = await checkPayment(invoiceId);
  } catch (e) {
    console.error("qpay check failed", invoiceId, e instanceof Error ? e.message : e);
    return "error";
  }

  const verdict = evaluateCheck(raw, Number(pay.amount_mnt));
  if (!verdict.paid) {
    if (verdict.reason === "amount_mismatch") {
      // Let the database record it (audit log); nothing is unlocked.
      const { data } = await db.rpc("confirm_payment", { p_invoice_id: invoiceId, p_qpay_payment_id: null, p_paid_amount: verdict.amount ?? -1, p_raw: raw });
      return data === "amount_mismatch" ? "amount_mismatch" : "error";
    }
    await db.rpc("note_payment_checked", { p_invoice_id: invoiceId, p_raw: raw });
    return "not_paid";
  }

  const { data, error } = await db.rpc("confirm_payment", {
    p_invoice_id: invoiceId,
    p_qpay_payment_id: verdict.paymentId,
    p_paid_amount: verdict.amount,
    p_raw: raw,
  });
  if (error) {
    console.error("confirm_payment failed", invoiceId, error.message);
    return "error";
  }
  return data as SyncResult;
}
