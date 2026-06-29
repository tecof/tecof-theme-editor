import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '../engine/store';
import { parseDocument, serializeDocument } from '../engine/document';
import { StudioContext } from './context';
import { Canvas } from './canvas/Canvas';
import { SelectionOverlay } from './overlay/SelectionOverlay';
import { ContextMenu } from './canvas/ContextMenu';
import { RecoveryBanner } from './canvas/RecoveryBanner';
import { Inspector } from './panels/Inspector';
import { TopBar } from './topbar/TopBar';
import { LeftPanel } from './panels/LeftPanel';
import { useTecof } from '../components/TecofProvider';
import type { PuckPageData, TecofEditorProps } from '../types';

/** Debounce window for autosave after the document stops changing. */
const AUTOSAVE_DEBOUNCE_MS = 2000;
/** localStorage key for a page's recovery draft. */
const draftStorageKey = (pageId: string) => `tecof:draft:${pageId}`;

/** Read a persisted local draft for a page, tolerating quota/parse/private-mode errors. */
const readLocalDraft = (pageId: string): PuckPageData | null => {
  try {
    const raw = window.localStorage.getItem(draftStorageKey(pageId));
    return raw ? (JSON.parse(raw) as PuckPageData) : null;
  } catch {
    return null;
  }
};

/** Persist a local draft for a page (best-effort; never throws). */
const writeLocalDraft = (pageId: string, data: PuckPageData) => {
  try {
    window.localStorage.setItem(draftStorageKey(pageId), JSON.stringify(data));
  } catch {
    /* storage full / unavailable — recovery is a best-effort safety net */
  }
};

/** Remove a page's local draft (best-effort). */
const clearLocalDraft = (pageId: string) => {
  try {
    window.localStorage.removeItem(draftStorageKey(pageId));
  } catch {
    /* ignore */
  }
};

