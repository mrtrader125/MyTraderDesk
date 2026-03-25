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

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    const isAuthRoute = path === '/login' || path === '/signup'
    const isAdminRoute = path.startsWith('/admin')
    
    // 🚨 ADDED: /floor is now officially protected as a User Route
    const isUserRoute = path.startsWith('/floor') || path.startsWith('/dashboard') || path.startsWith('/markets') || path.startsWith('/settings') || path.startsWith('/profile')

    // 1. Not logged in? Redirect to login (or community teaser)
    if (!user && (isUserRoute || isAdminRoute)) {
      const redirectUrl = request.nextUrl.clone()
      // If they tried to sneak into the floor, route them to the public teaser page
      redirectUrl.pathname = path.startsWith('/floor') ? '/community' : '/login'
      return NextResponse.redirect(redirectUrl)
    }

    // 2. Logged in? Don't show login/signup pages
    if (user && isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      // Send them straight to the action
      redirectUrl.pathname = '/floor' 
      return NextResponse.redirect(redirectUrl)
    }

    // 3. ADMIN CHECK: Strictly enforce database role OR your specific email
    if (user && isAdminRoute) {
      const isRoleAdmin = user.app_metadata?.role === 'admin'
      const isEmailAdmin = user.email === 'mrtrader125@gmail.com' // Absolute failsafe

      if (!isRoleAdmin && !isEmailAdmin) {
        // Kick them back to the floor if they aren't a true admin
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/floor'
        redirectUrl.searchParams.set('error', 'AdminOnly')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (err) {
    // Failsafe execution
    return response;
  }
}

// 4. Tell Next.js to run the bouncer on these paths
export const config = {
  matcher: [
    '/admin/:path*', 
    '/floor/:path*', // <-- ADDED
    '/dashboard/:path*', 
    '/markets/:path*', 
    '/settings/:path*', 
    '/profile/:path*',
    '/login',
    '/signup'
  ],
}
