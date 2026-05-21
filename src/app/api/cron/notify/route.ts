import { NextResponse } from 'next/server';
import { runNotifyCron } from '@/lib/cron/run-notify';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const result = await runNotifyCron();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cron failed';
    console.error('[Cron Error]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
