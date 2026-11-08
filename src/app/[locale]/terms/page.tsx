import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/resolve";
import { legalDocs } from "@/i18n/legal";
import { LegalPage } from "@/components/legal/legal-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">): Promise<Metadata> {
  return { title: legalDocs.terms[resolveLocale((await params).locale)].title };
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  return <LegalPage doc={legalDocs.terms[resolveLocale((await params).locale)]} />;
}