export const TecofStudio = ({
  pageId,
  config,
  accessToken,
  onSave,
  onChange,
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

  const documentStateRef = useRef(documentState);
  documentStateRef.current = documentState;

  // Recovery banner: a newer local draft was found that differs from the server.
  const [recoveryDraft, setRecoveryDraft] = useState<PuckPageData | null>(null);
  // True while there are unsaved edits (drives autosave + the beforeunload guard).
  const dirtyRef = useRef(false);
  // Pending autosave debounce timer.
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEmbedded = typeof window !== 'undefined' && window.parent !== window;

  // 1. Fetch Page and Load into Store
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setRecoveryDraft(null);
      dirtyRef.current = false;
      try {
        const res = await apiClient.getPage(pageId);
        if (cancelled) return;

        const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
        const parsedDoc = parseDocument(rawData);
        setDocument(parsedDoc);

        // Recovery: if a locally-persisted draft exists and differs from the
        // server copy, offer to restore it (e.g. the tab closed before autosave
        // flushed). We compare serialized forms so structurally-equal docs match.
        const localDraft = readLocalDraft(pageId);
        if (localDraft) {
          const serverSerialized = JSON.stringify(serializeDocument(parsedDoc));
          const localSerialized = JSON.stringify(localDraft);
          if (localSerialized !== serverSerialized) {
            setRecoveryDraft(localDraft);
            console.info('[TecofStudio] Local draft differs from server; offering recovery.');
          } else {
            // In sync — drop the stale local copy.
            clearLocalDraft(pageId);
          }
        }
      } catch (err) {
        console.error('Failed to load page:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pageId, apiClient, setDocument]);

  // 2. Trigger onChange when document state changes in store
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const serialized = serializeDocument(documentState);
    onChange?.(serialized);

    if (isEmbedded) {
      window.parent.postMessage({ type: 'puck:changed' }, '*');
    }

    // ── Core UX: dirty-tracking, local recovery snapshot, debounced autosave ──
    dirtyRef.current = true;
    // Persist a recovery snapshot on every change so an unexpected close keeps work.
    writeLocalDraft(pageId, serialized);

    // Debounce the server autosave: reset the timer on each successive edit.
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      if (dirtyRef.current) {
        handleSaveDraftRef.current();
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [documentState, loading, onChange, isEmbedded, pageId]);

  // Keep a stable ref to the latest save fn so the autosave timer (scheduled in
  // the change effect) always calls the current closure without re-subscribing.
  const handleSaveDraftRef = useRef<() => void>(() => {});

  // 3. Save Draft Functionality
  const handleSaveDraft = useCallback(async () => {
    const currentDoc = documentStateRef.current;
    const serialized = serializeDocument(currentDoc);

    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await apiClient.savePage(pageId, serialized, undefined, accessToken);
      if (res.success) {
        // Saved to server -> no longer dirty, and the local recovery copy is stale.
        dirtyRef.current = false;
        clearLocalDraft(pageId);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
        onSave?.(serialized);
        if (isEmbedded) {
          window.parent.postMessage({ type: 'puck:saved', data: serialized }, '*');
        }
      } else {
        setSaveStatus('error');
        if (isEmbedded) {
          window.parent.postMessage({ type: 'puck:saveError', message: res.message }, '*');
        }
      }
    } catch (err: any) {
      setSaveStatus('error');
      if (isEmbedded) {
        window.parent.postMessage({ type: 'puck:saveError', message: err.message }, '*');
      }
    } finally {
      setSaving(false);
    }
  }, [pageId, apiClient, accessToken, onSave, isEmbedded]);

  // Keep the autosave ref pointing at the freshest save closure.
  useEffect(() => {
    handleSaveDraftRef.current = handleSaveDraft;
  }, [handleSaveDraft]);

  // Flush any pending autosave timer on unmount so it can't fire after teardown.
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Warn before leaving the tab while there are unsaved (un-persisted-to-server) edits.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      // Required by some browsers to actually show the native prompt.
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Restore the locally-saved draft into the editor (and clear the banner).
  const handleRestoreDraft = useCallback(() => {
    if (!recoveryDraft) return;
    setDocument(parseDocument(recoveryDraft));
    setRecoveryDraft(null);
    // The change effect will re-persist + schedule an autosave for the restored doc.
  }, [recoveryDraft, setDocument]);

  // Discard the local draft and keep the server copy already loaded.
  const handleDismissRecovery = useCallback(() => {
    clearLocalDraft(pageId);
    setRecoveryDraft(null);
  }, [pageId]);

  // 4. Listen to PostMessage signals from the host wrapper
  useEffect(() => {
    if (!isEmbedded) return;

    const onMessage = (e: MessageEvent) => {
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
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Escape -> Deselect
      if (e.key === 'Escape') {
        useEditorStore.getState().selectNode(null);
        if (isEmbedded) {
          window.parent.postMessage({ type: 'puck:itemDeselected' }, '*');
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

      // Block editor actions if input is focused
      if (isInput()) return;

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        useEditorStore.getState().removeNode(selectedId);
        return;
      }

      // Duplicate selected
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        useEditorStore.getState().duplicateNode(selectedId);
        return;
      }

      // Clipboard: copy / cut / paste. Placed AFTER the isInput() guard above so
      // Cmd/Ctrl+C/X/V keep their native behaviour while editing text fields.
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c' && selectedId) {
        e.preventDefault();
        useEditorStore.getState().copyNode(selectedId);
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'x' && selectedId) {
        e.preventDefault();
        useEditorStore.getState().cutNode(selectedId);
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        // Only intercept when something is on our clipboard; otherwise let the
        // browser handle native paste (no-op on the canvas).
        if (!useEditorStore.getState().clipboard) return;
        e.preventDefault();
        // Paste after the current selection (or into root content if nothing selected).
        useEditorStore.getState().pasteNode(selectedId || undefined);
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
    readOnly: false,
    apiClient
  }), [config, apiClient]);

  if (loading) {
    return <StudioSkeleton className={className} />;
  }

  return (
    <StudioContext.Provider value={studioContextValue}>
      <div className={`tecof-studio-root ${className || ''}`.trim()}>
        <TopBar onSave={handleSaveDraft} saving={saving} saveStatus={saveStatus} />

        <div className="tecof-studio-workspace-container">
          <LeftPanel />
          <div className="tecof-studio-workspace">
            <Canvas />
            <SelectionOverlay />
          </div>
          <Inspector />
        </div>

        {saving && (
          <div className={`tecof-studio-save-indicator${saveStatus === 'error' ? ' is-error' : ''}`}>
            {saveStatus === 'error' ? 'Kaydedilemedi' : 'Kaydediliyor...'}
          </div>
        )}

        {/* Single host-DOM context menu for canvas right-clicks. */}
        <ContextMenu />

        {/* Unsaved-draft recovery toast (only when a differing local draft exists). */}
        {recoveryDraft && (
          <RecoveryBanner onRestore={handleRestoreDraft} onDismiss={handleDismissRecovery} />
        )}
      </div>
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
