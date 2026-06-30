import { useEditorStore } from '../../engine/store';
import { ColorField } from '../../components/fields/ColorField';
import type { ThemeColors, ThemeConfig } from '../../types';
import { resolveTheme, THEME_PROP } from './theme';

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

const TextRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="tecof-theme-row tecof-theme-row-stack">
    <span className="tecof-theme-row-label">{label}</span>
    <input
      type="text"
      className="tecof-theme-text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
  const theme = resolveTheme(rootProps);

  const patch = (next: ThemeConfig) => setRootProps({ [THEME_PROP]: next });
  const setColor = (key: keyof ThemeColors, value: string) =>
    patch({ ...theme, colors: { ...theme.colors, [key]: value } });
  const setSpacing = (key: keyof ThemeConfig['spacing'], value: number) =>
    patch({ ...theme, spacing: { ...theme.spacing, [key]: value } });
  const setTypography = (key: keyof ThemeConfig['typography'], value: number | string) =>
    patch({ ...theme, typography: { ...theme.typography, [key]: value } as ThemeConfig['typography'] });

  const resetTheme = () => setRootProps({ [THEME_PROP]: undefined });

  return (
    <div className="tecof-theme-editor">
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

      {/* Typography */}
      <div className="tecof-theme-section">
        <div className="tecof-theme-section-title">Tipografi</div>
        <TextRow label="Yazı tipi" value={theme.typography.fontFamily} onChange={(v) => setTypography('fontFamily', v)} />
        <TextRow label="Başlık yazı tipi" value={theme.typography.headingFontFamily} onChange={(v) => setTypography('headingFontFamily', v)} />
        <NumberRow label="Temel boyut (px)" value={theme.typography.baseFontSize} onChange={(v) => setTypography('baseFontSize', v)} />
        <NumberRow label="Satır yüksekliği" value={theme.typography.lineHeight} onChange={(v) => setTypography('lineHeight', v)} />
        <NumberRow label="Kalınlık — normal" value={theme.typography.fontWeightNormal} onChange={(v) => setTypography('fontWeightNormal', v)} />
        <NumberRow label="Kalınlık — orta" value={theme.typography.fontWeightMedium} onChange={(v) => setTypography('fontWeightMedium', v)} />
        <NumberRow label="Kalınlık — kalın" value={theme.typography.fontWeightBold} onChange={(v) => setTypography('fontWeightBold', v)} />
      </div>

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
