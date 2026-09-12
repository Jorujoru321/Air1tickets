import Link from "next/link";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { genericChatText, whatsappLink } from "@/lib/leads/chat-links";
import { Logo } from "./Logo";
import { PRIMARY_NAV, visibleLinks } from "./nav";
import { AccountMenu } from "./AccountMenu";
import { MobileNav } from "./MobileNav";
import { isStaticPreview, site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {visibleLinks(PRIMARY_NAV).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-navy-900">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`}
            className="hidden items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-100 2xl:flex"
          >
            <Phone className="h-4 w-4 text-ocean-600" aria-hidden />
            {site.supportPhone}
          </a>
          <a href={whatsappLink(genericChatText())} target="_blank" rel="noopener" className="hidden items-center gap-2 rounded-lg bg-[#25d366] px-3 py-2 text-sm font-semibold text-[#062b16] hover:bg-[#1fbf5b] md:flex">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          {!isStaticPreview && <AccountMenu className="hidden lg:flex" />}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
