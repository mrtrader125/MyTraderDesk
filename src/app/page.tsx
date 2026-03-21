'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, CheckCircle2, Shield } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    fetchAnalyses()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Fetch delayed charts (7 days old)
  const fetchAnalyses = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .lte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) throw error

      setAnalyses(data || [])
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black text-xl uppercase">MY TRADER DESK</div>
          <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full">
            Get Instant Access
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black leading-tight">
          Stop Second Guessing.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Execute With Clarity.
          </span>
        </h1>

        <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto">
          You already know how to trade. The problem is trusting your decisions.
        </p>

        <div className="mt-10">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold">
            Start Trading With Clarity
          </Link>
        </div>
      </section>

      {/* PROOF SECTION */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-6">Real Analysis (7+ Days Old)</h2>
        <p className="text-center text-slate-500 mb-12">
          Showing past analysis — real thinking, not signals.
        </p>

        {loading ? (
          <p className="text-center text-slate-400">Loading analysis...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {analyses.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl border shadow-sm">

                <img
                  src={item.image_url}
                  alt="chart"
                  className="rounded mb-4 w-full h-52 object-cover"
                />

                <p className="text-xs text-slate-500 mb-1">
                  {new Date(item.created_at).toDateString()}
                </p>

                <p className="font-bold mb-1">{item.bias}</p>

                <p className="text-sm text-slate-600">
                  {item.description}
                </p>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* SOLUTION */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-16">Why This Works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border">
            <Brain className="mb-4 text-blue-600" />
            <h3 className="font-bold mb-2">Perspective</h3>
            <p className="text-slate-600">Understand market bias clearly.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border">
            <CheckCircle2 className="mb-4 text-green-600" />
            <h3 className="font-bold mb-2">Validation</h3>
            <p className="text-slate-600">Confirm your trade ideas.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border">
            <Shield className="mb-4 text-indigo-600" />
            <h3 className="font-bold mb-2">Control</h3>
            <p className="text-slate-600">Reduce risk when uncertain.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white text-center py-28 px-6">
        <h2 className="text-5xl font-black mb-6">Stop Guessing Your Trades</h2>
        <Link href="/signup" className="px-10 py-5 bg-blue-600 rounded-full font-bold">
          Get Access
        </Link>
      </section>

    </div>
  )
}
