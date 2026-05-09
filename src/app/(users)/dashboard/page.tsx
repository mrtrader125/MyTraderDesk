// src/app/app/(users)/dashboard/page.tsx
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  // ZERO blocking database calls. No Edge runtime.
  // Next.js serves this instantly.
  return <DashboardClient />
}
