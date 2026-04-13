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
  Radio,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  
  // Default to true, but we update it from localStorage before rendering
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // 🚨 1. Load persistent sidebar state instantly
    const savedState = localStorage.getItem('adminSidebarState')
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true')
    }

    // 2. Verify Admin
    async function verifyAdmin() {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.replace('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        router.replace('/dashboard') 
        return
      }

      setAdminEmail(user.email || 'Admin')
      setIsAuthorized(true) // UI renders after this, so no flashing!
    }
    
    verifyAdmin()
  }, [router])

  // 🚨 3. Safe toggle function that saves to localStorage
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('adminSidebarState', String(newState));
      return newState;
    });
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Publish Setup', path: '/admin/analysis', icon: Send },
    { name: 'Publish Playbook', path: '/admin/playbook/new', icon: BookOpen }, 
    { name: 'Manage Floor', path: '/admin/floor/new', icon: Activity }, 
    { name: 'User Directory', path: '/admin/users', icon: Users },
    { name: 'Broadcast', path: '/admin/notifications', icon: Radio },
    { name: 'System Logs', path: '/admin/logs', icon: Activity },
  ]

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="text-red-500 animate-pulse" size={40} />
        <span className="text-[10px] font-black tracking-[0.3em] text-neutral-500 uppercase">Authenticating...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <div 
        className={`bg-[#0a0a0a] border-r border-neutral-800 flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        
        {/* Branding & Toggle */}
        <div className={`h-16 flex items-center border-b border-neutral-800 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'px-6 justify-between' : 'px-0 justify-center'}`}>
          {isSidebarOpen && (
            <div className="flex items-center overflow-hidden">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse mr-3 shrink-0"></div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white whitespace-nowrap">ADMIN PORTAL</h1>
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className="text-neutral-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 shrink-0"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <div className={`flex-1 py-6 space-y-2 overflow-y-auto scrollbar-hide ${isSidebarOpen ? 'px-4' : 'px-3'}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path
            return (
              <button
                key={link.name}
                onClick={() => router.push(link.path)}
                title={!isSidebarOpen ? link.name : undefined}
                className={`w-full flex items-center rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-brand-primary text-black shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)]' 
                    : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                } ${isSidebarOpen ? 'px-4 py-3 justify-between' : 'py-3 justify-center'}`}
              >
                <div className="flex items-center">
                  <link.icon size={18} className={`${isActive ? 'text-black' : 'text-neutral-500 group-hover:text-neutral-300'} ${isSidebarOpen ? 'mr-3' : 'mr-0'}`} />
                  {isSidebarOpen && (
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      {link.name}
                    </span>
                  )}
                </div>
                {isSidebarOpen && isActive && <ChevronRight size={14} className="opacity-50 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Admin Footer */}
        <div className={`p-4 border-t border-neutral-800 shrink-0 flex flex-col ${!isSidebarOpen && 'items-center'}`}>
          {isSidebarOpen && (
            <div className="bg-[#050505] border border-neutral-800 rounded-xl p-3 mb-3 overflow-hidden">
              <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest block mb-1 whitespace-nowrap">Admin Account</span>
              <span className="text-xs font-bold text-neutral-300 truncate block">{adminEmail}</span>
            </div>
          )}
          <button 
            onClick={handleSignOut}
            title={!isSidebarOpen ? "Sign Out" : undefined}
            className={`flex items-center justify-center py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-colors ${
              isSidebarOpen ? 'w-full px-4 space-x-2' : 'w-12 h-12 px-0 space-x-0'
            }`}
          >
            <LogOut size={16} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505] relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/5 blur-[120px] pointer-events-none"></div>
        
        <main className="flex-1 overflow-y-auto scrollbar-hide p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
