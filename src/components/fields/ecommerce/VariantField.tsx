/**
 * Varyant seçici — İKİ ADIMLI, çünkü varyant bağımsız bir kayıt değildir:
 * ürünün içinde yaşar. Akış: ürün ara → ürünün varyantlarından birini seç.
 *
 * Neden ayrı bir bileşen: diğer seçiciler tek düz liste üzerinde çalışır ve
 * listeyi bir kez çekip istemcide süzer. Ürünler ise binlerce olabilir, bu
 * yüzden burada arama SUNUCU tarafındadır (`/api/store/ecommerce/products`
 * gerçek metin araması yapar) ve liste hiç önbelleklenmez.
 *
 * Saklanan değer ürünün de kimliğini taşır; sepete ekleme çağrısı
 * `{ productId, variantId }` ikilisini ister, tek başına varyant kimliği
 * yetmez.
 */

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { ChevronLeft, Package, X } from 'lucide-react';
import { FieldLabel } from '../FieldLabel';
import { FieldErrorBoundary } from '../FieldErrorBoundary';
import { useTecof } from '../../TecofProvider';
import { useLanguages } from '../useLanguages';
import { useActiveLanguage } from '../../../studio/language/LanguageContext';
import { PickerShell, PickerRow } from './EcommerceField';
import { readLang, rowsOf, type EcommerceOption } from './sources';

/** Prop'a yazılan değer. `type` olmasının sebebi: `EcommerceOption.value`
 *  bir `Record<string, unknown>` bekliyor ve interface'ler örtük index
 *  imzası taşımadığı için oraya atanamıyor. */
export type VariantFieldValue = {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  sku: string;
  /** Varyantın okunur adı — "Kırmızı / L" ya da SKU. */
  title: string;
  price: number;
};

export interface VariantFieldOptions {
  label?: string;
  labelIcon?: ReactElement;
  placeholder?: string;
  visible?: boolean;
}

/**
 * Varyantın okunur adı.
 *
 * ⚠ Ürün şemasında varyant seçenekleri `variantValues: [{ variantTypeId,
 * variantValueId }]` olarak durur ve public ürün ucu bu ObjectId'leri POPULATE
 * ETMEZ — yani "Kırmızı / L" metnini istemcide üretecek veri yanıtta yok.
 * Bu yüzden ayırt edici olarak SKU kullanılır (şemada `required`), o da yoksa
 * sıra numarasına düşülür. Okunur ada geçmek için ya ürün ucunun
 * `variantValues`'ı populate etmesi ya da yanıta hazır bir `variantTitle`
 * alanı eklemesi gerekir.
 */
const variantTitle = (variant: any, index: number): string => {
  if (variant?.sku) return String(variant.sku);
  const count = Array.isArray(variant?.variantValues) ? variant.variantValues.length : 0;
  return count ? `Varyant ${index + 1} (${count} seçenek)` : `Varyant ${index + 1}`;
};

/**
 * Varyant stoğu.
 *
 * Şemada tekil `stock` alanı YOKTUR; stok konum başına `stocks: [{
 * stockLocationId, quantity }]` dizisinde tutulur ve toplamı backend de aynı
 * şekilde hesaplar. Tekil alana bakan bir kontrol her zaman `undefined`
 * görüp rozeti hiç çizmezdi.
 */
const variantStock = (variant: any): number | null => {
  if (!Array.isArray(variant?.stocks)) return null;
  return variant.stocks.reduce(
    (sum: number, s: any) => sum + (Number(s?.quantity) || 0),
    0
  );
};

const priceLabel = (value: unknown): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return `${n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺`;
};

