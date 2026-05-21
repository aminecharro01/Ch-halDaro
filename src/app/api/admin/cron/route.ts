import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/require-admin-api';
import { runNotifyCron } from '@/lib/cron/run-notify';

/** Admin manual trigger — runs cron in-process (no HTTP self-fetch / SITE_URL issues). */
export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          'SUPABASE_SERVICE_ROLE_KEY is missing on the server. Add it in Vercel env vars and redeploy.',
      },
      { status: 500 }
    );
  }

  if (!process.env.THESPORTSDB_KEY) {
    return NextResponse.json(
      { error: 'THESPORTSDB_KEY is missing on the server.' },
      { status: 500 }
    );
  }

  try {
    const result = await runNotifyCron();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cron failed';
    console.error('[Admin Cron]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
