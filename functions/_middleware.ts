// Redirección 301 del dominio temporal al oficial (go-live 2026-07-06).
// Solo el hostname canónico de pages.dev redirige; los deployments con hash
// (previews internos) y el dominio oficial pasan directo.
// Re-aplicado tras verificar que intelligence.campivacorp.com está activa (lección: DNS primero).

const DOMINIO_OFICIAL = 'https://intelligence.campivacorp.com';

export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const url = new URL(context.request.url);
  if (url.hostname === 'campiva-intelligence.pages.dev') {
    return Response.redirect(`${DOMINIO_OFICIAL}${url.pathname}${url.search}`, 301);
  }
  return context.next();
}
