/**
 * Transactional email via Resend when RESEND_API_KEY is set.
 */
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Ch'hal Daro <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!res.ok) {
      console.error('[Email] Resend error:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Email] Send failed:', e);
    return false;
  }
}

export function matchAlertEmailHtml(title: string, body: string, url: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const link = url.startsWith('http') ? url : `${site}${url}`;
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:12px">
<h1 style="color:#22c55e;font-size:20px">${title}</h1>
<p style="font-size:16px;line-height:1.5">${body}</p>
<a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Voir le match</a>
</div>`;
}
