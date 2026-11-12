import type { FieldConfig, StudioConfig } from '../../types';

/**
 * Kanvas içi metin düzenlemesinin (useInlineEdit) SAF çekirdeği — DOM'suz /
 * duck-typed nesnelerle test edilir (touchDragModel, dragGuideModel deseni).
 *
 * Üç karar burada yaşar:
 *  1. Davranış (`resolveInlineEditBehavior`): değer düz metin mi HTML mi, Enter
 *     yeni satır mı açar yoksa kaydeder mi?
 *  2. Serileştirme (`serializePlainText`): contentEditable DOM'u → saklanan
 *     düz metin (`<br>` ve blok sınırları `\n` olur, NBSP boşluğa döner).
 *  3. DOM geri yükleme (`snapshotSubtree`): oturum başındaki düğümleri/metni
 *     aynen geri koyar ki React'in sahiplendiği DOM ile render ettiği değer
 *     ayrışmasın (aksi halde kanvas bayat metni gösterir; sonraki inline
 *     düzenleme bu bayat metni yazıp başka yerden yapılmış değişikliği EZER).
 */

/** One entry of a multilingual prop array: `{ code: 'tr', value: '...' }`. */
export interface LocalizedEntry {
  code?: string;
  value?: unknown;
}

export interface MatchResult {
  propName: string;
  isMultilingual: boolean;
  langCode: string;
  /**
   * Repeater/array satırı hedefleniyorsa dolu: `data-tecof-item="<field>:<index>"`
   * işaretli kart içindeki `data-tecof-item-prop="<alan>"` metinleri. Bu durumda
   * `propName` SATIR-İÇİ alan adıdır (`title`), commit `props[itemField][itemIndex]`
   * satırına immutably yazılır. (Bilinçli olarak `data-tecof-prop`'tan AYRI attr:
   * eski paket sürümleri `data-tecof-prop`'u top-level prop sanıp temaya çöp
   * `"title"` prop'u yazardı — yeni attr'ı eski sürüm hiç görmez.)
   */
  itemField?: string;
  itemIndex?: number;
}

/* ─── 1. Davranış ─── */

export interface InlineEditBehavior {
  /** Değer HTML olarak saklanır (zengin metin) → commit `innerHTML`, değilse düz metin. */
  html: boolean;
  /**
   * Çok satırlı içerik: Enter YENİ SATIR açar (zengin metin kabında yeni
   * paragraf, diğerlerinde satır sonu); bitirmek için ⌘/Ctrl+Enter, dışarı
   * tıklama ya da Esc (iptal). Tek satırlıda Enter kaydeder.
   */
  multiline: boolean;
}

/** Saklanan değerde HTML işaretlemesi var mı (zengin metin / satır içi etiket). */
const HTML_MARKUP = /<\/?(p|div|br|h[1-6]|ul|ol|li|blockquote|pre|code|strong|em|b|i|u|s|a|span|hr|img)\b[^>]*>/i;
/** Blok düzeyinde işaretleme — alan tanımı yoksa çok satırlılık ipucu. */
const BLOCK_MARKUP = /<(p|div|br|h[1-6]|ul|ol|li|blockquote|pre)\b/i;
/** `{{ item.x }}` / `{{ data.x }}` bağlama token'ı. */
const BINDING_TOKEN = /\{\{[^{}]*\}\}/;

export const looksLikeHtml = (value: unknown): boolean =>
  typeof value === 'string' && HTML_MARKUP.test(value);

/** createEditorField (TipTap) — değer HTML, içerik çok satırlı. */
export const isRichTextField = (def: FieldConfig | undefined): boolean =>
  !!def && def._fieldType === 'editor';

/** Yerleşik `textarea` ya da `createLanguageField({ isTextarea: true })`. */
export const isMultilineField = (def: FieldConfig | undefined): boolean =>
  !!def && (def.type === 'textarea' || def.isTextarea === true);

