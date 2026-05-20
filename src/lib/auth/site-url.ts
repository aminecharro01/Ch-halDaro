/** Canonical site URL for OAuth redirects (must match Supabase Auth redirect allow list). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  return 'http://localhost:3000';
}

export function getAuthCallbackUrl(nextPath = '/'): string {
  const safe =
    nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/';
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safe)}`;
}

/**
 * URI to paste in Google Cloud Console → OAuth client → Authorized redirect URIs.
 * Google redirects here first; Supabase then sends the user to your app callback.
 */
export function getGoogleOAuthRedirectUri(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  return `${url.replace(/\/$/, '')}/auth/v1/callback`;
}
