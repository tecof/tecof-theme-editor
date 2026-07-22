/**
 * E-ticaret seçici alanı — tekli ve çoklu mod.
 *
 * Bir `EcommerceSource` (bkz. sources.ts) alır; veriyi çeker, aramayı yapar,
 * seçimi prop'a yazar. Marka/etiket/özellik/flaş satış/kampanya/kupon alanları
 * bu tek bileşenin ince sarmalayıcılarıdır — davranış tek yerde durur.
 *
 * ── Neden arama İSTEMCİ tarafında? ───────────────────────────────────────
 * Bu listeler merchant başına onlarca kayıttır (binlerce değil) ve backend
 * tarafı iki sebeple aramaya elverişli değil:
 *   • _crud uçlarında `?search=` bir SÖZLÜK bekler (`{alan: değer}`); düz metin
 *     sessizce yok sayılır (bkz. CoreSrc.processSearchQuery),
 *   • aranacak `name` alanı çok dilli bir DİZİ olduğu için regex'lenemez.
 * Liste bir kez çekilip bellekte süzülür: hem doğru sonuç, hem tuş başına
 * istek yok.
 *
 * ── Önbellek ─────────────────────────────────────────────────────────────
 * Aynı sayfada birden çok seçici (ör. üç kart, üçünde de marka alanı) aynı
 * listeyi ister. Modül düzeyinde kısa ömürlü bir önbellek + uçuştaki isteğin
 * paylaşılması, N seçici için tek istek demektir. "Yenile" düğmesi anahtarı
 * düşürür; merchant panelde yeni kayıt açıp editöre dönünce onu görebilsin.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronUp, RefreshCcw, Search, ShoppingBag, X } from 'lucide-react';
import { FieldLabel } from '../FieldLabel';
import { FieldErrorBoundary } from '../FieldErrorBoundary';
import { useTecof } from '../../TecofProvider';
import { useLanguages } from '../useLanguages';
import { useActiveLanguage } from '../../../studio/language/LanguageContext';
import { rowsOf, type EcommerceOption, type EcommerceSource, type SourceContext } from './sources';

/* ─── Önbellek ─── */

interface LoadResult {
  rows: any[];
  /** Sunucudaki TOPLAM kayıt sayısı — liste kırpıldıysa uyarmak için. */
  total: number;
  error: string | null;
}

interface CacheEntry extends LoadResult {
  ts: number;
}

const CACHE_TTL = 60_000;
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<LoadResult>>();
/** Aynı kaynağa bağlı tüm alanların yeniden çekim tetikleyicileri. */
const subscribers = new Map<string, Set<() => void>>();

/**
 * Önbelleği düşürür ve AYNI kaynağa bağlı tüm alanları uyarır.
 *
 * Uyarı olmasaydı "yenile" yalnız tıklanan seçiciyi tazelerdi; sayfadaki
 * diğer marka alanları eski listede kalıp merchant'a çelişkili iki liste
 * gösterirdi.
 */
const invalidate = (cacheKey: string) => {
  cache.delete(cacheKey);
  inflight.delete(cacheKey);
  subscribers.get(cacheKey)?.forEach((notify) => notify());
};

const loadRows = (cacheKey: string, source: EcommerceSource, ctx: SourceContext): Promise<LoadResult> => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Promise.resolve({ rows: cached.rows, total: cached.total, error: null });
  }

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const request = source
    .load(ctx)
    .then((res) => {
      if (!res.success) {
        return { rows: [] as any[], total: 0, error: res.message || 'Veri yüklenemedi' };
      }
      const rows = rowsOf(res);
      const total = typeof res.totalData === 'number' ? res.totalData : rows.length;
      cache.set(cacheKey, { rows, total, ts: Date.now(), error: null });
      return { rows, total, error: null as string | null };
    })
    .catch((err: unknown) => ({
      rows: [] as any[],
      total: 0,
      error: err instanceof Error ? err.message : 'Bağlantı hatası',
    }))
    .finally(() => {
      inflight.delete(cacheKey);
    });

  inflight.set(cacheKey, request);
  return request;
};

/* ─── Veri kancası ─── */

