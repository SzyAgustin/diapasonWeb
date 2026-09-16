import { useMemo, useRef, useState } from 'react';
import './App.css';
import {
  Controls,
  type AppMode,
  type FigureSelection,
  type ShapeSelection,
} from './components/Controls';
import { Fretboard, type LabelMode } from './components/Fretboard';
import { getTuning, type Instrument, type NoteName } from './music/notes';
import {
  chordLabel,
  getAllChordTones,
  getShapePositions,
  type ChordQuality,
} from './music/caged';
import {
  getScaleCagedFigure,
  getScaleDef,
  getScaleTones,
  scaleHasFigures,
  type ScaleType,
} from './music/scales';
import { diffScales } from './music/scaleDiff';

export default function App() {
  const [mode, setMode] = useState<AppMode>('caged');
  const [root, setRoot] = useState<NoteName>('A');
  const [quality, setQuality] = useState<ChordQuality>('minor');
  const [shape, setShape] = useState<ShapeSelection>('all');
  const [scale, setScaleState] = useState<ScaleType>('naturalMinor');
  const [compareScale, setCompareScaleState] = useState<ScaleType | null>(null);
  const [figure, setFigure] = useState<FigureSelection>('all');
  const [labelMode, setLabelMode] = useState<LabelMode>('note');
  const [showExtras, setShowExtras] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('guitar');

  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const syncingScroll = useRef(false);

  const setScale = (next: ScaleType) => {
    setScaleState(next);
    setFigure('all');
    if (next === compareScale) setCompareScaleState(null);
  };

  const setCompareScale = (next: ScaleType | null) => {
    if (next === scale) return;
    setCompareScaleState(next);
  };

  const tuning = getTuning(instrument);
  const isBass = instrument === 'bass';
  const effectiveExtras = isBass || showExtras;
  const comparing = mode === 'scale' && compareScale !== null && compareScale !== scale;

  const positions = useMemo(() => {
    let all;
    if (mode === 'scale') {
      all =
        !comparing && figure !== 'all' && scaleHasFigures(scale)
          ? getScaleCagedFigure(root, scale, figure)
          : getScaleTones(root, scale);
    } else if (shape === 'all') {
      all = getAllChordTones(root, quality);
    } else {
      all = getShapePositions(root, quality, shape, effectiveExtras);
    }
    return all.filter((p) => p.stringIndex < tuning.length);
  }, [mode, root, quality, shape, scale, figure, effectiveExtras, tuning.length, comparing]);

  const comparePositions = useMemo(() => {
    if (!comparing || !compareScale) return [];
    return getScaleTones(root, compareScale).filter((p) => p.stringIndex < tuning.length);
  }, [comparing, compareScale, root, tuning.length]);

  const scaleDiff = useMemo(
    () => (comparing && compareScale ? diffScales(scale, compareScale) : null),
    [comparing, scale, compareScale],
  );

  const ghostPositions = useMemo(() => {
    if (!scaleDiff) return undefined;
    const ghosts = new Set(scaleDiff.ghostIntervals);
    return positions.filter((p) => ghosts.has(p.interval));
  }, [scaleDiff, positions]);

  const name = mode === 'scale' ? root : chordLabel(root, quality);
  const subtitle =
    mode === 'scale'
      ? `Escala ${getScaleDef(scale).name.toLowerCase()}` +
        (!comparing && figure !== 'all' && scaleHasFigures(scale)
          ? ` · Posición ${figure}`
          : '')
      : shape === 'all'
        ? 'Todas las posiciones del acorde'
        : `Forma ${shape} del sistema CAGED`;

  const syncScroll = (from: HTMLDivElement | null, to: HTMLDivElement | null) => {
    if (!from || !to || syncingScroll.current) return;
    syncingScroll.current = true;
    to.scrollLeft = from.scrollLeft;
    requestAnimationFrame(() => {
      syncingScroll.current = false;
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Diapasón CAGED</h1>
        <p className="subtitle">
          Visualizá formas CAGED de acordes y escalas sobre el mástil de
          guitarra o bajo.
        </p>
      </header>

      <Controls
        mode={mode}
        root={root}
        quality={quality}
        shape={shape}
        scale={scale}
        compareScale={compareScale}
        figure={figure}
        labelMode={labelMode}
        showExtras={showExtras}
        instrument={instrument}
        onModeChange={setMode}
        onRootChange={setRoot}
        onQualityChange={setQuality}
        onShapeChange={setShape}
        onScaleChange={setScale}
        onCompareScaleChange={setCompareScale}
        onFigureChange={setFigure}
        onLabelModeChange={setLabelMode}
        onShowExtrasChange={setShowExtras}
        onInstrumentChange={setInstrument}
      />

      <div className="board-stage">
        <div className="now-showing">
          <span className="chord-name">{name}</span>
          <span className="shape-info">{subtitle}</span>
        </div>

        <Fretboard
          positions={positions}
          labelMode={labelMode}
          tuning={tuning}
          scrollRef={topScrollRef}
          onScroll={
            comparing
              ? () => syncScroll(topScrollRef.current, bottomScrollRef.current)
              : undefined
          }
        />

        {comparing && compareScale && scaleDiff && (
          <div className="compare-board">
            <div className="now-showing">
              <span className="chord-name">{root}</span>
              <span className="shape-info">
                Escala {getScaleDef(compareScale).name.toLowerCase()}
              </span>
            </div>
            <p className="scale-diff">{scaleDiff.summary}</p>
            <Fretboard
              positions={comparePositions}
              labelMode={labelMode}
              tuning={tuning}
              highlightIntervals={scaleDiff.highlightIntervals}
              ghostPositions={ghostPositions}
              ariaLabel={`Diapasón de la escala ${getScaleDef(compareScale).name}`}
              scrollRef={bottomScrollRef}
              onScroll={() => syncScroll(bottomScrollRef.current, topScrollRef.current)}
            />
          </div>
        )}
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#22c55e' }} />
          Fundamental (R)
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#3b82f6' }} />
          Tercera {quality === 'minor' ? '(♭3)' : '(3)'}
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }} />
          Quinta (5)
        </span>
        {mode === 'scale' && (
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#64748b' }} />
            Otras notas de la escala
          </span>
        )}
        {comparing && (
          <>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b' }} />
              Nota que cambia o se agrega
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot-ghost" />
              Nota que desaparece
            </span>
          </>
        )}
      </div>
    </div>
  );
}
