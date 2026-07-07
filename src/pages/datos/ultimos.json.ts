import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { labelTipo, labelVertical } from '../../lib/format';

// Endpoint estático (se regenera en cada build/corrida): últimos 3 análisis
// para el correo de bienvenida. Lo consume functions/api/confirmar.ts.
export const GET: APIRoute = async () => {
  const analisis = (await getCollection('analisis'))
    .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime())
    .slice(0, 3)
    .map((e) => ({
      title: e.data.title,
      bajada: e.data.bajada,
      kicker: `${labelTipo(e.data.tipo)} · ${labelVertical(e.data.vertical)}`,
      url: `https://intelligence.campivacorp.com/analisis/${e.id}/`,
    }));
  return new Response(JSON.stringify({ analisis }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
