import { useEffect, useState } from 'react';
import { noteToPitchClass, pitchClassToNote, type NoteName } from '../music/notes';
import type { ChordQuality } from '../music/caged';
import { speakSpanishList, stopSpeaking } from '../music/speakSpanish';
import { TRIAD_ROWS, triadNotesInSpanish, triadNotesSpoken, type Triad } from '../music/triads';

interface TriadAtlasProps {
  root: NoteName;
  quality: ChordQuality;
  answerLabel: string | null;
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
  answer,
  onSelect,
}: {
  triad: Triad;
  selected: boolean;
  answer: boolean;
  onSelect: (root: NoteName, quality: ChordQuality) => void;
}) {
  return (
    <button
      type="button"
      className={`triad-card${selected ? ' triad-card-active' : ''}${answer ? ' triad-card-answer' : ''}`}
      aria-pressed={selected}
      aria-current={answer ? 'true' : undefined}
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
/** De menos bemoles a más: 1♭, 2♭, 3♭, 4♭, 5♭. */
const FLATS = TRIAD_ROWS.filter((row) => row.accidentals < 0);
const STUDY_ROWS = [...NATURAL, ...SHARPS, ...FLATS];

function TriadHead({ quality }: { quality: ChordQuality }) {
  const minor = quality === 'minor';
  return (
    <div className="triad-head">
      <span>Armadura</span>
      <span>
        {minor ? 'Menor' : 'Mayor'} <span className="deg deg-1">1</span>{' '}
        <span className="deg deg-3">{minor ? '♭3' : '3'}</span> <span className="deg deg-5">5</span>
      </span>
    </div>
  );
}

function TriadRows({
  rows,
  heading,
  selectedPc,
  quality,
  answerLabel,
  onSelect,
}: {
  rows: typeof TRIAD_ROWS;
  heading: string;
  selectedPc: number;
  quality: ChordQuality;
  answerLabel: string | null;
  onSelect: (root: NoteName, quality: ChordQuality) => void;
}) {
  return (
    <div className="triad-column">
      {rows.map((row, index) => {
        const triad = quality === 'major' ? row.major : row.minor;
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
                triad={triad}
                selected={selectedPc === triad.rootPc}
                answer={answerLabel === triad.label}
                onSelect={onSelect}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TriadAtlas({ root, quality, answerLabel, onSelect }: TriadAtlasProps) {
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

  useEffect(() => {
    stopSpeaking();
    setPlaying(null);
  }, [quality]);

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
    <section className="triad-atlas" aria-label={quality === 'major' ? 'Triadas mayores' : 'Triadas menores'}>
      <p className="triad-intro">
        {quality === 'major'
          ? 'Cada fila es una tonalidad mayor y su armadura. Tocá un acorde para verlo en el diapasón.'
          : 'Cada fila es una tonalidad menor, con la misma armadura que su relativo mayor. Tocá un acorde para verlo en el diapasón.'}
      </p>
      <div className="triad-play">
        <button
          type="button"
          className={`chip ${playing === quality ? 'chip-active' : ''}`}
          aria-pressed={playing === quality}
          onClick={() => togglePlay(quality)}
        >
          {playing === quality
            ? 'Detener'
            : quality === 'major'
              ? 'Escuchar mayores'
              : 'Escuchar menores'}
        </button>
      </div>

      <div className="triad-natural">
        <TriadHead quality={quality} />
        <TriadRows
          rows={NATURAL}
          heading="Sin alteraciones"
          selectedPc={selectedPc}
          quality={quality}
          answerLabel={answerLabel}
          onSelect={onSelect}
        />
      </div>
      <div className="triad-columns">
        <TriadRows
          rows={SHARPS}
          heading="Sostenidos"
          selectedPc={selectedPc}
          quality={quality}
          answerLabel={answerLabel}
          onSelect={onSelect}
        />
        <TriadRows
          rows={FLATS}
          heading="Bemoles"
          selectedPc={selectedPc}
          quality={quality}
          answerLabel={answerLabel}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}
