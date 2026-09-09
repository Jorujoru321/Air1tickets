import { LegalPage } from "@/components/marketing/LegalPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { ACCESSIBILITY } from "@/content/legal";

export const metadata = buildMetadata({ title: ACCESSIBILITY.title, description: ACCESSIBILITY.description, path: "/legal/accessibility" });

export default function Page() {
  return <LegalPage doc={ACCESSIBILITY} />;
}
