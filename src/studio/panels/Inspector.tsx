import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { findNodeById, getParentId, getDescendants } from '../../engine/zones';
import { findRepeatScope } from '../../engine/repeat';
import { inferItemSchema } from '../../utils/itemTokens';
import { RepeatScopeContext } from '../../components/fields/repeatScope';
import { peekRepeatRows, useRepeatRowsTick } from '../../components/useRepeatRows';
import type { TecofNode } from '../../types';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';
import { FieldRenderer } from '../fields-host/FieldRenderer';
import { useResolvedFields } from '../fields-host/useResolvedFields';
import { StyleEditor } from '../style/StyleEditor';
import { ThemeEditor } from '../theme/ThemeEditor';
import { STYLES_PROP } from '../style/types';

/**
 * Renders the editable content fields (plus the variant switcher) for ONE node.
 *
 * Self-contained: it resolves its OWN dynamic fields, permissions and repeat
 * scope, so it can be listed many times in the aggregate ("section") view
 * without breaking the rules of hooks. Every `onChange` targets THIS node's id,
 * so editing a descendant straight from the section panel just works.
 */
const NodeFieldSet: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const updateProps = useEditorStore((state) => state.updateProps);
  const { config, readOnly } = useStudio();
  const perms = usePermissions(nodeId);
  const fieldsReadOnly = readOnly || perms.edit === false;

  // Subscribe to THIS node only (immer keeps untouched nodes' references
  // stable), so typing in one aggregate group never re-renders the others.
  const node = useEditorStore((state) => findNodeById(state.document, nodeId)?.node ?? null);

  const info = useMemo(() => {
    if (!node) return null;
    return { node, componentConfig: config.components[node.type] };
  }, [node, config]);

  // Dynamic fields + read-only map (see useResolvedFields); static for the rest.
  const resolved = useResolvedFields(info?.node ?? null, info?.componentConfig);

  // Offer the enclosing repeat item's fields (`{{ item.* }}`) to `{ }` popovers.
  // The narrow subscription is the OWNER node of the enclosing repeat scope:
  // its reference changes when the rows/source change or this node is moved
  // into/out of a template, which is exactly when the scope must recompute.
  const repeatRowsTick = useRepeatRowsTick();
  const repeatOwnerNode = useEditorStore((state) => {
    const scope = findRepeatScope(state.document, config, nodeId);
    return scope ? findNodeById(state.document, scope.ownerId)?.node ?? null : null;
  });
  const repeatScope = useMemo(() => {
    if (!repeatOwnerNode) return null;
    const scope = findRepeatScope(useEditorStore.getState().document, config, nodeId);
    if (!scope) return null;
    const sample =
      scope.sample ?? peekRepeatRows(scope.sourceValue, scope.sourceFieldDef)?.[0] ?? null;
    const schema = scope.itemSchema?.length ? scope.itemSchema : inferItemSchema(sample);
    return schema.length > 0 ? { schema } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, repeatOwnerNode, config, repeatRowsTick]);

  // Slot fields are on-canvas drag-drop only, never shown in the inspector.
  const editableFields = useMemo(
    () => Object.entries(resolved.fields).filter(([, fieldDef]) => fieldDef?.type !== 'slot'),
    [resolved.fields]
  );

  if (!info) return null;
  const { componentConfig } = info;

  const variantEntries = Object.entries(componentConfig?.variants ?? {});
  const activeVariant =
    typeof info.node.props._variant === 'string' ? info.node.props._variant : null;

  return (
    <>
      {variantEntries.length > 0 && (
        <div className="tecof-variant-switcher" role="group" aria-label="Varyant">
          <span className="tecof-variant-label">Varyant</span>
          <div className="tecof-variant-chips">
            {variantEntries.map(([key, variant]) => (
              <button
                key={key}
                type="button"
                className={`tecof-variant-chip${activeVariant === key ? ' is-active' : ''}`}
                disabled={fieldsReadOnly}
                title={`${variant.label} varyantını uygula`}
                onClick={() => updateProps(nodeId, { ...variant.props, _variant: key })}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {editableFields.length === 0 ? (
        <div className="tecof-inspector-empty-fields">
          Bu bileşenin düzenlenebilir alanı bulunmuyor.
        </div>
      ) : (
        <RepeatScopeContext.Provider value={repeatScope}>
          {editableFields.map(([fieldName, fieldDef]) => (
            <FieldRenderer
              key={fieldName}
              name={fieldName}
              definition={fieldDef}
              value={info.node.props[fieldName]}
              onChange={(newVal) => updateProps(nodeId, { [fieldName]: newVal })}
              readOnly={
                fieldsReadOnly ||
                resolved.readOnly[fieldName] === true ||
                fieldDef?.readOnly === true
              }
            />
          ))}
        </RepeatScopeContext.Provider>
      )}
    </>
  );
};

/**
 * One collapsible row in the aggregate ("section") view: a header (collapse
 * toggle + selectable label + lock badge) wrapping the node's field set. Depth
 * drives indentation so the nesting reads like the layer tree. Hovering the row
 * highlights the node on the canvas; clicking the label selects it (which, for
 * a leaf, narrows the panel back to just that element).
 *
 * Memoized: the Inspector re-renders on every document change, but a group only
 * needs to when ITS row props change — each NodeFieldSet subscribes to its own
 * node, so edits elsewhere skip the whole subtree.
 */
const SectionGroup = React.memo<{
  id: string;
  node: TecofNode;
  depth: number;
  collapsed: boolean;
  onToggle: (id: string) => void;
}>(({ id, node, depth, collapsed, onToggle }) => {
  const { config } = useStudio();
  const selectNode = useEditorStore((state) => state.selectNode);
  const hoverNode = useEditorStore((state) => state.hoverNode);
  const perms = usePermissions(id);
  const label = config.components[node.type]?.label || node.type;
  const locked = perms.edit === false;

  return (
    <div
      className={`tecof-field-group${depth === 0 ? ' is-section-root' : ''}${
        collapsed ? ' is-collapsed' : ''
      }`}
      style={{ '--tecof-group-depth': depth } as React.CSSProperties}
      onMouseEnter={() => hoverNode(id)}
      onMouseLeave={() => hoverNode(null)}
    >
      <div className="tecof-field-group-header">
        <button
          type="button"
          className="tecof-field-group-toggle"
          onClick={() => onToggle(id)}
          aria-expanded={!collapsed}
          title={collapsed ? 'Genişlet' : 'Daralt'}
        >
          {collapsed ? (
            <ChevronRight size={13} aria-hidden="true" />
          ) : (
            <ChevronDown size={13} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="tecof-field-group-label"
          onClick={() => selectNode(id)}
          title="Bu öğeyi seç"
        >
          <span className="tecof-field-group-name">{label}</span>
          {depth === 0 && <span className="tecof-field-group-tag">bu bölüm</span>}
          {locked && (
            <Lock size={11} className="tecof-field-group-lock" aria-label="Kilitli" />
          )}
        </button>
      </div>
      {!collapsed && (
        <div className="tecof-field-group-body">
          <NodeFieldSet nodeId={id} />
        </div>
      )}
    </div>
  );
});
SectionGroup.displayName = 'SectionGroup';

export const Inspector = () => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const updateProps = useEditorStore((state) => state.updateProps);
  const setRootProps = useEditorStore((state) => state.setRootProps);
  const selectNode = useEditorStore((state) => state.selectNode);

  const { config, readOnly } = useStudio();
  // A node with `edit: false` shows its fields but disables editing.
  const perms = usePermissions(selectedId);
  const fieldsReadOnly = readOnly || perms.edit === false;
  const [tab, setTab] = useState<'content' | 'style'>('content');
  const [rootTab, setRootTab] = useState<'page' | 'theme'>('page');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  // Stable reference so the memoized SectionGroup rows don't re-render on
  // every Inspector render.
  const toggleCollapsed = React.useCallback(
    (id: string) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    []
  );

  // Find active selected node details memoized to prevent expensive lookup on every render
  const activeNodeInfo = useMemo(() => {
    if (!selectedId) return null;
    const details = findNodeById(documentState, selectedId);
    if (!details) return null;

    const componentConfig = config.components[details.node.type];
    return {
      node: details.node,
      label: componentConfig?.label || details.node.type,
      componentConfig,
    };
  }, [selectedId, documentState, config]);

  // Every element inside the selected node (empty for leaves). When non-empty,
  // the content tab becomes the aggregate "section" view: the section's own
  // fields plus every descendant's, each in a collapsible group — so a whole
  // section can be edited from one panel. Selecting a single element narrows
  // back to just its fields.
  const descendants = useMemo(
    () => (selectedId ? getDescendants(documentState, selectedId, config) : []),
    [selectedId, documentState, config]
  );
  const isAggregate = descendants.length > 0;

  // 1. Component selected state
  if (selectedId) {
    if (!activeNodeInfo) {
      return (
        <div className="tecof-inspector">
          <div className="tecof-inspector-empty">Bileşen yükleniyor veya bulunamadı.</div>
        </div>
      );
    }

    const { node, label } = activeNodeInfo;
    const parentId = getParentId(documentState, selectedId);

    // Section view rows: the selected node (depth 0) then its whole subtree.
    const groups: { id: string; node: TecofNode; depth: number }[] = isAggregate
      ? [{ id: selectedId, node, depth: 0 }, ...descendants]
      : [];
    const allCollapsed = groups.length > 0 && groups.every((g) => collapsed.has(g.id));
    const setAllCollapsed = (collapse: boolean) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        for (const g of groups) {
          if (collapse) next.add(g.id);
          else next.delete(g.id);
        }
        return next;
      });

    return (
      <div className="tecof-inspector">
        {/* Header */}
        <div className="tecof-inspector-header">
          <div>
            <h3 className="tecof-inspector-title">{label}</h3>
            <span className="tecof-inspector-id">{selectedId}</span>
          </div>
          <div className="tecof-inspector-header-actions">
            {parentId && (
              <button
                onClick={() => selectNode(parentId)}
                className="tecof-inspector-deselect"
                title="Üst öğeyi seç"
              >
                <ChevronUp size={12} aria-hidden="true" />
                Üst Öğe
              </button>
            )}
            <button onClick={() => selectNode(null)} className="tecof-inspector-deselect">
              Seçimi Kaldır
            </button>
          </div>
        </div>

        {/* Content / Style tabs */}
        <div className="tecof-inspector-tabs" role="tablist" aria-label="Inspector görünümü">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'content'}
            className={`tecof-inspector-tab tecof-tip${tab === 'content' ? ' is-active' : ''}`}
            data-tip="Bileşenin metin, görsel ve bağlantı alanları"
            onClick={() => setTab('content')}
          >
            İçerik
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'style'}
            className={`tecof-inspector-tab tecof-tip${tab === 'style' ? ' is-active' : ''}`}
            data-tip="Boşluk, renk, yazı ve görünüm ayarları"
            onClick={() => setTab('style')}
          >
            Stil
          </button>
        </div>

        {/* Fields List / Style Editor */}
        <div className="tecof-inspector-fields">
          {fieldsReadOnly && (
            <div className="tecof-inspector-readonly-note">
              <Lock size={12} aria-hidden="true" />
              Salt okunur — bu bileşen düzenlemeye kilitli.
            </div>
          )}
          {tab === 'style' ? (
            <StyleEditor
              value={node.props[STYLES_PROP]}
              onChange={(next) => updateProps(selectedId, { [STYLES_PROP]: next })}
            />
          ) : isAggregate ? (
            <>
              <div className="tecof-aggregate-bar">
                <span className="tecof-aggregate-count">İçindeki {descendants.length} öğe</span>
                <button
                  type="button"
                  className="tecof-aggregate-toggle-all"
                  onClick={() => setAllCollapsed(!allCollapsed)}
                >
                  {allCollapsed ? 'Tümünü genişlet' : 'Tümünü daralt'}
                </button>
              </div>
              {groups.map((group) => (
                <SectionGroup
                  key={group.id}
                  id={group.id}
                  node={group.node}
                  depth={group.depth}
                  collapsed={collapsed.has(group.id)}
                  onToggle={toggleCollapsed}
                />
              ))}
            </>
          ) : (
            <NodeFieldSet nodeId={selectedId} />
          )}
        </div>
      </div>
    );
  }

  // 2. Root (Page) Settings (when selectedId is null)
  const rootFields = config.root?.fields || {};
  const rootFieldEntries = Object.entries(rootFields);

  return (
    <div className="tecof-inspector">
      {/* Header */}
      <div className="tecof-inspector-header">
        <div>
          <h3 className="tecof-inspector-title">Sayfa Ayarları</h3>
          <span className="tecof-inspector-id">Genel sayfa konfigürasyonu</span>
        </div>
      </div>

      {/* Page / Theme tabs */}
      <div className="tecof-inspector-tabs" role="tablist" aria-label="Sayfa görünümü">
        <button
          type="button"
          role="tab"
          aria-selected={rootTab === 'page'}
          className={`tecof-inspector-tab tecof-tip${rootTab === 'page' ? ' is-active' : ''}`}
          data-tip="Yalnız bu sayfaya özel ayarlar"
          onClick={() => setRootTab('page')}
        >
          Sayfa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={rootTab === 'theme'}
          className={`tecof-inspector-tab tecof-tip${rootTab === 'theme' ? ' is-active' : ''}`}
          data-tip="Tüm sitede geçerli renk ve yazı tipi ayarları"
          onClick={() => setRootTab('theme')}
        >
          Tema
        </button>
      </div>

      {/* Fields List */}
      <div className="tecof-inspector-fields">
        {rootTab === 'theme' ? (
          <ThemeEditor />
        ) : rootFieldEntries.length > 0 ? (
          rootFieldEntries.map(([fieldName, fieldDef]) => (
            <FieldRenderer
              key={fieldName}
              name={fieldName}
              definition={fieldDef}
              value={documentState.root.props[fieldName]}
              onChange={(newVal) => setRootProps({ [fieldName]: newVal })}
              readOnly={readOnly}
            />
          ))
        ) : (
          <div className="tecof-inspector-empty">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="tecof-inspector-empty-icon"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
            Bileşen seçilmedi. Düzenlemek istediğiniz bir bileşene tıklayın.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
