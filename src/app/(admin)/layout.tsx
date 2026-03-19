'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Activity, 
  LogOut, 
  ShieldAlert, 
  ChevronRight,
  Radio 
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      
      // STRICT SECURITY GATE: Must have the database admin role
      if (!user || user.app_metadata?.role !== 'admin') {
        router.replace('/dashboard')
        return
      }

      setAdminEmail(user.email || 'Admin')
      setIsAuthorized(true)
    }
    verifyAdmin()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Publish Setup', path: '/admin/analysis', icon: Send },
    { name: 'User Directory', path: '/admin/users', icon: Users },
    { name: 'Broadcast', path: '/admin/notifications', icon: Radio },
    { name: 'System Logs', path: '/admin/logs', icon: Activity },
  ]

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="text-red-500 animate-pulse" size={40} />
        <span className="text-[10px] font-black tracking-[0.3em] text-neutral-500 uppercase">Authenticating...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-20 shrink-0">
        
        {/* Branding */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse mr-3"></div>
          <h1 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white">ADMIN PORTAL</h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <button
                key={link.name}
                onClick={() => router.push(link.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-brand-primary text-black shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)]' 
                    : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-900 dark:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <link.icon size={16} className={isActive ? 'text-black' : 'text-neutral-500 group-hover:text-neutral-300'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </button>
            )
          })}
        </div>

        {/* Admin Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="bg-neutral-50 dark:bg-[#050505] border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 mb-3">
            <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest block mb-1">Admin Account</span>
            <span className="text-xs font-bold text-neutral-300 truncate block">{adminEmail}</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-neutral-50 dark:bg-[#050505] relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/5 blur-[120px] pointer-events-none"></div>
        
        <main className="flex-1 overflow-y-auto scrollbar-hide p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
