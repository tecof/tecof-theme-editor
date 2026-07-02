import React, { useState } from 'react';
import { useStudio } from '../context';
import { useEditorStore } from '../../engine/store';
import { LayersTree } from './LayersTree';
import { BlockThumb } from './BlockThumb';
import { Layers, Grid, Search, Eye, EyeOff } from 'lucide-react';
import { setDragGhost } from '../canvas/dragGhost';
import { createNode, writeDragData } from '../canvas/dndUtils';

export const LeftPanel = () => {
  const { config } = useStudio();
  const insertNode = useEditorStore((state) => state.insertNode);
  const beginDrag = useEditorStore((state) => state.beginDrag);
  const endDrag = useEditorStore((state) => state.endDrag);

  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreviews, setShowPreviews] = useState(false);

  // Extract all categories and their components from config
  const categories = config.categories || {};
  const components = config.components || {};

  // If config.categories doesn't exist, group by category field or put in default category
  const groupedComponents: Record<string, string[]> = {};
  if (Object.keys(categories).length > 0) {
    Object.entries(categories).forEach(([key, value]) => {
      groupedComponents[value.title || key] = value.components || [];
    });
  } else {
    // Fallback: group by category prop in component config
    Object.entries(components).forEach(([name, compConfig]) => {
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
              <button
                type="button"
                onClick={() => setShowPreviews(!showPreviews)}
                className={`tecof-search-preview-toggle${showPreviews ? ' is-active' : ''}`}
                title={showPreviews ? "Önizlemeleri Kapat" : "Önizlemeleri Aç"}
              >
                {showPreviews ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>

            {/* List Categories */}
            {Object.entries(groupedComponents).map(([catTitle, blockTypes]) => {
              // Filter types based on query
              const filteredTypes = blockTypes.filter((type) => {
                const label = components[type]?.label || type;
                return label.toLowerCase().includes(searchQuery.toLowerCase());
              });

              if (filteredTypes.length === 0) return null;

              const previewMode = /element/i.test(catTitle) ? 'element' : 'section';

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
                          config={config}
                          previewMode={previewMode}
                          showPreview={showPreviews}
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
