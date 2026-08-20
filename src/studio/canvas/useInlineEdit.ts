import React, { useCallback } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { findNodeById } from '../../engine/zones';
import { useActiveLanguage } from '../language/LanguageContext';
import type { TecofNode } from '../../types';
import { isInsideOverlayPortal } from './overlayPortal';

/**
 * Robust double-click inline text editing for a single node.
 *
 * Returns an `onDoubleClick` handler to spread onto the node wrapper. When the
 * user double-clicks an editable element we make it `contentEditable`, select
 * its contents, and commit the edited text back into the node's props via
 * `updateProps`. Enter commits, Shift+Enter inserts a newline, Escape cancels.
 * Clicking anywhere outside the editable — including parent-document UI
 * (panels, TopBar, overlays) — or moving focus out of the canvas iframe also
 * commits, so Enter is never *required* to save.
 *
 * Prop matching (which prop the edited text belongs to) is resolved in two ways:
 *
 *   1. PREFERRED — explicit DOM markers. A component author can render editable
 *      text with `data-tecof-prop="propName"` (and optionally
 *      `data-tecof-lang="tr"` to target a specific translation entry in a
 *      multilingual array prop). We read these from the target or its nearest
 *      ancestor (within the node wrapper) via `closest('[data-tecof-prop]')`.
 *      This is unambiguous even when two props share the same text.
 *
 *   2. FALLBACK — string matching. When no `data-tecof-prop` marker is present
 *      we fall back to the original heuristic: compare the element's trimmed
 *      textContent against string props and translation-array values. Kept for
 *      backward compatibility with components that don't mark their text.
 *
 * Language resolution order for multilingual props: the explicit
 * `data-tecof-lang` marker → the studio's app-wide active editing language
 * (TopBar switcher) → the iframe document's `lang` → `'tr'`.
 */

const VALID_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'div'];

/** One entry of a multilingual prop array: `{ code: 'tr', value: '...' }`. */
interface LocalizedEntry {
  code?: string;
  value?: unknown;
}

export interface MatchResult {
  propName: string;
  isMultilingual: boolean;
  langCode: string;
  /**
   * Repeater/array satırı hedefleniyorsa dolu: `data-tecof-item="<field>:<index>"`
   * işaretli kart içindeki `data-tecof-item-prop="<alan>"` metinleri. Bu durumda
   * `propName` SATIR-İÇİ alan adıdır (`title`), commit `props[itemField][itemIndex]`
   * satırına immutably yazılır. (Bilinçli olarak `data-tecof-prop`'tan AYRI attr:
   * eski paket sürümleri `data-tecof-prop`'u top-level prop sanıp temaya çöp
   * `"title"` prop'u yazardı — yeni attr'ı eski sürüm hiç görmez.)
   */
  itemField?: string;
  itemIndex?: number;
}

/** `data-tecof-item="<field>:<index>"` değerini çözer; bozuk değerde null.
 *  canvasInteractions de AYNI parser'ı kullanır — sözleşme tek yerde yaşar. */
export const parseItemAttr = (raw: string | null): { field: string; index: number } | null => {
  if (!raw) return null;
  const sep = raw.lastIndexOf(':');
  if (sep <= 0) return null;
  const field = raw.slice(0, sep);
  // Katı sayı kontrolü ŞART: Number('') === 0 ve Number(' ') === 0 olduğu için
  // "services:" gibi bozuk bir işaret sessizce 0. SATIRI hedefler ve kullanıcının
  // metni yanlış satıra yazılırdı.
  const rawIndex = raw.slice(sep + 1);
  if (!/^\d+$/.test(rawIndex)) return null;
  const index = Number(rawIndex);
  if (!field || !Number.isSafeInteger(index)) return null;
  return { field, index };
};

/**
 * Bir çok dilli değere ({code,value}[] ya da boş) langCode girdisini immutably
 * yazar — hem top-level hem satır-içi commit'ler aynı merge'ü kullanır.
 */
const mergeLocalizedValue = (current: unknown, langCode: string, newText: string): LocalizedEntry[] => {
  const arr = Array.isArray(current) ? (current as LocalizedEntry[]) : [];
  const updated = arr.map((item) => (item && item.code === langCode ? { ...item, value: newText } : item));
  if (!updated.some((item) => item && item.code === langCode)) {
    updated.push({ code: langCode, value: newText });
  }
  return updated;
};

/**
 * Commit'in SAF çekirdeği: güncel props + eşleşme + yeni metinden `updateProps`
 * patch'ini üretir. Satır hedefli eşleşmede satır artık yoksa (inspector'dan
 * silinmiş/taşınmış) `null` döner — yanlış satıra yazmaktansa vazgeçilir.
 * Ayrı fonksiyon: DOM'suz unit test edilebilir.
 */
