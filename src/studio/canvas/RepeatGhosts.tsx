import React, { createContext, useContext } from 'react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { RepeatItemContext } from '../../components/RepeatItemContext';
import { resolveItemTokens } from '../../utils/itemTokens';
import { useRepeatRows, type RepeatSourceFieldDef } from '../../components/useRepeatRows';
import { compileStyles, mergeClassName } from '../style/compileStyles';
import { STYLES_PROP } from '../style/types';
import { NodeErrorBoundary } from './NodeErrorBoundary';
import type { TecofNode } from '../../types';

/**
 * Non-interactive previews of a repeat zone's remaining rows.
 *
 * The zone's children (the item template) are edited ONCE as real nodes bound
 * to the first row; every further row renders here as a static "ghost" copy —
 * the component tree is rendered directly (no node wrappers, no handlers, no
 * drop targets) with `{{ item.* }}` tokens resolved against that row. CSS makes
 * ghosts inert and slightly dimmed (`.tecof-repeat-ghost`).
 */

const GhostParentContext = createContext<string | null>(null);

interface GhostDropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
  orientation?: 'vertical' | 'horizontal';
  repeatItems?: any[];
  /** <Slot> ile enjekte edilir: varsayılan yerleşim basılmaz (bkz. TecofRender). */
  managedLayout?: boolean;
}

const GhostDropZone = ({ zone, className, style, orientation = 'vertical', repeatItems, managedLayout }: GhostDropZoneProps) => {
  const parentId = useContext(GhostParentContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const items = useEditorStore((state) => state.document.zones[zoneKey]) || [];

  const orientationStyle: React.CSSProperties | undefined =
    !managedLayout && orientation === 'horizontal'
      ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }
      : undefined;

  // Nested repeat zones inside a ghost render ALL their rows statically, exactly
  // like the published page does.
  const children = Array.isArray(repeatItems)
    ? repeatItems.map((row, rowIndex) => (
        <RepeatItemContext.Provider
          key={rowIndex}
          value={{ item: row, index: rowIndex, count: repeatItems.length }}
        >
          {items.map((node) => (
            <GhostNode key={`${rowIndex}:${node.props.id}`} node={node} />
          ))}
        </RepeatItemContext.Provider>
      ))
    : items.map((node) => <GhostNode key={node.props.id} node={node} />);

  return (
    <div className={className} style={{ ...orientationStyle, ...style }}>
      {children}
    </div>
  );
};

const ghostRenderDropZone = (props: GhostDropZoneProps) => <GhostDropZone {...props} />;

/** Nested repeat slot inside a ghost — resolves async sources (api-list/CMS). */
const GhostRepeatSlot = ({
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
  return <GhostDropZone zone={zone} orientation={orientation} repeatItems={rows as any[]} />;
};

const GhostNode = ({ node }: { node: TecofNode }) => {
  const { config, metadata } = useStudio();
  const repeatCtx = useContext(RepeatItemContext);

  const componentConfig = config.components[node.type];
  if (!componentConfig || node.props._hidden) return null;

  const props = repeatCtx
    ? resolveItemTokens(node.props, repeatCtx.item, repeatCtx.index)
    : node.props;
  const styleClassName = compileStyles(props[STYLES_PROP]);

  const componentProps: any = {
    ...props,
    className: mergeClassName(props.className, styleClassName),
    puck: {
      renderDropZone: ghostRenderDropZone,
      registerOverlayPortal: () => () => {},
      isEditing: false,
      metadata: {
        ...(metadata || {}),
        ...(componentConfig.metadata || {}),
      },
    },
    editMode: false,
  };

  if (componentConfig.fields) {
    for (const [fieldName, fieldDef] of Object.entries<any>(componentConfig.fields)) {
      if (fieldDef?.type === 'slot') {
        componentProps[fieldName] = fieldDef.repeatSource ? (
          <GhostRepeatSlot
            zone={fieldName}
            orientation={fieldDef.orientation}
            value={props[fieldDef.repeatSource]}
            sourceFieldDef={componentConfig.fields?.[fieldDef.repeatSource]}
          />
        ) : (
          <GhostDropZone zone={fieldName} orientation={fieldDef.orientation} />
        );
      }
    }
  }

  return (
    <GhostParentContext.Provider value={node.props.id}>
      <NodeErrorBoundary label={componentConfig.label || node.type} type={node.type} resetKey={props}>
        {componentConfig.render(componentProps)}
      </NodeErrorBoundary>
    </GhostParentContext.Provider>
  );
};

export interface RepeatGhostsProps {
  /** ALL repeat rows — ghosts render rows[1..]; rows[0] is the editable template. */
  rows: any[];
  /** The template nodes of the repeat zone (each ghost provides its own zone scope). */
  nodes: TecofNode[];
  /** Satırları besleyen prop adı: verilirse ghost sarmalayıcısı
   *  `data-tecof-item="<ad>:<satır>"` taşır — tıklama Inspector'da o satırı
   *  açıp kaydırır (canvasInteractions.requestFocusFromTarget). */
  sourceField?: string;
}

export const RepeatGhosts = ({ rows, nodes, sourceField }: RepeatGhostsProps) => {
  if (rows.length <= 1 || nodes.length === 0) return null;
  return (
    <>
      {rows.slice(1).map((row, i) => (
        /* aria-hidden kaldırıldı DEĞİL: ghost'lar hâlâ dekoratif kopya; ama
           tıklama hedefi olarak data-tecof-item taşırlar (CSS pointer-events
           artık auto — bkz. .tecof-repeat-ghost). Inline edit ghost içinde
           BAŞLAMAZ (useInlineEdit ghost guard'ı) — kopyaya yazılamaz. */
        <div
          key={i + 1}
          className="tecof-repeat-ghost"
          aria-hidden="true"
          {...(sourceField ? { 'data-tecof-item': `${sourceField}:${i + 1}` } : {})}
        >
          <RepeatItemContext.Provider value={{ item: row, index: i + 1, count: rows.length }}>
            {nodes.map((node) => (
              <GhostNode key={`${i + 1}:${node.props.id}`} node={node} />
            ))}
          </RepeatItemContext.Provider>
        </div>
      ))}
    </>
  );
};

export default RepeatGhosts;
