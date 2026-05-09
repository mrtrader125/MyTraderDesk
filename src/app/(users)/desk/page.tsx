import { Metadata } from 'next'
import DeskClient from './DeskClient'

export const metadata: Metadata = {
  title: 'Operator Desk | MyTraderDesk',
}

// 🚨 NO SUPABASE. NO COOKIES. NO ASYNC/AWAIT.
// This makes the page 100% Static. Next.js will route to it in 0.00ms.
export default function DeskPage() {
  return <DeskClient />
}
