// GET /api/confirmar?t=<token> — segundo paso del double opt-in: valida el enlace
// firmado del correo y recién entonces agrega el contacto a la lista de Brevo.

const LISTA_BOLETIN_WEB = 3;

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

  const esperada = await hmacHex(`${email}|${exp}`, env.DOI_SECRET);
  if (esperada !== partes[2]) return irA('/suscripcion/error/');

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      listIds: [LISTA_BOLETIN_WEB],
      updateEnabled: true,
      attributes: { FUENTE: 'web' },
    }),
  });

  return r.ok ? irA('/suscripcion/confirmada/') : irA('/suscripcion/error/');
}
