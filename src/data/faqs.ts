/**
 * FAQ content for Air1 Tickets.
 *
 * Rendered on the Help Center, reused on booking pages, and emitted as
 * FAQPage JSON-LD. Answers are written for a US audience, in plain English,
 * and are deliberately conservative about promises: every policy stated here
 * must be one we actually honor.
 *
 * Facts worth knowing when editing:
 *  - US DOT 24-hour rule: free cancellation within 24 h of purchase when the
 *    ticket was bought at least 7 days before departure. Air1 applies it to
 *    every fare it sells.
 *  - US DOT automatic-refund rule (in effect since October 2024): cash refund
 *    for canceled or significantly changed flights the passenger declines;
 *    7 business days for card purchases, 20 calendar days otherwise.
 *  - REAL ID enforcement at TSA checkpoints began May 7, 2025.
 *  - Southwest started charging for checked bags on tickets bought from late
 *    May 2025.
 *  - DOT "significant change" (14 CFR 260.2): departure 3 h or more earlier or
 *    arrival 3 h or more later on domestic itineraries; 6 h or more international.
 *  - Allegiant sells only through its own website, app, and call center (no
 *    GDS / OTA distribution), so never list it as bookable here.
 *  - Only promise product features that exist in docs/ARCHITECTURE.md
 *    (Manage Booking lookup, checkout extras, price calendar). Anything else
 *    is "contact support".
 */
import type { FAQ, FAQGroup } from "@/data/types";
import { site } from "@/lib/site";

const address = `${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}`;

