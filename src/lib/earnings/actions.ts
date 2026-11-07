"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { getApprovedPhotographer } from "@/lib/auth/photographer";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { parsePriceMnt } from "@/lib/uploads";

function readLocale(formData: FormData): Locale {
  const v = String(formData.get("locale") ?? "");
  return isLocale(v) ? v : defaultLocale;
}

export type PayoutErrorKey = "below_minimum" | "insufficient_balance" | "already_open" | "invalid_bank" | "forbidden" | "generic";
export type PayoutState = { error?: PayoutErrorKey; ok?: boolean } | undefined;

export async function requestPayout(_prev: PayoutState, formData: FormData): Promise<PayoutState> {
  const locale = readLocale(formData);
  if (!(await getApprovedPhotographer())) return { error: "forbidden" };
  const amount = parsePriceMnt(formData.get("amount"));
  const bank = String(formData.get("bankName") ?? "").trim();
  const account = String(formData.get("accountNumber") ?? "").replace(/\s/g, "");
  const holder = String(formData.get("accountHolder") ?? "").trim();
  if (amount === null || amount < 10000) return { error: "below_minimum" };
  if (bank.length < 2 || !/^[0-9]{6,20}$/.test(account) || holder.length < 2) return { error: "invalid_bank" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_payout", { p_amount: amount, p_bank_name: bank, p_account_number: account, p_account_holder: holder });
  if (error) {
    const known: PayoutErrorKey[] = ["below_minimum", "insufficient_balance", "already_open", "forbidden"];
    return { error: known.find((k) => k === error.message) ?? (error.code === "23514" ? "invalid_bank" : "generic") };
  }
  revalidatePath(`/${locale}/photographer`, "layout");
  return { ok: true };
}

// ---------------------------------------------------------------- admin

function back(formData: FormData, locale: Locale, page: string) {
  const b = String(formData.get("back") ?? "");
  return b.startsWith(`/${locale}/admin/${page}`) ? b : `/${locale}/admin/${page}`;
}

export async function decidePayout(formData: FormData) {
  const locale = readLocale(formData);
  await requireRole(locale, `/${locale}/admin/payouts`, "admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_decide_payout", {
    p_payout_id: Number(formData.get("payoutId")),
    p_approve: formData.get("decision") === "approve",
    p_note: String(formData.get("note") ?? "").slice(0, 500),
  });
  if (error) redirect(`/${locale}/admin/payouts?error=${error.message === "not_open" ? "not_open" : "generic"}`);
  revalidatePath(`/${locale}/admin/payouts`);
}

export async function markPayoutPaid(formData: FormData) {
  const locale = readLocale(formData);
  await requireRole(locale, `/${locale}/admin/payouts`, "admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_mark_payout_paid", {
    p_payout_id: Number(formData.get("payoutId")),
    p_reference: String(formData.get("reference") ?? "").slice(0, 120),
  });
  if (error) {
    const k = ["not_approved", "reference_required"].includes(error.message) ? error.message : "generic";
    redirect(`/${locale}/admin/payouts?error=${k}`);
  }
  revalidatePath(`/${locale}/admin/payouts`);
}

export async function refundItems(formData: FormData) {
  const locale = readLocale(formData);
  const target = back(formData, locale, "orders");
  await requireRole(locale, target, "admin");
  const ids = formData.getAll("itemIds").map(String).filter((id) => /^[0-9a-f-]{36}$/.test(id));
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_refund_items", {
    p_order_id: String(formData.get("orderId")),
    p_item_ids: ids,
    p_reason: String(formData.get("reason") ?? "").slice(0, 500),
  });
  if (error) {
    const k = ["not_refundable", "nothing_to_refund"].includes(error.message) ? error.message : "generic";
    redirect(`${target}?error=${k}`);
  }
  revalidatePath(target);
}
