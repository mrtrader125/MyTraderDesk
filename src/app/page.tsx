'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, CheckCircle2, Shield, BarChart3, ArrowRight, XCircle, Activity, Globe2, Target, Scale } from 'lucide-react'
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
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-white font-black uppercase tracking-widest italic text-sm">
              MyTrader<span className="text-blue-500">Desk</span>
            </span>
          </Link>

          {/* Core Navigation - Pushing traffic to our new SEO pages */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/community" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              Live Floor
            </Link>
            <Link href="/playbook" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              Playbook
            </Link>
            <Link href="#pricing" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-6 py-2.5 text-[10px] uppercase tracking-widest font-black bg-white text-black rounded-xl hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              Access Floor
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">For Traders Stuck in Hesitation</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter text-white">
          STOP SECOND GUESSING.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">
            EXECUTE WITH CLARITY.
          </span>
        </h1>

        <p className="mt-8 text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          You already know how to analyze the market. The problem is trusting your decisions. Validate your thinking against professional floor analysis so you can trade without hesitation.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
          <Link href="/signup" className="group flex items-center justify-center px-10 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
            Enter The Desk <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <p className="mt-8 text-sm text-neutral-500 font-bold tracking-widest uppercase">
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

      {/* THE SOLUTION GRID */}
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

      {/* WHAT EXACTLY DO YOU GET? */}
      <section className="relative z-10 max-w-7xl mx-auto py-24 px-6 border-t border-neutral-900">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              What exactly do <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">you get?</span>
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-10">
              You are getting direct access to the analysis of a professional trading floor. Our philosophy is simple: <strong className="text-white">Analyze more. Execute less.</strong> We filter the noise so you only see the data that actually matters.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <Globe2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-white tracking-wide">Complete Market Coverage</h3>
                  <p className="mt-2 text-neutral-400 leading-relaxed">A clear, institutional Point of View (POV) across Forex, Crypto, Commodities, Stocks, and Indices.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-white tracking-wide">High-Probability Setups</h3>
                  <p className="mt-2 text-neutral-400 leading-relaxed">We only post instruments that have clear, highly-actionable setups. No forced trades, just high-quality charting.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <Scale className="w-6 h-6 text-purple-400" />
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-white tracking-wide">Crowdsourced Sentiment</h3>
                  <p className="mt-2 text-neutral-400 leading-relaxed">See what thousands of other intermediate traders are looking at. Validate your bias with community voting.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-12 rounded-[2.5rem] border border-neutral-800 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
            <div className="absolute -left-4 top-10 w-2 h-24 bg-blue-500 rounded-r-full opacity-50"></div>
            
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-8">
              "Amateurs execute constantly and analyze rarely. Professionals analyze deeply and execute selectively."
            </h3>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm flex items-center">
              <span className="w-8 h-[1px] bg-neutral-600 mr-4"></span>
              The Desk Philosophy
            </p>
          </div>
        </div>
      </section>

      {/* LIVE PROOF SECTION */}
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

      {/* PRICING TIERS */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto py-32 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Choose Your Access</h2>
          <p className="text-neutral-500 mt-4 text-xl">Transparent pricing for serious operators. No hidden add-ons.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Free Tier */}
          <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-neutral-800 hover:border-neutral-600 transition-colors text-center">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Free</h3>
            <p className="text-5xl font-black text-white my-6">$0<span className="text-xl text-neutral-600 font-medium">/mo</span></p>
            <p className="text-neutral-500 text-sm mb-10 h-10">Delayed analysis and read-only community access.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-[#111] text-white font-bold rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-[10px]">Create Free Account</Link>
          </div>

          {/* Essential Tier */}
          <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-neutral-800 hover:border-blue-500/50 transition-colors text-center transform md:-translate-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Essential</h3>
            <p className="text-5xl font-black text-white my-6">$4.99<span className="text-xl text-neutral-500 font-medium">/mo</span></p>
            <p className="text-neutral-400 text-sm mb-10 h-10">Real-time Forex analysis + Full community voting rights.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-[#111] text-white font-black rounded-xl border border-neutral-700 hover:border-blue-500 hover:text-blue-400 transition-all uppercase tracking-widest text-[10px]">Select Essential</Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-[#111] to-[#050505] p-10 rounded-3xl border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative text-center">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
              All Access
            </span>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Pro</h3>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 my-6">$9.99<span className="text-xl text-neutral-500 font-medium">/mo</span></p>
            <p className="text-neutral-400 text-sm mb-10 h-10">Unlocks Crypto, Gold, Indices, and premium community badges.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-white text-black font-black rounded-xl hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform uppercase tracking-widest text-[10px]">Get Pro Access</Link>
          </div>

        </div>
      </section>

      {/* SEO FOOTER & TRUST DIRECTORY */}
      <footer className="bg-[#020202] border-t border-neutral-900 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Activity size={24} className="text-blue-500" />
              <span className="text-white font-black uppercase tracking-widest italic text-lg">
                Sentinel<span className="text-blue-500">Vortex</span>
              </span>
            </Link>
            <p className="text-xs font-medium text-neutral-500 leading-relaxed pr-4">
              A dedicated digital trading floor providing intermediate operators with institutional-grade structural analysis and crowdsourced market confluence.
            </p>
          </div>

          {/* Live Markets (SEO Hubs) */}
          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-6">Live Markets</h4>
            <ul className="space-y-4">
              <li><Link href="/analysis/eurusd" className="text-xs font-medium text-neutral-500 hover:text-blue-500 transition-colors">EUR/USD Analysis Today</Link></li>
              <li><Link href="/analysis/xauusd" className="text-xs font-medium text-neutral-500 hover:text-blue-500 transition-colors">Gold (XAUUSD) Setups</Link></li>
              <li><Link href="/analysis/btcusd" className="text-xs font-medium text-neutral-500 hover:text-blue-500 transition-colors">Bitcoin (BTC) Structure</Link></li>
              <li><Link href="/community" className="text-xs font-medium text-neutral-500 hover:text-blue-500 transition-colors">Live Sentiment Floor</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/playbook" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">The Trading Playbook</Link></li>
              <li><Link href="/faq" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/about" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">About Sentinel Vortex</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">Risk Disclaimer</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} MyTraderDesk by Sentinel Vortex. All rights reserved.
          </p>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-4 md:mt-0">
            Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
      
    </div>
  )
}
