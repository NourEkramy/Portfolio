# NourEldin Ekramy Saad — Portfolio

A portfolio for a Flutter developer, built with Next.js and Supabase.

Two themes: **Paper** (parchment, oxblood, walnut) and **Midnight** (navy ground,
beige ink, brick red). The toggle sits in the header and the choice is
remembered; an inline script applies it before first paint so the wrong palette
never flashes.

```
Home       hero, ledger of numbers, three featured projects, approach, contact
Projects   every project as a card
Project    overview, demo video, architecture, features, decisions, stack, screens
CV         the full CV rendered on the page, plus the PDF to download
Contact    direct details and a form that emails the enquiry to the inbox
Dashboard  private — edit projects, profile and read messages
```

---

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

**Supabase is optional.** With no environment variables the site renders the
content committed in `src/content`, so a fresh clone works immediately. Only the
dashboard needs a database.

---

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).

2. Copy the example environment file and fill it in from **Settings → API**:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Where it comes from |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API keys → `anon` / `public` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → `service_role` — **server only** |
   | `DATABASE_URL` | Settings → Database → Connection string → URI — optional, for `npm run db:setup` |
   | `RESEND_API_KEY` | resend.com → API Keys — for contact-form email |

3. Create the tables, policies, storage bucket and content. Either paste
   **`supabase/schema.sql`** then **`supabase/seed.sql`** into the SQL editor,
   or add `DATABASE_URL` to `.env.local` (Settings → Database → Connection
   string → URI, session pooler on port 5432) and let the script do it:

   ```bash
   npm run db:setup
   ```

   At any point, `npm run db:check` prints what is wired up and what is not —
   env vars, table row counts, the storage bucket and the auth users — without
   printing any key.

4. Create your login under **Authentication → Users → Add user**. There is no
   public sign-up — the dashboard is for one person.

5. Upload the media so it is served from Supabase rather than `/public`:

   ```bash
   npm run upload:media
   ```

6. Restart `npm run dev`. The site now reads from the database, and
   `/dashboard` works.

### Contact email

The contact form sends through [Resend](https://resend.com) — free, 3000 emails
a month, one API key:

1. Sign up with the address the enquiries should land in.
2. Create an API key and put it in `.env.local` as `RESEND_API_KEY`.

Resend's shared sender, `onboarding@resend.dev`, needs no domain verification
but will only deliver to the address the account was created with — which is
exactly what this form wants. To send from your own domain later, verify it in
Resend and set `MAIL_FROM`.

Each enquiry arrives with the sender's address as `Reply-To`, so replying from
the mail client answers them directly. If the send fails, a copy is written to
the `messages` table and the visitor is handed a pre-filled `mailto`, so nothing
is lost either way.

### How the fallback behaves

Every data accessor in `src/lib/data.ts` tries Supabase and returns the static
content on any miss — not configured, table absent, empty result, network error.
A database problem can never blank the site, and pages look identical before and
after you connect it.

---

## Editing content

**Through the dashboard** (needs Supabase) at `/dashboard`. Projects, the
profile, the CV file and the portrait are all editable, and uploads go straight
from the browser into the storage bucket.

List fields are entered one item per line:

| Field | Format |
|---|---|
| Body, Bio | one paragraph per line |
| Metrics | `label :: value` |
| Highlights | `label :: detail` |
| Decisions | `title :: detail` |
| Architecture layers | `name :: detail` |
| Gallery | `url :: caption` |
| Stack | `name \| version \| kind \| note` |

`kind` is one of `package`, `language`, `tool`, `service`, `concept`. Packages
and services render as a table with versions and notes; the rest render as tags.

**Through the repository** — edit `src/content/projects.ts`, `profile.ts` or
`media.ts`, then regenerate the seed:

```bash
npm run seed:sql
```

That rewrites `supabase/seed.sql` from the same content the site renders, so the
two never drift. Re-running the seed in Supabase replaces what it inserted last
time.

---

## Media pipeline

```bash
npm run media
```

`scripts/prepare-media.mjs` does everything in one pass:

- converts screenshots to WebP at 828px wide — 130 images, about 3.5 MB total
- re-encodes the demo recordings at CRF 28 with `+faststart`
  (**95 MB → 9.6 MB**, no visible loss at phone resolution)
- lifts curated stills out of those recordings, so the galleries show the apps
  actually running rather than design mockups
- pulls a poster frame for each video
- resizes the portraits and copies the CV

Raw sources live in `.raw-assets/` (git-ignored). The timestamps for the
extracted stills are listed in `SOURCES.frames` in that script — change one and
re-run to swap a screenshot.

---

## Layout

```
src/
├── app/
│   ├── page.tsx                  home
│   ├── projects/[slug]/          project detail
│   ├── cv/                       CV + PDF download
│   ├── contact/                  form → messages table
│   ├── dashboard/
│   │   ├── login/                sits outside the (panel) group
│   │   └── (panel)/              signed-in chrome
│   └── globals.css               palette, typography, components
├── components/
├── content/                      the static fallback and seed source
└── lib/
    ├── data.ts                   Supabase-or-fallback accessors
    ├── types.ts
    └── supabase/                 browser, server and middleware clients
```

Auth is enforced in `src/middleware.ts`, which revalidates the session with
`getUser()` on every dashboard request rather than trusting the cookie.

---

## Deploying

Push to GitHub, import the repository into Vercel, and add the same environment
variables (plus `NEXT_PUBLIC_SITE_URL` set to the deployed origin). The public
pages are static; only the dashboard renders on demand.

The transcoded videos are small enough to stay in the repository, so the site
works on Vercel even before Supabase Storage is wired up.
