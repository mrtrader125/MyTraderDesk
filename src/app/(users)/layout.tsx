import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import dynamic from 'next/dynamic'

import SideNav from '@/components/dashboard/SideNav'
import TopNav from '@/components/dashboard/TopNav'

// 🚨 OPTIMIZATION: Dynamically import heavy global widgets and explicitly disable SSR.
// This prevents them from bloating the initial HTML payload and blocking hydration.
// They will load lazily only on the client after the visual shell is already interactive.
const AssistantWidget = dynamic(() => import('@/components/dashboard/AssistantWidget'), { ssr: false })
const PresenceHeartbeat = dynamic(() => import('@/components/dashboard/PresenceHeartbeat'), { ssr: false })
const LiveClockWidgets = dynamic(() => import('@/components/dashboard/LiveClockWidgets'), { ssr: false })
const BootSequence = dynamic(() => import('@/components/dashboard/BootSequence'), { ssr: false })
const NotificationBell = dynamic(() => import('@/components/dashboard/NotificationBell'), { ssr: false })

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

  // 🚨 OPTIMIZATION: This is the ONLY place we block rendering to check auth.
  // Child components will rely on props instead of making duplicate auth/profile queries.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=Unauthorized')
  }

  // FAST PLAN CHECK: Read from JWT metadata instead of hitting the DB.
  const userPlan = user.user_metadata?.plan?.toLowerCase() || 'free'

  // 🚨 OPTIMIZATION: Strip down the user object to the bare minimum before passing it 
  // to Client Components. Large Server-to-Client prop serialization causes lag.
  const minimalUser = {
    id: user.id,
    email: user.email,
    plan: userPlan,
    metadata: user.user_metadata
  }

  return (
    <div data-theme={userPlan} className="bg-[#050505] text-white font-sans min-h-screen relative selection:bg-blue-500/30">
      
      {/* Client-side boot animation doesn't block server rendering */}
      <BootSequence />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${userPlan === 'pro' ? 'bg-blue-600/5' : 'bg-neutral-500/5'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${userPlan === 'pro' ? 'bg-blue-600/5' : 'bg-neutral-500/5'}`} />
      </div>

      <div className="flex h-screen w-full relative z-10">
        
        {/* Pass minimal user down to prevent SideNav from making its own DB calls */}
        <SideNav user={minimalUser} />

        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          
          <TopNav user={minimalUser}>
             {/* If your TopNav is a Server Component that takes children, 
                 inject heavy client components here so the TopNav stays fast */}
             <LiveClockWidgets />
             <NotificationBell />
          </TopNav>
          
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {/* The child pages load instantly because the layout around them never unmounts */}
            {children}
          </main>
        </div>
      </div>

      {/* Heavy logic workers pushed to the very end of the tree */}
      <AssistantWidget />
      <PresenceHeartbeat userId={minimalUser.id} />
    </div>
  )
}