export const FAQ_GROUPS: FAQGroup[] = [
  /* ───────────────────────────── About ───────────────────────────── */
  {
    id: "about",
    title: "About Air1 Tickets",
    items: [
      {
        question: "Who is Air1 Tickets?",
        answer:
          `Air1 Tickets is a US-based online travel agency that helps you compare and book flights on hundreds of airlines. We are headquartered in San Francisco, California, and our customer support team is based in the United States and available 24 hours a day, 7 days a week by phone. When you book with us, the airline issues your ticket in the normal way: you receive the airline's own record locator and e-ticket numbers, so you can check in, choose seats, and manage your trip directly with the carrier as well as through us. We have been booking flights for travelers since ${site.founded}.`,
      },
      {
        question: "How does Air1 Tickets make money?",
        answer:
          "We charge a service fee on each booking. That fee is included in the price you see in search results, and it appears as its own line item on the checkout page before you enter payment details, so there are no surprises after you pay. Some airlines also pay us a small commission or incentive for bookings; those payments come from the airline and never change the fare you pay. Optional extras you add at checkout, such as travel insurance or a flexible ticket, are priced separately and clearly labeled. We do not sell your personal information to advertisers.",
      },
      {
        question: "Is it safe to book flights on Air1 Tickets?",
        answer:
          "Yes. Every page on our site is served over an encrypted HTTPS connection, and card payments are processed by a PCI DSS compliant payment processor. We never store your full card number on our servers. Your ticket is issued by the airline itself, and within minutes of booking you receive both our Air1 reference and the airline's record locator, which you can use to verify the reservation directly on the airline's website. If a ticket cannot be issued for any reason, we do not keep your money: the payment is refunded or the authorization is released. Our support team is in the United States and reachable 24/7.",
      },
      {
        question: "Is Air1 Tickets an accredited travel agency?",
        answer:
          `Tickets sold on Air1 Tickets are issued through accredited airline ticketing channels, so what you receive is a real airline e-ticket: a 13-digit ticket number for each passenger and the airline's own record locator, not a voucher or a promise to book later. You can confirm any reservation on the airline's website within minutes of booking using the record locator we email you. ${site.legalName} is a US company headquartered in San Francisco, California. If you need documentation for a corporate travel policy or an expense claim, contact our support team; we can provide an itemized receipt, the airline's e-ticket receipt, and our company details.`,
      },
      {
        question: "Where is Air1 Tickets located?",
        answer:
          `Our headquarters is at ${address}. We are a US company, we price everything in US dollars, and our customer support is based in the United States. We do not have a walk-in ticket counter, so the fastest way to reach us is by phone at ${site.supportPhone}, by email at ${site.supportEmail}, or through our Contact page. For legal notices, refund disputes, or requests about your personal data, write to us at the address above or email us; postal mail is answered within 10 business days.`,
      },
      {
        question: "Is booking with Air1 Tickets the same as booking directly with the airline?",
        answer:
          "The ticket is identical: the airline issues it, your seat is in the airline's system, and you check in with the airline. The difference is in the shopping and the service. We compare fares across airlines in a single search, show all-in prices with taxes and our fee included, and give you one place to manage every trip. If something goes wrong, our US-based team can work with the airline on your behalf. A few things are only available directly from the airline, such as redeeming frequent-flyer miles, so we point that out where it applies.",
      },
      {
        question: "Which airlines can I book with Air1 Tickets?",
        answer:
          "We sell tickets on the major US network carriers (American, Delta, United), other US airlines such as Southwest, JetBlue, and Alaska, low-cost carriers such as Frontier and Sun Country, and a wide range of international carriers, including most members of the oneworld, SkyTeam, and Star Alliance groups. Search results show the marketing airline on each flight, and if a regional partner or codeshare partner operates the aircraft, we say so on the flight details. Some carriers, such as Allegiant, sell only through their own website and app and will not appear in our results. If you do not see an airline you expect, check its page under Airlines for the routes we cover.",
      },
    ],
  },

  /* ─────────────────────── Searching & Booking ─────────────────────── */
  {
    id: "booking",
    title: "Searching & Booking",
    items: [
      {
        question: "How does flight search on Air1 Tickets work?",
        answer:
          "Enter your origin, destination, dates, passengers, and cabin, and we query fares from hundreds of airlines in real time. Results are shown as complete itineraries, including connections, with an all-in price per adult that already includes taxes, government fees, and our service fee. You can filter by stops, airlines, departure and arrival times, price, and total duration, and sort by best, cheapest, or fastest. Prices are live at the time of the search; when you select an itinerary we re-check the fare with the airline before you pay, and we tell you if it has changed.",
      },
      {
        question: "What do Best, Cheapest, and Fastest mean in the sort options?",
        answer:
          "Cheapest sorts strictly by total price, lowest first. Fastest sorts by total travel time from departure to final arrival, including layovers. Best is our balanced ranking: it weighs price against total duration, the number of stops, layover length, and awkward departure or arrival times, and puts itineraries that score well on all of them at the top. For example, a nonstop that costs $20 more than a two-stop itinerary will usually rank higher under Best. The labels shown on result cards use the same definitions. None of the sort options are influenced by which airline pays us more.",
      },
      {
        question: "Why did the price change between search and checkout?",
        answer:
          "Airlines sell seats in price bands, and when the last seat in a band is sold the next one costs more. Fares also change with demand, time to departure, and airline pricing updates that happen many times a day. Search results are accurate when we fetch them, but a fare can move before you finish. Before you pay, we re-price your selected itinerary with the airline; if the total went up or down, we show the new price and ask you to confirm. You are never charged a different amount than the one on the payment page.",
      },
      {
        question: "Can I hold a fare or lock in a price?",
        answer:
          "We do not offer paid fare holds, but you have two options. First, book the ticket: for flights booked at least 7 days before departure, you can cancel for a full refund within 24 hours of purchase, which effectively lets you hold a price for a day while you finalize plans. Second, use the price calendar on our route pages and in the date picker: it shows the lowest fare for each day of the month, so you can see whether shifting your dates by a day or two saves money before you commit. Airline fares typically rise sharply inside 14 days before departure, so if the price looks reasonable, waiting rarely pays off.",
      },
      {
        question: "Can I book a flight for someone else?",
        answer:
          "Yes. Enter the traveler's details exactly as they appear on their government-issued ID, and use your own email and phone as the contact if you want to receive the confirmation and updates. The name on the payment card does not have to match the passenger name. If you are booking for a child traveling alone, check the airline's unaccompanied-minor rules first: most US airlines require those tickets to be booked directly with the airline and charge an escort fee. For a group of more than nine passengers, contact our support team; airline systems limit online bookings to nine seats.",
      },
      {
        question: "What name should I enter when booking?",
        answer:
          "Enter each passenger's first and last name exactly as printed on the government-issued ID they will travel with: a driver's license or state ID for US domestic flights, and the passport for international flights. Include a middle name if it appears on the ID. Airline systems ignore hyphens, apostrophes, and spaces, so O'Brien and OBrien are treated the same. Nicknames and shortened names (Bill for William) can cause problems at security. Tickets cannot be transferred to another person. Most airlines will correct a minor typo free of charge if you contact us promptly; substantial name changes are treated as a new ticket.",
      },
      {
        question: "Can I pay with airline miles or credit card points?",
        answer:
          "Not on Air1 Tickets. We accept card payments only. Frequent-flyer miles must be redeemed directly with the airline, and bank points (such as Chase Ultimate Rewards or Amex Membership Rewards) can be used only through the card issuer's own travel portal or by transferring them to an airline program. You can still add your frequent-flyer number to each passenger at checkout so you earn miles on eligible fares. Note that Basic Economy and some deeply discounted fares earn reduced or zero miles under many airline programs; check the fare rules on the flight details panel.",
      },
      {
        question: "Can I book a multi-city trip?",
        answer:
          "Multi-city search is not available yet; it is on our roadmap and we will announce it on the site when it launches. Today you can search round-trip and one-way itineraries. For an open-jaw trip (fly into one city and home from another), book two one-way tickets. This works well within the US, where one-way fares are usually about half the round trip. On many international routes a round-trip fare is cheaper than two one-ways, so compare before booking. Keep in mind that separate tickets are not protected as a single itinerary if a delay causes you to miss the next flight.",
      },
    ],
  },

  /* ─────────────────────── Payments & Pricing ─────────────────────── */
  {
    id: "payments",
    title: "Payments & Pricing",
    items: [
      {
        question: "Which payment methods do you accept?",
        answer:
          "We accept Visa, Mastercard, American Express, and Discover credit and debit cards. The card does not need to be in the passenger's name, but the billing address must match the address on file with your card issuer. We do not accept PayPal, bank transfers, checks, prepaid cards without a registered billing address, or cryptocurrency. Debit cards work, but for trips booked far in advance we recommend a credit card, because card networks provide stronger dispute protection if an airline stops operating. All payments are processed by a PCI DSS compliant processor, and we never store your full card number.",
      },
      {
        question: "Are taxes and fees included in the prices I see?",
        answer:
          "Yes. The price on each result card is the total per adult, including the base fare, government taxes and fees (such as the US September 11th Security Fee, Passenger Facility Charges, and the federal excise tax), airline-imposed surcharges, and our service fee. The US Department of Transportation requires airfare advertising to show the full price, and we apply that to every price on the site. Optional purchases, such as checked bags, seat selection, priority boarding, insurance, and a flexible ticket, are added only if you choose them, and the checkout summary shows every line before you pay.",
      },
      {
        question: "What currency are prices shown in?",
        answer:
          "All prices are shown and charged in US dollars (USD). We do not offer currency selection. If your card was issued outside the United States, your bank will convert the charge to your card's currency at its own exchange rate and may add a foreign transaction fee, typically 1 to 3 percent. The amount on your card statement can therefore differ slightly from the USD total on your receipt. For refunds, we return the USD amount to the original card; exchange-rate movements between purchase and refund are outside our control and can result in a small difference.",
      },
      {
        question: "When is my card charged?",
        answer:
          "Your card is authorized when you click Pay and charged when the airline confirms the ticket, which usually takes less than a minute. Depending on the airline, you may see a single charge from Air1 Tickets for the full amount, or a charge from the airline for the fare and a separate charge from Air1 Tickets for the service fee and any extras. Either way, the combined total matches the amount on the payment page. If the airline cannot issue the ticket, for example because the last seat sold while you were paying, we do not complete the charge and any authorization is released.",
      },
      {
        question: "Why do I see a pending charge but no confirmation?",
        answer:
          "A pending charge is an authorization hold placed by your bank while the ticket is issued; it becomes a real charge only when the booking is confirmed. If the booking failed, the hold drops off on its own, usually within 3 to 7 business days depending on your bank. If you see a pending amount and have not received a confirmation email within 30 minutes, check your spam folder, then look up your booking on Manage Booking using the reference from the checkout page. If it does not show as confirmed, contact us before trying to book again so you are not charged twice.",
      },
      {
        question: "Do you offer a price-match or best-price guarantee?",
        answer:
          "We do not offer a price-match guarantee. Airfares change continuously and can be lower or higher on another site, or on the airline's own site, at any moment. What we do promise is that the price on the payment page is exactly what you are charged, that all mandatory taxes, fees, and our service fee are already included in the prices in search results, and that if a fare changes between selecting a flight and paying, we show you the new total before you confirm. If a fare drops right after you book, the 24-hour rule lets you cancel free and rebook, provided you booked at least 7 days before departure.",
      },
      {
        question: "How do I get a receipt or invoice?",
        answer:
          "Your confirmation email includes an itemized receipt showing the base fare, taxes and fees, our service fee, and any extras, along with the airline ticket numbers. You can view and print the same receipt at any time from Manage Booking by entering your Air1 reference and last name. The receipt shows the name and billing address entered at checkout, which is usually sufficient for expense reports. If your employer requires a specific format, contact support with your booking reference. Airline e-ticket receipts, which some corporate policies require, are also available on the airline's website using the record locator.",
      },
      {
        question: "Can I split the payment across two cards or pay in installments?",
        answer:
          "No. Each booking must be paid in full with a single card at checkout. If several travelers want to pay separately, book a separate reservation for each payer. Keep in mind that separate reservations are not linked in the airline's system, so if you need to sit together, choose seats on each booking after ticketing. We do not offer buy-now-pay-later plans. Some credit card issuers let you convert a purchase into installments afterward through their own apps; that arrangement is between you and your card issuer and does not change anything on our side.",
      },
    ],
  },

  /* ─────────────── Changes, Cancellations & Refunds ─────────────── */
  {
    id: "changes",
    title: "Changes, Cancellations & Refunds",
    items: [
      {
        question: "Can I cancel for free within 24 hours of booking?",
        answer:
          "Yes. If your first flight departs 7 or more days after the date of purchase, you can cancel within 24 hours of booking for a full refund to your original payment method, including our service fee and any extras. This follows the US Department of Transportation's 24-hour rule, which applies to airline tickets to, from, and within the United States, and we apply it to every fare we sell, including Basic Economy. To cancel, look up the trip on Manage Booking and request the cancellation there, or call us 24/7 with your Air1 reference; the timestamp on your confirmation email marks the start of the 24-hour window. Bookings made less than 7 days before departure are not covered.",
      },
      {
        question: "How much does it cost to change my flight?",
        answer:
          "It depends on the fare rules, which we show on the flight details panel before you book. American, Delta, United, Alaska, and JetBlue no longer charge change fees on most standard economy and premium fares for travel within the US, but you pay any difference in fare. Basic Economy fares are usually not changeable at all, or only for a fee. Ultra-low-cost carriers set their own rules: Frontier's cheapest Basic fare carries a change fee that rises the closer to departure you change, while its bundled fares can be changed without a fee. The major US carriers have also dropped change fees on most standard international fares that start in the US, but many foreign airlines still charge $100 to $400 to change a discounted international economy fare. Same-day changes have their own rules and fees.",
      },
      {
        question: "What happens if the airline cancels or significantly changes my flight?",
        answer:
          "Under a US Department of Transportation rule in effect since October 2024, if an airline cancels your flight or makes a significant change and you choose not to travel, you are entitled to an automatic refund to your original payment method, even on a non-refundable fare. A significant change means a departure moved 3 hours or more earlier, or an arrival moved 3 hours or more later, on a domestic itinerary (6 hours or more on an international one), a different departure or arrival airport, an added connection, a downgrade to a lower class of service, or a change that makes the trip less accessible for a passenger with a disability. If you accept the alternative flight the airline offers instead, no refund is due.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "For airline-initiated cancellations and significant changes, the DOT requires the refund to be issued within 7 business days for credit card purchases and 20 calendar days for other payment methods. Refunds you request yourself, such as a 24-hour cancellation or a refundable fare, are usually processed on the same timeline. After the refund is issued, your bank may take a further 5 to 10 business days to post it to your statement. We refund our service fee together with the fare whenever the fare itself is refunded. If a refund has not appeared 15 business days after our confirmation email, contact support with your Air1 reference and we will trace it.",
      },
      {
        question: "How do I change or cancel a booking with Air1 Tickets?",
        answer:
          "Go to Manage Booking, enter your Air1 reference (it starts with A1) and the last name on the booking, and request a change or cancellation, or call us 24/7 with your reference. For changes, tell us the new dates or flights you want; we quote the airline's change fee, the fare difference, and our change-handling fee (if any) before you confirm, and nothing is charged until you approve. Changes must be completed before the original flight departs. For same-day changes at the airport, it is usually faster to speak to the airline directly using the record locator on your confirmation.",
      },
      {
        question: "What happens if I miss my flight or do not show up?",
        answer:
          "If you miss the first flight of a round-trip or connecting itinerary without telling the airline, most carriers cancel every remaining segment, including the return, and the ticket loses its value. To protect the rest of the trip, contact the airline or call us before the scheduled departure, even if you are already at the airport. Basic Economy tickets are usually forfeited entirely. On standard fares, many airlines will let you keep the value as a credit, minus any applicable fee, if you cancel before departure. No-show policies differ by airline, so read the fare rules on your confirmation.",
      },
      {
        question: "What is a refundable fare, and is it worth it?",
        answer:
          "A refundable fare lets you cancel at any time before departure and receive your money back to the original card, minus any fee the airline specifies. It typically costs significantly more than the non-refundable equivalent. For most trips a non-refundable standard fare is the better value: the 24-hour rule covers you right after purchase, US airlines no longer charge change fees on most standard domestic fares, and the DOT refund rule covers airline cancellations. Consider a refundable fare when your plans are genuinely uncertain, or look at the Flexible Ticket option at checkout, which is offered on changeable fares only and lets you change dates without paying the airline's change fee (fare differences still apply; fares the airline does not allow to be changed at all, such as most Basic Economy tickets, are not eligible).",
      },
      {
        question: "Can I get a refund on a non-refundable ticket?",
        answer:
          "Outside the 24-hour window, a non-refundable ticket is not refunded for a voluntary cancellation. Instead, most airlines let you cancel before departure and keep the value as a travel credit, usually valid for 12 months from the original purchase date and often usable only by the same passenger. There are exceptions where a cash refund is due even on a non-refundable fare: the airline cancels or significantly changes the flight, a passenger or an immediate family member dies (documentation required), or a passenger receives military orders. Government taxes and fees, such as the Passenger Facility Charge, are sometimes refundable even when the fare is not.",
      },
    ],
  },

  /* ─────────────────────────── Baggage & Seats ─────────────────────────── */
  {
    id: "baggage",
    title: "Baggage & Seats",
    items: [
      {
        question: "What is the difference between a carry-on bag and a personal item?",
        answer:
          "A personal item is a small bag that fits under the seat in front of you: a purse, laptop bag, or small backpack, typically no larger than about 18 x 14 x 8 inches. A carry-on is the larger bag that goes in the overhead bin, usually limited to 22 x 14 x 9 inches including wheels and handles on American, Delta, and United. Most standard fares on US airlines include one of each at no charge. Airlines do not usually weigh carry-ons on domestic flights, but many international carriers enforce a limit of 15 to 22 pounds, so check the airline's page before you fly.",
      },
      {
        question: "Does Basic Economy include a carry-on bag?",
        answer:
          "It depends on the airline. United Basic Economy includes only a personal item on most routes; a full-size carry-on must be checked for a fee at the airport. American, Delta, JetBlue, and Alaska Basic Economy fares include a personal item and a standard carry-on. Ultra-low-cost carriers such as Frontier and Spirit do not include a carry-on in their cheapest fare; you either pay for it or buy a higher fare bundle that includes it, and the fee is lowest when you add it during booking rather than at the gate. We show the carry-on allowance for each fare on the flight details panel and again at checkout, so check it before you choose the cheapest option.",
      },
      {
        question: "How much do checked bags cost?",
        answer:
          "On major US airlines a first checked bag typically costs $35 to $45 each way, and a second bag $45 to $55, for a bag up to 50 pounds and 62 linear inches. Southwest, which long offered two free bags, began charging for checked bags on tickets bought from late May 2025. Several airlines charge a few dollars more if you pay at the airport instead of in advance. Most premium cabins, many international economy fares, and many airline credit cards include one free bag. Where the airline allows it, you can prepay bags at checkout with us; otherwise, add them on the airline's website after ticketing.",
      },
      {
        question: "Where can I see the baggage allowance for my fare?",
        answer:
          "Before you book, open the flight details panel on any result: it lists the fare brand (for example Basic Economy or Main Cabin) with the carry-on and checked-bag allowance and the first-bag fee. The same information appears in the checkout summary and on your confirmation email. After booking, the airline's website shows your exact allowance when you enter the record locator. On itineraries with more than one airline, the baggage rules of the first marketing carrier normally apply to the whole journey, but connecting on separate tickets means each airline applies its own rules and you may pay twice.",
      },
      {
        question: "Is seat selection free?",
        answer:
          "It depends on the fare. On most standard economy fares, standard seats can be chosen free of charge, while extra-legroom rows and seats near the front cost extra. Basic Economy fares usually do not include seat selection; the airline assigns a seat at check-in, or you can pay to choose one. Low-cost carriers charge for seat assignments on their cheapest fares. We show the seat policy for each fare (free, paid, or assigned at check-in) on the flight details panel. Where the airline allows it, you can pick seats during checkout; otherwise use the airline's website after ticketing. Alaska, American, Frontier, and JetBlue guarantee that children 13 and under sit next to an accompanying adult at no charge when adjacent seats are available at booking; other US airlines try to do so but do not guarantee it, so book early and choose seats together where you can.",
      },
      {
        question: "How do I fly with an infant or small child?",
        answer:
          "Children under 2 can travel on an adult's lap. On US domestic flights a lap infant usually flies free; on international flights the airline typically charges 10 percent of the adult fare plus taxes. Add the infant during search so the fare includes them, and be ready to show proof of age. If you prefer your infant in their own seat, buy a child fare and bring an FAA-approved car seat; the FAA recommends this as the safest option. A child who turns 2 during the trip needs a paid seat for the flights after their birthday. Children aged 2 to 11 pay the child fare, which on most airlines is the same as an adult fare.",
      },
      {
        question: "Can I bring sports equipment or oversized items?",
        answer:
          "Most major US airlines now accept common sports equipment, including golf bags, skis, snowboards, and bicycles in a case, as a standard checked bag at the normal bag fee, as long as the item stays under 50 pounds. Items over 50 pounds or larger than 62 linear inches carry an overweight or oversize fee, usually $100 to $200 each way, and some items, such as surfboards, have their own fixed fee. Policies differ by airline and by route, so check the airline's baggage page before you fly. You cannot add sports equipment through our checkout; add it on the airline's website or at the check-in counter.",
      },
      {
        question: "What items are not allowed in checked or carry-on bags?",
        answer:
          "Federal rules limit liquids in carry-ons to containers of 3.4 ounces (100 ml) or less that fit in one quart-size bag. Spare lithium batteries and power banks must go in your carry-on, never in checked luggage. Firearms may be checked only if unloaded, in a locked hard-sided case, and declared at check-in. Fireworks, fuel, and most compressed gases are banned entirely. Prescription medication and medically necessary liquids are allowed in reasonable quantities and should be kept with you. The TSA's What Can I Bring tool at tsa.gov covers thousands of items, and international destinations may have stricter rules on food, plants, and other goods.",
      },
    ],
  },

  /* ──────────── Check-in, Airport & Travel Documents ──────────── */
  {
    id: "travel",
    title: "Check-in, Airport & Travel Documents",
    items: [
      {
        question: "How do I check in for my flight?",
        answer:
          "Check in directly with the airline, not with Air1 Tickets. Online and mobile check-in opens 24 hours before departure on almost every airline, and you will need the airline's record locator (the six-character code on your confirmation email) plus the passenger's last name. Checking in early gets you a boarding pass on your phone and, on airlines with unassigned seating, a better spot in line. For international flights the airline may require you to enter passport details before issuing a boarding pass. If online check-in is not offered, use a kiosk or the counter at the airport; check-in typically closes 45 to 60 minutes before departure.",
      },
      {
        question: "What ID do I need to fly within the United States?",
        answer:
          "Since May 7, 2025, the TSA requires adult passengers (18 and over) to show a REAL ID-compliant driver's license or state ID, marked with a star in the top corner, or another acceptable ID such as a US passport or passport card, a DHS trusted traveler card (Global Entry, NEXUS, SENTRI), a permanent resident card, a US military ID, or an enhanced driver's license. A standard, non-compliant license no longer counts as acceptable ID: travelers who arrive without acceptable ID face an extra identity-verification process, delays, a fee, and possible denial at the checkpoint. If your license does not comply, a passport is the simplest alternative. Children under 18 traveling with an adult do not need ID for domestic flights, though some airlines ask for proof of age for young children.",
      },
      {
        question: "How much passport validity do I need for international travel?",
        answer:
          "Many countries require your passport to be valid for at least six months beyond your date of entry or planned departure; this includes much of Asia, the Middle East, and South America. The Schengen countries of Europe require three months of validity beyond your planned departure date and a passport issued within the last ten years. Canada and Mexico require only that the passport be valid for the length of your stay. Airlines enforce these rules at check-in and will deny boarding if your passport falls short, and the ticket is then treated as a no-show. Check the destination's entry requirements on travel.state.gov before booking, and renew early; routine US passport processing takes several weeks.",
      },
      {
        question: "Do I need an ESTA or a visa?",
        answer:
          "ESTA is the electronic authorization that citizens of Visa Waiver Program countries need before traveling to the United States. US citizens do not need an ESTA. Instead, US passport holders should check whether the destination requires a visa or its own electronic travel authorization. For example, the United Kingdom requires US visitors to obtain an Electronic Travel Authorization (ETA) before departure, and the European Union has announced a similar system, ETIAS; check the official EU website for its start date. Apply only through official government sites, because third-party sites charge unnecessary fees. If you are not a US citizen, confirm the requirements for your nationality with the destination's embassy or consulate.",
      },
      {
        question: "How do I add TSA PreCheck or Global Entry to my booking?",
        answer:
          "Enter your Known Traveler Number (KTN) in the passenger details at checkout, and make sure the name and date of birth match your PreCheck or Global Entry enrollment exactly. The airline then prints the TSA PreCheck indicator on your boarding pass. If you forgot, add the KTN to the airline's reservation before checking in. TSA PreCheck membership costs roughly $77 to $85 for five years depending on the enrollment provider; Global Entry costs $120 for five years and includes PreCheck. PreCheck is not available on every airline or at every airport, and even members are not guaranteed to receive it on every trip.",
      },
      {
        question: "What should I do if my flight is delayed or canceled?",
        answer:
          "First, check the airline's app: airlines usually rebook you automatically, and the app is the quickest way to change flights. If the new option does not work, call the airline or contact us and we will work with the carrier. Under US law you are entitled to a full refund if the airline cancels or significantly changes your flight and you choose not to travel. For delays and cancellations caused by the airline (crew, maintenance), most US airlines have committed to rebooking you free of charge, providing a meal after a three-hour delay, and covering a hotel for an overnight disruption. You can compare each airline's commitments on the DOT dashboard at flightrights.gov. US law does not require cash compensation for delays.",
      },
      {
        question: "How early should I arrive at the airport?",
        answer:
          "Plan to arrive 2 hours before a domestic departure and 3 hours before an international one; add time at large hubs such as Atlanta, Los Angeles, or New York JFK, during holidays, and if you are checking bags. Airlines set their own cutoffs: check-in and bag drop typically close 45 minutes before a domestic flight and 60 minutes before an international one, and boarding gates usually close 15 minutes before departure. Arriving after the cutoff counts as a no-show. Passengers with TSA PreCheck can often save 20 to 30 minutes, but security wait times vary widely; many airports publish live security wait times on their websites and apps.",
      },
      {
        question: "Are the flight times shown in local time?",
        answer:
          "Yes. Every departure and arrival time on Air1 Tickets is shown in the local time of that airport, which is the same convention airlines and airports use. A flight leaving New York at 9:00 AM and arriving in Los Angeles at 12:15 PM is in the air for about 6 hours 15 minutes because of the 3-hour time difference; we show the total duration on every result so you do not need to do the math. Overnight flights and long connections are flagged with +1 or +2 when you arrive on a later calendar date. For early departures, set your phone alarm in the time zone of the airport you are leaving from.",
      },
    ],
  },

  /* ───────────────────────── Account & Support ───────────────────────── */
  {
    id: "support",
    title: "Account & Support",
    items: [
      {
        question: "Do I need an account to book?",
        answer:
          "No. You can book as a guest with just an email address and phone number, and you will still receive the full confirmation, receipt, and access to Manage Booking. Creating a free account keeps all your trips in one place, so you do not need to look each one up by reference. If you book as a guest and later create an account with the same email address, those bookings are linked to your account after you verify the email address. We never ask for your password over the phone; support verifies you with your booking reference and last name.",
      },
      {
        question: "How do I find or manage my booking?",
        answer:
          "Open Manage Booking from the top of any page and enter your Air1 reference (eight characters beginning with A1, shown in the subject line of your confirmation email) and the last name of any passenger on the booking. From there you can view the full itinerary and receipt, and request changes, extra bags or seats, or a cancellation. Changes to the airline's own record, such as check-in, seat maps, and special meals, are handled on the airline's website using the six-character record locator we email you. If you cannot find your reference, contact support with the email address used at checkout.",
      },
      {
        question: "How do I contact Air1 Tickets support?",
        answer:
          `Our US-based support team answers the phone 24 hours a day, every day, at ${site.supportPhone}. You can also email ${site.supportEmail} or write to us through the Contact page; we reply to emails within one business day, and within a few hours when the trip departs in the next 72 hours. For the fastest help, have your Air1 reference and the passenger's last name ready. For issues at the airport on the day of travel, such as a missed connection, contacting the airline directly is often quickest, and we can follow up on anything the airline cannot resolve.`,
      },
      {
        question: "Which confirmation email should I keep: the Air1 one or the airline's?",
        answer:
          "Keep both, but our confirmation is the complete one. It contains your Air1 reference (for Manage Booking and support), the airline record locator (the six-character code you use to check in and manage seats with the airline), the 13-digit e-ticket number for each passenger, the full itinerary, and an itemized receipt. The airline may send its own email as well, but some carriers do not email bookings made through travel agencies. Our confirmation is sent within minutes of payment; if it has not arrived within 30 minutes, check your spam folder and confirm the email address on the booking. The same details are always available on Manage Booking, and support can resend the email on request.",
      },
      {
        question: "What is the difference between the Air1 reference and the airline record locator?",
        answer:
          "The Air1 reference (A1 followed by six characters) identifies your booking with us. Use it for Manage Booking, receipts, changes, cancellations, and any conversation with our support team. The airline record locator, also called a PNR or confirmation code, is a six-character code that identifies the same trip in the airline's system; use it to check in, select seats, add a frequent-flyer number, or speak to the airline. When an itinerary includes more than one airline, you may receive a different record locator for each carrier. The e-ticket number, 13 digits starting with the airline's code, is what proves the ticket was paid for and issued.",
      },
      {
        question: "How do you protect my personal data?",
        answer:
          "We collect only what is needed to issue and manage your ticket: names, dates of birth, contact details, and, for international trips, passport information. Passenger details are shared with the airline and, as required by law, with the TSA's Secure Flight program and border authorities. We do not sell personal data, and we do not share it with advertisers. Card details go directly to our payment processor and are never stored on our servers. You can request a copy of your data or ask us to delete it by emailing support; we keep booking records only as long as accounting and legal obligations require. Full details are in our Privacy Policy.",
      },
      {
        question: "How do I request wheelchair assistance or travel with a service animal?",
        answer:
          "Airlines provide wheelchair assistance and other accommodations under the Air Carrier Access Act, and it is free. Request assistance as early as possible and at least 48 hours before departure: add it to the airline's reservation using your record locator, or contact our support team and we will add it for you. Service dogs fly in the cabin at no charge; most US airlines require the DOT Service Animal Air Transportation Form, submitted up to 48 hours before travel. Emotional support animals are no longer recognized as service animals and are treated as pets, subject to the airline's pet policy and fee. If you need extra time to board or help with a connection, tell the gate agent.",
      },
      {
        question: "Can I change the email address or phone number on my booking?",
        answer:
          "Yes. Contact our support team with your Air1 reference and the last name on the booking, and we will update the email address or phone number free of charge; the new email then receives all future notifications, including schedule changes from the airline. Updating contact details does not affect the ticket itself. If you booked for someone else and want the traveler to receive updates directly, add their email as the traveler's contact rather than replacing yours, so that both of you are notified. Passenger names, dates of birth, and passport details are different: they are part of the airline ticket and can be corrected only through a change request, which may carry a fee.",
      },
    ],
  },
  {
    id: "price-lock",
    title: "Price lock & last-minute deals",
    items: [
      {
        question: "What is a price lock?",
        answer:
          "When you find a fare you like, you lock it instead of paying for it. We record the exact itinerary and price you saw, hold it for 48 hours, and an agent confirms with you on WhatsApp, Messenger or by phone. The locked price is the most you will pay for that itinerary. It is free and needs no card.",
      },
      {
        question: "How does the last-minute deal work?",
        answer:
          "Airline fares move right up to departure, and our agents watch them for you. One to two days before you fly we re-check every airline for your route and send you a final quote, which is usually below the price you locked. You accept it and pay, we issue the ticket with the airline, and you receive the e-ticket and airline confirmation code by email.",
      },
      {
        question: "Do I pay anything when I lock a fare?",
        answer:
          "No. Locking is free and there is no obligation. You pay only when you accept the final deal an agent sends you. If you change your mind, simply tell the agent or let the lock expire.",
      },
      {
        question: "How quickly will someone contact me?",
        answer:
          "Within about 15 minutes during business hours on the channel you chose, usually WhatsApp. Outside business hours you will hear from us first thing the next morning. Your lock reference (for example L-7K2M9Q) lets any agent pull up your fare instantly.",
      },
      {
        question: "What if the price goes up before you send my deal?",
        answer:
          "Your locked price is a ceiling. If fares rise after you lock, you still pay no more than the locked amount for the same itinerary. If fares fall, you get the lower price. The lock is valid for 48 hours from the time you lock and can be extended by an agent when you are still deciding.",
      },
      {
        question: "Can I just message you instead of filling in the form?",
        answer:
          "Yes. Every fare has a WhatsApp button that opens a chat with the flight details already filled in, and the Messenger button works the same way. The form simply makes sure we have your email and a reference so nothing gets lost.",
      },
      {
        question: "Is it safe to share my details?",
        answer:
          "We only ask for a name, a phone number and an email so an agent can reach you. We never ask for card details in chat; when you accept a deal you receive a secure payment link. See our privacy policy for how we store and protect your information.",
      },
    ],
  },
];

/** Every FAQ across all groups, in display order. Handy for FAQPage JSON-LD and search. */
export const ALL_FAQS: FAQ[] = FAQ_GROUPS.flatMap((group) => group.items);

/** Look up a group by its id ("about", "booking", "payments", "changes", "baggage", "travel", "support", "price-lock"). */
export function getFaqGroup(id: string): FAQGroup | undefined {
  return FAQ_GROUPS.find((group) => group.id === id);
}
