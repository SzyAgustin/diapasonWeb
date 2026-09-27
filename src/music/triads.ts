import { noteToPitchClass, pitchClassToNote, type NoteName, type PitchClass } from './notes';
import type { ChordQuality } from './caged';

/**
 * Grafía de una nota dentro de una triada.
 * El nombre sigue la armadura de la tonalidad (no el enarmónico con sostenido).
 */
export interface TriadTone {
  /** 1 = fundamental, 3 = tercera, 5 = quinta. */
  degree: 1 | 3 | 5;
  /** Semitonos desde la fundamental: 0, 3 o 4, 7. */
  interval: number;
  name: string;
  pitchClass: PitchClass;
}

export interface Triad {
  /** Nombre del acorde, p. ej. "Db" o "F#m". */
  label: string;
  quality: ChordQuality;
  rootPc: PitchClass;
  notes: [TriadTone, TriadTone, TriadTone];
  /** Positivo = sostenidos, negativo = bemoles, 0 = ninguna. */
  accidentals: number;
  /** Etiqueta corta de la armadura, p. ej. "2♯" o "—". */
  signature: string;
  /** Frase para el encabezado del diapasón. */
  signatureDetail: string;
}

export interface TriadRow {
  accidentals: number;
  signature: string;
  /** Notas alteradas de la armadura, en el orden en que se agregan. */
  signatureNotes: string[];
  major: Triad;
  minor: Triad;
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
/** Clase de altura de cada letra sin alteración. */
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11] as const;

const SHARPS = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] as const;
const FLATS = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] as const;

interface TonicSpec {
  /** Índice de letra (C=0 … B=6). La tercera y la quinta avanzan por letras, no por semitonos. */
  letter: number;
  pc: PitchClass;
}

/**
 * Elige el accidente para que esa letra caiga en la clase de altura pedida.
 * Así Db mayor es Db–F–Ab, y no C#–F–G#.
 */
function spelledName(letterIndex: number, pc: PitchClass): string {
  const index = ((letterIndex % 7) + 7) % 7;
  const letter = LETTERS[index];
  const natural = NATURAL_PC[index];
  let acc = pc - natural;
  if (acc > 6) acc -= 12;
  if (acc < -6) acc += 12;
  if (acc === 0) return letter;
  if (acc === 1) return `${letter}#`;
  if (acc === -1) return `${letter}b`;
  throw new Error(`Alteración no prevista para ${letter}: ${acc}`);
}

function signatureNotes(accidentals: number): string[] {
  if (accidentals > 0) return SHARPS.slice(0, accidentals);
  if (accidentals < 0) return FLATS.slice(0, -accidentals);
  return [];
}

function signatureLabel(accidentals: number): string {
  if (accidentals === 0) return '—';
  if (accidentals > 0) return `${accidentals}♯`;
  return `${-accidentals}♭`;
}

function signatureDetail(accidentals: number): string {
  const notes = signatureNotes(accidentals);
  if (accidentals === 0) return 'Sin alteraciones';
  if (accidentals === 1) return `1 sostenido: ${notes[0]}`;
  if (accidentals === -1) return `1 bemol: ${notes[0]}`;
  if (accidentals > 1) return `${accidentals} sostenidos: ${notes.join(', ')}`;
  return `${-accidentals} bemoles: ${notes.join(', ')}`;
}

function makeTriad(spec: TonicSpec, quality: ChordQuality, accidentals: number): Triad {
  const thirdInterval = quality === 'major' ? 4 : 3;
  const thirdPc = ((spec.pc + thirdInterval) % 12) as PitchClass;
  const fifthPc = ((spec.pc + 7) % 12) as PitchClass;
  const notes: [TriadTone, TriadTone, TriadTone] = [
    { degree: 1, interval: 0, name: spelledName(spec.letter, spec.pc), pitchClass: spec.pc },
    {
      degree: 3,
      interval: thirdInterval,
      name: spelledName(spec.letter + 2, thirdPc),
      pitchClass: thirdPc,
    },
    {
      degree: 5,
      interval: 7,
      name: spelledName(spec.letter + 4, fifthPc),
      pitchClass: fifthPc,
    },
  ];
  const rootName = notes[0].name;
  return {
    label: quality === 'minor' ? `${rootName}m` : rootName,
    quality,
    rootPc: spec.pc,
    notes,
    accidentals,
    signature: signatureLabel(accidentals),
    signatureDetail: signatureDetail(accidentals),
  };
}

