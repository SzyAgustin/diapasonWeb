import { TRIAD_ROWS, type Triad } from '../music/triads';

/** Las 24 triadas mayores y menores, en el orden del catálogo. */
export function allPracticeTriads(): Triad[] {
  return TRIAD_ROWS.flatMap((row) => [row.major, row.minor]);
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
export function reshuffleAvoiding(previous: Triad): Triad[] {
  const next = shuffleTriads(allPracticeTriads());
  if (next.length > 1 && next[0].label === previous.label) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
}
