import { getJson } from "serpapi";

export const QUERIES = [
  "Things to do in Boulder CO this week",
  "Live music Boulder CO this week",
  "Comedy shows Boulder CO",
  "Concerts Boulder CO",
  "Events in Lyons CO",
  "Events in Louisville CO",
  "Events in Lafayette CO",
  "Events in Nederland CO",
  "Things to do in Boulder CO today",
  "Live music Boulder CO tonight",
  "Things to do in Boulder CO tomorrow",
  "Food events Boulder CO this week",
  "Fox Theatre Boulder CO events",
  "Boulder Theater events",
  "eTown Hall Boulder events",
  "Chautauqua Boulder events",
  "Avery Brewing Boulder events",
  "Wibby Brewing events",
  "Mountain Sun Boulder events",
  "Southern Sun Boulder events",
  "Pumphouse Brewery events",
  "License No. 1 Boulder events",
  "Bohemian Biergarten Boulder events",
  "Comedy Works events",
  "Velvet Elk Lounge Boulder events",
  "Roots Music Project Boulder events",
  "Eventbrite Boulder CO events",
  "University of Colorado Boulder events calendar",
  "Tulagi Boulder events",
  "Junkyard Social Boulder events",
  "Rayback Collective Boulder events",
  "Rosetta Hall Boulder events",
  "Outback Saloon Boulder events",
  "Boulder Social events",
  "The Spotted James Boulder events",
  "Macky Auditorium Boulder events",
  "The Speakeasy Boulder events",
  "Oskar Blues Lyons CO events",
  "Louisville Underground events",
];

const SKIP = ["chemical", "engineering", "shares", "internship", "volunteer", "certification", "training course", "webinar", "online", "virtual", "job fair", "hiring", "real estate", "open house", "church service", "bible study", "board meeting", "city council"];
const DENVER = ["denver", "aurora", "lakewood", "littleton", "englewood", "thornton", "arvada", "westminster"];

function isJunk(t) {
  t = (t || "").toLowerCase();
  return SKIP.some((s) => t.indexOf(s) >= 0);
}

function getBucket(d) {
  if (!d) return "Upcoming";
  const diff = Math.floor((new Date(d) - new Date()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 6) return "This Weekend";
  return "Upcoming";
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) || 1 }, worker));
  return results;
}

// Runs the full search -> filter -> dedupe -> insert pipeline.
// Used by both the local cron script (fetch3.js) and the admin panel's
// "Fetch New Events" button (api/pull-events.js).
export async function runFetch({ serpApiKey, supabaseUrl, supabaseKey, log = () => {}, concurrency = 8 }) {
  const headers = { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey };

  const existing = await fetch(supabaseUrl + "/rest/v1/events?select=title", { headers }).then((r) => r.json());
  const titles = new Set(existing.map((e) => (e.title || "").toLowerCase()));
  log("Existing: " + titles.size);

  const batches = await mapLimit(QUERIES, concurrency, async (q) => {
    log("Searching: " + q);
    try {
      const r = await getJson({ engine: "google_events", q, api_key: serpApiKey });
      return r.events_results || [];
    } catch (err) {
      log("  search failed for \"" + q + "\": " + err.message);
      return [];
    }
  });
  const allEvts = batches.flat();
  log("Total found: " + allEvts.length);

  let added = 0, skipped = 0, junk = 0;
  const toInsert = [];
  for (const e of allEvts) {
    if (isJunk(e.title || "")) { junk++; continue; }
    if (titles.has((e.title || "").toLowerCase())) { skipped++; continue; }
    const loc = ((e.address || []).join(" ") || "").toLowerCase();
    if (DENVER.some((d) => loc.indexOf(d) >= 0)) { junk++; continue; }

    const t = ((e.title || "") + " " + (e.description || "")).toLowerCase();
    let cat = "food";
    if (t.match(/comedy|improv|standup|stand-up|comedian|laugh|comic|underground|roast|sketch|comedy works|humor/)) cat = "comedy";
    else if (t.match(/music|band|jazz|concert|dj|guitar|live at|open mic|symphony|orchestra|album release|festival|singer|piano|violin|show|gig|performer|classical|opera|choir|etown|fox theatre|boulder theater|karaoke|bluegrass|folk|indie|rap|hip hop|edm|acoustic|trio|quartet|ensemble|philharmonic|songwriter/)) cat = "music";

    let sd = null;
    if (e.date && e.date.start_date) {
      const parts = e.date.start_date.split(" ");
      try {
        sd = parts.length === 2
          ? new Date(parts[0] + " " + parts[1] + ", " + new Date().getFullYear()).toISOString()
          : new Date(e.date.start_date).toISOString();
      } catch {
        sd = null;
      }
    }

    // Reserve the title now so a duplicate result from a different query
    // in this same run doesn't also get queued for insert.
    titles.add((e.title || "").toLowerCase());
    toInsert.push({
      title: e.title || "X",
      category: cat,
      location: (e.address || []).join(" ") || "Boulder",
      vibe: e.description ? e.description.substring(0, 80) : null,
      time_bucket: getBucket(sd),
      starts_at: sd,
      lat: 40.015,
      lng: -105.27,
      is_trending: false,
    });
  }

  await mapLimit(toInsert, concurrency, async (evt) => {
    const res = await fetch(supabaseUrl + "/rest/v1/events", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(evt),
    });
    if (res.ok) {
      added++;
      log("  + [" + evt.time_bucket + "] " + evt.title);
    } else {
      log("  x " + evt.title);
    }
  });

  log("Done! Added:" + added + " Skipped:" + skipped + " Junk:" + junk);
  return { added, skipped, junk, totalFound: allEvts.length };
}
