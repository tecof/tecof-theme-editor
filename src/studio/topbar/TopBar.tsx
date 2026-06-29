import React from 'react';
import { useEditorStore } from '../../engine/store';
import { Monitor, Tablet, Smartphone, Undo2, Redo2, Save, Check } from 'lucide-react';

interface TopBarProps {
  onSave: () => Promise<void>;
  saving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
}

export const TopBar = ({ onSave, saving, saveStatus }: TopBarProps) => {
  const viewport = useEditorStore((state) => state.viewport);
  const setViewport = useEditorStore((state) => state.setViewport);

  const pastCount = useEditorStore((state) => state.history.past.length);
  const futureCount = useEditorStore((state) => state.history.future.length);

  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  return (
    <div className="tecof-topbar">
      {/* Title */}
      <div className="tecof-topbar-title">
        <span>Sayfa Düzenleyici</span>
        {saveStatus === 'success' && (
          <span className="tecof-topbar-saved">
            <Check size={12} /> Kaydedildi
          </span>
        )}
      </div>

      {/* Viewport Selectors */}
      <div className="tecof-topbar-viewports">
        <button
          type="button"
          onClick={() => setViewport('desktop')}
          className={`tecof-vp-btn${viewport === 'desktop' ? ' is-active' : ''}`}
          title="Masaüstü"
          aria-label="Masaüstü görünümü"
          aria-pressed={viewport === 'desktop'}
        >
          <Monitor size={16} />
        </button>
        <button
          type="button"
          onClick={() => setViewport('tablet')}
          className={`tecof-vp-btn${viewport === 'tablet' ? ' is-active' : ''}`}
          title="Tablet"
          aria-label="Tablet görünümü"
          aria-pressed={viewport === 'tablet'}
        >
          <Tablet size={16} />
        </button>
        <button
          type="button"
          onClick={() => setViewport('mobile')}
          className={`tecof-vp-btn${viewport === 'mobile' ? ' is-active' : ''}`}
          title="Mobil"
          aria-label="Mobil görünümü"
          aria-pressed={viewport === 'mobile'}
        >
          <Smartphone size={16} />
        </button>
      </div>

      {/* Actions (Undo/Redo/Save) */}
      <div className="tecof-topbar-actions">
        <div className="tecof-topbar-undoredo">
          <button type="button" onClick={undo} disabled={pastCount === 0} className="tecof-icon-btn" title="Geri Al" aria-label="Geri al">
            <Undo2 size={16} />
          </button>
          <button type="button" onClick={redo} disabled={futureCount === 0} className="tecof-icon-btn" title="Yinele" aria-label="Yinele">
            <Redo2 size={16} />
          </button>
        </div>

        <div className="tecof-topbar-divider" />

        <button type="button" onClick={onSave} disabled={saving} className="tecof-btn-primary" aria-busy={saving}>
          <Save size={14} />
          {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
        </button>
      </div>
    </div>
  );
};
