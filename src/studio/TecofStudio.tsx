import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '../engine/store';
import { useUiStore } from './uiStore';
import { findNodeById, getParentId } from '../engine/zones';
import { CommandPalette } from './command/CommandPalette';
import { ThemeVars } from './theme/ThemeVars';
import { parseDocument, serializeDocument, validatePageData } from '../engine/document';
import { getNodePermissions } from '../engine/permissions';
import { migrateDocument } from '../engine/migrate';
import { StudioContext } from './context';
import { LanguageProvider } from './language/LanguageContext';
import { Canvas } from './canvas/Canvas';
import { SelectionOverlay } from './overlay/SelectionOverlay';
import { NodeContextMenu } from './overlay/NodeContextMenu';
import { AiSectionModal } from './ai/AiSectionModal';
import { StyleSyncModal } from './style/StyleSyncModal';
import { NodeSettingsModal } from './panels/NodeSettingsModal';
import HelpModal from './panels/HelpModal';
import { Inspector } from './panels/Inspector';
import { TopBar } from './topbar/TopBar';
import { LeftPanel } from './panels/LeftPanel';
import { useTecof } from '../components/TecofProvider';
import { configureBridge, isEmbedded as isEmbeddedHost, isAllowedOrigin, postToHost } from './bridge';
import type { TecofEditorProps } from '../types';

