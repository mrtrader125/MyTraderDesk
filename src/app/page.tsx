'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Is this a signal group?",
      a: "No. If you're looking for signals, this isn't for you. This platform forces you to think and execute your own edge."
    },
    {
      q: "Do I need a new strategy?",
      a: "No. Your strategy is not the problem. Your execution is."
    },
    {
      q: "Is this for beginners?",
      a: "No. This is built for traders who already know how to trade but lack consistency."
    },
    {
      q: "What happens if I don’t follow the system?",
      a: "Nothing changes. That’s exactly the point."
    }
  ]

  return (
    <div className="bg-[#050505] text-white min-h-screen">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/90 backdrop-blur border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-black tracking-widest text-sm">MYTRADERDESK</span>
          <Link href="/signup" className="bg-white text-black px-5 py-2 text-xs font-black uppercase tracking-widest">
            Enter Operator Terminal
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          You’re Not Losing Because of Strategy.
          <br />
          <span className="text-blue-500">You’re Losing Because You Can’t Execute.</span>
        </h1>

        <p className="text-neutral-400 mb-8">
          This terminal forces discipline. Track every trade, expose every mistake,
          and finally understand what’s actually costing you money.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="bg-blue-600 px-6 py-3 text-xs font-black uppercase">
            Start Free
          </Link>
          <Link href="#features" className="border border-neutral-700 px-6 py-3 text-xs font-black uppercase">
            See How It Works
          </Link>
        </div>

        <p className="text-xs text-neutral-600 mt-6">
          For intermediate traders only. Not for beginners.
        </p>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-16 border-t border-neutral-900 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-xl font-black mb-6">
          Your Strategy Isn’t Broken.
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-400">
          <div>❌ Overtrading</div>
          <div>❌ Emotional entries</div>
          <div>❌ No execution consistency</div>
        </div>

        <p className="mt-8 text-neutral-500">
          You don’t need a better strategy. You need a system that forces discipline.
        </p>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 border-t border-neutral-900 max-w-5xl mx-auto px-6">
        <h2 className="text-center text-xl font-black mb-10">
          What This Platform Actually Does
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-[#080808] p-6 border border-neutral-800">
            <h3 className="font-bold mb-2">Every Trade — Exposed</h3>
            <p className="text-sm text-neutral-400">
              Sync your MT5 data and match it to your planned setups.
            </p>
          </div>

          <div className="bg-[#080808] p-6 border border-neutral-800">
            <h3 className="font-bold mb-2">Your Mistakes Cost You (On Paper)</h3>
            <p className="text-sm text-neutral-400">
              Track emotional errors and assign real dollar impact.
            </p>
          </div>

          <div className="bg-[#080808] p-6 border border-neutral-800">
            <h3 className="font-bold mb-2">Stop Trading Alone</h3>
            <p className="text-sm text-neutral-400">
              Validate your bias with structured community analysis.
            </p>
          </div>

        </div>
      </section>

      {/* PROOF */}
      <section className="py-16 border-t border-neutral-900 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-xl font-black mb-6">
          What Traders Realize After Using This
        </h2>

        <div className="space-y-6 text-sm text-neutral-300">

          <p>“68% of my losses came from breaking my own rules.”</p>
          <p>“I thought I needed a better strategy. I needed discipline.”</p>
          <p>“Tracking mistakes changed everything.”</p>

        </div>
      </section>

      {/* FILTER */}
      <section className="py-16 border-t border-neutral-900 max-w-4xl mx-auto px-6">
        <h2 className="text-center text-xl font-black mb-10">
          This Is NOT For Everyone
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-sm">

          <div className="bg-[#080808] p-6 border border-green-500/20">
            <h3 className="font-bold text-green-400 mb-4">✔ This is for you if:</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>You treat trading seriously</li>
              <li>You want accountability</li>
              <li>You want consistency</li>
            </ul>
          </div>

          <div className="bg-[#080808] p-6 border border-red-500/20">
            <h3 className="font-bold text-red-400 mb-4">✕ Not for you if:</h3>
            <ul className="space-y-2 text-neutral-500">
              <li>You want signals</li>
              <li>You avoid responsibility</li>
              <li>You look for shortcuts</li>
            </ul>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 border-t border-neutral-900 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-xl font-black mb-6">
          Every Month Without a System = Repeated Mistakes
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-[#080808] p-6 border border-neutral-800">
            <h3 className="text-sm font-bold">Free</h3>
            <p className="text-2xl font-black my-4">$0</p>
            <p className="text-neutral-400 text-sm mb-4">
              Basic tracking only
            </p>
            <Link href="/signup" className="border border-neutral-700 px-4 py-2 text-xs">
              Start Free
            </Link>
          </div>

          <div className="bg-[#0a0a0a] p-6 border border-blue-500">
            <h3 className="text-sm font-bold text-blue-400">Pro</h3>
            <p className="text-2xl font-black my-4">$29/mo</p>
            <p className="text-neutral-400 text-sm mb-4">
              Full discipline system + MT5 sync
            </p>
            <Link href="/signup" className="bg-blue-600 px-4 py-2 text-xs">
              Go Pro
            </Link>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-neutral-900 max-w-2xl mx-auto px-6">
        <h2 className="text-center text-xl font-black mb-6">FAQ</h2>

        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-neutral-800">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left py-4 flex justify-between"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`transition ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <p className="pb-4 text-sm text-neutral-400">{faq.a}</p>
            )}
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-xs text-neutral-600 border-t border-neutral-900">
        You don’t need another strategy. You need control.
      </footer>

    </div>
  )
}
