import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // =========================
  // AUTH PAGES
  // =========================
  const isAuthRoute =
    path === '/login' ||
    path === '/signup'

  // =========================
  // PROTECTED PAGES
  // =========================
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
    path.startsWith('/protocol')

  // =========================
  // LIGHTWEIGHT SESSION CHECK
  // =========================
  // IMPORTANT:
  // We are NOT calling Supabase here.
  // We only check if auth cookies exist.
  // This keeps middleware extremely fast.

  const hasSession =
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
