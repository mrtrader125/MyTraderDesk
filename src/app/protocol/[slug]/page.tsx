import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// 1. DATA MAP FOR THE PROTOCOLS
const protocolData = {
  identity: {
    metaTitle: "Protocol 01: Trader Identity | MyTraderDesk",
    metaDesc: "Shift your identity from retail gambler to systematic operator. Detach your self-worth from PnL and focus entirely on execution.",
    label: "Core Protocol // 01",
    h1: "The Operator Identity",
    intro: "Amateurs trade to feel something. Professionals trade to execute a mathematical edge. Your first transition must be a complete shift in psychological identity.",
    nextLink: "/protocol/strategy",
    nextText: "Next: Protocol 02 // Strategy →",
    sections: [
      {
        title: "Killing The Retail Mindset",
        content: [
          "The retail industry wants you to believe trading is about predicting the future. It is not. Trading is about managing probabilities in a completely random environment. If your ego is attached to whether a specific trade wins or loses, you have already lost.",
          "An Operator detaches entirely from the outcome. Their only source of pride is how flawlessly they executed their system parameters."
        ]
      },
      {
        title: "Accepting The Drawdown",
        content: [
          "Losing streaks are mathematically guaranteed. Your response to a drawdown defines your identity. A gambler revenge-trades to win it back; an Operator recognizes the statistical variance, lowers their risk parameters, and continues executing without hesitation."
        ]
      }
    ]
  },
  strategy: {
    metaTitle: "Protocol 02: Strategy Engineering | MyTraderDesk",
    metaDesc: "A strategy is not magic; it is a probabilistic edge. Learn how to engineer mechanical rules that eliminate subjectivity.",
    label: "Core Protocol // 02",
    h1: "Strategy Engineering",
    intro: "Remove discretion. If your trading strategy cannot be translated into a rigid, algorithmic checklist, it is not a strategy—it is a guess.",
    nextLink: "/protocol/system",
    nextText: "Next: Protocol 03 // System →",
    sections: [
      {
        title: "Mechanical Over Subjective",
        content: [
          "If you put five traders in a room with the same 'subjective' strategy, you will get five different executions. A true operational strategy has zero ambiguity. The conditions are either met, or they are not."
        ]
      }
    ],
    tactical: {
      title: "Binary Confluence Model",
      items: [
        "HTF Trend Alignment: [TRUE/FALSE]",
        "Liquidity Sweep: [TRUE/FALSE]",
        "Time Window Active: [TRUE/FALSE]"
      ]
    }
  },
  system: {
    metaTitle: "Protocol 03: System Architecture | MyTraderDesk",
    metaDesc: "Your strategy tells you when to buy. Your system tells you how to survive. Build an institutional framework around your edge.",
    label: "Core Protocol // 03",
    h1: "System Architecture",
    intro: "A strategy without a system is dangerous. The system is the defensive infrastructure that protects you from yourself.",
    nextLink: "/protocol/routine",
    nextText: "Next: Protocol 04 // Routine →",
    sections: [
      {
        title: "The Three Pillars",
        content: [
          "An institutional system requires three locked pillars: Strategy (the edge), Risk Management (the math), and Psychology (the operational adherence).",
          "If any of these pillars break, the system collapses. MyTraderDesk is built to monitor system health, flagging imperfect execution the moment it occurs."
        ]
      }
    ]
  },
  routine: {
    metaTitle: "Protocol 04: Operational Routine | MyTraderDesk",
    metaDesc: "Automate your discipline. Master the pre-market, execution window, and post-market review processes.",
    label: "Core Protocol // 04",
    h1: "Operational Routine",
    intro: "The market is chaos. Your routine is the only controlled variable. Standardize your daily operations to eliminate emotional randomness.",
    nextLink: "/apply",
    nextText: "Apply For Platform Access",
    sections: [
      {
        title: "Zero Tolerance For Missed Prep",
        content: [
          "If you fail to execute your pre-market analysis, you forfeit the right to trade that session. Missed prep guarantees poor decision-making. Your routine must be a non-negotiable prerequisite to unlocking your terminal."
        ]
      }
    ]
  }
};

type ValidSlug = keyof typeof protocolData;

// 2. GENERATE STATIC PARAMS FOR SEO (Tells Next.js to pre-build these 4 pages)
export function generateStaticParams() {
  return Object.keys(protocolData).map((slug) => ({
    slug: slug,
  }));
}

// 3. DYNAMIC METADATA FOR SEO
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const data = protocolData[params.slug as ValidSlug];
  
  if (!data) {
    return { title: "Protocol Not Found | MyTraderDesk" };
  }

  return {
    title: data.metaTitle,
    description: data.metaDesc,
    alternates: {
      canonical: `/protocol/${params.slug}`,
    },
  };
}

// 4. THE PAGE UI
export default function ProtocolPage({ params }: { params: { slug: string } }) {
  const data = protocolData[params.slug as ValidSlug];

  if (!data) {
    notFound();
  }

  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          {data.label}
        </p>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          {data.h1}
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          {data.intro}
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        {data.sections.map((section, index) => (
          <div key={index} className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
              {section.title}
            </h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
            </div>

            {/* Render tactical checklist only if it exists in the data */}
            {data.tactical && index === 0 && (
              <div className="bg-[#050505] border border-neutral-900 rounded-xl p-6 mt-6">
                <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-4">
                  {data.tactical.title}
                </p>
                <ul className="space-y-3 text-sm text-neutral-300 font-mono">
                  {data.tactical.items.map((item, iIndex) => (
                    <li key={iIndex} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-neutral-700"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <Link 
            href={data.nextLink} 
            className={`inline-block px-8 py-3 font-semibold rounded-lg transition-colors duration-200 ${
              params.slug === "routine" 
                ? "bg-white text-black hover:bg-neutral-200" 
                : "border border-neutral-700 text-white hover:bg-neutral-900"
            }`}
          >
            {data.nextText}
          </Link>
        </div>
      </section>
    </main>
  );
}
