import { LegalPage } from "@/components/marketing/LegalPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { COOKIES } from "@/content/legal";

export const metadata = buildMetadata({ title: COOKIES.title, description: COOKIES.description, path: "/legal/cookies" });

export default function Page() {
  return <LegalPage doc={COOKIES} />;
}
