import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { initScrollEffects } from '../style/scrollEffects';
import { initInteractions } from '../interactions/runtime';
import { collectInteractionRegistry } from '../interactions/registry';
import { useStudio } from '../context';
import { Frame } from './Frame';
import { NodeRenderer } from './NodeRenderer';
import { CanvasNativeDrop } from './canvasDrop';
import { CanvasEditDelegation } from './canvasEdit';
import { InsertOverlay } from './InsertOverlay';
import { AddSectionModal } from '../panels/AddSectionModal';
import { CanvasStyleInjector } from './CanvasStyleInjector';
import { GridOverlay } from './GridOverlay';
import { DragGuides } from './DragGuides';
import { TouchDragLayer } from './TouchDragLayer';
import { createNode } from './dndUtils';
import { isValidDrop } from '../../engine/rules';
import { findNodeById } from '../../engine/zones';
import { resolveTheme } from '../theme/theme';
import { LayoutTemplate, Plus } from 'lucide-react';
import { isEmbedded, postToHost } from '../bridge';
import type { SectionTemplate } from '../../types';

/** Fixed layout widths per viewport; desktop comes from `uiStore.desktopWidth`. */
const VIEWPORT_WIDTHS = { tablet: 768, mobile: 375 } as const;

export const Canvas = () => {
  const content = useEditorStore((state) => state.document.content);
  const viewport = useEditorStore((state) => state.viewport);
  const { config, readOnly } = useStudio();
  const rootProps = useEditorStore((state) => state.document.root?.props) || {};
  const gridVisible = useUiStore((s) => s.gridVisible);
  const gridColumns = useUiStore((s) => s.gridColumns);
  const gridGap = useUiStore((s) => s.gridGap);
  const theme = resolveTheme(rootProps, config.theme);
  const insertNode = useEditorStore((state) => state.insertNode);
  const insertPayload = useEditorStore((state) => state.insertPayload);
  const selectNode = useEditorStore((state) => state.selectNode);

  // ── Gerçek-genişlik canvas + sığdırma (fit-scale) ──
  // Sayfa, seçili viewport'un GERÇEK genişliğinde (desktop: uiStore.desktopWidth)
  // layout edilir; kullanılabilir alandan genişse CSS transform ile küçültülerek
  // sığdırılır. Böylece paneller ne kadar yer kaplarsa kaplasın site kendini
  // gerçek masaüstü breakpoint'inde render eder — "laptop'ta tablet gibi
  // görünme" sorunu biter. Overlay'ler ölçeği iframe rect/clientWidth oranından
  // türetir; TopBar için ayrıca uiStore.canvasScale'e yayınlanır.
  const desktopWidth = useUiStore((s) => s.desktopWidth);
  const setCanvasScale = useUiStore((s) => s.setCanvasScale);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const designWidth = viewport === 'desktop' ? desktopWidth : VIEWPORT_WIDTHS[viewport];
  // Container 24px padding taşır; ölçüler content-box'a göre.
  const CONTAINER_PAD = 48;
  const availW = Math.max(0, (containerSize?.w ?? 0) - CONTAINER_PAD);
  const scale =
    containerSize && availW > 0 && availW < designWidth
      ? Math.max(0.2, availW / designWidth)
      : 1;

  useEffect(() => {
    setCanvasScale(scale);
    return () => setCanvasScale(1);
  }, [scale, setCanvasScale]);

  // Modal hedefi UI store'da: boş DropZone'lar da (Canvas dışından) açabilsin.
  const addSectionTarget = useUiStore((s) => s.addSectionTarget);
  const openAddSection = useUiStore((s) => s.openAddSection);
  const closeAddSection = useUiStore((s) => s.closeAddSection);

  // Modal, hedef zone'a (kök dahil) bırakılabilecek tipleri göstersin — drop
  // kurallarıyla aynı kaynaktan. Kök hedefte zoneKey undefined geçilir;
  // allowedParents tanımlayan temalarda kural ihlali modalda da engellenir.
  const modalFilterType = addSectionTarget
    ? (type: string) =>
        isValidDrop(config, type, addSectionTarget.zoneKey, useEditorStore.getState().document)
    : undefined;

  /* Eklenen node'u seç ve görünür alana kaydır — eskiden modal kapanınca yeni
     bölüm viewport dışında, seçimsiz kalıyordu; kullanıcı "eklenmedi" sanıp
     tekrar ekliyordu (mükerrer bölüm şikayetinin kaynağı). */
  const focusInsertedNode = (id: string | undefined) => {
    if (!id) return;
    selectNode(id);
    if (isEmbedded()) {
      const type = findNodeById(useEditorStore.getState().document, id)?.node.type ?? '';
      postToHost('puck:itemSelected', { item: { type, id } });
    }
    requestAnimationFrame(() => {
      const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
      const el = iframe?.contentDocument?.querySelector(`[class~="tecof-node-${id}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  /* insertPayload id'leri remap'ler — eklenen kök node'un id'si store'dan,
     eklendiği pozisyondan okunur. */
  const insertedIdAt = (zoneKey: string | undefined, index: number | undefined) => {
    const docState = useEditorStore.getState().document;
    const list = zoneKey ? docState.zones[zoneKey] : docState.content;
    if (!list || list.length === 0) return undefined;
    const idx = index != null ? Math.min(index, list.length - 1) : list.length - 1;
    return list[idx]?.props.id;
  };

  // Root drop is handled by the delegated CanvasNativeDrop (root carries
  // data-tecof-zone="root"); the is-touch-dragover affordance is set imperatively.

  // Drag can end anywhere (Escape, drop outside, dragend on the source); make
  // sure a stale drop-hover never survives it — the guides key off this state.
  useEffect(
    () =>
      useEditorStore.subscribe((cur, prev) => {
        if (prev.drag && !cur.drag) useUiStore.getState().setDropHover(null);
      }),
    []
  );

  // Scroll interactions run inside the canvas iframe ONLY in preview mode, so
  // edit mode never hides `reveal` content (no `tecof-has-js` gate) — matching
  // how the published page behaves once live.
  const mode = useUiStore((s) => s.mode);
  useEffect(() => {
    if (mode !== 'preview') return;
    const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
    const doc = iframe?.contentDocument;
    if (!doc) return;
    const handle = initScrollEffects(doc);
    return () => handle.destroy();
    // `viewport` is included because switching it remounts the iframe — we must
    // re-init the effects on the fresh document.
  }, [mode, viewport]);

  // When-then interactions run inside the canvas iframe ONLY in preview mode, so
  // edit-mode clicks keep selecting nodes. The registry is read from the current
  // document (non-reactive snapshot) — entering preview re-inits with fresh data.
  useEffect(() => {
    if (mode !== 'preview') return;
    const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
    const doc = iframe?.contentDocument;
    if (!doc) return;
    const registry = collectInteractionRegistry(useEditorStore.getState().document);
    const handle = initInteractions(doc, registry);
    return () => handle.destroy();
  }, [mode, viewport]);

  const handleSelectComponent = (type: string, customProps?: Record<string, unknown>) => {
    // `customProps` carries a saved/shared component's props snapshot; without
    // it the node starts from the component's defaultProps.
    const newNode = createNode(config, type, customProps);
    const target = addSectionTarget;
    insertNode(newNode, target?.zoneKey, target?.index);
    closeAddSection();
    focusInsertedNode(newNode.props.id as string);
  };

  const handleSelectTemplate = (template: SectionTemplate) => {
    // Deep-clone so the registered template is never mutated by id remapping.
    const payload = JSON.parse(JSON.stringify({
      node: template.payload.node,
      zones: template.payload.zones || {},
    }));
    const target = addSectionTarget;
    insertPayload(payload, target?.zoneKey, target?.index);
    closeAddSection();
    focusInsertedNode(insertedIdAt(target?.zoneKey, target?.index));
  };

  const clearSelection = () => {
    selectNode(null);
    postToHost('puck:itemDeselected');
  };

  const handleCanvasShellClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicks inside the iframe are handled by Frame/Canvas root. This clears
    // selection only when the user clicks the editor chrome around the page.
    if ((e.target as HTMLElement).closest('.tecof-canvas-viewport')) return;
    // AddSectionModal bu container'ın İÇİNDE render edilir — modalda gezinen
    // mousedown seçimi silip host'a itemDeselected yollamamalı.
    if ((e.target as HTMLElement).closest('.tecof-modal-overlay')) return;
    clearSelection();
  };

  const handleRootClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // NodeRenderer stops propagation for real components. Anything that reaches
    // the root here is page whitespace, section dividers, or the empty canvas.
    if ((e.target as HTMLElement).closest('.tecof-node-wrapper')) return;
    clearSelection();
  };

  const rootClassName = [
    'tecof-canvas-root',
    content.length === 0 ? 'is-empty' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const viewportClassName = [
    'tecof-canvas-viewport',
    viewport !== 'desktop' ? `is-${viewport}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderedContent = (
    <div
      className={rootClassName}
      onClick={handleRootClick}
      data-tecof-zone="root"
    >
      {content.length === 0 ? (
        <div className="tecof-canvas-empty">
          <span className="tecof-canvas-empty-icon" aria-hidden="true">
            <LayoutTemplate size={22} strokeWidth={1.8} />
          </span>
          <span className="tecof-canvas-empty-kicker">Root</span>
          <p className="tecof-canvas-empty-title">Canvas boş</p>
          <p className="tecof-canvas-empty-sub">İlk bölümü ekleyin</p>
          {!readOnly && (
            <button
              type="button"
              className="tecof-canvas-empty-add-btn"
              onClick={() => openAddSection({ index: 0 })}
            >
              <Plus size={16} strokeWidth={2.4} />
              Bölüm Ekle
            </button>
          )}
        </div>
      ) : (
        <>
          {/* WRAPPERLESS: sections render as DIRECT children of the root zone —
              the "+" insert affordances are painted out-of-flow by InsertOverlay
              so editor DOM == published DOM (no interleaved divider elements). The
              tail spacer gives the always-visible trailing "+" room to sit below
              the last section without overlapping it. */}
          {content.map((item, index) => (
            <NodeRenderer key={item.props.id} node={item} index={index} />
          ))}
          {!readOnly && <div className="tecof-canvas-root-tail" aria-hidden="true" />}
        </>
      )}
    </div>
  );

  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render
    ? rootConfig.render({
      ...rootProps,
      children: renderedContent,
      editMode: true,
    })
    : renderedContent;

  return (
    <div
      ref={containerRef}
      className="tecof-canvas-container"
      onMouseDown={handleCanvasShellClick}
    >
      {/* Stage: layout alanı ÖLÇEKLENMİŞ boyuttadır (scrollbar/ortalamayı doğru
          tutar); içindeki viewport gerçek tasarım genişliğinde layout edilip
          transform ile sığdırılır. */}
      <div
        className="tecof-canvas-stage"
        style={{ width: Math.round(designWidth * scale), height: '100%' }}
      >
        <div
          className={viewportClassName}
          style={{
            width: designWidth,
            height: scale < 1 ? `${(100 / scale).toFixed(4)}%` : '100%',
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
          }}
        >
        <Frame className="tecof-canvas-frame">
          {/* Stil token'larının CSS'i host Tailwind build'ine bağımlı değil —
              iframe içine canlı üretilir (cssGenerator.ts). */}
          <CanvasStyleInjector />
          {/* Column alignment guide — editor aid, hidden in preview. Aligns to the
              theme container width so it matches how sections lay out. */}
          {gridVisible && mode !== 'preview' && (
            <GridOverlay
              columns={gridColumns}
              gap={gridGap}
              maxWidth={theme.spacing.containerMaxWidth}
              paddingX={theme.spacing.sectionPaddingX}
            />
          )}
          {/* Drag-time smart alignment guides (renders nothing while idle). */}
          {mode !== 'preview' && <DragGuides />}
          {/* Touch/pen drag-and-drop (native HTML5 DnD is mouse-only). */}
          {mode !== 'preview' && !readOnly && <TouchDragLayer />}
          {/* Delegated native (mouse) drop — replaces per-node/per-zone useDropTarget. */}
          {mode !== 'preview' && !readOnly && <CanvasNativeDrop />}
          {/* Delegated inline-edit (dblclick) + context menu — replaces per-node handlers. */}
          {mode !== 'preview' && !readOnly && <CanvasEditDelegation />}
          {/* Out-of-flow "+" insert affordances — replaces the in-flow AddSectionButton
              dividers so slot/root DOM children stay exactly the published set. */}
          {mode !== 'preview' && !readOnly && <InsertOverlay />}
          {contentWithLayout}
        </Frame>
        </div>
      </div>

      <AddSectionModal
        isOpen={addSectionTarget != null}
        onClose={closeAddSection}
        onSelect={handleSelectComponent}
        onSelectTemplate={handleSelectTemplate}
        config={config}
        filterType={modalFilterType}
      />
    </div>
  );
};
export default Canvas;
