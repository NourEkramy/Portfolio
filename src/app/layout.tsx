import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Lora, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProfile } from "@/lib/data";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "NourEldin Ekramy Saad — Flutter App Developer",
    template: "%s · NourEldin Ekramy Saad",
  },
  description:
    "Flutter developer building mobile applications with Clean Architecture, MVVM and Cubit — localised, tested, and integrated with real REST APIs.",
  openGraph: {
    type: "website",
    title: "NourEldin Ekramy Saad — Flutter App Developer",
    description:
      "Flutter developer building mobile applications with Clean Architecture, MVVM and Cubit.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efe4ce" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1622" },
  ],
};

/**
 * Applied before paint so the chosen theme never flashes the wrong palette.
 * Reads the stored preference, then falls back to the OS setting.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = stored || (prefersDark ? "dark" : "light");
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    // The font variables must live on <html>, because :root reads them when it
    // builds --f-display and friends.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${lora.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-oxblood focus:px-4 focus:py-2 focus:text-surface"
        >
          Skip to content
        </a>
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader cvUrl={profile.cvUrl} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter profile={profile} />
        </div>
      </body>
    </html>
  );
}
