'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, CreditCard, Shield, Settings, Key, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ACCOUNT_LINKS = [
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Subscription', href: '/account/subscription', icon: Shield },
  { name: 'Billing', href: '/account/billing', icon: CreditCard },
  { name: 'Security', href: '/account/security', icon: Key },
  { name: 'Settings', href: '/account/settings', icon: Settings },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden">
      
      {/* ACCOUNT HEADER */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-800">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Account <span className="text-neutral-500">Center</span></h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Manage Identity, Billing, and Preferences</p>
        </div>
        
        {/* Global Disconnect Button */}
        <button 
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-red-500/10 hover:text-red-500 text-neutral-400 border border-neutral-800 hover:border-red-500/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Disconnect</span>
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* INNER LEFT SIDEBAR (Secondary Navigation) */}
        <nav className="w-full md:w-56 lg:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide pb-4 md:pb-0">
          {ACCOUNT_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.icon
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${
                  isActive 
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-100' 
                    : 'text-neutral-500 hover:text-white hover:bg-[#0a0a0a]'
                }`}
              >
                <Icon size={14} className="mr-3 shrink-0" />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* RIGHT CONTENT AREA (Dynamically renders the pages) */}
        <div className="flex-1 min-w-0 w-full animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
        
      </div>
    </div>
  )
}