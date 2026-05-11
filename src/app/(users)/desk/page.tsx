import { Metadata } from 'next'
import DeskClient from './DeskClient'

export const metadata: Metadata = {
  title: 'Operator Desk | MyTraderDesk',
}

// 🚨 Removed the 'force-static' tag so it doesn't conflict with your layouts!
export default function DeskPage() {
  return <DeskClient />
}
