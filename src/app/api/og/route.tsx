// src/app/api/og/route.tsx
// Generates dynamic 1200×630 Open Graph images for every page.
// Usage: /api/og?title=Your+Page+Title&sub=Optional+subtitle&tag=Prop+Firm
//
// next/og uses @vercel/og under the hood — zero extra dependencies needed.

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get('title') ?? 'The Operating System for Serious Traders'
  const sub   = searchParams.get('sub')   ?? 'Build consistency through structure, not willpower.'
  const tag   = searchParams.get('tag')   ?? 'Trader OS'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #3b82f6 0%, transparent 60%)',
          display: 'flex',
        }} />

        {/* Grid texture lines */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px)',
          display: 'flex',
        }} />

        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '6px',
            background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '2px', display: 'flex' }} />
          </div>
          <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', letterSpacing: '0.05em' }}>
            MYTRADERDESK
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
          {/* Tag pill */}
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: '4px', padding: '4px 12px',
          }}>
            <span style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {tag}
            </span>
          </div>

          {/* Title */}
          <div style={{
            color: '#ffffff', fontSize: title.length > 50 ? '42px' : '52px',
            fontWeight: '700', lineHeight: 1.15, maxWidth: '900px',
          }}>
            {title}
          </div>

          {/* Subtitle */}
          <div style={{ color: '#9ca3af', fontSize: '22px', fontWeight: '400', maxWidth: '800px', lineHeight: 1.5 }}>
            {sub}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <span style={{ color: '#4b5563', fontSize: '14px', letterSpacing: '0.05em' }}>
            www.mytraderdesk.com
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Structure', 'Execution', 'Discipline'].map(word => (
              <div key={word} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px', padding: '4px 10px',
              }}>
                <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em' }}>
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
