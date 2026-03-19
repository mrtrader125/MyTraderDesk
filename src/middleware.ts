import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: { headers: request.headers },
    })

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

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    const isAuthRoute = path === '/login' || path === '/signup'
    const isAdminRoute = path.startsWith('/admin')
    const isUserRoute = path.startsWith('/dashboard') || path.startsWith('/markets') || path.startsWith('/settings') || path.startsWith('/profile')

    // 1. Not logged in? Redirect to login
    if (!user && (isUserRoute || isAdminRoute)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Logged in? Don't show login page
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. ADMIN CHECK: Strictly enforce database role
    if (user && isAdminRoute) {
      const isRoleAdmin = user.app_metadata?.role === 'admin'

      if (!isRoleAdmin) {
        // Kick them back to the user dashboard if they aren't a true admin
        return NextResponse.redirect(new URL('/dashboard?error=AdminOnly', request.url))
      }
    }

    return response
  } catch (err) {
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/dashboard/:path*', 
    '/markets/:path*', 
    '/settings/:path*', 
    '/profile/:path*',
    '/login',
    '/signup'
  ],
}
