import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { STYLES_PROP, type NodeStyles } from '../style/types';
import { CONTROL_BY_ID, toArbitrary } from '../style/tokens';

/** Resolved padding/margin (px) for the spacing overlay. */
export interface BoxModel {
  mt: number; mr: number; mb: number; ml: number;
  pt: number; pr: number; pb: number; pl: number;
}

/** Overlay-space coordinates of a measured node. */
export interface Coords {
  top: number;
  left: number;
  width: number;
  height: number;
  box?: BoxModel;
}

export type SpacingAxis = 'x' | 'y';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Kind = 'padding' | 'margin';
/**
 * tokens.ts'de kenar-bazlı (pt/pr/pb/pl, mt/…) kontrol YOK — yalnızca eksen
 * kontrolleri var (px/py/mx/my, hepsi arbitraryPrefix'li). Bu yüzden bir kenar
 * tutamacını sürüklemek o EKSENİN token'ını yazar: üst/alt → py|my,
 * sol/sağ → px|mx (iki kenar birlikte değişir; önizleme de ikisini gösterir).
 */
type SpacingControlId = 'px' | 'py' | 'mx' | 'my';

interface EdgeDef {
  kind: Kind;
  side: Side;
  /** Sürükleme ekseni: üst/alt kenarlar dikey (y), sol/sağ kenarlar yatay (x). */
  axis: SpacingAxis;
  controlId: SpacingControlId;
  /** Başlangıç px değeri için coords.box alanı. */
  boxKey: keyof BoxModel;
  /** +1: pointer koordinatı arttıkça değer artar; -1: tersi (dışa/İçe yön). */
  dir: 1 | -1;
}

const EDGES: readonly EdgeDef[] = [
  { kind: 'padding', side: 'top', axis: 'y', controlId: 'py', boxKey: 'pt', dir: 1 },
  { kind: 'padding', side: 'bottom', axis: 'y', controlId: 'py', boxKey: 'pb', dir: -1 },
  { kind: 'padding', side: 'left', axis: 'x', controlId: 'px', boxKey: 'pl', dir: 1 },
  { kind: 'padding', side: 'right', axis: 'x', controlId: 'px', boxKey: 'pr', dir: -1 },
  { kind: 'margin', side: 'top', axis: 'y', controlId: 'my', boxKey: 'mt', dir: -1 },
  { kind: 'margin', side: 'bottom', axis: 'y', controlId: 'my', boxKey: 'mb', dir: 1 },
  { kind: 'margin', side: 'left', axis: 'x', controlId: 'mx', boxKey: 'ml', dir: -1 },
  { kind: 'margin', side: 'right', axis: 'x', controlId: 'mx', boxKey: 'mr', dir: 1 },
];

const EDGE_TITLES: Record<SpacingControlId, string> = {
  py: 'İç boşluk (dikey)',
  px: 'İç boşluk (yatay)',
  my: 'Dış boşluk (dikey)',
  mx: 'Dış boşluk (yatay)',
};

/** Kontrolün preset seçenekleri → { token, px } listesi (SPACE ölçeği ×4). */
const presetCache = new Map<string, { token: string; px: number }[]>();
const presetsFor = (controlId: string): { token: string; px: number }[] => {
  const cached = presetCache.get(controlId);
  if (cached) return cached;
  const presets = (CONTROL_BY_ID[controlId]?.options ?? [])
    .map((o) => o.value)
    .filter((v) => v !== '' && !Number.isNaN(Number(v)))
    // Tailwind ölçeği: 1 birim = 4px ('4' → 16px).
    .map((v) => ({ token: v, px: Number(v) * 4 }));
  presetCache.set(controlId, presets);
  return presets;
};

/**
 * px değeri → NodeStyles token'ı.
 * - SPACE ölçeğindeki bir preset'in px karşılığına ±1px yakınsa preset yazılır
 *   (ör. 16px → '4', 17px → '4').
 * - Değilse ve kontrolün arbitraryPrefix'i varsa köşeli parantezli arbitrary
 *   değer yazılır (ör. 18px → '[18px]' → `py-[18px]`).
 * - arbitraryPrefix yoksa en yakın preset'e yuvarlanır (mevcut spacing
 *   kontrollerinin hepsinde prefix var; bu dal geleceğe dönük güvence).
 */
