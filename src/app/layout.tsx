import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { getServerAuthSession, serializeAuthSession } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinPress | Black news, culture, and community",
  description:
    "A premium Black-centered news, culture, history, politics, business, arts, opinion, and community platform.",
  icons: {
    icon: "/kinpress-logo.svg",
    apple: "/kinpress-logo.svg",
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
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-bone text-ink antialiased">
        <ThemeProvider>
          <AuthShell
            initialProfile={initialAuth.profile}
            initialUser={initialAuth.user}
          >
            <SiteHeader />
            <div className="min-w-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
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
