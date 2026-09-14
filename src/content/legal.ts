/**
 * Legal documents rendered by /legal/*. Plain data so the copy can be reviewed
 * (and replaced) by counsel without touching React. Every document is marked
 * "draft" until the business confirms it — see docs/WHAT-I-NEED-FROM-YOU.md.
 */
import { site } from "@/lib/site";

/**
 * Two-letter state codes spelled out. A governing-law clause has to name the
 * state in full ("the State of Georgia", not "the State of GA"), and this has
 * to keep working if the business moves, so it is a lookup rather than a
 * special case for wherever we happen to be incorporated today.
 */
const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/** Full state name for the registered address, falling back to the raw code. */
const stateName =
  US_STATE_NAMES[site.address.addressRegion] ?? site.address.addressRegion;

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: "terms" | "privacy" | "cookies" | "accessibility";
  title: string;
  /** Short name used in breadcrumbs and cross-links. */
  shortTitle: string;
  description: string;
  lastUpdated: string; // human readable
  summary: string;
  sections: LegalSection[];
}

const CO = site.legalName;

export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  shortTitle: "Terms",
  description: `The terms that govern your use of ${site.name}, including how bookings are made, paid for, changed and refunded, and the limits of our responsibility as a travel agency.`,
  lastUpdated: "September 2026",
  summary: `${CO} ("Air1", "we") sells air travel as an agent for the airlines. When you book, your contract of carriage is with the airline; your contract for our booking service is with us. These terms explain both.`,
  sections: [
    {
      id: "agreement",
      heading: "1. Agreement to these terms",
      paragraphs: [
        `By using ${site.url.replace(/^https?:\/\//, "")} (the "Site") or booking through our phone team, you agree to these Terms of Service and to our Privacy Policy. If you book on behalf of other travelers you confirm you have their permission to share their details with us and the airline, and that they accept these terms.`,
        "You must be at least 18 years old and able to enter into a binding contract to make a booking. Tickets for minors may be purchased by an adult.",
      ],
    },
    {
      id: "our-role",
      heading: "2. Our role as a travel agent",
      paragraphs: [
        "Air1 is an online travel agency. We display fares and schedules supplied by airlines and their distribution partners, and we issue tickets on the airline's behalf. The airline, not Air1, operates the flight and is responsible for carriage, delays, cancellations, baggage handling and the fare rules attached to your ticket.",
        "Each airline's contract of carriage, fare rules and baggage policies apply to your ticket in addition to these terms. We summarize the key rules on every result and in your confirmation, but the airline's own rules control where there is a conflict.",
      ],
    },
    {
      id: "prices",
      heading: "3. Prices, taxes and fees",
      paragraphs: [
        "Prices are shown in US dollars and include government taxes, airport charges and carrier-imposed surcharges known at the time of display. Optional extras (checked bags, seats, travel protection) are itemized separately before you pay. If a service fee applies to your booking it is shown as its own line item on the checkout page.",
        "Airline fares change continuously. A fare is not guaranteed until your ticket is issued. If the price changes between the results page and payment, we will show you the new total and ask you to confirm before charging your card. We never charge more than the total you approved.",
      ],
    },
    {
      id: "booking",
      heading: "4. Making and confirming a booking",
      paragraphs: [
        "When you complete checkout we place a reservation with the airline and, if payment is authorized, issue your ticket. You will receive a confirmation email with an Air1 booking reference and the airline's own record locator. Please check every name, date and airport immediately: names must exactly match the government ID the traveler will present at the airport.",
        "Occasionally an airline is unable to confirm a reservation after payment (for example when the last seat was sold seconds earlier). In that case we will offer an alternative or a full refund to your original payment method within one business day.",
      ],
    },
    {
      id: "payment",
      heading: "5. Payment",
      paragraphs: [
        "We accept major credit and debit cards. Payments are processed by a PCI DSS-compliant payment processor; card numbers are never stored on Air1 systems. Your card statement will show a charge from the airline, from Air1, or both, depending on how the ticket is issued. The confirmation email lists exactly what to expect.",
        "By submitting a payment you confirm that you are authorized to use the card. We use fraud-screening tools and may ask for additional verification, or decline a booking, where a transaction appears suspicious.",
      ],
    },
    {
      id: "changes",
      heading: "6. Changes, cancellations and refunds",
      paragraphs: [
        "24-hour free cancellation. For bookings made at least seven days before departure you may cancel for a full refund within 24 hours of booking, as required by the US Department of Transportation. Cancel online from Manage booking or call us; the refund is returned to your original payment method.",
        "After 24 hours, the airline's fare rules apply. Basic economy fares are usually non-refundable and non-changeable. Main cabin fares can typically be changed without a fee, though you pay any difference in fare. Flexible fares are refundable. The rules for your specific fare are shown before purchase and in your confirmation.",
        "If the airline cancels your flight or significantly changes the schedule, you are entitled to a refund to your original payment method regardless of fare type. We process these refunds as soon as the airline confirms them; airlines are required to refund within seven business days for card payments.",
      ],
      bullets: [
        "Refund requests may take 7–20 business days to appear on your statement depending on the airline and your bank.",
        "Optional extras purchased from Air1 (such as travel protection) follow their own refund rules, stated at the time of purchase.",
        "Where a fee applies to a change or cancellation, we show it before you confirm.",
      ],
    },
    {
      id: "travel-documents",
      heading: "7. Travel documents and your responsibilities",
      paragraphs: [
        "You are responsible for holding valid identification, passports, visas, health documents and any other entry requirements for every country on your itinerary, including transit countries. Airlines will deny boarding to travelers without correct documents and the fare may not be refundable in that case.",
        "You must arrive at the airport in time to check in and clear security, follow the airline's baggage rules, and behave in accordance with the airline's conditions of carriage. Air1 is not responsible for costs arising from missed flights, denied boarding or confiscated items.",
      ],
    },
    {
      id: "liability",
      heading: "8. Limitation of liability",
      paragraphs: [
        "Air1 acts only as an agent for the airlines and other suppliers. To the fullest extent permitted by law, we are not liable for any loss, injury, delay or expense arising from the acts or omissions of an airline or other supplier, from events beyond our reasonable control (including weather, air traffic control, strikes, security incidents and public health measures), or from your failure to comply with these terms or a supplier's rules.",
        `Our total liability to you for any claim relating to a booking is limited to the amount of the service fees you paid to ${CO} for that booking. Nothing in these terms limits liability that cannot be limited under applicable law, including for death or personal injury caused by negligence.`,
      ],
    },
    {
      id: "acceptable-use",
      heading: "9. Acceptable use of the Site",
      paragraphs: [
        "You may use the Site to search for and book travel for yourself and people you are authorized to book for. You may not scrape or copy our content, make speculative or fraudulent bookings, interfere with the Site's operation, or use automated tools to place bookings or query prices without our written permission.",
      ],
    },
    {
      id: "disputes",
      heading: "10. Governing law and disputes",
      paragraphs: [
        `These terms are governed by the laws of the State of ${stateName} and applicable US federal law. If a dispute cannot be resolved through our support team, you agree that it will be resolved in the state or federal courts located in ${site.address.addressLocality}, ${site.address.addressRegion}, unless applicable law requires otherwise. Nothing in this section prevents you from filing a complaint with the US Department of Transportation or your state attorney general.`,
      ],
    },
    {
      id: "changes-to-terms",
      heading: "11. Changes to these terms",
      paragraphs: [
        "We may update these terms from time to time. The version in force when you make a booking applies to that booking. We will post the date of the latest revision at the top of this page and, for material changes, notify registered users by email.",
      ],
    },
    {
      id: "contact",
      heading: "12. Contact",
      paragraphs: [`${CO}, ${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}. Email ${site.supportEmail} or call ${site.supportPhone} (24/7).`],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  shortTitle: "Privacy",
  description: `How ${site.name} collects, uses, shares and protects personal information when you search, book and travel, and the choices and rights you have, including under California law.`,
  lastUpdated: "September 2026",
  summary: "We collect the information needed to book and manage your travel, we share it with the airlines and payment processors that fulfil your booking, and we never sell it. This policy explains the details.",
  sections: [
    {
      id: "scope",
      heading: "1. Who this policy covers",
      paragraphs: [`This policy applies to information ${CO} collects through the Site, our phone support team and our emails. It covers you as a visitor, account holder or traveler, and it also covers travelers whose details you enter on their behalf.`],
    },
    {
      id: "information-we-collect",
      heading: "2. Information we collect",
      paragraphs: ["We collect information you give us, information generated when you use the Site, and limited information from partners."],
      bullets: [
        "Booking details: traveler names, dates of birth, gender as shown on ID, contact details, frequent flyer numbers, passport or Known Traveler Numbers when required by the airline, and special assistance requests.",
        "Payment details: card type, last four digits and billing address. Full card numbers are handled by our payment processor and never stored by Air1.",
        "Account details: email address, password (stored as a one-way hash), saved travelers and price alerts.",
        "Usage data: searches, pages viewed, device and browser type, IP address, approximate location and the referring site, collected through server logs and the cookies described in our Cookie Policy.",
        "Communications: messages you send us and recordings or transcripts of support calls, which we tell you about at the start of the call.",
      ],
    },
    {
      id: "how-we-use",
      heading: "3. How we use information",
      paragraphs: ["We use personal information to:"],
      bullets: [
        "Search fares, make reservations, issue tickets and send confirmations, itineraries and travel updates.",
        "Process payments, prevent fraud and comply with airline and government requirements.",
        "Provide customer support and manage changes, cancellations and refunds.",
        "Send price alerts, newsletters and offers you have signed up for. You can unsubscribe from marketing at any time.",
        "Improve the Site, measure performance and fix problems.",
        "Meet legal obligations, enforce our terms and protect our rights.",
      ],
    },
    {
      id: "sharing",
      heading: "4. Who we share information with",
      paragraphs: ["We share personal information only as needed to provide our service:"],
      bullets: [
        "Airlines and their distribution systems, which need traveler details to issue tickets and operate flights. Airlines are subject to their own privacy policies.",
        "Payment processors and fraud-prevention providers.",
        "Service providers that host our systems, send our emails and text messages, and help us analyze Site usage. They may only use information to provide services to us.",
        "Government agencies where required by law, for example the Transportation Security Administration's Secure Flight program.",
        "A buyer or successor in the event of a merger, acquisition or sale of assets, subject to this policy.",
      ],
    },
    {
      id: "no-sale",
      heading: "5. We do not sell personal information",
      paragraphs: [
        "Air1 does not sell personal information and has not done so in the past 12 months. We may use advertising cookies that share limited browsing data with advertising partners, which some state laws treat as \"sharing\" for targeted advertising. You can opt out under \"Your rights\" below.",
      ],
    },
    {
      id: "retention",
      heading: "6. How long we keep information",
      paragraphs: [
        "Booking records are kept for seven years after travel to meet accounting, tax and dispute requirements. Account information is kept while your account is active and for 24 months after your last login. Usage logs are kept for 13 months. We delete or anonymize information when it is no longer needed.",
      ],
    },
    {
      id: "security",
      heading: "7. How we protect information",
      paragraphs: [
        "All traffic to the Site is encrypted with TLS. Passwords are hashed with bcrypt. Access to booking data is limited to staff who need it to help you and is logged. Card payments are handled by a PCI DSS Level 1 processor. No system is perfectly secure; if we learn of a breach affecting your information we will notify you as required by law.",
      ],
    },
    {
      id: "your-rights",
      heading: "8. Your rights and choices",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, delete or receive a copy of your personal information, to opt out of targeted advertising or the sale or sharing of personal information, and to not be discriminated against for exercising these rights. California residents have these rights under the CCPA/CPRA; residents of Colorado, Connecticut, Virginia, Utah, Texas, Oregon and other states with privacy laws have similar rights.",
        `To exercise any right, email ${site.supportEmail} with the subject "Privacy request" or call ${site.supportPhone}. We will verify your identity using the email address on your booking or account and respond within 45 days. You may authorize an agent to make a request on your behalf.`,
        "Do Not Sell or Share My Personal Information: to opt out of advertising cookies, use the cookie settings link in the footer of any page or enable the Global Privacy Control signal in your browser, which we honor.",
      ],
    },
    {
      id: "children",
      heading: "9. Children",
      paragraphs: ["The Site is not directed to children under 13 and we do not knowingly collect information from them, other than traveler details entered by an adult when booking a child's ticket."],
    },
    {
      id: "international",
      heading: "10. International transfers",
      paragraphs: ["Air1 is based in the United States and processes information here. If you book from outside the US, your information will be transferred to the US and to the countries where the airlines on your itinerary operate."],
    },
    {
      id: "changes",
      heading: "11. Changes to this policy",
      paragraphs: ["We will post any changes on this page and update the date at the top. For material changes we will email registered users before the change takes effect."],
    },
    {
      id: "contact",
      heading: "12. Contact",
      paragraphs: [`Privacy questions: ${site.supportEmail}, or write to ${CO}, Attn: Privacy, ${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}.`],
    },
  ],
};

