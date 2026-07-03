import { useMemo } from 'react';
import { useEditorStore } from '../../engine/store';
import { collectDocumentClasses } from '../style/compileStyles';
import { generateStyleCss } from '../style/cssGenerator';

/**
 * Live CSS for the editor canvas.
 *
 * The canvas iframe mirrors the HOST app's stylesheets (see Frame.tsx), and
 * the host's Tailwind build knows nothing about the editor's style tokens —
 * so classes like `p-4!` used to land in the DOM with no CSS behind them and
 * the style editor looked completely dead inside the canvas.
 *
 * This component renders INSIDE the canvas content (portaled into the iframe
 * body), regenerating a stylesheet for exactly the classes the current
 * document uses. It re-runs on every document change, so style edits are
 * visible immediately.
 */
export const CanvasStyleInjector = () => {
  const documentState = useEditorStore((state) => state.document);

  const css = useMemo(
    () => generateStyleCss(collectDocumentClasses(documentState)),
    [documentState],
  );

  if (!css) return null;
  return <style data-tecof-canvas-styles>{css}</style>;
};

export default CanvasStyleInjector;
