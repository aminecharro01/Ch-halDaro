import { NextResponse } from 'next/server';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fetchFootballApi } from '@/lib/api-football';

const tmpDir = os.tmpdir();
const filePath = path.join(tmpDir, 'subscriptions.json');

// Need a contact email for VAPID config
webpush.setVapidDetails(
  'mailto:hello@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ status: 'No active subscriptions found' });
    }
    
    const subs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (subs.length === 0) return NextResponse.json({ status: 'Empty subscriptions' });

    // Mock dynamic push message for demonstration, normally would diff API state
    // const today = new Date().toISOString().split('T')[0];
    // const matches = await fetchFootballApi('/fixtures', { date: today });

    const payload = JSON.stringify({ 
      title: '⚽ Action update!', 
      body: `Live update check complete via Vercel Cron.`
    });
    
    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        console.error("Push failed for sub", e);
      }
    }
    
    return NextResponse.json({ success: true, sent });
  } catch (err: any) {
    console.error("Notify Error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
