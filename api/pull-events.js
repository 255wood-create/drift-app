import { runFetch } from "../lib/eventSearch.js";

// Triggered by the "Fetch New Events" button in public/admin.html.
// Requires SERPAPI_KEY, SUPABASE_URL, SUPABASE_ANON_KEY as Vercel env vars.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const serpApiKey = (process.env.SERPAPI_KEY || "").trim();
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
  const supabaseKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  if (!serpApiKey || !supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: "Missing SERPAPI_KEY, SUPABASE_URL, or SUPABASE_ANON_KEY env var on Vercel" });
    return;
  }

  for (const [name, val] of [["SERPAPI_KEY", serpApiKey], ["SUPABASE_URL", supabaseUrl], ["SUPABASE_ANON_KEY", supabaseKey]]) {
    for (let i = 0; i < val.length; i++) {
      if (val.charCodeAt(i) > 255) {
        res.status(500).json({ error: `${name} has an invalid character at position ${i} (code ${val.charCodeAt(i)}) — likely a bad copy-paste. Re-copy it from a plain text source and re-save it in Vercel.` });
        return;
      }
    }
  }

  try {
    const logs = [];
    const result = await runFetch({
      serpApiKey,
      supabaseUrl,
      supabaseKey,
      log: (msg) => logs.push(msg),
      concurrency: 8,
    });
    res.status(200).json({ ...result, logs: logs.slice(-50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