export const pxToSpacingToken = (controlId: string, px: number): string => {
  const presets = presetsFor(controlId);
  const hit = presets.find((p) => Math.abs(p.px - px) <= 1);
  if (hit) return hit.token;
  if (CONTROL_BY_ID[controlId]?.arbitraryPrefix) return toArbitrary(`${px}px`);
  let best = presets[0];
  for (const p of presets) {
    if (Math.abs(p.px - px) < Math.abs(best.px - px)) best = p;
  }
  return best ? best.token : String(px);
};

interface DragState {
  edge: EdgeDef;
  startPx: number;
  startClientX: number;
  startClientY: number;
  valuePx: number;
  moved: boolean;
}

/**
 * Canlı önizleme bantları — eksen token'ı yazıldığı için İKİ karşılıklı kenar
 * birden gösterilir (dürüst önizleme: pointerup'ta ikisi de bu değeri alır).
 * Konumlar seçili çerçeveye (.tecof-outline.is-selected) görelidir.
 */
const previewBands = (d: DragState): React.CSSProperties[] => {
  const v = d.valuePx;
  if (d.edge.axis === 'y') {
    return d.edge.kind === 'padding'
      ? [{ top: 0, left: 0, right: 0, height: v }, { bottom: 0, left: 0, right: 0, height: v }]
      : [{ top: -v, left: 0, right: 0, height: v }, { bottom: -v, left: 0, right: 0, height: v }];
  }
  return d.edge.kind === 'padding'
    ? [{ top: 0, bottom: 0, left: 0, width: v }, { top: 0, bottom: 0, right: 0, width: v }]
    : [{ top: 0, bottom: 0, left: -v, width: v }, { top: 0, bottom: 0, right: -v, width: v }];
};

/** Sürüklenen kenarın yanında duran "NNpx" etiketi. */
const labelStyle = (d: DragState): React.CSSProperties => {
  const v = d.valuePx;
  const inside = d.edge.kind === 'padding';
  switch (d.edge.side) {
    case 'top':
      return inside
        ? { top: v + 6, left: '50%', transform: 'translateX(-50%)' }
        : { top: -v - 6, left: '50%', transform: 'translate(-50%, -100%)' };
    case 'bottom':
      return inside
        ? { bottom: v + 6, left: '50%', transform: 'translateX(-50%)' }
        : { bottom: -v - 6, left: '50%', transform: 'translate(-50%, 100%)' };
    case 'left':
      return inside
        ? { left: v + 6, top: '50%', transform: 'translateY(-50%)' }
        : { left: -v - 6, top: '50%', transform: 'translate(-100%, -50%)' };
    case 'right':
      return inside
        ? { right: v + 6, top: '50%', transform: 'translateY(-50%)' }
        : { right: -v - 6, top: '50%', transform: 'translate(100%, -50%)' };
  }
};

interface SpacingDragHandlesProps {
  nodeId: string;
  coords: Coords;
  /** Sürükleme başladı/bitti bildirimi (overlay köküne "dragging" sınıfı için). */
  onDragAxisChange: (axis: SpacingAxis | null) => void;
}

/**
 * Webflow/Elementor tarzı görsel spacing düzenleme: seçili çerçevenin kenar
 * ortalarındaki tutamaçlar sürüklenerek padding (iç, yeşil) ve margin (dış,
 * amber) ayarlanır.
 *
 * Undo uyumu: sürükleme başına TEK yazma yapılır (pointerup'ta). Move sırasında
 * yalnızca overlay görseli (bant + px etiketi) güncellenir; gerçek layout
 * değişimi pointerup'tan sonra görünür — kabul edilebilir bir ödünleşim, her
 * move'da yazmak undo zincirini kirletirdi.
 */
