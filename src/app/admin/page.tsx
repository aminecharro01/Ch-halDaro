import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';
import { fetchAdminStats, fetchAdminUsers, fetchAppSettings, saveAppSettings, updateUserBan } from '@/lib/admin/queries';
import { Users, Heart, Bell, Activity, Ban, Mail } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();
  const stats = await fetchAdminStats();
  const users = await fetchAdminUsers();
  const settings = await fetchAppSettings();

  const cards = [
    { label: 'Registered users', value: stats.users, icon: Users, color: 'text-blue-400' },
    { label: 'Favorites', value: stats.favorites, icon: Heart, color: 'text-pink-400' },
    { label: 'Push subscriptions', value: stats.pushSubscriptions, icon: Bell, color: 'text-amber-400' },
    { label: 'Tracked live matches', value: stats.matchStates, icon: Activity, color: 'text-green-400' },
  ];

  async function setUserBan(formData: FormData) {
    'use server';
    await requireAdmin();
    const userId = String(formData.get('userId') || '');
    const banned = formData.get('isBanned') === 'true';
    if (!userId) return;
    await updateUserBan(userId, banned);
    revalidatePath('/admin');
  }

  async function saveAdminSettings(formData: FormData) {
    'use server';
    const admin = await requireAdmin();
    const maintenance = formData.get('maintenance_mode') === 'on';
    const banner = String(formData.get('banner_message') || '');
    await saveAppSettings(
      {
        maintenance_mode: maintenance,
        notifications_enabled: true,
        banner_message: banner,
      },
      admin.user.id
    );
    revalidatePath('/admin');
    revalidatePath('/');
  }

  async function sendBroadcastEmail(formData: FormData) {
    'use server';
    await requireAdmin();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();
    if (!subject || !message) return;

    const service = createServiceClient();
    if (!service) return;

    const { data } = await service.auth.admin.listUsers({ perPage: 1000 });
    const recipients = (data?.users || [])
      .filter((u) => !!u.email)
      .map((u) => u.email as string);

    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px"><h2 style="color:#22c55e;margin-top:0">Ch'hal Daro</h2><h3>${subject}</h3><p style="white-space:pre-wrap;line-height:1.6">${message}</p></div>`,
      });
    }
    revalidatePath('/admin');
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Signed in as {user.email}</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
              <p className="text-3xl font-black text-white mt-2 tabular-nums">{value}</p>
            </div>
            <Icon className={`w-8 h-8 ${color} opacity-80`} />
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4 max-w-xl">
        <h2 className="font-bold text-white">App controls</h2>
        <form action={saveAdminSettings} className="space-y-4">
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input type="checkbox" name="maintenance_mode" defaultChecked={settings.maintenance_mode} />
            Maintenance mode banner
          </label>
          <textarea
            name="banner_message"
            defaultValue={settings.banner_message}
            rows={2}
            placeholder="Optional banner message"
            className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-sm"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold">
            Save controls
          </button>
        </form>
      </div>

      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white flex items-center gap-2"><Ban className="w-4 h-4 text-red-400" /> Users (non-admin)</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-gray-500 bg-gray-900/80">
              <tr>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 text-gray-300">{u.email}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-bold ${u.is_banned ? 'text-red-400' : 'text-green-400'}`}>
                      {u.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <form action={setUserBan}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="isBanned" value={u.is_banned ? 'false' : 'true'} />
                      <button
                        type="submit"
                        className={`text-xs font-bold ${u.is_banned ? 'text-green-400' : 'text-red-400'} hover:underline`}
                      >
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> Broadcast email to all users</h2>
        <form action={sendBroadcastEmail} className="space-y-3">
          <input
            name="subject"
            placeholder="Email subject"
            className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-sm"
          />
          <textarea
            name="message"
            rows={5}
            placeholder="Write your custom message..."
            className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-sm"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold">
            Send to all users
          </button>
        </form>
      </div>
    </div>
  );
}
