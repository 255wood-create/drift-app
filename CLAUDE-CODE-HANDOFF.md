# go janey. — Project Handoff (Updated August 5, 2026, evening)

## What This Is
A mobile-first local event discovery app for Boulder, Colorado and nearby towns. Users open the app to see what's happening today, tomorrow, this weekend, or upcoming. Categories: Live Music, Comedy, Food. NOT an RSVP or ticketing system — purely discovery.

## Live URLs
- **App:** https://gojaney.com (DNS propagating) / https://drift-boulder-now.vercel.app (backup)
- **Admin Panel:** https://drift-boulder-now.vercel.app/admin.html
- **GitHub Repos:** github.com/255wood-create/drift-app (origin) and drift-boulder (boulder remote)
- **Vercel Project:** gojaney (renamed from drift-boulder-now)
- **Email:** gojaneyboulder@gmail.com

## Tech Stack
- **Frontend:** React (Vite) — single-file app in `src/App.jsx`
- **Database:** Supabase (PostgreSQL) — project ID: `lknoxozdbkikysxoarzu`
- **Hosting:** Vercel
- **Event Scraping:** SerpApi (Google Events API) — `fetch3.js`
- **Auth:** Supabase Auth with magic link (email OTP)
- **Fonts:** Inter (body), Caveat (logo "go" text)
- **Domain:** gojaney.com registered at Network Solutions, nameservers pointed to Vercel

## Supabase Schema
```sql
events: id, title, category, location, venue, neighborhood, vibe, time_bucket, starts_at, ends_at, is_trending, lat, lng, emoji, gradient, created_at
saved_events: id, user_id, event_id, created_at
interested: id, user_id, event_id, created_at
user_profiles: id, name, handle, bio, interests, avatar_url, created_at
```
RLS enabled with permissive policies.

## Supabase Connection (CRITICAL)
The app uses TWO different connection methods:
1. **Main app (App.jsx):** Uses `@supabase/supabase-js` npm package with `sb_publishable_` key via Vercel env vars
2. **Admin panel (public/admin.html):** Uses direct REST API `fetch()` with legacy `eyJ` JWT key

These are NOT interchangeable. The sb_publishable key doesn't work with REST API. The eyJ key doesn't work with the npm client.

