import { useState } from 'react';
import { noteNameInSpanish, type Triad } from '../music/triads';
import { allPracticeTriads, reshuffleAvoiding, shuffleTriads } from './deck';

function promptName(triad: Triad): string {
  const root = noteNameInSpanish(triad.notes[0].name);
  const titled = root.charAt(0).toUpperCase() + root.slice(1);
  return triad.quality === 'major' ? `${titled} mayor` : `${titled} menor`;
}

export function TriadPractice() {
  const [order, setOrder] = useState<Triad[]>(() => shuffleTriads(allPracticeTriads()));
  const [index, setIndex] = useState(0);
  const triad = order[index];

  const goNext = () => {
    if (index + 1 < order.length) {
      setIndex(index + 1);
      return;
    }
    setOrder(reshuffleAvoiding(triad));
    setIndex(0);
  };

  return (
    <section className="practice" aria-label="Práctica de triadas">
      <div className="practice-top">
        <span className="control-label">Práctica</span>
        <span className="practice-count">
          {index + 1} / {order.length}
        </span>
      </div>
      <p className="practice-name">{promptName(triad)}</p>
      <p className="practice-symbol">{triad.label}</p>
      <p className="practice-help">
        Decí la fundamental, la tercera y la quinta. Cuando la tengas, pasá a la siguiente.
      </p>
      <div className="practice-actions">
        <button type="button" className="chip" onClick={goNext}>
          Siguiente
        </button>
      </div>
    </section>
  );
}
