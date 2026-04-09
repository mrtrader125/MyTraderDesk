import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request: { headers: request.headers } })
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      }
    )

    // Using getUser() here guarantees we bypass the stale cookie and get your actual email
    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    const isAuthRoute = path === '/login' || path === '/signup'
    const isAdminRoute = path.startsWith('/admin')
    const isUserRoute = path.startsWith('/floor') || path.startsWith('/dashboard') || path.startsWith('/markets') || path.startsWith('/settings') || path.startsWith('/profile') || path.startsWith('/vault')

    // 1. Not logged in? Kick to login
    if (!user && (isUserRoute || isAdminRoute)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Logged in but on the login page? Push to dashboard
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. THE VIP BOUNCER: Absolute bypass for your email
    if (user && isAdminRoute) {
      const userEmail = user.email?.toLowerCase() || ''
      const isMasterAdmin = userEmail === 'mrtrader125@gmail.com'
      
      if (!isMasterAdmin) {
        // If it's anyone else, kick them back to the dashboard
        return NextResponse.redirect(new URL('/dashboard?error=AdminOnly', request.url))
      }
    }

    return response
  } catch (err) {
    return response;
  }
}

// 🚨 THE FIX: This Regex pattern protects your app but creates a secure tunnel for your Webhooks
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/telegram (Let Telegram bots pass through!)
     * - api/webhook (Let Lemon Squeezy pass through!)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/telegram|api/webhook).*)',
  ],
}
