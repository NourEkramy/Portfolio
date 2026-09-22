import "server-only";

import { projects as staticProjects } from "@/content/projects";
import { galleries, posters } from "@/content/media";
import {
  education as staticEducation,
  experience as staticExperience,
  profile as staticProfile,
  skillGroups as staticSkills,
} from "@/content/profile";
import type {
  EducationItem,
  ExperienceItem,
  Profile,
  Project,
  SkillGroup,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/config";

/**
 * Every accessor follows the same shape: try Supabase, and on any miss — not
 * configured, table absent, empty result, network error — return the static
 * content instead. The site is therefore never broken by a database problem,
 * and it renders identically before and after the database is connected.
 */

/** The static projects with their curated galleries attached. */
function withGalleries(list: Project[]): Project[] {
  return list.map((project) => ({
    ...project,
    media: project.media.length > 0 ? project.media : (galleries[project.slug] ?? []),
    posterUrl: project.posterUrl ?? posters[project.slug],
  }));
}

const fallbackProjects = withGalleries(staticProjects);

type ProjectRow = Record<string, unknown> & {
  slug: string;
  title: string;
  project_media?: { url: string; caption: string | null; kind: string; sort_order: number }[];
  project_tech?: {
    name: string;
    version: string | null;
    kind: string;
    note: string | null;
    sort_order: number;
  }[];
  project_highlights?: { label: string; detail: string; sort_order: number }[];
  project_metrics?: { label: string; value: string; sort_order: number }[];
  project_decisions?: { title: string; detail: string; sort_order: number }[];
};

function bySortOrder<T extends { sort_order: number }>(rows: T[] | undefined): T[] {
  return [...(rows ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

function mapProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: (row.subtitle as string) ?? "",
    summary: (row.summary as string) ?? "",
    body: (row.body as string[]) ?? [],
    role: (row.role as string) ?? "",
    category: (row.category as string) ?? "",
    period: (row.period as string) ?? "",
    year: (row.year as number) ?? 0,
    featured: Boolean(row.featured),
    sortOrder: (row.sort_order as number) ?? 0,
    status: (row.status as Project["status"]) ?? "published",
    repoUrl: (row.repo_url as string) ?? undefined,
    liveUrl: (row.live_url as string) ?? undefined,
    paperUrl: (row.paper_url as string) ?? undefined,
    coverUrl: row.cover_url ? mediaUrl(row.cover_url as string) : undefined,
    videoUrl: row.video_url ? mediaUrl(row.video_url as string) : undefined,
    posterUrl: row.poster_url ? mediaUrl(row.poster_url as string) : posters[row.slug],
    architecture: (row.architecture as Project["architecture"]) ?? undefined,
    metrics: bySortOrder(row.project_metrics).map(({ label, value }) => ({ label, value })),
    highlights: bySortOrder(row.project_highlights).map(({ label, detail }) => ({ label, detail })),
    decisions: bySortOrder(row.project_decisions).map(({ title, detail }) => ({ title, detail })),
    tech: bySortOrder(row.project_tech).map((t) => ({
      name: t.name,
      version: t.version ?? undefined,
      kind: t.kind as Project["tech"][number]["kind"],
      note: t.note ?? undefined,
    })),
    media: bySortOrder(row.project_media).map((m) => ({
      url: mediaUrl(m.url),
      caption: m.caption ?? undefined,
      kind: m.kind as "screenshot" | "diagram",
    })),
  };
}

const PROJECT_SELECT = `
  *,
  project_media(url, caption, kind, sort_order),
  project_tech(name, version, kind, note, sort_order),
  project_highlights(label, detail, sort_order),
  project_metrics(label, value, sort_order),
  project_decisions(title, detail, sort_order)
`;

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  if (!supabase) return fallbackProjects;

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return fallbackProjects;
  return (data as ProjectRow[]).map(mapProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  const supabase = await createClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) return mapProject(data as ProjectRow);
  }

  return fallbackProjects.find((project) => project.slug === slug) ?? null;
}

/** Slugs for generateStaticParams — always includes the static set. */
export function getProjectSlugs(): string[] {
  return fallbackProjects.map((project) => project.slug);
}

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  if (!supabase) return staticProfile;

  const { data, error } = await supabase.from("profile").select("*").maybeSingle();
  if (error || !data) return staticProfile;

  return {
    name: data.name ?? staticProfile.name,
    title: data.title ?? staticProfile.title,
    tagline: data.tagline ?? staticProfile.tagline,
    bio: data.bio ?? staticProfile.bio,
    email: data.email ?? staticProfile.email,
    phone: data.phone ?? staticProfile.phone,
    location: data.location ?? staticProfile.location,
    github: data.github ?? staticProfile.github,
    linkedin: data.linkedin ?? staticProfile.linkedin,
    leetcode: data.leetcode ?? staticProfile.leetcode,
    codeforces: data.codeforces ?? staticProfile.codeforces,
    cvUrl: data.cv_url ? mediaUrl(data.cv_url) : staticProfile.cvUrl,
    portraitUrl: data.portrait_url ? mediaUrl(data.portrait_url) : staticProfile.portraitUrl,
    portraitWideUrl: data.portrait_wide_url
      ? mediaUrl(data.portrait_wide_url)
      : staticProfile.portraitWideUrl,
    languages: data.languages ?? staticProfile.languages,
  };
}

export async function getExperience(): Promise<ExperienceItem[]> {
  const supabase = await createClient();
  if (!supabase) return staticExperience;

  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return staticExperience;

  return data.map((row) => ({
    role: row.role,
    company: row.company,
    location: row.location ?? undefined,
    period: row.period,
    current: Boolean(row.current),
    bullets: row.bullets ?? [],
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function getEducation(): Promise<EducationItem[]> {
  const supabase = await createClient();
  if (!supabase) return staticEducation;

  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return staticEducation;

  return data.map((row) => ({
    title: row.title,
    institution: row.institution,
    location: row.location ?? undefined,
    period: row.period,
    detail: row.detail ?? undefined,
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  const supabase = await createClient();
  if (!supabase) return staticSkills;

  const { data, error } = await supabase
    .from("skill_groups")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return staticSkills;

  return data.map((row) => ({
    name: row.name,
    items: row.items ?? [],
    sortOrder: row.sort_order ?? 0,
  }));
}
