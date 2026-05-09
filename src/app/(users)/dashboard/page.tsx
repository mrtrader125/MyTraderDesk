// src/app/app/(users)/dashboard/page.tsx
import DashboardClient from './DashboardClient'

// Notice we removed all Supabase and Server calls. 
// This page now transitions in 0.00ms.
export default function DashboardPage() {
  return <DashboardClient />
}
