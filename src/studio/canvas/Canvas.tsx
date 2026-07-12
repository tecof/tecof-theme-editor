import React, { useEffect } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { initScrollEffects } from '../style/scrollEffects';
import { useStudio } from '../context';
import { Frame } from './Frame';
import { NodeRenderer } from './NodeRenderer';
import { useDropTarget } from './useDropTarget';
import { AddSectionButton } from './AddSectionButton';
import { AddSectionModal } from '../panels/AddSectionModal';
import { CanvasStyleInjector } from './CanvasStyleInjector';
import { GridOverlay } from './GridOverlay';
import { DragGuides } from './DragGuides';
import { createNode } from './dndUtils';
import { isValidDrop } from '../../engine/rules';
import { resolveTheme } from '../theme/theme';
import { LayoutTemplate, Plus } from 'lucide-react';
import { postToHost } from '../bridge';
import type { SectionTemplate } from '../../types';

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

  // Modal hedefi UI store'da: boş DropZone'lar da (Canvas dışından) açabilsin.
  const addSectionTarget = useUiStore((s) => s.addSectionTarget);
  const openAddSection = useUiStore((s) => s.openAddSection);
  const closeAddSection = useUiStore((s) => s.closeAddSection);

  // Zone hedefli açılışta modal yalnızca o zone'a bırakılabilecek tipleri
  // göstersin (drop kurallarıyla aynı kaynaktan).
  const modalFilterType = addSectionTarget?.zoneKey
    ? (type: string) =>
        isValidDrop(config, type, addSectionTarget.zoneKey, useEditorStore.getState().document)
    : undefined;

  const {
    isDragOver: isRootDragOver,
    onDragOver: handleRootDragOver,
    onDragLeave: handleRootDragLeave,
    onDrop: handleRootDrop,
  } = useDropTarget({
    // Root content has no zone key.
    zoneKey: undefined,
    locked: readOnly,
    getIndex: () => content.length,
  });

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

  const handleSelectComponent = (type: string, customProps?: Record<string, unknown>) => {
    // `customProps` carries a saved/shared component's props snapshot; without
    // it the node starts from the component's defaultProps.
    const newNode = createNode(config, type, customProps);
    insertNode(newNode, addSectionTarget?.zoneKey, addSectionTarget?.index);
    closeAddSection();
  };

  const handleSelectTemplate = (template: SectionTemplate) => {
    // Deep-clone so the registered template is never mutated by id remapping.
    const payload = JSON.parse(JSON.stringify({
      node: template.payload.node,
      zones: template.payload.zones || {},
    }));
    insertPayload(payload, addSectionTarget?.zoneKey, addSectionTarget?.index);
    closeAddSection();
  };

  const clearSelection = () => {
    selectNode(null);
    postToHost('puck:itemDeselected');
  };

  const handleCanvasShellClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicks inside the iframe are handled by Frame/Canvas root. This clears
    // selection only when the user clicks the editor chrome around the page.
    if ((e.target as HTMLElement).closest('.tecof-canvas-viewport')) return;
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
    isRootDragOver ? 'is-dragover' : '',
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
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
      onClick={handleRootClick}
      data-tecof-zone="root"
    >
      {content.length === 0 ? (
        <div className="tecof-canvas-empty">
          <span className="tecof-canvas-empty-icon" aria-hidden="true">
            <LayoutTemplate size={22} strokeWidth={1.8} />
          </span>
          <span className="tecof-canvas-empty-kicker">Root</span>
          <p className="tecof-canvas-empty-title">
            {isRootDragOver ? 'Bırakmaya hazır' : 'Canvas boş'}
          </p>
          <p className="tecof-canvas-empty-sub">
            {isRootDragOver ? 'Bileşen ana akışa eklenecek' : 'İlk bölümü ekleyin'}
          </p>
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
          {!readOnly && (
            <AddSectionButton
              index={0}
              onClick={(idx) => openAddSection({ index: idx })}
            />
          )}
          {content.map((item, index) => (
            <React.Fragment key={item.props.id}>
              <NodeRenderer node={item} index={index} />
              {!readOnly && (
                <AddSectionButton
                  index={index + 1}
                  // The trailing divider (below the last section) stays always
                  // visible; in-between dividers keep the hover reveal.
                  fixed={index === content.length - 1}
                  onClick={(idx) => openAddSection({ index: idx })}
                />
              )}
            </React.Fragment>
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
    <div className="tecof-canvas-container" onMouseDown={handleCanvasShellClick}>
      <div className={viewportClassName}>
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
          {contentWithLayout}
        </Frame>
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
