import type { PageTemplate, StudioConfig, TecofNode } from '../../types';

/**
 * Sayfa şablonu önizlemesinin SAF yardımcıları.
 *
 * Ölçek/yükseklik hesabı ve bölüm etiketi türetme burada durur (DOM'suz,
 * React'siz) — böylece `__tests__/pageTemplatePreview.test.ts` bunları
 * doğrudan test edebilir. Bileşenler (PageTemplateConfirmDrawer,
 * PageTemplateMiniPreview) yalnız ölçümü yapıp sonucu buraya sorar.
 */

/**
 * Tam sayfa önizlemeler bu masaüstü genişliğinde render edilip kutuya
 * ölçeklenir. `LivePreview.PREVIEW_REFERENCE_WIDTH` ile AYNI değer; iframe
 * tarafı React ağacına bağlı olmadığı için burada ayrıca tanımlanır (saf
 * modül canvas önizleme koduna bağımlı kalmasın).
 */
export const TEMPLATE_PREVIEW_REFERENCE_WIDTH = 1280;

/**
 * iframe'in `transform: scale()` katsayısı: kutu genişliği / referans genişlik.
 *
 * - Ölçülemeyen kutu (0, negatif, NaN) → 1 (küçültme yok; çağıran zaten
 *   ölçüm gelene kadar iskelet gösterir).
 * - 1'in ÜSTÜNE çıkılmaz: 1280px'den geniş bir kutuda sayfayı büyütmek
 *   bulanıklaştırır, masaüstü düzeni zaten olduğu gibi sığar.
 */
export const computePreviewScale = (
  boxWidth: number,
  referenceWidth: number = TEMPLATE_PREVIEW_REFERENCE_WIDTH,
): number => {
  if (!Number.isFinite(boxWidth) || boxWidth <= 0) return 1;
  if (!Number.isFinite(referenceWidth) || referenceWidth <= 0) return 1;
  return Math.min(1, boxWidth / referenceWidth);
};

/**
 * Ölçeklenmiş iframe'in CSS yüksekliği. Kutuyu TAM dolduracak yüksekliği
 * verir: `scale` ile küçüleceği için önce `boxHeight / scale` kadar uzun
 * render edilmelidir (aksi hâlde altta boşluk kalır).
 */
export const computeFrameHeight = (boxHeight: number, scale: number): number => {
  if (!Number.isFinite(boxHeight) || boxHeight <= 0) return 0;
  if (!Number.isFinite(scale) || scale <= 0) return boxHeight;
  return boxHeight / scale;
};

/**
 * Önizleme kutusunun yüksekliği — sözleşme "~60vh". Çok kısa ekranda okunmaz,
 * çok uzun ekranda drawer'ın gövdesini tek başına yutmasın diye sınırlanır.
 */
export const computePreviewBoxHeight = (
  viewportHeight: number,
  ratio = 0.6,
  min = 280,
  max = 720,
): number => {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return min;
  return Math.round(Math.min(max, Math.max(min, viewportHeight * ratio)));
};

/** Bileşen tipinin kullanıcıya görünen etiketi (yoksa ham tip adı). */
export const deriveSectionLabel = (
  config: Pick<StudioConfig, 'components'> | null | undefined,
  type: string | null | undefined,
): string => {
  const clean = typeof type === 'string' ? type.trim() : '';
  if (!clean) return 'Bölüm';
  const label = config?.components?.[clean]?.label;
  return typeof label === 'string' && label.trim() ? label.trim() : clean;
};

/** Onay drawer'ındaki bölüm listesinin tek satırı. */
export interface TemplateSectionInfo {
  /** React key — düğüm id'si yoksa sıra numarasından türetilir. */
  key: string;
  /** 1'den başlayan görünür sıra. */
  order: number;
  /** Ham bileşen tipi (boş olabilir). */
  type: string;
  /** Kullanıcıya gösterilen etiket. */
  label: string;
}

/**
 * Şablonun bölümlerini sıralı etiket listesine çevirir. Bozuk/eksik düğüm
 * atlanmaz — kullanıcıya "N bölüm" derken listede N satır görünmeli.
 */
export const summarizeTemplateSections = (
  config: Pick<StudioConfig, 'components'> | null | undefined,
  sections: PageTemplate['sections'] | null | undefined,
): TemplateSectionInfo[] =>
  (Array.isArray(sections) ? sections : []).map((section, index) => {
    const node = section?.node as TecofNode | undefined;
    const type = typeof node?.type === 'string' ? node.type : '';
    const id = node?.props?.id;
    return {
      key: typeof id === 'string' && id ? id : `${type || 'section'}-${index}`,
      order: index + 1,
      type,
      label: deriveSectionLabel(config, type),
    };
  });

/** "3 bölüm" — sayaç metni tek yerden (drawer açıklaması + kart alt satırı). */
export const formatSectionCount = (count: number): string =>
  `${Number.isFinite(count) && count > 0 ? Math.floor(count) : 0} bölüm`;

/**
 * Onay drawer'ının bilgi notu. Hedef adı verilirse ("Ana içerik akışı")
 * cümleye girer; verilmezse genel hâli kullanılır.
 */
export const buildInsertHint = (targetLabel?: string | null): string =>
  `Mevcut içerik silinmez; bölümler ${targetLabel?.trim() || 'sayfanın sonuna'} eklenir, ` +
  'tek Geri Al (⌘Z) ile kaldırılır.';

/**
 * Sol panel kartındaki minik canlı yığında kaç bölüm render edilecek.
 * 16:9 kutuya sığandan biraz fazlası (kırpılan üçüncü bölüm derinlik hissi
 * verir), ama daha fazlası boşa render maliyetidir.
 */
export const MINI_PREVIEW_SECTION_COUNT = 3;
