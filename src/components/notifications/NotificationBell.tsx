'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, Info, Megaphone, ClipboardList, ExternalLink } from 'lucide-react'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    fetchNotifications()

    // Realtime Listener with built-in debugging
    const channel = supabase
      .channel('live-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        payload => {
          console.log("🔥 REALTIME PAYLOAD RECEIVED:", payload)
          setNotifications(prev => [payload.new, ...prev])
          setHasNew(true)
        }
      ).subscribe((status) => {
        console.log("📡 REALTIME STATUS:", status)
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchNotifications() {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5)
    
    if (error) {
      console.error("❌ Error fetching notifications:", error.message)
    }
    
    if (data) {
      setNotifications(data)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); setHasNew(false) }}
        className="relative p-2 text-neutral-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-card-border transition-colors duration-700"
      >
        <Bell size={20} />
        {hasNew && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-[#030305] animate-pulse" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-card-bg transition-colors duration-700 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-card-border transition-colors duration-700 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">System Broadcasts</span>
              {hasNew && <span className="text-[10px] text-blue-500 font-bold">NEW</span>}
            </div>
            <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-card-border transition-colors duration-700 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                      {n.type === 'survey' ? <ClipboardList size={14} className="text-amber-500" /> : 
                       n.type === 'update' ? <Megaphone size={14} className="text-blue-500" /> : 
                       <Info size={14} className="text-emerald-500" />}
                      <span className="text-[13px] font-semibold text-white">{n.title}</span>
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">{n.message}</p>
                    {n.link && (
                      <a href={n.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        View Details <ExternalLink size={10} className="ml-1" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-600 text-xs italic">No messages at this time.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

