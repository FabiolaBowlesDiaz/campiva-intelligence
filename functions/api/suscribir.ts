// POST /api/suscribir — recibe el formulario del boletín y envía el correo de
// confirmación (double opt-in propio: nadie entra a la lista sin el clic del paso 2).
// Env requeridas (Cloudflare Pages secrets): BREVO_API_KEY, DOI_SECRET.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEMPLATE_ID = 1;
const VIGENCIA_HORAS = 48;

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

export async function onRequestPost(context: {
  request: Request;
  env: { BREVO_API_KEY: string; DOI_SECRET: string };
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const irA = (p: string) => Response.redirect(`${url.origin}${p}`, 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return irA('/suscripcion/error/');
  }

  // Honeypot: los humanos no ven este campo; si viene lleno, es un bot.
  if (String(form.get('website') ?? '') !== '') {
    return irA('/suscripcion/pendiente/');
  }

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return irA('/suscripcion/error/');
  }

  const apiKey = env.BREVO_API_KEY.trim();
  const doiSecret = env.DOI_SECRET.trim();
  const exp = Date.now() + VIGENCIA_HORAS * 3600 * 1000;
  const firma = await hmacHex(`${email}|${exp}`, doiSecret);
  const token = `${btoa(email)}.${exp}.${firma}`;
  const confirmUrl = `${url.origin}/api/confirmar?t=${encodeURIComponent(token)}`;

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      to: [{ email }],
      templateId: TEMPLATE_ID,
      params: { confirmUrl },
    }),
  });

  return r.ok ? irA('/suscripcion/pendiente/') : irA('/suscripcion/error/');
}
