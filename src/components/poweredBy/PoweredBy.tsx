import { useEffect } from 'react';
import { usePoweredBy, type UsePoweredByOptions } from './usePoweredBy';
import {
  POWERED_BAND_BODY_CLASS,
  POWERED_BAND_SCRIPT_ATTR,
  bandScriptSelector,
  bandScriptVersion,
  buildBandCss,
} from './resolve';

export interface PoweredByProps extends UsePoweredByOptions {
  /** Her `[data-powered-band]` sarmalayıcısına eklenir. */
  className?: string;
  /**
   * İki varyant (light+dark) + `prefers-color-scheme` seçici CSS'i — core
   * paritesi; JS'siz/SSR'da sıfır flaş. Varsayılan false (tek varyant, mod
   * ortamdan canlı çözülür).
   */
  renderBoth?: boolean;
}

/**
 * Aynı sayfada birden çok örnek olabilir (ör. tema + tuval); sayaç sıfıra
 * inmeden body sınıfı kaldırılmaz ki örnekler birbirinin sınıfını silmesin.
 */
let bandMountCount = 0;

/**
 * Band JS'i JSX'te BASILMAZ: React `dangerouslySetInnerHTML` içindeki script'i
 * istemcide çalıştırmaz. Mount sonrası sürüm başına tek script eklenir;
 * unmount'ta kaldırılmaz (çalışmış script geri alınamaz).
 */
function ensureBandScript(js: string, version: string | null): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(bandScriptSelector(version, js))) return;
  const el = document.createElement('script');
  el.setAttribute(POWERED_BAND_SCRIPT_ATTR, '');
  el.setAttribute('data-version', bandScriptVersion(version, js));
  el.textContent = js;
  document.body.appendChild(el);
}

/**
 * Admin'in "Powered by Tecof" bandı — tek satırla her temaya eklenir.
 * Veri/dil/mod kararı `usePoweredBy`'da; burada yalnız işaretleme ve efektler
 * (script enjeksiyonu, body sınıfı). Görünür değilse hiçbir şey basmaz.
 *
 * İki modda da İKİ varyant DOM'da durur. Tek varyant modunda aktif olmayan
 * `hidden` alır: mod değişince yalnız öznitelik değişir, `dangerouslySetInnerHTML`
 * yeniden basılmaz — admin JS'i (`ensureBandScript`, sürüm başına bir kez)
 * bir defa bağlanır ve düğümler kalıcı olduğu için dinleyiciler yaşar.
 */
export function PoweredBy({ className, renderBoth = false, ...options }: PoweredByProps) {
  const { visible, variants, css, js, version, mode } = usePoweredBy(options);

  useEffect(() => {
    if (!visible || !js) return;
    ensureBandScript(js, version);
  }, [visible, js, version]);

  useEffect(() => {
    if (!visible || typeof document === 'undefined') return;
    bandMountCount += 1;
    document.body.classList.add(POWERED_BAND_BODY_CLASS);
    return () => {
      bandMountCount -= 1;
      if (bandMountCount <= 0) {
        bandMountCount = 0;
        document.body.classList.remove(POWERED_BAND_BODY_CLASS);
      }
    };
  }, [visible]);

  if (!visible || !variants) return null;

  const dataVersion = version ?? undefined;

  return (
    <>
      <style
        data-powered-band-style=""
        data-version={dataVersion}
        dangerouslySetInnerHTML={{ __html: buildBandCss(css, renderBoth) }}
      />
      {/* data-mode iki modda da korunur: admin varsayılan stili dark kuralını
          `[data-mode="dark"]` ile seçer. renderBoth'ta seçimi CSS (prefers-color-scheme)
          yapar; tek varyantta `hidden` (SSR'da `mode` prop'u/varsayılan 'light'). */}
      {(['light', 'dark'] as const).map((variant) => (
        <div
          key={variant}
          data-powered-band=""
          data-single={renderBoth ? undefined : ''}
          data-mode={variant}
          data-version={dataVersion}
          className={className}
          hidden={!renderBoth && variant !== mode}
          dangerouslySetInnerHTML={{ __html: variants[variant] }}
        />
      ))}
    </>
  );
}

export default PoweredBy;
