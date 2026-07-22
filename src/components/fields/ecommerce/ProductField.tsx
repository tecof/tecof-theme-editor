/**
 * Ürün seçici — tekli ve çoklu.
 *
 * Diğer seçicilerden ayrı bir bileşen olmasının sebebi ARAMANIN YERİ: etiket,
 * marka, kupon gibi listeler onlarca kayıttır ve bir kez çekilip istemcide
 * süzülür. Ürünler ise binlerce olabilir; bu yüzden arama SUNUCUDA yapılır
 * (`/api/store/ecommerce/products` gerçek metin araması destekler) ve sonuçlar
 * önbelleklenmez.
 *
 * Değer, ürün detay bağlantısı için `slug`, filtre/eşleştirme için `id` ve
 * listede göstermek için ad+görsel taşır — yayında ek istek gerekmez.
 */

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { ChevronUp, ChevronDown, Package, X } from 'lucide-react';
import { FieldLabel } from '../FieldLabel';
import { FieldErrorBoundary } from '../FieldErrorBoundary';
import { useTecof } from '../../TecofProvider';
import { useLanguages } from '../useLanguages';
import { useActiveLanguage } from '../../../studio/language/LanguageContext';
import { PickerShell, PickerRow } from './EcommerceField';
import { readLang, rowsOf, type EcommerceOption } from './sources';

export type ProductFieldValue = {
  id: string;
  slug: string;
  name: string;
  /** İlk görselin upload kaydı — kart önizlemesi için. */
  image?: unknown;
};

export interface ProductFieldOptions {
  label?: string;
  labelIcon?: ReactElement;
  placeholder?: string;
  visible?: boolean;
  /** Çoklu seçim — değer dizidir, editördeki sıra korunur. */
  multiple?: boolean;
  /** Çoklu modda üst sınır. */
  max?: number;
  /** Aramayı tek kategoriyle sınırla (kategori slug'ı). */
  category?: string;
}

const idOf = (value: any): string => (value && typeof value === 'object' ? String(value.id ?? '') : '');

