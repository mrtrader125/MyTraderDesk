import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Trader Operating System For Consistent Traders",

  description:
    "MyTraderDesk helps traders build consistency through execution tracking, behavioral journaling, accountability systems, and structured trading routines.",

  alternates: {
    canonical: "https://mytraderdesk.com",
  },

  openGraph: {
    title: "Trader Operating System For Consistent Traders",

    description:
      "Build consistency through execution tracking, trader accountability, and structured workflows.",

    url: "https://mytraderdesk.com",

    siteName: "MyTraderDesk",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MyTraderDesk",
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "MyTraderDesk",

    description:
      "Trader operating system focused on execution discipline and consistency.",

    images: ["/og-image.jpg"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
