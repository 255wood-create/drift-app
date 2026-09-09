# go janey. — Project Handoff (Updated September 8, 2026)

> **This supersedes all older copies.** As of Sept 7 there were three stale versions on the
> MacBook — `~/drift-boulder/CLAUDE-CODE-HANDOFF.md` (Aug 5),
> `~/Desktop/gojaney/CLAUDE-CODE-HANDOFF.md` (Aug 4), and one in a Claude session folder
> (Aug 1). Save this over the one in `~/drift-boulder/` and delete the others.

## What This Is
A mobile-first local event discovery app for Boulder, Colorado and nearby towns. Users open the app to see what's happening today, tomorrow, this weekend, or upcoming. Categories: Live Music, Comedy, Food & Culture. NOT an RSVP or ticketing system — purely discovery.

**Category rule:** there are exactly three. Anything that is not comedy and not live music goes into Food & Culture — that bucket is the catch-all (trivia nights, yoga, theater, films, art openings, dance lessons, actual food events).

## Live URLs
- **App:** https://gojaney.com / https://drift-boulder-now.vercel.app (backup)
- **Admin Panel:** https://drift-boulder-now.vercel.app/admin.html
- **GitHub Repos:** github.com/255wood-create/drift-app (origin) and drift-boulder (boulder remote)
- **Vercel Project:** gojaney
- **Email:** gojaneyboulder@gmail.com

## Tech Stack
- **Frontend:** React (Vite) — single-file app in `src/App.jsx`
- **Database:** Supabase (PostgreSQL) — project ID: `lknoxozdbkikysxoarzu`
- **Hosting:** Vercel
- **Event Scraping:** SerpApi — `fetch3.js` → `lib/eventSearch.js`
- **Auth:** Supabase Auth with magic link (email OTP)
- **Fonts:** Inter (body), Caveat (logo "go" text)
- **Domain:** gojaney.com registered at Network Solutions, nameservers pointed to Vercel

## SerpApi — IMPORTANT CHANGES (Sept 2026)
- SerpApi **deprecated the `google_events` engine** during the week of Aug 24–30, 2026. Calls to it now return `Unsupported google_events search engine.`
- The code now uses `engine: "google"` and reads `events_results` out of regular Google search results.
- Account is on the **paid Developer plan ($75/mo, ~5,000 searches)**. One `fetch3.js` run uses ~48 searches.
- Account "Geographic Location" setting was showing Austin, TX. Queries name their cities explicitly so results are still Boulder-area.

### The new response format is much thinner
Each event returns only: `title`, `date` (a plain string like `"Sep 10"`), `time` (`"6:00 PM"`), `source`, `link`, `thumbnail`.

There is **no address field and no description**. Consequences:
- **Venue** is guessed from the search query via `guessVenue()` — queries ending in "events" (e.g. "St Julien Hotel Boulder events") yield the venue name. Generic queries yield nothing, so location falls back to "Boulder".
- **Dates** are parsed by `parseEventDate()` from the plain strings. It also handles a leading weekday ("Tue, Sep 30"), date ranges, and an object form some responses still return.
- Not every query returns `events_results` — Google only shows an events pack for some phrasings. Venue-specific queries work best.

## Timezone Handling (fixed Sept 6)
All date bucketing and time display now use **America/Denver explicitly**, not the device's timezone. A phone set to another zone was showing events on the wrong day.

- `lib/eventSearch.js` — `getBucket()` uses a Denver `Intl.DateTimeFormat`
- `src/App.jsx` — `denverDay()` helper feeds `isPastEvent()` and `computeBucket()`; the event-card time string uses a Denver `Intl.DateTimeFormat`

### CRITICAL: `denverDay()` can return null — always guard it
`denverDay()` returns `null` for a missing or invalid date. Calling `.split()` on that
result, or passing a bad date to `Intl.DateTimeFormat.format()`, **throws at runtime and
unmounts the entire event list — the app renders with zero events.**

This happened on Sept 6. The first version of the event-card line called
`denverDay(d).split("-")` with no check. `npx vite build` passed cleanly, because this is a
runtime error, not a syntax error. The app deployed and showed a blank list.

Every call site now has a guard. Line 144 pattern:
```js
var dd=denverDay(d);
if(dd){ var dp=dd.split("-"); ... }              // date part
if(dd&&!(um===0&&(...))){ ...format(d)... }      // time part reuses the same check
```
`computeBucket()` returns `"Upcoming"` if either date is null. `isPastEvent()` returns
`false` if either is null.

