import { NOTE_NAMES, type Instrument, type NoteName } from '../music/notes';
import { CAGED_SHAPES, type CagedShape, type ChordQuality } from '../music/caged';
import type { LabelMode } from './Fretboard';

export type ShapeSelection = CagedShape | 'all';

interface ControlsProps {
  root: NoteName;
  quality: ChordQuality;
  shape: ShapeSelection;
  labelMode: LabelMode;
  showExtras: boolean;
  instrument: Instrument;
  onRootChange: (root: NoteName) => void;
  onQualityChange: (quality: ChordQuality) => void;
  onShapeChange: (shape: ShapeSelection) => void;
  onLabelModeChange: (mode: LabelMode) => void;
  onShowExtrasChange: (value: boolean) => void;
  onInstrumentChange: (instrument: Instrument) => void;
}

export function Controls({
  root,
  quality,
  shape,
  labelMode,
  showExtras,
  instrument,
  onRootChange,
  onQualityChange,
  onShapeChange,
  onLabelModeChange,
  onShowExtrasChange,
  onInstrumentChange,
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="control-group">
        <span className="control-label">Instrumento</span>
        <div className="btn-row">
          <button
            type="button"
            className={`chip ${instrument === 'guitar' ? 'chip-active' : ''}`}
            onClick={() => onInstrumentChange('guitar')}
          >
            Guitarra
          </button>
          <button
            type="button"
            className={`chip ${instrument === 'bass' ? 'chip-active' : ''}`}
            onClick={() => onInstrumentChange('bass')}
          >
            Bajo
          </button>
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Nota</span>
        <div className="btn-row">
          {NOTE_NAMES.map((note) => (
            <button
              key={note}
              type="button"
              className={`chip ${note === root ? 'chip-active' : ''}`}
              onClick={() => onRootChange(note)}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Tipo</span>
        <div className="btn-row">
          <button
            type="button"
            className={`chip ${quality === 'major' ? 'chip-active' : ''}`}
            onClick={() => onQualityChange('major')}
          >
            Mayor
          </button>
          <button
            type="button"
            className={`chip ${quality === 'minor' ? 'chip-active' : ''}`}
            onClick={() => onQualityChange('minor')}
          >
            Menor
          </button>
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Forma CAGED</span>
        <div className="btn-row">
          <button
            type="button"
            className={`chip ${shape === 'all' ? 'chip-active' : ''}`}
            onClick={() => onShapeChange('all')}
          >
            Todas
          </button>
          {CAGED_SHAPES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip chip-caged ${shape === s ? 'chip-active' : ''}`}
              onClick={() => onShapeChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Etiqueta</span>
        <div className="btn-row">
          <button
            type="button"
            className={`chip ${labelMode === 'note' ? 'chip-active' : ''}`}
            onClick={() => onLabelModeChange('note')}
          >
            Nota
          </button>
          <button
            type="button"
            className={`chip ${labelMode === 'interval' ? 'chip-active' : ''}`}
            onClick={() => onLabelModeChange('interval')}
          >
            Intervalo
          </button>
        </div>
      </div>

      {instrument !== 'bass' && (
        <div className="control-group">
          <span className="control-label">Notas extra de la forma</span>
          <button
            type="button"
            role="switch"
            aria-checked={showExtras}
            className={`switch ${showExtras ? 'switch-on' : ''}`}
            disabled={shape === 'all'}
            onClick={() => onShowExtrasChange(!showExtras)}
          >
            <span className="switch-track">
              <span className="switch-thumb" />
            </span>
            <span className="switch-text">{showExtras ? 'On' : 'Off'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
