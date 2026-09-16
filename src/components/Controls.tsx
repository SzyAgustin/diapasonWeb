import { NOTE_NAMES, type Instrument, type NoteName } from '../music/notes';
import { CAGED_SHAPES, type CagedShape, type ChordQuality } from '../music/caged';
import { SCALES, scaleHasFigures, type ScaleType } from '../music/scales';
import type { LabelMode } from './Fretboard';

export type ShapeSelection = CagedShape | 'all';
export type AppMode = 'caged' | 'scale';
export type FigureSelection = CagedShape | 'all';

interface ControlsProps {
  mode: AppMode;
  root: NoteName;
  quality: ChordQuality;
  shape: ShapeSelection;
  scale: ScaleType;
  compareScale: ScaleType | null;
  figure: FigureSelection;
  labelMode: LabelMode;
  showExtras: boolean;
  instrument: Instrument;
  onModeChange: (mode: AppMode) => void;
  onRootChange: (root: NoteName) => void;
  onQualityChange: (quality: ChordQuality) => void;
  onShapeChange: (shape: ShapeSelection) => void;
  onScaleChange: (scale: ScaleType) => void;
  onCompareScaleChange: (scale: ScaleType | null) => void;
  onFigureChange: (figure: FigureSelection) => void;
  onLabelModeChange: (mode: LabelMode) => void;
  onShowExtrasChange: (value: boolean) => void;
  onInstrumentChange: (instrument: Instrument) => void;
}

export function Controls({
  mode,
  root,
  quality,
  shape,
  scale,
  compareScale,
  figure,
  labelMode,
  showExtras,
  instrument,
  onModeChange,
  onRootChange,
  onQualityChange,
  onShapeChange,
  onScaleChange,
  onFigureChange,
  onCompareScaleChange,
  onLabelModeChange,
  onShowExtrasChange,
  onInstrumentChange,
}: ControlsProps) {
  const isScale = mode === 'scale';
  const comparing = isScale && compareScale !== null;
  const figuresEnabled = isScale && scaleHasFigures(scale) && !comparing;
  const extrasEnabled = !isScale && instrument !== 'bass' && shape !== 'all';

  return (
    <div className="controls">
      <div className="control-group area-mode">
        <span className="control-label">Modo</span>
        <div className="btn-row">
          <button
            type="button"
            className={`chip ${mode === 'caged' ? 'chip-active' : ''}`}
            onClick={() => onModeChange('caged')}
          >
            CAGED
          </button>
          <button
            type="button"
            className={`chip ${mode === 'scale' ? 'chip-active' : ''}`}
            onClick={() => onModeChange('scale')}
          >
            Escala
          </button>
        </div>
      </div>

      <div className="control-group area-inst">
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

      <div className="control-group area-note">
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

      {/* Slot A: Tipo (CAGED) / Escala (modo escala). Siempre presente. */}
      <div className="control-group control-slot area-slota">
        {isScale ? (
          <>
            <span className="control-label">Escala</span>
            <div className="btn-row btn-row-scales">
              {SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip ${scale === s.id ? 'chip-active' : ''}`}
                  onClick={() => onScaleChange(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="control-label">Tipo</span>
            <div className="btn-row btn-row-scales">
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
          </>
        )}
      </div>

      {/* Slot B: Forma CAGED / Comparar con. Siempre presente. */}
      <div className="control-group control-slot area-slotb">
        {isScale ? (
          <>
            <span className="control-label">Comparar con</span>
            <div className="btn-row btn-row-scales">
              <button
                type="button"
                className={`chip ${compareScale === null ? 'chip-active' : ''}`}
                onClick={() => onCompareScaleChange(null)}
              >
                Ninguna
              </button>
              {SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={s.id === scale}
                  title={s.id === scale ? 'Ya está en el diapasón de arriba' : undefined}
                  className={`chip ${compareScale === s.id ? 'chip-active' : ''}`}
                  onClick={() => onCompareScaleChange(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="control-label">Forma CAGED</span>
            <div className="btn-row btn-row-scales">
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
          </>
        )}
      </div>

      <div className="control-group area-label">
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

      {/* Slot C: Notas extra (CAGED) / Figura (escala). Siempre presente. */}
      <div className="control-group control-slot area-slotc">
        {isScale ? (
          <>
            <span className="control-label">Figura (posición CAGED)</span>
            <div className="btn-row btn-row-scales">
              <button
                type="button"
                className={`chip ${figure === 'all' ? 'chip-active' : ''}`}
                disabled={!figuresEnabled}
                title={
                  comparing
                    ? 'Al comparar se muestran las escalas completas'
                    : !scaleHasFigures(scale)
                      ? 'Esta escala no se divide en figuras CAGED'
                      : undefined
                }
                onClick={() => onFigureChange('all')}
              >
                Todas
              </button>
              {CAGED_SHAPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip chip-caged ${figure === s ? 'chip-active' : ''}`}
                  disabled={!figuresEnabled}
                  title={
                    comparing
                      ? 'Al comparar se muestran las escalas completas'
                      : !scaleHasFigures(scale)
                        ? 'Esta escala no se divide en figuras CAGED'
                        : undefined
                  }
                  onClick={() => onFigureChange(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="control-label">Notas extra de la forma</span>
            <div className="btn-row btn-row-scales extras-slot">
              <button
                type="button"
                role="switch"
                aria-checked={showExtras}
                className={`switch ${showExtras ? 'switch-on' : ''}`}
                disabled={!extrasEnabled}
                title={
                  instrument === 'bass'
                    ? 'En bajo las notas extra ya están incluidas'
                    : shape === 'all'
                      ? 'Elegí una forma para activar las notas extra'
                      : undefined
                }
                onClick={() => onShowExtrasChange(!showExtras)}
              >
                <span className="switch-track">
                  <span className="switch-thumb" />
                </span>
                <span className="switch-text">{showExtras ? 'On' : 'Off'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
