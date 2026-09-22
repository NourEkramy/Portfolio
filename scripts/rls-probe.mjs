/**
 * Checks that row level security actually holds: what a public visitor can
 * read, write and tamper with, versus what the server key can reach.
 *
 *   npm run db:rls
 *
 * Inserts one probe message and deletes it again, so it is safe to re-run.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./env.mjs";
await loadEnv();

const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = createClient(endpoint, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const svc  = createClient(endpoint, process.env.SUPABASE_SERVICE_ROLE_KEY,   { auth: { persistSession: false } });

console.log("PUBLISHABLE key — what a public visitor can do:");
const p = await anon.from("projects").select("slug");
console.log("  read projects :", p.error ? `FAIL ${p.error.message}` : `${p.data.length} visible`);

const m = await anon.from("messages").select("id");
console.log("  read messages :", m.error ? `blocked (${m.error.code})` : `${m.data.length} visible`);

const w = await anon.from("messages").insert({ name: "RLS probe", email: "p@example.com", message: "x" });
console.log("  send message  :", w.error ? `FAIL ${w.error.message}` : "allowed (by design)");

const u = await anon.from("projects").update({ title: "TAMPERED" }).eq("slug", "recipe-app").select();
console.log("  edit projects :", u.error ? "blocked" : u.data.length === 0 ? "blocked (0 rows affected)" : "WARNING: allowed!");

console.log("\nSECRET key — what the server can do:");
const s1 = await svc.from("messages").select("id,name");
console.log("  read messages :", s1.error ? `FAIL ${s1.error.message}` : `${s1.data.length} visible`);
const s2 = await svc.storage.listBuckets();
console.log("  storage       :", s2.error ? `FAIL ${s2.error.message}` : s2.data.map((b) => b.name).join(", "));
const s3 = await svc.auth.admin.listUsers();
console.log("  auth admin    :", s3.error ? `FAIL ${s3.error.message}` : `${s3.data.users.length} user(s)`);

await svc.from("messages").delete().eq("name", "RLS probe");
const after = await svc.from("messages").select("id");
console.log("  after cleanup :", `${after.data.length} real message(s)`);

const title = await svc.from("projects").select("title").eq("slug", "recipe-app").single();
console.log("  recipe title  :", title.data.title);
