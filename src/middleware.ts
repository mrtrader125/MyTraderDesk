import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // 1. Setup the response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // 2. Setup Supabase (to check who the user is)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.delete(name)
          },
        },
      }
    )

    // 3. Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // 4. Define our routes
    const isAuthRoute = path === '/login' || path === '/signup' || path === '/test'
    const isProtectedRoute = 
      path.startsWith('/dashboard') || 
      path.startsWith('/analysis') || 
      path.startsWith('/settings') || 
      path.startsWith('/profile') ||
      path.startsWith('/admin')

    // RULE A: If not logged in and trying to access private pages, send to login
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login?error=Unauthorized', request.url))
    }

    // RULE B: If already logged in, don't let them go to the login/signup page
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // RULE C: Strict Admin Check (Only allow your specific email)
    if (user && path.startsWith('/admin')) {
      if (user.email !== 'mytraderdesk@gmail.com') {
        return NextResponse.redirect(new URL('/dashboard?error=AdminAccessDenied', request.url))
      }
    }

    return response

  } catch (err) {
    // If anything goes wrong, stay safe and send them to login
    console.error("Middleware Error:", err)
    return NextResponse.redirect(new URL('/login?error=SystemError', request.url))
  }
}

// This tells Next.js which pages to run this code on
export const config = {
  matcher: [
    '/admin/:path*', 
    '/dashboard/:path*', 
    '/analysis/:path*', 
    '/settings/:path*', 
    '/profile/:path*',
    '/login',
    '/signup'
  ],
}
