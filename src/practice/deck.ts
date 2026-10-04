import type { ChordQuality } from '../music/caged';
import { TRIAD_ROWS, type Triad } from '../music/triads';

/** Las 12 triadas de una calidad, en el orden del catálogo. */
export function practiceTriads(quality: ChordQuality): Triad[] {
  return TRIAD_ROWS.map((row) => (quality === 'major' ? row.major : row.minor));
}

export function shuffleTriads(triads: Triad[]): Triad[] {
  const copy = [...triads];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Otro mazo, sin repetir de entrada el acorde que acaba de salir. */
export function reshuffleAvoiding(previous: Triad, quality: ChordQuality): Triad[] {
  const next = shuffleTriads(practiceTriads(quality));
  if (next.length > 1 && next[0].label === previous.label) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}
