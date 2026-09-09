import { LegalPage } from "@/components/marketing/LegalPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { PRIVACY } from "@/content/legal";

export const metadata = buildMetadata({ title: PRIVACY.title, description: PRIVACY.description, path: "/legal/privacy" });

export default function Page() {
  return <LegalPage doc={PRIVACY} />;
}
