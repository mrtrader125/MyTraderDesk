import { Metadata } from 'next'
import MarketsClient from './MarketsClient'

export const metadata: Metadata = { title: 'Markets | MyTraderDesk' }

export default function MarketsPage() {
  return <MarketsClient /> // 100% Static. 0ms load.
}
