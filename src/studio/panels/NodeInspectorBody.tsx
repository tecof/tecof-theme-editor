import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, Lock, Component, Link2, Link2Off } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { findNodeById, getParentId, getDescendants } from '../../engine/zones';
import { findSymbolRoot, findSymbolInstanceRoots, symbolOverridesOf } from '../../engine/symbols';
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
import { StyleSyncSection } from '../style/StyleSyncSection';
import { STYLES_PROP } from '../style/types';
import { InteractionsEditor } from '../interactions/InteractionsEditor';
import { INTERACTIONS_PROP, START_HIDDEN_PROP } from '../interactions/types';

/**
 * NodeInspectorBody — seçili düğümün düzenleme gövdesi (header + İçerik/Stil/
 * Etkileşim sekmeleri + alan listesi).
 *
 * Inspector'dan çıkarıldı ki AYNI gövde iki yüzeyde render edilebilsin:
 * sağ panel (Inspector) ve bileşen düzenleme modalı (NodeSettingsModal).
 * Alan render mantığı tek yerde yaşar; iki örnek de store'a abone olduğundan
 * aynı anda mount edilseler bile senkron kalırlar (sekme state'leri bilinçli
 * olarak bağımsızdır — modal kapanınca panel sekmesi bozulmaz).
 *
 * Panel-özel varsayım taşımaz: genişlik/scroll dış sarmalayıcıdan gelir
 * (.tecof-inspector veya .tecof-node-settings-modal — ikisi de sınırlı
 * yükseklikte flex column; içteki .tecof-inspector-fields tek scroll bölgesi).
 */

/** Collapsible group wrapping a component's fields (config.fieldsGroups). */
const FieldAccordion: React.FC<{
  name: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ name, collapsed, onToggle, children }) => (
  <div className={`tecof-field-accordion${collapsed ? ' is-collapsed' : ''}`}>
    <button
      type="button"
      className="tecof-field-accordion-header"
      onClick={onToggle}
      aria-expanded={!collapsed}
    >
      {collapsed ? (
        <ChevronRight size={13} aria-hidden="true" />
      ) : (
        <ChevronDown size={13} aria-hidden="true" />
      )}
      <span className="tecof-field-accordion-name">{name}</span>
    </button>
    {!collapsed && <div className="tecof-field-accordion-body">{children}</div>}
  </div>
);

/**
 * Renders the editable content fields (plus the variant switcher) for ONE node.
 *
 * Self-contained: it resolves its OWN dynamic fields, permissions and repeat
 * scope, so it can be listed many times in the aggregate ("section") view
 * without breaking the rules of hooks. Every `onChange` targets THIS node's id,
 * so editing a descendant straight from the section panel just works.
 */
