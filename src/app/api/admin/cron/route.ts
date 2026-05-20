import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/require-admin-api';

export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const headers: HeadersInit = {};
  if (process.env.CRON_SECRET) {
    headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
  }

  try {
    const res = await fetch(`${base}/api/cron/notify`, { headers, cache: 'no-store' });
    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json({ error: 'Cron failed', status: res.status, body }, { status: res.status });
    }

    return NextResponse.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cron request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
