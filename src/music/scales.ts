import {
  FRET_COUNT,
  STANDARD_TUNING,
  noteToPitchClass,
  type NoteName,
} from './notes';
import {
  getShapeWindow,
  type CagedShape,
  type ChordQuality,
  type FretPosition,
} from './caged';

export type ScaleType =
  | 'major'
  | 'naturalMinor'
  | 'pentatonicMajor'
  | 'pentatonicMinor'
  | 'blues'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian'
  | 'harmonicMinor'
  | 'melodicMinor';

export interface ScaleDef {
  id: ScaleType;
  name: string;
  /** Intervalos en semitonos respecto de la fundamental. */
  intervals: number[];
}

export const SCALES: ScaleDef[] = [
  { id: 'major', name: 'Mayor', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'naturalMinor', name: 'Menor natural', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'pentatonicMajor', name: 'Pentatónica mayor', intervals: [0, 2, 4, 7, 9] },
  { id: 'pentatonicMinor', name: 'Pentatónica menor', intervals: [0, 3, 5, 7, 10] },
  { id: 'blues', name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  { id: 'dorian', name: 'Dórica', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'phrygian', name: 'Frigia', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'lydian', name: 'Lidia', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixolydian', name: 'Mixolidia', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'locrian', name: 'Locria', intervals: [0, 1, 3, 5, 6, 8, 10] },
  { id: 'harmonicMinor', name: 'Menor armónica', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: 'melodicMinor', name: 'Menor melódica', intervals: [0, 2, 3, 5, 7, 9, 11] },
];

const SCALE_MAP: Record<ScaleType, ScaleDef> = Object.fromEntries(
  SCALES.map((s) => [s.id, s]),
) as Record<ScaleType, ScaleDef>;

export function getScaleDef(scale: ScaleType): ScaleDef {
  return SCALE_MAP[scale];
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/**
 * Acorde (mayor/menor) sobre el que se apoyan las figuras CAGED de cada escala.
 * Las escalas sin entrada no se dividen en figuras.
 */
const SCALE_CHORD_QUALITY: Partial<Record<ScaleType, ChordQuality>> = {
  major: 'major',
  pentatonicMajor: 'major',
  naturalMinor: 'minor',
  pentatonicMinor: 'minor',
};

export function scaleHasFigures(scale: ScaleType): boolean {
  return scale in SCALE_CHORD_QUALITY;
}

/**
 * Relleno (en trastes) que se agrega a la ventana del acorde a cada lado.
 *
 * Cada figura termina midiendo 5 trastes: las formas A y E (acorde de 3
 * trastes) se amplían a ambos lados; las formas C, G y D (acorde de 4 trastes)
 * suman un solo traste, hacia arriba en escalas menores y hacia abajo en
 * mayores.
 */
const FIGURE_PADDING: Record<
  ChordQuality,
  Record<CagedShape, { lo: number; hi: number }>
> = {
  major: {
    C: { lo: 1, hi: 0 },
    A: { lo: 1, hi: 1 },
    G: { lo: 1, hi: 0 },
    E: { lo: 1, hi: 1 },
    D: { lo: 1, hi: 0 },
  },
  minor: {
    C: { lo: 0, hi: 1 },
    A: { lo: 1, hi: 1 },
    G: { lo: 0, hi: 1 },
    E: { lo: 1, hi: 1 },
    D: { lo: 0, hi: 1 },
  },
};

/**
 * Notas de la escala dentro de la figura del sistema CAGED indicada.
 *
 * Cada figura se ancla a la ventana de trastes de la forma de acorde CAGED
 * correspondiente (la escala "rodea" a ese acorde) y se rellena con las notas
 * de la escala. Se dibuja en todas las octavas que entren en el mástil.
 */
export function getScaleCagedFigure(
  root: NoteName,
  scale: ScaleType,
  shape: CagedShape,
): FretPosition[] {
  const quality = SCALE_CHORD_QUALITY[scale];
  if (!quality) return getScaleTones(root, scale);

  const rootClass = noteToPitchClass(root);
  const intervals = SCALE_MAP[scale].intervals;
  const inScale = (pitchClass: number) =>
    intervals.includes(mod12(pitchClass - rootClass));

  const { lo, hi } = getShapeWindow(root, quality, shape);
  const pad = FIGURE_PADDING[quality][shape];

  const positions: FretPosition[] = [];
  for (let shift = 0; lo - pad.lo + shift <= FRET_COUNT; shift += 12) {
    const wLo = Math.max(0, lo - pad.lo + shift);
    const wHi = Math.min(FRET_COUNT, hi + pad.hi + shift);
    for (let stringIndex = 0; stringIndex < STANDARD_TUNING.length; stringIndex++) {
      for (let fret = wLo; fret <= wHi; fret++) {
        const pitchClass = mod12(STANDARD_TUNING[stringIndex].pitchClass + fret);
        if (!inScale(pitchClass)) continue;
        const interval = mod12(pitchClass - rootClass);
        positions.push({
          stringIndex,
          fret,
          pitchClass,
          interval,
          isRoot: interval === 0,
        });
      }
    }
  }
  return positions;
}

/** Todas las notas de la escala a lo largo de todo el mástil. */
export function getScaleTones(root: NoteName, scale: ScaleType): FretPosition[] {
  const rootClass = noteToPitchClass(root);
  const intervals = new Set(
    SCALE_MAP[scale].intervals.map((i) => mod12(rootClass + i)),
  );

  const positions: FretPosition[] = [];
  for (let stringIndex = 0; stringIndex < STANDARD_TUNING.length; stringIndex++) {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const pitchClass = mod12(STANDARD_TUNING[stringIndex].pitchClass + fret);
      if (!intervals.has(pitchClass)) continue;
      const interval = mod12(pitchClass - rootClass);
      positions.push({
        stringIndex,
        fret,
        pitchClass,
        interval,
        isRoot: interval === 0,
      });
    }
  }
  return positions;
}
