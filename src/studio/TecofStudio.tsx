import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '../engine/store';
import { parseDocument, serializeDocument } from '../engine/document';
import { StudioContext } from './context';
import { Canvas } from './canvas/Canvas';
import { SelectionOverlay } from './overlay/SelectionOverlay';
import { Inspector } from './panels/Inspector';
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
          window.parent.postMessage({ type: 'puck:saved' }, '*');
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

  // 5. Context Value
  const studioContextValue = useMemo(() => ({
    config,
    readOnly: false,
    apiClient
  }), [config, apiClient]);

  if (loading) {
    return (
      <div className={`tecof-editor-loading ${className || ''}`.trim()} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f4f4f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="tecof-editor-spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e4e4e7',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>Stüdyo yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <StudioContext.Provider value={studioContextValue}>
      <div className={`tecof-studio-root ${className || ''}`.trim()} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        background: '#f4f4f5'
      }}>
        <div className="tecof-studio-workspace-container" style={{
          display: 'flex',
          flex: 1,
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        }}>
          <div className="tecof-studio-workspace" style={{
            display: 'flex',
            flex: 1,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Canvas />
            <SelectionOverlay />
          </div>
          <Inspector />
        </div>

        {saving && (
          <div className="tecof-editor-save-indicator" style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            background: saveStatus === 'error' ? '#ef4444' : '#18181b',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 9999
          }}>
            {saveStatus === 'error' ? 'Kaydedilemedi' : 'Kaydediliyor...'}
          </div>
        )}
      </div>
    </StudioContext.Provider>
  );
};
