import { LegalPage } from "@/components/marketing/LegalPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { TERMS } from "@/content/legal";

export const metadata = buildMetadata({ title: TERMS.title, description: TERMS.description, path: "/legal/terms" });

export default function Page() {
  return <LegalPage doc={TERMS} />;
}