export const TecofStudio = ({
  pageId,
  config,
  accessToken,
  onSave,
  onChange,
  onLanguageChange,
  hostOrigin,
  autoSave = false,
  autoSaveDelay = 2000,
  warnOnUnsavedChanges = true,
  className,
}: TecofEditorProps) => {
  const { apiClient } = useTecof();

  // Flow the user's JWT into every API call (uploads, translate, shared
  // components, …) — write endpoints require it on top of the secret key.
  useEffect(() => {
    apiClient.setAccessToken(accessToken);
  }, [apiClient, accessToken]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dirty, setDirty] = useState(false);

  const setDocument = useEditorStore((state) => state.setDocument);
  const setPermissionResolver = useEditorStore((state) => state.setPermissionResolver);
  const documentState = useEditorStore((state) => state.document);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setViewport = useEditorStore((state) => state.setViewport);

  const leftPanelOpen = useUiStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUiStore((state) => state.rightPanelOpen);
  const mode = useUiStore((state) => state.mode);

  const documentStateRef = useRef(documentState);
  documentStateRef.current = documentState;

  // Dirty tracking: the document the store hands us is a fresh reference after
  // every committed change (immer structural sharing), so "unsaved" is simply
  // "current doc !== last persisted/loaded doc". `savedDocRef` holds that
  // baseline; `dirtyRef` mirrors the boolean for the synchronous unload guard.
  const savedDocRef = useRef(documentState);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  savingRef.current = saving;
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEmbedded = isEmbeddedHost();

  // ── Revizyon önizleme modu ─────────────────────────────────────────────
  // /editor/{pageId}?revision={revId} → taslak yerine o revizyonun snapshot'ı
  // yüklenir, editör SALT OKUNUR olur (kaydetme engellenir). Admin'deki
  // "Sayfa Geçmişi" drawer'ının "Önizle" butonu bu URL'i yeni sekmede açar.
  const revisionPreviewId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return new URLSearchParams(window.location.search).get('revision');
    } catch {
      return null;
    }
  }, []);
  const [revisionMeta, setRevisionMeta] = useState<{
    revisionNumber?: number;
    kind?: string;
    createDate?: string;
  } | null>(null);
  const setMode = useUiStore((state) => state.setMode);

  // Önizlemede kanvas etkileşimini de kapat (Önizle moduna al)
  useEffect(() => {
    if (revisionPreviewId) setMode('preview');
  }, [revisionPreviewId, setMode]);

  // Lock down the host postMessage target origin (defaults to '*' when unset).
  // Other host-messaging files (NodeRenderer.tsx, Frame.tsx) should adopt
  // ./bridge's postToHost so this configured origin applies consistently.
  useEffect(() => {
    configureBridge(hostOrigin);
  }, [hostOrigin]);

  // 1. Fetch Page and Load into Store
  useEffect(() => {
    let cancelled = false;
    // Abort the in-flight request on cleanup so a slow earlier response can't
    // land after a newer pageId load and overwrite it. A 15s timeout also
    // trips the same abort path.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getPage(pageId, controller.signal, revisionPreviewId);
        if (cancelled) return;

        // Backend revizyonu bulduysa meta döner; bulamadıysa normal taslak gelir
        // (param yine de salt-okunur kilidi açık tutar — yanlışlıkla yazma olmasın)
        setRevisionMeta(revisionPreviewId ? ((res.data as any)?.revisionPreview || {}) : null);

        const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
        // Upgrade old saved data to the current schema before it enters the store
        // (no-op unless the host declares `config.migrations`).
        const parsedDoc = migrateDocument(parseDocument(rawData), config.migrations);
        setDocument(parsedDoc);
        // A freshly loaded page is the new "clean" baseline; read the store's
        // (cloned/parsed) document reference so the dirty check starts false.
        savedDocRef.current = useEditorStore.getState().document;
        dirtyRef.current = false;
        setDirty(false);
      } catch (err) {
        // Aborted loads (newer pageId, unmount, or timeout) must NOT mutate
        // state — bail out before touching loading/document below.
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        console.error('Failed to load page:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [pageId, apiClient, setDocument, revisionPreviewId]);

  // 1b-i. AI güncellemesi sonrası değişen bileşeni kanvasta vurgula:
  // tipe göre ilk düğümü bul → seç → görünüme kaydır → kısa lime "flash".
  const highlightComponent = useCallback((componentType?: string | null) => {
    if (!componentType) return;
    const doc = useEditorStore.getState().document;
    const allNodes: any[] = [
      ...(doc.content || []),
      ...Object.values(doc.zones || {}).flat(),
    ];
    const node = allNodes.find((n) => n?.type === componentType);
    if (!node?.props?.id) return;

    const id = node.props.id;
    useEditorStore.getState().selectNode(id);

    // Render sonrası DOM'a eriş (seçim + reload state'inin oturması için)
    requestAnimationFrame(() => {
      const el = window.document.querySelector(`[data-tecof-id="${id}"]`) as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('tecof-ai-flash');
      window.setTimeout(() => el.classList.remove('tecof-ai-flash'), 1800);
    });
  }, []);

  // 1b. Soft re-fetch of the page document (no iframe reload). Used when the
  // host's AI agent edits the draft server-side and wants the canvas to reflect
  // it live, preserving the mounted editor (no flash / full reload). Content
  // (Puck) changes use this; code-agent changes still need a full iframe reload
  // because the theme's component bundle itself changed.
  // `highlightType` verilirse reload sonrası o bileşen kanvasta vurgulanır.
  const reloadDocument = useCallback(async (highlightType?: string | null) => {
    try {
      const res = await apiClient.getPage(pageId);
      const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
      if (!rawData) return;
      const parsedDoc = migrateDocument(parseDocument(rawData), config.migrations);
      setDocument(parsedDoc);
      savedDocRef.current = useEditorStore.getState().document;
      dirtyRef.current = false;
      setDirty(false);

      if (highlightType) {
        window.setTimeout(() => highlightComponent(highlightType), 150);
      }
    } catch (err) {
      console.error('Failed to reload document:', err);
    }
  }, [apiClient, pageId, config.migrations, setDocument, highlightComponent]);

  // 2. Trigger onChange when document state changes in store.
  // Debounced (~300ms, trailing) so a burst of keystrokes coalesces into a
  // single onChange / `puck:changed`. The latest document is read from the ref
  // at flush time (not captured at schedule time), so we never emit a stale doc.
  const isFirstRender = useRef(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    changeTimerRef.current = setTimeout(() => {
      changeTimerRef.current = null;
      const serialized = serializeDocument(documentStateRef.current);
      onChangeRef.current?.(serialized);

      if (isEmbedded) {
        postToHost('puck:changed');
      }
    }, 300);
  }, [documentState, loading, isEmbedded]);

  // Flush-cancel any pending debounce on unmount.
  useEffect(() => {
    return () => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    };
  }, []);

  // 3. Save Draft Functionality
  const handleSaveDraft = useCallback(async () => {
    // Revizyon önizlemesi SALT OKUNUR — taslağın eski snapshot'la ezilmesini engelle
    if (revisionPreviewId) {
      console.warn('[TecofStudio] Revizyon önizlemesinde kaydetme devre dışıdır.');
      if (isEmbedded) {
        postToHost('puck:saveError', { message: 'Revizyon önizlemesi salt okunurdur — kaydetmek için normal editörü kullanın.' });
      }
      return;
    }

    const currentDoc = documentStateRef.current;
    const serialized = serializeDocument(currentDoc);

    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await apiClient.savePage(pageId, serialized, undefined, accessToken);
      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
        // Mark the exact document we just persisted as the clean baseline. If the
        // user kept editing during the request, the live doc differs from this
        // snapshot and stays dirty (so autosave will fire again).
        savedDocRef.current = currentDoc;
        dirtyRef.current = documentStateRef.current !== currentDoc;
        setDirty(dirtyRef.current);
        onSave?.(serialized);
        if (isEmbedded) {
          postToHost('puck:saved', { data: serialized });
        }
      } else {
        setSaveStatus('error');
        if (isEmbedded) {
          postToHost('puck:saveError', { message: res.message });
        }
      }
    } catch (err: any) {
      setSaveStatus('error');
      if (isEmbedded) {
        postToHost('puck:saveError', { message: err.message });
      }
    } finally {
      setSaving(false);
    }
  }, [pageId, apiClient, accessToken, onSave, isEmbedded, revisionPreviewId]);

  // 3a-ii. Gizli JSON dışa/içe aktarma — yalnızca Cmd+K komut paletinden
  // erişilir (TopBar'da buton yok). Export canlı store'u sızdırmamak için
  // serializeDocument'ın derin kopyasını indirir; import validasyon +
  // migrasyondan geçip TEK geri alınabilir history adımı olarak uygulanır.
  const handleExportJson = useCallback(() => {
    const serialized = serializeDocument(useEditorStore.getState().document);
    const envelope = {
      _format: 'tecof-page@1',
      exportedAt: new Date().toISOString(),
      pageId,
      data: serialized,
    };
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tecof-page-${pageId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [pageId]);

  const handleImportJson = useCallback(() => {
    // Revizyon önizlemesi salt okunur — palet bu durumu bilmediği için nöbet burada.
    if (revisionPreviewId) {
      window.alert('Revizyon önizlemesi salt okunurdur — içe aktarma için normal editörü kullanın.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        // Hem zarflı (tecof-page@1) hem çıplak doküman kabul edilir.
        const raw = parsed && typeof parsed === 'object' && parsed.data !== undefined ? parsed.data : parsed;

        const validationError = validatePageData(raw);
        if (validationError) {
          window.alert(`İçe aktarma başarısız: ${validationError}`);
          return;
        }

        const confirmed = window.confirm(
          'Mevcut sayfa içeriği içe aktarılan veriyle DEĞİŞTİRİLECEK. ' +
          'Bu işlem Geri Al (Cmd+Z) ile geri alınabilir; kalıcı olması için kaydetmeniz gerekir. Devam edilsin mi?'
        );
        if (!confirmed) return;

        // Yükleme akışıyla birebir aynı boru hattı: parse → migrate → store.
        const doc = migrateDocument(parseDocument(raw), config.migrations);
        useEditorStore.getState().replaceDocument(doc);
      } catch (err: any) {
        window.alert(`İçe aktarma başarısız: ${err?.message || 'Dosya okunamadı.'}`);
      }
    };
    input.click();
  }, [revisionPreviewId, config.migrations]);

  // 3b. Dirty detection + optional autosave.
  // Runs whenever the document reference changes. Dirty = live doc differs from
  // the last loaded/persisted baseline. When `autoSave` is on, an idle timer
  // (reset on every edit) persists automatically once edits settle. We re-check
  // dirtiness inside the timer because the doc may have changed again — and skip
  // when a manual save is already in flight to avoid overlapping requests.
  useEffect(() => {
    if (loading) return;
    const isDirty = documentState !== savedDocRef.current;
    dirtyRef.current = isDirty;
    setDirty(isDirty);

    if (!isDirty || !autoSave) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      if (documentStateRef.current !== savedDocRef.current && !savingRef.current) {
        handleSaveDraft();
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [documentState, loading, autoSave, autoSaveDelay, handleSaveDraft]);

  // 3c. Warn before unloading the tab/closing the window with unsaved edits.
  useEffect(() => {
    if (!warnOnUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      // The spec requires both for cross-browser support; the message text is
      // ignored by modern browsers (they show a generic prompt).
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [warnOnUnsavedChanges]);

  // 4. Listen to PostMessage signals from the host wrapper
  useEffect(() => {
    if (!isEmbedded) return;

    const onMessage = (e: MessageEvent) => {
      // Drop messages from untrusted origins when a hostOrigin is locked in.
      // When unset (or '*') everything is accepted (backward compatible).
      if (!isAllowedOrigin(e.origin)) return;

      switch (e.data?.type) {
        case 'puck:save':
        case 'puck:publish':
          handleSaveDraft();
          break;
        case 'puck:undo':
          undo();
          break;
        case 'puck:redo':
          redo();
          break;
        case 'puck:refetch':
          // Host AI agent updated the draft server-side → refresh in place.
          // Opsiyonel `highlightType` ile değişen bileşen kanvasta vurgulanır.
          reloadDocument(e.data.highlightType);
          break;
        case 'puck:highlight':
          highlightComponent(e.data.componentType || e.data.type);
          break;
        case 'puck:viewport':
          if (e.data.width) {
            // Map pixel widths or percentage from host message to our local viewports
            const width = e.data.width;
            if (width === '375px' || width === 375) {
              setViewport('mobile');
            } else if (width === '768px' || width === 768) {
              setViewport('tablet');
            } else {
              setViewport('desktop');
            }
          }
          break;
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isEmbedded, handleSaveDraft, undo, redo, setViewport, reloadDocument, highlightComponent]);

  // 5. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = () => {
        const activeEl = document.activeElement;
        if (activeEl) {
          const tag = activeEl.tagName.toLowerCase();
          if (tag === 'input' || tag === 'textarea' || activeEl.hasAttribute('contenteditable')) {
            return true;
          }
        }
        const iframe = document.querySelector('.tecof-canvas-viewport iframe') as HTMLIFrameElement;
        const iframeDoc = iframe?.contentDocument;
        const iframeActiveEl = iframeDoc?.activeElement;
        if (iframeActiveEl) {
          const tag = iframeActiveEl.tagName.toLowerCase();
          if (tag === 'input' || tag === 'textarea' || iframeActiveEl.hasAttribute('contenteditable')) {
            return true;
          }
        }
        return false;
      };

      // Some keydown events arrive with no `key` — browser autofill / password
      // managers dispatch synthetic keydowns, and IME/dead-key composition can
      // too. None of the shortcuts below can match a keyless event, so bail
      // before any `e.key.toLowerCase()` would throw on `undefined`.
      if (typeof e.key !== 'string') return;

      const selectedId = useEditorStore.getState().selection.selectedId;
      const selectedIds = useEditorStore.getState().selection.selectedIds;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Command palette toggle — handled before the input guard so it opens/closes
      // from anywhere, including while typing in a field.
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useUiStore.getState().toggleCommandPalette();
        return;
      }

      // Save
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveDraft();
        return;
      }

      // Escape -> önce palet; açık bir modal varsa kapatmayı MODALIN kendi
      // listener'ına bırak ve seçime DOKUNMA (eskiden modal kapanırken seçim de
      // siliniyordu). Seçim varken bir üst kata çık (Figma); kök seviyedeyse
      // bırak.
      if (e.key === 'Escape') {
        const ui = useUiStore.getState();
        if (ui.commandPaletteOpen) {
          ui.setCommandPaletteOpen(false);
          return;
        }
        if (ui.addSectionTarget != null || ui.nodeSettingsOpen || ui.aiModalOpen || ui.helpModalOpen) return;
        const editor = useEditorStore.getState();
        const currentId = editor.selection.selectedId;
        const parentId = currentId ? getParentId(editor.document, currentId) : null;
        if (parentId) {
          editor.selectNode(parentId);
          if (isEmbedded) {
            const type = findNodeById(editor.document, parentId)?.node.type ?? '';
            postToHost('puck:itemSelected', { item: { type, id: parentId } });
          }
          return;
        }
        editor.selectNode(null);
        if (isEmbedded) {
          postToHost('puck:itemDeselected');
        }
        return;
      }

      // Undo / Redo
      // Bir MODAL açıkken kanvas kısayolları (G/R/B, Delete, ok tuşları,
      // kopyala/yapıştır, Cmd+D…) ÇALIŞMAMALI: HelpModal'da hiç input
      // olmadığından odak panel div'inde kalıyor ve ör. kılavuzu okurken
      // Delete'e basmak modalın ARKASINDAKİ seçili node'u siliyordu.
      // (Escape yukarıda kendi guard'ıyla işlendi; Cmd+K da modal-üstü.)
      // Undo/redo dahil: modal açıkken görünmez doküman değişikliği olmamalı.
      {
        const uiNow = useUiStore.getState();
        if (
          uiNow.addSectionTarget != null ||
          uiNow.nodeSettingsOpen ||
          uiNow.aiModalOpen ||
          uiNow.helpModalOpen
        ) {
          return;
        }
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Block editor actions (incl. clipboard) if input is focused, so the
      // browser's native copy/cut/paste keeps working inside fields/inline-edit.
      if (isInput()) return;

      // 'G' -> toggle the column alignment grid (no modifier; Cmd+G stays native).
      if (!isCmdOrCtrl && !e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        useUiStore.getState().toggleGrid();
        return;
      }

      // 'R' -> toggle resize mode (no modifier; Cmd+R stays native reload).
      if (!isCmdOrCtrl && !e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        useUiStore.getState().toggleResize();
        return;
      }
      // 'B' -> spacing (padding/margin) tutamaçları — default kapalı, toggle.
      if (!isCmdOrCtrl && !e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        useUiStore.getState().toggleSpacing();
        return;
      }

      // Arrow keys -> move selection to the previous/next sibling in the same
      // list. Up/Left = previous, Down/Right = next (works for both column and
      // row layouts, since either pair walks the sibling order).
      if (
        !isCmdOrCtrl &&
        selectedId &&
        (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')
      ) {
        const doc = useEditorStore.getState().document;
        const res = findNodeById(doc, selectedId);
        if (res) {
          const { zoneKey, index } = res.path;
          const list = zoneKey ? doc.zones[zoneKey] : doc.content;
          const dir = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1;
          const sibling = list?.[index + dir];
          if (sibling) {
            e.preventDefault();
            useEditorStore.getState().selectNode(sibling.props.id);
          }
        }
        return;
      }

      // Copy / Cut / Paste
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c' && selectedId) {
        e.preventDefault();
        useEditorStore.getState().copyNode();
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'x' && selectedId) {
        e.preventDefault();
        useEditorStore.getState().cutNode();
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        useEditorStore.getState().pasteClipboard();
        return;
      }

      // Delete selected (bulk when multiple are selected -> one undo step).
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        useEditorStore.getState().removeNodes(selectedIds);
        return;
      }

      // Duplicate selected (bulk when multiple are selected -> one undo step).
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        useEditorStore.getState().duplicateNodes(selectedIds);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, isEmbedded, handleSaveDraft]);

  // Register the permission resolver so the engine can authoritatively gate
  // delete/duplicate/drag/edit per node (config-driven, permissive by default).
  // Cleared on unmount so a stale config can't govern the next mount.
  useEffect(() => {
    setPermissionResolver((node) => getNodePermissions(config, node));
    return () => setPermissionResolver(null);
  }, [config, setPermissionResolver]);

  // 5. Context Value
  const studioContextValue = useMemo(() => ({
    config,
    readOnly: mode === 'preview',
    apiClient,
    // Sayfa bazlı uçlar (stil senkronu) kaynağı bilmek zorunda.
    pageId
  }), [config, mode, apiClient, pageId]);

  if (loading) {
    return <StudioSkeleton className={className} />;
  }

  return (
    <StudioContext.Provider value={studioContextValue}>
      {/* Aktif düzenleme dilini host'a duyur: host bunu kendi i18n
          sağlayıcısına bağlayınca TUVAL da o dilde render olur. Editör kroması
          (TopBar/Inspector) bundan etkilenmez — o Türkçe sabit. */}
      <LanguageProvider onChange={onLanguageChange}>
        <div className={`tecof-studio-root ${className || ''}`.trim()}>
          <TopBar onSave={handleSaveDraft} saving={saving} saveStatus={saveStatus} dirty={dirty} autoSave={autoSave} embedded={isEmbedded} />

          {/* Revizyon önizleme bandı — salt okunur uyarısı */}
          {revisionPreviewId && (
            <div className="tecof-revision-preview-banner" role="status">
              <span className="tecof-revision-preview-badge">SALT OKUNUR</span>
              <span>
                Revizyon önizlemesi
                {revisionMeta?.revisionNumber ? ` — #${revisionMeta.revisionNumber}` : ''}
                {revisionMeta?.kind === 'publish' ? ' (yayın)' : revisionMeta?.kind === 'draft-save' ? ' (taslak)' : ''}
                {revisionMeta?.createDate ? ` · ${new Date(revisionMeta.createDate).toLocaleString('tr-TR')}` : ''}
              </span>
              <span className="tecof-revision-preview-hint">
                Bu sürüme dönmek için paneldeki Sayfa Geçmişi&apos;nden &quot;Geri Yükle&quot;yi kullanın.
              </span>
            </div>
          )}

          <div className="tecof-studio-workspace-container">
            {/* Sol panel hep mount kalır: kapanınca genişlik 0'a yumuşak
                animasyonla iner (içerik sabit genişlikte, sadece kırpılır) ve
                visibility ile odak/erişilebilirlik dışına çıkar. Açma butonu
                TopBar'da olduğu için rail'e gerek yok — tamamen kapanır. */}
            <div
              className={`tecof-left-panel-wrap${leftPanelOpen ? ' is-open' : ''}`}
              aria-hidden={!leftPanelOpen}
            >
              <LeftPanel />
            </div>
            <div className="tecof-studio-workspace">
              <Canvas />
              <SelectionOverlay />
              <NodeContextMenu />
            </div>
            {/* Sağ panel de sol panelle aynı desende TAMAMEN kapanır: rail yok,
                genişlik 0'a iner; açma yolu TopBar toggle'ı ve Cmd+K paleti. */}
            <div
              className={`tecof-right-panel-wrap${rightPanelOpen ? ' is-open' : ''}`}
              aria-hidden={!rightPanelOpen}
            >
              <Inspector />
            </div>
          </div>

          {saving && (
            <div className={`tecof-studio-save-indicator${saveStatus === 'error' ? ' is-error' : ''}`}>
              {saveStatus === 'error' ? 'Kaydedilemedi' : 'Kaydediliyor...'}
            </div>
          )}

          <CommandPalette onSave={handleSaveDraft} onExport={handleExportJson} onImport={handleImportJson} />
          <AiSectionModal />
          {/* Stili diğer sayfalara uygula — Inspector, komut paleti ve bağlam
              menüsü aynı modalı açar (hedef düğüm uiStore'da tutulur). */}
          <StyleSyncModal />
          <NodeSettingsModal />
          <HelpModal />
          <ThemeVars />
        </div>
      </LanguageProvider>
    </StudioContext.Provider>
  );
};

/* ─── Full-editor skeleton shown while the page document loads ─── */
const StudioSkeleton = ({ className }: { className?: string }) => (
  <div className={`tecof-studio-skeleton ${className || ''}`.trim()} aria-busy="true" aria-label="Stüdyo yükleniyor">
    {/* Topbar */}
    <div className="tecof-studio-skeleton-topbar">
      <span className="tecof-skeleton tecof-studio-skeleton-title" />
      <span className="tecof-skeleton tecof-studio-skeleton-vp" />
      <div className="tecof-studio-skeleton-toolgroup">
        <span className="tecof-skeleton tecof-studio-skeleton-dot" />
        <span className="tecof-skeleton tecof-studio-skeleton-dot" />
        <span className="tecof-skeleton tecof-studio-skeleton-cta" />
      </div>
    </div>

    {/* Body */}
    <div className="tecof-studio-skeleton-body">
      {/* Left panel */}
      <div className="tecof-studio-skeleton-side">
        <span className="tecof-skeleton tecof-studio-skeleton-search" />
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="tecof-skeleton tecof-studio-skeleton-blockrow" />
        ))}
      </div>

      {/* Canvas */}
      <div className="tecof-studio-skeleton-canvas">
        <span className="tecof-skeleton tecof-skeleton-block" />
        <span className="tecof-skeleton tecof-skeleton-block" />
        <span className="tecof-skeleton tecof-skeleton-block" />
      </div>

      {/* Right panel */}
      <div className="tecof-studio-skeleton-side right">
        <span className="tecof-skeleton tecof-skeleton-text w-60" />
        {Array.from({ length: 5 }).map((_, i) => (
          <React.Fragment key={i}>
            <span className="tecof-skeleton tecof-skeleton-text sm w-40" />
            <span className="tecof-skeleton tecof-studio-skeleton-field" />
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);
