import react__default from 'react';

interface UnderConstructionProps {
    title: string;
    description: string;
    subtitle?: string;
    logoUrl?: string | null;
    accentColor?: string;
}
/**
 * "Yapım aşamasında" sayfası — minimal, light bir tasarım.
 *
 * Tek vurgu rengi (varsayılan: Tecof primary #74b500) üzerine kurulu:
 * ince nokta ızgaralı açık zemin, üstten süzülen hafif renk tonu, canlı
 * durum rozeti (ping animasyonlu nokta) ve tek dekoratif öğe olarak akan
 * ilerleme çizgisi. Kart/cam efekti yok — içerik doğrudan zeminde durur.
 *
 * Renk türevleri `color-mix` ile accent'ten hesaplanır, bu yüzden herhangi
 * bir marka rengiyle (accentColor prop) uyumlu kalır.
 */
declare const UnderConstruction: react__default.FC<UnderConstructionProps>;

export { UnderConstruction, type UnderConstructionProps, UnderConstruction as default };