export const SpacingDragHandles = ({ nodeId, coords, onDragAxisChange }: SpacingDragHandlesProps) => {
  const [drag, setDrag] = useState<DragState | null>(null);
  // Handler'lar stale closure yaşamasın diye güncel durum ref'te tutulur.
  const dragRef = useRef<DragState | null>(null);
  const captureRef = useRef<{ el: HTMLElement; pointerId: number } | null>(null);

  /** Sürüklemeyi bitir; commit=true ise token'ı hesaplayıp _tecofStyles'a yaz. */
  const endDrag = useCallback(
    (commit: boolean) => {
      const d = dragRef.current;
      const cap = captureRef.current;
      dragRef.current = null;
      captureRef.current = null;
      setDrag(null);
      onDragAxisChange(null);
      if (cap) {
        try {
          cap.el.releasePointerCapture(cap.pointerId);
        } catch {
          /* capture zaten bırakılmış olabilir */
        }
      }
      if (!d || !commit || !d.moved) return;

      const store = useEditorStore.getState();
      const details = findNodeById(store.document, nodeId);
      if (!details) return;
      const current = (details.node.props?.[STYLES_PROP] ?? {}) as NodeStyles;
      const token = pxToSpacingToken(d.edge.controlId, d.valuePx);
      // Yazım her zaman `base` katmanına yapılır — breakpoint hedefleme bu
      // özelliğin kapsamı dışında. Styles objesi IMMUTABLE değiştirilir:
      // compileStyles'ın WeakMap cache'i referans değişimine güvenir.
      const next: NodeStyles = {
        ...current,
        base: { ...current.base, [d.edge.controlId]: token },
      };
      store.updateProps(nodeId, { [STYLES_PROP]: next });
    },
    [nodeId, onDragAxisChange],
  );

  const handlePointerDown = (edge: EdgeDef) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || dragRef.current) return;
    const box = coords.box;
    if (!box) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    captureRef.current = { el, pointerId: e.pointerId };
    const startPx = Math.max(0, Math.round(box[edge.boxKey]));
    const next: DragState = {
      edge,
      startPx,
      startClientX: e.clientX,
      startClientY: e.clientY,
      valuePx: startPx,
      moved: false,
    };
    dragRef.current = next;
    setDrag(next);
    onDragAxisChange(edge.axis);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const delta =
      d.edge.axis === 'y' ? e.clientY - d.startClientY : e.clientX - d.startClientX;
    const valuePx = Math.max(0, Math.round(d.startPx + d.edge.dir * delta));
    const moved = d.moved || delta !== 0;
    if (valuePx === d.valuePx && moved === d.moved) return;
    const next: DragState = { ...d, valuePx, moved };
    dragRef.current = next;
    setDrag(next);
  };

  const handlePointerUp = () => endDrag(true);
  const handlePointerCancel = () => endDrag(false);

  // Escape → iptal: başlangıç değerine dönülür, hiçbir şey yazılmaz.
  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        endDrag(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [dragging, endDrag]);

  // Unmount (seçim değişimi) sürükleme ortasında gelirse overlay sınıfını temizle.
  useEffect(() => () => onDragAxisChange(null), [onDragAxisChange]);

  return (
    <>
      {EDGES.map((edge) => {
        const isActive = drag?.edge === edge;
        // Sürükleme sırasında yalnızca aktif tutamaç görünür kalır.
        if (drag && !isActive) return null;
        return (
          <div
            key={`${edge.kind}-${edge.side}`}
            className={`tecof-spacing-handle is-${edge.kind} is-${edge.side} ${
              edge.axis === 'y' ? 'is-h' : 'is-v'
            }${isActive ? ' is-active' : ''}`}
            title={`${EDGE_TITLES[edge.controlId]} — sürükleyerek ayarlayın (Esc: iptal)`}
            onPointerDown={handlePointerDown(edge)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <span className="tecof-spacing-handle-bar" />
          </div>
        );
      })}

      {drag && (
        <>
          {previewBands(drag).map((style, i) => (
            <div
              key={i}
              className={`tecof-spacing-drag-band ${
                drag.edge.kind === 'padding' ? 'tecof-space-padding' : 'tecof-space-margin'
              }`}
              style={style}
            />
          ))}
          <div className={`tecof-spacing-drag-label is-${drag.edge.kind}`} style={labelStyle(drag)}>
            {drag.valuePx}px
          </div>
        </>
      )}
    </>
  );
};
