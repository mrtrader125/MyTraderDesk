'use client'

import Link from 'next/link'
import { Activity, Clock, Zap, Shield, TrendingUp, TrendingDown, Eye, Lock, ArrowRight, Radio } from 'lucide-react'

export default function PublicTeaserFloor() {
  // Static mock data ensures your real analysis is never exposed to the public DOM
  const mockPosts = [
    {
      id: 1,
      tier: 'PRO',
      time: '12 mins ago',
      votes: 142
    },
    {
      id: 2,
      tier: 'ESSENTIAL',
      time: '2 hours ago',
      votes: 328
    }
  ]

  const mockSquawks = [
    { time: '10 mins ago', tag: 'Execution', lines: 2 },
    { time: '45 mins ago', tag: 'Alert', lines: 1 },
    { time: '1 hour ago', tag: 'Update', lines: 3 },
    { time: '3 hours ago', tag: 'News', lines: 2 },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pt-16 pb-12 px-4 md:px-6 font-sans relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- COMPACT PROFESSIONAL HEADER --- */}
        <div className="mb-5 pb-3 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <Activity className="text-blue-500 w-5 h-5" /> Live Floor
            </h1>
            <span className="hidden sm:inline-block w-[1px] h-4 bg-neutral-800"></span>
            <p className="hidden sm:block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Live Feed • Active Setups • Institutional Intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Market Open
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* --- LEFT COLUMN: THE LOCKED TERMINAL FEED --- */}
          <div className="lg:col-span-2 space-y-5">
            {mockPosts.map((post) => (
              <div key={post.id} className="bg-[#080808] rounded-xl border border-neutral-800 overflow-hidden shadow-xl relative group">
                
                {/* BLUR OVERLAY & CALL TO ACTION */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/70 backdrop-blur-[6px] transition-all duration-500 p-6 text-center">
                  <div className="bg-[#111] p-3 rounded-full mb-4 border border-neutral-700 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <Lock className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Active {post.tier} Setup</h3>
                  <p className="text-neutral-400 text-xs max-w-sm mx-auto mb-6 leading-relaxed font-medium">
                    This execution logic is currently playing out live. Join the desk to reveal the ticker, structural analysis, and community bias.
                  </p>
                  <Link href="/signup" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Unlock The Floor <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <p className="mt-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                    Over {post.votes} Traders have already voted
                  </p>
                </div>

                {/* FAKE BACKGROUND CONTENT (Compact Side-by-Side Layout) */}
                <div className="opacity-30 select-none pointer-events-none blur-[2px]">
                  
                  {/* Header */}
                  <div className="px-4 py-2.5 border-b border-neutral-900 flex justify-between items-center bg-[#0a0a0a]">
                    <div className="flex items-center gap-2">
                      <span className="px-5 py-2 bg-neutral-800 rounded animate-pulse w-20"></span>
                      <span className="px-3 py-2 bg-neutral-800 rounded animate-pulse w-10"></span>
                    </div>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={10} /> {post.time}
                    </span>
                  </div>

                  {/* Body Split */}
                  <div className="flex flex-col md:flex-row p-4 gap-5">
                    
                    {/* Left: Image & Thesis (60%) */}
                    <div className="w-full md:w-[60%] flex flex-col gap-3">
                      <div className="relative w-full aspect-video rounded-lg border border-neutral-800 bg-[#111] flex items-center justify-center">
                        <Activity className="w-8 h-8 text-neutral-800 animate-pulse" />
                      </div>
                      <div className="pl-3 border-l-2 border-neutral-800 space-y-2 py-1">
                        <div className="h-2.5 bg-neutral-800 rounded w-full animate-pulse"></div>
                        <div className="h-2.5 bg-neutral-800 rounded w-5/6 animate-pulse"></div>
                        <div className="h-2.5 bg-neutral-800 rounded w-4/6 animate-pulse"></div>
                      </div>
                    </div>

                    {/* Right: Voting Placeholder (40%) */}
                    <div className="w-full md:w-[40%] flex flex-col">
                      <div className="h-full bg-[#0d0d0d] rounded-lg border border-neutral-900 p-4 flex flex-col justify-center gap-2.5">
                        <div className="h-9 bg-[#111] rounded-md border border-neutral-800 flex items-center px-3">
                          <TrendingUp className="text-neutral-700 w-4 h-4 ml-auto" />
                        </div>
                        <div className="h-9 bg-[#111] rounded-md border border-neutral-800 flex items-center px-3">
                          <TrendingDown className="text-neutral-700 w-4 h-4 ml-auto" />
                        </div>
                        <div className="h-9 bg-[#111] rounded-md border border-neutral-800 flex items-center px-3">
                          <Eye className="text-neutral-700 w-4 h-4 ml-auto" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* --- RIGHT COLUMN: LOCKED LIVE SQUAWK --- */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 overflow-hidden flex flex-col h-[calc(100vh-80px)] sticky top-6 shadow-xl relative">
              
              {/* BLUR OVERLAY */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/70 backdrop-blur-[6px] p-5 text-center mt-12">
                 <Lock className="w-5 h-5 text-neutral-500 mb-3" />
                 <h3 className="text-sm font-black text-white mb-2 tracking-tight uppercase">Squawk Locked</h3>
                 <p className="text-[10px] text-neutral-400 mb-5 leading-relaxed font-medium">
                   Live market updates, alerts, and trade management are reserved for active traders.
                 </p>
                 <Link href="/signup" className="px-5 py-2.5 bg-[#111] border border-neutral-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-colors w-full">
                   Log In To Connect
                 </Link>
              </div>

              {/* Squawk Header */}
              <div className="px-4 py-3 border-b border-neutral-900 bg-[#0d0d0d] flex items-center gap-2 shrink-0 relative z-30">
                <Radio className="text-amber-500 w-3.5 h-3.5 animate-pulse" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Live Squawk</h3>
                <span className="ml-auto flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              </div>

              {/* Mock Squawk Content */}
              <div className="flex-1 p-4 space-y-6 opacity-30 select-none pointer-events-none blur-[2px] overflow-hidden">
                {mockSquawks.map((squawk, i) => (
                  <div key={i} className="relative pl-4 border-l border-neutral-800">
                    <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-neutral-700"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] text-neutral-600 font-bold tracking-widest uppercase">
                        {squawk.time}
                      </span>
                      <span className="text-[7px] px-1.5 py-0.5 bg-neutral-900 text-neutral-500 rounded font-black uppercase tracking-widest">
                        {squawk.tag}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {Array.from({ length: squawk.lines }).map((_, j) => (
                        <div key={j} className={`h-2 bg-neutral-800 rounded animate-pulse ${j === squawk.lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-2.5 border-t border-neutral-900 bg-[#050505] shrink-0 text-center relative z-30">
                 <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                   <Shield size={9}/> Connection Secured
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
