'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
// 👇 FIX: Added Bookmark, Clock, and all required icons here!
import { Search, Shield, Crown, Zap, Activity, ChevronRight, X, User, Clock, AlertTriangle, Target, BarChart2, Bookmark } from 'lucide-react'

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Deep-Dive Panel State
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userActivity, setUserActivity] = useState<any[]>([])
  const [userStats, setUserStats] = useState({ vaultCount: 0, searchCount: 0, paywallHits: 0 })
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      // Fetch all profiles (Requires the Admin SQL policy we discussed earlier!)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const handleUserClick = async (user: any) => {
    setSelectedUser(user)
    setLoadingDetails(true)
    
    try {
      // 1. Get their vault count
      const { count: vaultCount } = await supabase
        .from('user_vault')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // 2. Get their specific activity timeline
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) // Last 50 actions

      let searches = 0
      let paywalls = 0

      if (logs) {
        logs.forEach(log => {
          if (log.action === 'SEARCH') searches++
          if (log.action === 'PAYWALL_BUMP') paywalls++
        })
      }

      setUserStats({
        vaultCount: vaultCount || 0,
        searchCount: searches,
        paywallHits: paywalls
      })
      setUserActivity(logs || [])

    } catch (err) {
      console.error("Failed to load user details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Accessing Directory...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 relative">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Operator <span className="text-brand-primary">Directory</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Manage network access and monitor user telemetry</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input 
            type="text" 
            placeholder="Search operators..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* THE DIRECTORY TABLE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#050505]">
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Operator Identity</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Clearance Tier</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Network Entry</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <User className="mx-auto text-neutral-700 mb-4" size={32} />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No operators found matching query.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const plan = (user.plan || 'free').toLowerCase()
                  
                  return (
                    <tr 
                      key={user.id} 
                      onClick={() => handleUserClick(user)}
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-black text-neutral-400 group-hover:border-neutral-600 transition-colors">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{user.full_name || 'Unknown Operator'}</p>
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono mt-0.5">{user.id.split('-')[0]}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest
                          ${plan === 'pro' ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 
                            plan === 'essential' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 
                            'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                        >
                          {plan === 'pro' ? <Crown size={10} className="mr-1.5" /> : plan === 'essential' ? <Shield size={10} className="mr-1.5" /> : <Zap size={10} className="mr-1.5" />}
                          {plan}
                        </div>
                      </td>
                      <td className="p-5 text-xs font-bold text-neutral-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-right">
                        <button className="text-neutral-600 group-hover:text-brand-primary transition-colors flex items-center justify-end w-full">
                          <span className="text-[9px] font-black uppercase tracking-widest mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Inspect</span>
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEEP-DIVE SLIDE-OUT PANEL */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedUser(null)}></div>
          
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-neutral-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Panel Header */}
            <div className="p-6 border-b border-neutral-800 flex items-start justify-between bg-[#050505]">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedUser.full_name || 'Unknown Operator'}</h3>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">ID: {selectedUser.id}</span>
                  </div>
                </div>
                <div className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest
                  ${selectedUser.plan === 'pro' ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 
                    selectedUser.plan === 'essential' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 
                    'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                >
                  Clearance: {selectedUser.plan || 'Free'}
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-neutral-500 hover:text-white bg-neutral-900 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <Activity className="animate-pulse text-brand-primary" size={32} />
                <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[9px]">Decrypting Logs...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
                
                {/* Stats Grid */}
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Lifetime Telemetry</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 text-center">
                      <Bookmark className="mx-auto text-amber-500 mb-2" size={16} />
                      <span className="text-xl font-black text-white block">{userStats.vaultCount}</span>
                      <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Vaulted</span>
                    </div>
                    <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 text-center">
                      <Search className="mx-auto text-blue-500 mb-2" size={16} />
                      <span className="text-xl font-black text-white block">{userStats.searchCount}</span>
                      <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Searches</span>
                    </div>
                    <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4 text-center">
                      <AlertTriangle className={`mx-auto mb-2 ${userStats.paywallHits > 0 ? 'text-red-500' : 'text-neutral-600'}`} size={16} />
                      <span className="text-xl font-black text-white block">{userStats.paywallHits}</span>
                      <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Paywalls Hit</span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Operator Controls</h4>
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all text-center mb-3">
                    Copy Operator Email
                  </button>
                  <p className="text-[9px] font-bold text-neutral-600 text-center leading-relaxed">
                    Note: Billing cycle modifications and subscription cancellations must be performed directly in your Lemon Squeezy dashboard.
                  </p>
                </div>

                {/* Activity Feed */}
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2 flex items-center justify-between">
                    <span>Recent Actions</span>
                    <span className="text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded text-[8px]">LIVE</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {userActivity.length === 0 ? (
                      <p className="text-[10px] font-bold text-neutral-600 text-center py-4">No recent activity detected.</p>
                    ) : (
                      userActivity.map(log => {
                        let actionColor = "text-neutral-500"
                        let actionText = log.action
                        let Icon = Activity
                        
                        if (log.action === 'SEARCH') { actionColor = "text-white"; actionText = "Searched"; Icon = Search }
                        if (log.action === 'VIEW_CHART') { actionColor = "text-blue-500"; actionText = "Viewed"; Icon = Target }
                        if (log.action === 'PAYWALL_BUMP') { actionColor = "text-red-500"; actionText = "Hit Paywall"; Icon = AlertTriangle }
                        if (log.action === 'FILTER_CLICK') { actionColor = "text-neutral-400"; actionText = "Filtered"; Icon = BarChart2 }

                        return (
                          <div key={log.id} className="flex items-start space-x-3 p-3 bg-[#050505] rounded-xl border border-neutral-800/50">
                            <div className={`mt-0.5 p-1.5 rounded-md bg-neutral-900 ${actionColor}`}>
                              <Icon size={10} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                {actionText} <span className={`font-black ${actionColor}`}>{log.search_query || log.asset_symbol || log.timeframe}</span>
                              </p>
                              <p className="text-[8px] font-black text-neutral-600 mt-1 flex items-center">
                                <Clock size={8} className="mr-1 inline" />
                                {new Date(log.created_at).toLocaleDateString()} @ {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}
