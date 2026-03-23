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
 * - Saves draft via API (taslak kaydet)
 * - Supports iframe postMessage:
 *   - puck:save       → triggers draft save
 *   - puck:undo       → undo
 *   - puck:redo       → redo
 *   - puck:viewport   → resize preview
 * - Sends to parent:
 *   - puck:saved      → draft saved successfully
 *   - puck:changed    → data changed
 *   - puck:itemSelected → item selected { item, id }
 *
 * Requires `<TecofProvider>` ancestor for API client.
 */
export const TecofEditor = ({
  pageId,
  config,
  accessToken,
  onSave,
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

  const puckDataRef = useRef<Data | null>(null);
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
      const data = res.success && res.data?.puckData ? res.data.puckData : EMPTY_PAGE;
      setInitialData(data);
      puckDataRef.current = data as unknown as Data;
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [pageId, apiClient]);

  /* ── Save Draft (Taslak Kaydet) ── */
  const handleSaveDraft = useCallback(
    async (data?: Data) => {
      const currentData = data || puckDataRef.current;
      if (!currentData) return;

      const puckData = currentData as unknown as PuckPageData;
      setSaving(true);
      setSaveStatus('idle');

      const res = await apiClient.savePage(pageId, puckData, undefined, accessToken);

      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
        onSave?.(puckData);
        if (isEmbedded) window.parent.postMessage({ type: 'puck:saved' }, '*');
      } else {
        setSaveStatus('error');
        if (isEmbedded) window.parent.postMessage({ type: 'puck:saveError', message: res.message }, '*');
      }

      setSaving(false);
    },
    [pageId, apiClient, isEmbedded, onSave, accessToken]
  );

  /* ── Change ── */
  const handleChange = useCallback(
    (data: Data) => {
      puckDataRef.current = data;
      const puckData = data as unknown as PuckPageData;
      onChange?.(puckData);
      if (isEmbedded) window.parent.postMessage({ type: 'puck:changed' }, '*');
    },
    [onChange, isEmbedded]
  );

  /* ── Puck onPublish — used as save trigger ── */
  const handlePuckPublish = useCallback(
    (data: Data) => {
      handleSaveDraft(data);
    },
    [handleSaveDraft]
  );

  /* ── iframe postMessage listener ── */
  useEffect(() => {
    if (!isEmbedded) return;

    const onMessage = (e: MessageEvent) => {
      switch (e.data?.type) {
        case 'puck:save': {
          handleSaveDraft();
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
  }, [isEmbedded, handleSaveDraft]);

  /* ── Track item selection and notify parent ── */
  const lastSelectedRef = useRef<string | null>(null);
  const handleItemSelect = useCallback(
    (appState: any) => {
      if (!isEmbedded) return;
      const selector = appState?.ui?.itemSelector;
      const selectorKey = selector ? JSON.stringify(selector) : null;

      if (selectorKey !== lastSelectedRef.current) {
        lastSelectedRef.current = selectorKey;

        if (selector) {
          // Find the selected item from content
          const zone = selector.zone || 'default-zone';
          const index = selector.index;
          let item = null;

          if (zone === 'default-zone' || !zone) {
            item = appState?.data?.content?.[index];
          } else {
            item = appState?.data?.zones?.[zone]?.[index];
          }

          window.parent.postMessage({
            type: 'puck:itemSelected',
            selector,
            item: item ? { type: item.type, id: item.props?.id } : null
          }, '*');
        } else {
          window.parent.postMessage({ type: 'puck:itemDeselected' }, '*');
        }
      }
    },
    [isEmbedded]
  );

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
        onPublish={handlePuckPublish}
        onChange={(data: Data) => {
          handleChange(data);
          // Puck appState extraction via internal state
          // We use a setTimeout to let Puck update its state first
          setTimeout(() => {
            try {
              const puckState = (document.querySelector('[data-puck-component]') as any)?.__puckAppState;
              if (puckState) handleItemSelect(puckState);
            } catch { /* ignore */ }
          }, 50);
        }}
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