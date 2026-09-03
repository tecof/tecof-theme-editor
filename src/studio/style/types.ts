/**
 * Structured, token-based style model for the Tailwind v4 visual style editor.
 *
 * We store *style intent* (which token is chosen per property) rather than raw
 * class strings. This keeps the UI drivable (we can show the current value),
 * makes responsive + state variants first-class, and — because every property
 * maps to a finite token set — lets us generate a complete Tailwind safelist for
 * production. The shape round-trips losslessly inside `node.props._tecofStyles`.
 */

/** Responsive breakpoints. `base` = no prefix; others map to Tailwind `sm:`…`xl:`. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/** Interaction states → Tailwind `hover:` / `focus:` / `active:`. */
export type StateVariant = 'hover' | 'focus' | 'active';

/**
 * One layer of style values, keyed by control id (see STYLE_CONTROLS).
 * Value is the *token* (e.g. `'4'`, `'primary-600'`, `'lg'`), not the class.
 *
 * Arbitrary (custom) values are bracket-wrapped (`'[10px]'`, `'[#ff0000]'`) so
 * they round-trip losslessly and are distinguishable from bare presets; the
 * control's `toClass` compiles them to Tailwind arbitrary syntax (`p-[10px]`).
 */
export type StyleProps = Record<string, string | undefined>;

/**
 * Interaction-state layers, keyed by either:
 *   - a bare state variant (`'hover'`)            → applies at the base breakpoint
 *   - a `${breakpoint}:${state}` key (`'md:hover'`) → applies only at that breakpoint
 *
 * Bare keys are the original (back-compatible) encoding; prefixed keys add
 * responsive-state support (e.g. a hover style that only kicks in from `md` up).
 */
export type StateLayers = Record<string, StyleProps>;

/** Full style object stored on a node. */
export interface NodeStyles {
  base?: StyleProps;
  sm?: StyleProps;
  md?: StyleProps;
  lg?: StyleProps;
  xl?: StyleProps;
  states?: StateLayers;
}

/** The prop key under which a node's structured styles live. */
export const STYLES_PROP = '_tecofStyles';

/**
 * Stil senkronu — "bu düğüm bir stil KAYNAĞIdır" bayrağının prop anahtarı.
 *
 * Bayrak taşıyan düğüm bulunan sayfa her kaydedildiğinde backend
 * (`app/src/nodeStyleSync.ts` + `POST /api/store/editor/apply-styles`) aynı
 * temadaki eşleşen düğümlere `_tecofStyles`'ı yayar. Değer düğüme ÖZELDİR
 * (hangi sayfadan yayıldığını taşır), bu yüzden symbol (ortak bileşen)
 * senkronunda META_KEYS'e girer ve örnekler arasında ASLA kopyalanmaz.
 */
export const STYLE_SYNC_PROP = '_tecofStyleSync';

/** Hangi düğümlerin hedef sayılacağını belirleyen ölçüt (backend ile birebir). */
export interface StyleMatch {
  /** Bileşen tipi — zorunlu (ör. "HeroSection"). */
  type: string;
  /** Verilirse `props._layerName` ya da `props.name` bu değere eşit olmalı. */
  name?: string;
}

/** `props._tecofStyleSync` değerinin şekli (backend `normalizeSyncFlag` ile aynı). */
export interface StyleSyncFlag {
  /** Şimdilik tek kapsam: aynı temadaki tüm sayfalar. */
  scope: 'theme';
  /** Bayrağın yazıldığı sayfa — hedefteki "kendi izi" bundan tanınır. */
  sourcePageId?: string;
  /** Boş bırakılırsa backend düğümün tipinden (varsa adından) türetir. */
  match?: StyleMatch;
}
