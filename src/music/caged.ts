import {
  FRET_COUNT,
  STANDARD_TUNING,
  noteToPitchClass,
  type NoteName,
  type PitchClass,
} from './notes';

export type ChordQuality = 'major' | 'minor';
export const CAGED_SHAPES = ['C', 'A', 'G', 'E', 'D'] as const;
export type CagedShape = (typeof CAGED_SHAPES)[number];

/**
 * Una posición concreta sobre el diapasón.
 * `stringIndex` 0 = 6ª cuerda (Mi grave), 5 = 1ª cuerda (Mi agudo).
 */
export interface FretPosition {
  stringIndex: number;
  fret: number;
  pitchClass: PitchClass;
  /** Intervalo respecto de la fundamental: 0 = R, 3 = ♭3, 4 = 3, 7 = 5. */
  interval: number;
  isRoot: boolean;
}

interface ShapeNote {
  stringIndex: number;
  fret: number;
}

interface ShapeTemplate {
  /** Clase de altura de la fundamental "natural" de la forma al aire. */
  naturalRootClass: PitchClass;
  /** Trastes de cada cuerda en la posición natural (al aire). Cuerdas omitidas = al aire muteado. */
  notes: ShapeNote[];
  /** Notas adicionales de la forma, visibles solo con el modo "notas extra". */
  extraNotes?: ShapeNote[];
}

/**
 * Plantillas CAGED en su posición "al aire" (natural). Índice de cuerda:
 * 0 = 6ª (Mi grave) ... 5 = 1ª (Mi agudo).
 *
 * Para transportar una forma a otra fundamental se desplaza todo el patrón
 * `delta = (raíz - raízNatural) mod 12` trastes hacia arriba. Como todos los
 * trastes de las plantillas son >= 0 y delta >= 0, el resultado siempre cae
 * dentro del mástil.
 */
const SHAPE_TEMPLATES: Record<ChordQuality, Record<CagedShape, ShapeTemplate>> = {
  major: {
    // Acorde de Do mayor al aire (fundamental Do en 5ª cuerda, traste 3).
    C: {
      naturalRootClass: 0,
      notes: [
        { stringIndex: 1, fret: 3 },
        { stringIndex: 2, fret: 2 },
        { stringIndex: 3, fret: 0 },
        { stringIndex: 4, fret: 1 },
        { stringIndex: 5, fret: 0 },
      ],
      // 5ta en la 6ta cuerda (Sol).
      extraNotes: [{ stringIndex: 0, fret: 3 }],
    },
    // Acorde de La mayor al aire (fundamental La en 5ª cuerda al aire).
    A: {
      naturalRootClass: 9,
      notes: [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 2, fret: 2 },
        { stringIndex: 3, fret: 2 },
        { stringIndex: 4, fret: 2 },
        { stringIndex: 5, fret: 0 },
      ],
      // 5ta en la 6ta cuerda (Mi).
      extraNotes: [{ stringIndex: 0, fret: 0 }],
    },
    // Acorde de Sol mayor (fundamental Sol en 6ª cuerda, traste 3).
    // En la 2ª cuerda usamos la quinta (traste 3 = Re) en vez de la tercera.
    G: {
      naturalRootClass: 7,
      notes: [
        { stringIndex: 0, fret: 3 },
        { stringIndex: 1, fret: 2 },
        { stringIndex: 2, fret: 0 },
        { stringIndex: 3, fret: 0 },
        { stringIndex: 4, fret: 3 },
        { stringIndex: 5, fret: 3 },
      ],
    },
    // Acorde de Mi mayor al aire (fundamental Mi en 6ª cuerda al aire).
    E: {
      naturalRootClass: 4,
      notes: [
        { stringIndex: 0, fret: 0 },
        { stringIndex: 1, fret: 2 },
        { stringIndex: 2, fret: 2 },
        { stringIndex: 3, fret: 1 },
        { stringIndex: 4, fret: 0 },
        { stringIndex: 5, fret: 0 },
      ],
    },
    // Acorde de Re mayor al aire (fundamental Re en 4ª cuerda al aire).
    D: {
      naturalRootClass: 2,
      notes: [
        { stringIndex: 2, fret: 0 },
        { stringIndex: 3, fret: 2 },
        { stringIndex: 4, fret: 3 },
        { stringIndex: 5, fret: 2 },
      ],
      // 5ta en la 5ta cuerda (La) y 3era en la 6ta cuerda (Fa#).
      extraNotes: [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 0, fret: 2 },
      ],
    },
  },
  minor: {
    // Forma de Do menor (la 1ª cuerda se omite por no ser cómoda al aire).
    C: {
      naturalRootClass: 0,
      notes: [
        { stringIndex: 1, fret: 3 },
        { stringIndex: 2, fret: 1 },
        { stringIndex: 3, fret: 0 },
        { stringIndex: 4, fret: 1 },
      ],
      // 5ta en la 1ª cuerda (Sol) y en la 6ta cuerda (Sol).
      extraNotes: [
        { stringIndex: 5, fret: 3 },
        { stringIndex: 0, fret: 3 },
      ],
    },
    // Acorde de La menor al aire.
    A: {
      naturalRootClass: 9,
      notes: [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 2, fret: 2 },
        { stringIndex: 3, fret: 2 },
        { stringIndex: 4, fret: 1 },
        { stringIndex: 5, fret: 0 },
      ],
      // 5ta en la 6ta cuerda (Mi).
      extraNotes: [{ stringIndex: 0, fret: 0 }],
    },
    // Forma de Sol menor: en la 2ª cuerda usamos la quinta (traste 3 = Re).
    G: {
      naturalRootClass: 7,
      notes: [
        { stringIndex: 0, fret: 3 },
        { stringIndex: 1, fret: 1 },
        { stringIndex: 2, fret: 0 },
        { stringIndex: 3, fret: 0 },
        { stringIndex: 4, fret: 3 },
        { stringIndex: 5, fret: 3 },
      ],
    },
    // Acorde de Mi menor al aire.
    E: {
      naturalRootClass: 4,
      notes: [
        { stringIndex: 0, fret: 0 },
        { stringIndex: 1, fret: 2 },
        { stringIndex: 2, fret: 2 },
        { stringIndex: 3, fret: 0 },
        { stringIndex: 4, fret: 0 },
        { stringIndex: 5, fret: 0 },
      ],
    },
    // Acorde de Re menor al aire.
    D: {
      naturalRootClass: 2,
      notes: [
        { stringIndex: 2, fret: 0 },
        { stringIndex: 3, fret: 2 },
        { stringIndex: 4, fret: 3 },
        { stringIndex: 5, fret: 1 },
      ],
      // 5ta en la 5ta cuerda (La) y ♭3 en la 6ta cuerda (Fa).
      extraNotes: [
        { stringIndex: 1, fret: 0 },
        { stringIndex: 0, fret: 1 },
      ],
    },
  },
};

