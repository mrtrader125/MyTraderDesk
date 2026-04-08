import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import SideNav from '@/components/dashboard/SideNav'
import TopNav from '@/components/dashboard/TopNav'
import PresenceHeartbeat from '@/components/dashboard/PresenceHeartbeat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } 
          catch (error) {}
        },
      },
    }
  )

  // 1. Get Session instantly from Edge
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/login?error=Unauthorized')
  }

  // 2. Fetch their plan exactly once on the server
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const userPlan = profile?.plan?.toLowerCase() || 'free'

  return (
    // 🚨 REMOVED ThemeWrapper: We now use strict Tailwind colors to guarantee the premium dark-mode look.
    // The data-theme attribute is kept just in case your globals.css still needs it for text highlights.
    <div data-theme={userPlan} className="bg-[#050505] text-white font-sans min-h-screen relative selection:bg-blue-500/30">
      <PresenceHeartbeat user={user} />

      {/* 🚨 UPDATED AMBIENT GLOW: Explicit blue glow for Pro, neutral glow for Free */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${userPlan === 'pro' ? 'bg-blue-600/5' : 'bg-neutral-500/5'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${userPlan === 'pro' ? 'bg-blue-600/5' : 'bg-neutral-500/5'}`} />
      </div>

      <div className="flex h-screen w-full relative z-10">
        <SideNav />

        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          <TopNav user={user} />
          
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
