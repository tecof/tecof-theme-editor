/**
 * ColorField v2 — popover renk seçici (`ColorPickerPopover`).
 *
 * Tek kaydırılabilir popover: biçim anahtarı + pipet, SV alanı, ton/opaklık
 * kaydırıcıları, kanal girdileri, hızlı seçim / tema / Tailwind paleti / son
 * kullanılan nokta satırları ve kontrast çipleri. Renk matematiği `colorMath`,
 * klavye modeli `sliderKeys`, depo `recentColors`'tadır; burada yalnız etkileşim var.
 *
 * Lazy/Suspense YOK: popover yalnız açıkken mount olur; Suspense titremesi bir
 * seçicide kötü UX'tir. `document.body`'ye portallanır (z-index 1000000, node
 * ayarları modalının üstü).
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Pipette } from 'lucide-react';
import { useFloating } from '../../../utils/useFloating';
import type { ThemeColors } from '../../../types';
import { PALETTE_BY_NAME, TAILWIND_PALETTE, TAILWIND_SHADES } from '../../../studio/style/palette';
import {
  clamp,
  compositeOver,
  contrastRatio,
  cssColor,
  findPaletteHex,
  formatColor,
  formatHex,
  hslToHsv,
  hsvToHsl,
  hsvToRgb,
  parseColor,
  rgbToHsv,
  wcagLevel,
  type ColorFormat,
  type HSV,
  type ParsedColor,
  type RGB,
} from './colorMath';
import { pushRecent, readFormat, readRecent, writeFormat } from './recentColors';
import { sliderKeyTarget } from './sliderKeys';
import type { ThemePaletteEntry } from './useThemePalette';

/* ─── Props ─── */

export interface ColorPickerPopoverProps {
  anchor: HTMLElement;
  /** Açılıştaki renk; null = boş (HSV {h:0,s:0,v:1}, alpha 1; ilk etkileşimde emit). */
  color: ParsedColor | null;
  /** Bağlı tema anahtarı (tema noktasında halka). */
  themeKey?: keyof ThemeColors | null;
  showOpacity: boolean;
  swatches: string[];
  palette: boolean;
  contrast: boolean;
  contrastAgainst?: string;
  themePalette: ThemePaletteEntry[] | null;
  themeVars: boolean;
  /** Canlı, rAF kısıtlı, normalize edilmiş hex. */
  onChange: (hex: string) => void;
  onPickThemeVar: (key: keyof ThemeColors) => void;
  onClear: () => void;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
}

const FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl'];

/** Tarayıcı EyeDropper API'si (yalnız Chromium); tip tanımı lib.dom'da yok. */
interface EyeDropperLike {
  open(): Promise<{ sRGBHex?: string }>;
}
const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };
const EMPTY_HSV: HSV = { h: 0, s: 0, v: 1 };

/** Tab döngüsü: yalnız gerçekten sekmeyle ulaşılabilen öğeler (roving −1'ler hariç). */
const TABBABLE = 'button:not([disabled]):not([tabindex="-1"]),[tabindex="0"],input:not([disabled])';

/* ─── Sürükleme ───
 * setPointerCapture: işaretçi kanvas iframe'inin üstüne çıksa da olaylar bu
 * öğeye gelmeye devam eder (v1'de window dinleyicisi iframe'de kayboluyordu). */
interface DragHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
}

const useDrag = (onPoint: (nx: number, ny: number) => void, onEnd: () => void): DragHandlers => {
  const dragging = useRef(false);
  const apply = (e: ReactPointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onPoint(
      rect.width ? clamp((e.clientX - rect.left) / rect.width, 0, 1) : 0,
      rect.height ? clamp((e.clientY - rect.top) / rect.height, 0, 1) : 0
    );
  };
  const end = (e: ReactPointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* yakalama zaten bırakılmış */
    }
    onEnd();
  };
  return {
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // preventDefault metin seçimini ve mousedown odak taşımasını keser; odak elle verilir.
      e.preventDefault();
      e.currentTarget.focus({ preventScroll: true });
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* eski tarayıcı — yakalama olmadan da öğe üstünde çalışır */
      }
      dragging.current = true;
      apply(e);
    },
    onPointerMove: (e) => {
      if (dragging.current) apply(e);
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
};

/* ─── SV alanı ─── */

