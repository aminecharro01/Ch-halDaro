'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { syncAdminRole } from '@/lib/admin/bootstrap-role'
import { roleForEmail } from '@/lib/admin/emails'
import { getAuthCallbackUrl } from '@/lib/auth/site-url'
import { formatAuthError, GOOGLE_NOT_ENABLED_MESSAGE } from '@/lib/auth/auth-errors'

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/login?error=' + encodeURIComponent('Supabase not configured'))
  }

  const next = (formData.get('next') as string) || '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl(safeNext),
      queryParams: {
        access_type: 'online',
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    const msg = formatAuthError(error.message) || GOOGLE_NOT_ENABLED_MESSAGE
    redirect('/login?error=' + encodeURIComponent(msg))
  }

  if (data.url) {
    redirect(data.url)
  }

  redirect('/login?error=' + encodeURIComponent('Could not start Google sign-in'))
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Configuration check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/?error=Supabase not configured')
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await syncAdminRole(user.id, user.email)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.is_banned) {
      await supabase.auth.signOut()
      redirect('/login?error=Your account has been banned')
    }
  }

  const next = (formData.get('next') as string) || '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  revalidatePath('/', 'layout')
  redirect(safeNext)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/login?error=Supabase not configured')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const birthdate = formData.get('birthdate') as string

  if (password !== confirmPassword) {
    redirect('/login?error=Passwords do not match')
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl('/'),
    },
  })

  if (authError) {
    redirect('/login?error=' + authError.message)
  }

  if (authData.user) {
    const adminRole = roleForEmail(email)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        birthdate: birthdate,
        role: adminRole,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // We don't redirect here as the user is still created in auth
    }
  }

  const next = (formData.get('next') as string) || '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  revalidatePath('/', 'layout')
  redirect(safeNext)
}

export async function logout() {
  const supabase = await createClient()
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect('/')
}
