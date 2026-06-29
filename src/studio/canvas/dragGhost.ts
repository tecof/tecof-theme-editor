import type React from 'react';

/**
 * Creates a styled floating preview element and registers it as the native
 * drag image, giving DnD a premium "ghost" instead of the browser default.
 *
 * The element is created in the SAME document the drag originates from
 * (host panel OR the canvas iframe) via `ownerDocument`, so cross-iframe
 * drags render their ghost correctly.
 */
export function setDragGhost(e: React.DragEvent, label: string) {
  const ownerDoc = (e.currentTarget as HTMLElement)?.ownerDocument || (typeof document !== 'undefined' ? document : null);
  if (!ownerDoc) return;

  const ghost = ownerDoc.createElement('div');
  ghost.className = 'tecof-drag-ghost';
  ghost.textContent = label;
  ownerDoc.body.appendChild(ghost);

  try {
    e.dataTransfer.setDragImage(ghost, 14, 14);
  } catch {
    // setDragImage may be unsupported in some environments — ignore gracefully.
  }

  // Remove once the browser has snapshotted the image (after two frames).
  const win = ownerDoc.defaultView || window;
  win.requestAnimationFrame(() => {
    win.requestAnimationFrame(() => ghost.remove());
  });
}