interface SvAreaProps {
  hsv: HSV;
  hueHex: string;
  thumbColor: string;
  svRef: RefObject<HTMLDivElement | null>;
  onLive: (s: number, v: number) => void;
  onCommit: (s: number, v: number) => void;
  onDragEnd: () => void;
}

const SvArea = ({ hsv, hueHex, thumbColor, svRef, onLive, onCommit, onDragEnd }: SvAreaProps) => {
  const drag = useDrag((nx, ny) => onLive(nx, 1 - ny), onDragEnd);
  const sPct = Math.round(hsv.s * 100);
  const vPct = Math.round(hsv.v * 100);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    const horizontal = k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End';
    const vertical = k === 'ArrowUp' || k === 'ArrowDown';
    if (!horizontal && !vertical) return;
    const opts = { min: 0, max: 100, step: 1, shiftStep: 10 };
    if (horizontal) {
      const t = sliderKeyTarget(k, e.shiftKey, sPct, opts);
      if (t === null) return;
      e.preventDefault();
      onCommit(t / 100, hsv.v);
    } else {
      const t = sliderKeyTarget(k, e.shiftKey, vPct, opts);
      if (t === null) return;
      e.preventDefault();
      onCommit(hsv.s, t / 100);
    }
  };

  return (
    <div
      ref={svRef}
      className="tecof-cp-sv"
      style={{ background: hueHex }}
      tabIndex={0}
      role="slider"
      aria-label="Doygunluk ve parlaklık"
      aria-roledescription="iki boyutlu kaydırıcı"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={sPct}
      aria-valuetext={`Doygunluk %${sPct}, parlaklık %${vPct}`}
      onKeyDown={onKeyDown}
      {...drag}
    >
      <div className="tecof-cp-sv-white" />
      <div className="tecof-cp-sv-black" />
      <div
        className="tecof-cp-sv-thumb"
        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: thumbColor }}
      />
    </div>
  );
};

/* ─── Ton / opaklık kaydırıcısı ─── */

interface TrackProps {
  variant: 'hue' | 'alpha';
  /** 0..1 */
  value: number;
  ariaLabel: string;
  ariaMax: number;
  ariaNow: number;
  thumbColor: string;
  fill?: string;
  onLive: (n: number) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

const Track = ({ variant, value, ariaLabel, ariaMax, ariaNow, thumbColor, fill, onLive, onKeyDown, onDragEnd }: TrackProps) => {
  const drag = useDrag((nx) => onLive(nx), onDragEnd);
  return (
    <div
      className={`tecof-cp-track is-${variant}`}
      tabIndex={0}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={ariaMax}
      aria-valuenow={ariaNow}
      onKeyDown={onKeyDown}
      {...drag}
    >
      {fill && <div className="tecof-cp-track-fill" style={{ background: fill }} />}
      <div className="tecof-cp-thumb" style={{ left: `${value * 100}%`, background: thumbColor }} />
    </div>
  );
};

/* ─── Kanal girdileri ─── */

interface NumberChannelProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
}

const parseInt10 = (text: string, min: number, max: number): number | null => {
  const t = text.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n);
};

/** Tek sayısal kanal: taslak yalnız odaktayken yaşar, geçerli her değişimde emit. */
const NumberChannel = ({ label, value, min, max, onCommit }: NumberChannelProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(Math.round(value));
  const invalid = draft !== null && parseInt10(draft, min, max) === null;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const t = sliderKeyTarget(e.key, e.shiftKey, Math.round(value), { min, max, step: 1, shiftStep: 10 });
      if (t === null) return;
      setDraft(String(t));
      onCommit(t);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const n = parseInt10(shown, min, max);
      if (n !== null) onCommit(n);
      setDraft(null);
      e.currentTarget.blur();
    } else if (e.key === 'Escape' && draft !== null) {
      // Esc taslak varken yalnız girdiyi geri alır (bir Esc = bir katman); taslak
      // yoksa olay window'daki dinleyiciye çıkar ve popover kapanır — aksi halde
      // kanal girdisinde odak varken popover Esc ile hiç kapanmazdı.
      e.preventDefault();
      e.stopPropagation();
      setDraft(null);
    }
  };

  return (
    <label className="tecof-cp-channel-wrap">
      <input
        type="text"
        inputMode="decimal"
        className={`tecof-cp-channel${invalid ? ' is-invalid' : ''}`}
        value={shown}
        aria-label={label}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseInt10(e.target.value, min, max);
          if (n !== null) onCommit(n);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setDraft(null)}
      />
      <span className="tecof-cp-channel-label">{label}</span>
    </label>
  );
};

