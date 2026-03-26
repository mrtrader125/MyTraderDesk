'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Brain, CheckCircle2, Shield, BarChart3, ArrowRight, XCircle, Activity, Globe2, Target, Scale, Zap } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    fetchAnalyses()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* PREMIUM GLASS NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-white font-black uppercase tracking-widest italic text-sm">
              MyTrader<span className="text-blue-500">Desk</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/community" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Live Floor</Link>
            <Link href="/playbook" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Playbook</Link>
            <Link href="#pricing" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Access</Link>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-6 py-2.5 text-[10px] uppercase tracking-widest font-black bg-white text-black rounded-xl hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              Enter The Desk
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - REPOSITIONED FOR TRADERS */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Built for Serious Traders</span>
        </div>

        <h1 className="sr-only">MyTraderDesk by Sentinel Vortex</h1>

        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter text-white">
          MASTER STRUCTURE<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600">
            REMOVE FATIGUE
          </span>
        </h2>

        <p className="mt-8 text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          You don't need another signal group. You need institutional-grade structural analysis to validate your bias and execute without hesitation.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
          <Link href="/signup" className="group flex items-center justify-center px-10 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
            Unlock The Floor <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <p className="mt-8 text-sm text-neutral-500 font-bold tracking-widest uppercase flex items-center justify-center gap-3">
          <Shield size={16} className="text-blue-500"/> No signals • No hype • Pure Context
        </p>
      </section>

      {/* THE PSYCHOLOGICAL PROBLEM */}
      <section className="relative z-10 max-w-5xl mx-auto py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-6 text-white tracking-tight">You’re Not a Beginner Anymore.</h2>
        <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl mx-auto">
          You understand liquidity. You see the structure. <br className="hidden md:block"/> But when it’s time to pull the trigger, the doubt creeps in.
        </p>
        
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-lg font-bold">
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-neutral-800 shadow-2xl flex items-center justify-center gap-4 hover:border-blue-500/30 transition-colors">
            <span className="text-blue-400 font-black tracking-tight text-xl">“Is my directional bias right?”</span>
          </div>
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-neutral-800 shadow-2xl flex items-center justify-center gap-4 hover:border-cyan-500/30 transition-colors">
            <span className="text-cyan-400 font-black tracking-tight text-xl">“Am I missing the higher timeframe?”</span>
          </div>
        </div>

        <p className="mt-12 text-neutral-400 text-lg font-medium">
          That hesitation kills profitability. <span className="text-white">Validation fixes it.</span>
        </p>
      </section>

      {/* THE SOLUTION GRID */}
      <section className="relative z-10 max-w-7xl mx-auto py-24 px-6 border-t border-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">The Professional Edge</h2>
          <p className="text-neutral-500 mt-4 text-xl">Trade with the absolute confidence of a second expert opinion.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
            <Brain className="w-12 h-12 mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Clear Bias</h3>
            <p className="text-neutral-400 leading-relaxed">Understand the institutional POV and target zones before you ever look for an entry.</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
            <CheckCircle2 className="w-12 h-12 mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Setup Validation</h3>
            <p className="text-neutral-400 leading-relaxed">Align your chart ideas with our analysis. Pull the trigger with the confidence of a professional floor.</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-neutral-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full group-hover:bg-cyan-500/10 transition-colors" />
            <Zap className="w-12 h-12 mb-6 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">The Playbook</h3>
            <p className="text-neutral-400 leading-relaxed">Constant education. When you lose a trade, learn exactly why the structure broke in our learning center.</p>
          </div>
        </div>
      </section>

      {/* LIVE PROOF SECTION */}
      <section className="relative z-10 bg-[#0a0a0a]/50 py-32 px-6 border-y border-neutral-900 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Transparent Proof.</h2>
            <p className="text-neutral-400 text-lg">Live feed from our archive (7+ days old). Real structure mapping, not hindsight.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <Activity className="w-10 h-10 animate-pulse mb-4 text-blue-500" />
              <p className="font-bold uppercase tracking-widest text-xs">Decrypting Database...</p>
            </div>
          ) : analyses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {analyses.map((item) => (
                <div key={item.id} className="bg-[#050505] p-6 rounded-3xl border border-neutral-800 shadow-2xl flex flex-col group hover:border-neutral-700 transition-colors">
                  {item.image_url ? (
                    <div className="relative overflow-hidden rounded-2xl mb-6 border border-neutral-800 w-full h-72">
                      <Image 
                        src={item.image_url} 
                        alt={`${item.asset_symbol} Analysis - Sentinel Vortex`} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
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

      {/* THE GATEKEEPER (FILTERING THE AUDIENCE) */}
      <section className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Who Belongs on The Desk?</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-3xl border border-emerald-500/20">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center tracking-tight"><CheckCircle2 className="text-emerald-500 mr-4 w-8 h-8" /> This is for you if:</h3>
            <ul className="space-y-6 text-neutral-300 font-medium">
              <li className="flex items-start"><span className="text-emerald-500 mr-4 font-bold">✓</span> You treat trading as a business, not a casino.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-4 font-bold">✓</span> You know basic mechanics but need structural clarity.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-4 font-bold">✓</span> You want to crowdsource sentiment with other serious traders.</li>
            </ul>
          </div>
          <div className="bg-[#050505] p-10 rounded-3xl border border-red-500/10">
            <h3 className="text-2xl font-black text-neutral-300 mb-8 flex items-center tracking-tight"><XCircle className="text-red-500/50 mr-4 w-8 h-8" /> This is NOT for:</h3>
            <ul className="space-y-6 text-neutral-500 font-medium">
              <li className="flex items-start"><span className="text-red-500/50 mr-4 font-bold">✕</span> People looking for blind "Buy/Sell" signals.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-4 font-bold">✕</span> Gamblers trying to pass a prop firm in one day.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-4 font-bold">✕</span> Absolute beginners who refuse to study The Playbook.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING TIERS - WITH CHURN-KILLING ANNUAL TOGGLE */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto py-32 px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Institutional Access</h2>
          <p className="text-neutral-500 mt-4 text-xl">A fraction of the cost of losing a bad trade.</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-[#111] p-1.5 rounded-2xl border border-neutral-800 inline-flex items-center">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-[#222] text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-neutral-500 hover:text-white'}`}
            >
              Annually <span className="bg-white text-blue-600 px-2 py-0.5 rounded text-[10px] font-black">SAVE 20%</span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Free Tier */}
          <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-neutral-800 hover:border-neutral-600 transition-colors text-center">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">The Lobby</h3>
            <p className="text-5xl font-black text-white my-6">$0</p>
            <p className="text-neutral-500 text-sm mb-10 h-10">Delayed analysis and read-only community floor access.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-[#111] text-white font-bold rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-[10px]">Create Free Account</Link>
          </div>

          {/* Essential Tier */}
          <div className="bg-[#0a0a0a] p-10 rounded-3xl border border-neutral-800 hover:border-blue-500/50 transition-colors text-center transform md:-translate-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Essential</h3>
            <p className="text-5xl font-black text-white my-6">
              ${billingCycle === 'monthly' ? '4.99' : '49'}
              <span className="text-xl text-neutral-500 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <p className="text-neutral-400 text-sm mb-10 h-10">Real-time Forex analysis + Full community voting rights.</p>
            <Link href="/signup" className="block w-full py-4 px-6 bg-[#111] text-white font-black rounded-xl border border-neutral-700 hover:border-blue-500 hover:text-blue-400 transition-all uppercase tracking-widest text-[10px]">Select Essential</Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-[#111] to-[#050505] p-10 rounded-3xl border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative text-center">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
              All Access
            </span>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Pro</h3>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 my-6">
              ${billingCycle === 'monthly' ? '9.99' : '99'}
              <span className="text-xl text-neutral-500 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
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
              A dedicated digital trading floor providing intermediate traders with institutional-grade structural analysis and crowdsourced market confluence.
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
