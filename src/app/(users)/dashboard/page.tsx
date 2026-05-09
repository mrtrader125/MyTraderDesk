// src/app/app/(users)/dashboard/page.tsx
import DashboardClient from './DashboardClient'

export const runtime = 'edge'

export default function DashboardPage() {
  // ZERO blocking database calls. Next.js renders this in 0ms.
  return <DashboardClient />
}
