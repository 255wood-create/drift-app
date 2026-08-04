# go janey. — Project Handoff (Updated August 4, 2026, evening)

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

### Not Working / Incomplete
- gojaney.com DNS still propagating (works via drift-boulder-now.vercel.app)
- App icon blurry on iPhone Chrome (iOS limitation — need Safari or App Store)
- Event coordinates mostly default to Boulder center (map now real, but pins aren't accurate yet)
- Auto-pulled events often missing real times
- **URGENT — check first thing tomorrow:** SerpApi/Google Events is returning ZERO results for every search query as of Aug 4 evening (~7:30pm MT). Confirmed this is NOT a code or account problem: SerpApi account is Active with 107/250 monthly searches left, no rate limiting, and the API calls succeed (status "Success") — but Google's events panel comes back "Fully empty" even for generic test queries like "Events in New York" run directly against SerpApi outside this app. This affects BOTH the new "Fetch New Events" button AND the regular 12:01am/6am cron jobs — no new events will come in until this resolves. Try the Fetch button again tomorrow; if still empty, contact SerpApi support (account email: 255wood@gmail.com) since the account itself looks healthy.

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
Now defined once in `lib/eventSearch.js` (`QUERIES` export) and used by both `fetch3.js` and `api/pull-events.js` — edit that one file to add/remove venues or searches. As of Aug 4, includes generic searches plus ~30 venue-specific ones (Fox Theatre, Boulder Theater, eTown Hall, Chautauqua, Comedy Works, Louisville Underground, etc.) across Boulder, Lyons, Louisville, Lafayette, and Nederland.

## Junk Filter (SKIP list)
chemical, engineering, shares, internship, volunteer, certification, training course, webinar, online, virtual, job fair, hiring, real estate, open house, church service, bible study, board meeting, city council

## Denver Filter (blocked locations)
denver, aurora, lakewood, littleton, englewood, thornton, arvada, westminster

## Next Steps (Priority Order)

### 1. Resolve the SerpApi/Google Events outage (see "Not Working" above)
Blocks all new event data until fixed — check this first tomorrow.

### 2. Better Event Data
- Real event times (most auto-pulled events missing times)
- Real coordinates per event (most use default Boulder center — now matters more since the map is real)
- More food events (Google has very few — need manual curation)

## Completed
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
- SerpApi/Google Events returning zero results for all queries is a known external failure mode — verify by testing a generic query (e.g. "Events in New York") directly against SerpApi outside the app before assuming it's a code bug (Aug 4).
