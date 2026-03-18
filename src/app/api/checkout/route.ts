import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { variantId } = await request.json()
    
    // SAFETY NET: Check for server variables
    if (!process.env.LEMONSQUEEZY_STORE_ID || !process.env.LEMONSQUEEZY_API_KEY) {
      console.error('CRITICAL: Lemon Squeezy keys are missing from .env.local')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!variantId) {
      return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 })
    }

    // Capture the exact origin URL (handles localhost for testing, and your real domain for production)
    const origin = request.headers.get('origin') || 'https://mytraderdesk.com'

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch (error) {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          // 🚨 NEW: This block controls what happens AFTER they pay
          checkout_options: {
            redirect_url: `${origin}/dashboard?payment=success`,
            button_color: '#3b82f6' // Brands the Lemon Squeezy button with your brand-primary blue
          },
          checkout_data: { 
            email: user.email, 
            custom: { 
              user_id: user.id 
            } 
          }
        },
        relationships: {
          store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID } },
          variant: { data: { type: 'variants', id: variantId.toString() } }
        }
      }
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.errors?.[0]?.detail || 'Checkout failed')
      
    return NextResponse.json({ url: data.data.attributes.url })

  } catch (error: any) {
    console.error('Checkout API Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