export const NodeFieldSet: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const updateProps = useEditorStore((state) => state.updateProps);
  const { config, readOnly } = useStudio();
  const perms = usePermissions(nodeId);
  const fieldsReadOnly = readOnly || perms.edit === false;

  // Subscribe to THIS node only (immer keeps untouched nodes' references
  // stable), so typing in one aggregate group never re-renders the others.
  const node = useEditorStore((state) => findNodeById(state.document, nodeId)?.node ?? null);

  // Symbol membership (primitive selectors → no extra re-renders). When this node
  // is a symbol instance, edits sync to every other instance and each field gets a
  // link/unlink toggle to pin it to this instance.
  const toggleSymbolOverride = useEditorStore((state) => state.toggleSymbolOverride);
  const symbolId = useEditorStore((state) => findSymbolRoot(state.document, nodeId)?.symbolId ?? null);
  const symbolCount = useEditorStore((state) => {
    const root = findSymbolRoot(state.document, nodeId);
    return root ? findSymbolInstanceRoots(state.document, root.symbolId).length : 0;
  });
  const overrides = symbolOverridesOf(node);

  // config.fieldsGroups accordion'ları varsayılan KAPALI gelir — kalabalık
  // bileşenlerde panel kısa başlar, kullanıcı istediği grubu açar. State
  // "açılmış" grupları tutar: boş set = hepsi kapalı (grup adlarını önceden
  // bilmeye gerek kalmaz).
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const toggleGroup = (name: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // Aynı bileşen örneği farklı bir düğüme geçebilir (key'siz kullanım) —
  // önceki düğümde açılan grup adları yenisine taşınmasın.
  useEffect(() => {
    setExpandedGroups(new Set());
  }, [nodeId]);

  // Canvas odak isteği bu node'un bir alanını hedefliyorsa, alanı içeren
  // fieldsGroups accordion'ını otomatik aç — kaydırma hedefi görünür olsun.
  const inspectorFocus = useUiStore((s) => s.inspectorFocus);
  useEffect(() => {
    if (!inspectorFocus || inspectorFocus.nodeId !== nodeId || !inspectorFocus.field) return;
    const focusField = inspectorFocus.field;
    const nodeNow = findNodeById(useEditorStore.getState().document, nodeId)?.node;
    const cfg = nodeNow ? config.components[nodeNow.type] : undefined;
    const grp = cfg?.fieldsGroups?.find((g) => (g.fields ?? []).includes(focusField));
    if (!grp) return;
    setExpandedGroups((prev) => (prev.has(grp.name) ? prev : new Set(prev).add(grp.name)));
  }, [inspectorFocus, nodeId, config]);

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

  // Field grouping (config.fieldsGroups): fields listed in a group render under a
  // collapsible header (in the given order); anything not in a group stays flat
  // after the groups. No/empty fieldsGroups → every field flat (the default).
  const fieldMap = new Map(editableFields);
  const groups = componentConfig?.fieldsGroups?.length
    ? componentConfig.fieldsGroups
        .map((g) => ({ name: g.name, fields: (g.fields ?? []).filter((fn) => fieldMap.has(fn)) }))
        .filter((g) => g.fields.length > 0)
    : null;
  const groupedNames = new Set(groups?.flatMap((g) => g.fields) ?? []);
  const leftover = groups ? editableFields.filter(([fn]) => !groupedNames.has(fn)) : [];

  const renderField = (fieldName: string) => {
    const fieldDef = fieldMap.get(fieldName);
    if (!fieldDef) return null;
    return (
      <div
        key={fieldName}
        className={`tecof-field-block${symbolId ? ' is-symbol' : ''}`}
        // Canvas→panel odak hedefi: kaydırma effect'i bu çifti querySelector'la
        // bulur ([data-tecof-node="<id>"][data-tecof-field="<alan>"]).
        data-tecof-node={nodeId}
        data-tecof-field={fieldName}
      >
        <FieldRenderer
          name={fieldName}
          definition={fieldDef}
          value={info.node.props[fieldName]}
          nodeId={nodeId}
          onChange={(newVal) => updateProps(nodeId, { [fieldName]: newVal })}
          readOnly={
            fieldsReadOnly || resolved.readOnly[fieldName] === true || fieldDef?.readOnly === true
          }
        />
        {symbolId && (
          <button
            type="button"
            className={`tecof-field-sync${overrides.includes(fieldName) ? ' is-detached' : ''}`}
            onClick={() => toggleSymbolOverride(nodeId, fieldName)}
            disabled={fieldsReadOnly}
            title={
              overrides.includes(fieldName)
                ? 'Bu alan yalnız bu örneğe özel. Symbol ile yeniden bağlamak için tıkla.'
                : 'Symbol ile bağlı — düzenlersen tüm örneklere yayılır. Yalnız bu örneğe özel yapmak için tıkla.'
            }
            aria-label={overrides.includes(fieldName) ? 'Symbol ile bağla' : 'Bu örneğe özel yap'}
          >
            {overrides.includes(fieldName) ? <Link2Off size={13} /> : <Link2 size={13} />}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {symbolId && (
        <div className="tecof-symbol-banner">
          <Component size={13} aria-hidden="true" />
          <div className="tecof-symbol-banner-text">
            <strong>Symbol örneği · {symbolCount} kullanım</strong>
            <span>
              Düzenlemeler tüm kullanımlara yayılır. Bir alanı yalnız bu örneğe özel yapmak için
              yanındaki bağlantı simgesine tıkla.
            </span>
          </div>
        </div>
      )}
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
          {groups && groups.length > 0 ? (
            <>
              {groups.map((g) => (
                <FieldAccordion
                  key={g.name}
                  name={g.name}
                  collapsed={!expandedGroups.has(g.name)}
                  onToggle={() => toggleGroup(g.name)}
                >
                  {g.fields.map(renderField)}
                </FieldAccordion>
              ))}
              {leftover.map(([fieldName]) => renderField(fieldName))}
            </>
          ) : (
            editableFields.map(([fieldName]) => renderField(fieldName))
          )}
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
 * Memoized: the parent re-renders on every document change, but a group only
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
      // Canvas→panel odak hedefi (alan işareti olmayan tıklamalar node'un
      // grubuna kaydırır).
      data-tecof-node-group={id}
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

export type InspectorTab = 'content' | 'style' | 'interactions';

export interface NodeInspectorBodyProps {
  /**
   * Panel (Inspector) kendi header'ını gövdeden alır; modal kendi başlık
   * çubuğunu (bileşen adı + kapat) çizdiği için false verir — "Seçimi Kaldır"
   * butonu modalda kafa karıştırırdı.
   */
  showHeader?: boolean;
  /**
   * Sekme/daraltma state'i DIŞARIDAN kontrol edilebilir. Inspector bunu kendi
   * (her zaman mount kalan) gövdesinde tutar ki eski davranış korunsun:
   * seçim kaldırılıp yeniden seçilince aktif sekme ve daraltılmış satırlar
   * sıfırlanmaz. Modal vermez → kendi iç state'i (her açılışta taze) kullanılır.
   */
  tab?: InspectorTab;
  onTabChange?: (tab: InspectorTab) => void;
  collapsed?: Set<string>;
  onCollapsedChange?: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const NodeInspectorBody: React.FC<NodeInspectorBodyProps> = ({
  showHeader = true,
  tab: tabProp,
  onTabChange,
  collapsed: collapsedProp,
  onCollapsedChange,
}) => {
  const documentState = useEditorStore((state) => state.document);
  const selectedId = useEditorStore((state) => state.selection.selectedId);
  const updateProps = useEditorStore((state) => state.updateProps);
  const selectNode = useEditorStore((state) => state.selectNode);

  const { config, readOnly } = useStudio();
  // A node with `edit: false` shows its fields but disables editing.
  const perms = usePermissions(selectedId);
  const fieldsReadOnly = readOnly || perms.edit === false;

  // Controlled-optional: dış prop verilmişse o, verilmemişse iç state (modal).
  const [innerTab, setInnerTab] = useState<InspectorTab>('content');
  const tab = tabProp ?? innerTab;
  const setTab = onTabChange ?? setInnerTab;
  const [innerCollapsed, setInnerCollapsed] = useState<Set<string>>(() => new Set());
  const collapsed = collapsedProp ?? innerCollapsed;
  const setCollapsed = onCollapsedChange ?? setInnerCollapsed;

  // Stable reference so the memoized SectionGroup rows don't re-render on
  // every render of this body.
  const toggleCollapsed = React.useCallback(
    (id: string) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [setCollapsed]
  );

  /* Canvas odak isteği: hedef alan bloğuna (yoksa node grubuna) kaydır + kısa
     vurgu. Accordion/array açılımları AYNI istekle başka effect'lerde state
     olarak açılır ve bir sonraki render'da DOM'a girer — bu yüzden hedef rAF
     döngüsüyle birkaç frame denenir. İstek İŞLENDİĞİNDE (bulunsun ya da
     bulunmasın) store'dan düşürülür: aksi halde bu gövde her yeniden mount
     olduğunda (modal açılışı, seçim kaldır→yeniden seç) bayat hedefe
     kendiliğinden kayıp vurgu yakardı. */
  const fieldsScrollRef = useRef<HTMLDivElement | null>(null);
  const inspectorFocus = useUiStore((s) => s.inspectorFocus);
  const consumeInspectorFocus = useUiStore((s) => s.consumeInspectorFocus);
  useEffect(() => {
    if (!inspectorFocus) return;
    const { nodeId, field, itemIndex, token } = inspectorFocus;
    let tries = 0;
    let raf = 0;
    const attempt = () => {
      const root = fieldsScrollRef.current;
      if (!root) return;
      const esc = (v: string) => v.replace(/"/g, '\\"');
      const blockSel = field
        ? `[data-tecof-node="${esc(nodeId)}"][data-tecof-field="${esc(field)}"]`
        : null;
      let target: HTMLElement | null = null;
      const block = blockSel ? root.querySelector<HTMLElement>(blockSel) : null;
      // Array satırı hedefliyse önce satırın kendisini dene (açılmış olmalı).
      // İç içe array'lerde descendant seçici DOKÜMAN SIRASINDA önce gelen İÇ
      // array'in satırını yakalayabilir — adayı, en yakın alan bloğu bu blok
      // olanla sınırla.
      if (block && itemIndex != null) {
        target =
          Array.from(
            block.querySelectorAll<HTMLElement>(`[data-tecof-array-index="${itemIndex}"]`)
          ).find((el) => el.closest('[data-tecof-field]') === block) ?? null;
      }
      if (!target) target = block;
      if (!target) {
        target = root.querySelector<HTMLElement>(`[data-tecof-node-group="${esc(nodeId)}"]`);
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Animasyonu her istekte yeniden başlat (class kalmış olabilir).
        target.classList.remove('tecof-field-flash');
        void target.offsetWidth;
        target.classList.add('tecof-field-flash');
        consumeInspectorFocus(token);
        return;
      }
      if (tries++ < 8) raf = requestAnimationFrame(attempt);
      else consumeInspectorFocus(token); // hedef yok — istek yine de tüketilir
    };
    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
  }, [inspectorFocus, consumeInspectorFocus]);

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

  // Every OTHER node on the page — target candidates for interactions (scroll to,
  // toggle a class on, show/hide). Labelled by component + a short id so repeats
  // of the same type stay distinguishable.
  const targetNodes = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    const push = (node?: TecofNode) => {
      const id = node?.props?.id;
      if (typeof id !== 'string' || !id || id === selectedId) return;
      const base = config.components[node.type]?.label || node.type;
      out.push({ id, label: `${base} · ${id.slice(-4)}` });
    };
    for (const n of documentState.content ?? []) push(n);
    for (const items of Object.values(documentState.zones ?? {})) for (const n of items) push(n);
    return out;
  }, [documentState, config, selectedId]);

  if (!selectedId) return null;

  if (!activeNodeInfo) {
    return <div className="tecof-inspector-empty">Bileşen yükleniyor veya bulunamadı.</div>;
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
    <>
      {showHeader && (
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
      )}

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
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'interactions'}
          className={`tecof-inspector-tab tecof-tip${tab === 'interactions' ? ' is-active' : ''}`}
          data-tip="Tıklama/hover ile kaydırma, sınıf açma, panel gösterme"
          onClick={() => setTab('interactions')}
        >
          Etkileşim
        </button>
      </div>

      {/* Fields List / Style Editor */}
      <div className="tecof-inspector-fields" ref={fieldsScrollRef}>
        {fieldsReadOnly && (
          <div className="tecof-inspector-readonly-note">
            <Lock size={12} aria-hidden="true" />
            Salt okunur — bu bileşen düzenlemeye kilitli.
          </div>
        )}
        {tab === 'style' ? (
          <>
            <StyleEditor
              value={node.props[STYLES_PROP]}
              onChange={(next) => updateProps(selectedId, { [STYLES_PROP]: next })}
            />
            {/* Stil sekmesinin sonu: aynı stili DİĞER SAYFALARDAKİ eşleşen
                bileşenlere taşıma (tek seferlik) ve sürekli senkron bayrağı. */}
            <StyleSyncSection nodeId={selectedId} />
          </>
        ) : tab === 'interactions' ? (
          <InteractionsEditor
            interactions={node.props[INTERACTIONS_PROP]}
            startHidden={node.props[START_HIDDEN_PROP]}
            nodes={targetNodes}
            readOnly={fieldsReadOnly}
            onChange={(next) => updateProps(selectedId, { [INTERACTIONS_PROP]: next })}
            onStartHiddenChange={(next) => updateProps(selectedId, { [START_HIDDEN_PROP]: next })}
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
    </>
  );
};

export default NodeInspectorBody;
