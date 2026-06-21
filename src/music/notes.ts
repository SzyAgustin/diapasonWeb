export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

/** Clase de altura (0-11) de cada nombre de nota. */
export type PitchClass = number;

export function noteToPitchClass(note: NoteName): PitchClass {
  return NOTE_NAMES.indexOf(note);
}

export function pitchClassToNote(pc: PitchClass): NoteName {
  return NOTE_NAMES[((pc % 12) + 12) % 12];
}

/**
 * Afinación estándar de guitarra, de la 6ª cuerda (Mi grave) a la 1ª (Mi agudo).
 * El índice 0 es la 6ª cuerda. Guardamos la clase de altura de cada cuerda al aire.
 */
export const STANDARD_TUNING: { name: NoteName; pitchClass: PitchClass }[] = [
  { name: 'E', pitchClass: 4 }, // 6ª cuerda - Mi grave
  { name: 'A', pitchClass: 9 }, // 5ª cuerda - La
  { name: 'D', pitchClass: 2 }, // 4ª cuerda - Re
  { name: 'G', pitchClass: 7 }, // 3ª cuerda - Sol
  { name: 'B', pitchClass: 11 }, // 2ª cuerda - Si
  { name: 'E', pitchClass: 4 }, // 1ª cuerda - Mi agudo
];

export const STRING_COUNT = STANDARD_TUNING.length;
export const FRET_COUNT = 24;

export type Instrument = 'guitar' | 'bass';

/** Afinación a mostrar según el instrumento (el bajo usa las 4 cuerdas graves). */
export function getTuning(
  instrument: Instrument,
): { name: NoteName; pitchClass: PitchClass }[] {
  return instrument === 'bass' ? STANDARD_TUNING.slice(0, 4) : STANDARD_TUNING;
}
