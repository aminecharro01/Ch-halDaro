import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { syncAdminRole, getProfileRole } from '@/lib/admin/bootstrap-role';
import { isAdminEmail } from '@/lib/admin/emails';
import type { User } from '@supabase/supabase-js';

export type AdminContext = {
  user: User;
  role: 'admin';
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getAdminUser(existingUser?: User | null): Promise<AdminContext | null> {
  const user = existingUser ?? await getCurrentUser();
  if (!user) return null;

  let role = await getProfileRole(user.id);

  if (isAdminEmail(user.email) && role !== 'admin') {
    role = await syncAdminRole(user.id, user.email);
  }

  if (role !== 'admin') return null;
  return { user, role: 'admin' };
}

export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdminUser();
  if (!admin) redirect('/login?next=/admin');
  return admin;
}
