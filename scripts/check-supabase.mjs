/**
 * Reports what is and is not wired up, so setup problems are visible without
 * guessing. Reads .env.local and never prints a key.
 *
 *   npm run db:check
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./env.mjs";

await loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB = process.env.DATABASE_URL;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "portfolio-media";

const ok = (s) => `  [x] ${s}`;
const no = (s) => `  [ ] ${s}`;

console.log("\nEnvironment (.env.local)");
console.log(URL ? ok(`NEXT_PUBLIC_SUPABASE_URL  ${URL}`) : no("NEXT_PUBLIC_SUPABASE_URL"));
console.log(ANON ? ok("NEXT_PUBLIC_SUPABASE_ANON_KEY") : no("NEXT_PUBLIC_SUPABASE_ANON_KEY  — Settings > API > anon/public"));
console.log(SERVICE ? ok("SUPABASE_SERVICE_ROLE_KEY") : no("SUPABASE_SERVICE_ROLE_KEY  — Settings > API > service_role (upload only)"));
console.log(DB ? ok("DATABASE_URL") : no("DATABASE_URL  — optional, lets `npm run db:setup` run the SQL for you"));

if (!URL || !ANON) {
  console.log("\nThe site still renders the committed content in src/content until those two are set.\n");
  process.exit(0);
}

const supabase = createClient(URL, SERVICE || ANON, { auth: { persistSession: false } });

console.log("\nTables");
const TABLES = [
  "profile", "projects", "project_media", "project_tech", "project_highlights",
  "project_metrics", "project_decisions", "experience", "education",
  "skill_groups", "messages",
];

let missing = 0;
for (const table of TABLES) {
  // A `head: true` request answers 204 with no body and no error even when the
  // table is absent, so ask for rows and let PostgREST raise PGRST205 instead.
  const { count, error } = await supabase.from(table).select("*", { count: "exact" }).limit(0);
  if (error) {
    missing += 1;
    const reason = /does not exist|schema cache/i.test(error.message) ? "not created" : error.message;
    console.log(no(`${table.padEnd(20)} ${reason}`));
  } else {
    console.log(ok(`${table.padEnd(20)} ${count} rows`));
  }
}

console.log("\nStorage");
if (!SERVICE) {
  console.log("  ?  needs SUPABASE_SERVICE_ROLE_KEY to inspect");
} else {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log(no(`could not list buckets — ${error.message}`));
  } else {
    const found = buckets.find((b) => b.name === BUCKET);
    if (!found) {
      console.log(no(`bucket "${BUCKET}" — created by schema.sql, or by npm run upload:media`));
    } else {
      const { data: objects } = await supabase.storage.from(BUCKET).list("media", { limit: 1000 });
      console.log(ok(`bucket "${BUCKET}" (${found.public ? "public" : "PRIVATE — should be public"})`));
      console.log(`      ${objects?.length ?? 0} folders under media/`);
    }
  }
}

console.log("\nAuth");
if (!SERVICE) {
  console.log("  ?  needs SUPABASE_SERVICE_ROLE_KEY to inspect");
} else {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.log(no(`could not list users — ${error.message}`));
  } else if (data.users.length === 0) {
    console.log(no("no users — Authentication > Users > Add user, with Auto Confirm on"));
  } else {
    for (const user of data.users) {
      const confirmed = user.email_confirmed_at ? "confirmed" : "NOT CONFIRMED";
      console.log(ok(`${user.email} (${confirmed})`));
    }
  }
}

console.log(
  missing === 0
    ? "\nEverything is in place. Restart `npm run dev` and the site reads from Supabase.\n"
    : `\n${missing} table(s) missing — run: npm run db:setup  (or paste supabase/schema.sql into the SQL editor)\n`,
);
