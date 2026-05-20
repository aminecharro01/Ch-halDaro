import { requireAdmin } from '@/lib/admin/require-admin';

export const metadata = {
  title: "Admin — Ch'hal Daro",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return <div className="min-h-[70vh]">{children}</div>;
}