/**
 * Tek satır / çok satır / zengin metin kararı. Öncelik alan tanımındadır
 * (Inspector'da textarea ya da TipTap olan alan kanvasta da çok satırlıdır);
 * alan bilinmiyorsa (resolveFields ile gelen alan, alan listesinde olmayan
 * prop) değerin kendisine bakılır: içinde `\n` ya da blok HTML varsa çok
 * satırlı, yoksa — bugünkü davranış — tek satırlı.
 *
 * `null` = inline düzenleme BAŞLAMAMALI (alan Inspector'dan düzenlenir):
 *  - değer bağlama token'ı taşıyor: kanvas çözülmüş metni gösterir, yazmak
 *    token'ı düz metinle ezip bağlantıyı koparırdı;
 *  - değer HTML ama eleman yalnız düz metin gösteriyor (özet/HTML'i soyulmuş
 *    yansıma): o metni geri yazmak biçimlendirmeyi ve paragrafları silerdi.
 */
export const resolveInlineEditBehavior = (input: {
  fieldDef?: FieldConfig;
  value: unknown;
  /** Düzenlenen elemanın element çocuğu var mı (HTML gerçekten basılmış mı). */
  hasElementChildren: boolean;
}): InlineEditBehavior | null => {
  const { fieldDef, value, hasElementChildren } = input;
  const str = typeof value === 'string' ? value : '';
  if (BINDING_TOKEN.test(str)) return null;

  const rich = isRichTextField(fieldDef);
  const textarea = isMultilineField(fieldDef);
  const markup = looksLikeHtml(str);
  if (markup && !hasElementChildren) return null;

  const html = rich || markup;
  // Tanımlı ama zengin/çok satırlı OLMAYAN alan (text, dil girdisi…) tek satırdır;
  // değer HTML içerse bile (satır içi etiketli başlık) Enter kaydeder.
  const declaredSingleLine = !!fieldDef && !rich && !textarea;
  const multiline =
    rich || textarea || (!declaredSingleLine && (str.includes('\n') || BLOCK_MARKUP.test(str)));
  return { html, multiline };
};

/**
 * Elemanın hesaplanmış `white-space` değeri satır sonlarını GÖSTERİYOR mu
 * (`pre`, `pre-wrap`, `pre-line`, `break-spaces`; yeni tarayıcılarda
 * `white-space-collapse: preserve | preserve-breaks | break-spaces`). Tek
 * satırlı başlıklarda Shift+Enter yalnız o zaman satır sonu ekler (ör. tema
 * `[&_h1]:whitespace-pre-line` diyorsa); aksi halde eklenen satır sonu
 * kaydedildikten sonra görünmez olurdu.
 */
export const preservesLineBreaks = (
  style: { whiteSpace?: string | null; whiteSpaceCollapse?: string | null } | null | undefined
): boolean => {
  if (!style) return false;
  const collapse = (style.whiteSpaceCollapse || '').trim();
  if (collapse === 'preserve' || collapse === 'preserve-breaks' || collapse === 'break-spaces') {
    return true;
  }
  const ws = (style.whiteSpace || '').trim();
  return /^(pre|pre-wrap|pre-line|break-spaces)\b/.test(ws);
};

/* ─── 2. Serileştirme ─── */

/** DOM düğümünün testte taklit edilebilen asgari şekli. */
export interface DomLikeNode {
  nodeType: number;
  nodeName: string;
  nodeValue?: string | null;
  childNodes: ArrayLike<DomLikeNode>;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const BLOCK_TAGS = new Set([
  'DIV', 'P', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'ARTICLE', 'TR',
]);

/**
 * contentEditable içeriğini saklanacak DÜZ METNE çevirir. `textContent`
 * yetmez: `<br>`'yi ve tarayıcının Enter'da açtığı `<div>`/`<p>` bloklarını
 * yok sayar (satırlar boşluksuz birleşirdi — "satır1satır2"). `innerText` de
 * kullanılmaz: CSS'e bağlıdır (`text-transform: uppercase` başlığı veriye
 * BÜYÜK HARF yazardı). NBSP (tarayıcının yazım sırasında koyduğu `&nbsp;`)
 * normal boşluğa döner; uçlar kırpılır (eski davranış).
 */
export const serializePlainText = (root: DomLikeNode): string => {
  let out = '';
  const breakLine = () => {
    if (out && !out.endsWith('\n')) out += '\n';
  };
  const walk = (node: DomLikeNode) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === TEXT_NODE) {
        out += child.nodeValue ?? '';
        continue;
      }
      if (child.nodeType !== ELEMENT_NODE) continue;
      const name = String(child.nodeName).toUpperCase();
      if (name === 'BR') {
        out += '\n';
        continue;
      }
      const block = BLOCK_TAGS.has(name);
      if (block) breakLine();
      walk(child);
      if (block) breakLine();
    }
  };
  walk(root);
  return out.replace(/\u00a0/g, ' ').replace(/\r\n?/g, '\n').trim();
};

