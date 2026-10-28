import type { Metadata, Viewport } from "next";
import { Anuphan, Mali } from "next/font/google";
import "./globals.css";

const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mali",
  display: "swap",
});

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Giveaway Tracker 🎀",
  description: "เก็บลิงก์ให้ครบ ไม่พลาด Giveaway ที่อยากได้ 💗",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#21141b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-accent="pink" className={`${mali.variable} ${anuphan.variable}`}>
      <body>{children}</body>
    </html>
  );
}
