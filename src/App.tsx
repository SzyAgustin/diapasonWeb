import { useMemo, useState } from 'react';
import './App.css';
import { Controls, type AppMode, type ShapeSelection } from './components/Controls';
import { Fretboard, type LabelMode } from './components/Fretboard';
import { getTuning, type Instrument, type NoteName } from './music/notes';
import {
  chordLabel,
  getAllChordTones,
  getShapePositions,
  type ChordQuality,
} from './music/caged';
import { getScaleDef, getScaleTones, type ScaleType } from './music/scales';

export default function App() {
  const [mode, setMode] = useState<AppMode>('caged');
  const [root, setRoot] = useState<NoteName>('A');
  const [quality, setQuality] = useState<ChordQuality>('minor');
  const [shape, setShape] = useState<ShapeSelection>('all');
  const [scale, setScale] = useState<ScaleType>('naturalMinor');
  const [labelMode, setLabelMode] = useState<LabelMode>('note');
  const [showExtras, setShowExtras] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('guitar');

  const tuning = getTuning(instrument);
  const isBass = instrument === 'bass';
  // En bajo siempre se muestran las notas extra (como si el toggle estuviera en On).
  const effectiveExtras = isBass || showExtras;

  const positions = useMemo(() => {
    let all;
    if (mode === 'scale') {
      all = getScaleTones(root, scale);
    } else if (shape === 'all') {
      all = getAllChordTones(root, quality);
    } else {
      all = getShapePositions(root, quality, shape, effectiveExtras);
    }
    // El bajo solo tiene las 4 cuerdas más graves.
    return all.filter((p) => p.stringIndex < tuning.length);
  }, [mode, root, quality, shape, scale, effectiveExtras, tuning.length]);

  const name =
    mode === 'scale' ? root : chordLabel(root, quality);
  const subtitle =
    mode === 'scale'
      ? `Escala ${getScaleDef(scale).name.toLowerCase()}`
      : shape === 'all'
        ? 'Todas las posiciones del acorde'
        : `Forma ${shape} del sistema CAGED`;

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
        labelMode={labelMode}
        showExtras={showExtras}
        instrument={instrument}
        onModeChange={setMode}
        onRootChange={setRoot}
        onQualityChange={setQuality}
        onShapeChange={setShape}
        onScaleChange={setScale}
        onLabelModeChange={setLabelMode}
        onShowExtrasChange={setShowExtras}
        onInstrumentChange={setInstrument}
      />

      <div className="now-showing">
        <span className="chord-name">{name}</span>
        <span className="shape-info">{subtitle}</span>
      </div>

      <Fretboard positions={positions} labelMode={labelMode} tuning={tuning} />

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
      </div>
    </div>
  );
}
