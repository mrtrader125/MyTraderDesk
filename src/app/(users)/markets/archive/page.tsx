import { Metadata } from 'next'
import ArchiveClient from './ArchiveClient'

export const metadata: Metadata = { title: 'Archive | MyTraderDesk' }

export default function ArchivePage() {
  return <ArchiveClient /> // 100% Static. 0ms load.
}
