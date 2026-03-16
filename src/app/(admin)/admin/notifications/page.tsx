'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Trash2, Bell, AlertCircle } from 'lucide-react'

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', message: '', type: 'info', link: '' })
  const [status, setStatus] = useState({ loading: false, error: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    if (data) setNotifs(data)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setStatus({ loading: true, error: '' })

    const { error } = await supabase.from('notifications').insert([{
      title: form.title,
      message: form.message,
      type: form.type,
      link: form.link || null,
      is_active: true
    }])

    if (error) {
      setStatus({ loading: false, error: error.message })
    } else {
      setForm({ title: '', message: '', type: 'info', link: '' })
      setStatus({ loading: false, error: '' })
      load()
    }
  }

  async function remove(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">System Broadcasts</h1>
        <p className="text-neutral-500 text-xs font-bold tracking-widest mt-1">TRANSMIT LIVE ALERTS TO ALL USERS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={send} className="bg-app-bg transition-colors duration-700 p-6 rounded-2xl border border-red-900/20 space-y-4">
          <input 
            className="w-full bg-black border border-card-border transition-colors duration-700 p-3 rounded-xl text-xs font-bold text-white outline-none focus:border-red-600/50" 
            placeholder="ALARM TITLE" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            required 
          />
          <textarea 
            className="w-full bg-black border border-card-border transition-colors duration-700 p-3 rounded-xl text-xs font-bold text-white h-24 outline-none focus:border-red-600/50" 
            placeholder="BROADCAST MESSAGE..." 
            value={form.message} 
            onChange={e => setForm({...form, message: e.target.value})} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <select className="bg-black border border-card-border transition-colors duration-700 p-3 rounded-xl text-[10px] font-black text-white outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="info">INFO</option>
              <option value="update">UPDATE</option>
              <option value="survey">SURVEY</option>
            </select>
            <input className="bg-black border border-card-border transition-colors duration-700 p-3 rounded-xl text-[10px] font-bold text-white outline-none" placeholder="OPTIONAL LINK" value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
          </div>

          {status.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold">
              <AlertCircle size={14}/> {status.error}
            </div>
          )}

          <button disabled={status.loading} className="w-full bg-red-600 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-red-500 transition-all text-white flex items-center justify-center gap-2">
            {status.loading ? 'TRANSMITTING...' : 'INITIATE BROADCAST'}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Live History</h3>
          <div className="space-y-2">
            {notifs.map(n => (
              <div key={n.id} className="bg-white/[0.02] border border-card-border transition-colors duration-700 p-3 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Bell size={14}/></div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white">{n.title}</h4>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">{new Date(n.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 p-2 text-neutral-600 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

