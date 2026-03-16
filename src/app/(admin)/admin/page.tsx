'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Star, Zap, ShieldCheck, Loader2, AlertCircle, Mail, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]) // Store the actual user list
  const [stats, setStats] = useState({
    total: 0, free: 0, pro: 0, premium: 0, loading: true
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*') // Get everything
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          setUsers(data)
          const total = data.length
          const free = data.filter(u => !u.plan_type || u.plan_type === 'free').length
          const pro = data.filter(u => u.plan_type === 'pro').length
          const premium = data.filter(u => u.plan_type === 'premium').length
          setStats({ total, free, pro, premium, loading: false })
        }
      } catch (err: any) {
        setErrorMsg(err.message)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchData()
  }, [])

  if (stats.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs text-center">
          Synchronizing Core Database...<br/>Connecting to My Trader Desk
        </span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Command <span className="text-red-600">Center</span>
        </h2>
        <p className="text-neutral-500 mt-2 font-medium italic">Live Metrics // User Management</p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
          <AlertCircle size={16} />
          Error: {errorMsg}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Operators" value={stats.total} color="text-white" icon={Users} />
        <StatCard label="Free Tier" value={stats.free} color="text-neutral-400" icon={Zap} />
        <StatCard label="Pro Members" value={stats.pro} color="text-blue-500" icon={Zap} />
        <StatCard label="Premium Elite" value={stats.premium} color="text-red-500" icon={Star} />
      </div>

      {/* User Table Section */}
      <div className="bg-app-bg border border-card-border p-8 rounded-[32px] shadow-2xl">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Users size={16} className="mr-2 text-red-600" /> Operator Directory
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border text-neutral-500 text-[10px] uppercase font-black tracking-widest">
                <th className="pb-4 px-2">User / Email</th>
                <th className="pb-4 px-2">Plan</th>
                <th className="pb-4 px-2">Joined</th>
                <th className="pb-4 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{user.full_name || 'Unnamed Operator'}</span>
                      <span className="text-xs text-neutral-500">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                      user.plan_type === 'premium' ? 'border-red-500 text-red-500 bg-red-500/5' : 
                      user.plan_type === 'pro' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 
                      'border-neutral-700 text-neutral-500'
                    }`}>
                      {user.plan_type || 'FREE'}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-xs text-neutral-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-neutral-600 italic text-sm">No operators detected in database.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className="bg-app-bg border border-card-border p-8 rounded-[32px] shadow-2xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
      <div className="relative z-10">
        <Icon size={24} className={`${color} mb-4`} />
        <div className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-4xl font-black text-white tracking-tighter">{value.toLocaleString()}</div>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all"></div>
    </div>
  )
}
