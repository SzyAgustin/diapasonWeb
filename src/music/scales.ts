import {
  FRET_COUNT,
  STANDARD_TUNING,
  noteToPitchClass,
  type NoteName,
} from './notes';
import type { FretPosition } from './caged';

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
