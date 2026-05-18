import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, User, Map, ShieldCheck, Filter, ChevronLeft } from "lucide-react";

// --- CONTENT DATABASE (YOUR EXACT COPY) ---
const protocolContent = {
  identity: {
    metaTitle: "Trader vs. Operator | MyTraderDesk",
    metaDesc: "The 3-Year Trap: Why You're Still Not Profitable. Transition from a reactive trader to a systematic operator.",
    icon: User,
    color: "text-blue-500",
    bgLight: "bg-blue-500/10",
    title: "Trader vs. Operator",
    subtitle: "The 3-Year Trap: Why You're Still Not Profitable",
    paragraphs: [
      "If you have been in the markets for years, you already know the technicals. You’ve studied the charts, you have a strategy, and you know what a good setup looks like. Yet, you are still inconsistent.",
      "Why? Because your trading is entirely out of your control.",
      "As long as you act like a 'Trader'—waking up, hunting for setups, reacting emotionally to green and red candles—you will remain trapped. To become profitable, you must transition from a Learner to an Operator.",
      "An Operator does not guess. An Operator does not feel FOMO. An Operator has only one job: to flawlessly execute a pre-written system. You don't need a new execution method or a new guru. You need to cage your impulses and operate the machinery you’ve already built."
    ],
    nextNode: { slug: "strategy", name: "The Strategy" }
  },
  strategy: {
    metaTitle: "Strategy Simplification | MyTraderDesk",
    metaDesc: "Taking a calculated ride. Learn how to simplify your trading strategy down to structure, direction, and entry signals.",
    icon: Map,
    color: "text-cyan-500",
    bgLight: "bg-cyan-500/10",
    title: "Strategy Simplification",
    subtitle: "Taking a Calculated Ride",
    paragraphs: [
      "What is trading at its core? It is simply identifying an endless journey in the market and taking a very small, calculated ride in the right direction.",
      "Your strategy is the vehicle for that ride. It doesn't need to be complex; it just needs to answer these four questions:",
      "1. Structure: How has the market moved, and how is it likely to move next?\n2. Direction: Based on that structure, are we strictly looking for buys or sells?\n3. Entry Zone: Where is the precise area of value? (Determining this eliminates Buy/Sell confusion).\n4. Entry Signal: What exact micro-movement (e.g., an engulfing candle or LTF rejection) must happen in the zone before we pull the trigger?",
      "If you know these four things, you have a strategy. Now, you need the system to protect it."
    ],
    nextNode: { slug: "system", name: "The System" }
  },
  system: {
    metaTitle: "The Trading System Blueprint | MyTraderDesk",
    metaDesc: "Having a strategy is common. Having a system is rare. Build the blueprint for survival in the markets.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bgLight: "bg-emerald-500/10",
    title: "The System",
    subtitle: "Your Blueprint for Survival",
    paragraphs: [
      "Having a strategy is common. Having a system is rare.",
      "Your strategy tells you how to trade. Your system tells you exactly how to do it properly. It bridges the gap between theory and actual, cold execution.",
      "When you fail, it is rarely because your strategy was wrong. It is because you broke your system. The system dictates your risk, your session times, and your compliance. It is the invisible wall between you and the casino mentality.",
      "To turn your strategy into a functioning system, you must lock it inside a strict, unbreakable daily routine."
    ],
    nextNode: { slug: "routine", name: "The Routine" }
  },
  routine: {
    metaTitle: "The 3-Level Trading Routine | MyTraderDesk",
    metaDesc: "Cage the chaos with 3 levels of control. Master the Macro Filter, Micro Filter, and Execution Wait.",
    icon: Filter,
    color: "text-purple-500",
    bgLight: "bg-purple-500/10",
    title: "The Routine",
    subtitle: "Caging the Chaos with 3 Levels of Control",
    paragraphs: [
      "This is where profitability is actually manufactured. To stop overtrading and eliminate 'what to trade' confusion, Operators use a strict 3-Level Filtration Routine.",
      "Level 1: The Macro Filter (Weekend). Get away from the noise. Over the weekend, analyze the broader market and isolate a watchlist of just 10 to 20 instruments that meet your structural criteria.",
      "Level 2: The Micro Filter (Daily Selection). Every single day, after the Asian or early London session, look at your weekly watchlist and select only 2 instruments to play during the New York or late London session. Ignore everything else.",
      "Level 3: The Execution (The Wait). On those 2 chosen charts, map your Entry Zone. Now, you are free. You do absolutely nothing unless the price comes into your zone and prints your specific Entry Signal. You are no longer trading the market; you are executing a routine."
    ],
    nextNode: { slug: "identity", name: "The Identity" }
  }
};

type ValidSlug = keyof typeof protocolContent;

// --- SEO GENERATION ---
export function generateStaticParams() {
  return Object.keys(protocolContent).map((slug) => ({
    slug: slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const content = protocolContent[params.slug as ValidSlug];
  
  if (!content) {
    return { title: "Protocol Not Found | MyTraderDesk" };
  }

  return {
    title: content.metaTitle,
    description: content.metaDesc,
    alternates: {
      canonical: `https://mytraderdesk.com/protocol/${params.slug}`,
    },
  };
}

// --- SERVER COMPONENT UI ---
export default function ProtocolPage({ params }: { params: { slug: string } }) {
  const content = protocolContent[params.slug as ValidSlug];

  if (!content) {
    notFound();
  }

  const Icon = content.icon;

  return (
    <div className="bg-[#050505] text-neutral-200 min-h-screen font-sans selection:bg-blue-500/30 selection:text-white">
      
      {/* MINIMAL NAVBAR */}
      <nav className="w-full border-b border-neutral-900 bg-[#050505] py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Desk
          </Link>
          <Image src="/logo.png" alt="MyTraderDesk" width={100} height={24} className="object-contain opacity-50" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        
        {/* HEADER */}
        <div className="mb-16">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-sm mb-8 ${content.bgLight} border border-neutral-800`}>
            <Icon className={`w-6 h-6 ${content.color}`} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            {content.title}
          </h1>
          <h2 className="text-lg text-neutral-400 font-medium tracking-wide">
            {content.subtitle}
          </h2>
        </div>

        {/* CONTENT BODY */}
        <div className="space-y-8 mb-24">
          {content.paragraphs.map((text, idx) => (
            <p key={idx} className="text-neutral-300 leading-relaxed font-medium text-sm md:text-base">
              {text.includes('\n') ? (
                text.split('\n').map((line, i) => <span key={i} className="block mb-2">{line}</span>)
              ) : text}
            </p>
          ))}
        </div>

        {/* NEXT PROTOCOL LINK */}
        <div className="mt-16 pt-8 border-t border-neutral-900 flex justify-end">
          <Link href={`/protocol/${content.nextNode.slug}`} className="group flex flex-col items-end text-right">
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-2 group-hover:text-neutral-400 transition-colors">Next Module</span>
            <span className="flex items-center text-sm font-bold text-white uppercase tracking-wider">
              {content.nextNode.name} <ArrowRight className="ml-2 w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </span>
          </Link>
        </div>

      </main>
    </div>
  );
}
