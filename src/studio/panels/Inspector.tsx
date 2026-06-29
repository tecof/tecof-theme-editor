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
        <div style={{ padding: '24px', color: '#71717a', fontSize: '13px', textAlign: 'center' }}>
          Bileşen yükleniyor veya bulunamadı.
        </div>
      );
    }

    const { node } = nodeDetails;
    const componentConfig = config.components[node.type];
    const fields = componentConfig?.fields || {};
    const label = componentConfig?.label || node.type;

    return (
      <div
        className="tecof-inspector"
        style={{
          width: '320px',
          height: '100%',
          borderLeft: '1px solid #e4e4e7',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f4f4f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#18181b' }}>{label}</h3>
            <span style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>{selectedId}</span>
          </div>
          <button
            onClick={() => selectNode(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: '4px',
              hover: { background: '#f4f4f5' },
            } as any}
          >
            Seçimi Kaldır
          </button>
        </div>

        {/* Fields List */}
        <div
          className="tecof-inspector-fields"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {Object.keys(fields).length === 0 ? (
            <div style={{ color: '#a1a1aa', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
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
    <div
      className="tecof-inspector"
      style={{
        width: '320px',
        height: '100%',
        borderLeft: '1px solid #e4e4e7',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f4f4f5',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#18181b' }}>Sayfa Ayarları</h3>
        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Genel sayfa konfigürasyonu</span>
      </div>

      {/* Fields List */}
      <div
        className="tecof-inspector-fields"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#a1a1aa',
              fontSize: '12px',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: '8px', opacity: 0.6 }}
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
