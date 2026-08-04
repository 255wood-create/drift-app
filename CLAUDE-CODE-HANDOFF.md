# go janey. — Project Handoff (Updated August 4, 2026)

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
```

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
- Auto-pull events from Google via SerpApi (fetch3.js)
- Duplicate checking on auto-pull
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
├── fetch3.js                   # SerpApi event scraper (has API keys — NOT in git)
├── refresh-buckets.js          # Daily time bucket refresh (has API keys — NOT in git)
├── _old/                       # Archived temp fix scripts (in .gitignore)
├── index.html                  # Entry HTML
├── package.json
├── vite.config.js
├── eslint.config.js
└── .gitignore
```

## Event Upload Methods
1. **Auto-pull:** `cd ~/drift-boulder && node fetch3.js` (runs daily at 6am via cron)
2. **Bucket refresh:** `cd ~/drift-boulder && node refresh-buckets.js` (runs daily at 6am via cron)
3. **Admin panel:** drift-boulder-now.vercel.app/admin.html (manual form + EZ Upload with Claude)
4. **Supabase:** Table Editor → events → Insert Row
5. **EZ Upload:** Copy prompt from admin panel → paste in Claude with event info → Claude returns JSON → paste in admin panel

## Cron Schedule
```
0 6 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node refresh-buckets.js >> /tmp/gojaney.log 2>&1
5 6 * * * cd /Users/lindsayscott/drift-boulder && /usr/local/bin/node fetch3.js >> /tmp/gojaney.log 2>&1
```
NOTE: Cron only runs when laptop is open and awake at 6am.

## fetch3.js Search Queries
- Things to do in Boulder CO this week
- Live music Boulder CO this week
- Comedy shows Boulder CO
- Concerts Boulder CO
- Events in Lyons CO
- Events in Louisville CO
- Events in Lafayette CO
- Events in Nederland CO

## Junk Filter (SKIP list)
chemical, engineering, shares, internship, volunteer, certification, training course, webinar, online, virtual, job fair, hiring, real estate, open house, church service, bible study, board meeting, city council

## Denver Filter (blocked locations)
denver, aurora, lakewood, littleton, englewood, thornton, arvada, westminster

## Next Steps (Priority Order)

### 1. Better Event Data
- Real event times (most auto-pulled events missing times)
- Real coordinates per event (most use default Boulder center — now matters more since the map is real)
- More food events (Google has very few — need manual curation)

## Completed
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
