import { useCallback } from 'react';
import { useEditorStore } from '../../engine/store';
import type { TecofNode } from '../../types';
import { isInsideOverlayPortal } from './overlayPortal';

/**
 * Robust double-click inline text editing for a single node.
 *
 * Returns an `onDoubleClick` handler to spread onto the node wrapper. When the
 * user double-clicks an editable element we make it `contentEditable`, select
 * its contents, and commit the edited text back into the node's props via
 * `updateProps`. Enter commits, Shift+Enter inserts a newline, Escape cancels,
 * and blur commits — mirroring the original NodeRenderer behaviour exactly.
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
 */

const VALID_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'div'];

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
      const matchedItem = value.find(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof item.value === 'string' &&
          item.value.trim() === text
      );
      if (matchedItem) {
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
 * Hook providing the inline-edit double-click handler for a node.
 *
 * @param node    The node being rendered.
 * @param locked  When true (read-only / preview) editing is disabled.
 * @returns `{ onDoubleClick }` to spread on the node wrapper element.
 */
export const useInlineEdit = (node: TecofNode, locked: boolean) => {
  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
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

      const tag = editTarget.tagName.toLowerCase();
      if (!VALID_TAGS.includes(tag)) return;

      const text = editTarget.textContent?.trim() || '';
      if (!text) return;

      const ownerDoc = editTarget.ownerDocument;
      const ownerWin = ownerDoc.defaultView;
      const defaultLang = ownerDoc.documentElement.lang || 'tr';

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

      const commitInlineEdit = () => {
        editTarget.contentEditable = 'false';
        editTarget.removeAttribute('data-tecof-inline-editing');
        editTarget.removeEventListener('blur', handleBlur);
        editTarget.removeEventListener('keydown', handleKeyDown);

        const newText = editTarget.textContent?.trim() || '';

        if (isMultilingual) {
          const currentArray = Array.isArray(node.props[propName]) ? node.props[propName] : [];
          const updatedArray = currentArray.map((item: any) => {
            if (item && item.code === langCode) {
              return { ...item, value: newText };
            }
            return item;
          });

          if (!updatedArray.some((item: any) => item && item.code === langCode)) {
            updatedArray.push({ code: langCode, value: newText });
          }

          useEditorStore.getState().updateProps(node.props.id, {
            [propName]: updatedArray,
          });
        } else {
          useEditorStore.getState().updateProps(node.props.id, {
            [propName]: newText,
          });
        }
      };

      const cancelInlineEdit = () => {
        editTarget.textContent = originalText;
        editTarget.contentEditable = 'false';
        editTarget.removeAttribute('data-tecof-inline-editing');
        editTarget.removeEventListener('blur', handleBlur);
        editTarget.removeEventListener('keydown', handleKeyDown);
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

      editTarget.addEventListener('blur', handleBlur);
      editTarget.addEventListener('keydown', handleKeyDown);
    },
    [node, locked]
  );

  return { onDoubleClick };
};
