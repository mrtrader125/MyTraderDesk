'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, Map, ShieldCheck, Filter, ArrowRight, Activity, 
  ChevronDown, Globe2, BarChart3, Database,
  TerminalSquare, BookOpen, Workflow, Check, X
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Trustworthy Hover Slider - No glowing edges, pure clean borders
const HoverRevealSlider = ({ before, after }: { before: string, after: string }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="relative overflow-hidden rounded-md border border-slate-700 w-full aspect-video bg-slate-900 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={after} 
        alt="Result" 
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
      />
      <div className={`absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold text-slate-300 uppercase tracking-widest transition-all duration-700 z-0 border border-slate-700 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        Result
      </div>
      <div 
        className="absolute inset-0 z-10 transition-all duration-700 ease-in-out"
        style={{ clipPath: isHovered ? 'polygon(0 0, 0 0, 0 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      >
        <img 
          src={before} 
          alt="Setup" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className={`absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold text-slate-300 uppercase tracking-widest transition-all duration-500 border border-slate-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          Initial Setup
        </div>
      </div>
      <div 
        className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100"
        style={{ left: isHovered ? '0%' : '100%' }}
      />
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [activeTab, setActiveTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const terminalTabs = [
    { id: 'mtd1', title: 'Dashboard', desc: 'Your central hub for daily market structure and active setups. Monitor your Discipline Index at a glance.' },
    { id: 'mtd2', title: 'Markets', desc: 'Multi-timeframe analysis across Forex, Crypto, Indices, and Commodities.' },
    { id: 'mtd3', title: 'The Vault', desc: 'Your personal archive. Bookmark and save structural frameworks from the Live Floor.' },
    { id: 'mtd4', title: 'Live Floor', desc: 'Real-time structural analysis and community bias validation without the noise of signal groups.' }
  ]

  const faqs = [
    { q: "Do you support burner or sandbox accounts?", a: "Absolutely not. The system requires discipline. By removing burner accounts, we remove the temptation for impulsive trading. All MT5 executions are synced and logged permanently." },
    { q: "Is this a signal group?", a: "No. Signal groups create dependency. We provide institutional-grade structural analysis so you can validate your own bias and execute with confluence." },
    { q: "What timeframes do you analyze?", a: "We take a top-down approach. Our daily analysis establishes the Weekly/Daily macro bias, identifies the 4H/1H structural framework, and pinpoints 15m execution zones." },
    { q: "Do I need a new strategy to use this?", a: "No. You bring your strategy. Our platform provides the routine and tools to help you execute it without emotional interference." },
    { q: "Is this for beginners?", a: "No. This is built for intermediate traders—those who have survived a few years in the market, know how to trade, but want stricter systemic control." },
    { q: "Am I locked into a contract?", a: "Never. We operate on a month-to-month (or annual) basis. You can cancel your subscription instantly." }
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
        .limit(4) 
      if (error) throw error
      setAnalyses(data || [])
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Replaced neutral/black with slate-950 for a professional, institutional dark mode
    <div className="bg-slate-950 text-slate-200 min-h-screen font-sans selection:bg-blue-500/30 selection:text-white">
      
      {/* NAVIGATION - Clean separation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 border-b border-slate-800 py-4 backdrop-blur-md' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 w-32 h-8 relative">
            <Image 
              src="/logo.png" 
              alt="MyTraderDesk" 
              fill
              className="object-contain object-left" 
              priority
            />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="#blueprint" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Blueprint</Link>
            <Link href="#pricing" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">Log In</Link>
            <Link href="/signup" className="px-6 py-2.5 text-xs uppercase tracking-widest font-bold bg-white text-slate-900 rounded hover:bg-slate-200 transition-colors">
              Access Terminal
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO (Full Screen) */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-24 pb-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 text-center w-full">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.05] mb-6">
            Systematic Trading Terminal <br />
            <span className="text-slate-500">& Performance Journal.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium mb-10 max-w-2xl mx-auto">
            A closed-loop platform that forces discipline. Draft your setups, sync your real MT5 executions, and explicitly track the emotional errors costing you money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-colors w-full sm:w-auto">
              Create Free Account
            </Link>
            <Link href="#features" className="px-8 py-4 bg-slate-900 text-white border border-slate-700 rounded font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors w-full sm:w-auto">
              Explore The System
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4 opacity-70">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded text-xs font-bold tracking-widest uppercase text-slate-400">
              <Globe2 className="w-4 h-4" /> MetaTrader 4 / 5
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded text-xs font-bold tracking-widest uppercase text-slate-400">
              <BarChart3 className="w-4 h-4" /> TradingView Charts
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES GRID (Distinct Background) */}
      <section id="features" className="py-32 px-6 bg-slate-900 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Core Infrastructure</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">The tools built into the terminal to enforce your edge.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-colors">
              <Workflow className="w-6 h-6 text-blue-500 mb-6" />
              <h3 className="text-base font-bold text-white mb-3 uppercase tracking-wide">MT5 Data Sync</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your broker data via CSV or HTML parsing. Matches live executions to drafted setups, creating a frictionless record of your actions.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-500 mb-6" />
              <h3 className="text-base font-bold text-white mb-3 uppercase tracking-wide">Behavioral Journaling</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Go beyond standard PnL. Track your Discipline Index. Categorize trades as Perfect or Imperfect, assigning explicit dollar costs to your mistakes.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-colors">
              <TerminalSquare className="w-6 h-6 text-blue-500 mb-6" />
              <h3 className="text-base font-bold text-white mb-3 uppercase tracking-wide">The Live Floor</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time squawk box for active operators. Access structural analysis, validate bias, and interact with community voting before you execute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE BLUEPRINT (Back to Slate 950) */}
      <section id="blueprint" className="py-32 px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-4">The Operator's Protocol</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Trading is not about predicting the future; it's about executing a rigid system flawlessly. Explore the mechanics of consistency through our step-by-step documentation.
            </p>
            <Link href="/playbook" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-white hover:text-blue-500 transition-colors">
              Read The Full Playbook <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { num: '01', title: 'The Identity', desc: 'The required mindset shift from retail trader to systematic operator.', icon: User },
              { num: '02', title: 'The Strategy', desc: 'Finding your place in the market\'s endless structural journey.', icon: Map },
              { num: '03', title: 'The System', desc: 'Bridging the gap between theory and execution to build a definable edge.', icon: ShieldCheck },
              { num: '04', title: 'The Routine', desc: 'The 3-Level Filtration process to narrow down high-probability executions.', icon: Filter }
            ].map((step) => (
              <Link key={step.num} href={`/protocol/${step.title.toLowerCase().replace(' ', '')}`} className="flex items-start p-6 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
                <span className="text-2xl font-black text-slate-800 group-hover:text-slate-500 transition-colors mr-6">{step.num}</span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: TERMINAL UI (Full Screen layout, Slate 900) */}
      <section className="min-h-[90vh] flex flex-col justify-center py-32 px-6 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Inside The Terminal</h2>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 flex flex-col space-y-3">
              {terminalTabs.map((tab, index) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`text-left p-6 rounded-lg border transition-all duration-300 ${activeTab === index ? 'bg-slate-950 border-slate-700 shadow-lg' : 'bg-transparent border-transparent hover:bg-slate-800/50'}`}
                >
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${activeTab === index ? 'text-white' : 'text-slate-500'}`}>{tab.title}</h3>
                  <p className={`text-sm leading-relaxed ${activeTab === index ? 'text-slate-400' : 'text-slate-500'}`}>{tab.desc}</p>
                </button>
              ))}
            </div>
            
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative aspect-[16/10] flex items-center justify-center">
               <Image 
                 src={`/${terminalTabs[activeTab].id}.png`} 
                 alt={terminalTabs[activeTab].title} 
                 fill 
                 className="object-contain p-4" 
               />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE EXAMPLES (Slate 950) */}
      <section className="min-h-screen flex flex-col justify-center py-32 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Live Floor Setups</h2>
              <p className="text-slate-400 text-sm font-medium">Structural frameworks logged by the community.</p>
            </div>
            <Link href="/community" className="mt-6 md:mt-0 flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              View The Vault <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="w-full flex flex-col items-center justify-center py-32 text-slate-500 border border-slate-800 bg-slate-900 rounded-xl">
              <Activity className="w-8 h-8 animate-pulse mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">Loading Data...</p>
            </div>
          ) : analyses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {analyses.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black font-mono text-white">{item.asset_symbol}</h3>
                    <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {item.after_image_url && item.image_url ? (
                    <HoverRevealSlider before={item.image_url} after={item.after_image_url} />
                  ) : item.image_url ? (
                    <div className="relative overflow-hidden rounded-md border border-slate-800 w-full aspect-video bg-slate-950">
                      <img src={item.image_url} alt={`${item.asset_symbol} Analysis`} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-md w-full aspect-video bg-slate-950 border border-slate-800 flex items-center justify-center"><BarChart3 className="text-slate-800 w-8 h-8" /></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="w-full py-32 border border-slate-800 bg-slate-900 rounded-xl text-center">
                <Database className="w-8 h-8 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No data available.</p>
             </div>
          )}
        </div>
      </section>

      {/* SECTION 6: REQUIREMENTS (Slate 900) */}
      <section className="py-32 px-6 bg-slate-900 border-y border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Operator Requirements</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-950 p-10 rounded-lg border border-slate-800 shadow-md">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Approved Profiles</h3>
              <ul className="space-y-5 text-slate-400 text-sm">
                <li className="flex items-start"><Check className="text-slate-500 mr-4 w-5 h-5 shrink-0" /> You treat trading as a rigid, risk-managed business operation.</li>
                <li className="flex items-start"><Check className="text-slate-500 mr-4 w-5 h-5 shrink-0" /> You want to explicitly track and quantify your emotional execution leaks.</li>
                <li className="flex items-start"><Check className="text-slate-500 mr-4 w-5 h-5 shrink-0" /> You seek structural market clarity to execute your predefined edge.</li>
              </ul>
            </div>
            <div className="bg-slate-950 p-10 rounded-lg border border-slate-800 shadow-md">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Denied Profiles</h3>
              <ul className="space-y-5 text-slate-500 text-sm">
                <li className="flex items-start"><X className="text-slate-700 mr-4 w-5 h-5 shrink-0" /> Retail gamblers looking for magic buy/sell indicator systems.</li>
                <li className="flex items-start"><X className="text-slate-700 mr-4 w-5 h-5 shrink-0" /> Traders looking for a 'sandbox' or burner account.</li>
                <li className="flex items-start"><X className="text-slate-700 mr-4 w-5 h-5 shrink-0" /> Anyone unwilling to confront the true cost of their own indiscipline.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRICING (Slate 950) */}
      <section id="pricing" className="py-32 px-6 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2.5 border border-blue-500/20 bg-blue-500/10 rounded mb-8">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Founding Member Cohort — Strictly Limited to 100 Members</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-8">Terminal Access</h2>
          </div>

          <div className="flex justify-center mb-16">
            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 inline-flex">
              <button onClick={() => setBillingCycle('monthly')} className={`px-8 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}>Monthly</button>
              <button onClick={() => setBillingCycle('annual')} className={`px-8 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-500 hover:text-white'}`}>
                Annually <span className="bg-slate-900 text-slate-200 px-2 py-0.5 rounded-sm text-[9px]">SAVE</span>
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-900 p-10 rounded-xl border border-slate-800 flex flex-col shadow-lg">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Free Account</h3>
              <p className="text-5xl font-black text-white mb-6">$0</p>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed">Basic trade logging and delayed access to the structural vault.</p>
              <ul className="space-y-5 mb-12 flex-1">
                <li className="flex items-center text-sm text-slate-300"><Check className="w-5 h-5 mr-4 text-slate-600" /> Manual Trade Journaling</li>
                <li className="flex items-center text-sm text-slate-300"><Check className="w-5 h-5 mr-4 text-slate-600" /> Delayed Vault Access</li>
                <li className="flex items-center text-sm text-slate-600"><X className="w-5 h-5 mr-4" /> No Live Floor Access</li>
                <li className="flex items-center text-sm text-slate-600"><X className="w-5 h-5 mr-4" /> No MT5 Sync</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 text-center bg-slate-800 text-white font-bold rounded border border-slate-700 hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs">
                Create Free Account
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-slate-950 p-10 rounded-xl border border-blue-500 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-5 rounded-bl-lg">Pro Operator</div>
              <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Premium Access</h3>
              <p className="text-5xl font-black text-white mb-6">
                ${billingCycle === 'monthly' ? '50' : '500'}
                <span className="text-base text-slate-500 font-medium tracking-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </p>
              <p className="text-slate-300 text-sm mb-10 leading-relaxed">Full systemic control. Data synchronization, real-time squawk, and behavioral analytics.</p>
              <ul className="space-y-5 mb-12 flex-1">
                <li className="flex items-center text-sm text-white"><Check className="w-5 h-5 mr-4 text-blue-500" /> Live Floor Market Structure</li>
                <li className="flex items-center text-sm text-white"><Check className="w-5 h-5 mr-4 text-blue-500" /> Automated MT5 Data Sync</li>
                <li className="flex items-center text-sm text-white"><Check className="w-5 h-5 mr-4 text-blue-500" /> Discipline Index Tracking</li>
                <li className="flex items-center text-sm text-white"><Check className="w-5 h-5 mr-4 text-blue-500" /> Community Bias Voting</li>
              </ul>
              <Link href="/signup" className="block w-full py-4 text-center bg-blue-600 text-white font-bold rounded hover:bg-blue-500 transition-colors uppercase tracking-widest text-xs">
                Secure Pro Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ (Slate 900) */}
      <section className="py-32 px-6 bg-slate-900 border-y border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-12 text-center uppercase tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)} 
                  className="w-full text-left px-8 py-6 flex items-center justify-between focus:outline-none group"
                >
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-600 shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-8 text-sm text-slate-400 leading-relaxed transition-all duration-300 ${openFaq === index ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER (Slate 950) */}
      <footer className="w-full bg-slate-950 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="block mb-6 relative w-32 h-8">
              <Image src="/logo.png" alt="MyTraderDesk" fill className="object-contain object-left opacity-70 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed pr-4">
              Institutional-grade structural analysis and behavioral performance enforcement.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">The Blueprint</h4>
            <ul className="space-y-4">
              <li><Link href="/protocol/identity" className="text-sm text-slate-400 hover:text-white transition-colors">Trader vs Operator</Link></li>
              <li><Link href="/protocol/strategy" className="text-sm text-slate-400 hover:text-white transition-colors">Strategy Simplification</Link></li>
              <li><Link href="/protocol/system" className="text-sm text-slate-400 hover:text-white transition-colors">System Building</Link></li>
              <li><Link href="/protocol/routine" className="text-sm text-slate-400 hover:text-white transition-colors">The 3-Level Routine</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Live Markets</h4>
            <ul className="space-y-4">
              <li><Link href="/analysis/eurusd" className="text-sm text-slate-400 hover:text-white transition-colors">EUR/USD Analysis</Link></li>
              <li><Link href="/analysis/xauusd" className="text-sm text-slate-400 hover:text-white transition-colors">Gold (XAUUSD)</Link></li>
              <li><Link href="/analysis/btcusd" className="text-sm text-slate-400 hover:text-white transition-colors">Bitcoin (BTC)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/playbook" className="text-sm text-slate-400 hover:text-white transition-colors">The Playbook</Link></li>
              <li><Link href="/faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-slate-400 hover:text-white transition-colors">Risk Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Sentinel Vortex. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Trading involves significant risk of loss.
          </p>
        </div>
      </footer>
    </div>
  )
}
