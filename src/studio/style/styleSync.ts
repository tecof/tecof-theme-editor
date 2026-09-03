import type { TecofNode } from '../../types';
import { STYLE_SYNC_PROP, type StyleMatch, type StyleSyncFlag } from './types';

/**
 * Stil senkronu — SAF yardımcılar.
 *
 * "Bir sayfada ayarladığım başlık boşluğu diğer sayfalarda eski kalıyor"
 * sorununun editör tarafı. İki mod var, ikisi de TEK backend ucunu kullanır
 * (`POST /api/store/editor/apply-styles`, bkz. BACKEND `docs/STYLE_SYNC.md`):
 *
 *  1. **Tek seferlik uygulama** — "Diğer sayfalara uygula" modalı: seçilen
 *     sayfalardaki eşleşen bileşenlere bu düğümün `_tecofStyles`'ı yazılır.
 *  2. **Sürekli senkron** — düğüme `_tecofStyleSync` bayrağı yazılır; sayfa her
 *     KAYDEDİLDİĞİNDE backend aynı yayılımı kendisi koşar.
 *
 * Bu dosya React'e ve api'ye BAĞIMSIZDIR (yalnız tipler) — ölçüt/bayrak
 * kuralları DB'siz ve DOM'suz test edilebilsin diye ayrıldı; aynı gerekçe
 * backend'de `app/src/nodeStyleSync.ts`'i `page.ts`'ten ayırıyor. Kurallar
 * backend'in `nodeLabelOf` / `normalizeMatch` / `normalizeSyncFlag`
 * fonksiyonlarıyla BİREBİR aynı olmak zorundadır: önizlemede gösterilen
 * eşleşme sayısı ile gerçekte yazılan düğüm sayısı ayrışırsa kullanıcı
 * "5 sayfa dedi 3 sayfa yaptı" der.
 */

/** Boş/boşluk-only metinleri null'a indirger (backend `asString` ile aynı). */
const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

/**
 * Düğümün kullanıcıya görünen adı: Katmanlar panelindeki yeniden adlandırma
 * `props._layerName`'e yazar, bazı temalar `props.name` kullanır.
 * Çok dilli (`[{code,value}]`) `name` alanları AD SAYILMAZ — ad eşleşmesi düz
 * metin karşılaştırmasıdır ve backend de dizileri ad kabul etmez.
 */
export const nodeStyleLabel = (node?: TecofNode | null): string | null =>
  asString(node?.props?._layerName) ?? asString(node?.props?.name);

/**
 * Ortak bileşen (symbol) örneği mi? Stil senkronu bu düğümleri HEM kaynak HEM
 * hedef olarak atlar: ortak bileşenin stili master'da yaşar, sayfadaki kopyaya
 * yazılan stil bir sonraki çözümlemede sessizce kaybolurdu.
 */
export const isSharedNode = (node?: TecofNode | null): boolean =>
  !!node?.props?.sharedComponentId;

/** Ham prop değerini güvenli bayrak şekline indirger; tanınmazsa null. */
export const styleSyncFlagOf = (node?: TecofNode | null): StyleSyncFlag | null => {
  const raw = node?.props?.[STYLE_SYNC_PROP];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const type = asString((value.match as Record<string, unknown> | undefined)?.type);
  const name = asString((value.match as Record<string, unknown> | undefined)?.name);
  const sourcePageId = asString(value.sourcePageId);
  return {
    scope: 'theme',
    ...(sourcePageId ? { sourcePageId } : {}),
    ...(type ? { match: name ? { type, name } : { type } } : {}),
  };
};

/** Düğüm bir stil kaynağı mı (bayrak taşıyor mu)? */
export const isStyleSourceNode = (node?: TecofNode | null): boolean =>
  styleSyncFlagOf(node) !== null;

/**
 * Ölçüt üretimi: tip her zaman, ad YALNIZ istendiğinde ve düğümün gerçek bir adı
 * varsa. Ad daraltmasını sessizce eklemeyiz — kullanıcı "Başlık" adlı bileşeni
 * hedeflemek isterken adsız kardeşlerini dışarıda bırakmak bilinçli bir seçimdir.
 */
export const buildStyleMatch = (
  node: TecofNode | null | undefined,
  opts: { byName?: boolean } = {}
): StyleMatch | null => {
  const type = asString(node?.type);
  if (!type) return null;
  const name = opts.byName ? nodeStyleLabel(node) : null;
  return name ? { type, name } : { type };
};

/**
 * Bayrak nesnesi. `match` BİLİNÇLİ olarak açıkça yazılır: backend bayrakta ölçüt
 * yoksa düğümün adından türetiyor — kullanıcı sonradan katman adını
 * değiştirdiğinde senkronun hedef kümesi sessizce kaymasın.
 */
