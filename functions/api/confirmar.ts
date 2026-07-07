// GET /api/confirmar?t=<token> — segundo paso del double opt-in: valida el enlace
// firmado del correo, agrega el contacto a la lista de Brevo y le envía la bienvenida.

import { brandedEmail, sendTransactional, tarjetaAnalisis } from '../_lib/email';

const LISTA_BOLETIN_WEB = 3;

/** Correo de bienvenida con los últimos análisis. No bloquea la confirmación si falla. */
async function enviarBienvenida(apiKey: string, email: string, origin: string): Promise<void> {
  try {
    const res = await fetch(`${origin}/datos/ultimos.json`);
    const { analisis } = (await res.json()) as {
      analisis: { title: string; bajada: string; url: string; kicker?: string }[];
    };
    const tarjetas = analisis.map(tarjetaAnalisis).join('');
    const html = brandedEmail({
      heading: 'Bienvenido a la mesa',
      preheader: 'Tu suscripción quedó confirmada. Esto es lo último de la casa.',
      bodyHtml: `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Tu suscripción al boletín de <strong>Campiva Intelligence</strong> quedó confirmada. Cada viernes vas a recibir el resumen de la semana en los mercados agro de Bolivia y LATAM — con cifras verificadas y la lectura de la casa.</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">Mientras tanto, arrancá por lo último que publicamos:</p>
${tarjetas}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto 4px;"><tr><td style="background:#0b1a2e;border-radius:9px;">
<a href="https://intelligence.campivacorp.com" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Ver todo en la web</a>
</td></tr></table>`,
      footerNota: 'Recibís este correo porque confirmaste tu suscripción. Podés darte de baja desde cualquier boletín.',
    });
    await sendTransactional(apiKey, email, 'Bienvenido a Campiva Intelligence', html);
  } catch {
    // El alta ya ocurrió; un welcome fallido no debe romper la confirmación.
  }
}

async function hmacHex(mensaje: string, secreto: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(mensaje));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet(context: {
  request: Request;
  env: { BREVO_API_KEY: string; DOI_SECRET: string };
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const irA = (p: string) => Response.redirect(`${url.origin}${p}`, 303);

  const token = url.searchParams.get('t') ?? '';
  const partes = token.split('.');
  if (partes.length !== 3) return irA('/suscripcion/error/');

  let email = '';
  try {
    email = atob(partes[0]);
  } catch {
    return irA('/suscripcion/error/');
  }
  const exp = Number(partes[1]);
  if (!exp || Date.now() > exp) return irA('/suscripcion/error/');

  const esperada = await hmacHex(`${email}|${exp}`, env.DOI_SECRET.trim());
  if (esperada !== partes[2]) return irA('/suscripcion/error/');

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY.trim(), 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      listIds: [LISTA_BOLETIN_WEB],
      updateEnabled: true,
      attributes: { FUENTE: 'web' },
    }),
  });

  if (!r.ok) return irA('/suscripcion/error/');
  await enviarBienvenida(env.BREVO_API_KEY, email, url.origin);
  return irA('/suscripcion/confirmada/');
}
