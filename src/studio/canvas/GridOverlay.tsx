import React from 'react';

export interface GridOverlayProps {
  columns: number;
  /** Gap between columns, px. */
  gap: number;
  /** Container max width the columns align to, px. */
  maxWidth: number;
  /** Horizontal padding of the container, px. */
  paddingX: number;
}

/**
 * Webflow-style column alignment guide. Rendered INSIDE the canvas iframe (so it
 * shares the content's coordinate space) as a `position: fixed`, non-interactive
 * overlay of evenly-spaced column strips centred on the theme container width.
 * Pure presentation — visibility/config live in the UI store.
 */
export const GridOverlay = ({ columns, gap, maxWidth, paddingX }: GridOverlayProps) => (
  <div className="tecof-grid-overlay" aria-hidden="true">
    <div
      className="tecof-grid-overlay-inner"
      style={{ maxWidth: `${maxWidth}px`, paddingLeft: paddingX, paddingRight: paddingX, gap: `${gap}px` }}
    >
      {Array.from({ length: Math.max(1, columns) }).map((_, i) => (
        <div key={i} className="tecof-grid-col" />
      ))}
    </div>
  </div>
);

export default GridOverlay;
