import React, { createContext, useContext } from 'react';
import type { TecofRenderProps, TecofNode } from '../types';
import { compileStyles, mergeClassName } from '../studio/style/compileStyles';
import { STYLES_PROP } from '../studio/style/types';
import { ANIMATION_CSS } from '../studio/style/animationCss';
import { collectDocumentClasses } from '../studio/style/compileStyles';
import { generateStyleCss } from '../studio/style/cssGenerator';
import { migrateDocument } from '../engine/migrate';

const RenderContext = createContext<{
  zones: Record<string, TecofNode[]>;
  config: any;
  cmsData: any;
} | null>(null);

const ParentNodeContext = createContext<string | null>(null);

interface DropZoneProps {
  zone: string;
  className?: string;
  style?: React.CSSProperties;
  /** Lay children out side-by-side (row) instead of stacked. Mirrors the editor. */
  orientation?: 'vertical' | 'horizontal';
}

const RenderDropZone = ({ zone, className, style, orientation = 'vertical' }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const context = useContext(RenderContext);
  if (!context) return null;

  const items = context.zones[zoneKey] || [];

  // Horizontal slots render side-by-side on the published site too, so the
  // layout matches what the editor shows. Author styles still override via
  // `style` (applied last) or a `className`.
  const orientationStyle: React.CSSProperties | undefined =
    orientation === 'horizontal'
      ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }
      : undefined;

  return (
    <div className={className} style={{ ...orientationStyle, ...style }}>
      {items.map((item, index) => (
        <RenderNode key={item.props.id || index} node={item} index={index} />
      ))}
    </div>
  );
};

const RenderNode = ({ node, index }: { node: any; index: number }) => {
  const context = useContext(RenderContext);
  if (!context) return null;

  const componentConfig = context.config.components[node.type];
  if (!componentConfig) return null;

  // Compile the node's structured Tailwind styles into `className` exactly as the
  // editor's NodeRenderer does, so the visual style editor's output renders on the
  // published site too (not only inside the editor canvas).
  const styleClassName = compileStyles(node.props[STYLES_PROP]);

  const componentProps = {
    ...node.props,
    className: mergeClassName(node.props.className, styleClassName),
    puck: {
      renderDropZone: RenderDropZone,
      isEditing: false,
      metadata: {
        cmsData: context.cmsData || null,
        ...(componentConfig.metadata || {}),
      },
    },
    editMode: false,
  } as any;

  if (componentConfig.fields) {
    Object.entries(componentConfig.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
      if (fieldDef && fieldDef.type === 'slot') {
        componentProps[fieldName] = <RenderDropZone zone={fieldName} orientation={fieldDef.orientation} />;
      }
    });
  }

  return (
    <ParentNodeContext.Provider value={node.props.id || null}>
      {componentConfig.render(componentProps)}
    </ParentNodeContext.Provider>
  );
};

/**
 * TecofRender — Puck-compatible native page renderer.
 *
 * Pass `data` (PuckPageData-compatible page data) and Tecof component `config` directly.
 * Optionally pass `cmsData` to make CMS item data available to all
 * components via `puck.metadata.cmsData`.
 *
 * No API fetch, no provider required, zero @puckeditor/core dependency.
 */
export const TecofRender = ({ data, config, className, cmsData }: TecofRenderProps) => {
  if (!data) return null;

  // Upgrade old saved data to the current schema so published pages render
  // correctly (no-op unless the host declares `config.migrations`).
  const doc = migrateDocument(
    {
      root: data.root ?? { props: {} },
      // PuckContentItem/TecofNode share a shape; nodes always carry an id at runtime.
      content: (data.content ?? []) as TecofNode[],
      zones: data.zones ?? {},
    },
    config.migrations
  );

  const contextValue = {
    zones: doc.zones || {},
    config,
    cmsData: cmsData || null,
  };

  const renderedContent = doc.content.map((item, index) => (
    <RenderNode key={item.props.id || index} node={item} index={index} />
  ));

  const rootProps = doc.root?.props || {};
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render
    ? rootConfig.render({
        ...rootProps,
        children: renderedContent,
        editMode: false,
      })
    : renderedContent;

  // Self-contained CSS for every editor style class the document uses. This
  // removes any dependency on the host's Tailwind build/safelist — the classes
  // in `_tecofStyles` get their CSS generated right here (see cssGenerator.ts).
  const styleCss = generateStyleCss(collectDocumentClasses(doc));

  return (
    <RenderContext.Provider value={contextValue}>
      {/* Entrance-animation keyframes for the `anim` style control (ThemeVars-style
          <style> injection). Emitted once per page; harmless when unused. */}
      <style data-tecof-animations>{ANIMATION_CSS}</style>
      {styleCss && <style data-tecof-styles>{styleCss}</style>}
      <div className={className}>
        {contentWithLayout}
      </div>
    </RenderContext.Provider>
  );
};

export default TecofRender;
