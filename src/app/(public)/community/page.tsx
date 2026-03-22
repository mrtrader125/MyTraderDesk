import { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, Users, BarChart2, Lock, ArrowRight, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Live Trading Floor & Sentiment | MyTraderDesk',
  description: 'See exactly what thousands of intermediate and professional traders are analyzing right now. Crowdsourced market confluence.',
}

const TRENDING_DISCUSSIONS = [
  { symbol: 'XAUUSD', votes: 1245, comments: 342, status: 'Highly Active' },
  { symbol: 'EURUSD', votes: 892, comments: 156, status: 'Active' },
  { symbol: 'BTCUSD', votes: 754, comments: 210, status: 'Volatile' },
  { symbol: 'GBPUSD', votes: 412, comments: 89, status: 'Active' },
]

export default function PublicCommunityTeaser() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Trading Floor</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Crowdsourced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Confluence</span>
          </h1>
          <p className="text-neutral-400 text-sm font-medium leading-relaxed">
            See exactly what thousands of other intermediate and professional traders are looking at right now. Stop trading in isolation.
          </p>
        </div>

        {/* Trending Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {TRENDING_DISCUSSIONS.map((market, idx) => (
            <div key={idx} className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 flex flex-col hover:border-neutral-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">{market.symbol}</h3>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center mt-1">
                    <ShieldCheck size={10} className="mr-1" /> {market.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-neutral-400 text-[10px] font-bold uppercase tracking-widest justify-end mb-1">
                    <BarChart2 size={12} className="mr-1" /> {market.votes} Votes
                  </div>
                  <div className="flex items-center text-neutral-500 text-[10px] font-bold uppercase tracking-widest justify-end">
                    <MessageSquare size={12} className="mr-1" /> {market.comments} POVs
                  </div>
                </div>
              </div>

              {/* Fake Progress Bar to simulate Sentiment */}
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden mb-4 border border-neutral-800 flex">
                <div className="h-full bg-neutral-700 w-[60%] border-r border-neutral-900"></div>
                <div className="h-full bg-neutral-800 w-[40%]"></div>
              </div>

              <Link 
                href="/signup"
                className="w-full mt-auto py-3 bg-[#050505] border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center justify-center hover:bg-white hover:text-black transition-all group"
              >
                <Lock size={12} className="mr-2 group-hover:hidden" />
                <span className="group-hover:hidden">Unlock Sentiment Data</span>
                <span className="hidden group-hover:block">Join Floor to View</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Global CTA */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-[2rem] p-10 text-center relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 relative z-10">Don't be the last to know the bias.</h2>
          <p className="text-xs font-medium text-neutral-400 max-w-lg mx-auto mb-8 relative z-10">
            Join the Sentinel Vortex community today and get full access to live discussion boards, interactive voting, and institutional-grade charting.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10"
          >
            Create Free Account <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

      </div>
    </div>
  )
}
