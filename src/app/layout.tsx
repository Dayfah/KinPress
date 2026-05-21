import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { getServerAuthSession, serializeAuthSession } from "@/lib/auth/session";
import { KINPRESS_DESCRIPTION, KINPRESS_TITLE } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: KINPRESS_TITLE,
  description: KINPRESS_DESCRIPTION,
  manifest: "/site.webmanifest",
  openGraph: {
    title: KINPRESS_TITLE,
    description: KINPRESS_DESCRIPTION,
    siteName: "KinPress",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      {
        url: "/kinpress-logo-mark-dark.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/kinpress-logo-mark-light.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
    apple: "/kinpress-app-icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialAuth = { user: null, profile: null } as ReturnType<
    typeof serializeAuthSession
  >;

  try {
    initialAuth = serializeAuthSession(await getServerAuthSession());
  } catch {
    initialAuth = { user: null, profile: null };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/kinpress-logo-mark-dark.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/kinpress-logo-mark-light.svg" as="image" type="image/svg+xml" />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-bone text-ink antialiased kp-theme-transition">
        <ThemeProvider>
          <AuthShell
            initialProfile={initialAuth.profile}
            initialUser={initialAuth.user}
          >
            <a className="kp-skip-link" href="#main-content">
              Skip to content
            </a>
            <SiteHeader />
            <div
              className="min-w-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0"
              id="main-content"
            >
              {children}
            </div>
            <div className="hidden md:block">
              <SiteFooter />
            </div>
            <MobileBottomNav />
          </AuthShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
