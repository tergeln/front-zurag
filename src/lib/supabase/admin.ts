import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Supabase client with the SECRET key: bypasses row-level security.
 * Server-only, and only for things no signed-in user can do themselves:
 * recording QPay invoices and confirming payments (the QPay callback has no
 * user session). Never import this from a client component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Missing SUPABASE_SECRET_KEY (server-only) in the environment.");
  return createClient(supabaseEnv().url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
