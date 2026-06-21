import { useMemo, useState } from 'react';
import './App.css';
import { Controls, type ShapeSelection } from './components/Controls';
import { Fretboard, type LabelMode } from './components/Fretboard';
import { getTuning, type Instrument, type NoteName } from './music/notes';
import {
  chordLabel,
  getAllChordTones,
  getShapePositions,
  type ChordQuality,
} from './music/caged';

export default function App() {
  const [root, setRoot] = useState<NoteName>('A');
  const [quality, setQuality] = useState<ChordQuality>('minor');
  const [shape, setShape] = useState<ShapeSelection>('all');
  const [labelMode, setLabelMode] = useState<LabelMode>('note');
  const [showExtras, setShowExtras] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('guitar');

  const tuning = getTuning(instrument);
  const isBass = instrument === 'bass';
  // En bajo siempre se muestran las notas extra (como si el toggle estuviera en On).
  const effectiveExtras = isBass || showExtras;

  const positions = useMemo(() => {
    const all =
      shape === 'all'
        ? getAllChordTones(root, quality)
        : getShapePositions(root, quality, shape, effectiveExtras);
    // El bajo solo tiene las 4 cuerdas más graves.
    return all.filter((p) => p.stringIndex < tuning.length);
  }, [root, quality, shape, effectiveExtras, tuning.length]);

  const name = chordLabel(root, quality);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Diapasón CAGED</h1>
        <p className="subtitle">
          Visualizá las formas CAGED de cualquier acorde mayor o menor sobre el
          mástil de guitarra.
        </p>
      </header>

      <Controls
        root={root}
        quality={quality}
        shape={shape}
        labelMode={labelMode}
        showExtras={showExtras}
        instrument={instrument}
        onRootChange={setRoot}
        onQualityChange={setQuality}
        onShapeChange={setShape}
        onLabelModeChange={setLabelMode}
        onShowExtrasChange={setShowExtras}
        onInstrumentChange={setInstrument}
      />

      <div className="now-showing">
        <span className="chord-name">{name}</span>
        <span className="shape-info">
          {shape === 'all'
            ? 'Todas las posiciones del acorde'
            : `Forma ${shape} del sistema CAGED`}
        </span>
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
      </div>
    </div>
  );
}
