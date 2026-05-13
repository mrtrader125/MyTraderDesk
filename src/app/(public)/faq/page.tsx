import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

// SEO: Metadata and OpenGraph tags
export const metadata: Metadata = {
  title: 'FAQ | MyTraderDesk',
  description: 'Everything you need to know about our trading philosophy and how our terminal enforces discipline.',
}

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
    a: "Never. We operate on a strict month-to-month (or annual) basis. You can manage, pause, or cancel your subscription instantly through our secure billing portal inside your Account Dashboard."
  }
]

export default function FAQPage() {
  // SEO: Dynamic Schema Generation for Google's rich snippets
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
    <div className="min-h-screen bg-[#050505] text-neutral-400 font-sans selection:bg-white selection:text-black">
      {/* Injecting the Schema directly into the HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto pt-24 pb-32 px-6 lg:px-8">
        
        {/* Clean Header */}
        <div className="mb-16 border-b border-neutral-800/60 pb-12">
          <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Common Inquiries
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl">
            Everything you need to know about the operational mechanics of the MyTraderDesk terminal.
          </p>
        </div>

        {/* FAQ Grid/List */}
        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="bg-[#0A0A0A] border border-neutral-800/60 hover:border-neutral-700 transition-colors rounded-2xl p-8"
            >
              <h3 className="text-lg font-medium text-white mb-3 tracking-tight">
                {faq.q}
              </h3>
              <p className="text-[15px] font-normal text-neutral-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Professional CTA Block */}
        <div className="mt-20 p-8 md:p-10 bg-[#0A0A0A] border border-neutral-800/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
           <div>
             <h3 className="text-xl font-medium text-white mb-2 tracking-tight">
               Ready to execute systematically?
             </h3>
             <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
               Stop relying on discretion. Lock in your daily edges and execute flawlessly within a structured environment.
             </p>
           </div>
           
           <Link 
             href="/signup" 
             className="shrink-0 px-6 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors text-center w-full md:w-auto flex items-center justify-center gap-2"
           >
             Access The Floor <ArrowUpRight size={16} />
           </Link>
        </div>

      </div>
    </div>
  )
}
