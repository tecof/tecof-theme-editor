import { useCallback, useEffect, useRef, useState } from 'react';
import { Puck, fieldsPlugin, type Data, type Config } from '@puckeditor/core';
import { useTecof } from './TecofProvider';
import { editorStyles, injectKeyframes } from './styles';
import type { TecofEditorProps, PuckPageData } from '../types';

const EMPTY_PAGE: PuckPageData = { content: [], root: { props: {} }, zones: {} };

/**
 * TecofEditor — Puck CMS page editor.
 *
 * - Fetches page by ID via secretKey auth
 * - Saves on publish
 * - Supports iframe postMessage (undo/redo/publish/viewport)
 *
 * Requires `<TecofProvider>` ancestor for API client.
 */
export const TecofEditor = ({
  pageId,
  config,
  accessToken,
  onSave,
  onPublish,
  onChange,
  overrides,
  plugins: extraPlugins,
  className,
}: TecofEditorProps) => {
  const { apiClient } = useTecof();

  const [initialData, setInitialData] = useState<PuckPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const puckDataRef = useRef<PuckPageData | null>(null);
  const isEmbedded = typeof window !== 'undefined' && window.parent !== window;

  // Inject spinner keyframes once
  useEffect(() => { injectKeyframes(); }, []);

  /* ── Fetch page ── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.getPage(pageId);
      if (cancelled) return;
      setInitialData(res.success && res.data?.puckData ? res.data.puckData : EMPTY_PAGE);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [pageId, apiClient]);

  /* ── Save / Publish ── */
  const handlePublish = useCallback(
    async (data: Data) => {
      const puckData = data as unknown as PuckPageData;
      setSaving(true);
      setSaveStatus('idle');

      const res = await apiClient.savePage(pageId, puckData, undefined, accessToken);

      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
        onSave?.(puckData);
        onPublish?.(puckData);
        if (isEmbedded) window.parent.postMessage({ type: 'puck:saved' }, '*');
      } else {
        setSaveStatus('error');
      }

      setSaving(false);
    },
    [pageId, apiClient, isEmbedded, onSave, onPublish, accessToken]
  );

  /* ── Change ── */
  const handleChange = useCallback(
    (data: Data) => {
      const puckData = data as unknown as PuckPageData;
      puckDataRef.current = puckData;
      onChange?.(puckData);
      if (isEmbedded) window.parent.postMessage({ type: 'puck:save' }, '*');
    },
    [onChange, isEmbedded]
  );

  /* ── iframe postMessage ── */
  useEffect(() => {
    if (!isEmbedded) return;

    const onMessage = (e: MessageEvent) => {
      switch (e.data?.type) {
        case 'puck:publish': {
          const btn = document.querySelector('[data-testid="puck-publish"]') as HTMLButtonElement;
          btn ? btn.click() : puckDataRef.current && handlePublish(puckDataRef.current);
          break;
        }
        case 'puck:undo':
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true, bubbles: true }));
          break;
        case 'puck:redo':
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true, shiftKey: true, bubbles: true }));
          break;
        case 'puck:viewport': {
          const frame = document.querySelector('[data-testid="puck-frame"]') as HTMLElement;
          if (frame) {
            const w = e.data.width || '100%';
            frame.style.maxWidth = w;
            frame.style.margin = w === '100%' ? '0' : '0 auto';
            frame.style.transition = 'max-width 0.3s ease';
          }
          break;
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isEmbedded, handlePublish]);

  /* ── Loading ── */
  if (loading || !initialData) {
    return (
      <div style={editorStyles.loading} className={className}>
        <div style={editorStyles.loadingInner}>
          <div style={editorStyles.spinner} />
          <p style={editorStyles.loadingText}>Loading editor...</p>
        </div>
      </div>
    );
  }

  /* ── Plugins & Overrides ── */
  const plugins = [
    ...(fieldsPlugin ? [fieldsPlugin({ desktopSideBar: 'left' })] : []),
    ...(extraPlugins || []),
  ];

  const mergedOverrides = { header: () => <></>, ...(overrides || {}) };

  return (
    <div style={editorStyles.wrapper} className={className}>
      <Puck
        plugins={plugins}
        config={config as Config}
        data={initialData}
        onPublish={handlePublish}
        onChange={handleChange}
        overrides={mergedOverrides}
      />
      {saving && (
        <div style={editorStyles.saveIndicator}>
          {saveStatus === 'error' ? 'Save failed' : 'Saving...'}
        </div>
      )}
    </div>
  );
};

export default TecofEditor;