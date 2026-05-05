import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Vercel only allows writing to /tmp
const tmpDir = os.tmpdir();
const filePath = path.join(tmpDir, 'subscriptions.json');

export async function POST(request: NextRequest) {
  try {
    const sub = await request.json();
    let subs = [];
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Upsert the subscription into Supabase tied to the user
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          subscription: sub,
        }, { onConflict: 'endpoint' });
        return NextResponse.json({ success: true, count: 1 });
      }
    }

    // Fallback to local /tmp for anonymous or missing supabase setup
    if (fs.existsSync(filePath)) {
      subs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    
    // Deduplicate
    if (!subs.find((s: any) => s.endpoint === sub.endpoint)) {
      subs.push(sub);
      fs.writeFileSync(filePath, JSON.stringify(subs));
    }
    
    return NextResponse.json({ success: true, count: subs.length });
  } catch (err: any) {
    console.error("Subscribe Error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
