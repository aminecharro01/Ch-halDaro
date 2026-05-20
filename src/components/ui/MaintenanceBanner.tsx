import { unstable_cache } from 'next/cache';
import { fetchAppSettings } from '@/lib/admin/queries';

const getCachedAppSettings = unstable_cache(
  () => fetchAppSettings(),
  ['app-settings-public'],
  { revalidate: 60 }
);

export async function MaintenanceBanner() {
  const settings = await getCachedAppSettings();

  if (!settings.maintenance_mode && !settings.banner_message?.trim()) {
    return null;
  }

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-100 text-sm text-center px-4 py-2">
      {settings.maintenance_mode && (
        <span className="font-bold uppercase tracking-wider text-amber-400 mr-2">Maintenance</span>
      )}
      {settings.banner_message?.trim() || 'The app is under maintenance. Some features may be limited.'}
    </div>
  );
}
