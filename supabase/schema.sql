-- ============================================================================
--  Portfolio schema
--  Run this once in the Supabase SQL editor, then run seed.sql.
--
--  Read access is public for published rows; every write requires an
--  authenticated session, which is what the dashboard signs you into.
-- ============================================================================

-- ----------------------------------------------------------------- profile --
create table if not exists public.profile (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  title             text not null,
  tagline           text,
  bio               jsonb not null default '[]'::jsonb,   -- string[]
  email             text not null,
  phone             text,
  location          text,
  github            text,
  linkedin          text,
  leetcode          text,
  codeforces        text,
  cv_url            text,
  portrait_url      text,
  portrait_wide_url text,
  languages         jsonb not null default '[]'::jsonb,   -- {name, level}[]
  updated_at        timestamptz not null default now()
);

-- Exactly one profile row.
create unique index if not exists profile_singleton on public.profile ((true));

-- ---------------------------------------------------------------- projects --
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  subtitle      text,
  summary       text,
  body          jsonb not null default '[]'::jsonb,       -- paragraph string[]
  role          text,
  category      text,
  period        text,
  year          int,
  featured      boolean not null default false,
  sort_order    int not null default 0,
  status        text not null default 'published'
                check (status in ('published', 'draft')),
  repo_url      text,
  live_url      text,
  paper_url     text,
  cover_url     text,
  video_url     text,
  poster_url    text,
  architecture  jsonb,                                    -- {name, summary, tree, layers[]}
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_status_sort
  on public.projects (status, sort_order);

-- ----------------------------------------------------------- project children --
create table if not exists public.project_media (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url        text not null,
  caption    text,
  kind       text not null default 'screenshot'
             check (kind in ('screenshot', 'diagram')),
  sort_order int not null default 0
);

create table if not exists public.project_tech (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name       text not null,
  version    text,
  kind       text not null default 'package'
             check (kind in ('package', 'language', 'tool', 'service', 'concept')),
  note       text,
  sort_order int not null default 0
);

create table if not exists public.project_highlights (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label      text not null,
  detail     text not null,
  sort_order int not null default 0
);

create table if not exists public.project_metrics (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label      text not null,
  value      text not null,
  sort_order int not null default 0
);

create table if not exists public.project_decisions (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null,
  detail     text not null,
  sort_order int not null default 0
);

create index if not exists project_media_fk      on public.project_media (project_id, sort_order);
create index if not exists project_tech_fk       on public.project_tech (project_id, sort_order);
create index if not exists project_highlights_fk on public.project_highlights (project_id, sort_order);
create index if not exists project_metrics_fk    on public.project_metrics (project_id, sort_order);
create index if not exists project_decisions_fk  on public.project_decisions (project_id, sort_order);

-- ------------------------------------------------------------------- CV data --
create table if not exists public.experience (
  id         uuid primary key default gen_random_uuid(),
  role       text not null,
  company    text not null,
  location   text,
  period     text not null,
  current    boolean not null default false,
  bullets    jsonb not null default '[]'::jsonb,
  sort_order int not null default 0
);

create table if not exists public.education (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  institution text not null,
  location    text,
  period      text not null,
  detail      text,
  sort_order  int not null default 0
);

create table if not exists public.skill_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  items      jsonb not null default '[]'::jsonb,
  sort_order int not null default 0
);

-- ------------------------------------------------------------------ messages --
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_unread on public.messages (read, created_at desc);

-- ============================================================================
--  Row level security
-- ============================================================================
alter table public.profile            enable row level security;
alter table public.projects           enable row level security;
alter table public.project_media      enable row level security;
alter table public.project_tech       enable row level security;
alter table public.project_highlights enable row level security;
alter table public.project_metrics    enable row level security;
alter table public.project_decisions  enable row level security;
alter table public.experience         enable row level security;
alter table public.education          enable row level security;
alter table public.skill_groups       enable row level security;
alter table public.messages           enable row level security;

-- Public read -----------------------------------------------------------------
drop policy if exists "public read profile" on public.profile;
create policy "public read profile"
  on public.profile for select to anon, authenticated using (true);

-- Drafts stay private; the dashboard reads them as an authenticated user.
drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects"
  on public.projects for select to anon, authenticated
  using (status = 'published' or auth.role() = 'authenticated');

do $$
declare t text;
begin
  foreach t in array array[
    'project_media', 'project_tech', 'project_highlights',
    'project_metrics', 'project_decisions'
  ] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format(
      'create policy "public read %1$s" on public.%1$I for select to anon, authenticated using (true)',
      t
    );
  end loop;

  foreach t in array array['experience', 'education', 'skill_groups'] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format(
      'create policy "public read %1$s" on public.%1$I for select to anon, authenticated using (true)',
      t
    );
  end loop;
end $$;

-- Anyone may send a message; only the owner may read them ----------------------
drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message"
  on public.messages for insert to anon, authenticated with check (true);

drop policy if exists "owner reads messages" on public.messages;
create policy "owner reads messages"
  on public.messages for select to authenticated using (true);

drop policy if exists "owner updates messages" on public.messages;
create policy "owner updates messages"
  on public.messages for update to authenticated using (true) with check (true);

drop policy if exists "owner deletes messages" on public.messages;
create policy "owner deletes messages"
  on public.messages for delete to authenticated using (true);

-- Authenticated writes everywhere else -----------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profile', 'projects', 'project_media', 'project_tech', 'project_highlights',
    'project_metrics', 'project_decisions', 'experience', 'education', 'skill_groups'
  ] loop
    execute format('drop policy if exists "owner writes %1$s" on public.%1$I', t);
    execute format(
      'create policy "owner writes %1$s" on public.%1$I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ============================================================================
--  updated_at maintenance
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists profile_touch on public.profile;
create trigger profile_touch before update on public.profile
  for each row execute function public.touch_updated_at();

-- ============================================================================
--  Storage bucket for screenshots, demo videos and the CV
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "owner writes media" on storage.objects;
create policy "owner writes media"
  on storage.objects for all to authenticated
  using (bucket_id = 'portfolio-media')
  with check (bucket_id = 'portfolio-media');
