import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useStudio } from '../context';
import { EditorRepeatSlot, ParentNodeContext, renderDropZone } from './DropZone';
import { RepeatItemContext } from '../../components/RepeatItemContext';
import { resolveItemTokens } from '../../utils/itemTokens';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import type { TecofNode } from '../../types';
import { NodeErrorBoundary } from './NodeErrorBoundary';
import { postToHost, isEmbedded } from '../bridge';
import { compileStyles, mergeClassName } from '../style/compileStyles';
import { STYLES_PROP } from '../style/types';
import { interactionNodeClasses } from '../interactions/registry';
import { NODE_MARKER_CLASS } from './canvasInteractions';
import { useInlineDragRef } from './useInlineDragRef';
import { registerOverlayPortal, isInsideOverlayPortal } from './overlayPortal';

export interface NodeRendererProps {
  node: TecofNode;
  index: number;
  zoneKey?: string;
}

/** className sözleşmesi ihlali tip başına BİR kez uyarılır (konsol spam'i olmasın). */
const warnedMarkerTypes = new Set<string>();

export const NodeRenderer = ({ node, index, zoneKey }: NodeRendererProps) => {
  const { config, metadata, readOnly: studioReadOnly } = useStudio();
  const mode = useUiStore((s) => s.mode);
  // In preview mode the canvas behaves like the live site: no select/hover/drag,
  // components receive editMode=false so their links & buttons are clickable.
  const locked = studioReadOnly || mode === 'preview';
  const componentConfig = config.components[node.type];

  const selectNode = useEditorStore((state) => state.selectNode);
  const toggleSelect = useEditorStore((state) => state.toggleSelect);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  // Node-scoped derived selectors: each node only re-renders when ITS OWN hover/
  // drag state flips, instead of every node re-rendering on any hover/drag change.
  const isHovered = useEditorStore((state) => state.selection.hoveredId === node.props.id);
  const isDragging = useEditorStore((state) => state.drag?.id === node.props.id);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      e.stopPropagation();
      hoverNode(node.props.id);
    },
    [hoverNode, node.props.id, locked]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      e.stopPropagation();
      if (isHovered) {
        hoverNode(null);
      }
    },
    [hoverNode, node.props.id, isHovered, locked]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      // Overlay portals (tab headers, slider arrows, ...) keep their own click
      // behaviour in edit mode: don't select, and don't stopPropagation so the
      // component's handlers on the same element run untouched.
      if (isInsideOverlayPortal(e.target)) return;
      e.stopPropagation();

      // Cmd/Ctrl-click (or Shift-click) toggles multi-selection; plain click is
      // single-select as before (and only the single path notifies the host of
      // the primary, preserving existing puck:itemSelected behaviour).
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        toggleSelect(node.props.id);
        return;
      }

      selectNode(node.props.id);

      // Notify the host (when embedded) that an item was selected.
      if (isEmbedded()) {
        postToHost('puck:itemSelected', {
          item: {
            type: node.type,
            id: node.props.id,
          },
        });
      }
    },
    [selectNode, toggleSelect, node.props.id, node.type, locked]
  );

  // Double-click (inline edit), right-click (context menu) and drop (target +
  // indicator) are all delegated now (CanvasEditDelegation / CanvasNativeDrop /
  // DragGuides) — nodes no longer carry those per-node handlers.

  // Inside a repeat template the canvas edits the first data row: resolve
  // `{{ item.* }}` tokens in the displayed props so the template previews real
  // content. The INSPECTOR keeps showing the raw tokens (it reads the store).
  const repeatCtx = useContext(RepeatItemContext);
  const displayProps = useMemo(
    () => (repeatCtx ? resolveItemTokens(node.props, repeatCtx.item, repeatCtx.index) : node.props),
    [node.props, repeatCtx]
  );

  const label = componentConfig?.label || node.type;
  // Hidden nodes (Layers panel eye toggle) render faded + non-live in edit mode
  // so the user can still reach them; in preview they're omitted entirely below.
  const isHidden = !!node.props._hidden;
  const wrapperClassName = [
    'tecof-node-wrapper',
    locked ? 'is-readonly' : '',
    isDragging ? 'is-dragging' : '',
    isHidden ? 'is-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Compile the node's structured Tailwind styles and pass them as `className`
  // so the component applies them to its root (same prop flows in production).
  const styleClassName = compileStyles(displayProps[STYLES_PROP]);

  // Hook order: must run before the missing-component early return below.
  const { setRef: dragRef } = useInlineDragRef({
    node,
    index,
    zoneKey,
    locked,
    wrapperClassName,
    label,
    beginDrag,
    endDrag,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  });

  // Wrapperless sözleşme bekçisi: kimlik yalnız className kanalında yaşar —
  // className'i köküne geçirmeyen bileşen kanvasta SEÇİLEMEZ olur (üstelik
  // tıklaması boşluk sanılıp mevcut seçimi siler). İhlali sessizce yutmak
  // yerine tip başına bir kez uyarır ki tema geliştiricisi köküne cn(className)
  // eklemeyi bilsin. (Hook sırası: aşağıdaki erken return'lerden ÖNCE.)
  useEffect(() => {
    if (!componentConfig || componentConfig.inline || locked) return;
    const raf = requestAnimationFrame(() => {
      const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
      if (!iframe?.contentDocument) return; // canvas henüz hazır değil — yargıya varma
      if (iframe.contentDocument.querySelector(`[class~="tecof-node-${node.props.id}"]`)) return;
      if (warnedMarkerTypes.has(node.type)) return;
      warnedMarkerTypes.add(node.type);
      console.warn(
        `[TecofStudio] "${node.type}" bileşeni className prop'unu kök DOM elemanına geçirmiyor — ` +
        `kanvasta seçilemez/sürüklenemez olur ve tıklaması mevcut seçimi siler. ` +
        `render(props) içindeki className'i kök elemana (cn/clsx ile) ekleyin.`
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [componentConfig, locked, node.props.id, node.type]);

  if (!componentConfig) {
    return (
      <div className="tecof-node-missing">
        Bileşen bulunamadı: {node.type}
      </div>
    );
  }

  // In preview (the canvas behaves like the live site) hidden nodes disappear,
  // matching TecofRender. In edit mode they render faded (via `is-hidden`).
  if (isHidden && mode === 'preview') return null;

  // Interaction markers ride the same className channel as styles (the only
  // per-node hook that also exists on published pages). In edit mode `_startHidden`
  // nodes stay visible (dashed) so they're editable; preview hides them like live.
  const ixClasses = interactionNodeClasses(displayProps, { editing: !locked });
  // Non-inline nodes render WRAPPERLESS: the component root itself carries the
  // delegation marker (canvasInteractions resolves nodes from it), the wrapper
  // state classes (`tecof-node-wrapper` + is-readonly/is-dragging/is-hidden for the
  // grab cursor / drag fade / hidden outline), and the shared marker. Inline nodes
  // wire all of this via useInlineDragRef instead, so they opt out here.
  const editorClasses = componentConfig.inline
    ? ''
    : ` ${NODE_MARKER_CLASS} ${wrapperClassName}${node.props.sharedComponentId ? ' is-shared' : ''}`;

  const componentProps = {
    ...displayProps,
    className: mergeClassName(
      displayProps.className,
      `${styleClassName} ${ixClasses}${editorClasses}`.trim()
    ),
    puck: {
      dragRef: componentConfig.inline ? dragRef : undefined,
      renderDropZone,
      registerOverlayPortal,
      isEditing: !locked,
      metadata: {
        ...(metadata || {}),
        ...(componentConfig.metadata || {}),
      },
    },
    editMode: !locked,
  } as any;

  if (componentConfig.fields) {
    Object.entries(componentConfig.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
      if (fieldDef && fieldDef.type === 'slot') {
        // `repeatSource` slots always render in repeat mode so the zone shows its
        // template affordances even before any data rows exist. Rows may be a
        // plain array or an async source (api-list / CMS) — EditorRepeatSlot
        // resolves both, so the canvas previews real data.
        componentProps[fieldName] = fieldDef.repeatSource ? (
          <EditorRepeatSlot
            zone={fieldName}
            orientation={fieldDef.orientation}
            value={displayProps[fieldDef.repeatSource]}
            sourceFieldDef={componentConfig.fields?.[fieldDef.repeatSource]}
          />
        ) : (
          renderDropZone({ zone: fieldName, orientation: fieldDef.orientation })
        );
      }
    });
  }

  // Reset the error boundary when the node's props change so the component can
  // recover after the user edits the offending prop. The props REFERENCE is the
  // cheapest change signal: immer swaps it on every edit, and stringifying all
  // props here ran on every render of every node.
  const errorResetKey = node.props;

  // WRAPPERLESS: the rendered component IS the node — no `.tecof-node` /
  // `.tecof-node-wrapper` divs. Identity/state live on the component's className
  // (+ data-tecof-id set by the drag observer); select/hover/drag/drop/dblclick/
  // contextmenu are all delegated. Editor DOM now matches the published DOM.
  return (
    <ParentNodeContext.Provider value={node.props.id}>
      <NodeErrorBoundary label={label} type={node.type} resetKey={errorResetKey}>
        {componentConfig.render(componentProps)}
      </NodeErrorBoundary>
    </ParentNodeContext.Provider>
  );
};