export const computeInlineCommitPatch = (
  currentProps: Record<string, unknown>,
  match: MatchResult,
  newText: string
): Record<string, unknown> | null => {
  const { propName, isMultilingual, langCode, itemField, itemIndex } = match;

  if (itemField != null && itemIndex != null) {
    const rows = currentProps[itemField];
    if (!Array.isArray(rows)) return null;
    const row = rows[itemIndex];
    if (!row || typeof row !== 'object') return null;
    const rowRecord = row as Record<string, unknown>;
    const nextValue = isMultilingual
      ? mergeLocalizedValue(rowRecord[propName], langCode, newText)
      : newText;
    const nextRows = [...rows];
    nextRows[itemIndex] = { ...rowRecord, [propName]: nextValue };
    return { [itemField]: nextRows };
  }

  if (isMultilingual) {
    return { [propName]: mergeLocalizedValue(currentProps[propName], langCode, newText) };
  }
  return { [propName]: newText };
};

/**
 * Resolves which prop (and translation entry) an edited element maps to.
 * Returns null when nothing matches and the edit should be ignored.
 */
const resolveMatch = (
  target: HTMLElement,
  wrapper: HTMLElement | null,
  node: TecofNode,
  text: string,
  defaultLang: string
): MatchResult | null => {
  // 0) EN öncelikli: repeater/array satırı işareti. `data-tecof-item-prop`
  //    marker'ı, `data-tecof-item="<field>:<index>"` taşıyan bir kartın içinde
  //    olmalı; her ikisi de BU node'un wrapper'ında kalmalı (iç içe node
  //    guard'ı, aşağıdaki data-tecof-prop guard'ıyla aynı gerekçe).
  const itemMarked = target.closest('[data-tecof-item-prop]') as HTMLElement | null;
  if (itemMarked && (!wrapper || wrapper.contains(itemMarked))) {
    const itemEl = itemMarked.closest('[data-tecof-item]') as HTMLElement | null;
    const spec = itemEl && (!wrapper || wrapper.contains(itemEl))
      ? parseItemAttr(itemEl.getAttribute('data-tecof-item'))
      : null;
    const propName = itemMarked.getAttribute('data-tecof-item-prop');
    if (spec && propName) {
      const rows = node.props[spec.field];
      const row = Array.isArray(rows) ? rows[spec.index] : undefined;
      // Satır yoksa eşleşme sayılmaz (bayat index / yanlış node) — edit başlamaz.
      if (row && typeof row === 'object') {
        const lang = itemMarked.getAttribute('data-tecof-lang');
        return {
          propName,
          isMultilingual: Array.isArray((row as Record<string, unknown>)[propName]),
          langCode: lang || defaultLang,
          itemField: spec.field,
          itemIndex: spec.index,
        };
      }
    }
  }

  // 1) Preferred: explicit data attributes on the target or a nearby ancestor.
  const marked = target.closest('[data-tecof-prop]') as HTMLElement | null;
  // Guard against matching a marker that belongs to a DIFFERENT node wrapper
  // (e.g. nested node). Only honour markers inside this node's wrapper.
  if (marked && (!wrapper || wrapper.contains(marked))) {
    const propName = marked.getAttribute('data-tecof-prop');
    if (propName) {
      const lang = marked.getAttribute('data-tecof-lang');
      const isMultilingual = Array.isArray(node.props[propName]);
      return {
        propName,
        isMultilingual,
        langCode: lang || defaultLang,
      };
    }
  }

  // 2) Fallback: string-match the text against props (legacy heuristic).
  for (const [key, value] of Object.entries(node.props)) {
    if (typeof value === 'string' && value.trim() === text) {
      return { propName: key, isMultilingual: false, langCode: defaultLang };
    }
    if (Array.isArray(value)) {
      const matchedItem = (value as LocalizedEntry[]).find(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof item.value === 'string' &&
          item.value.trim() === text
      );
      if (matchedItem && typeof matchedItem.code === 'string') {
        return {
          propName: key,
          isMultilingual: true,
          langCode: matchedItem.code,
        };
      }
    }
  }

  return null;
};

/**
 * Runs double-click inline text editing for a node, given the raw event.
 * Node-agnostic entry point: resolves the editable element + prop from the DOM
 * (`data-tecof-prop` / text match), makes it contentEditable, and commits back
 * via the store. Used by the delegated canvas edit listener (canvasEdit) — and,
 * as a thin wrapper, the legacy per-node hook below.
 */
