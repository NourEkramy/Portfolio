import type { Metadata } from "next";

/**
 * Everything under /dashboard is private and must never be indexed. The
 * (panel) route group adds the signed-in chrome; /dashboard/login sits outside
 * it so the login screen does not render a sign-out button.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
