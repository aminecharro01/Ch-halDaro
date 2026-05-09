import { login, signup } from './actions'
import { use } from 'react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = use(searchParams)

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8 bg-gray-900/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-white">Ch'hal Daro</h2>
          <p className="mt-2 text-sm text-gray-400">Manage your account and follow your teams</p>
        </div>

        {resolvedParams?.error && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg text-sm text-center">
            {resolvedParams.error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sign In Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Sign In</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="email-signin" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email-signin"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password-signin" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password-signin"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                formAction={login}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in
              </button>
            </form>
          </div>

          {/* Sign Up Section */}
          <div className="space-y-6 md:border-l md:border-gray-800 md:pl-8">
            <h3 className="text-xl font-bold text-white">Create Account</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-300 mb-1">
                  Birthdate
                </label>
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email-signup" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email-signup"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password-signup" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password-signup"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                  />
                </div>
              </div>
              <button
                formAction={signup}
                className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/50 text-gray-500">Social Sign In</span>
          </div>
        </div>

        <button
          formAction={async () => {
            'use server'
            const { createClient } = await import('@/lib/supabase/server')
            const { redirect } = await import('next/navigation')
            const supabase = await createClient()
            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
              },
            })
            if (data.url) {
              redirect(data.url)
            }
          }}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-700 rounded-xl shadow-sm text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
      </div>
    </div>
  )
}
