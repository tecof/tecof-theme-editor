import { useEffect } from 'react';
import { useEditorStore } from '../../engine/store';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { generateCSSVariables } from '../../utils';
import { resolveTheme, THEME_STYLE_ID } from './theme';
import { themeGoogleFontsHref, themeFontFaceCss } from './fonts';

const GOOGLE_LINK_ID = 'tecof-google-fonts';
const FONT_FACE_ID = 'tecof-font-faces';

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
  const { config } = useStudio();
  // Viewport is a dep so vars + the `.dark` class re-apply after the canvas iframe
  // is (re)created on a viewport switch.
  const viewport = useEditorStore((s) => s.viewport);
  const previewColorScheme = useUiStore((s) => s.previewColorScheme);
  const darkEnabled = !!config.darkMode;

  useEffect(() => {
    const theme = resolveTheme(rootProps, config.theme);
    // Canvas (iframe) carries the `:root.dark {}` override block; the HOST document
    // stays single-mode so editor chrome / modal previews never interact with — or
    // clobber — a host app that itself uses a `.dark` class. When dark mode is off,
    // both strings are byte-identical to the pre-dark output.
    const canvasCss = generateCSSVariables(theme, { dark: darkEnabled });
    const hostCss = darkEnabled ? generateCSSVariables(theme) : canvasCss;
    const googleHref = themeGoogleFontsHref(theme);
    const fontFaceCss = themeFontFaceCss(theme);

    /* CANLI ÖNİZLEME GARANTİSİ (2026-08 düzeltmesi): tema temaları
       `--theme-color-*` için katmansız `:root` fallback'leri tanımlayabilir
       (ilk boyama için meşru). Enjekte ettiğimiz blok da `:root` olduğundan
       kazanan BELGE SIRASIYDI — ve kanvas iframe'inde sıra deterministik
       olarak aleyhimize kuruluyordu: ThemeVars mount'ta boş head'e İLK
       eklenir, Frame sonra temanın globals.css linkini head SONUNA aynalar
       → temanın sabit hex'i kalıcı kazanır, panel değişikliği kanvasa hiç
       yansımaz (mova'da yaşanan bug). İki katmanlı çözüm:
       1. `:root` → `:root:root` (özgüllük 0,2,0): sıra ne olursa olsun
          katmansız tek-`:root` fallback'leri kaybeder. Yayın etkilenmez —
          TecofRender kendi stilini body'de basar, bu dosya yalnız editör.
       2. Element her uygulamada head SONUNA taşınır (appendChild mevcut
          düğümü taşır): HMR/geç yüklenen chunk linkleri sonradan eklense
          bile bir sonraki tema düzenlemesi sırayı geri kazanır. */
    const boostSpecificity = (css: string) => css.replace(/:root(?![-\w])/g, ':root:root');

    const ensureStyle = (doc: Document, id: string, content: string) => {
      let el = doc.getElementById(id) as HTMLStyleElement | null;
      if (!el) {
        el = doc.createElement('style');
        el.id = id;
      }
      if (el.textContent !== content) el.textContent = content;
      // Yalnız GEREKTİĞİNDE sona taşı: el'den sonra tecof'a ait OLMAYAN bir
      // stylesheet varsa (temanın aynalanan globals linki, HMR chunk'ı…) sıra
      // kaybedilmiş demektir. Koşulsuz appendChild her apply'da stylesheet'i
      // yeniden değerlendirtiyor ve Frame'in head MutationObserver'ını
      // (copyStyles serileştirmesi) boşuna tetikliyordu.
      const OURS = new Set([THEME_STYLE_ID, FONT_FACE_ID, GOOGLE_LINK_ID]);
      let needsMove = !el.parentNode;
      for (let n = el.nextElementSibling; n && !needsMove; n = n.nextElementSibling) {
        if (!OURS.has(n.id)) needsMove = true;
      }
      if (needsMove) doc.head.appendChild(el);
    };

    // Google Fonts <link>: created/updated when needed, removed when nothing to
    // load, so switching away from a webfont doesn't leave a stale request.
    const ensureGoogleLink = (doc: Document, href: string | null) => {
      let el = doc.getElementById(GOOGLE_LINK_ID) as HTMLLinkElement | null;
      if (!href) {
        el?.remove();
        return;
      }
      if (!el) {
        el = doc.createElement('link');
        el.id = GOOGLE_LINK_ID;
        el.rel = 'stylesheet';
        doc.head.appendChild(el);
      }
      if (el.href !== href) el.href = href;
    };

    const apply = (doc: Document | null | undefined, css: string) => {
      if (!doc?.head) return;
      ensureStyle(doc, THEME_STYLE_ID, boostSpecificity(css));
      ensureStyle(doc, FONT_FACE_ID, fontFaceCss);
      ensureGoogleLink(doc, googleHref);
    };

    apply(document, hostCss);
    const iframe = document.querySelector('.tecof-canvas-viewport iframe') as HTMLIFrameElement | null;
    const canvasDoc = iframe?.contentDocument;
    apply(canvasDoc, canvasCss);
    // Live dark preview: toggle the `.dark` class the `:root.dark` block keys off,
    // ONLY on the canvas document — never the host root, so a host app that uses
    // `.dark` for its own chrome stays untouched. Disabled/light always clears it.
    if (canvasDoc?.documentElement) {
      canvasDoc.documentElement.classList.toggle('dark', darkEnabled && previewColorScheme === 'dark');
    }
  }, [rootProps, config.theme, darkEnabled, previewColorScheme, viewport]);

  return null;
};

export default ThemeVars;
