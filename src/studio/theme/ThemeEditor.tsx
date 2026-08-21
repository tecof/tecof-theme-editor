import { useRef, useState } from 'react';
import { Trash2, UploadCloud, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { useStudio } from '../context';
import { useTecof } from '../../components/TecofProvider';
import { ColorField } from '../../components/fields/ColorField';
import type { ThemeColors, ThemeConfig, CustomFont } from '../../types';
import { deriveDarkColors, cdnFileUrl } from '../../utils';
import { resolveTheme, THEME_PROP } from './theme';
import { FontSelect } from './FontSelect';
import { findFontByStack, getBuiltinFont, fontIdFromFamily, type ThemeFont } from './fonts';

/** Map a font filename extension to the `@font-face` `format()` hint. */
const FONT_FORMATS: Record<string, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
};

/* ─── Field metadata ─── */

const COLOR_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'primary', label: 'Ana renk' },
  { key: 'secondary', label: 'İkincil' },
  { key: 'accent', label: 'Vurgu' },
  { key: 'background', label: 'Arka plan' },
  { key: 'foreground', label: 'Metin' },
  { key: 'muted', label: 'Soluk' },
  { key: 'mutedForeground', label: 'Soluk metin' },
  { key: 'border', label: 'Kenarlık' },
  { key: 'card', label: 'Kart' },
  { key: 'cardForeground', label: 'Kart metin' },
  { key: 'destructive', label: 'Uyarı' },
];

const SPACING_FIELDS: { key: keyof ThemeConfig['spacing']; label: string }[] = [
  { key: 'containerMaxWidth', label: 'Kapsayıcı maks. (px)' },
  { key: 'sectionPaddingY', label: 'Bölüm dikey boşluk (px)' },
  { key: 'sectionPaddingX', label: 'Bölüm yatay boşluk (px)' },
  { key: 'componentGap', label: 'Bileşen aralığı (px)' },
  { key: 'borderRadius', label: 'Köşe yarıçapı (px)' },
  { key: 'borderRadiusLg', label: 'Köşe — büyük (px)' },
  { key: 'borderRadiusSm', label: 'Köşe — küçük (px)' },
];

/* ─── Small inputs ─── */

const NumberRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <label className="tecof-theme-row">
    <span className="tecof-theme-row-label">{label}</span>
    <input
      type="number"
      className="tecof-theme-num"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
    />
  </label>
);

/* ─── Component ─── */

/**
 * Live theme/design-token editor. Reads the effective theme from the page root
 * props, writes edits back as a full theme override (coalesced into one undo
 * step by setRootProps), and ThemeVars re-applies the CSS variables instantly.
 */