interface HexChannelProps {
  hex: string;
  onCommit: (parsed: ParsedColor) => void;
  onBlur: () => void;
}

/** 4 haneli hex yazarken geçici (#fff0 = şeffaf beyaz); canlı emit atlanır, Enter/blur uygular. */
const isTransientHex4 = (t: string): boolean => /^#[0-9a-f]{4}$/i.test(t.trim());

/**
 * Yazılmakta olan geçerli bir başlangıç mı? Kısa hex ("#2", "#2f") ve henüz
 * parantezi kapanmamış rgb()/hsl() hata sayılmaz; her tuşta kırmızıya dönen
 * bir girdi "yanlış bir şey yaptım" izlenimi verir. Kapanmış ama parse
 * edilemeyen ya da hex alfabesi dışı karakter içeren metin hemen işaretlenir.
 */
export const isColorDraftInProgress = (t: string): boolean => {
  const v = t.trim();
  if (/^#?[0-9a-f]{0,8}$/i.test(v)) return true;
  return /^(rgb|hsl)a?\(/i.test(v) && !v.includes(')');
};

const HexChannel = ({ hex, onCommit, onBlur }: HexChannelProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? hex;
  const invalid = draft !== null && draft.trim() !== '' && parseColor(draft) === null && !isColorDraftInProgress(draft);

  const commit = (text: string) => {
    const parsed = parseColor(text);
    if (parsed) onCommit(parsed);
  };

  return (
    <label className="tecof-cp-channel-wrap is-wide">
      <input
        type="text"
        inputMode="text"
        spellCheck={false}
        autoComplete="off"
        className={`tecof-cp-channel${invalid ? ' is-invalid' : ''}`}
        value={shown}
        aria-label="HEX"
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          let t = e.target.value;
          if (/^[0-9a-f]+$/i.test(t)) t = `#${t}`;
          setDraft(t);
          if (!isTransientHex4(t)) commit(t);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(shown);
            setDraft(null);
            e.currentTarget.blur();
          } else if (e.key === 'Escape' && draft !== null) {
            // Taslak yoksa Esc popover'a ulaşsın (NumberChannel ile aynı kural).
            e.preventDefault();
            e.stopPropagation();
            setDraft(null);
          }
        }}
        onBlur={() => {
          if (draft !== null && isTransientHex4(draft)) commit(draft);
          setDraft(null);
          onBlur();
        }}
      />
      <span className="tecof-cp-channel-label">HEX</span>
    </label>
  );
};

/* ─── Nokta satırı (roving tabindex) ─── */

interface Dot {
  id: string;
  /** CSS dolgusu (hex/rgba/var). */
  css: string;
  /**
   * Kopya modunda alana yazılacak değer; yoksa `css`. Tema noktasında dolgu
   * önizlemede GÖRÜNEN (koyu olabilir) renktir, kopya ise kanonik AÇIK değer —
   * koyu önizlemede tıklanınca alana koyu paletin hex'i kalıcı yazılmasın.
   */
  copyCss?: string;
  /** aria-label ve title. */
  label: string;
  title?: string;
  active?: boolean;
  /** 0..1; <1 ise dama zemini görünür. */
  alpha?: number;
}

interface DotRowProps {
  dots: Dot[];
  ariaLabel: string;
  className?: string;
  dotClassName?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  onPick: (dot: Dot, index: number) => void;
  onExitUp?: () => void;
  onExitDown?: () => void;
}

const dotStyle = (dot: Dot): CSSProperties => {
  const a = dot.alpha ?? 1;
  // Yarı saydam nokta: dolgu CSS değişkeniyle verilir, dama zemini stil dosyasında.
  if (a < 1) return { ['--tecof-cp-fill' as string]: dot.css } as CSSProperties;
  return { background: dot.css };
};