export function runInlineEditFromEvent(
  e: React.MouseEvent | MouseEvent,
  node: TecofNode,
  activeLanguage: string | null,
  locked: boolean
): void {
      if (locked) return;
      // Overlay portals keep their own interaction in edit mode; never start
      // inline editing from inside one.
      if (isInsideOverlayPortal(e.target)) return;
      const target = e.target as HTMLElement;
      const wrapper = target.closest('[data-tecof-id]') as HTMLElement | null;
      // İki marker türü de düzenleme hedefi olabilir; closest kombine seçicide
      // EN YAKIN olanı döndürür (satır-içi işaret dıştaki data-tecof-prop'u ezmez).
      const marked = target.closest('[data-tecof-item-prop],[data-tecof-prop]') as HTMLElement | null;

      // Resolve the actual editable target: prefer the element explicitly marked
      // with data-tecof-prop (within this node wrapper) to keep whole block editable,
      // falling back to the clicked target itself.
      const editTarget = (marked && (!wrapper || wrapper.contains(marked))) ? marked : target;

      // Already mid-edit (second double-click) — the listeners are live; a
      // re-entry would stack duplicate blur/keydown handlers.
      if (editTarget.getAttribute('data-tecof-inline-editing') === 'true') return;

      const tag = editTarget.tagName.toLowerCase();
      if (!VALID_TAGS.includes(tag)) return;

      const text = editTarget.textContent?.trim() || '';
      if (!text) return;

      const ownerDoc = editTarget.ownerDocument;
      const ownerWin = ownerDoc.defaultView;
      const defaultLang = activeLanguage || ownerDoc.documentElement.lang || 'tr';

      const match = resolveMatch(editTarget, wrapper, node, text, defaultLang);
      if (!match) return;

      e.stopPropagation();

      const originalText = editTarget.textContent || '';

      editTarget.contentEditable = 'true';
      editTarget.setAttribute('data-tecof-inline-editing', 'true');
      // Overlay chrome'u (outline + toolbar + durum çubuğu) yazım boyunca
      // gizlensin diye düzenlemeyi uiStore'a bildir — teardown temizler.
      useUiStore.getState().setInlineEditingNodeId(node.props.id);
      editTarget.focus();

      // Range select the whole contents.
      const range = ownerDoc.createRange();
      range.selectNodeContents(editTarget);
      const sel = ownerWin?.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const teardown = () => {
        editTarget.contentEditable = 'false';
        editTarget.removeAttribute('data-tecof-inline-editing');
        useUiStore.getState().setInlineEditingNodeId(null);
        editTarget.removeEventListener('blur', handleBlur);
        editTarget.removeEventListener('keydown', handleKeyDown);
        ownerDoc.removeEventListener('mousedown', handleOutsideMouseDown, true);
        document.removeEventListener('mousedown', handleOutsideMouseDown, true);
        ownerWin?.removeEventListener('blur', handleWindowBlur);
        ownerWin?.getSelection()?.removeAllRanges();
      };

      const commitInlineEdit = () => {
        teardown();

        // Element DOM'dan söküldüyse (host `reloadDocument`, MCP/AI kaynaklı
        // doküman değişimi) yazılan metin ARTIK geçerli bir hedefe ait değildir:
        // commit sessizce iptal edilir — teardown bayrağı zaten temizledi.
        if (!editTarget.isConnected) return;

        const newText = editTarget.textContent?.trim() || '';

        // Commit against the CURRENT props from the store — the document may
        // have changed since double-click (undo, another field edit), and the
        // render-time `node` closure would clobber those changes. Patch üretimi
        // saf çekirdekte (computeInlineCommitPatch); satır hedefli edit'te satır
        // bu arada silindiyse patch null döner ve commit sessizce atlanır.
        const store = useEditorStore.getState();
        const currentProps =
          findNodeById(store.document, node.props.id)?.node.props ?? node.props;

        const patch = computeInlineCommitPatch(currentProps, match, newText);
        if (patch) store.updateProps(node.props.id, patch);
      };

      const cancelInlineEdit = () => {
        // Sıra önemli: teardown blur handler'ını söker, textContent geri alınır.
        teardown();
        editTarget.textContent = originalText;
      };

      const handleBlur = () => {
        commitInlineEdit();
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelInlineEdit();
          return;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          editTarget.blur();
        }
      };

      // Blur alone is not a reliable commit signal: the editable lives inside
      // the canvas iframe, and parent-document UI (panels, TopBar, overlays)
      // can take the pointer without ever blurring it — the edit would then be
      // silently lost on the next re-render. So also commit on any pointer-down
      // outside the editable (both documents, capture phase so an overlay's
      // preventDefault() can't swallow it) and when the iframe window itself
      // loses focus.
      const handleOutsideMouseDown = (ev: MouseEvent) => {
        const clicked = ev.target as Node | null;
        if (clicked && editTarget.contains(clicked)) return;
        commitInlineEdit();
      };
      const handleWindowBlur = () => {
        commitInlineEdit();
      };

      editTarget.addEventListener('blur', handleBlur);
      editTarget.addEventListener('keydown', handleKeyDown);
      ownerDoc.addEventListener('mousedown', handleOutsideMouseDown, true);
      document.addEventListener('mousedown', handleOutsideMouseDown, true);
      ownerWin?.addEventListener('blur', handleWindowBlur);
}

/** Legacy per-node hook — thin wrapper over {@link runInlineEditFromEvent}. */
export const useInlineEdit = (node: TecofNode, locked: boolean) => {
  // Studio'nun global "düzenlenen dil" seçimi (TopBar); provider dışında null.
  const activeLanguage = useActiveLanguage()?.activeLanguage ?? null;
  const onDoubleClick = useCallback(
    (e: React.MouseEvent | MouseEvent) => runInlineEditFromEvent(e, node, activeLanguage, locked),
    [node, locked, activeLanguage]
  );
  return { onDoubleClick };
};
