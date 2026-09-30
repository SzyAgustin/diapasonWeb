import { useEffect, useState } from 'react';
import { noteToPitchClass, pitchClassToNote, type NoteName } from '../music/notes';
import type { ChordQuality } from '../music/caged';
import { speakSpanishList, stopSpeaking } from '../music/speakSpanish';
import { TRIAD_ROWS, triadNotesInSpanish, triadNotesSpoken, type Triad } from '../music/triads';

interface TriadAtlasProps {
  root: NoteName;
  quality: ChordQuality;
  onSelect: (root: NoteName, quality: ChordQuality) => void;
}

function toneClass(degree: Triad['notes'][number]['degree']): string {
  if (degree === 1) return 'tone tone-root';
  if (degree === 3) return 'tone tone-third';
  return 'tone tone-fifth';
}

function toneTitle(triad: Triad, degree: Triad['notes'][number]['degree']): string {
  if (degree === 1) return 'Fundamental';
  if (degree === 3) return triad.quality === 'major' ? 'Tercera mayor' : 'Tercera menor';
  return 'Quinta justa';
}

function TriadCard({
  triad,
  selected,
  onSelect,
}: {
  triad: Triad;
  selected: boolean;
  onSelect: (root: NoteName, quality: ChordQuality) => void;
}) {
  return (
    <button
      type="button"
      className={`triad-card ${selected ? 'triad-card-active' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(pitchClassToNote(triad.rootPc), triad.quality)}
    >
      <span className="triad-name">{triad.label}</span>
      <span className="triad-body">
        <span className="triad-tones">
          {triad.notes.map((note) => (
            <span key={note.degree} className={toneClass(note.degree)} title={toneTitle(triad, note.degree)}>
              {note.name}
            </span>
          ))}
        </span>
        <span className="triad-spanish">{triadNotesInSpanish(triad)}</span>
      </span>
    </button>
  );
}

const NATURAL = TRIAD_ROWS.filter((row) => row.accidentals === 0);
const SHARPS = TRIAD_ROWS.filter((row) => row.accidentals > 0);
/** De más bemoles a menos: 5♭, 4♭, 3♭, 2♭, 1♭. */
const FLATS = TRIAD_ROWS.filter((row) => row.accidentals < 0).reverse();
const STUDY_ROWS = [...NATURAL, ...SHARPS, ...FLATS];

function TriadHead() {
  return (
    <div className="triad-head">
      <span>Armadura</span>
      <span>
        Mayor <span className="deg deg-1">1</span> <span className="deg deg-3">3</span>{' '}
        <span className="deg deg-5">5</span>
      </span>
      <span>
        Menor <span className="deg deg-1">1</span> <span className="deg deg-3">♭3</span>{' '}
        <span className="deg deg-5">5</span>
      </span>
    </div>
  );
}

function TriadRows({
  rows,
  heading,
  selectedPc,
  quality,
  onSelect,
}: {
  rows: typeof TRIAD_ROWS;
  heading: string;
  selectedPc: number;
  quality: ChordQuality;
  onSelect: (root: NoteName, quality: ChordQuality) => void;
}) {
  return (
    <div className="triad-column">
      {rows.map((row, index) => {
        const sigTitle =
          row.signatureNotes.length === 0
            ? 'Sin alteraciones'
            : row.accidentals > 0
              ? `Sostenidos: ${row.signatureNotes.join(' ')}`
              : `Bemoles: ${row.signatureNotes.join(' ')}`;
        return (
          <div key={row.accidentals}>
            {index === 0 && (
              <div className="triad-split">
                <span>{heading}</span>
              </div>
            )}
            <div className="triad-row">
              <div
                className={`triad-sig ${
                  row.accidentals > 0 ? 'sig-sharp' : row.accidentals < 0 ? 'sig-flat' : 'sig-nat'
                }`}
                title={sigTitle}
              >
                {row.signature}
              </div>
              <TriadCard
                triad={row.major}
                selected={selectedPc === row.major.rootPc && quality === 'major'}
                onSelect={onSelect}
              />
              <TriadCard
                triad={row.minor}
                selected={selectedPc === row.minor.rootPc && quality === 'minor'}
                onSelect={onSelect}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TriadAtlas({ root, quality, onSelect }: TriadAtlasProps) {
  const selectedPc = noteToPitchClass(root);
  const [playing, setPlaying] = useState<ChordQuality | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    synth?.getVoices();
    const warm = () => synth?.getVoices();
    synth?.addEventListener('voiceschanged', warm);
    return () => {
      synth?.removeEventListener('voiceschanged', warm);
      stopSpeaking();
    };
  }, []);

  const togglePlay = (next: ChordQuality) => {
    if (playing === next) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    const phrases = STUDY_ROWS.map((row) =>
      triadNotesSpoken(next === 'major' ? row.major : row.minor),
    );
    setPlaying(next);
    speakSpanishList(phrases, () => setPlaying((current) => (current === next ? null : current)));
  };

  return (
    <section className="triad-atlas" aria-label="Triadas mayores y menores">
      <p className="triad-intro">
        Cada fila es una tonalidad: el acorde mayor y su relativo menor comparten armadura.
        Las tres notas son la fundamental, la tercera y la quinta, escritas con sostenido o
        bemol según esa armadura. Tocá uno para verlo en el diapasón.
      </p>
      <div className="triad-play">
        <button
          type="button"
          className={`chip ${playing === 'major' ? 'chip-active' : ''}`}
          aria-pressed={playing === 'major'}
          onClick={() => togglePlay('major')}
        >
          {playing === 'major' ? 'Detener mayores' : 'Escuchar mayores'}
        </button>
        <button
          type="button"
          className={`chip ${playing === 'minor' ? 'chip-active' : ''}`}
          aria-pressed={playing === 'minor'}
          onClick={() => togglePlay('minor')}
        >
          {playing === 'minor' ? 'Detener menores' : 'Escuchar menores'}
        </button>
      </div>

      <div className="triad-natural">
        <TriadHead />
        <TriadRows
          rows={NATURAL}
          heading="Sin alteraciones"
          selectedPc={selectedPc}
          quality={quality}
          onSelect={onSelect}
        />
      </div>
      <div className="triad-columns">
        <TriadRows
          rows={SHARPS}
          heading="Sostenidos"
          selectedPc={selectedPc}
          quality={quality}
          onSelect={onSelect}
        />
        <TriadRows
          rows={FLATS}
          heading="Bemoles"
          selectedPc={selectedPc}
          quality={quality}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}
