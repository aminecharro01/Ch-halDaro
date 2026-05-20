import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/require-admin';

export async function requireAdminApi(): Promise<NextResponse | null> {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }
  return null;
}
