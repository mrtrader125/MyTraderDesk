import { Metadata } from 'next'
import ViewportClient from './ViewportClient'

export const metadata: Metadata = { title: 'Viewport | MyTraderDesk' }

export default function ViewportPage() {
  return <ViewportClient /> // 100% Static. 0ms load.
}
