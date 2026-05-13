import { Metadata } from 'next'
import AccountNavigation from './AccountNavigation'

export const metadata: Metadata = {
  title: 'Account | MyTraderDesk',
}

// 🚨 Absolutely NO async/await or supabase calls here!
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] w-full bg-[#050505] overflow-hidden relative">
      <AccountNavigation />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 relative">
        <div className="max-w-[100rem] mx-auto w-full h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
