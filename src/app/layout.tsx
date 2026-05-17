import type { Metadata } from "next";

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-bone text-ink antialiased">
        <ThemeProvider>
          <SiteHeader />
          <div className="min-w-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
          <div className="hidden md:block">
            <SiteFooter />
          </div>
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
