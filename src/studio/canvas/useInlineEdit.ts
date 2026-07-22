import React, { useCallback } from 'react';
import { useEditorStore } from '../../engine/store';
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

interface MatchResult {
  propName: string;
  isMultilingual: boolean;
  langCode: string;
}

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
      const marked = target.closest('[data-tecof-prop]') as HTMLElement | null;

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

      const { propName, isMultilingual, langCode } = match;
      const originalText = editTarget.textContent || '';

      editTarget.contentEditable = 'true';
      editTarget.setAttribute('data-tecof-inline-editing', 'true');
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
        editTarget.removeEventListener('blur', handleBlur);
        editTarget.removeEventListener('keydown', handleKeyDown);
        ownerDoc.removeEventListener('mousedown', handleOutsideMouseDown, true);
        document.removeEventListener('mousedown', handleOutsideMouseDown, true);
        ownerWin?.removeEventListener('blur', handleWindowBlur);
        ownerWin?.getSelection()?.removeAllRanges();
      };

      const commitInlineEdit = () => {
        teardown();

        const newText = editTarget.textContent?.trim() || '';

        // Commit against the CURRENT props from the store — the document may
        // have changed since double-click (undo, another field edit), and the
        // render-time `node` closure would clobber those changes.
        const store = useEditorStore.getState();
        const currentProps =
          findNodeById(store.document, node.props.id)?.node.props ?? node.props;

        if (isMultilingual) {
          const currentArray = Array.isArray(currentProps[propName])
            ? (currentProps[propName] as LocalizedEntry[])
            : [];
          const updatedArray = currentArray.map((item) => {
            if (item && item.code === langCode) {
              return { ...item, value: newText };
            }
            return item;
          });

          if (!updatedArray.some((item) => item && item.code === langCode)) {
            updatedArray.push({ code: langCode, value: newText });
          }

          store.updateProps(node.props.id, { [propName]: updatedArray });
        } else {
          store.updateProps(node.props.id, { [propName]: newText });
        }
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
