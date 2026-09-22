import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/dashboard/actions";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
        <div>
          <p className="label">Private</p>
          <h1 className="display-md mt-1 text-ink">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="link-underline font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-3">
            View site ↗
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost px-4 py-2 text-[0.68rem]">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-x-7 gap-y-2 border-b border-rule-soft pb-4" aria-label="Dashboard">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="link-underline font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink-2 hover:text-oxblood"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="py-8">{children}</div>
    </div>
  );
}
