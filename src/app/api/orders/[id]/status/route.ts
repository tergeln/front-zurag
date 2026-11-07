import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { syncInvoice } from "@/lib/qpay/payments";

/**
 * GET /api/orders/{id}/status[?check=1]
 * The checkout page polls this. Normally it only reads the database (the QPay
 * callback does the confirming). With ?check=1 (the customer pressed "I paid")
 * it also asks QPay, at most once every few seconds per invoice.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/orders/[id]/status">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!(await getCurrentUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = await createClient();
  // RLS: customers only see their own orders.
  const read = () => supabase.from("orders").select("id, status, expires_at").eq("id", id).maybeSingle<{ id: string; status: string; expires_at: string }>();
  let { data: order } = await read();
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (order.status === "pending" && request.nextUrl.searchParams.get("check") === "1") {
    const { data: pays } = await supabase.from("payments").select("qpay_invoice_id").eq("order_id", id);
    for (const p of pays ?? []) if (p.qpay_invoice_id) await syncInvoice(p.qpay_invoice_id);
    ({ data: order } = await read());
  }
  if (order && order.status === "pending" && new Date(order.expires_at).getTime() < Date.now()) {
    await createAdminClient().rpc("expire_order", { p_order_id: id });
    ({ data: order } = await read());
  }
  return NextResponse.json({ status: order?.status ?? "unknown" }, { headers: { "Cache-Control": "no-store" } });
}
