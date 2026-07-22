import React, { useCallback, useContext, useMemo } from 'react';
import { useStudio } from '../context';
import { EditorRepeatSlot, ParentNodeContext, renderDropZone } from './DropZone';
import { RepeatItemContext } from '../../components/RepeatItemContext';
import { resolveItemTokens } from '../../utils/itemTokens';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import type { TecofNode } from '../../types';
import { useInlineEdit } from './useInlineEdit';
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

  const setContextMenu = useUiStore((s) => s.setContextMenu);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (locked) return;
      if (isInsideOverlayPortal(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      selectNode(node.props.id);
      // This event fires INSIDE the canvas iframe, so its client coords are in
      // the iframe's viewport. The menu renders in the parent document —
      // translate by the iframe's position there (same technique as
      // SelectionOverlay's coordinate mapping).
      const iframe = document.querySelector<HTMLIFrameElement>(
        '.tecof-canvas-viewport iframe'
      );
      const iframeRect = iframe?.getBoundingClientRect();
      // Fit-scale: iframe içi koordinatlar GERÇEK px — host'a çevirirken ölçekle.
      const scale =
        iframe && iframeRect && iframe.clientWidth > 0
          ? iframeRect.width / iframe.clientWidth
          : 1;
      setContextMenu({
        nodeId: node.props.id,
        x: e.clientX * scale + (iframeRect?.left ?? 0),
        y: e.clientY * scale + (iframeRect?.top ?? 0),
      });
    },
    [locked, selectNode, node.props.id, setContextMenu]
  );

  const { onDoubleClick } = useInlineEdit(node, locked);

  // Drop (target + indicator) is handled by the delegated CanvasNativeDrop +
  // DragGuides now; nodes no longer carry per-node drop handlers.

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
    onDoubleClick,
    onContextMenu: handleContextMenu,
  });

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
  // Non-inline nodes carry the delegation marker so `canvasInteractions` can
  // resolve them from the rendered component root (inline nodes wire their own
  // handlers via useInlineDragRef, so they opt out).
  const markerClass = componentConfig.inline ? '' : ` ${NODE_MARKER_CLASS}`;

  const componentProps = {
    ...displayProps,
    className: mergeClassName(
      displayProps.className,
      `${styleClassName} ${ixClasses}${markerClass}`.trim()
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

  return (
    <ParentNodeContext.Provider value={node.props.id}>
      {componentConfig.inline ? (
        <NodeErrorBoundary label={label} type={node.type} resetKey={errorResetKey}>
          {componentConfig.render(componentProps)}
        </NodeErrorBoundary>
      ) : (
        <div className="tecof-node">
          {/* Select, hover, drag SOURCE and now the drop TARGET + indicator all
              moved off the wrapper: select/hover/drag → delegated canvasInteractions
              (Frame), drop → delegated CanvasNativeDrop, drop line → DragGuides. The
              wrapper stays only for identity (data-tecof-*) + dblclick/contextmenu
              until the wrapper itself is removed (step 4b). */}
          <div
            className={wrapperClassName}
            data-tecof-id={node.props.id}
            data-tecof-type={node.type}
            data-tecof-index={index}
            data-tecof-zone={zoneKey || 'root'}
            data-tecof-shared={node.props.sharedComponentId ? 'true' : undefined}
            onDoubleClick={onDoubleClick}
            onContextMenu={handleContextMenu}
          >
            <NodeErrorBoundary label={label} type={node.type} resetKey={errorResetKey}>
              {componentConfig.render(componentProps)}
            </NodeErrorBoundary>
          </div>
        </div>
      )}
    </ParentNodeContext.Provider>
  );
};
