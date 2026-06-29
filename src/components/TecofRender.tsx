import React, { createContext, useContext } from 'react';
import type { TecofRenderProps, TecofNode } from '../types';

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
}

const RenderDropZone = ({ zone, className, style }: DropZoneProps) => {
  const parentId = useContext(ParentNodeContext);
  const zoneKey = parentId ? `${parentId}:${zone}` : zone;
  const context = useContext(RenderContext);
  if (!context) return null;

  const items = context.zones[zoneKey] || [];

  return (
    <div className={className} style={style}>
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

  const componentProps = {
    ...node.props,
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
        componentProps[fieldName] = <RenderDropZone zone={fieldName} />;
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

  const contextValue = {
    zones: data.zones || {},
    config,
    cmsData: cmsData || null,
  };

  const renderedContent = data.content.map((item, index) => (
    <RenderNode key={item.props.id || index} node={item} index={index} />
  ));

  const rootProps = data.root?.props || {};
  const rootConfig = config.root;
  const contentWithLayout = rootConfig?.render
    ? rootConfig.render({
        ...rootProps,
        children: renderedContent,
        editMode: false,
      })
    : renderedContent;

  return (
    <RenderContext.Provider value={contextValue}>
      <div className={className}>
        {contentWithLayout}
      </div>
    </RenderContext.Provider>
  );
};

export default TecofRender;
