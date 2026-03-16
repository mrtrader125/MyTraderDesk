'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LayoutDashboard, LineChart, Settings, LogOut, UserCircle, ShieldCheck, Users, Megaphone, PlusCircle, ArrowLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SideNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false) // HYDRATION SAFETY

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdminPath = pathname?.startsWith('/admin')

  if (pathname?.includes('/viewport')) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="w-20 md:w-64 border-r border-card-border bg-card-bg flex flex-col h-full relative z-20 transition-colors duration-700">

      {/* ADAPTIVE BRANDING */}
      <div className="h-24 flex items-center justify-center md:justify-start md:px-8 border-b border-card-border transition-colors duration-700">
        <Link href="/dashboard" className="flex flex-col group">
          <div className="flex items-center gap-2">
            <div className={`text-[30px] font-black leading-none tracking-tighter transition-colors duration-500 ${isAdminPath ? 'text-white' : 'text-brand-primary drop-shadow-brand-glow'}`}>
              MY
            </div>
            <div className="hidden md:flex flex-col justify-center leading-none">
              <span className="text-[12px] font-black text-white tracking-widest mb-0.5">TRADER</span>
              <span className={`text-[12px] font-black tracking-widest transition-colors ${isAdminPath ? 'text-red-600' : 'text-neutral-500'}`}>
                {isAdminPath ? 'ADMIN' : 'DESK'}
              </span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">

        {/* SECTION: MAIN TERMINAL */}
        <div className="space-y-1">
          <p className="hidden md:block text-[9px] font-black text-neutral-600 px-4 mb-3 tracking-[0.3em]">
            {isAdminPath ? 'SYSTEM NAVIGATION' : 'MAIN TERMINAL'}
          </p>

          <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={mounted && pathname === '/dashboard'} />
          <NavLink href="/analysis" icon={LineChart} label="Analysis" active={mounted && pathname?.startsWith('/analysis')} />
          <NavLink href="/settings" icon={Settings} label="Settings" active={mounted && pathname?.startsWith('/settings')} />
        </div>

        {/* SECTION: ADMIN CONTROL */}
        {mounted && isAdminPath && (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <p className="hidden md:block text-[9px] font-black text-red-500/60 px-4 mb-3 tracking-[0.3em]">COMMAND CENTER</p>

            <NavLink href="/admin" icon={ShieldCheck} label="Overview" active={pathname === '/admin'} isSystemAdmin />
            <NavLink href="/admin/users" icon={Users} label="Users" active={pathname === '/admin/users'} isSystemAdmin />
            <NavLink href="/admin/notifications" icon={Megaphone} label="Broadcasts" active={pathname === '/admin/notifications'} isSystemAdmin />
            <NavLink href="/admin/analysis/new" icon={PlusCircle} label="Add Signal" active={pathname === '/admin/analysis/new'} isSystemAdmin />
          </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-4 mt-auto border-t border-card-border space-y-1 bg-black/20 transition-colors duration-700">
        {mounted && isAdminPath && (
          <Link href="/dashboard" className="flex items-center space-x-4 px-4 py-3 text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all group mb-2">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:block font-bold text-[10px] uppercase tracking-widest italic">Exit to Desk</span>
          </Link>
        )}

        <NavLink href="/profile" icon={UserCircle} label="Profile" active={mounted && pathname === '/profile'} />

        <button onClick={handleSignOut} className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-all group">
          <LogOut size={18} />
          <span className="hidden md:block font-bold text-[10px] uppercase tracking-widest italic">Disconnect</span>
        </button>
      </div>
    </div>
  )
}

function NavLink({ href, icon: Icon, label, active, isSystemAdmin = false }: any) {
  const activeStyles = isSystemAdmin
    ? 'bg-red-600/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
    : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-brand-glow';

  return (
    <Link href={href} className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl border border-transparent transition-all duration-500 group ${
      active ? activeStyles : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.03]'
    }`}>
      <Icon size={18} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
      <span className="hidden md:block font-bold text-[10px] uppercase tracking-[0.2em] italic">
        {label}
      </span>
    </Link>
  )
}
