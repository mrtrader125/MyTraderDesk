import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚨 UPDATED: Metadata that reflects a Professional Analysis Floor
export const metadata: Metadata = {
  title: "MyTraderDesk | Professional Trading Floor & Market Analysis",
  description: "Trade with confluence. Join a professional digital trading desk to access high-probability market analysis, expert viewpoints, and institutional-grade setups.",
  keywords: ["trading floor", "market analysis", "trade confluence", "pro trading desk", "Sentinel Vortex", "crypto setups", "forex analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
