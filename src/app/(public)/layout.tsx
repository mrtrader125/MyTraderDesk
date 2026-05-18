import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s | MyTraderDesk",
    default: "MyTraderDesk | Institutional Execution & Trading Systems",
  },
  description:
    "A trader operating system built for execution discipline, consistency, psychology, and behavioral performance.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      {/* MINIMALIST GLOBAL NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-900 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
            MyTraderDesk
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="/protocol/system" className="hover:text-white transition-colors">System</Link>
            <Link href="/protocol/routine" className="hover:text-white transition-colors">Routine</Link>
            <Link href="/behavioral-journaling" className="hover:text-white transition-colors">Journaling</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-white px-4 py-2 border border-neutral-800 rounded-md hover:bg-neutral-900 transition-colors">
              Login
            </button>
            <button className="text-sm font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors">
              Apply
            </button>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT INJECTION */}
      <div className="flex-grow">
        {children}
      </div>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="border-t border-neutral-900 bg-[#080808] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-neutral-500 text-sm">
            <p>© {new Date().getFullYear()} MyTraderDesk. All rights reserved.</p>
            <p className="mt-1 text-xs">Built for disciplined operators.</p>
          </div>
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link href="/protocol/identity" className="hover:text-neutral-300 transition-colors">Identity</Link>
            <Link href="/trading-consistency" className="hover:text-neutral-300 transition-colors">Consistency</Link>
            <Link href="/trader-psychology" className="hover:text-neutral-300 transition-colors">Psychology</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
