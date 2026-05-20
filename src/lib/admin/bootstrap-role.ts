import { createClient } from '@/lib/supabase/server';
import { roleForEmail } from '@/lib/admin/emails';
import type { UserRole } from '@/lib/admin/emails';

export async function syncAdminRole(userId: string, email: string | null | undefined) {
  const supabase = await createClient();
  const role = roleForEmail(email);

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('[admin] syncAdminRole:', error.message);
  }

  return role;
}

export async function getProfileRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return (data?.role as UserRole) || 'user';
}