**If you edit any of these, re-add the guards.** A clean build does not prove this works.

### If the app ever shows zero events
1. Confirm the data is intact: `select count(*) from events;` in Supabase (should be ~330)
2. If the count is fine, it's a rendering crash — roll back immediately:
   ```
   git revert HEAD --no-edit && git push origin main && git push boulder main
   ```
3. Wait ~1 min for Vercel, reload with a new cache-buster (`?fresh=N`)

This affects the **web app only**. The iOS app bundles its own copy of the code, so a bad
deploy can't break it — but by the same token a fix can't reach it without a new build.

**Known quirk left alone:** events whose UTC time is midnight, 6am, or 7am on the dot are treated as "placeholder times" (Google's stand-in when it doesn't know the real time) and have their time hidden on the card. A real event at one of those times would have its time hidden too.

## The "This Weekend" Bug (fixed Sept 6)
Both `getBucket()` and `computeBucket()` computed the weekend window as:
```js
const daysToSunday = (7 - dow) % 7;   // WRONG
```
On Sundays this produces 0 while `daysToFriday` is 5, so the range `5..0` matches nothing and every event fell through to "Upcoming". Corrected to:
```js
const daysToSunday = daysToFriday + 2;
```
This logic is **duplicated** in the two files. Change both together.

## Categorization
`categorizeEvent()` in `lib/eventSearch.js`, checked in this order:
1. Named-comedian exception list (Cliff Cash, BK Sharad, Moms Unhinged, Craig Ferguson, Samantha Bee, Steve Vanderploeg) → comedy
2. Comedy keywords → comedy
3. Film keywords (goonies, rocket science, reel rock, mountainfilm, freeski, etc.) → food
4. Dance-lesson keywords (salsa, bachata, waltz, rueda, swing lesson) → food
5. Other culture keywords (trivia, yoga, cornhole, farmers market, gallery, poetry) → food
6. Music-festival phrases → music
7. **Venue match** (`MUSIC_VENUES` regex) → music
8. Music keywords → music
9. Default → food

**Why venue matters:** most titles are just names. "Ozomatli" and "Cliff Cash" contain no category words at all — keyword matching alone cannot classify them. Nearly all events come from dedicated music rooms, so the venue is the strongest available signal.

`MUSIC_VENUES` covers: Fox Theatre, Boulder Theater, Nissi's, Louisville Underground (plus common misspellings), Velvet Elk, eTown, Gold Hill Inn, Planet Bluegrass, Oskar Blues, Roots Music Project, Caribou Room, Avalon Ballroom, Tulagi, Boulder Bandshell, Chautauqua Auditorium, Dog House Music, The End Lafayette, Trident, Speakeasy, Macky, Folsom Field.

## Supabase Schema
```sql
events: id, title, category, location, venue, neighborhood, vibe, time_bucket, starts_at, ends_at, is_trending, lat, lng, emoji, gradient, created_at
saved_events: id, user_id, event_id, created_at
interested: id, user_id, event_id, created_at
user_profiles: id, name, handle, bio, interests, avatar_url, created_at
```
RLS enabled with permissive policies.

## Supabase Connection (CRITICAL)
Two different connection methods, NOT interchangeable:
1. **Main app (App.jsx):** `@supabase/supabase-js` npm package with `sb_publishable_` key via Vercel env vars
2. **Admin panel + all local scripts:** direct REST API `fetch()` with the legacy `eyJ` JWT key

## Vercel Environment Variables
```
VITE_SUPABASE_URL = https://lknoxozdbkikysxoarzu.supabase.co
VITE_SUPABASE_ANON = sb_publishable_myANV71Ao-e3TRTqM5UuOA_mTobfrdH
```

## Git Remotes (from ~/drift-boulder)
- `origin` → github.com/255wood-create/drift-app.git
- `boulder` → github.com/255wood-create/drift-boulder.git
- Push to BOTH: `git push origin main && git push boulder main`

