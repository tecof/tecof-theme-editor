import { useEffect, useState } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { FieldRenderer } from '../fields-host/FieldRenderer';
import { ThemeEditor } from '../theme/ThemeEditor';
import { NodeInspectorBody, type InspectorTab } from './NodeInspectorBody';

/**
 * Sağ panel — iki durum:
 * 1. Düğüm seçili → NodeInspectorBody (içerik/stil/etkileşim). Gövde ayrı
 *    bileşendir; NodeSettingsModal da AYNI gövdeyi render eder — alan render
 *    mantığı tek yerde yaşar (bkz. NodeInspectorBody.tsx).
 * 2. Seçim yok → Sayfa/Tema kök ayarları.
 */
export const Inspector = () => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const setRootProps = useEditorStore((state) => state.setRootProps);

  const { config, readOnly } = useStudio();
  const [rootTab, setRootTab] = useState<'page' | 'theme'>('page');

  /* Sekme + daraltma state'i BURADA yaşar (Inspector her zaman mount):
     seçim kaldırılıp yeniden seçilince aktif sekme ve daraltılmış satırlar
     korunur — refactor öncesi davranış. Modal kendi iç state'ini kullanır. */
  const [nodeTab, setNodeTab] = useState<InspectorTab>('content');
  const [nodeCollapsed, setNodeCollapsed] = useState<Set<string>>(() => new Set());

  /* Canvas'tan "şu alana git" isteği (bir elemente tıklama): İçerik sekmesine
     geç, sağ paneli aç, hedef node'un aggregate satırı daraltılmışsa aç.
     Kaydırma + vurgu NodeInspectorBody'de (hedef DOM'u orada yaşar). */
  const inspectorFocus = useUiStore((s) => s.inspectorFocus);
  const setRightPanelOpen = useUiStore((s) => s.setRightPanelOpen);
  useEffect(() => {
    if (!inspectorFocus) return;
    setNodeTab('content');
    setRightPanelOpen(true);
    setNodeCollapsed((prev) => {
      if (!prev.has(inspectorFocus.nodeId)) return prev;
      const next = new Set(prev);
      next.delete(inspectorFocus.nodeId);
      return next;
    });
  }, [inspectorFocus, setRightPanelOpen]);

  // 1. Component selected state — body extracted to NodeInspectorBody.
  if (selectedId) {
    return (
      <div className="tecof-inspector">
        <NodeInspectorBody
          tab={nodeTab}
          onTabChange={setNodeTab}
          collapsed={nodeCollapsed}
          onCollapsedChange={setNodeCollapsed}
        />
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
          className={`tecof-inspector-tab tecof-tip${rootTab === 'page' ? ' is-active' : ''}`}
          data-tip="Yalnız bu sayfaya özel ayarlar"
          onClick={() => setRootTab('page')}
        >
          Sayfa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={rootTab === 'theme'}
          className={`tecof-inspector-tab tecof-tip${rootTab === 'theme' ? ' is-active' : ''}`}
          data-tip="Tüm sitede geçerli renk ve yazı tipi ayarları"
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
