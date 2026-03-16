'use client'
import { useState, useEffect } from 'react'
import { Search, Users, ShieldCheck, CreditCard, MoreVertical, ShieldAlert } from 'lucide-react'
import { getAdminUsers } from './actions' // <-- Importing our new God Mode action

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      // Securely fetch all users via the server action
      const data = await getAdminUsers()
      setUsers(data || [])
      setLoading(false)
    }
    fetchUsers()
  }, [])

  // Safely filter based on available fields
  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="h-[80vh] flex items-center justify-center text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing_Operator_Database...</div>

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-card-border transition-colors duration-700 pb-8">
        <div>
          <h1 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic mb-2">Admin_Control</h1>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">User Registry</h2>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operator ID or email..."
            className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-3xl p-6 flex items-center space-x-6">
          <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-500"><Users size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Total Operators</p>
            <p className="text-3xl font-black text-white italic mt-1">{users.length}</p>
          </div>
        </div>
        <div className="bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-3xl p-6 flex items-center space-x-6">
          <div className="p-4 bg-purple-600/10 rounded-2xl border border-purple-500/20 text-purple-500"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Pro Subscribers</p>
            <p className="text-3xl font-black text-white italic mt-1">{users.filter(u => u.plan === 'PRO').length}</p>
          </div>
        </div>
        <div className="bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-3xl p-6 flex items-center space-x-6">
          <div className="p-4 bg-red-600/10 rounded-2xl border border-red-500/20 text-red-500"><ShieldAlert size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Suspended Accounts</p>
            <p className="text-3xl font-black text-white italic mt-1">{users.filter(u => u.status === 'SUSPENDED').length}</p>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10">
                <th className="p-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Operator Identity</th>
                <th className="p-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Access Tier</th>
                <th className="p-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Renewal Date</th>
                <th className="p-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const name = user.full_name || 'Unknown User'
                const plan = user.plan || 'BASIC'
                const status = user.status || 'ACTIVE'
                const renewal = user.renewal_date ? new Date(user.renewal_date).toLocaleDateString() : 'N/A'

                return (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-sm font-black text-neutral-400 italic shrink-0 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all uppercase">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                      plan === 'PRO' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-neutral-800 text-neutral-400 border-white/10'
                    }`}>
                      {plan}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{status}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-2 text-neutral-400">
                      <CreditCard size={14} className="opacity-50" />
                      <span className="text-xs font-mono">{renewal}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-neutral-600 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Users size={32} className="text-neutral-700 mb-4" />
              <p className="text-sm font-bold text-neutral-500">No operators found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
