'use client'

import Link from 'next/link'
import { Activity, Clock, Zap, Shield, TrendingUp, TrendingDown, Eye, Lock, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-[#050505] text-neutral-200 pt-32 pb-12 px-6 font-sans relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-6 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Activity className="text-blue-500" /> The Live Floor
            </h1>
            <p className="text-neutral-500 mt-2 text-sm font-bold uppercase tracking-widest">
              Live Feed • Active Setups • Institutional Intelligence
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Market Open</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: THE LOCKED TERMINAL */}
          <div className="lg:col-span-2 space-y-8">
            {mockPosts.map((post) => (
              <div key={post.id} className="bg-[#0a0a0a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl relative group">
                
                {/* BLUR OVERLAY & CALL TO ACTION */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-[8px] transition-all duration-500 p-6 text-center">
                  <div className="bg-white/10 p-4 rounded-full mb-6 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Active {post.tier} Setup</h3>
                  <p className="text-neutral-300 max-w-md mx-auto mb-8 leading-relaxed">
                    This execution logic is currently playing out live. Join the desk to reveal the ticker, structural analysis, and community bias.
                  </p>
                  <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                    Unlock The Floor <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="mt-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Over {post.votes} operators have already voted
                  </p>
                </div>

                {/* FAKE BACKGROUND CONTENT (Visually appealing but useless) */}
                <div className="opacity-40 select-none pointer-events-none blur-[2px]">
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-[#0d0d0d]">
                    <div className="flex items-center gap-3">
                      <span className="px-6 py-3 bg-neutral-800 rounded-lg animate-pulse w-24"></span>
                      <span className="px-4 py-3 bg-neutral-800 rounded-md animate-pulse w-12"></span>
                    </div>
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> {post.time}
                    </span>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="w-full h-[400px] border-b border-neutral-900 bg-[#111] flex items-center justify-center">
                    <Activity className="w-20 h-20 text-neutral-800 animate-pulse" />
                  </div>

                  {/* Thesis Placeholder */}
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-neutral-800 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-neutral-800 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-neutral-800 rounded w-4/6 animate-pulse"></div>
                  </div>

                  {/* Voting Mock */}
                  <div className="p-6 bg-[#050505] border-t border-neutral-900 grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800">
                      <TrendingUp className="text-neutral-700 mb-2" size={20} />
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800">
                      <TrendingDown className="text-neutral-700 mb-2" size={20} />
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-800">
                      <Eye className="text-neutral-700 mb-2" size={20} />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: LOCKED LIVE SQUAWK */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-3xl border border-neutral-800 overflow-hidden flex flex-col h-[700px] relative">
              
              {/* BLUR OVERLAY */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/70 backdrop-blur-[6px] p-6 text-center mt-16">
                 <Lock className="w-6 h-6 text-neutral-500 mb-4" />
                 <h3 className="text-lg font-black text-white mb-2 tracking-tight">Squawk Encrypted</h3>
                 <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                   Live market updates, alerts, and trade management are reserved for active operators.
                 </p>
                 <Link href="/signup" className="px-6 py-3 bg-[#111] border border-neutral-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-colors w-full">
                   Log In To Connect
                 </Link>
              </div>

              <div className="p-5 border-b border-neutral-900 bg-[#0d0d0d] flex items-center gap-3 shrink-0 relative z-30">
                <Zap className="text-amber-500 w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Squawk</h3>
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>

              <div className="flex-1 p-5 space-y-8 opacity-30 select-none pointer-events-none blur-[2px] overflow-hidden">
                {mockSquawks.map((squawk, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-neutral-800">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-neutral-700"></div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
                        {squawk.time}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-neutral-900 text-neutral-500 rounded font-black uppercase tracking-widest">
                        {squawk.tag}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: squawk.lines }).map((_, j) => (
                        <div key={j} className={`h-3 bg-neutral-800 rounded animate-pulse ${j === squawk.lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-neutral-900 bg-[#050505] shrink-0 text-center relative z-30">
                 <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-2">
                   <Shield size={12}/> Connection Secured
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
