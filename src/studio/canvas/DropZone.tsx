import React, { createContext, useContext, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { findNodeById } from '../../engine/zones';
import { isValidDrop } from '../../engine/rules';
import { NodeRenderer } from './NodeRenderer';
import { AddSectionButton } from './AddSectionButton';
import { RepeatGhosts } from './RepeatGhosts';
import { RepeatItemContext } from '../../components/RepeatItemContext';
import { useRepeatRows, type RepeatSourceFieldDef } from '../../components/useRepeatRows';

export const ParentNodeContext = createContext<string | null>(null);

export interface DropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
  /** Lay children out side-by-side (row) instead of stacked (column). */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Repeat rows: when an array, this zone is an ITEM TEMPLATE — its children are
   * edited once, bound to the first row (`{{ item.* }}` tokens resolve against
   * it), and the remaining rows show as non-interactive ghost previews after the
   * template. Set automatically for slot fields declared with `repeatSource`;
   * components can pass runtime rows via `puck.renderDropZone({ repeatItems })`.
   */
  repeatItems?: any[];
}

export const DropZone = ({ zone, className, style, orientation = 'vertical', repeatItems }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const { config, readOnly } = useStudio();
  const openAddSection = useUiStore((state) => state.openAddSection);
  // Drag payload drives both the affordance flag and the validity check; this
  // is a legitimately global subscription (not node-scoped).
  const dragPayload = useEditorStore((state) => state.drag);
  const isDragActive = dragPayload != null;

  // Get items for this zone from the store
  const items = useEditorStore((state) => state.document.zones[zoneKey]) || [];

  // Sürüklenen tip bu zone'un kurallarına uymuyorsa görsel olarak pasifleştir —
  // tüm zone'ların aynı anda "bırakılabilir" gibi parlamasını önler.
  const isDropDenied = useMemo(() => {
    if (!dragPayload) return false;
    const doc = useEditorStore.getState().document;
    const payload = dragPayload as { id?: string; type?: string };
    const draggedType =
      payload.type ?? (payload.id ? findNodeById(doc, payload.id)?.node.type ?? null : null);
    if (!draggedType) return false;
    return !isValidDrop(config, draggedType, zoneKey, doc);
  }, [dragPayload, config, zoneKey]);

  // Drop is handled by the delegated CanvasNativeDrop (this zone carries
  // data-tecof-zone); the is-touch-dragover affordance is set imperatively.
  const isRepeat = Array.isArray(repeatItems);
  const repeatRows = isRepeat ? repeatItems : [];

  const dropzoneClassName = [
    'tecof-dropzone',
    orientation === 'horizontal' ? 'is-horizontal' : '',
    items.length === 0 ? 'is-empty' : '',
    isDragActive ? 'is-drag-active' : '',
    isDropDenied ? 'is-drop-denied' : '',
    isRepeat ? 'is-repeat' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={dropzoneClassName}
      style={style}
      data-tecof-zone={zoneKey}
      data-tecof-orientation={orientation}
    >
      {items.length === 0 ? (
        readOnly ? null : (
          // Boş slot tıklanınca "Bölüm Ekle" modalı bu zone'u hedefleyerek
          // açılır ve yalnızca buraya bırakılabilecek tipleri listeler.
          <button
            type="button"
            className="tecof-dropzone-hint"
            onClick={(e) => {
              e.stopPropagation();
              openAddSection({ zoneKey, index: 0 });
            }}
            title="Bu alana bileşen ekle"
          >
            {isDragActive ? (
              'Buraya Bırakın'
            ) : (
              <>
                <Plus size={12} aria-hidden="true" />
                Bileşen Ekle
              </>
            )}
          </button>
        )
      ) : (
        // Non-empty slot: interleave hover-revealed "+" affordances so a
        // component can be inserted at ANY position (top / between / end), not
        // just at the root. During an active drag they're suppressed — the drop
        // indicators own positioning then. `openAddSection` targets this zone,
        // so the modal filters to the types this slot actually accepts.
        (() => {
          const template = (
            <>
              {!readOnly && !isDragActive && (
                <AddSectionButton
                  index={0}
                  orientation={orientation}
                  slot
                  onClick={(idx) => openAddSection({ zoneKey, index: idx })}
                />
              )}
              {items.map((item, index) => (
                <React.Fragment key={item.props.id}>
                  <NodeRenderer node={item} index={index} zoneKey={zoneKey} />
                  {!readOnly && !isDragActive && (
                    <AddSectionButton
                      index={index + 1}
                      orientation={orientation}
                      slot
                      onClick={(idx) => openAddSection({ zoneKey, index: idx })}
                    />
                  )}
                </React.Fragment>
              ))}
            </>
          );

          if (!isRepeat) return template;

          // Repeat template: the real nodes are edited bound to the FIRST row
          // (when data exists), and each remaining row renders as a static
          // ghost copy after them — the canvas mirrors the published loop.
          return (
            <>
              {repeatRows.length > 0 ? (
                <RepeatItemContext.Provider
                  value={{ item: repeatRows[0], index: 0, count: repeatRows.length }}
                >
                  {template}
                </RepeatItemContext.Provider>
              ) : (
                template
              )}
              <RepeatGhosts rows={repeatRows} nodes={items} />
            </>
          );
        })()
      )}
    </div>
  );
};

/**
 * Editor-side repeat slot with a DYNAMIC source: rows may be a plain array or
 * resolved asynchronously (api-list `fetchList`, CMS collection binding) via
 * `useRepeatRows` — so the canvas template + ghosts preview REAL data.
 */
export const EditorRepeatSlot = ({
  zone,
  orientation,
  value,
  sourceFieldDef,
}: {
  zone: string;
  orientation?: 'vertical' | 'horizontal';
  value: unknown;
  sourceFieldDef?: RepeatSourceFieldDef;
}) => {
  const rows = useRepeatRows(value, sourceFieldDef);
  return <DropZone zone={zone} orientation={orientation} repeatItems={rows as any[]} />;
};

// Helper for puck.renderDropZone
export const renderDropZone = ({ zone, className, style, orientation, repeatItems }: DropZoneProps) => {
  return (
    <DropZone
      zone={zone}
      className={className}
      style={style}
      orientation={orientation}
      repeatItems={repeatItems}
    />
  );
};
export default DropZone;
