import { Metadata } from 'next'
import DeskClient from './DeskClient'

export const metadata: Metadata = {
  title: 'Operator Desk | MyTraderDesk',
  description: 'Your daily execution and structural alignment workspace.',
}

export default function DeskPage() {
  return (
    <main className="w-full h-[calc(100vh-70px)] bg-[#030303] overflow-hidden">
      <DeskClient />
    </main>
  )
}
