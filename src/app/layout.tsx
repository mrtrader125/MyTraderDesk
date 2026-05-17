import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mytraderdesk.com"),

  title: {
    default: "MyTraderDesk | Trader Operating System & Execution Platform",
    template: "%s | MyTraderDesk",
  },

  description:
    "MyTraderDesk is a trader operating system built for consistency, execution discipline, accountability, behavioral journaling, and structured trading workflows.",

  keywords: [
    "trader operating system",
    "trading consistency",
    "execution tracking",
    "trader psychology",
    "behavioral journaling",
    "prop firm discipline",
    "trading accountability",
    "trading workflow",
    "trading routine",
    "forex trader system",
    "MT5 journaling",
    "trading execution platform",
  ],

  alternates: {
    canonical: "https://mytraderdesk.com",
  },

  openGraph: {
    title: "MyTraderDesk | Trader Operating System",
    description:
      "Build consistency through execution tracking, behavioral journaling, accountability, and structured trading systems.",
    url: "https://mytraderdesk.com",
    siteName: "MyTraderDesk",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MyTraderDesk Trading Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MyTraderDesk | Trader Operating System",
    description:
      "Execution systems, trader accountability, behavioral journaling, and trading consistency infrastructure.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },

  category: "Trading Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#050505] text-white font-sans antialiased selection:bg-blue-500/30">
        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "MyTraderDesk",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              url: "https://mytraderdesk.com",
              description:
                "Trader operating system focused on execution discipline, behavioral tracking, accountability, and consistency.",
              brand: {
                "@type": "Brand",
                name: "MyTraderDesk",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
