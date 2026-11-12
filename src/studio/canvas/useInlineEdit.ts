import React, { useCallback } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { findNodeById } from '../../engine/zones';
import { useActiveLanguage } from '../language/LanguageContext';
import { useStudioOptional } from '../context';
import type { StudioConfig, TecofNode } from '../../types';
import { isInsideOverlayPortal } from './overlayPortal';
import { postToHost } from '../bridge';
import { registerPendingEdit } from '../pendingEdits';
import {
  findInlineFieldDef,
  preservesLineBreaks,
  readMatchedValue,
  resolveInlineEditBehavior,
  serializePlainText,
  snapshotSubtree,
  type DomLikeNode,
  type InlineEditBehavior,
  type LocalizedEntry,
  type MatchResult,
  type RestorableNode,
} from './inlineEditModel';

export type { MatchResult } from './inlineEditModel';

/**
 * Robust double-click inline text editing for a single node.
 *
 * Returns an `onDoubleClick` handler to spread onto the node wrapper. When the
 * user double-clicks an editable element we make it `contentEditable`, select
 * its contents, and commit the edited text back into the node's props via
 * `updateProps` — ONE commit (= one undo step) per editing session.
 *
 * Enter rule (see `resolveInlineEditBehavior`):
 *   - Multi-line content — rich text (`createEditorField`, HTML values) and
 *     plain multi-line text (`type: 'textarea'`,
 *     `createLanguageField({ isTextarea: true })`): Enter inserts a new line
 *     (a new paragraph inside a rich-text container, a line break elsewhere).
 *   - Single-line content (headings, buttons, labels, text inputs): Enter
 *     commits. Shift+Enter adds a line break only where the element can show
 *     one (`white-space: pre-line` & co.); otherwise it does nothing — it used
 *     to insert a `<br>` that was silently dropped on save.
 *   - ⌘/Ctrl+Enter always commits, Escape cancels.
 *
 * Enter is never REQUIRED to save: clicking/tapping anywhere outside the
 * editable (canvas or editor chrome), focus leaving the element or the canvas
 * iframe, a selection change, or the edited node changing underneath all
 * commit. Paths that read or replace the document (save/publish, undo/redo,
 * refetch, tab close, canvas unmount) flush the pending draft first through
 * `flushPendingEdits()`. The first keystroke posts `puck:changed`, so the host
 * knows about the unsaved draft before it is committed.
 *
 * On finish the edited DOM is restored to what React last rendered and only
 * then is the store updated, so React renders the new value itself and the
 * canvas never keeps showing (and later re-commits) stale text.
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
 *
 * `config` (optional) lets the editor look up the prop's field definition to
 * pick the single-line / multi-line / rich-text behaviour; without it the
 * behaviour is derived from the stored value alone.
 */
export function runInlineEditFromEvent(
  e: React.MouseEvent | MouseEvent,
  node: TecofNode,
  activeLanguage: string | null,
  locked: boolean,
  config?: StudioConfig | null
): void {
      if (locked) return;
      // Overlay portals keep their own interaction in edit mode; never start
      // inline editing from inside one.
      if (isInsideOverlayPortal(e.target)) return;
      const target = e.target as HTMLElement;
      // Repeat GHOST'ları salt-görsel kopyadır: içlerindeki data-tecof-prop
      // işaretleri ŞABLONUN prop'larına aittir; ghost'ta düzenlemeye izin
      // vermek 2..n satırının metnini şablona/yanlış hedefe yazardı.
      if (target.closest('.tecof-repeat-ghost')) return;
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
      const defaultLang = activeLanguage || ownerDoc.documentElement.lang || 'tr';

      const match = resolveMatch(editTarget, wrapper, node, text, defaultLang);
      if (!match) return;

      // Tek satır / çok satır / zengin metin kararı alan tanımından (yoksa
      // değerden). null = bu metin kanvasta düzenlenmez (bağlama token'ı ya da
      // HTML değerin düz metin yansıması) — Inspector'daki alan kullanılır.
      const behavior = resolveInlineEditBehavior({
        fieldDef: findInlineFieldDef(config, node.type, match),
        value: readMatchedValue(node.props, match),
        hasElementChildren: editTarget.children.length > 0,
      });
      if (!behavior) return;

      e.stopPropagation();
      startInlineSession(editTarget, node.props.id, match, behavior, tag);
}

