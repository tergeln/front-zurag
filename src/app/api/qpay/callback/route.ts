import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncInvoice } from "@/lib/qpay/payments";
import { verifyOrderSignature } from "@/lib/qpay/signature";

/**
 * QPay calls this after a payment: /api/qpay/callback?order=<id>&sig=<hmac>
 * We never trust the request itself. It only tells us *which* invoice to ask
 * QPay about; syncInvoice() then checks with QPay and confirms in the database.
 * Repeated callbacks are harmless.
 */
async function handle(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order") ?? "";
  const sig = request.nextUrl.searchParams.get("sig") ?? "";
  const secret = process.env.QPAY_CALLBACK_SECRET;
  if (!secret || !/^[0-9a-f-]{36}$/.test(orderId) || !(await verifyOrderSignature(orderId, sig, secret))) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const { data: payments } = await createAdminClient()
    .from("payments")
    .select("qpay_invoice_id")
    .eq("order_id", orderId)
    .not("qpay_invoice_id", "is", null);
  for (const p of payments ?? []) await syncInvoice(p.qpay_invoice_id as string, { force: true });

  return new NextResponse("SUCCESS", { status: 200 });
}

export const GET = handle;
export const POST = handle;
