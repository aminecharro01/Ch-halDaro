/** Turn Supabase / OAuth errors into readable login messages. */
export function formatAuthError(raw?: string): string {
  if (!raw) return '';

  let text = raw.trim();

  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text) as {
        msg?: string;
        error_code?: string;
        message?: string;
      };
      text = parsed.msg || parsed.message || text;
      if (
        parsed.error_code === 'validation_failed' &&
        text.toLowerCase().includes('provider') &&
        text.toLowerCase().includes('not enabled')
      ) {
        return GOOGLE_NOT_ENABLED_MESSAGE;
      }
    } catch {
      /* use raw string */
    }
  }

  const lower = text.toLowerCase();
  if (
    lower.includes('unsupported provider') ||
    lower.includes('provider is not enabled') ||
    (lower.includes('validation_failed') && lower.includes('google'))
  ) {
    return GOOGLE_NOT_ENABLED_MESSAGE;
  }

  if (lower.includes('redirect_uri_mismatch') || lower.includes('redirect_uri')) {
    return REDIRECT_URI_MISMATCH_MESSAGE;
  }

  return text;
}

export const GOOGLE_NOT_ENABLED_MESSAGE =
  'Google sign-in is not enabled on your Supabase project. Open Supabase Dashboard → Authentication → Providers → Google, turn it ON, and add your Google Client ID & Secret.';

export const REDIRECT_URI_MISMATCH_MESSAGE =
  'Google redirect URI mismatch: in Google Cloud Console you must add your Supabase callback URL (see the green box on this page), not http://localhost:3000/auth/callback.';
