import { useEffect } from 'react';
import { useEditorStore } from '../../engine/store';
import { generateCSSVariables } from '../../utils';
import { resolveTheme, THEME_STYLE_ID } from './theme';

/**
 * Injects the resolved theme as `--theme-*` CSS variables into BOTH the editor
 * document (so inspector swatches / theme previews reflect it) and the canvas
 * iframe (so the rendered components actually pick it up). Updates live as the
 * theme is edited.
 *
 * The canvas content is portaled into the iframe, so CSS-var resolution happens
 * against the iframe document — hence we write the variables there directly.
 * On first load the iframe may not exist yet; Frame's style-mirroring carries the
 * parent <style> over until a later edit re-injects directly.
 */
export const ThemeVars = () => {
  const rootProps = useEditorStore((s) => s.document.root?.props);

  useEffect(() => {
    const css = generateCSSVariables(resolveTheme(rootProps));

    const ensure = (doc: Document | null | undefined) => {
      if (!doc?.head) return;
      let el = doc.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
      if (!el) {
        el = doc.createElement('style');
        el.id = THEME_STYLE_ID;
        doc.head.appendChild(el);
      }
      if (el.textContent !== css) el.textContent = css;
    };

    ensure(document);
    const iframe = document.querySelector('.tecof-canvas-viewport iframe') as HTMLIFrameElement | null;
    ensure(iframe?.contentDocument);
  }, [rootProps]);

  return null;
};

export default ThemeVars;
