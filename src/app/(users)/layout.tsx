import SideNav from '@/components/dashboard/SideNav'
import TopNav from '@/components/dashboard/TopNav'
import PresenceHeartbeat from '@/components/dashboard/PresenceHeartbeat'
import AssistantWidget from '@/components/dashboard/AssistantWidget'
import SystemGuard from '@/components/dashboard/SystemGuard'

import { getUserProfile } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getUserProfile()

  const userPlan = profile?.plan?.toLowerCase() || 'free'

  return (
    <div
      data-theme={userPlan}
      className="bg-[#050505] text-white font-sans min-h-screen relative selection:bg-blue-500/30"
    >
      <PresenceHeartbeat user={user} />

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

      <SystemGuard>
        <div className="flex h-screen w-full relative z-10">
          <SideNav />

          <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
            <TopNav user={user} />

            <main className="flex-1 overflow-y-auto scrollbar-hide">
              {children}
            </main>
          </div>
        </div>

        <AssistantWidget />
      </SystemGuard>
    </div>
  )
}
