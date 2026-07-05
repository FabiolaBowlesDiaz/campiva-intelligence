# Campiva Intelligence

Web de noticias e inteligencia de mercados agroindustriales de [Campivacorp](https://campivacorp.com/) — análisis del desk, radar diario de titulares curados e indicadores de mercado para ejecutivos agro de Bolivia y LATAM.

**Plan maestro y contexto:** `OneDrive\Ronald Campbell\Campiva\noiticas agro web\PLAN-MAESTRO-WEB-NOTICIAS-CAMPIVA.md`
**Tracking:** [Linear — Web Noticias Campiva](https://linear.app/drimian/project/web-noticias-campiva-e9c85b49a2aa) (issues PER-18 … PER-29)

## Stack

- [Astro 5](https://astro.build) + content collections (markdown)
- Tailwind CSS 4 (tokens de marca en `src/styles/global.css`)
- Deploy: Cloudflare Pages (push a `main` = deploy)
- Tipografía: Newsreader (editorial) + Inter (UI), self-hosted vía Fontsource

## Comandos

| Comando | Acción |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run dev` | Dev server en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Previsualizar el build |

## Cómo se publica contenido

El contenido lo produce el **Campiva Intelligence Desk** (pipeline del agente, ver blueprint en OneDrive). Este repo solo recibe archivos:

| Contenido | Path | Aprobación |
|---|---|---|
| Análisis | `src/content/analisis/AAAA-MM-DD-slug.md` | Humana, antes del push |
| Radar del día | `src/data/radar/AAAA-MM-DD.json` | Automática (guardrails del blueprint) |
| Indicadores | `src/data/indicadores.json` | Automática (fuentes citadas) |

**Reglas editoriales innegociables** (heredadas del blueprint §9): ninguna cifra sin fuente
verificada y fechada; fechas absolutas; neutralidad política; disclaimer de no-asesoría;
en el radar, solo titular propio + resumen + link (nunca contenido reproducido).

## Frontmatter de un análisis

```yaml
title: ""
bajada: ""
fecha: 2026-07-02
tipo: analisis-ejecutivo   # ver src/content.config.ts
vertical: soya             # ver src/lib/format.ts
pais: BO                   # ISO-2, LATAM o GLOBAL
score: 8.1                 # matriz de priorización del desk
destacado: false           # true = hero de portada
lectura: ""                # "Nuestra lectura" — 1-2 frases
cifras: [{ label, valor, nota }]     # máx. 3 se muestran
fuentes: [{ dato, fuente, fecha, url }]
```

## Secretos

Credenciales en `.env` (nunca commiteado; plantilla en `.env.example`).
