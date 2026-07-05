/** Helpers de formato y taxonomías — Campiva Intelligence */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Fecha absoluta en español: "5 de julio de 2026" (regla del desk: nunca fechas relativas) */
export function fmtFecha(d: Date): string {
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function fmtFechaCorta(d: Date): string {
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
}

export const VERTICALES: Record<string, string> = {
  soya: 'Soya y girasol',
  cafe: 'Café',
  cacao: 'Cacao',
  cereales: 'Cereales',
  'granos-andinos': 'Granos andinos',
  'proteina-animal': 'Proteína animal',
  'nutricion-animal': 'Nutrición animal',
  'azucar-etanol': 'Azúcar y etanol',
  energia: 'Energía y biocombustibles',
  logistica: 'Logística',
  clima: 'Clima',
  macro: 'Macro y regulación',
};

export const PAISES: Record<string, string> = {
  BO: 'Bolivia',
  PE: 'Perú',
  BR: 'Brasil',
  AR: 'Argentina',
  PY: 'Paraguay',
  EC: 'Ecuador',
  CO: 'Colombia',
  UY: 'Uruguay',
  US: 'EE.UU.',
  LATAM: 'LATAM',
  GLOBAL: 'Global',
};

export const TIPOS: Record<string, string> = {
  'analisis-ejecutivo': 'Análisis ejecutivo',
  'alerta-mercado': 'Alerta de mercado',
  'cambio-regulatorio': 'Cambio regulatorio',
  'tendencia-estructural': 'Tendencia estructural',
  ranking: 'Ranking',
  'dato-estrategico': 'Dato estratégico',
  logistica: 'Logística',
  agtech: 'AgTech',
  'caso-exito': 'Caso de éxito',
};

export function labelVertical(v: string): string {
  return VERTICALES[v] ?? v;
}
export function labelPais(p: string): string {
  return PAISES[p] ?? p;
}
export function labelTipo(t: string): string {
  return TIPOS[t] ?? t;
}

/** Minutos de lectura estimados desde el cuerpo markdown */
export function tiempoLectura(body: string): number {
  const palabras = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 220));
}