## Local Scripts
| File | Purpose | Safe to re-run? |
|---|---|---|
| `fetch3.js` | Main event fetch (cron 6:05am) | Yes |
| `refresh-buckets.js` | Daily bucket refresh (cron 6:00am) | Yes |
| `fix-buckets.js` | One-time backfill of `time_bucket` from `starts_at` | Yes |
| `recat2.js` | Category backfill. `node recat2.js` = dry run, `--apply` writes | Yes, dry-run first |
| `findpairs.js` | Finds duplicate pairs by day+venue+title. Dry run by default, `--apply` DELETES | Yes, dry-run first |
| `venues.js` | Read-only: lists venues by event count | Yes |
| `dupes.js` | Read-only: dumps all dated events as `date \| title \| venue` | Yes |
| `datecheck.js` | Read-only: prints raw SerpApi date/time fields for sample queries | Yes |
| `deer.js` | Read-only: one-off title lookup. Handy template for querying by title from Terminal | Yes |
| `fixaddr.js` | Strips street addresses from `location`, leaving venue + town. Dry run by default, `--apply` writes | Yes, dry-run first |
| `fix-categories.js` | **BAD — delete.** Sent ~150 music events to food | **NO** |
| `recat.js` | **BAD — delete.** Sent trivia/yoga/comedy to music | **NO** |

**Always dry-run a backfill script before applying.** Both bad scripts above wrote to all rows on the first try and had to be undone.

## Deploying
```
git add <file>
git commit -m "message"
git push origin main && git push boulder main
```
- Check the build first: `npx vite build 2>&1 | grep -i "error\|built in"`
- A clean build does NOT catch undefined variables — read the changed line before pushing
- `lib/eventSearch.js` is **not** part of the web build; it runs locally via cron, so no Vercel deploy is needed for it
- `public/admin.html` is a **static file** — no build step, it ships as-is. It caches like
  any page, so use `?fresh=N` on the admin URL too when a change doesn't appear.
- **iOS caching:** Safari and home-screen web apps hold onto old versions hard. Force a fresh load with a query string: `https://gojaney.com/?fresh=1` (increment the number each time). Home-screen web apps keep a *separate* cache from Safari — clearing Safari alone won't fix those; delete and re-add the icon.

## Editing files in Terminal
`nano` is error-prone for this. Prefer:
- **Small change:** `sed -i '' 's/old/new/' file.js`
- **Bigger change:** write a Python script to `/tmp/fix.py` with `cat > /tmp/fix.py << 'PYEOF'`, then `python3 /tmp/fix.py`

**Gotcha:** `src/App.jsx` contains non-ASCII characters — a `·` separator and a non-breaking space (`\xa0`) before AM/PM (the latter is intentional, from the Aug 18 wrap fix). String-matching patterns that assume a normal space will silently fail to match. Match on ASCII-only fragments, or locate by index instead of exact text.

**Gotcha:** long heredoc pastes into Terminal frequently truncate, leaving a `heredoc>` prompt or a file with duplicated content. Paste in smaller chunks using `cat >` then `cat >>`, and verify with `grep -c "SUPABASE_URL =" file.js` (should print 1).

## Cron Schedule
```
0 6 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node refresh-buckets.js >> /tmp/gojaney.log 2>&1
5 6 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node fetch3.js >> /tmp/gojaney.log 2>&1
```
NOTE: Cron only runs when the laptop is open and awake at 6am.

## Design System
### Colors
- Fog White (background): #F5F3EF
- Charcoal (text): #1F2320
- Charcoal Mute (secondary text): #6B706C
- Pine Green (header/primary): #2F5D50
- Amber (accent): #D9A441
- Sage: #8FAF9A

### Typography
- Body: Inter (400, 500, 600)
- Logo: "go" in Caveat (cursive), "janey." in Inter
- Event title: Inter 15px 600
- Event subtitle: Inter 13px, color #6B706C

### Layout
- Clean list layout — no color cards
- Each event: title + location/date on left, heart save button on right
- Thin divider between events
- Hero photo header with gradient overlay
- Pine green bar with time filters and category buttons
- Bottom nav: Discover, Map, Saved, Profile

### Time Filters (4)
Today, Tomorrow, This Weekend, Upcoming.
`FILTER_LABELS` in App.jsx maps the internal key `Upcoming` to its display text. It was briefly labeled "Ahead" and was changed back on Sept 6.

**Intentional overlap — not a bug.** On line 358, when the active filter is "This Weekend"
and today (or tomorrow) falls on a weekend day, events bucketed "Today" or "Tomorrow" are
also shown under This Weekend. So on a Friday, Friday's events appear under both Today and
This Weekend. This is desired behavior. The empty `{}` blocks in that condition mean
"match, don't filter out" — they look like dead code but are load-bearing.

### The vibe line (added Sept 7)
Optional short descriptor shown on the event card, centered between the title and the
location/time line. Renders only when `event.vibe` has content, so cards stay uniform when
it's empty. Styled Caveat 400 at 15px in `#AEB3AF` — deliberately quiet, so it reads as an
aside rather than another data field.

