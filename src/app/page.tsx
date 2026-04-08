'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Brain, CheckCircle2, Shield, BarChart3, ArrowRight, 
  Activity, Zap, ChevronLeft, ChevronRight, Lock, ChevronDown, Globe2, Target, Database
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 🌟 SLEEK HOVER-WIPE BEFORE/AFTER COMPONENT
const HoverRevealSlider = ({ before, after }: { before: string, after: string }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] group cursor-pointer shadow-inner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. After Image (Base Layer) */}
      <img 
        src={after} 
        alt="Result" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[800ms]" 
      />
      
      {/* Result Badge */}
      <div className={`absolute bottom-3 right-3 bg-[#050505]/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold text-emerald-400 uppercase tracking-widest transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0 ring-1 ring-white/[0.05] ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        Result
      </div>

      {/* 2. Before Image (Wiping Layer) */}
      <div 
        className="absolute inset-0 z-10 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ clipPath: isHovered ? 'polygon(0 0, 0 0, 0 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      >
        <img 
          src={before} 
          alt="Setup" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        
        {/* Setup Badge */}
        <div className={`absolute bottom-3 left-3 bg-[#050505]/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold text-neutral-300 uppercase tracking-widest transition-all duration-500 ring-1 ring-white/[0.05] ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          Initial Setup
        </div>
      </div>

      {/* 3. Glowing Sweep Line */}
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeFeaturedSlide, setActiveFeaturedSlide] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const terminalSlides = [
    { id: 'mtd1', title: 'Dashboard', desc: 'Your central intelligence hub for daily market structure and active setups.' },
    { id: 'mtd2', title: 'Markets', desc: 'Deep, multi-timeframe analysis across Forex, Crypto, Indices, and Commodities.' },
    { id: 'mtd3', title: 'The Vault', desc: 'Your personal archive. Bookmark and save high-probability setups from the Live Floor.' },
    { id: 'mtd4', title: 'Live Floor', desc: 'Real-time structural analysis, active setups, and community bias voting.' },
    { id: 'mtd5', title: 'Account', desc: 'Manage your terminal preferences, secure data, and subscription access.' }
  ]

  const faqs = [
    { q: "Is this a signal group?", a: "No. Signal groups create dependency. Sentinel Vortex provides institutional-grade structural analysis so you can validate your own bias and execute with confluence." },
    { q: "Do I need my own charting software?", a: "You should still execute trades on your preferred broker, but all of our structural mapping is provided in high-resolution directly within our platform." },
    { q: "Am I locked into a contract?", a: "Never. We operate on a strict month-to-month (or annual) basis. You can cancel your subscription instantly with two clicks from your Account Dashboard." },
    { q: "What timeframes do you analyze?", a: "We take a top-down approach. Our daily analysis establishes the Weekly/Daily macro bias, identifies the 4H/1H structural framework, and pinpoints 15m execution zones." }
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

      {/* FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-blue-600/5 blur-[150px]"></div>
      </div>

      {/* GLASS NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/95 border-b border-neutral-900 py-3 backdrop-blur-md' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 group relative w-24 md:w-32 h-8">
            <Image 
              src="/logo.png" 
              alt="Sentinel Vortex" 
              fill
              className="object-contain object-left transition-opacity hover:opacity-80" 
              sizes="(max-width: 768px) 96px, 128px"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8 shrink-0">
            <Link href="/community" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Live Floor</Link>
            <Link href="/playbook" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Playbook</Link>
            <Link href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Access</Link>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-6 py-2.5 text-[9px] uppercase tracking-widest font-black bg-white text-black rounded-sm hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Access Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 pt-40 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="inline-flex items-center space-x-2 bg-neutral-900/40 border border-neutral-800 rounded-sm px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)] rounded-full"></span>
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Digital Trading Floor Online</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white uppercase mb-6">
          Institutional-Grade<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
            Structural Analysis
          </span>
        </h1>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
          Stop trading in isolation. Connect to a professional digital desk to validate your directional bias, review multi-timeframe setups, and execute with absolute confluence.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5">
          <Link href="/signup" className="flex items-center justify-center px-8 py-3.5 bg-white text-black rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Access The Terminal <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full border-2 border-[#050505] bg-neutral-800"></div>
              <div className="w-5 h-5 rounded-full border-2 border-[#050505] bg-neutral-700"></div>
              <div className="w-5 h-5 rounded-full border-2 border-[#050505] bg-neutral-600"></div>
            </div>
            <p className="text-[9px] font-bold text-neutral-500 tracking-widest uppercase">Join active operators validating setups today.</p>
          </div>
        </div>
      </section>

      {/* 1.5 INFRASTRUCTURE */}
      <section className="relative z-10 max-w-5xl mx-auto pb-20 px-6 border-b border-neutral-900/50">
        <p className="text-center text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-6">Compatible with industry standards</p>
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
      </section>

      {/* 2. THE MECHANISM */}
      <section className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-[#080808] p-8 rounded-sm border border-neutral-900 hover:border-neutral-700 transition-colors group hover:-translate-y-0.5 duration-300">
            <Brain className="w-6 h-6 mb-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-black mb-3 text-white uppercase tracking-widest">Clear Macro Bias</h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">Establish the true directional trend and higher-timeframe target zones before you look for execution triggers.</p>
          </div>
          <div className="bg-[#080808] p-8 rounded-sm border border-neutral-900 hover:border-neutral-700 transition-colors group hover:-translate-y-0.5 duration-300">
            <CheckCircle2 className="w-6 h-6 mb-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-black mb-3 text-white uppercase tracking-widest">Setup Validation</h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">Cross-reference your personal chart analysis with our active floor mapping to execute with supreme confidence.</p>
          </div>
          <div className="bg-[#080808] p-8 rounded-sm border border-neutral-900 hover:border-neutral-700 transition-colors group hover:-translate-y-0.5 duration-300">
            <Zap className="w-6 h-6 mb-5 text-cyan-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-black mb-3 text-white uppercase tracking-widest">The Playbook</h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed font-medium">Access our structured educational vault to master liquidity concepts, market phases, and institutional delivery.</p>
          </div>
        </div>
      </section>

      {/* 3. TERMINAL PREVIEW SLIDER */}
      <section className="relative z-10 w-full overflow-hidden py-24 px-6 bg-[#020202] border-y border-neutral-900">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Inside The Terminal</h2>
        </div>

        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] flex items-center justify-center max-w-6xl mx-auto">
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

          <button onClick={prevSlide} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-[#050505] hover:bg-neutral-900 text-white rounded-sm border border-neutral-800 transition-colors z-40 shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextSlide} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-[#050505] hover:bg-neutral-900 text-white rounded-sm border border-neutral-800 transition-colors z-40 shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-12 text-center relative z-10 max-w-xl mx-auto px-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">
             {terminalSlides[activeSlide].title}
           </h3>
           <p className="text-neutral-500 text-[11px] font-medium leading-relaxed">
             {terminalSlides[activeSlide].desc}
           </p>
        </div>
      </section>

      {/* 4. FEATURED RESEARCH */}
      <section className="relative z-10 py-24 overflow-hidden bg-[#020202] border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-neutral-100 tracking-tight mb-2">Featured Research</h2>
            <p className="text-neutral-500 text-[11px] font-medium tracking-wide">Curated structural forecasts & market results</p>
          </div>
          <Link href="/community" className="hidden md:flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
            View All Data <ArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center py-20 text-neutral-500 border border-neutral-900/50 bg-[#050505] rounded-2xl">
            <Activity className="w-6 h-6 animate-pulse mb-3" />
            <p className="font-medium text-xs">Querying Terminal Data...</p>
          </div>
        ) : analyses.length > 0 ? (
          <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex items-center justify-center max-w-[100vw] mx-auto">
            {analyses.map((item, index) => {
              const len = analyses.length;
              let offset = (index - activeFeaturedSlide) % len;
              if (offset > Math.floor(len / 2)) offset -= len;
              if (offset < -Math.floor(len / 2)) offset += len;

              const isActive = offset === 0;
              let styleClass = "";
              
              if (isActive) {
                // 🚨 CENTER CARD: Fully interactive, lifted, glowing
                styleClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl bg-[#0a0a0a] ring-1 ring-white/[0.05] pointer-events-auto";
              } else if (offset === 1 || offset === -1) { 
                // 🚨 SIDE CARDS: Pushed back, faded, disabled clicks on image
                const direction = offset === 1 ? "" : "-";
                styleClass = `${direction}translate-x-[35%] sm:${direction}translate-x-[45%] md:${direction}translate-x-[50%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-70 bg-[#050505] ring-1 ring-white/[0.02] pointer-events-none`;
              } else { 
                // 🚨 HIDDEN CARDS
                styleClass = offset > 0 ? "translate-x-[70%] scale-[0.70] opacity-0 z-10 pointer-events-none" : "-translate-x-[70%] scale-[0.70] opacity-0 z-10 pointer-events-none";
              }

              return (
                <div 
                  key={item.id} 
                  onClick={() => { if(!isActive) setActiveFeaturedSlide(index) }} 
                  className={`absolute w-[90%] sm:w-[70%] md:w-[55%] lg:w-[45%] p-5 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl overflow-hidden flex flex-col ${styleClass}`}
                >
                  
                  {/* Clean Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold font-mono tracking-tight text-neutral-200">{item.asset_symbol}</h3>
                    <span className="text-[10px] text-neutral-500 font-medium tracking-widest uppercase bg-[#111] px-2.5 py-1 rounded-md ring-1 ring-white/[0.04]">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Replaced Manual Slider with Smooth Hover Reveal */}
                  {item.after_image_url && item.image_url ? (
                    <HoverRevealSlider before={item.image_url} after={item.after_image_url} />
                  ) : item.image_url ? (
                    <div className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.04] w-full aspect-video bg-[#050505] shadow-inner">
                      <img 
                        src={item.image_url} 
                        alt={`${item.asset_symbol} Analysis`} 
                        className="absolute inset-0 w-full h-full object-cover opacity-90" 
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl w-full aspect-video bg-[#050505] ring-1 ring-white/[0.04] flex items-center justify-center shadow-inner">
                      <BarChart3 className="text-neutral-800 w-8 h-8" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Navigation Arrows */}
            {analyses.length > 1 && (
              <>
                <button onClick={prevFeatured} className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 p-3 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-xl ring-1 ring-white/[0.05] transition-colors z-40 shadow-xl hidden sm:block">
                  <ChevronLeft className="w-5 h-5 text-neutral-400" />
                </button>
                <button onClick={nextFeatured} className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 p-3 bg-[#0a0a0a] hover:bg-[#151515] text-white rounded-xl ring-1 ring-white/[0.05] transition-colors z-40 shadow-xl hidden sm:block">
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </button>
              </>
            )}
          </div>
        ) : (
            <div className="max-w-6xl mx-auto px-6">
              <div className="bg-[#0a0a0a] py-20 rounded-2xl ring-1 ring-white/[0.05] text-center max-w-full">
                <Database className="w-8 h-8 mx-auto text-neutral-700 mb-4 stroke-1" />
                <p className="text-neutral-500 text-[11px] font-medium tracking-wide">No featured data available.</p>
              </div>
            </div>
        )}
      </section>

      {/* 5. THE GATEKEEPER */}
      <section className="relative z-10 max-w-5xl mx-auto py-24 px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Desk Requirements</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-[#080808] p-8 rounded-sm border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.02)]">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 border-b border-emerald-500/10 pb-4">Approved Profiles</h3>
            <ul className="space-y-4 text-neutral-400 text-[11px] font-medium">
              <li className="flex items-start"><span className="text-emerald-500 mr-3 font-bold text-base leading-none">✓</span> You treat trading as a precise, risk-managed business.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-3 font-bold text-base leading-none">✓</span> You seek structural clarity and institutional confluence.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-3 font-bold text-base leading-none">✓</span> You want to validate your own technical bias.</li>
            </ul>
          </div>
          <div className="bg-[#050505] p-8 rounded-sm border border-red-500/10">
            <h3 className="text-[10px] font-black text-red-500/70 uppercase tracking-widest mb-6 border-b border-red-500/10 pb-4">Denied Profiles</h3>
            <ul className="space-y-4 text-neutral-600 text-[11px] font-medium">
              <li className="flex items-start"><span className="text-red-500/50 mr-3 font-bold text-base leading-none">✕</span> Traders looking for blind copy-paste signals.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-3 font-bold text-base leading-none">✕</span> Gamblers seeking to pass challenges in one day.</li>
              <li className="flex items-start"><span className="text-red-500/50 mr-3 font-bold text-base leading-none">✕</span> Beginners refusing to study The Playbook theory.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto py-24 px-6 border-t border-neutral-900/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Terminal Access</h2>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-[#080808] p-1.5 rounded-sm border border-neutral-900 inline-flex shadow-lg">
            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-600 hover:text-white'}`}>
              Monthly
            </button>
            <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:text-white'}`}>
              Annually <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-sm text-[8px]">SAVE 16%</span>
            </button>
          </div>
        </div>
        
        {/* 🚨 UPDATED 2-TIER GRID */}
        <div className="grid md:grid-cols-2 gap-5 items-start max-w-4xl mx-auto">
          
          {/* TIER 1: FREE */}
          <div className="bg-[#080808] p-8 md:p-10 rounded-sm border border-neutral-900 text-center">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Free Access</h3>
            <p className="text-4xl font-black text-white my-6">$0</p>
            <p className="text-neutral-500 text-[11px] font-medium mb-8 h-10">7-day delayed analysis and read-only floor access.</p>
            <Link href="/signup" className="block w-full py-3 px-4 bg-[#111] text-white font-black rounded-sm border border-neutral-800 hover:bg-neutral-800 transition-colors uppercase tracking-widest text-[9px]">
              Create Free Account
            </Link>
          </div>

          {/* TIER 2: PROFESSIONAL */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-8 md:p-10 rounded-sm border border-blue-500/30 relative text-center shadow-[0_0_20px_rgba(59,130,246,0.05)] md:-mt-2 md:mb-[-0.5rem]">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-md">All Access</span>
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Professional</h3>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 my-6">
              ${billingCycle === 'monthly' ? '29' : '290'}
              <span className="text-xs text-neutral-600 font-medium tracking-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <p className="text-neutral-400 text-[11px] font-medium mb-8 h-10">Instant real-time setups, Live Floor, Telegram alerts & voting.</p>
            <Link href="/signup" className="block w-full py-3 px-4 bg-white text-black font-black rounded-sm hover:bg-neutral-200 transition-colors uppercase tracking-widest text-[9px]">
              Get Pro Access
            </Link>
            <p className="text-[8px] text-neutral-600 mt-4 font-bold tracking-widest uppercase">Cancel Anytime</p>
          </div>

        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-[8px] text-neutral-600 font-bold tracking-widest uppercase">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL • Secure processing via Lemon Squeezy</span>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto py-24 px-6 border-t border-neutral-900/50">
        <h2 className="text-2xl font-black text-white mb-10 text-center uppercase tracking-tight">FAQ</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#080808] border border-neutral-900 rounded-sm">
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none group">
                <span className="text-xs font-black text-neutral-400 group-hover:text-white transition-colors uppercase tracking-widest">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-600 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              <div className={`px-6 text-[11px] font-medium text-neutral-500 leading-relaxed transition-all duration-300 overflow-hidden ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL BOTTOM CTA */}
      <section className="relative z-10 bg-gradient-to-t from-[#050505] to-[#0a0a0a] py-32 px-6 border-t border-neutral-900/50 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] rounded-full"></span>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">System Ready</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">The Terminal is Online</h2>
          <p className="text-neutral-500 text-sm mb-10 max-w-xl mx-auto font-medium leading-relaxed">
            Stop guessing. Start executing with institutional structural confluence. Your professional edge is one click away.
          </p>
          <Link href="/signup" className="inline-flex items-center justify-center px-10 py-4 bg-white text-black rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 9. SEO FOOTER */}
      <footer className="bg-[#020202] border-t border-neutral-900 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center shrink-0 group mb-6 relative w-28 h-8">
              <Image 
                src="/logo.png" 
                alt="Sentinel Vortex" 
                fill
                className="object-contain object-left opacity-50 group-hover:opacity-100 transition-opacity" 
                sizes="112px"
              />
            </Link>
            <p className="text-[10px] font-medium text-neutral-600 leading-relaxed pr-4">
              Institutional-grade structural analysis and crowdsourced market confluence.
            </p>
          </div>
          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-4">Live Markets</h4>
            <ul className="space-y-3">
              <li><Link href="/analysis/eurusd" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">EUR/USD Analysis</Link></li>
              <li><Link href="/analysis/xauusd" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">Gold (XAUUSD) Setups</Link></li>
              <li><Link href="/analysis/btcusd" className="text-[10px] font-bold text-neutral-600 hover:text-blue-500 transition-colors">Bitcoin (BTC) Structure</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/playbook" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">The Playbook</Link></li>
              <li><Link href="/faq" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-neutral-300 text-[9px] font-black uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">Risk Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-neutral-900 pt-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} Sentinel Vortex. All rights reserved.
          </p>
          <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
            Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
    </div>
  )
}