/** Bir inline düzenleme oturumunu kurar; bitişi (commit/iptal) tek noktadan yönetir. */
function startInlineSession(
  editTarget: HTMLElement,
  nodeId: string,
  match: MatchResult,
  behavior: InlineEditBehavior,
  tag: string
): void {
      const ownerDoc = editTarget.ownerDocument;
      const ownerWin = ownerDoc.defaultView;

      // Çok satırlı zengin metin KABINDA (div) Enter tarayıcının kendi yeni
      // paragrafını açar; diğer çok satırlı hedeflerde satır sonu eklenir.
      const paragraphs = behavior.html && behavior.multiline && tag === 'div';
      // Tek satırlıda Shift+Enter yalnız satır sonu kaydedildikten sonra da
      // GÖRÜNECEKSE eklenir (HTML'de <br>, düz metinde white-space: pre-line).
      let lineBreaksVisible = behavior.html;
      if (!lineBreaksVisible && !behavior.multiline) {
        try {
          lineBreaksVisible = preservesLineBreaks(ownerWin?.getComputedStyle(editTarget));
        } catch {
          lineBreaksVisible = false;
        }
      }

      const serialize = (): string =>
        behavior.html
          ? editTarget.innerHTML.trim()
          : serializePlainText(editTarget as unknown as DomLikeNode);

      // DOM'un React'in son render ettiği hâli: oturum biterken (kaydet de iptal
      // de) önce buna dönülür, sonra store güncellenir → React yeni değeri
      // kendisi basar; kanvas ile veri bir daha ayrışmaz.
      const restoreDom = snapshotSubtree(editTarget as unknown as RestorableNode);
      const originalValue = serialize();
      const originalEditable = editTarget.getAttribute('contenteditable');

      // Sürüklenebilir (draggable) bir kök/ata içinde fareyle metin seçmek
      // tarayıcıda düğüm SÜRÜKLEMEYE dönüşür (yanlışlıkla taşıma yazılanı da
      // söker). Oturum boyunca kapatılır, teardown geri açar.
      const draggables: HTMLElement[] = [];
      for (let el: HTMLElement | null = editTarget; el && el !== ownerDoc.body; el = el.parentElement) {
        if (el.getAttribute('draggable') === 'true') {
          draggables.push(el);
          el.setAttribute('draggable', 'false');
        }
      }

      editTarget.contentEditable = 'true';
      editTarget.setAttribute('data-tecof-inline-editing', 'true');
      // Overlay chrome'u (outline + toolbar + durum çubuğu) yazım boyunca
      // gizlensin diye düzenlemeyi uiStore'a bildir — teardown temizler.
      useUiStore.getState().setInlineEditingNodeId(nodeId);
      if (paragraphs) {
        // Enter'ın açtığı blok <div> değil <p> olsun (TipTap/yayın ile aynı yapı).
        try {
          ownerDoc.execCommand('defaultParagraphSeparator', false, 'p');
        } catch {
          /* desteklenmiyor — tarayıcı varsayılanı kalır */
        }
      }
      editTarget.focus();

      // Range select the whole contents.
      const range = ownerDoc.createRange();
      range.selectNodeContents(editTarget);
      const sel = ownerWin?.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      let finished = false;
      let announced = false;
      // Atamaları aşağıda (dinleyiciler bağlanırken); teardown yalnız oturum
      // kurulduktan SONRA çağrılabildiği için ikisi de o anda doludur.
      let unregisterPending: () => void = () => {};
      let unsubscribeStore: () => void = () => {};

      const teardown = () => {
        unregisterPending();
        unsubscribeStore();
        editTarget.removeEventListener('blur', handleBlur);
        editTarget.removeEventListener('keydown', handleKeyDown);
        editTarget.removeEventListener('input', handleInput);
        editTarget.removeEventListener('paste', handlePaste);
        for (const d of [ownerDoc, document]) {
          d.removeEventListener('pointerdown', handleOutsidePointer, true);
          d.removeEventListener('mousedown', handleOutsidePointer, true);
        }
        ownerWin?.removeEventListener('blur', handleWindowBlur);
        // Eski kod `contentEditable = 'false'` bırakıyordu (kalıcı nitelik);
        // orijinal hâl geri yüklenir.
        if (originalEditable == null) editTarget.removeAttribute('contenteditable');
        else editTarget.setAttribute('contenteditable', originalEditable);
        editTarget.removeAttribute('data-tecof-inline-editing');
        for (const el of draggables) el.setAttribute('draggable', 'true');
        useUiStore.getState().setInlineEditingNodeId(null);
        if (ownerDoc.activeElement === editTarget) editTarget.blur();
        ownerWin?.getSelection()?.removeAllRanges();
      };

      /**
       * Oturumun TEK çıkışı. `commit=false` (Esc) taslağı atar. Taslak DOM'dan
       * teardown/restore'dan ÖNCE okunur. Element bu arada DOM'dan sökülmüş
       * olsa bile metin yazılır: belgeyi değiştiren bilinen yollar (refetch,
       * geri al, kaydet) önce flush eder; başka bir yeniden mount (görünüm
       * değişimi, taşıma) kullanıcının yazdığını sessizce yutmamalı.
       */
      const finish = (commit: boolean) => {
        if (finished) return;
        finished = true;
        const nextValue = serialize();
        teardown();
        restoreDom();
        if (!commit || nextValue === originalValue) return;

        // Commit against the CURRENT props from the store — the document may
        // have changed since double-click (undo, another field edit), and the
        // render-time `node` closure would clobber those changes. Patch üretimi
        // saf çekirdekte (computeInlineCommitPatch); satır hedefli edit'te satır
        // bu arada silindiyse patch null döner ve commit sessizce atlanır.
        const store = useEditorStore.getState();
        const currentProps = findNodeById(store.document, nodeId)?.node.props;
        if (!currentProps) return; // node silinmiş — yazılacak yer yok
        const patch = computeInlineCommitPatch(currentProps, match, nextValue);
        if (patch) store.updateProps(nodeId, patch);
      };

      const insertLineBreak = () => {
        try {
          if (ownerDoc.execCommand('insertLineBreak')) return;
        } catch {
          /* aşağıdaki elle ekleme */
        }
        const selection = ownerWin?.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const r = selection.getRangeAt(0);
        r.deleteContents();
        const br = ownerDoc.createElement('br');
        r.insertNode(br);
        r.setStartAfter(br);
        r.collapse(true);
        selection.removeAllRanges();
        selection.addRange(r);
      };

      const handleBlur = () => {
        finish(true);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          // Frame'in tuş yönlendiricisi Esc'i stüdyoya iletip seçimi bir üst
          // öğeye taşımasın: Esc yalnız düzenlemeyi iptal eder.
          event.stopPropagation();
          finish(false);
          return;
        }

        if (event.key === 'Enter') {
          if (event.isComposing) return; // IME onayı — tarayıcıya bırak
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            finish(true);
            return;
          }
          if (behavior.multiline) {
            if (paragraphs) return; // tarayıcı: Enter yeni <p>, Shift+Enter <br>
            event.preventDefault();
            insertLineBreak();
            return;
          }
          if (event.shiftKey) {
            event.preventDefault();
            if (lineBreaksVisible) insertLineBreak();
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          finish(true);
          return;
        }

        // Düz metinde ⌘B/I/U DOM'a <b>/<i>/<u> sokar ama kayda geçmez (değer düz
        // metin) — kaydedince biçim "geri alınmış" görünürdü.
        if (!behavior.html && (event.metaKey || event.ctrlKey) && !event.altKey && typeof event.key === 'string') {
          const key = event.key.toLowerCase();
          if (key === 'b' || key === 'i' || key === 'u') event.preventDefault();
        }
      };

      const handleInput = () => {
        if (announced) return;
        announced = true;
        // Taslak henüz store'da değil; host'un "kaydedilmemiş değişiklik" durumu
        // (yayından önce kaydet, ayrılma uyarısı, puck:refetch ertelemesi) ilk
        // tuşta bilsin. Gömülü değilken no-op.
        postToHost('puck:changed');
      };

      const handlePaste = (ev: ClipboardEvent) => {
        const data = ev.clipboardData?.getData('text/plain');
        if (data == null) return;
        // Dış kaynağın biçimli HTML'i (stil, sınıf, görsel) kanvasa ve veriye
        // girmesin: her zaman düz metin yapıştırılır; tek satırlıda satır sonları
        // boşluğa döner.
        ev.preventDefault();
        const textToInsert = behavior.multiline ? data : data.replace(/\s*\r?\n\s*/g, ' ');
        try {
          ownerDoc.execCommand('insertText', false, textToInsert);
        } catch {
          /* desteklenmiyor */
        }
      };

      // Blur alone is not a reliable commit signal: the editable lives inside
      // the canvas iframe, and parent-document UI (panels, TopBar, overlays)
      // can take the pointer without ever blurring it — the edit would then be
      // silently lost on the next re-render. So also commit on any pointer-down
      // outside the editable (both documents, capture phase so an overlay's
      // preventDefault() can't swallow it; `pointerdown` too, because a
      // prevented pointerdown suppresses the compat `mousedown`) and when the
      // iframe window itself loses focus.
      const handleOutsidePointer = (ev: Event) => {
        const clicked = ev.target as Node | null;
        if (clicked && editTarget.contains(clicked)) return;
        finish(true);
      };
      const handleWindowBlur = () => {
        finish(true);
      };

      // Kaydet/yayınla/geri al/refetch/beforeunload/unmount önce flush eder.
      unregisterPending = registerPendingEdit(() => finish(true));
      // Seçim başka yere geçerse (host vurgusu, programatik seçim) ya da
      // düzenlenen node'un props'u DIŞARIDAN değişirse (geri al, AI, senkron)
      // React yeniden render etmeden ÖNCE taslak yazılıp oturum kapanır.
      unsubscribeStore = useEditorStore.subscribe((state, prev) => {
        if (state.selection.selectedId !== prev.selection.selectedId) {
          finish(true);
          return;
        }
        if (state.document !== prev.document) {
          const before = findNodeById(prev.document, nodeId)?.node.props;
          const after = findNodeById(state.document, nodeId)?.node.props;
          if (before !== after) finish(true);
        }
      });

      editTarget.addEventListener('blur', handleBlur);
      editTarget.addEventListener('keydown', handleKeyDown);
      editTarget.addEventListener('input', handleInput);
      editTarget.addEventListener('paste', handlePaste);
      for (const d of [ownerDoc, document]) {
        d.addEventListener('pointerdown', handleOutsidePointer, true);
        d.addEventListener('mousedown', handleOutsidePointer, true);
      }
      ownerWin?.addEventListener('blur', handleWindowBlur);
}

/** Legacy per-node hook — thin wrapper over {@link runInlineEditFromEvent}. */
export const useInlineEdit = (node: TecofNode, locked: boolean) => {
  // Studio'nun global "düzenlenen dil" seçimi (TopBar); provider dışında null.
  const activeLanguage = useActiveLanguage()?.activeLanguage ?? null;
  const config = useStudioOptional()?.config ?? null;
  const onDoubleClick = useCallback(
    (e: React.MouseEvent | MouseEvent) =>
      runInlineEditFromEvent(e, node, activeLanguage, locked, config),
    [node, locked, activeLanguage, config]
  );
  return { onDoubleClick };
};
