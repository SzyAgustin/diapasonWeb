import { useMemo } from 'react';
import {
  FRET_COUNT,
  pitchClassToNote,
  type NoteName,
  type PitchClass,
} from '../music/notes';
import { intervalLabel, type FretPosition } from '../music/caged';

export type LabelMode = 'note' | 'interval';

interface FretboardProps {
  positions: FretPosition[];
  labelMode: LabelMode;
  /** Cuerdas a mostrar, de la más grave (índice 0) a la más aguda. */
  tuning: { name: NoteName; pitchClass: PitchClass }[];
}

const OPEN_X = 30;
const NUT_X = 64;
/** Largo en píxeles del cejuelo al traste 24 (escala visible del mástil). */
const SCALE_LEN = 1720;
const STRING_SPACING = 32;
const TOP = 46;
const BOTTOM_PAD = 40;
const DOT_R = 12;

const INLAY_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const INLAY_DOUBLE = [12, 24];

/**
 * Fracción de la escala desde el cejuelo hasta el traste n, según la fórmula
 * real de trastes equitemperados: d(n) = L · (1 − 2^(−n/12)).
 * Esto hace que los trastes graves sean anchos y se vayan angostando.
 */
function fretFraction(fret: number): number {
  return 1 - Math.pow(2, -fret / 12);
}

const FRACTION_AT_LAST = fretFraction(FRET_COUNT);

function fretLineX(fret: number): number {
  return NUT_X + (SCALE_LEN * fretFraction(fret)) / FRACTION_AT_LAST;
}

function noteX(fret: number): number {
  if (fret === 0) return OPEN_X;
  return (fretLineX(fret - 1) + fretLineX(fret)) / 2;
}

function intervalColor(interval: number): string {
  if (interval === 0) return '#22c55e'; // fundamental (verde success)
  if (interval === 7) return '#ef4444'; // quinta (rojo intenso)
  if (interval === 3 || interval === 4) return '#3b82f6'; // tercera (azul eléctrico)
  return '#64748b'; // resto de notas de la escala (gris pizarra)
}

export function Fretboard({ positions, labelMode, tuning }: FretboardProps) {
  const stringCount = tuning.length;
  // stringIndex 0 = cuerda más grave -> abajo del todo.
  const stringY = (stringIndex: number) =>
    TOP + (stringCount - 1 - stringIndex) * STRING_SPACING;

  const width = NUT_X + SCALE_LEN + 24;
  const height = stringY(0) + BOTTOM_PAD;
  const boardTop = stringY(stringCount - 1);
  const boardBottom = stringY(0);
  const midY = (boardTop + boardBottom) / 2;

  const dots = useMemo(
    () =>
      positions.map((pos, i) => ({
        key: `${pos.stringIndex}-${pos.fret}-${i}`,
        cx: noteX(pos.fret),
        cy: stringY(pos.stringIndex),
        color: intervalColor(pos.interval),
        label:
          labelMode === 'note'
            ? pitchClassToNote(pos.pitchClass)
            : intervalLabel(pos.interval),
        isRoot: pos.isRoot,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positions, labelMode, stringCount],
  );

  return (
    <div className="fretboard-scroll">
      <svg
        className="fretboard"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Diapasón de guitarra"
      >
        {/* Madera del diapasón */}
        <rect
          x={NUT_X}
          y={boardTop - STRING_SPACING / 2}
          width={SCALE_LEN}
          height={(stringCount - 1) * STRING_SPACING + STRING_SPACING}
          rx={6}
          className="board-bg"
        />

        {/* Inlays (marcadores de posición) */}
        {INLAY_SINGLE.map((fret) => (
          <circle
            key={`inlay-${fret}`}
            cx={noteX(fret)}
            cy={midY}
            r={5}
            className="inlay"
          />
        ))}
        {INLAY_DOUBLE.map((fret) => (
          <g key={`inlay2-${fret}`}>
            <circle cx={noteX(fret)} cy={boardTop + STRING_SPACING * 0.6} r={5} className="inlay" />
            <circle cx={noteX(fret)} cy={boardBottom - STRING_SPACING * 0.6} r={5} className="inlay" />
          </g>
        ))}

        {/* Trastes */}
        {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
          const cls = fret === 0 ? 'nut' : fret === 12 ? 'fret fret-octave' : 'fret';
          return (
            <line
              key={`fret-${fret}`}
              x1={fretLineX(fret)}
              y1={boardTop - STRING_SPACING / 2}
              x2={fretLineX(fret)}
              y2={boardBottom + STRING_SPACING / 2}
              className={cls}
            />
          );
        })}

        {/* Números de traste */}
        {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
          <text
            key={`fretnum-${fret}`}
            x={noteX(fret)}
            y={boardBottom + 28}
            className="fret-number"
            textAnchor="middle"
          >
            {fret}
          </text>
        ))}

        {/* Cuerdas + nombre de cuerda al aire */}
        {tuning.map((open, stringIndex) => {
          const y = stringY(stringIndex);
          return (
            <g key={`string-${stringIndex}`}>
              <text x={OPEN_X - 22} y={y + 4} className="string-name" textAnchor="middle">
                {open.name}
              </text>
              <line
                x1={NUT_X}
                y1={y}
                x2={fretLineX(FRET_COUNT)}
                y2={y}
                className="string-line"
                strokeWidth={1 + (stringCount - 1 - stringIndex) * 0.35}
              />
            </g>
          );
        })}

        {/* Notas del acorde */}
        {dots.map((dot) => (
          <g key={dot.key}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.isRoot ? DOT_R + 5 : DOT_R}
              fill={dot.color}
              className={dot.isRoot ? 'dot dot-root' : 'dot'}
            />
            <text
              x={dot.cx}
              y={dot.cy + 4}
              className={dot.isRoot ? 'dot-label dot-label-root' : 'dot-label'}
              textAnchor="middle"
            >
              {dot.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
