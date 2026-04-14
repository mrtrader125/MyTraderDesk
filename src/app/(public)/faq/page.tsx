import { Metadata } from 'next'
import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

// 🚨 SEO: Metadata and OpenGraph tags
export const metadata: Metadata = {
  title: 'Frequently Asked Questions | MyTraderDesk',
  description: 'Everything you need to know about Sentinel Vortex, our trading philosophy, and how our terminal enforces discipline.',
  openGraph: {
    title: 'FAQ | MyTraderDesk',
    description: 'Learn how the MyTraderDesk platform operates and how it helps intermediate traders build systemic consistency.',
    url: 'https://mytraderdesk.com/faq',
    siteName: 'Sentinel Vortex',
    type: 'website',
  }
}

// 🚨 UPDATED: Removed old tiers, added Protocol & Terminal mechanics
const FAQS = [
  {
    q: "Is this a signal group?",
    a: "Absolutely not. Signal groups create dependency. MyTraderDesk provides institutional-grade structural analysis so you can validate your own bias and execute with confluence. It is designed for traders who want to build an edge, not blindly follow alerts."
  },
  {
    q: "Do I need a new strategy to use this?",
    a: "No. You bring your strategy. Our platform provides the system and the 3-Level Filtration Routine to help you actually execute it without emotional interference."
  },
  {
    q: "How does the software prevent overtrading?",
    a: "By enforcing our 3-Level Filtration Routine. Once you select your specific daily pairs inside the terminal dashboard, the system helps eliminate the distraction and FOMO of scanning 20 other charts."
  },
  {
    q: "What timeframes do you analyze?",
    a: "We take a top-down approach. Our daily analysis establishes the Weekly/Daily macro bias, identifies the 4H/1H structural framework, and pinpoints 15m execution zones."
  },
  {
    q: "Is this for beginners?",
    a: "No. This is built specifically for intermediate traders—those who have survived a few years in the market, know how to trade, but want stricter systemic control to finally reach profitability."
  },
  {
    q: "How often are setups posted?",
    a: "We post daily before the London and New York sessions. Our goal is quality over quantity; we only post instruments that have clear, highly-actionable structural setups."
  },
  {
    q: "Can I view the charts on my phone?",
    a: "Yes. The platform is fully responsive. You can view our high-resolution analysis charts seamlessly on desktop, tablet, or mobile."
  },
  {
    q: "Am I locked into a contract?",
    a: "Never. We operate on a strict month-to-month (or annual) basis. You can manage, pause, or cancel your subscription instantly through our secure billing portal (powered by Lemon Squeezy) inside your Account Dashboard."
  }
]

export default function FAQPage() {
  // 🚨 SEO: Dynamic Schema Generation for Google's rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6 selection:bg-blue-500/30 selection:text-white">
      {/* Injecting the Schema directly into the HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
            <HelpCircle className="text-blue-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Questions</span>
          </h1>
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">
            Everything you need to know about the desk.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-black text-white mb-3 leading-tight uppercase tracking-tight">{faq.q}</h3>
              <p className="text-sm font-medium text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-neutral-800 rounded-3xl p-8 sm:p-10 text-center mt-12 shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Still have questions?</h3>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-8">Create a free account to explore the platform risk-free.</p>
          <Link 
            href="/signup" 
            className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] inline-block"
          >
            Access The Terminal
          </Link>
        </div>
      </div>
    </div>
  )
}
