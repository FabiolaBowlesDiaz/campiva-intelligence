import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fmtFecha, labelTipo, labelVertical } from '../../lib/format';

export async function getStaticPaths() {
  const entries = await getCollection('analisis');
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

/** Nodo satori sin JSX. satori exige display:flex explícito en cada div con hijos. */
function h(type: string, style: Record<string, unknown>, ...children: unknown[]) {
  const st = type === 'div' && !('display' in style) ? { display: 'flex', ...style } : style;
  return {
    type,
    props: {
      style: st,
      children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
    },
  };
}

const read = (p: string) => fs.readFile(path.resolve(p));

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as CollectionEntry<'analisis'>;
  const d = entry.data;
  const [inter400, inter700, news600, isotipo] = await Promise.all([
    read('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
    read('node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
    read('node_modules/@fontsource/newsreader/files/newsreader-latin-600-normal.woff'),
    read('public/isotipo.png'),
  ]);

  const title = d.title.length > 116 ? `${d.title.slice(0, 113)}…` : d.title;
  const kicker = `${labelTipo(d.tipo)} · ${labelVertical(d.vertical)}`.toUpperCase();
  const scoreTxt = `Score ${d.score.toFixed(1).replace('.', ',')}`;

  const tree = h(
    'div',
    {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#060f1c',
      backgroundImage: 'linear-gradient(135deg, #060f1c 0%, #0b1a2e 55%, #122b1f 100%)',
      fontFamily: 'Inter',
    },
    h('div', {
      height: '10px',
      width: '100%',
      backgroundImage: 'linear-gradient(90deg, #95b444, #cbdc53)',
    }),
    h(
      'div',
      { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '52px 64px 44px' },
      // Header: isotipo + wordmark + kicker
      h(
        'div',
        { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        h(
          'div',
          { display: 'flex', alignItems: 'center', gap: '16px' },
          {
            type: 'img',
            props: {
              src: `data:image/png;base64,${isotipo.toString('base64')}`,
              width: 61,
              height: 36,
              style: { width: '61px', height: '36px' },
            },
          },
          h(
            'div',
            { display: 'flex', fontSize: '30px', color: '#ffffff' },
            h('span', { fontWeight: 700 }, 'campiva'),
            h('span', { fontWeight: 400, color: '#b9cbe0' }, ' intelligence'),
            h('span', { fontWeight: 700, color: '#cbdc53' }, '.'),
          ),
        ),
        h(
          'div',
          {
            display: 'flex',
            fontSize: '19px',
            fontWeight: 700,
            letterSpacing: '3px',
            color: '#cbdc53',
            border: '2px solid rgba(203, 220, 83, 0.45)',
            borderRadius: '999px',
            padding: '10px 24px',
          },
          kicker,
        ),
      ),
      // Título
      h(
        'div',
        {
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          fontFamily: 'Newsreader',
          fontSize: title.length > 70 ? '54px' : '62px',
          fontWeight: 600,
          lineHeight: 1.14,
          color: '#ffffff',
          paddingRight: '40px',
        },
        title,
      ),
      // Pie
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(124, 141, 166, 0.35)',
          paddingTop: '28px',
          fontSize: '22px',
          color: '#8fa9c8',
        },
        h('div', { display: 'flex' }, `Campiva Intelligence Desk · ${fmtFecha(d.fecha)}`),
        h(
          'div',
          {
            display: 'flex',
            fontWeight: 700,
            color: d.score >= 8.5 ? '#e8b54a' : '#cbdc53',
          },
          scoreTxt,
        ),
      ),
    ),
  );

  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
      { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
      { name: 'Newsreader', data: news600, weight: 600, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
