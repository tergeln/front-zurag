"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { createInvoice, qpayConfigured } from "@/lib/qpay/client";
import { signOrderId } from "@/lib/qpay/signature";

function readLocale(formData: FormData): Locale {
  const v = String(formData.get("locale") ?? "");
  return isLocale(v) ? v : defaultLocale;
}

/**
 * Cart -> order -> QPay invoice -> checkout page with the QR code.
 * The total is computed by the database from current prices, never taken from the browser.
 */
export async function checkout(formData: FormData) {
  const locale = readLocale(formData);
  const cart = `/${locale}/cart`;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(cart)}`);

  const siteUrl = process.env.PUBLIC_SITE_URL;
  const secret = process.env.QPAY_CALLBACK_SECRET;
  if (!qpayConfigured() || !siteUrl || !secret) redirect(`${cart}?error=payment_unavailable`);

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc("create_order_from_cart");
  if (error || typeof orderId !== "string") redirect(`${cart}?error=${error?.message === "cart_empty" ? "cart_empty" : "generic"}`);

  const { data: order } = await supabase.from("orders").select("order_no, total_mnt").eq("id", orderId).single<{ order_no: string; total_mnt: number }>();
  if (!order) redirect(`${cart}?error=generic`);

  let invoice;
  try {
    invoice = await createInvoice({
      senderInvoiceNo: order.order_no,
      amount: Number(order.total_mnt),
      description: `Zurag ${order.order_no}`,
      receiverCode: user.id,
      callbackUrl: `${siteUrl}/api/qpay/callback?order=${orderId}&sig=${await signOrderId(orderId, secret)}`,
    });
  } catch (e) {
    console.error("qpay invoice failed", e instanceof Error ? e.message : e);
    redirect(`${cart}?error=payment_unavailable`);
  }

  const { error: recordError } = await createAdminClient().rpc("record_payment_invoice", {
    p_order_id: orderId,
    p_invoice_id: invoice.invoice_id,
    p_qr_text: invoice.qr_text,
    p_urls: invoice.urls ?? [],
  });
  if (recordError) redirect(`${cart}?error=generic`);
  redirect(`/${locale}/checkout/${orderId}`);
}
