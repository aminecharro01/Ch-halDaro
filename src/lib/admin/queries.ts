import { createServiceClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'aminecharro@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase());

export type AdminStats = {
  users: number;
  favorites: number;
  pushSubscriptions: number;
  matchStates: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const service = createServiceClient();
  const db = service || (await createClient());

  const [users, favorites, pushSubscriptions, matchStates] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('favorites').select('*', { count: 'exact', head: true }),
    db.from('push_subscriptions').select('*', { count: 'exact', head: true }),
    db.from('match_states').select('*', { count: 'exact', head: true }),
  ]);

  return {
    users: users.count ?? 0,
    favorites: favorites.count ?? 0,
    pushSubscriptions: pushSubscriptions.count ?? 0,
    matchStates: matchStates.count ?? 0,
  };
}

export type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_banned: boolean | null;
};

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const service = createServiceClient();

  if (service) {
    const { data: authData } = await service.auth.admin.listUsers({ perPage: 200 });
    const authUsers = authData?.users || [];

    const { data: profiles } = await service
      .from('profiles')
      .select('id, first_name, last_name, role, is_banned') as { data: ProfileRow[] | null };

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    return authUsers
      .map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email || '—',
        first_name: p?.first_name ?? null,
        last_name: p?.last_name ?? null,
        role: p?.role || 'user',
        is_banned: Boolean(p?.is_banned),
        created_at: u.created_at,
      };
      })
      .filter((u) => u.role !== 'admin' && !ADMIN_EMAILS.includes(u.email.toLowerCase()));
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, role, is_banned');

  return (profiles || [])
    .map((p) => ({
      id: p.id,
      email: '—',
      first_name: p.first_name,
      last_name: p.last_name,
      role: p.role || 'user',
      is_banned: Boolean(p.is_banned),
      created_at: '',
    }))
    .filter((u) => u.role !== 'admin' && !ADMIN_EMAILS.includes(u.email.toLowerCase()));
}

export type AppSettings = {
  maintenance_mode: boolean;
  banner_message: string;
  notifications_enabled: boolean;
};

export async function fetchAppSettings(): Promise<AppSettings> {
  const service = createServiceClient();
  const db = service || (await createClient());

  const { data } = await db.from('app_settings').select('key, value');

  const map = new Map((data || []).map((r) => [r.key, r.value]));

  const maintenance = map.get('maintenance_mode');
  const banner = map.get('banner_message');
  const notifications = map.get('notifications_enabled');

  return {
    maintenance_mode: maintenance === true || maintenance === 'true',
    banner_message: typeof banner === 'string' ? banner : '',
    notifications_enabled: notifications !== false && notifications !== 'false',
  };
}

export async function saveAppSettings(
  settings: AppSettings,
  adminId: string
): Promise<{ ok: boolean; error?: string }> {
  const service = createServiceClient();
  if (!service) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is required to save settings' };
  }

  const rows = [
    { key: 'maintenance_mode', value: settings.maintenance_mode, updated_by: adminId },
    { key: 'banner_message', value: settings.banner_message, updated_by: adminId },
    { key: 'notifications_enabled', value: settings.notifications_enabled, updated_by: adminId },
  ];

  for (const row of rows) {
    const { error } = await service.from('app_settings').upsert({
      key: row.key,
      value: row.value,
      updated_at: new Date().toISOString(),
      updated_by: row.updated_by,
    });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<{ ok: boolean; error?: string }> {
  const service = createServiceClient();
  const db = service || (await createClient());

  const { error } = await db.from('profiles').update({ role }).eq('id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateUserBan(
  userId: string,
  isBanned: boolean
): Promise<{ ok: boolean; error?: string }> {
  const service = createServiceClient();
  const db = service || (await createClient());
  const { error } = await db.from('profiles').update({ is_banned: isBanned }).eq('id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
