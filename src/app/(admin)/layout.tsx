'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { BarChart3, Users, ArrowLeft, LayoutDashboard, Megaphone, Lock } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.app_metadata?.role
      
      if (role !== 'admin') {
        router.push('/dashboard')
      } else {
        setIsAdmin(true)
      }
    }
    checkAdmin()
  }, [router])

  if (isAdmin === null) return (
    <div className="h-screen bg-[#020203] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Lock className="text-red-500" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Authenticating Terminal...</span>
      </div>
    </div>
  )

  const adminNav = [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Admin Analysis', href: '/admin/markets', icon: BarChart3 },
    { name: 'Admin Users', href: '/admin/users', icon: Users },
    { name: 'Broadcasts', href: '/admin/notifications', icon: Megaphone },
  ]

  return (
    <div className="min-h-screen bg-[#020203] text-white flex">
      <aside className="w-72 bg-app-bg transition-colors duration-700 border-r border-red-900/20 flex-shrink-0 flex flex-col">
        <div className="p-10 pt-12">
          <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">MY TRADER <br/> <span className="text-red-600">ADMIN</span></h1>
        </div>
        <nav className="flex-1 px-6 space-y-2 mt-8">
          {adminNav.map((item) => (
            <Link key={item.name} href={item.href} className={`flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all border ${pathname === item.href ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'border-transparent text-neutral-600 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={20} />
              <span className="text-xs uppercase tracking-widest font-black">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-8 border-t border-card-border transition-colors duration-700">
          <Link href="/dashboard" className="text-xs font-bold text-blue-500 flex items-center gap-2 transition-all hover:gap-3">
            <ArrowLeft size={14}/> Exit to Desk
          </Link>
        </div>
      </aside>
      <main className="flex-1 h-screen overflow-y-auto p-12">{children}</main>
    </div>
  )
}