const VariantFieldInner = ({
  options: fieldOptions,
  name,
  value,
  onChange,
  readOnly,
}: {
  options: VariantFieldOptions;
  name: string;
  value: VariantFieldValue | null | undefined;
  onChange: (value: VariantFieldValue | undefined) => void;
  readOnly?: boolean;
}) => {
  const { apiClient } = useTecof();
  const active = useActiveLanguage();
  const { merchantInfo } = useLanguages();
  const locale = active?.activeLanguage || merchantInfo?.defaultLanguage || 'tr';

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Adım 2: seçili ürün. null ise ürün listesi görünür. */
  const [product, setProduct] = useState<any>(null);
  /* Eskimiş yanıtları düşürmek için istek sayacı. */
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open || product) return;
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    apiClient
      .getEcommerceProducts({ locale, search: debounced || undefined, limit: 24 })
      .then((res) => {
        if (id !== reqId.current) return;
        if (!res.success) setError(res.message || 'Ürünler yüklenemedi');
        setProducts(rowsOf(res));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (id !== reqId.current) return;
        setError(err instanceof Error ? err.message : 'Bağlantı hatası');
        setProducts([]);
        setLoading(false);
      });
  }, [open, product, debounced, locale, apiClient]);

  const productOptions: EcommerceOption[] = useMemo(
    () =>
      products.map((row) => {
        const label = readLang(row.name, locale) || row.slug || 'Adsız ürün';
        const variants = Array.isArray(row.variants) ? row.variants : [];
        return {
          id: String(row._id),
          label,
          hint: [row.slug ? `/${row.slug}` : '', variants.length ? `${variants.length} varyant` : 'varyant yok']
            .filter(Boolean)
            .join(' · '),
          value: row,
        };
      }),
    [products, locale]
  );

  const variantOptions: EcommerceOption[] = useMemo(() => {
    if (!product) return [];
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const productName = readLang(product.name, locale) || product.slug || '';
    return variants.map((variant: any, index: number) => {
      const title = variantTitle(variant, index);
      const stock = variantStock(variant);
      return {
        id: String(variant._id ?? index),
        label: title,
        /* Etiket zaten SKU olduğu için ipucunda tekrarlanmaz — fiyat ve
           varsa barkod daha ayırt edici. */
        hint: [priceLabel(variant.price), variant.barcode ? `barkod ${variant.barcode}` : '']
          .filter(Boolean)
          .join(' · '),
        ...(stock !== null && stock <= 0
          ? { badge: 'Tükendi', badgeTone: 'danger' as const }
          : stock !== null
            ? { badge: `${stock} adet`, badgeTone: 'neutral' as const }
            : {}),
        value: {
          /* Sepet çağrısı ikisini birlikte ister. */
          productId: String(product._id),
          productSlug: product.slug || '',
          productName,
          variantId: String(variant._id ?? ''),
          sku: variant.sku || '',
          title,
          price: Number(variant.price) || 0,
        } satisfies VariantFieldValue,
      };
    });
  }, [product, locale]);

  /** Tek varyantlı üründe ikinci adımı atla — tıklama doğrudan seçim olsun. */
  const pickProduct = (row: any) => {
    const variants = Array.isArray(row.variants) ? row.variants : [];
    if (variants.length === 1) {
      const productName = readLang(row.name, locale) || row.slug || '';
      const variant = variants[0];
      onChange({
        productId: String(row._id),
        productSlug: row.slug || '',
        productName,
        variantId: String(variant._id ?? ''),
        sku: variant.sku || '',
        title: variantTitle(variant, 0),
        price: Number(variant.price) || 0,
      });
      close();
      return;
    }
    setProduct(row);
  };

  const close = () => {
    setOpen(false);
    setProduct(null);
    setQuery('');
  };

  const summary = value ? `${value.productName} — ${value.title}` : '';

  return (
    <FieldLabel label={fieldOptions.label || name} readOnly={readOnly}>
      <div className="tecof-external">
        <button
          type="button"
          className="tecof-external-trigger"
          disabled={readOnly}
          onClick={() => setOpen(true)}
        >
          <Package size={14} className="tecof-icon-muted" />
          <span className={`tecof-external-summary${summary ? '' : ' is-empty'}`}>
            {summary || fieldOptions.placeholder || 'Ürün varyantı seç'}
          </span>
        </button>
        {value != null && !readOnly && (
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

      {open && (
        <PickerShell
          title={product ? 'Varyant seç' : 'Ürün ara'}
          /* 2. adımda arama kutusu KAPALI: varyant listesi zaten kısa ve
             tek ürüne ait. Açık bırakılsaydı input değeri '' sabitlenirken
             tuş vuruşları arka plandaki ürün sorgusunu değiştirirdi. */
          searchable={!product}
          query={query}
          onQueryChange={setQuery}
          onClose={close}
          loading={loading}
        >
          {product ? (
            <>
              {/* Adım 2 başlığı — geri dönüş yolu her zaman görünür olmalı,
                  aksi hâlde yanlış ürüne giren merchant modalı kapatmak
                  zorunda kalıyor. */}
              <button type="button" className="tecof-ecom-back" onClick={() => setProduct(null)}>
                <ChevronLeft size={14} />
                <span>{readLang(product.name, locale) || product.slug}</span>
              </button>
              {variantOptions.length === 0 ? (
                <div className="tecof-cmdk-empty">Bu ürünün varyantı yok.</div>
              ) : (
                variantOptions.map((option) => (
                  <PickerRow
                    key={option.id}
                    option={option}
                    selected={!!value && value.variantId === option.id}
                    onSelect={() => {
                      onChange(option.value as unknown as VariantFieldValue);
                      close();
                    }}
                  />
                ))
              )}
            </>
          ) : loading ? (
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
            productOptions.map((option) => (
              <PickerRow
                key={option.id}
                option={option}
                selected={!!value && value.productId === option.id}
                onSelect={() => pickProduct(option.value)}
              />
            ))
          )}
        </PickerShell>
      )}
    </FieldLabel>
  );
};

/**
 * Ürün varyantı seçici.
 *
 * ```tsx
 * fields: {
 *   giftVariant: createVariantField({ label: "Hediye Ürün" }),
 * }
 * ```
 */
export const createVariantField = (options: VariantFieldOptions = {}) => {
  /* Varsayılan etiket İÇ bileşene de geçmeli: yalnız alan tanımına yazılsaydı
     FieldLabel `name`'e (ham prop anahtarı) düşerdi. */
  const opts: VariantFieldOptions = { label: 'Ürün Varyantı', ...options };
  return {
    type: 'custom' as const,
    _fieldType: 'ecommerce' as const,
    ecommerceSource: 'variant',
    label: opts.label,
    labelIcon: opts.labelIcon,
    visible: opts.visible,
    render: ({ name, value, onChange, readOnly }: any) => (
      <FieldErrorBoundary fieldName={opts.label || 'Ürün Varyantı'}>
        <VariantFieldInner
          options={opts}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
        />
      </FieldErrorBoundary>
    ),
  };
};
