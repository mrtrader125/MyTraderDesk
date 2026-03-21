'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, CheckCircle2, Shield, BarChart3, ArrowRight, XCircle, Activity } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Supabase client setup for the Live Proof section
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Handle Scroll & Fetch Supabase Data
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    fetchAnalyses()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch delayed charts (7 days old) for the "Proof" section
  const fetchAnalyses = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .lte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(2) // Kept to 2 so the layout stays clean

      if (error) throw error

      setAnalyses(data || [])
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden">

      {/* AMBIENT BLOOMS */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black tracking-tight text-xl uppercase flex items-center whitespace-nowrap text-slate-900 cursor-pointer">
            <span className="bg-gradient-to-br from-blue-700 to-indigo-700 bg-clip-text text-transparent">MY</span>
            <span className="ml-1.5">TRADER DESK</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-blue-700 transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all">
              Get Instant Access
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
        <p className="text-sm uppercase tracking-widest text-blue-600 font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          For traders stuck in hesitation
        </p>

        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          Stop Second Guessing.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Execute With Clarity.
          </span>
        </h1>

        <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          You already know how to analyze the market. The problem is trusting your decisions. MyTraderDesk helps you validate your thinking so you can trade without hesitation.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center">
            Start Trading With Clarity <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-400 font-medium tracking-wide animate-in fade-in duration-1000 delay-700">
          No signals • No hype • Just structured analysis
        </p>
      </section>

      {/* THE PSYCHOLOGICAL PROBLEM */}
      <section className="relative z-10 max-w-4xl mx-auto py-24 px-6 text-center border-t border-slate-200/50">
        <h2 className="text-4xl font-black mb-6 text-slate-900">You’re Not a Beginner Anymore.</h2>
        <p className="text-slate-600 text-xl leading-relaxed">
          You know entries. You know structure. You know risk. <br className="hidden md:block"/> But when it’s time to click buy or sell...
        </p>
        
        <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-lg font-bold text-slate-700">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-3">
            <span className="text-blue-500">“Is this setup actually right?”</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-3">
            <span className="text-indigo-500">“What if I’m missing something?”</span>
          </div>
        </div>

        <p className="mt-10 text-slate-600 font-medium">
          That hesitation is what keeps you stuck — not your strategy.
        </p>
      </section>

      {/* THE SOLUTION GRID */}
      <section className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-16">A Structured Way To Validate Your Trades</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <Brain className="w-12 h-12 mb-6 text-blue-600" />
            <h3 className="text-xl font-black mb-3 text-slate-900">Clear Perspective</h3>
            <p className="text-slate-600">Understand the institutional market bias and liquidity targets before you ever enter a position.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
            <CheckCircle2 className="w-12 h-12 mb-6 text-emerald-600" />
            <h3 className="text-xl font-black mb-3 text-slate-900">Trade Validation</h3>
            <p className="text-slate-600">Align your own chart ideas with our structured analysis. Execute with the confidence of a second opinion.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300">
            <Shield className="w-12 h-12 mb-6 text-indigo-600" />
            <h3 className="text-xl font-black mb-3 text-slate-900">Controlled Risk</h3>
            <p className="text-slate-600">Reduce risk when setups don’t align. Every analysis includes precise invalidation levels to protect capital.</p>
          </div>
        </div>
      </section>

      {/* LIVE PROOF SECTION (Supabase Integration) */}
      <section className="relative z-10 bg-slate-100/50 py-32 px-6 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Real Analysis. Transparent Proof.</h2>
            <p className="text-slate-600 text-lg">Showing past analysis (7+ days old) directly from our database. Real thinking, not hindsight signals.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Activity className="w-8 h-8 animate-pulse mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">Fetching Archive...</p>
            </div>
          ) : analyses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {analyses.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  {item.image_url ? (
                    <img src={item.image_url} alt="chart" className="rounded-2xl mb-6 w-full h-64 object-cover border border-slate-100" />
                  ) : (
                    <div className="rounded-2xl mb-6 w-full h-64 bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <BarChart3 className="text-slate-300 w-12 h-12" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">{item.bias || 'Analysis'}</span>
                    <span className="text-xs text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm flex-1">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-2xl mx-auto">
               <BarChart3 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
               <p className="text-slate-500 font-medium">Archive is populating. Check back soon for historical analysis.</p>
             </div>
          )}
        </div>
      </section>

      {/* FILTERING THE AUDIENCE */}
      <section className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center"><CheckCircle2 className="text-emerald-500 mr-3" /> This is for you if:</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> You know basic market structure and price action.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> You hesitate and overthink before entering trades.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> You want institutional confluence to validate your ideas.</li>
            </ul>
          </div>
          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center"><XCircle className="text-red-500 mr-3" /> This is NOT for:</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex items-start"><span className="text-red-400 mr-2">✕</span> Traders looking for "Buy now, Sell now" signal groups.</li>
              <li className="flex items-start"><span className="text-red-400 mr-2">✕</span> People with a "Get rich quick" mindset.</li>
              <li className="flex items-start"><span className="text-red-400 mr-2">✕</span> Beginners who don't know what a candlestick is.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900">Choose Your Access Level</h2>
          <p className="text-slate-600 mt-4 text-lg">Transparent pricing for serious traders.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Starter */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-md transition-all text-center">
            <h3 className="text-xl font-bold text-slate-900">Starter</h3>
            <p className="text-4xl font-black text-slate-900 my-6">$5<span className="text-lg text-slate-400 font-medium">/mo</span></p>
            <p className="text-slate-500 text-sm mb-8">Basic structured analysis to gauge market direction.</p>
            <Link href="/signup" className="block w-full py-3 px-6 bg-slate-100 text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors">Select Starter</Link>
          </div>

          {/* Pro (Highlighted) */}
          <div className="bg-white p-10 rounded-3xl border-2 border-blue-600 shadow-xl relative text-center transform md:-translate-y-4">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
              Most Popular
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Pro</h3>
            <p className="text-5xl font-black text-blue-600 my-6">$10<span className="text-lg text-slate-400 font-medium">/mo</span></p>
            <p className="text-slate-600 text-sm mb-8">Full access + daily trade scenarios + priority updates.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Get Pro Access</Link>
          </div>

          {/* Elite */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-md transition-all text-center">
            <h3 className="text-xl font-bold text-slate-900">Elite</h3>
            <p className="text-4xl font-black text-slate-900 my-6">$100<span className="text-lg text-slate-400 font-medium">/yr</span></p>
            <p className="text-slate-500 text-sm mb-8">Save 15% annually. All features + deepest insights.</p>
            <Link href="/signup" className="block w-full py-3 px-6 bg-slate-100 text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors">Select Elite</Link>
          </div>
        </div>
      </section>

      {/* MASSIVE GROUNDING FOOTER */}
      <section className="relative z-10 bg-slate-900 overflow-hidden text-center pt-32 pb-16 px-6">
        <div className="absolute inset-0 bg-blue-600/10 blur-[150px] z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
            TRADE WITH CONFIDENCE.
          </h2>
          <p className="text-slate-400 text-xl mb-12">Start executing with structure, clarity, and institutional confluence today.</p>
          <Link href="/signup" className="inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white rounded-full font-black text-lg uppercase tracking-widest hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/20">
            Join the Desk
          </Link>
          <p className="mt-8 text-xs text-slate-500 font-medium uppercase tracking-widest">Trading involves risk. Not financial advice.</p>
        </div>
        
        <div className="mt-32 border-t border-slate-800 pt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 MyTraderDesk. A Sentinel Vortex Product.</p>
        </div>
      </section>
      
    </div>
  )
}
