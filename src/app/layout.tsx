import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinPress | Black news, culture, and community",
  description:
    "A premium Black-centered news, culture, history, politics, business, arts, opinion, and community platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
