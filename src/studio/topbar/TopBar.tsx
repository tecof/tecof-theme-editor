import React from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useActiveLanguage } from '../language/LanguageContext';
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Save, Check,
  PanelLeft, PanelRight, Eye, Pencil, Globe, ChevronDown,
} from 'lucide-react';

interface TopBarProps {
  onSave: () => Promise<void>;
  saving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
}

const LanguageSwitcher = () => {
  const lang = useActiveLanguage();
  if (!lang || lang.languages.length <= 1) return null;

  return (
    <div className="tecof-lang-switcher" title="Düzenlenen dil">
      <Globe size={14} className="tecof-lang-switcher-icon" />
      <select
        className="tecof-lang-switcher-select"
        value={lang.activeLanguage}
        onChange={(e) => lang.setActiveLanguage(e.target.value)}
        aria-label="Düzenlenen dil"
      >
        {lang.languages.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()}
            {code === lang.defaultLanguage ? ' • Varsayılan' : ''}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="tecof-lang-switcher-caret" />
    </div>
  );
};

export const TopBar = ({ onSave, saving, saveStatus }: TopBarProps) => {
  const viewport = useEditorStore((state) => state.viewport);
  const setViewport = useEditorStore((state) => state.setViewport);

  const pastCount = useEditorStore((state) => state.history.past.length);
  const futureCount = useEditorStore((state) => state.history.future.length);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const leftPanelOpen = useUiStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUiStore((state) => state.rightPanelOpen);
  const toggleLeftPanel = useUiStore((state) => state.toggleLeftPanel);
  const toggleRightPanel = useUiStore((state) => state.toggleRightPanel);

  return (
    <div className="tecof-topbar">
      {/* Left: panel toggle + title */}
      <div className="tecof-topbar-group">
        <button
          type="button"
          onClick={toggleLeftPanel}
          className={`tecof-icon-btn${leftPanelOpen ? ' is-active' : ''}`}
          title="Sol paneli aç/kapat"
          aria-pressed={leftPanelOpen}
        >
          <PanelLeft size={16} />
        </button>
        <div className="tecof-topbar-title">
          <span>Sayfa Düzenleyici</span>
          {saveStatus === 'success' && (
            <span className="tecof-topbar-saved">
              <Check size={12} /> Kaydedildi
            </span>
          )}
        </div>
      </div>

      {/* Center: viewport + mode toggle */}
      <div className="tecof-topbar-group">
        <div className="tecof-topbar-viewports">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`tecof-vp-btn${viewport === 'desktop' ? ' is-active' : ''}`}
            title="Masaüstü"
          >
            <Monitor size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`tecof-vp-btn${viewport === 'tablet' ? ' is-active' : ''}`}
            title="Tablet"
          >
            <Tablet size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`tecof-vp-btn${viewport === 'mobile' ? ' is-active' : ''}`}
            title="Mobil"
          >
            <Smartphone size={16} />
          </button>
        </div>

        <div className="tecof-topbar-divider" />

        {/* Edit / Preview mode toggle */}
        <div className="tecof-mode-toggle" role="group" aria-label="Düzenleme modu">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`tecof-mode-btn${mode === 'edit' ? ' is-active' : ''}`}
            title="Düzenleme: bileşenleri seç ve düzenle"
          >
            <Pencil size={14} /> Düzenle
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`tecof-mode-btn${mode === 'preview' ? ' is-active' : ''}`}
            title="Önizleme: link ve butonlar çalışır"
          >
            <Eye size={14} /> Önizle
          </button>
        </div>
      </div>

      {/* Right: language + undo/redo + save + right panel toggle */}
      <div className="tecof-topbar-group">
        <LanguageSwitcher />

        <div className="tecof-topbar-undoredo">
          <button type="button" onClick={undo} disabled={pastCount === 0} className="tecof-icon-btn" title="Geri Al">
            <Undo2 size={16} />
          </button>
          <button type="button" onClick={redo} disabled={futureCount === 0} className="tecof-icon-btn" title="Yinele">
            <Redo2 size={16} />
          </button>
        </div>

        <div className="tecof-topbar-divider" />

        <button type="button" onClick={onSave} disabled={saving} className="tecof-btn-primary">
          <Save size={14} />
          {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
        </button>

        <button
          type="button"
          onClick={toggleRightPanel}
          className={`tecof-icon-btn${rightPanelOpen ? ' is-active' : ''}`}
          title="Sağ paneli aç/kapat"
          aria-pressed={rightPanelOpen}
        >
          <PanelRight size={16} />
        </button>
      </div>
    </div>
  );
};
