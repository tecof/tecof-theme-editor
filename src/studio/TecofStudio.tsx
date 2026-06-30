import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { useEditorStore } from '../engine/store';
import { useUiStore } from './uiStore';
import { parseDocument, serializeDocument } from '../engine/document';
import { StudioContext } from './context';
import { LanguageProvider } from './language/LanguageContext';
import { Canvas } from './canvas/Canvas';
import { SelectionOverlay } from './overlay/SelectionOverlay';
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
  hostOrigin,
  className,
}: TecofEditorProps) => {
  const { apiClient } = useTecof();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const setDocument = useEditorStore((state) => state.setDocument);
  const documentState = useEditorStore((state) => state.document);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setViewport = useEditorStore((state) => state.setViewport);

  const leftPanelOpen = useUiStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUiStore((state) => state.rightPanelOpen);
  const toggleLeftPanel = useUiStore((state) => state.toggleLeftPanel);
  const toggleRightPanel = useUiStore((state) => state.toggleRightPanel);
  const mode = useUiStore((state) => state.mode);

  const documentStateRef = useRef(documentState);
  documentStateRef.current = documentState;

  const isEmbedded = isEmbeddedHost();

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
        const res = await apiClient.getPage(pageId, controller.signal);
        if (cancelled) return;

        const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
        const parsedDoc = parseDocument(rawData);
        setDocument(parsedDoc);
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
  }, [pageId, apiClient, setDocument]);

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
    const currentDoc = documentStateRef.current;
    const serialized = serializeDocument(currentDoc);

    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await apiClient.savePage(pageId, serialized, undefined, accessToken);
      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
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
  }, [pageId, apiClient, accessToken, onSave, isEmbedded]);

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
  }, [isEmbedded, handleSaveDraft, undo, redo, setViewport]);

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

      const selectedId = useEditorStore.getState().selection.selectedId;
      const selectedIds = useEditorStore.getState().selection.selectedIds;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Escape -> Deselect
      if (e.key === 'Escape') {
        useEditorStore.getState().selectNode(null);
        if (isEmbedded) {
          postToHost('puck:itemDeselected');
        }
        return;
      }

      // Undo / Redo
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
  }, [undo, redo, isEmbedded]);

  // 5. Context Value
  const studioContextValue = useMemo(() => ({
    config,
    readOnly: mode === 'preview',
    apiClient
  }), [config, mode, apiClient]);

  if (loading) {
    return <StudioSkeleton className={className} />;
  }

  return (
    <StudioContext.Provider value={studioContextValue}>
      <LanguageProvider>
        <div className={`tecof-studio-root ${className || ''}`.trim()}>
          <TopBar onSave={handleSaveDraft} saving={saving} saveStatus={saveStatus} />

          <div className="tecof-studio-workspace-container">
            {leftPanelOpen ? (
              <LeftPanel />
            ) : (
              <PanelRail side="left" onExpand={toggleLeftPanel} />
            )}
            <div className="tecof-studio-workspace">
              <Canvas />
              <SelectionOverlay />
            </div>
            {rightPanelOpen ? (
              <Inspector />
            ) : (
              <PanelRail side="right" onExpand={toggleRightPanel} />
            )}
          </div>

          {saving && (
            <div className={`tecof-studio-save-indicator${saveStatus === 'error' ? ' is-error' : ''}`}>
              {saveStatus === 'error' ? 'Kaydedilemedi' : 'Kaydediliyor...'}
            </div>
          )}
        </div>
      </LanguageProvider>
    </StudioContext.Provider>
  );
};

/* ─── Thin collapsed rail shown in place of a hidden panel ─── */
const PanelRail = ({ side, onExpand }: { side: 'left' | 'right'; onExpand: () => void }) => (
  <div className={`tecof-panel-rail tecof-panel-rail-${side}`}>
    <button
      type="button"
      className="tecof-icon-btn"
      onClick={onExpand}
      title={side === 'left' ? 'Sol paneli aç' : 'Sağ paneli aç'}
      aria-label={side === 'left' ? 'Sol paneli aç' : 'Sağ paneli aç'}
    >
      {side === 'left' ? <PanelLeft size={16} /> : <PanelRight size={16} />}
    </button>
  </div>
);

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