## Vercel Environment Variables
```
VITE_SUPABASE_URL = https://lknoxozdbkikysxoarzu.supabase.co
VITE_SUPABASE_ANON = sb_publishable_myANV71Ao-e3TRTqM5UuOA_mTobfrdH
SERPAPI_KEY = 9225b69d023b55abe7b79b4df8508af57666f5a894c0a85dc473827e5aa77581
SUPABASE_URL = https://lknoxozdbkikysxoarzu.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrbm94b3pkYmtpa3lzeG9hcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NzA4MTYsImV4cCI6MjA5NTQ0NjgxNn0.Im1uwq7Fz6wxOKZNhiIwD8UW1rfxYazS5r53N17OH5c
```
The last three (`SERPAPI_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) power the new `/api/pull-events` serverless function used by the admin panel's "Fetch New Events" button — added Aug 4. If they're ever re-entered, paste from a plain-text source (not a rich-text/markdown view) — a bad copy-paste once introduced an invisible character that broke the endpoint with a cryptic "ByteString" error. The endpoint now validates and reports the exact bad character if it happens again.

## Git Remotes (from ~/drift-boulder)
- `origin` → github.com/255wood-create/drift-app.git
- `boulder` → github.com/255wood-create/drift-boulder.git
- Push to BOTH: `git push origin main && git push boulder main`

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
- Pine green bar with time filters and category buttons (white when active, dark gray text)
- Bottom nav: Discover, Map, Saved, Profile

### Categories (3)
- Live Music (icon: ♪)
- Comedy (icon: 🎤)
- Food (icon: 🍕)

### Time Filters (4)
- Today (includes Tonight events)
- Tomorrow
- This Weekend (Fri/Sat/Sun when applicable)
- Upcoming

### CAT_META colors
- music: #6B4FA0 on #F0EDF8
- comedy: #C75C8A on #F8ECF1
- food: amber on amberLt
- community: sage on sageLt (fallback)

## App Features

### Working
- Event feed with clean list layout
- 3 categories: Live Music, Comedy, Food
- 4 time filters: Today, Tomorrow, This Weekend, Upcoming
- Hero photo header (user's own photo at /hero.jpg)
- User auth via Supabase magic link (email)
- Save events with heart button (persists per user)
- Saved events screen
- Profile screen with sign in/out
- Real Google Maps view (replaced old SVG map, Aug 3)
- Local on-device push notifications for saved events (Aug 3)
- Community event submission form, goes to staging for admin approval (Aug 3)
- Admin panel at /admin.html with EZ Upload, duplicate detection, auto-connect anon key, fixed bucket/timezone handling
- Admin panel Edit button per event — fix a wrong date/time/etc. in place instead of delete + re-add (Aug 4)
- Admin panel "Fetch New Events" button — triggers the event search on demand from any device via `/api/pull-events`, not just the laptop (Aug 4)
- Auto-pull events from Google via SerpApi (fetch3.js locally via cron, or api/pull-events.js via the admin button — both call the shared lib/eventSearch.js)
- Duplicate checking on auto-pull, including within a single run (Aug 4 fix — previously the same event from two different search queries in one run could both get inserted)
- Junk event filtering
- Denver event filtering
- Smart time bucket assignment using Google's "when" field
- Daily refresh of time buckets (refresh-buckets.js)
- Daily auto-fetch scheduled at 6am via cron
- PWA manifest for Add to Home Screen
- Google Search Console submitted for indexing
- Covers Boulder, Lyons, Louisville, Lafayette, Nederland
- iOS app via Capacitor, with privacy/support pages and refreshed icons (Aug 2)
- App Store submission completed (Aug 3)
- UI polish: nav icons (heart/person), profile icon glow, refresh button, iPad centering, Discover icon (Aug 3)
- Event times display in the viewer's actual local time, not raw UTC (Aug 5 — see "Key Troubleshooting History")
- Today/Tomorrow/This Weekend/Upcoming tabs are computed live from each event's real date on every render, instead of trusting a `time_bucket` value frozen at insert time (Aug 5)
- Past events (with a known date) auto-hide from both the app and admin panel; admin has a "Show past events" checkbox to look back (Aug 5)
- Admin panel flags likely duplicate events (⚠️ highlight) — matches on normalized title (punctuation/"&" vs "and" insensitive) plus same-or-missing date; warns before manually adding a title that already exists (Aug 5)
- Footer disclaimer on the main screen: "Before heading out, pls verify date, time, locations. We're good... not perfect." (Aug 5)
- Search list expanded from 39 to 48 queries — added do303, Nissi's (Lafayette), Limelight Hotel, St Julien Hotel, Planet Bluegrass, Gold Hill Inn, Folsom Field, CBar, Bandsintown; corrected The Speakeasy's city to Longmont (Aug 5)

### Not Working / Incomplete
- gojaney.com DNS has finished propagating (confirmed Aug 5, resolves 200) — no longer an issue, drift-boulder-now.vercel.app is just a backup now
- App icon blurry on iPhone Chrome (iOS limitation — need Safari or App Store)
- Event coordinates mostly default to Boulder center (map now real, but pins aren't accurate yet)
- Auto-pulled events often missing real times (display of known times is now correct — Aug 5 — this is about events where SerpApi never returned a time at all)
- Events with no `starts_at` at all (e.g. a stray "Prokofiev, Copland, Rossini & Ravel" entry) can't be auto-detected as past or duplicate — left for manual review/deletion in admin by design (Aug 5 decision)
- **STILL BROKEN as of Aug 5, ~10am MT — confirmed again by triggering the Fetch button live:** SerpApi/Google Events is still returning ZERO results for every search query, same as Aug 4 evening (all 39 original queries returned nothing; two Lyons/Louisville queries now also fail outright with "undefined" errors, which is new). This has now persisted 2+ days. SerpApi account was healthy as of Aug 4 (107/250 searches left, no rate limiting, calls return "Success" with empty results) — check if that's still true, and if so this needs to go to SerpApi support (account email: 255wood@gmail.com). Blocks all new event data (both the "Fetch New Events" button and the 12:01am/6am cron jobs) until resolved.
- **iOS App Store submission:** version 1.0, build 3 submitted for Apple review Aug 5 evening, includes all of today's fixes below. Check App Store Connect (appstoreconnect.apple.com) for review status — typically resolves in a few hours to 1-2 days. Ignore the leftover 1.1 (builds 2, 4, 5) entries under TestFlight — they're harmless orphaned uploads from mid-session troubleshooting, not attached to anything, don't need cleanup.

## File Structure
```
drift-boulder/
├── public/
│   ├── admin.html              # Admin panel (REST API + eyJ key)
│   ├── hero.jpg                # Header hero photo
│   ├── gjicon-192.png          # App icon 192px
│   ├── gjicon-512.png          # App icon 512px
│   ├── apple-icon-180.png      # Apple touch icon
│   ├── icon.svg                # SVG icon
│   ├── manifest.json           # PWA manifest
│   ├── favicon.svg             # Browser favicon
│   ├── icons.svg               # UI icons
│   └── googleb901090c32930df7.html  # Google verification
├── src/
│   └── App.jsx                 # Main React app (single file)
├── api/
│   └── pull-events.js          # Vercel serverless fn — powers admin "Fetch New Events" button (Aug 4)
├── lib/
│   └── eventSearch.js          # Shared search/dedupe/insert logic used by fetch3.js AND api/pull-events.js (Aug 4)
├── vercel.json                 # Sets maxDuration:60 for api/pull-events.js (Aug 4)
├── fetch3.js                   # SerpApi event scraper, local cron only (has API keys — NOT in git)
├── refresh-buckets.js          # Daily time bucket refresh (has API keys — NOT in git)
├── _old/                       # Archived temp fix scripts (in .gitignore)
├── index.html                  # Entry HTML
├── package.json
├── vite.config.js
├── eslint.config.js
└── .gitignore
```

## Event Upload Methods
1. **Auto-pull (local):** `cd ~/drift-boulder && node fetch3.js` (runs daily at 12:01am and 6am via cron)
2. **Auto-pull (button):** Admin panel → "Fetch New Events" button — runs the same search from any device, no laptop needed (Aug 4)
3. **Bucket refresh:** `cd ~/drift-boulder && node refresh-buckets.js` (runs daily at 12:01am and 6am via cron)
4. **Admin panel:** drift-boulder-now.vercel.app/admin.html (manual form + EZ Upload with Claude)
5. **Supabase:** Table Editor → events → Insert Row
6. **EZ Upload:** Copy prompt from admin panel → paste in Claude with event info → Claude returns JSON → paste in admin panel
7. **Editing an existing event:** Admin panel → click "Edit" on any row → form pre-fills → change what's wrong → Save Changes (Aug 4, no more delete + re-add)

## Cron Schedule
```
1 0 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node refresh-buckets.js >> /tmp/gojaney.log 2>&1
6 0 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node fetch3.js >> /tmp/gojaney.log 2>&1
0 6 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node refresh-buckets.js >> /tmp/gojaney.log 2>&1
5 6 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node fetch3.js >> /tmp/gojaney.log 2>&1
2 0 * * * /usr/bin/caffeinate -i -s -t 22200
```
Runs twice daily: 12:01am and 6:00am. The `caffeinate` line at 12:02am keeps the laptop awake for ~6.2 hours to cover both runs. NOTE: cron only runs when the laptop is open and awake — the admin panel's "Fetch New Events" button (Aug 4) doesn't have this limitation since it runs on Vercel.

## Search Queries
Defined once in `lib/eventSearch.js` (`QUERIES` export) and used by both `fetch3.js` and `api/pull-events.js` — edit that one file to add/remove venues or searches. As of Aug 5, 48 total queries: generic searches plus ~34 venue-specific ones across Boulder, Lyons, Louisville, Lafayette, and Nederland. Lindsay can also edit this list herself directly on GitHub (github.com/255wood-create/drift-boulder/blob/main/lib/eventSearch.js, pencil icon to edit) — but if she does, the local laptop copy (which the 12:01am/6am cron actually runs from) needs a `git pull` to pick up the change; only the Vercel-hosted "Fetch New Events" button auto-updates from a GitHub-only edit.

## Junk Filter (SKIP list)
chemical, engineering, shares, internship, volunteer, certification, training course, webinar, online, virtual, job fair, hiring, real estate, open house, church service, bible study, board meeting, city council

## Denver Filter (blocked locations)
denver, aurora, lakewood, littleton, englewood, thornton, arvada, westminster

## Next Steps (Priority Order)

### 1. Resolve the SerpApi/Google Events outage (see "Not Working" above)
Now 2+ days broken — blocks all new event data until fixed. Contact SerpApi support if the account still looks healthy but returns empty results.

### 2. Check iOS App Store review status
Version 1.0 build 3 was submitted Aug 5 evening — check appstoreconnect.apple.com for approval/feedback.

### 3. Better Event Data
- Real event times (most auto-pulled events missing times — a data-availability problem, not the display bug fixed Aug 5)
- Real coordinates per event (most use default Boulder center — now matters more since the map is real)
- More food events (Google has very few — need manual curation)

## Completed
- **Timezone/bucket/duplicate fixes + iOS resubmission (August 5, 2026)** — see "App Features > Working" above for the full list (local-time display, live-computed date tabs, past-event hiding, tighter duplicate detection, disclaimer, 9 new venues). iOS app rebuilt and resubmitted as version 1.0 build 3.
- **Admin panel Edit button (August 4, 2026)** — fix a wrong date/time/etc. on an existing event without deleting and re-adding.
- **Cloud-triggered "Fetch New Events" button (August 4, 2026)** — new `api/pull-events.js` Vercel function lets the admin panel pull new events on demand from any device, not just the laptop running cron. Shared search logic extracted to `lib/eventSearch.js`. Added "Louisville Underground events" to the search list. Fixed a bug where the same event from two search queries in one run could be inserted twice.
- **App Store submission (August 3, 2026)** — Apple Developer account, Capacitor iOS wrap, and submission all done.
- **iOS app via Capacitor (August 2, 2026)** — plus privacy/support pages and refreshed icons.
- **Real Google Maps (August 3, 2026)** — replaced the placeholder SVG map.
- **Push notifications (August 3, 2026)** — local, on-device notifications for saved events.
- **Community event submissions (August 3, 2026)** — public form, submissions go to a staging area for admin approval.
- **Admin panel fixes (August 3, 2026)** — auto-connect with default anon key, fixed bucket/timezone mismatches, duplicate detection in EZ Upload.
- **UI polish (August 3, 2026)** — nav icons, profile icon glow, refresh button behavior, iPad centering, Discover icon.
- **Security housekeeping (August 3, 2026)** — stopped tracking `refresh-buckets.js` in git (it contains an API key).

## User Context
- User (Lindsay) is not a developer — needs step-by-step guidance
- Uses Mac laptop (MacBook Pro, macOS 12.7.2 → updating to Tahoe)
- Uses Chrome on laptop and iPhone
- Email: 255wood@gmail.com (personal), gojaneyboulder@gmail.com (app)
- GitHub: 255wood-create
- Node: /usr/local/bin/node
- Project folder: ~/drift-boulder

## Key Troubleshooting History
- Supabase sb_publishable key doesn't work with REST API — use eyJ legacy key for admin panel
- Supabase eyJ key doesn't work with npm client — use sb_publishable for main app
- Browser caching causes old versions to persist — use Cmd+Shift+R or incognito
- Chrome on iPhone doesn't support PWA icons — only Safari does
- Terminal heredoc commands fail with quotes in HTML/JSX — use Python files instead
- Ad blocker blocked Supabase connections — was removed
- Network Solutions DNS is slow to propagate — nameservers set to Vercel
- Cron jobs only run when laptop is open
- Vercel env var values pasted from a rich-text source can carry an invisible character that breaks `fetch()` headers with a cryptic "Cannot convert argument to a ByteString" error — paste from plain text only. The `/api/pull-events` endpoint now validates and names the exact bad variable/character position if this happens again (Aug 4).
- SerpApi/Google Events returning zero results for all queries is a known external failure mode — verify by testing a generic query (e.g. "Events in New York") directly against SerpApi outside the app before assuming it's a code bug (Aug 4). Still broken as of Aug 5.
- **Timezone display bug pattern (Aug 5):** admin.html correctly converts entered local time to UTC on save (`new Date(sd+"T"+st).toISOString()`), but App.jsx was reading `getUTCHours()`/`getUTCMinutes()` straight off the timestamp and displaying that as if it were already local — showing times ~6-7 hours off. Fixed by converting to local (`getHours()`/`getMinutes()`) at display time. If a similar wrong-time bug resurfaces, check for this exact UTC-vs-local mismatch pattern first.
- **"No known time" placeholder detection is timezone/DST-dependent:** the scraper stores just-a-date events as local midnight `.toISOString()`'d, which lands on different UTC hours depending on which machine ran it and the time of year — `00:00 UTC` (Vercel, always), `06:00 UTC` (laptop/MDT, ~Mar-Nov), or `07:00 UTC` (laptop/MST, ~Nov-Mar). Display code checks all three (`uh===0||uh===6||uh===7`) to correctly hide fake placeholder times.
- **App Store Connect requires exact version-number match:** an uploaded build can only attach to a version page with the identical version string (e.g. a "1.1" build cannot attach to a "1.0" page), and you can't create a new version page while the current one is unresolved ("Waiting for Review" or needs "remove this version from review" first) — you can only reuse an existing version number if it was never actually approved/released. Don't bump the marketing version number unless you're sure the current one has been released; if it's just stuck in review, keep the same version number and only bump the build number (`xcrun agvtool new-version -all N`).
- **Xcode caches project settings in memory:** editing `project.pbxproj`/`Info.plist` via `xcrun agvtool` (or any external edit) while Xcode already has the project open won't be picked up — Xcode will archive using its stale in-memory values. Fully quit Xcode (`osascript -e 'tell application "Xcode" to quit'`) and reopen (`npm run cap:open:ios`) after any command-line version/config change, before archiving.