/* ─── 3. DOM geri yükleme ─── */

/** `snapshotSubtree`'nin ihtiyaç duyduğu asgari düğüm şekli. */
export interface RestorableNode {
  nodeType: number;
  /** Metin / yorum düğümlerinde içerik. */
  data?: string;
  childNodes: ArrayLike<RestorableNode>;
  replaceChildren?(...nodes: RestorableNode[]): void;
}

/**
 * Kökün altındaki TÜM ağacın (düğüm kimlikleri + metin içerikleri) anlık
 * görüntüsünü alır, geri yükleyen bir fonksiyon döndürür.
 *
 * Neden: contentEditable yazımı React'in oluşturduğu DOM'u yerinde değiştirir
 * (tümünü seçip yazmak orijinal metin düğümünü SİLİP yenisini ekler). React ise
 * hâlâ eski düğümleri tutar; sonraki güncellemeleri kopuk düğüme yazar ve kanvas
 * bayat metinde takılı kalır. Oturum bitince (kaydet ya da iptal) DOM'u React'in
 * son render ettiği hâle döndürüp ardından store'a yazmak, React'in yeni değeri
 * kendi yoluyla basmasını sağlar — iki kaynak bir daha ayrışmaz.
 *
 * Sıra: ebeveyn önce (DFS pre-order) — tarayıcının taşıdığı/sildiği düğümler
 * kendi orijinal ebeveynlerine geri döner; tarayıcının eklediği (yeni metin,
 * `<br>`, `<b>`…) düğümler düşer. Element niteliklerine dokunulmaz.
 */
export const snapshotSubtree = (root: RestorableNode): (() => void) => {
  const entries: Array<{ node: RestorableNode; children?: RestorableNode[]; data?: string }> = [];
  const walk = (node: RestorableNode) => {
    if (typeof node.data === 'string' && node.nodeType !== ELEMENT_NODE) {
      entries.push({ node, data: node.data });
      return;
    }
    const children = Array.from(node.childNodes);
    entries.push({ node, children });
    children.forEach(walk);
  };
  walk(root);

  return () => {
    for (const entry of entries) {
      if (entry.data !== undefined) {
        if (entry.node.data !== entry.data) entry.node.data = entry.data;
        continue;
      }
      const wanted = entry.children ?? [];
      const current = entry.node.childNodes;
      const same =
        current.length === wanted.length && wanted.every((child, i) => current[i] === child);
      if (!same) entry.node.replaceChildren?.(...wanted);
    }
  };
};

/* ─── Alan tanımı / değer okuma ─── */

/**
 * Eşleşmenin (prop / satır alanı) statik alan tanımı. Repeater satırında
 * `fields[itemField].arrayFields[prop]`. Bulunamazsa undefined (resolveFields
 * ile gelen dinamik alanlar dahil) — davranış o zaman değere göre seçilir.
 */
export const findInlineFieldDef = (
  config: StudioConfig | null | undefined,
  nodeType: string,
  match: Pick<MatchResult, 'propName' | 'itemField'>
): FieldConfig | undefined => {
  const fields = config?.components?.[nodeType]?.fields as Record<string, FieldConfig> | undefined;
  if (!fields) return undefined;
  if (match.itemField != null) {
    return fields[match.itemField]?.arrayFields?.[match.propName];
  }
  return fields[match.propName];
};

/** Eşleşmenin şu an saklanan değeri (çok dilli ise hedef dilin `value`'su). */
export const readMatchedValue = (props: Record<string, unknown>, match: MatchResult): unknown => {
  let holder: Record<string, unknown> | null = props;
  if (match.itemField != null && match.itemIndex != null) {
    const rows = props[match.itemField];
    const row = Array.isArray(rows) ? rows[match.itemIndex] : undefined;
    holder = row && typeof row === 'object' ? (row as Record<string, unknown>) : null;
  }
  if (!holder) return undefined;
  const raw = holder[match.propName];
  if (match.isMultilingual && Array.isArray(raw)) {
    const entry = (raw as LocalizedEntry[]).find((e) => e && e.code === match.langCode);
    return entry?.value;
  }
  return raw;
};
