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
