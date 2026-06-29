import React from 'react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { useStudio } from '../context';
import { FieldRenderer } from '../fields-host/FieldRenderer';

export const Inspector = () => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const updateProps = useEditorStore((state) => state.updateProps);
  const setRootProps = useEditorStore((state) => state.setRootProps);
  const selectNode = useEditorStore((state) => state.selectNode);

  const { config, readOnly } = useStudio();

  // 1. Component selected state
  if (selectedId) {
    const nodeDetails = findNodeById(documentState, selectedId);
    if (!nodeDetails) {
      return (
        <div className="tecof-inspector">
          <div className="tecof-inspector-empty">Bileşen yükleniyor veya bulunamadı.</div>
        </div>
      );
    }

    const { node } = nodeDetails;
    const componentConfig = config.components[node.type];
    const fields = componentConfig?.fields || {};
    const label = componentConfig?.label || node.type;

    return (
      <div className="tecof-inspector">
        {/* Header */}
        <div className="tecof-inspector-header">
          <div>
            <h3 className="tecof-inspector-title">{label}</h3>
            <span className="tecof-inspector-id">{selectedId}</span>
          </div>
          <button onClick={() => selectNode(null)} className="tecof-inspector-deselect">
            Seçimi Kaldır
          </button>
        </div>

        {/* Fields List */}
        <div className="tecof-inspector-fields">
          {Object.keys(fields).length === 0 ? (
            <div className="tecof-inspector-empty-fields">
              Bu bileşenin düzenlenebilir alanı bulunmuyor.
            </div>
          ) : (
            Object.entries(fields).map(([fieldName, fieldDef]) => (
              <FieldRenderer
                key={fieldName}
                name={fieldName}
                definition={fieldDef}
                value={node.props[fieldName]}
                onChange={(newVal) => updateProps(selectedId, { [fieldName]: newVal })}
                readOnly={readOnly}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // 2. Root (Page) Settings (when selectedId is null)
  const rootFields = config.root?.fields || {};
  const hasRootFields = Object.keys(rootFields).length > 0;

  return (
    <div className="tecof-inspector">
      {/* Header */}
      <div className="tecof-inspector-header">
        <div>
          <h3 className="tecof-inspector-title">Sayfa Ayarları</h3>
          <span className="tecof-inspector-id">Genel sayfa konfigürasyonu</span>
        </div>
      </div>

      {/* Fields List */}
      <div className="tecof-inspector-fields">
        {hasRootFields ? (
          Object.entries(rootFields).map(([fieldName, fieldDef]) => (
            <FieldRenderer
              key={fieldName}
              name={fieldName}
              definition={fieldDef}
              value={documentState.root.props[fieldName]}
              onChange={(newVal) => setRootProps({ [fieldName]: newVal })}
              readOnly={readOnly}
            />
          ))
        ) : (
          <div className="tecof-inspector-empty">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="tecof-inspector-empty-icon"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
            Bileşen seçilmedi. Düzenlemek istediğiniz bir bileşene tıklayın.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
