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
        .limit(2)

      if (error) throw error

      setAnalyses(data || [])
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#050505] text-neutral-200 min-h-screen font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-white">

      {/* AMBIENT CINEMATIC BLOOMS */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* PREMIUM GLASS NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black tracking-tight text-xl uppercase flex items-center whitespace-nowrap text-white cursor-pointer group">
            <span className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-500">MY</span>
            <span className="ml-1.5">TRADER DESK</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              Access Floor
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">For Traders Stuck in Hesitation</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          STOP SECOND GUESSING.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">
            EXECUTE WITH CLARITY.
          </span>
        </h1>

        <p className="mt-8 text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          You already know how to analyze the market. The problem is trusting your decisions. Validate your thinking against professional floor analysis so you can trade without hesitation.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Link href="/signup" className="group flex items-center justify-center px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
            Enter The Desk <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <p className="mt-8 text-sm text-neutral-500 font-bold tracking-widest uppercase animate-in fade-in duration-1000 delay-700">
          No signals • No hype • Pure Structured Analysis
        </p>
      </section>

      {/* THE PSYCHOLOGICAL PROBLEM */}
      <section className="relative z-10 max-w-5xl mx-auto py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-6 text-white tracking-tight">You’re Not a Beginner Anymore.</h2>
        <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl mx-auto">
          You know entries. You know structure. You know risk. <br className="hidden md:block"/> But when it’s time to click buy or sell...
        </p>
        
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-lg font-bold">
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-neutral-800 shadow-2xl flex items-center justify-center gap-4 hover:border-blue-500/30 transition-colors">
            <span className="text-blue-400 font-black tracking-tight text-xl">“Is this setup actually right?”</span>
          </div>
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-neutral-800 shadow-2xl flex items-center justify-center gap-4 hover:border-purple-500/30 transition-colors">
            <span className="text-purple-400 font-black tracking-tight text-xl">“What if I’m missing something?”</span>
          </div>
        </div>

        <p className="mt-12 text-neutral-400 text-lg font-medium">
          That hesitation is what keeps you stuck — <span className="text-white">not your strategy.</span>
        </p>
      </section>

      {/* THE SOLUTION GRID (Dark Glassmorphism) */}
      <section className="relative z-10 max-w-7xl mx-auto py-24 px-6 border-t border-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">A Structured Way To Validate</h2>
          <p className="text-neutral-500 mt-4 text-xl">Trade with the absolute confidence of a second expert opinion.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
            <Brain className="w-12 h-12 mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Clear Perspective</h3>
            <p className="text-neutral-400 leading-relaxed">Understand the institutional market bias and liquidity targets before you ever enter a position.</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
            <CheckCircle2 className="w-12 h-12 mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Trade Validation</h3>
            <p className="text-neutral-400 leading-relaxed">Align your own chart ideas with our structured analysis. Execute with the confidence of a professional floor.</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-colors" />
            <Shield className="w-12 h-12 mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Controlled Risk</h3>
            <p className="text-neutral-400 leading-relaxed">Reduce risk when setups don’t align. Every analysis includes precise invalidation levels to protect capital.</p>
          </div>
        </div>
      </section>

      {/* LIVE PROOF SECTION (Supabase Integration) */}
      <section className="relative z-10 bg-[#0a0a0a]/50 py-32 px-6 border-y border-neutral-900 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Transparent Proof.</h2>
            <p className="text-neutral-400 text-lg">Showing past analysis (7+ days old) direct from our database. Real thinking, not hindsight signals.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <Activity className="w-10 h-10 animate-pulse mb-4 text-blue-500" />
              <p className="font-bold uppercase tracking-widest text-xs">Decrypting Archive...</p>
            </div>
          ) : analyses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {analyses.map((item) => (
                <div key={item.id} className="bg-[#050505] p-6 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col group hover:border-neutral-700 transition-colors">
                  {item.image_url ? (
                    <div className="relative overflow-hidden rounded-2xl mb-6 border border-neutral-800">
                      <img src={item.image_url} alt="chart" className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60"></div>
                    </div>
                  ) : (
                    <div className="rounded-2xl mb-6 w-full h-72 bg-[#111] border border-neutral-800 flex items-center justify-center">
                      <BarChart3 className="text-neutral-700 w-16 h-16" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full border border-blue-500/20">{item.bias || 'Analysis'}</span>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-sm flex-1">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-[#111] p-16 rounded-3xl border border-neutral-800 text-center max-w-2xl mx-auto">
               <BarChart3 className="w-16 h-16 mx-auto text-neutral-700 mb-6" />
               <p className="text-neutral-400 font-bold tracking-wide">Archive is populating. Check back soon for historical analysis.</p>
             </div>
          )}
        </div>
      </section>

      {/* FILTERING THE AUDIENCE */}
      <section className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center tracking-tight"><CheckCircle2 className="text-emerald-500 mr-4 w-8 h-8" /> This is for you if:</h3>
            <ul className="space-y-6 text-neutral-400 font-medium">
              <li className="flex items-start"><span className="text-emerald-500 mr-4 font-bold">✓</span> You know basic market structure and price action.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-4 font-bold">✓</span> You hesitate and overthink before entering trades.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-4 font-bold">✓</span> You want institutional confluence to validate your ideas.</li>
            </ul>
          </div>
          <div className="bg-[#050505] p-10 rounded-3xl border border-neutral-900">
            <h3 className="text-2xl font-black text-neutral-300 mb-8 flex items-center tracking-tight"><XCircle className="text-red-500/50 mr-4 w-8 h-8" /> This is NOT for:</h3>
            <ul className="space-y-6 text-neutral-600 font-medium">
              <li className="flex items-start"><span className="text-red-500/50 mr-4 font-bold">✕</span> Traders looking for "Buy now, Sell now" signal groups.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-4 font-bold">✕</span> People with a "Get rich quick" gambling mindset.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-4 font-bold">✕</span> Beginners who don't know what a candlestick is.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING TIERS (Dark High-End Cards) */}
      <section className="relative z-10 max-w-6xl mx-auto py-32 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Choose Your Access</h2>
          <p className="text-neutral-500 mt-4 text-xl">Transparent pricing for serious operators.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Starter */}
          <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-neutral-800 hover:border-neutral-600 transition-colors text-center">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Starter</h3>
            <p className="text-5xl font-black text-white my-6">$5<span className="text-xl text-neutral-600 font-medium">/mo</span></p>
            <p className="text-neutral-500 text-sm mb-10 h-10">Basic structured analysis to gauge market direction.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-[#111] text-white font-bold rounded-full border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-sm">Select Starter</Link>
          </div>

          {/* Pro (Highlighted Electric Card) */}
          <div className="bg-gradient-to-b from-[#111] to-[#050505] p-10 rounded-3xl border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative text-center transform md:-translate-y-4">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
              Most Popular
            </span>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Pro</h3>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 my-6">$10<span className="text-xl text-neutral-500 font-medium">/mo</span></p>
            <p className="text-neutral-400 text-sm mb-10 h-10">Full access + daily trade scenarios + priority updates.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-white text-black font-black rounded-full hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform uppercase tracking-widest text-sm">Get Pro Access</Link>
          </div>

          {/* Elite */}
          <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-neutral-800 hover:border-neutral-600 transition-colors text-center">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Elite</h3>
            <p className="text-5xl font-black text-white my-6">$100<span className="text-xl text-neutral-600 font-medium">/yr</span></p>
            <p className="text-neutral-500 text-sm mb-10 h-10">Save 15% annually. All features + deepest insights.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-[#111] text-white font-bold rounded-full border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-sm">Select Elite</Link>
          </div>
        </div>
      </section>

      {/* MASSIVE GROUNDING FOOTER */}
      <section className="relative z-10 bg-[#000] border-t border-neutral-900 overflow-hidden text-center pt-40 pb-16 px-6">
        <div className="absolute inset-0 bg-blue-600/5 blur-[150px] z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
            TRADE WITH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600">CONFIDENCE.</span>
          </h2>
          <p className="text-neutral-500 text-xl mb-12 max-w-2xl mx-auto">Start executing with structure, clarity, and institutional confluence today.</p>
          <Link href="/signup" className="inline-flex items-center justify-center px-12 py-6 bg-white text-black rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-transform">
            Join the Desk
          </Link>
          <p className="mt-12 text-xs text-neutral-600 font-bold uppercase tracking-widest">Trading involves risk. Not financial advice.</p>
        </div>
        
        <div className="mt-32 pt-8 text-neutral-700 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 MyTraderDesk. A Sentinel Vortex Product.</p>
        </div>
      </section>
      
    </div>
  )
}
