import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import SideNav from '@/components/dashboard/SideNav'
import TopNav from '@/components/dashboard/TopNav'

import AssistantWidget from '@/components/dashboard/AssistantWidget'
import PresenceHeartbeat from '@/components/dashboard/PresenceHeartbeat'
import LiveClockWidgets from '@/components/dashboard/LiveClockWidgets'
import BootSequence from '@/components/dashboard/BootSequence'
import NotificationBell from '@/components/dashboard/NotificationBell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=Unauthorized')
  }

  const userPlan = user.user_metadata?.plan?.toLowerCase() || 'free'

  const minimalUser = {
    id: user.id,
    email: user.email,
    plan: userPlan,
    metadata: user.user_metadata,
  }

  return (
    <div
      data-theme={userPlan}
      className="bg-[#050505] text-white font-sans min-h-screen relative selection:bg-blue-500/30"
    >
      <BootSequence />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${
            userPlan === 'pro'
              ? 'bg-blue-600/5'
              : 'bg-neutral-500/5'
          }`}
        />

        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 ${
            userPlan === 'pro'
              ? 'bg-blue-600/5'
              : 'bg-neutral-500/5'
          }`}
        />
      </div>

      <div className="flex h-screen w-full relative z-10">
        <SideNav user={minimalUser} />

        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
          <TopNav user={minimalUser}>
            <LiveClockWidgets />
            <NotificationBell />
          </TopNav>

          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </div>
      </div>

      <AssistantWidget />
      <PresenceHeartbeat userId={minimalUser.id} />
    </div>
  )
}
