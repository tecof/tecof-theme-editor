/**
 * ColorField v2 — tetikleyici satırı + durum makinesi + fabrika.
 *
 * Renk matematiği `color/colorMath`, popover `color/ColorPicker`, canlı tema
 * paleti `color/useThemePalette`; bu dosya yalnız değer sözleşmesini (§3.2) ve
 * dört görünüm modunu (empty / color / themeVar / unknown) yönetir.
 *
 * Değer: `''` | `#rrggbb` | `#rrggbbaa` (yalnız showOpacity) |
 * `var(--theme-color-<kebab>)` (yalnız themeVars). Tanınmayan değerler
 * (`var(--x)`, eski biçimler) OLDUĞU GİBİ korunur; yalnız Temizle/Sıfırla ile gider.
 */
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { THEME_COLOR_KEYS, toThemeCssKey } from '../../studio/theme/colorKeys';
import type { ThemeColors } from '../../types';
import { classifyValue, cssColor, formatHex, normalizeValue, parseColor, themeColorVar, type ParsedColor } from './color/colorMath';
import { pushRecent } from './color/recentColors';
import { useThemePalette } from './color/useThemePalette';
import { ColorPickerPopover, isColorDraftInProgress } from './color/ColorPicker';

/* ─── Props ─── */

export interface ColorFieldProps {
  field: any;
  name: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export interface ColorFieldOptions {
  /** Kenar çubuğunda görünen etiket */
  label?: string;
  /** Etiketin yanındaki ikon (React elemanı, ör. Lucide) */
  labelIcon?: ReactElement;
  /** Alanın kenar çubuğunda görünürlüğü */
  visible?: boolean;
  /** Opaklık kaydırıcısı + hex8 + "Şeffaf" düğmesi. Varsayılan false. */
  showOpacity?: boolean;
  /** Sıfırlama hedefi. Varsayılan ''. */
  defaultColor?: string;
  /** HEX girdisi yer tutucusu. Varsayılan '#000000'. */
  placeholder?: string;
  /** Sıfırla düğmesi. Varsayılan true. */
  showReset?: boolean;
  /** "Hızlı seçim" satırı (hex listesi). Varsayılan [] — palet bölümü hazır renkleri karşılar. */
  swatches?: string[];
  /** Studio içinde canlı tema bölümü; Studio dışında otomatik gizli. Varsayılan true. */
  themeColors?: boolean;
  /**
   * true: tema noktası `var(--theme-color-<key>)` yazar (chip modu);
   * false (varsayılan): görünen hex kopyalanır. Varsayılan KAPALI çünkü MCP/AI
   * "color" şeması ve hex matematiği yapan temalar var() beklemez.
   */
  themeVars?: boolean;
  /** Tailwind paleti. Varsayılan true. */
  palette?: boolean;
  /** Kontrast çipleri. Varsayılan true. */
  contrast?: boolean;
  /** Verilirse (hex) tek zemin çipi — ThemeEditor koyu satırları için. */
  contrastAgainst?: string;
}

const EMPTY_SWATCHES: string[] = [];

/** 4 haneli hex yazarken geçici (#fff0 = şeffaf beyaz): canlı emit atlanır, blur uygular. */
const isTransientHex4 = (t: string): boolean => /^#[0-9a-f]{4}$/i.test(t.trim());

/**
 * Studio dışında (tema paleti yok) `var(--theme-color-*)` bağını koparmak için
 * host belgesindeki CSS değişkenini okur. Tema yayın sayfasında/host Puck'ta
 * değişken `:root`'a basılmışsa hex'e çözülür; yoksa null → düğme çizilmez,
 * alan silinmez (eski davranış değeri '' yapıp rengi kaybettiriyordu).
 */
function readThemeVarFromDocument(key: keyof ThemeColors): string | null {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return null;
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--theme-color-${toThemeCssKey(key)}`).trim();
    const parsed = raw ? parseColor(raw) : null;
    return parsed ? formatHex(parsed.rgb, parsed.alpha) : null;
  } catch {
    return null;
  }
}

/* ─── Bileşen ─── */

export const ColorField = ({
  value,
  onChange,
  readOnly,
  showOpacity = false,
  defaultColor = '',
  placeholder = '#000000',
  showReset = true,
  swatches = EMPTY_SWATCHES,
  themeColors = true,
  themeVars = false,
  palette = true,
  contrast = true,
  contrastAgainst,
}: ColorFieldProps & ColorFieldOptions) => {
  const cls = useMemo(() => classifyValue(value), [value]);
  const [open, setOpen] = useState(false);
  /** Metin girdisi taslağı; null = düzenlenmiyor, depolanan değer gösterilir. */
  const [draft, setDraft] = useState<string | null>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const themePalette = useThemePalette(themeColors);

  /* Yankı koruması popover'ın kendi lastEmittedRef'indedir (yerel HSV orada);
     bu katman durumsuzdur — depolanan değer tek gerçek kaynaktır. */
  const emit = useCallback((next: string) => onChange(next), [onChange]);

  /* ── Mod türetimleri ── */
  const themeEntry = cls.kind === 'themeVar' ? themePalette?.find((e) => e.key === cls.themeKey) ?? null : null;
  const themeLabel = cls.kind === 'themeVar' ? THEME_COLOR_KEYS.find((k) => k.key === cls.themeKey)?.label ?? cls.themeKey : '';
  /* Studio dışında çözülmüş hex yok: dolgu doğrudan var() ile boyanır. */
  const themeFill = cls.kind === 'themeVar' && cls.themeKey ? themeEntry?.current ?? themeColorVar(cls.themeKey) : '';

  const triggerFill =
    cls.kind === 'color' && cls.parsed
      ? cssColor(cls.parsed.rgb, cls.parsed.alpha)
      : cls.kind === 'themeVar'
        ? themeFill
        : 'transparent';

  /* Popover'a giden renk: showOpacity kapalıyken alpha 1'e sabitlenir; themeVar
     modunda çözülmüş tema rengi (kontrast ve SV başlangıcı için). */
  const popoverColor = useMemo<ParsedColor | null>(() => {
    if (cls.kind === 'color' && cls.parsed) return showOpacity ? cls.parsed : { ...cls.parsed, alpha: 1 };
    if (cls.kind === 'themeVar' && themeEntry) return parseColor(themeEntry.current);
    return null;
  }, [cls, showOpacity, themeEntry]);

  /* ── Metin girdisi ── */
  const shownText = draft ?? cls.raw;
  // Yazılmakta olan kısa hex ("#2", "#2f") hata değildir; yalnız hex alfabesi
  // dışı ya da kapanmış-ama-geçersiz metin kırmızıya döner.
  const textInvalid = draft !== null && draft.trim() !== '' && parseColor(draft) === null && !isColorDraftInProgress(draft);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let t = e.target.value;
    // Salt hex haneleri yazılınca '#' otomatik eklenir; rgb()/hsl() dokunulmaz.
    if (/^[0-9a-f]+$/i.test(t)) t = `#${t}`;
    setDraft(t);
    if (t.trim() === '') {
      emit('');
      return;
    }
    if (isTransientHex4(t)) return;
    if (parseColor(t)) emit(normalizeValue(t, { showOpacity }));
  };

