'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, Info, Megaphone, ClipboardList, ExternalLink, X } from 'lucide-react'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    fetchNotifications()

    // Realtime Listener
    const channel = supabase
      .channel('live-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        payload => {
          setNotifications(prev => [payload.new, ...prev])
          setHasNew(true)
        }
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchNotifications() {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5)
    
    if (data) {
      setNotifications(data)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); setHasNew(false) }}
        className={`relative p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
      >
        <Bell size={20} />
        {hasNew && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#000000] animate-pulse" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-[#000000] border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-[#000000]">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Notifications</span>
              {hasNew && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[8px] font-black uppercase tracking-widest">New</span>}
            </div>
            
            <div className="max-h-[350px] overflow-y-auto scrollbar-hide bg-[#000000]">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start space-x-3 mb-1">
                      <div className="mt-0.5 shrink-0">
                        {n.urgency === 'CRITICAL' ? <Megaphone size={14} className="text-red-500" /> : 
                         n.urgency === 'WARNING' ? <Info size={14} className="text-amber-500" /> : 
                         <Info size={14} className="text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-black text-white block truncate mb-1">{n.title}</span>
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">{n.message}</p>
                        {n.link && (
                          <a href={n.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-[9px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors">
                            View Details <ExternalLink size={10} className="ml-1.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Bell size={24} className="text-neutral-700 mb-3" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">You're all caught up.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
