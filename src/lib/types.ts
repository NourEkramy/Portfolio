/**
 * The shapes below are shared by the static fallback content, the Supabase
 * tables and the dashboard editor. Keeping one definition means the site renders
 * identically whether or not Supabase is connected.
 */

export type TechKind = "package" | "language" | "tool" | "service" | "concept";

export interface Tech {
  name: string;
  version?: string;
  kind: TechKind;
  /** What this dependency actually does in the project. */
  note?: string;
}

export interface Highlight {
  label: string;
  detail: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface MediaItem {
  url: string;
  caption?: string;
  kind: "screenshot" | "diagram";
}

export interface Architecture {
  /** e.g. "MVVM + Cubit, feature-first" */
  name: string;
  /** A paragraph on why this shape was chosen. */
  summary: string;
  /** An ASCII folder tree, rendered in a monospaced panel. */
  tree?: string;
  /** Short layer-by-layer notes. */
  layers?: { name: string; detail: string }[];
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  /** Long-form paragraphs for the detail page. */
  body: string[];
  role: string;
  category: string;
  period: string;
  year: number;
  featured: boolean;
  sortOrder: number;
  status: "published" | "draft";
  repoUrl?: string;
  liveUrl?: string;
  paperUrl?: string;
  coverUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  architecture?: Architecture;
  metrics: Metric[];
  highlights: Highlight[];
  tech: Tech[];
  media: MediaItem[];
  /** Engineering decisions worth defending in an interview. */
  decisions?: { title: string; detail: string }[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  period: string;
  current: boolean;
  bullets: string[];
  sortOrder: number;
}

export interface EducationItem {
  title: string;
  institution: string;
  location?: string;
  period: string;
  detail?: string;
  sortOrder: number;
}

export interface SkillGroup {
  name: string;
  items: string[];
  sortOrder: number;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string[];
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  cvUrl: string;
  portraitUrl: string;
  portraitWideUrl?: string;
  languages: { name: string; level: string }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
