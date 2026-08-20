import React, { createContext, useContext, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { findNodeById } from '../../engine/zones';
import { isValidDrop } from '../../engine/rules';
import { NodeRenderer } from './NodeRenderer';
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
  /**
   * `<Slot>` bunu true geçer: yatay slot'un `is-horizontal` YERLEŞİM class'ı
   * eklenmez — yerleşim çağıranın className'inden gelir (tema utilities'i kazanır).
   * data-tecof-orientation yine yazılır (insert overlay eksen için okur).
   * Düz renderSlot çağrıları geçmez → eski davranış (BC) korunur.
   */
  managedLayout?: boolean;
  /**
   * YAYIN sinyali: TecofRender, zone listesi boşsa true basar; `<Slot
   * hideIfEmpty>` bunu okuyup hiç render etmez. DropZone/RenderDropZone bu
   * prop'u KENDİSİ kullanmaz (DOM'a da yazmaz) — yalnız enjekte edilen
   * elemanın üstünde taşınır. Editörde hiç set edilmez.
   */
  isEmpty?: boolean;
  /** Repeat satırlarını besleyen prop adı (EditorRepeatSlot geçirir) — ghost
   *  satırlarının `data-tecof-item` hedefi için; DOM'a kendisi yazılmaz. */
  repeatSourceField?: string;
  /** `<Slot>`'un serbest prop geçişi (`data-*`, `aria-*`, `id`…): motor-içi
   *  anahtarlar ayıklandıktan sonra zone kapsayıcısına AYNEN spread edilir —
   *  yayın (RenderDropZone) ile birebir aynı sözleşme. */
  [extra: string]: unknown;
}

export const DropZone = ({
  zone,
  className,
  style,
  orientation = 'vertical',
  repeatItems,
  managedLayout,
  isEmpty: _isEmpty,
  repeatSourceField,
  ...domRest
}: DropZoneProps) => {
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
    orientation === 'horizontal' && !managedLayout ? 'is-horizontal' : '',
    managedLayout ? 'tecof-slot-managed' : '',
    items.length === 0 ? 'is-empty' : '',
    isDragActive ? 'is-drag-active' : '',
    isDropDenied ? 'is-drop-denied' : '',
    isRepeat ? 'is-repeat' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    // domRest ÖNCE: motorun kendi class/attr'ları (data-tecof-zone dahil) ezilemesin.
    <div
      {...domRest}
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
        // Non-empty slot: nodes render as DIRECT children of the zone container so
        // theme structural selectors (grid / space-y / :nth-child) see exactly the
        // published set. The hover-revealed "+" insert affordances (top / between /
        // end) are painted out-of-flow by InsertOverlay, which targets this zone by
        // `data-tecof-zone` and opens the modal filtered to the accepted types.
        (() => {
          const template = (
            <>
              {items.map((item, index) => (
                <NodeRenderer key={item.props.id} node={item} index={index} zoneKey={zoneKey} />
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
              <RepeatGhosts rows={repeatRows} nodes={items} sourceField={repeatSourceField} />
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
  sourceField,
  sourceFieldDef,
}: {
  zone: string;
  orientation?: 'vertical' | 'horizontal';
  value: unknown;
  /** Satırları besleyen prop'un ADI — ghost'lara `data-tecof-item="<ad>:<i>"`
   *  basılır ki tıklama Inspector'da ilgili satırı açsın. */
  sourceField?: string;
  sourceFieldDef?: RepeatSourceFieldDef;
}) => {
  const rows = useRepeatRows(value, sourceFieldDef);
  return (
    <DropZone
      zone={zone}
      orientation={orientation}
      repeatItems={rows as any[]}
      repeatSourceField={sourceField}
    />
  );
};

// Helper for puck.renderDropZone — TÜM prop'lar aynen geçer (adlı beyaz liste
// serbest data-*/aria-* geçişini sessizce düşürüyordu).
export const renderDropZone = (props: DropZoneProps) => <DropZone {...props} />;
export default DropZone;
