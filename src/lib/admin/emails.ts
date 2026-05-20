export type UserRole = 'user' | 'admin';

const DEFAULT_ADMIN = 'aminecharro@gmail.com';

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function roleForEmail(email: string | null | undefined): UserRole {
  return isAdminEmail(email) ? 'admin' : 'user';
}
