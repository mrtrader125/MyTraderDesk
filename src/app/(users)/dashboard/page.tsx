// src/app/app/(users)/dashboard/page.tsx
import { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard | MyTraderDesk',
}

// 🚨 NO SUPABASE. NO COOKIES. NO ASYNC/AWAIT.
// This makes the page 100% Static. Next.js will route to it in 0.00ms.
export default function DashboardPage() {
  return <DashboardClient />
}
