import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { labelPais, labelTipo, labelVertical } from '../../lib/format';

// Endpoint estático: lo publicado en los últimos 7 días (análisis + top del radar)
// para el boletín semanal. Lo consume la tarea programada boletin-semanal-campiva.
// Nota: la fecha de corte se calcula contra la fecha del build (cada corrida).
export const GET: APIRoute = async () => {
  const corte = Date.now() - 7 * 24 * 3600 * 1000;

  const analisis = (await getCollection('analisis'))
    .filter((e) => e.data.fecha.getTime() >= corte)
    .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime())
    .map((e) => ({
      title: e.data.title,
      bajada: e.data.bajada,
      lectura: e.data.lectura,
      score: e.data.score,
      kicker: `${labelTipo(e.data.tipo)} · ${labelVertical(e.data.vertical)} · ${labelPais(e.data.pais)}`,
      url: `https://intelligence.campivacorp.com/analisis/${e.id}/`,
    }));

  // Radar: juntar los items de los archivos de los últimos 7 días, top por score
  const radarFiles = import.meta.glob<{ fecha: string; items: any[] }>('../../data/radar/*.json', {
    eager: true,
  });
  const radar = Object.values(radarFiles)
    .filter((r) => new Date(r.fecha).getTime() >= corte)
    .flatMap((r) => r.items)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((i) => ({
      titular: i.titular,
      resumen: i.resumen,
      fuente: i.fuente,
      url: i.url,
      score: i.score,
      vertical: labelVertical(i.vertical),
    }));

  return new Response(JSON.stringify({ desde: new Date(corte).toISOString().slice(0, 10), analisis, radar }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