The Caveat `@import` (line ~369) had to gain weight 400; it previously loaded only 700 for
the logo. A weight that isn't imported gets synthesized by the browser and looks wrong.

Most auto-fetched events will never have a vibe — the current SerpApi format returns no
description field, so this is effectively a hand-entry feature.

Note `vibe` is also rendered in the map's selected-event panel (line ~219) in italic Inter.
Feed rows are NOT tappable: the only thing that sets `selected` is a Google Maps marker
click listener, so that panel is reachable from the Map screen only.

### Grouped recurring events in Upcoming (added Sept 8)
The **Upcoming tab only** collapses repeat occurrences of the same event into a single card:
"Farmers Market · 13th and Canyon · 9/9, 9/12, 9/16, 9/19 +8 more". Today, Tomorrow and This
Weekend are untouched — those filters have already narrowed to one or two dates, so there is
nothing to collapse, and their code path is unchanged.

**Display-only.** The database still holds one row per date. Nothing is written, `time_bucket`
and `starts_at` are untouched, and Map/Saved read `withDist` upstream of this. The grouping is
recomputed on every render.

How it works, in `App.jsx` right after `filtered` is built:
- Groups by normalized title + normalized venue + variant tag
- Keeps the **earliest** occurrence as the card, so the heart saves the next date — this was
  a deliberate choice over saving all dates (clutters Saved) or disabling the heart
  (inconsistent)
- Shows the first date plus up to 3 more, then "+N more"
- Appends a **time only when every occurrence shares it** (`groupSameTime`). A run with
  varying times shows dates without a time rather than a misleading one.
- Never merges distinct showings — Early Show / Late Show / All Ages / 21+ / Morning Show,
  same guard as the fetch dedupe

**The failure mode to watch:** two genuinely different events sharing a normalized title and
venue would collapse, and the second simply wouldn't appear — easy to miss because nothing
looks broken. Check the "N experiences" count at the top of Upcoming after data changes; a
drop larger than the real repetition means something is over-grouping.

**Note the two grouping code paths are separate.** `relatedTitle()` in `lib/eventSearch.js`
(prefix / shared-leading-words, used by dedupe) and the exact-normalized-title match used by
this display grouping are different rules. The display version is stricter on purpose.

### Street addresses in listings — cleaned up Sept 8
Six rows from late July / early August held full street addresses
("eTown Hall, 1535 Spruce St Boulder, CO, United States"). These were **leftovers from the
retired `google_events` engine**, which returned address data. The current fetch has no
address source at all — `e.address` is always empty, which is why `guessVenue()` exists — so
this should not recur.

Cleaned to venue + town via `fixaddr.js`. Side effect worth knowing: those rows now normalize
to the same `venueKey` as their siblings ("Boulder Theater Boulder" and "Boulder Theater" both
→ `bouldertheater`), so some may now group or dedupe where they previously didn't.


### CRITICAL: iOS viewport height — why bottom-padding fixes don't work
The app shell must NOT use `min-height: 100vh`. On iOS, `100vh` is the viewport height with
browser chrome *hidden* — taller than what's actually visible. The shell then extends below
the fold, and any bottom padding on the scrolling `<main>` goes with it. Symptom: the last
event card sits behind the fixed bottom nav and is only visible while you hold the page up
in rubber-band overscroll.

This cost three failed attempts on Sept 7 — raising the padding from 100px to 150px, then
measuring the nav height at runtime in JS (which made it *worse*: `navH` evidently resolved
to an invalid value on device, so the browser dropped the padding declaration entirely and
the card became fully hidden). The padding was never the problem. It was there; it was
off-screen.

