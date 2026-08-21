import React, { useMemo } from 'react';
import { useEditorStore } from '../../engine/store';
import { ViewportWidthControl } from './ViewportWidthControl';
import { useUiStore } from '../uiStore';
import { useActiveLanguage } from '../language/LanguageContext';
import { collectTranslationGaps } from '../language/translationCoverage';
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Save, Check,
  PanelLeft, PanelRight, Eye, Pencil, Globe, ChevronDown, Scaling, Sun, Moon, UnfoldVertical, Info } from 'lucide-react';
import { GridControl } from './GridControl';
import { useStudio } from '../context';

interface TopBarProps {
  onSave: () => Promise<void>;
  saving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  /** True when there are edits not yet persisted (drives the unsaved indicator). */
  dirty?: boolean;
  /** Whether autosave is enabled (changes the unsaved hint copy). */
  autoSave?: boolean;
  /**
   * True when the editor runs inside the Tecof host wrapper (iframe). The host
   * already renders the page title, save-draft, publish and undo/redo controls,
   * so this bar hides those duplicates and keeps only canvas-specific controls
   * (panel toggles, viewport, edit/preview, language).
   */
  embedded?: boolean;
}

/** Turkish display names for language codes (e.g. 'en' → 'İngilizce'). */
const trLanguageNames = (() => {
  try {
    return new Intl.DisplayNames(['tr'], { type: 'language' });
  } catch {
    return null;
  }
})();

const langNameTr = (code: string): string => {
  try {
    return trLanguageNames?.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

const LanguageSwitcher = () => {
  const lang = useActiveLanguage();
  const document = useEditorStore((state) => state.document);
  const languages = lang?.languages;

  // Missing-translation coverage for the current page. Recomputed only when
  // the document changes; skipped entirely for single-language merchants.
  const coverage = useMemo(() => {
    if (!languages || languages.length <= 1) return null;
    return collectTranslationGaps(document, languages);
  }, [document, languages]);

  if (!lang || lang.languages.length <= 1) return null;

  const missingByLang = coverage?.missingByLang ?? {};
  const totalMissing = coverage?.total ?? 0;
  const badgeTitle = lang.languages
    .filter((code) => (missingByLang[code] ?? 0) > 0)
    .map((code) => `${missingByLang[code]} alanın ${langNameTr(code)} çevirisi eksik`)
    .join(', ');

  return (
    <div className="tecof-lang-switcher" title="Düzenlenen dil">
      <Globe size={14} className="tecof-lang-switcher-icon" />
      <select
        className="tecof-lang-switcher-select"
        value={lang.activeLanguage}
        onChange={(e) => lang.setActiveLanguage(e.target.value)}
        aria-label="Düzenlenen dil"
      >
        {lang.languages.map((code) => {
          const missing = missingByLang[code] ?? 0;
          return (
            <option key={code} value={code}>
              {code.toUpperCase()}
              {code === lang.defaultLanguage ? ' • Varsayılan' : ''}
              {missing > 0 ? ` · ${missing} eksik` : ''}
            </option>
          );
        })}
      </select>
      {totalMissing > 0 && (
        <span className="tecof-lang-switcher-badge" title={badgeTitle}>
          {totalMissing}
        </span>
      )}
      <ChevronDown size={12} className="tecof-lang-switcher-caret" />
    </div>
  );
};

export const TopBar = ({ onSave, saving, saveStatus, dirty, autoSave, embedded }: TopBarProps) => {
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
  const resizeEnabled = useUiStore((state) => state.resizeEnabled);
  const toggleResize = useUiStore((state) => state.toggleResize);
  const spacingEnabled = useUiStore((state) => state.spacingEnabled);
  const toggleSpacing = useUiStore((state) => state.toggleSpacing);
  const setHelpModalOpen = useUiStore((state) => state.setHelpModalOpen);

  const { config } = useStudio();
  const darkModeEnabled = !!config.darkMode;
  const previewColorScheme = useUiStore((state) => state.previewColorScheme);
  const togglePreviewColorScheme = useUiStore((state) => state.togglePreviewColorScheme);
  const darkPreview = previewColorScheme === 'dark';

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
        {!embedded && (
          <div className="tecof-topbar-title">
            <span>Sayfa Düzenleyici</span>
            {saveStatus === 'success' && (
              <span className="tecof-topbar-saved">
                <Check size={12} /> Kaydedildi
              </span>
            )}
            {dirty && !saving && saveStatus !== 'success' && (
              <span
                className="tecof-topbar-dirty"
                title={autoSave ? 'Değişiklikler otomatik kaydedilecek' : 'Kaydedilmemiş değişiklikler var'}
              >
                <span className="tecof-topbar-dirty-dot" />
                {autoSave ? 'Kaydedilecek…' : 'Kaydedilmedi'}
              </span>
            )}
          </div>
        )}
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

        {/* Masaüstü tasarım genişliği + sığdırma yüzdesi (yalnız desktop'ta). */}
        <ViewportWidthControl />

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

        <div className="tecof-topbar-divider" />

        <GridControl />
        <button
          type="button"
          onClick={toggleResize}
          className={`tecof-icon-btn${resizeEnabled ? ' is-active' : ''}`}
          title="Boyutlandırma modu (R)"
          aria-pressed={resizeEnabled}
        >
          <Scaling size={16} />
        </button>
        {/* Spacing (padding/margin) tutamaçları — default KAPALI, buradan açılır.
            resize ile karşılıklı dışlayıcı (uiStore toggle'ları birbirini kapatır). */}
        <button
          type="button"
          onClick={toggleSpacing}
          className={`tecof-icon-btn${spacingEnabled ? ' is-active' : ''}`}
          title="Boşluk ayarlama modu — padding/margin tutamaçları (B)"
          aria-pressed={spacingEnabled}
        >
          <UnfoldVertical size={16} />
        </button>

        {/* Dark preview toggle — only when the host enables config.darkMode.
            Drives ThemeVars' `.dark` class so the canvas previews the dark palette. */}
        {darkModeEnabled && (
          <button
            type="button"
            onClick={togglePreviewColorScheme}
            className={`tecof-icon-btn${darkPreview ? ' is-active' : ''}`}
            title={darkPreview ? 'Açık modu önizle' : 'Koyu modu önizle'}
            aria-pressed={darkPreview}
          >
            {darkPreview ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        )}
      </div>

      {/* Right: language + undo/redo + save + right panel toggle */}
      <div className="tecof-topbar-group">
        <LanguageSwitcher />

        {/* Host wrapper (embedded) already provides undo/redo + save/publish */}
        {!embedded && (
          <>
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
          </>
        )}

        {/* Kullanım kılavuzu — özelliklerin ne işe yaradığını anlatan modal. */}
        <button
          type="button"
          onClick={() => setHelpModalOpen(true)}
          className="tecof-icon-btn"
          title="Editör nasıl kullanılır?"
        >
          <Info size={16} />
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
