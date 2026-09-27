import { noteToPitchClass, pitchClassToNote, type NoteName } from '../music/notes';
import type { ChordQuality } from '../music/caged';
import { TRIAD_ROWS, type Triad } from '../music/triads';

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
      <span className="triad-tones">
        {triad.notes.map((note) => (
          <span key={note.degree} className={toneClass(note.degree)} title={toneTitle(triad, note.degree)}>
            {note.name}
          </span>
        ))}
      </span>
    </button>
  );
}

function splitLabel(accidentals: number): string | null {
  if (accidentals === 0) return 'Sin alteraciones';
  if (accidentals === 1) return 'Sostenidos';
  if (accidentals === -1) return 'Bemoles';
  return null;
}

const NATURAL = TRIAD_ROWS.filter((row) => row.accidentals === 0);
const SHARPS = TRIAD_ROWS.filter((row) => row.accidentals > 0);
const FLATS = TRIAD_ROWS.filter((row) => row.accidentals < 0);

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
  selectedPc,
  quality,
  onSelect,
}: {
  rows: typeof TRIAD_ROWS;
  selectedPc: number;
  quality: ChordQuality;
  onSelect: (root: NoteName, quality: ChordQuality) => void;
}) {
  return (
    <div className="triad-column">
      {rows.map((row) => {
        const split = splitLabel(row.accidentals);
        const sigTitle =
          row.signatureNotes.length === 0
            ? 'Sin alteraciones'
            : row.accidentals > 0
              ? `Sostenidos: ${row.signatureNotes.join(' ')}`
              : `Bemoles: ${row.signatureNotes.join(' ')}`;
        return (
          <div key={row.accidentals}>
            {split && (
              <div className="triad-split">
                <span>{split}</span>
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

  return (
    <section className="triad-atlas" aria-label="Triadas mayores y menores">
      <p className="triad-intro">
        Cada fila es una tonalidad: el acorde mayor y su relativo menor comparten armadura.
        Las tres notas son la fundamental, la tercera y la quinta, escritas con sostenido o
        bemol según esa armadura. Tocá uno para verlo en el diapasón.
      </p>

      <div className="triad-natural">
        <TriadHead />
        <TriadRows
          rows={NATURAL}
          selectedPc={selectedPc}
          quality={quality}
          onSelect={onSelect}
        />
      </div>
      <div className="triad-columns">
        <TriadRows rows={SHARPS} selectedPc={selectedPc} quality={quality} onSelect={onSelect} />
        <TriadRows rows={FLATS} selectedPc={selectedPc} quality={quality} onSelect={onSelect} />
      </div>
    </section>
  );
}
