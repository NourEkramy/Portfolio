/**
 * Runs a .sql file against the project database, so the schema and seed can be
 * applied without opening the Supabase SQL editor.
 *
 *   npm run db:setup              # schema.sql then seed.sql
 *   npm run db:sql -- supabase/seed.sql
 *
 * Needs a connection string in .env.local:
 *
 *   DATABASE_URL=postgresql://postgres.<ref>:<password>@<host>:5432/postgres
 *
 * Get it from Settings -> Database -> Connection string -> URI, and use the
 * session pooler (port 5432) rather than the transaction pooler, because the
 * schema runs DDL inside a transaction.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { ROOT, loadEnv, required } from "./env.mjs";

await loadEnv();

const connectionString = required(
  "DATABASE_URL",
  "Settings -> Database -> Connection string -> URI (session pooler, port 5432).",
);

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/run-sql.mjs <file.sql> [more.sql ...]");
  process.exit(1);
}

/** Never print the password, whatever goes wrong. */
function redact(text) {
  return String(text).replace(/:\/\/([^:]+):([^@]+)@/g, "://$1:****@");
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  // The seed is one large multi-statement script; give it room.
  statement_timeout: 120_000,
});

try {
  await client.connect();
  const { rows } = await client.query("select current_database() db, version()");
  console.log(`Connected to ${rows[0].db}\n`);

  for (const file of files) {
    const full = path.isAbsolute(file) ? file : path.join(ROOT, file);
    const sql = await readFile(full, "utf8");
    process.stdout.write(`${path.basename(file)} … `);

    // node-postgres sends the whole string as a simple query, which Postgres
    // executes statement by statement — exactly what these files expect.
    await client.query(sql);
    console.log("ok");
  }

  // A quick census so the result is visible without opening the dashboard.
  const census = await client.query(`
    select 'projects' t, count(*)::int n from public.projects
    union all select 'project_media', count(*)::int from public.project_media
    union all select 'project_tech', count(*)::int from public.project_tech
    union all select 'project_highlights', count(*)::int from public.project_highlights
    union all select 'project_metrics', count(*)::int from public.project_metrics
    union all select 'project_decisions', count(*)::int from public.project_decisions
    union all select 'experience', count(*)::int from public.experience
    union all select 'education', count(*)::int from public.education
    union all select 'skill_groups', count(*)::int from public.skill_groups
    union all select 'profile', count(*)::int from public.profile
    union all select 'messages', count(*)::int from public.messages
    order by 1
  `);

  console.log("\nRows:");
  for (const row of census.rows) console.log(`  ${row.t.padEnd(20)} ${row.n}`);
} catch (error) {
  console.error(`\nFailed: ${redact(error.message)}`);
  if (error.position) console.error(`  at character ${error.position}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
