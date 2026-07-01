import React, { useMemo, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';
import { FieldRenderer } from '../fields-host/FieldRenderer';
import { useResolvedFields } from '../fields-host/useResolvedFields';
import { StyleEditor } from '../style/StyleEditor';
import { ThemeEditor } from '../theme/ThemeEditor';
import { STYLES_PROP } from '../style/types';

export const Inspector = () => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const updateProps = useEditorStore((state) => state.updateProps);
  const setRootProps = useEditorStore((state) => state.setRootProps);
  const selectNode = useEditorStore((state) => state.selectNode);

  const { config, readOnly } = useStudio();
  // A node with `edit: false` shows its fields but disables editing.
  const perms = usePermissions(selectedId);
  const fieldsReadOnly = readOnly || perms.edit === false;
  const [tab, setTab] = useState<'content' | 'style'>('content');
  const [rootTab, setRootTab] = useState<'page' | 'theme'>('page');

  // Find active selected node details memoized to prevent expensive lookup on every render
  const activeNodeInfo = useMemo(() => {
    if (!selectedId) return null;
    const details = findNodeById(documentState, selectedId);
    if (!details) return null;

    const componentConfig = config.components[details.node.type];
    return {
      node: details.node,
      label: componentConfig?.label || details.node.type,
      componentConfig,
    };
  }, [selectedId, documentState, config]);

  // Resolve dynamic fields + read-only map (resolveFields/resolveData). Called
  // unconditionally (hook rules); returns static fields for plain components.
  const resolved = useResolvedFields(
    activeNodeInfo?.node ?? null,
    activeNodeInfo?.componentConfig
  );
  // Slot fields are on-canvas drag-drop only, never shown in the inspector.
  const editableFields = useMemo(
    () =>
      Object.entries(resolved.fields).filter(
        ([, fieldDef]: [string, any]) => fieldDef?.type !== 'slot'
      ),
    [resolved.fields]
  );

  // 1. Component selected state
  if (selectedId) {
    if (!activeNodeInfo) {
      return (
        <div className="tecof-inspector">
          <div className="tecof-inspector-empty">Bileşen yükleniyor veya bulunamadı.</div>
        </div>
      );
    }

    const { node, label } = activeNodeInfo;

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

        {/* Content / Style tabs */}
        <div className="tecof-inspector-tabs" role="tablist" aria-label="Inspector görünümü">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'content'}
            className={`tecof-inspector-tab${tab === 'content' ? ' is-active' : ''}`}
            onClick={() => setTab('content')}
          >
            İçerik
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'style'}
            className={`tecof-inspector-tab${tab === 'style' ? ' is-active' : ''}`}
            onClick={() => setTab('style')}
          >
            Stil
          </button>
        </div>

        {/* Fields List / Style Editor */}
        <div className="tecof-inspector-fields">
          {tab === 'style' ? (
            <StyleEditor
              value={node.props[STYLES_PROP]}
              onChange={(next) => updateProps(selectedId, { [STYLES_PROP]: next })}
            />
          ) : editableFields.length === 0 ? (
            <div className="tecof-inspector-empty-fields">
              Bu bileşenin düzenlenebilir alanı bulunmuyor.
            </div>
          ) : (
            editableFields.map(([fieldName, fieldDef]) => (
              <FieldRenderer
                key={fieldName}
                name={fieldName}
                definition={fieldDef}
                value={node.props[fieldName]}
                onChange={(newVal) => updateProps(selectedId, { [fieldName]: newVal })}
                readOnly={
                  fieldsReadOnly ||
                  resolved.readOnly[fieldName] === true ||
                  (fieldDef as any)?.readOnly === true
                }
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // 2. Root (Page) Settings (when selectedId is null)
  const rootFields = config.root?.fields || {};
  const rootFieldEntries = Object.entries(rootFields);

  return (
    <div className="tecof-inspector">
      {/* Header */}
      <div className="tecof-inspector-header">
        <div>
          <h3 className="tecof-inspector-title">Sayfa Ayarları</h3>
          <span className="tecof-inspector-id">Genel sayfa konfigürasyonu</span>
        </div>
      </div>

      {/* Page / Theme tabs */}
      <div className="tecof-inspector-tabs" role="tablist" aria-label="Sayfa görünümü">
        <button
          type="button"
          role="tab"
          aria-selected={rootTab === 'page'}
          className={`tecof-inspector-tab${rootTab === 'page' ? ' is-active' : ''}`}
          onClick={() => setRootTab('page')}
        >
          Sayfa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={rootTab === 'theme'}
          className={`tecof-inspector-tab${rootTab === 'theme' ? ' is-active' : ''}`}
          onClick={() => setRootTab('theme')}
        >
          Tema
        </button>
      </div>

      {/* Fields List */}
      <div className="tecof-inspector-fields">
        {rootTab === 'theme' ? (
          <ThemeEditor />
        ) : rootFieldEntries.length > 0 ? (
          rootFieldEntries.map(([fieldName, fieldDef]) => (
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
