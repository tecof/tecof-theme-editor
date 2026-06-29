import { ActionBar, Puck, blocksPlugin, fieldsPlugin, outlinePlugin, usePuck, type Config, type Data } from '@puckeditor/core';
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import type { TecofApiClient } from '../api';
import type { PuckPageData, TecofEditorProps } from '../types';
import { useTecof } from './TecofProvider';

const EMPTY_PAGE: PuckPageData = { content: [], root: { props: {} }, zones: {} };

interface DrawerSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  config: any;
}

const DrawerSearchContext = createContext<DrawerSearchContextType | null>(null);

/* ─── ComponentDrawerItem — Hover-triggered lazy preview ─── */

const ComponentDrawerItem = ({
  name,
  apiClient,
  children,
}: {
  name: string;
  apiClient: TecofApiClient;
  children: React.ReactNode;
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  const handleMouseEnter = useCallback(async () => {
    // Only fetch once per component lifetime
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);

    try {
      const domain = typeof window !== 'undefined' ? window.location.hostname : '';
      const blobUrl = await apiClient.getComponentPreview(domain, name);
      if (blobUrl) {
        setImgSrc(blobUrl);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [name, apiClient]);

  return (
    <div className="tecof-drawer-item-group group" onMouseEnter={handleMouseEnter}>
      {children}
      <div className="tecof-drawer-popover">
        <div className="tecof-drawer-popover-header">
          {name} Önizleme
        </div>
        <div className="tecof-drawer-popover-body">
          {/* Skeleton loader */}
          {(loading || (!imgSrc && !error)) && (
            <div className="tecof-drawer-skeleton" />
          )}
          {/* Screenshot image */}
          {imgSrc && (
            <img
              src={imgSrc}
              alt={`${name} preview`}
              className="tecof-drawer-img"
            />
          )}
          {/* Error state */}
          {error && (
            <div className="tecof-drawer-preview-error">
              Önizleme yüklenemedi
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── CustomDrawer & CustomDrawerItem stable overrides ─── */

const CustomDrawer = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(DrawerSearchContext);
  if (!context) return <div className="tecof-drawer-list-layout">{children}</div>;
  const { searchQuery, setSearchQuery } = context;

  return (
    <div className="tecof-drawer-wrapper-layout">
      <div className="tecof-drawer-search-wrapper">
        <div className="tecof-drawer-search-box">
          <Search size={14} color="#71717a" />
          <input
            type="text"
            placeholder="Blok ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tecof-drawer-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="tecof-drawer-clear-btn"
              title="Temizle"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="tecof-drawer-list-layout">
        {children}
      </div>
    </div>
  );
};

const CustomDrawerItem = ({ children, name }: { children: React.ReactNode, name: string }) => {
  const context = useContext(DrawerSearchContext);
  const { apiClient } = useTecof();

  if (!context) {
    return <ComponentDrawerItem name={name} apiClient={apiClient}>{children}</ComponentDrawerItem>;
  }

  const { searchQuery, config } = context;
  const componentConfig = (config as any).components?.[name];
  const label = componentConfig?.label || name;

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    const matchesName = name.toLowerCase().includes(query);
    const matchesLabel = label.toLowerCase().includes(query);
    if (!matchesName && !matchesLabel) {
      return <></>;
    }
  }

  return <ComponentDrawerItem name={name} apiClient={apiClient}>{children}</ComponentDrawerItem>;
};

/* ─── AutoFieldsOnSelect — Switch to fields plugin when a component is selected ─── */

const AutoFieldsOnSelect = () => {
  const { selectedItem, dispatch } = usePuck();
  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = selectedItem?.props?.id || null;
    if (currentId && currentId !== prevSelectedRef.current) {
      dispatch({
        type: 'setUi',
        ui: { plugin: { current: 'fields' } },
      });
    }
    prevSelectedRef.current = currentId;
  }, [selectedItem, dispatch]);

  return null;
};

/* ─── CustomActionBar — Adds up and down sorting arrows to the action bar ─── */

const CustomActionBar = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  const { appState, dispatch, getSelectorForId, selectedItem } = usePuck();

  const canMoveUp = useMemo(() => {
    if (!selectedItem || !selectedItem.props?.id) return false;
    const selector = getSelectorForId(selectedItem.props.id);
    if (!selector) return false;
    return selector.index > 0;
  }, [selectedItem, getSelectorForId]);

  const canMoveDown = useMemo(() => {
    if (!selectedItem || !selectedItem.props?.id) return false;
    const selector = getSelectorForId(selectedItem.props.id);
    if (!selector) return false;
    const { index, zone } = selector;
    const items = zone ? (appState.data.zones?.[zone] || []) : (appState.data.content || []);
    return index < items.length - 1;
  }, [selectedItem, getSelectorForId, appState.data]);

  const handleMove = useCallback((direction: 'up' | 'down') => {
    if (!selectedItem || !selectedItem.props?.id) return;
    const selector = getSelectorForId(selectedItem.props.id);
    if (!selector) return;

    const { index, zone } = selector;
    let items = zone ? [...(appState.data.zones?.[zone] || [])] : [...(appState.data.content || [])];

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap items in place
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    if (zone) {
      dispatch({
        type: 'setData',
        data: {
          ...appState.data,
          zones: {
            ...appState.data.zones,
            [zone]: items,
          },
        },
      });
      dispatch({
        type: 'setUi',
        ui: {
          itemSelector: {
            index: targetIndex,
            zone,
          },
        },
      });
    } else {
      dispatch({
        type: 'setData',
        data: {
          ...appState.data,
          content: items,
        },
      });
      dispatch({
        type: 'setUi',
        ui: {
          itemSelector: {
            index: targetIndex,
          },
        },
      });
    }
  }, [selectedItem, getSelectorForId, appState.data, dispatch]);

  return (
    <ActionBar label={label}>
      <ActionBar.Group>
        <ActionBar.Action onClick={() => handleMove('up')} disabled={!canMoveUp} label="Yukarı Taşı">
          <ArrowUp size={14} />
        </ActionBar.Action>
        <ActionBar.Action onClick={() => handleMove('down')} disabled={!canMoveDown} label="Aşağı Taşı">
          <ArrowDown size={14} />
        </ActionBar.Action>
        <ActionBar.Separator />
        {children}
      </ActionBar.Group>
    </ActionBar>
  );
};

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
  const { apiClient, secretKey } = useTecof();

  const [initialData, setInitialData] = useState<PuckPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState('');

  const draftDataRef = useRef<Data | null>(null);
  const isEmbedded = typeof window !== 'undefined' && window.parent !== window;

  /* ── Fetch page ── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const res = await apiClient.getPage(pageId);
      if (cancelled) return;
      const data = res.success && res.data?.draftData ? res.data.draftData : EMPTY_PAGE;
      setInitialData(data);
      draftDataRef.current = data as unknown as Data;
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [pageId, apiClient]);

  /* ── Save Draft (Taslak Kaydet) ── */
  const handleSaveDraft = useCallback(
    async (data?: Data) => {
      const currentData = data || draftDataRef.current;
      if (!currentData) return;

      const draftData = currentData as unknown as PuckPageData;
      setSaving(true);
      setSaveStatus('idle');

      const res = await apiClient.savePage(pageId, draftData, undefined, accessToken);

      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
        onSave?.(draftData);
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
      draftDataRef.current = data;
      const draftData = data as unknown as PuckPageData;
      onChange?.(draftData);
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

  /* ── Track item selection via click delegation ── */
  useEffect(() => {
    if (!isEmbedded) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Walk up to find closest puck component
      const puckComponent = target.closest('[data-puck-component]') as HTMLElement;

      if (puckComponent) {
        const componentType = puckComponent.getAttribute('data-puck-component');
        const draggableId = puckComponent.closest('[data-rfd-draggable-id]')?.getAttribute('data-rfd-draggable-id');

        window.parent.postMessage({
          type: 'puck:itemSelected',
          item: {
            type: componentType,
            id: draggableId || null
          }
        }, '*');
      }
    };

    // Detect deselection: click on empty area
    const handleDeselect = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-puck-component]')) {
        window.parent.postMessage({ type: 'puck:itemDeselected' }, '*');
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('click', handleDeselect, false);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('click', handleDeselect, false);
    };
  }, [isEmbedded]);

  /* ── Context & Memoized Overrides ── */
  const searchContextValue = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    config
  }), [searchQuery, config]);

  const plugins = useMemo(() => [
    { ...blocksPlugin(), label: 'Bloklar' },
    { ...outlinePlugin(), label: 'Anahat' },
    { ...fieldsPlugin({ desktopSideBar: 'right' }), label: 'Alanlar' },
    ...(extraPlugins || []),
  ], [extraPlugins]);

  const mergedOverrides = useMemo(() => {
    return {
      header: () => <></>,
      drawer: CustomDrawer,
      drawerItem: CustomDrawerItem,
      actionBar: ({ children, label }: { children: React.ReactNode, label?: string }) => {
        return <CustomActionBar label={label}>{children}</CustomActionBar>;
      },
      puck: ({ children }: { children: React.ReactNode }) => {
        return (
          <>
            <AutoFieldsOnSelect />
            {children}
          </>
        );
      },
      ...(overrides || {})
    };
  }, [overrides]);

  /* ── Loading ── */
  if (loading || !initialData) {
    return (
      <div className={`tecof-editor-loading ${className || ''}`.trim()}>
        <div className="tecof-editor-loading-inner">
          <div className="tecof-editor-spinner" />
          <p className="tecof-editor-loading-text">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <DrawerSearchContext.Provider value={searchContextValue}>
      <div className={`tecof-editor-wrapper ${className || ''}`.trim()}>
        <Puck
          plugins={plugins}
          config={config as Config}
          data={initialData}
          onPublish={handlePuckPublish}
          onChange={handleChange}
          overrides={mergedOverrides}
          metadata={{ editMode: true }}
        />
        {saving && (
          <div className="tecof-editor-save-indicator">
            {saveStatus === 'error' ? 'Save failed' : 'Saving...'}
          </div>
        )}
      </div>
    </DrawerSearchContext.Provider>
  );
};

export default TecofEditor;