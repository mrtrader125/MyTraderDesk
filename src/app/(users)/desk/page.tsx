import { Metadata } from 'next'
import DeskClient from './DeskClient'

// 🚨 Force Vercel to cache this page for 0ms loads
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Operator Desk | MyTraderDesk',
}

// 🚨 NO SUPABASE SERVER CALLS. 100% STATIC.
export default function DeskPage() {
  return <DeskClient />
}
