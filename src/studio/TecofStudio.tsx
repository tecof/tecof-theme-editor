import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '../engine/store';
import { parseDocument, serializeDocument } from '../engine/document';
import { StudioContext } from './context';
import { Canvas } from './canvas/Canvas';
import { SelectionOverlay } from './overlay/SelectionOverlay';
import { Inspector } from './panels/Inspector';
import { TopBar } from './topbar/TopBar';
import { LeftPanel } from './panels/LeftPanel';
import { useTecof } from '../components/TecofProvider';
import type { TecofEditorProps } from '../types';

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

  const isEmbedded = typeof window !== 'undefined' && window.parent !== window;

  // 1. Fetch Page and Load into Store
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getPage(pageId);
        if (cancelled) return;

        const rawData = res.success && res.data?.draftData ? res.data.draftData : null;
        const parsedDoc = parseDocument(rawData);
        setDocument(parsedDoc);
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
  }, [documentState, loading, onChange, isEmbedded]);

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
