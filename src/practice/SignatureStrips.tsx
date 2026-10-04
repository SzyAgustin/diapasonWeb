import { useState } from 'react';
import type { ChordQuality } from '../music/caged';
import {
  FLAT_ORDER,
  majorScaleNames,
  naturalMinorScaleNames,
  noteNameInSpanish,
  SHARP_ORDER,
  TRIAD_ROWS,
} from '../music/triads';

type Notation = 'spanish' | 'letter';

function noteLabel(name: string, notation: Notation): string {
  if (notation === 'letter') return name;
  const spanish = noteNameInSpanish(name)
    .replace(' sostenido', '#')
    .replace(' bemol', 'b');
  return spanish.charAt(0).toUpperCase() + spanish.slice(1);
}

function NoteName({ name, notation }: { name: string; notation: Notation }) {
  const label = noteLabel(name, notation);
  const mark = label.endsWith('#') || label.endsWith('b') ? label.slice(-1) : '';
  const letters = mark ? label.slice(0, -1) : label;
  return (
    <>
      {letters}
      {mark && <span className="strip-acc">{mark}</span>}
    </>
  );
}

function NoteRun({
  notes,
  notation,
}: {
  notes: readonly string[];
  notation: Notation;
}) {
  return (
    <>
      {notes.map((note, index) => (
        <span key={`${note}-${index}`} className="strip-note">
          <span className="strip-index">{index + 1}</span>
          <NoteName name={note} notation={notation} />
        </span>
      ))}
    </>
  );
}

function Strip({
  label,
  notes,
  tone,
  notation,
  selected,
  onSelect,
  scaleOf,
  startAt = 1,
  leadingBlank = false,
}: {
  label: string;
  notes: readonly string[];
  tone: 'sharp' | 'flat';
  notation: Notation;
  selected?: string | null;
  onSelect?: (note: string) => void;
  scaleOf?: (note: string) => string[];
  startAt?: number;
  leadingBlank?: boolean;
}) {
  const scale = selected && scaleOf ? scaleOf(selected) : [];
  return (
    <div className={`strip-row strip-${tone}`}>
      <span className="control-label">{label}</span>
      <span className="strip-keys">
        {leadingBlank && <span className="strip-note" aria-hidden="true" />}
        {notes.map((note, index) =>
          onSelect ? (
            <button
              key={note}
              type="button"
              className="strip-note"
              aria-pressed={selected === note}
              onClick={() => onSelect(note)}
            >
              <span className="strip-index">{index + startAt}</span>
              <span className={selected === note ? 'strip-note-selected' : undefined}>
                <NoteName name={note} notation={notation} />
              </span>
            </button>
          ) : (
            <span key={note} className="strip-note">
              <span className="strip-index">{index + startAt}</span>
              <NoteName name={note} notation={notation} />
            </span>
          ),
        )}
      </span>
      <span className="strip-scale">
        {scale.length > 0 && <NoteRun notes={scale} notation={notation} />}
      </span>
    </div>
  );
}

export function SignatureStrips({ quality }: { quality: ChordQuality }) {
  const [notation, setNotation] = useState<Notation>('spanish');
  const [sharpKey, setSharpKey] = useState<string | null>(null);
  const [flatKey, setFlatKey] = useState<string | null>(null);
  const [shown, setShown] = useState(quality);
  if (shown !== quality) {
    setShown(quality);
    setSharpKey(null);
    setFlatKey(null);
  }
  const minor = quality === 'minor';
  const tonic = (row: (typeof TRIAD_ROWS)[number]) =>
    (minor ? row.minor : row.major).notes[0].name;
  const natural = TRIAD_ROWS.find((row) => row.accidentals === 0);
  const sharpKeys = TRIAD_ROWS.filter((row) => row.accidentals > 0).map(tonic);
  const flatKeys = TRIAD_ROWS.filter((row) => row.accidentals < 0).map(tonic);
  const scaleOf = minor ? naturalMinorScaleNames : majorScaleNames;

  const pick = (current: string | null, note: string) => (current === note ? null : note);

  return (
    <section className="signature-strips" aria-label="Orden de las armaduras">
      <div className="strips-head">
        <span className="control-label">Armaduras</span>
        <button
          type="button"
          role="switch"
          className={`switch ${notation === 'letter' ? 'switch-on' : ''}`}
          aria-checked={notation === 'letter'}
          aria-label="Notación C D E"
          onClick={() => setNotation((current) => (current === 'spanish' ? 'letter' : 'spanish'))}
        >
          <span className="switch-track">
            <span className="switch-thumb" />
          </span>
        </button>
      </div>
      <Strip
        label={minor ? 'Menores con sostenidos' : 'Mayores con sostenidos'}
        notes={[tonic(natural!), ...sharpKeys]}
        tone="sharp"
        notation={notation}
        startAt={0}
        selected={sharpKey}
        scaleOf={scaleOf}
        onSelect={(note) => setSharpKey((current) => pick(current, note))}
      />
      <Strip label="Sostenidos" notes={SHARP_ORDER} tone="sharp" notation={notation} leadingBlank />
      <Strip
        label={minor ? 'Menores con bemoles' : 'Mayores con bemoles'}
        notes={[tonic(natural!), ...flatKeys]}
        tone="flat"
        notation={notation}
        startAt={0}
        selected={flatKey}
        scaleOf={scaleOf}
        onSelect={(note) => setFlatKey((current) => pick(current, note))}
      />
      <Strip label="Bemoles" notes={FLAT_ORDER} tone="flat" notation={notation} leadingBlank />
    </section>
  );
}
