import { use } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { formatAuthError } from '@/lib/auth/auth-errors';
import { getGoogleOAuthRedirectUri } from '@/lib/auth/site-url';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = use(searchParams);
  const nextPath = params?.next && params.next.startsWith('/') ? params.next : '/';
  const errorMessage = formatAuthError(params?.error);
  const googleRedirectUri = getGoogleOAuthRedirectUri();

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 overflow-hidden">
      <div
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-[#53FC18]/10 blur-[100px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none"
        aria-hidden
      />

      <LoginForm
        error={errorMessage}
        nextPath={nextPath}
        googleRedirectUri={googleRedirectUri}
      />
    </div>
  );
}