  const handleTextBlur = () => {
    if (draft !== null && isTransientHex4(draft) && parseColor(draft)) emit(normalizeValue(draft, { showOpacity }));
    setDraft(null);
    // Geçersiz taslak depolanan değere döner; geçerliyse son kullanılana yazılır.
    if (!textInvalid && cls.kind === 'color') pushRecent(cls.raw);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape' && draft !== null) {
      e.preventDefault();
      e.stopPropagation();
      setDraft(null);
    }
  };

  /* ── Popover geri çağrıları ── */
  const handlePopoverChange = useCallback((hex: string) => emit(hex), [emit]);
  const handlePickThemeVar = useCallback((key: Parameters<typeof themeColorVar>[0]) => emit(themeColorVar(key)), [emit]);
  const handleClear = useCallback(() => emit(''), [emit]);

  /* ── Bağı kopar ──
     Hedef her zaman kanonik AÇIK değerdir: koyu önizlemede `current` koyu
     paletin hex'ini alana kalıcı yazardı. Studio dışında (palet yok) host
     belgesinin CSS değişkeni efektte okunur — render'da okumak sunucu/istemci
     çıktısını ayrıştırırdı. Çözüm yoksa düğme hiç çizilmez. */
  const [documentVarHex, setDocumentVarHex] = useState<string | null>(null);
  useEffect(() => {
    if (cls.kind !== 'themeVar' || !cls.themeKey || themeEntry) {
      setDocumentVarHex(null);
      return;
    }
    setDocumentVarHex(readThemeVarFromDocument(cls.themeKey));
  }, [cls, themeEntry]);
  const unlinkTarget = cls.kind === 'themeVar' ? (themeEntry?.light ?? documentVarHex) : null;
  const handleUnlink = () => {
    if (unlinkTarget !== null) emit(normalizeValue(unlinkTarget, { showOpacity }));
  };

  const handleReset = () => emit(defaultColor);

  const toggleOpen = () => {
    if (readOnly) return;
    setOpen((o) => !o);
  };

  const closePopover = useCallback(() => {
    setOpen(false);
    // Kapanışta son geçerli hex "son kullanılan"a yazılır (sürükleme sırasında değil).
    if (cls.kind === 'color') pushRecent(cls.raw);
  }, [cls]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' && !open) {
      e.preventDefault();
      toggleOpen();
    }
  };

  const showResetBtn = showReset && value !== defaultColor;
  const chipLabel = cls.kind === 'themeVar' ? `Tema · ${themeLabel}` : cls.raw;

  return (
    <div className="tecof-cp">
      <button
        ref={swatchRef}
        type="button"
        className={`tecof-cp-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Renk seçiciyi aç"
        title="Renk seçiciyi aç"
        disabled={readOnly}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="tecof-cp-trigger-fill" style={{ background: triggerFill }} />
      </button>

      {cls.kind === 'color' || cls.kind === 'empty' ? (
        <input
          type="text"
          inputMode="text"
          spellCheck={false}
          autoComplete="off"
          className={`tecof-cp-input${textInvalid ? ' is-invalid' : ''}`}
          value={shownText}
          placeholder={cls.kind === 'empty' && draft === null ? 'Renk seç…' : placeholder}
          aria-label="Renk değeri"
          aria-invalid={textInvalid || undefined}
          disabled={readOnly}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
        />
      ) : (
        <span className="tecof-cp-chip" title={cls.kind === 'unknown' ? 'CSS değeri' : chipLabel}>
          {/* unknown modunda inline stil YOK: stil dosyasındaki dama zemini görünsün */}
          <span className="tecof-cp-chip-dot" style={cls.kind === 'themeVar' ? { background: themeFill } : undefined} aria-hidden="true" />
          <span className="tecof-cp-chip-label">{chipLabel}</span>
          {cls.kind === 'unknown' && <span className="tecof-cp-chip-hint">CSS değeri</span>}
          {cls.kind === 'themeVar' && unlinkTarget !== null && (
            <button
              type="button"
              className="tecof-cp-chip-unlink"
              aria-label="Bağı kopar"
              title="Bağı kopar"
              disabled={readOnly}
              onClick={handleUnlink}
            >
              <X size={12} />
            </button>
          )}
        </span>
      )}

      {showResetBtn && (
        <button type="button" className="tecof-cp-action" title="Sıfırla" aria-label="Sıfırla" disabled={readOnly} onClick={handleReset}>
          <RotateCcw size={14} />
        </button>
      )}

      {open && !readOnly && swatchRef.current && (
        <ColorPickerPopover
          anchor={swatchRef.current}
          color={popoverColor}
          themeKey={cls.kind === 'themeVar' ? cls.themeKey : null}
          showOpacity={showOpacity}
          swatches={swatches}
          palette={palette}
          contrast={contrast}
          contrastAgainst={contrastAgainst}
          themePalette={themePalette}
          themeVars={themeVars}
          onChange={handlePopoverChange}
          onPickThemeVar={handlePickThemeVar}
          onClear={handleClear}
          onClose={closePopover}
          returnFocusTo={swatchRef.current}
        />
      )}
    </div>
  );
};

ColorField.displayName = 'ColorField';

/* ─── Fabrika (Puck custom field) ─── */

/**
 * Renk seçici alanı üretir.
 *
 * @example
 * ```ts
 * import { createColorField } from '@tecof/theme-editor';
 *
 * fields: {
 *   bgColor: createColorField({ label: 'Arka Plan Rengi' }),
 *   overlay: createColorField({ label: 'Kaplama', showOpacity: true, defaultColor: '#00000080' }),
 *   accent: createColorField({ label: 'Vurgu', themeVars: true }), // var(--theme-color-*) bağlar
 * }
 * ```
 */
export const createColorField = (options: ColorFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;

  return {
    type: 'custom' as const,
    _fieldType: 'color' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: ColorFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <ColorField
            field={field}
            name={name}
            id={id}
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default ColorField;
