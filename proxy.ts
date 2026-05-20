import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Mock checking if the env variables are present. If not, bypass to not crash the app in dev.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.is_banned) {
      const response = NextResponse.redirect(new URL('/login?error=Your account has been banned', request.url))
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' })
      return response
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
      const adminEmails = (process.env.ADMIN_EMAILS || 'aminecharro@gmail.com')
        .split(',')
        .map((e) => e.trim().toLowerCase())

      const isListedAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false
      const role = profile?.role === 'admin' || isListedAdmin ? 'admin' : profile?.role

      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }

  if (
    authError &&
    (authError.message?.includes('refresh_token') ||
      (authError as { code?: string }).code === 'refresh_token_not_found')
  ) {
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        supabaseResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
      }
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
