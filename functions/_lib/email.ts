// Helpers de email de marca para Campiva Intelligence (Cloudflare Pages Functions).
// El prefijo _ hace que Cloudflare no lo sirva como ruta, pero sí es importable.

const BREVO_SEND = 'https://api.brevo.com/v3/smtp/email';
const REMITENTE = { name: 'Campiva Intelligence', email: 'rcampbell@campivacorp.com' };

interface Bloque {
  heading: string;
  preheader?: string;
  bodyHtml: string;
  footerNota?: string;
}

/** Envuelve el contenido en el layout de marca (navy + barra verde + wordmark). */
export function brandedEmail({ heading, preheader = '', bodyHtml, footerNota = '' }: Bloque): string {
  return `<div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#0b1a2e;padding:12px 0;border-top:6px solid #95b444;text-align:center;">
<span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">campiva</span><span style="font-size:20px;font-weight:300;color:#b9cbe0;"> intelligence</span><span style="font-size:20px;font-weight:800;color:#cbdc53;">.</span>
</td></tr>
<tr><td style="padding:34px 40px;">
<h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#0b1a2e;font-family:Georgia,serif;">${heading}</h1>
${bodyHtml}
</td></tr>
<tr><td style="background:#060f1c;padding:18px 40px;text-align:center;">
<p style="margin:0 0 6px;font-size:11px;color:#7c8da6;line-height:1.5;">Campiva Intelligence · el desk de mercados agro de Campivacorp</p>
${footerNota ? `<p style="margin:0;font-size:11px;color:#5f6f86;line-height:1.5;">${footerNota}</p>` : ''}
</td></tr>
</table></td></tr></table></div>`;
}

/** HTML de una tarjeta de análisis para usar dentro del cuerpo de un email. */
export function tarjetaAnalisis(a: { title: string; bajada: string; url: string; kicker?: string }): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
<tr><td style="padding:18px 20px;">
${a.kicker ? `<p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#a87b24;">${a.kicker}</p>` : ''}
<a href="${a.url}" style="font-size:17px;font-weight:bold;color:#0b1a2e;text-decoration:none;font-family:Georgia,serif;line-height:1.3;">${a.title}</a>
<p style="margin:8px 0 0;font-size:13px;color:#475569;line-height:1.5;">${a.bajada}</p>
</td></tr></table>`;
}

/** Envía un email transaccional. Devuelve true si Brevo lo aceptó. */
export async function sendTransactional(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const r = await fetch(BREVO_SEND, {
    method: 'POST',
    headers: { 'api-key': apiKey.trim(), 'content-type': 'application/json' },
    body: JSON.stringify({ sender: REMITENTE, to: [{ email: to }], subject, htmlContent: html }),
  });
  return r.ok;
}
