import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { labelPais, labelVertical } from '../lib/format';

export async function GET(context: APIContext) {
  const entries = (await getCollection('analisis')).sort(
    (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime(),
  );
  return rss({
    title: 'Campiva Intelligence — Mercados agroindustriales de Bolivia y LATAM',
    description:
      'Análisis de mercados agro con cifras verificadas y lectura propia: soya, café, cacao, cereales, biocombustibles y logística. Por el Campiva Intelligence Desk.',
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
