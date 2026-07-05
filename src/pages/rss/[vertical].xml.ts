import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { labelPais, labelVertical } from '../../lib/format';

export async function getStaticPaths() {
  const entries = await getCollection('analisis');
  const verticales = [...new Set(entries.map((e) => e.data.vertical))];
  return verticales.map((vertical) => ({ params: { vertical } }));
}

export async function GET(context: APIContext) {
  const vertical = context.params.vertical!;
  const entries = (await getCollection('analisis'))
    .filter((e) => e.data.vertical === vertical)
    .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
  return rss({
    title: `Campiva Intelligence — ${labelVertical(vertical)}`,
    description: `Análisis del Campiva Intelligence Desk sobre ${labelVertical(vertical).toLowerCase()} en Bolivia y LATAM, con cifras verificadas.`,
    site: context.site!,
    items: entries.map((e) => ({
      title: e.data.title,
      description: e.data.bajada,
      pubDate: e.data.fecha,
      link: `/analisis/${e.id}/`,
      categories: [labelVertical(e.data.vertical), labelPais(e.data.pais)],
    })),
    customData: '<language>es</language>',
  });
}
