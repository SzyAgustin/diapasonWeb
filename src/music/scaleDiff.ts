import { intervalLabel } from './caged';
import { getScaleDef, type ScaleType } from './scales';

export interface ScaleAlteration {
  /** Grado diatónico 1–7. */
  degree: number;
  from: number;
  to: number;
}

export interface ScaleDiff {
  alterations: ScaleAlteration[];
  added: number[];
  removed: number[];
  /** Intervalos que están solo en la segunda escala (notas nuevas o alteradas). */
  highlightIntervals: number[];
  /** Intervalos que están solo en la primera escala (notas que desaparecen). */
  ghostIntervals: number[];
  summary: string;
}

const DEGREE_NOUN: Record<number, string> = {
  1: 'tónica',
  2: 'segunda',
  3: 'tercera',
  4: 'cuarta',
  5: 'quinta',
  6: 'sexta',
  7: 'séptima',
};

function degreeOf(interval: number): number {
  if (interval === 0) return 1;
  if (interval <= 2) return 2;
  if (interval <= 4) return 3;
  if (interval === 5) return 4;
  // ♯4 / ♭5: por defecto se trata como 4ª; el emparejamiento con 5 lo corrige.
  if (interval === 6) return 4;
  if (interval === 7) return 5;
  if (interval <= 9) return 6;
  return 7;
}

/** Si el par cruza el tritone, el grado lo define la dirección del cambio. */
function degreeForPair(from: number, to: number): number {
  if ((from === 5 && to === 6) || (from === 6 && to === 5)) return 4;
  if ((from === 6 && to === 7) || (from === 7 && to === 6)) return 5;
  return degreeOf(to);
}

function joinEs(parts: string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function compareIntervals(from: number[], to: number[]): Omit<ScaleDiff, 'summary'> {
  const fromSet = new Set(from);
  const toSet = new Set(to);
  const onlyFrom = from.filter((i) => !toSet.has(i));
  const onlyTo = to.filter((i) => !fromSet.has(i));

  const alterations: ScaleAlteration[] = [];
  const usedFrom = new Set<number>();
  const usedTo = new Set<number>();

  for (const a of onlyFrom) {
    const match = onlyTo.find((b) => !usedTo.has(b) && degreeOf(b) === degreeOf(a));
    if (match === undefined) continue;
    alterations.push({ degree: degreeForPair(a, match), from: a, to: match });
    usedFrom.add(a);
    usedTo.add(match);
  }

  for (const a of onlyFrom) {
    if (usedFrom.has(a)) continue;
    let best: number | undefined;
    let bestDist = Infinity;
    for (const b of onlyTo) {
      if (usedTo.has(b)) continue;
      const dist = Math.abs(a - b);
      if (dist === 1 && dist < bestDist) {
        bestDist = dist;
        best = b;
      }
    }
    if (best === undefined) continue;
    alterations.push({ degree: degreeForPair(a, best), from: a, to: best });
    usedFrom.add(a);
    usedTo.add(best);
  }

  return {
    alterations,
    added: onlyTo.filter((i) => !usedTo.has(i)),
    removed: onlyFrom.filter((i) => !usedFrom.has(i)),
    highlightIntervals: onlyTo,
    ghostIntervals: onlyFrom,
  };
}

function formatSummary(diff: Omit<ScaleDiff, 'summary'>): string {
  const parts: string[] = [];

  for (const alt of diff.alterations) {
    const noun = DEGREE_NOUN[alt.degree] ?? `grado ${alt.degree}`;
    const dir = alt.to > alt.from ? 'aumentada' : 'disminuida';
    parts.push(
      `la ${noun} está ${dir} (${intervalLabel(alt.from)} → ${intervalLabel(alt.to)})`,
    );
  }

  if (diff.added.length > 0) {
    const labels = diff.added.map((i) => `la ${intervalLabel(i)}`);
    const verb = diff.added.length === 1 ? 'Se agrega' : 'Se agregan';
    parts.push(`${verb} ${joinEs(labels)}`);
  }

  if (diff.removed.length > 0) {
    const labels = diff.removed.map((i) => `la ${intervalLabel(i)}`);
    const verb = diff.removed.length === 1 ? 'Desaparece' : 'Desaparecen';
    parts.push(`${verb} ${joinEs(labels)}`);
  }

  if (parts.length === 0) return 'No hay notas distintas.';
  return `${capitalize(joinEs(parts))}.`;
}

export function diffScales(from: ScaleType, to: ScaleType): ScaleDiff {
  const compared = compareIntervals(getScaleDef(from).intervals, getScaleDef(to).intervals);
  return { ...compared, summary: formatSummary(compared) };
}