export const buildStyleSyncFlag = (
  node: TecofNode | null | undefined,
  args: { sourcePageId?: string; byName?: boolean }
): StyleSyncFlag | null => {
  const match = buildStyleMatch(node, { byName: args.byName });
  if (!match) return null;
  return {
    scope: 'theme',
    ...(args.sourcePageId ? { sourcePageId: args.sourcePageId } : {}),
    match,
  };
};

/** Modal satırı: bir hedef sayfa + önizlemeden gelen eşleşme sayıları. */
export interface StyleSyncPageRow {
  pageId: string;
  title: string;
  slug: string;
  /** Yazılabilir eşleşme sayısı (çakışmalar hariç). */
  matches: number;
  /** Başka bir stil kaynağı olduğu için ATLANACAK düğüm sayısı. */
  conflicts: number;
  status?: string;
}

interface RawPage {
  _id?: unknown;
  slug?: unknown;
  title?: unknown;
  status?: unknown;
}

interface RawPreviewPage {
  pageId?: unknown;
  title?: unknown;
  slug?: unknown;
  matches?: unknown;
  conflicts?: unknown;
}

const asCount = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

/**
 * Sayfa listesi (`GET /api/store/pages`) ile önizleme sonucunu birleştirir.
 *
 * İki kaynak da tek başına yetmez: liste ucu `isTemplate` sayfaları elediği için
 * eşleşmesi olan bir şablon sayfası orada YOKTUR, önizleme ise yalnız EŞLEŞMESİ
 * OLAN sayfaları döner (0 eşleşmeli sayfalar hiç gelmez). Kullanıcı ikisini de
 * görmeli: eşleşmesi olmayan sayfa "0 eşleşme" ile listelenir (neden seçemediği
 * anlaşılsın), önizlemede olup listede olmayan sayfa satır olarak EKLENİR
 * (sessizce güncellenen bir sayfa kalmasın).
 *
 * `sourcePageId` her iki taraftan da düşürülür — kaynak sayfa kendi hedefi değildir.
 */
export const mergeStyleSyncPages = (
  pages: unknown,
  previewPages: unknown,
  sourcePageId?: string | null
): StyleSyncPageRow[] => {
  const preview = new Map<string, RawPreviewPage>();
  if (Array.isArray(previewPages)) {
    for (const entry of previewPages as RawPreviewPage[]) {
      const id = asString(entry?.pageId);
      if (id) preview.set(id, entry);
    }
  }

  const rows: StyleSyncPageRow[] = [];
  const seen = new Set<string>();

  if (Array.isArray(pages)) {
    for (const page of pages as RawPage[]) {
      const id = asString(page?._id) ?? (page?._id != null ? String(page._id) : null);
      if (!id || id === sourcePageId || seen.has(id)) continue;
      seen.add(id);
      const hit = preview.get(id);
      rows.push({
        pageId: id,
        title: asString(page?.title) ?? asString(hit?.title) ?? asString(page?.slug) ?? id,
        slug: asString(page?.slug) ?? '',
        matches: asCount(hit?.matches),
        conflicts: asCount(hit?.conflicts),
        ...(asString(page?.status) ? { status: String(page.status) } : {}),
      });
    }
  }

  // Listede olmayıp önizlemede eşleşen sayfalar (şablon sayfaları gibi).
  for (const [id, hit] of preview) {
    if (seen.has(id) || id === sourcePageId) continue;
    rows.push({
      pageId: id,
      title: asString(hit?.title) ?? asString(hit?.slug) ?? id,
      slug: asString(hit?.slug) ?? '',
      matches: asCount(hit?.matches),
      conflicts: asCount(hit?.conflicts),
    });
  }

  /* Eşleşenler üste, sonra ada göre — kullanıcı 40 sayfalık listede önce
     işine yarayan satırları görsün. */
  return rows.sort((a, b) => {
    if ((b.matches > 0 ? 1 : 0) !== (a.matches > 0 ? 1 : 0)) return b.matches - a.matches;
    return a.title.localeCompare(b.title, 'tr');
  });
};

/** Uygulama sonucunun tek satırlık Türkçe özeti (modal + toast metni). */
export const styleSyncSummary = (result?: {
  updatedPages?: number;
  updatedNodes?: number;
  conflicts?: unknown[];
} | null): string => {
  const pages = asCount(result?.updatedPages);
  const nodes = asCount(result?.updatedNodes);
  if (!pages) return 'Hiçbir sayfada eşleşen bileşen bulunamadı.';
  const conflicts = Array.isArray(result?.conflicts) ? result!.conflicts!.length : 0;
  const base = `${pages} sayfada ${nodes} bileşen güncellendi — yayınlamak için o sayfaları yayınlayın.`;
  return conflicts > 0
    ? `${base} ${conflicts} bileşen kendi stil kaynağı olduğu için atlandı.`
    : base;
};