export const ThemeEditor = () => {
  const rootProps = useEditorStore((s) => s.document.root?.props);
  const setRootProps = useEditorStore((s) => s.setRootProps);
  const { config } = useStudio();
  // Panel + reset both resolve against the theme package's own defaults
  // (config.theme), so "sıfırla" returns to the THEME's brand, not the
  // editor's built-ins.
  const theme = resolveTheme(rootProps, config.theme);

  const darkModeEnabled = !!config.darkMode;

  const patch = (next: ThemeConfig) => setRootProps({ [THEME_PROP]: next });
  const setColor = (key: keyof ThemeColors, value: string) =>
    patch({ ...theme, colors: { ...theme.colors, [key]: value } });
  // Dark palette edits mirror light ones, but a missing key falls back to the
  // light value both here (the swatch) and at render time.
  const setDarkColor = (key: keyof ThemeColors, value: string) =>
    patch({ ...theme, darkColors: { ...(theme.darkColors ?? {}), [key]: value } });
  const seedDarkPalette = () => patch({ ...theme, darkColors: deriveDarkColors(theme.colors) });
  const setSpacing = (key: keyof ThemeConfig['spacing'], value: number) =>
    patch({ ...theme, spacing: { ...theme.spacing, [key]: value } });
  const setTypography = (key: keyof ThemeConfig['typography'], value: number | string) =>
    patch({ ...theme, typography: { ...theme.typography, [key]: value } as ThemeConfig['typography'] });

  const { apiClient, cdnUrl } = useTecof();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  // Apply a picked font to a theme family and register a builtin in `theme.fonts`
  // so its `--font-<id>` var + Google Fonts link load. Additive on purpose: a
  // per-node font selection also lives in `theme.fonts`, so recomputing from just
  // the two theme families would drop those. (Custom fonts load via @font-face.)
  const setFont = (key: 'fontFamily' | 'headingFontFamily', font: ThemeFont) => {
    const typography = { ...theme.typography, [key]: font.stack };
    const fonts = theme.fonts ?? [];
    const nextFonts = font.kind === 'builtin' && !fonts.includes(font.id) ? [...fonts, font.id] : fonts;
    patch({ ...theme, typography, fonts: nextFonts });
  };

  const handleFontFile = async (file: File) => {
    if (!apiClient) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!FONT_FORMATS[ext]) {
      setFontError('Desteklenmeyen biçim (woff2/woff/ttf/otf)');
      return;
    }
    setUploading(true);
    setFontError(null);
    try {
      const res = await apiClient.uploadFile(file, 'fonts');
      const uploaded = Array.isArray(res?.data) ? res.data[0] : null;
      const name = uploaded?.name;
      if (!res?.success || !name) throw new Error('upload failed');
      const family = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Custom Font';
      const id = fontIdFromFamily(family);
      /* cdnFileUrl ŞART: @font-face src'i tema JSON'una KALICI yazılır —
         folder'sız kurulan adres scope'lu klasördeki font dosyası için hem
         editörde hem vitrinde 404'tü. */
      const next: CustomFont = { id, family, src: cdnFileUrl(cdnUrl || '', uploaded), format: FONT_FORMATS[ext] };
      const customFonts = [...(theme.customFonts ?? []).filter((f) => f.id !== id), next];
      patch({ ...theme, customFonts });
    } catch {
      setFontError('Yükleme başarısız, tekrar deneyin');
    } finally {
      setUploading(false);
    }
  };

  const removeCustomFont = (id: string) => {
    const customFonts = (theme.customFonts ?? []).filter((f) => f.id !== id);
    // Dropping a custom font that a family still points at falls back to system.
    const stacks = { fontFamily: theme.typography.fontFamily, headingFontFamily: theme.typography.headingFontFamily };
    const typography = { ...theme.typography };
    for (const key of ['fontFamily', 'headingFontFamily'] as const) {
      const f = findFontByStack(stacks[key], theme.customFonts);
      if (f?.kind === 'custom' && f.id === id) {
        typography[key] = getBuiltinFont('system')!.stack;
      }
    }
    patch({ ...theme, customFonts, typography });
  };

  const resetTheme = () => setRootProps({ [THEME_PROP]: undefined });

  /* ── Tema renk varyantları (config.themePresets) ──
     Tema tasarımcısının hazırladığı paletler; tıklama YALNIZ colors (+varsa
     darkColors) alanını değiştirir — tipografi/spacing/font'lara dokunmaz,
     kullanıcı sonrasında tek tek rengi düzenlemeye devam eder. Aktiflik:
     preset'in TÜM renkleri mevcut temayla birebir eşleşiyorsa işaretli. */
  const presets = config.themePresets ?? [];
  const isPresetActive = (preset: (typeof presets)[number]) =>
    Object.entries(preset.colors).every(
      ([k, v]) => String(theme.colors[k as keyof ThemeColors] ?? '').toLowerCase() === String(v).toLowerCase()
    ) &&
    Object.entries(preset.darkColors ?? {}).every(
      ([k, v]) =>
        String(theme.darkColors?.[k as keyof ThemeColors] ?? '').toLowerCase() === String(v).toLowerCase()
    );
  const applyPreset = (preset: (typeof presets)[number]) => {
    /* İki preset tıklaması 500ms içinde TEK undo adımına kaynamasın: her
       palet uygulaması ayrı, geri alınabilir bir adım olmalı. */
    useEditorStore.getState().breakCoalescing();
    const nextColors = { ...theme.colors, ...preset.colors };
    /* Koyu palet senkronu: preset kendi darkColors'ını getiriyorsa üstüne
       yazılır; getirmiyorsa ama temada TÜRETİLMİŞ bir koyu palet varsa yeni
       açık renklerden YENİDEN türetilir — aksi halde önceki paletin koyu
       renkleri yeni paletin altında hayalet gibi kalıyordu. Koyu palet hiç
       yoksa dokunulmaz (kullanıcı seed'lemedi). */
    const nextDark = preset.darkColors
      ? { ...(theme.darkColors ?? {}), ...preset.darkColors }
      : theme.darkColors
        ? deriveDarkColors(nextColors)
        : undefined;
    patch({
      ...theme,
      colors: nextColors,
      ...(nextDark ? { darkColors: nextDark } : {}),
    });
  };
  /* Kart üstündeki mini palet noktaları: en ayırt edici 4 anahtar. */
  const swatchKeys: (keyof ThemeColors)[] = ['primary', 'accent', 'background', 'foreground'];

  return (
    <div className="tecof-theme-editor">
      {presets.length > 0 && (
        <div className="tecof-theme-section">
          <div className="tecof-theme-section-title">Hazır Paletler</div>
          <div className="tecof-theme-presets" role="group" aria-label="Tema renk varyantları">
            {presets.map((preset) => {
              const active = isPresetActive(preset);
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`tecof-theme-preset${active ? ' is-active' : ''}`}
                  title={preset.description || preset.label}
                  aria-pressed={active}
                  onClick={() => applyPreset(preset)}
                >
                  <span className="tecof-theme-preset-swatches" aria-hidden="true">
                    {swatchKeys.map((k) => {
                      const c = preset.colors[k] ?? theme.colors[k];
                      return <span key={k} style={{ background: c }} />;
                    })}
                  </span>
                  <span className="tecof-theme-preset-label">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      <div className="tecof-theme-section">
        <div className="tecof-theme-section-title">Renkler</div>
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="tecof-theme-row">
            <span className="tecof-theme-row-label">{label}</span>
            <div className="tecof-theme-color">
              <ColorField
                field={{}}
                name={`theme-${key}`}
                id={`theme-${key}`}
                value={theme.colors[key]}
                onChange={(v) => setColor(key, v)}
                showReset={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dark-mode colors — only when the host enables config.darkMode. The
          `.dark` class (toggled by the ☀️/🌙 button in the TopBar for preview,
          and by the visitor's toggle on publish) swaps to these values. */}
      {darkModeEnabled && (
        <div className="tecof-theme-section">
          <div className="tecof-theme-section-title">Koyu Mod Renkleri</div>
          <button type="button" className="tecof-font-upload" onClick={seedDarkPalette} title="Açık paletten otomatik koyu palet üret">
            <Sparkles size={14} />
            Koyu palet üret
          </button>
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className="tecof-theme-row">
              <span className="tecof-theme-row-label">{label}</span>
              <div className="tecof-theme-color">
                <ColorField
                  field={{}}
                  name={`theme-dark-${key}`}
                  id={`theme-dark-${key}`}
                  value={theme.darkColors?.[key] ?? theme.colors[key]}
                  onChange={(v) => setDarkColor(key, v)}
                  showReset={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Typography */}
      <div className="tecof-theme-section">
        <div className="tecof-theme-section-title">Tipografi</div>
        <FontSelect
          label="Yazı tipi"
          value={theme.typography.fontFamily}
          customFonts={theme.customFonts}
          onSelect={(font) => setFont('fontFamily', font)}
        />
        <FontSelect
          label="Başlık yazı tipi"
          value={theme.typography.headingFontFamily}
          customFonts={theme.customFonts}
          onSelect={(font) => setFont('headingFontFamily', font)}
        />
        <NumberRow label="Temel boyut (px)" value={theme.typography.baseFontSize} onChange={(v) => setTypography('baseFontSize', v)} />
        <NumberRow label="Satır yüksekliği" value={theme.typography.lineHeight} onChange={(v) => setTypography('lineHeight', v)} />
        <NumberRow label="Kalınlık — normal" value={theme.typography.fontWeightNormal} onChange={(v) => setTypography('fontWeightNormal', v)} />
        <NumberRow label="Kalınlık — orta" value={theme.typography.fontWeightMedium} onChange={(v) => setTypography('fontWeightMedium', v)} />
        <NumberRow label="Kalınlık — kalın" value={theme.typography.fontWeightBold} onChange={(v) => setTypography('fontWeightBold', v)} />
      </div>

      {/* Custom fonts */}
      {apiClient && (
        <div className="tecof-theme-section">
          <div className="tecof-theme-section-title">Özel Fontlar</div>
          {(theme.customFonts ?? []).length > 0 && (
            <div className="tecof-font-list">
              {(theme.customFonts ?? []).map((f) => (
                <div key={f.id} className="tecof-font-list-row">
                  <span className="tecof-font-list-name" style={{ fontFamily: `'${f.family}', sans-serif` }}>
                    {f.family}
                  </span>
                  <span className="tecof-font-list-meta">{f.format}</span>
                  <button
                    type="button"
                    className="tecof-font-list-del"
                    title="Fontu kaldır"
                    aria-label={`${f.family} fontunu kaldır`}
                    onClick={() => removeCustomFont(f.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".woff2,.woff,.ttf,.otf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFontFile(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="tecof-font-upload"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={14} />
            {uploading ? 'Yükleniyor…' : 'Font dosyası yükle'}
          </button>
          {fontError && <div className="tecof-font-error" role="alert">{fontError}</div>}
        </div>
      )}

      {/* Spacing & radius */}
      <div className="tecof-theme-section">
        <div className="tecof-theme-section-title">Boşluk & Köşe</div>
        {SPACING_FIELDS.map(({ key, label }) => (
          <NumberRow key={key} label={label} value={theme.spacing[key]} onChange={(v) => setSpacing(key, v)} />
        ))}
      </div>

      <button type="button" className="tecof-theme-reset" onClick={resetTheme}>
        Temayı varsayılana sıfırla
      </button>
    </div>
  );
};

export default ThemeEditor;