export function getChordIntervals(quality: ChordQuality): number[] {
  return quality === 'major' ? [0, 4, 7] : [0, 3, 7];
}

const INTERVAL_LABELS: Record<number, string> = {
  0: 'R',
  1: '♭2',
  2: '2',
  3: '♭3',
  4: '3',
  5: '4',
  6: '♭5',
  7: '5',
  8: '♭6',
  9: '6',
  10: '♭7',
  11: '7',
};

export function intervalLabel(interval: number): string {
  return INTERVAL_LABELS[((interval % 12) + 12) % 12] ?? String(interval);
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/** Clase de altura que suena en una cuerda y traste dados. */
export function pitchClassAt(stringIndex: number, fret: number): PitchClass {
  return mod12(STANDARD_TUNING[stringIndex].pitchClass + fret);
}

function buildPosition(
  stringIndex: number,
  fret: number,
  rootClass: PitchClass,
): FretPosition {
  const pitchClass = pitchClassAt(stringIndex, fret);
  const interval = mod12(pitchClass - rootClass);
  return { stringIndex, fret, pitchClass, interval, isRoot: interval === 0 };
}

/**
 * Calcula las posiciones de una forma CAGED para un acorde dado.
 * Devuelve la forma en su posición principal y en todas sus repeticiones
 * de octava (+12 trastes) que entren en el mástil.
 */
export function getShapePositions(
  root: NoteName,
  quality: ChordQuality,
  shape: CagedShape,
  includeExtras = false,
): FretPosition[] {
  const rootClass = noteToPitchClass(root);
  const template = SHAPE_TEMPLATES[quality][shape];
  const delta = mod12(rootClass - template.naturalRootClass);
  const notes =
    includeExtras && template.extraNotes
      ? [...template.notes, ...template.extraNotes]
      : template.notes;

  const positions: FretPosition[] = [];
  for (let octave = 0; octave * 12 + delta <= FRET_COUNT; octave++) {
    const shift = delta + octave * 12;
    for (const note of notes) {
      const fret = note.fret + shift;
      if (fret < 0 || fret > FRET_COUNT) continue;
      positions.push(buildPosition(note.stringIndex, fret, rootClass));
    }
  }
  return positions;
}

/**
 * Ventana de trastes (mínimo y máximo) que ocupa una forma CAGED en su
 * posición principal, para usarla como ancla de las figuras de escala.
 */
export function getShapeWindow(
  root: NoteName,
  quality: ChordQuality,
  shape: CagedShape,
): { lo: number; hi: number } {
  const rootClass = noteToPitchClass(root);
  const template = SHAPE_TEMPLATES[quality][shape];
  const delta = mod12(rootClass - template.naturalRootClass);
  const frets = template.notes.map((n) => n.fret + delta);
  return { lo: Math.min(...frets), hi: Math.max(...frets) };
}

/**
 * Todas las notas del acorde a lo largo de todo el mástil (mapa completo).
 */
export function getAllChordTones(
  root: NoteName,
  quality: ChordQuality,
): FretPosition[] {
  const rootClass = noteToPitchClass(root);
  const chordPitchClasses = new Set(
    getChordIntervals(quality).map((i) => mod12(rootClass + i)),
  );

  const positions: FretPosition[] = [];
  for (let stringIndex = 0; stringIndex < STANDARD_TUNING.length; stringIndex++) {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      if (chordPitchClasses.has(pitchClassAt(stringIndex, fret))) {
        positions.push(buildPosition(stringIndex, fret, rootClass));
      }
    }
  }
  return positions;
}

/** Nombre legible del acorde, ej: "Am" o "C". */
export function chordLabel(root: NoteName, quality: ChordQuality): string {
  return quality === 'minor' ? `${root}m` : root;
}