export const COOKIES: LegalDoc = {
  slug: "cookies",
  title: "Cookie Policy",
  shortTitle: "Cookies",
  description: `Which cookies and similar technologies ${site.name} uses, what they do, and how to control them.`,
  lastUpdated: "September 2026",
  summary: "We use a small number of cookies to keep you signed in, remember your search, measure how the Site performs and, only with your consent, show relevant advertising.",
  sections: [
    {
      id: "what-are-cookies",
      heading: "1. What cookies are",
      paragraphs: ["Cookies are small text files a website stores on your device. We also use similar technologies such as local storage and pixels; this policy refers to all of them as cookies."],
    },
    {
      id: "cookies-we-use",
      heading: "2. Cookies we use",
      paragraphs: ["We group cookies into four categories."],
      bullets: [
        "Strictly necessary (always on): air1_session keeps you signed in to your account; air1_booking_access lets a guest view the booking they just made; a CSRF token protects forms. These expire when you sign out or within 30 days.",
        "Preferences: remember your last search (origin, destination, dates, passengers) and your cookie choices so you are not asked every visit. Stored in your browser's local storage for up to 90 days.",
        "Analytics (with your consent): help us understand which pages are used and where the Site is slow. Data is aggregated and does not identify you personally.",
        "Advertising (with your consent): allow our advertising partners to show you relevant offers on other sites and to measure whether ads led to bookings. Disabling these does not reduce the number of ads you see, only their relevance.",
      ],
    },
    {
      id: "managing",
      heading: "3. Managing cookies",
      paragraphs: [
        "You can change your choices at any time using the cookie settings link in the footer. Your browser also lets you block or delete cookies; blocking strictly necessary cookies will prevent you from signing in and completing a booking. We honor the Global Privacy Control browser signal as an opt-out of advertising cookies.",
      ],
    },
    {
      id: "third-parties",
      heading: "4. Third-party cookies",
      paragraphs: ["Our payment processor sets cookies on the checkout page to detect fraud. Airlines' sites set their own cookies when you follow a link to them. We do not control third-party cookies; see the relevant provider's policy."],
    },
    {
      id: "contact",
      heading: "5. Questions",
      paragraphs: [`Email ${site.supportEmail} with any question about cookies or this policy.`],
    },
  ],
};

