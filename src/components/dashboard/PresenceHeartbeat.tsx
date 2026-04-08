'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PresenceHeartbeat({ user }: { user: any }) {
  useEffect(() => {
    if (!user) return

    // Initialize the real-time channel
    const channel = supabase.channel('online-operators', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        // This is where the data is synced. 
        // We don't need to do anything here, Supabase handles it.
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the user's metadata
          await channel.track({
            email: user.email,
            online_at: new Date().toISOString(),
            current_page: window.location.pathname,
            plan: user.user_metadata?.plan || 'free'
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  return null // This component renders nothing visually
}
