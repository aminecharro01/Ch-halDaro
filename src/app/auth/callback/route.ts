import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAdminRole } from '@/lib/admin/bootstrap-role'
import { ensureUserProfile } from '@/lib/auth/ensure-profile'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await ensureUserProfile(supabase, user)
        await syncAdminRole(user.id, user.email)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('id', user.id)
          .maybeSingle()
        if (profile?.is_banned) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Your account has been banned')}`)
        }
      }
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalhost = process.env.NODE_ENV === 'development'
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`)
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
