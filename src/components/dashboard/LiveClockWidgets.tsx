'use client'

import React, {
  useState,
  useEffect,
  memo,
} from 'react'

import {
  Clock,
  Globe2,
  Type,
} from 'lucide-react'

// =========================================
// FONT STYLES
// =========================================
const fontStyles = [
  'font-mono font-black tracking-tighter text-zinc-100',
  'font-sans font-extrabold tracking-tight text-white',
  'font-serif font-light tracking-wide text-zinc-300',
  'font-sans font-thin tracking-widest text-zinc-400',
]

// =========================================
// TIME FORMATTER
// =========================================
const formatTime = (
  timeStr: string,
  fontIdx: number
) => {
  if (!timeStr) return '--:--:--'

  const [timeStrOnly, period] =
    timeStr.split(' ')

  const parts =
    timeStrOnly?.split(':') || []

  return (
    <div
      className={`flex items-baseline justify-center ${fontStyles[fontIdx]} select-none whitespace-nowrap tabular-nums leading-none`}
      style={{
        fontSize: 'min(13cqi, 40cqb)',
      }}
    >
      {parts.map((p, i) => (
        <span
          key={i}
          className="flex items-baseline"
        >
          <span>{p}</span>

          {i < 2 && (
            <span className="opacity-20 font-sans font-light mx-[0.1em] text-[0.8em] relative -top-[0.05em]">
              :
            </span>
          )}
        </span>
      ))}

      {period && (
        <span className="ml-[0.2em] opacity-40 font-sans tracking-widest font-bold text-[0.3em] uppercase">
          {period}
        </span>
      )}
    </div>
  )
}

// =========================================
// LOCAL CLOCK WIDGET
// =========================================
export const LocalClockWidget = memo(
  ({
    fontIdx,
    isPro,
    onToggleFont,
  }: any) => {
    const [timeStr, setTimeStr] =
      useState('--:--:--')

    useEffect(() => {
      // Initial time
      setTimeStr(
        new Date().toLocaleTimeString(
          'en-US',
          {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }
        )
      )

      // Isolated interval
      const timer = setInterval(() => {
        setTimeStr(
          new Date().toLocaleTimeString(
            'en-US',
            {
              hour12: true,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }
          )
        )
      }, 1000)

      return () => clearInterval(timer)
    }, [])

    return (
      <>
        <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10">
          <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
            <Clock
              size={10}
              className="opacity-50"
            />
            Local Time
          </div>

          {isPro && (
            <button
              onPointerDown={(e) =>
                e.stopPropagation()
              }
              onDragStart={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={onToggleFont}
              className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded"
              title="Cycle Typography"
            >
              <Type size={12} />
            </button>
          )}
        </div>

        <div
          className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-0 pointer-events-none"
          style={{
            containerType: 'size',
          }}
        >
          {formatTime(timeStr, fontIdx)}
        </div>
      </>
    )
  }
)

LocalClockWidget.displayName =
  'LocalClockWidget'

// =========================================
// SESSION CLOCK WIDGET
// =========================================
export const SessionClockWidget = memo(
  ({
    fontIdx,
    timeOffsetRef,
    isPro,
    onToggleFont,
    onOverlapChange,
  }: any) => {
    const [sessionInfo, setSessionInfo] =
      useState({
        name: 'Determining...',
        localTime: '--:--:--',
        isOverlap: false,
      })

    useEffect(() => {
      let lastOverlap = false

      const timer = setInterval(() => {
        const trueUTC = new Date(
          Date.now() +
            (timeOffsetRef?.current || 0)
        )

        const utcHour =
          trueUTC.getUTCHours()

        const isSydney =
          utcHour >= 22 || utcHour < 7

        const isTokyo =
          utcHour >= 0 && utcHour < 9

        const isLondon =
          utcHour >= 8 && utcHour < 17

        const isNY =
          utcHour >= 13 && utcHour < 22

        const activeCount = [
          isSydney,
          isTokyo,
          isLondon,
          isNY,
        ].filter(Boolean).length

        const isOverlap =
          activeCount > 1

        // ONLY notify parent
        // when overlap changes
        if (
          isOverlap !== lastOverlap &&
          onOverlapChange
        ) {
          lastOverlap = isOverlap

          onOverlapChange(isOverlap)
        }

        let sName = 'Interbank'
        let tz = 'UTC'

        if (isNY) {
          sName = 'New York'
          tz = 'America/New_York'
        } else if (isLondon) {
          sName = 'London'
          tz = 'Europe/London'
        } else if (isTokyo) {
          sName = 'Tokyo'
          tz = 'Asia/Tokyo'
        } else if (isSydney) {
          sName = 'Sydney'
          tz = 'Australia/Sydney'
        }

        setSessionInfo({
          name: sName,

          localTime:
            trueUTC.toLocaleTimeString(
              'en-US',
              {
                timeZone: tz,
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }
            ),

          isOverlap,
        })
      }, 1000)

      return () => clearInterval(timer)
    }, [timeOffsetRef, onOverlapChange])

    return (
      <>
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>

        <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10 relative">
          <div className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
            <Globe2
              size={10}
              className="text-blue-500/80"
            />

            {sessionInfo.name} Session
          </div>

          {isPro && (
            <button
              onPointerDown={(e) =>
                e.stopPropagation()
              }
              onDragStart={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={onToggleFont}
              className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded"
              title="Cycle Typography"
            >
              <Type size={12} />
            </button>
          )}
        </div>

        <div
          className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-10 pointer-events-none"
          style={{
            containerType: 'size',
          }}
        >
          {formatTime(
            sessionInfo.localTime,
            fontIdx
          )}
        </div>

        {sessionInfo.isOverlap && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
        )}
      </>
    )
  }
)

SessionClockWidget.displayName =
  'SessionClockWidget'
