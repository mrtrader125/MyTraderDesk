import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 🚨 1. IMPORT INSTITUTIONAL FONTS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mytraderdesk.com'),
  title: {
    default: "MyTraderDesk | Professional Trading Floor & Market Analysis",
    template: "%s | MyTraderDesk"
  },
  description: "Trade with confluence. Join a professional digital trading desk to access high-probability market analysis, expert viewpoints, and institutional-grade setups.",
  keywords: ["trading floor", "market analysis", "trade confluence", "pro trading desk", "Sentinel Vortex", "crypto setups", "forex analysis"],
  openGraph: {
    title: "MyTraderDesk | Professional Trading Floor",
    description: "Validate your setups against professional institutional analysis.",
    url: 'https://mytraderdesk.com',
    siteName: 'Sentinel Vortex',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MyTraderDesk Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MyTraderDesk | Professional Trading Floor",
    description: "Validate your setups against professional institutional analysis.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      {/* 🚨 CHANGED: Replaced bg-black with bg-black to enforce the true black background */}
      <body className="bg-black text-white font-sans antialiased selection:bg-blue-500/30">
        {children}

        {/* JSON-LD Schema for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sentinel Vortex",
              "alternateName": "MyTraderDesk",
              "url": "https://mytraderdesk.com",
              "logo": "https://mytraderdesk.com/og-image.jpg",
              "description": "A professional digital trading floor providing institutional-grade structural analysis and market confluence.",
              "sameAs": [
                "https://instagram.com/sentinel_vortex" 
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
