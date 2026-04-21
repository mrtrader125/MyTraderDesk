'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, Map, ShieldCheck, Filter, ArrowRight, Activity, 
  ChevronLeft, ChevronRight, Lock, ChevronDown, Globe2, BarChart3, Database,
  TerminalSquare, BookOpen, Workflow
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const HoverRevealSlider = ({ before, after }: { before: string, after: string }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] group cursor-pointer shadow-inner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={after} 
        alt="Result" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[800ms]" 
      />
      <div className={`absolute bottom-3 right-3 bg-[#050505]/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold text-emerald-400 uppercase tracking-widest transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0 ring-1 ring-white/[0.05] ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        Result
      </div>
      <div 
        className="absolute inset-0 z-10 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ clipPath: isHovered ? 'polygon(0 0, 0 0, 0 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      >
        <img 
          src={before} 
          alt="Setup" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className={`absolute bottom-3 left-3 bg-[#050505]/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold text-neutral-300 uppercase tracking-widest transition-all duration-500 ring-1 ring-white/[0.05] ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          Initial Setup
        </div>
      </div>
      <div 
        className="absolute top-0 bottom-0 w-px bg-blue-400/80 z-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_2px_rgba(59,130,246,0.8)] opacity-0 group-hover:opacity-100"
        style={{ left: isHovered ? '0%' : '100%' }}
      ></div>
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeFeaturedSlide, setActiveFeaturedSlide] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const terminalSlides = [
    { id: 'mtd1', title: 'Dashboard', desc: 'Your central hub for daily market structure and active setups.' },
    { id: 'mtd2', title: 'Markets', desc: 'Multi-timeframe analysis across Forex, Crypto, Indices, and Commodities.' },
    { id: 'mtd3', title: 'The Vault', desc: 'Your personal archive. Bookmark and save setups from the Live Floor.' },
    { id: 'mtd4', title: 'Live Floor', desc: 'Real-time structural analysis and community bias voting.' },
    { id: 'mtd5', title: 'Account', desc: 'Manage your terminal preferences and subscription access.' }
  ]

  const faqs = [
    { q: "Do you support burner or sandbox accounts?", a: "No. The system requires discipline. By removing burner accounts, we remove the temptation for impulsive trading. All MT5 executions are synced and logged permanently." },
    { q: "Is this a signal group?", a: "No. Signal groups create dependency. We provide institutional-grade structural analysis so you can validate your own bias and execute with confluence." },
    { q: "What timeframes do you analyze?", a: "We take a top-down approach. Our daily analysis establishes the Weekly/Daily macro bias, identifies the 4H/1H structural framework, and pinpoints 15m execution zones." },
    { q: "Do I need a new strategy to use this?", a: "No. You bring your strategy. Our platform provides the routine and tools to help you execute it without emotional interference." },
    { q: "Is this for beginners?", a: "No. This is built for intermediate traders—those who have survived a few years in the market, know how to trade, but want stricter systemic control." },
    { q: "Am I locked into a contract?", a: "Never. We operate on a month-to-month (or annual) basis. You can cancel your subscription instantly with two clicks." }
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    fetchAnalyses()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(5) 
      if (error) throw error
      setAnalyses(data || [])
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % terminalSlides.length)
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + terminalSlides.length) % terminalSlides.length)
  const nextFeatured = () => setActiveFeaturedSlide((prev) => (prev + 1) % analyses.length)
  const prevFeatured = () => setActiveFeaturedSlide((prev) => (prev - 1 + analyses.length) % analyses.length)

  return (
    <div className="bg-[#050505] text-neutral-200 min-h-screen font-sans selection:bg-blue-500/30 selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-blue-600/5 blur-[150px]"></div>
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/95 border-b border-neutral-900 py-3 backdrop-blur-md' : 'bg-transparent py-4 md:py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 group relative w-24 md:w-32 h-8">
            <Image 
              src="/logo.png" 
              alt="MyTraderDesk" 
              fill
              className="object-contain object-left transition-opacity hover:opacity-80" 
              sizes="(max-width: 768px) 96px, 128px"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center space-x-8 shrink-0">
            <Link href="#features" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Features</Link>
            <Link href="#blueprint" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Blueprint</Link>
            <Link href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex gap-4 items-center shrink-0">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-5 py-2 md:px-6 md:py-2.5 text-[9px] uppercase tracking-widest font-black bg-white text-black rounded-sm hover:bg-neutral-200 transition-colors">
              Access Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* PLAIN ENGLISH HERO */}
      <section className="relative z-10 pt-32 md:pt-48 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white mb-6">
          Systematic Trading Terminal & <span className="text-blue-500">Performance Journal.</span>
        </h1>
        <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
          A closed-loop platform that forces discipline. Draft your setups, sync your real MT5 executions, and explicitly track the emotional errors costing you money.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href="/signup" className="px-8 py-3.5 bg-blue-600 text-white rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-colors w-full sm:w-auto">
            Create Free Account
          </Link>
          <Link href="#features" className="px-8 py-3.5 bg-[#111] text-white border border-neutral-800 rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition-colors w-full sm:w-auto">
            See How It Works
          </Link>
        </div>
      </section>

      {/* NEW: WHAT THE PLATFORM ACTUALLY DOES (Plain Explanation) */}
      <section id="features" className="relative z-10 py-16 md:py-24 px-6 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">What The Platform Does</h2>
            <p className="text-neutral-500 text-sm mt-2 font-medium">The core tools built into the terminal.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#080808] border border-neutral-800 rounded-xl p-8">
              <Workflow className="w-8 h-8 text-blue-500 mb-6" />
              <h3 className="text-lg font-bold text-white mb-3">MT5 Data Sync</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Connect your broker data via CSV or HTML parsing. The platform matches your live executions to your drafted setups, creating a permanent, frictionless record of your performance.
              </p>
            </div>
            <div className="bg-[#080808] border border-neutral-800 rounded-xl p-8">
              <BookOpen className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-lg font-bold text-white mb-3">Behavioral Journaling</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Go beyond PnL. Our journal tracks your "Discipline Index." Categorize trades as Perfect or Imperfect, and assign an exact dollar cost to your emotional mistakes (like FOMO or overtrading).
              </p>
            </div>
            <div className="bg-[#080808] border border-neutral-800 rounded-xl p-8">
              <TerminalSquare className="w-8 h-8 text-purple-500 mb-6" />
              <h3 className="text-lg font-bold text-white mb-3">The Live Floor</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                A real-time squawk box for Pro members. Access institutional-grade structural analysis, validate your own bias, and interact with the community voting engine before you take a trade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RESTORED: THE OPERATOR'S BLUEPRINT */}
      <section id="blueprint" className="relative z-10 w-full py-16 md:py-24 px-6 overflow-hidden bg-[#020202] border-t border-neutral-900">
        <div className="text-center mb-16 relative z-20">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">The Operator's Blueprint</h2>
          <p className="text-neutral-500 text-xs mt-2 font-medium tracking-wide">Explore the mechanics of consistency. Follow the logic flow.</p>
        </div>

        <div className="relative max-w-4xl mx-auto px-2 sm:px-0">
          <div className="absolute top-4 bottom-4 left-[27px] md:left-1/2 w-px bg-neutral-800 md:-translate-x-[0.5px] z-0"></div>

          <div className="space-y-10 md:space-y-16 relative z-10">
            {/* Node 1 */}
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#050505] -translate-x-1.5 z-10 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 relative">
                <div className="hidden md:block absolute right-0 top-1/2 w-12 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/identity" className="block bg-[#080808] p-6 sm:p-8 rounded-sm border border-neutral-900 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
                  <User className="w-6 h-6 mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-black mb-2 text-white uppercase tracking-widest">1. The Identity</h3>
                  <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">From Learner to Executor. Discover why intermediate traders stay unprofitable and the mindset shift required for consistency.</p>
                  <div className="mt-4 flex items-center text-[9px] font-bold text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Read Protocol <ArrowRight className="ml-1 w-3 h-3" /></div>
                </Link>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            {/* Node 2 */}
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[#050505] -translate-x-1.5 z-10 shadow-[0_0_15px_rgba(6,182,212,0.6)]"></div>
              <div className="hidden md:block w-1/2"></div>
              <div className="w-full md:w-1/2 pl-14 md:pl-12 relative">
                <div className="hidden md:block absolute left-0 top-1/2 w-12 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/strategy" className="block bg-[#080808] p-6 sm:p-8 rounded-sm border border-neutral-900 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group">
                  <Map className="w-6 h-6 mb-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-black mb-2 text-white uppercase tracking-widest">2. The Strategy</h3>
                  <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">Market Demystified. Strategy isn't magic; it's simply finding your place in the market's endless journey.</p>
                  <div className="mt-4 flex items-center text-[9px] font-bold text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Read Protocol <ArrowRight className="ml-1 w-3 h-3" /></div>
                </Link>
              </div>
            </div>

            {/* Node 3 */}
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#050505] -translate-x-1.5 z-10 shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 relative">
                <div className="hidden md:block absolute right-0 top-1/2 w-12 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/system" className="block bg-[#080808] p-6 sm:p-8 rounded-sm border border-neutral-900 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
                  <ShieldCheck className="w-6 h-6 mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-black mb-2 text-white uppercase tracking-widest">3. The System</h3>
                  <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">Rules of Engagement. Bridging the gap between theory and execution to build an edge you can actually follow.</p>
                  <div className="mt-4 flex items-center text-[9px] font-bold text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Read Protocol <ArrowRight className="ml-1 w-3 h-3" /></div>
                </Link>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            {/* Node 4 */}
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-3 h-3 rounded-full bg-purple-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-[#050505] -translate-x-1.5 z-10 shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
              <div className="hidden md:block w-1/2"></div>
              <div className="w-full md:w-1/2 pl-14 md:pl-12 relative">
                <div className="hidden md:block absolute left-0 top-1/2 w-12 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/routine" className="block bg-[#080808] p-6 sm:p-8 rounded-sm border border-neutral-900 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
                  <Filter className="w-6 h-6 mb-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-black mb-2 text-white uppercase tracking-widest">4. The Routine</h3>
                  <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">The 3-Level Filtration process. Narrow the market down to high-probability executions without the emotional noise.</p>
                  <div className="mt-4 flex items-center text-[9px] font-bold text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Read Protocol <ArrowRight className="ml-1 w-3 h-3" /></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TERMINAL UI CAROUSEL */}
      <section className="relative z-10 w-full overflow-hidden py-16 md:py-24 px-6 border-y border-neutral-900">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Inside The Terminal</h2>
        </div>
        <div className="relative w-full h-[220px] sm:h-[350px] md:h-[450px] flex items-center justify-center max-w-6xl mx-auto">
          {terminalSlides.map((slide, index) => {
            const len = terminalSlides.length;
            let offset = (index - activeSlide) % len;
            if (offset > Math.floor(len / 2)) offset -= len;
            if (offset < -Math.floor(len / 2)) offset += len;

            let styleClass = "";
            if (offset === 0) {
              styleClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-[0_0_40px_rgba(0,0,0,0.6)] border-neutral-700";
            } else if (offset === 1 || offset === -1) { 
              const direction = offset === 1 ? "" : "-";
              styleClass = `${direction}translate-x-[30%] sm:${direction}translate-x-[40%] md:${direction}translate-x-[45%] scale-[0.85] opacity-30 z-20 cursor-pointer hover:opacity-50 border-neutral-900`;
            } else { 
              styleClass = offset > 0 ? "translate-x-[60%] scale-[0.70] opacity-0 z-10" : "-translate-x-[60%] scale-[0.70] opacity-0 z-10";
            }

            return (
              <div key={slide.id} onClick={() => setActiveSlide(index)} className={`absolute w-[85%] sm:w-[70%] md:w-[60%] lg:w-[55%] aspect-video transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-sm border bg-[#050505] overflow-hidden ${styleClass}`}>
                <Image src={`/${slide.id}.png`} alt={slide.title} fill className="object-contain" />
              </div>
            );
          })}
          <button onClick={prevSlide} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-[#050505] hover:bg-neutral-900 text-white rounded-sm border border-neutral-800 transition-colors z-40 shadow-lg"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
          <button onClick={nextSlide} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-[#050505] hover:bg-neutral-900 text-white rounded-sm border border-neutral-800 transition-colors z-40 shadow-lg"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
        </div>
        <div className="mt-12 text-center relative z-10 max-w-xl mx-auto px-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">{terminalSlides[activeSlide].title}</h3>
           <p className="text-neutral-500 text-[11px] font-medium leading-relaxed">{terminalSlides[activeSlide].desc}</p>
        </div>
      </section>

      {/* FEATURED RESEARCH SKELETON */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden bg-[#020202] border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-4">
          <div>
            <h2 className="text-2xl font-black text-neutral-100 tracking-tight mb-2">Live Examples</h2>
            <p className="text-neutral-500 text-[11px] font-medium tracking-wide">Real setups logged by our community</p>
          </div>
          <Link href="/community" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors bg-[#111] md:bg-transparent px-4 py-2 md:p-0 rounded-sm">
            View All <ArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center py-20 text-neutral-500 border border-neutral-900/50 bg-[#050505] rounded-2xl">
            <Activity className="w-6 h-6 animate-pulse mb-3" />
            <p className="font-medium text-xs">Loading Data...</p>
          </div>
        ) : analyses.length > 0 ? (
          <div className="relative w-full h-[280px] sm:h-[400px] md:h-[480px] flex items-center justify-center max-w-[100vw] mx-auto">
            {analyses.map((item, index) => {
              const len = analyses.length;
              let offset = (index - activeFeaturedSlide) % len;
              if (offset > Math.floor(len / 2)) offset -= len;
              if (offset < -Math.floor(len / 2)) offset += len;

              const isActive = offset === 0;
              let styleClass = isActive ? "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl bg-[#0a0a0a] ring-1 ring-white/[0.05] pointer-events-auto" :
                               (offset === 1 || offset === -1) ? `${offset === 1 ? "" : "-"}translate-x-[35%] sm:${offset === 1 ? "" : "-"}translate-x-[45%] md:${offset === 1 ? "" : "-"}translate-x-[50%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-70 bg-[#050505] ring-1 ring-white/[0.02] pointer-events-none` :
                               `${offset > 0 ? "" : "-"}translate-x-[70%] scale-[0.70] opacity-0 z-10 pointer-events-none`;

              return (
                <div key={item.id} onClick={() => { if(!isActive) setActiveFeaturedSlide(index) }} className={`absolute w-[90%] sm:w-[70%] md:w-[55%] lg:w-[45%] p-4 sm:p-5 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl overflow-hidden flex flex-col ${styleClass}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-neutral-200">{item.asset_symbol}</h3>
                    <span className="text-[9px] sm:text-[10px] text-neutral-500 font-medium tracking-widest uppercase bg-[#111] px-2.5 py-1 rounded-md ring-1 ring-white/[0.04]">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {item.after_image_url && item.image_url ? (
                    <HoverRevealSlider before={item.image_url} after={item.after_image_url} />
                  ) : item.image_url ? (
                    <div className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] shadow-inner">
                      <img src={item.image_url} alt={`${item.asset_symbol} Analysis`} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    </div>
                  ) : (
                    <div className="rounded-xl w-full aspect-video bg-[#050505] ring-1 ring-white/[0.04] flex items-center justify-center shadow-inner"><BarChart3 className="text-neutral-800 w-8 h-8" /></div>
                  )}
                </div>
              );
            })}
            {analyses.length > 1 && (
              <>
                <button onClick={prevFeatured} className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-xl ring-1 ring-white/[0.05] transition-colors z-40 shadow-xl"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" /></button>
                <button onClick={nextFeatured} className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-xl ring-1 ring-white/[0.05] transition-colors z-40 shadow-xl"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" /></button>
              </>
            )}
          </div>
        ) : (
            <div className="max-w-6xl mx-auto px-6">
              <div className="bg-[#0a0a0a] py-16 sm:py-20 rounded-2xl ring-1 ring-white/[0.05] text-center max-w-full">
                <Database className="w-8 h-8 mx-auto text-neutral-700 mb-4 stroke-1" />
                <p className="text-neutral-500 text-[11px] font-medium tracking-wide">No data available.</p>
              </div>
            </div>
        )}
      </section>

      {/* PLAIN PRICING */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto py-16 md:py-24 px-6">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Terminal Access</h2>
        </div>

        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-[#080808] p-1.5 rounded-sm border border-neutral-900 inline-flex shadow-lg w-full sm:w-auto overflow-hidden">
            <button onClick={() => setBillingCycle('monthly')} className={`flex-1 sm:flex-none px-6 py-3 sm:py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-600 hover:text-white'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('annual')} className={`flex-1 sm:flex-none px-6 py-3 sm:py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:text-white'}`}>
              Annually <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-sm text-[8px] hidden sm:inline-block">SAVE</span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-5 items-start max-w-4xl mx-auto">
          <div className="bg-[#080808] p-8 md:p-10 rounded-sm border border-neutral-900 text-center">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Free Account</h3>
            <p className="text-4xl font-black text-white my-6">$0</p>
            <p className="text-neutral-500 text-[11px] font-medium mb-8 h-10">Basic trade logging and delayed floor access.</p>
            <Link href="/signup" className="block w-full py-3.5 sm:py-3 px-4 bg-[#111] text-white font-black rounded-sm border border-neutral-800 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-[9px]">
              Sign Up Free
            </Link>
          </div>

          <div className="bg-[#0a0a0a] p-8 md:p-10 rounded-sm border border-blue-500/30 relative text-center">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Pro Operator</h3>
            <p className="text-4xl font-black text-white my-6">
              ${billingCycle === 'monthly' ? '29' : '299'}
              <span className="text-xs text-neutral-600 font-medium tracking-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <p className="text-neutral-400 text-[11px] font-medium mb-8 h-10">Full MT5 Sync, Live Floor analysis, and complete behavioral analytics.</p>
            <Link href="/signup" className="block w-full py-3.5 sm:py-3 px-4 bg-blue-600 text-white font-black rounded-sm hover:bg-blue-500 transition-colors uppercase tracking-widest text-[9px]">
              Get Pro Access
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ & FOOTER */}
      <section className="relative z-10 max-w-3xl mx-auto pb-16 md:pb-24 px-6">
        <h2 className="text-2xl font-black text-white mb-8 md:mb-10 text-center uppercase tracking-tight">FAQ</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#080808] border border-neutral-900 rounded-sm">
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none group">
                <span className="text-[11px] sm:text-xs font-black text-neutral-400 group-hover:text-white transition-colors uppercase tracking-widest pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-600 shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              <div className={`px-5 text-[11px] font-medium text-neutral-500 leading-relaxed transition-all duration-300 overflow-hidden ${openFaq === index ? 'max-h-60 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#020202] border-t border-neutral-900 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
          <Link href="/" className="relative w-28 h-8 mb-6">
            <Image src="/logo.png" alt="MyTraderDesk" fill className="object-contain opacity-50" sizes="112px" />
          </Link>
          <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest mb-2">
            &copy; {new Date().getFullYear()} MyTraderDesk. All rights reserved.
          </p>
          <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
            Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
    </div>
  )
}
