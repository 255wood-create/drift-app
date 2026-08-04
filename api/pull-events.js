import { runFetch } from "../lib/eventSearch.js";

// Triggered by the "Fetch New Events" button in public/admin.html.
// Requires SERPAPI_KEY, SUPABASE_URL, SUPABASE_ANON_KEY as Vercel env vars.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const serpApiKey = process.env.SERPAPI_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!serpApiKey || !supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: "Missing SERPAPI_KEY, SUPABASE_URL, or SUPABASE_ANON_KEY env var on Vercel" });
    return;
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