const DotRow = ({ dots, ariaLabel, className = 'tecof-cp-dots', dotClassName = 'tecof-cp-dot', containerRef, onPick, onExitUp, onExitDown }: DotRowProps) => {
  const [cursor, setCursor] = useState(() => Math.max(0, dots.findIndex((d) => d.active)));
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = Math.min(cursor, Math.max(0, dots.length - 1));

  const focusAt = (i: number) => {
    setCursor(i);
    buttons.current[i]?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const n = dots.length;
    if (!n) return;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusAt((cur + 1) % n);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusAt((cur - 1 + n) % n);
        break;
      case 'Home':
        e.preventDefault();
        focusAt(0);
        break;
      case 'End':
        e.preventDefault();
        focusAt(n - 1);
        break;
      case 'ArrowDown':
        if (onExitDown) {
          e.preventDefault();
          onExitDown();
        }
        break;
      case 'ArrowUp':
        if (onExitUp) {
          e.preventDefault();
          onExitUp();
        }
        break;
      default:
    }
  };

  return (
    <div ref={containerRef} className={className} role="group" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {dots.map((dot, i) => {
        const a = dot.alpha ?? 1;
        const cls = `${dotClassName}${dot.active ? ' is-active' : ''}${a < 1 ? ' is-alpha' : ''}${a === 0 ? ' is-transparent' : ''}`;
        return (
          <button
            key={dot.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            className={cls}
            style={dotStyle(dot)}
            tabIndex={i === cur ? 0 : -1}
            aria-label={dot.label}
            aria-pressed={!!dot.active}
            title={dot.title ?? dot.label}
            onFocus={() => setCursor(i)}
            onClick={() => onPick(dot, i)}
          />
        );
      })}
    </div>
  );
};

/** Bir satırın o anki sekme durağını odaklar (hue ↔ ton geçişi). */
const focusRowStop = (row: HTMLDivElement | null) => {
  row?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
};

/* ─── Tailwind paleti ─── */

interface PaletteSectionProps {
  currentHex: string;
  onPick: (hex: string) => void;
}

const PaletteSection = ({ currentHex, onPick }: PaletteSectionProps) => {
  const match = findPaletteHex(currentHex);
  const matchHue = match?.hue ?? null;
  // Aktif hue: eşleşme varsa o; yoksa son gezilen (varsayılan mavi). Eşleşme
  // DEĞİŞTİĞİNDE gezilen hue ona çekilir — render sırasında "önceki render"
  // deseni, effect + ek render gerekmez.
  const [activeHue, setActiveHue] = useState(matchHue ?? 'blue');
  const [seenMatch, setSeenMatch] = useState(matchHue);
  if (matchHue !== seenMatch) {
    setSeenMatch(matchHue);
    if (matchHue) setActiveHue(matchHue);
  }
  const hueRow = useRef<HTMLDivElement>(null);
  const shadeRow = useRef<HTMLDivElement>(null);

  const hueDots = useMemo<Dot[]>(
    () => TAILWIND_PALETTE.map((h) => ({ id: h.name, css: h.shades['500'], label: h.label, active: h.name === activeHue })),
    [activeHue]
  );
  const hue = PALETTE_BY_NAME[activeHue] ?? PALETTE_BY_NAME.blue;
  const shadeDots = useMemo<Dot[]>(
    () =>
      TAILWIND_SHADES.map((s) => ({
        id: `${hue.name}-${s}`,
        css: hue.shades[s],
        label: `${hue.label} ${s} — ${hue.shades[s]}`,
        active: match?.hue === hue.name && match.shade === s,
      })),
    [hue, match]
  );

  return (
    <section className="tecof-cp-section">
      <div className="tecof-cp-section-title">Palet</div>
      <DotRow
        dots={hueDots}
        ariaLabel="Palet tonları"
        className="tecof-cp-hues"
        dotClassName="tecof-cp-hue"
        containerRef={hueRow}
        onPick={(d) => setActiveHue(d.id)}
        onExitDown={() => focusRowStop(shadeRow.current)}
      />
      <DotRow
        dots={shadeDots}
        ariaLabel={`${hue.label} tonları`}
        className="tecof-cp-dots tecof-cp-shades"
        containerRef={shadeRow}
        onPick={(d) => onPick(d.css)}
        onExitUp={() => focusRowStop(hueRow.current)}
      />
    </section>
  );
};

/* ─── Kontrast çipleri ─── */

interface ContrastBase {
  label: string;
  rgb: RGB;
}

const LEVEL_TEXT = {
  AAA: { badge: 'AAA', cls: 'is-aaa', desc: 'AAA (normal metin)' },
  AA: { badge: 'AA', cls: 'is-aa', desc: 'AA (normal metin)' },
  'AA-large': { badge: 'AA+', cls: 'is-large', desc: 'AA (yalnız büyük metin)' },
  fail: { badge: '—', cls: 'is-fail', desc: 'yetersiz' },
} as const;