const ProductFieldInner = ({
  options: fieldOptions,
  name,
  value,
  onChange,
  readOnly,
}: {
  options: ProductFieldOptions;
  name: string;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}) => {
  const { apiClient } = useTecof();
  const active = useActiveLanguage();
  const { merchantInfo } = useLanguages();
  const locale = active?.activeLanguage || merchantInfo?.defaultLanguage || 'tr';

  const multiple = !!fieldOptions.multiple;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    apiClient
      .getEcommerceProducts({
        locale,
        search: debounced || undefined,
        category: fieldOptions.category || undefined,
        limit: 24,
      })
      .then((res) => {
        /* Eskimiş yanıt yeni sorgunun sonucunu ezmesin. */
        if (id !== reqId.current) return;
        if (!res.success) setError(res.message || 'Ürünler yüklenemedi');
        setRows(rowsOf(res));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (id !== reqId.current) return;
        setError(err instanceof Error ? err.message : 'Bağlantı hatası');
        setRows([]);
        setLoading(false);
      });
  }, [open, debounced, locale, apiClient, fieldOptions.category]);

  const selected: ProductFieldValue[] = useMemo(() => {
    if (!multiple) return [];
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [multiple, value]);

  const selectedIds = useMemo(
    () => new Set((multiple ? selected : value ? [value] : []).map(idOf).filter(Boolean)),
    [multiple, selected, value]
  );

  const productOptions: EcommerceOption[] = useMemo(
    () =>
      rows.map((row) => {
        const label = readLang(row.name, locale) || row.slug || 'Adsız ürün';
        const variants = Array.isArray(row.variants) ? row.variants : [];
        const price = variants[0]?.price;
        return {
          id: String(row._id),
          label,
          hint: [row.slug ? `/${row.slug}` : '', typeof price === 'number' ? `${price} ₺` : '']
            .filter(Boolean)
            .join(' · '),
          ...(row.status && row.status !== 'active'
            ? { badge: 'Pasif', badgeTone: 'neutral' as const }
            : {}),
          value: {
            id: String(row._id),
            slug: row.slug || '',
            name: label,
            image: row.images?.[0]?.imageId || row.images?.[0] || null,
          } satisfies ProductFieldValue,
        };
      }),
    [rows, locale]
  );

  const limitReached = multiple && fieldOptions.max != null && selected.length >= fieldOptions.max;

  const pick = (option: EcommerceOption) => {
    if (!multiple) {
      onChange(option.value);
      setOpen(false);
      return;
    }
    if (selected.some((v) => idOf(v) === option.id)) {
      onChange(selected.filter((v) => idOf(v) !== option.id));
      return;
    }
    if (limitReached) return;
    onChange([...selected, option.value]);
  };

  const move = (index: number, delta: number) => {
    const next = [...selected];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const summary = !multiple && value ? value.name || value.slug || '' : '';

  return (
    <FieldLabel
      el="div"
      label={fieldOptions.label || name}
      icon={fieldOptions.labelIcon}
      readOnly={readOnly}
    >
      <div className="tecof-ecom-field">
        <div className="tecof-external">
          <button
            type="button"
            className="tecof-external-trigger"
            disabled={readOnly}
            onClick={() => {
              setQuery('');
              setOpen(true);
            }}
          >
            <Package size={14} className="tecof-icon-muted" />
            <span className={`tecof-external-summary${summary || selected.length ? '' : ' is-empty'}`}>
              {multiple
                ? selected.length
                  ? `${selected.length} ürün seçili`
                  : fieldOptions.placeholder || 'Ürün seç'
                : summary || fieldOptions.placeholder || 'Ürün seç'}
            </span>
          </button>
          {!multiple && value != null && !readOnly && (
            <button
              type="button"
              className="tecof-external-clear"
              onClick={() => onChange(undefined)}
              title="Temizle"
              aria-label="Seçimi temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {multiple && selected.length > 0 && (
          <ul className="tecof-ecom-chips">
            {selected.map((item, index) => (
              <li key={`${idOf(item)}-${index}`} className="tecof-ecom-chip">
                <span className="tecof-ecom-chip-label">{item.name || item.slug || 'Ürün'}</span>
                {!readOnly && (
                  <span className="tecof-ecom-chip-actions">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="Yukarı taşı" aria-label="Yukarı taşı">
                      <ChevronUp size={12} />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1} title="Aşağı taşı" aria-label="Aşağı taşı">
                      <ChevronDown size={12} />
                    </button>
                    <button type="button" onClick={() => onChange(selected.filter((_, i) => i !== index))} title="Çıkar" aria-label="Çıkar">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <PickerShell
          title="Ürün ara"
          query={query}
          onQueryChange={setQuery}
          onClose={() => setOpen(false)}
          loading={loading}
        >
          {loading ? (
            <div className="tecof-cmdk-empty">Yükleniyor…</div>
          ) : error ? (
            <div className="tecof-external-error">
              <p>{error}</p>
            </div>
          ) : productOptions.length === 0 ? (
            <div className="tecof-cmdk-empty">
              {debounced ? `“${debounced}” için ürün bulunamadı` : 'Yayında ürün yok.'}
            </div>
          ) : (
            <>
              {limitReached && (
                <div className="tecof-ecom-note">
                  En fazla {fieldOptions.max} ürün seçilebilir — eklemek için birini çıkarın.
                </div>
              )}
              {productOptions.map((option) => (
                <PickerRow
                  key={option.id}
                  option={option}
                  selected={selectedIds.has(option.id)}
                  onSelect={() => pick(option)}
                />
              ))}
            </>
          )}
        </PickerShell>
      )}
    </FieldLabel>
  );
};

const buildProductField = (options: ProductFieldOptions) => {
  const opts: ProductFieldOptions = { label: 'Ürün', ...options };
  return {
    type: 'custom' as const,
    _fieldType: 'ecommerce' as const,
    ecommerceSource: 'products',
    label: opts.label,
    labelIcon: opts.labelIcon,
    visible: opts.visible,
    multiple: !!opts.multiple,
    render: ({ name, value, onChange, readOnly }: any) => (
      <FieldErrorBoundary fieldName={opts.label || 'Ürün'}>
        <ProductFieldInner options={opts} name={name} value={value} onChange={onChange} readOnly={readOnly} />
      </FieldErrorBoundary>
    ),
  };
};

/**
 * Tekil ürün seçici — değer `{ id, slug, name, image }`.
 *
 * Ürün detay bölümünde slug elle yazmayı bitirir; yanlış yazılan slug'ta
 * bileşen sessizce boş dönüyordu.
 */
export const createProductField = (options: Omit<ProductFieldOptions, 'multiple' | 'max'> = {}) =>
  buildProductField(options);

/** Çoklu ürün seçici — elle kürasyon ("Haftanın seçkisi", bundle içeriği). */
export const createProductListField = (options: Omit<ProductFieldOptions, 'multiple'> = {}) =>
  buildProductField({ label: 'Ürünler', ...options, multiple: true });