The fix is a CSS class, because React style objects can't hold duplicate keys and inline
styles would beat the class:
```css
.app-shell{min-height:100vh;min-height:-webkit-fill-available;min-height:100dvh}
```
Three declarations, each overriding the previous where supported: oldest iOS gets `100vh`
(today's behavior, no worse), middle gets the webkit value, iOS 16+ gets `dvh`. The shell
div carries `className="app-shell"` and no `minHeight` in its inline style.

**If bottom-cutoff symptoms return, check the viewport unit before touching any padding.**

## File Structure
```
drift-boulder/
├── public/
│   ├── admin.html              # Admin panel (REST API + eyJ key)
│   ├── hero.jpg
│   ├── gjicon-192.png, gjicon-512.png, apple-icon-180.png
│   ├── icon.svg, favicon.svg, icons.svg
│   ├── manifest.json
│   └── googleb901090c32930df7.html
├── src/
│   └── App.jsx                 # Main React app (single file)
├── lib/
│   └── eventSearch.js          # Search → filter → categorize → insert pipeline
├── fetch3.js                   # Thin wrapper; holds API keys — NOT in git
├── refresh-buckets.js          # Holds API keys — NOT in git
├── _old/                       # Archived scripts (gitignored)
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## Junk Filter (SKIP list)
chemical, engineering, shares, internship, volunteer, certification, training course, webinar, online, virtual, job fair, hiring, real estate, open house, church service, bible study, board meeting, city council

## Denver Filter (blocked locations)
denver, aurora, lakewood, littleton, englewood, thornton, arvada, westminster

---

# NEXT STEPS

## Immediate
1. **Await Apple review of 1.0.1 build 6** (submitted Sept 8). Once approved and released,
   App Store users finally get the Sept 6–7 fixes — they have been on the August build all
   month.
2. **Build 1.0.2 once 1.0.1 is released.** It would carry the Sept 8 web changes that missed
   build 6: the Upcoming-tab grouping and the address cleanup. Decision made Sept 8 to wait
   rather than pull 1.0.1 from review — the timezone and bucketing corrections in build 6
   matter more than a display improvement, and resubmitting would reset the review clock.
   Bump Version to 1.0.2 and Build to 7. Full sequence is in the iOS section below.
3. **LLC → Organization account conversion.** Go Janey LLC is formed; the D-U-N-S request was
   submitted to Dun & Bradstreet on Sept 8 and is awaiting their email. Once it arrives,
   contact Apple Developer Support. See the section below.
4. Watch the next `fetch3.js` run (6:05am cron, or run manually) and confirm new events get
   sensible venues, dates, and categories. This is the first run using the new
   `categorizeEvent()` with venue rules.

## Sept 7 session — what changed
- **Parser year inference.** `parseEventDate()` now checks whether the parsed date lands
  more than ~60 days in the past; if so it re-parses with next year. Google returns dates
  like `"Apr 17"` with no year, and stamping the current year on those put fall events in
  the spring. Two months of slack, not zero, so genuinely recent events aren't pushed
  forward a year.
- **25 duplicate rows deleted** via `findpairs.js` (356 → 331).
- **Dedupe rewritten.** `runFetch` previously compared exact normalized titles, so
  "The Bends" and "The Bends with Foxtide" both got inserted. It now matches on
  **day + normalized venue + related title**, using `venueKey()`, `variantTag()`, and
  `relatedTitle()`. Verified: a fetch right after the cleanup returned Added:0, Skipped:101.
- **Vibe line added to event cards** — see the design section above.
- **iOS viewport height fixed** (`100vh` → `dvh` with fallbacks) — see the critical section
  above. This is what was cutting off the last card.
- **Cache headers added to `vercel.json`.** `/` and `/index.html` now send
  `Cache-Control: public, max-age=0, must-revalidate`. Vite fingerprints its JS/CSS
  filenames so those cache normally; only the HTML entry point revalidates, which is enough
  to pull a new build. There is **no service worker** in this project, which rules out the
  worst source of stale content.
- **Admin panel sort control.** A dropdown next to "Show past events" offers Newest added
  (the default, `created_at.desc`), Title A-Z, and Event date. Sorting happens client-side
  on a `.slice()` copy — do **not** sort `data` in place, since `allEvts` is built from it
  and the Edit buttons depend on that mapping. Null dates sort to the end.

### Duplicate detection — three mechanisms, none complete
1. **`runFetch` dedupe** (prevents new duplicates): day + venue + related title.
2. **Admin panel highlighting** (lines ~362–381): groups by exact `normTitle` and flags a
   group when two entries share a date or one has a null date. Shows "N possible
   duplicates" in the count line.
3. **`findpairs.js`** (cleanup): the most thorough — prefix and shared-leading-word matching
   plus venue normalization.

What none of them catch, and why sorting Title A-Z matters:
- **Misspellings.** "Deer Creedence" / "Deer Creadence" — same night, same venue, Google
  supplied the typo in one listing. The strings genuinely differ, so no normalization helps.
  Fuzzy-matching titles a letter apart would eventually merge two real acts, which is worse
  than a visible duplicate. **Hand-removal is the right answer for these**; alphabetical
  sort puts them adjacent so you can see them.
- **Title variants** ("The Bends" / "The Bends with Foxtide") — the admin panel misses these
  because it groups on exact `normTitle`; `findpairs.js` catches them.
- **Null dates** — can't be compared by date, so date-collision logic can't flag them.
- **Venue variants** — the admin panel doesn't consider venue at all.

### Dedupe rules — what they do and don't catch
`relatedTitle()` treats two titles as the same event if one is a prefix of the other or
they share the first two words. `variantTag()` blocks merging genuinely distinct showings:
**Early Show / Late Show / All Ages / 21+ / Morning Show** are never collapsed together —
the Craig Ferguson, Reel Rock, and Halloween Silent Disco pairs are real separate events.

Does NOT catch: events with a null `starts_at`, or events whose venue can't be resolved
(e.g. sourced from "Bandsintown Boulder CO events", where `guessVenue()` yields
"Bandsintown Boulder CO" rather than the real room). Expect occasional stragglers.

`findpairs.js` keeps the **longer** title of each pair, on the theory that "Rossi with
Two. S, Jules Oskar" tells a user more than "Rossi". It is dry-run by default; `--apply`
deletes.

## OPEN DECISION: how to categorize name-only titles
Titles that are just a person's or band's name — "Robert Ellis", "Greg Hoy", "Phoebe Nix",
"Mr Majestyk's 8-Track Revival", "Catzin Tzlia b2b TLooP" — contain no keyword to match.
When the venue is also unresolved (location is just "Boulder"), they fall through to the
Food & Culture default and appear as music events in the wrong tab.

Three options considered on Sept 7:

**A. Expand venue coverage (recommended first step, not yet done).**
The root cause is that these arrive from generic queries carrying no venue. Adding
venue-specific entries to `QUERIES` for the smaller rooms that host live music — Trident
Booksellers, Wibby Brewing, Upslope, VisionQuest, Rosetta Hall, Boulder Social, TooSteppin —
would give those events real venues, which the existing rules already classify correctly.
Fixes the cause, improves the cards (real venue instead of "Boulder"), costs nothing.

**B. AI call in the fetch pipeline.**
Send unresolved titles to Claude for classification. Would correctly know Robert Ellis is a
musician. Requires a **console.anthropic.com account with its own billing** — separate from
the Claude subscription, pay-as-you-go, roughly pennies per month at this volume. Should sit
*after* the venue rules so it only handles what those can't resolve (~10–20 per fetch, not
all 100), and must fall back to keyword logic if the API fails so a bad night degrades
rather than breaks the fetch.
As of Sept 7 there is no Anthropic API key on this machine — `grep -r "sk-ant"` and
`grep ANTHROPIC ~/.zshrc` both came back empty.

**C. Fix by hand in the admin panel.**
Accurate, but the problem recurs with every fetch that pulls a name-only title.

**Suggested path:** do A, watch for a week, and add B only if the remaining stragglers stay
annoying. Easier to reverse that than to unwind a billing account. Lindsay is thinking it
over — no decision yet.

## Known data issues
1. **~54 events have `starts_at` NULL** and therefore can never appear under Today,
   Tomorrow, or This Weekend — they sit in Upcoming permanently. These are old rows from
   the retired `google_events` engine; **re-fetching cannot recover the dates**, since the
   generic queries that produced them now return zero events. Lindsay is hand-entering
   dates for the ones worth keeping. Many are already past and can simply be deleted.
2. **"Pippin"** is stored as `2026-04-17` (the parser stamped the current year on a bare
   "Apr 17"). Slated for deletion.
3. **~12 name-only titles miscategorized** as Food & Culture — see the open decision above.
4. Roughly a dozen events were **manually entered** through the admin panel (the recurring
   Boulder Farmers Market series, Wednesdays 15:30 and Saturdays 8:00, running through
   Nov 21). Gaps in that series are missing entries, not bugs — Sept 12 was absent, which
   is why This Weekend showed no Food & Culture. A script to bulk-insert a recurring series
   would save entering ~20 more by hand.
5. **Map and profile screens** (lines ~241 and ~276) still use a hardcoded
   `calc(150px + env(safe-area-inset-bottom))` bottom padding. The viewport fix helps them
   too since they share the shell, but if either cuts off at the bottom, that fixed value is
   the place to look.

## Pending, external
6. **Fortinet URL rating.** gojaney.com is categorized "Not Rated," so Fortinet-filtered networks (including Lindsay's workplace guest WiFi) block it. A re-rating request was submitted Sept 6 — review takes days to weeks. Cellular data works meanwhile.

## iOS app — LIVE on the App Store
Released around **August 5, 2026** as version 1.0.

### The app bundles its web assets — deploys do NOT reach App Store users
`~/drift-boulder/capacitor.config.json`:
```json
{
  "appId": "com.gojaney.app",
  "appName": "go janey.",
  "webDir": "dist",
  "backgroundColor": "#F5F3EF",
  "ios": { "backgroundColor": "#F5F3EF" }
}
```
There is **no `server.url`**, so Capacitor packages the built `dist` folder into the binary.
App Store users run the code as it was at submission time, not the live site.

**Consequence:** every fix from Sept 6–7 — the timezone correction, the Sunday "This Weekend"
bug, the null-date guards, the bottom-scroll cutoff, the vibe line — is live on the web but
NOT in the shipped iOS app until a new build is submitted. The Supabase data is shared, so
App Store users see current events, but rendered by August code with the August bugs.

To ship web changes to iOS:
```
npm run build
npx cap sync ios
```
then open the iOS project in Xcode, bump the build number, Archive, and upload to App Store
Connect. Processing takes ~10–30 min before the build appears as selectable.

### SUBMITTED: version 1.0.1 build 6 (Sept 8, 2026)
Uploaded and submitted for review. Contains all Sept 6–7 fixes plus the `gojaney` keyword
addition. Awaiting Apple review (typically 1–2 days).

**Web changes made after the archive are NOT in this build.** The Upcoming-tab grouping and
the address cleanup both landed after build 6 was archived, so they are live on the web only.
They ship to iOS with the next build. This gap will keep opening every time the web is
deployed — worth checking what's actually in the shipped build before assuming a fix reached
App Store users.

**What's New text submitted:** event times in Mountain time, events under the right day,
corrected categories, duplicate listings removed, scroll cutoff fixed.

**Keywords submitted** (95 chars):
```
gojaney,boulder,events,tonight,this weekend,comedy,concerts,live music,lyons,lafayette,gold hill
```

### CRITICAL GOTCHA: Info.plist was overriding the version numbers
This cost several failed archives on Sept 8. Setting Version and Build in Xcode's General
tab did nothing — every archive came out as the previous **1.0 (5)** no matter what the
General tab displayed, and three wasted archives piled up in the Organizer.

Two separate problems, both now fixed:

1. **`project.pbxproj` had `CURRENT_PROJECT_VERSION = " 6";`** — a stray leading space
   inside the quotes. Xcode's build system couldn't parse it and silently fell back.
2. **`ios/App/App/Info.plist` had the values hardcoded**, which overrides the build settings
   entirely:
   ```xml
   <key>CFBundleShortVersionString</key><string>1.0</string>
   <key>CFBundleVersion</key><string>5</string>
   ```
   Now corrected to reference the build settings:
   ```xml
   <key>CFBundleShortVersionString</key><string>$(MARKETING_VERSION)</string>
   <key>CFBundleVersion</key><string>$(CURRENT_PROJECT_VERSION)</string>
   ```

**Because of fix #2, the General tab now works as expected for future builds.** But if an
archive ever shows the wrong version again, check these two files before anything else:
```
grep -n "MARKETING_VERSION\|CURRENT_PROJECT_VERSION" ios/App/App.xcodeproj/project.pbxproj
grep -n -A 2 "CFBundleShortVersionString\|CFBundleVersion" ios/App/App/Info.plist
```
Also: quit Xcode fully (Cmd+Q) after editing these files externally — it caches project
settings and won't notice the change otherwise.

### Full build-and-submit sequence
```
npm run build
npx cap sync ios
npx cap open ios
```
Then in Xcode: set Version and Build in the App target's General tab, select
**Any iOS Device (arm64)** in the scheme selector (Archive is greyed out on a simulator),
then **Product → Archive**. Verify the Organizer shows the *new* version before distributing
— it lists old archives too, and it's easy to distribute the wrong one. Then **Distribute
App → App Store Connect → Distribute**, and **Done** (not Export) when it finishes.

Allow 10–30 min for Apple to process before the build is selectable in App Store Connect.

**Known harmless warning:** "The image set 'Splash' has 3 unassigned children." It shipped
with 1.0 and passed review. Cosmetic; ignore it.

### App Store metadata
App name on the store is **"go janey."** (with the space, lowercase). Apple indexes the app
name and subtitle for search but **not the description**, so the concatenated spelling has to
go in Keywords or someone typing "gojaney" may not find the app. Keyword matching is
case-insensitive.

Keywords limit is 100 characters, comma-separated, **no spaces after commas** (they count
against the limit). Editable with each version submission, so revisit once there's real
install data rather than guessing at search behavior.

## Original roadmap, still open

### Getting Lindsay's personal name off the App Store listing
**Status as of Sept 8:** Go Janey LLC is formed and the documents are in hand. The D-U-N-S
request was **submitted to Dun & Bradstreet on Sept 8** via Apple's lookup tool; awaiting
their email with the number.

The app currently shows Lindsay's legal name as the seller/developer, because the Apple
Developer account is enrolled as an **Individual**. Per Apple's documentation, renaming the
Apple Account does not change the seller name, and individuals are not permitted to use a
fictitious or "doing business as" name. The only supported path:

1. ~~Form an LLC (Colorado)~~ — done
2. Get an EIN from the IRS
3. Obtain a **D-U-N-S Number** — free, from Dun & Bradstreet, not the state. Use Apple's
   lookup tool: **https://developer.apple.com/enroll/duns-lookup/** It first checks whether
   the business already has one assigned (common — D&B assigns them from public registration
   data). If not listed, the submit option sits *below* the "not found" message and is easy
   to miss.
4. Contact Apple Developer Support (**https://developer.apple.com/contact/**) to request
   conversion from Individual to Organization. This is **not self-service.**

The conversion updates the name shown for **existing** apps, not just new ones.

**Pitfalls hit on Sept 7:**
- Going to the *enrollment* page returns "Sorry, you can't enroll at this time — Your Apple
  Account is already associated with the Account Holder of a membership." That is expected;
  enrollment is for new accounts. The conversion is a support request, not a re-enrollment.
- The D&B captcha fails silently in Chrome for some people. **Try Safari.**
- Enter the legal business name exactly as it appears on the LLC formation documents.
  Mismatches are the main cause of delay.
- Apple's support form may ask for the app's "Apple ID" — that is the ~10-digit number in
  App Store Connect under App Information, not the Apple ID login.

**Timing:** Apple says allow up to 5 business days for the D-U-N-S number and up to 2 more
for Apple to receive it from D&B; other sources say up to 30 business days. Plan long.

**Expect friction at the last step.** A developer on Apple's forums reported that after
converting to Organization with D-U-N-S verified, the seller name still displayed their
personal name with no setting in App Store Connect to change it — it needed a support ticket.

**Not just an App Store decision.** An LLC carries tax and liability consequences. Worth
talking to a Colorado accountant or attorney.

### Everything else
1. **Real coordinates per event.** Everything currently uses Boulder center (40.015, -105.27). Needed before the map is useful.
2. **Real map.** Replace the SVG placeholder with Google Maps or Mapbox — depends on #1.
3. **Push notifications.** "Event you saved starts in 1 hour." Needs a service worker.
   Note: adding one will change the caching picture described above.
4. **Community event submissions.** Public form → staging area → admin approval. A
   `submissions` table already exists — `admin.html` line ~400 queries it for pending rows.
5. **More food events.** Google returns very few; likely needs manual curation.
6. **Feed rows are not tappable.** There is no detail view reachable from the feed; the
   existing one belongs to the Map screen. If per-event detail is wanted, this needs
   building.

## User Context
- Lindsay is not a developer — needs step-by-step guidance
- MacBook Pro; Chrome on laptop and iPhone
- Email: 255wood@gmail.com (personal), gojaneyboulder@gmail.com (app)
- GitHub: 255wood-create
- Node: /usr/local/bin/node (v24)
- Project folder: ~/drift-boulder

## Troubleshooting History
- SerpApi `google_events` engine deprecated Aug 2026 — use `engine: "google"`
- `eventSearch.js` logs `err.message`, which came through as `undefined` for SerpApi failures. To see the real error, curl the endpoint directly: `curl "https://serpapi.com/search.json?engine=google&q=test&api_key=KEY"`
- Supabase `sb_publishable` key doesn't work with the REST API; the `eyJ` legacy key doesn't work with the npm client
- Browser caching hides new deploys — Cmd+Shift+R on desktop, `?fresh=N` on iOS
- Chrome on iPhone doesn't support PWA icons — only Safari does
- Terminal heredocs truncate on long pastes — chunk them and verify
- Ad blocker once blocked Supabase connections — was removed
- Network Solutions DNS is slow to propagate
- Cron only runs when the laptop is open
- SQL goes in the Supabase SQL Editor in a browser, not the Mac Terminal. Clear the editor between queries — leftover text from a previous query will run instead.
