import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { roleForEmail } from '@/lib/admin/emails';

function namesFromMetadata(user: User): { first_name: string; last_name: string } {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    '';
  const given = typeof meta.given_name === 'string' ? meta.given_name : '';
  const family = typeof meta.family_name === 'string' ? meta.family_name : '';

  if (given || family) {
    return { first_name: given, last_name: family };
  }

  if (full) {
    const parts = full.trim().split(/\s+/);
    return {
      first_name: parts[0] ?? '',
      last_name: parts.slice(1).join(' '),
    };
  }

  return { first_name: '', last_name: '' };
}

/** Ensures profiles row exists and fills OAuth names when empty. */
export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();

  const names = namesFromMetadata(user);
  const adminRole = roleForEmail(user.email);

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      first_name: names.first_name,
      last_name: names.last_name,
      role: adminRole,
    });
    return;
  }

  const updates: Record<string, string> = {};
  if (!existing.first_name?.trim() && names.first_name) updates.first_name = names.first_name;
  if (!existing.last_name?.trim() && names.last_name) updates.last_name = names.last_name;

  if (Object.keys(updates).length > 0) {
    await supabase.from('profiles').update(updates).eq('id', user.id);
  }
}
