with open('src/App.jsx', 'r') as f:
    content = f.read()

if "createClient" not in content:
    content = content.replace(
        'import { useState, useEffect, useCallback } from "react";',
        'import { useState, useEffect, useCallback } from "react";\nimport { createClient } from \'@supabase/supabase-js\';'
    )

content = content.replace(
    'const SUPABASE_READY = SUPABASE_URL.includes("supabase.co");',
    'const SUPABASE_READY = true;\nconst supabase = createClient(SUPABASE_URL, SUPABASE_ANON);'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)

print("Done! Has createClient:", "createClient" in content)
