import React, { useMemo, useState } from 'react';
import { useStudio } from '../context';
import { useEditorStore } from '../../engine/store';
import { LayersTree } from './LayersTree';
import { BlockThumb } from './BlockThumb';
import { Layers, Grid, Search } from 'lucide-react';
import { setDragGhost } from '../canvas/dragGhost';
import { createNode, writeDragData } from '../canvas/dndUtils';

/**
 * Resolve the merchant domain used for component preview thumbnails.
 *
 * There is no first-class `domain` in the studio context, so we look in
 * priority order and degrade gracefully (returning undefined) when nothing is
 * found — in which case the palette renders text-only buttons as before.
 *
 *  1. A host-supplied value on the config (`config.domain` / `config.metadata.domain`).
 *  2. A value on the studio `metadata` bag (`metadata.domain`).
 *  3. The hostname derived from the API client's CDN/API URL.
 */
const resolveDomain = (
  config: Record<string, any>,
  metadata: Record<string, any> | undefined,
  baseUrl: string | undefined
): string | undefined => {
  const explicit =
    config?.domain ||
    config?.metadata?.domain ||
    metadata?.domain;
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();

  if (baseUrl) {
    try {
      return new URL(baseUrl).hostname;
    } catch {
      /* not a parseable URL — fall through to undefined */
    }
  }
  return undefined;
};

export const LeftPanel = () => {
  const { config, metadata, apiClient } = useStudio();
  const insertNode = useEditorStore((state) => state.insertNode);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);

  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');

  // Domain for preview thumbnails (undefined → graceful text-only fallback).
  const domain = useMemo(
    () => resolveDomain(config as Record<string, any>, metadata, apiClient?.cdnUrl),
    [config, metadata, apiClient]
  );

  // Extract all categories and their components from config
  const categories = config.categories || {};
  const components = config.components || {};

  // If config.categories doesn't exist, group by category field or put in default category
  const groupedComponents: Record<string, string[]> = {};
  if (Object.keys(categories).length > 0) {
    Object.entries(categories).forEach(([key, value]: [string, any]) => {
      groupedComponents[value.title || key] = value.components;
    });
  } else {
    // Fallback: group by category prop in component config
    Object.entries(components).forEach(([name, compConfig]: [string, any]) => {
      const cat = compConfig.category || 'Genel';
      if (!groupedComponents[cat]) {
        groupedComponents[cat] = [];
      }
      groupedComponents[cat].push(name);
    });
  }

  // Handle adding a block
  const handleAddBlock = (type: string) => {
    // If a zone or node is selected, try to append it near/inside if supported, otherwise add to root
    insertNode(createNode(config, type));
  };

  // Shared drag handlers (preserved from the original inline button).
  const handleBlockDragStart = (e: React.DragEvent, type: string, label: string) => {
    writeDragData(e, { type });
    e.dataTransfer.effectAllowed = 'copy';
    setDragGhost(e, label);
    beginDrag({ type });
  };

  return (
    <div className="tecof-left-panel">
      {/* Tab Switcher */}
      <div className="tecof-panel-tabs" role="tablist" aria-label="Sol panel görünümü">
        <button
          type="button"
          onClick={() => setActiveTab('blocks')}
          className={`tecof-tab${activeTab === 'blocks' ? ' is-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'blocks'}
        >
          <Grid size={14} />
          Blok Ekle
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`tecof-tab${activeTab === 'layers' ? ' is-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'layers'}
        >
          <Layers size={14} />
          Katmanlar
        </button>
      </div>

      {/* Tab Content */}
      <div className="tecof-panel-body">
        {activeTab === 'blocks' ? (
          <div className="tecof-blocks">
            {/* Search Box */}
            <div className="tecof-search">
              <Search size={14} className="tecof-icon-muted" />
              <input
                type="text"
                placeholder="Bileşen ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tecof-search-input"
              />
            </div>

            {/* List Categories */}
            {Object.entries(groupedComponents).map(([catTitle, blockTypes]) => {
              // Filter types based on query
              const filteredTypes = blockTypes.filter((type) => {
                const label = components[type]?.label || type;
                return label.toLowerCase().includes(searchQuery.toLowerCase());
              });

              if (filteredTypes.length === 0) return null;

              return (
                <div key={catTitle} className="tecof-block-cat">
                  <div className="tecof-block-cat-title">{catTitle}</div>
                  <div className="tecof-block-grid">
                    {filteredTypes.map((type) => {
                      const compConfig = components[type] || {};
                      const label = compConfig.label || type;

                      return (
                        <BlockThumb
                          key={type}
                          type={type}
                          label={label}
                          domain={domain}
                          apiClient={apiClient}
                          onAdd={handleAddBlock}
                          onDragStart={handleBlockDragStart}
                          onDragEnd={endDrag}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <LayersTree />
        )}
      </div>
    </div>
  );
};
