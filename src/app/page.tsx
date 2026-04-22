'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, Map, ShieldCheck, Filter, ArrowRight, Activity, 
  ChevronLeft, ChevronRight, Lock, ChevronDown, Globe2, BarChart3, Database,
  TerminalSquare, BookOpen, Workflow, Target, Star, Quote
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
    <div className="bg-[#050505] text-neutral-200 min-h-screen font-sans selection:bg-blue-500/30 selection:text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-blue-600/5 blur-[150px]"></div>
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/95 border-b border-neutral-900 py-3 backdrop-blur-md' : 'bg-transparent py-4 md:py-5'}`}>
        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 group relative w-24 md:w-28 h-7">
            <Image 
              src="/logo.png" 
              alt="MyTraderDesk" 
              fill
              className="object-contain object-left transition-opacity hover:opacity-80" 
              sizes="(max-width: 768px) 96px, 112px"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center space-x-10 shrink-0">
            <Link href="#features" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Features</Link>
            <Link href="#blueprint" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Blueprint</Link>
            <Link href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex gap-4 items-center shrink-0">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-5 py-2 text-[9px] uppercase tracking-widest font-black bg-white text-black rounded-sm hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Access Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* SLEEK, SHARP HERO */}
      <section className="relative z-10 min-h-[90vh] flex flex-col justify-center pt-24 pb-8">
        <div className="flex-1 flex flex-col items-center justify-center max-w-[1000px] mx-auto text-center px-6 w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tighter text-white mb-6 flex flex-col items-center justify-center w-full">
            <span className="whitespace-nowrap">Systematic Trading Terminal &</span>
            <span className="text-blue-500 whitespace-nowrap">Performance Journal.</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
            A closed-loop platform that forces discipline. Draft your setups, sync your real MT5 executions, and explicitly track the emotional errors costing you money.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="px-8 py-3.5 bg-blue-600 text-white rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all w-full sm:w-auto shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              Create Free Account
            </Link>
            <Link href="#features" className="px-8 py-3.5 bg-[#111] text-white border border-neutral-800 rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition-colors w-full sm:w-auto">
              See How It Works
            </Link>
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-auto px-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full border-2 border-[#050505] bg-neutral-800"></div>
              <div className="w-5 h-5 rounded-full border-2 border-[#050505] bg-neutral-700"></div>
              <div className="w-5 h-5 rounded-full border-2 border-[#050505] bg-neutral-600"></div>
            </div>
            <p className="text-[9px] font-bold text-neutral-500 tracking-widest uppercase">Join active operators validating setups today.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 opacity-70">
            <div className="px-4 py-2 border border-neutral-800/50 rounded-sm bg-[#080808] flex items-center gap-2">
              <Globe2 className="w-3 h-3 text-neutral-500" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">MetaTrader 4 / 5</span>
            </div>
            <div className="px-4 py-2 border border-neutral-800/50 rounded-sm bg-[#080808] flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-neutral-500" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">TradingView Charts</span>
            </div>
            <div className="px-4 py-2 border border-neutral-800/50 rounded-sm bg-[#080808] flex items-center gap-2">
              <Target className="w-3 h-3 text-neutral-500" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">cTrader</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT FEATURES GRID */}
      <section id="features" className="relative z-10 w-full py-16 px-6 border-t border-neutral-900 bg-[#020202]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">What The Platform Does</h2>
            <p className="text-neutral-500 text-xs mt-1 font-medium">The core tools built into the terminal.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
            <div className="bg-[#080808] border border-neutral-800 rounded-lg p-5 lg:p-6 hover:border-neutral-700 transition-colors">
              <Workflow className="w-5 h-5 text-blue-500 mb-4" />
              <h3 className="text-sm font-bold text-white mb-2">MT5 Data Sync</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect your broker data via CSV or HTML parsing. Matches live executions to drafted setups, creating a frictionless record.
              </p>
            </div>
            <div className="bg-[#080808] border border-neutral-800 rounded-lg p-5 lg:p-6 hover:border-neutral-700 transition-colors">
              <BookOpen className="w-5 h-5 text-emerald-500 mb-4" />
              <h3 className="text-sm font-bold text-white mb-2">Behavioral Journaling</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Go beyond PnL. Tracks your "Discipline Index." Categorize trades as Perfect/Imperfect, assigning dollar costs to mistakes.
              </p>
            </div>
            <div className="bg-[#080808] border border-neutral-800 rounded-lg p-5 lg:p-6 hover:border-neutral-700 transition-colors">
              <TerminalSquare className="w-5 h-5 text-purple-500 mb-4" />
              <h3 className="text-sm font-bold text-white mb-2">The Live Floor</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Real-time squawk box for Pro members. Access structural analysis, validate bias, and interact with community voting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT BLUEPRINT */}
      <section id="blueprint" className="relative z-10 w-full py-16 px-6 overflow-hidden border-t border-neutral-900">
        <div className="text-center mb-10 relative z-20 max-w-3xl mx-auto">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">The Operator's Blueprint</h2>
          <p className="text-neutral-500 text-xs mt-1 font-medium tracking-wide">Explore the mechanics of consistency.</p>
        </div>

        <div className="relative max-w-3xl mx-auto px-2 sm:px-0">
          <div className="absolute top-4 bottom-4 left-[27px] md:left-1/2 w-px bg-neutral-800 md:-translate-x-[0.5px] z-0"></div>

          <div className="space-y-8 relative z-10">
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#050505] -translate-x-1 z-10 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-10 relative">
                <div className="hidden md:block absolute right-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/identity" className="block bg-[#080808] p-5 rounded-md border border-neutral-900 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
                  <User className="w-5 h-5 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[11px] font-black mb-1.5 text-white uppercase tracking-widest">1. The Identity</h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed font-medium">Discover why intermediate traders stay unprofitable and the required mindset shift.</p>
                </Link>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-[#050505] -translate-x-1 z-10 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
              <div className="hidden md:block w-1/2"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-10 relative">
                <div className="hidden md:block absolute left-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/strategy" className="block bg-[#080808] p-5 rounded-md border border-neutral-900 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group">
                  <Map className="w-5 h-5 mb-3 text-cyan-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[11px] font-black mb-1.5 text-white uppercase tracking-widest">2. The Strategy</h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed font-medium">Strategy isn't magic; it's finding your place in the market's endless journey.</p>
                </Link>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#050505] -translate-x-1 z-10 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-10 relative">
                <div className="hidden md:block absolute right-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/system" className="block bg-[#080808] p-5 rounded-md border border-neutral-900 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
                  <ShieldCheck className="w-5 h-5 mb-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[11px] font-black mb-1.5 text-white uppercase tracking-widest">3. The System</h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed font-medium">Bridging the gap between theory and execution to build an edge you can actually follow.</p>
                </Link>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[22px] md:hidden w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-[#050505] -translate-x-1 z-10 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
              <div className="hidden md:block w-1/2"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-10 relative">
                <div className="hidden md:block absolute left-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/routine" className="block bg-[#080808] p-5 rounded-md border border-neutral-900 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
                  <Filter className="w-5 h-5 mb-3 text-purple-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[11px] font-black mb-1.5 text-white uppercase tracking-widest">4. The Routine</h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed font-medium">The 3-Level Filtration process. Narrow the market down to high-probability executions.</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 MASSIVE TERMINAL UI CAROUSEL 🚀 */}
      <section className="relative z-10 w-full overflow-hidden py-16 md:py-24 px-6 border-y border-neutral-900 bg-[#020202]">
        <div className="text-center mb-10 max-w-5xl mx-auto">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Inside The Terminal</h2>
        </div>
        
        {/* HUGE SIZING ALLOWED HERE */}
        <div className="relative w-full h-[280px] sm:h-[450px] md:h-[600px] lg:h-[750px] flex items-center justify-center max-w-[1600px] 2xl:max-w-[1920px] mx-auto">
          {terminalSlides.map((slide, index) => {
            const len = terminalSlides.length;
            let offset = (index - activeSlide) % len;
            if (offset > Math.floor(len / 2)) offset -= len;
            if (offset < -Math.floor(len / 2)) offset += len;

            let styleClass = "";
            if (offset === 0) {
              styleClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-[0_0_80px_rgba(0,0,0,0.8)] border-neutral-700";
            } else if (offset === 1 || offset === -1) { 
              const direction = offset === 1 ? "" : "-";
              styleClass = `${direction}translate-x-[35%] sm:${direction}translate-x-[45%] md:${direction}translate-x-[50%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-60 border-neutral-900`;
            } else { 
              styleClass = offset > 0 ? "translate-x-[70%] scale-[0.70] opacity-0 z-10" : "-translate-x-[70%] scale-[0.70] opacity-0 z-10";
            }

            return (
              // VERY WIDE WIDTHS
              <div key={slide.id} onClick={() => setActiveSlide(index)} className={`absolute w-[95%] sm:w-[80%] md:w-[70%] lg:w-[65%] xl:w-[60%] aspect-video transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl border bg-[#050505] overflow-hidden ${styleClass}`}>
                <Image src={`/${slide.id}.png`} alt={slide.title} fill className="object-contain" />
              </div>
            );
          })}
          <button onClick={prevSlide} className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-lg border border-neutral-800 transition-colors z-40 shadow-2xl"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={nextSlide} className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-lg border border-neutral-800 transition-colors z-40 shadow-2xl"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="mt-10 text-center relative z-10 max-w-xl mx-auto px-4">
           <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">{terminalSlides[activeSlide].title}</h3>
           <p className="text-neutral-500 text-xs font-medium leading-relaxed">{terminalSlides[activeSlide].desc}</p>
        </div>
      </section>

      {/* 🚀 MASSIVE LIVE EXAMPLES SKELETON 🚀 */}
      <section className="relative z-10 w-full py-16 md:py-24 px-6 overflow-hidden border-b border-neutral-900">
        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto mb-10 flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-neutral-100 tracking-tight mb-2">Live Examples</h2>
            <p className="text-neutral-500 text-xs font-medium tracking-wide">Real setups logged by our community</p>
          </div>
          <Link href="/community" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors bg-[#111] md:bg-transparent px-4 py-2 md:p-0 rounded-sm">
            View All <ArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-16 text-neutral-500 border border-neutral-900/50 bg-[#050505] rounded-xl">
            <Activity className="w-6 h-6 animate-pulse mb-3" />
            <p className="font-medium text-xs">Loading Data...</p>
          </div>
        ) : analyses.length > 0 ? (
          // HUGE SIZING ALLOWED HERE
          <div className="relative w-full h-[280px] sm:h-[450px] md:h-[600px] lg:h-[700px] flex items-center justify-center max-w-[1600px] 2xl:max-w-[1920px] mx-auto">
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
                // VERY WIDE WIDTHS
                <div key={item.id} onClick={() => { if(!isActive) setActiveFeaturedSlide(index) }} className={`absolute w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[55%] p-4 sm:p-5 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-xl overflow-hidden flex flex-col ${styleClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-xl font-bold font-mono tracking-tight text-neutral-200">{item.asset_symbol}</h3>
                    <span className="text-[9px] text-neutral-500 font-medium tracking-widest uppercase bg-[#111] px-2 py-1 rounded-md ring-1 ring-white/[0.04]">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {item.after_image_url && item.image_url ? (
                    <HoverRevealSlider before={item.image_url} after={item.after_image_url} />
                  ) : item.image_url ? (
                    <div className="relative overflow-hidden rounded-lg ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] shadow-inner">
                      <img src={item.image_url} alt={`${item.asset_symbol} Analysis`} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    </div>
                  ) : (
                    <div className="rounded-lg w-full aspect-video bg-[#050505] ring-1 ring-white/[0.04] flex items-center justify-center shadow-inner"><BarChart3 className="text-neutral-800 w-6 h-6" /></div>
                  )}
                </div>
              );
            })}
            {analyses.length > 1 && (
              <>
                <button onClick={prevFeatured} className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 p-3 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-lg ring-1 ring-white/[0.05] transition-colors z-40 shadow-2xl"><ChevronLeft className="w-5 h-5 text-neutral-400" /></button>
                <button onClick={nextFeatured} className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 p-3 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-lg ring-1 ring-white/[0.05] transition-colors z-40 shadow-2xl"><ChevronRight className="w-5 h-5 text-neutral-400" /></button>
              </>
            )}
          </div>
        ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-[#0a0a0a] py-16 rounded-xl ring-1 ring-white/[0.05] text-center w-full">
                <Database className="w-6 h-6 mx-auto text-neutral-700 mb-4 stroke-1" />
                <p className="text-neutral-500 text-xs font-medium tracking-wide">No data available.</p>
              </div>
            </div>
        )}
      </section>

      {/* COMPACT OPERATOR FEEDBACK SECTION */}
      <section className="relative z-10 w-full py-16 px-6 border-b border-neutral-900 bg-[#050505]">
        <div className="text-center mb-10 max-w-5xl mx-auto">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Field Reports</h2>
          <p className="text-neutral-500 text-xs mt-1 font-medium tracking-wide">Feedback from operators actively using the terminal.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="bg-[#080808] border border-neutral-800 rounded-lg p-5 relative flex flex-col justify-between">
            <Quote className="absolute top-4 right-4 w-5 h-5 text-neutral-800/50" />
            <div>
              <div className="flex text-amber-500 mb-4 space-x-0.5">
                <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium mb-6">
                "[Insert your feedback here. Example: Tracking my Primary Leaks completely changed my profitability. I finally put a dollar value to my FOMO.]"
              </p>
            </div>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-8 h-8 rounded-full bg-[#111] border border-neutral-800 flex items-center justify-center shrink-0">
                 <User className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Operator Name 1</h4>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Systematic Trader</span>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-neutral-800 rounded-lg p-5 relative flex flex-col justify-between">
            <Quote className="absolute top-4 right-4 w-5 h-5 text-neutral-800/50" />
            <div>
              <div className="flex text-amber-500 mb-4 space-x-0.5">
                <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium mb-6">
                "[Insert your feedback here. Example: The MT5 sync eliminates the busywork of journaling. The Live Floor gives me exact confluence.]"
              </p>
            </div>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-8 h-8 rounded-full bg-[#111] border border-neutral-800 flex items-center justify-center shrink-0">
                 <User className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Operator Name 2</h4>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Prop Firm Funded</span>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-neutral-800 rounded-lg p-5 relative flex flex-col justify-between">
            <Quote className="absolute top-4 right-4 w-5 h-5 text-neutral-800/50" />
            <div>
              <div className="flex text-amber-500 mb-4 space-x-0.5">
                <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium mb-6">
                "[Insert your feedback here. Example: I've traded for 3 years, but this holds me accountable. The Discipline Index is a reality check.]"
              </p>
            </div>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-8 h-8 rounded-full bg-[#111] border border-neutral-800 flex items-center justify-center shrink-0">
                 <User className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Operator Name 3</h4>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Quantitative Analyst</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT DESK REQUIREMENTS */}
      <section className="relative z-10 w-full py-16 px-6">
        <div className="text-center mb-10 max-w-5xl mx-auto">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Desk Requirements</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="bg-[#080808] p-6 rounded-lg border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.02)]">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 border-b border-emerald-500/10 pb-3">Approved Profiles</h3>
            <ul className="space-y-3 text-neutral-400 text-xs font-medium">
              <li className="flex items-start"><span className="text-emerald-500 mr-3 font-bold text-sm leading-none">✓</span> You treat trading as a rigid, risk-managed operation.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-3 font-bold text-sm leading-none">✓</span> You want to explicitly track and quantify your emotional leaks.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-3 font-bold text-sm leading-none">✓</span> You seek structural clarity to execute your predefined edge.</li>
            </ul>
          </div>
          <div className="bg-[#050505] p-6 rounded-lg border border-red-500/10">
            <h3 className="text-[10px] font-black text-red-500/70 uppercase tracking-widest mb-4 border-b border-red-500/10 pb-3">Denied Profiles</h3>
            <ul className="space-y-3 text-neutral-600 text-xs font-medium">
              <li className="flex items-start"><span className="text-red-500/50 mr-3 font-bold text-sm leading-none">✕</span> Retail gamblers looking for magic buy/sell indicators.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-3 font-bold text-sm leading-none">✕</span> Traders looking for a 'sandbox' or burner account.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-3 font-bold text-sm leading-none">✕</span> Anyone unwilling to confront the cost of indiscipline.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* COMPACT PRICING */}
      <section id="pricing" className="relative z-10 w-full py-16 px-6 bg-[#020202] border-t border-neutral-900">
        <div className="text-center mb-8 max-w-5xl mx-auto">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-2">Terminal Access</h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-[#080808] p-1.5 rounded-md border border-neutral-900 inline-flex shadow-lg w-full sm:w-auto overflow-hidden">
            <button onClick={() => setBillingCycle('monthly')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded text-[9px] font-black uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-600 hover:text-white'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('annual')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded text-[9px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:text-white'}`}>
              Annually <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-sm text-[8px] hidden sm:inline-block">SAVE</span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 items-start max-w-3xl mx-auto">
          <div className="bg-[#080808] p-6 lg:p-8 rounded-xl border border-neutral-900 text-center">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Free Account</h3>
            <p className="text-3xl font-black text-white my-4">$0</p>
            <p className="text-neutral-500 text-xs font-medium mb-6 h-8">Basic trade logging and delayed floor access.</p>
            <Link href="/signup" className="block w-full py-3 px-6 bg-[#111] text-white font-black rounded-md border border-neutral-800 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-[9px]">
              Sign Up Free
            </Link>
          </div>

          <div className="bg-[#0a0a0a] p-6 lg:p-8 rounded-xl border border-blue-500/30 relative text-center">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Pro Operator</h3>
            <p className="text-3xl font-black text-white my-4">
              ${billingCycle === 'monthly' ? '29' : '299'}
              <span className="text-xs text-neutral-600 font-medium tracking-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <p className="text-neutral-400 text-xs font-medium mb-6 h-8">Full MT5 Sync, Live Floor analysis, and behavioral analytics.</p>
            <Link href="/signup" className="block w-full py-3 px-6 bg-blue-600 text-white font-black rounded-md hover:bg-blue-500 transition-colors uppercase tracking-widest text-[9px]">
              Get Pro Access
            </Link>
          </div>
        </div>
      </section>

      {/* COMPACT FAQ */}
      <section className="relative z-10 w-full py-16 px-6 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl font-black text-white mb-6 text-center uppercase tracking-tight">FAQ</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#080808] border border-neutral-900 rounded-md overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none group">
                  <span className="text-[11px] font-black text-neutral-400 group-hover:text-white transition-colors uppercase tracking-widest pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-600 shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-5 text-xs font-medium text-neutral-500 leading-relaxed transition-all duration-300 ${openFaq === index ? 'max-h-60 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#020202] border-t border-neutral-900 pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center shrink-0 group mb-4 relative w-24 h-6">
              <Image 
                src="/logo.png" 
                alt="MyTraderDesk" 
                fill
                className="object-contain object-left opacity-50 group-hover:opacity-100 transition-opacity" 
                sizes="96px"
              />
            </Link>
            <p className="text-[10px] font-medium text-neutral-600 leading-relaxed pr-4">
              Institutional-grade structural analysis and behavioral performance enforcement.
            </p>
          </div>

          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-3">The Blueprint</h4>
            <ul className="space-y-3">
              <li><Link href="/protocol/identity" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">Trader vs Operator</Link></li>
              <li><Link href="/protocol/strategy" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">Strategy Simplification</Link></li>
              <li><Link href="/protocol/system" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">System Building</Link></li>
              <li><Link href="/protocol/routine" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">The 3-Level Routine</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-3">Live Markets</h4>
            <ul className="space-y-3">
              <li><Link href="/analysis/eurusd" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">EUR/USD Analysis</Link></li>
              <li><Link href="/analysis/xauusd" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">Gold (XAUUSD) Setups</Link></li>
              <li><Link href="/analysis/btcusd" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">Bitcoin (BTC) Structure</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-3">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/playbook" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">The Playbook</Link></li>
              <li><Link href="/faq" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-3">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">Risk Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto border-t border-neutral-900 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest text-center sm:text-left">
            &copy; {new Date().getFullYear()} Sentinel Vortex. All rights reserved.
          </p>
          <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest text-center sm:text-right">
            Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
    </div>
  )
}
