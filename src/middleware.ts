import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ========================================
  // SUPABASE SSR COOKIE SYNC
  // ========================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT:
  // We DO NOT call:
  // - profiles table
  // - admin checks
  // - plan checks
  // anymore.

  // ONLY refresh auth session safely.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // ========================================
  // AUTH ROUTES
  // ========================================
const isAuthRoute =
  path === '/login' ||
  path.startsWith('/initialize')

  // ========================================
  // PROTECTED ROUTES
  // ========================================
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/markets') ||
    path.startsWith('/settings') ||
    path.startsWith('/profile') ||
    path.startsWith('/vault') ||
    path.startsWith('/floor') ||
    path.startsWith('/desk') ||
    path.startsWith('/journal') ||
    path.startsWith('/analytics') ||
    path.startsWith('/protocol') ||
    path.startsWith('/account')

  // ========================================
  // NOT LOGGED IN
  // ========================================
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ========================================
  // ALREADY LOGGED IN
  // ========================================
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/telegram|api/webhook|update-password|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}  const hasSession =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('sb:token') ||
    request.cookies.get(
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
    )

  // =========================
  // NOT LOGGED IN
  // =========================
  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // =========================
  // ALREADY LOGGED IN
  // =========================
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - telegram/webhook routes
     * - auth callbacks
     * - password reset
     * - static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/telegram|api/webhook|update-password|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