export const useEcommerceOptions = (source: EcommerceSource, enabled = true) => {
  const { apiClient } = useTecof();
  /* Aktif dil yalnız studio içinde vardır; standalone kullanımda mağazanın
     varsayılan diline düşeriz. */
  const active = useActiveLanguage();
  const { merchantInfo } = useLanguages();
  const locale = active?.activeLanguage || merchantInfo?.defaultLanguage || 'tr';

  const cacheKey = `${source.key}::${locale}`;
  const [rows, setRows] = useState<any[]>(() => cache.get(cacheKey)?.rows ?? []);
  const [total, setTotal] = useState<number>(() => cache.get(cacheKey)?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /* `enabled` kapısı: liste yalnız modal AÇILDIĞINDA çekilir. Alan mount olur
     olmaz çekilseydi, on marka alanı taşıyan bir sayfa hiç kullanılmayacak on
     istek atardı — tetikleyicideki özet zaten kayıtlı snapshot'tan geliyor. */
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    loadRows(cacheKey, source, { apiClient, locale }).then((res) => {
      if (cancelled) return;
      setRows(res.rows);
      setTotal(res.total);
      setError(res.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, source, apiClient, locale, reloadKey, enabled]);

  /* Kardeş alanların "yenile"si de bu alanı tazelesin. */
  useEffect(() => {
    const notify = () => setReloadKey((k) => k + 1);
    const set = subscribers.get(cacheKey) ?? new Set<() => void>();
    set.add(notify);
    subscribers.set(cacheKey, set);
    return () => {
      set.delete(notify);
      if (set.size === 0) subscribers.delete(cacheKey);
    };
  }, [cacheKey]);

  const options = useMemo(
    () => source.toOptions(rows, { apiClient, locale }),
    [rows, source, apiClient, locale]
  );

  /* invalidate ABONELERİ uyarır; bu alan da abone olduğu için kendi yeniden
     çekimini oradan alır — burada ayrıca tetiklemek çift istek olurdu. */
  const reload = useCallback(() => invalidate(cacheKey), [cacheKey]);

  return { options, loading, error, reload, locale, total };
};

/* ─── Arama ─── */

/** Türkçe'ye duyarlı küçültme — "İ" ve "I" ayrımı doğru olsun. */
const fold = (text: string): string => text.toLocaleLowerCase('tr');

const matches = (option: EcommerceOption, query: string): boolean => {
  if (!query) return true;
  const q = fold(query);
  return fold(`${option.label} ${option.hint || ''} ${option.badge || ''}`).includes(q);
};

/* ─── Modal kabuğu ─── */

export interface PickerShellProps {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  onReload?: () => void;
  onClose: () => void;
  loading?: boolean;
  /** false ise arama kutusu yerine düz başlık basılır (varyant 2. adımı). */
  searchable?: boolean;
  children: React.ReactNode;
}

/**
 * Ortak modal çerçevesi — ExternalField'ın cmdk görünümüyle aynı sınıfları
 * kullanır, böylece editörde tek bir "veri seç" dili olur.
 */
export const PickerShell = ({
  title,
  query,
  onQueryChange,
  onReload,
  onClose,
  loading,
  searchable = true,
  children,
}: PickerShellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  /* Odak modala girer ve kapanınca ÇAĞIRAN öğeye geri döner — aksi hâlde
     klavye kullanıcısı modalı kapattığında odak <body>'ye düşüyor ve panelde
     baştan gezinmek gerekiyordu. */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => previous?.focus?.();
  }, []);

  /* Esc her yerden kapatır — odak listedeyken de çalışsın diye document'te. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="tecof-cmdk-overlay" onMouseDown={onClose}>
      <div
        className="tecof-cmdk-panel tecof-ecom-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="tecof-cmdk-input-row">
          <Search size={16} className="tecof-cmdk-search-icon" />
          {searchable ? (
            <input
              ref={inputRef}
              type="text"
              className="tecof-cmdk-input"
              placeholder={`${title} — ara…`}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          ) : (
            <span className="tecof-cmdk-input">{title}</span>
          )}
          {onReload && (
            <button
              type="button"
              className="tecof-external-reload"
              onClick={onReload}
              title="Listeyi yenile"
              aria-label="Listeyi yenile"
              disabled={loading}
            >
              <RefreshCcw size={14} className={loading ? 'tecof-upload-spin' : ''} />
            </button>
          )}
          <button type="button" className="tecof-external-reload" onClick={onClose} title="Kapat" aria-label="Kapat">
            <X size={14} />
          </button>
        </div>
        <div className="tecof-cmdk-list">{children}</div>
      </div>
    </div>,
    document.body
  );
};

/** Liste satırı — tekli/çoklu fark etmeksizin aynı görünüm. */
export const PickerRow = ({
  option,
  selected,
  onSelect,
}: {
  option: EcommerceOption;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    className={`tecof-cmdk-item${selected ? ' is-active' : ''}`}
    onClick={onSelect}
    aria-pressed={selected}
  >
    {/* Kategori ağacı düz listeye açılır; hiyerarşi girintiyle korunur. */}
    <span
      className="tecof-cmdk-item-icon"
      style={option.depth ? { marginInlineStart: option.depth * 14 } : undefined}
    >
      {selected ? (
        <Check size={15} />
      ) : option.color ? (
        <span className="tecof-ecom-swatch" style={{ background: option.color }} />
      ) : (
        <ShoppingBag size={15} />
      )}
    </span>
    <span className="tecof-external-row-text">
      <span className="tecof-cmdk-item-label">{option.label}</span>
      {option.hint && <span className="tecof-external-row-sub">{option.hint}</span>}
    </span>
    {option.badge && (
      <span className={`tecof-ecom-badge is-${option.badgeTone || 'neutral'}`}>{option.badge}</span>
    )}
  </button>
);

/* ─── Alan bileşeni ─── */

export interface EcommerceFieldOptions {
  label?: string;
  labelIcon?: ReactElement;
  /** Çoklu seçim: değer bir dizidir ve sıra korunur. */
  multiple?: boolean;
  /** Çoklu modda en fazla kaç kayıt seçilebilir. */
  max?: number;
  placeholder?: string;
  visible?: boolean;
}

interface EcommerceFieldProps {
  source: EcommerceSource;
  options: EcommerceFieldOptions;
  name: string;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

/** Saklanan değerin kimliği — tüm kaynaklar `id` yazar. */
const idOf = (value: any): string => (value && typeof value === 'object' ? String(value.id ?? '') : '');

const EcommerceFieldInner = ({
  source,
  options: fieldOptions,
  name,
  value,
  onChange,
  readOnly,
}: EcommerceFieldProps) => {
  const multiple = !!fieldOptions.multiple;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  /* Veri yalnız modal açıkken çekilir (bkz. useEcommerceOptions `enabled`). */
  const { options, loading, error, reload, total } = useEcommerceOptions(source, open);

  /* Çoklu modda değer her zaman dizidir; eski kayıt tekil bıraktıysa (alan
     sonradan çoklu yapıldıysa) sarmalayıp kurtarırız. `value`'dan türetilir,
     ara bir değişkene bağlanmaz: her render'da yeni referans üreten bir dizi
     deps'e girseydi memo hiç isabet etmezdi. */
  const selectedList: any[] = useMemo(() => {
    if (!multiple) return [];
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [multiple, value]);

  const selectedIds = useMemo(
    () => new Set((multiple ? selectedList : value ? [value] : []).map(idOf).filter(Boolean)),
    [multiple, selectedList, value]
  );

  const visible = useMemo(() => options.filter((o) => matches(o, query)), [options, query]);
  const limitReached = multiple && fieldOptions.max != null && selectedList.length >= fieldOptions.max;

  const handlePick = (option: EcommerceOption) => {
    if (!multiple) {
      onChange(option.value);
      setOpen(false);
      return;
    }
    const exists = selectedList.some((v) => idOf(v) === option.id);
    if (exists) {
      onChange(selectedList.filter((v) => idOf(v) !== option.id));
      return;
    }
    if (limitReached) return;
    onChange([...selectedList, option.value]);
  };

  const move = (index: number, delta: number) => {
    const next = [...selectedList];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const summary = !multiple && value ? source.summarize(value) : '';

  return (
    /* `el="div"`: varsayılan <label> olsaydı çip metnine yapılan her tıklama
       HTML label aktivasyonuyla ilk butona (seçiciyi açan tetikleyici) giderdi
       — kullanıcı çipi düzenlemek isterken modal açılırdı. */
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
            <ShoppingBag size={14} className="tecof-icon-muted" />
            <span className={`tecof-external-summary${summary || selectedList.length ? '' : ' is-empty'}`}>
              {multiple
                ? selectedList.length
                  ? `${selectedList.length} kayıt seçili`
                  : fieldOptions.placeholder || source.placeholder
                : summary || fieldOptions.placeholder || source.placeholder}
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

        {/* Çoklu modda seçilenler sıralanabilir bir liste olarak durur —
            sıra, temanın render sırasıdır. */}
        {multiple && selectedList.length > 0 && (
          <ul className="tecof-ecom-chips">
            {selectedList.map((item, index) => (
              <li key={`${idOf(item)}-${index}`} className="tecof-ecom-chip">
                <span className="tecof-ecom-chip-label">{source.summarize(item) || 'Kayıt'}</span>
                {!readOnly && (
                  <span className="tecof-ecom-chip-actions">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      title="Yukarı taşı"
                      aria-label="Yukarı taşı"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === selectedList.length - 1}
                      title="Aşağı taşı"
                      aria-label="Aşağı taşı"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(selectedList.filter((_, i) => i !== index))}
                      title="Çıkar"
                      aria-label="Çıkar"
                    >
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
          title={source.title}
          query={query}
          onQueryChange={setQuery}
          onReload={reload}
          onClose={() => setOpen(false)}
          loading={loading}
        >
          {loading ? (
            <div className="tecof-cmdk-empty">Yükleniyor…</div>
          ) : error ? (
            <div className="tecof-external-error">
              <p>{error}</p>
              <button type="button" onClick={reload}>
                Tekrar dene
              </button>
            </div>
          ) : options.length === 0 ? (
            <div className="tecof-cmdk-empty">{source.emptyLabel}</div>
          ) : visible.length === 0 ? (
            <div className="tecof-cmdk-empty">“{query}” için sonuç yok</div>
          ) : (
            <>
              {limitReached && (
                <div className="tecof-ecom-note">
                  En fazla {fieldOptions.max} kayıt seçilebilir — eklemek için birini çıkarın.
                </div>
              )}
              {/* Sunucu listeyi kırptıysa bunu SÖYLE: arama istemcide çalıştığı
                  için kırpılan kayıt aramayla da bulunamaz, sessiz kalmak
                  "böyle bir kayıt yok" izlenimi verirdi. */}
              {total > options.length && (
                <div className="tecof-ecom-note">
                  {total} kayıttan ilk {options.length} tanesi gösteriliyor — panelden
                  eski kayıtları temizleyin ya da aramayı daraltın.
                </div>
              )}
              {visible.map((option) => (
                <PickerRow
                  key={option.id}
                  option={option}
                  selected={selectedIds.has(option.id)}
                  onSelect={() => handlePick(option)}
                />
              ))}
            </>
          )}
        </PickerShell>
      )}
    </FieldLabel>
  );
};

/**
 * Kaynağı alana bağlayan fabrika. Her varlık için ayrı `create*Field`
 * bunun üzerine kurulur (bkz. index.ts).
 */
export const createEcommerceField = (source: EcommerceSource, options: EcommerceFieldOptions = {}) => ({
  type: 'custom' as const,
  /* Diğer fabrikalarla aynı işaret (bkz. IconField/ColorField): RepeaterField
     satır varsayılanını, şema/AI tarafı da alan tipini buradan okur. */
  _fieldType: 'ecommerce' as const,
  label: options.label || source.title,
  labelIcon: options.labelIcon,
  visible: options.visible,
  /** Hangi e-ticaret varlığı — 'brands' | 'tags' | 'flash-sales' … */
  ecommerceSource: source.key,
  multiple: !!options.multiple,
  render: ({ name, value, onChange, readOnly }: any) => (
    <FieldErrorBoundary fieldName={options.label || source.title}>
      <EcommerceFieldInner
        source={source}
        options={options}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </FieldErrorBoundary>
  ),
});
