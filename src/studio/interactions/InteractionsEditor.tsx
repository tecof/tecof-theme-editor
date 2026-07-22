import React from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';
import type { Interaction, InteractionAction, InteractionTrigger } from './types';

/** A candidate target node for the picker (built by the Inspector). */
export interface InteractionTargetNode {
  id: string;
  label: string;
}

export interface InteractionsEditorProps {
  interactions?: Interaction[];
  startHidden?: boolean;
  onChange: (next: Interaction[]) => void;
  onStartHiddenChange: (next: boolean) => void;
  /** All other nodes on the page (self excluded), for target selection. */
  nodes: InteractionTargetNode[];
  readOnly?: boolean;
}

const TRIGGERS: { value: InteractionTrigger; label: string }[] = [
  { value: 'click', label: 'Tıklama' },
  { value: 'hover', label: 'Üzerine gelince' },
];

const ACTIONS: { value: InteractionAction; label: string }[] = [
  { value: 'scrollTo', label: 'Bölüme kaydır' },
  { value: 'toggleClass', label: 'Sınıf aç/kapa' },
  { value: 'show', label: 'Göster' },
  { value: 'hide', label: 'Gizle' },
  { value: 'toggle', label: 'Göster/Gizle' },
];

/** Actions that act on a target element (everything except a self-only case). */
const newInteractionId = (): string =>
  `ix_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const InteractionsEditor: React.FC<InteractionsEditorProps> = ({
  interactions,
  startHidden,
  onChange,
  onStartHiddenChange,
  nodes,
  readOnly,
}) => {
  const rows = interactions ?? [];

  const patch = (id: string, next: Partial<Interaction>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...next } : r)));

  const add = () =>
    onChange([
      ...rows,
      { id: newInteractionId(), trigger: 'click', action: 'scrollTo', target: nodes[0]?.id ?? 'top' },
    ]);

  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));

  return (
    <div className="tecof-ix-editor">
      <div className="tecof-ix-intro">
        <Zap size={13} aria-hidden="true" />
        <span>
          Bir tetikleyici seç, bir eylem bağla. Yayınlanan sitede ve önizlemede çalışır.
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="tecof-ix-empty">Henüz etkileşim yok.</div>
      ) : (
        <div className="tecof-ix-list">
          {rows.map((row, i) => {
            const isScroll = row.action === 'scrollTo';
            return (
              <div className="tecof-ix-row" key={row.id}>
                <div className="tecof-ix-row-head">
                  <span className="tecof-ix-row-index">{i + 1}</span>
                  <button
                    type="button"
                    className="tecof-ix-row-remove"
                    onClick={() => remove(row.id)}
                    disabled={readOnly}
                    title="Etkileşimi sil"
                    aria-label="Etkileşimi sil"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>

                <label className="tecof-ix-field">
                  <span className="tecof-ix-label">Tetik</span>
                  <select
                    className="tecof-ix-select"
                    value={row.trigger}
                    disabled={readOnly}
                    onChange={(e) => patch(row.id, { trigger: e.target.value as InteractionTrigger })}
                  >
                    {TRIGGERS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="tecof-ix-field">
                  <span className="tecof-ix-label">Eylem</span>
                  <select
                    className="tecof-ix-select"
                    value={row.action}
                    disabled={readOnly}
                    onChange={(e) => patch(row.id, { action: e.target.value as InteractionAction })}
                  >
                    {ACTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="tecof-ix-field">
                  <span className="tecof-ix-label">Hedef</span>
                  <select
                    className="tecof-ix-select"
                    value={row.target ?? (isScroll ? 'top' : 'self')}
                    disabled={readOnly}
                    onChange={(e) => patch(row.id, { target: e.target.value })}
                  >
                    {!isScroll && <option value="self">Kendisi</option>}
                    {isScroll && <option value="top">Sayfa başı</option>}
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </label>

                {row.action === 'toggleClass' && (
                  <label className="tecof-ix-field">
                    <span className="tecof-ix-label">Sınıf adı</span>
                    <input
                      type="text"
                      className="tecof-ix-input"
                      placeholder="ör. is-open"
                      value={row.className ?? ''}
                      disabled={readOnly}
                      onChange={(e) => patch(row.id, { className: e.target.value.trim() })}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button type="button" className="tecof-ix-add" onClick={add} disabled={readOnly}>
        <Plus size={14} aria-hidden="true" />
        Etkileşim ekle
      </button>

      <label className="tecof-ix-starthidden">
        <input
          type="checkbox"
          checked={!!startHidden}
          disabled={readOnly}
          onChange={(e) => onStartHiddenChange(e.target.checked)}
        />
        <span>
          Başlangıçta gizli
          <em>Panel/menü gibi bir eylemle açılana kadar gizli kalsın.</em>
        </span>
      </label>
    </div>
  );
};

export default InteractionsEditor;
