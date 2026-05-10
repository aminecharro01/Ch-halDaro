const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

const envPath = path.resolve(process.cwd(), '.env.local');
let env = '';
if (fs.existsSync(envPath)) {
  env = fs.readFileSync(envPath, 'utf-8');
}
// Append or replace keys
const publicLine = `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`;
const privateLine = `VAPID_PRIVATE_KEY=${privateKey}`;
let lines = env.split(/\r?\n/).filter(l => l.trim() !== '');
lines = lines.filter(l => !l.startsWith('NEXT_PUBLIC_VAPID_PUBLIC_KEY=') && !l.startsWith('VAPID_PRIVATE_KEY='));
lines.push(publicLine, privateLine);
fs.writeFileSync(envPath, lines.join('\n'));
console.log('VAPID keys generated and written to .env.local');
