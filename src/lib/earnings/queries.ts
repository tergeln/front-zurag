import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Balance = { earned_mnt: number; paid_out_mnt: number; pending_payout_mnt: number; available_mnt: number };
export type SaleLine = {
  id: number;
  created_at: string;
  type: "sale" | "refund_adjustment";
  gross_mnt: number;
  platform_fee_mnt: number;
  photographer_mnt: number;
  photo_id: string;
  event_name_mn: string;
  total: number;
};
export type Payout = {
  id: number;
  photographer_id: string;
  amount_mnt: number;
  status: "requested" | "approved" | "paid" | "rejected";
  bank_name: string;
  account_number: string;
  account_holder: string;
  note: string | null;
  reference: string | null;
  requested_at: string;
  paid_at: string | null;
};

const ZERO: Balance = { earned_mnt: 0, paid_out_mnt: 0, pending_payout_mnt: 0, available_mnt: 0 };

export async function getMyBalance(): Promise<Balance> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_balance");
  const row = ((data ?? []) as Balance[])[0];
  return row ? { earned_mnt: Number(row.earned_mnt), paid_out_mnt: Number(row.paid_out_mnt), pending_payout_mnt: Number(row.pending_payout_mnt), available_mnt: Number(row.available_mnt) } : ZERO;
}

export const SALES_PAGE_SIZE = 50;

export async function getMySales(page: number): Promise<SaleLine[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_sales", { p_limit: SALES_PAGE_SIZE, p_offset: page * SALES_PAGE_SIZE });
  return (data ?? []) as SaleLine[];
}

/** RLS: photographers get their own payouts, admins get all. */
export async function listPayouts(limit = 100): Promise<Payout[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("payouts").select("*").order("requested_at", { ascending: false }).limit(limit).returns<Payout[]>();
  return data ?? [];
}
