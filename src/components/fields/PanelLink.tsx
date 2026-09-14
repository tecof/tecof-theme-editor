/**
 * PanelLink — editörden panele (app.tecof.com) çıkan bağlantı.
 *
 * Editörde bir seçici boş kaldığında ("hiç marka yok") kullanıcının yapması
 * gereken iş BAŞKA bir üründe: kaydı panelde açmak. Bu bağlantı o yolu tek
 * tıkla verir ve HER ZAMAN yeni sekmede açılır — editördeki kaydedilmemiş
 * taslak kaybolmasın.
 *
 * Taban adres Studio context'inden (`panelUrl`) okunur. Alan bileşenleri
 * Studio DIŞINDA da render edilebildiği için `useStudioOptional` kullanılır;
 * provider yoksa üretim paneline düşülür ve bileşen çökmez.
 */

import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { useStudioOptional } from '../../studio/context';
import { buildPanelUrl, DEFAULT_PANEL_URL } from '../../utils/panelLinks';

/** Bağlantının ne yapacağını anlatan ortak ipucu — her yerde aynı cümle. */
export const PANEL_LINK_HINT = 'Yeni sekmede panel açılır — ekledikten sonra listeyi Yenile';

export interface PanelLinkProps {
  /** Panel yolu — `PANEL_PATHS` üzerinden verilir. */
  path: string;
  /** Görünen metin. */
  children: ReactNode;
  /** `inline` metin bağlantısı (başlık satırı), `button` vurgulu düğme (boş durum). */
  variant?: 'inline' | 'button';
  /** Hover ipucunu ezmek için; varsayılan `PANEL_LINK_HINT`. */
  title?: string;
  className?: string;
}

export const PanelLink = ({
  path,
  children,
  variant = 'inline',
  title,
  className,
}: PanelLinkProps) => {
  const studio = useStudioOptional();
  const href = buildPanelUrl(studio?.panelUrl || DEFAULT_PANEL_URL, path);

  return (
    <a
      className={`tecof-panel-link is-${variant}${className ? ` ${className}` : ''}`}
      href={href}
      target="_blank"
      /* `noopener` olmadan açılan sekme `window.opener` üzerinden editörü
         yönlendirebilir; `noreferrer` referrer sızıntısını kapatır. */
      rel="noopener noreferrer"
      title={title ?? PANEL_LINK_HINT}
    >
      <span className="tecof-panel-link-text">{children}</span>
      <ExternalLink size={variant === 'button' ? 14 : 12} aria-hidden="true" />
    </a>
  );
};

export default PanelLink;
