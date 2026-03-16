'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Bell, User, LayoutDashboard, LineChart, 
  Bookmark, Award, Settings, LogOut, Menu, 
  Lock, Activity, ChevronRight, Zap
} from 'lucide-react'

// --- DUMMY DATA FOR UI TESTING ---
const MOCK_SETUPS = [
  { id: 1, asset: 'XAUUSD', market: 'Gold', timeframe: 'H4', bias: 'Bullish', status: 'Active' },
  { id: 2, asset: 'EURUSD', market: 'Forex', timeframe: 'H1', bias: 'Bearish', status: 'Active' },
  { id: 3, asset: 'GBPUSD', market: 'Forex', timeframe: '15m', bias: 'Neutral', status: 'Pending' },
]

export default function OperatorTerminal() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  
  // Simulated user plan (Change this to 'free', 'essential', or 'pro' to test the UI locks)
  const [userPlan, setUserPlan] = useState('essential') 

  // Filter definitions with tier requirements
  const FILTERS = [
    { name: 'All', req: 'free' },
    { name: 'Forex', req: 'free' },
    { name: 'Gold', req: 'essential' },
    { name: 'Crypto', req: 'pro' },
    { name: 'Indices', req: 'pro' },
    { name: 'Stocks', req: 'pro' }
  ]

  // Helper to check if a filter is locked for the current user
  const isLocked = (reqTier: string) => {
    if (userPlan === 'pro') return false
    if (userPlan === 'essential' && reqTier === 'pro') return true
    if (userPlan === 'free' && reqTier !== 'free') return true
    return false
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-neutral-800 bg-[#0a0a0a] flex flex-col`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-800 justify-between">
          {isSidebarOpen && <span className="font-black italic tracking-tighter text-xl uppercase">Sentinel <span className="text-red-600">Vortex</span></span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" isOpen={isSidebarOpen} active />
          <NavItem icon={LineChart} label="Markets" isOpen={isSidebarOpen} />
          <NavItem icon={Bookmark} label="The Vault" isOpen={isSidebarOpen} />
          <NavItem icon={Award} label="Performance" isOpen={isSidebarOpen} />
          <NavItem icon={Settings} label="Account" isOpen={isSidebarOpen} />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-neutral-800">
          <button className="flex items-center w-full p-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 font-bold text-sm uppercase tracking-widest">Disconnect</span>}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 border-b border-neutral-800 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-96 focus-within:border-neutral-600 transition-colors">
            <Search size={16} className="text-neutral-500 mr-3" />
            <input type="text" placeholder="Search instruments (e.g., XAUUSD)..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-neutral-500" />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors">
              <User size={16} className="text-neutral-400" />
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* SLIM BROADCAST TICKER */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center px-4 text-blue-400 text-sm font-bold">
            <Activity size={16} className="mr-3 animate-pulse" />
            <span className="uppercase tracking-widest text-[10px] mr-3 bg-blue-500/20 px-2 py-1 rounded">System Broadcast</span>
            High impact news (NFP) incoming. Adjust stops to break-even on active USD pairs.
          </div>

          {/* TOP METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard label="Intelligence Deployed" value="12" subtext="In the last 24 hours" icon={Zap} />
            
            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Clearance</div>
                <div className={`text-2xl font-black uppercase tracking-tighter ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
                  {userPlan} Tier
                </div>
                {userPlan !== 'pro' && (
                  <button className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-colors">
                    Upgrade Access
                  </button>
                )}
              </div>
            </div>

            <MetricCard label="Market Status" value="NY Session" subtext="High Volatility Expected" icon={LineChart} />
          </div>

          {/* FEED FILTERS */}
          <div className="border-b border-neutral-800 pb-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {FILTERS.map(f => {
                const locked = isLocked(f.req)
                return (
                  <button 
                    key={f.name}
                    onClick={() => !locked && setActiveFilter(f.name)}
                    className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
                      ${activeFilter === f.name 
                        ? 'bg-white text-black' 
                        : locked 
                          ? 'bg-transparent text-neutral-600 cursor-not-allowed hover:bg-neutral-900 border border-transparent' 
                          : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'}`}
                  >
                    {locked && <Lock size={12} className="mr-2 text-yellow-500" />}
                    {f.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* INTELLIGENCE GRID */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Latest Deployments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_SETUPS.map(setup => (
                <div key={setup.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 hover:border-neutral-600 transition-colors cursor-pointer group flex flex-col">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-white tracking-tighter">{setup.asset}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{setup.market}</span>
                    </div>
                    <button className="text-neutral-600 hover:text-white transition-colors">
                      <Bookmark size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-1">Timeframe</div>
                      <div className="text-sm font-bold text-neutral-300">{setup.timeframe}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-1">Bias</div>
                      <div className={`text-sm font-bold ${setup.bias === 'Bullish' ? 'text-emerald-500' : setup.bias === 'Bearish' ? 'text-red-500' : 'text-neutral-400'}`}>
                        {setup.bias}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center text-green-500 uppercase tracking-widest text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                      {setup.status}
                    </span>
                    <span className="text-neutral-500 group-hover:text-white transition-colors flex items-center">
                      View Data <ChevronRight size={14} className="ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

// Helper components for clean code
function NavItem({ icon: Icon, label, isOpen, active = false }: any) {
  return (
    <button className={`flex items-center w-full p-3 rounded-xl transition-colors
      ${active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
      <Icon size={20} />
      {isOpen && <span className="ml-3 font-bold text-sm uppercase tracking-widest">{label}</span>}
    </button>
  )
}

function MetricCard({ label, value, subtext, icon: Icon }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</div>
        <Icon size={16} className="text-neutral-600 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
        <div className="text-xs text-neutral-500 font-medium">{subtext}</div>
      </div>
    </div>
  )
}
