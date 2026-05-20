'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { login, signup, signInWithGoogle } from '@/app/login/actions';
import {
  GOOGLE_NOT_ENABLED_MESSAGE,
  REDIRECT_URI_MISMATCH_MESSAGE,
} from '@/lib/auth/auth-errors';

type Tab = 'signin' | 'signup';

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:border-[#53FC18]/60 focus:ring-2 focus:ring-[#53FC18]/20 outline-none transition-all';

const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5';

export function LoginForm({
  error,
  nextPath,
  googleRedirectUri,
}: {
  error?: string;
  nextPath: string;
  googleRedirectUri?: string | null;
}) {
  const [tab, setTab] = useState<Tab>('signin');
  const isGoogleSetupError = error === GOOGLE_NOT_ENABLED_MESSAGE;
  const isRedirectMismatch = error === REDIRECT_URI_MISMATCH_MESSAGE;

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#53FC18]/30 via-transparent to-emerald-600/10 blur-xl opacity-70 pointer-events-none"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gray-950/80 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 48px,
              #53FC18 48px,
              #53FC18 49px
            )`,
          }}
          aria-hidden
        />

        <div className="relative px-8 pt-10 pb-8 space-y-8">
          <div className="text-center space-y-4">
            <Link href="/" className="inline-block group">
              <div className="relative mx-auto w-28 h-28 drop-shadow-[0_0_24px_rgba(83,252,24,0.35)] transition-transform group-hover:scale-105">
                <Image
                  src="/logo.webp"
                  alt="Ch'hal Daro"
                  width={112}
                  height={112}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#53FC18] italic">
                Livescoring
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Follow your teams. Never miss a goal.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300 text-left space-y-2"
            >
              <p>{error}</p>
              {isRedirectMismatch && googleRedirectUri && (
                <p className="text-xs text-red-200/90 pt-1 border-t border-red-500/20">
                  Paste this exact URI in Google Cloud → Authorized redirect URIs:
                  <code className="mt-2 block break-all rounded-lg bg-black/40 px-2 py-2 text-[#53FC18] select-all">
                    {googleRedirectUri}
                  </code>
                </p>
              )}
              {isGoogleSetupError && (
                <ol className="list-decimal list-inside text-xs text-red-200/90 space-y-1 pt-1 border-t border-red-500/20">
                  <li>
                    <a
                      href="https://supabase.com/dashboard/project/_/auth/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#53FC18] hover:text-white"
                    >
                      Supabase → Authentication → Providers
                    </a>
                  </li>
                  <li>Enable <strong>Google</strong></li>
                  <li>
                    Create OAuth credentials in{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#53FC18] hover:text-white"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Paste Client ID &amp; Secret, save, then retry</li>
                </ol>
              )}
            </div>
          )}

          <form action={signInWithGoogle} className="space-y-3">
            <input type="hidden" name="next" value={nextPath} />
            <GoogleButton />
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-950/90 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                or email
              </span>
            </div>
          </div>

          <div className="flex rounded-xl bg-black/30 p-1 border border-white/5">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                tab === 'signin'
                  ? 'bg-[#53FC18] text-gray-950 shadow-lg shadow-[#53FC18]/25'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                tab === 'signup'
                  ? 'bg-[#53FC18] text-gray-950 shadow-lg shadow-[#53FC18]/25'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Sign up
            </button>
          </div>

          {tab === 'signin' ? (
            <form className="space-y-4 animate-fade-up">
              <input type="hidden" name="next" value={nextPath} />
              <div>
                <label htmlFor="email-signin" className={labelClass}>
                  Email
                </label>
                <input
                  id="email-signin"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password-signin" className={labelClass}>
                  Password
                </label>
                <input
                  id="password-signin"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <button
                formAction={login}
                className="w-full py-3.5 rounded-xl bg-[#53FC18] text-gray-950 font-black uppercase tracking-widest text-sm hover:bg-[#6aff35] transition-all shadow-lg shadow-[#53FC18]/20 active:scale-[0.98]"
              >
                Kick off — Sign in
              </button>
            </form>
          ) : (
            <form className="space-y-4 animate-fade-up">
              <input type="hidden" name="next" value={nextPath} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="birthdate" className={labelClass}>
                  Birthdate
                </label>
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="email-signup" className={labelClass}>
                  Email
                </label>
                <input
                  id="email-signup"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password-signup" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="password-signup"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                formAction={signup}
                className="w-full py-3.5 rounded-xl border border-[#53FC18]/40 bg-[#53FC18]/10 text-[#53FC18] font-black uppercase tracking-widest text-sm hover:bg-[#53FC18]/20 transition-all active:scale-[0.98]"
              >
                Join the squad
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-600">
            <Link href="/" className="text-gray-500 hover:text-[#53FC18] transition-colors font-semibold">
              ← Back to live scores
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleButton() {
  return (
    <button
      type="submit"
      className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/15 bg-white/5 text-white font-bold text-sm hover:bg-white/10 hover:border-white/25 transition-all active:scale-[0.98]"
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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
      Continue with Google
    </button>
  );
}
