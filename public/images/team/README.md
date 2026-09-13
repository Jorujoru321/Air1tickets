# Team photos

These are the highest-value images on the site. Someone is deciding whether to
send their travel plans to a WhatsApp number; a photo of the actual room that
message lands in does more than any amount of copy.

## How to add them

1. Drop your photographs in this folder using **exactly** these filenames.
2. Open `src/data/photos.ts` and change `available: false` to `available: true`
   for each file you added.

Nothing else needs changing — every slot renders the moment its flag is on, and
stays hidden while it is off, so no page ever shows a broken image.

| File | Where it appears |
| --- | --- |
| `office.jpg` | About page, beside "What we do" (replaces the illustration) |
| `consultation.jpg` | Home page, "There's a real person on the other end" |
| `support.jpg` | About page "Who you're messaging", and the help-page sidebar |
| `group.jpg` | "Inside the office" gallery on the about page |
| `portrait.jpg` | "Inside the office" gallery on the about page |

Every available photo also appears in the about-page gallery, largest first.
Captions and alt text live with the filenames in `src/data/photos.ts` — edit
them there so they describe what your photo actually shows.

## Guidance

* JPEG, landscape, at least 1600px wide (the portrait can be square).
* Keep each under ~400KB; resize before committing. These load on the home page.
* Slightly imperfect photos of the real office beat polished stock. The
  authenticity is the entire point of putting them up.
* Only use photographs you own, showing people who agreed to appear on a
  public website.