export const ACCESSIBILITY: LegalDoc = {
  slug: "accessibility",
  title: "Accessibility Statement",
  shortTitle: "Accessibility",
  description: `${site.name}'s commitment to an accessible website and booking experience, the standards we follow, and how to get help or report a problem.`,
  lastUpdated: "September 2026",
  summary: "We want everyone to be able to search, compare and book flights on Air1 Tickets, whatever technology they use. This statement describes what we do and how to reach us if something is not working for you.",
  sections: [
    {
      id: "commitment",
      heading: "1. Our commitment",
      paragraphs: [
        `${CO} is committed to making the Site conform to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA and to the accessibility requirements of the US Department of Transportation for ticket agents. Accessibility is part of our design and engineering process: every component is built with semantic HTML, keyboard support and sufficient color contrast, and automated and manual accessibility tests run on every release.`,
      ],
    },
    {
      id: "features",
      heading: "2. What we have done",
      paragraphs: ["The Site includes the following accessibility features:"],
      bullets: [
        "Full keyboard operation of the search form, results filters, date picker and checkout, with a visible focus indicator.",
        "A skip link to the main content on every page and a consistent heading structure.",
        "Labels, descriptions and error messages linked to every form field and announced by screen readers.",
        "Text contrast of at least 4.5:1 and no information conveyed by color alone.",
        "Layouts that reflow to 320px wide and text that can be resized to 200% without loss of content.",
        "Reduced motion respected via the operating system's setting.",
      ],
    },
    {
      id: "assistance",
      heading: "3. Booking assistance and special services",
      paragraphs: [
        `If any part of the Site is difficult to use, our US-based team can complete a booking for you by phone at ${site.supportPhone}, 24 hours a day, at the same price shown online and with no additional fee. We can also request wheelchair assistance, extra legroom for medical needs, service animal accommodation and other special services from the airline at the time of booking.`,
      ],
    },
    {
      id: "feedback",
      heading: "4. Feedback and reporting a problem",
      paragraphs: [
        `Please tell us if you encounter an accessibility barrier. Email ${site.supportEmail} with "Accessibility" in the subject, or use the contact form and choose "Website issue". Include the page address and the assistive technology you use. We aim to respond within two business days and to fix confirmed issues in the next release.`,
      ],
    },
    {
      id: "limitations",
      heading: "5. Known limitations",
      paragraphs: [
        "Some airline logos and generated destination artwork are decorative and hidden from screen readers. PDF documents supplied by airlines may not be fully accessible; contact us and we will provide the information in another format.",
      ],
    },
  ],
};

export const LEGAL_DOCS: LegalDoc[] = [TERMS, PRIVACY, COOKIES, ACCESSIBILITY];