const ContrastChips = ({ rgb, alpha, bases }: { rgb: RGB; alpha: number; bases: ContrastBase[] }) => (
  <div className="tecof-cp-contrast" aria-label="Kontrast">
    {bases.map((b) => {
      // Yarı saydam renk zemin üstüne bileşik edilir — göz gerçekten bunu görür.
      const fg = compositeOver(rgb, alpha, b.rgb);
      const ratio = contrastRatio(fg, b.rgb);
      const level = LEVEL_TEXT[wcagLevel(ratio)];
      const text = `${b.label} · Kontrast ${ratio.toFixed(1)}:1 — ${level.desc}`;
      return (
        <span key={b.label} className="tecof-cp-contrast-chip" title={text} aria-label={text}>
          <span className="tecof-cp-contrast-sample" style={{ background: formatHex(b.rgb), color: formatHex(fg) }} aria-hidden="true">
            Aa
          </span>
          <span className="tecof-cp-contrast-ratio">{ratio.toFixed(1)}:1</span>
          <span className={`tecof-cp-contrast-badge ${level.cls}`}>{level.badge}</span>
        </span>
      );
    })}
  </div>
);

/* ─── Popover ─── */

export const ColorPickerPopover = ({
  anchor,
  color,
  themeKey,
  showOpacity,
  swatches,
  palette,
  contrast,
  contrastAgainst,
  themePalette,
  themeVars,
  onChange,
  onPickThemeVar,
  onClear,
  onClose,
  returnFocusTo,
}: ColorPickerPopoverProps) => {
  const { floatingRef, style: floatingStyle, side } = useFloating({ anchor, open: true, placement: 'bottom-start', offset: 6 });

  /* Popover HSV+alpha'yı YEREL tutar: hex'ten her render'da türetmek s=0/v=0'da
     tonu sıfırlar (gri/siyah h=0'a döner) ve sürüklemede seçici zıplar. */
  const [hsv, setHsv] = useState<HSV>(() => (color ? rgbToHsv(color.rgb) : EMPTY_HSV));
  const [alpha, setAlpha] = useState<number>(() => (color ? color.alpha : 1));
  /** Boş/temizlenmiş durum: önizleme dama, kontrast gizli; ilk etkileşim yeniden emit eder. */
  const [cleared, setCleared] = useState(color === null);
  const [format, setFormat] = useState<ColorFormat>(() => readFormat());

  const svRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onCloseRef = useRef(onClose);
  const returnFocusRef = useRef(returnFocusTo);
  useEffect(() => {
    onChangeRef.current = onChange;
    onCloseRef.current = onClose;
    returnFocusRef.current = returnFocusTo;
  });

  /* Son kullanılan: popover açıkken DONDURULUR — sürüklerken nokta sırası kaymasın. */
  const recentRef = useRef<string[] | null>(null);
  if (recentRef.current === null) recentRef.current = readRecent();

  /* ── Emit: rAF ile kare başına en fazla bir onChange ── */
  const lastEmittedRef = useRef<string>(color ? formatHex(color.rgb, showOpacity ? color.alpha : 1) : '');
  const pendingRef = useRef<string | null>(null);
  const frameRef = useRef(0);

  const emitNow = useCallback((next: string) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    pendingRef.current = null;
    lastEmittedRef.current = next;
    onChangeRef.current(next);
  }, []);

  const scheduleEmit = useCallback((next: string) => {
    pendingRef.current = next;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const v = pendingRef.current;
      pendingRef.current = null;
      if (v !== null) {
        lastEmittedRef.current = v;
        onChangeRef.current(v);
      }
    });
  }, []);

  /** Sürükleme bitince bekleyen kareyi hemen gönder (kapanışta kayıp olmasın). */
  const flushEmit = useCallback(() => {
    if (!frameRef.current) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    const v = pendingRef.current;
    pendingRef.current = null;
    if (v !== null) {
      lastEmittedRef.current = v;
      onChangeRef.current(v);
    }
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  /* Dışarıdan gelen renk yalnız bizim yankımız değilse yerel duruma yazılır. */
  useEffect(() => {
    const incoming = color ? formatHex(color.rgb, showOpacity ? color.alpha : 1) : '';
    if (incoming === lastEmittedRef.current) return;
    lastEmittedRef.current = incoming;
    if (color) {
      setHsv(rgbToHsv(color.rgb));
      setAlpha(color.alpha);
      setCleared(false);
    } else {
      setCleared(true);
    }
  }, [color, showOpacity]);

  /* ── Uygulama modları: live (rAF), commit (anında), pick (anında + son kullanılan) ── */
  const applyColor = useCallback(
    (nextHsv: HSV, nextAlpha: number, mode: 'live' | 'commit' | 'pick') => {
      setHsv(nextHsv);
      setAlpha(nextAlpha);
      setCleared(false);
      const next = formatHex(hsvToRgb(nextHsv), showOpacity ? nextAlpha : 1);
      if (mode === 'live') {
        scheduleEmit(next);
        return;
      }
      emitNow(next);
      if (mode === 'pick') pushRecent(next);
    },
    [showOpacity, scheduleEmit, emitNow]
  );

  /** Ayrık seçim (nokta/pipet): parse edilmiş rengi uygular; alpha yoksa mevcut korunur. */
  const pickParsed = useCallback(
    (parsed: ParsedColor, keepAlpha: boolean) => {
      applyColor(rgbToHsv(parsed.rgb), keepAlpha ? alpha : parsed.alpha, 'pick');
    },
    [applyColor, alpha]
  );

  const pickCss = useCallback(
    (css: string, keepAlpha: boolean) => {
      const parsed = parseColor(css);
      if (parsed) pickParsed(parsed, keepAlpha);
    },
    [pickParsed]
  );

  /* ── Türetilenler ── */
  const rgb = hsvToRgb(hsv);
  const effectiveAlpha = showOpacity ? alpha : 1;
  const currentHex = formatHex(rgb, effectiveAlpha);
  const hueHex = formatHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));
  const previewCss = cssColor(rgb, effectiveAlpha);
  const opaqueHex = formatHex(rgb, 1);
  const hsl = hsvToHsl(hsv);

  /* ── Açılış/kapanış: odak, dış tıklama, Esc ── */
  useEffect(() => {
    const id = requestAnimationFrame(() => svRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (floatingRef.current?.contains(t) || anchor.contains(t)) return;
      onCloseRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onCloseRef.current();
    };
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [anchor, floatingRef]);

  /* Odak iadesi: layout cleanup'ta popover DOM'u hâlâ yerinde — odak içerideyse
     (Esc/tetikleyici) swatch düğmesine döner; kullanıcı başka bir girdiye
     tıkladıysa (odak dışarıda) çalınmaz. */
  useLayoutEffect(
    () => () => {
      const active = document.activeElement;
      const inside = !!active && !!floatingRef.current?.contains(active);
      if (!active || active === document.body || inside) returnFocusRef.current?.focus({ preventScroll: true });
    },
    [floatingRef]
  );

  const handleRootKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const root = floatingRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE));
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ── Biçim ── */
  const setFormatPref = (f: ColorFormat) => {
    setFormat(f);
    writeFormat(f);
  };
  const formatKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = FORMATS.indexOf(format);
    const next = FORMATS[(i + (e.key === 'ArrowRight' ? 1 : FORMATS.length - 1)) % FORMATS.length];
    setFormatPref(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>('button')[FORMATS.indexOf(next)]?.focus();
  };

  /* ── Pipet: kontrol render anında (SSR'da window yok; modül yüklenirken bakılmaz) ── */
  const eyeDropperOk = useMemo(() => typeof window !== 'undefined' && 'EyeDropper' in window, []);
  const pickEyeDropper = async () => {
    try {
      const Ctor = (window as unknown as { EyeDropper?: new () => EyeDropperLike }).EyeDropper;
      if (!Ctor) return;
      const res = await new Ctor().open();
      if (res?.sRGBHex) pickCss(res.sRGBHex, true);
    } catch {
      /* AbortError: kullanıcı vazgeçti */
    }
  };

  /* ── Kaydırıcı klavyesi ── */
  const hueKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const t = sliderKeyTarget(e.key, e.shiftKey, Math.round(hsv.h), { min: 0, max: 359, step: 1, shiftStep: 10, page: 30, wrap: true });
    if (t === null) return;
    e.preventDefault();
    applyColor({ ...hsv, h: t }, alpha, 'commit');
  };
  const alphaKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const t = sliderKeyTarget(e.key, e.shiftKey, Math.round(alpha * 100), { min: 0, max: 100, step: 1, shiftStep: 10, page: 10 });
    if (t === null) return;
    e.preventDefault();
    applyColor(hsv, t / 100, 'commit');
  };

  /* ── Nokta satırları ── */
  const swatchDots = useMemo<Dot[]>(
    () =>
      swatches.flatMap((sw) => {
        const p = parseColor(sw);
        if (!p) return [];
        const hex = formatHex(p.rgb, p.alpha);
        return [{ id: hex, css: cssColor(p.rgb, p.alpha), label: hex, alpha: p.alpha, active: !cleared && hex === currentHex }];
      }),
    [swatches, currentHex, cleared]
  );

  const themeDots = useMemo<Dot[]>(() => {
    if (!themePalette) return [];
    return themePalette.map((e) => ({
      id: e.key,
      css: e.current,
      copyCss: e.light,
      label: `Tema · ${e.label} — ${e.current}`,
      title: e.dark !== e.light ? `Tema · ${e.label} — açık ${e.light} · koyu ${e.dark}` : `Tema · ${e.label} — ${e.light}`,
      active: themeKey === e.key,
    }));
  }, [themePalette, themeKey]);

  const recentDots = useMemo<Dot[]>(
    () =>
      (recentRef.current ?? []).flatMap((hex) => {
        const p = parseColor(hex);
        if (!p) return [];
        return [{ id: hex, css: cssColor(p.rgb, p.alpha), label: hex, alpha: p.alpha, active: !cleared && hex === currentHex }];
      }),
    [currentHex, cleared]
  );

  /* ── Kontrast zeminleri ── */
  const contrastBases = useMemo<ContrastBase[]>(() => {
    if (contrastAgainst) {
      const p = parseColor(contrastAgainst);
      return [{ label: 'Zemin', rgb: p ? p.rgb : WHITE }];
    }
    if (themePalette) {
      const bg = themePalette.find((e) => e.key === 'background');
      const fg = themePalette.find((e) => e.key === 'foreground');
      return [
        { label: 'Zemin', rgb: parseColor(bg?.current ?? '')?.rgb ?? WHITE },
        { label: 'Metin', rgb: parseColor(fg?.current ?? '')?.rgb ?? BLACK },
      ];
    }
    return [
      { label: 'Zemin', rgb: WHITE },
      { label: 'Metin', rgb: BLACK },
    ];
  }, [contrastAgainst, themePalette]);

  /* ── Alt eylemler ── */
  const makeTransparent = () => applyColor({ h: hsv.h, s: 0, v: 0 }, 0, 'commit');
  const handleClear = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    pendingRef.current = null;
    lastEmittedRef.current = '';
    setCleared(true);
    onClear();
  };

  const channelInputs =
    format === 'rgb' ? (
      <>
        <NumberChannel label="R" value={rgb.r} min={0} max={255} onCommit={(n) => applyColor(rgbToHsv({ ...rgb, r: n }), alpha, 'commit')} />
        <NumberChannel label="G" value={rgb.g} min={0} max={255} onCommit={(n) => applyColor(rgbToHsv({ ...rgb, g: n }), alpha, 'commit')} />
        <NumberChannel label="B" value={rgb.b} min={0} max={255} onCommit={(n) => applyColor(rgbToHsv({ ...rgb, b: n }), alpha, 'commit')} />
      </>
    ) : format === 'hsl' ? (
      <>
        <NumberChannel label="H" value={hsl.h} min={0} max={360} onCommit={(n) => applyColor(hslToHsv({ ...hsl, h: n }), alpha, 'commit')} />
        <NumberChannel label="S" value={hsl.s} min={0} max={100} onCommit={(n) => applyColor(hslToHsv({ ...hsl, s: n }), alpha, 'commit')} />
        <NumberChannel label="L" value={hsl.l} min={0} max={100} onCommit={(n) => applyColor(hslToHsv({ ...hsl, l: n }), alpha, 'commit')} />
      </>
    ) : (
      <HexChannel
        hex={cleared ? '' : currentHex}
        onCommit={(p) => applyColor(rgbToHsv(p.rgb), showOpacity ? p.alpha : 1, 'commit')}
        onBlur={() => {
          if (!cleared) pushRecent(currentHex);
        }}
      />
    );

  return createPortal(
    <div
      ref={floatingRef}
      className="tecof-cp-popover"
      data-side={side}
      style={floatingStyle}
      role="dialog"
      aria-label="Renk seçici"
      onKeyDown={handleRootKeyDown}
    >
      <div className="tecof-cp-head">
        <div className="tecof-cp-formats" role="radiogroup" aria-label="Biçim" onKeyDown={formatKeyDown}>
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={format === f}
              tabIndex={format === f ? 0 : -1}
              className={`tecof-cp-format${format === f ? ' is-active' : ''}`}
              onClick={() => setFormatPref(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        {eyeDropperOk && (
          <button type="button" className="tecof-cp-eyedropper" aria-label="Ekrandan renk seç" title="Ekrandan renk seç" onClick={pickEyeDropper}>
            <Pipette size={14} />
          </button>
        )}
      </div>

      <SvArea
        hsv={hsv}
        hueHex={hueHex}
        thumbColor={opaqueHex}
        svRef={svRef}
        onLive={(s, v) => applyColor({ h: hsv.h, s, v }, alpha, 'live')}
        onCommit={(s, v) => applyColor({ h: hsv.h, s, v }, alpha, 'commit')}
        onDragEnd={flushEmit}
      />

      <div className="tecof-cp-sliders">
        <span className="tecof-cp-preview" aria-hidden="true">
          <span className="tecof-cp-preview-fill" style={{ background: cleared ? 'transparent' : previewCss }} />
        </span>
        <div className="tecof-cp-tracks">
          <Track
            variant="hue"
            value={hsv.h / 360}
            ariaLabel="Ton"
            ariaMax={360}
            ariaNow={Math.round(hsv.h)}
            thumbColor={hueHex}
            onLive={(nx) => applyColor({ ...hsv, h: clamp(nx * 360, 0, 359.999) }, alpha, 'live')}
            onKeyDown={hueKeyDown}
            onDragEnd={flushEmit}
          />
          {showOpacity && (
            <Track
              variant="alpha"
              value={alpha}
              ariaLabel="Opaklık"
              ariaMax={100}
              ariaNow={Math.round(alpha * 100)}
              thumbColor={previewCss}
              fill={`linear-gradient(to right, transparent, ${opaqueHex})`}
              onLive={(nx) => applyColor(hsv, nx, 'live')}
              onKeyDown={alphaKeyDown}
              onDragEnd={flushEmit}
            />
          )}
        </div>
      </div>

      <div className="tecof-cp-channels" title={cleared ? undefined : formatColor(rgb, effectiveAlpha, format)}>
        {channelInputs}
        {showOpacity && (
          <NumberChannel label="A" value={alpha * 100} min={0} max={100} onCommit={(n) => applyColor(hsv, n / 100, 'commit')} />
        )}
      </div>

      {swatchDots.length > 0 && (
        <section className="tecof-cp-section">
          <div className="tecof-cp-section-title">Hızlı seçim</div>
          <DotRow dots={swatchDots} ariaLabel="Hızlı seçim" onPick={(d) => pickCss(d.id, false)} />
        </section>
      )}

      {themeDots.length > 0 && (
        <section className="tecof-cp-section">
          <div className="tecof-cp-section-title">Tema</div>
          <DotRow
            dots={themeDots}
            ariaLabel="Tema renkleri"
            onPick={(d) => {
              /* themeVars: var() bağı (chip modu); değilse kanonik AÇIK hex kopyalanır
                 (copyCss) — nokta koyu önizlemede koyu görünse de yayın değeri açık palettir. */
              if (themeVars) onPickThemeVar(d.id as keyof ThemeColors);
              else pickCss(d.copyCss ?? d.css, true);
            }}
          />
        </section>
      )}

      {palette && <PaletteSection currentHex={cleared ? '' : opaqueHex} onPick={(hex) => pickCss(hex, true)} />}

      {recentDots.length > 0 && (
        <section className="tecof-cp-section">
          <div className="tecof-cp-section-title">Son kullanılan</div>
          <DotRow dots={recentDots} ariaLabel="Son kullanılan" onPick={(d) => pickCss(d.id, false)} />
        </section>
      )}

      <div className="tecof-cp-foot">
        {contrast && !cleared ? <ContrastChips rgb={rgb} alpha={effectiveAlpha} bases={contrastBases} /> : <span />}
        <div className="tecof-cp-foot-actions">
          {showOpacity && (
            <button type="button" className="tecof-cp-foot-btn" onClick={makeTransparent}>
              Şeffaf
            </button>
          )}
          <button type="button" className="tecof-cp-foot-btn" onClick={handleClear}>
            Temizle
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

ColorPickerPopover.displayName = 'ColorPickerPopover';

export default ColorPickerPopover;
