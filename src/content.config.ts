import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const analisis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/analisis' }),
  schema: z.object({
    title: z.string(),
    bajada: z.string(),
    fecha: z.coerce.date(),
    tipo: z.enum([
      'analisis-ejecutivo',
      'alerta-mercado',
      'cambio-regulatorio',
      'tendencia-estructural',
      'ranking',
      'dato-estrategico',
      'logistica',
      'agtech',
      'caso-exito',
    ]),
    vertical: z.string(),
    pais: z.string(), // ISO-2 (BO, PE, BR...) o LATAM / GLOBAL
    score: z.number().min(0).max(10),
    destacado: z.boolean().default(false),
    lectura: z.string(), // "Nuestra lectura" — la opinión de la casa, 1-2 frases
    cifras: z
      .array(
        z.object({
          label: z.string(),
          valor: z.string(),
          nota: z.string().optional(),
        }),
      )
      .default([]),
    fuentes: z
      .array(
        z.object({
          dato: z.string(),
          fuente: z.string(),
          fecha: z.string(),
          url: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { analisis };
