import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PlatformSettings = { commissionBp: number; retentionDays: number };

/** Reads platform_settings (any signed-in user may read). Falls back to the migration defaults. */
export async function getSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("key, value");
  const map = new Map((data ?? []).map((r: { key: string; value: unknown }) => [r.key, Number(r.value)]));
  return {
    commissionBp: map.get("commission_bp") ?? 2000,
    retentionDays: map.get("embedding_retention_days") ?? 180,
  };
}
