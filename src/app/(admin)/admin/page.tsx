'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Star, Zap, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, free: 0, pro: 0, premium: 0, loading: true })

  const getRealData = async () => {
    const { data } = await supabase
      .from('profiles') // Make sure your table name matches exactly
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data)
      setStats({
        total: data.length,
        free: data.filter(u => u.plan === 'FREE' || !u.plan).length,
        essential: data.filter(u => u.plan === 'ESSENTIAL').length,
        pro: data.filter(u => u.plan === 'PRO').length,
        loading: false
      })
    }
  }

  useEffect(() => {
    getRealData()

    // This listens for any change (new user or plan upgrade) and refreshes the UI
    const subscription = supabase
      .channel('admin_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => getRealData())
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [])

  if (stats.loading) return <Loader2 className="animate-spin m-auto mt-20 text-red-600" size={40} />

  return (
    <div className="p-6 space-y-10">
      {/* 1. THE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={Users} color="text-white" />
        <StatCard label="Free" value={stats.free} icon={Zap} color="text-neutral-500" />
        <StatCard label="Essential" value={stats.essential} icon={Zap} color="text-blue-500" />
        <StatCard label="Pro" value={stats.pro} icon={Star} color="text-red-500" />
      </div>

      {/* 2. THE LIST */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-900 text-[10px] uppercase font-bold text-neutral-500">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Plan</th>
              <th className="p-4 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {users.map(u => (
              <tr key={u.id} className="text-sm">
                <td className="p-4 font-bold">{u.email}</td>
                <td className="p-4 uppercase text-[10px] font-black">{u.plan || 'free'}</td>
                <td className="p-4 text-right text-neutral-500">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl">
      <Icon size={20} className={`${color} mb-2`} />
      <div className="text-xs text-neutral-500 uppercase font-bold">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  )
}
