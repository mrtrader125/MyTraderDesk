'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, Map, ShieldCheck, Filter, ArrowRight, Activity, 
  ChevronLeft, ChevronRight, Lock, ChevronDown, Globe2, BarChart3, Database,
  TerminalSquare, BookOpen, Workflow, Target, Star, Quote, MonitorSmartphone
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
      className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] group cursor-pointer shadow-inner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)} 
    >
      <img 
        src={after} 
        alt="Result" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[800ms]" 
      />
      <div className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-[#050505]/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0 ring-1 ring-white/[0.05] ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
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
        <div className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-[#050505]/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold text-neutral-300 uppercase tracking-widest transition-all duration-500 ring-1 ring-white/[0.05] ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          Initial Setup
        </div>
      </div>
      <div 
        className="absolute top-0 bottom-0 w-px bg-blue-400/80 z-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_2px_rgba(59,130,246,0.5)] opacity-0 group-hover:opacity-100"
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
  
  const [heroProfiles, setHeroProfiles] = useState<string[]>([])

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
    
    const allProfiles = ['/profile1.png', '/profile2.png', '/profile3.png', '/profile4.png', '/profile5.png']
    const shuffledProfiles = [...allProfiles].sort(() => 0.5 - Math.random())
    setHeroProfiles(shuffledProfiles.slice(0, 3))

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
      
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-blue-600/5 blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-neutral-600/5 blur-[150px]"></div>
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/90 border-b border-neutral-800/50 backdrop-blur-md py-3' : 'py-4 sm:py-5'}`}>
        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-5 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 group relative w-24 md:w-28 h-6 sm:h-7">
            <Image 
              src="/logo.png" 
              alt="MyTraderDesk" 
              fill
              className="object-contain object-left transition-opacity hover:opacity-80" 
              sizes="(max-width: 768px) 96px, 112px"
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
            <Link href="/apply" className="px-4 sm:px-5 py-2 text-[8px] sm:text-[9px] uppercase tracking-widest font-extrabold bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              Apply For Access
            </Link>
          </div>
        </div>
      </nav>
      
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-32 pb-16 md:pt-40 md:pb-24">
        
        {/* Core Value Proposition */}
        <div className="flex flex-col items-center justify-center max-w-[900px] mx-auto text-center px-5 w-full">
          <h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl lg:text-[4.5rem] font-extrabold tracking-tight text-white mb-6 flex flex-col items-center justify-center w-full">
            <span className="block sm:inline sm:whitespace-nowrap">Systematic Trading Terminal &</span>
            <span className="text-blue-500 block sm:inline sm:whitespace-nowrap mt-1 sm:mt-0">Performance Journal.</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
            A closed-loop platform that forces discipline. Draft your setups, sync your real MT5 executions, and explicitly track the emotional errors costing you money.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/apply" className="px-8 py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all w-full sm:w-auto shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              Apply For Founding Cohort
            </Link>
            <Link href="#features" className="px-8 py-3.5 sm:py-4 bg-[#111] text-white border border-neutral-800/60 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#1a1a1a] transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
              See How It Works <Lock className="w-3.5 h-3.5 text-neutral-500" />
            </Link>
          </div>
        </div>

        {/* Visual Anchor & Trust Panel */}
        <div className="w-full max-w-[1400px] mx-auto mt-16 sm:mt-24 px-5 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative z-20">
          
          {/* Left: Terminal Mockup */}
          <div className="w-full lg:w-[55%] relative aspect-[16/9] lg:aspect-auto lg:h-[450px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent rounded-3xl overflow-hidden flex items-center justify-center">
               {/* Drop your actual mockup image here! 
                  Ensure the image is named terminal-mockup.png in your public folder 
               */}
               <Image 
                 src="/terminal-mockup.png" 
                 alt="MyTraderDesk Terminal Interface" 
                 fill 
                 className="object-contain object-center drop-shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10" 
               />
               
               {/* Fallback wireframe if image is missing */}
               <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 border border-neutral-800/50 rounded-3xl bg-[#080808]/50 backdrop-blur-sm">
                  <MonitorSmartphone className="w-16 h-16 text-neutral-800 mb-4" />
                  <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">[Terminal Mockup Placeholder]</p>
               </div>
            </div>
          </div>

          {/* Right: The Trust Panel */}
          <div className="w-full lg:w-[45%] flex flex-col">
            <div className="bg-[#080808]/80 backdrop-blur-md border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl">
              
              <h3 className="text-[9px] sm:text-[10px] font-bold text-neutral-500 tracking-[0.15em] uppercase mb-6 text-center lg:text-left">
                Compatible Institutional Platforms
              </h3>
              
              {/* Fake Logos - Replace with actual SVGs or Next Images if you have them */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2"><Globe2 className="w-5 h-5 text-neutral-400"/> <span className="font-bold text-sm tracking-tight text-neutral-300">MetaTrader 4/5</span></div>
                <div className="flex items-center gap-2"><Target className="w-5 h-5 text-neutral-400"/> <span className="font-bold text-sm tracking-tight text-neutral-300">cTrader</span></div>
                <div className="flex items-center gap-2"><Database className="w-5 h-5 text-neutral-400"/> <span className="font-bold text-sm tracking-tight text-neutral-300">Supabase</span></div>
              </div>

              <hr className="border-neutral-800/60 my-8" />

              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="flex -space-x-3 shrink-0">
                  {heroProfiles.length > 0 ? (
                    heroProfiles.map((src, index) => (
                      <div key={index} className="relative w-12 h-12 rounded-full border-2 border-[#080808] bg-neutral-800 overflow-hidden shadow-sm">
                        <Image src={src} alt="Active Operator" fill className="object-cover" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full border-2 border-[#080808] bg-neutral-800"></div>
                      <div className="w-12 h-12 rounded-full border-2 border-[#080808] bg-neutral-700"></div>
                      <div className="w-12 h-12 rounded-full border-2 border-[#080808] bg-neutral-600"></div>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-white"><span className="text-blue-500">95% Higher</span> Discipline Index</p>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium uppercase tracking-[0.1em] mt-1.5 leading-relaxed">
                    Reported by current cohort members.<br className="hidden sm:block" /> Explicitly remove your visual bias leaks.
                  </p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </section>
      
      {/* ... [Features Section remains perfectly untouched] ... */}
      <section id="features" className="relative z-10 w-full py-16 md:py-24 lg:py-28 px-5 sm:px-6 border-t border-neutral-900 bg-[#020202]">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              What The Platform Does
            </h2>
            <p className="text-neutral-500 text-sm mt-2 md:mt-3 font-medium px-4">
              The core operational tools built into the terminal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-7 hover:border-neutral-700 transition-all duration-300 shadow-lg shadow-black/20">
              <Workflow className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 mb-4 sm:mb-5" />
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">MT5 Data Sync</h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-1">Execution Infrastructure</p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Connect your broker data via CSV or HTML parsing. Matches live executions to drafted setups, creating a frictionless trading record.</p>
            </div>

            <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-7 hover:border-neutral-700 transition-all duration-300 shadow-lg shadow-black/20">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500 mb-4 sm:mb-5" />
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">Behavioral Journaling</h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-1">Discipline Analytics</p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Go beyond PnL. Track execution quality, emotional discipline, and behavioral mistakes while assigning measurable costs to inconsistency.</p>
            </div>

            <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-7 hover:border-neutral-700 transition-all duration-300 shadow-lg shadow-black/20">
              <TerminalSquare className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500 mb-4 sm:mb-5" />
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">The Live Floor</h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-1">Real-Time Context</p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Access institutional-grade structural analysis, directional bias, and key invalidation zones before executing your own setups.</p>
            </div>

            <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-7 hover:border-neutral-700 transition-all duration-300 shadow-lg shadow-black/20">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500 mb-4 sm:mb-5" />
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">Trading System</h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-1">Structured Framework</p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Build a personalized execution system around your existing strategy and edge to reduce mental overload and impulsive trades.</p>
            </div>

            <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-7 hover:border-neutral-700 transition-all duration-300 shadow-lg shadow-black/20">
              <Map className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 mb-4 sm:mb-5" />
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">Market Context</h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-1">Professional Guidance</p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Receive higher-timeframe market structure, directional perspectives, and execution context designed to support independent decisions.</p>
            </div>

            <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-7 hover:border-neutral-700 transition-all duration-300 shadow-lg shadow-black/20">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500 mb-4 sm:mb-5" />
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white">Psychological Context</h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-1">Emotional Stability</p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">Identify emotional execution problems such as FOMO, hesitation, revenge trading, and impulsive behavior while improving discipline.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="blueprint" className="relative z-10 w-full py-16 md:py-24 lg:py-32 px-5 sm:px-6 overflow-hidden border-t border-neutral-900 bg-[#050505]">
        <div className="text-center mb-10 md:mb-14 relative z-20 max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">The Operator's Blueprint</h2>
          <p className="text-neutral-500 text-sm mt-2 md:mt-3 font-medium">Explore the mechanics of consistency.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-4 bottom-4 left-[23px] md:left-1/2 w-px bg-neutral-800/80 md:-translate-x-[0.5px] z-0"></div>

          <div className="space-y-8 md:space-y-16 relative z-10">
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[15px] md:hidden w-4 h-4 rounded-full bg-blue-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-[#050505] -translate-x-2 z-10 shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 relative">
                <div className="hidden md:block absolute right-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/identity" className="block bg-[#080808] p-5 sm:p-6 lg:p-8 rounded-2xl border border-neutral-800/60 hover:border-blue-500/50 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold mb-1.5 sm:mb-2 text-white">1. The Identity</h3>
                  <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed font-medium">Discover why intermediate traders stay unprofitable and the required mindset shift.</p>
                </Link>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[15px] md:hidden w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-[#050505] -translate-x-2 z-10 shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
              <div className="hidden md:block w-1/2"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-12 relative">
                <div className="hidden md:block absolute left-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/strategy" className="block bg-[#080808] p-5 sm:p-6 lg:p-8 rounded-2xl border border-neutral-800/60 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
                  <Map className="w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold mb-1.5 sm:mb-2 text-white">2. The Strategy</h3>
                  <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed font-medium">Strategy isn't magic; it's finding your place in the market's endless journey.</p>
                </Link>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[15px] md:hidden w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#050505] -translate-x-2 z-10 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 relative">
                <div className="hidden md:block absolute right-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/system" className="block bg-[#080808] p-5 sm:p-6 lg:p-8 rounded-2xl border border-neutral-800/60 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold mb-1.5 sm:mb-2 text-white">3. The System</h3>
                  <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed font-medium">Bridging the gap between theory and execution to build an edge you can actually follow.</p>
                </Link>
              </div>
              <div className="hidden md:block w-1/2"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="absolute left-[15px] md:hidden w-4 h-4 rounded-full bg-purple-500 ring-4 ring-[#050505] z-10"></div>
              <div className="hidden md:block absolute left-1/2 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-[#050505] -translate-x-2 z-10 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
              <div className="hidden md:block w-1/2"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-12 relative">
                <div className="hidden md:block absolute left-0 top-1/2 w-8 h-px bg-neutral-800 -z-10"></div>
                <Link href="/protocol/routine" className="block bg-[#080808] p-5 sm:p-6 lg:p-8 rounded-2xl border border-neutral-800/60 hover:border-purple-500/50 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
                  <Filter className="w-5 h-5 sm:w-6 sm:h-6 mb-3 sm:mb-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold mb-1.5 sm:mb-2 text-white">4. The Routine</h3>
                  <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed font-medium">The 3-Level Filtration process. Narrow the market down to high-probability executions.</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full overflow-hidden py-16 md:py-24 lg:py-32 px-5 sm:px-6 border-t border-neutral-900 bg-[#020202]">
        <div className="text-center mb-6 max-w-5xl mx-auto">
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">Inside The Terminal</h2>
        </div>
        
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[380px] lg:h-[450px] xl:h-[500px] flex items-center justify-center max-w-[1600px] 2xl:max-w-[1920px] mx-auto">
          {terminalSlides.map((slide, index) => {
            const len = terminalSlides.length;
            let offset = (index - activeSlide) % len;
            if (offset > Math.floor(len / 2)) offset -= len;
            if (offset < -Math.floor(len / 2)) offset += len;

            let styleClass = "";
            if (offset === 0) {
              styleClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-[0_0_80px_rgba(0,0,0,0.8)] border-neutral-700 pointer-events-auto";
            } else if (offset === 1 || offset === -1) { 
              const direction = offset === 1 ? "" : "-";
              styleClass = `${direction}translate-x-[40%] sm:${direction}translate-x-[45%] md:${direction}translate-x-[50%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-60 border-neutral-800/50 pointer-events-auto`;
            } else { 
              styleClass = offset > 0 ? "translate-x-[70%] scale-[0.70] opacity-0 z-10 pointer-events-none" : "-translate-x-[70%] scale-[0.70] opacity-0 z-10 pointer-events-none";
            }

            return (
              <div key={slide.id} onClick={() => setActiveSlide(index)} className={`absolute w-[95%] sm:w-[80%] md:w-[70%] lg:w-[55%] xl:w-[50%] aspect-video transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl border bg-[#050505] overflow-hidden ${styleClass}`}>
                <Image src={`/${slide.id}.png`} alt={slide.title} fill className="object-contain" />
              </div>
            );
          })}
          
          <button onClick={prevSlide} className="absolute left-1 md:left-8 lg:left-[10%] xl:left-[15%] top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#080808] hover:bg-[#111] text-neutral-200 rounded-xl border border-neutral-800/60 transition-colors z-40 shadow-2xl">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={nextSlide} className="absolute right-1 md:right-8 lg:right-[10%] xl:right-[15%] top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#080808] hover:bg-[#111] text-neutral-200 rounded-xl border border-neutral-800/60 transition-colors z-40 shadow-2xl">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <div className="mt-6 text-center relative z-10 max-w-xl mx-auto px-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-1.5 sm:mb-2">{terminalSlides[activeSlide].title}</h3>
           <p className="text-neutral-500 text-[11px] sm:text-xs font-medium leading-relaxed">{terminalSlides[activeSlide].desc}</p>
        </div>
      </section>

      <section className="relative z-10 w-full py-16 md:py-24 lg:py-32 px-5 sm:px-6 overflow-hidden border-t border-neutral-900 bg-[#050505]">
        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto mb-6 sm:mb-8 flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight mb-1 sm:mb-2">Featured Analysis</h2>
            <p className="text-neutral-500 text-[11px] sm:text-xs font-medium">Real setups logged by our community</p>
          </div>
          <Link href="/community" className="flex items-center text-[10px] sm:text-[11px] font-bold text-neutral-400 hover:text-white transition-colors bg-[#080808] md:bg-transparent px-4 py-2.5 md:p-0 rounded-lg border border-neutral-800/50 md:border-transparent">
            View All <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-16 sm:py-20 text-neutral-500 border border-neutral-800/50 bg-[#080808] rounded-2xl">
            <Activity className="w-8 h-8 animate-pulse mb-4" />
            <p className="font-medium text-xs">Loading Data...</p>
          </div>
        ) : analyses.length > 0 ? (
          <div className="relative w-full h-[240px] sm:h-[280px] md:h-[380px] lg:h-[450px] xl:h-[500px] flex items-center justify-center max-w-[1600px] 2xl:max-w-[1920px] mx-auto">
            {analyses.map((item, index) => {
              const len = analyses.length;
              let offset = (index - activeFeaturedSlide) % len;
              if (offset > Math.floor(len / 2)) offset -= len;
              if (offset < -Math.floor(len / 2)) offset += len;

              const isActive = offset === 0;
              let styleClass = isActive ? "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl shadow-black/60 ring-1 ring-white/[0.05] pointer-events-auto" :
                               (offset === 1 || offset === -1) ? `${offset === 1 ? "" : "-"}translate-x-[35%] sm:${offset === 1 ? "" : "-"}translate-x-[45%] md:${offset === 1 ? "" : "-"}translate-x-[50%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-70 ring-1 ring-white/[0.02] pointer-events-none` :
                               `${offset > 0 ? "" : "-"}translate-x-[70%] scale-[0.70] opacity-0 z-10 pointer-events-none`;

              return (
                <div key={item.id} onClick={() => { if(!isActive) setActiveFeaturedSlide(index) }} className={`absolute w-[95%] sm:w-[75%] md:w-[65%] lg:w-[55%] xl:w-[48%] p-3 sm:p-5 bg-[#080808] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-[1.25rem] sm:rounded-3xl overflow-hidden flex flex-col ${styleClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-neutral-200">{item.asset_symbol}</h3>
                    <span className="text-[8px] sm:text-[9px] text-neutral-500 font-bold tracking-widest uppercase bg-[#050505] px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-800/60">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {item.after_image_url && item.image_url ? (
                    <HoverRevealSlider before={item.image_url} after={item.after_image_url} />
                  ) : item.image_url ? (
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] shadow-inner">
                      <img src={item.image_url} alt={`${item.asset_symbol} Analysis`} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    </div>
                  ) : (
                    <div className="rounded-2xl w-full aspect-video bg-[#050505] ring-1 ring-white/[0.04] flex items-center justify-center shadow-inner"><BarChart3 className="text-neutral-800 w-6 h-6 sm:w-8 sm:h-8" /></div>
                  )}
                </div>
              );
            })}
            {analyses.length > 1 && (
              <>
                <button onClick={prevFeatured} className="absolute left-1 md:left-8 lg:left-[10%] xl:left-[15%] top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#080808] hover:bg-[#111] border border-neutral-800/60 text-neutral-200 rounded-xl transition-colors z-40 shadow-2xl">
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button onClick={nextFeatured} className="absolute right-1 md:right-8 lg:right-[10%] xl:right-[15%] top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#080808] hover:bg-[#111] border border-neutral-800/60 text-neutral-200 rounded-xl transition-colors z-40 shadow-2xl">
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>
        ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-[#080808] py-12 sm:py-16 rounded-2xl border border-neutral-800/50 text-center w-full">
                <Database className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-neutral-700 mb-3 sm:mb-4 stroke-1" />
                <p className="text-neutral-500 text-[11px] sm:text-xs font-medium tracking-wide">No data available.</p>
              </div>
            </div>
        )}
      </section>
      
      <section className="relative z-10 w-full py-16 md:py-24 lg:py-32 px-5 sm:px-6 border-t border-neutral-900 bg-[#020202]">
        <div className="text-center mb-10 md:mb-14 max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Field Reports</h2>
          <p className="text-neutral-500 text-sm mt-2 md:mt-3 font-medium px-4">Feedback from operators actively using the terminal.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-[1200px] mx-auto">
          <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 relative flex flex-col justify-between shadow-lg shadow-black/10">
            <Quote className="absolute top-5 right-5 sm:top-6 sm:right-6 w-5 h-5 sm:w-6 sm:h-6 text-neutral-800/50" />
            <div>
              <div className="flex text-amber-500 mb-4 sm:mb-5 space-x-1">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium mb-6 sm:mb-8">
                "Tracking my Primary Leaks completely changed my profitability. I finally put a dollar value to my FOMO"
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-auto">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#111] border border-neutral-800 overflow-hidden shrink-0">
                 <Image src="/profile1.png" alt="Christopher" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-widest">Christopher</h4>
                <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Systematic Trader</span>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 relative flex flex-col justify-between shadow-lg shadow-black/10">
            <Quote className="absolute top-5 right-5 sm:top-6 sm:right-6 w-5 h-5 sm:w-6 sm:h-6 text-neutral-800/50" />
            <div>
              <div className="flex text-amber-500 mb-4 sm:mb-5 space-x-1">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium mb-6 sm:mb-8">
                "The MT5 sync eliminates the busywork of journaling. The Live Floor gives me exact confluence."
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-auto">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#111] border border-neutral-800 overflow-hidden shrink-0">
                 <Image src="/profile3.png" alt="Katherine" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-widest">Katherine</h4>
                <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Prop Firm Funded</span>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 relative flex flex-col justify-between shadow-lg shadow-black/10">
            <Quote className="absolute top-5 right-5 sm:top-6 sm:right-6 w-5 h-5 sm:w-6 sm:h-6 text-neutral-800/50" />
            <div>
              <div className="flex text-amber-500 mb-4 sm:mb-5 space-x-1">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium mb-6 sm:mb-8">
                "I've traded for 3 years, but this holds me accountable. The Discipline Index is a reality check."
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-auto">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#111] border border-neutral-800 overflow-hidden shrink-0">
                 <Image src="/profile4.png" alt="Rayner" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-widest">Rayner</h4>
                <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Quantitative Analyst</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full py-16 md:py-24 lg:py-32 px-5 sm:px-6 border-t border-neutral-900 bg-[#050505]">
        <div className="text-center mb-10 md:mb-14 max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Desk Requirements</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5 lg:gap-8 max-w-[1000px] mx-auto">
          <div className="bg-[#080808] p-6 sm:p-8 lg:p-10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-900/5">
            <h3 className="text-[11px] sm:text-xs font-bold text-emerald-500 uppercase tracking-widest mb-5 sm:mb-6 border-b border-emerald-500/10 pb-4">Approved Profiles</h3>
            <ul className="space-y-4 text-neutral-400 text-xs sm:text-sm font-medium">
              <li className="flex items-start"><span className="text-emerald-500 mr-3 sm:mr-4 font-bold text-base sm:text-lg leading-none">✓</span> You treat trading as a rigid, risk-managed operation.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-3 sm:mr-4 font-bold text-base sm:text-lg leading-none">✓</span> You want to explicitly track and quantify your emotional leaks.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-3 sm:mr-4 font-bold text-base sm:text-lg leading-none">✓</span> You seek structural clarity to execute your predefined edge.</li>
            </ul>
          </div>
          <div className="bg-[#080808] p-6 sm:p-8 lg:p-10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-900/5">
            <h3 className="text-[11px] sm:text-xs font-bold text-rose-500 uppercase tracking-widest mb-5 sm:mb-6 border-b border-red-500/10 pb-4">Denied Profiles</h3>
            <ul className="space-y-4 text-neutral-400 text-xs sm:text-sm font-medium">
              <li className="flex items-start"><span className="text-rose-500 mr-3 sm:mr-4 font-bold text-base sm:text-lg leading-none">✕</span> Retail gamblers looking for magic buy/sell indicators.</li>
              <li className="flex items-start"><span className="text-rose-500 mr-3 sm:mr-4 font-bold text-base sm:text-lg leading-none">✕</span> Traders looking for a 'sandbox' or burner account.</li>
              <li className="flex items-start"><span className="text-rose-500 mr-3 sm:mr-4 font-bold text-base sm:text-lg leading-none">✕</span> Anyone unwilling to confront the cost of indiscipline.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 w-full py-16 md:py-24 lg:py-32 px-5 sm:px-6 bg-[#020202] border-t border-neutral-900">
        <div className="text-center mb-8 md:mb-10 max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">Terminal Access</h2>
        </div>

        <div className="flex justify-center mb-10 md:mb-12">
          <div className="bg-[#080808] p-1.5 rounded-xl border border-neutral-800/60 flex w-full sm:w-auto shadow-lg overflow-hidden">
            <button onClick={() => setBillingCycle('monthly')} className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:text-neutral-200'}`}>Monthly</button>
            <button onClick={() => setBillingCycle('annual')} className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2 sm:gap-3 ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-neutral-200'}`}>
              Annually <span className="bg-white text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] inline-block">SAVE</span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 items-start max-w-[1000px] mx-auto">
          {/* DEMO CARD */}
          <div className="bg-[#080808] p-6 sm:p-8 lg:p-10 rounded-3xl border border-neutral-800/60 text-left shadow-lg shadow-black/10 flex flex-col h-full">
            <h3 className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 sm:mb-3 text-center sm:text-left">Terminal Demo</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white my-4 sm:my-6 text-center sm:text-left">$0</p>
            <p className="text-neutral-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8 text-center sm:text-left">Take a risk-free tour of the terminal interface and see the operational protocol in action.</p>
            
            <ul className="space-y-4 text-neutral-500 text-[11px] sm:text-xs font-medium mb-8 sm:mb-10 flex-1">
              <li className="flex items-start"><span className="text-neutral-700 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Platform UI walkthrough</li>
              <li className="flex items-start"><span className="text-neutral-700 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Read-only historical setups</li>
              <li className="flex items-start"><span className="text-neutral-700 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Journaling mechanism preview</li>
            </ul>

            <Link href="/apply" className="block w-full py-3.5 sm:py-4 px-6 bg-[#111] text-neutral-200 font-bold rounded-xl border border-neutral-800 hover:bg-[#1a1a1a] transition-colors uppercase tracking-widest text-[9px] sm:text-[10px] text-center mt-auto">
              Access Demo
            </Link>
          </div>

          {/* PRO CARD */}
          <div className="bg-[#080808] p-6 sm:p-8 lg:p-10 rounded-3xl border border-blue-500/30 relative text-left shadow-lg shadow-blue-900/5 flex flex-col h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            
            <h3 className="text-[11px] sm:text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 sm:mb-3 text-center sm:text-left">Pro Operator</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white my-4 sm:my-6 text-center sm:text-left">
              ${billingCycle === 'monthly' ? '50' : '500'}
              <span className="text-xs sm:text-sm text-neutral-500 font-medium tracking-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <p className="text-neutral-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8 text-center sm:text-left">The complete institutional-grade toolkit and behavioral enforcement system.</p>
            
            <ul className="space-y-4 text-neutral-400 text-[11px] sm:text-xs font-medium mb-8 sm:mb-10 flex-1">
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Guided routine & system setup</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Sunday macro & invalidation levels</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Personal Vault for pair tracking</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Daily 4H & LTF chart updates</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Live Floor trade validation</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Strict mechanical execution rules</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Pre-outcome behavioral journaling</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Saturday data-driven reviews</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 sm:mr-3 font-bold text-xs sm:text-sm leading-none">✓</span> Active mentor accountability</li>
            </ul>

            <Link href="/apply" className="block w-full py-3.5 sm:py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors uppercase tracking-widest text-[9px] sm:text-[10px] text-center mt-auto shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              Apply For Pro Access
            </Link>
          </div>
        </div>
      </section>
      
      <section className="relative z-10 w-full py-16 md:py-24 lg:py-32 px-5 sm:px-6 border-t border-neutral-900 bg-[#050505]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-8 md:mb-10 text-center tracking-tight">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#080808] border border-neutral-800/60 rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between focus:outline-none group">
                  <span className="text-xs sm:text-sm font-bold text-neutral-300 group-hover:text-white transition-colors pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-5 sm:px-6 text-[11px] sm:text-sm font-medium text-neutral-500 leading-relaxed transition-all duration-300 ${openFaq === index ? 'max-h-60 pb-5 sm:pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full bg-[#020202] border-t border-neutral-900 pt-16 md:pt-20 pb-8 md:pb-10 px-5 md:px-12">
        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 md:gap-y-12 mb-12 md:mb-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center shrink-0 group mb-5 sm:mb-6 relative w-28 sm:w-32 h-7 sm:h-8">
              <Image 
                src="/logo.png" 
                alt="MyTraderDesk" 
                fill
                className="object-contain object-left opacity-60 group-hover:opacity-100 transition-opacity" 
                sizes="128px"
              />
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-neutral-500 leading-relaxed pr-4">
              Institutional-grade structural analysis and behavioral performance enforcement.
            </p>
          </div>

          <div>
            <h4 className="text-neutral-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-5">The Blueprint</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/protocol/identity" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Trader vs Operator</Link></li>
              <li><Link href="/protocol/strategy" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Strategy Simplification</Link></li>
              <li><Link href="/protocol/system" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">System Building</Link></li>
              <li><Link href="/protocol/routine" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">The 3-Level Routine</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-5">Live Markets</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/analysis/eurusd" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">EUR/USD Analysis</Link></li>
              <li><Link href="/analysis/xauusd" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Gold (XAUUSD) Setups</Link></li>
              <li><Link href="/analysis/btcusd" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Bitcoin (BTC) Structure</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-5">Resources</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/playbook" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">The Playbook</Link></li>
              <li><Link href="/faq" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neutral-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-5">Legal</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/terms" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="text-[11px] sm:text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-colors">Risk Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1600px] 2xl:max-w-[1920px] mx-auto border-t border-neutral-800/50 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[9px] sm:text-[10px] font-bold text-neutral-600 uppercase tracking-widest text-center sm:text-left">
            &copy; {new Date().getFullYear()} Sentinel Vortex. All rights reserved.
          </p>
          <p className="text-[9px] sm:text-[10px] font-bold text-neutral-600 uppercase tracking-widest text-center sm:text-right">
            Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
    </div>
  )
}