/**
 * Las 12 tonalidades de uso habitual, en orden de armadura:
 * Do, luego sostenidos (por quintas) y después bemoles (por cuartas).
 * Cada fila junta el mayor con su relativo menor.
 *
 * Se usa una sola grafía por clase de altura: F# (no Gb) y Db (no C#).
 * Coincide con las relativas que ya muestra el modo de escalas.
 */
const ROW_SPECS: { accidentals: number; major: TonicSpec; minor: TonicSpec }[] = [
  { accidentals: 0, major: { letter: 0, pc: 0 }, minor: { letter: 5, pc: 9 } },
  { accidentals: 1, major: { letter: 4, pc: 7 }, minor: { letter: 2, pc: 4 } },
  { accidentals: 2, major: { letter: 1, pc: 2 }, minor: { letter: 6, pc: 11 } },
  { accidentals: 3, major: { letter: 5, pc: 9 }, minor: { letter: 3, pc: 6 } },
  { accidentals: 4, major: { letter: 2, pc: 4 }, minor: { letter: 0, pc: 1 } },
  { accidentals: 5, major: { letter: 6, pc: 11 }, minor: { letter: 4, pc: 8 } },
  { accidentals: 6, major: { letter: 3, pc: 6 }, minor: { letter: 1, pc: 3 } },
  { accidentals: -1, major: { letter: 3, pc: 5 }, minor: { letter: 1, pc: 2 } },
  { accidentals: -2, major: { letter: 6, pc: 10 }, minor: { letter: 4, pc: 7 } },
  { accidentals: -3, major: { letter: 2, pc: 3 }, minor: { letter: 0, pc: 0 } },
  { accidentals: -4, major: { letter: 5, pc: 8 }, minor: { letter: 3, pc: 5 } },
  { accidentals: -5, major: { letter: 1, pc: 1 }, minor: { letter: 6, pc: 10 } },
];

export const TRIAD_ROWS: TriadRow[] = ROW_SPECS.map((row) => ({
  accidentals: row.accidentals,
  signature: signatureLabel(row.accidentals),
  signatureNotes: signatureNotes(row.accidentals),
  major: makeTriad(row.major, 'major', row.accidentals),
  minor: makeTriad(row.minor, 'minor', row.accidentals),
}));

const TRIAD_BY_KEY: Map<string, Triad> = new Map(
  TRIAD_ROWS.flatMap((row) => [
    [`${row.major.rootPc}:major`, row.major] as const,
    [`${row.minor.rootPc}:minor`, row.minor] as const,
  ]),
);

/** Triada mayor o menor de esa fundamental, con la grafía convencional de la tonalidad. */
export function getTriad(root: NoteName, quality: ChordQuality): Triad {
  const triad = TRIAD_BY_KEY.get(`${noteToPitchClass(root)}:${quality}`);
  if (!triad) {
    throw new Error(`No hay triada ${quality} para ${root}`);
  }
  return triad;
}

/** Nombre de una nota del acorde según la armadura. Si no es del acorde, cae al nombre con sostenido. */
export function spellTriadTone(
  root: NoteName,
  quality: ChordQuality,
  pitchClass: PitchClass,
): string {
  const tone = getTriad(root, quality).notes.find((note) => note.pitchClass === pitchClass);
  return tone?.name ?? pitchClassToNote(pitchClass);
}
