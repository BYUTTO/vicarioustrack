import type { Metadata } from "next";
import { Newsreader, Work_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"] });
const workSans = Work_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "VicariousTrack — Compassion Fatigue Monitoring",
  description: "Weekly ProQOL & STSS check-ins with supervisor alerts for trauma-exposed clinical teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${workSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
