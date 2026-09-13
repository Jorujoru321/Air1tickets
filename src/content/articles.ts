/**
 * Long-form travel guides for /travel-guides/[slug].
 * Written for a US audience; facts current as of 2026.
 */
import type { Article } from "@/data/types";

const AUTHOR = { name: "Air1 Tickets Editorial Team", role: "Travel editors" };

export const ARTICLES: Article[] = [
  {
    slug: "how-to-find-cheap-flights",
    title: "How to Find Cheap Flights in 2026: 15 Strategies That Work",
    description:
      "Practical, tested ways to pay less for airfare — when to book, which days to fly, how to use alternate airports, fare alerts and fare classes.",
    category: "tips",
    publishedAt: "2026-01-14",
    updatedAt: "2026-08-20",
    author: AUTHOR,
    readingMinutes: 9,
    heroTheme: "city",
    gradient: ["#0b1d3a", "#2f93ef"],
    photoQuery: "airport departure board",
    intro:
      "Airfares are not random, but they are not fixed either. Airlines change prices constantly based on how many seats are left, how far away departure is and what competitors are charging. You cannot outsmart every rule, but a handful of habits reliably shave 20 to 40 percent off what a casual booker pays. Here are the ones that still work in 2026.",
    sections: [
      {
        heading: "Book in the right window, not on a magic day",
        paragraphs: [
          "The 'book on Tuesday at 3pm' advice is a leftover from the days when airlines loaded fares in weekly batches. Today prices update continuously. What still matters is how far ahead you book. For US domestic trips, fares are usually lowest between one and three months before departure, and they climb sharply inside 14 days as airlines sell the remaining seats to business travelers. For international trips the window moves earlier: two to six months out, and even earlier for peak periods like Christmas in Europe or summer in Japan.",
          "Booking too early is also a mistake. Airlines rarely release their cheapest fare buckets eleven months out, so the first price you see when a schedule opens is often not the best. If you have flexibility, set a price alert and watch the route for a few weeks before you commit.",
        ],
      },
      {
        heading: "Fly midweek and at unpopular hours",
        paragraphs: [
          "Tuesday, Wednesday and Saturday departures are consistently the cheapest days on domestic routes, because business travelers fly Monday and Thursday through Friday and leisure travelers cluster on Friday and Sunday. Shifting a trip by one day on each end routinely saves $50 to $150 per person. Time of day matters too: the first departure of the morning and red-eye flights are usually priced below the 8am and 5pm banks.",
          "The same logic applies to holidays. Flying on Thanksgiving Day itself or on December 25 is dramatically cheaper than flying the day before, and airports are quieter.",
        ],
      },
      {
        heading: "Check every airport within an hour",
        paragraphs: [
          "Large metro areas have two to five airports and fares between them can differ by hundreds of dollars. Newark versus JFK, Oakland versus San Francisco, Midway versus O'Hare, Fort Lauderdale versus Miami, Burbank versus LAX, Baltimore versus Reagan National: in each pair a low-cost carrier's presence at one airport drags fares down. Our search shows every airport by name, and route pages list the alternatives so you can compare in one click.",
          "The same trick works at your destination. Flying into Sanford instead of Orlando or Providence instead of Boston can be worth the extra drive if you are renting a car anyway.",
        ],
        bullets: [
          "New York: JFK, LaGuardia, Newark",
          "Chicago: O'Hare, Midway",
          "Bay Area: SFO, Oakland, San Jose",
          "Washington: Reagan, Dulles, Baltimore",
          "Los Angeles: LAX, Burbank, Long Beach, Orange County, Ontario",
        ],
      },
      {
        heading: "Compare the total, not the headline fare",
        paragraphs: [
          "Basic economy and ultra-low-cost fares look cheap because everything is stripped out. Add a carry-on ($40 to $75 on Spirit and Frontier), a checked bag ($35 to $60), a seat assignment and a change fee and the 'deal' can cost more than a standard fare that includes them. That is why our results show what each fare includes and let you filter for fares with a carry-on or checked bag.",
          "The rule of thumb: if you are traveling with a carry-on only and can accept a random seat, basic fares are a genuine saving. If you need a bag or want to sit with your family, price the main-cabin fare first.",
        ],
      },
      {
        heading: "Use fare alerts and be ready to act",
        paragraphs: [
          "The lowest fares on a route often last hours, not days. Airlines match a competitor's sale, then quietly raise prices once the cheap seats sell. A price alert on the exact route and dates you want means you hear about the drop while it is still available. When the alert fires, book — the US Department of Transportation's 24-hour rule lets you cancel for a full refund within a day of booking (for flights at least seven days out), so there is little risk in locking in a fare and thinking it over.",
        ],
      },
      {
        heading: "Consider one-ways, connections and open jaws",
        paragraphs: [
          "Domestic round trips are usually priced as two one-ways, so mixing airlines — flying out on Delta and back on JetBlue — can beat any single airline's round trip. Internationally the opposite is often true: round trips are cheaper than two one-ways, so book them together.",
          "A connection can cut a fare by 15 to 30 percent compared to a nonstop, especially on transcontinental and transatlantic routes. Decide what an hour of your time is worth; for a family of four, a $60 saving per ticket adds up. And 'open jaw' itineraries — into one city, home from another — cost little extra and save a backtracking leg on a road trip.",
        ],
      },
      {
        heading: "Watch for mistake fares and flash sales",
        paragraphs: [
          "Airlines publish sales almost weekly, usually on Tuesday or Wednesday, and occasionally misfile a fare (a decimal in the wrong place, a fuel surcharge omitted). Mistake fares are rare and airlines can cancel them, but genuine flash sales are common and predictable: late January, late summer and the weeks after major holidays are the busiest sale periods. Our deals page tracks the lowest fare per route over the next 90 days so you can spot a real drop against the usual price.",
        ],
      },
      {
        heading: "Fifteen tactics in one list",
        paragraphs: ["Bookmark this list and run through it before any trip."],
        bullets: [
          "Book domestic trips 1–3 months out, international 2–6 months out",
          "Fly Tuesday, Wednesday or Saturday",
          "Take the first flight of the day or a red-eye",
          "Compare every airport within an hour of home and destination",
          "Price basic economy against main cabin after adding bags and seats",
          "Set a fare alert and book within the 24-hour free-cancellation window",
          "Mix airlines on domestic round trips",
          "Accept one connection on long routes if the saving is meaningful",
          "Try open-jaw itineraries for road trips",
          "Fly on the holiday itself, not the day before",
          "Avoid school-break weeks and big events at your destination",
          "Use a card with no foreign transaction fee for international bookings",
          "Search for one passenger first — group fares are sometimes priced at the highest bucket that fits everyone",
          "Check nearby dates: shifting by a day or two often reveals a cheaper fare bucket",
          "Look at the deals page for the cheapest dates on your route before picking dates",
        ],
      },
    ],
    takeaways: [
      "Timing beats tricks: the booking window and day of week matter more than any secret.",
      "Alternate airports are the biggest single lever in multi-airport cities.",
      "Always price the total with bags and seats, not the headline fare.",
      "Fare alerts plus the 24-hour cancellation rule let you lock in drops with no risk.",
    ],
    faqs: [
      {
        question: "Is it cheaper to book flights at the last minute?",
        answer:
          "Almost never for domestic flights. Airlines raise prices inside two weeks of departure because the remaining seats sell to business travelers. Last-minute deals exist mainly on package tours and cruises, not flights.",
      },
      {
        question: "Does searching in incognito mode lower prices?",
        answer:
          "No. Airlines and search sites price by route, date and remaining inventory, not by your browsing history. Prices rise between searches because seats sell, not because you were tracked.",
      },
      {
        question: "Which day of the week is cheapest to fly?",
        answer:
          "Tuesday and Wednesday, followed by Saturday, on most US domestic routes. Friday and Sunday are the most expensive.",
      },
    ],
    relatedDestinations: ["las-vegas", "orlando", "cancun"],
    keywords: [
      "cheap flights",
      "how to find cheap flights",
      "best day to book flights",
      "airfare tips",
      "flight deals",
    ],
  },
  {
    slug: "best-time-to-book-flights",
    title: "The Best Time to Book Domestic and International Flights",
    description:
      "How far in advance to book for US domestic, Europe, Asia, Mexico and the Caribbean, plus the seasonal patterns that move fares up and down.",
    category: "tips",
    publishedAt: "2026-02-03",
    updatedAt: "2026-08-20",
    author: AUTHOR,
    readingMinutes: 7,
    heroTheme: "nature",
    gradient: ["#166534", "#93cdfb"],
    photoQuery: "airport terminal window airplane",
    intro:
      "Every fare study reaches the same broad conclusion: there is a booking window for each kind of trip, and prices rise steeply once you are inside it. Below is the practical version — how far ahead to book by destination type, which seasons cost the most, and how to read the fare calendar on our route pages.",
    sections: [
      {
        heading: "US domestic: one to three months ahead",
        paragraphs: [
          "For flights within the United States, the cheapest fares typically appear between about 28 and 90 days before departure. Airlines open schedules roughly 11 months out, but they hold back low-fare inventory until they see how a flight is selling. Prices are highest in the final two weeks, and the last three days can cost double the two-month price.",
          "Exceptions: holiday weeks (Thanksgiving, Christmas, spring break, July 4th) sell out early, so book those three to four months ahead. Routes with only one or two daily flights, such as small cities to hubs, also fill up faster than trunk routes like New York–Los Angeles.",
        ],
      },
      {
        heading: "Europe: two to six months ahead",
        paragraphs: [
          "Transatlantic fares bottom out earlier than domestic ones. For summer travel (June–August) book by February or March; for shoulder seasons (April–May, September–October) two to four months out is usually enough. Winter Europe is the bargain: January to early March fares from the East Coast can fall below $500 round trip, and even a month's notice is fine outside the holidays.",
          "Airline competition shapes prices as much as timing. Gateways with many carriers — New York, Boston, Chicago, Los Angeles, San Francisco — see sales more often than cities served by a single airline.",
        ],
      },
      {
        heading: "Asia, Australia and long-haul: three to eight months ahead",
        paragraphs: [
          "The longer the flight, the fewer the seats and the earlier the cheap ones vanish. For Tokyo, Seoul and Southeast Asia, book three to six months ahead; cherry-blossom season and Golden Week in Japan need six months or more. Australia and New Zealand are the extreme case: the Southern Hemisphere summer (December–February) fills up by August.",
        ],
      },
      {
        heading: "Mexico and the Caribbean: six weeks to three months",
        paragraphs: [
          "Cancún, Los Cabos, Punta Cana and Jamaica behave like domestic leisure routes: plenty of seats, plenty of airlines, and sales year-round. Six weeks to three months ahead is the sweet spot, except for Christmas week, spring break and Presidents' Day weekend, which sell out and should be booked three to four months out. Late summer and early fall (hurricane season) offer the lowest fares of the year for those willing to buy travel protection.",
        ],
      },
      {
        heading: "Seasons and events that move fares",
        paragraphs: [
          "Beyond the booking window, certain dates carry predictable premiums. Plan around them where you can.",
        ],
        bullets: [
          "Thanksgiving week and December 18 – January 3: 30–45% above normal on most routes",
          "Spring break (mid-March to early April): Florida, Mexico, the Caribbean and Hawaii spike",
          "Summer (June–mid-August): Europe and family destinations peak; US business routes soften",
          "Big events: Super Bowl, SXSW, Coachella, the Masters, F1 races, conventions — hotels double, flights rise",
          "January 6 – February 12: the cheapest stretch of the year almost everywhere",
          "September after Labor Day: the second-cheapest period, with excellent weather in most of the US and Europe",
        ],
      },
      {
        heading: "Reading the fare calendar",
        paragraphs: [
          "Each of our route pages shows the lowest fare for every day in the coming months and highlights the cheapest month and day of the week. Use it to pick dates before you commit: shifting a trip from a Friday–Sunday pattern to Tuesday–Saturday, or from the first week of a month to the second, often reveals a fare bucket $60 to $120 lower with the same airlines and flight times.",
          "Once you have a date in mind, set a price alert. If the fare drops after you book, remember that most US airlines now let you change flights without a fee on main-cabin fares — you receive the difference as a credit.",
        ],
      },
    ],
    takeaways: [
      "Domestic: 1–3 months ahead. Europe: 2–6 months. Long-haul Asia/Australia: 3–8 months.",
      "Holidays and events need an extra 1–2 months of lead time.",
      "January–early February and September are the cheapest periods almost everywhere.",
      "Use the fare calendar to move dates before you pay — day-of-week shifts save the most.",
    ],
    faqs: [
      {
        question: "How far in advance should I book a domestic flight?",
        answer:
          "One to three months before departure. Prices climb sharply inside 14 days, and holiday weeks should be booked three to four months out.",
      },
      {
        question: "Are flights cheaper if you book six months ahead?",
        answer:
          "For Europe and Asia in peak season, yes. For US domestic trips, six months is usually too early — airlines have not yet released their lowest fare buckets, so you may pay more than someone booking two months out.",
      },
      {
        question: "What is the cheapest month to fly?",
        answer:
          "January and February for most US and European routes, and September for Europe and domestic leisure destinations. The Caribbean and Mexico are cheapest in late summer and early fall.",
      },
    ],
    relatedDestinations: ["london", "tokyo", "punta-cana"],
    keywords: [
      "best time to book flights",
      "how far in advance to book flights",
      "cheapest month to fly",
      "when to buy plane tickets",
    ],
  },
  {
    slug: "basic-economy-vs-main-cabin",
    title: "Basic Economy vs. Main Cabin: What You Actually Get",
    description:
      "Airline by airline, what basic economy takes away — seats, bags, changes, boarding, miles — and when the cheaper fare is worth it.",
    category: "airlines",
    publishedAt: "2026-01-28",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 8,
    heroTheme: "city",
    gradient: ["#12244a", "#ff7f47"],
    photoQuery: "airliner cabin interior seats",
    intro:
      "Basic economy is the same seat, in the same cabin, on the same plane as main cabin. What you give up is flexibility and a few conveniences, and the difference is usually $30 to $70 each way. Whether that is a bargain or a trap depends on how you travel. Here is what each major US airline strips out in 2026 and how to decide.",
    sections: [
      {
        heading: "What every basic economy fare has in common",
        paragraphs: [
          "Across American, Delta and United, basic economy means: no advance seat selection (or a fee for it), boarding in the last group, no changes or refunds beyond the 24-hour rule, and reduced or no frequent-flyer earning on some carriers. You keep the same legroom, the same in-flight service and the same checked-bag pricing as main cabin. All three now allow a full-size carry-on on basic economy for domestic flights; United was the last holdout and removed its carry-on restriction on most routes in 2024.",
          "The important change since 2020: main cabin fares on the big three no longer carry change fees for domestic and most international routes. That makes the gap between basic and main mostly about flexibility and seats, not about avoiding a $200 penalty.",
        ],
      },
      {
        heading: "American Airlines",
        paragraphs: [
          "American's Basic Economy allows a carry-on and a personal item, assigns seats at check-in (you can pay for one earlier), boards last and cannot be changed. Since 2024 you earn fewer Loyalty Points and AAdvantage miles on basic fares. Main Cabin adds free seat selection at booking (standard seats), free changes and standard boarding.",
        ],
      },
      {
        heading: "Delta Air Lines",
        paragraphs: [
          "Delta Basic Economy is the strictest of the three on loyalty: no SkyMiles earning, no upgrades, no Sky Club access even with a card, and cancellation only as a credit minus a $99–$199 fee on domestic routes (no changes at all). You can pay for a seat after booking. Main Cabin restores miles, free seat selection and free changes; Comfort+ adds legroom and early boarding.",
        ],
      },
      {
        heading: "United Airlines",
        paragraphs: [
          "United Basic Economy allows a carry-on on domestic, Canada, Mexico and Caribbean flights (a personal item only on some transatlantic and South America routes — check the fare rules), assigns seats at check-in, boards last and cannot be changed or cancelled. Miles are earned at 50 percent. Economy (standard) adds seat selection, changes without a fee and full mileage earning.",
        ],
      },
      {
        heading: "JetBlue, Alaska and Southwest",
        paragraphs: [
          "JetBlue's Blue Basic allows a carry-on again (restored in 2024), boards last, and changes cost $50–$200 depending on route. Blue adds free seat selection and free changes. Alaska's Saver fare boards last, restricts seat choice to the back of the cabin and cannot be changed; Main restores everything.",
          "Southwest's 2025 overhaul created a Basic fare that cannot be changed, does not allow seat selection ahead of assigned seating (which began in 2026) and now, like Choice fares, charges for checked bags. Choice Preferred and Choice Extra include bags and seat choice. Southwest still allows a free carry-on on every fare.",
        ],
      },
      {
        heading: "Ultra-low-cost carriers: a different model",
        paragraphs: [
          "Spirit, Frontier and Allegiant unbundle further: their lowest fares (Go, Basic, Standard) include only a personal item that fits under the seat. A carry-on costs $40–$75 each way, a checked bag $40–$99, and seats are assigned randomly unless you pay. Their bundles (Go Comfy, Premium, Allegiant Extra) add bags and seats for $60–$120 and often end up close to a legacy main-cabin fare — compare the totals.",
        ],
      },
      {
        heading: "When basic economy is worth it",
        paragraphs: [
          "Basic economy is a genuine saving when all of the following are true. If any one is false, price the main-cabin fare first.",
        ],
        bullets: [
          "You are traveling with a carry-on only, or you would pay for a checked bag on either fare anyway",
          "You do not care where you sit, or you are traveling alone",
          "Your dates are certain — no chance of needing to change",
          "You are not chasing elite status or a mileage bonus",
          "You can board last without stress (overhead space may be gone on full flights with American and United, which sometimes gate-check basic economy bags for free)",
        ],
      },
    ],
    takeaways: [
      "Same seat, same cabin — basic economy removes flexibility, seat choice and boarding priority.",
      "Main cabin on the big three now has no change fees, so the gap is about seats and certainty.",
      "Families and travelers with checked bags usually do better on main cabin or a bundle.",
      "Ultra-low-cost carriers charge for carry-ons; add them before comparing.",
    ],
    faqs: [
      {
        question: "Can I bring a carry-on in basic economy?",
        answer:
          "On American, Delta, Alaska, JetBlue and Southwest, yes. United allows it on domestic and most nearby international routes but not on some long-haul basic fares. Spirit, Frontier and Allegiant charge for carry-ons on their lowest fares.",
      },
      {
        question: "Can I change or cancel a basic economy ticket?",
        answer:
          "Only within 24 hours of booking (for flights seven or more days out) under the US Department of Transportation rule. After that, basic economy fares on American and United are locked; Delta allows cancellation for a credit minus a fee; JetBlue charges a change fee.",
      },
      {
        question: "Will my family be seated together in basic economy?",
        answer:
          "Not guaranteed. Airlines have committed to seating children under 13 next to an adult when possible, but it is not a legal requirement on every fare. If sitting together matters, book main cabin or pay for seats.",
      },
    ],
    relatedDestinations: ["new-york", "orlando", "los-angeles"],
    keywords: [
      "basic economy vs main cabin",
      "what is basic economy",
      "basic economy carry-on",
      "airline fare classes explained",
    ],
  },
  {
    slug: "airline-baggage-fees-explained",
    title: "Airline Baggage Fees in 2026: What Each Carrier Charges",
    description:
      "Checked and carry-on bag fees for American, Delta, United, Southwest, JetBlue, Alaska, Spirit, Frontier and international airlines, with tips to avoid them.",
    category: "airlines",
    publishedAt: "2026-03-05",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 8,
    heroTheme: "city",
    gradient: ["#1a3a7a", "#ffc9ac"],
    photoQuery: "airport baggage claim carousel",
    intro:
      "Bag fees are the most common way a cheap fare becomes an expensive trip. Every major US airline now charges for checked bags on standard domestic fares — Southwest ended its free-bags policy in 2025 — and the ultra-low-cost carriers charge for carry-ons too. This guide lists what you will pay in 2026, where the exceptions are, and how to avoid the fees altogether.",
    sections: [
      {
        heading: "The big three: American, Delta, United",
        paragraphs: [
          "On domestic flights, the first checked bag typically costs $35 to $40 when paid online and $5 more at the airport; the second bag runs $45 to $50. Bags over 50 pounds or 62 linear inches carry oversize and overweight surcharges of $100 to $200. Carry-ons and personal items are free on main cabin and, on domestic routes, on basic economy as well. Transatlantic and transpacific economy fares on all three usually include one free checked bag; basic economy on those routes may not.",
          "Fees are waived for elite members, co-branded credit-card holders (usually the cardholder plus companions on the same reservation), active-duty military, and premium-cabin passengers.",
        ],
      },
      {
        heading: "Southwest's new bag policy",
        paragraphs: [
          "For decades Southwest's slogan was 'bags fly free'. That ended on May 28, 2025: Basic and Choice fares now charge about $35 for the first checked bag and $45 for the second. Choice Preferred includes one checked bag and Choice Extra includes two, as do Rapid Rewards A-List Preferred status and the Southwest credit cards (one bag). A carry-on and a personal item remain free on every Southwest fare.",
        ],
      },
      {
        heading: "JetBlue and Alaska",
        paragraphs: [
          "JetBlue charges roughly $35–$50 for a first checked bag depending on route and when you pay, with Blue Plus fares and Mosaic status including one. Alaska charges $35 for the first bag and $45 for the second; its co-branded card includes the first bag for the cardholder and up to six companions.",
        ],
      },
      {
        heading: "Spirit, Frontier and Allegiant",
        paragraphs: [
          "Ultra-low-cost carriers price bags dynamically by route, date and when you buy. Expect $40–$75 for a carry-on and $40–$99 for a checked bag when purchased at booking; the same bag bought at the gate can cost $100 or more. Weight limits are lower too (40 pounds checked on Frontier and Spirit versus 50 elsewhere), and overweight fees start at 41 pounds. Bundles such as Spirit's Go Comfy and Frontier's Premium include bags and are usually the better buy if you carry more than a backpack.",
        ],
      },
      {
        heading: "International airlines",
        paragraphs: [
          "Most full-service international carriers still include at least one checked bag in economy on long-haul routes — British Airways, Lufthansa, Air France, Emirates, Qatar, Japan Airlines and ANA among them (JAL and ANA include two on transpacific flights). Their cheapest 'light' or 'basic' fares are the exception: those add a bag fee of $60–$100 each way. Low-cost long-haul carriers such as Norse Atlantic charge for everything beyond a personal item.",
        ],
        bullets: [
          "Legacy transatlantic economy: usually 1 bag included (except 'light' fares)",
          "Japan Airlines, ANA, EVA, China Airlines: 2 bags included in economy",
          "Emirates, Qatar, Etihad: 1–2 bags included by fare type",
          "Norse Atlantic, Play, Level: pay per bag",
        ],
      },
      {
        heading: "How to avoid bag fees",
        paragraphs: [
          "A few habits eliminate most bag charges without giving up much.",
        ],
        bullets: [
          "Pay for bags at booking, never at the airport — the difference is $5–$60 per bag",
          "Use an airline credit card on the carrier you fly most; the free first bag usually pays for the annual fee in two trips",
          "Pack in a carry-on that meets the airline's size (22 x 14 x 9 inches is the common limit)",
          "Weigh bags at home; overweight fees dwarf the base charge",
          "On ultra-low-cost carriers, buy the bundle if you need both a carry-on and a checked bag",
          "Families: spread items across allowances, and remember car seats and strollers are free on all US carriers",
        ],
      },
      {
        heading: "Fees in one table",
        paragraphs: [
          "Typical first-checked-bag fees on domestic routes when paid online, as of mid-2026. Fees vary by route and date on some carriers; we show the exact allowance for each fare in search results.",
        ],
        bullets: [
          "American: $35 online, $40 at the airport; second bag $45",
          "Delta: $35 first, $45 second",
          "United: $35 online (up to $40 at the airport), $45 second",
          "Southwest: $35 first, $45 second on Basic and Choice; included on higher fares",
          "JetBlue: $35–$50 first depending on route and timing",
          "Alaska: $35 first, $45 second",
          "Spirit / Frontier: $40–$99 checked, $40–$75 carry-on, dynamic",
          "Allegiant: $35–$75 per bag, dynamic",
        ],
      },
    ],
    takeaways: [
      "Every major US airline now charges for checked bags on standard fares, including Southwest.",
      "Pay at booking; airport and gate prices are much higher.",
      "Airline credit cards and status remain the easiest way to fly bags free.",
      "Long-haul international economy usually includes a bag, except on 'light' fares.",
    ],
    faqs: [
      {
        question: "Does Southwest still have free checked bags?",
        answer:
          "No. Since May 28, 2025, Southwest charges about $35 for the first checked bag and $45 for the second on Basic and Choice fares. Choice Preferred and Choice Extra fares, A-List Preferred members and Southwest credit-card holders still get bags included.",
      },
      {
        question: "Is a carry-on free on Spirit and Frontier?",
        answer:
          "Only a personal item that fits under the seat is free. A full-size carry-on costs $40–$75 each way, sometimes more than a checked bag, unless you buy a bundle.",
      },
      {
        question: "How can I see the bag fee before I book?",
        answer:
          "Every fare in our search results shows whether a carry-on and checked bag are included and the fee for a first bag when they are not, so you can compare true totals.",
      },
    ],
    relatedDestinations: ["las-vegas", "miami", "denver"],
    keywords: [
      "airline baggage fees",
      "checked bag fees 2026",
      "Southwest bag fees",
      "carry-on fees Spirit Frontier",
    ],
  },
  {
    slug: "tsa-precheck-vs-global-entry-vs-clear",
    title: "TSA PreCheck vs. Global Entry vs. CLEAR: Which Is Worth It?",
    description:
      "What each program does, what it costs in 2026, how long enrollment takes and which combination makes sense for your travel pattern.",
    category: "airports",
    publishedAt: "2026-02-18",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 7,
    heroTheme: "city",
    gradient: ["#0b1d3a", "#5fb3f7"],
    photoQuery: "airport security checkpoint",
    intro:
      "Three programs promise to get you through the airport faster, and they do very different things. TSA PreCheck speeds up the security screening itself. Global Entry speeds up US immigration and customs when you return from abroad — and includes PreCheck. CLEAR skips the ID-check line but not the screening. Here is how they compare in 2026.",
    sections: [
      {
        heading: "TSA PreCheck",
        paragraphs: [
          "PreCheck gives you a dedicated security lane at more than 200 US airports where you keep shoes, belts and light jackets on and leave laptops and liquids in your bag. Most PreCheck waits are under 10 minutes. Enrollment costs about $77 to $85 for five years depending on the provider (IDEMIA, Telos or CLEAR handle enrollments), takes a 10-minute in-person appointment with fingerprinting, and approval usually arrives within a few days. Children 12 and under can use the lane with an enrolled parent; ages 13–17 can if their reservation carries the parent's Known Traveler Number.",
          "The catch: you must add your Known Traveler Number to every reservation — we ask for it at checkout — and airlines occasionally fail to print the PreCheck mark on a boarding pass, in which case the standard lane applies.",
        ],
      },
      {
        heading: "Global Entry",
        paragraphs: [
          "Global Entry is a US Customs and Border Protection program that lets you clear immigration on return to the US at a kiosk or, increasingly, through facial-recognition 'touchless' portals in under a minute instead of waiting in the passport line. It costs $120 for five years (raised from $100 in October 2024) and includes TSA PreCheck. Enrollment requires an online application, a background check that can take weeks to months, and an in-person interview — often completed on arrival at an international airport through 'Enrollment on Arrival' without an appointment.",
          "For anyone who takes even one international trip a year, Global Entry is the better buy: it costs $35–$45 more than PreCheck over five years and includes it. Many premium credit cards reimburse the fee.",
        ],
      },
      {
        heading: "CLEAR Plus",
        paragraphs: [
          "CLEAR is a private company that verifies your identity with fingerprints or an eye scan at a kiosk, then escorts you to the front of the screening line at about 60 US airports. It does not change the screening itself, so it works best combined with PreCheck: CLEAR takes you to the front of the PreCheck lane. CLEAR Plus costs $209 per year (with discounts for some credit-card holders and airline members), and family members can be added for $119 each. It is worth it mainly for frequent flyers at busy hubs such as Atlanta, Denver, Newark and San Francisco, where even the PreCheck line can stretch to 20 minutes at peak times.",
        ],
      },
      {
        heading: "REAL ID and what you need at the checkpoint",
        paragraphs: [
          "Since May 7, 2025, TSA has enforced the REAL ID requirement: a driver's license or state ID must be REAL ID-compliant (usually marked with a star) to be accepted at security. A valid passport, passport card, Global Entry card, military ID or permanent resident card also works. Travelers without compliant ID face extra verification, delays and possible denial. None of the trusted-traveler programs replaces this requirement — you still need acceptable ID in the PreCheck lane.",
        ],
      },
      {
        heading: "Which to choose",
        paragraphs: ["Match the program to how you fly."],
        bullets: [
          "Fly domestically 2+ times a year, never abroad: TSA PreCheck ($77–$85 / 5 years)",
          "Any international travel: Global Entry ($120 / 5 years, includes PreCheck)",
          "Frequent flyer through busy hubs: Global Entry + CLEAR Plus ($209 / year)",
          "Occasional traveler: skip all three and arrive two hours early, or use the free MPC (Mobile Passport Control) app on return to the US",
          "Families: enroll adults in Global Entry; children under 13 ride along in PreCheck but need their own Global Entry membership ($120 each) for the immigration kiosk",
        ],
      },
      {
        heading: "Enrollment tips",
        paragraphs: [
          "Apply for Global Entry three to six months before an international trip; conditional approval can take that long. Use Enrollment on Arrival to finish the interview when you land from abroad. Check whether your credit card reimburses the fee — most premium travel cards do every four to five years. And add your Known Traveler Number to your airline profiles and to every booking, including those made through Air1 Tickets, so PreCheck prints on your boarding pass.",
        ],
      },
    ],
    takeaways: [
      "PreCheck speeds security; Global Entry speeds immigration and includes PreCheck; CLEAR skips the ID line only.",
      "Global Entry at $120 for five years is the best value for anyone who leaves the country.",
      "REAL ID is enforced — a star-marked license or passport is required at every checkpoint.",
      "Add your Known Traveler Number to every reservation or PreCheck will not appear.",
    ],
    faqs: [
      {
        question: "How much does TSA PreCheck cost in 2026?",
        answer:
          "About $77 to $85 for a five-year membership depending on which enrollment provider you use. Renewals are slightly cheaper online.",
      },
      {
        question: "Does Global Entry include TSA PreCheck?",
        answer:
          "Yes. Global Entry membership ($120 for five years) includes PreCheck benefits; your PASSID doubles as your Known Traveler Number.",
      },
      {
        question: "Is CLEAR worth it?",
        answer:
          "Only if you fly often through large hubs where lines are long even for PreCheck. For most travelers, PreCheck or Global Entry alone is enough.",
      },
    ],
    relatedDestinations: ["new-york", "atlanta", "denver"],
    keywords: [
      "TSA PreCheck vs Global Entry",
      "CLEAR vs PreCheck",
      "Global Entry cost",
      "REAL ID airport",
    ],
  },
  {
    slug: "flight-delayed-or-canceled-your-rights",
    title: "Flight Delayed or Canceled? Your Rights Under US DOT Rules",
    description:
      "What airlines owe you when a flight is canceled or significantly delayed — automatic refunds, rebooking, meals and hotels — and how to claim it.",
    category: "guides",
    publishedAt: "2026-03-20",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 8,
    heroTheme: "city",
    gradient: ["#7f2c12", "#ffa477"],
    photoQuery: "airport departure board delayed",
    intro:
      "US passenger rights are narrower than Europe's, but they have expanded since 2024, and airlines often do more than the law requires if you know what to ask for. This guide covers the rules for cancellations, long delays, involuntary bumping and lost bags, and the practical steps that get you rebooked or refunded fastest.",
    sections: [
      {
        heading: "The automatic refund rule",
        paragraphs: [
          "Under the Department of Transportation's rule in effect since October 2024, airlines must automatically refund your ticket — in the original form of payment, without you having to ask — when they cancel your flight or 'significantly change' it and you choose not to travel. A significant change means a departure or arrival moved by three or more hours on a domestic flight or six or more hours internationally, a change of departure or arrival airport, added connections, a downgrade in class, or a switch to a plane less accessible for a disability.",
          "Refunds must be issued within seven business days for credit-card purchases and 20 calendar days for other payment methods. The refund covers the unused portion of the ticket plus any paid extras you could not use, such as seat selection or Wi-Fi. If you accept the airline's rebooking, no refund is due — so decide before you accept.",
        ],
      },
      {
        heading: "Checked bag fees and extras",
        paragraphs: [
          "The same rule requires airlines to refund checked bag fees when a bag is significantly delayed — more than 12 hours after a domestic flight arrives, or 15 to 30 hours after an international flight depending on its length — and to refund fees for services such as Wi-Fi or seat assignments that were paid for but not delivered. File the bag claim at the airport before you leave.",
        ],
      },
      {
        heading: "Delays and cancellations within the airline's control",
        paragraphs: [
          "Federal rules do not require compensation for delays, but the ten largest US airlines have made written commitments, tracked on the DOT's airline customer service dashboard, for 'controllable' disruptions — mechanical problems, crew scheduling, IT failures — as opposed to weather or air traffic control. All ten promise to rebook you on their own next flight free of charge and to provide a meal voucher after a three-hour delay. Most also commit to rebooking on a partner airline, a hotel and ground transport for overnight delays, and several offer frequent-flyer miles or credits for long controllable delays.",
          "Ask at the gate or via the airline's app, and cite the dashboard commitment. If the airline refuses, keep receipts and file a complaint with the DOT afterwards; airlines respond to those.",
        ],
      },
      {
        heading: "Weather and 'uncontrollable' disruptions",
        paragraphs: [
          "When weather, air traffic control or security issues cause the problem, airlines owe rebooking on their own flights and, if you decline, a refund of the unused ticket — but not meals or hotels. Travel protection bought at checkout typically covers those costs; check the policy's definition of a covered delay (often three to six hours). A credit card with trip-delay insurance can also reimburse hotel and meal costs after a set delay length if you paid for the ticket with that card.",
        ],
      },
      {
        heading: "Involuntary bumping",
        paragraphs: [
          "If an oversold flight leaves you without a seat and you did not volunteer, the airline owes cash compensation: 200 percent of your one-way fare up to $1,075 for a domestic arrival delay of one to two hours (one to four internationally), and 400 percent up to $2,150 for longer delays. Volunteers can negotiate — ask for cash or a card rather than a voucher with expiry dates, plus a confirmed seat on the next flight and meals.",
        ],
      },
      {
        heading: "Flights from Europe: EU261",
        paragraphs: [
          "For flights departing an EU airport, or arriving in the EU on an EU airline, European rule EC 261 requires fixed compensation of €250 to €600 for cancellations and delays of three hours or more that are within the airline's control, plus meals and hotels regardless of cause. The UK applies an equivalent rule. Claims can be filed directly with the airline for up to several years after the flight.",
        ],
      },
      {
        heading: "What to do in the moment",
        paragraphs: [
          "Speed matters when hundreds of passengers are competing for the same seats.",
        ],
        bullets: [
          "Rebook yourself in the airline's app the moment a cancellation notice arrives — it is faster than the counter",
          "Call the airline while standing in the customer-service line; whichever answers first wins",
          "Ask specifically for a partner-airline rebooking, a meal voucher and, if overnight, a hotel",
          "Decline the rebooking if you would rather have the automatic refund — you cannot have both",
          "Keep every receipt for meals, hotels and transport",
          "Contact Air1 Tickets 24/7: our agents can see all airlines' availability and rebook across carriers when the airline's own options are poor",
        ],
      },
    ],
    takeaways: [
      "Canceled or significantly changed flight? You are owed an automatic cash refund if you don't travel.",
      "The largest US airlines commit to free rebooking, meals and hotels for delays they control — ask for them.",
      "Weather delays mean rebooking or refund only; travel protection covers the rest.",
      "Involuntary bumping pays cash: up to $2,150 by law.",
    ],
    faqs: [
      {
        question: "Do airlines have to compensate me for a delayed flight?",
        answer:
          "Not by federal law, but the ten largest US airlines have committed to free rebooking, meals after three hours and hotels for overnight delays when the cause is within their control. For EU departures, EC 261 requires cash compensation for delays of three hours or more.",
      },
      {
        question: "How long does an airline refund take?",
        answer:
          "Seven business days for credit-card purchases and 20 calendar days for other methods, under DOT rules. Refunds must go back to the original form of payment, not a voucher, unless you choose a voucher.",
      },
      {
        question: "Can Air1 Tickets help if my flight is canceled?",
        answer:
          "Yes. Our US-based agents are available 24/7, can see availability across airlines, and will rebook you or process your refund. Call the number on your confirmation.",
      },
    ],
    relatedDestinations: ["chicago", "london", "denver"],
    keywords: [
      "flight canceled rights",
      "DOT refund rule",
      "flight delay compensation",
      "airline passenger rights",
    ],
  },
  {
    slug: "nonstop-vs-connecting-flights",
    title: "Nonstop vs. Connecting Flights: When a Layover Is Worth It",
    description:
      "How much a connection really saves, how long a layover should be, which hubs connect best and when to pay for the nonstop.",
    category: "tips",
    publishedAt: "2026-04-08",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 7,
    heroTheme: "mountain",
    gradient: ["#19305e", "#93cdfb"],
    photoQuery: "airliner wing above clouds",
    intro:
      "A connection is a trade: your time and a bit of risk for a lower fare. Sometimes the trade is excellent — $150 saved for 90 extra minutes. Sometimes it is a terrible deal that costs a night in a hub-city hotel. Here is how to judge it, based on the routes and hubs that dominate US travel.",
    sections: [
      {
        heading: "How much a connection saves",
        paragraphs: [
          "On busy nonstop routes — New York to Los Angeles, Chicago to Miami, Dallas to Denver — one-stop itineraries typically price 15 to 30 percent below the nonstop. On transatlantic routes the gap can be larger: connecting through Dublin, Lisbon, Reykjavik or a US hub often saves $100 to $250 round trip. Connections save the least on short routes, where the extra segment adds almost as much cost as it removes.",
          "Our results show nonstop and connecting options side by side with the price difference, so you can see the exact trade for your dates rather than guessing.",
        ],
      },
      {
        heading: "How long a layover should be",
        paragraphs: [
          "Airlines sell connections as short as 30 to 45 minutes domestically, which are legal but leave no margin. A safer rule: 60–90 minutes for a domestic connection at a large hub, 90 minutes to two hours when connecting from a domestic to an international flight, and two to three hours when arriving from abroad into the US, because you clear immigration and customs and re-check bags before the onward flight.",
          "If the two flights are on one ticket and you miss the connection because the first flight was late, the airline must rebook you at no charge. If you booked two separate tickets, you are on your own — which is why we combine flights on a single itinerary wherever the airlines allow it.",
        ],
        bullets: [
          "Domestic to domestic: 60–90 minutes",
          "Domestic to international: 90 minutes to 2 hours",
          "International arrival into the US: 2–3 hours (immigration, customs, bag re-check)",
          "Preclearance airports (Dublin, Shannon, Abu Dhabi, Aruba, Nassau, Canadian hubs): arrive as a domestic passenger, so 60–90 minutes suffices on arrival",
        ],
      },
      {
        heading: "Hubs that connect well — and badly",
        paragraphs: [
          "Some hubs make connections painless: Atlanta's Plane Train links all concourses in minutes; Denver, Salt Lake City, Detroit and Charlotte are compact or well designed; Dallas/Fort Worth's Skylink is fast. Others are notorious: JFK and LAX often require leaving security to change terminals, Chicago O'Hare's Terminal 5 is far from the others, and Newark's terminals are connected only by bus. Internationally, Amsterdam, Singapore, Doha and Zurich are easy; Heathrow's terminal transfers and Paris CDG's size deserve extra time.",
        ],
      },
      {
        heading: "The hidden costs of connecting",
        paragraphs: [
          "Every extra segment is another chance for a delay, a bag to go astray or a weather cancellation at the hub. Winter connections through Chicago, Denver or the Northeast carry real risk; summer thunderstorms hit Atlanta, Dallas and Florida. If your trip has a hard deadline — a cruise departure, a wedding, a business meeting — the nonstop (or an earlier connection with a long buffer) is cheap insurance. Overnight layovers add a hotel; a 'red-eye plus connection' can cost you a vacation day of sleep.",
        ],
      },
      {
        heading: "When to pay for the nonstop",
        paragraphs: [
          "Take the nonstop, even at a premium, when any of these apply.",
        ],
        bullets: [
          "The saving is under $60 per person or under 10 percent of the fare",
          "You are traveling with small children or a mobility limitation",
          "You have a fixed arrival deadline the same day",
          "The connection is in a winter-weather hub in December–February",
          "The connecting itinerary is 4+ hours longer than the nonstop",
        ],
      },
      {
        heading: "Making the most of a layover",
        paragraphs: [
          "A long connection can be an asset. Icelandair, TAP, Turkish and Emirates all sell free or cheap stopovers of one to several days. Even a five-hour layover is enough to see downtown Atlanta (20 minutes by train), central Amsterdam (15 minutes) or Singapore's Jewel and its indoor waterfall without leaving the airport. Lounges via day passes or credit cards turn a three-hour wait into a shower and a meal.",
        ],
      },
    ],
    takeaways: [
      "Connections save 15–30% on busy routes, more on transatlantic trips.",
      "Give yourself 60–90 minutes domestic, 2–3 hours arriving into the US from abroad.",
      "One ticket = protected connection; separate tickets = your problem.",
      "Pay for the nonstop when the saving is small or the deadline is firm.",
    ],
    faqs: [
      {
        question: "Is a 45-minute layover enough?",
        answer:
          "It is legal and usually works at compact hubs on the same airline, but leaves no margin for a late inbound flight. Choose 60–90 minutes if the option exists for a similar price.",
      },
      {
        question: "Do I have to collect my bag during a connection?",
        answer:
          "Not on a single domestic or international-departing ticket — bags are checked through. On arrival into the US from abroad you must collect bags, clear customs and re-check them, even if you are connecting on the same airline.",
      },
      {
        question: "What happens if I miss a connection?",
        answer:
          "If both flights are on one ticket, the airline rebooks you free on its next available flight and, for a controllable cause, provides meals or a hotel. On separate tickets you must buy a new flight; travel protection may reimburse it.",
      },
    ],
    relatedDestinations: ["atlanta", "denver", "dublin"],
    keywords: [
      "nonstop vs connecting flights",
      "how long should a layover be",
      "best connecting airports",
      "layover tips",
    ],
  },
  {
    slug: "red-eye-flights-guide",
    title: "Red-Eye Flights: Pros, Cons and How to Survive One",
    description:
      "Why overnight flights are cheaper, who they suit, and the seat, sleep and arrival-day tactics that make a red-eye work.",
    category: "tips",
    publishedAt: "2026-04-22",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 6,
    heroTheme: "nightlife",
    gradient: ["#071229", "#5b2a86"],
    photoQuery: "airport terminal at night",
    intro:
      "Red-eyes — flights that depart late at night and arrive the next morning — are the cheapest seats on transcontinental and Hawaii routes and the standard way to cross the Atlantic. Done right, they save a hotel night and a vacation day. Done wrong, they wreck the first day of your trip. Here is how to decide and how to sleep.",
    sections: [
      {
        heading: "Why red-eyes are cheaper",
        paragraphs: [
          "Airlines price by demand, and most travelers prefer daytime flights. A 10pm departure from Los Angeles arriving in New York at 6am fills only if the fare is attractive, so red-eyes are routinely 10 to 25 percent cheaper than the same route at 8am. Airlines also use them to position aircraft for morning departures, so the flights operate whether or not they are full — good for fares and for last-minute availability.",
          "Red-eyes exist mainly on eastbound routes where time zones help: West Coast to East Coast, Hawaii to the mainland, and North America to Europe. Westbound overnight flights are rare because you would arrive in the middle of the night.",
        ],
      },
      {
        heading: "Who should take one",
        paragraphs: [
          "Red-eyes work well for some travelers and poorly for others.",
        ],
        bullets: [
          "Good fit: adults who sleep easily, business travelers saving a workday, anyone saving a hotel night, families with kids who sleep on planes",
          "Poor fit: light sleepers, travelers with an important morning meeting or a wedding on arrival day, anyone with a tight connection the next morning",
        ],
      },
      {
        heading: "Choosing the right flight and seat",
        paragraphs: [
          "Later departures (11pm or midnight) let you go to sleep at a normal hour; a 9pm red-eye means dinner service and lights at midnight. Flights of five hours or more give a real sleep window; a three-hour Denver–New York red-eye barely does. On the plane, a window seat lets you lean and avoids being woken by seatmates; avoid the last row (no recline, galley noise) and bulkhead rows where infant bassinets sit. Premium economy or lie-flat business on transcontinental routes (JetBlue Mint, Delta One, American Flagship, United Polaris) is the upgrade most worth paying for on an overnight flight.",
        ],
      },
      {
        heading: "How to actually sleep",
        paragraphs: [
          "Small habits make the difference between four hours of sleep and none.",
        ],
        bullets: [
          "Eat before the airport and skip the in-flight meal so you can sleep from takeoff",
          "Bring a real neck pillow, an eye mask and foam earplugs or noise-cancelling headphones",
          "Skip alcohol and caffeine after mid-afternoon; both fragment sleep at altitude",
          "Dress in layers — cabins get cold over the Rockies and the Atlantic",
          "Set your watch to the destination time zone before boarding",
          "Drink water; cabin humidity is desert-dry",
        ],
      },
      {
        heading: "Managing the arrival day",
        paragraphs: [
          "Plan a soft landing: a hotel that allows early check-in or holds bags, a shower, and a light schedule until lunch. Get outside in daylight as soon as possible — it resets your body clock faster than anything else — and hold off on a nap until at least mid-afternoon, keeping it under 30 minutes. Transatlantic arrivals in Europe are typically 7–10am; resist going to bed before 9pm local time and the jet lag clears in a day or two.",
        ],
      },
      {
        heading: "Red-eyes and the fare rules",
        paragraphs: [
          "Red-eyes also interact with the rest of your itinerary in ways worth checking before you book. A red-eye that lands at 6am followed by a 7:15am connection is legal but fragile: any delay strands you at a hub at dawn with few rebooking options until the morning bank. Give yourself at least 90 minutes, and if the connection is international, two hours. On the return, an evening arrival home after a red-eye out means two disrupted nights in one trip — consider a daytime flight back.",
          "One quirk to watch: a red-eye's date is its departure date, so a flight leaving at 11:30pm Friday and landing Saturday morning is a Friday flight for booking, check-in and 24-hour cancellation purposes. Our results flag red-eyes and show '+1' next to arrival times so you know exactly which day you land, and the calendar export puts each segment on the correct date in your time zone.",
        ],
      },
    ],
    takeaways: [
      "Red-eyes save 10–25% and a hotel night on eastbound routes.",
      "Pick departures of 11pm or later and flights of five hours or more for real sleep.",
      "Window seat, eye mask, no alcohol, water — the basics work.",
      "Plan a light arrival morning with daylight and a short afternoon nap at most.",
    ],
    faqs: [
      {
        question: "Are red-eye flights cheaper?",
        answer:
          "Usually. Overnight departures are 10–25% cheaper than daytime flights on the same route because fewer people want them.",
      },
      {
        question: "What counts as a red-eye flight?",
        answer:
          "A flight departing roughly between 9pm and 1am and arriving the following morning. They operate mainly eastbound: West Coast to East Coast, Hawaii to the mainland and North America to Europe.",
      },
      {
        question: "Are red-eyes safe with kids?",
        answer:
          "Many parents prefer them — children often sleep through the flight. Bring familiar comfort items, board last so they are not waiting on the plane, and plan a quiet arrival morning.",
      },
    ],
    relatedDestinations: ["new-york", "honolulu", "london"],
    keywords: [
      "red-eye flights",
      "overnight flight tips",
      "how to sleep on a plane",
      "red eye flight meaning",
    ],
  },
  {
    slug: "flying-with-a-baby-checklist",
    title: "Flying With a Baby or Toddler: The Complete Checklist",
    description:
      "Lap infants vs. seats, car seats and strollers, documents, TSA rules for formula and milk, and a packing list for flights with children under 3.",
    category: "guides",
    publishedAt: "2026-05-06",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 8,
    heroTheme: "tropical",
    gradient: ["#00a3a1", "#ffc9ac"],
    photoQuery: "airport terminal family travel",
    intro:
      "The first flight with a baby feels like a logistics exam. It is easier than it looks once you know the rules on lap infants, car seats, strollers and security, and pack for the three things that go wrong on every flight: hunger, ear pressure and a blowout. This checklist covers children under three from booking to landing.",
    sections: [
      {
        heading: "Lap infant or a seat of their own?",
        paragraphs: [
          "Children under two may fly on a parent's lap. On US domestic flights lap infants are free (some airlines charge only taxes); on international flights they cost about 10 percent of the adult fare plus taxes. One lap infant per adult is the limit. The child must be under two on the date of each flight — a return trip after a second birthday requires a seat for that leg.",
          "The FAA and every pediatric body recommend a separate seat with an approved car seat for infants, because a lap-held child cannot be restrained in turbulence. It costs a full fare (child discounts are rare on US airlines) but gives you a free arm and a familiar sleep spot. Many families compromise: lap infant on short flights, a seat on anything over three hours. When you book with us, choose 'Infant (on lap)' or 'Child' in the traveler picker accordingly.",
        ],
      },
      {
        heading: "Car seats and strollers",
        paragraphs: [
          "All US airlines let you check a car seat and a stroller free of charge, either at the counter or at the gate. Gate-checking the stroller means you can use it through the terminal and pick it up at the aircraft door on arrival. A car seat labeled 'certified for use in motor vehicles and aircraft' can be used on board in a purchased seat (not in an exit row, and generally at a window). Booster seats are not approved for use in flight.",
        ],
      },
      {
        heading: "Documents",
        paragraphs: [
          "What you need depends on where you fly and whether both parents are traveling.",
        ],
        bullets: [
          "Domestic: airlines may ask for proof of age for a lap infant — carry a birth certificate copy or passport",
          "International: every child needs their own passport; Mexico, Canada and many countries also ask for a notarized consent letter when one parent travels alone with the child",
          "Add the infant to the booking before travel — airlines need the record for weight and balance and for oxygen mask counts (limited lap infants per row)",
          "Bring a pediatric insurance card and a copy of immunization records for international trips",
        ],
      },
      {
        heading: "Airport security with a baby",
        paragraphs: [
          "TSA allows formula, breast milk, juice and baby food in quantities over 3.4 ounces; declare them at the checkpoint and expect a separate screening. Ice packs and cooling accessories for milk are permitted. Strollers and car seats go through the X-ray or are inspected by hand. Babies can stay in a carrier through the metal detector at the officer's discretion. TSA PreCheck members can bring children 12 and under through the PreCheck lane.",
        ],
      },
      {
        heading: "Choosing flights and seats",
        paragraphs: [
          "Book flights that align with nap times, and consider a red-eye only if your child sleeps well in a carrier or seat. Request a bulkhead row with a bassinet on long-haul international flights — most airlines offer them free for infants under about 25 pounds, but they must be reserved by phone. Otherwise choose a window and aisle in the same row (the middle often stays empty on lighter flights, and if not, the occupant will swap). Board early to install a car seat, or board last with a lap infant to minimize time on the plane.",
        ],
      },
      {
        heading: "Ears, feeding and the diaper bag",
        paragraphs: [
          "Pressure changes hurt small ears during descent more than takeoff. Feeding, a pacifier or a bottle during the final 30 minutes helps.",
        ],
        bullets: [
          "Diapers for double the flight time, wipes, two changes of clothes (one for you), zip bags for soiled items",
          "Formula pre-measured in a dispenser plus bottled water (ask the crew for warm water)",
          "Snacks that take time to eat: puffs, pouches, crackers",
          "A few new small toys and a downloaded show for toddlers",
          "A lightweight blanket and a muslin for cover, spills and shade",
          "Children's acetaminophen or ibuprofen dosed for their weight, plus saline drops for a stuffy nose",
        ],
      },
      {
        heading: "On arrival",
        paragraphs: [
          "Rental car companies rent car seats but quality varies; many families bring their own (it flies free). For international arrivals, families with infants can usually use the shorter 'families' lanes at immigration. Give everyone a slow first day — jet lag hits toddlers hardest on day two.",
        ],
      },
    ],
    takeaways: [
      "Lap infants fly free domestically and ~10% of the fare internationally; a seat with a car seat is safer for long flights.",
      "Car seats and strollers check free on every US airline; gate-check the stroller.",
      "Formula and breast milk are exempt from the liquids limit — declare them at TSA.",
      "Feed or offer a pacifier during descent to protect small ears.",
    ],
    faqs: [
      {
        question: "Do babies fly free?",
        answer:
          "On US domestic flights, children under two on a parent's lap fly free (some carriers collect taxes). On international flights lap infants typically cost 10% of the adult fare plus taxes. A child in their own seat pays a full fare.",
      },
      {
        question: "Can I bring breast milk or formula through security?",
        answer:
          "Yes. TSA exempts breast milk, formula and baby food from the 3.4-ounce liquid limit in reasonable quantities. Tell the officer at the start of screening; the containers may be tested separately.",
      },
      {
        question: "Does my baby need a passport for Mexico or the Caribbean?",
        answer:
          "Yes — every traveler, including infants, needs a valid passport for international flights. Passport processing for children requires both parents' consent, so apply at least 8–10 weeks before travel.",
      },
    ],
    relatedDestinations: ["orlando", "honolulu", "cancun"],
    keywords: [
      "flying with a baby",
      "lap infant rules",
      "car seat on plane",
      "TSA formula breast milk",
      "flying with toddler tips",
    ],
  },
  {
    slug: "first-time-international-travel-checklist",
    title: "First International Trip? A Step-by-Step Checklist for Americans",
    description:
      "Passports, visas and ETAs, phone plans, money, insurance, arrival logistics and what to do before, during and after your first flight abroad.",
    category: "guides",
    publishedAt: "2026-05-27",
    updatedAt: "2026-08-25",
    author: AUTHOR,
    readingMinutes: 9,
    heroTheme: "historic",
    gradient: ["#1e293b", "#f59e0b"],
    photoQuery: "passport and boarding pass",
    intro:
      "More than half of Americans have never flown outside the country, and the first trip raises a hundred small questions: does my passport need six months' validity, will my phone work, do I need cash, what happens at customs? This checklist walks through everything in order, from three months before departure to the day you get home.",
    sections: [
      {
        heading: "Three months out: passport and entry requirements",
        paragraphs: [
          "Apply for or renew your passport first — routine processing takes four to six weeks and expedited two to three, plus mailing time. Many countries require validity of six months beyond your arrival or departure date, and airlines enforce it at check-in, so renew anything expiring within nine months of your trip. Every traveler, including infants, needs their own passport book; the passport card works only for land and sea travel to Canada, Mexico and the Caribbean.",
          "Then check the entry rules for your destination on the State Department's country pages. US citizens visit most of Europe, Japan, Mexico and the Caribbean without a visa, but pre-registration is spreading: the UK requires an Electronic Travel Authorisation (ETA) since January 2025, Australia and New Zealand require ETAs, Canada does not for Americans, and the EU's ETIAS system is expected to begin — check its official site before any Schengen trip. India, China, Vietnam, Brazil and others require visas or e-visas that take days to weeks.",
        ],
      },
      {
        heading: "Two months out: bookings, insurance and health",
        paragraphs: [
          "Book flights in the two-to-six-month window for the best fares, and pay with a card that has no foreign transaction fee and includes trip-delay or cancellation protection. Consider travel insurance — our checkout offers plans that cover medical care abroad, which US health insurance and Medicare usually do not. Check the CDC's destination page for recommended vaccines; some, like yellow fever for parts of South America and Africa, require an appointment weeks ahead. Enroll in the State Department's free STEP program so the embassy can reach you in an emergency.",
        ],
      },
      {
        heading: "One month out: money and phones",
        paragraphs: [
          "Two things trip up first-time travelers more than anything else: card declines and phone bills.",
        ],
        bullets: [
          "Tell your bank the travel dates (or set a travel notice in the app) and confirm your card has no foreign transaction fee",
          "Carry two cards from different networks and a small amount of local currency from an ATM on arrival — airport exchange counters charge 5–10%",
          "Always choose to pay in the local currency when a terminal offers dollars; 'dynamic currency conversion' costs 3–7%",
          "Phones: most US carriers sell international day passes ($10–$12/day); an eSIM from Airalo or the destination carrier is far cheaper for a week or more",
          "Download offline maps, your airline app, a translation app and your booking confirmations before you leave",
          "Check whether you need a plug adapter (Type G for the UK, Type C/F for most of Europe) and whether devices support 220–240 volts (phones and laptops do; most hair dryers do not)",
        ],
      },
      {
        heading: "One week out: documents and packing",
        paragraphs: [
          "Photograph your passport, driver's license, cards and confirmations and store them in a cloud folder; leave copies with someone at home. Print or save the address of your first hotel — immigration forms and ride-hail apps ask for it. Complete any required arrival forms online (Aruba's ED card, the Dominican e-ticket, Jamaica's C5, Visit Japan Web, Thailand's digital arrival card). Pack medications in original containers with a copy of the prescription, and check that none are restricted at your destination (some common US decongestants and ADHD medications are controlled in Japan and the UAE).",
        ],
      },
      {
        heading: "Departure day",
        paragraphs: [
          "Arrive three hours before an international flight — check-in closes 60 minutes before departure on most airlines, and passport checks slow the bag drop. Bring a REAL ID or passport for TSA. On the plane, fill in any paper arrival card the crew hands out, keep a pen in your bag, and set your watch to destination time.",
        ],
      },
      {
        heading: "Arrival: immigration, customs and getting into town",
        paragraphs: [
          "Follow signs for arrivals/immigration, join the 'all passports' or 'visitors' lane, and have your passport, any ETA or visa confirmation and your first-night address ready. Collect bags, then pass through customs — 'nothing to declare' unless you carry goods over the duty-free limit, food, plants or large sums of cash. Use ATMs inside the terminal for local currency, then take the transport you researched: rail links (London, Paris, Tokyo, Amsterdam) are usually the fastest and cheapest; official taxi ranks or prebooked transfers beat touts in the arrivals hall.",
        ],
      },
      {
        heading: "Coming home",
        paragraphs: [
          "Returning US citizens can use the free Mobile Passport Control (MPC) app at most major airports to skip the paper form and often the line; Global Entry members use the kiosks or facial-recognition portals. You can bring back up to $800 of goods duty-free (including one liter of alcohol and 200 cigarettes for adults), and you must declare all food and agricultural products. If you connect onward in the US, you will collect and re-check your bags after customs — allow at least two hours for that connection.",
        ],
      },
    ],
    takeaways: [
      "Renew your passport if it expires within nine months of the trip; every traveler needs their own.",
      "Check entry requirements early — the UK ETA and other pre-registrations are now common.",
      "Use no-foreign-fee cards, pay in local currency, and get cash from ATMs, not exchange counters.",
      "Arrive three hours early, keep your first-night address handy, and use rail links or official taxis on arrival.",
    ],
    faqs: [
      {
        question: "Does my passport need to be valid for six months?",
        answer:
          "Many countries require it — including most of Asia and the Middle East and, in practice, the Schengen area (three months beyond departure). Airlines enforce these rules at check-in, so renew anything expiring within nine months of travel.",
      },
      {
        question: "Do I need travel insurance for an international trip?",
        answer:
          "It is strongly recommended. Most US health plans and Medicare do not cover medical care abroad, and evacuation can cost tens of thousands of dollars. Plans offered at checkout typically include medical, evacuation, cancellation and baggage coverage.",
      },
      {
        question: "Will my US phone work abroad?",
        answer:
          "Yes with an international plan or eSIM. Carrier day passes cost about $10–$12 per day; an eSIM for the destination country usually costs $10–$30 for a week or more of data. Turn off data roaming until you have a plan to avoid surprise charges.",
      },
    ],
    relatedDestinations: ["london", "paris", "tokyo", "mexico-city"],
    keywords: [
      "first international trip checklist",
      "international travel tips",
      "passport validity rules",
      "what to do before traveling abroad",
    ],
  },
];

export const ARTICLE_CATEGORY_LABELS: Record<Article["category"], string> = {
  tips: "Tips & tricks",
  guides: "Guides",
  airports: "Airports & security",
  airlines: "Airlines & fares",
};

export const ARTICLES_BY_CATEGORY: Record<Article["category"], Article[]> = {
  tips: ARTICLES.filter((a) => a.category === "tips"),
  guides: ARTICLES.filter((a) => a.category === "guides"),
  airports: ARTICLES.filter((a) => a.category === "airports"),
  airlines: ARTICLES.filter((a) => a.category === "airlines"),
};

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug.toLowerCase());
}
