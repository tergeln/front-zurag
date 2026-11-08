import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/resolve";
import { legalDocs } from "@/i18n/legal";
import { LegalPage } from "@/components/legal/legal-page";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  return { title: legalDocs.privacy[resolveLocale((await params).locale)].title };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const locale = resolveLocale((await params).locale);
  // Visitors may be signed out, so read the one public setting with the server key.
  const { data } = await createAdminClient().from("platform_settings").select("value").eq("key", "embedding_retention_days").maybeSingle();
  const days = String(Number(data?.value ?? 180));
  return <LegalPage doc={legalDocs.privacy[locale]} vars={{ days }} />;
}
