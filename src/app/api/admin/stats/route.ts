import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/require-admin-api';
import { fetchAdminStats } from '@/lib/admin/queries';

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const stats = await fetchAdminStats();
  return NextResponse.json(stats);
}
